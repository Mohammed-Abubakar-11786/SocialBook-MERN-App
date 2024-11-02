const User = require("../models/user.js");
const passport = require("passport");

const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECREAT_KEY;
passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    // console.log(jwt_payload);

    // Make sure to use the correct query method and field
    const user = await User.findById(jwt_payload.id);
    if (user) {
      return done(null, user); // User found, authentication successful
    } else {
      return res.status(200).send({ success: false, notLogin: true });
    }
  })
);
