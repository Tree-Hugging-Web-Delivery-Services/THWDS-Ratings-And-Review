const mongoose = require('mongoose');

before((done) => {
  mongoose.connect('mongodb://localhost:27017/sdcReviewsTestDb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  const connection1 = mongoose.connection
    .once('open', () => {
      console.log('Successful connection 1 to test db')
      done();
    })
    .on('error', (error) => {
      console.warn('Warning: ', error);
      console.trace();
      done();
    })
  const connection2 = mongoose.connection
    .once('open', () => {
      console.log('Successful connection 2 to test db')
      done();
    })
    .on('error', (error) => {
      console.warn('Warning: ', error);
      console.trace();
      done();
    })
});

// beforeEach(async () => {
//   const collections = await mongoose.connection.db.collections();
//   for (let collection of collections) {
//     const colName = collection.s.namespace.collection;
//     if (colName === 'reviews' || colName === 'chars') {
//       await mongoose.connection.collection(colName).drop()
//     }
//   }
// });
