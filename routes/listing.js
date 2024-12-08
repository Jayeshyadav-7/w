const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const { listingSchema } = require("../schema");
const WrapAsync = require("../utils/WrapAsync");
const ExpressError = require("../utils/ExpressError");

// Middleware for validation
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
router.get(
  "/",
  WrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings, title: "All Listings" });
  })
);

// New Route
router.get("/new", (req, res) => {
  res.render("listings/new", { title: "Create New Listing" });
});

// Show Route
router.get(
  "/:id",
  WrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate("reviews");
    if (!listing) throw new ExpressError(404, "Listing Not Found");
    res.render("listings/show", { listing, title: "Listing Details" });
  })
);

// Create Route
router.post(
  "/",
  validateListing,
  WrapAsync(async (req, res) => {
    const listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
  })
);

// Edit Route
router.get(
  "/:id/edit",
  WrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing Not Found");
    res.render("listings/edit", { listing, title: "Edit Listing" });
  })
);

// Update Route
router.put(
  "/:id",
  validateListing,
  WrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
router.delete(
  "/:id",
  WrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect("/listings");
  })
);

module.exports = router;
