const assert = require('assert');
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

const Reviews = mongoose.model('reviews');

describe('The express app /reviews route', () => {
  it('handles a GET request at /reviews with product_id queries', (done) => {
    request(app)
      .get('/reviews?product_id=18080')
      .end((err, response) => {
        assert(response.body.product_id === '18080');
        done();
      });
  });
  it('handles a GET request at /reviews with count queries', (done) => {
    request(app)
      .get('/reviews?product_id=18080&count=10')
      .end((err, response) => {
        assert(response.body.count === '10');
        done();
      });
  });
  it('handles a GET request  at /reviews with count queries', (done) => {
    request(app)
      .get('/reviews?product_id=18080&page=1')
      .end((err, response) => {
        assert(response.body.page === '1');
        done();
      });
  });

  it('handles a POST request at /reviews', (done) => {
    const testReview = {
      product_id: 18080,
      review_id: 20000,
      rating: 5,
      summary: 'Summarizing test',
      body: 'Test bod bod bod',
      recommend: true,
      reviewer_name: 'Askerer of the question',
      email: 'Where the askerer can be reached',
      photos: ['testPhoto', 'moreOtherTestPhoto'],
      characteristics: {
        60623: 5,
        60624: 5,
        60625: 4,
        60626: 4,
      },
    };

    Reviews.countDocuments().then(count => {
      request(app)
        .post('/reviews')
        .send(testReview)
        .end((err, response) => {
          Reviews.countDocuments().then(newCount => {
            assert(count + 1 === newCount);
            done();
          })
        });
    });

  });
});

describe('The express app /reviews/meta routes', () => {
  it('handles GET queries at /reviews/meta', (done) => {
    request(app)
      .get('/reviews/meta?product_id=18080')
      .end((err, response) => {
        assert(response.body.product_id === '18080');
        done();
      });
  });
});
