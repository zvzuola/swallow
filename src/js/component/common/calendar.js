/**
 * ------------------------------------------------------------
 * Calendar  日历
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('../base/component.js');
var template = require('./calendar.html');
var _ = require('../base/util.js');


var msOneDay = 24 * 3600 * 1000;

/**
 * @class Calendar
 * @extend Component
 * @param {object}                  options.data                    绑定属性
 * @param {Date=null}               options.data.date               当前选择的日期
 * @param {boolean=false}           options.data.readonly           是否只读
 * @param {boolean=false}           options.data.disabled           是否禁用
 * @param {boolean=true}            options.data.visible            是否显示
 * @param {string=''}               options.data.class              补充class
 */
var Calendar = Component.extend({
    name: 'calendar',
    template: template,
    /**
     * @protected
     */
    config: function () {
        _.extend(this.data, {
            date: null,
            minDate: null,
            maxDate: null,
            visible: true,
            _days: []
        });
        this.supr();

        this.$watch('date', function (newValue, oldValue) {
            if (newValue && oldValue && newValue.getFullYear() === oldValue.getFullYear() && newValue.getMonth() === oldValue.getMonth())
                return;

            this.update();
        });

        if (!this.data.date)
            this.goToday();
    },
    /**
     * @method update() 日期改变后更新日历
     * @private
     * @return {void}
     */
    update: function () {
        var days = this.data._days = [];
        var date = this.data.date; //当前日期
        var month = date.getMonth(); //当前需要显示的月份
        
        var firstDate = new Date(+date); //本月第一天
        firstDate.setDate(1);
        var firstDay = firstDate.getDay(); //星期几，0=星期日，1=星期一
        
        var lastDate = new Date(new Date(+firstDate).setMonth(month + 1) - msOneDay), //本月最后一天
            lastDay = lastDate.getDay(); //最后一天星期几
            
        var day0 = null, //日历显示的第一天
            dayX = null; //日历显示的最后一天
        
        if (firstDay !== 0) {
            day0 = new Date(+firstDate - (firstDay * msOneDay));
        } else {
            day0 = new Date(+firstDate);
        }

        if (lastDay !== 6) {
            dayX = new Date(+lastDate + (6 - lastDay) * msOneDay);
        } else {
            dayX = new Date(+lastDate);
        }


        var day = day0,
            dayCount = 0,
            i = 0;

        do {
            i = Math.floor(dayCount / 7);
            if (dayCount % 7 === 0) {
                days[i] = [];
            }
            days[i].push(day);
            day = new Date(+day + msOneDay); //下一天
            dayCount++;
        } while (day <= dayX);
    },
    /**
     * @method addYear(year) 调整年份
     * @public
     * @param  {number=0} year 加/减的年份
     * @return {void}
     */
    addYear: function (year) {
        if (this.data.readonly || this.data.disabled || !year)
            return;

        var date = new Date(this.data.date);
        date.setMonth(0); //回到1月
        date.setFullYear(date.getFullYear() + year);
        this.data.date = date;
    },
    /**
     * @method addMonth(month) 调整月份
     * @public
     * @param  {number=0} month 加/减的月份
     * @return {void}
     */
    addMonth: function (month) {
        if (this.data.readonly || this.data.disabled || !month)
            return;

        var date = new Date(this.data.date);
        date.setDate(1); //回到第一天，防止跳月份
        date.setMonth(date.getMonth() + month);
        this.data.date = date;
    },
    /**
     * @method select(date) 选择一个日期
     * @public
     * @param  {Date=null} date 选择的日期
     * @return {void}
     */
    select: function (date) {
        if (this.data.readonly
            || this.data.disabled
            || this.isDisabledDay(date)) {
            return;
        }

        this.data.date = new Date(date);

        /**
         * @event select 选择某一个日期时触发
         * @property {object} date 当前选择的日期
         */
        this.$emit('select', {
            date: date
        });
    },
    /**
     * @method goToday() 回到今天
     * @public
     * @return {void}
     */
    goToday: function () {
        this.data.date = new Date((new Date().getTime() / msOneDay >> 0) * msOneDay);
    },
    /**
     * @method isDisabledDay 是否禁用某一天
     * @param {Date} day 某一天
     * @return {void}
     */
    isDisabledDay: function (day) {
        day = Math.floor(+day / msOneDay) * msOneDay;
        var minDate = this.data.minDate ? (this.data.minDate.getTime() / msOneDay >> 0) * msOneDay : null;
        var maxDate = this.data.maxDate ? (this.data.maxDate.getTime() / msOneDay >> 0) * msOneDay : null;

        return (minDate && day < minDate) || (maxDate && day > maxDate);
    },
    _onBodyWheel: function(e) {
        this.addMonth(-e.wheelDelta);
    }
});

module.exports = Calendar;