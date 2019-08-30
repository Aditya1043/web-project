var express = require('express')
var path = require('path') 
var fs =require('fs')
var app = express()
var session = require('express-session');
var ejs = require('ejs')
var nodemailer = require('nodemailer');
var multer  = require('multer');
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const storage = multer.diskStorage({
	destination: './public/uploads/',
	filename: function(req, file,cb){
		cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({
	storage : storage,
	limits:{fileSize: 1000000},
	fileFilter: function(req,file,cb){
		checkFileType(file,cb);
	}
}).single('profilePhoto');

function checkFileType(file,cb)
{
	const filetypes = /jpeg|jpg|png|gif/;
	const extname =filetypes.test( path.extname(file.originalname).toLowerCase());
	const mimetype = filetypes.test(file.mimetype);
	if(mimetype && extname){
		return cb(null,true);
	}
	else{
		cb('Error:Images only!');
	}
}

app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true})); 
app.use(express.json()); 
app.use(session({secret: "xYzUCAchitkara"}));

var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost/project1';

mongoose.connect(mongoDB);

mongoose.connection.on('error', (err) => {
    console.log('DB connection Error');
});

mongoose.connection.on('connected', (err) => {
    console.log('DB connected');
});
 
var informationSchema = new mongoose.Schema({
	name: String,
  	email: String,
	pass: String,
	dob: String,
	gender: String,
	city: String,
	role: String,
	status:String,
	phone: String,
	flag: String,
	first: String,
	path: String,
	comm: [String],
	commreq: [String]
})
	
var information = mongoose.model('information', informationSchema);

var communitySchema = new mongoose.Schema({
	createrEmail: String,
	name: String,
	description: String,
	rule: String,
	path: String,
	date: String,
	location: String,
	state: String,
	users: [String],
	requested: [String]
})
	
var community = mongoose.model('community', communitySchema);

var tagSchema =  new mongoose.Schema({
	tagName: String,
	createdBy: String,
	date: String
})

var tag = mongoose.model('tag',tagSchema);

app.get('/home' , (req,res)=>{
  res.render('home');
})

app.get('/adduser' , (req,res)=>{
  res.render('adduser');
})

app.get('/firstLogin' , (req,res)=>{
  res.render('firstLogin');
})

app.get('/userlist' , (req,res)=>{
  res.render('userlist');
})

app.get('/changepass' , (req,res)=>{
  res.render('changepass');
})

app.get('/userchangepass' , (req,res)=>{
  res.render('userchangepass');
})

app.get('/userhome' , (req,res)=>{
  res.render('userhome');
})

app.get('/usercommunity' , (req,res)=>{
  res.render('usercommunity');
})

app.get('/showcommunity' , (req,res)=>{
  res.render('showcommunity');
})

app.get('/comshowcom' , (req,res)=>{
  res.render('comshowcom');
})

app.get('/community' , (req,res)=>{
  res.render('community');
})

app.get('/createcommunity' , (req,res)=>{
  res.render('createcommunity');
})

app.get('/communityhome' , (req,res)=>{
  res.render('communityhome');
})

app.get('/communitychangepass' , (req,res)=>{
  res.render('communitychangepass');
})

app.get('/admincom' , (req,res)=>{
  res.render('admincom');
})

app.get('/comprofile' , (req,res)=>{
  res.render('comprofile');
})

app.get('/comuserprofile' , (req,res)=>{
  res.render('comuserprofile');
})

app.get('/memlist' , (req,res)=>{
  res.render('memlist');
})

app.get('/comsettings' , (req,res)=>{
  res.render('comsettings');
})

app.get('/tag' , (req,res)=>{
	res.render('tag');
  })

app.get('/taglist' , (req,res)=>{
res.render('taglist');
})

app.get('/adminuserhome' , (req,res)=>{
	res.render('adminuserhome');
})

app.get('/homewithedit' , (req,res)=>{
	res.render('homewithedit');
})

app.get('/updateProfile' , (req,res)=>{
	res.render('updateProfile');
})

app.get('/userupdateProfile' , (req,res)=>{
	res.render('userupdateProfile');
})

app.post('/editProfile' , (req,res)=>{
	information.findOneAndUpdate(
		{
			email: req.session.email,
		},
		{
			name: req.body.fullname,
			dob:req.body.dob,
			gender:req.body.gender,
			phone:req.body.phone,
			city:req.body.city,
			first:"0",
			status:"Confirmed"
		},
		{
				new: true,                       // return updated doc
				runValidators: true              // validate before update
			})
			.then(data => {
				if(data.role=="user")
					res.render('userhome');
				else if(data.role=="admin")
					res.render('home');
				else
					res.render('communityhome');
			})
				.catch(err => {
					console.error(err)
					res.send(error)
				})
})

app.post('/register',function (req, res) {
  let newUser = new information({
    name: req.body.name,
	email: req.body.email,
	pass: req.body.pass,
	phone: req.body.phone,
	city: req.body.city,
	role: req.body.role,
	status:"Pending",
	flag:"0",
	first: "1"
  })
  newUser.save()
   .then(data => {
    // console.log(data)
     res.send(data)
   })
   .catch(err => {
     //console.error(err)
     res.send(error)
   })
})

app.post('/auth',function(req,res){
    information.findOne({ 
        email: req.body.name,
		pass: req.body.pass
    },function(err,user)
	{
		if(err){
			return res.status(500).send();
		}
		if(!user){
			return res.send(JSON.stringify({check:"0"}));
		}
		//console.log(user);
		return res.send(JSON.stringify({check:"1",first:user.first,role:user.role,flag:user.flag}));
	})
});

app.post('/login',function(req,res){
  if(req.session.isLogin){
    //proceed 
	console.log("Thankyou");
    res.send("Thankyou");
 } else {
   //Ask for id password 
   req.session.isLogin = 1;
	 req.session.email = req.body.name;
   //console.log(req.body.name);
    res.send("Welcome");
 }  
  
})

app.get('/data',function(req,res){
	//console.log(req.session.email);
	information.find({ 
				 // search query
         "email":  req.session.email
    })
	.then(data => {
       // console.log(data)
        res.send(data)
      })
      .catch(err => {
        //console.error(err)
        res.send(error)
      })
})

app.post('/changeP',function(req,res){
	information.findOneAndUpdate(
	{
		email: req.session.email,
		pass: req.body.oldp
	},
	{
		pass: req.body.newp
	},
	{
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
		//console.log(data);
        if(data==null){
			return res.send("0");
		}
		return res.send("1");
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

/*app.post('/newcol',function(req,res){
	information.updateMany(
	{
	},
	{
		first: "1"
	},
	{
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
		return res.send("1");
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.get('/count',function(req,res){
	        information.count(
			{},
			function(error, numOfDocs){
            if (error) throw error;
			res.send(JSON.stringify(numOfDocs));
        })
})*/

app.post('/userlist',function(req,res){
	//console.log(req.body);
	var col=req.body.order[0].column;
	var dir=req.body.order[0].dir;
	var dataCol={
			0:"email",
			1:"phone",
			2:"city",
			3:"status",
			4:"role"
	}
	var dataDir={
			"asc":1,
			"desc":-1 
	}
	
	getdata(dataCol[col],dataDir[dir]);

function getdata(colname,sortorder)
{
	var number;
	 var x=information.count({},function(err,count){
			 console.log('number of users :'+count);
			 number=count;
	 });
	var start=req.body.start;
	var length=req.body.length;
	var role=req.body.role;
	var status=req.body.status;
	var search=req.body.search.value;
	var findobj={};
	console.log(role,status);
	if(role!="All")
		 { findobj.role=role;}
	else{
			delete findobj["role"];
	}
	if(status!="All")
			{findobj.status=status;}
	else{
			delete findobj["status"];
	}

	if(search!='')
			findobj["$or"]= [{
			"email":  { '$regex' : search, '$options' : 'i' }
	}, {
			"city": { '$regex' : search, '$options' : 'i' }
	},{
			"status":  { '$regex' : search, '$options' : 'i' }
	},{
			"role": { '$regex' : search, '$options' : 'i' }
	}]
	else{
			delete findobj["$or"];
	}
							
	

	var length;
	information.find(findobj).then(data=>length=data.length).catch(err=>console.log(err));
	information.find(findobj).skip(parseInt(start)).limit(parseInt(length)).sort({[colname] : sortorder})
	.then(data => {
				res.send({
			 "recordsTotal":String(number),
			 "recordsFiltered":length,
			 "start":parseInt(start),
			 "length":parseInt(length),data})
 })
 .catch(err => {
	 console.error(err)
	 res.send("error getting info ")
 });
}
})

app.post('/comlist',function(req,res){
	//console.log(req.body);
	var col=req.body.order[0].column;
	var dir=req.body.order[0].dir;
	var dataCol={
			0:"name",
			1:"rule",
			2:"location",
			3:"createrEmail",
			4:"date"
	}
	var dataDir={
			"asc":1,
			"desc":-1 
	}
	
	getdata(dataCol[col],dataDir[dir]);

function getdata(colname,sortorder)
{
	var number;
	 var x=community.count({},function(err,count){
			 console.log('number of users :'+count);
			 number=count;
	 });
	var start=req.body.start;
	var length=req.body.length;
	var rule=req.body.rule;
	var search=req.body.search.value;
	var findobj={};
	console.log(rule);
	if(rule!="All")
		 { findobj.rule=rule;}
	else{
			delete findobj["rule"];
	}

	if(search!='')
			findobj["$or"]= [{
			"name":  { '$regex' : search, '$options' : 'i' }
	}, {
			"location": { '$regex' : search, '$options' : 'i' }
	}]
	else{
			delete findobj["$or"];
	}
							
	

	var length;
	community.find(findobj).then(data=>length=data.length).catch(err=>console.log(err));
	community.find(findobj).skip(parseInt(start)).limit(parseInt(length)).sort({[colname] : sortorder})
	.then(data => {
				res.send({
			 "recordsTotal":String(number),
			 "recordsFiltered":length,
			 "start":parseInt(start),
			 "length":parseInt(length),data})
 })
 .catch(err => {
	 console.error(err)
	 res.send("error getting info ")
 });
}
})

app.post('/update',function(req,res){
	information.findOneAndUpdate(
	{
		email: req.body.old
	},
	{
		email: req.body.email,
		phone: req.body.phone,
		city: req.body.city,
		status: req.body.status,
		role: req.body.role
	},
	{
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
		res.send(data);
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.post('/updatecom',function(req,res){
	community.findOneAndUpdate(
	{
		_id: req.body.id
	},
	{
		name: req.body.name,
		state: req.body.state
	},
	{
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
		res.send(data);
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})


app.post('/yes',function(req,res){
	information.findOneAndUpdate(
	{
		_id: req.body.id
	},
	{
		flag: req.body.flag
	},
	{
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
		res.send(data);
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.post('/send',function(req,res){
	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
    service: 'gmail',
    auth: {
      user: 'adityaaggarwal32124@gmail.com', // generated ethereal user
      pass: '' // generated ethereal password
    }
  });

  let mailOptions = {
    from: '"Aditya" <adityaaggarwal32124@gmail.com>', // sender address
    to: req.body.email, // list of receivers
    subject: req.body.sub, // Subject line
    html: '<html><body>'+req.body.write+'</body></html>'
  };
  transporter.sendMail(mailOptions,function(error,info){
	if(error){
		console.log(error);
	}else
	{
		console.log('Email send: ' + info.response);
	}
  })
})

app.post('/upload',function(req,res){
	upload(req,res,(err)=>	{
		if(err){
			res.render('firstLogin',{
					msg: err
			});
		}
		else{
				if(req.file == undefined){
					res.render('firstLogin',{
						msg: 'Error: No File Selected!'
					});
				}
				else{
						information.findOneAndUpdate(
						{
							email: req.session.email
						},
						{
							path: req.file.path,
							first:"0",
							status:"Confirmed"
						},
						{
								new: true,                       // return updated doc
								runValidators: true              // validate before update
							})
							.then(data => {
									res.render('firstLogin',
									{
										msg:'File Uploaded',
										file:`uploads/${req.file.filename}`
									});
								})
								.catch(err => {
									res.send(err)
								})
				}
		}
	})
})

app.post('/userUpload',function(req,res){
	upload(req,res,(err)=>	{
		if(err){
			res.render('userupdateprofile',{
					msg: err
			});
		}
		else{
				if(req.file == undefined){
					res.render('userupdateprofile',{
						msg: 'Error: No File Selected!'
					});
				}
				else{
						information.findOneAndUpdate(
						{
							email: req.session.email
						},
						{
							path: req.file.path,
						},
						{
								new: true,                       // return updated doc
								runValidators: true              // validate before update
							})
							.then(data => {
									res.render('userupdateprofile',
									{
										msg:'File Uploaded',
										file:`uploads/${req.file.filename}`
									});
								})
								.catch(err => {
									res.send(err)
								})
				}
		}
	})
})

app.post('/adminUpload',function(req,res){
	upload(req,res,(err)=>	{
		if(err){
			res.render('updateProfile',{
					msg: err
			});
		}
		else{
				if(req.file == undefined){
					res.render('updateProfile',{
						msg: 'Error: No File Selected!'
					});
				}
				else{
						information.findOneAndUpdate(
						{
							email: req.session.email
						},
						{
							path: req.file.path,
						},
						{
								new: true,                       // return updated doc
								runValidators: true              // validate before update
							})
							.then(data => {
									res.render('updateProfile',
									{
										msg:'File Uploaded',
										file:`uploads/${req.file.filename}`
									});
								})
								.catch(err => {
									res.send(err)
								})
				}
		}
	})
})

app.get('/success',(req,res)=> res.render("userhome"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
var em;
var GitHubStrategy = require('passport-github').Strategy;
passport.use(new GitHubStrategy({
    clientID: "0244f12c708a5a827689",
    clientSecret: "fff9ae438ffcd99f0d86f903ea1b5dc595999d02",
    callbackURL: "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
		em=profile.id;
			information.findOne({
				'email': profile.id 
		}, function(err, user) {
				if (err) {
					return cb(err, user);
				}
				if (!user) {
						let newUser = new information({
								email: profile.id,
								role: "user",
						});
						newUser.save(function(err) {
								if (err) console.log(err);
								return cb(err, user);
						});
				} else {
						//found user. Return
						return cb(err, user);
				}
		});
  }
));

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
		req.session.email=em;
		res.redirect('/success');
});

app.get('/logout',function(req,res){    
	req.session.destroy(function(err){  
			if(err){  
					console.log(err);  
			}  
			else  
			{  
					res.redirect('/login.html');  
			}  
	});  

});  

app.post('/addcom',function(req,res){
	upload(req,res,(err)=>	{
		if(err){
			res.render('createcommunity',{
					msg: err
			});
		}
		else{
			var ab;
			if(req.file==undefined)
			ab="default.png";
			else
			ab=`uploads/${req.file.filename}`;
					let newComm = new community({
					createrEmail: req.session.email,
					name: req.body.communityName,
					description: req.body.description,
					rule: req.body.rule,
					path: ab,
					location:"Not Added",
					date: new Date().toLocaleDateString(),
					state: "true"
				})
				newComm.save()
				.then(data => {
					res.render('createcommunity');
				})
				.catch(err => {
					//console.error(err)
					res.send(null)
				})
				}
	})
})

app.post('/allcom',function(req,res){
	var search=req.body.search;
	var findobj;
	if(search!='')
	{
		findobj= {
			"name":  { '$regex' : search, '$options' : 'i' },
			"createrEmail":{$ne:req.session.email},
			"users":{$nin:[req.session.email]},
			"requested":{$nin:[req.session.email]}
		}
	}
	else
	{
		findobj={
			"createrEmail":{$ne:req.session.email},
			"users":{$nin:[req.session.email]},
			"requested":{$nin:[req.session.email]}
		}
	}
	community.find(
		findobj
	)
	.then(data => {
		res.send(data)
	})
	.catch(err => {
		res.send(err)
	})
})

app.post('/joincomm',function(req,res)
{
	if(req.body.rule=="D")
	{
			community.findOneAndUpdate(
			{
				_id:req.body.id,
			},
			{
					$push:{users:req.session.email}
			},
			{
				new:true,
				runValidators:true
			}).then(data=>{
					information.findOneAndUpdate(
					{
						email: req.session.email
					},
					{
						$push:{comm:req.body.id}
					},
					{
						new:true,
						runValidators:true
					}).then(data=>{
					}).catch(err=>{})
				res.send(data);
			}).catch(err=>{
				console.log(err);
				res.send(err);
			})
	}
	else
	{
			community.findOneAndUpdate(
			{
				_id:req.body.id,
			},
			{
					$push:{requested:req.session.email}
			},
			{
				new:true,
				runValidators:true
			}).then(data=>{
				information.findOneAndUpdate(
					{
						email: req.session.email
					},
					{
						$push:{commreq:req.body.id}
					},
					{
						new:true,
						runValidators:true
					}).then(data=>{
					}).catch(err=>{})
				res.send(data);
			}).catch(err=>{
				console.log(err);
				res.send(err);
			})
	}
})

app.get('/getccomm',function(req,res)
{
  community.find({createrEmail:req.session.email})
  .then(data=>
  {
    res.send(data);
  }).catch(err=>{res.send(err)});
});

app.get('/getjoincomm',function(req,res)
{
  community.find({users:{$all:[req.session.email]}})
  .then(data=>
  {
    res.send(data);
  }).catch(err=>{
		res.send(err)});
})

app.get('/reqcomm',function(req,res)
{
  community.find({requested:{$all:[req.session.email]}})
  .then(data=>
  {
    res.send(data);
  }).catch(err=>{
		res.send(err)});
})

app.post('/setcomid',function(req,res)
{
		req.session._id=req.body.id;
		res.send();
})

app.get('/getdetails',function(req,res)
{
	//console.log(req.session.id);
	community.find({
		_id: req.session._id
	}).then(data =>
		{
			res.send(data);
		}).catch(err=>{
			res.send(err)
		})
})

app.post('/cancelreq',function(req,res)
{
	community.findOneAndUpdate({
		_id: req.body.id
	},
	{
		 $pull : { "requested" :  req.session.email}
	},
	{
		new:true,
		runValidators:true
	}).then(data=>{
			information.findOneAndUpdate(
			{
				email: req.body.email // search query
			}, 
			{
				$pull: { commreq:req.body.id  } 
			},
			{
				new: true,                       // return updated doc
				runValidators: true              // validate before update
			})
		 	.then(data => {	 					
			})
			.catch(err => {
				console.error(err)
				res.send(error)
			})
		res.send(data);
	}).catch(err=>{})
})

app.post('/ownerinfo',function(req,res){
	information.find({ 
		"email":  req.body.email
	})
	.then(data => {
		res.send(data)
	})
	.catch(err => {
		res.send(error)
	})
})

app.post('/accepted',function (req, res) {
	//console.log(req.body.type);
			 information.findOneAndUpdate(
			{
					email: req.body.email // search query
			}, 
			{
						$pull: { commreq:req.body.name  } ,
						$push: { comm:req.body.name  } 	 
			},
			{
				new: true,                       // return updated doc
				runValidators: true              // validate before update
			})
		 .then(data => {
				 //console.log(data)
				 community.findOneAndUpdate(
					{
						 _id: req.body.name
					}, 
					{     
							 $pull: { requested: req.body.email },
							 $push: { users: req.body.email }
					},
					{
						new: true,                       // return updated doc
						runValidators: true              // validate before update
					})
					.then(data => {
							//console.log(data)
					
							res.send(data)
						})
						.catch(err => {
							console.error(err)
							res.send(error)
						})
				 res.send(data)
			 })
			 .catch(err => {
				 console.error(err)
				 res.send(error)
			 })
 })
 
 
 
 app.post('/rejected',function (req, res) {
	//console.log(req.body.type);	
			 information.findOneAndUpdate(
		 {
				email: req.body.email // search query
		 }, 
		 {
				$pull: { commreq:req.body.name  }		 
		 },
		 {
			 new: true,                       // return updated doc
			 runValidators: true              // validate before update
		 })
		 .then(data => {
				// console.log(data)
				 community.findOneAndUpdate(
					{
						 _id: req.body.name // search query
					}, 
					{
							$pull: { requested: req.body.email },
					},
					{
						new: true,                       // return updated doc
						runValidators: true              // validate before update
					})
					.then(data => {
							//console.log(data)
					
							res.send(data)
						})
						.catch(err => {
							console.error(err)
							res.send(error)
						})
				 res.send(data)
			 })
			 .catch(err => {
				 console.error(err)
				 res.send(error)
			 })
 })

 app.post('/tag',function(req,res){
	// console.log(req);
	information.find({ 
		"email":  req.session.email
		})
		.then(data => {
			let newTag = new tag({
				tagName: req.body.tagName,
				createdBy: data[0].name,
				date: new Date().toLocaleDateString()
			  })
			  newTag.save()
			   .then(data => {
				res.render('tag');
			   })
			   .catch(err => {
				 res.send(error)
			   })
		})
		.catch(err => {
		res.send(error)
	})
 })
 
 app.post('/tagdata',function(req,res){
	 //console.log(req);
	var col=req.body.order[0].column;
	var dir=req.body.order[0].dir;
	var dataCol={
			0:"tagName",
			1:"createdBy",
			2:"date"
	}
	var dataDir={
			"asc":1,
			"desc":-1 
	}
	
	getdata(dataCol[col],dataDir[dir]);

function getdata(colname,sortorder)
{
	var number;
	 var x=tag.count({},function(err,count){
			 console.log('number of tags :'+count);
			 number=count;
	 });
	var start=req.body.start;
	var length=req.body.length;
	var search=req.body.search.value;
	var findobj={};

	if(search!='')
			findobj["$or"]= [{
			"tagName":  { '$regex' : search, '$options' : 'i' }
	}, {
			"createdBy": { '$regex' : search, '$options' : 'i' }
	},{
			"date":  { '$regex' : search, '$options' : 'i' }
	}]
	else{
			delete findobj["$or"];
	}
							
	

	var length;
	tag.find(findobj).then(data=>length=data.length).catch(err=>console.log(err));
	tag.find(findobj).skip(parseInt(start)).limit(parseInt(length)).sort({[colname] : sortorder})
	.then(data => {
				res.send({
			 "recordsTotal":String(number),
			 "recordsFiltered":length,
			 "start":parseInt(start),
			 "length":parseInt(length),data})
 })
 .catch(err => {
	 console.error(err)
	 res.send("error getting info ")
 });
}
})

app.post('/deleteTag',function(req,res){
	//console.log(req.body);
	tag.remove({_id: req.body.id})
    .then(data => {
		res.send(data);
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.listen(3225)