const express = require("express");
// Express Router
const router = express.Router();
// function for handling async errors
const wrapAsync = require("../utils/wrapAsync");
// class for displaying message and stataus codes
const ExpressError = require("../utils/ExpressError");
// importing the model of the db schema
const CampGround = require("../models/campground");
// validation of campground and reviews using JOI
const { campgroundSchema } = require("../schemas");

// Validation middleware
const joiValidateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Campground Routes
// get all campgrounds
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const campgrounds = await CampGround.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// form for creating new campground
router.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// for creating new campground
router.post(
  "/",
  joiValidateCampground,
  wrapAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);

    const campground = new CampGround(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// get campground by id
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show", { campground });
  })
);
// get edit page for campground by id
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);
// update the campground by id
router.put(
  "/:id",
  joiValidateCampground,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
// delete a campground by id
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

module.exports = router;
