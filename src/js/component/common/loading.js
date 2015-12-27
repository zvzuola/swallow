/**
 * ------------------------------------------------------------
 * Loading   加载中
 * @author   sensen(hzzhaoyusen@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('../base/component.js');
var template = require('./loading.html');
var _ = require('../base/util.js');

/**
 * @class Loading
 * @extend Component
 */
var Loading = Component.extend({
    name: 'loading',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            visible: false,
            text: ''
        });
        this.supr();
    },
    /**
     * @protected
     */
    init: function() {
        this.supr();

        if(this.$root === this)
            this.$inject(document.body);
    },
    show: function() {
        this.$update('visible', true);
    },
    hide: function() {
        this.$update('visible', false);
    }
});


module.exports = Loading;