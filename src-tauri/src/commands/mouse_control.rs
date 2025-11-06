use enigo::{
    Button,
    Direction::{Click, Press, Release},
    Enigo, Mouse, Settings,
    Coordinate::Abs, Coordinate::Rel
};

pub fn mouse_click(x: i32, y: i32, button: String, clicks: u8) {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    enigo.move_mouse(x, y, Abs).unwrap();
    enigo.button(Button::Right, Click).unwrap();
}
