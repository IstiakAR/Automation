pub fn take_screenshot(save_path: &str) -> std::io::Result<String> {
    use xcap::Monitor;
    use std::path::Path;

    let monitors = Monitor::all().map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    let monitor = monitors
        .into_iter()
        .max_by_key(|m| {
            let w = m.width().unwrap_or(0);
            let h = m.height().unwrap_or(0);
            w * h
        })
        .ok_or(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "No monitor found",
        ))?;

    let image = monitor
        .capture_image()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    println!("Captured image: {}x{}", image.width(), image.height());

    image
        .save(Path::new(save_path))
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    Ok(save_path.to_string())
}