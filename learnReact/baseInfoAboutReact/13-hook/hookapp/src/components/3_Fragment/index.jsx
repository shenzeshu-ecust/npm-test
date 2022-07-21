import React, { Component ,Fragment} from 'react';

class Demo extends Component {
    render() {
        return (
            <Fragment key="1">
                <input type="text" />
            </Fragment>
            // 或者<></>  不用key的时候
        );
    }
}

export default Demo;