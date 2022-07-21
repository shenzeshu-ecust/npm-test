import React, { Component } from 'react';
import PubSub from 'pubsub-js';
// import axios from 'axios'
class Search extends Component {
    search = ()=> {
        console.log('Search发布消息了');
        PubSub.publish('atguigu',{isFirst:false,isLoading:true})
    }
    render() {
        return (
            <div>
                <h3>搜索github用户</h3>
                <input type="text" />
                <button onClick={this.search}>搜索</button>
            </div>
        );
    }
}

export default Search;