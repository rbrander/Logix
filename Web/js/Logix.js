// Logix.js

function Logix(_div, _level) {
	var self = this;
	
	self.div = $j(_div);
	self.level = _level;
	
	self.userboard = undefined;
	self.clues = undefined;
	
	self._ctor = function() {
		self.levels = $j.parseJSON(window.atob(self.data)).levels;
		self.newGame();
	};
	
	self.getWidth = function() {
		var width = 0;
		
		width = self.levels[self.level-1].data[0].length;
		
		return width;
	};
	
	self.getHeight = function() {
		var height = 0;
		
		height = self.levels[self.level-1].data.length;
		
		return height;
	};
	
	self.newGame = function() {
		if (typeof(self.level) == 'undefined') {
			self.level = 1;
			// check if there is a cookie
			var levelCookie = self.getCookieLevel();
			if (levelCookie) {
				if (levelCookie > 1) {
					if (levelCookie > self.levels.length)
						levelCookie = self.levels.length;
					while (self.level < levelCookie) {
						self.level++;
						self.addLevelToSelect();
					}
				}
			}	
		}
		self.loadLevel();
	};
	
	self.getCookieLevel = function() {
		var levelCookie = self.getCookie('level');
		if (levelCookie)
			return parseInt(levelCookie);
	};
	
	self.loadLevel = function() {
		self.makeTable();
		self.resetUserBoard();
		self.genClues();
		self.drawClues();
		
		// check each column and row (to select rows with clue = 0)
		for (y = 0; y < self.getHeight(); y++)
			self.checkClue(0, y);
		for (x = 0; x < self.getWidth(); x++)
			self.checkClue(x, 0);
		
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
			self.userboard[y][x] = $j(this).hasClass('check');
			
			// check row and column against clue and update clue if needed
			self.checkClue(x, y);
			
			// check if the game is complete
			self.checkGameOver();
		});
	};
	
	self.checkGameOver = function() {
		var finishedLevel = $j(self.div).find('th.completed').length == self.getWidth() + self.getHeight();
		if (finishedLevel) {
			var cookieLevel = self.getCookieLevel();
			var levelUnlocked = (cookieLevel && cookieLevel < (self.level+1));
			// level up
			self.levelUp();
			// check if there are any more levels to accomplish
			if (self.level > self.levels.length) {
				alert('Game Over! You won!');
			} else {
				self.addLevelToSelect();
				alert('Level '+(self.level-1)+' finished' + (levelUnlocked ? ';  Level '+self.level+' unlocked!' : ''));
				self.loadLevel();
			}
		}
	};
	
	self.levelUp = function() {
		self.level++;
		// set/update cookie
		var levelCookie = self.getCookieLevel();
		if (!levelCookie || levelCookie < self.level)
			self.setCookie('level', self.level.toString());
	};
	
	self.addLevelToSelect = function() {
		var select = $j('#selLevel')[0];
		
		// find out if it already exists
		var exists = false;
		var i;
		for (i = 0; i < select.options.length && !exists; i++)
			if (select.options[i].value == self.level.toString())
				exists = true;
		
		if (!exists) {
			select.options[select.options.length] = new Option('Level '+self.level, self.level.toString());
			select.selectedIndex = select.options.length-1;
		} else {
			select.selectedIndex = i - 1;
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
	
	self.drawClues = function() {
		// draw the x clues
		for (var x = 0; x < self.getWidth(); x++) {
			var clue = self.clues.x[x];
			var index = x + 1; // we're not using the first cell
			$j(self.div).find('table tr:first-child th:eq('+index+')').html(clue);
		}
		// draw the x clues
		for (var y = 0; y < self.getHeight(); y++) {
			var clue = self.clues.y[y];
			var index = y + 1; // we're not using the first cell
			$j(self.div).find('table tr:eq('+index+') th:first-child').html(clue);
		}
	};
	
	self.makeTable = function() {
		// TODO: add form
		var width = self.getWidth();
		var height = self.getHeight();
		var html = '<table cellpadding=0 cellspacing=0>';
		
		// top header row
		html += '<tr>';
		for (x = 0; x <= width; x++)
			html += '<th>'+(x == 0 ? (width+' x '+height) : '')+'</th>';
		html += '</tr>';
		
		// make rows starting with a <th> and rest <td>
		for (y = 0; y < height; y++) {
			html += '<tr>';
			html += '<th></th>';
			for (x = 0; x < width; x++)
				html += '<td x="'+x+'" y="'+y+'"></td>';
			html += '</tr>';
		}
		html += '</table>';
		
		$j(self.div).html(html);
	};
	
	self.resetUserBoard = function() {
		// create a new array
		self.userboard = new Array();
		for (y = 0; y < self.getHeight(); y++)
			self.userboard[y] = new Array();
		
		// fill in the board with empty values
		for (y = 0; y < self.getHeight(); y++)
			for (x = 0; x < self.getWidth(); x++)
				self.userboard[y][x] = false;
	};
	
	self.genClues = function() {
		// new array
		self.clues = {
			x : new Array(),
			y : new Array()
		};
		
		// generate the x clues
		for (x = 0; x < self.getWidth(); x++) {
			self.clues.x[x] = self.genClue(x, 'x', 'level');
		}
		
		// generate the y clues
		for (y = 0; y < self.getHeight(); y++) {
			self.clues.y[y] = self.genClue(y, 'y', 'level');
		}
	};
	
	self.genClue = function(_value, axis, whichBoard) {
		// select the board to evaluate
		var _board;
		if (whichBoard == 'user')
			_board = self.userboard;
		else if (whichBoard == 'level')
			_board = self.levels[self.level-1].data;
		
		// build the clue
		var clue = '';
		if (axis == 'x') {
			// loop through the vertical column where '_value' is the the x position
			var x = _value;
			var cnt = 0;
			for (y = 0; y < self.getHeight(); y++) {
				if (_board[y][x]) {
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
			var y = _value;
			var cnt = 0;
			for (x = 0; x < self.getWidth(); x++) {
				if (_board[y][x]) {
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
	
	self.setCookie = function(cookieName, cookieValue, expiryDays) {
		// calculate the expiry (1 day if not specified)
		var hasExpiry = (typeof(expiryDays) != 'undefied');
		var _expiry = new Date();
		if (hasExpiry)
			_expiry.setDate(_expiry.getDate() + expiryDays);
		// combine all three values
		var cookieValueWithExpiry = escape(cookieValue) + (hasExpiry ? '; expires=' + _expiry.toUTCString() : '');
		document.cookie = cookieName + '=' + cookieValueWithExpiry;
	};

	self.getCookie = function(cookieName) {
		// each cookie is divided by a semicolon
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			// split on the equal sign
			var pair = cookies[i].split('=');
			// check if this is the cookie we're looking for
			if (pair.length >= 2) {
				if ($j.trim(pair[0]) == cookieName)
					return unescape($j.trim(pair[1]));
			}
		}
	};
	
	self.data = 'eyJsZXZlbHMiOlt7ImxldmVsIjogMSwiZGlmZmljdWx0eSI6ICJWZXJ5IEVhc3kiLCJzaXplIjogIjR4NCIsImRhdGEiOiBbWzEsMSwxLDBdLFswLDAsMCwwXSxbMSwwLDAsMF0sWzEsMSwxLDBdXX0seyJsZXZlbCI6IDIsImRpZmZpY3VsdHkiOiAiRWFzeSIsInNpemUiOiAiNHg0IiwiZGF0YSI6IFtbMCwxLDEsMV0sWzAsMSwwLDBdLFsxLDAsMCwwXSxbMSwxLDEsMV1dfSx7ImxldmVsIjogMywiZGlmZmljdWx0eSI6ICJFYXN5Iiwic2l6ZSI6ICI1eDUiLCJkYXRhIjogW1sxLDEsMCwxLDFdLFsxLDAsMSwwLDFdLFsxLDAsMSwxLDBdLFswLDEsMCwxLDFdLFsxLDAsMCwwLDFdXX0seyJsZXZlbCI6IDQsImRpZmZpY3VsdHkiOiAiRWFzeSIsInNpemUiOiAiNHg0IiwiZGF0YSI6IFtbMSwxLDEsMF0sWzAsMSwwLDFdLFsxLDEsMSwwXSxbMCwxLDAsMV1dfSx7ImxldmVsIjogNSwiZGlmZmljdWx0eSI6ICJFYXN5Iiwic2l6ZSI6ICI2eDkiLCJkYXRhIjogW1sxLDEsMSwxLDEsMV0sWzEsMCwwLDAsMCwwXSxbMSwxLDEsMSwxLDFdLFswLDAsMCwwLDAsMV0sWzEsMSwxLDEsMSwxXSxbMSwwLDAsMCwwLDBdLFsxLDEsMSwxLDEsMV0sWzAsMCwwLDAsMCwxXSxbMSwxLDEsMSwxLDFdXX0seyJsZXZlbCI6IDYsImRpZmZpY3VsdHkiOiAiRWFzeSIsInNpemUiOiAiNHg0IiwiZGF0YSI6IFtbMSwxLDEsMV0sWzEsMSwxLDFdLFswLDEsMSwwXSxbMCwxLDEsMF1dfSx7ImxldmVsIjogNywiZGlmZmljdWx0eSI6ICJFYXN5Iiwic2l6ZSI6ICI1eDYiLCJkYXRhIjogW1swLDEsMSwwLDBdLFsxLDEsMSwwLDBdLFsxLDAsMCwwLDBdLFswLDEsMSwxLDFdLFswLDAsMSwxLDBdLFsxLDEsMSwwLDFdXX0seyJsZXZlbCI6IDgsImRpZmZpY3VsdHkiOiAiRWFzeSIsInNpemUiOiAiNHg0IiwiZGF0YSI6IFtbMSwxLDEsMV0sWzAsMCwxLDBdLFswLDEsMSwwXSxbMSwxLDAsMV1dfSx7ImxldmVsIjogOSwiZGlmZmljdWx0eSI6ICJFYXN5Iiwic2l6ZSI6ICI0eDQiLCJkYXRhIjogW1sxLDAsMCwxXSxbMSwxLDEsMF0sWzAsMSwxLDFdLFsxLDAsMCwxXV19LHsibGV2ZWwiOiAxMCwiZGlmZmljdWx0eSI6ICJFYXN5Iiwic2l6ZSI6ICI0eDQiLCJkYXRhIjogW1sxLDEsMCwxXSxbMCwxLDEsMF0sWzAsMSwxLDFdLFsxLDAsMCwxXV19LHsibGV2ZWwiOiAxMSwiZGlmZmljdWx0eSI6ICJNZWRpdW0iLCJzaXplIjogIjV4NSIsImRhdGEiOiBbWzEsMCwxLDAsMV0sWzEsMSwwLDEsMV0sWzEsMSwxLDEsMV0sWzAsMSwxLDEsMF0sWzAsMCwxLDAsMF1dfSx7ImxldmVsIjogMTIsImRpZmZpY3VsdHkiOiAiTWVkaXVtIiwic2l6ZSI6ICI2eDYiLCJkYXRhIjogW1swLDEsMSwwLDAsMV0sWzEsMCwxLDAsMSwwXSxbMCwxLDAsMSwwLDFdLFsxLDEsMCwxLDEsMF0sWzEsMCwxLDAsMSwxXSxbMCwwLDEsMSwwLDFdXX0seyJsZXZlbCI6IDEzLCJkaWZmaWN1bHR5IjogIk1lZGl1bSIsInNpemUiOiAiNXg1IiwiZGF0YSI6IFtbMCwwLDAsMCwxXSxbMSwxLDEsMCwxXSxbMSwxLDEsMCwxXSxbMCwxLDEsMSwwXSxbMSwxLDEsMCwwXV19LHsibGV2ZWwiOiAxNCwiZGlmZmljdWx0eSI6ICJNZWRpdW0iLCJzaXplIjogIjV4NSIsImRhdGEiOiBbWzEsMCwwLDEsMV0sWzAsMSwxLDAsMF0sWzAsMSwxLDEsMV0sWzAsMSwxLDEsMV0sWzEsMSwxLDAsMF1dfSx7ImxldmVsIjogMTUsImRpZmZpY3VsdHkiOiAiTWVkaXVtIiwic2l6ZSI6ICI0eDgiLCJkYXRhIjogW1swLDEsMCwxXSxbMCwxLDEsMF0sWzEsMCwwLDFdLFswLDEsMSwwXSxbMSwxLDAsMF0sWzAsMCwxLDFdLFsxLDAsMSwwXSxbMCwxLDAsMF1dfSx7ImxldmVsIjogMTYsImRpZmZpY3VsdHkiOiAiTWVkaXVtIiwic2l6ZSI6ICI1eDUiLCJkYXRhIjogW1sxLDEsMCwwLDFdLFsxLDEsMSwxLDBdLFswLDAsMSwxLDFdLFsxLDEsMCwwLDFdLFsxLDEsMSwwLDBdXX0seyJsZXZlbCI6IDE3LCJkaWZmaWN1bHR5IjogIk1lZGl1bSIsInNpemUiOiAiNXg1IiwiZGF0YSI6IFtbMSwxLDAsMCwxXSxbMSwxLDEsMSwwXSxbMCwxLDEsMSwwXSxbMCwxLDEsMSwxXSxbMSwwLDAsMSwxXV19LHsibGV2ZWwiOiAxOCwiZGlmZmljdWx0eSI6ICJNZWRpdW0iLCJzaXplIjogIjZ4NiIsImRhdGEiOiBbWzEsMSwwLDEsMCwwXSxbMSwxLDAsMSwxLDFdLFswLDEsMSwxLDAsMF0sWzAsMCwxLDAsMSwxXSxbMSwwLDEsMCwxLDFdLFsxLDAsMSwwLDEsMV1dfSx7ImxldmVsIjogMTksImRpZmZpY3VsdHkiOiAiTWVkaXVtIiwic2l6ZSI6ICI1eDciLCJkYXRhIjogW1swLDEsMSwwLDBdLFswLDEsMSwxLDBdLFswLDEsMSwwLDBdLFsxLDAsMSwwLDBdLFsxLDEsMCwwLDBdLFswLDAsMSwwLDFdLFswLDEsMCwxLDFdXX0seyJsZXZlbCI6IDIwLCJkaWZmaWN1bHR5IjogIk1lZGl1bSIsInNpemUiOiAiNHg0IiwiZGF0YSI6IFtbMCwwLDEsMF0sWzEsMCwxLDFdLFswLDEsMCwxXSxbMSwxLDAsMF1dfSx7ImxldmVsIjogMjEsImRpZmZpY3VsdHkiOiAiTWVkaXVtIiwic2l6ZSI6ICI2eDYiLCJkYXRhIjogW1swLDEsMSwwLDEsMV0sWzEsMCwxLDAsMCwwXSxbMSwxLDAsMSwxLDBdLFswLDAsMSwwLDAsMV0sWzEsMSwwLDEsMSwxXSxbMSwwLDEsMCwwLDBdXX0seyJsZXZlbCI6IDIyLCJkaWZmaWN1bHR5IjogIk1lZGl1bSIsInNpemUiOiAiNXg1IiwiZGF0YSI6IFtbMCwxLDEsMCwxXSxbMCwxLDAsMCwxXSxbMSwwLDEsMSwwXSxbMCwxLDAsMSwxXSxbMSwwLDEsMCwwXV19XX0=';
	self._ctor();
}
