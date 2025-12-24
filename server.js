const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;


const authCtrl = require('./controllers/auth');
const testJwtRouter = require('./controllers/test-jwt');
const usersCtrl = require('./controllers/users');
const cafesCtrl = require('./controllers/cafes');
const seatUpdatesCtrl = require('./controllers/seatUpdates');


const verifyToken = require('./middleware/verify-token');


mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});


app.use(cors());
app.use(express.json());
app.use(logger('dev'));


app.use('/auth', authCtrl);
app.use('/test-jwt', testJwtRouter);
app.use('/cafes', cafesCtrl); 


app.use(verifyToken);
app.use('/users', usersCtrl);
app.use('/seat-updates', seatUpdatesCtrl); 

app.listen(PORT, () => {
  console.log(`Express app ready on port ${PORT}`);
  console.log('✅ SpotCheck Café Backend is running');
});