const fs = require("fs");
const path = require("path");
const t = require('@babel/types');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require("@babel/generator").default;

function parseCode(code, extname) {
  // return parser.transformSync(code, {
  //   filename: "file.ts",
  //   babelrc: false,
  //   ast: true,
  //   parserOpts: {
  //     helpers: false,
  //     sourceType: 'module',
  //     configFile: false,
  //     "plugins": [
  //       "@babel/plugin-proposal-optional-chaining",
  //       ["@babel/plugin-proposal-decorators", { legacy: true }],
  //       ['@babel/plugin-transform-typescript', {
  //         allowNamespaces: true,
  //         isTSX: true
  //       }],
  //       ["@babel/plugin-transform-arrow-functions", {"spec": true}]],
  //     presets: [
  //       "@babel/preset-typescript",
  //       "@babel/preset-react",
  //       [
  //         "@babel/preset-env",
  //         {
  //           targets: {
  //             // "chrome": "58",
  //             // "ie": "11",
  //             "esmodules": true
  //           }
  //         }
  //       ]],
  //     useBuiltIns: false
  //   },
  // }).ast;
  const plugins = [
    'typescript',
    // 'classProperties',
    // 'trailingFunctionCommas',
    // 'asyncFunctions',
    // 'exponentiationOperator',
    // 'asyncGenerators',
    // 'objectRestSpread',
    // 'decorators-legacy',
    // 'dynamicImport',
    // 'optionalChaining',
    // 'importAssertions',
    // 'exportNamespaceFrom',
    // 'moduleStringNames'
  ]
  if (extname.indexOf("jsx") !== -1 || extname.indexOf("tsx") !== -1) {
    plugins.push('jsx')
  }
  try {
    const result = parser.parse(code, {
      sourceType: 'module',
      plugins: plugins
    })
    return {
      type: 'File',
      start: result.start,
      end: result.end,
      program: result.program
    }
  } catch (e) {
    console.log(code);
    throw e
  }

}

function getRelativePath(moduleValue, sourceFilePath, commonModulePath, commonModuleProdPath) {
//不是相对路径开头
  let sourceRealFilePath = path.join(commonModulePath, "node_modules", moduleValue);
  let sourceRealNodeModuleFilePath = path.join(__dirname, "../node_modules", moduleValue);
  //此处需要判断该resource是不是文件夹，如果是的话需要判断有没有index.js
  if (!fs.existsSync(sourceRealNodeModuleFilePath)) {
    sourceRealNodeModuleFilePath = sourceRealNodeModuleFilePath + ".js";
  }
  const stat = fs.statSync(sourceRealNodeModuleFilePath);
  if (stat.isDirectory()) {
    if (!fs.existsSync(path.join(sourceRealNodeModuleFilePath, "index.js"))) {
      //如果没有入口文件，则需要找真正的地址文件，从package.json中获取
      if (fs.existsSync(path.join(sourceRealNodeModuleFilePath, "package.json"))) {
        const pkg = require(path.join(sourceRealNodeModuleFilePath, "package.json"));
        if (pkg.main || pkg.module) {
          sourceRealFilePath = path.join(sourceRealFilePath,  pkg.module || pkg.main);
        } else {
          throw new Error(`Can Not Find Index File: ${moduleValue}`);
        }
      } else {
        throw new Error(`Can Not Find Index File: ${moduleValue}`);
      }
    }
  }

  let relativePath = null;
  if (commonModuleProdPath) { // webpack输出文件
    relativePath = path.relative(path.dirname(commonModuleProdPath), sourceRealFilePath);
  } else {
    relativePath = path.relative(path.dirname(sourceFilePath), sourceRealFilePath);
  }
  if (relativePath.indexOf(".") !== 0) {
    relativePath = "./" + relativePath
  }
  return relativePath
}

function exclude(moduleValue) {
  return moduleValue && moduleValue.indexOf(".") &&
    moduleValue.indexOf("@miniapp") === -1 &&
    moduleValue.indexOf("@/miniapp") === -1 &&
    moduleValue.indexOf("@tarojs") === -1 &&
    moduleValue.indexOf("react") === -1 &&
    moduleValue.indexOf("react-dom") === -1 &&
    moduleValue.indexOf("react-reconciler") === -1 &&
    moduleValue.indexOf("scheduler") === -1

}

function handlerTaroCwx(moduleValue,sourceFilePath,taroBaseDir){

  if(moduleValue.indexOf("taroCwx/base") !== -1){
    moduleValue = path.relative(path.dirname(sourceFilePath),taroBaseDir)
  }
  return moduleValue
}

module.exports = function (sourceFilePath, commonModulePath, commonModuleProdPath,taroBaseDir) {
  if (fs.existsSync(sourceFilePath)) {
    let content = fs.readFileSync(sourceFilePath, "utf-8");
    const extName = path.extname(sourceFilePath);
    const ast = parseCode(content, extName);
    traverse(ast, {
      "ImportDeclaration": function (_path) {
        // 参数 node 就是 AST 里面 ClassDeclaration 对象
        const moduleValue = _path.node.source.value;
        let relativePath = handlerTaroCwx(moduleValue,sourceFilePath,taroBaseDir);
        if (exclude(moduleValue) && content.indexOf(moduleValue) !== -1) {
          relativePath = getRelativePath(moduleValue, sourceFilePath, commonModulePath, commonModuleProdPath)
        }
        _path.node.source.value = relativePath;
        // content = content.replace(moduleValue, relativePath);
      },
      "CallExpression": function (_path) {
        if (_path.node.callee.name === "require" && _path.node.arguments.length === 1) {
          const moduleValue = _path.node.arguments[0].value;
          console.log("CallExpression.moduleValue---: ",moduleValue);

          let relativePath = handlerTaroCwx(moduleValue,sourceFilePath,taroBaseDir);
          if (exclude(moduleValue) && content.indexOf(moduleValue) !== -1) {
            relativePath = getRelativePath(moduleValue, sourceFilePath, commonModulePath, commonModuleProdPath)
          }
          _path.node.arguments[0].value = relativePath;
          // content = content.replace(moduleValue, relativePath);
        }
      }
    });
    return generate(
      ast,
      {},
      content
    ).code
    // return content;
  } else {
    throw new Error(`File Not Found: ${commonModulePath}.`);
  }
}
