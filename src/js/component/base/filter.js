/**
 * 基础组件体系基类Component过滤器定义
 * @author      sensen(hzzhaoyusen@corp.netease.com)
 *              capasky(hzyangzhouzhi@corp.netease.com)
 */
 
 
'use strict';
var _ = require('./util.js');
var filter = {};
/**
 * format   格式化日期数据
 * @param   {Date}      value   输入日期
 * @param   {String}    format  日期格式
 * @example
 * 以下代码：
 * <code>
 *  <span>{date|format:"yyyy-MM-dd"}</span>
 * </code>
 * 可能的输出为 
 * <code>
 *  <span>2015-06-06</span>
 * </code>
 */
filter.format = function() {
    function fix(str) {
        str = '' + (String(str) || '');
        return str.length <= 1? '0' + str : str;
    }
    var maps = {
        'yyyy': function(date){return date.getFullYear()},
        'MM': function(date){return fix(date.getMonth() + 1); },
        'dd': function(date){ return fix(date.getDate()) },
        'HH': function(date){return fix(date.getHours()) },
        'mm': function(date){ return fix(date.getMinutes())},
        'ss': function(date){ return fix(date.getSeconds())}
    }

    var trunk = new RegExp(Object.keys(maps).join('|'),'g');
    return function(value, format){
        var s = value;
        if (_.isString(s)) {
            s = Date.parse(s)
        } else {
            s = +s;
        }
        if (s) {
            s = new Date(s);
        } else {
            return '';
        }
        format = format || 'yyyy-MM-dd HH:mm';
        return format.replace(trunk, function(capture){
            return maps[capture]? maps[capture](s): '';
        });
    }
}();

/**
 * average  求数组均值
 * @param   {Array} array   输入数组
 * @param   {String}   key  数组元素的key
 * @example
 * 以下代码
 * <code>
 *  <span>{array|average}</span>
 * </code>
 * array = [4, 10, 6] 的输出为
 * <code>
 *  <span>10<span>
 * </code>
 */
filter.average = function(array, key) {
    array = array || [];
    return array.length? filter.total(array, key) / array.length : 0;
};

/**
 * total    求数组和
 * @param   {Array} array   输入数组
 * @param   {String}   key  数组元素的key
 * @example
 * 以下代码
 * <code>
 *  <span>{array|average}</span>
 * </code>
 * array = [4, 10, 6] 的输出为
 * <code>
 *  <span>20<span>
 * </code>
 */
filter.total = function(array, key) {
    var total = 0;
    if(!array) return;
    array.forEach(function( item ){
        total += key? item[key] : item;
    });
    return total;
};

/**
 * filter    数组过滤
 * @param   {Array} array   输入数组
 * @param   {Function}  filterFn  过滤函数
 */
filter.filter = function(array, filterFn) {
    if(!array || !array.length) return;
    return array.filter(function(item, index){
        return filterFn(item, index);
    });
};
filter.escape = _.escape;
filter.unescape = _.unescape;
filter.escapeHtml = {
    get: function(value) {
        return _.escape(value);
    },
    set: function(value) {
        return _.unescape(value);
    }
};
/**
 * 字符串trim
 * @param   {String}    str  待去除首尾空格的字符串
 */
filter.trim = {
    get: _.trim,
    set: _.trim
}
module.exports = filter;
