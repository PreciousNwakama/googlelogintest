
const express = require('express');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
const keys = require('./config/keys');

app.set('view engine', 'ejs');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

app.get('/', function (req, res) {
    res.render('pages/auth');
});
/* Database connection */
mongoose.connect(keys.mongodb.dbURI), () => {
    console.log('Connected to mongodb')
}

/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


// /*  Google AUTH  */

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = keys.google.clientID;
const GOOGLE_CLIENT_SECRET = keys.google.clientSecret;
// const GOOGLE_CLIENT_ID = '1038202354320-jfeekfd0qjjh7lb177n19satm3pvh0s2.apps.googleusercontent.com';
// const GOOGLE_CLIENT_SECRET = 'KYx40Ci2x94HXMMd38LBWB7-';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        return done(null, userProfile);
    }
));

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/error' }),
    function (req, res) {
        // Successful authentication, redirect success.
        res.redirect('/success');
    });


const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));