import React, { useState, useContext } from 'react'
import Page from './Page'
import Axios from 'axios'
import { withRouter } from 'react-router-dom'
import DispatchContext from '../DispatchContext'
import StateContext from '../StateContext'

function CreatePost (props) {
    // put the title and body in state
    const [ title, setTitle ] = useState()
    const [ body, setBody ] = useState()
    const appDispatch = useContext(DispatchContext)
    const appState = useContext(StateContext)

    // when submit button is hit, use Axios to send data to Mongodb
    async function handleSubmit (evt) {
        evt.preventDefault()
        try {
            // we send 3 things to the db, title, text and a token for confirmation we are with rights to change db
            // we get the token from localStorage
            // full url is http://localhost:8080/create-post
            //   fixed with Axios.defaults.baseURL = 'http://localhost:8080' in main.js
            const response = await Axios.post('/create-post', {
                title : title,
                body  : body,
                token : appState.user.token,
            })
            appDispatch({ type: 'flashMessage', value: 'Congratulations, you created a new post!' })
            // Redirect to new post url
            // data is the response coming back from the server to the post, its a unique ID
            props.history.push(`/post/${response.data}`)
            console.log('new post was created')
        } catch (e) {
            console.log('There was a problem.')
        }
    }

    return (
        <Page title='Create New Post'>
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label htmlFor='post-title' className='text-muted mb-1'>
                        <small>Title</small>
                    </label>
                    <input
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        name='title'
                        id='post-title'
                        className='form-control form-control-lg form-control-title'
                        type='text'
                        placeholder=''
                        autoComplete='off'
                    />
                </div>

                <div className='form-group'>
                    <label htmlFor='post-body' className='text-muted mb-1 d-block'>
                        <small>Body Content</small>
                    </label>
                    <textarea
                        onChange={(e) => setBody(e.target.value)}
                        name='body'
                        id='post-body'
                        className='body-content tall-textarea form-control'
                        type='text'
                    />
                </div>

                <button className='btn btn-primary'>Save New Post</button>
            </form>
        </Page>
    )
}

// with router allow you to send information to the component
// for instance, we are sending the id of the blog page with history.push
export default withRouter(CreatePost)
