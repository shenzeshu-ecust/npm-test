import {
  cwx,
  CPage,
  __global,
  _
} from "../../../../cwx/cwx";
import model from './model'
import utils from "../../common/utils";

CPage({
  pageId: '10650084524',
  urlsBase64: [],
  isForceShowAuthorization: true,
  data: {
    isForceShowAuthorization: true,
    content: '', // 文章地址
    urls: [], // 本地
    cdnUrls: [],
    maxCount: 3,
    taskItem: null,
    eventDisplay: null,
    showError: false,
    auditMaxSize: 10,
    tempid: '',
    compid: '',
    legaoInfo: null,
    showNextModal: false
  },

  onLoad(options) {
    this.checkLogin()
    const {
      channelCode,
      taskId,
      tempid,
      compid
    } = options
    this.setData({
      channelCode,
      taskId,
      tempid,
      compid
    })
    this.init()
    this.fetchQconfig()
  },
  async init() {
    const {
      channelCode,
      taskId
    } = this.data
    this.customerUbtTrace({
      channelCode,
      taskId
    })
    await this.batchReceiveProjectTask(channelCode)
    this.setTaskItem(channelCode, taskId)
    await this.fetchTemplateData()
  },

  async fetchTemplateData() {
    if (!this.data.tempid) {
      return
    }
    const res = await model.loadLegaoTemplate({
      templateCode: this.data.tempid
    })
    if (res.code == 0 && res.template) {
      try {
        const pageComps = res.components
        let legaoInfo = pageComps.find(item => item.id == this.data.compid);
        this.setData({
          legaoInfo: JSON.parse(legaoInfo.property)
        })
      } catch (e) {
        console.log('tpl JSON parse err: ', e)
      }
    }
  },

  batchReceiveProjectTask(channelCode) {
    model.batchReceiveProjectTask({
      channelCodeList: channelCode.split(','),
    }).then(res => {
      this.customerUbtTrace({
        action: 'batchReceiveProjectTask',
        channelCode,
        res
      })
    })
  },

  checkLogin() {
    cwx.user.checkLoginStatusFromServer((checkLoginRes) => {
      console.log('登陆态', checkLoginRes)
      if (!checkLoginRes) {
        utils.toLoginPage(this.init)
      }
    });
  },

  fetchQconfig() {
    model.taskConfig().then(res => {
      if (res.data) {
        const { auditMaxSize } = res.data
        if (auditMaxSize) {
          this.setData({
            auditMaxSize,
          })
        }
      }
    })
  },

  setTaskItem(channelCode, taskId) {
    model.userTaskList({
      channelCode: channelCode,
      // version: '3'
    }).then(res => {
      if (res.code == 100) {
        utils.toLoginPage(this.init)
        return
      }
      this.customerUbtTrace({
        action: 'setTaskItem',
        channelCode,
        res
      })
      if (res.code == 200) {
        let _unCompletedTaskInfoList = res.todoTaskList || []
        let _completedTaskInfoList = res.finishTaskList || []
        const taskList = [..._unCompletedTaskInfoList, ..._completedTaskInfoList]
        const taskItem = taskList.find(item => item.id == taskId)
        if (!taskItem) {
          wx.showToast({
            title: 'channelCode中没有找到相应的taskid',
            icon: 'none'
          })
          return
        }
        const eventDisplay = parseJson(taskItem.eventDisplay)
        this.setData({
          taskItem,
          eventDisplay
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  handleDel(e) {
    const {
      index
    } = e.target.dataset || e.currentTarget.dataset
    let {
      urls,
      cdnUrls
    } = this.data
    let urlsBase64 = this.urlsBase64
    urls.splice(index, 1)
    urlsBase64.splice(index, 1)
    cdnUrls.splice(index, 1)
    this.setData({
      urls,
      cdnUrls
    })
    this.urlsBase64 = urlsBase64
  },

  handleUpload() {
    this.customerUbtTrace({
      action: 'start invoke chooseMedia'
    })
    cwx.chooseImage({
      count: 3,
      sourceType: ['album'],
      sizeType: ['compressed'],
      success: async (res) => {
        console.log(res)
        this.customerUbtTrace({
          action: 'invoke chooseMedia success',
          tempFiles:  res.tempFiles
        })
        if (res.tempFiles) {
          const tempFiles = res.tempFiles.filter(item => validFileSize(item, 1024 * this.data.auditMaxSize))
          if (tempFiles.length < res.tempFiles.length) {
            wx.showToast({
              title: '图片大小超过限制',
              icon: 'none'
            })
            this.customerUbtTrace({
              action: 'image size over',
            })
          }
          const tempUrl = tempFiles.map(item => item.path || item.tempFilePath)
          const tempUrlBase64 = tempUrl.map(convertImageToBase64)
          let tempCdn = []
          try {
            tempCdn = await batchUpdateImage(tempUrlBase64)
            this.customerUbtTrace({
              action: '调用上传接口上传成功',
              tempCdn: tempCdn
            })
          } catch (error) {
            // wx.showToast({
            //   title: '上传失败',
            //   icon: 'none'
            // })
            this.customerUbtTrace({
              action: '上传失败',
              error: error
            })
            return
          }
          let {
            urls,
            cdnUrls
          } = this.data
          let urlsBase64 = this.urlsBase64
          urls = [...urls, ...tempUrl].slice(0, this.data.maxCount)
          urlsBase64 = [...urlsBase64, ...tempUrlBase64].slice(0, this.data.maxCount)
          cdnUrls = [...cdnUrls, ...tempCdn].slice(0, this.data.maxCount)
          this.setData({
            urls,
            cdnUrls
          })
          this.urlsBase64 = urlsBase64
          this.customerUbtTrace({
            action: '结果',
            urls: urls,
            cdnUrls: cdnUrls
          })
        }
      },
      fail: (params) => {
        this.customerUbtTrace({
          action: 'invoke chooseMedia fail',
          params
        })
      },
      complete: (res) => {
        this.customerUbtTrace({
          action: 'invoke chooseMedia complete',
          res
        })
      }
    }, {
      action: "【携程任务中心】访问你的相机/摄像头/相册",
      desc: "【携程任务中心】将获取你的相机/摄像头/相册权限，用于获取图片或者视频来丰富点评内容、发送社区动态、更换头像、上传凭证等"
    })
  },

  handleSubmit() {
    if (!this.data.content) {
      this.setData({
        showError: true
      })
      return
    }
    if (this.data.cdnUrls.length == 0) {
      wx.showToast({
        title: `请上传图片`,
        icon: 'none'
      })
      return
    }
    const {
      taskItem
    } = this.data
    const eventDisplay = parseJson(taskItem.eventDisplay)
    let {
      _serialNumber
    } = eventDisplay
    model.taskAssistant({
      "businessType": "EXTERNAL_CONTENT_SUBMIT",
      "paramMap": {
        "serialNumber": _serialNumber,
        "submitContent": this.data.content,
        "pictureUrls": this.data.cdnUrls.join(',')
      },
    }).then(res => {
      if (res.code == 200) {
        wx.showToast({
          title: '提交成功',
          icon: 'none'
        })
        if (this.data.legaoInfo && this.data.legaoInfo._showNextModal && this.data.legaoInfo.nextModalImg) {
          this.setData({
            showNextModal: true
          })
        } else {
          setTimeout(() => {
            this.handleCancel()
          }, 1000)
        }
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
      this.customerUbtTrace({
        action: 'taskAssistant',
        "serialNumber": _serialNumber,
        "submitContent": this.data.content,
        "pictureUrls": this.data.cdnUrls.join(','),
        res
      })
    })
  },

  handleCancel() {
    cwx.navigateBack({
      delta: 1,
      success: (res) => { },
      fail: (res) => { },
      complete: (res) => { },
    })
  },

  handleCloseNextModal() {
    this.handleCancel()
  },

  handleNextJump() {
    const _nextJumpUrl = this.data.legaoInfo._nextJumpUrl
    const defaultUrl = 'https://m.ctrip.com/cpc/stimulation/activity?isHideHeader=true&isHideNavBar=YES&source=task_xhstc&pushcode=task_xhstc'
    utils.goTargetUrl(_nextJumpUrl || defaultUrl)
  },

  handleContentChange(e) {
    const value = e.detail.value
    if (value) {
      this.setData({
        showError: false
      })
    }
    this.setData({
      content: value
    })
  },

  customerUbtTrace(args) {
    console.log(args)
    this.ubtTrace && this.ubtTrace('o_mkt_notesAudit', args);
  }
})
// list base64数组
async function batchUpdateImage(list) {
  if (list.length == 0) {
    return Promise.reject()
  }
  const uploadFileRequestInfoList = list.map(v => ({
    base64FileStr: v // base64
  }))
  const res = await model.batchUploadPicture({
    uploadFileRequestInfoList: uploadFileRequestInfoList
  })
  if (res.code == 200) {
    const ret = res.uploadFileResponseInfoList.map((item, index) => {
      return item.url
    })
    return ret
  } else {
    return Promise.reject()
  }
}

function convertImageToBase64(url) {
  const fs = wx.getFileSystemManager()
  // 同步接口
  try {
    const res = fs.readFileSync(url, 'base64', 0)
    console.log(res)
    return res
  } catch (e) {
    console.log(e)
  }
}

function validFileSize(file, maxSize) {
  let s = +formatFileSizeK(file.size)
  return s < maxSize
}

function formatFileSizeK(number) {
  return (number / 1024).toFixed(1)
}

function parseJson(str, def) {
  let ret = def || {}
  try {
    ret = JSON.parse(str)
  } catch (error) { }
  return ret
}