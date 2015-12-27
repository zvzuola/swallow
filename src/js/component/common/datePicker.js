/**
 * ------------------------------------------------------------
 * DatePicker 日期选择
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

var DropDown = require('./dropDown.js');
var template = require('./datePicker.html');
var _ = require('../base/util.js');

var filter = require('../base/filter.js');
var Calendar = require('./calendar.js');

/**
 * @class DatePicker
 * @extend DropDown
 * @param {object}                  options.data                    绑定属性
 * @param {object=null}             options.data.date               当前选择的日期
 * @param {string='请输入'}         options.data.placeholder        文本框默认文字
 * @param {boolean=false}           options.data.readonly           是否只读
 * @param {boolean=false}           options.data.disabled           是否禁用
 * @param {boolean=true}            options.data.visible            是否显示
 * @param {string=''}               options.data.class              补充class
 */
var DatePicker = DropDown.extend({
    name: 'datePicker',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            date: new Date(),
            minDate: null,
            maxDate: null,
            visible: true,
            // @inherited source: [],
            // @inherited open: false,
            placeholder: '请输入或选择一个日期',
            value: null
        });
        this.supr();
        this.$watch('minDate', function(nv) {
            _.isDate(nv) && _.isDate(this.data.date) && this.data.date < nv && (this.data.date = nv);
        });
        this.$watch('maxDate', function(nv) {
            _.isDate(nv) && _.isDate(this.data.date) && this.data.date > nv && (this.data.date = nv);
        });
    },
    /**
     * @method select(date) 选择一个日期
     * @public
     * @param  {Date=null} date 选择的日期
     * @return {void}
     */
    select: function(date) {
        this.setValue(date);
        /**
         * @event select 选择某一项时触发
         * @property {object} date 当前选择项
         */
        this.$emit('select', {
            date: date
        });
        this.toggle(false);
    },
    change: function($event) {
        this.setValue($event.target.value);
    },
    /**
     * 设置组件值
     */
    setValue: function(v) {
        var date = null;
        if (_.isDate(v)) {
            date = new Date(+v);
        } else if (_.isString(v)) {
            var _date = Date.parse(v);
            if (!isNaN(_date)) {
                date = new Date(_date);
            }
        }
        
        if (date) {
            if (this.$refs.calendar.isDisabledDay(date)) {
                if (this.data.minDate && date < this.data.minDate) {
                    date = this.data.minDate;
                } else if (this.data.maxDate && date > this.data.maxDate) {
                    date = this.data.maxDate;
                }
            }
        }
        this.$refs.input.value = date ? filter.format(date, 'yyyy-MM-dd') : '';
        this.data.value = date;        
        if (date) {
            this.data.date = new Date(+date);
        }
        this.$emit('change', { value: date });
    },
    /**
     * 获取组件值
     */
    getValue: function() {
        return this.data.value;
    }
});

module.exports = DatePicker;