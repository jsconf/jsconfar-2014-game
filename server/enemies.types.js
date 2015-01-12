var utils = require('./utilities.js');
var enemyType = {};

exports.enemyType = enemyType;

enemyType['droneMini'] = {
  'sprite': 'droneMini',
  // 150x45
  'width': 150,
  'height': 42,
  'scale': 1.0,
  'chases': false,
  'fires': true,
  'aims': false,

  'baseCountPerPlayer': 4,
  'maxCountPerPlayer': 60,
  'maxCount': 60,
  'nextId': 1,

  'numBullets': 1,
  'bulletOffset': 0,
  'bulletSpeed': 200,
  'firingInterval': 3500,

  'value': 1000,
  'health': 5,
  'speed': 30,
  'initialSpeedX': 0,
  'speedXVariation': 20,
  'initialSpeedY': 25,
  'speedYVariation': 10,

  'tiltSpeed': utils.degToRad(3.0),
  'maxTilt': utils.degToRad(5.0),

  'cruisingAltitude': 250,
  'cruisingAltitudeVariation': 200,
  'turnSpeed': utils.degToRad(60),

  'spawnInterval': 3000,
  'nextSpawnTime': 0
};


enemyType['droneDouble'] = {
  'sprite': 'droneDouble',
  // 150x64
  'width': 150,
  'height': 60,
  'scale': 1.0,
  'chases': false,
  'fires': true,
  'aims': false,

  'baseCountPerPlayer': 2,
  'maxCountPerPlayer': 40,
  'maxCount': 40,
  'nextId': 1,

  'numBullets': 2,
  'bulletOffset': 40,
  'bulletSpeed': 200,
  'firingInterval': 3000,

  'value': 6000,
  'health': 15,
  'speed': 60,
  'initialSpeedX': 0,
  'speedXVariation': 50,
  'initialSpeedY': 20,
  'speedYVariation': 5,

  'tiltSpeed': utils.degToRad(3.0),
  'maxTilt': utils.degToRad(3.5),

  'cruisingAltitude': 150,
  'cruisingAltitudeVariation': 50,
  'turnSpeed': utils.degToRad(60),

  'spawnInterval': 6500,
  'nextSpawnTime': 0
};

enemyType['ufo'] = {
  'sprite': 'ufo',
  'width': 111,
  'height': 86,
  'scale': 1.0,
  'chases': false,
  'fires': false,
  'aims': false,

  'baseCountPerPlayer': 1,
  'maxCountPerPlayer': 1,
  'maxCount': 5,
  'nextId': 1,

  'numBullets': 0,
  'bulletOffset': 40,
  'bulletSpeed': 200,
  'firingInterval': 3000,

  'value': 50000,
  'health': 100,
  'speed': 20,
  'initialSpeedX': 0,
  'speedXVariation': 0,
  'initialSpeedY': 10,
  'speedYVariation': 0,

  'tiltSpeed': utils.degToRad(0.0),
  'maxTilt': utils.degToRad(0),

  'cruisingAltitude': 150,
  'cruisingAltitudeVariation': 50,

  'spawnInterval': 30000,
  'nextSpawnTime': 0
};
