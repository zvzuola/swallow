var restate = require('regular-state');
var Component = require('./component/base/component.js');
var App = require('./module/app.js'),
	About = require('./module/about.js'),
	Home = require('./module/home.js'),
	Write = require('./module/write.js');

var router = restate({view:document.getElementById('view'), Component: Component, rebuild: true})
    .state('app', App)
    .state('app.home', Home)
    .state('app.about', About)
    .state('app.write', Write)
    .on('notfound', function() {
        this.go('app.home');
    });

module.exports = router;