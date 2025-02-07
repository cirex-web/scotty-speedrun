const [GREEN_HUE, GREEN_SATURATION, GREEN_LIGHTNESS] = [100, 0.91, 0.45];
const [RED_HUE, RED_SATURATION, RED_LIGHTNESS] = [5, 0.91, 0.45];
export function getGreenRedColor(weightForGreen: number) {
  const hue = GREEN_HUE * weightForGreen + RED_HUE * (1 - weightForGreen);
  const saturation =
    GREEN_SATURATION * weightForGreen + RED_SATURATION * (1 - weightForGreen);
  const lightness =
    GREEN_LIGHTNESS * weightForGreen + RED_LIGHTNESS * (1 - weightForGreen);
  return `hsl(${hue},${saturation * 100}%,${lightness * 100}%)`;
}
