import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import LoadingDotsIcon from './LoadingDotsIcon'

function ProfileFollowing () {
    const { username } = useParams()
    const [ isLoading, setIsLoading ] = useState(true)
    const [ posts, setPosts ] = useState([])

    // we only want this function to run on initial page load
    useEffect(
        () => {
            const ourRequest = Axios.CancelToken.source()

            async function fetchPosts () {
                try {
                    const response = await Axios.get(`/profile/${username}/following`)
                    setPosts(response.data)
                    setIsLoading(false)
                } catch (e) {
                    console.log('There was a problem.')
                }
            }
            fetchPosts()
            // cleanup function, in this case if the axios request is still running while user switches pages
            return () => {
                ourRequest.cancel()
            }
        },
        [ username ],
    )

    if (isLoading) return <LoadingDotsIcon />

    return (
        <div className='list-group'>
            {posts.map((follower, index) => {
                return (
                    <Link
                        key={index}
                        to={`/profile/${follower.username}`}
                        className='list-group-item list-group-item-action'
                    >
                        <img className='avatar-tiny' src={follower.avatar} /> {follower.username}
                    </Link>
                )
            })}
        </div>
    )
}

export default ProfileFollowing
