/**
 * ------------------------------------------------------------
 * CheckGroup 多选组
 * @author   sensen(hzzhaoyusen@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var SourceComponent = require('../base/sourceComponent.js');
var template = require('./checkGroup.html');
var _ = require('../base/util.js');
var CheckEx = require('./checkEx.js');

/**
 * @class CheckGroup
 * @extend SourceComponent
 * @param {object}                  options.data                    绑定属性
 * @param {object[]=[]}             options.data.source             数据源
 * @param {number}                  options.data.source[].id        每项的id
 * @param {string}                  options.data.source[].name      每项的内容
 * @param {boolean=false}           options.data.disabled           是否禁用该组件
 * @param {boolean=false}           options.data.block              多行显示
 * @param {string=''}               options.data.class              补充class
 */
var CheckGroup = SourceComponent.extend({
    name: 'checkGroup',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            // source: [],
            checked: false
        });
        this.supr();
    },
    check: function(item, $event) {
        this.$emit('check', {
            checked: item
        });
    },
    /**
     * @method checkAll(checked) 改变所有多选的选中状态
     * @public
     * @param  {object} checked 选中状态
     * @return {void}
     */
    checkAll: function(checked) {
        this.data.source.forEach(function(item) {
            item.checked = checked;
        });
        this.$update();
        /**
         * @event checkAll 改变所有多选的选中状态时触发
         * @property {object} checked 选中状态
         */
        this.$emit('checkAll', {
            checked: checked
        });
    }
});

module.exports = CheckGroup;