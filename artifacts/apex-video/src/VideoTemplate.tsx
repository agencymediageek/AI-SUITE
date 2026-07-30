import { useVideoPlayer } from "./lib/video/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { Scene1 } from "./components/video/video_scenes/Scene1";
import { Scene2 } from "./components/video/video_scenes/Scene2";
import { Scene3 } from "./components/video/video_scenes/Scene3";
import { Scene4 } from "./components/video/video_scenes/Scene4";
import { Scene5 } from "./components/video/video_scenes/Scene5";
import { Scene6 } from "./components/video/video_scenes/Scene6";
import { MatrixRain } from "./components/video/MatrixRain";
import { Scanlines } from "./components/video/Scanlines";

const SCENE_DURATIONS = [
  10000, // Scene 1: Logo reveal (10s)
  12000, // Scene 2: Config screen (12s)
  18000, // Scene 3: Live session with globe (18s)
  22000, // Scene 4: Terminal code stream (22s)
  13000, // Scene 5: Report generated (13s)
  15000, // Scene 6: Brand outro (15s)
];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer(SCENE_DURATIONS);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Persistent matrix rain background */}
      <MatrixRain />
      
      {/* Persistent scanline overlay */}
      <Scanlines />
      
      {/* Scene container */}
      <AnimatePresence mode="sync">
        {currentScene === 0 && <Scene1 key="scene1" />}
        {currentScene === 1 && <Scene2 key="scene2" />}
        {currentScene === 2 && <Scene3 key="scene3" />}
        {currentScene === 3 && <Scene4 key="scene4" />}
        {currentScene === 4 && <Scene5 key="scene5" />}
        {currentScene === 5 && <Scene6 key="scene6" />}
      </AnimatePresence>
    </div>
  );
}
