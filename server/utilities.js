var Entities = require('./entities.js');
var _ = require('underscore');

exports.clone = function(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}


exports.distanceTo = function(p1 , p2) {
  return Math.sqrt( Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) );
};

exports.angleTo = function(p1 , p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

exports.degToRad = function(angle) {
  return angle * Math.PI / 180.0;
};

// Normalize a rotation in radians to +-PI
exports.normalizeRotation = function(angleRadians) {
  angleRadians = angleRadians % (2*Math.PI);

  if( angleRadians > Math.PI ) { angleRadians -= 2*Math.PI; }
  if( angleRadians < -Math.PI ) { angleRadians += 2*Math.PI; }

  return angleRadians;
};

exports.getRandomPerimeterPosition = function() {
  var spawnFromTopOrBottom = Math.random() > 0.5;
  var position = {x: 0, y: 0};

  // Spawn from top or bottom
  if( spawnFromTopOrBottom ) {
    position.x = Math.random() * Entities.worldSize.x;
    position.y = Math.random() > 0.5 ? -20 : Entities.worldSize.y + 20;
  }
  // Spawn from sides
  else {
    position.x = Math.random() > 0.5 ? -20 : Entities.worldSize.x + 20;
    position.y = Math.random() * Entities.worldSize.y;
  }

  return position;
}


exports.getRandomHorizontalPosition = function(percent) {
  if( typeof percent === 'undefined' ){ percent = 0.99; }
  return Math.random() * Entities.worldSize.x * percent + Entities.worldSize.x * ((1-percent)/2.0);
};


exports.getRandomAltitudePosition = function(altitude, variation) {
  return altitude + (Math.random()-0.5) * variation;
};


exports.getRandomTopPosition = function() {
  var position = {x: 0, y: 0};

  // Todo: Use a better metric for this, like where the players are
  var percent = 0.5
  position.x = exports.getRandomHorizontalPosition(percent);
  position.y = -20;

  return position;
};


/**
 * Get a position at the top of the screen that's close to most players
 */
exports.getOptimalTopPosition = function() {

  var averageX = Entities.worldSize.x * 0.5;

  if( Object.keys(Entities.players).length > 0 ) {
    var allPlayerX = _.map(Entities.players, function(p){ return p.x; })
    averageX = _.reduce(allPlayerX, function(sum, x){ return sum+x; }, 0) / allPlayerX.length;
  }

  var position = {x: averageX, y: -20};

  return position;
};



exports.getRandomWorldPosition = function(worldSize) {
  var position = {x: 0, y: 0};

  position.x = Math.random() * Entities.worldSize.x * 0.9 + Entities.worldSize.x * 0.05;
  position.y = Math.random() * Entities.worldSize.y * 0.9 + Entities.worldSize.y * 0.05;

  return position;
};
