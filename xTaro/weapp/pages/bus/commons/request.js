import { cwx, __global } from './cwx/index';
import DefaultBusConfig from './busConfig.js';
const BusConfig = DefaultBusConfig;
const systemInfo = cwx.getSystemInfoSync();

let defautHeader = {};
if (BusConfig.headerControl && BusConfig.headerControl.length > 0) {
  let header = BusConfig.busHeaderMap[BusConfig.headerControl] || {};
  defautHeader = header;
}

const Pservice = {};
//以下两个变量是为了减少代码量拎出来的
const baseUrl = '/restapi/soa2/';
const domain = '';
const baseParam = '';

const surpportSocket = true; //默认支持sokcet

let optWrap = undefined;
const soaFetch = function (
  url,
  dataProps,
  successCallback,
  failCallback,
  scope,
  method,
  needOrigin
) {
  return new Promise(function (resolve, reject) {
    dataProps = dataProps || {};
    let { optWrap: wrapOpt, ...data } = Object.assign({}, dataProps);

    if (url === '/restapi/soa2/14338/savePassenger.json') {
      var basicParams = {
        app: BusConfig.app,
        bigChannel: BusConfig.big_channel,
        smallChannel: BusConfig.smallchannel,
        operatSystem: systemInfo.platform + BusConfig.suffix,
        bigClientType: BusConfig.big_client_type,
        clientVersion: BusConfig.client_version || systemInfo.version,
      };

      data.basicParams = basicParams;
    } else {
      var basic_params = {
        app: BusConfig.app,
        big_channel: BusConfig.big_channel,
        smallchannel: BusConfig.smallchannel,
        operat_system: systemInfo.platform + BusConfig.suffix,
        big_client_type: BusConfig.big_client_type,
        client_version: BusConfig.client_version || systemInfo.version,
      };

      data.basic_params = JSON.stringify(basic_params);
    }

    var success = (data) => {
      successCallback && successCallback.call(scope || this, data);
      resolve(data);
    };
    var fail = (err) => {
      failCallback && failCallback.call(scope || this, err);
      reject(err);
    };
    let isSocket = surpportSocket;
    if (data.hasOwnProperty('isSocket')) {
      isSocket = data.isSocket;
      delete data.isSocket;
    }

    let header = Object.assign({}, defautHeader);
    if (data.hasOwnProperty('header')) {
      let customHeader = data.header || {};
      header = Object.assign({}, defautHeader, customHeader);
      delete data.header;
    }

    let opt = {
      url: url,
      isSocket: isSocket,
      method: method || 'POST',
      data: data,
      header,
      success: function (res) {
        if (
          res &&
          res.data &&
          res.data.ResponseStatus &&
          res.data.ResponseStatus.Ack == 'Success'
        ) {
          success(res.data);
        } else {
          fail((res && res.data) || { messaage: '网络请求失败' });
        }
      },
      fail: function (res) {
        fail((res && res.data) || { messaage: '网络请求失败' });
      },
    };
    if (wrapOpt) {
      opt = wrapOpt(opt);
    }
    cwx.request(opt);
  });
};
const newFetch = function (
  url,
  dataProps,
  successCallback,
  failCallback,
  scope,
  method,
  needOrigin
) {
  return new Promise(function (resolve, reject) {
    dataProps = dataProps || {};
    let { optWrap: wrapOpt, ...data } = Object.assign({}, dataProps);

    var basicParams = {
      app: BusConfig.app,
      bigChannel: BusConfig.big_channel,
      smallChannel: BusConfig.smallchannel,
      operatSystem: systemInfo.platform + BusConfig.suffix,
      bigClientType: BusConfig.big_client_type,
      clientVersion: BusConfig.client_version || systemInfo.version,
    };

    data.basicParams = {
      ...basicParams,
      ...(data.basicParams || {}),
    };

    console.log('start request', url);

    var success = (data) => {
      successCallback && successCallback.call(scope || this, data);
      resolve(data);
    };
    var fail = (err) => {
      failCallback && failCallback.call(scope || this, err);
      reject(err);
    };

    let isSocket = surpportSocket;
    if (data.hasOwnProperty('isSocket')) {
      isSocket = data.isSocket;
      delete data.isSocket;
    }

    let header = Object.assign({}, defautHeader);
    if (data.hasOwnProperty('header')) {
      let customHeader = data.header || {};
      header = Object.assign({}, defautHeader, customHeader);
      delete data.header;
    }

    let opt = {
      url: url,
      isSocket: isSocket,
      method: method || 'POST',
      data: data,
      header,
      success: function (res) {
        console.log('request complete ----', url);
        if (res && res.data) {
          if (res.data.code == 1) {
            success({
              ...res.data,
              code: res.data.code,
              return: res.data.data,
              message: res.data.message || '',
            });
          } else {
            fail(res.data);
          }
        } else {
          fail({ messaage: '网络请求失败' });
        }
      },
      fail: function (res) {
        console.log('request fail ----', url, '----', res);
        fail((res && res.data) || { messaage: '网络请求失败' });
      },
    };
    if (wrapOpt) {
      opt = wrapOpt(opt);
    }
    cwx.request(opt);
  });
};

//regiser configMap key不能和已有key重复否则会覆盖
const requestRegister = function (configMap) {
  for (var key in configMap) {
    var cf = configMap[key];
    Pservice[key] = requestContructor(cf);
  }
};

const requestContructor = function (config) {
  return function (data, fns, fnf, scope) {
    let url =
      (config.domain || domain) + (config.baseUrl || baseUrl) + config.url;
    if (!config.noUrlBase) {
      url =
        url.indexOf('?') >= 0
          ? url + '&' + (config.baseParam || baseParam)
          : url + '?' + (config.baseParam || baseParam);
    }
    data = data || {};
    if (config.extraParam) {
      for (let k in config.extraParam) {
        if (!data[k]) {
          data[k] = config.extraParam[k];
        }
      }
    }
    var request;
    if (config.soa) {
      request = soaFetch;
    } else {
      request = newFetch;
    }
    return request(
      url,
      data,
      (data) => {},
      (err) => {},
      scope,
      config.method,
      config.needOrigin || false
    )
      .then((res) => {
        console.log(res);
        fns && fns.call(scope || this, res);
        if (config.needLog) {
          logRequestSuccess(
            {
              url: url,
              params: data,
              config: config,
            },
            JSON.stringify(res)
          );
        } else {
          logRequestSuccess(
            {
              url: url,
              params: data,
              config: config,
            },
            JSON.stringify(res).substr(0, 100)
          );
        }
        return res;
      })
      .catch((err) => {
        console.log(err);
        fnf && fnf.call(scope || this, err);

        logRequestErr(
          {
            url: url,
            params: data,
            config: config,
          },
          JSON.stringify(err)
        );

        if (!fnf) {
          throw err;
        }
      });
  };
};

const logRequestSuccess = function (data, response) {
  var mPage = cwx.getCurrentPage();
  var pageId = mPage ? mPage.pageid || mPage.pageId || '' : '';
  mPage &&
    mPage.ubtTrace &&
    mPage.ubtTrace(102601, {
      pageid: pageId,
      request: data,
      response: response,
    });
};
const logRequestErr = function (data, err) {
  var mPage = cwx.getCurrentPage();
  var pageId = mPage ? mPage.pageid || mPage.pageId || '' : '';
  mPage &&
    mPage.ubtTrace &&
    mPage.ubtTrace(102602, {
      pageid: pageId,
      request: data,
      response: '错误信息:' + err,
    });
};

Pservice.soaFetch = soaFetch;
Pservice.newFetch = newFetch;
Pservice.fetch = newFetch;
Pservice.requestContructor = requestContructor;
Pservice.requestRegister = requestRegister;
Pservice.setWrap = function (wrap) {
  optWrap = wrap;
};
Pservice.coffeeBeanWrap = function (requestFunc) {
  return function (data = {}, fns, fnf, scope) {
    return requestFunc(
      {
        ...data,
        optWrap,
      },
      fns,
      fnf,
      scope
    );
  };
};

export { Pservice };
export default Pservice;
