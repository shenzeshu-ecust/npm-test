import axios from 'axios';
import React, { Component } from 'react'

export default class Search extends Component {
    search = () => {
        // 获取用户输入
        const { keyWordElement: { value: keyword } } = this
        // console.log( keyWordElement)  连续解构就取不到 这个了 
        // const { keyWordElement: { value: v } } = this  连续解构+重命名
        // console.log(keyword);
        // --- 请求前  通知App更新状态
        // 已经不是初次载入了，载入开始
        this.props.updateAppState({ isFirst: false, isLoading: true })
        // 发送网络请求
        // http://localhost:3000可以省略，如果此处就是localhost:3000的话
        axios.get(`/api1/search/users?q=${keyword}`).then(
            res => {
                // --- 请求时  通知App更新状态
                // 已经不是初次载入了（不用动），载入结束，users更新
                this.props.updateAppState({ isLoading: false, users: res.data.items })
            },
            err => {
                // --- 请求时  通知App更新状态
                // 错误状态更新,---一定要让isLoading失效！不然卡在loading
                this.props.updateAppState({ isLoading:false,err: err.message })
            }
        )
    }
    render() {
        return (

            <section className="jumbotron">
                <h3 className="jumbotron-heading">Search Github Users</h3>
                <div>
                    <input ref={c => this.keyWordElement = c} type="text" placeholder="enter the name you search" />&nbsp;
                    <button onClick={this.search}>Search</button>
                </div>
            </section>

        )
    }
}
