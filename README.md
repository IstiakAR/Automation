# Automation App

### Prerequisites

#### 1. Node.js & npm
- [Download & install Node.js (LTS recommended)](https://nodejs.org/)

#### 2. Rust & Cargo
- [Install Rust (includes Cargo)](https://www.rust-lang.org/tools/install)
  - On Linux/macOS: 
  ```sh
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
  - On Windows: Use the [rustup-init.exe](https://win.rustup.rs/) installer

#### 3. Tauri CLI
- Install globally: `npm install -g @tauri-apps/cli`

#### 4. Platform-specific dependencies

**Windows:**
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Enable "Desktop development with C++" workload

**macOS:**
- Xcode Command Line Tools: `xcode-select --install`

**Linux:**
- Install required system libraries:
  - Arch: 
  ```sh
  sudo pacman -S webkit2gtk gtk3 base-devel openssl
   ```
  - Debian/Ubuntu: 
  ```sh
   sudo apt update && sudo apt install -y libwebkit2gtk-4.0-dev build-essential curl wget file libssl-dev libgtk-3-dev
   ```
  - Fedora: 
  ```sh
  sudo dnf install -y webkit2gtk3-devel openssl-devel gtk3-devel
   ```
---

## Project Setup

1. **Clone the repository**
	```sh
	git clone https://github.com/IstiakAR/Automation
	cd Automation
	```

2. **Install JavaScript dependencies**
	```sh
	npm install
	```

3. **Install Tailwind CSS v3 and dependencies**
	```sh
	npm install -D tailwindcss@3 postcss@8 autoprefixer@10
	npx tailwindcss init -p
	```

4. **Install shadcn/ui**
	```sh
	npx shadcn-ui@latest init
	```

5. **Run the app in development mode**
	```sh
	npm run tauri dev
	```

6. **Build for production**
	```sh
	npm run tauri build
	```
