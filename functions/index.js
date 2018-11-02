const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
require('dotenv').config();

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cors = require('cors'),
    app = express();

// Environment configuration
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;

// Create a server side router
var router = express.Router();

// Configure express to handle HTTP requests
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());

// Configure our Stripe secret key and object
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Define the route endpoints for our application

// Create a new charge
router.post('/charge', function(req, res){
    // Create the charge object with data from the Vue.js client
    var newCharge = {
        amount: req.body.amount,
        currency: "usd",
        source: req.body.token_from_stripe, // obtained with Stripe.js on the client side
        description: req.body.specialNote,
        receipt_email: req.body.email,

    };

    // Call the stripe objects helper functions to trigger a new charge
    stripe.charges.create(newCharge, function(err, charge) {
        // send response
        if (err){
            console.error(err);
            res.json({ error: err, charge: false });
        } else {

            //could save it to firebase too

            // send response with charge data
            res.json({ error: false, charge: charge });
        }
    });
});

// Route to get the data for a charge filtered by the charge's id
router.get('/charge/:id', function(req, res){
    stripe.charges.retrieve(req.params.id, function(err, charge) {
        if (err){
            res.json({ error: err, charge: false });
        } else {
            res.json({ error: false, charge: charge });
        }
    });
});

// Register the router
app.use('/', router);


exports.charge = functions.https.onRequest(app);
