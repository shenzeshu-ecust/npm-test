import ModelUtil from '../../common/utils/model.js';
import util from '../../common/utils/util.js';
import hrequest from '../../common/hpage/request';
import hPromise from '../../common/hpage/hpromise';

const saveImage = function (tempPath) {
    wx.saveImageToPhotosAlbum({
        filePath: tempPath
    });
};

const download = function (url, callback) {
    if (!util.isFunction(callback)) {
        return;
    }

    wx.downloadFile({
        url: res.data.url,
        success: function (r) {
            if (r.statusCode === 200) {
                const tempPath = r.tempFilePath;
                callback(tempPath);
            }
        }
    });
};

const doRequest = function (hotelId, callback) {
    if (!util.isFunction(callback)) {
        return;
    }

    hrequest.hrequest({
        url: ModelUtil.serveUrl('getscreen'),
        data: {
            id: hotelId
        },
        success: (res) => {
            const { enable, url } = res.data;

            if (enable && url) {
                callback(url);
            }
        }
    });
};

export default {
    captureScreen: function (hotelId) {
        if (!wx.onUserCaptureScreen) {
            return;
        }

        const requestTask = () => {
            return new hPromise(resolve => {
                doRequest(hotelId, resolve);
            });
        };

        const downloadTask = (url) => {
            return new hPromise(resolve => {
                download(url, resolve);
            });
        };

        requestTask()
            .then(downloadTask)
            .then(saveImage)
            .catch(() => {});
    }
};
