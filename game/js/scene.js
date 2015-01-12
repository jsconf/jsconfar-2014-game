"use strict";

Globals.initialCloudPositions = [
  {x: +500, y:50,  vx: -10 },
  {x: -300, y:250, vx: -10 },
  {x: +80,  y:360, vx: -10 },
  {x: -600, y:80,  vx: -10 },
  {x: +500, y:50,  vx: -10 },
  {x: -300, y:250, vx: -10 },
  {x: +400,  y:400, vx: -10 },
  {x: -800, y:300, vx: -10 },
  {x: +480, y:350, vx: -10 }
];

Scene.moveClouds = function(deltaTime) {
  for( var ix in Entities.bgClouds ) {
    Entities.bgClouds[ix].x += Entities.bgClouds[ix].vx * deltaTime / 1000.0;
    //Entities.bgClouds[ix].y += Entities.bgClouds[ix].vy * deltaTime / 1000.0;

    if( Entities.bgClouds[ix].x < -100 ) {
      Entities.bgClouds[ix].x = Globals.worldSize.x + 100 - (-100 - Entities.bgClouds[ix].x);
    }
    if( Entities.bgClouds[ix].x > Globals.worldSize.x + 100 ) {
      Entities.bgClouds[ix].x = -100 + (Entities.bgClouds[ix].x - (Globals.worldSize.x + 100));
    }
  }
};

Scene.explosionFragments = {
  'playerLevel1':[[89,4,11,18], [74,4,15,11], [74,15,15,7], [61,4,13,18], [36,8,25,10],
                  [46,0,15,8], [36,0,10,7], [23,0,13,18], [40,18,21,8], [29,18,11,8],
                  [18,18,12,8], [12,8,11,10], [0,0,23,8], [0,8,12,10], [0,18,17,8] ],
  'playerLevel2':[[75,25,25,18], [50,22,25,8], [60,30,15,13], [50,30,10,17], [45,22,5,29],
                  [50,51,10,17], [34,51,16,7], [34,58,16,10], [0,0,11,13], [11,0,8,20],
                  [34,0,11,13], [45,0,15,10], [45,10,15,7], [19,0,15,6], [19,22,7,25],
                  [0,30,11,33], [19,56,15,7], [22,47,12,9], [11,56,8,7], [34,6,66,7],
                  [34,13,11,9], [19,13,15,9], [11,47,11,9], [0,20,11,10], [19,6,15,7],
                  [11,20,8,14], [11,34,8,13], [0,13,11,7], [19,63,15,5], [0,63,19,5] ],
  'playerLevel3':[[0,0,20,11], [20,0,6,11], [26,0,22,11], [37,11,11,17], [27,18,10,10],
                  [48,1,8,15], [26,11,11,7], [26,28,22,10], [74,38,7,21], [33,59,15,9],
                  [33,68,15,9], [21,59,12,9], [21,30,5,17], [21,47,20,12], [21,68,5,21],
                  [26,68,7,12], [42,77,6,29], [48,89,10,9], [48,98,8,8], [26,94,16,12],
                  [15,11,11,17], [0,28,21,16], [0,11,15,17], [0,44,21,15], [0,72,14,9],
                  [0,59,14,13], [14,59,7,30], [33,77,8,17], [26,80,7,14], [16,89,10,17],
                  [0,81,14,8], [0,89,18,9], [0,98,16,8],  [48,40,14,26], [62,44,16,8],
                  [62,52,16,10], [78,44,9,18], [87,44,13,18] ],
  'playerLevel4':[[0,0,20,11], [20,0,6,11], [26,0,22,11], [37,11,11,17], [27,18,10,10],
                  [48,1,8,15], [26,11,11,7], [26,28,22,10], [74,38,7,21], [33,59,15,9],
                  [33,68,15,9], [21,59,12,9], [21,30,5,17], [21,47,20,12], [21,68,5,21],
                  [26,68,7,12], [42,77,6,29], [48,89,10,9], [48,98,8,8], [26,94,16,12],
                  [15,11,11,17], [0,28,21,16], [0,11,15,17], [0,44,21,15], [0,72,14,9],
                  [0,59,14,13], [14,59,7,30], [33,77,8,17], [26,80,7,14], [16,89,10,17],
                  [0,81,14,8], [0,89,18,9], [0,98,16,8],  [48,40,14,26], [62,44,16,8],
                  [62,52,16,10], [78,44,9,18], [87,44,13,18],
                  [48,20,12,10], [60,20,10,10], [70,20,8,18], [78,20,14,10], [78,30,11,8],
                  [62,30,8,8], [48,30,14,8], [85,71,7,13], [48,68,8,18], [56,68,12,18],
                  [68,68,17,12], [68,80,17,6] ],
  'droneMini': [  [35,0,10,53], [30,23,5,21], [24,44,11,16], [2,48,22,10], [24,60,11,11],
                  [10,68,13,14], [10,63,13,5], [4,65,6,10], [4,75,6,10], [10,82,20,5],
                  [24,71,11,11], [30,82,7,25], [13,91,17,9], [4,91,9,12], [31,107,6,21],
                  [37,95,8,52]],
  'droneDouble': [[49,0,15,55], [38,10,11,11], [38,21,11,17], [38,38,11,20], [53,71,8,7],
                  [43,58,10,20], [38,78,15,8], [38,86,11,9], [29,78,9,24], [20,75,9,11],
                  [20,61,9,14], [31,58,12,20], [29,47,9,11], [0,36,34,11], [5,47,15,14],
                  [13,61,7,37], [5,86,8,16], [15,100,14,13], [0,106,15,7], [38,113,11,14],
                  [49,95,9,55], [38,127,11,19], [38,95,5,18] ],
  'ufo': [        [0,0,18,15], [18,4,9,22], [27,8,10,12], [37,8,19,9], [56,12,11,17],
                  [40,29,32,12], [15,37,12,19], [6,37,9,29], [6,26,21,11], [15,56,12,10],
                  [60,66,20,16], [60,41,20,25], [47,51,13,19], [27,29,13,22], [6,66,21,6],
                  [35,82,19,18], [0,100,18,12], [18,100,6,6], [13,92,22,8], [22,82,13,10],
                  [27,62,10,20], [37,62,10,20], [69,66,11,11], [80,47,8,15], [56,82,13,16],
                  [69,82,7,7], [27,51,20,11], [37,17,19,12], [6,72,12,10], [40,41,20,10],
                  [67,17,13,12], [80,47,6,15], [80,31,6,16], [80,62,8,17], [27,20,8,9],
                  [18,72,9,10] ]
};

Scene.explosionFragmentGroup = null;


Scene.explodePlayer = function(player) {
  if( typeof Scene.explosionFragments['playerLevel'+player.level] === 'undefined' ){ return; }

  var fragments = Scene.explosionFragments['playerLevel'+player.level];

  // Explode
  var explosion = Entities.largeExplosions.getFirstDead();
  if( explosion ) {
    var size = Math.random() * 0.3 + 2.0;
    explosion.angle = Math.random() * 90.0;
    explosion.scale.setTo(size, size);
    explosion.reset(player.x, player.y - 20);
    explosion.play('largeExplosion', 40, false, true);

    Scene.explodeSprite(player, fragments, 500);

    if( ! game.sound.noAudio && ! game.paused ) {
      Sounds.bigExplosionSound.play();
    }
  }
};


Scene.explodeEnemy = function(enemy) {
  if( typeof Scene.explosionFragments[enemy.type] === 'undefined' ){ return; }
  if( game.paused ){ return; }
  var fragments = Scene.explosionFragments[enemy.type];


  // Explode
  var explosion = Entities.largeExplosions.getFirstDead();
  if( explosion ) {
    var size = Math.random() * 0.3 + 1.8;
    explosion.angle = Math.random() * 90.0;
    explosion.scale.setTo(size, size);
    explosion.reset(enemy.x, enemy.y - 20);
    explosion.play('largeExplosion', 40, false, true);

    Scene.explodeSprite(enemy, fragments, 300);

    // Enemies have different volumes
    // Todo: It'd be better to use different sounds for each one
    var volume = 0.8;
    if( enemy.type === 'ufo' ) { volume = 2.5; }
    else if( enemy.type === 'droneDouble' ) { volume = 1.5; }

    if( ! game.sound.noAudio && ! game.paused ) {
      Sounds.bigExplosionSound.play('', 0, volume);
    }
  }
};


Scene.explodeSprite = function(sprite, fragments, velocity) {
  // Todo: This is a gigantic memory leak, as all fragments stay in memory. cleanUpStage is a cheap fix
  if( typeof velocity !== "number" ){ velocity = 300; }
  if( ! Globals.explosionsEnabled || game.paused ){ return; }

  if( Scene.explosionFragmentGroup === null ) {
    Scene.explosionFragmentGroup = game.add.group();
    Scene.explosionFragmentGroup.enableBody = true;
    Scene.explosionFragmentGroup.physicsBodyType = Phaser.Physics.NINJA;
  }

  for( var i=0; i<fragments.length; i++ ) {
    var p = game.add.sprite(sprite.x, sprite.y, sprite.generateTexture());
    var rect = new Phaser.Rectangle(fragments[i][0], fragments[i][1], fragments[i][2], fragments[i][3]);
    p.lifespan = 2500 + Math.random() * 500;
    p.alpha = 0.8;
    p.crop( rect, false );
    Scene.explosionFragmentGroup.add(p);

    p.anchor.setTo(0.5,0.5);
    p.rotation = Math.random() * Math.PI * 2;
    var direction = (Math.random() - 0.5) * (180 + 30);
    // The pieces go (mostly) upwards
    p.body.moveTo( Math.random() * velocity + velocity/2, direction + 270 );
  }

};


Scene.cleanUpStage = function() {
  // Some cleaning up
  if( Scene.explosionFragmentGroup === null ){ return; }

  // Todo: This is buggy
  Scene.explosionFragmentGroup.forEachDead(function(f){
    Scene.explosionFragmentGroup.remove(f, true, true);
  });
};

Scene.showGameOver = function() {

  if( UI.stateTextHolder.style.display === 'block' ){ return; }

  var text = Globals.gameOverPhrases[ Math.floor(Math.random()*Globals.gameOverPhrases.length) ];

  UI.stateText.textContent = text;
  UI.stateTextHolder.style.display = 'block';

  // Reduce the volume for the game over screen
  if( ! game.paused ) {
    game.sound.volume = 0.4;
  }
};



Scene.updateScore = function() {
  if( typeof Entities.player === 'undefined' || typeof Entities.player.lifeScore !== 'number' ){
    UI.scoreText.textContent = '0';
    return;
  }

  UI.scoreText.textContent = Entities.player.lifeScore;

  if( Entities.player.level >= 4 ) {
    UI.progressBar.textContent = 'AWESOME!!!11ONE';
    UI.progressBar.style.width = '100%';
  } else {
    UI.progressBar.textContent = 'NEXT LEVEL';
    var nextLevel = Player.playerLevels['level'+(Entities.player.level+1)];
    var thisLevel = Player.playerLevels['level'+(Entities.player.level)];

    UI.progressBar.style.width = ((Entities.player.lifeScore - thisLevel.score) / (nextLevel.score - thisLevel.score) * 100) + '%';
  }

};
