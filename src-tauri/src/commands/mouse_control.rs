use enigo::{
    Button,
    Direction::{Click, Press, Release},
    Enigo, Mouse, Settings,
    Coordinate::Abs, Coordinate::Rel
};
use serde::Serialize;

#[derive(Serialize)]
#[allow(dead_code)]
pub struct MousePosition {
    pub x: i32,
    pub y: i32,
}

#[tauri::command]
pub fn get_mouse_position() -> Result<MousePosition, String> {
    let enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    let location = enigo.location().map_err(|e| e.to_string())?;
    
    Ok(MousePosition {
        x: location.0,
        y: location.1,
    })
}

pub fn mouse_click(x: i32, y: i32, button: String, clicks: u8) {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    enigo.move_mouse(x, y, Abs).unwrap();
    for _ in 0..clicks {
        match button.as_str() {
            "left" => {
                enigo.button(Button::Left, Click).unwrap();
            },
            "right" => {
                enigo.button(Button::Right, Click).unwrap();
            },
            "middle" => {
                enigo.button(Button::Middle, Click).unwrap();
            },
            _ => {
                enigo.button(Button::Left, Click).unwrap();
            }
        }
    }
}
