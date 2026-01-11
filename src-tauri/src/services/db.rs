use std::path::PathBuf;

use rusqlite::{params, Connection};
use std::sync::Mutex;

pub struct Db(pub Mutex<Connection>);

pub fn init_db(app_dir: PathBuf) -> anyhow::Result<Db> {
    std::fs::create_dir_all(&app_dir)?;
    let db_path = app_dir.join("automation.db");

    let conn = Connection::open(db_path)?;

    conn.execute_batch(
        r#"
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            provider TEXT NOT NULL,
            provider_user_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at INTEGER NOT NULL,

            UNIQUE (provider, provider_user_id)
        );

        CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS flows (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS nodes (
            id TEXT PRIMARY KEY,
            flow_id TEXT NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            args JSON,
            pos_x REAL NOT NULL DEFAULT 0,
            pos_y REAL NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS connections (
            id TEXT PRIMARY KEY,
            flow_id TEXT NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
            from_node TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
            to_node TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
            handle TEXT NOT NULL CHECK(handle IN ('out_1','out_2'))
        );
        "#,
    )?;

    Ok(Db(Mutex::new(conn)))
}

// Simple workspace/flow/node shapes exposed via commands
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Workspace {
    pub id: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Flow {
    pub id: String,
    pub workspace_id: String,
    pub folder_id: Option<String>,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SavedFlowGraph {
    pub nodes: Vec<JsonValue>,
    pub edges: Vec<JsonValue>,
}

impl Db {
    pub fn list_workspaces(&self) -> anyhow::Result<Vec<Workspace>> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, name FROM workspaces ORDER BY created_at ASC")?;
        let rows = stmt
            .query_map([], |row| {
                Ok(Workspace {
                    id: row.get(0)?,
                    name: row.get(1)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rows)
    }

    pub fn upsert_workspace(&self, id: &str, name: &str) -> anyhow::Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "INSERT INTO workspaces (id, name) VALUES (?1, ?2)
             ON CONFLICT(id) DO UPDATE SET name = excluded.name",
            params![id, name],
        )?;
        Ok(())
    }

    pub fn delete_workspace(&self, id: &str) -> anyhow::Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute("DELETE FROM workspaces WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn upsert_flow(&self, id: &str, workspace_id: &str, folder_id: Option<&str>, name: &str) -> anyhow::Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "INSERT INTO flows (id, workspace_id, folder_id, name)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(id) DO UPDATE SET name = excluded.name, folder_id = excluded.folder_id",
            params![id, workspace_id, folder_id, name],
        )?;
        Ok(())
    }

    pub fn list_flows_for_workspace(&self, workspace_id: &str) -> anyhow::Result<Vec<Flow>> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, workspace_id, folder_id, name
             FROM flows
             WHERE workspace_id = ?1
             ORDER BY created_at ASC",
        )?;
        let rows = stmt
            .query_map(params![workspace_id], |row| {
                Ok(Flow {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    folder_id: row.get(2)?,
                    name: row.get(3)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rows)
    }

    pub fn delete_flow(&self, id: &str) -> anyhow::Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute("DELETE FROM flows WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn save_flow_graph(&self, flow_id: &str, nodes: &[JsonValue], edges: &[JsonValue]) -> anyhow::Result<()> {
        let mut conn = self.0.lock().unwrap();
        let tx = conn.transaction()?;

        tx.execute("DELETE FROM nodes WHERE flow_id = ?1", params![flow_id])?;
        tx.execute("DELETE FROM connections WHERE flow_id = ?1", params![flow_id])?;

        for node in nodes {
            let id = node.get("id").and_then(|v| v.as_str()).ok_or_else(|| anyhow::anyhow!("Node missing id"))?;
            let name = node
                .get("data")
                .and_then(|d| d.get("label"))
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let args = node
                .get("data")
                .and_then(|d| d.get("args"))
                .cloned()
                .unwrap_or(JsonValue::Null);

            let pos_x = node
                .get("position")
                .and_then(|p| p.get("x"))
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);

            let pos_y = node
                .get("position")
                .and_then(|p| p.get("y"))
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);

            tx.execute(
                "INSERT INTO nodes (id, flow_id, name, args, pos_x, pos_y) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![id, flow_id, name, args, pos_x, pos_y],
            )?;
        }

        for edge in edges {
            let conn_id = edge
                .get("id")
                .and_then(|v| v.as_str())
                .ok_or_else(|| anyhow::anyhow!("Edge missing id"))?;

            let handle = edge
                .get("handle")
                .and_then(|v| v.as_str())
                .ok_or_else(|| anyhow::anyhow!("Edge missing handle"))?;

            let source = edge
                .get("source")
                .and_then(|v| v.as_str())
                .ok_or_else(|| anyhow::anyhow!("Edge missing source"))?;
            let target = edge
                .get("target")
                .and_then(|v| v.as_str())
                .ok_or_else(|| anyhow::anyhow!("Edge missing target"))?;

            tx.execute(
                "INSERT INTO connections (id, flow_id, from_node, to_node, handle) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![conn_id, flow_id, source, target, handle],
            )?;
        }

        tx.commit()?;
        Ok(())
    }

    pub fn load_flow_graph(&self, flow_id: &str) -> anyhow::Result<SavedFlowGraph> {
        let conn = self.0.lock().unwrap();
        let mut node_stmt = conn.prepare("SELECT id, name, args, pos_x, pos_y FROM nodes WHERE flow_id = ?1")?;
        let nodes = node_stmt
            .query_map(params![flow_id], |row| {
                let id: String = row.get(0)?;
                let name: String = row.get(1)?;
                let args: JsonValue = row.get(2)?;
                let pos_x: f64 = row.get(3)?;
                let pos_y: f64 = row.get(4)?;

                Ok(serde_json::json!({
                    "id": id,
                    "type": "taskNode",
                    "position": {"x": pos_x, "y": pos_y},
                    "data": {
                        "label": name,
                        "args": args,
                    }
                }))
            })?
            .collect::<Result<Vec<_>, _>>()?;

        let mut edge_stmt = conn.prepare(
            "SELECT id, from_node, to_node, handle FROM connections WHERE flow_id = ?1"
        )?;
        let edges = edge_stmt
            .query_map(params![flow_id], |row| {
                let id: String = row.get(0)?;
                let from_node: String = row.get(1)?;
                let to_node: String = row.get(2)?;
                let handle: String = row.get(3)?;

                Ok(serde_json::json!({
                    "id": id,
                    "source": from_node,
                    "target": to_node,
                    "handle": handle,
                    "sourceHandle": handle
                }))
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(SavedFlowGraph { nodes, edges })
    }

    pub fn load_flow_graph_by_name(
        &self,
        workspace_id: &str,
        name: &str,
    ) -> anyhow::Result<Option<SavedFlowGraph>> {
        let conn = self.0.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id FROM flows WHERE workspace_id = ?1 AND name = ?2 LIMIT 1",
        )?;

        let mut rows = stmt.query(params![workspace_id, name])?;
        if let Some(row) = rows.next()? {
            let flow_id: String = row.get(0)?;
            drop(rows);
            drop(stmt);
            drop(conn);

            let graph = self.load_flow_graph(&flow_id)?;
            Ok(Some(graph))
        } else {
            Ok(None)
        }
    }
}

