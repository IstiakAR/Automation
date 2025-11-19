use std::io::Result;

pub fn save_to_file(filename: &str, content: &str) -> std::io::Result<String> {
    use std::fs::File;
    use std::io::Write;

    let mut file = File::create(filename)?;
    file.write_all(content.as_bytes())?;
    Ok(filename.to_string())
}