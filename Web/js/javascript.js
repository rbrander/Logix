// javascript.js


$j(function() {
	window._logix = new Logix('#divGame');
});

var onNewGame = function(_form, _evt) {
	var level = _form.level.value;
	window._logix = new Logix('#divGame', level);
	
	return false;
}
