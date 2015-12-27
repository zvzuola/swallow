/**
 * ------------------------------------------------------------
 * Dialog    对话框
 * @author   sensen(hzzhaoyusen@corp.netease.com)
 *           hzyangzhouzhi(hzyangzhouzhi@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('../base/component.js');
var template = require('./dialog.html');
var _ = require('../base/util.js');

/**
 * @class Dialog
 * @extend Component
 * @param {object}                  options.data                    绑定属性 | Binding Properties
 * @param {string='提示'}           options.data.title              对话框标题 | Title of Dialog
 * @param {string=''}               options.data.content            对话框内容
 * @param {string}                  options.data.buttons[].text     按钮的显示文本
 * @param {string}                  options.data.buttons[].cls      按钮的css类
 * @param {function}                options.data.buttons[].handler  按钮的处理handler
 * @param {string}                  options.data.buttons[].icon     按钮的显示icon
 * @param {number=null}             options.data.width              对话框宽度。值为否定时宽度为CSS设置的宽度。
 * @param {Boolean}                 options.closable                对话框是否可关闭
 * @param {Boolean}                 options.claseAction             对话框关闭动作，可选 hide|close
 */
var Dialog = Component.extend({
    name: 'dialog',
    template: template,
    /**
     * @protected
     */
    config: function () {
        _.extend(this.data, {
            id: DialogMgr.getId(),
            title: '提示',
            content: '',
            buttons: [{
                text: '确定',
                handler: function () {
                    this.close();
                }.bind(this)
            }],
            width: null,
            autoShow: true,
            show: false,
            modal: true,
            closable: true,
            closeAction: 'close'
        });
        this.supr();
    },
    /**
     * @protected
     */
    init: function () {
        this.supr();
        // 证明不是内嵌组件
        if (this.$root === this) { 
            this.$inject(document.body);
        }
        this.data.autoShow && this.show();
        DialogMgr.register(this);
    },
    /**
     * @method show() 显示对话框
     * @public
     * @return {Dialog} 返回Dialog对象
     */
    show: function() {
        this.$update('show', true);
        this.$emit('show');
        return this;
    },
    /**
     * @method hide() 隐藏对话框
     * @public
     * @return {Dialog} 返回Dialog对象
     */
    hide: function() {
        this.$update('show', false);
        this.$emit('hide');
        return this;
    },
    /**
     * @method close(result) 关闭并销毁对话框
     * @public
     * @return {void}
     */
    close: function () {
        /**
         * @event close 关闭对话框时触发
         * @property {object} dialog 当前对话框对象
         */
        this.$emit('close', {
            dialog: this
        });
        this.destroy();
    },
    /**
     * @private
     */
    buttonHandler: function(btn, e) {
        btn.handler && btn.handler.call(this, btn);
        /**
         * @event close 关闭对话框时触发
         * @property {object} dialog 当前对话框对象
         * @property {object} btn 触发时间的按钮
         * @property {Event} e 事件对象
         */
        this.$emit('buttonclick', {
            source: this,
            btn: btn,
            e: e
        });
    }
});

var dialogId = 0;
var DialogMgr = {
    _dialogs: [],
    getId: function() {
        return 'dialog' + dialogId++;
    },
    register: function(dialog) {
        if (this._dialogs.indexOf(dialog) === -1) {
            this._dialogs.push(dialog);
        }
    }
};
module.exports = Dialog;
