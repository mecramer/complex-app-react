import React, { useEffect, useContext } from 'react'
import Page from './Page'
import { useParams, NavLink, Switch, Route } from 'react-router-dom' // used to work with the url
import Axios from 'axios'
import StateContext from '../StateContext'
import ProfilePosts from './ProfilePosts'
import ProfileFollowers from './ProfileFollowers'
import ProfileFollowing from './ProfileFollowing'
import { useImmer } from 'use-immer'

function Profile () {
    const { username } = useParams()
    const appState = useContext(StateContext)
    const [ state, setState ] = useImmer({
        followActionLoading        : false,
        startFollowingRequestCount : 0,
        stopFollowingRequestCount  : 0,
        profileData                : {
            profileUsername : '...',
            profileAvatar   : 'https://gravatar.com/avatar/placeholder?s=128',
            isFollowing     : false,
            counts          : { postCount: '', followerCount: '', followingCount: '' },
        },
    })

    // we only want this data when the page first loads
    useEffect(
        () => {
            const ourRequest = Axios.CancelToken.source()

            async function fetchData () {
                try {
                    const response = await Axios.post(
                        `/profile/${username}`,
                        { token: appState.user.token },
                        { cancelToken: ourRequest.token },
                    )

                    setState((draft) => {
                        draft.profileData = response.data
                    })
                } catch (e) {
                    console.log('There was a problem')
                }
            }
            fetchData()

            // cleanup function, in this case if the axios request is still running while user switches pages
            return () => {
                ourRequest.cancel()
            }
        },
        [ username ],
    )

    // what happens when you click on the follow button
    useEffect(
        () => {
            async function fetchData () {
                try {
                    await Axios.post(`/addFollow/${state.profileData.profileUsername}`, {
                        token : appState.user.token,
                    })
                    setState((draft) => {
                        draft.profileData.isFollowing = true
                        draft.profileData.counts.followerCount++
                        draft.followActionLoading = false
                    })
                } catch (e) {
                    console.log('There was a problem')
                }
            }

            if (state.startFollowingRequestCount) {
                setState((draft) => {
                    draft.followActionLoading = true
                })
                const ourRequest = Axios.CancelToken.source()

                fetchData()

                // cleanup function, in this case if the axios request is still running while user switches pages
                return () => {
                    ourRequest.cancel()
                }
            }
        },
        [ state.startFollowingRequestCount ],
    )

    // what happens when you click on the stop following button
    useEffect(
        () => {
            async function fetchData () {
                try {
                    await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, {
                        token : appState.user.token,
                    })
                    setState((draft) => {
                        draft.profileData.isFollowing = false
                        draft.profileData.counts.followerCount--
                        draft.followActionLoading = false
                    })
                } catch (e) {
                    console.log('There was a problem')
                }
            }

            if (state.stopFollowingRequestCount) {
                setState((draft) => {
                    draft.followActionLoading = true
                })
                const ourRequest = Axios.CancelToken.source()

                fetchData()

                // cleanup function, in this case if the axios request is still running while user switches pages
                return () => {
                    ourRequest.cancel()
                }
            }
        },
        [ state.stopFollowingRequestCount ],
    )

    function startFollowing () {
        setState((draft) => {
            draft.startFollowingRequestCount++
        })
    }

    function stopFollowing () {
        setState((draft) => {
            draft.stopFollowingRequestCount++
        })
    }

    return (
        <Page title='My Profile'>
            <h2>
                <img className='avatar-small' src={state.profileData.profileAvatar} />{' '}
                {state.profileData.profileUsername}
                {/* Only show Follow button if user is logged in, is not already following, is not looking at their own profile, and profile is not loading */}
                {appState.loggedIn &&
                !state.profileData.isFollowing &&
                appState.user.username != state.profileData.profileUsername &&
                state.profileData.profileUsername != '...' && (
                    <button
                        className='btn btn-primary btn-sm ml-2'
                        disabled={state.followActionLoading}
                        onClick={startFollowing}
                    >
                        Follow <i className='fas fa-user-plus' />
                    </button>
                )}
                {appState.loggedIn &&
                state.profileData.isFollowing &&
                appState.user.username != state.profileData.profileUsername &&
                state.profileData.profileUsername != '...' && (
                    <button
                        className='btn btn-danger btn-sm ml-2'
                        disabled={state.followActionLoading}
                        onClick={stopFollowing}
                    >
                        Stop Following <i className='fas fa-user-times' />
                    </button>
                )}
            </h2>

            <div className='profile-nav nav nav-tabs pt-2 mb-4'>
                <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className='nav-item nav-link'>
                    Posts: {state.profileData.counts.postCount}
                </NavLink>
                <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className='nav-item nav-link'>
                    Followers: {state.profileData.counts.followerCount}
                </NavLink>
                <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className='nav-item nav-link'>
                    Following: {state.profileData.counts.followingCount}
                </NavLink>
            </div>

            <Switch>
                <Route exact path='/profile/:username'>
                    <ProfilePosts />
                </Route>
                <Route path='/profile/:username/followers'>
                    <ProfileFollowers />
                </Route>
                <Route path='/profile/:username/following'>
                    <ProfileFollowing />
                </Route>
            </Switch>
        </Page>
    )
}

export default Profile
