"use strict";

/**
 * Setup all enemy elements based on the Enemy Types from the server
 * @param enemyTypes
 */
Enemies.enemySetup = function(enemyTypes) {

  Globals.enemyType = enemyTypes;
  if( typeof Entities.enemies !== 'object' ) {
    Entities.enemies = {};
  }

  for( var type in enemyTypes ) {

    // Destroy all enemies
    if( typeof Entities.enemies[type] === 'object' ) {
      Entities.enemies[type].removeAll();
      Entities.enemies[type].destroy();
    }

    Entities.enemies[type] = game.add.group();
    Entities.enemies[type].enableBody = true;
    Entities.enemies[type].physicsBodyType = Phaser.Physics.ARCADE;
    Entities.enemies[type].createMultiple(Globals.enemyType[type].maxCount * 1.2, Globals.enemyType[type].sprite);
    Entities.enemies[type].setAll('anchor.x', 0.5);
    Entities.enemies[type].setAll('anchor.y', 0.5);

    if( type === 'droneMini' ) {
      Entities.enemies[type].callAll('animations.add', 'animations', 'droneMini');
    }
    if( type === 'droneDouble' ) {
      Entities.enemies[type].callAll('animations.add', 'animations', 'droneDouble');
    }
    if( type === 'ufo' ) {
      Entities.enemies[type].callAll('animations.add', 'animations', 'ufo');
    }
  }

  // Bring sprites to the top
  game.world.bringToTop(Entities.smallExplosions);
  game.world.bringToTop(Entities.largeExplosions);

}


function getTarget(targetData) {

  var target = null;
  if( typeof targetData === 'undefined' || targetData === null ){ return target; }

  if( targetData.type === 'player' ) {
    target = getPlayerById(targetData.id);
  } else {
    target = getEnemyById(targetData.type, targetData.id);
  }

  return target;
}


function getPlayerById(id) {
  if( id == Globals.publicId ) {
    return Entities.player;
  }
  else if( typeof Entities.teammates[id] === 'object' ) {
    return Entities.teammates[id];
  }

  return null;
}

function getEnemyById(type, id) {
  var found = null;
  if( typeof Entities.enemies[type] === 'undefined' ){ return null }
  Entities.enemies[type].forEach(function(enemy){
    if( enemy.id == id ){ found = enemy; }
  });

  return found;
}


function updateEnemyFromServer(enemy, data, deltaTime) {

  var thisUpdateAt = (new Date()*1) - deltaTime;

  // Only update if the data is more recent
  if( typeof enemy.updatedAt === 'number' && enemy.updatedAt > thisUpdateAt ) {
    return;
  }

  enemy.alive = true;
  enemy.x = data.x + (deltaTime * data.vx / 1000);
  enemy.y = data.y + (deltaTime * data.vy / 1000);
  //enemy.rotation = data.r; // This ruins the rotation animation and is pretty much useless
  enemy.vx = data.vx;
  enemy.vy = data.vy;

  enemy.type = data.type;
  enemy.id = data.id;
  enemy.health = data.health;
  enemy.value = data.value;

  if( data.target !== null && typeof data.target !== 'undefined' && typeof data.target.type !== 'undefined' && data.target.type === 'player' ) {
    // Find the actual teammate / player and use a pointer to that object
    enemy.target = data.target;
    enemy.target.entity = getPlayerById(data.target.entity.id);
  }
  else {
    enemy.target = data.target;
  }

  enemy.updatedAt = thisUpdateAt;
}


function enemyGotShot(bullet, enemy) {

  if( ! enemy.alive ){ return; }

  /*
  if( typeof bullet.damage !== 'number' ){ bullet.damage = 1; }

  enemy.health -= bullet.damage;
  */

  /*
  // Every hit nets the player a percentage of the value of the enemy
  playerScore += Math.min(enemy.value, enemy.value * bullet.damage / enemy.totalHealth);

  // Todo: Clean this up. The network code should be better
  if( enemy.health <= 0 ) {
    playerScore += enemy.value;
    //enemy.kill();
  }
  */

  var explosion = Entities.smallExplosions.getFirstDead();
  if( explosion ) {
    var size = (Math.random()-0.5)*0.5 + 1.0;
    explosion.angle = Math.random() * 360.0;
    explosion.scale.setTo(size, size);
    explosion.reset(bullet.x, bullet.y - bullet.body.height/2);
    explosion.play('smallExplosion', 30, false, true);
  }

  //  When a bullet hits an enemy we kill the bullet
  bullet.kill();
}


function enemyKill(enemy, deltaTime) {

  if( deltaTime <= 500 ) {
    Scene.explodeEnemy(enemy);
  }

  enemy.health = 0;
  enemy.kill();

  Callbacks.onEnemyDead(enemy);
}



function shootEnemyBomb(data, deltaTime) {
  //  Grab the first bullet we can from the pool
  Entities.bombs.cycle = Entities.bombs.cycle >= Entities.bombs.maxCycle ? 0 : Entities.bombs.cycle+1;
  var bomb = Entities.bombs.getChildAt( Entities.bombs.cycle );

  if (bomb) {
    bomb.reset(data.x, data.y);
    bomb.st = Utils.getLocalTime(data.st) - deltaTime;
    bomb.sx = data.sx;
    bomb.sy = data.sy;
    bomb.g = data.g;
    bomb.vx = data.vx;
    bomb.vy = data.vy;
    bomb.x = data.x;
    bomb.y = data.y;
    bomb.rotation = data.r;
  }

}


function moveBombs(deltaTime) {

  var now = new Date()*1;

  Entities.bombs.forEachAlive(function(bomb){
    var time = (now - bomb.st) / 1000.0;
    bomb.x = bomb.sx + bomb.vx * time; // x distance is linear
    bomb.y = bomb.sy + 0.5 * bomb.g * (time * time); // y distance is gravity-based (startY + 0.5*gravity*time^2)


    // Bomb hits the floor
    if( bomb.y >= game.world.height || isNaN(bomb.y) ) {

      // Only show explosions if the bomb is close to the floor (in case a bunch of frames got skipped)
      if( bomb.y <= game.world.height + 30 ) {

        var explosion = Entities.largeExplosions.getFirstDead();
        if( explosion ) {
          var size = Math.random() * 0.3 + 1.5;
          explosion.angle = 180.0 + (Math.random()-0.5) * 90.0;
          explosion.scale.setTo(size, size);
          explosion.reset(bomb.x, game.world.height - Math.random()*10);

          explosion.play('largeExplosion', 40, false, true);
        }

        if( ! game.sound.noAudio && ! game.paused ) {
          Sounds.explosionSound.play();
        }
      }

      bomb.kill();
    }
  });

}

function moveBullets(deltaTime) {

  var now = new Date()*1;

  Entities.ownBullets.forEachAlive(function(bullet){
    updateBullets(bullet, now);
  });

  Entities.bullets.forEachAlive(function(bullet){
    updateBullets(bullet, now);
  });

}

var updateBullets = function(bullet, now){
  bullet.x = bullet.sx + bullet.vx * (now - bullet.st) / 1000.0; // x distance is linear
  bullet.y = bullet.sy + bullet.vy * (now - bullet.st) / 1000.0; // y distance is linear

  // Out of bounds
  if( (bullet.y >= game.world.height + 30) || (bullet.y <= -30) || isNaN(bullet.y) ) {
    bullet.kill();
  }
};


function moveEnemies(deltaTime) {

  var targetRotation = - Math.PI;
  var maxRotation = 0.0;
  var rotate = 0.0;

  for( var type in Globals.enemyType ) {

    if( Entities.enemies[type] === null || typeof Entities.enemies[type] !== 'object' ){ continue; }

    Entities.enemies[type].forEachAlive(function(enemy){
      aimTowardsTarget(enemy);

      // If the enemy is going to reach the target in this frame, make it jump straight to the target
      if( hasValidTarget(enemy) && distanceToTarget(enemy) <= Globals.enemyType[enemy.type].speed * deltaTime / 1000.0 ){
        jumpToTarget(enemy);
      } else {
        enemy.x += enemy.vx * deltaTime / 1000.0;
        enemy.y += enemy.vy * deltaTime / 1000.0;
      }

      // Enemies tilt a tiny bit towards the direction of movement
      targetRotation = - Math.PI / 2 + ((enemy.vx > 0) ? 1 : -1) * Globals.enemyType[enemy.type].maxTilt;
      maxRotation = Globals.enemyType[enemy.type].tiltSpeed * deltaTime / 1000;
      rotate = targetRotation - enemy.rotation;
      rotate = (rotate > 0.0) ? Math.min(rotate, maxRotation) : -Math.min(-rotate, maxRotation);

      enemy.rotation += rotate;

    });

  }

}


function getTargetPosition(target) {
  return {
    x: target.entity.x + (( target.offset !== null ) ? target.offset.x : 0),
    y: target.entity.y + (( target.offset !== null ) ? target.offset.y : 0)
  };
}


function jumpToTarget(enemy) {
  if( ! hasValidTarget(enemy) ){ return; }

  var position = getTargetPosition(enemy.target);
  enemy.x = position.x;
  enemy.y = position.y;
  enemy.vx = 0.0;
  enemy.vy = 0.0;
}


function hasValidTarget(enemy) {
  if( enemy.target === null || typeof enemy.target === 'undefined' || typeof enemy.target.type === 'undefined' || typeof enemy.target.entity === 'undefined' ) {
    return false;
  }

  if( enemy.target.type === 'player' ) {
    if( typeof enemy.target.entity !== 'undefined' && enemy.target.entity !== null ) {
      return ((typeof enemy.target.entity.alive !== 'undefined') && enemy.target.entity.alive);
    } else {
      return false;
    }
  }
  // If the target is a point, make sure it hasn't reached it yet
  if( enemy.target.type === 'point' ) {
    return (distanceTo(enemy, enemy.target.entity) > 1.0);
  }
}


function distanceTo(p1 , p2) {
  return Math.sqrt( Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) );
}


function distanceToTarget(enemy) {
  if( ! hasValidTarget(enemy) ) { return null; }

  var target = getTargetPosition(enemy.target)

  return distanceTo(enemy, target);
}


function aimTowardsTarget(enemy) {
  if( ! hasValidTarget(enemy) ) { return; }

  var target = getTargetPosition(enemy.target);

  var angleTo = function(p1 , p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  };

  var angleToTarget = angleTo(enemy, target);
  enemy.vx = Math.cos(angleToTarget) * Globals.enemyType[enemy.type].speed;
  enemy.vy = Math.sin(angleToTarget) * Globals.enemyType[enemy.type].speed;

};
