"use strict";

var Entities = require('./entities.js');

exports.updatePlayerLevels = function(onLevelUp) {

  for( var i in Entities.players ) {
    exports.handleLevelUp(Entities.players[i], onLevelUp);
  }

};

// The levels are in reverse order to prevent possible double-levelups
exports.playerLevels = [
  {level:4, score:300000},
  {level:3, score:100000},
  {level:2, score:30000},
  {level:1, score:0}
];


exports.handleLevelUp = function(player, onLevelUp) {

  for( var i in exports.playerLevels ){
    if( exports.playerLevels[i].score <= player.lifeScore ) {
      if( exports.playerLevels[i].level > player.level ) {
        player.level = exports.playerLevels[i].level;

        var size = Entities.playerSize['level'+player.level];
        player.w = size.w;
        player.h = size.h;

        onLevelUp(player);
        break;
      }
    }
  }

};


exports.handleDamage = function(player, damage) {

  player.health -= damage;
  if( player.health <= 0 ){
    player.health = 0;
    player.alive = false;
    player.vx = 0;
    player.vy = 0;
  }
  
};