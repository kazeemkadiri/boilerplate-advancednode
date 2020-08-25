"use strict";
require("dotenv").config();
const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const app = express();
const session = require('express-session');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const mongo = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const routes = require('./routes');
const auth = require('./auth');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());


mongo.connect(process.env.DATABASE,(err, client)=>{
    if(err){ console.log(err);}
    else{ console.log("Successful db connection"); 

	auth(app, client); 	
         
	routes(app, client);

	app.listen(process.env.PORT || 3000, () => {
             console.log("Listening on port " + process.env.PORT);
	});
    }
});

fccTesting(app); //For FCC testing purposes
app.set("views", "./views/pug");
app.set("view engine", 'pug');
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



