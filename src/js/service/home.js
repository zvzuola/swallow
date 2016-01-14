var ajax = require('../component/base/request.js');
var _ = require('../component/base/util.js');

exports.getArticleList = function(params, callback, error) {
    ajax.request({
        url: '/post/get_articles',
        method: 'post',
        type: 'json',
        data: params,
        // loading: true,
        success: callback,
        error: error
    });
};