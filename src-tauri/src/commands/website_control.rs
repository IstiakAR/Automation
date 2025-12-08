use std::io::Result;

pub fn get_html_content(url: &str) -> Result<String> {
    if url.is_empty() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "URL is empty"
        ));
    }
    
    let full_url = if !url.starts_with("http://") && !url.starts_with("https://") {
        format!("https://{}", url)
    } else {
        url.to_string()
    };
    
    println!("Fetching HTML from: {}", full_url);
    
    let resp = reqwest::blocking::get(&full_url)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Request failed: {}", e)))?;
    let body = resp.text()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Failed to read response: {}", e)))?;
    Ok(body)
}