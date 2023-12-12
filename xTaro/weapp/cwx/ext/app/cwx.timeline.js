import { cwx } from "../../cwx.js";

export function checkInTimeline() {
  return cwx.scene && cwx.scene.toString() === "1154"
}