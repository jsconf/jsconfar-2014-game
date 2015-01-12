"use strict";

/* Load all the assets */
GameCycle.preload = function() {

  // Disable controls on start
  GameCycle.disableGameControls();

  // Pause on blur (or else it kills the CPU and keeps running)
  game.stage.disableVisibilityChange = false;

  var time = '201413111835';

  game.load.image('bullet', Globals.assetsUrl+'bullet.png?'+time);
  game.load.image('bomb', Globals.assetsUrl+'bomb.png?'+time);

  game.load.image('playerLevel1', Globals.assetsUrl+'player_level_1.png?'+time);
  game.load.image('playerLevel2', Globals.assetsUrl+'player_level_2.png?'+time);
  game.load.image('playerLevel3', Globals.assetsUrl+'player_level_3.png?'+time);
  game.load.image('playerLevel4', Globals.assetsUrl+'player_level_4.png?'+time);

	game.load.spritesheet('droneMini', Globals.assetsUrl+'droneMini_45x150x44.png?'+time, 45, 150, 44);
  game.load.spritesheet('droneDouble', Globals.assetsUrl+'droneDouble_64x150x38.png?'+time, 64, 150, 38);
  game.load.spritesheet('ufo', Globals.assetsUrl+'ufo_88x112x13.png?'+time, 88, 112, 13);

  // Exposions
  game.load.spritesheet('shootExplosion', Globals.assetsUrl+'shoot_32x32x6.png?'+time, 32, 32, 6);
  game.load.spritesheet('smallExplosion', Globals.assetsUrl+'explosion_32x32x10.png?'+time, 32, 32, 10);
  game.load.spritesheet('largeExplosion', Globals.assetsUrl+'explosion_110x110x21.png?'+time, 110, 110, 21);

  // Scene
  game.load.image('bgCloud',Globals.assetsUrl+'scene/bg.png?'+time);
  game.load.image('bgCity', Globals.assetsUrl+'scene/bgcity.png?'+time);
  game.load.image('bgCity2',Globals.assetsUrl+'scene/bgcity2.png?'+time);
  game.load.image('cloud1', Globals.assetsUrl+'scene/clouds-01.png?'+time);
  game.load.image('cloud2', Globals.assetsUrl+'scene/clouds-02.png?'+time);
  game.load.image('cloud3', Globals.assetsUrl+'scene/clouds-03.png?'+time);
  game.load.image('cloud4', Globals.assetsUrl+'scene/clouds-04.png?'+time);
  game.load.image('cloud5', Globals.assetsUrl+'scene/clouds-05.png?'+time);
  game.load.image('cloud6', Globals.assetsUrl+'scene/clouds-06.png?'+time);
  game.load.image('cloud7', Globals.assetsUrl+'scene/clouds-07.png?'+time);
  game.load.image('cloud8', Globals.assetsUrl+'scene/clouds-08.png?'+time);
  game.load.image('cloud9', Globals.assetsUrl+'scene/clouds-09.png?'+time);

  // Audio
  game.load.audio('shoot', [Globals.assetsUrl+'audio/shoot.mp3']);
  game.load.audio('levelUp', [Globals.assetsUrl+'audio/levelup.mp3']);
  game.load.audio('explosion', [Globals.assetsUrl+'audio/explosion.mp3']);
  game.load.audio('bigExplosion', [Globals.assetsUrl+'audio/bigexplosion.mp3']);

  game.load.audio('journey', [Globals.assetsUrl+'audio/journey.mp3']);

};
