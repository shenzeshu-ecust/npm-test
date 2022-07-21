import React, { Component } from 'react'
import './index.css'
import PubSub from 'pubsub-js'

export default class List extends Component {
    // 初始化状态
    state = {
        users: [],
        isFirst: true, // 是否第一次打开页面
        isLoading: false, // 标识是否处于加载中
        err: '', // 存储错误信息
    }
    componentDidMount() {
        this.token = PubSub.subscribe('atguigu', (msg, data) => {
            this.setState(data)
        })
    }
    componentWillUnmount() {
        PubSub.unsubscribe(this.token)
    }
    render() {
        const { users, isFirst, isLoading, err } = this.state
        return (
            <div className="row">
                {
                    isFirst ? <h2>欢迎使用！搜索框输入用户信息</h2> : isLoading ? <h2> loading... </h2> :
                        err ? <h2 style={{ color: 'red' }}>{err}</h2> :
                            users.map(user => {
                                return (
                                    <div className="card" key={user.id}>
                                        <a href={user.html_url} target="_blank" rel='noreferrer'>
                                            <img alt='avatar' src={user.avatar_url} style={{ width: '100px' }} />
                                        </a>
                                        <p className="card-text">{user.login}</p>
                                    </div>
                                )
                            })
                }


            </div>

        )
    }
}
