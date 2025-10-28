use serde_json::json;

fn validate_command(command: &serde_json::Value) -> bool {
    command.is_object()
}

#[tauri::command]
pub fn run_command(command: serde_json::Value) -> i32{
    if validate_command(&command) {
        println!("Successful");
        return 10;
    } else {
        println!("Failed");
        return -1;
    }
}
