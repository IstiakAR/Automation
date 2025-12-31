use std::process::Command;
use std::io::Result;

pub fn open_browser(browser: &str, url: &str, new_tab: bool) -> Result<String> {
    #[cfg(target_os = "windows")]
    {
       
        if browser.is_empty() || browser == "default" {
            Command::new("cmd").args(&["/C", "start", "", url]).spawn()?;
        } else {
            let mut cmd = Command::new(browser);
            if new_tab {
                cmd.arg("--new-tab");
            }
        
            if let Err(_) = cmd.arg(url).spawn() {
                Command::new("cmd").args(&["/C", "start", "", url]).spawn()?;
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        let mut cmd = Command::new("open");
        cmd.arg("-a").arg(browser);
        if new_tab {
            cmd.arg("--new-tab");
        }
        cmd.arg(url).spawn()?;
    }

    #[cfg(target_os = "linux")]
    {
        let mut cmd = Command::new(browser);
        if new_tab {
            cmd.arg("--new-tab");
        }
        cmd.arg(url).spawn()?;
    }

    Ok(url.to_string())
}
