var express = require('express');
var app = module.exports = express();
var multiparty = require('multiparty');
var multipart = require('connect-multiparty');
var fs = require('fs');
var async = require('async');
var crypto = require('crypto');
var im = require('imagemagick');
gm = require('gm');
var forEach = require('async-foreach').forEach;
var exec = require("child_process").exec;

var multipartMiddleware = multipart();
var pathFullSizeImg=__base+'/uploads/fullsize/',
pathThumbsImg= __base+'/uploads/thumbs/';

app.set('views', __dirname + '/views');

function showImage(req,res,pathType){

  if(req.params!=null && req.params.img_name!=null){
    console.log("show img : "+ req.params.img_name);
    file = req.params.img_name;
    //validate if exits file
    fs.exists(pathType +file, function (exists){
      if(exists){

        res.sendFile(pathType +file);
      }
      else{

        res.sendStatus(404);
      }
    });

  }else{
    console.log("no image file ");
    //show 404 on client
    res.sendStatus(404);
  };

};
function showImageFull(req,res){
  showImage(req,res,pathFullSizeImg);
};
function showAllImages(req,res){
  fs.exists(pathFullSizeImg, function (exists){
    if(exists){
      fs.readdir(pathFullSizeImg,function(err,files){
        if(err){
          throw err; console.log(err); res.sendStatus(403);
        }
        else{
          var body="";

          forEach(files, function(item, index) {
            if(item==".DS_Store"){
              console.log("ds.storage");
            }else{
              var img = fs.readFileSync(pathFullSizeImg + item);
              console.log(item,index);
              //console.log({im : img});
              buf=  new Buffer(img).toString('base64');
              //console.log({data: data, buffer : buf});
              body+='<img src="data:image/*;base64,'+
              buf+
              '"/></body>';



            }

          });

          res.writeHead(200, {'Content-Type': 'text/html' });
          res.write(body);
          res.end();
        }
      });
    }
  });
};
function showImageThumb(req,res){
  showImage(req,res,pathThumbsImg);
};
function getSha1Photo(oldpath,_type,req,res){

  var fd = fs.createReadStream(oldpath);
  var hash = crypto.createHash('sha1');
  hash.setEncoding('hex');

  fd.on('end', function() {
    hash.end();
    var type =_type.split('/');

    console.log({type: type});
    var sha1=hash.read();
    var imgNmae=sha1+'.'+type[1];
    var base_name= pathFullSizeImg+imgNmae;
    console.log('PhotoSha1 '+ base_name); // the desired sha1sum


    saveLocalPhoto(base_name,oldpath,imgNmae,req,res,sha1);

  });

  // read all file and pipe it (write it) to the hash object
  fd.pipe(hash);
};
function saveLocalPhoto(FinalPath,OldPath,ImgName,req,res,sha1){
  fs.readFile(OldPath , function(err, data) {
    if(err){
      throw err;
      res.sendStatus(403);
      return;
    }
    fs.writeFile(FinalPath, data, function(err) {
      fs.unlink(OldPath, function(){
        if(err){
          throw err;
          res.sendStatus(403);
          return;
        };
        if(req.body!=null && req.body.user_id!=null && req.body.visible!=null){
          resizeImg(FinalPath,pathThumbsImg+ImgName,256,256,res);
          saveOnDbImgInfoUser(req,res,ImgName,sha1);
        }else{
          console.log("no atll data from user");
          res.sendStatus(403);
        }
      });
    });
  });
};
function resizeImg(src,dst,w,h,res){
  var option ={ srcData: src, width :   w, height: h};
  gm(src).resize(w, h).noProfile().write(dst, function (err) {
    if (!err) console.log('done');
  });
};
function saveOnDbImgInfoUser(req,res,ImgName, sha1){
  if(req.body!=null && req.body.user_id!=null && req.body.visible!=null){
    //validate if user exists
    var query  = db.User.where({ '_id': req.body.user_id });
    query.findOne(function (err,user){
      if(err){
        console.log("user "+req.body.user_id+" not on DB");
        console.log(err);
        res.sendStatus(403);
        return;
      }
      var img_query  = db.Img.where({ 'sha1': sha1, user_id : req.body.user_id});
      img_query.findOne(function(err,img){
        if(err){
          console.log(err);
          res.sendStatus(403);
          return;
        }else{
          if(img){

            console.log(" ya tiene esta imagen en la DB update date");
            //res.json(img);
            var img_update_query =  { 'sha1': sha1, user_id : req.body.user_id};
            db.Img.findOneAndUpdate(img_update_query,req.body,function(err,upImg){
              if(err){
                console.log(err);
                res.json(img);
                return;
              }
              console.log("img update OK");
              res.json(upImg);
            });

          }else{
            console.log("savging new img");
            var newImg= new db.Img({ file_name : ImgName, user_id : req.body.user_id,
              visible : req.body.visible=== 'true' ? true : false,
              sha1 : sha1});
              newImg.save(function(error,saved_img){
                if(error){
                  console.log('Error saving Imga ON DB');
                  res.sendStatus(404);
                }else{
                  console.log("savging new img OK");
                  res.json(saved_img);
                }
              });
            }
          }

        });

      });
    }
    else{
      res.sendStatus(403);
    }
};
  function uploadImg(req,res){

    if(req.files!=null &&req.files.img!=null){
      var oldPath = req.files.img.ws.path;
      var type=req.files.img.type;
      //  var TempNewPath =  __base+'/uploads/'+req.files.img.originalFilename;
      getSha1Photo(oldPath,type,req,res);
    }
    else{
      console.log('noImg');
      res.sendStatus(403);
    }
  };
  function getImgsByUser(req,res){
    if(req.body!=null && req.body.user_id!=null){
      var img_query  = db.Img.where({user_id : req.body.user_id});
      img_query.find(function(err,imgs){
        res.json(imgs);
      });
    }else{
      res.sendStatus(403);
    }
  };
  function upDateImgByUser(req,res){
    if(req.body!=null && req.body.user_id!=null && req.body.img_id!=null && req.body.visible!=null){
      var img_query  = db.Img.where({user_id : req.body.user_id, '_id': req.body.img_id });
      img_query.findOne(function(err,img){
        if(err){
          console.log("find one err");
          res.sendStatus(403);
          console.log(err);
          return;
        }else{
          if(img){
            console.log("imgInfo");
            console.log(img);
            var img_query_up = db.Img.where({ 'sha1': img.sha1, user_id : img.user_id});
            db.Img.findOneAndUpdate(img_query_up,req.body,function(err,upImg){
              if(err){
                res.sendStatus(403);
                console.log(err);
                return;
              }
              console.log("imgUpdate");
              res.json(upImg);
            });
          }else{
            console.log("no img on user account or user no exist");
            res.sendStatus(403);
          }
        }
      });
    }else{
      console.log("not all data uptade/img");
      res.sendStatus(403);
    }
  };

  //render apiCLiente
  app.get('/api/img/fullsize/:img_name',showImageFull);
  app.get('/api/img/thumbs/:img_name',showImageThumb);
  app.post('/api/img/upload',multipartMiddleware,uploadImg);
  //app.get('/images',showAllImages);
  //app.get('/uploads/:img_name',showImageFull);
  //render uploads for dev
  app.get('/uploads/fullsize/:img_name',showImageFull);
  app.get('/uploads/thumbs/:img_name',showImageThumb);
  app.post('/api/img/user',multipartMiddleware,getImgsByUser);
  app.post('/api/img/update/',multipartMiddleware,upDateImgByUser);
