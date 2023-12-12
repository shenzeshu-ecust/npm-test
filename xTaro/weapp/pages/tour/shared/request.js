import util from './util'
import config from './config'

const request = (obj = {}) => {
    let params = util.extend(
        {
            url: '',
            method: 'GET',
            data: '',
            dataType: 'json',
            responseType: 'text'
        },
        obj
    )

    return new Promise((resolve, reject) => {
        wx.request(
            util.extend(params, {
                success(res) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res.data)
                    } else {
                        // 处理 statusCode, data
                        reject({
                            statusCode: res.statusCode,
                            message: res.errMsg, // request:ok
                            header: res.header,
                            data: res.data
                        })
                    }
                },
                fail(err) {
                    reject({
                        statusCode: 400,
                        message: err && err.errMsg
                    })
                }
            })
        )
    })
}

export default {
    request: request,
    get(url, data, options = {}) {
        if (util.isPlainObject(data)) {
            url += '?' + util.param(data)
        }
        return request(
            util.extend(
                {
                    url: url,
                    method: 'GET'
                },
                options
            )
        )
    },
    post(url, data = '', options = {}) {
        data = {
            ...data,
            Version: config.version,
            PlatformId: 3,
            ChannelCode: 0
        }
        return request(
            util.extend(
                {
                    url: url,
                    method: 'POST',
                    data: data
                },
                options
            )
        )
    },
    put(url, data = '', options = {}) {
        return request(
            util.extend(
                {
                    url: url,
                    method: 'PUT',
                    data: data
                },
                options
            )
        )
    },
    delete(url, data = '', options = {}) {
        return request(
            util.extend(
                {
                    url: url,
                    method: 'DELETE',
                    data: data
                },
                options
            )
        )
    }
}
