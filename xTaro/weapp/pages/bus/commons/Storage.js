/*
 * @Author: jhyi jhyi@trip.com
 * @Date: 2023-07-20 16:05:34
 * @LastEditors: jhyi jhyi@trip.com
 * @LastEditTime: 2023-08-03 19:06:17
 * @FilePath: /bus/commons/Storage.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import './date';
import SessionStorage from './SessionStorage/index';
import { cwx } from './cwx/index';

function fmtValue(value, fmt = 'yyyy-MM-dd hh:mm:ss') {
  let date = new Date();
  let v = {
    timestamp: date.getTime(),
    //@ts-ignore
    timestampStr: date.format(fmt),
    value: value,
  };
  let string = JSON.stringify(v);
  return string;
}

const Storage = {
  create: function (domain = '', isSession = false, storageWrap) {
    let localStorage = storageWrap ? storageWrap(cwx) : cwx;
    const domainKey = domain;
    let store = isSession ? SessionStorage : localStorage;
    return {
      get(key, maxAge = 0) {
        let realKey = `${domainKey}__${key}`;
        let value = store.getStorageSync(realKey);
        let v = null;
        try {
          if (value) {
            const j = JSON.parse(value);
            if (maxAge > 0) {
              const timeStamp = j.timestamp;
              let now = new Date().getTime();
              if (now - timeStamp > maxAge) {
                v = null;
              } else {
                v = j.value || null;
              }
            } else {
              v = j.value || null;
            }
          } else {
            v = null;
          }
        } catch (e) {
          console.log('error ---', e);
        }
        return v;
      },
      set(key, value) {
        let realKey = `${domainKey}__${key}`;
        store.setStorageSync(realKey, fmtValue(value));
      },
    };
  },
};

export default Storage;
