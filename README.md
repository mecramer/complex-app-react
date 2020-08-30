# complex-app-react
 React app with chat, messages, user accounts

 test accounts using MongoDB 

React
React Router
Mongo DB

backendAPi folder needed to connect to MongoDB
to start mongo
go to backendAPI folder
run nmp install first time
npm run start to start up the DB
to confirm DB is running, visit localhost:8080

test user account for project is 
un: mark, email: mark@test.com pw: qwerty123456
un: jen, email: jen@test.com pw: qwerty123456
un: kylie, email: kylie@test.com pw: qwerty123456

Context - passing data around
create StateContext.js and DispatchContext.js files in top folder
They could be in one, but its better to use two, state to share current state and dispatch to change current state
These two context providers wrap around all the other components in Main.js

Has a Page Not Found component

Packages
React Tooltip
Immer
React Transition Group - to have transition effects on React components
Prop Types
Socket.io

Notes:
The correct install instruction for io is 'npm install socket.io-client --save'
Get ESLint running on a project - Run eslint --init

