import { Globe, MousePointerClickIcon, Play, Square, Pause } from "lucide-react";

export const RightbarCards = [
  { icon: Play, name: "Start", iconKey: "Play", size: 50, section: "System", "task": "Start Flow" },
  { icon: Square, name: "Stop", iconKey: "Square", size: 50, section: "System", "task": "Stop Flow" },
  { icon: Pause, name: "Pause", iconKey: "Pause", size: 50, section: "System", "task": "Pause Flow" },
  { icon: MousePointerClickIcon, name: "Click", iconKey: "MousePointerClickIcon", size: 50, section: "Actions", "task": "Click at (x,y)" },
  { icon: Globe, name: "Browse", iconKey: "Globe", size: 50, section: "Browsing", "task": "Open a web page" },
];