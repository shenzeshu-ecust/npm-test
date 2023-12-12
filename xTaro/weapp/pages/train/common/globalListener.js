import { cwx } from '../../../cwx/cwx'
import { recordErrorLogModel } from './model'
import { shared } from './trainConfig'
import util from './util'

function globalListenerInit() {
  try {
    cwx.onError((err) => {
      try {
        const page = cwx.getCurrentPage()
        if (!page.route.includes('train')) {
          return
        }
        page.ubtDevTrace('trn_mini_error', {
          err,
          vm: JSON.stringify(page.data),
        })
        recordErrorLogModel(
          {
            message: err.substring(0, 1000),
            url: page.route,
            source: page.route,
            channel: shared.channel,
          },
          () => {},
        )
      } catch (err) {
        console.error(err)
      }
    })

    cwx.onUnhandledRejection((err) => {
      try {
        const page = cwx.getCurrentPage()
        if (!page.route.includes('train')) {
          return
        }

        if (err.reason.errMsg === "hideLoading:fail:toast can't be found") {
          return
        }
        page.ubtDevTrace('trn_mini_error', {
          err: err.reason.stack,
          vm: JSON.stringify(page.data),
        })
        recordErrorLogModel(
          {
            message: err.reason.stack.substring(0, 1000),
            url: page.route,
            source: page.route,
            channel: shared.channel,
          },
          () => {},
        )
      } catch (err) {
        console.error(err)
      }
    })

    cwx.onUserCaptureScreen(() => {
      const page = cwx.getCurrentPage()
      if (page.route.includes('grab/grab')) {
        util.ubtTrace('c_trn_c_10650037939', { bizKey: 'shareScreenshotClick' })
      } else if (page.route.includes('ordinary/ordinary')) {
        util.ubtTrace('c_trn_c_10650037941', { bizKey: 'shareScreenshotClick' })
      }
    })
  } catch (e) {
    console.error(e)
  }
}

export { globalListenerInit }
