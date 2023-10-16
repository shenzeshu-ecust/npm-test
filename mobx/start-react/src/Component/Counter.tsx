import React from 'react'
export const MyComponent: React.FC = (props) => {
    return (
        <span>
            { props.children }
        </span>
    )
}