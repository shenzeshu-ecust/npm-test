import {cwx} from "../cwx/cwx.js";
const locate48HoursLimitKey = "LOCATE_48_Hours_LIMIT";

function getAuthCode (key) {
  const timeStamp = cwx.getStorageSync(key) || '';
  if (!timeStamp) {
    return;
  }
  return Math.floor((new Date().getTime() - timeStamp) / 1000 / 60 / 60);
}

export {
  locate48HoursLimitKey,
  getAuthCode
}