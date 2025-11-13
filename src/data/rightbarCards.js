import { Globe, MousePointerClickIcon, Play, Square, Pause } from "lucide-react";

export const RightbarCards = [
  { icon: Play, name: "Start", iconKey: "Play", size: 50, section: "System", command: "StartFlow", task: "Start Flow", args: {} },
  { icon: Square, name: "Stop", iconKey: "Square", size: 50, section: "System", command: "StopFlow", task: "Stop Flow", args: {} },
  { icon: Pause, name: "Pause", iconKey: "Pause", size: 50, section: "System", command: "PauseFlow", task: "Pause Flow", args: {} },
  { icon: MousePointerClickIcon, name: "Click", iconKey: "MousePointerClickIcon", size: 50, section: "Actions", command: "Click", task: "Click at (x,y)", args: { x: 0, y: 0, button: "left", clicks: 1 } },
  { icon: Globe, name: "Browse", iconKey: "Globe", size: 50, section: "Browsing", command: "Browse", task: "Open a web page", args: { browser: "firefox", url: "https://example.com", new_tab: true } },
];