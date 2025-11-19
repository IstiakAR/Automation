use enigo::{
    Button,
    Direction::{Click, Press, Release},
    Enigo, Mouse, Settings,
    Coordinate::Abs, Coordinate::Rel
};

pub fn type_text(text: String, delay_ms: u64) {
    use enigo::{Keyboard, Key};
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    
    let actual_delay = if delay_ms > 0 { delay_ms } else { 10 };
    
    for c in text.chars() {
        enigo.key(Key::Unicode(c), Click).unwrap();
        std::thread::sleep(std::time::Duration::from_millis(actual_delay));
    }
}

pub fn press_enter() {
    use enigo::{Keyboard, Key};
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    enigo.key(Key::Return, Click).unwrap();
}