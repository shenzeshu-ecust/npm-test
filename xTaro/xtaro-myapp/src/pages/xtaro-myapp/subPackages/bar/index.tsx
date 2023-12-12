import React, { Component } from "react";
import { View, Text } from "@tarojs/components";
import { printCommon } from "../common";
import { printTool } from "../common/tools";
import BasePage from "../../common/BasePage";

class Index extends Component {
  componentDidMount() {
    printCommon();
    printTool();
  }

  render() {
    return (
      <View className="index">
        <Text>Page bar</Text>
      </View>
    );
  }
}

export default BasePage({})(Index);
