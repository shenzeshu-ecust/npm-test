const path = require('path');
const taroConfig = require('./initConfig');
// const collectComponents = require('./collectComponents');
const isBundleAnalyzer = !!process.argv.includes("--analyzer");
const AnalyzerPlugin = require("../plugins/analyzerPlugin");
const MultiPlatformPlugin = require("@ctrip/multiPlatform/MultiPlatformPlugin");
const splitChunkCommons = function () {
  const commonChunks = {};
  function createTestFn(chunkName, moduleRegexp) {
    return function (module, {
      chunkGraph
    }) {
      const isNoOnlySubpackRequired = chunkGraph.getModuleChunks(module).find(function (chunk) {
        return !new RegExp("^" + chunkName).test(chunk.name);
      });
      // if (isNoOnlySubpackRequired && moduleRegexp) {
      //   //todo?如果是非当前chunk但是资源是该模块依赖的，则打包到当前的chunkcommon中
      //   return moduleRegexp.test(module.resource)
      // }
      return !isNoOnlySubpackRequired;
    };
  }
  if (taroConfig && taroConfig.subPackages.length !== 0) {
    taroConfig.subPackages.forEach(function (sub) {
      //有分包时，再做分包的处理
      const _root = sub.root.slice(-1) === "/" ? sub.root : sub.root + "/";
      const chunkCommonName = _root + "taroCommon";
      const chunkName = _root;
      // const moduleRegexp = taroConfig["moduleRegexp"][_root.slice(0, -1)];
      commonChunks[chunkCommonName.replace(/\//g, "_")] = {
        name: chunkCommonName,
        minChunks: 2,
        test: createTestFn(chunkName),
        priority: 200
      };
    });
  }
  return commonChunks;
};
// const labels = collectComponents();
const config = {
  compiler: 'webpack5',
  projectName: "xtaro-myapp",
  date: '2021-4-13',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: taroConfig.outputRoot,
  // `dist/${process.env.TARO_ENV}`,
  plugins: [[path.join(process.cwd(), '/plugins/replaceMiniAppPath.js'), {
    taroConfig,
    miniappPath: ""
  }], [path.join(process.cwd(), '/plugins/moveRes.js'), {
    taroConfig,
    miniappPath: ""
  }], '@tarojs/plugin-platform-kwai', ['@tarojs/plugin-inject', {
    nestElements: {
      // 'nav-bar': 1,
      // 'captcha': 3,
      // 'coupon': 3,
      'slot': 4,
      'slot-view': 4,
      'form': 2,
      'label': 2,
      'text': 5,
      // 'nps-score': 3,
      // 'collection': 3,
      // 'ad-sdk': 3,
      'authorizationFloat': 1
    }
  }], "@ctrip/xtaro-plugin-platform-crn", "@ctrip/xtaro-plugin-platform-nfes", "@ctrip/xtaro-plugin-build-component"],
  defineConstants: {},
  framework: process.env.FRAMEWORK === 'PReact' ? 'preact' : 'react',
  alias: {
    ...(taroConfig.alias || {})
    //todo？ 支持alias来动态获取文件地址
    // '@/miniapp': process.env.TARO_ENV !== 'h5' ? '@/miniapp' : path.resolve(__dirname, '../../miniapp/components')
  },

  copy: {
    patterns: [],
    options: {}
  },
  // cache: {
  //   enable:true,
  //   type: 'filesystem',
  //   cacheDirectory: path.resolve(__dirname, '../cacheTmp')
  // },
  mini: {
    optimizeMainPackage: {
      enable: false
    },
    enableSourceMap: true,
    sourceMapType: "source-map",
    addChunkPages(pages) {
      if (taroConfig && taroConfig.subPackages.length) {
        taroConfig.subPackages.forEach(function (sub) {
          const _root = sub.root.slice(-1) === "/" ? sub.root : sub.root + "/";
          const chunkCommonName = _root + "taroCommon";
          sub.pages.forEach(function (item) {
            const realPage = item.slice(0) === "/" ? item.slice(1) : item;
            const realPageName = _root + realPage;
            pages.set(realPageName, [chunkCommonName]);
          });
        });
      }
    },
    webpackChain(chain) {
      if (isBundleAnalyzer) {
        chain.plugin('analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, []);
      }
      if (taroConfig && (!taroConfig.mcdAppId || taroConfig.mcdAppId === "taro" || taroConfig.mcdAppId === "5227")) {
        //只有微信主板才需要检查
        chain.plugin('analyzerChunk').use(AnalyzerPlugin, [{
          subPackages: taroConfig.subPackages
        }]);
      }
      chain.merge({
        output: {
          chunkLoadingGlobal: 'tripTaroGlobal' + parseInt(100 * Math.random(1))
        },
        externals: [({
          context,
          request
        }, callback) => {
          const externalDirs = ['@miniapp', '@/miniapp'];
          const externalDir = externalDirs.find(dir => request.startsWith(dir));
          // if (process.env.NODE_ENV === 'production' && externalDir) {
          if (externalDir) {
            //todo? 此处暂时不修改文件路径,不要源文件地址，只要打完包的文件地址
            return callback(null, `commonjs ${request}`);
          }
          callback();
        }, ...(taroConfig.externals || [])],
        optimization: {
          splitChunks: {
            cacheGroups: {
              react: {
                name: 'vendors',
                test: module => {
                  return /[\\/]node_modules[\\/](react-reconciler|scheduler)/.test(module.resource) || /taroCwx/.test(module.resource);
                }
              },
              ...splitChunkCommons()
            }
          }
        },
        performance: {
          maxAssetSize: 1000000
        },
        snapshot: {
          // managedPaths: [path.resolve(__dirname, '../node_modules')],
          buildDependencies: {
            hash: true
            // timestamp: true,
          },

          module: {
            hash: true
            // timestamp: true,
          },

          resolve: {
            hash: true
            // timestamp: true,
          },

          resolveBuildDependencies: {
            hash: true
            // timestamp: true,
          }
        }
      });
    },

    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },

      cssModules: {
        enable: true,
        // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module',
          // 转换模式，取值为 global/module
          generateScopedName: '[name]_[hash:base64:5]'
        }
      }
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true
    },
    alias: {
      ...(taroConfig.alias || {})
    }
  },
  h5: {
    //NFES Add
    appID: "99999999",
    //应用ID
    templateFolder: "./nfes",
    //可替换NFES产物的文件夹
    vd: "",
    //虚拟路径
    site: "webresource.c-ctrip.com",
    //静态资源站点
    resVD: "nfesci",
    //资源路径特征码
    noticeUserID: [],
    //在线构建通知人列表 工号

    router: {
      mode: "browser",
      customRoutes: {
        "pages/mainPage/index": "/mainPage",
        "pages/xtaro-myapp/index": "/xtaro-myapp",
        "pages/xtaro-myapp/subPackages/foo/index": "/xtaro-myapp/subPackages/foo",
        "pages/xtaro-myapp/subPackages/bar/index": "/xtaro-myapp/subPackages/bar"
      }
    },
    // watch 时使用的 port
    devServer: {
      port: 6677
    },
    publicPath: "/",
    staticDirectory: "static",
    webpackChain(chain) {
      const MultiPlatformPlugin = require("@ctrip/multiPlatform/MultiPlatformPlugin");
      chain.merge({
        resolve: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".vue", ".scss", ".less"]
        }
      });
      chain.resolve.plugin("NewMultiPlatformPlugin").use(MultiPlatformPlugin, ["described-resolve", "resolve", {
        chain,
        include: ["@ctrip/xtaro-platform-component", "@ctrip/xtaro-api", "@ctrip/xtaro-components"]
      }]);
      chain.module.rule("style-multi-loader").test(/\.scss$/).use("@ctrip/multiPlatform/style-multi-loader").loader("@ctrip/multiPlatform/style-multi-loader").options({
        alias: {
          ...{}
        },
        //webpack alias
        rootDir: path.join(__dirname, "../") //项目根目录
      });
    },

    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: true,
        // 默认为 true，如不使用 css modules 功能，则设为 false
        config: {
          namingPattern: "module",
          // 转换模式，取值为 global/module
          generateScopedName: "[name]__[local]___[hash:base64:5]"
        }
      }
    }
  },
  crn: {
    appid: "99999999",
    rnVersion: "0.70.1",
    resolve: {
      include: ["@ctrip/xtaro-platform-component", "@ctrip/xtaro-api", "@ctrip/xtaro-components"]
    }
  }
};
module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};