"use strict";

Player.handlePlayerDamage = function(damage) {

  if( typeof Entities.player !== 'object' ){ return; }
  if( Entities.player.alive === false ){ return; }

  Entities.player.health -= damage;

  if( Entities.player.health <= 0 ) {
    
    Scene.showGameOver();

    Scene.explodePlayer(Entities.player);

    Entities.player.kill();
    Entities.player.killedAt = new Date()*1;

    Callbacks.onPlayerDead(Entities.player);

  }
  else {

  }

}
