module.exports = function(mongoose) {
  console.log("Schema User Created");
  var Schema = mongoose.Schema;

  // Objeto modelo de Mongoose
  var UserSchema = new Schema({

    // Propiedad nombre
    name : String, // tipo de dato cadena de caracteres

    // Propiedad fecha de nacimiento
  //  birthdate : Date, // tipo de dato fecha
    age : String,

    email : String,

    photo_profile : String,

    facebook_id : String,

    lat_lng : String,

    push_type : String,

    push_id : String

  });

  // metodo para calcular la edad a partir de la fecha de nacimiento
  UserSchema.methods.getAge = function() {
    //var edad=((Date.now() - this.birthdate) / (31557600000));
    //console.log("edad "+edad);
    var edad=this.age;
    return edad;

  };
  UserSchema.methods.getName= function(){
  //  console.log(this.name);

    return this.name;
  }

  return mongoose.model('User', UserSchema);
}
