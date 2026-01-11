import { Globe, Waypoints, MousePointerClickIcon, Play, Square, Pause, AppWindow, Save, Code, Wallpaper, Keyboard, CornerDownLeft, FolderPlus, Copy, Move, Edit3, Archive, Trash2, Mail, ArrowDownCircle, ArrowUpToLine} from "lucide-react";

export const RightbarCards = [
  { icon: Play, name: "Start", iconKey: "Play", size: 50, section: "Flow Control", command: "Start", task: "Start Flow", args: {} },
  { icon: Pause, name: "Pause", iconKey: "Pause", size: 50, section: "Flow Control", command: "Pause", task: "Pause Flow", args: {"time(in seconds)": 0} },
  { icon: Square, name: "Stop", iconKey: "Square", size: 50, section: "Flow Control", command: "Stop", task: "Stop Flow", args: {} },
  { icon: Waypoints, name: "Task", iconKey: "Waypoints", size: 50, section: "Flow Control", command: "Task", task: "Use a subtask", args: {task: ""} },
  { icon: MousePointerClickIcon, name: "Click", iconKey: "MousePointerClickIcon", size: 50, section: "Actions", command: "Click", task: "Click at (x,y)", args: { x: 0, y: 0, button: "left", clicks: 1 } },
  { icon: Keyboard, name: "Type", iconKey: "Keyboard", size: 50, section: "Actions", command: "Type", task: "Type text", args: { text: "", delay_between_keys_ms: 0 } },
  { icon: CornerDownLeft, name: "PressEnter", iconKey: "CornerDownLeft", size: 50, section: "Actions", command: "Enter", task: "Press enter", args: {} },
  { icon: Globe, name: "Browse", iconKey: "Globe", size: 50, section: "Browsing", command: "Browse", task: "Open a web page", args: { browser: "firefox", url: "https://example.com", new_tab: true } },
  { icon: AppWindow, name: "Execute", iconKey: "AppWindow", size: 50, section: "System", command: "Execute", task: "Execute a program", args: { exec: "", argument: [] } },
  { icon: Save, name: "Save", iconKey: "Save", size: 50, section: "System", command: "Save", task: "Save to a file", args: { filename: "", content: "" } },
  { icon: Code, name: "GetHTML", iconKey: "Code", size: 50, section: "System", command: "GetHTML", task: "Get html", args: { url: "" } },
  { icon: Wallpaper, name: "Screenshot", iconKey: "Wallpaper", size: 50, section: "System", command: "Screenshot", task: "Take a screenshot", args: { save_path: "" } },
   { icon: FolderPlus, name: "CreateFolder", iconKey: "FolderPlus", size: 50, section: "File System", command: "CreateFolder", task: "Create a folder", args: { path: "" } },
  { icon: Edit3, name: "RenameFile", iconKey: "Edit3", size: 50, section: "File System", command: "RenameFile", task: "Rename a file", args: { from: "", to: "" } },

  { icon: Copy, name: "CopyFile", iconKey: "Copy", size: 50, section: "File System", command: "CopyFile", task: "Copy a file", args: { from: "", to: "" } },

  { icon: Move, name: "MoveFile", iconKey: "Move", size: 50, section: "File System", command: "MoveFile", task: "Move a file", args: { from: "", to: "" } },

  { icon: Archive, name: "ExtractArchive", iconKey: "Archive", size: 50, section: "File System", command: "ExtractArchive", task: "Extract ZIP/TAR archive", args: { archive: "", destination: "" } },

  { icon: Trash2, name: "CleanFolder", iconKey: "Trash2", size: 50, section: "File System", command: "CleanFolder", task: "Clean all files in a folder", args: { path: "" } },
   {
  icon: Mail, name: "SendEmail",  iconKey: "Mail",  size: 50,   section: "Communication",   command: "SendEmail",  task: "Send an email",
  args: { smtp_email: "", smtp_password: "", to: "" , subject: "",  body: "", attachments_file_path: []
  }
},
{ icon: ArrowDownCircle, name: "HTTPGet", iconKey: "ArrowDownCircle", size: 50, section: "Networking", command: "HTTPGet", task: "Make an HTTP GET request", args: { url: "", response_save_path:"", open_after: false} },
{ icon: ArrowUpToLine, name: "HTTPPost", iconKey: "ArrowUpToLine", size: 50, section: "Networking", command: "HTTPPost", task: "Make an HTTP POST request", args: { url: "", file_path: "" } },


];