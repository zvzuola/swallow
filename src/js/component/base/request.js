/**
 * Ajax     Ajax请求封装
 */

'use strict';
var escape = require('lodash/string/escape');
var reqwest = require('reqwest');
var _ = require('./util.js');
var Notify = require('../common/notify.js');
var Loading = require('../common/loading.js');
var loading = new Loading();
var doc = document;
var ajax = {
    tasks: [],
    request: function(opt) {
        var task,
            _success = opt.success,
            _complete = opt.complete,
            _error = opt.error,
            params = {
                timestamp: +new Date()
            };
        _.extend(params, opt.data);
        opt.data = params;
        if (opt.method && opt.method.toLowerCase() !== 'get') {
            opt.contentType = 'application/json; charset=utf-8';
            opt.data = JSON.stringify(opt.data);
        }
        opt.success = ajax.createSuccessHandler(_success, _error, opt);
        opt.error = function(err) {     
            _error && _error(err);            
            console.error('Ajax Error: ', err);
        };
        opt.complete = function(xhr) {
            ajax.tasks.remove(task);
            if (!ajax.tasks.some(function(item) { return item._options.loading; })) {
                opt.loading && loading.hide();
            }
            _complete && _complete(xhr);
        };
        opt.loading && loading.show();
        task = reqwest(opt);
        if (opt.async === false) { //同步请求
            var data = null,
                error = task._erred || task._timeout;
            try {
                data = JSON.parse(task.request.responseText);
            } catch(e) {
                error = e;
            }
            if (error) {
                opt.error.call(task, _.isString(error) ? error : task.request.responseText);
            } else {
                opt.success.call(task, data);
            }
            opt.complete.call(task, task.request);
        }
        task._options = opt;
        if (ajax.tasks.indexOf(task) < 0) {
            ajax.tasks.push(task);
        }
        return task;
    },
    abortAll: function() {
        ajax.tasks.forEach(function(task) {
            task.request.abort && task.request.abort();
            task._options.error && task._options.error('abort');
        });
        console.warn('All Ajax requests have aborted!');
    },
    createSuccessHandler: function(success, error, opt) {
        return function(data) {
            var code = data.code,
                result = data.result;
            switch(code) {
                case 200: //success
                    if (opt._ga) {
                        for(;opt._ga[2] > 0; opt._ga[2]--) {
                            _gaq.push(['_trackEvent', opt._ga[0], opt._ga[1]]);
                        }
                    }
                    success && success(result);
                    break;
                case 302: // unauthorized
                    window.location.reload(true);
                    break;
                case 500: // server error
                    console.error('Mission Failed:', data)
                    _.isString(result) && Notify.error(result);
                    error && error(result);
                    break;
            }
        };
    },
    processData: function(data) {
        for(var item in data) {
            if (data.hasOwnProperty(item)) {
                if (_.isString(data[item])) {
                    data[item] = escape(data[item]);
                }
            }
        }
        return data;
    }
};
if (doc) {
    new Image().src = '/image/ani_loading_ex.gif';
    new Image().src = '/image/spinner-rosetta-blue.gif';
}
module.exports = ajax;