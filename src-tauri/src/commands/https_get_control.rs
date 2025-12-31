use std::fs::File;
use std::io::Write;
use std::process::Command;

use reqwest::blocking::Client;

pub fn http_get_and_save(
    url: &str,
    save_path: &str,
    open_after: bool,
) -> Result<String, String> {

    // 1️⃣ Blocking client
    let client = Client::new();

    // 2️⃣ Send GET request (NO async, NO await)
    let response = client
        .get(url)
        .send()
        .map_err(|e| format!("Request failed: {}", e))?;

    // 3️⃣ Status check
    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    // 4️⃣ Read response bytes
    let bytes = response
        .bytes()
        .map_err(|e| format!("Read failed: {}", e))?;

    // 5️⃣ Create file
    let mut file = File::create(save_path)
        .map_err(|e| format!("File create failed: {}", e))?;

    // 6️⃣ Write to file
    file.write_all(&bytes)
        .map_err(|e| format!("Write failed: {}", e))?;

    // 7️⃣ Open file if needed
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
