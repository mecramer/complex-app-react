# complex-app-react
 React app with chat, messages, user accounts. The app can be seen in production at https://angry-khorana-f03a9d.netlify.app/. The app allows users to have an account, post messages, follow and be followed by other users and a chat feature to talk to other logged in users.

## Tools used
* React
* React Router
* React Context - passing data around, StateContext.js and DispatchContext.js
* Mongo DB - to store user information and content
* Heroku - to host the back end of the app
* Netlify - to host the front end of the app
* Node.js - for back end functionality
* Express - for back end app

## React Packages
* React Tooltip
* Immer - for state management
* Axios - to communicate with MongoDB database
* React Transition Group - to have transition effects on React components
* Prop Types
* Socket .io - for chatting features
* Page Not Found component

This application uses two repos. One for the front end and another for the backend. Both repos need to be started to view the site locally. The database is located at localhost:8080 and the web interface at localhost:3000. This repo represents the front end portion.

Notes:
The correct install instruction for io is 'npm install socket.io-client --save'
Get ESLint running on a project - Run eslint --init

