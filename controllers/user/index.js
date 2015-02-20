var express = require('express');
var app = module.exports = express();
var multiparty = require('multiparty');
var multipart = require('connect-multiparty');
var fs = require('fs');
var async = require('async');
var crypto = require('crypto');
var multipartMiddleware = multipart();

app.set('views', __dirname + '/views');

app.get('/api/user/new', function(request, response) {response.render('new');});

function getAllUsers(req,res){
  db.User.find({}, function(err, users) {
    if(err){
      res.sendStatus(403);
      return;
    }
    res.json(users);
  });
}

function getInfoUserById(req,res){};

function UpdateUser(req,res){
  var u= req.body;
  if(u!=null && u.facebook_id!=null){
    var query  = db.User.where({ 'facebook_id': req.body.facebook_id });
    query.findOne(function (err,user){
      if(err){
        console.log("on find user err "+ err);
        res.sendStatus(403);
      }else{
        if(user){
          //update data user
          var query = { 'facebook_id': req.body.facebook_id };
          //  var update = new db.User(req.body);
          console.log("uPdatingDB");
          console.log(req.body);

          // for (var name in update) {
          //   console.log(name + ": " + update[name]);
          // }
          //console.log(update);
          db.User.findOneAndUpdate(query,req.body,function(err,upUser){
            if(upUser){
              console.log(upUser);
              res.json(upUser);
            }else{
              if(err){
                console.log(err);
                res.sendStatus(403);
              }else{
                res.sendStatus(403);
              }
            }
          });
        }else{
            if(err){
              console.log(err);
              res.sendStatus(403);
            }else{
              res.sendStatus(403);
            }
        }
      }
    });

  }else{
    console.log("not all data on POST Uptade user");
    res.sendStatus(403);

  }

};

function SaveUserIfNotExist(req,res){
  var query  = db.User.where({ 'facebook_id': req.body.facebook_id });
  console.log("search "+req.body.facebook_id);

  query.findOne(function(err, user) {
    if(err){
      console.log({msg: "error on search "+facebook_id, err: err});
      res.sendStatus(403);
    }else{
      if(user){
        console.log("user OK");
        //if new data UPDATE
        res.json(user);
      }else{
        console.log("No User ON DB Saving New USER");
        var u= req.body;

        if(u!=null && u.name !=null && u.age!=null &&
          u.email!=null  && u.photo_profile!=null && u.facebook_id!=null &&
          u.lat_lng!=null && u.push_type!=null &&  u.push_id!=null){
            SaveUser(req,res);
          }else{
            console.log("no saving no all data");
            res.sendStatus(403);
          }
        }
      }

    });
  };

  function SaveUser(req,res){
    var newUser= new db.User(req.body);
    newUser.save(function(error,user){
      if(error){
        console.log('Error saving user');
        res.send(403);
      }else{
        res.json(user);
      }

    });
  };

  function userRegiserLogin(req,res){
    var u= req.body;
    if(u!=null && u.name !=null && u.age!=null &&
      u.email!=null  && u.photo_profile!=null && u.facebook_id!=null &&
      u.lat_lng!=null && u.push_type!=null &&  u.push_id!=null){
        //console.log({info:"user all data OK NOT DB, SOON", user: u});
        SaveUserIfNotExist(req,res);

      }else{
        if(u!=null && u.facebook_id!=null){
          SaveUserIfNotExist(req,res);
        }else{
          res.sendStatus(403);
        }
      }
    };

    app.get('/api/user', getInfoUserById);

    app.get('/api/user/allusers',getAllUsers);

    app.post('/api/user',multipartMiddleware,userRegiserLogin);

    app.post('/api/user/update',multipartMiddleware,UpdateUser);
