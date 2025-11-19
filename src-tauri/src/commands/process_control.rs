use std::process::Command;
use std::io::Result;

pub fn execute_process(exec: &str, argument: &str) -> Result<()> {
    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new(exec);
        cmd.arg(argument).spawn()?;
    }

    #[cfg(target_os = "macos")]
    {
        let mut cmd = Command::new("open");
        cmd.arg("-a").arg(exec);
        cmd.arg(argument).spawn()?;
    }

    #[cfg(target_os = "linux")]
    {
        let mut cmd = Command::new(exec);
        cmd.arg(argument).spawn()?;
    }

    Ok(())
}
