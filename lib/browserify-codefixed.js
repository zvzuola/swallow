var through = require('through2');

module.exports = function(opt) {
    return through.obj(function(file, encode, done) {
        var str = file.contents.toString('utf8');
        // console.log(/data:application\/json;base64/.exec(str)[0]);
        str = str.replace(/data:application\/json;base64/, 'data:application/json;charset=utf-8;base64');
        file.contents = new Buffer(str);
        done(null, file);
    });
}