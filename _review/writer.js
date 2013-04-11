(function() {

	function extend(destination, source) {
		for (var prop in source) {
			destination[prop] = source[prop];
		}
		return destination;
	}

	extend(Object, {
		extend: extend
	});

	/* Constants */
	var EMPTY = function() {};

	/* Helper classes and objects */
	var Safe = {
		str: function(toCheck) {
			return toCheck || '';
		},
		array: function(toCheck) {
			return toCheck || [];
		},
		json: function(toCheck) {
			return toCheck || {};
		}
	};
	
	var Cloner = function(requiredAndOptional) {
		requiredAndOptional = Safe.json(requiredAndOptional);
		this.required = Safe.array(requiredAndOptional.required);
		this.optional = Safe.array(requiredAndOptional.optional);
	};
	Cloner.prototype.__clone__ = function(partial) {
		partial = Safe.json(partial);
		var retVal = {};
		for (var key in this.required) {
			retVal[key] = partial[key];
		}
		for (var key in this.optional) {
			retVal[key] = partial[key] || this.optional[key];
		}
		return retVal;
	};
	
	var Util = (function() {
		var RoundHandler = new Cloner({
			required: {
				handler: EMPTY
			},
			optional: {
				before: EMPTY,
				after: EMPTY
			}
		});

		return {
			/*
			each - ...
			
			args	: Array,
			handler	: function | RoundHandler
			*/
			each: function(args, handler) {
				if (!args) {
					return;
				}
			
				if (handler instanceof Function) {
					for (var i = 0, len = args.length; i < len; i++) {
						handler(args[i]);
					}
				} else /* treat it as a RoundHandler */{
					var roundHandler = RoundHandler.__clone__(handler);
					roundHandler.before();
					for (var i = 0, len = args.length; i < len; i++) {
						roundHandler.handler(args[i]);
					}
					roundHandler.after();
				}
			},
			
			/*
			arrayCopy - ...
			
			src		: Array,
			offset	: non-negative number,
			length	: non-negative number
			*/
			arrayCopy: function(src, offset, length) {
				if (!src) {
					return [];
				}
				
				var copy = [];
				var range = Math.min(src.length - offset, length);
				for (var i = 0; i < range; i++) {
					copy[i] = src[offset + i];
				}
				return copy;
			}
		};
	})();
	
	// $w is a function object which wrappers document.write(...)
	window.$w = function() {
		for (var i = 0, len = arguments.length; i < len; i++) {
			document.write(arguments[i]);
		}
	};
	
	// $w also defines a varity of ultility funcitons
	
	/*
	$w.h1 ~ $w.h6 - render <h1/> ~ <h6/>
	
	title	: string
	*/
	for (var i = 1; i <= 6; i++) {
		(function(level) {
			$w['h' + i] = function(title) {
				$w('<h' + level + '>' + Safe.str(title) + '</h' + level + '>');
			};
		})(i);
	}
	
	/**
	 * $w.th(cellVal)
	 * - cellVal (string): cell value in <th></th>
	 *
	 * Render <th>...</th> to the document flow.
	**/
	function th(cellVal) {
		$w('<th>' + Safe.str(cellVal) + '</th>');
	};
	
	/**
	 * $w.td(cellVal)
	 * - cellVal (string): cell value in <td></td>
	 * Render <td>...</td> to the document flow.
	**/
	function td(cellVal) {
		$w('<td>' + Safe.str(cellVal) + '</td>');
	};
	
	/**
	 * $w.tr()
	 * Render <tr><th/>...</tr> or <tr><td></td>...</tr> to document flow.
	
	cells	: string...,
	isHead	: boolean
	**/
	function tr() {
		var lastArg = arguments[arguments.length - 1];
		var isHead = lastArg && (typeof lastArg == "boolean");
		if (isHead) {
			Util.each(Util.arrayCopy(arguments, 0, arguments.length - 1), {
				before	: function()		{ $w('<tr>'); },
				handler	: function(item)	{ $w.th(item); },
				after	: function()		{ $w('</tr>'); }
			});
		} else {
			Util.each(arguments, {
				before	: function()		{ $w('<tr>'); },
				handler	: function(item)	{ $w.td(item); },
				after	: function()		{ $w('</tr>'); }
			});
		}
	};

	Object.extend($w, {
		th: th,
		td: td,
		tr: tr,
	});
})();