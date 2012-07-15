// javascript.js


$j(function() {
	$j('form').submit();
});

var onNewGame = function(_form, _evt) {
	var width = parseInt(_form.width.value);
	var height = parseInt(_form.height.value);
	var difficulty = _form.difficulty.value;
	console.log('width: ' +width + '; height = ' + height);
	
	window._logix = new Logix('#divGame', width, height, difficulty);
	return false;
}