import React, { useContext, useEffect } from 'react'
import DispatchContext from '../DispatchContext'
import { useImmer } from 'use-immer' // similar to useState
import Axios from 'axios'
import Post from './Post'

function Search () {
    const appDispatch = useContext(DispatchContext)

    const [ state, setState ] = useImmer({
        searchTerm   : '',
        results      : [],
        show         : 'neither',
        requestCount : 0,
    })

    // this is for the side effect of listening for a keypress to close the search window
    // the return statement cleans up the request, which runs when the component unmounts
    useEffect(() => {
        document.addEventListener('keyup', searchKeyPressHandler)

        return () => document.removeEventListener('keyup', searchKeyPressHandler)
    }, [])

    // each time searchTerm changes
    // 1 run a delay function every .75 seconds
    // 2 if searchTerm changes before .75 seconds, cancel waiting one before running again, using cleanup with clearTimeout
    // 3 once 3 seconds go by, add to requestCount, when requestCount changes, another useEffect is called
    useEffect(
        () => {
            if (state.searchTerm.trim()) {
                setState((draft) => {
                    draft.show = 'loading'
                })
                const delay = setTimeout(() => {
                    setState((draft) => {
                        draft.requestCount++
                    })
                }, 750)

                // this cleanup runs each time this useEffect is called, so if a user keeps typing, it cancels out the previous setTimeout
                return () => clearTimeout(delay)
            } else {
                setState((draft) => {
                    draft.show = 'neither'
                })
            }
        },
        [ state.searchTerm ],
    )

    // this useEffect runs when the draftCount in the previous useEffect changes
    // this useEffect sends an axios request to search
    useEffect(
        () => {
            // Send Axios request here
            const ourRequest = Axios.CancelToken.source()
            async function fetchResults () {
                try {
                    const response = await Axios.post(
                        '/search',
                        { searchTerm: state.searchTerm },
                        { cancelToken: ourRequest.token },
                    )
                    setState((draft) => {
                        draft.results = response.data
                        draft.show = 'results'
                    })
                } catch (e) {
                    console.log('There was a problem or the request was canceled.')
                }
            }

            if (state.requestCount) {
                fetchResults()

                // cleanup function, cancelling the search request
                return () => ourRequest.cancel()
            }
        },
        [ state.requestCount ],
    )

    // listen for keyups and close if the keyupped is the escape key (27)
    function searchKeyPressHandler (evt) {
        if (evt.keyCode == 27) {
            appDispatch({ type: 'closeSearch' })
        }
    }

    function handleInput (evt) {
        const value = evt.target.value
        setState((draft) => {
            draft.searchTerm = value
        })
    }

    return (
        <React.Fragment>
            <div className='search-overlay-top shadow-sm'>
                <div className='container container--narrow'>
                    <label htmlFor='live-search-field' className='search-overlay-icon'>
                        <i className='fas fa-search' />
                    </label>
                    <input
                        onChange={handleInput}
                        autoFocus
                        type='text'
                        autoComplete='off'
                        id='live-search-field'
                        className='live-search-field'
                        placeholder='What are you interested in?'
                    />
                    <span onClick={() => appDispatch({ type: 'closeSearch' })} className='close-live-search'>
                        <i className='fas fa-times-circle' />
                    </span>
                </div>
            </div>

            <div className='search-overlay-bottom'>
                <div className='container container--narrow py-3'>
                    <div className={'circle-loader ' + (state.show == 'loading' ? 'circle-loader--visible' : '')} />
                    <div
                        className={
                            'live-search-results' + (state.show == 'results' ? 'live-search-results--visible' : '')
                        }
                    >
                        {Boolean(state.results.length) && (
                            <div className='list-group shadow-sm'>
                                <div className='list-group-item active'>
                                    <strong>Search Results</strong> ({state.results.length}{' '}
                                    {state.results.length > 1 ? 'items' : 'item'} found)
                                </div>
                                {state.results.map((post) => {
                                    return (
                                        <Post
                                            post={post}
                                            key={post._id}
                                            onClick={() => appDispatch({ type: 'closeSearch' })}
                                        />
                                    )
                                })}
                            </div>
                        )}
                        {/* if no results */}
                        {!state.results.length && (
                            <p className='alert alert-danger text-center shadow-sm'>
                                Sorry, we could not find any results for that search.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Search
