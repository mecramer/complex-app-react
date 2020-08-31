import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import HeaderLoggedOut from './HeaderLoggedOut'
import HeaderLoggedIn from './HeaderLoggedIn'
import StateContext from '../StateContext'
import PropTypes from 'prop-types'

// props being used to accept logged in status from main.js
function Header (props) {
    const appState = useContext(StateContext)
    {
        /* conditionally loading components based on login status (ternary operator) */
    }
    {
        /* passing the loggedIn state as a prop to the sub components */
    }
    const headerContent = appState.loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut />

    return (
        <header className='header-bar bg-primary mb-3'>
            <div className='container d-flex flex-column flex-md-row align-items-center p-3'>
                <h4 className='my-0 mr-md-auto font-weight-normal'>
                    <Link to='/' className='text-white'>
                        ComplexApp
                    </Link>
                </h4>

                {!props.staticEmpty ? headerContent : ''}
            </div>
        </header>
    )
}

Header.propTypes = {
    staticEmpty : PropTypes.bool,
}

export default Header
