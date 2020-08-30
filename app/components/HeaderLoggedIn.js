import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import DispatchContext from '../DispatchContext'
import StateContext from '../StateContext'
import ReactTooltip from 'react-tooltip'

function HeaderLoggedIn () {
    const appDispatch = useContext(DispatchContext)
    const appState = useContext(StateContext)

    // when we log out, set logged in status to false and remove items from localStorage
    function handleLogout () {
        appDispatch({ type: 'logout' })
        appDispatch({ type: 'flashMessage', value: 'You have successfully logged out.' })
    }

    function handleSearchIcon (evt) {
        evt.preventDefault()
        appDispatch({ type: 'openSearch' })
    }

    return (
        <div className='flex-row my-3 my-md-0'>
            <a
                data-for='search'
                data-tip='Search'
                onClick={handleSearchIcon}
                href='#'
                className='text-white mr-2 header-search-icon'
            >
                <i className='fas fa-search' />
            </a>
            <ReactTooltip place='bottom' id='search' className='custom-tooltip' />{' '}
            {/* set the background color class name based on unread message or not */}
            <span
                onClick={() => appDispatch({ type: 'toggleChat' })}
                data-for='chat'
                data-tip='Chat'
                className={'mr-2 header-chat-icon ' + (appState.unreadChatCount ? 'text-danger' : 'text-white')}
            >
                <i className='fas fa-comment' />
                {appState.unreadChatCount ? (
                    <span className='chat-count-badge text-white'>
                        {appState.unreadChatCount < 10 ? appState.unreadChatCount : '9+'}
                    </span>
                ) : (
                    ''
                )}
            </span>
            <ReactTooltip place='bottom' id='chat' className='custom-tooltip' />{' '}
            <Link data-for='profile' data-tip='My Profile' to={`/profile/${appState.user.username}`} className='mr-2'>
                {/* set avatar to what is stored in localStorage */}
                <img className='small-header-avatar' src={appState.user.avatar} />
            </Link>
            <ReactTooltip place='bottom' id='profile' className='custom-tooltip' />{' '}
            <Link className='btn btn-sm btn-success mr-2' to='/create-post'>
                Create Post
            </Link>
            {/* taking the LoggedIn prop and setting it to false and removing associated items from localStorage */}{' '}
            <button onClick={handleLogout} className='btn btn-sm btn-secondary'>
                Sign Out
            </button>
        </div>
    )
}

export default HeaderLoggedIn
