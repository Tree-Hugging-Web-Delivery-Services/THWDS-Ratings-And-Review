const assert = require('assert');
const Review = require('../models/review');

describe('Creates a new review', () => {
  let review;
  let sampleReview;

  beforeEach(() => {
    sampleReview = {
      review_id: 288791,
      product_id: 5,
      rating: 3,
      summary: 'Decent at best',
      recommend: false,
      response: null,
      body: 'jkldsfjksdkjlfdsjlkdsajkldsfkljsdlkjvvsdvsdv',
      date: "2021-03-11T00:00:00.000Z",
      reviewer_name: 'gibberish',
      helpfulness: 6,
      photos: [
        'testString',
        'testString2',
      ],
    };
  });

  it('saves a review', (done) => {
    review = new Review(sampleReview);
    review.save()
      .then(() => {
        assert(!review.isNew);
        done();
      })
    .catch((error) => {
      console.log(error);
      done();
    })
  });

});