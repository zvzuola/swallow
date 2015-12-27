'use strict';

var SourceComponent = require('../base/sourceComponent.js');
var template = require('./articleList.html');
var _ = require('../base/util.js');

var articleList = SourceComponent.extend({
    name: 'articleList',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            source: [],
        });
        this.supr();
    }
});

module.exports = articleList;