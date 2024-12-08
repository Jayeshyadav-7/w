const express = require("express");
const router = express.Router({ mergeParams: true });
const Reviews = require("../models/review");
const Listing = require("../models/listing");
const { reviewSchema } = require("../schema");
const WrapAsync = require("../utils/WrapAsync");
const ExpressError = require("../utils/ExpressError");

// Middleware for validation
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Create Review
router.post(
  "/",
  validateReview,
  WrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Reviews(req.body.review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${req.params.id}`);
  })
);

// Delete Review
router.delete(
  "/:reviewId",
  WrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Reviews.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
