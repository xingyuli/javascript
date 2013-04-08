(function() {
	var Safe = {
		str: function(toCheck) {
			return toCheck || '';
		}
	};
	
	var EMPTY = function() {};
	
	var RoundHandler = {
		handler: EMPTY,
		before: EMPTY,
		after: EMPTY,
		
		__clone__: function(partial) {
			partial = partial || {};
			var retVal = {};
			retVal.handler = partial.handler || this.handler;
			retVal.before = partial.before || this.before;
			retVal.after = partial.after || this.after;
		}
	};
	
	var Util = {
		each: function(args, roundHandler) {
			roundHandler = RoundHandler.__clone__(roundHandler);
			roundHandler.before();
			for (var i = 0, len = args.length; i < len; i++) {
				roundHandler.handler(args[i]);
			}
			roundHandler.after();
		}
	};

	// $w is a function object which wrappers document.write(...)
	window.$w = function(/* arguments */) {
		for (var i = 0, len = arguments.length; i < len; i++) {
			document.write(arguments[i]);
		}
	};
	
	// $w also defines a varity of ultility funcitons
	
	// $w.h1 ~ $w.h6: render <h1/> ~ <h6/>
	for (var i = 1; i <= 6; i++) {
		(function(level) {
			$w['h' + i] = function(title) {
				$w('<h' + level + '>' + Safe.str(title) + '</h' + level + '>');
			};
		})(i);
	}
	
	// $w.th: render <th>...</th>
	$w.th = function(cellVal) {
		$w('<th>' + Safe.str(cellVal) + '</th>');
	};
	
	// $w.trh: render <tr><th/>...</tr>
	$w.trh = function(/* arguments */) {
		var args = arguments || [];
		$w('<tr>');
		for (var i = 0, len = args.length; i < len; i++) {
			$w.th(args[i]);
		}
		$w('</tr>');
	};
	
	// $w.td: render <td>...</td>
	$w.td = function(cellVal) {
		$w('<td>' + Safe.str(cellVal) + '</td>');
	};
	
	// $w.tr: render <tr><td/>...</tr>
	$w.tr = function(/* arguments */) {
		var args = arguments || [];
		$w('<tr>');
		for (var i = 0, len = args.length; i < len; i++) {
			$w.td(args[i]);
		}
		$w('</tr>');
	};
})();