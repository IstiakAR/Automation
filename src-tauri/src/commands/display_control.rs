pub fn take_screenshot(save_path: &str) -> std::io::Result<String> {
    use screenshots::Screen;
    use image::{ImageEncoder, RgbaImage};
    use std::fs::File;
    use std::io::BufWriter;
    
    let screens = Screen::all().map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
    
    let screen = screens.into_iter()
        .max_by_key(|s| s.display_info.width * s.display_info.height)
        .ok_or(std::io::Error::new(std::io::ErrorKind::NotFound, "No screen found"))?;
    
    let image = screen.capture().map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
    
    println!("Captured image: {}x{}", image.width(), image.height());
    
    let rgba_image = RgbaImage::from_raw(image.width(), image.height(), image.as_raw().to_vec())
        .ok_or(std::io::Error::new(std::io::ErrorKind::Other, "Failed to create image"))?;
    
    rgba_image.save(save_path)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
    
    Ok(save_path.to_string())
}