/**
 * ------------------------------------------------------------
 * Uploader  上传
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('../base/component.js');
var template = require('./uploader.html');
var _ = require('../base/util.js');

/**
 * @class Uploader
 * @extend Component
 * @param {object}                  options.data                    绑定属性
 * @param {string=''}               options.data.name               按钮文字
 * @param {string=''}               options.data.url                上传路径
 * @param {string='json'}           options.data.dataType           数据类型
 * @param {object}                  options.data.data               附加数据
 * @param {string[]=null}           options.data.extensions         可上传的扩展名，如果为空，则表示可上传任何文件类型
 * @param {boolean=false}           options.data.disabled           是否禁用
 * @param {boolean=true}            options.data.visible            是否显示
 * @param {string=''}               options.data.class              补充class
 */
var Uploader = Component.extend({
    name: 'uploader',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            autoUpload: true,
            name: '',
            url: '',
            file: null,
            fileParamName: 'file',
            contentType: 'multipart/form-data',
            dataType: 'json',
            data: {},
            extensions: null,
            _id: new Date().getTime(),
            btnId: 'j_btn_' + (+new Date()),
            btnClass: ''
        });
        this.supr();
    },
    /**
     * @method selectFiles() 弹出文件对话框选择文件
     * @public
     * @return {void}
     */
    selectFiles: function() {
        this.$refs.file.click();
    },
    /**
     * 清除选择的文件
     */
    clearSelectedFiles: function() {
        this.$refs.form.reset();
    },
    /**
     * @method upload() 上传文件
     * @public
     * @return {void}
     */
    upload: function() {
        var files = this.data.files;
        if (!files || !files.length) {
            this.$emit('error', {
                source: this,
                msg: '还未选择任何文件，上传队列为空！'
            });
            return;
        }
        if(this.data.extensions) {
            for (var i = 0; i < files.length; i++) {                
                var file = files[i].name;
                var ext = file.substring(file.lastIndexOf('.') + 1, file.length).toLowerCase();
    
                if(this.data.extensions.indexOf(ext) === -1)
                    return this.$emit('error', {
                        source: this,
                        msg: this.extensionError()
                    });
            }
        }

        this.$emit('sending', this.data.data);

        this.$refs.form.submit();
    },
    _onSelectFileBtnClick: function(e) {
        this.selectFiles();
    },
    _onChange: function(e) {
        var files = [],
            target = e.target;
        if (target.files && target.files.length > 0) {
            files = target.files;
        } else {
            files.push({
                name: this.$refs.file.value
            });
        }
        this.data.files = files;
        this.$emit('change', {
            source: this,
            files: files
        });
        if (this.data.autoUpload) {
            this.upload();
        }
    },
    cbUpload: function() {
        var iframe = this.$refs.iframe;

        var xml = {};
        try {
            if(iframe.contentWindow) {
                xml.responseText = iframe.contentWindow.document.body ? iframe.contentWindow.document.body.innerHTML : null;
                xml.responseXML = iframe.contentWindow.document.XMLDocument ? iframe.contentWindow.document.XMLDocument : iframe.contentWindow.document;
            } else if(iframe.contentDocument) {
                xml.responseText = iframe.contentDocument.document.body?iframe.contentDocument.document.body.innerHTML : null;
                xml.responseXML = iframe.contentDocument.document.XMLDocument?iframe.contentDocument.document.XMLDocument : iframe.contentDocument.document;
            }
        } catch(e) {
            console.log(e);
        }

        if(!xml.responseText)
            return;

        function uploadHttpData(r, type) {
            var data = (type == 'xml' || !type) ? r.responseXML : r.responseText;
            // If the type is 'script', eval it in global context
            if (type === 'json') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    var text = /<pre.*?>(.*?)<\/pre>/.exec(data);
                    text = text ? text[1] : data;
                    data = JSON.parse(text);
                }
            }
            return data;
        }

        this.$emit('success', {
            source: this,
            data: uploadHttpData(xml, this.data.dataType)
        });
        this.$emit('complete', {
            source: this,
            data: xml
        });

        this.$refs.file.value = '';
        this.data.file = null;
    },
    extensionError:　function() {
        return '只能上传' + this.data.extensions.join(', ')　+ '类型的文件！';
    },
});

module.exports = Uploader;