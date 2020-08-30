import React, { useEffect, useContext } from 'react'
import Page from './Page'
import Axios from 'axios'
import { useImmerReducer } from 'use-immer'
import { CSSTransition } from 'react-transition-group' // to slide error messages in gracefully
import DispatchContext from '../DispatchContext'

function HomeGuest () {
    const appDispatch = useContext(DispatchContext)

    // creating initial state
    const initialState = {
        username    : {
            value      : '',
            hasErrors  : false,
            message    : '',
            isUnique   : false,
            checkCount : 0,
        },
        email       : {
            value      : '',
            hasErrors  : false,
            message    : '',
            isUnique   : false,
            checkCount : 0,
        },
        password    : {
            value     : '',
            hasErrors : false,
            message   : '',
        },
        submitCount : 0,
    }

    function ourReducer (draft, action) {
        switch (action.type) {
            case 'usernameImmediately':
                draft.username.hasErrors = false
                draft.username.value = action.value
                if (draft.username.value.length > 15) {
                    draft.username.hasErrors = true
                    draft.username.message = 'Username cannot exceed 15 characters.'
                }
                if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
                    draft.username.hasErrors = true
                    draft.username.message = 'Username can only contain letters and numbers.'
                }
                return
            case 'usernameAfterDelay':
                if (draft.username.value.length < 3) {
                    draft.username.hasErrors = true
                    draft.username.message = 'Username must be at least 3 characters.'
                }
                if (!draft.hasErrors && !action.noRequest) {
                    draft.username.checkCount++
                }
                return
            case 'usernameUniqueResults':
                {
                    /* this is true if seaching the server found the user name already is there */
                }
                if (action.value) {
                    draft.username.hasErrors = true
                    draft.username.isUnique = false
                    draft.username.message = 'That username is already taken.'
                } else {
                    draft.username.isUnique = true
                }
                return
            case 'emailImmediately':
                draft.email.hasErrors = false
                draft.email.value = action.value
                return
            case 'emailAfterDelay':
                if (!/^\S+@\S+$/.test(draft.email.value)) {
                    draft.email.hasErrors = true
                    draft.email.message = 'You must provide a valid email address.'
                }
                if (!draft.email.hasErrors && !action.noRequest) {
                    draft.email.checkCount++
                }
                return
            case 'emailUniqueResults':
                if (action.value) {
                    draft.email.hasErrors = true
                    draft.email.isUnique = false
                    draft.email.message = 'That email is already being used.'
                } else {
                    draft.email.isUnique = true
                }
                return
            case 'passwordImmediately':
                draft.password.hasErrors = false
                draft.password.value = action.value
                if (draft.password.value.length > 50) {
                    draft.password.hasErrors = true
                    draft.password.message = 'Password cannot exceed 50 characters.'
                }
                return
            case 'passwordAfterDelay':
                if (draft.password.value.length < 12) {
                    draft.password.hasErrors = true
                    draft.password.message = 'Password must be at least 12 characters.'
                }
                return
            case 'submitForm':
                if (
                    !draft.username.hasErrors &&
                    draft.username.isUnique &&
                    !draft.email.hasErrors &&
                    draft.email.isUnique &&
                    !draft.password.hasErrors
                ) {
                    draft.submitCount++
                }
                return
        }
    }

    const [ state, dispatch ] = useImmerReducer(ourReducer, initialState)

    // run the usernameAfterDelay action if setTimeout in the field reaches 800ms
    useEffect(
        () => {
            if (state.username.value) {
                const delay = setTimeout(() => dispatch({ type: 'usernameAfterDelay' }), 800)

                // cleanup function
                return () => clearTimeout(delay)
            }
        },
        [ state.username.value ],
    )

    // run the emailAfterDelay action if setTimeout in the field reaches 800ms
    useEffect(
        () => {
            if (state.email.value) {
                const delay = setTimeout(() => dispatch({ type: 'emailAfterDelay' }), 800)

                // cleanup function
                return () => clearTimeout(delay)
            }
        },
        [ state.email.value ],
    )

    // run the passwordAfterDelay action if setTimeout in the field reaches 800ms
    useEffect(
        () => {
            if (state.password.value) {
                const delay = setTimeout(() => dispatch({ type: 'passwordAfterDelay' }), 800)

                // cleanup function
                return () => clearTimeout(delay)
            }
        },
        [ state.password.value ],
    )

    // run when entering usernames that don't produce errors already
    // check the server to see if username is already chosen
    useEffect(
        () => {
            // Send Axios request here
            const ourRequest = Axios.CancelToken.source()
            async function fetchResults () {
                try {
                    const response = await Axios.post(
                        '/doesUsernameExist',
                        { username: state.username.value },
                        { cancelToken: ourRequest.token },
                    )
                    dispatch({ type: 'usernameUniqueResults', value: response.data })
                } catch (e) {
                    console.log('There was a problem or the request was canceled.')
                }
            }

            if (state.username.checkCount) {
                fetchResults()

                // cleanup function, cancelling the find username request
                return () => ourRequest.cancel()
            }
        },
        [ state.username.checkCount ],
    )

    useEffect(
        () => {
            // Send Axios request here
            const ourRequest = Axios.CancelToken.source()
            async function fetchResults () {
                try {
                    const response = await Axios.post(
                        '/doesEmailExist',
                        { email: state.email.value },
                        { cancelToken: ourRequest.token },
                    )
                    dispatch({ type: 'emailUniqueResults', value: response.data })
                } catch (e) {
                    console.log('There was a problem or the request was canceled.')
                }
            }

            if (state.email.checkCount) {
                fetchResults()

                // cleanup function, cancelling the find username request
                return () => ourRequest.cancel()
            }
        },
        [ state.email.checkCount ],
    )

    // submit the create user form
    // and if successful, log the user in and send them a flash message welcoming them
    useEffect(
        () => {
            // Send Axios request here
            const ourRequest = Axios.CancelToken.source()
            async function fetchResults () {
                try {
                    const response = await Axios.post(
                        '/Register',
                        { username: state.username.value, email: state.email.value, password: state.password.value },
                        { cancelToken: ourRequest.token },
                    )
                    appDispatch({ type: 'login', data: response.data })
                    appDispatch({ type: 'flashMessage', value: 'Congrats! Welcome to your new account.' })
                } catch (e) {
                    console.log('There was a problem or the request was canceled.')
                }
            }

            if (state.submitCount) {
                fetchResults()

                // cleanup function, cancelling the find username request
                return () => ourRequest.cancel()
            }
        },
        [ state.submitCount ],
    )

    // the full post url is http://localhost:8080/register
    //   fixed with Axios.defaults.baseURL = 'http://localhost:8080' in main.js
    async function handleSubmit (evt) {
        evt.preventDefault()
        dispatch({ type: 'usernameImmediately', value: state.username.value })
        dispatch({ type: 'usernameAfterDelay', value: state.username.value, noRequest: true })
        dispatch({ type: 'emailImmediately', value: state.email.value })
        dispatch({ type: 'emailAfterDelay', value: state.email.value, noRequest: true })
        dispatch({ type: 'passwordImmediately', value: state.password.value })
        dispatch({ type: 'passwordAfterDelay', value: state.password.value })
        dispatch({ type: 'submitForm' })
    }

    // for the home page, Container component is sending a prop of wide=true for this rendering of it
    return (
        <Page title='Welcome!' wide={true}>
            <div className='row align-items-center'>
                <div className='col-lg-7 py-3 py-md-5'>
                    <h1 className='display-3'>Remember Writing?</h1>
                    <p className='lead text-muted'>
                        Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of
                        the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to
                        enjoying the internet again.
                    </p>
                </div>
                <div className='col-lg-5 pl-lg-5 pb-3 py-lg-5'>
                    <form onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label htmlFor='username-register' className='text-muted mb-1'>
                                <small>Username</small>
                            </label>
                            {/* as user enters data, follow actions of usernameImmediately */}
                            <input
                                onChange={(evt) => dispatch({ type: 'usernameImmediately', value: evt.target.value })}
                                id='username-register'
                                name='username'
                                className='form-control'
                                type='text'
                                placeholder='Pick a username'
                                autoComplete='off'
                            />
                            {/* if there are errors, use this CSS Transition to show them to the user */}
                            <CSSTransition
                                in={state.username.hasErrors}
                                timeout={330}
                                classNames='liveValidateMessage'
                                unmountOnExit
                            >
                                <div className='alert alert-danger small liveValidateMessage'>
                                    {state.username.message}
                                </div>
                            </CSSTransition>
                        </div>
                        <div className='form-group'>
                            <label htmlFor='email-register' className='text-muted mb-1'>
                                <small>Email</small>
                            </label>
                            <input
                                onChange={(evt) => dispatch({ type: 'emailImmediately', value: evt.target.value })}
                                id='email-register'
                                name='email'
                                className='form-control'
                                type='text'
                                placeholder='you@example.com'
                                autoComplete='off'
                            />
                            {/* if there are errors, use this CSS Transition to show them to the user */}
                            <CSSTransition
                                in={state.email.hasErrors}
                                timeout={330}
                                classNames='liveValidateMessage'
                                unmountOnExit
                            >
                                <div className='alert alert-danger small liveValidateMessage'>
                                    {state.email.message}
                                </div>
                            </CSSTransition>
                        </div>
                        <div className='form-group'>
                            <label htmlFor='password-register' className='text-muted mb-1'>
                                <small>Password</small>
                            </label>
                            <input
                                onChange={(evt) => dispatch({ type: 'passwordImmediately', value: evt.target.value })}
                                id='password-register'
                                name='password'
                                className='form-control'
                                type='password'
                                placeholder='Create a password'
                            />
                            {/* if there are errors, use this CSS Transition to show them to the user */}
                            <CSSTransition
                                in={state.password.hasErrors}
                                timeout={330}
                                classNames='liveValidateMessage'
                                unmountOnExit
                            >
                                <div className='alert alert-danger small liveValidateMessage'>
                                    {state.password.message}
                                </div>
                            </CSSTransition>
                        </div>
                        <button type='submit' className='py-3 mt-4 btn btn-lg btn-success btn-block'>
                            Sign up for ComplexApp
                        </button>
                    </form>
                </div>
            </div>
        </Page>
    )
}

export default HomeGuest
