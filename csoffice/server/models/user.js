const mongoose = require('mongoose');

const { Schema } = mongoose;
// const Schema = mongoose.Schema;
// the mongoose object has a property called schema. take that property and assign it to a new variable called schema
// mongoose creates a fairly strict schema... whereas pure mongodb allows for a flexible key-value system

// must assign your key with a type value (Number, String, ...) ID's can be a series of numbers but they are given as a string
// you can add and subtract properties freely
const userSchema = new Schema({
  googleID: String
});

// the .model command we are telling mongoose that we are making a collection called 'users'
// mongoose does not overwrite existing collections. only creates if the collection doesnt exist
// this creates our 'model class' which creates a collection
// mongoose.model('users', userSchema);
module.exports = mongoose.model('users', userSchema);

// two arguments means were loading something into it.. in this case schema
// one argument means were trying to fetch something out of mongoose

// gets used passport

// goes to passport
