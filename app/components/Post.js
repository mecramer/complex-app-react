import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

function Post (props) {
    const date = new Date(props.post.createdDate)
    const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

    return (
        <Link to={`/post/${props.post._id}`} onClick={props.onClick} className='list-group-item list-group-item-action'>
            <img className='avatar-tiny' src={props.post.author.avatar} /> <strong>{props.post.title} </strong>
            <span className='text-muted small'>
                {!props.noAuthor && <React.Fragment>by {props.post.author.username}</React.Fragment>} on {dateFormatted}
            </span>
        </Link>
    )
}

Post.propTypes = {
    post     : PropTypes.object,
    onClick  : PropTypes.func,
    noAuthor : PropTypes.bool,
    author   : PropTypes.string,
    username : PropTypes.string,
}

export default Post
