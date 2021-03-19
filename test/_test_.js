const assert = require('assert');
const Review = require('../src/reviews');

describe('Creating reviews', () => {
  let review;
  let sampleReview;

  const assertsRequiredInput = (data, testProperty, errorMessageString, done) => {
    const review = new Review(data);
    const validationResult = review.validateSync();
    const { message } = validationResult.errors[testProperty];
    assert( message === errorMessageString);
    done();
  };

  const assertsSaveNowAllowed = (data, testProperty, errorMessageString, done) => {
    const review = new Review(data);
    review.save()
    .catch((validationResult) => {
      const { message } = validationResult.errors[testProperty];
      assert( message === errorMessageString);
      done();
    });
  };

  beforeEach((done) => {
    sampleReview = {
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

    review = new Review (sampleReview);
    review.save()
      .then(() => done());
  })

  it('saves a review', (done) => {
    assert(!review.isNew);
    done();
  });

  it('requires a review_id',(done) => {
    sampleReview.review_id = undefined;
    assertsRequiredInput(sampleReview, 'review_id', 'Review ID is required.', done);
  });

  it('disallows reviews without review_id', (done) => {
    sampleReview.review_id = undefined;
    assertsSaveNowAllowed(sampleReview, 'review_id', 'Review ID is required.', done);
  });

  it('requires a rating',(done) => {
    sampleReview.rating = undefined;
    assertsRequiredInput(sampleReview, 'rating', 'Rating is required.', done);
  });

  it('requires a rating greater than or equal to 1',(done) => {
    sampleReview.rating = 0;
    assertsRequiredInput(sampleReview, 'rating', 'Rating must be between 1 and 5', done);
  });

  it('requires a rating less than or equal to 1',(done) => {
    sampleReview.rating = 6;
    assertsRequiredInput(sampleReview, 'rating', 'Rating must be between 1 and 5', done);
  });

  it('disallows reviews without ratings', (done) => {
    sampleReview.rating = undefined;
    assertsSaveNowAllowed(sampleReview, 'rating', 'Rating is required.', done);
  });

  it('requires a summary', (done) => {
    sampleReview.summary = undefined;
    assertsRequiredInput(sampleReview, 'summary', 'Summary is required.', done);
  });

  it('disallows reviews without summary', (done) => {
    sampleReview.summary = undefined;
    assertsSaveNowAllowed(sampleReview, 'summary', 'Summary is required.', done);
  });

  it('requires a recommend', (done) => {
    sampleReview.recommend = undefined;
    assertsRequiredInput(sampleReview, 'recommend', 'Recommend is required.', done);
  });

  it('disallows reviews without summary', (done) => {
    sampleReview.recommend = undefined;
    assertsSaveNowAllowed(sampleReview, 'recommend', 'Recommend is required.', done);
  });

  it('requires a body', (done) => {
    sampleReview.body = undefined;
    assertsRequiredInput(sampleReview, 'body', 'Body is required.', done);
  });

  it('disallows reviews without body', (done) => {
    sampleReview.body = undefined;
    assertsSaveNowAllowed(sampleReview, 'body', 'Body is required.', done);
  });


});