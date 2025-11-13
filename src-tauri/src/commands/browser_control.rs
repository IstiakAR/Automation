use std::process::Command;
use std::io::Result;

pub fn open_browser(browser: &str, url: &str, new_tab: bool) -> Result<()> {
    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new(browser);
        if new_tab {
            cmd.arg("--new-tab");
        }
        cmd.arg(url).spawn()?;
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

    Ok(())
}
