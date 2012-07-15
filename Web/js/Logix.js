// Logix.js

function Logix(_div, _width, _height, _difficulty) {
	var self = this;
	
	self.div = $j(_div);
	self.width = _width;
	self.height = _height;
	self.difficulty = _difficulty;
	
	self.board = undefined;
	self.userboard = undefined;
	self.clues = undefined;
	
	self._ctor = function(width, height) {
		self.newGame();
	};
	
	self.newGame = function() {
		self.makeTable();
		self.genBoard();
		self.genClues();
		
		//self.drawBoard();
		self.drawClues();
		self.setEvents();
	};
	
	self.setEvents = function() {
		$j(self.div).find('table td').on('click', function() {
			// toggle the state
			if ($j(this).hasClass('check'))
				$j(this).removeClass('check').addClass('cross');
			else if ($j(this).hasClass('cross'))
				$j(this).removeClass('cross');
			else 
				$j(this).addClass('check');
			
			// fetch x and y from the tag
			var x = parseInt($j(this).attr('x'));
			var y = parseInt($j(this).attr('y'));
			
			// update user board
			self.userboard[x][y] = $j(this).hasClass('check');
			
			// check row and column against clue and update clue if needed
			self.checkClue(x, y);
			
			// check if the game is complete
			self.checkGameOver();
		});
	};
	
	self.checkGameOver = function() {
		var isGameOver = $j(self.div).find('th.completed').length == self.width + self.height;
		if (isGameOver) {
			alert('You won!');
			self.newGame();
		}
	};
	
	self.checkClue = function(x, y) {
		var clue = {x: '', y: ''};
		
		// check x clue
		clue.x = self.genClue(x, 'x', 'user');
		var x_clue_th = $j(self.div).find('table tr:first-child th:eq('+(x+1)+')');
		if (clue.x == self.clues.x[x])
			$j(x_clue_th).addClass('completed');
		else
			$j(x_clue_th).removeClass('completed');
		
		// check y clue
		clue.y = self.genClue(y, 'y', 'user');
		var y_clue_th = $j(self.div).find('table tr:eq('+(y+1)+') th:first-child');
		if (clue.y == self.clues.y[y])
			$j(y_clue_th).addClass('completed');
		else
			$j(y_clue_th).removeClass('completed');
	};
	
	self.drawBoard = function() {
		for (var x = 0; x < self.width; x++) {
			for (var y = 0; y < self.height; y++) {
				var cell = $j(self.div).find('table tr:eq('+(y+1)+') td:eq('+x+')');
				if (self.board[x][y])
					$j(cell).addClass('check');
				else
					$j(cell).removeClass('check');
			}
		}
	};
	
	self.drawClues = function() {
		// draw the x clues
		for (var x = 0; x < self.width; x++) {
			var clue = self.clues.x[x];
			var index = x + 1; // we're not using the first cell
			$j(self.div).find('table tr:first-child th:eq('+index+')').html(clue);
		}
		// draw the x clues
		for (var y = 0; y < self.height; y++) {
			var clue = self.clues.y[y];
			var index = y + 1; // we're not using the first cell
			$j(self.div).find('table tr:eq('+index+') th:first-child').html(clue);
		}
	};
	
	self.makeTable = function() {
		// TODO: add form
	
		var html = '<table cellpadding=0 cellspacing=0>';
		
		// top header row
		html += '<tr>';
		for (x = 0; x <= self.width; x++)
			html += '<th>'+(x == 0 ? (self.width+' x '+self.height) : '')+'</th>';
		html += '</tr>';
		
		// make rows starting with a <th> and rest <td>
		for (y = 0; y < self.height; y++) {
			html += '<tr>';
			html += '<th></th>';
			for (x = 0; x < self.width; x++)
				html += '<td x="'+x+'" y="'+y+'"></td>';
			html += '</tr>';
		}
		html += '</table>';
		
		$j(self.div).html(html);
	}
	self.genBoard = function() {
		// create a new array
		self.board = new Array();
		self.userboard = new Array();
		for (x = 0; x < self.width; x++) {
			self.board[x] = new Array();
			self.userboard[x] = new Array();
		}
		
		// fill in the board with random values
var cnt = 0;
		for (x = 0; x < self.width; x++) {
			for (y = 0; y < self.height; y++) {
				var rand = Math.floor(Math.random()*100);
				var _cellValue;
				switch (self.difficulty) {
					case 'easy':
						_cellValue = rand % 10 < 7;
						break;
					case 'medium':
						_cellValue = rand % 10 < 5;
						break;
					case 'hard':
						_cellValue = rand % 10 < 3;
						break;
				}
				// var _cellValue = (Math.floor(Math.random()*10%5) < 3  ? true : false);
				self.board[x][y] = _cellValue;
if (_cellValue) cnt++;
				self.userboard[x][y] = false;
			}
		}
		var tot = (self.width * self.height);
		console.log('on: ('+cnt+'/'+tot+') = '+ Math.round((cnt * 100) / tot) + '%');
	};
	self.genClues = function() {
		// new array
		self.clues = {
			x : new Array(),
			y : new Array()
		};
		
		// generate the x clues
		for (x = 0; x < self.width; x++) {
			self.clues.x[x] = self.genClue(x, 'x');
		}
		
		// generate the y clues
		for (y = 0; y < self.height; y++) {
			self.clues.y[y] = self.genClue(y, 'y');
		}
	};
	self.genClue = function(value, axis, whichBoard) {
		var _board = self.board;
		if (whichBoard == 'user')
			_board = self.userboard;
		var clue = '';
		if (axis == 'x') {
			// loop through the vertical column at value (as X)
			var x = value;
			var cnt = 0;
			for (y = 0; y < self.height; y++) {
				if (_board[x][y]) {
					cnt++;
				} else {
					if (cnt > 0) {
						if (clue.length > 0)
							clue += ', ';
						clue += cnt.toString();
						cnt = 0
					}
				}
			}
			if (cnt > 0) {
				if (clue.length > 0)
					clue += ', ';
				clue += cnt.toString();
				cnt = 0
			}
		} else if (axis == 'y') {
			// loop through the horizontal column at value (as Y)
			var y = value;
			var cnt = 0;
			for (x = 0; x < self.width; x++) {
				if (_board[x][y]) {
					cnt++;
				} else {
					if (cnt > 0) {
						if (clue.length > 0)
							clue += ', ';
						clue += cnt.toString();
						cnt = 0
					}
				}
			}
			if (cnt > 0) {
				if (clue.length > 0)
					clue += ', ';
				clue += cnt.toString();
				cnt = 0
			}
		}
		if (clue == '')
			clue = '0';
		return clue;
	};
	
	
	this._ctor(_width, _height);
}
