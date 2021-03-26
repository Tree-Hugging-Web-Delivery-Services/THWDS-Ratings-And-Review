const mongoose = require('mongoose');

before((done) => {
  mongoose.connect('mongodb://localhost:27017/sdcReviewsTestDb', {
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

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    const colName = collection.s.namespace.collection;
    if (colName === 'reviews' || colName === 'chars') {
      // console.log('triggered: ', colName);
      await mongoose.connection.collection(colName).drop()
    }
  }
});
