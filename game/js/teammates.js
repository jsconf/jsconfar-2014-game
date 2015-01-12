"use strict";

Teammates.teammateSetup = function(data, deltaTime) {

  // Don't create the user if the ID is the local player
  if( data.id == Globals.publicId ){
    if( typeof Entities.teammates[data.id] === 'object' ){
      Entities.teammates[data.id].kill();
      delete Entities.teammates[data.id];
    }

    // But update the local player
    Entities.player.score = data.score;
    Entities.player.lifeScore = data.lifeScore;
    Entities.player.health = data.health;
    Entities.player.alive = data.alive;

    Player.levelUp(data.level);
    return;
  }

  // Teammates
  if( typeof Entities.teammates[data.id] === 'undefined' ) {
    // Create the teammate if he's not defined
    Entities.teammates[data.id] = game.add.sprite(data.x, data.y, 'playerLevel1');
    game.physics.enable(Entities.teammates[data.id], Phaser.Physics.ARCADE);
    Entities.teammates[data.id].anchor.setTo(0.5, 0.5);

    Entities.teammates[data.id].id = data.id;
    Entities.teammates[data.id].rotation = -Math.PI / 2;
    Entities.teammates[data.id].alpha = 0.5;
    Entities.teammates[data.id].level = 1;
    Entities.teammates[data.id].alive = false;
    Entities.teammates[data.id].body.setSize(data.w, data.h);
    Entities.teammates[data.id].body.collideWorldBounds = false;
  }

  if( typeof Entities.teammateLabels[data.id] === 'undefined' ) {
    Entities.teammateLabels[data.id] = game.add.text(Entities.teammates[data.id].x, Entities.teammates[data.id].y, '', { font: '12px InputMono', fill: '#fff', align: 'center' });
    Entities.teammateLabels[data.id].shadowColor = "#000000";
    Entities.teammateLabels[data.id].shadowBlur = 2;
    Entities.teammateLabels[data.id].shadowOffsetY = 1;
    Entities.teammateLabels[data.id].anchor.setTo(0.5, 0.5);
    Entities.teammateLabels[data.id].setText(data.name);
  }

  Entities.teammates[data.id].w = data.w;
  Entities.teammates[data.id].h = data.h;
  Entities.teammates[data.id].body.setSize(data.w, data.h);

  Entities.teammates[data.id].health = data.health;
  Entities.teammates[data.id].score = data.score;
  Entities.teammates[data.id].lifeScore = data.lifeScore;

  if( typeof Entities.teammates[data.id].level !== 'number' || Entities.teammates[data.id].level != data.level ) {
    Entities.teammates[data.id].level = data.level;
    Teammates.updateSprite(Entities.teammates[data.id]);
  }

  // Update the speed and position
  //Entities.teammates[data.id].x = data.x;
  //Entities.teammates[data.id].y = data.y;
  Entities.teammates[data.id].x = data.x + (deltaTime * data.vx / 1000);
  Entities.teammates[data.id].y = data.y + (deltaTime * data.vy / 1000);
  Entities.teammates[data.id].vx = data.vx;
  Entities.teammates[data.id].vy = data.vy;

  if( (Entities.teammates[data.id].x - Entities.teammates[data.id].w/2) <= 0 ) {
    Entities.teammates[data.id].x = Entities.teammates[data.id].w/2;
    Entities.teammates[data.id].vx = 0;
  }
  if( (Entities.teammates[data.id].x + Entities.teammates[data.id].w/2) >= Globals.worldSize.x ) {
    Entities.teammates[data.id].x = Globals.worldSize.x - Entities.teammates[data.id].w/2;
    Entities.teammates[data.id].vx = 0;
  }

  Entities.teammates[data.id].movedAt = new Date()*1;

  if( typeof Entities.teammates[data.id].alive === 'undefined' ) {
    Entities.teammates[data.id].alive = data.alive;
  }

  if( data.alive ) {
    if( ! Entities.teammates[data.id].alive ) {
      Entities.teammates[data.id].revive();
    }
  } else if( ! data.alive ) {
    if( Entities.teammates[data.id].alive ) {
      Scene.explodePlayer(Entities.teammates[data.id]);
    }

    Entities.teammates[data.id].kill();
  }
};


Teammates.updateSprite = function(teammate) {
  if( typeof teammate.level === 'undefined' ) { teammate.level = 1; }
  teammate.loadTexture('playerLevel'+ teammate.level);
  teammate.body.setSize(Player.playerSizes['level'+teammate.level].w, Player.playerSizes['level'+teammate.level].h, 0, 0);
};


Teammates.remove = function(data, deltaTime) {
  if( typeof Entities.teammates[data.id] !== 'undefined' ) {
    Entities.teammates[data.id].kill();
    Entities.teammates[data.id].destroy();
    delete Entities.teammates[data.id];
  }

  if( typeof Entities.teammateLabels[data.id] !== 'undefined' ) {
    Entities.teammateLabels[data.id].destroy();
    delete Entities.teammateLabels[data.id];
  }
};


// Todo: Use groups instead of this crap
Teammates.updateLabels = function() {
  for( var id in Entities.teammates ) {
    Teammates.updateSingleLabel(Entities.teammates[id]);
  }
};


Teammates.updateSingleLabel = function(teammate) {
  Entities.teammateLabels[teammate.id].visible = teammate.alive;

  Entities.teammateLabels[teammate.id].x = teammate.x;
  Entities.teammateLabels[teammate.id].y = teammate.y+30;
};

Teammates.shootBullet = function(data, deltaTime) {
  //  Grab the first bullet we can from the pool
  var time = new Date()*1;

  Entities.bullets.cycle = Entities.bullets.cycle >= Entities.bullets.maxCycle ? 0 : Entities.bullets.cycle+1;
  var bullet = Entities.bullets.getChildAt(Entities.bullets.cycle);

  if (bullet) {
    bullet.reset(data.x, data.y);
    bullet.x = data.x + (deltaTime * data.vx / 1000);
    bullet.y = data.y + (deltaTime * data.vy / 1000);
    bullet.sx = data.x;
    bullet.sy = data.y;
    bullet.st = time - deltaTime;
    bullet.rotation = data.r;
    bullet.vx = data.vx;
    bullet.vy = data.vy;
  }

};



Teammates.moveTeammates = function(deltaTime) {
  var now = new Date()*1;

  for( var i in Entities.teammates ) {
    if( ! Entities.teammates.hasOwnProperty(i) ){ return; }

    // Teammates sync @ around 20fps (50ms), but latency can be 200ms or more.
    // This means we need to cap the simulation interval, or else we are going to simulate 150ms extra (usually incorrectly)
    var simulationDeltaTime = Math.min(deltaTime, Globals.maxTeammateSimulation);

    // This is to prevent redundant updates
    if( typeof Entities.teammates[i].movedAt !== 'undefined' ) {
      if( (now - Entities.teammates[i].movedAt) < simulationDeltaTime ) {
        simulationDeltaTime = deltaTime;
      }
    }

    Entities.teammates[i].x += Entities.teammates[i].vx * simulationDeltaTime / 1000.0;
    Entities.teammates[i].y += Entities.teammates[i].vy * simulationDeltaTime / 1000.0;

    if( (Entities.teammates[i].x - Entities.teammates[i].w/2) <= 0 ) {
      Entities.teammates[i].x = Entities.teammates[i].w/2;
      Entities.teammates[i].vx = 0;
    }
    if( (Entities.teammates[i].x + Entities.teammates[i].w/2) >= Globals.worldSize.x ) {
      Entities.teammates[i].x = Globals.worldSize.x - Entities.teammates[i].w/2;
      Entities.teammates[i].vx = 0;
    }

    Teammates.updateSingleLabel(Entities.teammates[i]);
  }

}