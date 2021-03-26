const assert = require('assert');
const mongoose = require('mongoose');
const Reviews = require('../models/reviews');
const Chars = require('../models/chars');
const ReviewsImport = require('../models/utils/reviewsImport');
const PhotosImport = require('../models/utils/photosImport');
const CharsImport = require('../models/utils/charsImport');
const CharsReviewsImport = require('../models/utils/charsReviewsImport');

describe('Creates a new review', () => {
  let review;
  let sampleReview;

  beforeEach(() => {
    sampleReview = {
      review_id: 28879175489734897593743739857498375293,
      product_id: 5,
      rating: 3,
      summary: 'Decent at best',
      recommend: false,
      response: null,
      body: 'jkldsfjksdkjlfdsjlkdsajkldsfkljsdlkjvvsdvsdv',
      date: "2021-03-11T00:00:00.000Z",
      reviewer_name: 'gibberish',
      reviewer_email: 'testEmail@test.com',
      helpfulness: 6,
      photos: [{
        id: 9048598592890054,
        url: 'testString',
      }
      ],
    };


  });

  it('saves a review', (done) => {
    review = new Reviews(sampleReview);
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

describe('Reading files from other collections in the db', () => {
  it('Can read a document from the reviews imports collection', (done) => {
    ReviewsImport.findOne({id: 1})
      .then((result) => {
        assert(result.rating === 5);
        done();
      })
      .catch((error) => {
        console.log(error)
        done();
      });
  });

  it('Can read a single document from the photos import collection', (done) => {
    PhotosImport.findOne({id: 4})
      .then((result) => {
        assert(result.review_id === 9);
        done();
      })
      .catch((error) => console.warn('Error: ', error));
  });

  it('Can query multiple documents at the same time', (done) => {
    ReviewsImport.find({product_id: 1})
      .then((results) => {
        assert(results.length === 2);
        done();
      })
      .catch((error) => {
        console.warn('Error: ', error)
        done();
      });
  });
});

describe('Merging files from two collections into a result collection', (done) => {
  it('Can embed a photos document into a reviews document and save it to a new collection', (done) => {
    const pipeline = [
      { $lookup: { from: 'photosImport', localField: 'id', foreignField: 'review_id', as: 'photos' }},
      { $project: {
        review_id: '$id',
        product_id: '$product_id',
        rating: '$rating',
        date: '$date',
        summary: '$summary',
        body: '$body',
        recommend: '$recommend',
        reported: '$reported',
        reviewer_name: '$reviewer_name',
        reviewer_email: '$reviewer_email',
        helpfulness: '$helpfulness',
        photos: {
          $map : {
            input: '$photos',
            as: 'entry',
            in: {
              id: '$$entry.id',
              url: '$$entry.url',
            }
          }
        }
      }},
    ];

    ReviewsImport.aggregate(pipeline).exec((error, result) => {
      Reviews.collection.insertMany(result)
        .then(() => Reviews.findOne({review_id: 9}))
        .then((result) => assert(result.photos[0].id, 4))
        .then(() => Reviews.find({product_id: 4}))
        .then((result) => assert.equal(result.length, 3))
        .then(() => done())
        .catch((error) => console.log(error));
    });
  });

  it('Can embed char names document into a char reviews document', (done) => {
    const pipeline = [
      {
        $lookup: {
          from: 'charsImport',
          localField: 'characteristic_id',
          foreignField: 'id',
          as: 'chars'
        }
      }, {
        $unwind: {
          path: '$chars'
        }
      }, {
        $project: {
          _id: false,
          characteristic_id: true,
          review_id: true,
          value: true,
          product_id: '$chars.product_id',
          name: '$chars.name'
        }
      }
    ];

    CharsReviewsImport.aggregate(pipeline).exec((error, result) => {
      Chars.collection.insertMany(result)
        .then(() => Chars.findOne({characteristic_id: 1}))
        .then((result) => assert.equal(result.name,'Fit'))
        .then(() => done())
        .catch((error) => console.log(error));
    });
  });

  it('Can add characteristics to reviews documents', (done) => {
    const charsPipeline = [
      {
        $lookup: {
          from: 'charsImport',
          localField: 'characteristic_id',
          foreignField: 'id',
          as: 'chars'
        }
      }, {
        $unwind: {
          path: '$chars'
        }
      }, {
        $project: {
          _id: false,
          characteristic_id: true,
          review_id: true,
          value: true,
          product_id: '$chars.product_id',
          name: '$chars.name'
        }
      }
    ];
    const reviewsPipeline = [
      {
        $lookup: {
          from: 'photosImport',
          localField: 'id',
          foreignField: 'review_id',
          as: 'photos'
        }
      }, {
        $project: {
          review_id: '$id',
          product_id: '$product_id',
          rating: '$rating',
          date: '$date',
          summary: '$summary',
          body: '$body',
          recommend: '$recommend',
          reported: '$reported',
          reviewer_name: '$reviewer_name',
          reviewer_email: '$reviewer_email',
          helpfulness: '$helpfulness',
          photos: {
            $map: {
              input: '$photos',
              as: 'entry',
              in: {
                id: '$$entry.id',
                url: '$$entry.url',
              }
            }
          },
          characteristics: {
            $map: {
              input: '$chars',
              as: 'char',
              in: {
                  char_id: '$$char.characteristic_id',
                  char_name: '$$char.name',
                  value: '$$char.value',
              }
            }
          }
        }
      }, {
        $lookup: {
          from: 'chars',
          localField: 'review_id',
          foreignField: 'review_id',
          as: 'chars'
        }
      }, {
        $project: {
          review_id: '$review_id',
          product_id: '$product_id',
          rating: '$rating',
          date: '$date',
          summary: '$summary',
          body: '$body',
          recommend: '$recommend',
          reported: '$reported',
          reviewer_name: '$reviewer_name',
          reviewer_email: '$reviewer_email',
          helpfulness: '$helpfulness',
          photos: '$photos',
          characteristics: {
            $map: {
              input: '$chars',
              as: 'char',
              in: {
                  char_id: '$$char.characteristic_id',
                  char_name: '$$char.name',
                  value: '$$char.value',
              }
            }
          }
        }
      }
    ];


    CharsReviewsImport.aggregate(charsPipeline).exec((error, result) => {
      Chars.collection.insertMany(result)
        .then(() => ReviewsImport.aggregate(reviewsPipeline).exec())
        .then((result) => Reviews.collection.insertMany(result))
        .then(() => done())
        .catch((error) => {
          console.log(error);
          done();
        })
    });
  })
});
