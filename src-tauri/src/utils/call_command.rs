use serde_json::json;

fn validate_command(command: &serde_json::Value) -> bool {
    command.is_object()
}

#[tauri::command]
pub fn run_command(command: serde_json::Value) -> tauri::Result<i32> {
    if validate_command(&command) {
        println!("Successful");
        Ok(10)
    } else {
        println!("Failed");
        Ok(-1)
    }
}
