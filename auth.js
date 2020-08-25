const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require('passport-local');
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app, client){

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
};
