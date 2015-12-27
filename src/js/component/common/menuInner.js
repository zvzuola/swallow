/**
 * ------------------------------------------------------------
 * MenuInner       菜单组件
 * @author   hzyangzhouzhi(hzyangzhouzhi@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var SourceComponent = require('../base/sourceComponent.js');
var template = require('./menuInner.html');
var _ = require('../base/util.js');

var MenuInner = SourceComponent.extend({
	name: 'menuInner',
	template: template,
	config: function() {
		this.supr();
		this.root = this.$parent.root;
	},
	init: function() {
		//将内部的引用映射至根Menu的 $refs 中作为根组件的引用
		this.$refs && _.extend(this.root.$refs, this.$refs);
		this.supr();
	}
});
module.exports = MenuInner;