import React from 'react';
import TaroBase from '../../taroCwx/base'
import { CustomWrapper, View, Text } from '@tarojs/components';

export default class Index extends TaroBase {
  componentDidMount () {
  }
	render() {
		return (
			<View className="index">
				<CustomWrapper>
					<Text>Hello, mainPage!</Text>
				</CustomWrapper>
			</View>
		);
	}
}
