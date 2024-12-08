// Required dependencies
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const ExpressError = require("./utils/ExpressError.js");
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");

const app = express();

// MongoDB Connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// App Configurations
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/listings", listingRoutes); // Routes for listings
app.use("/listings/:id/reviews", reviewRoutes); // Nested routes for reviews

// Fallback for undefined routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("err", { message, title: "Error" });
});

// Start Server
app.listen(8080, () => console.log("Server running on port 8080"));
