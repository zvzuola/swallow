/**
 * ------------------------------------------------------------
 * CheckEx   多选按钮
 * @author   sensen(hzzhaoyusen@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('../base/component.js');
var template = require('./checkEx.html');
var _ = require('../base/util.js');

/**
 * @class CheckEx
 * @extend Component
 * @param {object}                  options.data                    绑定属性
 * @param {string=''}               options.data.name               多选按钮的文字
 * @param {object=null}             options.data.checked            多选按钮的选择状态
 * @param {boolean=false}           options.data.disabled           是否禁用该组件
 * @param {boolean=false}           options.data.block              是否以block方式显示
 * @param {string=''}               options.data.class              补充class
 */
var CheckEx = Component.extend({
    name: 'checkEx',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            name: '',
            checked: false,
            disabled: false
        });
        this.supr();
    },
    /**
     * @method check(checked) 改变选中状态
     * @public
     * @param  {boolean} checked 选中状态
     * @return {void}
     */
    check: function(checked) {
        if(this.data.disabled)
            return;

        this.data.checked = checked;
        /**
         * @event check 改变选中状态时触发
         * @property {boolean} checked 选中状态
         */
        this.$emit('check', {
            checked: checked
        });
    }
});

module.exports = CheckEx;