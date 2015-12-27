/**
 * ------------------------------------------------------------
 * Nav       导航切换
 * @author   sensen(hzzhaoyusen@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var SourceComponent = require('../base/sourceComponent.js');
var template = require('./nav.html');
var _ = require('../base/util.js');

/**
 * @class Nav
 * @extend SourceComponent
 * @param {object}                      options.data 绑定属性
 * @param {object[]=[]}                 options.data.source 数据源
 * @param {object}                      options.data.state StateMan
 */
var Nav = SourceComponent.extend({
    name: 'navInner',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            source: [],
            state: null
        });

        this.supr();

        // var $state = this.data.state;
        // if(!$state)
        //     return;

        // $state.isIn = function(state) {
        //     return $state.current.name.indexOf(state) >= 0;
        // }

        // $state.on('end', function(path) {
        //     this.$update();
        // }.bind(this));
    },
    // getUrl: function(module) {
    //     var $state = this.data.state;
    //     if($state.isIn('project.' + module))
    //         return $state.path;
    //     else
    //         return $state.path.replace(/(case|exection|settings|import|message).*$/, module);
    // }
});