mod utils;
mod commands;
mod services;

use tauri::Manager;
// use utils::{call_service, helpers};
use commands::{
    get_mouse_position,
    FlowController,
    start_flow,
    get_flow_state,
    list_workspaces,
    upsert_workspace,
    delete_workspace,
    list_flows_for_workspace,
    upsert_flow,
    delete_flow,
    save_flow_graph,
    load_flow_graph,
};
use services::db::{init_db};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let flow_controller = FlowController::new();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let db = init_db(app.path().app_config_dir().expect("No app config dir"))?;
            app.manage(db);
            Ok(())
        })
        .manage(flow_controller)
        .invoke_handler(tauri::generate_handler![
            start_flow,
            get_flow_state,
            list_workspaces,
            upsert_workspace,
            delete_workspace,
            list_flows_for_workspace,
            upsert_flow,
            delete_flow,
            save_flow_graph,
            load_flow_graph
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
