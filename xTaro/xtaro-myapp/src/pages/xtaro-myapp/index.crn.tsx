import React from "react";
import { CustomWrapper, View, Text } from "@ctrip/xtaro-components";
import Style from "./index.module.scss"; // 注意：这里写 import Style from "./index.module.scss"，引入的是"index.module.crn.scss"
import BasePage from "./common/BasePage";

/**
 * 当 CRN 场景开发遇到差异性问题时，
 *      可新增 页面入口文件"index.crn.tsx" 和 样式文件"index.module.crn.scss"
 * 在 CRN 场景启动时，
 *      会优先使用 "index.crn.tsx", "index.module.crn.scss" 来替代 "index.tsx", "index.module.scss"
 */

class Index extends React.Component {
  componentDidMount() {
    // logRaw()
    console.log('CRN');
  }

  componentDidShow() {
    console.log(">>>>>componentDidShow")
  }

  render() {
    return (
      <View className={Style["index"]}>
        <CustomWrapper>
          <Text className={Style["text"]}>Now is CRN!</Text>
        </CustomWrapper>
      </View>
    );
  }
}

export default BasePage({})(Index);
