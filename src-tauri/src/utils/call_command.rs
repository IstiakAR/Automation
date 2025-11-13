use serde_json::json;
use crate::commands::mouse_control;
use crate::commands::browser_control;

fn validate_command(command: &serde_json::Value) -> bool {
    command.is_object()
}

#[tauri::command]
pub fn run_command(command: serde_json::Value) {
    if validate_command(&command) {
        
        if let Some(nodes) = command.get("nodes").and_then(|v| v.as_array()) {
            for node in nodes {
                if let Some(data) = node.get("data") {
                    let label = data.get("label").and_then(|v| v.as_str()).unwrap_or("");
                    let args = data.get("args");
                    
                    match label {
                        "Click" => {
                            if let Some(args) = args {
                                let x = args.get("x").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
                                let y = args.get("y").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
                                let button = args.get("button").and_then(|v| v.as_str()).unwrap_or("left");
                                let clicks = args.get("clicks").and_then(|v| v.as_u64()).unwrap_or(1) as u8;
                                
                                mouse_control::mouse_click(x, y, button.to_string(), clicks);
                            }
                        },
                        "Browse" => {
                            if let Some(args) = args {
                                let browser = args.get("browser").and_then(|v| v.as_str()).unwrap_or("default");
                                let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");
                                let new_tab = args.get("new_tab").and_then(|v| v.as_bool()).unwrap_or(false);
                                
                                browser_control::open_browser(browser, url, new_tab);
                            }
                        },
                        _ => {
                            println!("Unknown command: {}", label);
                        }
                    }
                }
            }
        } else {
            println!("No nodes found in command");
        }
    } else {
        println!("Invalid command format");
    }
}