import React, { useEffect } from 'react'
import { useImmerReducer } from 'use-immer'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import Axios from 'axios'
Axios.defaults.baseURL = 'http://localhost:8080'

import StateContext from './StateContext'
import DispatchContext from './DispatchContext'

// Components
import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Home from './components/Home'
import Footer from './components/Footer'
import About from './components/About'
import Terms from './components/Terms'
import CreatePost from './components/CreatePost'
import ViewSinglePost from './components/ViewSinglePost'
import FlashMessages from './components/FlashMessages'
import Profile from './components/Profile'
import EditPost from './components/EditPost'
import NotFound from './components/NotFound'
import Search from './components/Search'
import Chat from './components/Chat'

function Main () {
    const initialState = {
        loggedIn        : Boolean(localStorage.getItem('complexappToken')), // true, if a token exists
        flashMessages   : [],
        user            : {
            token    : localStorage.getItem('complexappToken'),
            username : localStorage.getItem('complexappUsername'),
            avatar   : localStorage.getItem('complexappAvatar'),
        },
        isSearchOpen    : false,
        isChatOpen      : false,
        unreadChatCount : 0,
    }

    // a function to change state
    // you can dispatch from any child component and work will be done here
    // these new objects could also be done using immer
    // immer gets around the problem of having to mutate (copy) state
    // we're using the term draft instead of state, because immer gives us a copy we can use
    // you only have to list the things you are changing, no using rest operator for other parts of the object
    function ourReducer (draft, action) {
        switch (action.type) {
            case 'login':
                draft.loggedIn = true
                draft.user = action.data // save user info
                return
            case 'logout':
                draft.loggedIn = false
                return
            case 'flashMessage':
                draft.flashMessages.push(action.value)
                return
            case 'openSearch':
                draft.isSearchOpen = true
                return
            case 'closeSearch':
                draft.isSearchOpen = false
                return
            case 'toggleChat':
                draft.isChatOpen = !draft.isChatOpen
                return
            case 'closeChat':
                draft.isChatOpen = false
                return
            case 'incrementUnreadChatCount':
                draft.unreadChatCount++
                return
            case 'clearUnreadChatCount':
                draft.unreadChatCount = 0
                return
        }
    }

    // dispatch says what you want to do, the reducer function is where it is done
    // replacing useReducer with useImmerReducer for ease of dealing with copying state
    const [ state, dispatch ] = useImmerReducer(ourReducer, initialState)

    // set user information whenever login state changes to logged in
    useEffect(
        () => {
            if (state.loggedIn) {
                localStorage.setItem('complexappToken', state.user.token)
                localStorage.setItem('complexappUsername', state.user.username)
                localStorage.setItem('complexappAvatar', state.user.avatar)
            } else {
                localStorage.removeItem('complexappToken')
                localStorage.removeItem('complexappUsername')
                localStorage.removeItem('complexappAvatar')
            }
        },
        [ state.loggedIn ],
    )

    // this commented out code was replaced by the reducer
    // if item named complexappToken exists in localStorage, set useState to true, otherwise false
    // const [ loggedIn, setLoggedIn ] = useState(Boolean(localStorage.getItem('complexappToken')))
    // const [ flashMessages, setFlashMessages ] = useState([])

    // function addFlashMessage (msg) {
    //     setFlashMessages((prev) => prev.concat(msg))
    // }

    // check if token has expired on first render
    useEffect(() => {
        // Send Axios request here
        const ourRequest = Axios.CancelToken.source()
        async function fetchResults () {
            try {
                const response = await Axios.post(
                    '/checkToken',
                    { token: state.user.token },
                    { cancelToken: ourRequest.token },
                )
                // if token is no longer valid
                if (!response.data) {
                    dispatch({ type: 'logout' })
                    dispatch({ type: 'flashMessage', value: 'Your session has expired, please log in again.' })
                }
            } catch (e) {
                console.log('There was a problem or the request was canceled.')
            }
        }

        if (state.loggedIn) {
            fetchResults()

            // cleanup function, cancelling the search request
            return () => ourRequest.cancel()
        }
    }, [])

    return (
        // Context is an elegant way to pass data around components

        // the idea with Provider is that any child component will be able to access the value, no matter how far down the tree
        // state and dispatch context providers are separated for performance reasons
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                {/* Router to show page componets based o the url path, using React Router */}
                <BrowserRouter>
                    {/* state. because the state is located in same component, a sub component would use dispatch */}
                    <FlashMessages messages={state.flashMessages} />
                    <Header />
                    <Switch>
                        <Route path='/profile/:username'>
                            <Profile />
                        </Route>
                        {/* Set home component based on whether user is logged in */}
                        <Route path='/' exact>
                            {state.loggedIn ? <Home /> : <HomeGuest />}
                        </Route>
                        {/* :id is like a parameter or variable */}
                        <Route path='/post/:id' exact>
                            <ViewSinglePost />
                        </Route>
                        <Route path='/post/:id/edit' exact>
                            <EditPost />
                        </Route>
                        <Route path='/create-post'>
                            <CreatePost />
                        </Route>
                        <Route path='/about-us'>
                            <About />
                        </Route>
                        <Route path='/terms'>
                            <Terms />
                        </Route>
                        <Route>
                            <NotFound />
                        </Route>
                    </Switch>
                    <CSSTransition timeout={330} in={state.isSearchOpen} classNames='search-overlay' unmountOnExit>
                        <Search />
                    </CSSTransition>
                    <Chat />
                    <Footer />
                </BrowserRouter>
            </DispatchContext.Provider>
        </StateContext.Provider>
    )
}

ReactDOM.render(<Main />, document.querySelector('#app'))

if (module.hot) {
    module.hot.accept()
}
