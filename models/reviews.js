const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ReviewsMeta = require('./reviewsMeta');

const PhotosSchema = new Schema({ id: Number, url: String });
const CharacteristicsSchema = new Schema({char_id: Number, char_name: String, value: Number});
const ReviewsSchema = new Schema({
  review_id: {
    type: Number,
    required: [true, 'Body is required.']
  },
  product_id: {
    type: Number,
    required: [true, 'Body is required.']
  },
  rating: {
    type: Number,
    validate: {
      validator: (number) => ((number > 0) && (number <= 5)),
      message: 'Rating must be between 1 and 5'
    },
  },
  summary: String,
  recommend: Boolean,
  response: {
    type: String,
    default: null,
  },
  body: {
    type: String,
    required: [true, 'Body is required.']
  },
  date: {
    type: Date,
    default: new Date(),
  },
  reviewer_name: {
    type: String,
    required: [true, 'Reviewer name is required.']
  },
  reviewer_email: {
    type: String,
    required: [true, 'Reviewer email is required.']
  },
  helpfulness: {
    type: Number,
    default: 0,
  },
  photos: [PhotosSchema],
  characteristics: [CharacteristicsSchema],
});


//Updates meta collection upon remove

//Updates meta collection upon insertMany
ReviewsSchema.post('insertMany', async (docs, next) => {
  let insertManyArr = [];

  for (let i = 0; i < docs.length; i++) {
    const reviewsMetaTemplate = {
      product_id: null,
      ratings: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
      recommended: {
        false: 0,
        true: 0,
      },
      characteristics: [],
      reviews: [],
      reviewsCount: 0,
    };

    let newMetaDoc = undefined;
    let createNewMetaDoc = true;
    let indexFound = null;
    const productMeta = await ReviewsMeta.findOne({product_id: docs[i].product_id});
    if (productMeta === null) {
      // If query returns empty, checks to see if we already created a document pending to be saved
      for (let j = 0; j < insertManyArr.length; j++) {
        if (insertManyArr[j].product_id === docs[i].product_id) {
          createNewMetaDoc = false;
          indexFound = j;
          break;
        }
      }

      if (createNewMetaDoc) {
        newMetaDoc = reviewsMetaTemplate;
        newMetaDoc.product_id = docs[i].product_id;
        newMetaDoc.ratings[docs[i].rating]++;
        newMetaDoc.recommended[docs[i].recommend]++;
        newMetaDoc.characteristics = docs[i].characteristics;
        newMetaDoc.reviews.push(docs[i].review_id);
        newMetaDoc.reviewsCount++;
        insertManyArr.push(newMetaDoc);
      } else {
        newMetaDoc = insertManyArr[indexFound];
        newMetaDoc.ratings[docs[i].rating]++;
        newMetaDoc.recommended[docs[i].recommend]++;
        newMetaDoc.characteristics = newMetaDoc.characteristics.map((mappedChar) => {
          let newValue;
          for (let char of docs[i].characteristics) {
            if (mappedChar['char_id'] === char['char_id']) {
              newValue = ((mappedChar.value * newMetaDoc.reviewsCount) + char.value) / (newMetaDoc.reviewsCount + 1);
              break;
            }
          }
          const updatedChar = {
            char_id: mappedChar.char_id,
            char_name: mappedChar.char_name,
            value: newValue,
          };
          return updatedChar;
        });
        newMetaDoc.reviews.push(docs[i].review_id);
        newMetaDoc.reviewsCount++;
        continue;
      }

    } else {
        productMeta.ratings[docs[i].rating]++;
        productMeta.recommended[docs[i].recommend]++;
        // Updates a new average rating for product characteristics
        productMeta.characteristics = productMeta.characteristics.map((mappedChar) => {
          let newValue;
          for (let char of docs[i].characteristics) {
            if (mappedChar['char_id'] === char['char_id']) {
              newValue = ((mappedChar.value * productMeta.reviewsCount) + char.value) / (productMeta.reviewsCount + 1);
              break;
            }
          }
          const updatedChar = {
            char_id: mappedChar.char_id,
            char_name: mappedChar.char_name,
            value: newValue,
          };
          return updatedChar;
        });
        productMeta.reviews.push(docs[i].review_id);
        productMeta.reviewsCount++;

        const fieldsToUpdate = {
          ratings: productMeta.ratings,
          recommended: productMeta.recommended,
          characteristics: productMeta.characteristics,
          reviews: productMeta.reviews,
          reviewsCount: productMeta.reviewsCount,
        };

        await ReviewsMeta.findOneAndUpdate({product_id: productMeta.product_id}, fieldsToUpdate);
    }
  }
  if (insertManyArr.length > 0) {
    await ReviewsMeta.insertMany(insertManyArr);
  }
});


const Reviews = mongoose.model('reviews', ReviewsSchema);

module.exports = Reviews;
