/**
 * ImageViewer
 * 图像预览器
 * @autor   capasky(hzyangzhouzhi@corp.netease.com)
 */


var _ = require('../base/util.js');
var Component = require('../base/component.js');
var template = require('./imageViewer.html');

var ZOOM_STEP = 0.15,
    ZOOM_MAX = 16, //最大缩放 16x
    ZOOM_MIN = 0.1 //最小缩放 0.1x
    GALARY_WIDTH = 36,
    GALARY_GAP = 4;

var ImageViewer = Component.extend({
    name: 'imageViewer',
    template: template,
    config: function() {
        _.extend(this.data, {
            show: false,
            autoShow: true,
            images: [],
            current: undefined,
            x: 0,
            y: 0,
            px: 0,
            py: 0,
            zoom: 1,
            imageShow: false,
            scaleInfoShow: false,
            galaryLeft: 0,
            backdrop: false            
        });
        this.supr();
    },
    init: function() {
        this.$inject(document.body);
        if (this.data.autoShow) {
            this.data.images.length && this.select(this.data.images[0]);
            this.show();
        }
        this.supr();
        this._onImageMouseMove = this._onImageMouseMove.bind(this);
        this._onImageMouseUp = this._onImageMouseUp.bind(this);
    },
    _onImageLoaded: function(e) {
        var image = e.target;
        _.extend(this.data.current, {
            width: image.width,
            height: image.height
        });
        setTimeout(function() {
            this.$update('imageShow', true);
            this.updateImagePosition(this.data.current);
        }.bind(this), 200);
    },
    _onImageWheel: function(e) {
        e.stop();
        if (!this.lastPagePoint || this.lastPagePoint.x !== e.pageX || this.lastPagePoint.y !== e.pageY) {
            this.lastPagePoint = { x: e.pageX, y: e.pageY };
            var image = e.target,
                ow = image.offsetWidth,
                oh = image.offsetHeight,
                rect = image.getBoundingClientRect(),
                ix = e.pageX - rect.left,
                iy = e.pageY - rect.top,
                x = ix / rect.width * ow,
                y = iy / rect.height * oh;
            this.data.px = x;
            this.data.py = y;
        }
        this.zoom(e.wheelDelta);      
    },
    _onImageMouseDown: function(e) {
        e.preventDefault();
		this.draging = true;
		this.origin = {
			x: e.pageX - e.target.offsetLeft,
			y: e.pageY - e.target.offsetTop
		};
		_.dom.addClass(document.body, 'z-draging');
		_.dom.on(document.body, 'mousemove', this._onImageMouseMove);
		_.dom.on(document.body, 'mouseup', this._onImageMouseUp);
		this.$emit('dragstart', {
			source: this
		});
    },
    _onImageMouseMove: function(e) {
		if (!this.draging) {
			return;
		}
		window.getSelection().removeAllRanges();
		var x = e.pageX - this.origin.x,
			y = e.pageY - this.origin.y;
        this.data.x = x;
        this.data.y = y;
        this.$update();        
    },
    _onImageMouseUp: function(e) {
		this.draging = false;
		_.dom.delClass(document.body, 'z-draging');
		_.dom.off(document.body, 'mousemove', this._onImageMouseMove);
		_.dom.off(document.body, 'mouseup', this._onImageMouseUp);
		this.$emit('dragend', {
			source: this
		});        
    },
    _onCloseButtonClick: function(e) {
        this.hide();
    },
    _onMaskClick: function(e) {
        if (this.data.backdrop) {
            this.hide();
        }
    },
    /**
     * @private
     */
    updateImagePosition: function(image) {
        var img = this.$refs.image, //image dom element
            body = document.body,
            dw = body.clientWidth,
            dh = body.clientHeight,
            index = this.data.images.indexOf(image);
            
        this.data.x = (dw - img.clientWidth)/2;
        this.data.y = (dh - img.clientHeight)/2;
        this.data.galaryLeft = dw/2 - GALARY_WIDTH/2 - index*(GALARY_WIDTH + GALARY_GAP);
        this.$update();        
    },
    show: function(autoSelect) {
        autoSelect && this.data.images.length && this.select(this.data.images[0]);
        this.data.show = true;
        this.$update();
        this.$emit('show');
    },
    hide: function() {
        this.data.show = false;
        this.lastPagePoint = null;
        
        this.$update();
        this.$emit('hide');
    },
    close: function() {
        
        this.$emit('close');
    },
    /**
     * 对当前图像进行缩放
     * @param   {Number}    dir 取值为 1:放大，-1：缩小，0：重置
     */
    zoom: function(dir) {
        switch (dir) {
            case 1:
                this.data.zoom += ZOOM_STEP;
                break;
            case -1:
                this.data.zoom -= ZOOM_STEP;
                break;
            case 0:
                this.data.zoom = 1;
                break;
        }
        if (this.data.zoom < ZOOM_MIN) {
            this.data.zoom = ZOOM_MIN;
        } else if (this.data.zoom > ZOOM_MAX) {
            this.data.zoom = ZOOM_MAX;
        }
        this.data.scaleInfoShow = true;
        setTimeout(function() {
            this.$update('scaleInfoShow', false);
        }.bind(this), 800);
    },
    /**
     * 选择一个图像进行预览
     */
    select: function(image) {
        var ii = this.data.current && this.data.current.src === image.src; 
        if (this.data.current === image) {
            return;
        }
        this.data.imageShow = false;
        this.data.current = image;
        this.data.zoom = 1;
        
        this.$emit('select', {
            source: this,
            selected: image
        });
        ii && this._onImageLoaded({ target: this.$refs.image });
    }
});

module.exports = ImageViewer;