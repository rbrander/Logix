// javascript.js


$j(function() {
	$j('form').submit();
});

var onNewGame = function(_form, _evt) {
	var level = _form.level.value;
	window._logix = new Logix('#divGame', level);
	
	return false;
}
