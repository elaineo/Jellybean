var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var Beans = new Schema({
    first_name     : String,
    last_name      : String,
    photo          : String,
    user_id        : String,
    input_address  : String,
    mm_count       : Number,
    bean_count     : Number,
    value          : Number,
    paid           : Boolean,
    created_at : Date,
    expires_at : Date
});

Beans.methods.findByAddress = function (address) {
    return this.model('Beans').find({input_address: this.input_address}, address)
}

var beanDB = mongoose.model('Beans', Beans);
module.exports.Beans = mongoose.model('Beans');

Beans.pre('save', function(next){
  now = new Date();
  if ( !this.created_at ) {
    this.created_at = now;
    this.paid = false;
  }
    next();
});

mongoose.connect( 'mongodb://localhost/express-beans' );