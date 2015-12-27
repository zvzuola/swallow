/**
 * ------------------------------------------------------------
 * Spliter	分隔器
 * @author	capasky(hzyangzhouzhi@corp.netease.com)
 * ------------------------------------------------------------
 */

var Component = require('../base/component.js');
var template = require('./spliter.html');
var _ = require('../base/util.js');

/**
 * @class	Spliter
 * @extend	Component
 * @param	{String}	options.direction	分隔器方向
 * @param	{Element}	options.leftEl		待调整的左侧元素
 * @param	{Element}	options.rightEl		待调整的右侧元素
 * @param	{Element}	options.topEl		待调整的上方元素
 * @param	{Element}	options.bottomEl	待调整的下方元素
 * @param	{Number}	options.min			最小调整数（px）
 * @param	{Number}	options.max			最大调整数（px）
 */
var Spliter = Component.extend({
	name: 'spliter',
	template: template,
	config: function() {
		_.extend(this.data, {
			direction: 'h', // h: 横向，v：纵向
			topEl: null,
			bottomEl: null,
			leftEl: null,
			rightEl: null,
			min: 10,
			max: 1000
		});
		this.supr();
	},
	init: function() {
		this.supr();
		this.draging = false;
		this.el = this.$refs.el;
		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseUp = this._onMouseUp.bind(this);
	},
	_onMouseDown: function(e) {
        if (e.button !== 0) {
            return;
        }
		this.draging = true;
		this.origin = {
			x: e.pageX - this.el.offsetLeft,
			y: e.pageY - this.el.offsetTop
		};
		_.dom.addClass(document.body, 'z-draging');
		_.dom.on(document.body, 'mousemove', this._onMouseMove);
		_.dom.on(document.body, 'mouseup', this._onMouseUp);
        /**
         * @event   dragstart   Spliter拖拽开始时触发
         * @param   {Object}
         */
		this.$emit('dragstart', {
			source: this
		});
	},
	_onMouseMove: function(e) {
		if (!this.draging) {
			return;
		}
		window.getSelection().removeAllRanges();
		var min = this.data.min || 10,
			max = this.data.max || screen.width;
		var x = e.pageX - this.origin.x,
			y = e.pageY - this.origin.y;
		if (x < min) {
			x = min;
		}
		if (x > max) {
			x = max;
		}
		if (this.data.direction === 'h') {
			this.el.style.left = x - 2 + 'px';
			if (this.data.leftEl) {
				this.data.leftEl.style.width = x + 'px'
			}
			if (this.data.rightEl) {
				this.data.rightEl.style.left = x + 'px';
			}			
		} else {
			this.el.style.top = y - 2 + 'px';
			if (this.data.topEl) {
				this.data.topEl.style.height = y + 'px'
			}
			if (this.data.bottomEl) {
				this.data.bottomEl.style.top = y + 'px';
			}	
		}
	},
	_onMouseUp: function(e) {
		this.draging = false;
		_.dom.delClass(document.body, 'z-draging');
		_.dom.off(document.body, 'mousemove', this._onMouseMove);
		_.dom.off(document.body, 'mouseup', this._onMouseUp);
        /**
         * @event   dragstart   Spliter拖拽结束时触发
         */
		this.$emit('dragend', {
			source: this
		});
	}
});

module.exports = Spliter;