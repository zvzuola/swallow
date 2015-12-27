/**
 * ------------------------------------------------------------
 * Modal     模态对话框
 * @author   sensen(hzzhaoyusen@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var Dialog = require('./dialog.js');
var template = require('./modal.html');
var _ = require('../base/util.js');

/**
 * @class Modal
 * @extend Dialog
 * @param {object}                  options.data                    绑定属性 | Binding Properties
 * @param {string='提示'}           options.data.title              对话框标题 | Title of Dialog
 * @param {string=''}               options.data.content            对话框内容
 * @param {string|boolean=true}     options.data.okButton           是否显示确定按钮。值为`string`时显示该段文字。
 * @param {string|boolean=false}    options.data.cancelButton       是否显示取消按钮。值为`string`时显示该段文字。
 * @param {number=null}             options.data.width              对话框宽度。值为否定时宽度为CSS设置的宽度。
 * @param {function}                options.ok                      当点击确定的时候执行
 * @param {function}                options.cancel                  当点击取消的时候执行
 */
var Modal = Dialog.extend({
    name: 'modal',
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            title: '提示',
            content: '',
            buttons: [],
            okButton: true,
            cancelButton: false,
            width: null
        });
        if (this.data.okButton) {
            this.data.buttons.push({
                text: typeof this.data.okButton === 'string' ? this.data.okButton : '确定',
                handler: this.ok.bind(this),
                cls: 'u-btn-primary'
            });
        }
        if (this.data.cancelButton) {
            this.data.buttons.push({
                text: typeof this.data.cancelButton === 'string' ? this.data.cancelButton : '取消',
                handler: this.cancel.bind(this)
            });
        }
        this.supr();
    },
    /**
     * @override
     */
    ok: function() {
        /**
         * @event ok 确定对话框时触发
         */
        this.$emit('ok');
        this.close(this.data.buttons[0]);
    },
    /**
     * @override
     */
    cancel: function() {
        /**
         * @event close 取消对话框时触发
         */
        this.$emit('cancel');
        this.close(this.data.buttons[1]);
    }
});

/**
 * @method alert([content][,title]) 弹出一个alert对话框。关闭时始终触发确定事件。
 * @static
 * @param  {string=''} content 对话框内容
 * @param  {string='提示'} title 对话框标题
 * @return {void}
 */
Modal.alert = function(content, title) {
    var modal = new Modal({
        data: {
            contentTemplate: template,
            content: content,
            title: title,
            icon: 'info'
        }
    });
    return modal;
}

/**
 * @method confirm([content][,title]) 弹出一个confirm对话框
 * @static
 * @param  {string=''} content 对话框内容
 * @param  {string='提示'} title 对话框标题
 * @return {void}
 */
Modal.confirm = function(content, title) {
    var modal = new Modal({
        data: {
            contentTemplate: template,
            content: content,
            title: title,
            icon: 'question',
            cancelButton: true
        }
    });
    return modal;
}

module.exports = Modal;
