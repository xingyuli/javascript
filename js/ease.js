
Array.prototype.contains = function(e) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == e) {
			return true;
		}
	}
	return false;
};

/* EaseJS framework */

var EaseJS = {};

EaseJS.Browser = {
	isIE : navigator.appName.indexOf('Microsoft') != -1,
	isFF : navigator.appName.indexOf('Netscape') != -1
};

EaseJS.Constants = {
	_attr_class : EaseJS.Browser.isIE ? "className" : "class",
	_css_opacity : EaseJS.Browser.isIE ? "filter" : "opacity",
	_css_opacity_limit : EaseJS.Browser.isIE ? 100 : 1,
	_css_cursor : EaseJS.Browser.isIE ? 'hand' : 'pointer'
};

EaseJS.Null = new Object();

EaseJS.ViewPort = {
		
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

EaseJS.create = function(tag, attrs, styles) {
	return new EaseJS.Element(EaseJS.createDom(tag, attrs, styles));
};

EaseJS.createDom = function(tag, attrs, cssStyles) {
	var dom = document.createElement(tag);
	for (var key in attrs) {
		dom.setAttribute(key, attrs[key]);
	}
	for (var key in cssStyles) {
		dom.style[key] = cssStyles[key];
	}
	return dom;
};

EaseJS.$ = function(element) {
	return new EaseJS.Element(element);
};

EaseJS.$I = function(id) {
	return document.getElementById(id);
};

EaseJS.$T = function(tagName) {
	var doms = document.getElementsByTagName(tagName);
	var encapulatedDoms = new Array();
	for (var i = 0; i < doms.length; i++) {
		encapulatedDoms.push(EaseJS.$(doms[i]));
	}
	return encapulatedDoms;
};

/**
* Need to use an external engine.
*/
/*
EaseJS.$C = function(className) { return document.getElementsByClassName(className); };
EaseJS.$N = function(name) { return document.getElementsByName(name); };
*/

EaseJS.Element = function(element) {
	if (typeof element == 'string') {
		this.dom = EaseJS.$I(element);
	} else if (element instanceof EaseJS.Element){
		this.dom = element.dom;
	} else /* treat as HTMLElement */ {
		this.dom = element;
	}
};

EaseJS.Element.prototype = {
	
	isInstanceOf : function(type) {
		return this.dom instanceof type;
	},
	
	setAttrs : function(attrs) {
		for (var key in attrs) {
			this.dom.setAttribute(key, attrs[key]);
		}
		return this;
	},
	
	getAttribute : function(attr) {
		return this.dom.getAttribute(attr);
	},
	
	setStyles : function(cssStyles) {
		for (var key in cssStyles) {
			this.dom.style[key] = cssStyles[key];
		}
		return this;
	},
	
	getStyle : function(cssStyle) {
		return this.dom.style[cssStyle];
	},
	
	setClass : function(className) {
		this.dom.className = className || '';
		return this;
	},
	
	addClass : function(className) {
		var previous = this.dom.className || '';
		this.dom.className = (previous == '') ? className : previous + ' ' + className;
		return this;
	},
	
	value : function(v) {
		this.dom.value = v;
		return this;
	},
	
	getValue : function() {
		return this.dom.value;
	},
	
	update : function(html) {
		try {
			this.dom.innerHTML = html || '';
		} catch(e) {}
		return this;
	},
	
	innerHTML : function() {
		if (!this.dom.innerHTML) {
			return '';
		}
		return this.dom.innerHTML.trim();
	},
	
	insert : function(element) {
		if (!element) {
			return;
		}
		
		if (typeof element == 'string') {
			this.dom.appendChild(EaseJS.$I(element));
		} else if (element instanceof EaseJS.Element) {
			this.dom.appendChild(element.dom);
		} else {
			this.dom.appendChild(element);
		}
		return this;
	},
	
	/* return the removed element */
	remove : function(element) {
		var retVal = element ? EaseJS.$(element) : this;
		var d = retVal.dom;
		if (d && d.parentNode) {
			d.parentNode.removeChild(d);
			return retVal;
		}
		
		return EaseJS.Null;
	},
	
	show : function() {
		this.setStyles({'display' : 'block'});
		return this;
	},
	
	hide : function() {
		this.setStyles({'display' : 'none'});
		return this;
	},
	
	toggle : function(cssStyle) {
		if (!cssStyle) {
			if (this.dom.style['display'] == 'none') {
				this.show();
			} else {
				this.hide();
			}
			
		} else /* TODO */ {
			
		}
		return this;
	},
	
	/* return handler back rather than EaseJS.Element itself for convenience when refer to the handler */
	on : function(event, handler) {
		var self = this;
		this.dom['on' + event] = function() { handler(self); };
		return handler;
	}
	
};

/**
* TabbedPanel widget.
*/
EaseJS.TabbedPanel = function(options) {
	this.options = options || {};
	this.tabs = {};
	
	this.initialize();
};

EaseJS.TabbedPanel.prototype = {
	
	initialize : function() {
		var renderTo = EaseJS.$(this.options.renderTo).addClass('taber');
		
		var tabWrapper = EaseJS.create('div').addClass('tabs');
		renderTo.insert(tabWrapper);
		
		var content = EaseJS.create('div').addClass('content');
		renderTo.insert(content);
	
		var previousTab;
		var mouseOverHandler = function(self) {
		    self.setStyles({
		        'cursor' : EaseJS.Constants._css_cursor,
		        'color' : '#000000',
		        'backgroundColor' : '#FFFFFF'
		    });
		};
		var mouseOutHandler = function(self) {
		    if (self == previousTab) {
		        self.setStyles({'cursor' : 'default', 'backgroundColor' : '#EFEFEF'});
		    } else {
		        self.setStyles({'cursor' : 'default', 'backgroundColor' : '#00409A', 'color' : '#FFFFFF'});
		    }
		};
		
		var toRemove = [];
		var tabConfigs = this.options.tabs || {};
		for (var i = 0; i < tabConfigs.length; i++) {
			var tabConfig = tabConfigs[i];
			
			var aTab = EaseJS.create('span').addClass('tab').update(tabConfig.text);
			aTab.reference = EaseJS.$(tabConfig.reference);
			// Provide possibility for different tabs can refer to the same HTMLElement.
			if (!toRemove.contains(tabConfig.reference)) {
				toRemove.push(tabConfig.reference);
			}
			
			aTab.on('mouseover', mouseOverHandler);
			aTab.on('mouseout', mouseOutHandler);
			
			(function() {
				var configCopy = tabConfig;
				aTab.on('click', function(self) {
					self.setStyles({'backgroundColor' : '#EFEFEF', 'color' : '#000000'});
					content.insert(self.reference);
					
					if (configCopy.clicked) {
			        	configCopy.clicked(self);
					}
					
					if (self != previousTab) {
				        previousTab.setStyles({'backgroundColor' : '#00409A', 'color' : '#FFFFFF'});
			        	if (previousTab.reference.dom != self.reference.dom) {
			        		previousTab.reference.remove();
						}
				        previousTab = self;
					}
				});
			})();
			this.tabs[tabConfig.name] = aTab;
			tabWrapper.insert(aTab);
		}
		
		for (var i = 0; i < toRemove.length; i++) {
			EaseJS.$(toRemove[i]).remove();
		}
		
		var defaultTab = this.options.defaultTab || tabConfigs[0].name;
		previousTab = this.tabs[defaultTab];
		this.select(defaultTab);
	},
		
	select : function(tabName) {
    	var tab = this.tabs[tabName];
    	tab.dom.onclick.apply(tab.dom);
    }

};

EaseJS.Effect = new Object();

/**
* Supported options:
* from
* to
* duration
*/
EaseJS.Effect.Fade = (function() {
	// Default set to use 1 second(20 * 5% -> 1) to show an element.
	var opacityTime = 20;
	var defaultInterval = 50;
	var opacityStep = EaseJS.Constants._css_opacity_limit / opacityTime;
	
	var generateOpacity;
	if (EaseJS.Browser.isIE) {
		generateOpacity = function(opacity) { return "alpha(opacity=" + opacity + ")"; };
	} else {
		generateOpacity = function(opacity) { return opacity; };
	}
	
	return {
	
		show : function(element, options) {
			element = EaseJS.$(element);
			if (element.showing || element.outing) {
				return;
			}
			
			var current = 0;
			var to = EaseJS.Constants._css_opacity_limit;
			var interval = defaultInterval;
			if (options) {
				if (options.from) {
					current = EaseJS.Constants._css_opacity_limit * options.from;
				}
				if (options.to) {
					to = EaseJS.Constants._css_opacity_limit * options.to;
				}
				if (options.duration) {
					interval = options.duration / opacityTime;
				}
			}
			
			element.showing = true;
			element.show();
			var nextOpacity = function() {
				element.dom.style[EaseJS.Constants._css_opacity] = generateOpacity(current);
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
			element = EaseJS.$(element);
			if (element.showing || element.outing) {
				return;
			}
			
			var current = EaseJS.Constants._css_opacity_limit;
			var to = 0;
			var interval = defaultInterval;
			if (options) {
				if (options.from) {
					current = EaseJS.Constants._css_opacity_limit * options.from;
				}
				if (options.to) {
					to = EaseJS.Constants._css_opacity_limit * options.to;
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
					element.dom.style[EaseJS.Constants._css_opacity] = generateOpacity(current);
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
