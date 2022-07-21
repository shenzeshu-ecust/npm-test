import React, { Component } from 'react';
import PubSub from 'pubsub-js'
class List extends Component {
    state = {
        users:[],
        isFirst:true,
        isLoading:false,
        err:''
    }
    componentDidMount() {
        this.token = PubSub.subscribe('atguigu',(msg,data)=> {
            console.log('List 组件收到来自Search的数据了',data);
            this.setState(data)
        })
    }
    componentWillUnmount() {
        PubSub.unsubscribe(this.token)
    }
    render() {
        const {users,isFirst,isLoading,err} = this.state
        return (
            <div className="row">
                {
                    isFirst ? <h2>欢迎使用，请输入关键字，随后点击搜索;</h2> :
                    isLoading ? <h2>Loading ......</h2> :
                    err ? <h2 style={{color:'red'}}>{err}</h2>:
                    users.map(userObj => {
                        return (
                            <div key={userObj.id} className="card">
                                <a rel="noreferer" href="{userObj.html_url}" target="_blank">
                                    <img src={userObj.avatar_url} alt="head_portrait" style={{width:'10px'}} />
                                </a>
                                <p className="card-text">{userObj.login}</p>
                            </div>
                        )
                    })
                }      
            </div>
        );
    }
}

export default List;       