import { cwx, CPage, _ } from '../../../cwx/cwx.js';


import { unlimitQRCode } from './unlimitQRCode';

let _unlimitQRCode = Object.assign({}, unlimitQRCode)
_unlimitQRCode.pageId = "10650052592";

CPage(_unlimitQRCode);