const mongoose = require('mongoose');

before((done) => {
  mongoose.connect('mongodb://localhost/reviews_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection
    .once('open', () => console.log('Success'))
    .on('error', (error) => console.warn('Warning: ', error))
});

beforeEach((done) => {
  mongoose.connection.collections.reviews.drop(() => done());
});
