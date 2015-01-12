"use strict";

var Entities = require('./entities.js');


exports.getClosestTo = function(enemy, entities) {
  var target = null;
  var closestDistance = null;

  for( var ix in entities ) {
    if( typeof entities[ix].alive !== 'undefined' && entities[ix].alive === false ){ continue; }

    var distance = Utils.distanceTo( enemy, entities[ix] );
    if( closestDistance === null || distance < closestDistance ) {
      closestDistance = distance;
      target = entities[ix];
    }
  }

  return target;
};


exports.getRandomEntity = function(entities) {
  var aliveKeys = [];
  var target = null;

  for( var ix in entities ) {
    if( typeof entities[ix].alive !== 'undefined' && entities[ix].alive === false ){ continue; }
    aliveKeys.push( ix );
  }

  if( aliveKeys.length > 0 ) {
    var targetKey = aliveKeys[Math.floor(Math.random() * aliveKeys.length)];
    target = Entities.players[targetKey];
  }

  return target;
};


exports.findBestPlayerTarget = function(enemy, offset) {

  if( typeof offset !== 'object' ){ offset = {x:0, y:0}; }

  var target = null;
  var bestScore = null;

  // Find the best target among living players
  // Todo: Use score or something else to get a nicer behavior
  target = exports.getRandomEntity(Entities.players);

  if( target !== null ) {
    return { 'type': 'player', 'entity': target, 'offset': offset };
  } else {
    return { 'type': null, 'entity': null, 'offset': null };
  }
};


exports.randomCruisingAltitudeTarget = function(enemy) {

  Entities.enemyTypes[enemy.type].cruisingAltitude


};
