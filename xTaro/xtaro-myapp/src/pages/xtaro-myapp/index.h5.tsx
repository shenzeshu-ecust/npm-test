import React from "react";
import { CustomWrapper, View, Text } from "@ctrip/xtaro-components";
import Style from "./index.module.scss"; // 注意：这里写 import Style from "./index.module.scss"，引入的是"index.module.h5.scss"
import BasePage from "./common/BasePage";

/**
 * 当 H5 场景开发遇到差异性问题时，
 *      可新增 页面入口文件"index.h5.tsx" 和 样式文件"index.module.h5.scss"
 * 在 H5 场景启动时，
 *      会优先使用 "index.h5.tsx", "index.module.h5.scss" 来替代 "index.tsx", "index.module.scss"
 */

class Index extends React.Component {
  componentDidMount() {
    // logRaw()
    console.log('H5');
  }

  componentDidShow() {
    console.log(">>>>>componentDidShow")
  }

  render() {
    return (
      <View className={Style["index"]}>
        <CustomWrapper>
          <Text>Hello, world! H5!</Text>
        </CustomWrapper>
      </View>
    );
  }
}

export default BasePage({})(Index);
