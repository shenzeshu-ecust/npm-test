import React from "react";
import TaroBase from "../../../taroCwx/base";

export type FPageProps = {
};

/**
 * @name 封装Base.js页面
 */
export default function FPage({}: FPageProps) {
  return function (ConnectComponent: any) {
    return class BaseComponent extends TaroBase {
      private pageRef: any = null;

      // 对xTaro生命周期函数进行封装，并传递至目标页面。
      private handleEvent(eventName: string, object?: any) {
        return this.pageRef && this.pageRef[eventName] && this.pageRef[eventName](object);
      }

      // 对`componentDidShow`生命周期方法进行封装，根据需求可以进一步封装其他生命周期方法。
      componentDidShow() {
        this.handleEvent('componentDidShow')
      }

      componentDidHide() {
        this.handleEvent('componentDidHide')
      }

      render() {
        // 可在这添加Provider
        return <ConnectComponent ref={(ref) => this.pageRef = ref} {...this.props} />;
      }
    };
  };
}
