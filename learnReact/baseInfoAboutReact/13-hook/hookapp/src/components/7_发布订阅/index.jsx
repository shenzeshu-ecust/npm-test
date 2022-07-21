import React, { Component } from 'react';
import Search from './Search';
import List from './List';
class Demo extends Component {
    render() {
        return (
            <div className="container">
                
                <Search/>
                <List/>
            </div>
        );
    }
}

export default Demo;