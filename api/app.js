const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const usersRouter = require("./routes/users");
const userRouter = require("./routes/user");
const postsRouter = require("./routes/posts");
const friendsRouter = require('./routes/friends')
const authenticationRouter = require("./routes/authentication");
const conversationsRouter = require("./routes/conversations")
const messagesRouter = require('./routes/messages')
const tokenChecker = require("./middleware/tokenChecker");

const app = express();

// Allow requests from any client
// docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
// docs: https://expressjs.com/en/resources/middleware/cors.html
app.use(cors());

// Parse JSON request bodies, made available on `req.body`
app.use(bodyParser.json());

// API Routes
app.use("/users",usersRouter);
app.use("/posts", tokenChecker, postsRouter); // calls the route in api/routes/post.js
app.use("/friends", tokenChecker, friendsRouter);
app.use("/tokens", authenticationRouter);
app.use("/user", tokenChecker, userRouter);
app.use("/conversations", tokenChecker, conversationsRouter )
app.use("/messages", tokenChecker, messagesRouter)


// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ err: "Error 404: Not Found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  if (process.env.NODE_ENV === "development") {
    res.status(500).send(err.message);
  } else {
    res.status(500).json({ err: "Something went wrong" });
  }
});

module.exports = app;
