function envInitHandle(_a) {
  var _b = _a.envConfigBuild,
    envConfigBuild = _b === void 0 ? {} : _b,
    _c = _a.envConfigGray,
    envConfigGray = _c === void 0 ? {} : _c;
  var apis = Object.create(null);
  var mode = wx.getStorageSync('TEST_HOST') || 'build';
  var initDevMode = mode;
  if (mode !== 'build') {
    try {
      var m = wx.getStorageSync('TEST_HOST');
      mode = m || mode;
    } catch (err) {}
  }
  var _d = parseEnv(mode),
    envId = _d.envId,
    envType = _d.envType;
  var envConfig = envType === 'gray' ? envConfigGray : envConfigBuild;
  apis = getEnvConfigs({
    envType: envType,
    envId: envId,
    envConfig: envConfig
  });
  apis.envId = envId;
  apis.envType = envType;
  apis.initDevMode = initDevMode;
  return apis;
}
function getEnvConfigs(_a) {
  var envType = _a.envType,
    envId = _a.envId,
    envConfig = _a.envConfig;
  if (envType === 'build' || envType === 'gray') {
    return envConfig;
  }
  var config = Object.create(null);
  Object.keys(envConfig).forEach(function (key) {
    config[key] = getEnvItemByEnv({
      key: key,
      value: envConfig[key],
      envId: envId,
      envType: envType
    });
  });
  return config;
}
function getEnvItemByEnv(_a) {
  var key = _a.key,
    value = _a.value,
    envId = _a.envId,
    envType = _a.envType;
  if (envType.indexOf('build') !== -1 || envType.indexOf('gray') !== -1 || key === 'ICON_PIC_TUJIA_HOST' || key === 'M_MAYI_HOST') {
    return value;
  }
  if (key === 'ZHIMA_PLUGIN_QUERY') {
    return {
      serviceId: '2019110800000000000004463600',
      categoryId: 'CREDIT_HOTEL_ONLINE'
    };
  }
  if (typeof value === 'string') {
    var domain = getRootDomain(value);
    if (domain) {
      if (envType.indexOf('dev') !== -1) {
        value = value.replace('https://', 'http://');
      }
      if (value.indexOf('mpclient.mayi.com') !== -1) {
        value = value.replace('https://', 'http://');
      }
      if (key === 'PWA_STATIC_TUJIA_HOST') {
        value = value.replace("." + domain, "" + (envId || '') + (envType ? "-" + envType : '') + "." + domain);
      } else if (key === 'TRACELOG_TUJIA_HOST') {
        value = value.replace("." + domain, "." + (envType || '') + "." + domain);
      } else {
        value = value.replace("." + domain, (envId || '') + "." + (envType || '') + "." + domain);
      }
    }
    return value;
  }
  return value;
}
function parseEnv(env) {
  if (!env || typeof env !== 'string') {
    return {
      envId: '',
      envType: ''
    };
  }
  if (env === 't1') {
    return {
      envId: '1',
      envType: 'fvt'
    };
  }
  if (env === 't2') {
    return {
      envId: '2',
      envType: 'fvt'
    };
  }
  if (env.indexOf('.') !== -1) {
    var _a = env.split('.'),
      envId = _a[0],
      envType = _a[1];
    return {
      envId: envId || '',
      envType: envType || ''
    };
  }
  return {
    envId: '',
    envType: env
  };
}
function getRootDomain(url) {
  if (url && typeof url === 'string') {
    var list = /(([a-z\-]+)(?:\.com))/.exec(url);
    if (list && list.length > 0) {
      return list[0];
    }
    return '';
  }
  return '';
}
export default {
  envInitHandle: envInitHandle
};