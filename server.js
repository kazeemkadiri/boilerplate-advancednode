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
const bcrypt = require('bcrypt');


mongo.connect(process.env.DATABASE,(err, client)=>{
    if(err){ console.log(err);}
    else{ console.log("Successful db connection"); 
	passport.serializeUser((user, done)=>{
	  done(null, user._id);
	});
	
	passport.deserializeUser((id, done)=>{
	  client.db("users_db").collection("users")
	    .findOne({_id: new ObjectID(id)},
	      (err,doc)=>{
		done(null, doc);
	      });
	});
	
       passport.use(
	new LocalStrategy(function(username,password,done){
         // console.log(username, password);
          client.db("users_db").collection("users")
            .findOne({username:username},function(err,user){
//              console.log("Username:"+user.username);
              if(err){return done(err); }
	      if(!user){return done(null,false); }
	      if(!bcrypt.compareSync(password,user.password)){ return done(null,false); }
	      return done(null,user);
            });
        })
       );
         
        app.route("/register").post((req,res,next)=>{
         // console.log("In reg route");
          client.db("users_db").collection("users")
		.findOne({username:req.body.username},
	          (err, user)=>{
                    if(err){
		     console.log("error");
                 	 //next(err); 
                    }
 		    if(user){ res.redirect("/"); }

                    //Hash password
                    let hash = bcrypt.hashSync(req.body.password,12);

	   	    client.db("users_db")
			.collection("users")
			.insertOne({
                          username:req.body.username,
                          password:hash
                        },(err, doc)=>{
                          if(err){
                            res.redirect("/");
                          }
                          else{

                            next(null, doc);
                          }
                        })
                  })
		});


	     app.use((req,res,next)=>{
                res.status(404).type("text")
	   	   .send("Not Found")
             });

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
      showLogin: true,
      showRegistration: true
    });
});

app.post("/login", 
  passport.authenticate("local",
    {failureRedirect:"/"}
  ),
function(req,res){
  res.redirect("/profile");
});

function ensureAuthenticated(req, res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}
                 
app.route("/profile")
  .get(ensureAuthenticated, function(req,res,next){
    res.render("profile",{username:req.user.username});
})

app.get("/logout",function(req, res){
  req.logout();
  res.redirect("/");
});

