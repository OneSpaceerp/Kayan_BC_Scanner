export function useHaptics() {
  const vibrate = (ms: number) => {
    if ("vibrate" in navigator) navigator.vibrate(ms);
  };
  return { vibrate };
}
