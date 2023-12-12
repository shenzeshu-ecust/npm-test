import React from "react";
import { CustomWrapper, View, Text } from "@ctrip/xtaro-components";
import Style from "./index.module.scss";
import BasePage from "./common/BasePage";

class Index extends React.Component {
  componentDidMount() {
    // logRaw()
    console.log(1111111);
  }

  componentDidShow() {
    console.log(">>>>>componentDidShow")
  }

  render() {
    return (
      <View className={Style["index"]}>
        <CustomWrapper>
          <Text>Hello, world!</Text>
        </CustomWrapper>
      </View>
    );
  }
}

export default BasePage({})(Index);
