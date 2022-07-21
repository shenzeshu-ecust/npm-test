import React, { Component } from 'react'
import { nanoid } from 'nanoid';
import { connect } from 'react-redux';
import { createAddPersonAction } from '../../redux/actions/person';
class Person extends Component {
    addOwner = () => {
        const name = this.nameNode.value
        const age = this.ageNode.value
        // 这里采用nanoid生成唯一id
        const personObj = { id: nanoid(), name, age }
        // console.log(personObj);
        this.props.jiayiren(personObj)
        this.nameNode.value = ''
        this.ageNode.value = ''
    }
    render() {
        console.log('+++', this.props);
        return (
            <div>
                <h2 style={{ color: "cadetblue", borderBottom: "1px #ccc solid" }}>Person组件</h2>
                <h4>person组件里获取的Count组件中求和结果为: {this.props.he}</h4>
                <input ref={c => this.nameNode = c} type="text" placeholder="请输入名字" style={{ margin: "0 10px", borderRadius: "5px", outline: "none", border: "1px solid #ccc" }} />
                <input ref={c => this.ageNode = c} type="text" placeholder="请输入年龄" style={{ margin: "0 10px", borderRadius: "5px", outline: "none", border: "1px solid #ccc" }} />
                <button onClick={this.addOwner}>添加用户</button>
                <ul style={{ listStyle: 'none', borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
                    {
                        this.props.yiduiren.map(p => {
                            return (<li key={p.id}>名字: {p.name} --- 年龄: {p.age}</li>)
                        })
                    }
                </ul>
            </div>
        )
    }
}

export default connect(
    state => ({ yiduiren: state.persons, he: state.count }),
    { jiayiren: createAddPersonAction }
)(Person)