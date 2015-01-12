"use strict";

Player.playerLevels = {};

Player.playerSizes = {
	'level1': {w:26, h:100},
	'level2': {w:68, h:100},
	'level3': {w:106, h:100},
	'level4': {w:106, h:100}
};

Player.levelSetup = function(levels) {
	for( var i in levels ) {
		Player.playerLevels['level'+levels[i].level] = levels[i];
	}
};


Player.levelUp = function(level) {
	if( typeof Entities.player.level === 'undefined' ) {
		Entities.player.level = 1;
	}
	if( level === Entities.player.level ){ return; }

	if( level > Entities.player.level ) {
		if( ! game.sound.noAudio && ! game.paused ) {
			Sounds.levelUpSound.play();
		}
	}

	Entities.player.level = level;
	Player.updateSprite();
};


Player.updateSprite = function() {
	if( typeof Entities.player.level === 'undefined' ) { Entities.player.level = 1; }
	Entities.player.loadTexture('playerLevel'+ Entities.player.level);
	Entities.player.body.setSize(Player.playerSizes['level'+Entities.player.level].w, Player.playerSizes['level'+Entities.player.level].h, 0, 0);
};



