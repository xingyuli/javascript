(function() {
	$(".focusenabled").hover(
		function() { $(this).addClass($(this).attr('focusclass') || 'focus'); },
		function() { $(this).removeClass($(this).attr('focusclass') || 'focus'); }
	);
})();