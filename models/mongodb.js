var config = require('../config.js');
var mongoose = require('mongoose');

mongoose.connect(config.db.mongodb);
// 链接错误
// db.on('error', function(error) {
//     console.log(error);
// });
exports.mongoose = mongoose;