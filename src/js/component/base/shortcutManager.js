/**
 * ShortcutManager 快捷键管理器
 * 修改自 https://github.com/madrobby/keymaster
 * @author hzyangzhouzhi(hzyangzhouzhi@corp.netease.com)
 */

var _ = require('./util.js'),
	dom = _.dom;
var _mods = { 16: false, 18: false, 17: false, 91: false },
	// modifier keys
    _MODIFIERS = {
		'⇧': 16, shift: 16,
		'⌥': 18, alt: 18, option: 18,
		'⌃': 17, ctrl: 17, control: 17,
		'⌘': 91, command: 91
    },
    // special keys
    _MAP = {
		backspace: 8, tab: 9, clear: 12,
		enter: 13, 'return': 13,
		esc: 27, escape: 27, space: 32,
		left: 37, up: 38,
		right: 39, down: 40,
		del: 46, 'delete': 46,
		home: 36, end: 35,
		pageup: 33, pagedown: 34,
		',': 188, '.': 190, '/': 191,
		'`': 192, '-': 189, '=': 187,
		';': 186, '\'': 222,
		'[': 219, ']': 221, '\\': 220,
		'f1': 112, 'F1': 112,
		'f2': 113, 'F2': 113,
		'f3': 114, 'F3': 114,
		'f4': 115, 'F4': 115,
		'f5': 116, 'F5': 116,
		'f6': 117, 'F6': 117,
		'f7': 118, 'F7': 118,
		'f8': 119, 'F8': 119,
		'f9': 120, 'F9': 120,
		'f10': 121, 'F10': 121,
		'f11': 122, 'F11': 122,
		'f12': 123, 'F12': 123,
    },
    code = function (x) {
		return _MAP[x] || x.toUpperCase().charCodeAt(0);
    },
    _downKeys = [],
	_modifierMap = {
      16:'shiftKey',
      18:'altKey',
      17:'ctrlKey',
      91:'metaKey'
  };;

var ShortcutManager = function (options) {
	this.options = {};
	_.extend(this.options, options);
	this.el = document;
	this.scope = '';
	this.init();
};
_.extend(ShortcutManager.prototype, {
	constructor: ShortcutManager,
	keydown: 'keydown',
	keyup: 'keyup',
	/**
	 * 初始化 ShortcutManager
	 */
	init: function () {
		//快捷键处理器对象集合，结构如下：
		// [
		// 	'31': [{
		// 		shortcut: 'ctrl+a',
		// 		method: function(){},
		// 		mods: [17],
		// 		key: 'ctrl+a'
		// 	}]
		// ]
		this._handlers = [];
		this._onKeyDown = this._onKeyDown.bind(this);
		this._onKeyUp = this._onKeyUp.bind(this);
		this.disabled = true;
		if (!this.options.disable) {
			this.enable();
		}
	},
	/**
	 * 启用ShortcutManger
	 */
	enable: function () {
		if (this.disabled) {
			dom.on(this.el, this.keydown, this._onKeyDown);
			dom.on(this.el, this.keyup, this._onKeyUp);
			this.disabled = false;
		}
		return this;
	},
	/**
	 * 禁用ShortcutManger
	 */
	disable: function () {
		if (!this.disabled) {
			dom.off(this.el, this.keydown, this._onKeyDown)
			dom.off(this.el, this.keyup, this._onKeyUp);
			this.disabled = true;
		}
		return this;
	},
	/**
	 * 注册快捷键
	 * @param	{String}	shortcut		快捷键
	 * @param	{Function}	handler		处理handler
	 * @param	{Object}	options		参数
	 * @example
	 * var sm = new ShortcutManager();
	 * sm.register('ctrl+t', function() {
	 * 	alert('ctrl and r key are pressed!');
	 * })
	 */
	register: function (shortcut, handler, options) {
		var keys = this._getKeys(shortcut),
			scope = '';
		if (!handler) {
			return this;
		}
		if (_.isString(options)) {
			scope = options;
			options = arguments[3];
		}
		keys.forEach(function (key) {
			var mods = [],
				originKey = key;
			key = key.split('+');
			if (key.length > 1) { //说明是组合键
				mods = this._getMods(key);
				key = [key[key.length - 1]];
			}
			// 取得按键，如果是组合键，则为非功能键，如 ctrl+r -> r
			key = key[0]
			key = code(key); //获取键码
			if (!(key in this._handlers)) {
				this._handlers[key] = [];
			}
			this._handlers[key].push({ 
				shortcut: originKey, 
				method: handler, 
				key: originKey, 
				mods: mods,
				scope: scope,
				options: options 
			});
		}.bind(this));
		return this;
	},
	unregister: function (shortcut, handler) {

	},
	/**
	 * @private
	 * 'ctrl +r, enter ' -> ["ctrl+r", "enter"]
	 */
	_getKeys: function (key) {
		var keys;
		key = key.replace(/\s/g, '');
		keys = key.split(',');
		if ((keys[keys.length - 1]) == '') {
			keys[keys.length - 2] += ',';
		}
		return keys;
	},
	/**
	 * @private
	 * ['ctrl', 'r'] -> [17]
	 */
	_getMods: function (key) {
		var mods = key.slice(0, key.length - 1);
		for (var mi = 0; mi < mods.length; mi++)
			mods[mi] = _MODIFIERS[mods[mi]];
		return mods;
	},
	/**
	 * 处理 keydown 事件
	 * @private
	 */
	_onKeyDown: function (e) {
		var key = e.which,
			event = e.event,
			keyChar = event.key;
		if (key in _mods) { //按键仅为功能键，ctrl、shift等
			_mods[key] = true;
			return;
		}
		//确定哪些功能键按下了
		for (var _mod in _mods) {
			_mods[_mod] = event[_modifierMap[_mod]]; 
		}
		if (keyChar) {
			key = code(keyChar);
		}
		//确定是否有注册快捷键
		if (!(key in this._handlers)) {
			return;
		}
		var handlers = this._handlers[key],
			handler = null,
			modsCount = 0,
			i = 0,
			len = handlers.length,
			modifiersMatch  = true;
		for (; i < len; i++) {
			handler = handlers[i];
			if (handler.scope !== this.scope) {
				continue;
			}
			// 检查按下的功能键和注册的功能键是否相同
			for (var _mod in _mods) {
				if (_mods[_mod]) {
					modsCount++;
					if (handler.mods.indexOf(parseInt(_mod, 10)) === -1) {
						modifiersMatch = false;
						break;
					}
				}
			}
			if (modsCount !== handler.mods.length || !modifiersMatch) {
				break;
			}
			if (handler.method.call(e.target, e, handler) === false) {
				e.stop();
			}
		}
	},
	/**
	 * 处理 keyup 事件
	 * @private
	 */
	_onKeyUp: function(e) {
		var key = e.which;
		if (key in _mods) {
			_mods[key] = false;
		}
	}
});

module.exports = new ShortcutManager();