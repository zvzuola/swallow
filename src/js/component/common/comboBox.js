/**
 * ComboBox
 * @author  capasky(hzyangzhouzhi@corp.netease.com)
 */

var DropDown = require('./dropDown.js');
var _ = require('../base/util.js');
var template = require('./comboBox.html');
var KeyNav = require('../base/keyNav.js');

var LocalService = function(data, searchField) {
    this.data = data;
    this.searchField = searchField;
};
_.extend(LocalService.prototype, {
    loadData: function(data) {
        this.data = [];
        this.data.push.apply(this.data, data);
    },
    getList: function(params, callback) {
        var term = params.term || '',
            searchField = this.searchField,
            rfilter = new RegExp(term, 'i');
            
        // console.log('IN getList:',term);
        callback && callback(
            term ? this.data.filter(function(item) {
                return rfilter.test(item[searchField]);
            }) : this.data
        );
    }
});

var ComboBox = DropDown.extend({
    name: 'comboBox',
    template: template, 
    /**
     * @protected
     */
    config: function () {
        _.extend(this.data, {
            source: [],
            /**
             * @config  groupSource    source按照排序数组顺序排序后的存放容器
             */
            groupSource: [],
            /**
             * @config  groupable    按照group字段分组
             */
            groupBy: 'group',
            /**
             * @config  groupable    是否分组
             */
            groupable: false,
            /**
             * @config  forceSelection  是否强制选择
             * true 表示只能从列表项中选择
             * false 表示可通过输入代替值
             */
            forceSelection: false,
            /**
             * @config  editable    输入框是否可编辑
             */
            editable: true,
            /**
             * @config  enableTrigger   是否显示触发按钮，false时用于实现suggest的功能
             */
            enableTrigger: true,
            /**
             * @config  displayField    显示字段名称
             */
            displayField: 'name',
            /**
             * @config valueField   值字段名称
             */
            valueField: 'id',
            /**
             * @config  triggerAction   触发器的操作
             *                          query: 触发时，若有输入，则会进行查询
             *                          all: 触发时，显示所有的列表项
             */
            triggerAction: 'query',
            placeholder: '',
            mode: 'remote',
            emptyText: '未查询到相关内容',
            /**
             * @config  queryDelay      查询延迟(ms)
             */
            queryDelay: 300,
            //private
            baseParams: {},
            selected: {
                id: 0,
                name: ''
            },
            selectedIndex: -1,
            displayValue: '',
            pending: false
        });
        this.supr();
    },
    init: function () {
        this.params = {};
        this.keyNav = new KeyNav(this.$refs.input, {
            "up": function (e) {
                if (!this.data.open) {
                    this.expand();
                } else {
                    this.inKeyMode = true;
                    this.selectPrev();
                }
            }.bind(this),

            "down": function (e) {
                if (!this.data.open) {
                    this.expand();
                } else {
                    this.inKeyMode = true;
                    this.selectNext();
                }
            }.bind(this),
            "enter": function (e) {
                if (this.data.selectedIndex < 0) {
                    e.stop();
                    return false;
                }
                var index = this.data.selectedIndex;
                if (index < 0) {
                    index = 0;
                }
                this.listItemClick(this.data.source[index]);
            }.bind(this),

            "esc": function (e) {
                this.collapse();
            }.bind(this)
        });
        if (this.data.mode === 'local') {
            this.service = new LocalService(this.data.source, this.data.displayField);
        }
        this.supr();
    },
    /**
     * 加载静态数据，用于本地模式
     * @param   {Array} data    静态数据
     */
    loadData: function(data) {
        if (this.data.mode !== 'local') {
            return;
        }
        this.params.term = null;
        this.service.loadData(data);
        this.doQuery('');
    },
    select: function (item, emitEvent) {
        this.data.selected = item;
        this.data.value = item[this.data.valueField];
        this.data.displayValue = item[this.data.displayField];
        this.$update();
        /**
         * @event   select  当选择列表项时触发
         */
        emitEvent !== false && this.$emit('select', {
            selected: item
        });
    },
    selectPrev: function () {
        if (this.data.selectedIndex <= 0) {
            this.data.selectedIndex = 0;
        } else {
            this.data.selectedIndex--;          
        }
        this.select(this.data.source[this.data.selectedIndex], false);
    },
    selectNext: function () {
        if (this.data.selectedIndex >= this.data.source.length - 1) {
            this.data.selectedIndex = this.data.source.length - 1;
        } else {
            this.data.selectedIndex++;
        }
        this.select(this.data.source[this.data.selectedIndex], false);
    },
    expand: function() {
        if (!this.data.open) {
            this.toggle(true);
        }
    },
    collapse: function() {
        if (this.data.open) {
            this.toggle(false);
        }
        this.data.selectedIndex = -1;
    },
    getParams: function () {
        _.extend(this.params, this.data.baseParams, true);
        return this.params;
    },
    getItem: function(id) {
        var i = 0,
            source = this.data.source,
            len = source.length,
            valueField = this.data.valueField,
            item = null,
            index = -1;
        if (id) {
            if (typeof id === 'object') {
                index = source.indexOf(id);
                if (index > -1) {
                    return source[index];
                } else {
                    id = id[valueField];
                }
            }
            for(;i < len; i++) {
                if (id == source[i][valueField]) {
                    item = source[i];
                    break;
                }
            }
        }
        return item;
    },
    getValue: function() {
        if (this.data.selected) {
            return this.data.value;
        }
        if (this.data.editable && this.data.displayValue) {
            return this.data.displayValue;
        }
        return '';
    },
    clearValue: function(v, d) {        
        var item = null;
        if (!d) {
            d = v;
        }
        if (v || d) {
            item = {};
            item[this.data.valueField] = v;
            item[this.data.displayField] = d;
        }
        this.data.selected = item;
        this.data.value = v;
        this.data.displayValue = d;
    },
    setValue: function(value) {
        var display,
            _value = value;
        if (this.data.mode === 'local') {
            value = this.getItem(value) || _value;
        }
        if (typeof value === 'object') {
            display = value[this.data.displayField];
            value = value[this.data.valueField];
        } else {
            display = value;
        }
        this.clearValue(value, display);
    },
    /**
     * @private
     */
    listItemClick: function(item) {
        this.collapse();
        this.$refs.input.blur();
        item && this.select(item);
    },
    /**
     * @private
     */
    input: function (e) {
        if (!this.data.editable 
            || (this.keyNav.keyToHandler[e.which + ''] && e.which !== 8 && e.which !== 32) ) {
            e.stop();
            return;
        }
        this.expand();
        this.doQuery(this.data.displayValue, function () {
            this.$update('selected', this.data.source[0]);
        }.bind(this));
    },
    /**
     * @private
     */
    doQuery: function (term, callback) {
        term = _.escapeRegExp(term);
        if (this.queryDelayTimer) {
            clearTimeout(this.queryDelayTimer);
        }
        var c = function () {
            this.$update('pending', false);
            this.data.groupSource = [];
            var source = this.data.source;
            var groupSource = this.data.groupSource;
            if(this.data.groupable){
                var groups = {};
                source.forEach(function(i){
                    var group = groups[i.group];
                    if(!group){
                        group = {
                            name: i.group,
                            items: []
                        }
                        groupSource.push(group);
                        groups[i.group] = group;
                    }
                    group.items.push(i);
                });
            }
            this.$update();
            callback && callback();
        }.bind(this);
        this.queryDelayTimer = setTimeout(function() {
            if (this.data.pending) {
                this.service && this.service.abort && this.service.abort();
            }
            this.data.pending = true;
            if (this.params.term == term) {
                c();
                return;
            }
            this.params.term = term;
            this.$updateSource(c); 
        }.bind(this), this.data.queryDelay); 
    },
    /**
     * @private
     */
    focus: function (e) {
        if (this.data.disabled) {
            e.stop();
            return;
        }
        if (!this.data.editable) {
            e.preventDefault();
            this.$refs.input.blur();
        }
        if (this.data.forceSelection) {         
            if (this.data.open) {
                this.collapse();
                return;
            }
            if (this.data.triggerAction === 'all') {
                this.doQuery('');
            } else {
                this.doQuery(this.data.displayValue);
            }
        }
        this.$refs.input.select();
        this.expand();
    },
    /**
     * @private
     */
    blur: function () {
        if (this.data.forceSelection) {
            var value = this.data.displayValue,
                displayField = this.data.displayField;
            var valid = this.data.source.some(function (c) { return c[displayField] == value; });
            if (!valid) {
                this.data.selected = this.data.selected || {};
                this.data.displayValue = this.data.selected[displayField] || '';
                this.data.value = this.data.selected[this.data.valueFileld] || null;
                this.data.selectedIndex = -1;
            }
        }
    },
    enable: function() {
        this.$update('disabled', false);
    },
    disable: function() {
        this.$update('disabled', true)
    },
    /**
     * @private
     */
    isCurrent: function (item, index) {
        if (this.data.selected && this.data.selected === item) {
            return true;
        }
        return index === this.data.selectedIndex;
    }
});

module.exports = ComboBox;