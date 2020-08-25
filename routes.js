const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function(app, client){

         
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

	     app.use((req,res,next)=>{
                res.status(404).type("text")
	   	   .send("Not Found")
             });
};
