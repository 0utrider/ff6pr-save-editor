import { useState } from "preact/hooks";
import { LandingScreen } from "./screens/LandingScreen.tsx";
import { EditorScreen } from "./screens/EditorScreen.tsx";
import type { SaveFile } from "../model/saveFile.ts";

export function App() {
  const [loaded, setLoaded] = useState<{ save: SaveFile; filename: string } | null>(null);

  if (!loaded) {
    return <LandingScreen onLoaded={(save, filename) => setLoaded({ save, filename })} />;
  }

  return <EditorScreen save={loaded.save} filename={loaded.filename} onReset={() => setLoaded(null)} />;
}
