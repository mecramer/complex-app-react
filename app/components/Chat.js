import React, { useContext, useEffect, useRef } from 'react'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import { useImmer } from 'use-immer'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'

function Chat () {
    const socket = useRef(null)
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)
    const chatField = useRef(null) // unlike state, ref can be directly mutated
    const chatLog = useRef(null)
    const [ state, setState ] = useImmer({
        fieldValue   : '',
        chatMessages : [],
    })

    // run this code whenever is chat window opens
    // here, we want to focus the input field for the chat window
    // using a Ref to do the focusing
    // also when chat window opens, reset the unread chat message count to 0
    useEffect(
        () => {
            if (appState.isChatOpen) {
                chatField.current.focus()
                appDispatch({ type: 'clearUnreadChatCount' })
            }
        },
        [ appState.isChatOpen ],
    )

    // get messages from server
    // run the function whenever this happens, adding the message to the state item chatMessages
    // we are also opening and closing socket when this component mounts/unmounts
    useEffect(() => {
        socket.current = io('http://localhost:8080') // this establishes an ongoing connection with browser and server

        socket.current.on('chatFromServer', (message) => {
            setState((draft) => {
                draft.chatMessages.push(message)
            })
        })

        // cleanup function
        return () => socket.current.disconnect()
    }, [])

    // anytime there is a new chat message, scroll to bottom of window
    // also run the action for increment count if the window is closed and unread chat messages is 1 or more
    useEffect(
        () => {
            chatLog.current.scrollTop = chatLog.current.scrollHeight
            if (state.chatMessages.length && !appState.isChatOpen) {
                appDispatch({ type: 'incrementUnreadChatCount' })
            }
        },
        [ state.chatMessages ],
    )

    // sometimes target.value doesn't work a level down, so creating it on top and assigning it for use
    function handleFieldChange (evt) {
        const value = evt.target.value

        setState((draft) => {
            draft.fieldValue = value
        })
    }

    // handle message holding on server and internal state and empty chat messages field value when hitting enter
    function handleSubmit (evt) {
        evt.preventDefault()
        // send message to chat server
        // for two way communication, axios doesn't work, so we use socket.io
        // chatFromBrowser is a server side setup
        // the server needs a token to be able to trust us
        socket.current.emit('chatFromBrowser', { message: state.fieldValue, token: appState.user.token })

        setState((draft) => {
            // add message to state collection of messages
            draft.chatMessages.push({
                message  : draft.fieldValue,
                username : appState.user.username,
                avatar   : appState.user.avatar,
            })
            draft.fieldValue = ''
        })
    }

    return (
        // Add the visible class is chat open state is set to true
        <div
            id='chat-wrapper'
            className={
                'chat-wrapper shadow border-top border-left border-right ' +
                (appState.isChatOpen ? 'chat-wrapper--is-visible' : '')
            }
        >
            <div className='chat-title-bar bg-primary'>
                Chat
                <span onClick={() => appDispatch({ type: 'closeChat' })} className='chat-title-bar-close'>
                    <i className='fas fa-times-circle' />
                </span>
            </div>
            <div id='chat' className='chat-log' ref={chatLog}>
                {/* map through the messages printing message and avatar of user */}
                {state.chatMessages.map((message, index) => {
                    if (message.username == appState.user.username) {
                        return (
                            <div key={index} className='chat-self'>
                                <div className='chat-message'>
                                    <div className='chat-message-inner'>{message.message}</div>
                                </div>
                                <img className='chat-avatar avatar-tiny' src={message.avatar} />
                            </div>
                        )
                    }

                    return (
                        <div key={index} className='chat-other'>
                            <Link to={`/profile/${message.username}`}>
                                <img className='avatar-tiny' src={message.avatar} />
                            </Link>
                            <div className='chat-message'>
                                <div className='chat-message-inner'>
                                    <Link to={`/profile/${message.username}`}>
                                        <strong>{message.username}: </strong>
                                    </Link>
                                    {message.message}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <form onSubmit={handleSubmit} id='chatForm' className='chat-form border-top'>
                <input
                    type='text'
                    value={state.fieldValue}
                    onChange={handleFieldChange}
                    ref={chatField}
                    className='chat-field'
                    id='chatField'
                    placeholder='Type a message…'
                    autoComplete='off'
                />
            </form>
        </div>
    )
}

export default Chat
