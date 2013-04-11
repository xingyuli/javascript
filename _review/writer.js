(function() {
	/* Constants */
	var EMPTY = function() {};

	/**
	 * Object.extend(destination, source) -> Object
	 * - destination (Object)
	 * - source (Object)
	**/
	function extend(destination, source) {
		for (var prop in source) {
			destination[prop] = source[prop];
		}
		return destination;
	}

	// $w.Safe.str(toCheck)
	function safeStr(toCheck)	{ return toCheck || ''; }

	// $w.Safe.array(toCheck)
	function safeArray(toCheck)	{ return toCheck || []; }
	
	// $w.Safe.json(toCheck)
	function safeJson(toCheck)	{ return toCheck || {}; }

	/**
	 * $w.Util.each(args, handler)
	 * - args (Array): items to iterate over
	 * - handler (function | RoundHandler)
	**/
	function each(args, handler) {
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
	}

	/**
	 * $w.Util.arrayCopy(src, offset, length)
	 * - src (Array)
	 * - offset (number): non-negative int number,
	 * - length	(number): non-negative int number
	**/
	function arrayCopy(src, offset, length) {
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

	function Cloner(requiredAndOptional) {
		requiredAndOptional = safeJson(requiredAndOptional);
		this.required = safeArray(requiredAndOptional.required);
		this.optional = safeArray(requiredAndOptional.optional);
	}
	Cloner.prototype.__clone__ = function(partial) {
		partial = safeJson(partial);
		var retVal = {};
		for (var key in this.required) {
			retVal[key] = partial[key];
		}
		for (var key in this.optional) {
			retVal[key] = partial[key] || this.optional[key];
		}
		return retVal;
	};
	
	var RoundHandler = new Cloner({
		required: {
			handler: EMPTY
		},
		optional: {
			before: EMPTY,
			after: EMPTY
		}
	});
	
	/**
	 * $w(args)
	 * - args(any...)
	 *
	 * A function which wrappers document.write(...).
	**/
	function $w(args) {
		each(arguments, function(item) {
			document.write(item);
		});
	}
	
	var hRender = function(level, title) {
		$w('<h' + level + '>' + safeStr(title) + '</h' + level + '>');
	};
	/**
	 * $w.hn(title)
	 * - title (string)
	 *
	 * Render <h1/> ~ <h6/> to the document flow.
	**/
	function h1(title) { hRender(1, title); }
	function h2(title) { hRender(2, title); }
	function h3(title) { hRender(3, title); }
	function h4(title) { hRender(4, title); }
	function h5(title) { hRender(5, title); }
	function h6(title) { hRender(6, title); }
	
	/**
	 * $w.th(cellVal)
	 * - cellVal (string): cell value in <th></th>
	 *
	 * Render <th>...</th> to the document flow.
	**/
	function th(cellVal) {
		$w('<th>' + safeStr(cellVal) + '</th>');
	}

	/**
	 * $w.td(cellVal)
	 * - cellVal (string): cell value in <td></td>
	 * 
	 * Render <td>...</td> to the document flow.
	**/
	function td(cellVal) {
		$w('<td>' + safeStr(cellVal) + '</td>');
	}
	
	var headRowRender = {
		before	: function() 		{ $w('<tr>'); },
		handler	: function(item) 	{ $w.th(item); },
		after	: function() 		{ $w('</tr>'); }
	};
	var normalRowRender = {
		before	: function() 		{ $w('<tr>'); },
		handler	: function(item) 	{ $w.td(item); },
		after	: function() 		{ $w('</tr>'); }
	};
	/**
	 * $w.tr(cellVal...[, isHead])
	 * - cellVal (string...): cell values in <td></td> or <th></th>
	 * - isHead (boolean): true if the row is table head
	 *
	 * Render <tr><th/>...</tr> or <tr><td></td>...</tr> to document flow.
	**/
	function tr(cellVal, isHead) {
		if (arguments.length == 1) {
			each([ cellVal ], normalRowRender);
		} else {
			var lastArg = arguments[arguments.length - 1];
			if (typeof lastArg == 'boolean' && lastArg) {
				each(arrayCopy(arguments, 0, arguments.length - 1), headRowRender);
			} else {
				each(arguments, normalRowRender);
			}
		}
	}

	extend($w, {
		Util: {
			each: each,
			arrayCopy: arrayCopy
		},
		Safe: {
			str: safeStr,
			array: safeArray,
			json: safeJson
		},
		h1: h1,
		h2: h2,
		h3: h3,
		h4: h4,
		h5: h5,
		h6: h6,
		tr: tr,
		th: th,
		td: td
	});

	Object.extend = extend;
	window.$w = $w;
})();
