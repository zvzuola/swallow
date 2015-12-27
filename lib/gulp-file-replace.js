var through = require('through2'),
    gutil = require('gulp-util'),
    fs = require('fs');

module.exports = function (opts) {

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) return cb(null, file);
        if (file.isStream()) return cb(new Error('gulp-ga: streams not supported'));

        var content = file.contents.toString();
        var rfile = fs.readFileSync(opts.file);
        if (opts.minify) {
            rfile = rfile.toString().replace(/\s+/g, ' ').replace(/\n|\t/g, '');
        }
        var start = content.indexOf(opts.start),
            end = content.indexOf(opts.end);
        if (start > -1 && end > -1 && start < end && end < content.length) {
            content = content.slice(0, start + opts.start.length) + rfile + content.slice(end);
        }
        file.contents = new Buffer(content);
        cb(null, file);
    });
};