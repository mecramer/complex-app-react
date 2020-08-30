import React from 'react'

function Container (props) {
    // adding classes of 'container py-md-5 for all
    // then running ternary operator to add class of container-narrow if the wide prop is not set to true
    // if you check HomeGuest.js, you'll see the wide prop is set to true for that page, preventing the narrow class application
    return <div className={'container py-md-5 ' + (props.wide ? '' : 'container--narrow')}>{props.children}</div>
}

export default Container
