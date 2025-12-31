use tauri::State;
use serde_json::Value;
use crate::commands::{mouse_control, browser_control, process_control, website_control, file_control, keyboard_control, display_control,http_post_control,https_get_control};
use super::flow_control::{FlowController, FlowState, ExecutionAction};
use crate::commands::email_control::send_email_with_attachments;
use crate::services::db::Db;
use crate::commands::flow_control;

fn merge_args(args: &mut Value, parent_output: Option<&Value>) {
    println!("Original args: {}", args);
    println!("Parent output: {:?}", parent_output);
    let mut merged = args.clone();
    if let Some(parent_data) = parent_output {
        if let (Some(args_obj), Some(parent_obj)) = (merged.as_object_mut(), parent_data.as_object()) {
            for (key, value) in parent_obj {
                let should_insert = !args_obj.contains_key(key) || 
                    args_obj.get(key).and_then(|v| v.as_str()).map_or(false, |s| s.is_empty());
                
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
        let mut args = data.get("args").cloned().unwrap_or(Value::Object(serde_json::Map::new()));

        merge_args(&mut args, parent_output);
        
        match label {
            "Start" => {
                println!("Flow control: Start marker");
                Ok(ExecutionAction::Continue(parent_output.cloned()))
            },
            "Pause" => {
                let time_ms = args.get("time(in seconds)")
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
            },
            "Stop" => {
                println!("Flow control: Stop marker - stopping execution");
                controller.set_state(FlowState::Stopped);
                Ok(ExecutionAction::Stop)
            },
            "Click" => {
                let x = args.get("x").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
                let y = args.get("y").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
                let button = args.get("button").and_then(|v| v.as_str()).unwrap_or("left");
                let clicks = args.get("clicks").and_then(|v| v.as_u64()).unwrap_or(1) as u8;
                
                let _ = mouse_control::mouse_click(x, y, button.to_string(), clicks);
                println!("Executed: Click at ({}, {})", x, y);
                
                Ok(ExecutionAction::Continue(None))
            },
            "Browse" => {
                let browser = args.get("browser").and_then(|v| v.as_str()).unwrap_or("default");
                let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");
                let new_tab = args.get("new_tab").and_then(|v| v.as_bool()).unwrap_or(false);
                
                let _ = browser_control::open_browser(browser, url, new_tab);
                println!("Executed: Browse {} in {}", url, browser);
                
                std::thread::sleep(std::time::Duration::from_millis(2000));
                
                let output = serde_json::json!({ "url": url });
                println!("Output: {}", output);
                Ok(ExecutionAction::Continue(Some(output)))
            },
            "Execute" => {
                let exec = args.get("exec").and_then(|v| v.as_str()).unwrap_or("");
                let argument = args.get("argument").and_then(|v| v.as_str()).unwrap_or("");
                
                if let Err(e) = process_control::execute_process(exec, argument) {
                    return Err(format!("Failed to execute process: {}", e));
                }
                println!("Executed: Process {} with args {}", exec, argument);
                
                Ok(ExecutionAction::Continue(None))
            },
            "Type" => {
                let text = args.get("text").and_then(|v| v.as_str()).unwrap_or("");
                let delay = args.get("delay_between_keys_ms").and_then(|v| v.as_u64()).unwrap_or(0);
                
                let _ = keyboard_control::type_text(text.to_string(), delay);
                println!("Typed: {}", text);
                
                Ok(ExecutionAction::Continue(None))
            },
            "Enter" | "PressEnter" => {
                let _ = keyboard_control::press_enter();
                println!("Pressed Enter");
                
                Ok(ExecutionAction::Continue(None))
            },
            "GetHTML" => {
                let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");
                
                match website_control::get_html_content(url) {
                    Ok(html) => {
                        println!("Retrieved HTML from: {}", url);
                        let output = serde_json::json!({ "html": html });
                        Ok(ExecutionAction::Continue(Some(output)))
                    },
                    Err(e) => Err(format!("Failed to get HTML: {}", e))
                }
            },
            "Save" => {
                let filename = args.get("filename").and_then(|v| v.as_str()).unwrap_or("");
                
                let content = match args.get("content").and_then(|v| v.as_str()) {
                    Some(c) if !c.is_empty() => c.to_string(),
                    _ => {
                        args.get("html")
                            .or_else(|| args.get("text"))
                            .or_else(|| args.get("data"))
                            .or_else(|| args.get("output"))
                            .or_else(|| args.get("result"))
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string()
                    }
                };
                
                match file_control::save_to_file(filename, &content) {
                    Ok(path) => {
                        println!("Saved to file: {}", path);
                        let output = serde_json::json!({ "filename": path });
                        Ok(ExecutionAction::Continue(Some(output)))
                    },
                    Err(e) => Err(format!("Failed to save file: {}", e))
                }
            },
            "Screenshot" => {
                let save_path = args.get("save_path").and_then(|v| v.as_str()).unwrap_or("");
                
                match display_control::take_screenshot(save_path) {
                    Ok(path) => {
                        println!("Screenshot saved to: {}", path);
                        let output = serde_json::json!({ "screenshot_path": path });
                        Ok(ExecutionAction::Continue(Some(output)))
                    },
                    Err(e) => Err(format!("Failed to take screenshot: {}", e))
                }
            },
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

                let (nodes, edges) = flow_control::validate_and_extract_command(&sub_cmd_value)
                    .map_err(|e| format!("Failed to validate sub-task: {}", e))?;

                let order = flow_control::build_execution_order(&nodes.clone(), &edges);

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
                        match execute_node(sub_node, controller, db, workspace_id, current_output.as_ref())? {
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
            },
                        "CreateFolder" => {
                let path = args.get("path").and_then(|v| v.as_str()).unwrap_or("");
                std::fs::create_dir_all(path)
                    .map_err(|e| format!("Failed to create folder: {}", e))?;
                println!("Created folder: {}", path);
                Ok(ExecutionAction::Continue(None))
            },

            "CopyFile" => {
                let from = args.get("from").and_then(|v| v.as_str()).unwrap_or("");
                let to = args.get("to").and_then(|v| v.as_str()).unwrap_or("");
                std::fs::copy(from, to)
                    .map_err(|e| format!("Failed to copy file: {}", e))?;
                println!("Copied file from {} to {}", from, to);
                Ok(ExecutionAction::Continue(None))
            },

            "MoveFile" | "RenameFile" => {
                let from = args.get("from").and_then(|v| v.as_str()).unwrap_or("");
                let to = args.get("to").and_then(|v| v.as_str()).unwrap_or("");
                std::fs::rename(from, to)
                    .map_err(|e| format!("Failed to move/rename file: {}", e))?;
                println!("Moved/Renamed file from {} to {}", from, to);
                Ok(ExecutionAction::Continue(None))
            },

            "CleanFolder" => {
                let path = args.get("path").and_then(|v| v.as_str()).unwrap_or("");
                for entry in std::fs::read_dir(path)
                    .map_err(|e| format!("Failed to read directory: {}", e))? {
                    let entry = entry.map_err(|e| e.to_string())?;
                    let p = entry.path();
                    if p.is_file() {
                        std::fs::remove_file(&p)
                            .map_err(|e| format!("Failed to delete {:?}: {}", p, e))?;
                    }
                }
                println!("Cleaned folder: {}", path);
                Ok(ExecutionAction::Continue(None))
            },
            "ExtractArchive" => {
                file_control::extract_zip(&args)
                    .map_err(|e| e.to_string())?;

                Ok(ExecutionAction::Continue(None))
            },

           "SendEmail" => {
    let smtp_email = args.get("smtp_email").and_then(|v| v.as_str()).unwrap_or("");
    let smtp_password = args.get("smtp_password").and_then(|v| v.as_str()).unwrap_or("");
    let to = args.get("to").and_then(|v| v.as_str()).unwrap_or("");
    let subject = args.get("subject").and_then(|v| v.as_str()).unwrap_or("");
    let body = args.get("body").and_then(|v| v.as_str()).unwrap_or("");

    // ✅ FIXED attachment parsing
    let attachment_paths: Vec<String> = args
        .get("attachments_file_path")
        .and_then(|v| v.as_str())
        .map(|s| {
            let cleaned = s
                .trim()
                .trim_start_matches('[')
                .trim_end_matches(']');

            cleaned
                .split(';')
                .map(|p| p.trim().to_string())
                .filter(|p| !p.is_empty() && p != "none")
                .collect()
        })
        .unwrap_or_else(Vec::new);

    send_email_with_attachments(
        smtp_email.to_string(),
        smtp_password.to_string(),
        to.to_string(),
        subject.to_string(),
        body.to_string(),
        attachment_paths,
    )?;

    Ok(ExecutionAction::Continue(None))
},

            "HTTPGet" => {
    use crate::commands::https_get_control::http_get_and_save;

    let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");
    let response_save_path = args.get("response_save_path").and_then(|v| v.as_str()).unwrap_or("");
    let open_after = args.get("open_after").and_then(|v| v.as_bool()).unwrap_or(false);

    match http_get_and_save(url, response_save_path, open_after) {
        Ok(saved_path) => {
            println!("HTTP GET successful, saved to: {}", saved_path);
            let output = serde_json::json!({ "saved_path": saved_path });
            Ok(ExecutionAction::Continue(Some(output)))
        },
        Err(e) => Err(format!("HTTP GET failed: {}", e))
    }
},
            "HTTPPost" => {
    use crate::commands::http_post_control::http_post_request;

    let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");
    if url.is_empty() {
        return Err("HTTP POST failed: URL is empty".to_string());
    }

  
    let file_path = args
        .get("file_path")
        .and_then(|v| v.as_str())
        .filter(|p| !p.is_empty() && *p != "none");

    match http_post_request(url, file_path) {
        Ok(()) => {
            println!("HTTP POST successful to: {}", url);
            Ok(ExecutionAction::Continue(None))
        },
        Err(e) => Err(format!("HTTP POST failed: {}", e))
    }
},



            _ => {
                println!("Unknown command: {}", label);
                Ok(ExecutionAction::Continue(None))
            }
        }
    }
    else {
        Err("Node missing data field".to_string())
    }
}
