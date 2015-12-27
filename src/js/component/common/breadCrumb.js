/**
 * ------------------------------------------------------------
 * BreadCrumb   面包屑（路径栏）
 * @author      capasky(hzyangzhouzhi@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var _ = require('../base/util.js');
var Component = require('../base/component.js');
var template = require('./breadCrumb.html');

var ContextMenu = require('./contextMenu.js');

var STACK_TRIGGER_WIDTH = 30;

/**
 * @class BreadCrumb
 * @extend Component
 */
var BreadCrumb = Component.extend({
    name: 'breadCrumb',
    template: template,
    config: function() {
        _.extend(this.data, {
            paths: [],
            stack: [],
            showStack: false,
            current: undefined,
            overflow: false,
            pathNav: true
        });
        this.supr();
        this.$watch('paths', function() {
            this.$update();
            setTimeout(this.layout.bind(this), 0);
        });
    },
    init: function() {
        this.supr();
        this.stackMenu = new ContextMenu({
            data: {
                source: { children: [] },
                'class': 'u-menu-breadcrumb',
                'showTip': true
            },
            events: {
                itemclick: function(e) {
                    var path = this.getPath(e.id);
                    path && this._onPathClick(path);
                }.bind(this)
            }
        });
        this._coms.push(this.stackMenu);
    },
    getPath: function(id) {
        var path = null;
        this.data.paths.some(function(c) {
            if (c.id == id) {
                path = c;
                return true;
            }
            return false;
        });
        return path;
    },
    /**
     * @private
     */
    _onPathClick: function(item) {
        /**
         * @event   itemclick   路径栏中的某个路径项目单击时触发
         * @param   {Object}    $event.source   事件触发源
         * @param   {Object}    $event.target   事件触发目标，即被单击的路径项目
         */
        this.$emit('itemclick', {
            source: this,
            target: item
        });
    },
    _onPathSplitClick: function(item) {
        /**
         * @event   itemclick   路径栏中的某个路径分隔器单击时触发
         * @param   {Object}    $event.source   事件触发源
         * @param   {Object}    $event.target   事件触发目标，即被单击的路径分隔器
         */
        this.$emit('spliterclick', {
            source: this,
            target: item
        });
    },
    _onStackClick: function(e) {
        var rect = this.$refs.stack.getBoundingClientRect();
        this.stackMenu.showMenu(rect.left, rect.bottom);
    },
    /**
     * 在数据变更到视图后对视图进行调整
     */
    layout: function() {
        var container = this.$refs.container,
            containerWidth = container.offsetWidth,
            i = this.data.paths.length - 1,
            edge,
            path,
            el,
            totalWidth = 0,
            edgeWidth = 0;
        //计算每个路径项的宽度，求临界路径项
        for(; i >= 0; i--) {
            path = this.data.paths[i];
            el = document.getElementById('m_bc_path_' + path.id);
            if (!el) { continue; }
            edgeWidth = totalWidth;
            totalWidth += el.offsetWidth;
            if (totalWidth + STACK_TRIGGER_WIDTH >= containerWidth) {
                edge = this.data.paths[i + 1];
                break;
            } 
        }
        if (!edge) {
            this.data.right = 'auto';
            this.data.showStack = false;
        } else {
            this.data.right = containerWidth - edgeWidth - STACK_TRIGGER_WIDTH + 'px';
            this.data.showStack = true; //显示折叠路径栈触发按钮
            this.stackMenu.data.source.children = this.data.paths.slice(0, i + 1).reverse().map(function(item){ return { id: item.id, menuName: item.name };});
        }
        
        this.$update();
    }
});

module.exports = BreadCrumb;
