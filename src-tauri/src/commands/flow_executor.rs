use std::collections::HashMap;
use tauri::State;
use serde_json::Value;
use crate::commands::{mouse_control, browser_control, process_control, website_control, file_control, keyboard_control, display_control};
use super::flow_control::{FlowController, FlowState, ExecutionAction};

fn merge_args(args: &mut Value, parent_output: Option<&Value>) {
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
    *args = merged;
}

pub fn execute_node(node: &Value, controller: &State<FlowController>, parent_output: Option<&Value>) -> Result<ExecutionAction, String> {
    if let Some(data) = node.get("data") {
        let label = data.get("label").and_then(|v| v.as_str()).unwrap_or("");
        let mut args = data.get("args").cloned().unwrap_or(Value::Object(serde_json::Map::new()));

        merge_args(&mut args, parent_output);
        
        match label {
            "Start" | "Start Flow" => {
                println!("Flow control: Start marker");
                Ok(ExecutionAction::Continue(None))
            },
            "Pause" | "Pause Flow" => {
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
                    Ok(ExecutionAction::Continue(None))
                } else {
                    controller.set_state(FlowState::Paused);
                    Ok(ExecutionAction::Pause)
                }
            },
            "Stop" | "Stop Flow" => {
                println!("Flow control: Stop marker - stopping execution");
                controller.set_state(FlowState::Stopped);
                Ok(ExecutionAction::Stop)
            },
            "Click" => {
                let x = args.get("x").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
                let y = args.get("y").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
                let button = args.get("button").and_then(|v| v.as_str()).unwrap_or("left");
                let clicks = args.get("clicks").and_then(|v| v.as_u64()).unwrap_or(1) as u8;
                
                mouse_control::mouse_click(x, y, button.to_string(), clicks);
                println!("Executed: Click at ({}, {})", x, y);
                
                Ok(ExecutionAction::Continue(None))
            },
            "Browse" => {
                let browser = args.get("browser").and_then(|v| v.as_str()).unwrap_or("default");
                let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");
                let new_tab = args.get("new_tab").and_then(|v| v.as_bool()).unwrap_or(false);
                
                browser_control::open_browser(browser, url, new_tab);
                println!("Executed: Browse {} in {}", url, browser);
                
                std::thread::sleep(std::time::Duration::from_millis(2000));
                
                let output = serde_json::json!({ "url": url });
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
                
                keyboard_control::type_text(text.to_string(), delay);
                println!("Typed: {}", text);
                
                Ok(ExecutionAction::Continue(None))
            },
            "Enter" | "PressEnter" => {
                keyboard_control::press_enter();
                println!("Pressed Enter");
                
                Ok(ExecutionAction::Continue(None))
            },
            "GetHTML" => {
                let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");
                
                match website_control::getHTMLContent(url) {
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
            _ => {
                println!("Unknown command: {}", label);
                Ok(ExecutionAction::Continue(None))
            }
        }
    } else {
        Ok(ExecutionAction::Continue(None))
    }
}
