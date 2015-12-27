/**
 * ------------------------------------------------------------
 * importProgress    导入进度查询
 * ------------------------------------------------------------
 */

var Component = require('../base/component.js');
var template = require('./pollingProgress.html');
var Progress = require('./progress.js');
var TaskRunner = require('../../external/taskrunner.js');
var _ = require('../base/util.js');

var PollingProgress = Component.extend({
    name: 'importProgress',
    template: template,
    /**
     * @protected
     */
    config: function () {
        _.extend(this.data, {
            importProgress: {
				processed: 0,
				total: 1
			},
			//查询的伐值
			threshold: 10
        });
        this.supr();
    },
    init: function() {        
		this.data.importProgress.processed = 0;
		this.data.importProgress.total = 1;
    },
    /**
     * @method rollPoling(handler, callback) 启动轮询
     * @public
     * @param  {Array} param 处理函数的请求参数
     * @param  {function} callback 回调函数
     * @return {void}
     */
    rollPoling: function(param, callback){
    	var task,
			lastNum = null,
			count = 0,
			processHandler = function (result) {
				var r;
				r = result;
				if (lastNum === r.saved_num) {
					count++;
				} else {
					count = 0;
				}
				lastNum = r.saved_num;
				this.data.importProgress.processed = r.saved_num;
				this.data.importProgress.total = r.total_num;
				this.$update(); 
				if (r.saved_num === r.total_num || count > this.data.threshold) {
					TaskRunner.stop(task);
                    callback && callback();
					this.data.importProgress.processed = 0;
					this.data.importProgress.total = 1;
					return;
				}
			}.bind(this);
		task = TaskRunner.start({
			run: function () {
				this.data.service.fetchProgress(param.join(","), processHandler);
			},
			scope: this,
			interval: 5000 //5秒查询一次
		});
		this.task = task;
    }

});

module.exports = PollingProgress;