/**
 * ------------------------------------------------------------
 * TreeView  树型视图
 * @author   sensen(hzzhaoyusen@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var SourceComponent = require('../base/sourceComponent.js');
var template = require('./treeView.html');
var hierarchicalTemplate = require('./treeViewList.html');
var _ = require('../base/util.js');

/**
 * @class TreeView
 * @extend SourceComponent
 * @param {object}                  options.data                    绑定属性
 * @param {object[]=[]}             options.data.source             数据源
 * @param {number}                  options.data.source[].id        每项的id
 * @param {string}                  options.data.source[].name      每项的内容
 * @param {object=null}             options.data.selected           当前选择项
 * @param {boolean=false}           options.data.disabled           是否禁用该组件
 * @param {boolean=false}           options.data.hierarchical       是否分级动态加载，需要service
 * @param {string=''}               options.data.class              补充class
 */
var TreeView = SourceComponent.extend({
    name: 'treeView',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            // @inherited source: [],
            selected: null,
            disabled: false,
            multiple: false,
            hierarchical: false
        });
        this.supr();

        this.treeroot = this;
    },
    /**
     * @method select(item) 选择某一项
     * @public
     * @param  {object} item 选择项
     * @return {void}
     */
    select: function(item) {
        if(this.data.disabled)
            return;

        this.data.selected = item;
        /**
         * @event select 选择某一项时触发
         * @property {object} selected 当前选择项
         */
        this.$emit('select', {
            selected: item
        });

        item._loaded = true;
    },
    /**
     * @method toggle(item) 展开或收起某一项
     * @private
     * @param  {object} item 展开收起项
     * @return {void}
     */
    toggle: function(item) {
        if(this.data.disabled)
            return;

        item.open = !item.open;

        /**
         * @event toggle 展开或收起某一项时触发
         * @property {object} item 展开收起项
         * @property {boolean} open 展开还是收起
         */
        this.$emit('toggle', {
            item: item,
            open: item.open
        });

        item._loaded = true;
    },
    reload: function(item) {
        item._loaded = false;
        this.$update();
        item._loaded = true;
        this.$update();
    }
});

var TreeViewList = SourceComponent.extend({
    name: 'treeViewList',
    template: hierarchicalTemplate,
    config: function() {
        _.extend(this.data, {
            itemTemplate: null,
            visible: false
        });
        this.supr();

        this.treeroot = this.$parent.treeroot;
        this.service = this.treeroot.service;
        this.data.itemTemplate = this.treeroot.data.itemTemplate;
        this.data.hierarchical = this.treeroot.data.hierarchical;

        // this.$watch('visible', function(newValue) {
        //     if((newValue || !this.data.hierarchical) && this.data.parent && !this.data.parent.children)
        //         this.$updateSource();

        //     // if(!this.data.hierarchical)
        //     //     return;

        //     // if(!newValue || this.$parent.name !== 'treeViewList')
        //     //     return;

        //     // this.$updateSource().$on('updateSource', function($event) {
        //     //     this.data.hierarchical = false;
        //     // });
        // });
        this.$watch('loaded', function(newValue) {
            //if((newValue || !this.data.hierarchical) && this.data.parent && !this.data.parent.children)
            if(newValue)
                this.$updateSource();
        });
    },
    /**
     * @override
     */
    getParams: function() {
        if(this.data.parent)
            return _.extend({parentId: this.data.parent.id}, this.treeroot.getParams());
    },
    /**
     * @override
     */
    $updateSource: function(callback) {
        if(this.data.parent.childrenCount) {
            this.service.getList(this.getParams(), function(result) {
                // 给每个节点item添加parent
                result.forEach(function(item) {
                    item.parent = this.data.parent;
                }.bind(this));

                this.$update('source', result);

                callback && callback.call(this);
                this.treeroot.$emit('updateSource', {
                    result: result
                });
            }.bind(this));
        } else {
            if(!this.data.parent.children)
                this.data.source = this.data.parent.children = [];

            this.$update();
            
            // this.$update('source', );
            //this.$update('source', [{"id":13788, "type": "case", "name":"v","precondition":"","execution_steps":"","expected_result":"","note":"","parent_id":13787,"priority_id":1,"alias_id":34,"last_modified_by":1470,"last_modified_by_name":"陈亮","tag_ids":[]}]);

            callback && callback.call(this);
            this.treeroot.$emit('updateSource', {
                result: this.data.source
            });
            // }
        }

        return this;
    },
    /**
     * @method select(item) 选择某一项
     * @private
     * @param  {object} item 选择项
     * @return {void}
     */
    select: function(item) {
        this.treeroot.select(item);
    },
    /**
     * @method toggle(item) 展开或收起某一项
     * @private
     * @param  {object} item 展开收起项
     * @return {void}
     */
    toggle: function(item) {
        this.treeroot.toggle(item);
    },
    reload: function(item) {
        this.treeroot.reload(item);
    }
});

module.exports = TreeView;
module.exports.TreeViewList = TreeViewList;