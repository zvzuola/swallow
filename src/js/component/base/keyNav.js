/**
 * KeyNav
 * @author hzyangzhouzhi(hzyangzhouzhi@corp.netease.com)
 */
 
 var _ = require('./util.js');
 
 var relay = function(e){
    var k = e.which + '',
        h = this.keyToHandler[k];
    if(h && this[h]){
        if(this.doRelay(e, this[h], h) !== true){
            e[this.defaultEventAction]();
        }
    }
};
/**
 * @class KeyNav
 * @constructor
 * @param {Element} el The element to bind to
 * @param {Object} config The config
 */
var KeyNav = function(el, config){
    this.el = el;
    _.extend(this, config, true);
    this.relay = relay.bind(this);
    if(!this.disabled){
        this.disabled = true;
        this.enable();
    }
};

KeyNav.prototype = {
    disabled : false,
    defaultEventAction: "stop",

    // private
    doRelay : function(e, h, hname){
        return h.call(this, e, hname);
    },

    // possible handlers
    enter : false,
    backspace: false,
    left : false,
    right : false,
    up : false,
    down : false,
    tab : false,
    esc : false,
    pageUp : false,
    pageDown : false,
    del : false,
    home : false,
    end : false,
    space : false,

    // quick lookup hash
    keyToHandler : {
        37 : "left",
        39 : "right",
        38 : "up",
        40 : "down",
        33 : "pageUp",
        34 : "pageDown",
        46 : "del",
        36 : "home",
        35 : "end",
        8: 'backspace',
        13 : "enter",
        27 : "esc",
        9  : "tab",
        32 : "space"
    },
    
    /**
     * Destroy this KeyNav (this is the same as calling disable).
     */
    destroy: function(){
        this.disable();    
    },

	/**
	 * Enable this KeyNav
	 */
	enable: function() {
        if (this.disabled) {
            _.dom.on(this.el, 'keydown', this.relay);
            this.disabled = false;
        }
    },

	/**
	 * Disable this KeyNav
	 */
	disable: function() {
        if (!this.disabled) {
            _.dom.off(this.el, 'keydown', this.relay);
            this.disabled = true;
        }
    }
};

module.exports = KeyNav;