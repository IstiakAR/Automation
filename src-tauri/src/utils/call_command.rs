use serde_json::json;
use crate::commands::mouse_control;


fn validate_command(command: &serde_json::Value) -> bool {
    command.is_object()
}

#[tauri::command]
pub fn run_command(command: serde_json::Value) {
    if validate_command(&command) {
        println!("Successful");
        mouse_control::mouse_click(500, 500, "right".to_string(), 1);
    } else {
        println!("Failed");
    }
}
