const User = require("../models/user.js");
const passport = require("passport");

const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECREAT_KEY;

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      // Find the user based on the ID in the JWT payload
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user); // User found, authentication successful
      } else {
        return done(null, false, {
          message: "User not found or not logged in",
        }); // No user found
      }
    } catch (error) {
      return done(error, false); // Handle errors during user lookup
    }
  })
);
