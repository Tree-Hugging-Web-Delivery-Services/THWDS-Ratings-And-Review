const assert = require('assert');
const _ = require('underscore');
const mongoose = require('mongoose');
const Reviews = require('../models/reviews');
const Chars = require('../models/chars');
const ReviewsMeta = require('../models/reviewsMeta');
const ReviewsImport = require('../models/utils/reviewsImport');
const PhotosImport = require('../models/utils/photosImport');
const CharsImport = require('../models/utils/charsImport');
const CharsReviewsImport = require('../models/utils/charsReviewsImport');
const CharsBigImport = require('../models/utils/charsBigImport');
const CharsReviewsBigImport = require('../models/utils/charsReviewsBigImport');
const ReviewsBigImport = require('../models/utils/reviewsBigImport');
const PhotosBigImport = require('../models/utils/photosBigImport');

xdescribe('Creates a new review', () => {

  let sampleReview = {
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
    }],
  };

  it('saves a review', async () => {
    let review = new Reviews(sampleReview);
    try {
      await review.save();
      assert(!review.isNew);
    } catch (error) {
      console.trace(error);
    }
  });

  after(async () => {
    try {
      await Reviews.deleteMany({})
    } catch (error) {
      console.trace(error);
    }
  });
});

xdescribe('Reading files from other collections in the db', () => {
  it('Can read a document from the reviews imports collection', async () => {
    try {
      const result = await ReviewsImport.findOne({id: 1})
      assert(result.rating === 5);
    } catch (error) {
      console.error(error);
      console.trace();
    }
  });

  it('Can read a single document from the photos import collection', async () => {
    try {
      const result = await PhotosImport.findOne({id: 4})
      assert(result.review_id === 9);
    } catch (error) {
      console.error(error);
      console.trace();
    }
  });

  it('Can query multiple documents at the same time', async () => {
    try {
      const results = await ReviewsImport.find({product_id: 1})
      assert(results.length === 2);
    } catch (error) {
      console.error(error);
      console.trace();
    }
  });
});

xdescribe('Merging files from two collections into a result collection', () => {
  it('Can embed a photos document into a reviews document and save it to a new collection', async () => {
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

    try {
      const aggResult = await ReviewsImport.aggregate(pipeline).exec();
      await Reviews.collection.insertMany(aggResult);
      const findOneResult = await Reviews.findOne({review_id: 9});
      assert(findOneResult.photos[0].id, 4);

      const findResult = await Reviews.find({product_id: 4});
      assert.equal(findResult.length, 3);

      //Test Clean Up
      await Reviews.deleteMany({});
    } catch (error) {
      console.error(error);
      console.trace();
    }
  });

  it('Can embed char names document into a char reviews document', async () => {
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

    try{
      const aggResult = await CharsReviewsImport.aggregate(pipeline).exec();
      await Chars.collection.insertMany(aggResult);

      const findOneResult = await Chars.findOne({characteristic_id: 1});
      assert.equal(findOneResult.name, 'Fit');

      //Test Clean Up
      // await Reviews.deleteMany({});
      await Chars.deleteMany({});
    } catch (error) {
      console.error(error);
      console.trace();
    }
  });

  before(async () => {
    try {
      // console.trace('triggered');
      await ReviewsMeta.deleteMany({});
    } catch (error) {
      console.error(error);
      console.trace();
    }
  });

  it('Can add characteristics to reviews documents', async () => {
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

    try {
      const charsAggResult = await CharsReviewsImport.aggregate(charsPipeline).exec();
      await Chars.insertMany(charsAggResult);
      const reviewAggResult = await ReviewsImport.aggregate(reviewsPipeline).exec();
      await Reviews.insertMany(reviewAggResult);

      const result1 = await Reviews.findOne({review_id: 1});
      const result2 = await Reviews.findOne({review_id: 2});
      // console.log(results);
      const result1Char1 = result1.characteristics[0].char_name;
      const result2Char1 = result2.characteristics[0].char_name;
      assert(result1.product_id === result2.product_id)
      assert(result1Char1 === 'Fit');
      assert(result1Char1 === result2Char1);
    } catch (error) {
      console.error(error);
      console.trace();
    }
  });

  it('can generated a meta table automatically on insertMany reviews', async () => {
    try {
      const metaResult = await ReviewsMeta.find({product_id: 1});
      const reviewsResult = await Reviews.find({product_id: 1});

      assert(metaResult.length === 1);
      assert(reviewsResult.length === 2);

      assert(reviewsResult[0].characteristics[1].char_name === 'Length');
      assert(reviewsResult[0].characteristics[1].value === 3);
      assert(reviewsResult[0].recommend === true);
      assert(reviewsResult[1].characteristics[1].char_name === 'Length');
      assert(reviewsResult[1].recommend === false);


      assert(metaResult[0].characteristics[1].char_name === 'Length');
      assert(metaResult[0].characteristics[1].value === 3.5);
      assert(metaResult[0].recommended.true === 1);
      assert(metaResult[0].recommended.false === 1);
    } catch (error) {
      console.trace(error);
    }
  });
});


xdescribe('Can perform ETL functions on a collection in batches', () => {
  before(async () => {
    try {
      await Chars.deleteMany({});
      await Reviews.deleteMany({});
      await ReviewsMeta.deleteMany({});
    } catch (error) {
      console.error(error);
      console.trace();
    }
  });

  it('Can read from a collection and write to another collection in batches of 10', async () => {
    let batchSize = 10;
    let totalDesired = 40;
    let currentPlace = 0;
    let charCount;

    while (currentPlace < totalDesired) {
      const charsPipeline = [
        {
          $skip: currentPlace,
        }, {
          $limit: batchSize,
        }, {
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

      try {
        const charsAggResult = await CharsReviewsImport.aggregate(charsPipeline).exec();
        await Chars.insertMany(charsAggResult);
        currentPlace += batchSize;
        charCount = await Chars.countDocuments({});
        assert(charCount === currentPlace);
      } catch (error) {
        console.error(error);
        console.trace();
      }
    }

    charCount = await Chars.countDocuments({});
    assert(charCount === totalDesired);
  });

  it('Can write reviews in batches', async () => {
    let batchSize = 10;
    let totalDesired = 40;
    let currentPlace = 0;
    let reviewsCount;

    while (currentPlace < totalDesired) {
      const reviewsPipeline = [
        {
          $skip: currentPlace,
        }, {
          $limit: batchSize,
        }, {
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

      try {
        const reviewAggResult = await ReviewsImport.aggregate(reviewsPipeline).exec();
        await Reviews.insertMany(reviewAggResult);
        currentPlace += batchSize;
        reviewsCount = await Reviews.countDocuments({});
        assert(reviewsCount === currentPlace);
      } catch (error) {
        console.error(error);
        console.trace();
      }
    }

    reviewsCount = await Reviews.countDocuments({});
    const metaCheck = await ReviewsMeta.find({});
    let numOfReviewsInMeta = 0;
    metaCheck.forEach((productMeta) => {
      numOfReviewsInMeta += productMeta.reviews.length;
    });

    assert(numOfReviewsInMeta === reviewsCount);
    assert(reviewsCount === totalDesired);
  });
});

describe('Testing a different approach for ETL', () => {
  // before(async() => {
  //   await Reviews.deleteMany({});
  //   await Chars.deleteMany({});
  // });

  xit('Manipulation via find query part 1: names in characteristics', async () => {
    let total = 3347478;
    let currentPosition = 0;
    let triggerConsoleLog;

    console.time('Time per 1,000,000');
    console.time('Total time');
    while (currentPosition < total) {
      const charsQueryResults = await CharsBigImport.find({id: {$gte: currentPosition, $lte:(currentPosition + 100000)}});
      _.each(charsQueryResults, async (entry) => {
        await CharsReviewsBigImport.updateMany({characteristic_id: entry.id}, {name: entry.name});
      });
      currentPosition += 100000;
      if (currentPosition >= triggerConsoleLog) {
        console.timeEnd('Time per 1,000,000');
        console.log(currentPosition);
        console.time('Time per 1,000,000');
      }
    }
    console.timeEnd('Total time');
  });

  xit('Manipulation via a query part 2: Characteristics into reviews', async () => {
    let total = 5777924;
    let currentPosition = 1;
    let triggerConsoleLog = 10;

    console.time('Time check');
    console.time('Total time');
    while (currentPosition < total) {
    const charFetch = await CharsReviewsBigImport.find({review_id: currentPosition});
    const mappedFetch = _.map(charFetch, (entry) => {
      let newFormat = {
        char_id: entry.characteristic_id,
        char_name: entry.name,
        value: entry.value,
      };
      return newFormat;
    });
    await ReviewsBigImport.updateOne({id: currentPosition}, {characteristics: mappedFetch});

      currentPosition += 1;
      if (currentPosition >= triggerConsoleLog) {
        console.timeEnd('Time check');
        console.log(currentPosition);
        console.time('Time check');
        triggerConsoleLog += 250000;
      }
    }
    console.timeEnd('Total time');
  });

  it('Manipulation via a query part 2: photos into reviews', async () => {
    let total = 2800000;
    let currentPosition = 1;
    let triggerConsoleLog = 10;

    console.time('Time check');
    console.time('Total time');
    while (currentPosition < total) {
    const photoFetch = await PhotosBigImport.find({review_id: currentPosition});
    if (photoFetch === null) {
      currentPosition++;
      continue
    } else {
      await ReviewsBigImport.updateOne({id: currentPosition}, {photos: photoFetch});
    }

      currentPosition += 1;
      if (currentPosition >= triggerConsoleLog) {
        console.timeEnd('Time check');
        console.log(currentPosition);
        console.time('Time check');
        triggerConsoleLog += 250000;
      }
    }
    console.timeEnd('Total time');
  });
});