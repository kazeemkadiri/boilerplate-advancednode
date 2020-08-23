"use strict";
require("dotenv").config();
const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const app = express();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require("passport-local");
const ObjectID = require('mongodb').ObjectID;
const mongo = require('mongodb').MongoClient;

mongo.connect(process.env.DATABASE,(err, db)=>{
    if(err){ console.log(err);}
    else{ console.log("Successful db connection"); 
	passport.serializeUser((user, done)=>{
	  done(null, user._id);
	});
	
	passport.deserializeUser((id, done)=>{
	  db.collection("users")
	    .findOne({_id: new ObjectID(id)},
	      (err,doc)=>{
		done(null, doc);
	      });
	});
	
       passport.use(
	new LocalStrategy(function(username,password,done){
          db.collection("users")
            .findOne({username:username},function(err,user){
              console.log("Username:"+user.username);
              if(err){return done(err); }
	      if(!user){return done(null,false); }
	      if(password !== user.password){ return done(null,false); }
	      return done(null,user);
            });
        })
       );
           

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

//console.log(process.env.SESSION_SECRET);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());


app.route("/").get((req, res) => {
  //Change the response to render the Pug template
  res.render("index",
    {
     title:"Hello",
     message:"Please Login",
     showLogin: true
     });
});


