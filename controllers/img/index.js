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
  //validate if exits file
  if(req.params!=null && req.params.img_name!=null){
    console.log("show img Full: "+ req.params.img_name);
    file = req.params.img_name;

    fs.exists(pathType +file, function (exists){
      if(exists){
        //download image on client
        // res.writeHead(200, {'Content-Type': "image/*"});
        // fs.createReadStream(pathFullSizeImg +file).pipe(res);

        //show image on client
        var img = fs.readFileSync(pathType + file);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<html><body><img src="data:image/*;base64,');
        res.write(new Buffer(img).toString('base64'));
        res.end('"/></body></html>');
      }
      else{
        res.sendStatus(403);
      }
    });
    //
    // var img = fs.readFileSync(pathFullSizeImg + file);//err?validate
    // res.writeHead(200, {'Content-Type': 'image/*' });
    // res.write(img, 'binary');
    // res.end();
    // fs.readFile(pathFullSizeImg +file, function(err, data) {
    //   res.writeHead(200, {'Content-Type': 'text/html'});
    //   fs.createReadStream(pathFullSizeImg +file).pipe(response);
    //   res.write('<html><body><img src="data:image/*;base64,')
    //   res.write(new Buffer(data).toString('base64'));
    //   res.end('"/></body></html>');
    // });
  }else{
    console.log("no image file ");
    res.sendStatus(403);
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
          // files.forEach(function(file){
          //   if(file==".DS_Store"){
          //     console.log("ds.storage");
          //   }else{
          //     console.log({file : file});
          //     fs.readFile(pathFullSizeImg+file,function (err,data){
          //       if(err){console.log({err: err}); throw err; res.sendStatus(403); return;}
          //       else{
          //       //  console.log({data: data});
          //         buf=  new Buffer(data).toString('base64');
          //         //console.log({data: data, buffer : buf});
          //         body+='<img src="data:image/*;base64,'+
          //         buf+
          //         '"/></body>';
          //         console.log({body: body});
          //         // res.write('<img src="data:image/*;base64,')
          //         // res.write(new Buffer(data).toString('base64'));
          //         // res.write('"/></body>');
          //       }
          //     });
          //
          //   }
          // });
          //res

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

              // fs.readFileSync(pathFullSizeImg+item,function (err,data){
              //   if(err){console.log({err: err}); throw err; res.sendStatus(403); return;}
              //   else{
              //
              //     //  console.log({data: data});
              //     buf=  new Buffer(data).toString('base64');
              //     //console.log({data: data, buffer : buf});
              //     body='<img src="data:image/*;base64,'+
              //     buf+
              //     '"/></body>';
              //     //  console.log({body: body});
              //     // res.write('<img src="data:image/*;base64,')
              //     // res.write(new Buffer(data).toString('base64'));
              //     // res.write('"/></body>');
              //   }
              // });

            }
            // Synchronous.
          });
          //console.log({body: body});
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
        resizeImg(FinalPath,pathThumbsImg+ImgName,256,256,res);
        // im.resize({
        //   srcPath: FinalPath,
        //   dstPath: pathThumbsImg+ImgName,
        //   width:   200
        // }, function(err, stdout, stderr){
        //   if (err){
        //     console.log(err,stdout,stderr);
        //     throw err;
        //     res.sendStatus(403); return;
        //   }
        //
        //   console.log('resized image to fit within 200x200px',stdout,stderr);
        //
        //   });
        saveOnDbImgInfoUser(req,res,ImgName,sha1);

      });
    });
  });
};
function resizeImg(src,dst,w,h,res){
  var option ={ srcData: src, width :   w, height: h};
  console.log(option);
  gm(src)
  .resize(w, h)
  .noProfile()
  .write(dst, function (err) {
    if (!err) console.log('done');
  });
}
function saveOnDbImgInfoUser(req,res,ImgName, sha1){
  if(req.body!=null && req.body.user_id!=null && req.body.visible!=null){
    //validate if user exists?

    var newImg= new db.Img({
      file_name : ImgName,
      user_id : req.body.user_id,
      visible : req.body.visible=== 'true' ? true : false,
      sha1 : sha1});
      newImg.save(function(error,saved_img){
        if(error){
          console.log('Error saving Imga ON DB');
          res.sendStatus(404);
        }else{
          res.json(saved_img);
        }
      });
    };

  }
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

  app.get('/api/img/fullsize/:img_name',showImageFull);
  app.get('/api/img/thumbs/:img_name',showImageThumb);
  app.post('/api/img/upload',multipartMiddleware,uploadImg);
  app.get('/images',showAllImages);
  //app.get('/uploads/:img_name',showImageFull);
  app.get('/uploads/fullsize/:img_name',showImageFull);
  app.get('/uploads/thumbs/:img_name',showImageThumb);
