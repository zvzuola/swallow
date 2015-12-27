'use strict';

var Regular = require('regularjs');
var toString = Object.prototype.toString;
var lang = require('lodash/lang');
var str = require('lodash/string');

/**
 * 树遍历
 * @param  {Object}   tree         树节点
 * @param  {String}   childrenName 子节点集合的属性名
 * @param  {Function} callback     访问函数
 * @return {Boolean}               
 */
var treeWalker = function(tree, childrenName, callback) {
    childrenName = childrenName || 'children';
    var cur = tree;
    if (!tree) return;
    var result = callback(cur); //访问当前节点
    if (result === false) {
        return result;
    }
    if (tree[childrenName] && tree[childrenName].length) {
        //此处需要每次查询length，以处理在遍历过程中删除节点的情况
        for (var i = 0; i < tree[childrenName].length; i++) {
            if (treeWalker(tree[childrenName][i], childrenName, callback) === false) {
                return false;
            }
        }
    }
    return result;
};

var _ = {
    extend: function (o1, o2, override) {
        o1 = o1 || {};
        if (o2) {
            for (var i in o2) {
                if (o2.hasOwnProperty(i) && (override || o1[i] === undefined)) {
                    o1[i] = o2[i];
                }
            }
        }
        return o1;
    },
    dom: Regular.dom,
    multiline: function (func) {
        return func.toString().replace(/^function\s*\(\)\s*\{\s*\/\*+/, '').replace(/\*+\/\s*\}$/, '').trim();
    },
    treeWalker: treeWalker,
    noop: function() {},
    escapeRegExp: function (string) {
        return string.replace(/([.*+?^=!{}()|\[\]\/\\])/g, "\\$1");
    }
};
_.extend(_, lang);
_.extend(_, str);

Array.prototype.remove = function (o) {
    var index = this.indexOf(o);
    if (index != -1) {
        this.splice(index, 1);
    }
    return this;
};

function isElementInViewport (el) {
    var scrollParent = el.parentNode,
        elRect = el.getBoundingClientRect();
    //查找第一个滚动的父节点
    while (scrollParent && scrollParent.scrollTop === 0) {
        scrollParent = scrollParent.parentNode;
    }
    if (!scrollParent || !scrollParent.getBoundingClientRect) {
        return true;
    }
    var spRect = scrollParent.getBoundingClientRect();
    return elRect.top >= spRect.top
        && elRect.bottom <= spRect.bottom
        && elRect.left >= spRect.left
        && elRect.right <= spRect.right;
}

if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;
    if (!isElementInViewport(this)) {
        this.scrollIntoView();
    }
  };
}
module.exports = _;
