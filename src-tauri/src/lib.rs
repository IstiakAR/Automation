mod utils;
mod commands;
use utils::{call_service, helpers};
use commands::{get_mouse_position, FlowController, start_flow, get_flow_state};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let flow_controller = FlowController::new();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(flow_controller)
        .invoke_handler(tauri::generate_handler![
            start_flow,
            get_flow_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
