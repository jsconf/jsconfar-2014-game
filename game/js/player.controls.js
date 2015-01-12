"use strict";

Player.playerSetup = function() {

  if( typeof Entities.player === 'object' && Entities.player !== null ){ return; }

  // The player
  Entities.player = game.add.sprite(game.world.bounds.width / 2, game.world.bounds.height-45, 'playerLevel1');

  game.physics.enable(Entities.player, Phaser.Physics.ARCADE);
  Entities.player.anchor.setTo(0.5, 0.5);
  Entities.player.angle = -90.0;
  Entities.player.body.setSize(Entities.player.height, Entities.player.width, 0, 0);
  Entities.player.x = game.world.bounds.width / 2;
  Entities.player.y = Math.floor(game.world.bounds.height - Entities.player.body.height / 2);

  Entities.player.level = 1;
  Player.updateSprite();

  // The camera follows the player
  game.camera.follow(Entities.player, Phaser.Camera.FOLLOW_LOCKON  );
}


Player.handleMovement = function() {

  if( typeof Entities.player !== 'object' ){ return; }
  if( ! Entities.player.alive ){ return; }

  Entities.player.body.collideWorldBounds = true;

  //  Reset the player, then check for movement keys
  var lastVelocity = {x: Entities.player.body.velocity.x, y: Entities.player.body.velocity.y};
  Entities.player.body.velocity.setTo(0, 0);

  if( Controls.cursors.left.isDown || Controls.altCursors.left.isDown ) {
    Entities.player.body.velocity.x += -Globals.speeds.ship;
  }
  if( Controls.cursors.right.isDown || Controls.altCursors.right.isDown ) {
    Entities.player.body.velocity.x += Globals.speeds.ship;
  }

  if( lastVelocity.x != Entities.player.body.velocity.x ) {
    // Notify the server that we moved
    Connection.emit('move', {
      x: Entities.player.x,
      y: Entities.player.y,
      vx: Entities.player.body.velocity.x,
      vy: Entities.player.body.velocity.y,
      at: Utils.getServerTime()
    });
  }

}

Player.handleShooting = function() {

  if( typeof Entities.player !== 'object' ){ return; }

  //  Firing
  if( Controls.fireButton.isDown ) {
    Player.fireBullet();
  }

  if( Controls.fireButton.justPressed() && !Entities.player.alive && Entities.player.killedAt <= (new Date()*1 - 250) ) {
    GameCycle.restart();
  }

}


Player.fireBullet = function() {

  if( typeof Entities.player !== 'object' ){ return; }
  if( ! Entities.player.alive ){ return; }
  if( typeof Entities.player.level === 'undefined' ) {
    Entities.player.level = 1;
    Player.updateSprite();
  }

  //  To avoid them being allowed to fire too fast we set a time limit
  var time = new Date()*1;
  if(time < bulletTime){ return; }
  bulletTime = time + Globals.speeds.firingTime;

  var angle = - Math.PI / 2;

  var bulletsForLevel = Globals.bulletLevels['Level'+Entities.player.level];

  var bulletUpdateList = [];

  for( var i = 0; i < bulletsForLevel.length; i++ ) {
    //  Grab the first bullet we can from the pool
    Entities.ownBullets.cycle = Entities.ownBullets.cycle >= Entities.ownBullets.maxCycle ? 0 : Entities.ownBullets.cycle+1;
    var bullet = Entities.ownBullets.getChildAt(Entities.ownBullets.cycle);

    if (bullet) {
      //  And fire it
      bullet.reset(Entities.player.x + bulletsForLevel[i].x, Entities.player.y + bulletsForLevel[i].y);
      bullet.alive = true;
      bullet.visible = true;

      bullet.rotation = angle;

      bullet.x = Entities.player.x + bulletsForLevel[i].x;
      bullet.y = Entities.player.y + bulletsForLevel[i].y;
      bullet.sx = bullet.x;
      bullet.sy = bullet.y;
      bullet.st = time;

      bullet.vx = Math.cos(bullet.rotation) * Globals.speeds.bullets;
      bullet.vy = Math.sin(bullet.rotation) * Globals.speeds.bullets;

      bulletUpdateList.push({
        x: bullet.x,
        y: bullet.y,
        sx: bullet.sx,
        sy: bullet.sy,
        vx: bullet.vx,
        vy: bullet.vy,
        st: time,
        r: bullet.rotation
      });
    }
  }

  Connection.emit('fire', {
    bullets: bulletUpdateList,
    at: Utils.getServerTime()
  });

  if( ! game.sound.noAudio && ! game.paused ) {
    Sounds.shootSound.play();
  }

  // Explode
  /*
  for( var ix=0; ix < bulletUpdateList.length; ix++ ) {
    var explosion = shootExplosions.getFirstDead();
    if( explosion ) {
      var size = 0.5;
      //explosion.angle = Math.random() * 90.0;
      explosion.scale.setTo(size, size);
      explosion.reset(bulletUpdateList[ix].x, bulletUpdateList[ix].y);
      explosion.play('shootExplosion', 120, false, true);
    }
  }
  */
};
