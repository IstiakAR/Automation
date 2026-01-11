use std::fs::File;
use std::io::{Read, Write};
use std::process::Command;

use reqwest::blocking::{self, Client, multipart};

// ─────────────────────────────────────────────────────────────────────────────
// Basic HTML fetch
// ─────────────────────────────────────────────────────────────────────────────

pub fn get_html_content(url: &str) -> std::io::Result<String> {
    if url.is_empty() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "URL is empty",
        ));
    }

    let full_url = if !url.starts_with("http://") && !url.starts_with("https://") {
        format!("https://{}", url)
    } else {
        url.to_string()
    };

    println!("Fetching HTML from: {}", full_url);

    let resp = blocking::get(&full_url)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Request failed: {}", e)))?;
    let body = resp
        .text()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Failed to read response: {}", e)))?;
    Ok(body)
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP GET → save response to file (optional open)
// ─────────────────────────────────────────────────────────────────────────────

pub fn http_get_and_save(
    url: &str,
    save_path: &str,
    open_after: bool,
) -> Result<String, String> {
    let client = Client::new();

    let response = client
        .get(url)
        .send()
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let bytes = response.bytes().map_err(|e| format!("Read failed: {}", e))?;

    let mut file = File::create(save_path).map_err(|e| format!("File create failed: {}", e))?;
    file.write_all(&bytes)
        .map_err(|e| format!("Write failed: {}", e))?;

    if open_after {
        open_file(save_path)?;
    }

    Ok(save_path.to_string())
}

fn open_file(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(&["/C", "start", "", path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP POST (optionally with file upload)
// ─────────────────────────────────────────────────────────────────────────────

pub fn http_post_request(url: &str, file_path: Option<&str>) -> Result<(), String> {
    let client = Client::new();

    let response = match file_path {
        Some(path) => {
            let mut file = File::open(path)
                .map_err(|e| format!("Failed to open file: {}", e))?;

            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer)
                .map_err(|e| format!("Failed to read file: {}", e))?;

            let file_name = std::path::Path::new(path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("upload.bin");

            let part = multipart::Part::bytes(buffer).file_name(file_name.to_string());

            let form = multipart::Form::new().part("file", part);

            client
                .post(url)
                .multipart(form)
                .send()
                .map_err(|e| format!("POST request failed: {}", e))?
        }
        None => client
            .post(url)
            .send()
            .map_err(|e| format!("POST request failed: {}", e))?,
    };

    println!("HTTP Status: {}", response.status());

    let text = response
        .text()
        .map_err(|e| format!("Failed to read response: {}", e))?;

    println!("Response body:\n{}", text);

    Ok(())
}