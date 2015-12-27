/**
 * ------------------------------------------------------------
 * TreeView  可设定状态的树型视图
 * @author   sensen(hzzhaoyusen@corp.netease.com)
 *           hzyangzhouzhi(hzyangzhouzhi@corp.netease.com)
 * ------------------------------------------------------------
 */
var template = require('./stateTreeView.html');
var hierarchicalTemplate = require('./stateTreeViewList.html');
var itemTemplate = require('./stateTreeViewItem.html');

var SourceComponent = require('../base/sourceComponent.js');
var TreeView = require('./treeView.js');
var TreeViewList = TreeView.TreeViewList;
var CheckEx = require('./checkEx.js');

var _ = require('../base/util.js');

/**
 * 遍历树构建节点线索
 * 暂时完成父节点指针 _parent
 * @param  {Object} tree         要处理的树节点
 * @param  {String} childrenName 子节点集合名称，默认 children
 * @return {void}              
 */
var threadedTreeNodes = function(tree, childrenName) {
    childrenName = childrenName || 'children';
    var build = function(node) {
        if (!node || !node[childrenName] || !node[childrenName].length) return;
        for (var i = 0, len = node[childrenName].length; i < len; i++) {
            node[childrenName][i]._parent = node;
        }
    };
    for (var i = 0, len = tree.length; i < len; i++) {
        _.treeWalker(tree[i], childrenName, build);
    }
};

var checker = function(item, status) {
    if (item.filtered !== false) {
        item.checked = typeof status === 'boolean' ? status : 
                item.checked === null ? null : !item.checked;
    }
}, getLeftMostLeaf = function(node) {
    if (!node.children || !node.children.length || !node.open) {
        return node;
    }
    return getLeftMostLeaf(node.children[node.children.length - 1]);
}, getRightMostLeaf = function(node) {
    if (!node.children || !node.children.length || !node.open) {
        return node;
    }
    return getLeftMostLeaf(node.children[0]);
}, findNext = function(item) {   
    var parent = item.parent || this.rootNode,
        index = parent.children.indexOf(item),
        len = parent.children.length;
    if (index < len - 1) { // 非最后一个
        return parent.children[index + 1];
    } else { //最后一个
        return findNext.call(this, parent);
    }
};

/**
 * 可设定状态的树型视图
 * 状态是指：可选择，可复选，可加入状态标识
 * @class StateTreeView
 * @extends {TreeView}
 * @param {object}                  options.data                        绑定属性
 * @param {object[]=[]}             options.data.source                 数据源
 * @param {number}                  options.data.source[].id            每项的id
 * @param {string}                  options.data.source[].name          每项的内容
 * @param {Boolean}                 options.data.source[].checked       节点是否勾选
 * @param {Boolean}                 options.data.source[].states        节点状态集合
 * @param {Boolean}                 options.data.source[].states[].cls  节点状态补充class
 * @param {Boolean}                 options.data.source[].states[].name 节点状态名称
 * @param {object=null}             options.data.selected               当前选择项
 * @param {boolean=false}           options.data.disabled               是否禁用该组件
 * @param {boolean=false}           options.data.hierarchical           是否分级动态加载，需要service
 * @param {string=''}               options.data.class                  补充class
 */
var StateTreeView = SourceComponent.extend({
    name: 'stateTreeView',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            selected: null,
            selections: [],
            locatedNode: null,
            disabled: false,
            multiple: false,
            hierarchical: false,
            itemTemplate: itemTemplate,
            filter: null,
            enableFilter: false, //是否开启过滤器
            enableCheck: false, //是否启用勾选
            enableMutipleSelection: false, //是否启用多项选择（通过Ctrl 或 Shift实现）
            lazyUpdate: false, //是否进行延迟视图同步
            toolbars: [{
                text: '全选',
                cls: 'u-btn-info u-btn-sm',
                handler: this.checkAll.bind(this)
            }, {
                text: '反选',
                cls: 'u-btn-info u-btn-sm',
                handler: this.checkInvert.bind(this)
            }]
        });
        this.rootNode = {
            id: 0,
            root: true,
            path: ''
		};
        this.supr();
        this.treeroot = this;
    },
    /**
     * @protected
     */
    init: function() {        
		this.params = {};
        this.filters = [];
		this.supr();
    },
    /* 树选择实现 */
    /**
     * @method select(item) 选择某一项
     * @public
     * @param  {object} item 选择项
     * @return {void}
     */
    select: function(item, target) {
        if (_.isArray(item)) {
            this.data.selections = item;
            target = target || item[item.length - 1];
        } else {
            this.data.selections = [item];
            target = target || item;
        }
        
        /**
         * @event select 选择某一项时触发
         * @property {object} selected 当前选择项
         */
        this.$emit('select', {
            selected: target
        });
    },
    /**
     * 树中节点项单击时的事件处理
     * @private
     */
    _onTreeItemClick: function(item, e) {
        var selections = this.data.selections,
            parent = item.parent,
            clickSelection = e.event.ctrlKey, //使用Ctrl键进行点击选择
            continuousSelection = e.event.shiftKey, //使用shift键进行连续选择
            checked = false;
        if (this.data.disabled) {
            return;
        }
        if (!this.data.enableMutipleSelection) {
            clickSelection = false;
            continuousSelection = false;
        }
        if (clickSelection) {
            if (this.isSelected(item)) {
                selections.remove(item);
            } else {
                selections.push(item);
                checked = true;
            }
            if (this.data.enableCheck) {
                this.checkNode(item, checked);
            }            
        } else if (continuousSelection) {
            var latest = selections[selections.length - 1];
            if (selections.length && latest.parent === parent) {
                var children = parent ? parent.children : this.data.source,
                    start = children.indexOf(latest),
                    end = children.indexOf(item);
                if (start > end) {
                    var t = end;
                    end = start;
                    start = t;
                }
                end++;
                selections = children.slice(start, end);
                if (selections[selections.length - 1] !== latest) {
                    selections.push(selections.shift());
                }
            } else {
                selections = item;
            }
        } else {
            selections = item;
        }
        this.select(selections, item);
    },
    /**
     * 判断节点是否选中
     */
    isSelected: function(item) {
        item = this.getNode(item);
        return this.data.selections.indexOf(item) > -1;
    },
    /**
     * 获取选中的节点集合
     */
    getSelectedNodes: function() {
        return [].concat(this.data.selections);
    },
    /**
     * 定位某个节点并高亮显示
     * @param   {Object|Number|String}  item    表示树节点
     * @param   {Function}  callback    定位完成后的回调
     * @example
     *  tree.locateNode('12', function(node) {
     *      console.log(node);
     *  });
     */
    locateNode: function(item, callback) {
        item = this.getNode(item);
        item && item.path && this.expandPath(item.path, function() {
            callback && callback(item);
            this.$update('locatedNode', item);
        }.bind(this));
    },
    /* 内部事件处理 */
    showContextMenu: function() {

    },
    _onMouseUp: function(e) {
        if (e.button == 2) {
            e.stop();
        }
    },
    /**
     * 根据节点id获取特定节点
     * @param  {String|Number} id 节点id
     * @return {Object}    存在则返回节点对象，否则返回null
     */
    getNode: (function() {
        var getNode = function(id, context) {
            var item = null,
                childrenName = 'children',
                source = context[childrenName];
            if (source && source.length) {
                    
                var build = function(node) {
                    if (node.id == id) {
                        item = node;
                        return false;
                    }
                };
                for (var i = 0, len = source.length; i < len; i++) {
                    if (_.treeWalker(source[i], childrenName, build) === false) break;
                }
                
            }
            return item;
        };
        return function(id, context) {
            var node = null;
            if (typeof id === 'string' || typeof id === 'number') {
                node = getNode.call(this, id, context || this.rootNode);
            } else if (typeof id === 'object' && !_.isArray(id)) {
                node = id;
            }
            return node;  
        };
    })(),
    /**
     * 获取当前节点的前一个节点，只处理已加载的节点
     * @param   {Object}    item    参考节点
     */
    getPrevNode: function(item) {
        var parent = item.parent || this.rootNode,
            index = parent.children.indexOf(item);
        if (index === 0) {
            return parent.root ? null : parent;
        }
        if (index > 0) {
            var prev = parent.children[index - 1];
            return getLeftMostLeaf(prev);
        }        
    },
    /**
     * 获取当前节点的后一个节点，只处理已加载的节点
     * @param   {Object}    item    参考节点
     */
    getNextNode: function(item) {
        if (item.children && item.children.length && item.open) {
            return item.children[0];
        }
        var next = findNext.call(this, item);
        return next === this.data.source[0] ? null : next;        
    },
    /**
     * 重新加载节点的子节点数据
     * @param   {Object|String|Number}  id  节点对象或节点id
     * @param   {Function}  callback    加载完毕的回调
     * @remark
     * 注意：在重新加载节点数据并且callback执行后，会进行一次视图数据同步
     *      因此callback中可不必主动执行视图同步方法$update
     */
    reloadNode: function(id, callback) {
        var node = this.getNode(id);
        if (!node) {
            return;
        }
        if (node._pending) {
            //将回调放入回调列表
            callback && node.callbacks.push(callback);
            return;
        }
        // 如果节点的子节点数为0
        if (node.childrenCount === 0) {
            if (node.children === undefined) {
                node.children = [];
            }
            node._loaded = true;
            callback && callback(node); //直接触发回调
            return;
        }
        if (node.childrenCount > 0 || node.root) {
            node._pending = true;
            if (node._loaded) { //子节点数据已加载完成
                node._pending = false;
                callback && callback(node); //直接触发回调
            } else {
                node.callbacks = node.callbacks || [];
                //将回调放入回调列表
                callback && node.callbacks.push(callback);
                this.data.pending = true;
                var params = this.getParams();
                if (node.hasOwnProperty('id')) {
                    params.parentId = node.id;
                }
                //通过服务获取数据
                this.service && this.service.getList(params, function(result) {
                    if (StateTreeView.tid && this.data.lazyUpdate) {
                        clearTimeout(StateTreeView.tid);
                        StateTreeView.tid = null;
                    }
                    node.children = result;
                    if (node.root) { //处理根节点
                        this.data.source = result;
                    }
                    //建立线索: parent, path
                    node.children.forEach(function(item) {
                        item.parent = node.root ? null : node;
                        item.path = node.path + '/' + node.id;
                    });
                    node._loaded = true;
                    node._pending = false;
                    this.data.pending = false;
                    var cb = null;
                    while(cb = node.callbacks.shift()) {
                        cb(node);
                    }
                    
                    /**
                     * @event   updateSource    更新节点后触发
                     */
                    this.$emit('updateSource', node.children);
                    
                    if (this.data.lazyUpdate) {
                        StateTreeView.tid = setTimeout(function () {
                            this.$update();
                        }.bind(this), 500);
                    } else {
                        this.$update();
                    }
                }.bind(this), function() {
                    node._loaded = false;
                    node._pending = false;
                    this.data.pending = false;
                    this.$update();
                }.bind(this));
            }
        }
        
    },
    /**
     * 重新加载树节点数据
     * @param   {Object|Function}   params  查询参数，可以省略
     * @param   {Function}  callback    加载完后的回调
     */
	reload: function(params, callback) {
        if (typeof params === 'function') {
            callback = params;
        } else {
            _.extend(this.params, params, true);
        }
        if (this.params.hasOwnProperty('parentId')) {
            delete this.params.parentId;
        }
        this.rootNode._loaded = false;	
		this.reloadNode(this.rootNode, function(node) {
            callback && callback(node);
            /**
             * @evetn   reload  重新加载树数据时触发
             */
            this.$emit('reload', node.children);
        }.bind(this));
    },
    /**
     * 加载特定子树的所有节点
     * @param   {Object}    node    要完全加载的节点
     * @param   {Function}  callback    单个节点加载完成时的回调
     */
    reloadAll: (function() {
        var load = function(root, cb) {
            if (!root || !root.length) {
                return;
            }
            for (var i = 0, len = root.length; i < len; i++) {
                if (root[i].childrenCount > 0) {
                     this.reloadNode(root[i], cb.bind(this));
                } else {
                    cb.call(this, root[i]);
                }
            }
        };
        return function(node, callback) {
            //continue load
            var cl = function(item) {
                var stop = callback && callback(item);
                if (item.childrenCount > 0 && stop !== false) {
                    load.call(this, item.children, cl);
                }
            };        
            if (node) {
                load.call(this, [node], cl);
            } else {
                load.call(this, this.data.source, cl);
            }
               
        };
    })(),
    /**
     * 刷新单个节点信息，不会影响到其它元素
     * @param  {Number|String|Object} id 节点id或节点对象
     * @param   {Object|Function}   params  查询参数，可以省略
     * @param  {Function}   节点展开之后的回调
     * @return {Object}    返回this
     */
    refreshNode: function(id, params, callback) {
        var node = this.getNode(id);
        if (!node) {
            return this;
        }
        if (typeof params === 'function') {
            callback = params;
        } else {
            _.extend(this.params, params, true);
        }
        var parent = node.parent || this.rootNode,
            _node = null;
        this.params.parentId = parent.id;
        this.service && this.service.getList(this.getParams(), function(result) {
            for (var i = 0; i < result.length; i++) {
                var element = result[i];
                if (element.id == node.id) {
                    _node = element;
                    break;
                }
            }
            if (_node) {
                _.extend(node, _node, true);
            }
            callback && callback();
            _node && this.$update();
        }.bind(this))
    },
    /* 树展开折叠实现 */
    /**
     * @method toggle(item) 展开或收起某一项
     * @private
     * @param  {object} item 展开收起项
     * @return {void}
     */
    toggle: function(item, callback) {
        if(this.data.disabled) {
            return;
        }
        if (!item.open) { //打开
            this.expand(item);
        } else {
            this.collapse(item);
        }

        /**
         * @event toggle 展开或收起某一项时触发
         * @property {object} item 展开收起项
         * @property {boolean} open 展开还是收起
         */
        this.$emit('toggle', {
            item: item,
            open: item.open
        });
    },
    /**
     * 展开某个节点，如果该节点有子节点的话，
     * 未加载子节点的节点会在加载完毕后展开
     * @param  {Number|String|Object} id 节点id或节点对象
     * @param  {Function}   callback 节点展开之后的回调
     * @return {Object}     返回this
     */
    expand: function(id, callback) {
        this.reloadNode(id, function(node) {
            node.open = true;
            callback && callback(node);
        }.bind(this));
        return this;
    },
    /**
     * 展开整个树
     * @param   {Object}    node    要完全展开的节点（会将该节点的所有子节点展开）
     * @param   {Function}  callback    单个节点展开后的回调
     */
    expandAll: function(node, callback) {
        this.reloadAll(node, function(targetNode) {
            targetNode.open = true;
            callback && callback(targetNode);
        }.bind(this));
    },
    /**
     * 展开至特定路径
     */
    expandPath: function(path, callback) {
        var rPath = /(\/\w)+/;
        if (!rPath.test(path)) {
            return;
        }
        var paths = path.slice(1).split('/');
        var expand = function(item) {
            if(paths.length) {
                var id = paths.shift();
                var itemNext = this.getNode(id, item);
                this.expand(itemNext, expand);
            } else {
                callback && callback();
            }
        }.bind(this);
        paths.shift();
        expand(this.rootNode);
    },
    /**
     * 收起节点
     */
    collapse: function(id) {
        var node = this.getNode(id);
        node.open = false;
    },
    /**
     * 收起整个树，会将每个节点都变为收起状态
     */
    collapseAll: function() {
        _.treeWalker({
            children: this.data.source
        }, 'children', this.collapse.bind(this));
    },
    /* 树勾选实现 */
    /**
     * 勾选特定项目
     * @param  {Object|String|Number} item   树节点/树节点id
     * @param  {String} state true表示勾选该节点，否则去掉勾选
     * @param   {Boolean}   expand  是否先将该节点的子树完全展开后再执行勾选
     */
    checkNode: (function() {
        //向下处理子节点
        var checkChildren = function(root, checked) {
            if (!root) {
                return;
            }
            root.checked = !!checked;
            if (root.children && root.children.length > 0) {
                var p = root.children.filter(function(c) { return c.filtered !== false; });
                for (var i = 0, len = p.length; i < len; i++) {
                    checkChildren(p[i], checked);
                }
            }
        };
        //向上处理父节点
        var checkParents = function(node) {
            if (!node || !node.children) return;
            var p = node.children;
            var a = true,
                b = false;
            if (!p) {
                return;
            }
            p = p.filter(function(c) { return c.filtered !== false; });
            for (var i = 0, len = p.length; i < len; i++) {
                a = a && p[i].checked;
                b = b || (p[i].checked || p[i].checked === null);
            }
            if (p.length) {
                if (a === true) {
                    node.checked = true;
                } else {
                    if (b === true) {
                        node.checked = null;
                    } else {
                        node.checked = false;
                    }
                }
            }
            checkParents(node.parent);
        };
        var check = function(item, state) {
            checkChildren(item, state);
            checkParents(item.parent);
        };
        return function(item, state, expand) {
            item = this.getNode(item);
            if (!item) {
                return;
            }
            if (expand) {
                this.expandAll(item, function() {
                    check(item, state);
                });
            } else {
                check(item, state);
            }
        };
    })(),
    /**
     * 选中所有节点
     */
    checkAll: function() {        
        for (var i = 0, len = this.data.source.length; i < len; i++) {
            this.checkNode(this.data.source[i], true);
        }
        this.$emit('checkall');
    },
    /**
     * 反选当前选中的节点
     */
    checkInvert: function() {
        for (var i = 0, len = this.data.source.length; i < len; i++) {
            _.treeWalker(this.data.source[i], 'children', checker);
        }        
        this.$emit('checkinvert');
    },
    /**
     * 获取所有勾选的节点集合
     * @return {Array} 节点集合
     */
    getCheckedNodes: function() {
        var selection = [];
        var selector = function(node) {
            if (!node.id) {
                return;
            }
            if (node.checked === true) {
                selection.push(node);
            }
        };
        _.treeWalker({
            id: 1,
            children: this.data.source
        }, 'children', selector);
        return selection;
    },
    /* 树过滤器实现 */
    /**
     * 获取注册的过滤器
     */
    getFilter: function(name) {
        var filter = null;
        var i = 0,
            len = this.filters.length;
        for(; i < len; i++) {
            if (this.filters[i].name == name) {
                filter = this.filters[i];
                break;
            }
        }
        return filter;
    },
    /**
     * 注册过滤器
     */
    registerFilter: function(name, filter, enable) {
        var o = {
            name: name,
            filterFn: filter,
            enable: !!enable
        };
        if (this.filters.some(function(c) { return c.name === name; })) {
            return this;
        }
        this.filters.push(o);
    },
    /**
     * 开启特定过滤器
     * @param   {String}    name    过滤器名称
     */
    enableFilter: function(name) {
        var filter = this.getFilter(name);
        if (filter) {
            filter.enable = true;
        }
        this.execFilters();
    },
    /**
     * 禁用过滤器
     * @param   {String}    name    过滤器名称
     */
    disableFilter: function(name) {
        var filter = this.getFilter(name);
        if (filter) {
            filter.enable = false;
        }
        this.execFilters();
    },
    /**
     * 对单个节点执行过滤
     * @param   {Object}    item    树节点
     */
    doFilter: function(item) {
        var filtered = true;
        this.data.enableFilter 
        && this.filters.filter(function(filter) {
                return filter.enable;
            })
            .forEach(function(filter) {
                filtered = filtered && !!filter.filterFn.call(this, item);
            }.bind(this));
        item.filtered = filtered;
        //return filtered;
    },
    /**
     * 对树节点执行过滤
     * @private
     */
	execFilters: function() {
		var doFilter = this.doFilter.bind(this);
		_.treeWalker({
			children: this.data.source
		}, 'children', doFilter);
	}
});

/**
 * 状态树视图列表
 * @class StateTreeViewList
 * @extends {SourceComponent}
 */
var StateTreeViewList = SourceComponent.extend({
    name: 'stateTreeViewList',
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
    /**
     * 勾选节点事件处理handler
     * @private
     * @param  {Object} item  勾选的项目
     * @param  {Boolean} state 勾选状态，勾选为true，去掉勾选为false
     */
    _onNodeCheck: function(item, state) {
        this.treeroot.checkNode(item, state.checked);
        this.treeroot.$emit('nodecheck', {
            item: item,
            checked: state.checked
        });
    }
});


module.exports = StateTreeView;
module.exports.StateTreeViewList = StateTreeViewList;
