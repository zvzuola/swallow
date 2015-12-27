/**
 * ------------------------------------------------------------
 * Nav       菜单组件
 * @author   hzyangzhouzhi(hzyangzhouzhi@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';
var Regular = require('regularjs');
var SourceComponent = require('../base/sourceComponent.js');
var template = require('./menu.html');
var _ = require('../base/util.js');
var MenuInner = require('./menuInner.js');
var MenuMgr = {};

/**
 * 菜单组件
 * @class Menu
 * @extends {SourceComponent}
 * @source
 * {
 *       menuName: 'Menu',//留空时菜单默认显示
 *       icon: '',
 *       'class': '',
 *       children: [{
 *       	action: null
 *          menuName: 'Action 01',
 *          children: [{
 *               menuName: 'SubSub 01'
 *           }]
 *       }, {
 *           menuName: 'Action 02',
 *           disabled: true //禁用菜单
 *       }, {
 *           gutter: true //分割线
 *       }, {
 *           menuName: 'Action 03'
 *       }]
 * }
 * @event itemclick 每个菜单项点击时触发，被禁用的项目及存在子菜单的项目不会触发
 *        			事件回调传入定义菜单时的 id,action
 */
var Menu = SourceComponent.extend({
	name: 'menu',
	template: template,
    /**
     * @protected
     */
    config: function(autoShow) {
    	this.autoShow = autoShow === undefined ? true : autoShow;
    	_.extend(this.data, {
    		source: {},
    		btn: false, //是否显示为按钮
    		split: false, //splitbutton，btn为 true 时生效
    		show: true //菜单默认显示
    	});
    	MenuMgr.preProcess(this.data.source);
    	//对于Dropdown Menu，菜单默认不显示
    	if (!this.autoShow || !!this.data.source.menuName) {
    		this.data.show = false;
    		MenuMgr.registOpen(this);
    	}
		this.root = this;
    	this.supr();
    },
    /**
     * 切换菜单显示
     * @param  {Boolean|Event} open 传入布尔值时设置显示或隐藏，否则切换菜单显示
     */
    toggle: function(open){
    	var state = this.data.show;
    	(!state || open) && MenuMgr.closeAllMenus(); //需要切换到打开时
    	open && open.stopPropagation && (open.stopPropagation());
		var _state = typeof open === 'boolean' ? open : !state
    	this.$update('show', _state);
		this.$emit('toggle', { state: _state });
    	return false;
    },
    _click: function(e) {
    	if (this.data.btn && this.data.split) {
    		this.$emit('click');
    	} else {
    		this.toggle();
    	}
    },
    _splitClick: function(e) {
    	if (this.data.btn && this.data.split) {
    		this.toggle();
    	}
    	return this;
    },
    /**
     * @private
     */
    action: function(e, menu) {
    	if (e.target.tagName !== 'A') return true;
    	if (Regular.dom.hasClass(e.target, 'z-disabled') ||
    		Regular.dom.hasClass(e.target.parentNode, 'u-menu')) {
    		e.stopPropagation(); // 禁用的项目及二级菜单单击不关闭菜单
    		return false;
    	}
    	var id = e.target.dataset['id'],
    		node = MenuMgr.getNode(id) || menu;
    	if (node && node.url) {
    		return true; //链接不处理
    	}
    	this.$emit('itemclick', node);
    	this.data.show = false;
    	return true;
    },
    /**
     * 获取菜单项目
     * @param   {string|number} id  项目id或名称
     */
    getItem: function(id) {
        var item = null;
        _.treeWalker(this.data.source, 'children', function(node) {
            if (node.id == id || node.menuName == id || node.name == id) {
                item = node;
                return false;
            }
        });
        return item;
    },
    /**
     * 切换菜单项目显示或隐藏
     * @param   {string|number} id  项目id或名称
     * @param {Boolean} state 项目状态
     */
    toggleItem: function(id, state) {
        var node = this.getItem(id);
        if (node) {
            node.hide = _.isBoolean(state) ? !state : !node.hide;
        }
    },
    /**
     * 显示菜单项目
     * @param   {string|number} id  项目id或名称
     */
    showItem: function(id) {        
        var node = this.getItem(id),
            source = this.data.source.children;
        if (node) {
            node.hide = false;
            var i = source.indexOf(node),
                j = i + 1;
            while(i > 0 && !source[i].gutter && !source[i].hide) {
                i--;
            }
            if (source[i] && source[i].gutter) {
                source[i].hide = false;
            }
            while(j < source.length  && !source[j].gutter && !source[j].hide) {
                j++;
            }
            if (source[j] && source[j].gutter) {
                source[j].hide = false;
            }            
        }
    },
    /**
     * 隐藏菜单项目
     * @param   {string|number} id  项目id或名称
     */
    hideItem: function(id) {
        var node = this.getItem(id),
            visibleItems, 
            c = 0,
            i = 0, 
            len = 0;
        if (node) {
            node.hide = true;
            visibleItems = this.data.source.children.filter(function(i) { return !i.hide; });
            len = visibleItems.length;
            if (!len) return;
            if (visibleItems[0].gutter) {
                visibleItems[0].hide = true;
            } else if (visibleItems[len - 1].gutter) {
                visibleItems[len - 1].hide = true;
            } else {
                for (; i < len; i++) {
                    var item = visibleItems[i];
                    if (item.gutter) {
                        if (c < 2) {
                            c++;
                        } else {
                            item.hide = true;
                            break;
                        }
                    } else {
                        c = 0;
                    }
                }
            }            
        }
    },
    hideAll: function() {
        this.data.source.children.forEach(function(item) {
            item.hide = true;
        });
    }
});

/**
 * 菜单管理器
 * @class MenuMgr
 * @static
 */
MenuMgr = (function(){
	var id = 1,
		cache = {},
		opens = [];
	function ider(nodes) {
		nodes && nodes.forEach(function(node){
			node._id = id++;
			cache[node._id] = node;
			if (node.children) {
				ider(node.children);
			}
		});
	}
	return {
		/**
		 * 预处理菜单节点
		 * 当前处理为为每个节点加入用于管理的 _id 属性
		 * @param  {Object} source 菜单源
		 */
		preProcess: function(source){
			ider(source.children);
		},
		/**
		 * 获取缓存中的节点
		 * @param  {Number} id 节点id，指内部id，_id 属性
		 * @return {MenuNode|Object}    若存在则返回该节点，否则返回 null
		 */
		getNode: function(id) {
			return cache[id] ? cache[id] : null;
		},
		/**
		 * 向管理器注册需要进行统一管理的菜单
		 * @param  {Menu} menu 菜单组件实例
		 */
		registOpen: function(menu) {
			if (menu instanceof Menu) {
				opens.push(menu);
			}			
		},
		/**
		 * 关闭所有注册到管理器中的菜单
		 * @param {Number} except 排除处理的菜单
		 */
		closeAllMenus: function(except){
			opens.forEach(function(item){
				item !== except && item.$update('show', false);
			});	
		}
	};
})();
Regular.dom.on(document.body, 'mouseup', MenuMgr.closeAllMenus);

module.exports = Menu;