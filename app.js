const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/routes');

const app = express();
mongoose.Promise = global.Promise;
if (process.env.NODE_ENV !== 'test'){
  mongoose.connect('mongodb://localhost/SDC-Reviews', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection
    .once('open', () => console.log('Successful connection to production db'))
    .on('error', () => console.warn('Warning: ', error));
}

app.use(bodyParser.json());
app.use((err, req, res, next) => {
  res.status(422).send({error: err.message});
});
routes(app);

module.exports = app;