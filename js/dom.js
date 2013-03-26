/* utilities for manipulating DOMs */

var Dom = {};

Dom.Browser = {
	isIE : navigator.appName.indexOf('Microsoft') != -1,
	isFF : navigator.appName.indexOf('Netscape') != -1
};

Dom.ViewPort = {
		
	getScroll : function() {
		var scrOfX = 0, scrOfY = 0;
		
		if( typeof( window.pageYOffset ) == 'number' ) {
			//Netscape compliant
			scrOfY = window.pageYOffset;
			scrOfX = window.pageXOffset;
		} else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
			//DOM compliant
			scrOfY = document.body.scrollTop;
			scrOfX = document.body.scrollLeft;
		} else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
			//IE6 standards compliant mode
			scrOfY = document.documentElement.scrollTop;
			scrOfX = document.documentElement.scrollLeft;
		}
		
		return { x : scrOfX, y : scrOfY };
	}

};

Dom.Constants = {
	_prop_class : Dom.Browser.isIE ? "className" : "class",
	_prop_opacity : Dom.Browser.isIE ? "filter" : "opacity",
	_prop_opacity_limit : Dom.Browser.isIE ? 100 : 1,
	_css_cursor : Dom.Browser.isIE ? 'hand' : 'pointer'
};

Dom.Null = new Object();

Dom.create = function(tag, attrs, styles) {
	return new Dom.Element(Dom.createDom(tag, attrs, styles));
};

Dom.createDom = function(tag, attrs, styles) {
	var dom = document.createElement(tag);
	Dom.attrs(dom, attrs);
	Dom.styles(dom, styles);
	return dom;
};

/**
* Deprecated, use Dom.$(element).setAttrs(...) instead
*/
Dom.attrs = function(dom, attrs) {
	for (var key in attrs) {
		dom.setAttribute(key, attrs[key]);
	}
};

/**
* Deprecated, use Dom.$(element).setStyles(...) instead
*/
Dom.styles = function(dom, styles) {
	for (var key in styles) {
		dom.style[key] = styles[key];
	}
};

Dom.addListener = function (dom, event, handler) {
	dom[event] = handler;
};

Dom.append = function(dom, child) {
	dom.appendChild(child);
};

Dom.remove = function(element) {
	var d = Dom.$(element).dom;
	if (d && d.parentNode) {
		d.parentNode.removeChild(d);
		return Dom.$(d);
	}
	return Dom.Null;
};

/**
* Deprecated, use Dom.$(element).show() instead
*/
Dom.show = function(dom) {
	Dom.styles(dom, {display : 'block'});
};

/**
* Deprecated, use Dom.$(element).hide() instead
*/
Dom.hide = function(dom) {
	Dom.styles(dom, {display : 'none'});
};

Dom.innerHTML = function(dom, html) {
	try {
		dom.innerHTML = html;
	} catch(e) {}
};

Dom.value = function(dom, val) {
	dom.value = val;
};

Dom.$I = function(id) {
	return document.getElementById(id);
};

Dom.$C = function(className) {
	return document.getElementsByClassName(className);
};

Dom.$N = function(name) {
	return document.getElementsByName(name);
};

Dom.$T = function(tagName) {
	return document.getElementsByTagName(tagName);
};

Dom.toggle = function(element, attr) {
	var dom = Dom.$(element);
	
	if ('display' == attr) {
	    if (dom.style["display"] == 'none') {
	        Dom.show(dom);
	    } else {
	        Dom.hide(dom);
	    }
	}
};

Dom.$ = function(element) {
	return new Dom.Element(element);
};

Dom.Element = function(element) {
	if (typeof element == 'string') {
		this.dom = Dom.$I(element);
	} else if (element instanceof Dom.Element){
		this.dom = element.dom;
	} else /* treat as HTMLElement */ {
		this.dom = element;
	}
};

Dom.Element.prototype = {
	
	isInstanceOf : function(type) {
		return this.dom instanceof type;
	},
	
	setAttrs : function(attrs) {
		Dom.attrs(this.dom, attrs);
		return this;
	},
	
	setStyles : function(styles) {
		Dom.styles(this.dom, styles);
		return this;
	},
	
	addClass : function(className) {
		var previous = this.dom.style[Dom.Constants._prop_class];
		this.dom.setAttribute(
			Dom.Constants._prop_class,
			(!previous || (previous == '')) ? className : previous + ' ' + className
		);
		return this;
	},
	
	value : function(v) {
		this.dom.value = v;
		return this;
	},
	
	update : function(html) {
		Dom.innerHTML(this.dom, html ? html : '');
		return this;
	},
	
	insert : function(element) {
		if (!element) {
			return;
		}
		
		if (typeof element == 'string') {
			Dom.append(this.dom, Dom.$I(element));
		} else if (element instanceof Dom.Element) {
			Dom.append(this.dom, element.dom);
		} else {
			Dom.append(this.dom, element);
		}
		return this;
	},
	
	/* return the removed element */
	remove : function(element) {
		if (!element) {
			return Dom.remove(this.dom);
		} else {
			return Dom.remove(element);
		}
	},
	
	show : function() {
		Dom.show(this.dom);
		return this;
	},
	
	hide : function() {
		Dom.hide(this.dom);
		return this;
	},
	
	toggle : function() {
		Dom.toggle(this.dom, 'display');
		return this;
	},
	
	/* return handler back rathan than Dom.Element itself for convenience when refer to the handler */
	on : function(event, handler) {
		var self = this;
		this.dom['on' + event] = function() { handler(self); };
		return handler;
	}
	
};


/**
* Based on dom.js
*
* Supported options:
* from
* to
* duration
*/
Dom.Fade = (function() {
	
	// Default set to use 1 second(20 * 5% -> 1) to show an element.
	var opacityTime = 20;
	var defaultInterval = 50;
	var opacityStep = Dom.Constants._prop_opacity_limit / opacityTime;
	
	var generateOpacity;
	if (navigator.appName.indexOf('Netscape') != -1) {
		generateOpacity = function(opacity) {
			return opacity;
		};
		
	} else if (navigator.appName.indexOf('Microsoft') != -1) {
		generateOpacity = function(opacity) {
			return "alpha(opacity=" + opacity + ")";
		};
	}
	
	return {
	
		show : function(element, options) {
			element = Dom.$(element);
			if (element.showing || element.outing) {
				return;
			}
			
			var current = 0;
			var to = Dom.Constants._prop_opacity_limit;
			var interval = defaultInterval;
			if (options) {
				if (options.from) {
					current = Dom.Constants._prop_opacity_limit * options.from;
				}
				if (options.to) {
					to = Dom.Constants._prop_opacity_limit * options.to;
				}
				if (options.duration) {
					interval = options.duration / opacityTime;
				}
			}
			
			element.showing = true;
			element.show();
			var nextOpacity = function() {
				element.dom.style[Dom.Constants._prop_opacity] = generateOpacity(current);
				current += opacityStep;
			
				if (current - to > opacityStep) {
					element.showing = false;
				} else {
					window.setTimeout(function() { nextOpacity(); }, interval);
				}
			};
			nextOpacity();
		},
		
		out : function(element, options) {
			element = Dom.$(element);
			if (element.showing || element.outing) {
				return;
			}
			
			var current = Dom.Constants._prop_opacity_limit;
			var to = 0;
			var interval = defaultInterval;
			if (options) {
				if (options.from) {
					current = Dom.Constants._prop_opacity_limit * options.from;
				}
				if (options.to) {
					to = Dom.Constants._prop_opacity_limit * options.to;
				}
				if (options.duration) {
					interval = options.duration / opacityTime;
				}
			}
			
			element.outing = true;
			var nextOpacity = function() {
				if (current < 0) {
					element.outing = false;
				} else {
					element.dom.style[Dom.Constants._prop_opacity] = generateOpacity(current);
					current -= opacityStep;
					if (current <= 0) {
						element.hide();
					}
					window.setTimeout(function() { nextOpacity(); }, interval);
				}
			};
			nextOpacity();
		}
		
	};

})();