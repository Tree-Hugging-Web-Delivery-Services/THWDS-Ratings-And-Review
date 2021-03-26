const Reviews = require('../models/reviews');

module.exports = {
  getProducts(req, res, next) {
    const requestQueryParams = req.query;
    res.send(requestQueryParams);
  },

  postReview(req, res, next) {
    const reviewProps = req.body;
    Reviews.create(reviewProps)
      .then(response => res.send(response))
      .catch(next);
  },

  metaRequest(req, res) {
    const requestQueryParams = req.query;
    res.send(requestQueryParams);
  },
};