# 'acebook
## WORK IN PROGRESS

This repo contains a simple replica of a popular social network.
### Welcome to Club Watermelon!

### Structure
This repo contains two applications:

- A frontend React app
- A backend API server

These two applications will communicate through HTTP requests, and need to be
ran separately.

#### Frontend
JavaScript, React, CSS, Bootstrap  
[![My Skills](https://skillicons.dev/icons?i=js,react,css,bootstrap)](https://skillicons.dev)

#### Backend
Javascript, MongoDB
[![My Skills](https://skillicons.dev/icons?i=js, mongodb)](https://skillicons.dev)

#### Current functionality:
- User can sign up.
- User can log in.
- User can create/ delete/ like/ unlike a post.
- User can approve/ decline friend requests.
- User can add/ remove friends.
- User can send a direct message to a friend.
  
#### Currently scope of update:
- Review full project in due course.


### Documentation
[More documentation of the codebase and its architecture can be found here.](./DOCUMENTATION.md)

### Quickstart

### Install Node.js
If you haven't already, make sure you have node and NVM installed.

1. Install Node Version Manager (NVM)
   ```
   brew install nvm
   ```
   Then follow the instructions to update your `~/.bash_profile`.
2. Open a new terminal
3. Install the latest version of [Node.js](https://nodejs.org/en/).
   ```
   nvm install 20
   ```

### Set up your project

1. Clone the repo to your local machine
2. Install dependencies for both the `frontend` and `api` applications:
   ```
   cd frontend
   npm install
   cd ../api
   npm install
   ```
3. Install an ESLint plugin for your editor, for example
   [ESLint for VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
4. Install MongoDB
   ```
   brew tap mongodb/brew
   brew install mongodb-community@6.0
   ```
   _Note:_ If you see a message that says
   `If you need to have mongodb-community@6.0 first in your PATH, run:`, follow
   the instruction. Restart your terminal after this.
5. Start MongoDB

   ```
   brew services start mongodb-community@6.0
   ```

### Setting up environment variables.
We need to create two `.env` files, one in the frontend and one in the api.

#### Frontend
Create a file `frontend/.env` with the following contents:
```
VITE_BACKEND_URL="http://localhost:3000"
```

#### Backend
Create a file `api/.env` with the following contents:
```
MONGODB_URL="mongodb://0.0.0.0/acebook"
NODE_ENV="development"
JWT_SECRET="secret"
```

For an explanation of these environment variables, see the documentation.

### How to run the server and use the app
1. Start the server application (in the `api` directory) in dev mode:
```
; cd api
; npm run dev
```
2. Start the front end application (in the `frontend` directory)
In a new terminal session...
```
; cd frontend
; npm run dev
```

You should now be able to open your browser and go to
`http://localhost:5173/signup` to create a new user.

Then, after signing up, you should be able to log in by going to
`http://localhost:5173/login`.

