pub mod mouse_control;
pub mod browser_control;
pub mod process_control;
pub mod flow_control;
pub mod website_control;
pub mod file_control;
pub mod keyboard_control;
pub mod display_control;
pub mod flow_executor;
pub mod email_control;
pub use mouse_control::get_mouse_position;
pub use flow_control::{FlowController, start_flow, get_flow_state};
use crate::services::db::{Db, Workspace, Flow, SavedFlowGraph};


#[tauri::command]
pub fn list_workspaces(db: tauri::State<Db>) -> Result<Vec<Workspace>, String> {
	db.list_workspaces().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn upsert_workspace(db: tauri::State<Db>, id: String, name: String) -> Result<(), String> {
	db.upsert_workspace(&id, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_workspace(db: tauri::State<Db>, id: String) -> Result<(), String> {
	db.delete_workspace(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_flows_for_workspace(db: tauri::State<Db>, workspace_id: String) -> Result<Vec<Flow>, String> {
	db.list_flows_for_workspace(&workspace_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn upsert_flow(
	db: tauri::State<Db>,
	id: String,
	workspace_id: String,
	folder_id: Option<String>,
	name: String,
) -> Result<(), String> {
	let folder_ref = folder_id.as_deref();
	db.upsert_flow(&id, &workspace_id, folder_ref, &name)
		.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_flow(db: tauri::State<Db>, id: String) -> Result<(), String> {
	db.delete_flow(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_flow_graph(
	db: tauri::State<Db>,
	flow_id: String,
	nodes: serde_json::Value,
	edges: serde_json::Value,
) -> Result<(), String> {
	let nodes_arr = nodes.as_array().cloned().unwrap_or_default();
	let edges_arr = edges.as_array().cloned().unwrap_or_default();
	db.save_flow_graph(&flow_id, &nodes_arr, &edges_arr)
		.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_flow_graph(db: tauri::State<Db>, flow_id: String) -> Result<SavedFlowGraph, String> {
	db.load_flow_graph(&flow_id).map_err(|e| e.to_string())
}