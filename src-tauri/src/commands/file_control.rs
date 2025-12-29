use anyhow::{Result, anyhow};
use serde_json::Value;

use std::fs;
use std::fs::File;
use std::io::{copy, Write};

use zip::ZipArchive;

//
// ───────── Save to File ─────────
//
pub fn save_to_file(filename: &str, content: &str) -> Result<String> {
    let mut file = File::create(filename)?;
    file.write_all(content.as_bytes())?;
    Ok(filename.to_string())
}

//
// ───────── Create Folder ─────────
//
pub fn create_folder(args: &Value) -> Result<()> {
    let path = args["path"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing path"))?;

    fs::create_dir_all(path)?;
    Ok(())
}

//
// ───────── Copy File ─────────
//
pub fn copy_file(args: &Value) -> Result<()> {
    let from = args["from"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing from"))?;

    let to = args["to"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing to"))?;

    fs::copy(from, to)?;
    Ok(())
}

//
// ───────── Move / Rename File ─────────
//
pub fn move_file(args: &Value) -> Result<()> {
    let from = args["from"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing from"))?;

    let to = args["to"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing to"))?;

    fs::rename(from, to)?;
    Ok(())
}

//
// ───────── Clean Folder ─────────
//
pub fn clean_folder(args: &Value) -> Result<()> {
    let path = args["path"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing path"))?;

    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let p = entry.path();

        if p.is_file() {
            fs::remove_file(p)?;
        }
    }
    Ok(())
}

//
// ───────── Extract ZIP ─────────
//
pub fn extract_zip(args: &Value) -> Result<()> {
    let archive = args["archive"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing archive"))?;

    let destination = args["destination"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing destination"))?;

    let file = File::open(archive)?;
    let mut zip = ZipArchive::new(file)?;

    for i in 0..zip.len() {
        let mut zipped_file = zip.by_index(i)?;
        let outpath = format!("{}/{}", destination, zipped_file.name());

        if zipped_file.is_dir() {
            fs::create_dir_all(&outpath)?;
        } else {
            if let Some(parent) = std::path::Path::new(&outpath).parent() {
                fs::create_dir_all(parent)?;
            }
            let mut outfile = File::create(&outpath)?;
            copy(&mut zipped_file, &mut outfile)?;
        }
    }

    Ok(())
}
