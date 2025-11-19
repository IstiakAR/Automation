use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use tauri::State;
use serde_json::Value;

use crate::commands::flow_executor;

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

#[tauri::command]
pub fn start_flow(command: Value, controller: State<FlowController>) -> Result<String, String> {
    let current_state = controller.get_state();
    
    match current_state {
        FlowState::Running => {
            return Err("Flow is already running".to_string());
        },
        FlowState::Paused => {
            controller.set_state(FlowState::Running);
            return Ok("Flow resumed".to_string());
        },
        FlowState::Stopped => {
            controller.set_state(FlowState::Running);
        }
    }

    if !command.is_object() {
        return Err("Invalid command format".to_string());
    }

    let nodes = command.get("nodes")
        .and_then(|v| v.as_array())
        .ok_or("No nodes found in command")?;
    
    let empty_edges = vec![];
    let edges = command.get("edges")
        .and_then(|v| v.as_array())
        .unwrap_or(&empty_edges);

    let execution_order = flow_executor::build_execution_order(
        &nodes.clone(), 
        &edges.clone()
    );

    println!("Execution order: {:?}", execution_order);

    let node_map: HashMap<String, &Value> = nodes.iter()
        .filter_map(|node| {
            node.get("id")
                .and_then(|id| id.as_str())
                .map(|id| (id.to_string(), node))
        })
        .collect();

    let mut parent_map: HashMap<String, Vec<String>> = HashMap::new();
    for edge in edges.iter() {
        if let (Some(source), Some(target)) = (
            edge.get("source").and_then(|v| v.as_str()),
            edge.get("target").and_then(|v| v.as_str()),
        ) {
            parent_map.entry(target.to_string())
                .or_insert_with(Vec::new)
                .push(source.to_string());
        }
    }

    let mut node_outputs: HashMap<String, Value> = HashMap::new();

    let mut executed_count = 0;
    for node_id in execution_order {
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
            
            let parent_output = parent_map.get(&node_id)
                .and_then(|parents| parents.first())
                .and_then(|parent_id| node_outputs.get(parent_id));
            
            match flow_executor::execute_node(node, &controller, parent_output) {
                Ok(action) => {
                    executed_count += 1;
                    
                    match action {
                        ExecutionAction::Continue(output) => {
                            if let Some(out) = output {
                                node_outputs.insert(node_id.clone(), out);
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
                    controller.set_state(FlowState::Stopped);
                    return Err(format!("Error executing node {}: {}", node_id, e));
                }
            }
        }
    }

    controller.set_state(FlowState::Stopped);
    controller.set_current_task(None);
    Ok(format!("Flow completed successfully. Executed {} nodes", executed_count))
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
