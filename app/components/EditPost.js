import React, { useEffect, useContext } from 'react'
import { useImmerReducer } from 'use-immer'
import Page from './Page'
import Axios from 'axios'
import { useParams, Link, withRouter } from 'react-router-dom'
import LoadingDotsIcon from './LoadingDotsIcon'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import NotFound from './NotFound'

function EditPost (props) {
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)

    const originalState = {
        title         : {
            value     : '',
            hasErrors : false,
            message   : '',
        },
        body          : {
            value     : '',
            hasErrors : false,
            message   : '',
        },
        isFetching    : true,
        isSaving      : false,
        id            : useParams().id,
        sendCount     : 0,
        buttonMessage : 'Save Updates',
        notFound      : false,
    }

    function ourReducer (draft, action) {
        switch (action.type) {
            case 'fetchComplete':
                draft.title.value = action.value.title
                draft.body.value = action.value.body
                draft.isFetching = false
                return
            case 'titleChange':
                draft.title.hasErrors = false
                draft.title.value = action.value
                return
            case 'bodyChange':
                draft.body.hasErrors = false
                draft.body.value = action.value
                return
            case 'submitRequest':
                if (!draft.title.hasErrors && !draft.body.hasErrors) {
                    draft.sendCount++
                }
                return
            case 'saveRequestStarted':
                draft.isSaving = true
                draft.buttonMessage = 'Updating...'
                return
            case 'saveRequestFinished':
                draft.isSaving = false
                draft.buttonMessage = 'Save Updates'
                return
            case 'titleRules':
                if (!action.value.trim()) {
                    draft.title.hasErrors = true
                    draft.title.message = 'You must provide a title.'
                }
                return
            case 'bodyRules':
                if (!action.value.trim()) {
                    draft.body.hasErrors = true
                    draft.body.message = 'You must provide body content.'
                }
                return
            case 'notFound':
                draft.notFound = true
                return
        }
    }

    const [ state, dispatch ] = useImmerReducer(ourReducer, originalState) // two inputs for immer, 1) function that serves as reducer, 2) our original state

    // submitRequest hands off to the reducer, but first we make sure we have a title and body content
    function submitHandler (evt) {
        evt.preventDefault()
        dispatch({ type: 'titleRules', value: state.title.value })
        dispatch({ type: 'bodyRules', value: state.body.value })
        dispatch({ type: 'submitRequest' })
    }

    // things to load on initial page load
    useEffect(() => {
        const ourRequest = Axios.CancelToken.source()

        async function fetchPost () {
            try {
                const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token })
                if (response.data) {
                    dispatch({ type: 'fetchComplete', value: response.data })
                    // checking is logged in user is the author of this post. if not tell them they can't update and redirect to home page
                    if (appState.user.username != response.data.author.username) {
                        appDispatch({ type: 'flashMessage', value: 'You do not have permission to edit that post.' })
                        // needed to use withRouter to be able to work with history
                        props.history.push('/')
                    }
                } else {
                    dispatch({ type: 'notFound' })
                }
            } catch (e) {
                console.log('There was a problem or the request was canceled.')
            }
        }
        fetchPost()
        // cleanup function, in this case if the axios request is still running while user switches pages
        return () => {
            ourRequest.cancel()
        }
    }, [])

    // whenever the send button is pressed, sendCount changes, which starts off this process
    // the Axios request is considered a side effect and is better run here than in the reducer
    useEffect(
        () => {
            // run as long as sendCount is greater than zero
            if (state.sendCount) {
                dispatch({ type: 'saveRequestStarted' })
                const ourRequest = Axios.CancelToken.source()

                async function fetchPost () {
                    try {
                        const response = await Axios.post(
                            `/post/${state.id}/edit`,
                            { title: state.title.value, body: state.body.value, token: appState.user.token },
                            { cancelToken: ourRequest.token },
                        )
                        dispatch({ type: 'saveRequestFinished' })
                        appDispatch({ type: 'flashMessage', value: 'Post was updated.' })
                    } catch (e) {
                        console.log('There was a problem or the request was canceled.')
                    }
                }
                fetchPost()
                // cleanup function, in this case if the axios request is still running while user switches pages
                return () => {
                    ourRequest.cancel()
                }
            }
        },
        [ state.sendCount ],
    )

    // Load the Not Found component if no response from the server
    if (state.notFound) {
        return <NotFound />
    }

    if (state.isFetching)
        return (
            <Page title='...'>
                <LoadingDotsIcon />
            </Page>
        )

    return (
        <Page title='Edit Post'>
            <Link to={`/post/${state.id}`} className='small font-weight-bold'>
                &laquo; Back to post
            </Link>
            <form className='mt-3' onSubmit={submitHandler}>
                <div className='form-group'>
                    <label htmlFor='post-title' className='text-muted mb-1'>
                        <small>Title</small>
                    </label>
                    <input
                        value={state.title.value}
                        onChange={(evt) => dispatch({ type: 'titleChange', value: evt.target.value })}
                        onBlur={(evt) => dispatch({ type: 'titleRules', value: evt.target.value })}
                        autoFocus
                        name='title'
                        id='post-title'
                        className='form-control form-control-lg form-control-title'
                        type='text'
                        placeholder=''
                        autoComplete='off'
                    />
                    {/* validation message, only turn on this message when the title errors property is true */}
                    {state.title.hasErrors && (
                        <div className='alert alert-danger small liveValidateMessage'>{state.title.message}</div>
                    )}
                </div>

                <div className='form-group'>
                    <label htmlFor='post-body' className='text-muted mb-1 d-block'>
                        <small>Body Content</small>
                    </label>
                    <textarea
                        value={state.body.value}
                        onChange={(evt) => dispatch({ type: 'bodyChange', value: evt.target.value })}
                        onBlur={(evt) => dispatch({ type: 'bodyRules', value: evt.target.value })}
                        name='body'
                        id='post-body'
                        className='body-content tall-textarea form-control'
                        type='text'
                    />
                    {/* Only turn on this message when the body errors property is true */}
                    {state.body.hasErrors && (
                        <div className='alert alert-danger small liveValidateMessage'>{state.body.message}</div>
                    )}
                </div>

                {/* set disabled property when button saving is set to true */}
                <button className='btn btn-primary' disabled={state.isSaving}>
                    {state.buttonMessage}
                </button>
            </form>
        </Page>
    )
}

export default withRouter(EditPost)
