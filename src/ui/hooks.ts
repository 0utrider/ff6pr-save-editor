import { useState } from "preact/hooks";

// The model layer (src/model/) mutates plain objects imperatively rather
// than through Preact state, so components that call a mutation need their
// own way to trigger a re-render. Each tab/sub-tab unmounts when inactive
// (see App.tsx / tab components), so a local force-update is enough — no
// cross-component signal is needed since siblings aren't mounted to go
// stale.
export function useForceUpdate(): () => void {
  const [, setTick] = useState(0);
  return () => setTick((t) => t + 1);
}
