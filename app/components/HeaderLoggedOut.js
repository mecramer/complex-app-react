import React, { useState, useContext } from 'react'
import Axios from 'axios'
import DispatchContext from '../DispatchContext'

function HeaderLoggedOut () {
    const appDispatch = useContext(DispatchContext)
    const [ username, setUsername ] = useState()
    const [ password, setPassword ] = useState()

    // submit login info, assign response to variable, response and check if the response comes back positive
    // bad login info returns false, server setting
    // if false, return message that it is incorrect
    async function handleSubmit (e) {
        e.preventDefault()
        try {
            // /login is short for https://localhost:8080/login
            //   fixed with Axios.defaults.baseURL = 'http://localhost:8080' in main.js
            const response = await Axios.post('/login', { username, password })
            // if db returns a response, set state using appDispatch
            // and change setLogged in to true and send the user data to dispatch
            if (response.data) {
                appDispatch({ type: 'login', data: response.data })
                appDispatch({ type: 'flashMessage', value: 'You have successfully logged in.' })
            } else {
                console.log('Incorrect user name or password')
                appDispatch({ type: 'flashMessage', value: 'Invalid username / password.' })
            }
        } catch (e) {
            console.log('There was a problem.')
        }
    }

    return (
        <form onSubmit={handleSubmit} className='mb-0 pt-2 pt-md-0'>
            <div className='row align-items-center'>
                <div className='col-md mr-0 pr-md-0 mb-3 mb-md-0'>
                    <input
                        onChange={(e) => setUsername(e.target.value)}
                        name='username'
                        className='form-control form-control-sm input-dark'
                        type='text'
                        placeholder='Username'
                        autoComplete='off'
                    />
                </div>
                <div className='col-md mr-0 pr-md-0 mb-3 mb-md-0'>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        name='password'
                        className='form-control form-control-sm input-dark'
                        type='password'
                        placeholder='Password'
                    />
                </div>
                <div className='col-md-auto'>
                    <button className='btn btn-success btn-sm'>Sign In</button>
                </div>
            </div>
        </form>
    )
}

export default HeaderLoggedOut
