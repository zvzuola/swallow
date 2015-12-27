'use strict';

var Component = require('./component.js');
var _ = require('./util.js');

/**
 * @class SourceComponent
 * @extend Component
 * @param {object}                      options.service 数据服务
 */
var SourceComponent = Component.extend({
    service: null,
    /**
     * @protected
     */
    config: function() {
        this.params = {};
        _.extend(this.data, {
            updateAuto: true,
            source: undefined
        });

        if(this.data.service)
            this.service = this.data.service;

        if(this.service && this.data.updateAuto)
            this.$updateSource();

        this.supr();
    },
    getParams: function() {
        return this.params;
    },
    $updateSource: function(callback) {
        this.service.getList(this.getParams(), function(result) {
            this.$update('source', result);

            callback && callback.call(this, result);
            this.$emit('updateSource', {
                result: result
            });
        }.bind(this));
        return this;
    }
});

module.exports = SourceComponent;