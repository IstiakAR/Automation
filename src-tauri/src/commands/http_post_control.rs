use std::fs::File;
use std::io::Read;

use reqwest::blocking::{Client, multipart};

pub fn http_post_request(
    url: &str,
    file_path: Option<&str>,
) -> Result<(), String> {

    let client = Client::new();

    let response = match file_path {
        // 🔹 POST with file (multipart/form-data)
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

            let part = multipart::Part::bytes(buffer)
                .file_name(file_name.to_string());

            let form = multipart::Form::new()
                .part("file", part);

            client
                .post(url)
                .multipart(form)
                .send()
                .map_err(|e| format!("POST request failed: {}", e))?
        }

        // 🔹 POST without file
        None => {
            client
                .post(url)
                .send()
                .map_err(|e| format!("POST request failed: {}", e))?
        }
    };

    // 🔹 Status print
    println!("HTTP Status: {}", response.status());

    // 🔹 Response body print
    let text = response
        .text()
        .map_err(|e| format!("Failed to read response: {}", e))?;

    println!("Response body:\n{}", text);

    Ok(())
}
