/**
 * Component    基础组件体系基类
 * @author      sensen(hzzhaoyusen@corp.netease.com)
 *              capasky(hzyangzhouzhi@corp.netease.com)
 */


'use strict';

var Regular = require("regularjs");
var filter = require("./filter.js");

var dom = Regular.dom;

/**
 * 基础组件体系基类
 * @remark
 * 对于非模板中初始化的引入组件，需在使用new初始化引入组件后，使用
 * <code>
 *  this._coms.push(com);
 * </code>
 * 将引入组件加入引入组件列表，以便在销毁时一并销毁
 */
var Component = Regular.extend({
    /**
     * @override
     */
    init: function() {
        /**
         * @private
         * @property    _coms   内部使用组件数组，用于集中销毁
         */
        this._coms = [];
        this.$on('$destroy', function destroyComs() {
            if (this._coms && this._coms.length) {
                this._coms.forEach(function(com) {
                    com.destroy && com.destroy.call(com);
                });
            }            
        }.bind(this));
        this.supr();
    }
})
.filter(filter)
.directive({
    // if expression evaluated to true then addClass z-crt.
    // otherwise, remove it
    // <li z-crt={this.$state.current.name==='app.test.exam.choice'}>
    "z-crt": function(elem, value) {
        this.$watch(value, function(val) {
            dom[val ? 'addClass' : 'delClass'](elem, 'z-crt');
        });
    },
    "q-render": function(elem, value) {
        this.$watch(value, function(val) {
            if (val) elem.innerHTML = qs.render(val)
        });
    },
    /**
     * r-attr   属性Directive
     * @example
     * <img r-attr={{"title": title, "alt": title}}>
     */
    "r-attr": function(elem, value) {
        this.$watch(value, function(nvalue) {
            for (var i in nvalue)
                if (nvalue.hasOwnProperty(i)) {
                	dom.attr(elem, i, nvalue[i]);
                }
        }, true);
    },
    /**
     * r-autofocus  元素自动获得焦点，主要用于表单元素
     */
    "r-autofocus": function(elem, value){
        setTimeout(function() {
            elem.focus();
        }, 0);
    },
    /**
     * r-scroll 滚动到元素
     * @example
     * <code>
     *  <tr r-scroll={item.selected}><td>XXX</td></tr>
     * </code>
     */
    "r-scroll": function(elem, value) {
        this.$watch(value, function(newValue) {
            if(newValue && elem) {
                elem.scrollIntoViewIfNeeded
                    ? elem.scrollIntoViewIfNeeded(true)
                    : elem.scrollIntoView({block: "end", behavior: "smooth"});
            }
        });
    },
    /**
     * 针对布尔型属性提供的Directive，如 checked、disabled
     * @example
     * <code>
     * <input type="checkbox" r-attr-b={{"checked": this._checked}} />
     * </code>
     */
    "r-attr-b": function(elem, value) {
        this.$watch(value, function(nvalue) {
            for (var i in nvalue)
                if (nvalue.hasOwnProperty(i)) {
                	var ha = elem.hasAttribute(i);
                	if (ha && nvalue[i] === false) {
                		elem.removeAttribute(i);
                	}
                	if (!ha && nvalue[i] === true) {
                		dom.attr(elem, i, nvalue[i]);
                	}
                }
        }, true);
    }
});

module.exports = Component;
