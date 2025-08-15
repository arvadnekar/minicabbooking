const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");

dotenv.config();

require("./src/config/passport"); // just require to configure passport

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors({
  origin: "http://localhost:3001", // frontend domain
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || "oauth_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Mount routes (use distinct prefixes)
app.use("/api/auth", require("./src/routes/oauth"));
// app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/users", require("./src/routes/user"));

app.get("/", (req, res) => {
  res.send("Welcome to MiniCab backend server!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
