"use strict";

var Invaders = {};

var GameCycle = {};
var Globals = {};
var Utils = {};
var Entities = {};
var Controls = {};
var Sounds = {};
var Scene = {};
var UI = {};
var Callbacks = {
  onGameLoaded: function(){},
  onEnemyDead: function(){},
  onPlayerDead: function(){}
};

var Player = {};
var Teammates = {};
var Enemies = {};

Globals.serverUrl = '';
Globals.assetsUrl = '';

Globals.defaultCanvasWidth = window.innerWidth;
Globals.defaultCanvasHeight = 560;
Globals.canvasWidth = Globals.defaultCanvasWidth;
Globals.canvasHeight = Globals.defaultCanvasHeight;

Globals.maxTeammateSimulation = 50;
Globals.maxEnemySimulation = 50;

Globals.worldSize = {
	x: 1920,
	y: 560
};

Globals.enemyType = {};

Globals.explosionsEnabled = true;

Entities.bgClouds = [];

Entities.player;

Entities.teammates = {};
Entities.teammateLabels = {};

// Enemies are stored in groups by type
Entities.enemies = {};
Entities.enemyBullet;

Sounds.music;
Sounds.shootSound;
Sounds.explosionSound;
Sounds.bigExplosionSound;
Sounds.levelUpSound;

Entities.ownBullets;
Entities.bullets;
Entities.explosions;
Entities.shootExplosions;
Entities.smallExplosions;
Entities.largeExplosions;
var bulletTime = 0;

Entities.bombs = [];

// Control Keys
Controls.cursors;
Controls.altCursors;
Controls.fireButton;

Globals.speeds = {
  'ship': 450,
  'bullets': 1000,
  'bombs': 300,
  'firingTime': 300,
  'bombTime': 1000
};

Globals.bulletLevels = {
  'Level1': [ {x:0, y:-50} ],
  'Level2': [ {x:0, y:-50},
              {x:-27, y:-5}, {x:+27, y:-5} ],
  'Level3': [ {x:0, y:-50},
              {x:-45, y:-5}, {x:+45, y:-5} ],
  'Level4': [ {x:0, y:-50},
              {x:-25, y:-40}, {x:+25, y:-40},
              {x:-45, y:-5}, {x:+45, y:-5} ]
};


Globals.gameOverPhrases = [
  "GAME OVER.",
  "YOU SUCK.",
  "YOU ARE THE IE6 OF PEOPLE.",
  "EPIC FAIL. LOL.",
  "DIE, POTATO.",
  "YOU SHOULD TRY ASSEMBLY.",
  "OH NOES.",
  "YOU HAVE BEEN DEADED.",
  "ALL YOUR BASE ARE BELONG TO US.",
  "YOU ARE A HORRIBLE PERSON.",
  "YOU WIN. AT LOSING.",
  "YOU SHOULD BE ASHAMED.",
  "FISSION MAILED.",
  "YOU'VE GOT FAIL!"
];


// Debugging
UI.fpsText;
UI.pingText;

// Game State
UI.stateTextHolder;
UI.stateText;
UI.scoreTextHolder;
UI.scoreText;
UI.progressBarHolder;
UI.progressBar