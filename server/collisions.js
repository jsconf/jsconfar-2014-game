"use strict";

var Entities = require('./entities.js');
var Enemies = require('./enemies.js');
var Players = require('./players.js');


exports.calculateCollisions = function(onPlayerHit, onEnemyHit) {

  for( var a in Entities.players ) {

    if( Entities.players[a].alive === false ){ continue; }

    // Detect collisions between players and enemies
    for( var type in Entities.enemies ) {
      for( var b in Entities.enemies[type] ) {
        if( detectCollision(Entities.players[a], Entities.enemies[type][b]) ) {
          handlePlayerEnemyCollision(Entities.players[a], Entities.enemies[type][b], onPlayerHit, onEnemyHit);
        }
      }
    }

    // Detect collisions between players and enemy bullets
    for( var b in Entities.enemyBullets ) {
      if( detectCollision(Entities.players[a], Entities.enemyBullets[b]) ) {
        handlePlayerBulletCollision(Entities.players[a], Entities.enemyBullets[b], onPlayerHit);
        // Remove the bullet
        Entities.enemyBullets.splice(b, 1);
      }
    }

  }


  // Detect collisions between enemies and bullets
  for( var type in Entities.enemies ) {
    for( var a in Entities.enemies[type] ) {

      for (var b in Entities.bullets) {
        if( detectCollision(Entities.enemies[type][a], Entities.bullets[b]) ) {
          handleEnemyBulletCollision(Entities.enemies[type][a], Entities.bullets[b], onEnemyHit);
          // Remove the bullet
          Entities.bullets.splice(b, 1);
        }
      }

    }
  }

};


var detectCollision = function(a, b) {
  if( typeof a === 'undefined' || typeof b === 'undefined' ){ return false; }

  var r1x1 = a.x - a.w/2;
  var r1x2 = a.x + a.w/2;
  var r1y1 = a.y - a.h/2;
  var r1y2 = a.y + a.h/2;
  var r2x1 = b.x - b.w/2;
  var r2x2 = b.x + b.w/2;
  var r2y1 = b.y - b.h/2;
  var r2y2 = b.y + b.h/2;

  return ((r1x1 < r2x2) && (r1x2 > r2x1) &&  (r1y1 < r2y2) && (r1y2 > r2y1));
};


var handleEnemyBulletCollision = function(enemy, bullet, onEnemyHit) {
  Enemies.handleDamage(enemy, bullet.d);

  onEnemyHit(enemy, bullet);

  if( ! enemy.alive ) {
    delete Entities.enemies[enemy.type][enemy.id];
  }
};


var handlePlayerBulletCollision = function(player, bullet, onPlayerHit) {
  Players.handleDamage(player, bullet.d);

  onPlayerHit(player, bullet);
};


var handlePlayerEnemyCollision = function(player, enemy, onPlayerHit, onEnemyHit) {
  // Kill both the enemy and the player
  Enemies.handleDamage(enemy, enemy.health);
  Players.handleDamage(player, player.health);

  onPlayerHit(player, enemy);
  onEnemyHit(enemy, player);

  if( ! enemy.alive ) {
    delete Entities.enemies[enemy.type][enemy.id];
  }
};
