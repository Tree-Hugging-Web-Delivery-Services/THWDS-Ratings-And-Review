const Reviews = require('../models/review');

module.exports = {
  getProducts(req, res) {
    const requestQueryParams = req.query;
    res.send(requestQueryParams);
  },

  postReview(req, res) {
    const reviewProps = req.body;
    Reviews.create(reviewProps)
      .then(response => {
        res.send(response)
      })
      .catch(error => res.status(400).send('Error occurred'));
  },

  metaRequest(req, res) {
    const requestQueryParams = req.query;
    res.send(requestQueryParams);
  },
};