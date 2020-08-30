import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import { useParams } from 'react-router-dom'
import LoadingDotsIcon from './LoadingDotsIcon'
import Post from './Post'

function ProfilePosts () {
    const { username } = useParams()
    const [ isLoading, setIsLoading ] = useState(true)
    const [ posts, setPosts ] = useState([])

    // we only want this function to run on initial page load
    useEffect(
        () => {
            const ourRequest = Axios.CancelToken.source()

            async function fetchPosts () {
                try {
                    const response = await Axios.get(`/profile/${username}/posts`)
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
            {posts.map((post) => {
                return <Post noAuthor={true} post={post} key={post._id} />
            })}
        </div>
    )
}

export default ProfilePosts
