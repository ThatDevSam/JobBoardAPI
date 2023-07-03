require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

//connect to the db
const connectDB = require('./db/connect')
//routers
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')
//Middleware
const errorHandlerMiddleware = require('./errors/errorHandler')
const authenticateUser = require('./middleware/authenticate')
//security packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')

//Security packages implementation.
app.use(
  rateLimit({
    windowMs: 15*60*1000, //15 minutes
    max: 100, //limit each IP to 100 requests per windowMs.
  })
)
app.use(express.json());
app.use(helmet())
app.use(cors())
app.use(xss())


// routes
app.use('/api/v1/auth', authRouter)
//jobsRouter is a protected route. The client's token will need to be verified in the authenticateUser middleware before the jobs route can be accessed.
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

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