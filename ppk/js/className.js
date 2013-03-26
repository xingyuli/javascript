(function() {
	var blah = document.getElementById('blah');
	blah.onmouseover = function() {
		blah.className = "blah";
	};
	blah.onmouseout = function() {
		blah.className = "";
	};
})();