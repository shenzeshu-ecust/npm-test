let { cwx, __global } = require("../cwx.js");
let vmEngine = require("../../3rd/tiny.039.min.js");

class methodDepend {
  constructor() {
    this.Infinity = Infinity;
    this.NaN = NaN;
    this.undefined = undefined;
    this.null = null;
    this.isFinite = isFinite;
    this.isNaN = isNaN;
    this.parseFloat = parseFloat;
    this.parseInt = parseInt;
    this.decodeURI = decodeURI;
    this.decodeURIComponent = decodeURIComponent;
    this.encodeURI = encodeURI;
    this.encodeURIComponent = encodeURIComponent;
    this.Object = Object;
    this.Function = Function;
    this.Boolean = Boolean;
    this.Error = Error;
    this.Number = Number;
    this.Math = Math;
    this.Date = Date;
    this.String = String;
    this.RegExp = RegExp;
    this.Array = Array;
    this.Map = Map;
    this.Set = Set;
    this.JSON = JSON;
    this.Promise = Promise;
    // this.require = require;
    try {
      this.navigator = navigator;
      this.Navigator = getPrototypeForBOM(typeof Navigator == "undefined" ? undefined : Navigator, navigator);
      this.Location = getPrototypeForBOM(typeof Location == "undefined" ? undefined : Navigator, location);
      this.Document = getPrototypeForBOM(typeof Document == "undefined" ? undefined : Document, document);
      this.location = location;
      this.document = document;
    } catch (e) { }
    this.escape = escape || undefined;
    this.self = this;
    this.console = console;
    this.cwx = cwx;

    this.globals = {};
  }
}

function getPrototypeForBOM(test, instance) {
  if (typeof test != "undefined") {
    return test;
  }
  if (typeof instance != "undefined") {
    return Object.getPrototypeOf(instance);
  }
  return undefined;
}

let vmGlobals = new methodDepend();
let defaultSDK = {
  "b": "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",
  "d": [
    "Q",
    "W",
    "E",
    "R",
    "T",
    "Y",
    "U",
    "I",
    "O",
    "P",
    "A",
    "S",
    "D",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "Z",
    "X",
    "C",
    "V",
    "B",
    "N",
    "M",
    "q",
    "w",
    "e",
    "r",
    "t",
    "y",
    "u",
    "i",
    "o",
    "p",
    "a",
    "s",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "z",
    "x",
    "c",
    "v",
    "b",
    "n",
    "m",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "$",
    "_",
    "[",
    "]",
    97,
    378,
    "globals",
    "-",
    "Date",
    0,
    "cwx",
    106,
    107,
    "Math",
    100000,
    1,
    9,
    "",
    226,
    222,
    "#",
    192,
    2
  ],
  "version": "1002-minidefault"
};

function createAntiSpiderRequestV2({ appid, originalBody, callback }) {
  let handleFail = () => {
    try {
      let signature = "";
      if (vmGlobals.globals.defaultSignature) {
        signature = vmGlobals.globals.defaultSignature(originalBody, appid);
      } else {
        vmEngine()(vmGlobals, { d: defaultSDK.d, b: defaultSDK.b });
        signature = vmGlobals.globals.defaultSignature(originalBody, appid);
      }
      callback(signature);
      successTrace(signature);
    } catch (e) {
      callback("1001-fail-00000000000000000000000000000000");
      failedTrace(e, "defaultSignature-fail-V2");
    }
  };

  if (vmGlobals.globals.signature) {
    try {
      let signature = vmGlobals.globals.signature(originalBody, appid);
      callback(signature);
      successTrace(signature);
    } catch (e) {
      handleFail();
      failedTrace(e, "signature-fail-V2");
    }
    return
  }

  cwx.request({
    url: "/restapi/soa2/18433/sdtsource",
    data: {
      appid: appid
    },
    success(res) {
      try {
        const { d, b, version } = JSON.parse(res.data.link);
        vmEngine()(vmGlobals, { d, b });
        let signature = vmGlobals.globals.signature(originalBody, appid);
        callback(signature);
        successTrace(signature);
      } catch (e) {
        handleFail();
        failedTrace(e, "request-success-fail-V2");
      }
    },
    fail: function (e) {
      handleFail();
      failedTrace(e, "request-fail-V2");
    },
    timeout: 2000,
  });
}

function successTrace(signature) {
  const page = cwx.getCurrentPage();
  try {
    page.ubtDevTrace && page.ubtDevTrace('HOTEL_ANTI_SPIDER_SUCCESS_WEAPP', {
      cid: cwx.clientID || '',
      page: page.pageId,
      signature: signature
    });
  } catch (e) {
    console.log(e)
  }
}
function failedTrace(e, type) {
  const page = cwx.getCurrentPage();
  try {
    page.ubtDevTrace && page.ubtDevTrace('HOTEL_ANTI_SPIDER_FAIL_WEAPP', {
      cid: cwx.clientID || '',
      page: page.pageId,
      err: e.stack || e,
      type: type
    });
  } catch (e) {
    console.log(e)
  }
}
export default createAntiSpiderRequestV2;