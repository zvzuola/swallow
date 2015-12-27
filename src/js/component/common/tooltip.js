/**
 * ------------------------------------------------------------
 * Tooptip      工具提示
 * @author      capasky(hzyangzhouzhi@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var _ = require('../base/util.js');
var Component = require('../base/component.js');
var template = require('./tooltip.html');

/**
 * 工具提示组件
 * @class Tooltip
 * @extend  Component
 */
var Tooltip = Component.extend({
    name: 'tooltip',
    template: template,
    config: function() {
        _.extend(this.data, {
            /**
             * @param   {String}    placement   工具提示出现的位置
             */
            placement: 'bottom',
            show: false,
            delay: 0,
            animationName: 'fadeIn'
            // title: undefined,
            // tip: undefined,
            // left
            // right
            // top
            // bottom
            
        });
        this.supr();
    },
    /**
     * 显示工具提示
     * @param   {Element}   target  显示工具提示的DOM元素（可选）
     * @param   {String}    tip     工具提示的内容（可选）
     * @parma   {String}    title   工具提示的标题（可选）
     */
    show: function(target, tip, title) {
        if (target) {
            var rect = target.getBoundingClientRect(),
                cw = document.body.clientWidth,
                ch = document.body.clientHeight;
            // rect.width = rect.width || rect.right - rect.left;
            // rect.height = rect.height || rect.bottom - rect.top;
            _.extend(this.data, {
                left: 'auto',
                top: 'auto',
                right: 'auto',
                bottom: 'auto'
            }, true);
            switch (this.data.placement) {
                case 'left':
                    this.data.top = rect.top + Math.floor(rect.height/2) + 'px'; 
                    this.data.right = cw - rect.left + 'px';
                    break;
                case 'right':
                    this.data.top = rect.top + Math.floor(rect.height/2) + 'px'; 
                    this.data.left = rect.right + 'px';
                    break;
                case 'top':
                    this.data.bottom = ch - rect.top + 'px';
                    this.data.left = rect.left + Math.floor(rect.width/2) + 'px';
                    break;
                case 'bottom':
                    this.data.top = rect.bottom + 'px';
                    this.data.left = rect.left + Math.floor(rect.width/2) + 'px';
                    break;            
                default:
                    break;
            }
        }
        this.data.tip = tip || this.data.tip; 
        this.data.title = title || this.data.title; 
        this.$update('show', true);
        this.$emit('show', {
            source: this
        });
        return this;
    },
    /**
     * 隐藏工具提示
     */
    hide: function() {
        this.$update('show', false);
        this.$emit('hide', {
            source: this
        });
        return this;
    }
});
var tooltip = new Tooltip(),
    hide = tooltip.hide.bind(tooltip);
    
Component.directive({
    /**
     * r-title  工具提示
     * @example
     * <code>
     *  <button r-title="点击此处开始">Start!</button>
     * </code>
     */
    'r-title': function(elem, value) {
        _.dom.on(elem, 'mouseenter', function(e) {
            var tip = value || this.$get(value);
            tip && tooltip.show(e.target, tip);
        });
        _.dom.on(elem, 'mouseleave', hide);        
    }
});
tooltip.$inject(document.body);
Tooltip.instance = tooltip;
module.exports = Tooltip;