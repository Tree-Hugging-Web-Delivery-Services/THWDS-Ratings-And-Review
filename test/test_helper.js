const mongoose = require('mongoose');

before((done) => {
  mongoose.connect('mongodb://localhost/SDC-Reviews_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection
    .once('open', () => {
      console.log('Successful connection to test db')
      done();
    })
    .on('error', (error) => console.warn('Warning: ', error))
});

beforeEach((done) => {
  const { reviews } = mongoose.connection.collections;
  reviews.drop()
    .then(() => done())
    //ERROR HANDLING UPON FIRST TEST
    .catch(() => done());
});
