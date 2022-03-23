const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport')
const {Strategy : googleStrategy} = require('passport-google-oauth20') 
const User = require('../model/user')
const keys = require('./keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretKey;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            const user = await User.findById(jwt_payload._id)
            if (user) {
                return done(null, user)
            }
            else {
                console.log("Error in authentication/user not found")
            }
        }
        )
    )
};


passport.use(new googleStrategy({
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID ,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/dev/api/v1/user/google/redirect"
  },
   async (accessToken, refreshToken, profile, done)=> {
       try{
          const {_json: {email, name, picture}} = profile 
          let user = await User.findOne({email})
          if(!user)
          {
            user = await User.create({email, name, isThirdPartyUser : true})
          }
         return done(null,user)
       }
       catch(err)
       {
        return done(err)
       }
  }
));