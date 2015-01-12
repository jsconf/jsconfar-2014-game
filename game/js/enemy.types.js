"use strict";

function findEnemyById(type, id) {
  // Check if the enemy exists first
  var enemy = null;
  if( typeof Entities.enemies[type] !== 'object' ){ return enemy; }

  Entities.enemies[type].forEachAlive(function(e){
    if(e.id === id) {
      enemy = e;
    }
  });
  return enemy;
}

function spawnEnemy(data, deltaTime) {

  var enemy = findEnemyById(data.type, data.id);
  if( enemy !== null ){
    updateEnemyFromServer(enemy, data, deltaTime);
    return;
  }

  if (data.type == 'droneMini') {
    spawnDroneMini(data, deltaTime);
  }

  if (data.type == 'droneDouble') {
    spawnDroneDouble(data, deltaTime);
  }

  if (data.type == 'ufo') {
    spawnUfo(data, deltaTime);
  }
}

function spawnDroneMini(data, deltaTime) {

  var enemy = Entities.enemies.droneMini.getFirstDead();
  if( enemy === null ) { return; }

  enemy.reset(data.x, data.y);
  enemy.scale.setTo(Globals.enemyType.droneMini.scale, Globals.enemyType.droneMini.scale);
  enemy.anchor.setTo(0.5, 0.5);
  enemy.body.setSize(enemy.height, enemy.width, 0, 0);
  enemy.totalHealth = Globals.enemyType.droneMini.health;
  enemy.rotation = - Math.PI / 2;

  enemy.play('droneMini', 30, true, true);

  updateEnemyFromServer(enemy, data, deltaTime);
}

function spawnDroneDouble(data, deltaTime) {

  var enemy = Entities.enemies.droneDouble.getFirstDead();
  if( enemy === null ) { return; }

  enemy.reset(data.x, data.y);
  enemy.scale.setTo(Globals.enemyType.droneDouble.scale, Globals.enemyType.droneDouble.scale);
  enemy.anchor.setTo(0.5, 0.5);
  enemy.body.setSize(enemy.height, enemy.width, 0, 0);
  enemy.totalHealth = Globals.enemyType.droneDouble.health;
  enemy.rotation = - Math.PI / 2;

  enemy.play('droneDouble', 30, true, true);

  updateEnemyFromServer(enemy, data, deltaTime);
}

function spawnUfo(data, deltaTime) {

  var enemy = Entities.enemies.ufo.getFirstDead();
  if( enemy === null ) { return; }

  enemy.reset(data.x, data.y);
  enemy.scale.setTo(Globals.enemyType.ufo.scale, Globals.enemyType.ufo.scale);
  enemy.anchor.setTo(0.5, 0.5);
  enemy.body.setSize(enemy.height, enemy.width, 0, 0);
  enemy.totalHealth = Globals.enemyType.ufo.health;
  enemy.rotation = - Math.PI / 2;

  enemy.play('ufo', 20, true, true);

  updateEnemyFromServer(enemy, data, deltaTime);
}
