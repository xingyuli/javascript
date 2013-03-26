/* wrong */
/*
var test = document.getElementById('test');
test.onclick = function() {
	alert('Hello World!');
};
*/

/* correct */
// onload event
/*
window.onload = function() {
	var test = document.getElementById('test');
	test.onclick = function() {
		alert('Hello World!');
	};
};
*/

// DOMContentLoaded event
if (document.addEventListener) {
	document.addEventListener(
		'DOMContentLoaded',
		function() {
			document.getElementById('test').onclick = function() {
				alert('Hello World!');
			};
		},
		false
	);
} else {
	document.attachEvent(
		'onDOMContentLoaded',
		function() {
			document.getElementById('test').onclick = function() {
				alert('Hello World!');
			};
		}
	);
}