const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // import your User mongoose model
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        // ✅ If no user by googleId, check if a user exists with same email
        if (!user) {
          const email = profile.emails[0].value;
          user = await User.findOne({ email });

          if (user) {
            // User exists with this email but no googleId → update it
            user.googleId = profile.id;
            await user.save();
          } else {
            // No user with this email → create new
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: email,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);