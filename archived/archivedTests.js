const assert = require('assert');
const Reviews = require('../src/reviews');

describe('Creating a new review', () => {
  let review;
  let sampleReview;
  let reviewsSample;

  const assertsRequiredInput = (data, testProperty, errorMessageString, done) => {
    const review = new Reviews(data);
    const validationResult = review.validateSync();
    // console.log(validationResult.errors[`reviews.0.${testProperty}`]);
    const { message } = validationResult.errors[`reviews.0.${testProperty}`];
    // console.log(message);
    assert(message === errorMessageString);
    done();
  };

  const assertsSaveNowAllowed = (data, testProperty, errorMessageString, done) => {
    const review = new Reviews(data);
    review.save()
    .catch((validationResult) => {
      // console.log(validationResult.errors);
      const { message } = validationResult.errors[`reviews.0.${testProperty}`];
      // console.log(message);
      assert(message === errorMessageString);
      done();
    });
  };

  beforeEach(() => {
    embeddedReview = {
      review_id: 288791,
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

    reviewsSample = {
      product_id: 18080,
      reviews: [ embeddedReview ],
    };
  })

  it('saves a review', (done) => {
    review = new Reviews(reviewsSample);
    review.save()
      .then(() => {
        assert(!review.isNew);
        done();
      });
  });

  it('requires a Product ID', (done) => {
    reviewsSample.product_id = undefined;
    const review = new Reviews(reviewsSample);
    const validationResult = review.validateSync();
    const { message } = validationResult.errors.product_id;
    assert(message === 'Product ID is required.');
    done();
  })

  it('requires a review object', (done) => {
    reviewsSample.reviews = [undefined];
    const review = new Reviews(reviewsSample);
    const validationResult = review.validateSync();
    const { message } = validationResult.errors['reviews.0'];
    assert(message === 'A review is required.');
    done();
  })

  it('requires a review_id', (done) => {
    reviewsSample.reviews[0].review_id = undefined;
    assertsRequiredInput(reviewsSample, 'review_id', 'Review ID is required.', done);
  });

  it('disallows reviews without review_id', (done) => {
    reviewsSample.reviews[0].review_id = undefined;
    assertsSaveNowAllowed(reviewsSample, 'review_id', 'Review ID is required.', done);
  });

  it('requires a rating', (done) => {
    reviewsSample.reviews[0].rating = undefined;
    assertsRequiredInput(reviewsSample, 'rating', 'Rating is required.', done);
  });

  it('requires a rating greater than or equal to 1', (done) => {
    reviewsSample.reviews[0].rating = 0;
    assertsRequiredInput(reviewsSample, 'rating', 'Rating must be between 1 and 5', done);
  });

  it('requires a rating less than or equal to 1', (done) => {
    reviewsSample.reviews[0].rating = 6;
    assertsRequiredInput(reviewsSample, 'rating', 'Rating must be between 1 and 5', done);
  });

  it('disallows reviews without ratings', (done) => {
    reviewsSample.reviews[0].rating = undefined;
    assertsSaveNowAllowed(reviewsSample, 'rating', 'Rating is required.', done);
  });

  it('requires a summary', (done) => {
    reviewsSample.reviews[0].summary = undefined;
    assertsRequiredInput(reviewsSample, 'summary', 'Summary is required.', done);
  });

  it('disallows reviews without summary', (done) => {
    reviewsSample.reviews[0].summary = undefined;
    assertsSaveNowAllowed(reviewsSample, 'summary', 'Summary is required.', done);
  });

  it('requires a recommend  values', (done) => {
    reviewsSample.reviews[0].recommend = undefined;
    assertsRequiredInput(reviewsSample, 'recommend', 'Recommend is required.', done);
  });

  it('disallows reviews without recommend', (done) => {
    reviewsSample.reviews[0].recommend = undefined;
    assertsSaveNowAllowed(reviewsSample, 'recommend', 'Recommend is required.', done);
  });

  it('requires a body', (done) => {
    reviewsSample.reviews[0].body = undefined;
    assertsRequiredInput(reviewsSample, 'body', 'Body is required.', done);
  });

  it('disallows reviews without body', (done) => {
    reviewsSample.reviews[0].body = undefined;
    assertsSaveNowAllowed(reviewsSample, 'body', 'Body is required.', done);
  });

  it('requires a valid date',(done) => {
    reviewsSample.reviews[0].date = 'InvalidString';
    const review = new Reviews(reviewsSample);
    const validationResult = review.validateSync();
    const { message } = validationResult.errors['reviews.0.date'];
    const expectedError = `Cast to date failed for value "${reviewsSample.reviews[0].date}" at path "date"`;
    assert(message === expectedError);
    done();
  });

  it('requires a reviewer name', (done)=> {
    reviewsSample.reviews[0].reviewer_name = undefined;
    assertsRequiredInput(reviewsSample, 'reviewer_name', 'Reviewer name is required.', done);
  });

  it('disallows a reviews without a reviewer name', (done)=> {
    reviewsSample.reviews[0].reviewer_name = undefined;
    assertsSaveNowAllowed(reviewsSample, 'reviewer_name', 'Reviewer name is required.', done);
  });

  it('helpfulness defaults to 0', (done)=> {
    reviewsSample.reviews[0].helpfulness = undefined;
    let review = new Reviews(reviewsSample);
    assert(review.reviews[0].helpfulness === 0);

    reviewsSample.reviews[0].helpfulness = "two";
    review = new Reviews(reviewsSample);
    assert(review.reviews[0].helpfulness === 0);

    done();
  });

  it('photos will default to an empty array', (done) => {
    reviewsSample.reviews[0].photos = undefined;
    const review = new Reviews(reviewsSample);
    assert(review.reviews[0].photos.length === 0);
    done();
  });

  it('photos will only accept strings', (done) => {
    reviewsSample.reviews[0].photos = [{}, 'testString'];
    const review = new Reviews(reviewsSample);
    const validationResult = review.validateSync();
    const { message } = validationResult.errors['reviews.0.photos.0'];
    const expectedError = `Cast to [string] failed for value "${JSON.stringify(reviewsSample.reviews[0].photos)}" at path "photos.0"`;
    assert(message === expectedError);
    done();
  });

});

describe('Can edit an existing reviews record', () => {
  let review;
  let reviewsSample;
  let embeddedReview;

  beforeEach((done) => {
    embeddedReview = {
      review_id: 288791,
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

    reviewsSample = {
      product_id: 18080,
      reviews: [ embeddedReview ],
    };

    review = new Reviews(reviewsSample);
    review.save()
      .then(() => done());
  });

  it('Can add a review to an existing reviews record', (done) => {
    const embeddedReview2 = {
      review_id: 289035,
      rating: 5,
      summary: "title",
      recommend: true,
      response: null,
      body: "body",
      date: "2021-03-13T00:00:00.000Z",
      reviewer_name: "username",
      helpfulness: 0,
      photos: [ 'moarTest', 'moarMoarTest' ]
    };

    Reviews.findOne({ product_id: 18080 })
      .then((product) => {
        product.reviews.push(embeddedReview2);
        return product.save();
      })
      .then(() => Reviews.findOne({ product_id: 18080 }))
      .then((product) => {
        assert(product.reviews[1].review_id === 289035);
        done();
      })
  });

  it('can remove an existing review', (done) => {
    const embeddedReview2 = {
      review_id: 289035,
      rating: 5,
      summary: "title",
      recommend: true,
      response: null,
      body: "body",
      date: "2021-03-13T00:00:00.000Z",
      reviewer_name: "username",
      helpfulness: 0,
      photos: [ 'moarTest', 'moarMoarTest' ]
    };

    Reviews.findOne({ product_id: 18080 })
      .then((product) => {
        product.reviews.push(embeddedReview2);
        return product.save();
      })
      .then(() => Reviews.findOne({ product_id: 18080 }))
      .then((product) => {
        // console.log(product);
        assert(product.reviews.length === 2);
        product.reviews[1].remove();
        return product.save();
      })
      .then(() => Reviews.findOne({ product_id: 18080 }))
      .then((product) => {
        assert(product.reviews[1] === undefined);
        done();
      })
  });
});