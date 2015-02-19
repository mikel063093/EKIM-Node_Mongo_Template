module.exports = function(mongoose) {
  console.log("Schema Img Created");
  var Schema = mongoose.Schema;

  // Objeto modelo de Mongoose
  var ImgSchema = new Schema({


    file_name : String,
    user_id : String,
    visible : Boolean,
    sha1 : String


  });


  ImgSchema.methods.getFileName = function() {

    // var edad=this.age;
    // return edad;

  };


  return mongoose.model('Img', ImgSchema);
}
