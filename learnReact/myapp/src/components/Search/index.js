import React, { Component } from 'react'
import PubSub from 'pubsub-js'
import axios from 'axios';

export default class Search extends Component {
     search = async () => {
        // 获取用户输入
        const { keyWordElement: { value: keyword } } = this
        // console.log( keyWordElement)  连续解构就取不到 这个了 
        // const { keyWordElement: { value: v } } = this  连续解构+重命名
        // console.log(keyword);
        // --- 请求前  通知App更新状态
        // 已经不是初次载入了，载入开始
        /* this.props.updateAppState({ isFirst: false, isLoading: true }) */
        PubSub.publish('atguigu', { isFirst: false, isLoading: true })
        // 发送网络请求
        // http://localhost:3000可以省略，如果此处就是localhost:3000的话

        // fetch  未优化 版本
        // fetch(`/api1/search/users?q=${keyword}`).then(
        //     // response.json() 获取数据。是一个promise对象
        //     response => {
        //         console.log('联系服务器成功', response, response.json());
        //         return response.json()
        //     },
        //     error => {console.log('联系服务器失败',error);
        //     return new Promise(()=>{})  // 防止进下一个then
        // }

        // ).then(
        //     res => {
        //         console.log('获取数据成功');
        //     },
        // err => {
        //     console.log('获取数据失败');
        // }
        // )
        // fetch  优化版本
        // fetch(`/api1/search/users?q=${keyword}`).then(
        //     // response.json() 获取数据。是一个promise对象
        //     response => {
        //         console.log('联系服务器成功', response, response.json());
        //         return response.json()},
        // ).then(
        //     res => {
        //         console.log('获取数据成功');
        //     },
        // ).catch(err => {
        //     console.log(err);
        // }) 

        // fetch  更优化版本
        try {
            const res = await fetch(`/api1/search/users?q=${keyword}`)
            const data = await res.json()
            // console.log(data);
            PubSub.publish('atguigu', { isLoading: false, users: data })
        } catch (error) {
            console.log(error);
            PubSub.publish('atguigu', { isLoading: false, err: error.message })
        }

        //#region 使用axios发送请求
        // axios.get(`/api1/search/users?q=${keyword}`).then(
        //     res => {
        //         // --- 请求时  通知App更新状态
        //         // 已经不是初次载入了（不用动），载入结束，users更新
        //         /* this.props.updateAppState({ isLoading: false, users: res.data.items }) */
        //         PubSub.publish('atguigu', { isLoading: false, users: res.data.items })

        //     },
        //     err => {
        //         // --- 请求时  通知App更新状态
        //         // 错误状态更新,---一定要让isLoading失效！不然卡在loading
        //         /* this.props.updateAppState({ isLoading:false,err: err.message }) */
        //         PubSub.publish('atguigu', { isLoading: false, err: err.message })

        //     }
        // )
        //#endregion
    }
    render() {
        // const p1 = new Promise((resolve, reject) => {
        //     resolve('foo')
        // }).then(value => 'bar').then(v => console.log(v))
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
