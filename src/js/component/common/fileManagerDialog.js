/**
 * FileManagerDialog
 * 文件管理窗口
 * @author  capasky(hzyangzhouzhi@corp.netease.com)
 */

'use strict';

var _ = require('../base/util.js');
var contentTemplate = require('./fileManagerDialog.html');

var Dialog = require('../common/dialog.js');
var Notify = require('../common/notify.js');

var MAX_SIZE = 5 * 1024 * 1024; //5MB

var FileManagerDialog = Dialog.extend({
    name: 'fileManagerDialog',
    config: function() {
        _.extend(this.data, {
            contentTemplate: contentTemplate,
            closeAction: 'hide',
            autoShow: false,
            title: '文件管理',
            buttons: [{
                text: '确定'
            }],
            width: 936,
            files: [],
            maxSize: MAX_SIZE,
            enableCreate: true,
            enableUpdate: true,
            enableDelete: true,
            itemWidth: 130,
            itemHeight: 140
        });
        this.supr();
    },
    loadFiles: function(files) {
        this.data.files = _.cloneDeep(files);
    },
    /**
     * 移除文件
     * @param   {Object}    file    移除的文件
     */
    removeFile: function(file) {
        if (file._created) {
            //新增的文件直接移除
            this.data.files.remove(file);
        } else {
            //已存在的文件标记移除
            file._deleted = true;
        }
    },
    selectFile: function(file) {
        if (!this.data.enableUpdate) {
            return;
        }
        this.$refs.fileInput.click();
        if (file) {
            this.data.current = file;            
        } else {
            this.data.current = {
                _created: true
            };
        }
    },
    resetFile: function(file) {
        file._replaced = false;
        file._data = '';
    },
    /**
     * 
     */
    _onFileSelected: function(e) {
        var target = e.target,
            reader = new FileReader(),
            file, current = this.data.current;
        if (!target.files.length) {
            return;
        }
        file = target.files[0];
        if (!this.validateFile(file)) {
            return;
        }
        reader.onloadend = this._onFileLoaded.bind(this);
        reader.readAsDataURL(file);
        current._name = file.name;
        current._size = file.size;
        current._type = file.type;
    },
    _onFileLoaded: function(ev) {
        var current = this.data.current;
        this.$refs.fileInput.value = '';
        //新增文件并且数据部分为空，即为第一次新增文件，
        //需要排除对新增的文件再次更新的情况
        if (current._created && !current._data) { 
            this.data.files.push(current);
        } else {
            current._replaced = true;
        }
        current._data = ev.target.result;
        this.$update();
    },
    enableCreate: function() {
        if (this.data.enableCreate) {
            return true;
        }
        return this.data.single && (
                this.data.files.length === 0 ||
                this.data.files.every(function(i){return !!i._deleted;}));
    },
    validateFile: function(file) {
        return true;
    }
});

module.exports = FileManagerDialog;