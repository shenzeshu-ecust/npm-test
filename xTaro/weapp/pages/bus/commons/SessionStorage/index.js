/*
 * @Author: jhyi jhyi@trip.com
 * @Date: 2022-09-23 20:38:31
 * @LastEditTime: 2022-12-15 14:21:34
 * @LastEditors: jhyi jhyi@trip.com
 * @Description:
 * @FilePath: /taro-bus/src/pages/bus/common/SessionStorage/index.ts
 *
 */
import MockStorage from './base/MockStorage';
import StorageBase from './base/StorageBase';

let storage;
if (typeof sessionStorage !== 'undefined' && sessionStorage) {
    storage = sessionStorage;
} else {
    storage = MockStorage();
}

const SessionStorage = StorageBase(storage);
export default SessionStorage;
