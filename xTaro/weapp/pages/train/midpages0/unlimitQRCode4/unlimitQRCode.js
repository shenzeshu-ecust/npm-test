import TPage from '../../common/TPage'
import { unlimitQRCode } from '../../common/components/unlimitQRCode/unlimitQRCode'

let _unlimitQRCode = Object.assign({}, unlimitQRCode)
_unlimitQRCode.pageId = "10650009404"

TPage(unlimitQRCode)
