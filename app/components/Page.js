import React, { useEffect } from 'react'
import Container from './Container'

// On initial page load (useEffect) set the title of page and scroll window to the top
function Page (props) {
    useEffect(
        () => {
            document.title = `${props.title} | ComplexApp`
            window.scrollTo(0, 0)
        },
        [ props.title ],
    )

    return <Container wide={props.wide}>{props.children}</Container>
}

export default Page
