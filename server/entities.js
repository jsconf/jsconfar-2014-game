"use strict";

exports.worldSize = {x: 1920, y: 560};
exports.playerHealth = 1;
exports.nextPlayerId = 1;

exports.enemies = {};


exports.players = {};
exports.playerSize = {
  'level1': {w: 26, h: 90},
  'level2': {w: 68, h: 65},
  'level3': {w: 106, h: 65},
  'level4': {w: 106, h: 80}
};

exports.bullets = [];
exports.bulletSize = {w: 12, h: 29};

exports.enemyBullets = [];
exports.enemyBulletSize = {w: 17, h: 40};


exports.enemyTypes = require('./enemies.types.js').enemyType;

for( var type in exports.enemyTypes ) {
  exports.enemies[type] = {};
}
