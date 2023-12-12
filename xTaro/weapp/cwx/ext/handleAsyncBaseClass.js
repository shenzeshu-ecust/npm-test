import {cwx} from '../cwx.js';

export default class Base {
  constructor(props) {
    let { filePath, func2CheckExist } = props;
    this.filePath = filePath; // '../../commonAPI/cwx.createAntiSpiderRequest.js';
    this.func2CheckExist = func2CheckExist; // 'createAntiSpiderRequest'; // 根据 module 上是否包含这个属性来判断 require 成功与否

    // 初始化
    this.callbackQueue = [];
    this.requiredModule = null; // 确保只会 require 成功一次
    this.isRequiring = false; // 正在引用文件的标志位
    this.requireCount = 0; // 记录 require 次数
  }

  handleRequire() {
    if (!this.isRequiring) {
      this.isRequiring = true;
      this.requireCount++;
      console.log('开始引用模块, requireCount:', this.requireCount);
      let self = this;
      // 改成同步的
      let moduleContent = require('../../commonAPI/cwx.getLocation.js');

      // require('../../commonAPI/cwx.getLocation.js', function (moduleContent) {
        console.log('require 得到的内容:', moduleContent);
        if (moduleContent && moduleContent[self.func2CheckExist]) {
          console.log('require 成功, requireCount:', self.requireCount);
          cwx.sendUbtByPage.ubtDevTrace('wxapp_subpackages_async_success', {
            filePath: self.filePath,
            res: JSON.stringify(Object.keys(moduleContent))
          }); // 分包异步化，跨分包JS代码引用成功
          self.requiredModule = moduleContent;
          console.log('即将 flush 队列中存储的所有方法')
          self.flush();
        } else if (self.requireCount < 2) {
          try {            
            cwx.sendUbtByPage.ubtDevTrace('wxapp_subpackages_async_retry', {
              filePath: self.filePath,
              res: JSON.stringify(moduleContent)
            }); // 分包异步化，跨分包JS代码引用第一次失败，即将重试
          } catch (error) {
            
          }
          console.log('require 文件报错，retry 一次')
          self.isRequiring = false;
          self.handleRequire();
        } else {
          try {
            cwx.sendUbtByPage.ubtDevTrace('wxapp_subpackages_async_fail', {
              filePath: self.filePath,
              res: JSON.stringify(moduleContent)
            }); // 分包异步化，跨分包JS代码引用第二次失败，即将执行fail和complete
          } catch (error) {
            
          }
          console.log('重试还是失败，主动调用 fail 或 complete 方法')
          self.flush();
          self.requireCount = 0;
          self.isRequiring = false;
        }
      // });
    }
  }
  
  handleFunction(type) {
    let args = Array.prototype.slice.call(arguments, 1);
    // 最后一个入参是 object，
    // 值为引用js文件失败时需要执行的 { fail, complete }
    // 如果是 callback ，只需传入 fail 即可
    console.log('调用方法了, type:', type);

    let funcArgs = [];
    let requireFailFuncObj = null;
    if(args.length) {
      funcArgs = args.slice(0, -1);
      requireFailFuncObj = args[args.length - 1];
    }
  
    if (this.requiredModule) {
      console.log('模块已经引用成功，直接调用方法')
      if (typeof this.requiredModule[type] === 'function') {
        this.requiredModule[type](...funcArgs);
      } else {
        console.error(`${type} is not found !!!`);
      }
      return;
    }
  
    console.log('目前模块未引用完成，先把调用内容存起来')
    this.callbackQueue.push({
      type,
      funcArgs,
      requireFailFuncObj
    });
    // console.log(this.callbackQueue)
    this.handleRequire();
  }
  
  flush() {
    // console.log(this.callbackQueue)
    let mirrorQueue = [...this.callbackQueue];
  
    if (this.requiredModule) {
      console.log('引用成功，开始 flush ', mirrorQueue)
      mirrorQueue.forEach(item => {
        let {
          type,
          funcArgs
        } = item;
        this.requiredModule[type](...funcArgs);
        this.removeItem(item);
      })
      console.log('success - flush 后，callbackQueue:', this.callbackQueue);
      return;
    }
  
    console.log('引用失败，开始 flush ', mirrorQueue)
    mirrorQueue.forEach(item => {
      let {
        requireFailFuncObj
      } = item;
      let {
        fail,
        complete
      } = requireFailFuncObj;
      const err = {
        errMsg: `require ${this.filePath} failed`
      };
      fail && fail(err);
      complete && complete(err);
      this.removeItem(item);
    })
    console.log('fail - flush 后，callbackQueue:', this.callbackQueue);
  }
  
  removeItem(item) {
    let index = this.callbackQueue.indexOf(item);
    if (index !== -1) {
      this.callbackQueue.splice(index, 1);
    }
  }
}