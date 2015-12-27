/**
 * TypeAhead
 * A mutliselect combobox
 * @author	capasky(hzyangzhouzhi@corp.netease.com)
 */

var ComboBox = require('./comboBox.js');
var template = require('./typeAhead.html');
var _ = require('../base/util.js');

/**
 * @class TypeAhead
 * @extends {ComboBox}
 */
var TypeAhead = ComboBox.extend({
	name: 'typeAhead',
	template: template,
	config: function () {
		_.extend(this.data, {
			selections: [],
			lastInput: null,
			minChars: 2
		});
		this.supr();
	},
	/**
	 * 获取 TypeAhead 控件的值
	 * @return	{Array}	值的数组
	 */
	getValue: function() {
		var valueField = this.data.valueField;
		return this.data.selections.map(function(c) { return c[valueField]; });
	},
	/**
	 * 设置 TypeAhead 控件的值
	 * @param	{Array|String}	v	设置的值，数据项的数组或以英文逗号“,”分割的值字符串
	 */
	setValue: function(v) {
		var valueField = this.data.valueField,
			displayField = this.data.displayField;
		if (typeof v === 'string') {
			v = v.split(',').map(function(c) {
				var item = {};
				item[valueField] = c;
				item[displayField] = c;
				return  item;
			});
		}
		if (_.isArray(v)) {
			v.forEach(this.listItemClick.bind(this));	
		}
	},
	/**
	 * @override
	 */
	listItemClick: function (item) {
		var id,
			valueField = this.data.valueField;
		item = item || this.data.selected;
		if (!item) {
			return;
		}
		id = item[valueField];
		if (!this.data.selections.some(function(c) { return c[valueField] == id; })) {
			//如果已存在，不添加重复项至选择
			this.data.selections.push(item);
		}
		this.data.displayValue = '';
		this.$refs.input.style.width = '1em';
		this.data.selected = null;
		this.collapse();
	},
	/**
	 * @override
	 */
	focus: function(e) {
		this.supr(e);
		this.expand();
	},
	/**
	 * @override
	 */
	 blur: function() {
		 this.data.forceSelection = true;
		 this.supr();
		 this.data.forceSelection = false;
	 },
	/**
	 * @override
	 */
	 input: function(e) {
		 var lastInput = this.data.lastInput;
		 this.data.lastInput = this.data.displayValue;
		 if (this.data.displayValue && this.data.displayValue.length < this.data.minChars) {
			 return;
		 }
		 this.supr(e);
		 var ss = this.data.selections,
		 	ssLen = ss.length;
		this.$refs.input.style.width = (this.data.displayValue.length * 1.2 + 1) + 'em';
		 //退格键并且上次输入为空
		 if (e.which === 8 && lastInput === '' && ssLen) {
			 this.removeItem(ss[ssLen - 1])
		 }
	 },
	 /**
	  * 移除选中项目
	  * @private
	  */
	 removeItem: function(item) {
		 this.data.selections.remove(item);
	 }
});

module.exports = TypeAhead;