use std::sync::{Arc, Mutex};
use std::collections::{HashMap, VecDeque};
use tauri::State;
use serde_json::Value;

use crate::commands::flow_executor;
use crate::services::db::Db;

#[derive(Clone, Debug, PartialEq)]
pub enum FlowState {
    Stopped,
    Running,
    Paused,
}

#[derive(Clone, Debug, PartialEq)]
pub enum ExecutionAction {
    Continue(Option<Value>),
    Pause,
    Stop,
}

pub struct FlowController {
    state: Arc<Mutex<FlowState>>,
    current_task_id: Arc<Mutex<Option<String>>>,
}

impl FlowController {
    pub fn new() -> Self {
        FlowController {
            state: Arc::new(Mutex::new(FlowState::Stopped)),
            current_task_id: Arc::new(Mutex::new(None)),
        }
    }

    pub fn get_state(&self) -> FlowState {
        self.state.lock().unwrap().clone()
    }

    pub fn set_state(&self, new_state: FlowState) {
        *self.state.lock().unwrap() = new_state;
    }

    pub fn set_current_task(&self, task_id: Option<String>) {
        *self.current_task_id.lock().unwrap() = task_id;
    }
}

pub fn validate_and_extract_command<'a>(command: &'a Value) -> Result<(&'a Vec<Value>, Vec<Value>), String> {
    if !command.is_object() {
        return Err("Invalid command format".to_string());
    }

    let nodes = command
        .get("nodes")
        .and_then(|v| v.as_array())
        .ok_or_else(|| "No nodes found in command".to_string())?;

    let edges_vec = command
        .get("edges")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();

    Ok((nodes, edges_vec))
}

fn build_child_maps(edges: &Vec<Value>) -> (HashMap<String, Vec<String>>, HashMap<String, Vec<String>>) {
    let mut success_children: HashMap<String, Vec<String>> = HashMap::new();
    let mut error_children: HashMap<String, Vec<String>> = HashMap::new();

    for edge in edges {
        if let (Some(source), Some(target)) = (
            edge.get("source").and_then(|v| v.as_str()),
            edge.get("target").and_then(|v| v.as_str()),
        ) {
            let handle = edge
                .get("handle")
                .and_then(|v| v.as_str())
                .unwrap_or("out_1");

            let entry_map = if handle == "out_2" {
                &mut error_children
            } else {
                &mut success_children
            };

            entry_map
                .entry(source.to_string())
                .or_insert_with(Vec::new)
                .push(target.to_string());
        }
    }

    (success_children, error_children)
}

fn execute_flow(
    nodes: &Vec<Value>,
    edges: &Vec<Value>,
    controller: &State<FlowController>,
    db: &State<Db>,
    workspace_id: &str,
) -> Result<String, String> {
    let node_map: HashMap<String, &Value> = nodes.iter()
        .filter_map(|node| {
            node.get("id")
                .and_then(|id| id.as_str())
                .map(|id| (id.to_string(), node))
        })
        .collect();

    let mut node_outputs: HashMap<String, Value> = HashMap::new();
    let (success_children, error_children) = build_child_maps(edges);

    let mut in_degree: HashMap<String, usize> = nodes
        .iter()
        .filter_map(|node| node.get("id").and_then(|v| v.as_str()).map(|id| (id.to_string(), 0usize)))
        .collect();

    for edge in edges {
        if let Some(target) = edge.get("target").and_then(|v| v.as_str()) {
            if let Some(deg) = in_degree.get_mut(target) {
                *deg += 1;
            }
        }
    }

    let mut queue: VecDeque<(String, Option<String>)> = in_degree
        .iter()
        .filter(|(_, &deg)| deg == 0)
        .map(|(id, _)| (id.clone(), None))
        .collect();

    let mut roots: Vec<(String, Option<String>)> = queue.iter().cloned().collect();
    roots.sort_by(|a, b| a.0.cmp(&b.0));
    queue = roots.into_iter().collect();

    let mut visited: HashMap<String, bool> = HashMap::new();
    let mut executed_count = 0;

    while let Some((node_id, parent_id)) = queue.pop_front() {
        if visited.get(&node_id).copied().unwrap_or(false) {
            continue;
        }
        visited.insert(node_id.clone(), true);

        let state = controller.get_state();
        if state == FlowState::Stopped {
            println!("Flow stopped by user");
            return Ok(format!("Flow stopped. Executed {} nodes", executed_count));
        } else if state == FlowState::Paused {
            println!("Flow paused by user");
            controller.set_current_task(Some(node_id));
            return Ok(format!("Flow paused. Executed {} nodes", executed_count));
        }

        if let Some(node) = node_map.get(&node_id) {
            controller.set_current_task(Some(node_id.clone()));
            let parent_output = parent_id
                .as_ref()
                .and_then(|pid| node_outputs.get(pid));

            match flow_executor::execute_node(node, &controller, db, workspace_id, parent_output) {
                Ok(action) => {
                    executed_count += 1;

                    match action {
                        ExecutionAction::Continue(output) => {
                            if let Some(out) = output {
                                node_outputs.insert(node_id.clone(), out);
                            }

                            if let Some(children) = success_children.get(&node_id) {
                                for child in children {
                                    if !visited.get(child).copied().unwrap_or(false) {
                                        queue.push_back((child.clone(), Some(node_id.clone())));
                                    }
                                }
                            }

                            std::thread::sleep(std::time::Duration::from_millis(100));
                        },
                        ExecutionAction::Pause => {
                            return Ok(format!("Flow paused at node. Executed {} nodes", executed_count));
                        },
                        ExecutionAction::Stop => {
                            return Ok(format!("Flow stopped at Stop node. Executed {} nodes", executed_count));
                        }
                    }
                },
                Err(e) => {
                    if let Some(children) = error_children.get(&node_id) {
                        for child in children {
                            if !visited.get(child).copied().unwrap_or(false) {
                                queue.push_back((child.clone(), Some(node_id.clone())));
                            }
                        }
                    }

                    eprintln!("Error executing node {}: {}", node_id, e);
                    continue;
                }
            }
        }
    }

    controller.set_state(FlowState::Stopped);
    controller.set_current_task(None);
    Ok(format!("Flow completed successfully. Executed {} nodes", executed_count))
}

#[tauri::command]
pub fn start_flow(
    command: Value,
    controller: State<FlowController>,
    db: State<Db>,
    workspace_id: String,
) -> Result<String, String> {
    let current_state = controller.get_state();
    match current_state {
        FlowState::Running => {
            return Err("Flow is already running".to_string());
        },
        FlowState::Paused => {
            controller.set_state(FlowState::Running);
            return Ok("Flow resumed".to_string());
        },
        FlowState::Stopped => controller.set_state(FlowState::Running),
    }

    let (nodes, edges) = validate_and_extract_command(&command)?;
    execute_flow(&nodes.to_vec(), &edges, &controller, &db, &workspace_id)
}

#[tauri::command]
pub fn get_flow_state(controller: State<FlowController>) -> String {
    let state = controller.get_state();
    match state {
        FlowState::Running => "running".to_string(),
        FlowState::Paused => "paused".to_string(),
        FlowState::Stopped => "stopped".to_string(),
    }
}

pub fn build_execution_order(nodes: &Vec<Value>, edges: &Vec<Value>) -> Vec<String> {
    use std::collections::HashSet;
    
    let mut graph: HashMap<String, Vec<String>> = HashMap::new();
    let mut in_degree: HashMap<String, usize> = HashMap::new();
    let mut all_nodes: HashSet<String> = HashSet::new();

    for node in nodes {
        if let Some(id) = node.get("id").and_then(|v| v.as_str()) {
            all_nodes.insert(id.to_string());
            in_degree.insert(id.to_string(), 0);
            graph.insert(id.to_string(), Vec::new());
        }
    }

    for edge in edges {
        if let (Some(source), Some(target)) = (
            edge.get("source").and_then(|v| v.as_str()),
            edge.get("target").and_then(|v| v.as_str()),
        ) {
            graph.get_mut(source).unwrap().push(target.to_string());
            *in_degree.get_mut(target).unwrap() += 1;
        }
    }

    let mut queue: Vec<String> = Vec::new();
    let mut result: Vec<String> = Vec::new();

    for (node, degree) in &in_degree {
        if *degree == 0 {
            queue.push(node.clone());
        }
    }

    queue.sort();

    while !queue.is_empty() {
        let current = queue.remove(0);
        result.push(current.clone());

        if let Some(neighbors) = graph.get(&current) {
            let mut next_nodes = Vec::new();
            for neighbor in neighbors {
                let degree = in_degree.get_mut(neighbor).unwrap();
                *degree -= 1;
                if *degree == 0 {
                    next_nodes.push(neighbor.clone());
                }
            }
            next_nodes.sort();
            queue.extend(next_nodes);
        }
    }

    result
}
