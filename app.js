require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

//connect to the db
const connectDB = require('./db/connect')
//routers
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')
const userRouter = require('./routes/user')
//Middleware
const errorHandlerMiddleware = require('./errors/errorHandler')
const authenticateUser = require('./middleware/authenticate')
//security packages
const helmet = require('helmet')
const xss = require('xss-clean')

//Security packages implementation.
app.use(helmet())
app.use(xss())

//This package allows the server to easily parse JSON data.
app.use(express.json());

// routes
app.use('/api/v1/auth', authRouter)
//These are protected routes. The client's token will need to be verified in the authenticateUser middleware before the routes can be accessed.
app.use('/api/v1/jobs', authenticateUser, jobsRouter)
app.use('/api/v1/user', authenticateUser, userRouter)

//catch all requests for any route that is not defined and return a 404. 
app.use('*', (req, res) => {
    res.status(404).send('Route does not exist')
})
//Use this middleware for all errors that occur on the server.
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3002;

//Connect to the db and start the server.
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();