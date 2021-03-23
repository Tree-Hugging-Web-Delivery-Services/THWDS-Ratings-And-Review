const ReviewsController = require('../controllers/reviews_controller');

module.exports = (app) => {

  app.get('/reviews', ReviewsController.getProducts);
  app.post('/reviews', ReviewsController.postReview);
  app.get('/reviews/meta', ReviewsController.metaRequest);
};