use super::flow_control::{
    build_execution_order, validate_and_extract_command, ExecutionAction, FlowController, FlowState,
};
use crate::commands::{
    browser_control, display_control, file_control, keyboard_control, mouse_control,
    process_control, website_control,
};
use crate::services::db::Db;
use serde_json::Value;
use tauri::State;

fn merge_args(args: &mut Value, parent_output: Option<&Value>) {
    println!("Original args: {}", args);
    println!("Parent output: {:?}", parent_output);
    let mut merged = args.clone();
    if let Some(parent_data) = parent_output {
        if let (Some(args_obj), Some(parent_obj)) =
            (merged.as_object_mut(), parent_data.as_object())
        {
            for (key, value) in parent_obj {
                let should_insert = !args_obj.contains_key(key)
                    || args_obj
                        .get(key)
                        .and_then(|v| v.as_str())
                        .map_or(false, |s| s.is_empty());

                if should_insert {
                    args_obj.insert(key.clone(), value.clone());
                }
            }
        }
    }
    println!("Merged args: {}", merged);
    *args = merged;
}

pub fn execute_node(
    node: &Value,
    controller: &State<FlowController>,
    db: &State<Db>,
    workspace_id: &str,
    parent_output: Option<&Value>,
) -> Result<ExecutionAction, String> {
    if let Some(data) = node.get("data") {
        let label = data.get("label").and_then(|v| v.as_str()).unwrap_or("");
        let mut args = data
            .get("args")
            .cloned()
            .unwrap_or(Value::Object(serde_json::Map::new()));

        merge_args(&mut args, parent_output);

        match label {
            "Start" => {
                println!("Flow control: Start marker");
                Ok(ExecutionAction::Continue(parent_output.cloned()))
            }
            "Pause" => {
                let time_ms = args
                    .get("time(in seconds)")
                    .and_then(|v| v.as_f64())
                    .map(|seconds| (seconds * 1000.0) as u64)
                    .or_else(|| {
                        args.get("time(in seconds)")
                            .and_then(|v| v.as_u64())
                            .map(|seconds| seconds * 1000)
                    })
                    .unwrap_or(0);

                if time_ms > 0 {
                    println!("Flow control: Pausing for {} milliseconds", time_ms);
                    std::thread::sleep(std::time::Duration::from_millis(time_ms));
                    Ok(ExecutionAction::Continue(parent_output.cloned()))
                } else {
                    controller.set_state(FlowState::Paused);
                    Ok(ExecutionAction::Pause)
                }
            }
            "Stop" => {
                println!("Flow control: Stop marker - stopping execution");
                controller.set_state(FlowState::Stopped);
                Ok(ExecutionAction::Stop)
            }
            "Click" => {
                let x = args.get("x").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
                let y = args.get("y").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
                let button = args
                    .get("button")
                    .and_then(|v| v.as_str())
                    .unwrap_or("left");
                let clicks = args.get("clicks").and_then(|v| v.as_u64()).unwrap_or(1) as u8;

                let _ = mouse_control::mouse_click(x, y, button.to_string(), clicks);
                println!("Executed: Click at ({}, {})", x, y);

                Ok(ExecutionAction::Continue(None))
            }
            "Browse" => {
                let browser = args
                    .get("browser")
                    .and_then(|v| v.as_str())
                    .unwrap_or("default");
                let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");
                let new_tab = args
                    .get("new_tab")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);

                let _ = browser_control::open_browser(browser, url, new_tab);
                println!("Executed: Browse {} in {}", url, browser);

                std::thread::sleep(std::time::Duration::from_millis(2000));

                let output = serde_json::json!({ "url": url });
                println!("Output: {}", output);
                Ok(ExecutionAction::Continue(Some(output)))
            }
            "Execute" => {
                let exec = args.get("exec").and_then(|v| v.as_str()).unwrap_or("");
                let argument = args.get("argument").and_then(|v| v.as_str()).unwrap_or("");

                if let Err(e) = process_control::execute_process(exec, argument) {
                    return Err(format!("Failed to execute process: {}", e));
                }
                println!("Executed: Process {} with args {}", exec, argument);

                Ok(ExecutionAction::Continue(None))
            }
            "Type" => {
                let text = args.get("text").and_then(|v| v.as_str()).unwrap_or("");
                let delay = args
                    .get("delay_between_keys_ms")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(0);

                let _ = keyboard_control::type_text(text.to_string(), delay);
                println!("Typed: {}", text);

                Ok(ExecutionAction::Continue(None))
            }
            "Enter" | "PressEnter" => {
                let _ = keyboard_control::press_enter();
                println!("Pressed Enter");

                Ok(ExecutionAction::Continue(None))
            }
            "GetHTML" => {
                let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");

                match website_control::get_html_content(url) {
                    Ok(html) => {
                        println!("Retrieved HTML from: {}", url);
                        let output = serde_json::json!({ "html": html });
                        Ok(ExecutionAction::Continue(Some(output)))
                    }
                    Err(e) => Err(format!("Failed to get HTML: {}", e)),
                }
            }
            "Save" => {
                let filename = args.get("filename").and_then(|v| v.as_str()).unwrap_or("");

                let content = match args.get("content").and_then(|v| v.as_str()) {
                    Some(c) if !c.is_empty() => c.to_string(),
                    _ => args
                        .get("html")
                        .or_else(|| args.get("text"))
                        .or_else(|| args.get("data"))
                        .or_else(|| args.get("output"))
                        .or_else(|| args.get("result"))
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string(),
                };

                match file_control::save_to_file(filename, &content) {
                    Ok(path) => {
                        println!("Saved to file: {}", path);
                        let output = serde_json::json!({ "filename": path });
                        Ok(ExecutionAction::Continue(Some(output)))
                    }
                    Err(e) => Err(format!("Failed to save file: {}", e)),
                }
            }
            "Screenshot" => {
                let save_path = args.get("save_path").and_then(|v| v.as_str()).unwrap_or("");

                match display_control::take_screenshot(save_path) {
                    Ok(path) => {
                        println!("Screenshot saved to: {}", path);
                        let output = serde_json::json!({ "screenshot_path": path });
                        Ok(ExecutionAction::Continue(Some(output)))
                    }
                    Err(e) => Err(format!("Failed to take screenshot: {}", e)),
                }
            }
            "Task" => {
                let task_name = args.get("task").and_then(|v| v.as_str()).unwrap_or("");
                if task_name.is_empty() {
                    return Err("Task node missing taskName".to_string());
                }

                let sub_graph_opt = db
                    .load_flow_graph_by_name(workspace_id, task_name)
                    .map_err(|e| format!("Failed to load sub-task graph: {}", e))?;

                let sub_graph = match sub_graph_opt {
                    Some(g) => g,
                    None => {
                        return Err(format!(
                            "No sub-task flow found for name '{}' in workspace '{}'",
                            task_name, workspace_id
                        ));
                    }
                };

                let mut sub_cmd = serde_json::Map::new();
                sub_cmd.insert("nodes".to_string(), Value::Array(sub_graph.nodes));
                sub_cmd.insert("edges".to_string(), Value::Array(sub_graph.edges));
                let sub_cmd_value = Value::Object(sub_cmd);

                let (nodes, edges) = validate_and_extract_command(&sub_cmd_value)
                    .map_err(|e| format!("Failed to validate sub-task: {}", e))?;

                let order = build_execution_order(&nodes.clone(), &edges);

                let node_map: std::collections::HashMap<String, &Value> = nodes
                    .iter()
                    .filter_map(|node| {
                        node.get("id")
                            .and_then(|id| id.as_str())
                            .map(|id| (id.to_string(), node))
                    })
                    .collect();

                let mut current_output = parent_output.cloned();

                for node_id in order {
                    if let Some(sub_node) = node_map.get(&node_id) {
                        match execute_node(
                            sub_node,
                            controller,
                            db,
                            workspace_id,
                            current_output.as_ref(),
                        )? {
                            ExecutionAction::Continue(out) => {
                                if out.is_some() {
                                    current_output = out;
                                }
                            }
                            ExecutionAction::Pause => return Ok(ExecutionAction::Pause),
                            ExecutionAction::Stop => return Ok(ExecutionAction::Stop),
                        }
                    }
                }

                Ok(ExecutionAction::Continue(current_output))
            }

            _ => {
                println!("Unknown command: {}", label);
                Ok(ExecutionAction::Continue(None))
            }
        }
    } else {
        Ok(ExecutionAction::Continue(None))
    }
}
