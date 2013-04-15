(function() {
	/* Aliases */
	var slice = Array.prototype.slice;

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

	function string(obj) {
		switch (obj) {
			case null: return 'null';
			case (void 0): return 'undefined'; 
		}

		var type = typeof obj;
		switch (type) {
			case 'number':
			case 'boolean':
			case 'string': return String(obj);
		}

		return String(obj);
	}

	/**
	 * each(args, handler)
	 * - args (Array): items to iterate over
	 * - handler (function | RoundHandler)
	**/
	function each(args, handler) {
		if (!args) {
			return;
		}
	
		if (handler instanceof Function) {
			for (var i = 0, len = args.length; i < len; i++) {
				handler(args[i], i);
			}
		} else /* treat it as a RoundHandler */{
			var roundHandler = RoundHandler.__clone__(handler);
			roundHandler.before();
			for (var i = 0, len = args.length; i < len; i++) {
				roundHandler.handler(args[i], i);
			}
			roundHandler.after();
		}
	}

	/**
	 * arrayCopy(src, offset, length)
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
		requiredAndOptional = requiredAndOptional || {};
		this.required = requiredAndOptional.required || [];
		this.optional = requiredAndOptional.optional || [];
	}
	Cloner.prototype.__clone__ = function(partial) {
		partial = partial || {};
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
	 * $dw(html[, html...]) -> $dw
	 * - html (string)
	 *
	 * A function which wrappers document.write(...).
	**/
	function $dw(html) {
		document.write(slice.call(arguments, 0).join(' '));
		return $dw;
	}

	var nodeRender = function(nodeName, innerHTML) {
		$dw('<' + nodeName + '>' + innerHTML + '</' + nodeName + '>');
	};

	/**
	 * $dw.hn(innerHTML) -> $dw
	 * - innerHTML (string)
	 *
	 * Render <h1/> ~ <h6/> to the document flow.
	**/
	function h1(innerHTML) { nodeRender('h1', innerHTML); return this; }
	function h2(innerHTML) { nodeRender('h2', innerHTML); return this; }
	function h3(innerHTML) { nodeRender('h3', innerHTML); return this; }
	function h4(innerHTML) { nodeRender('h4', innerHTML); return this; }
	function h5(innerHTML) { nodeRender('h5', innerHTML); return this; }
	function h6(innerHTML) { nodeRender('h6', innerHTML); return this; }

	/**
	 * $dw.br(lineHTML) -> $dw
	 * - lineHTML (string)
	 *
	 * Render <br/> to the document flow. If lineHTML provoided, <br/> will be
	 * rendered right after them. 
	**/
	function br(lineHTML) {
		if (lineHTML) {
			$dw(lineHTML);
		}
		$dw('<br/>');
		return this;
	}

	/**
	 * $dw.p(innerHTML) -> $dw
	 * - innerHTML (string)
	 *
	 * Render <p>...</p> to the document flow.
	**/
	function p(innerHTML) {
		nodeRender('p', string(innerHTML));
		return this;
	}

	/**
	 * $dw.b(innerHTML) -> $dw
	 * - innerHTML (string)
	 *
	 * Render <b>...</b> to the document flow.
	**/
	function b(innerHTML) {
		nodeRender('b', string(innerHTML));
		return this;
	}

	/**
	 * $dw.th(innerHTML) -> $dw
	 * - innerHTML (string): cell value in <th></th>
	 *
	 * Render <th>...</th> to the document flow.
	**/
	function th(innerHTML) {
		nodeRender('th', string(innerHTML));
		return this;
	}

	/**
	 * $dw.td(innerHTML) -> $dw
	 * - innerHTML (string): cell value in <td></td>
	 * 
	 * Render <td>...</td> to the document flow.
	**/
	function td(innerHTML) {
		nodeRender('td', string(innerHTML));
		return this;
	}
	
	var headRowRender = {
		before	: function() 		{ $dw('<tr>'); },
		handler	: function(item) 	{ $dw.th(string(item)); },
		after	: function() 		{ $dw('</tr>'); }
	};
	var normalRowRender = {
		before	: function() 		{ $dw('<tr>'); },
		handler	: function(item) 	{ $dw.td(string(item)); },
		after	: function() 		{ $dw('</tr>'); }
	};
	/**
	 * $dw.tr(innerHTML[, innerHTML...][, isHead]) -> $dw
	 * - innerHTML (string): cell value in <td></td> or <th></th>
	 * - isHead (boolean): true if the row is table head
	 *
	 * Render <tr><th/>...</tr> or <tr><td></td>...</tr> to document flow.
	**/
	function tr(innerHTML, isHead) {
		if (arguments.length == 1) {
			each([ innerHTML ], normalRowRender);
		} else {
			var lastArg = arguments[arguments.length - 1];
			if (typeof lastArg == 'boolean' && lastArg) {
				each(arrayCopy(arguments, 0, arguments.length - 1), headRowRender);
			} else {
				each(arguments, normalRowRender);
			}
		}
		return this;
	}

	extend($dw, {
		h1: h1,
		h2: h2,
		h3: h3,
		h4: h4,
		h5: h5,
		h6: h6,
		br: br,
		p: p,
		b: b,
		tr: tr,
		th: th,
		td: td
	});

	window.$dw = $dw;
	Object.extend = extend;
})();
