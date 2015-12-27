/**
 * ------------------------------------------------------------
 * TableView 表格视图
 * @author   sensen(hzzhaoyusen@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';

var SourceComponent = require('../base/sourceComponent.js');
var template = require('./tableView.html');
var _ = require('../base/util.js');

/**
 * @class TableView
 * @extend SourceComponent
 * @param {object}                  options.data                    绑定属性
 * @param {object[]=[]}             options.data.source             数据源
 * @param {number}                  options.data.source[].id        每项的id
 * @param {string}                  options.data.source[].name      每项的内容
 * @param {object[]=[]}             options.data.field              字段集
 * @param {string}                  options.data.field[].key        每个字段的key
 * @param {string}                  options.data.field[].name       每个字段在表头显示的文字，如果没有则显示key
 * @param {boolean=false}           options.data.striped            是否显示条纹
 * @param {boolean=false}           options.data.hover              是否每行在hover时显示样式
 * @param {string=''}               options.data.class              补充class
 */
var TableView = SourceComponent.extend({
    name: 'tableView',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            //source: [],
            fields: [],
            // TODO: 暂不考虑多字段排序
            order: {
                by: null,
                desc: false
            }
        });
        this.supr();
    },
    /**
     * @method sort(field) 按照某个字段排序
     * @public
     * @param  {object} field 排序字段
     * @return {void}
     */
    sort: function(field) {
        if(!field.sortable)
            return;

        var order = this.data.order;

        if(order.by === field.key)
            order.desc = !order.desc;
        else {
            order.by = field.key;
            order.desc = false;
        }

        if(this.service)
            this.$updateSource();
        else {
            this.data.source.sort(function(a, b) {
                if(order.desc)
                    return a[order.by] < b[order.by];
                else
                    return a[order.by] > b[order.by];
            });
        }
        /**
         * @event sort 按照某个字段排序时触发
         * @property {object} field 排序字段
         */
        this.$emit('sort', {
            field: field
        });
    },
    getItem: function(id) {
        var item = null,
            store = this.data.source,
            i = 0,
            len = store.length;
        for (;i < len; i++) {
            if (store[i].id == id) {
                item = store[i];
                break;
            }
        }
        return item;
    },
    clear: function() {
        if (this.params) {
            delete this.params;
            this.params = {};
            this.$update('source', []);
        }
    },
    reload: function (params, callback) {
        params && _.extend(this.params, params, true);
        this.$updateSource(function updateComplete(result) {
            this.$update('pending', false);
            callback && callback(result);
        }.bind(this));
        this.data.pending = true;
    },
    select: function(item) {
        if (typeof item !== 'object') {
            item = this.getItem(item);
        }
        this.$update('selected', item);
    }
});

module.exports = TableView;