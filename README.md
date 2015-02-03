# Attack of the Drones
### Embedded game for the JSConf Argentina 2014 Website

![Attack of the Drones](https://github.com/jsconf/jsconfar-2014-game/blob/master/assets/screenshot.png)


## Behind the scenes

Attack of the Drones (codenamed "Invaders Mini") is the final concept in a set of gameplay experiments for the [JSConf 2014 Site](https://www.jsconfar.com/), and it's basically a top-down invaders game with a multiplayer twist and neat graphics. We tried multiple game mechanics until we arrived at this game, which was both innovative and fun enough to keep people engaged for a few minutes and demonstrate the capabilities of a modern Javascript stack.

However, as you might expect, this being our first game, coupled with a bunch of discarded concepts and a short deadline resulted in code that's held together with metaphorical duct tape, since it's basically a blend of the 3 concepts we built before we ended up with something we liked. While this shouldn't be considered a source of good game development techniques, here's a quick rundown on how the game works:


### The Server

The game runs server-side at 60fps, including simulations the placement of ships, enemies and bullets on each tick. This is our source of truth for the state of each element. Most people have about 200-250ms of latency, and one of our objectives was to make the game work within those constraints, which resulted in the slow-moving ships.

To save on bandwidth, the server sends sync packets at 5fps with the positions of the player and ships, including some badly written latency prediction. Shots are not fully synced, as they have very short lifetimes and they require quite a lot of bandwidth to keep updated. The server also handles the ships' behavior (with a very simple targeting system).


### The Client

The game is written on top of Phaser.JS, where we simply control the player and send movement/shooting commands back to the server and simulate the position of the enemies between every sync packet. Most of the code here has more to do with animation and sound effects than actual gameplay, though some utility functions are copied straight from the server. There are some significant memory issues, one of which has to do with the "particle" system, which will crash your browser if you leave it on for quite a while.

*Fun fact*: The Ufo was originally meant to attack the player (which you can see in the game's cartridge). However, we ended up leaving that part out, since the UFO is annoying enough as it is and was repurposed as a kind of bonus if you shoot it 100 times.


## How to run the game

```npm install```

```gulp build```

The server will run on port 4000 by default, though that can be edited in invaders.js .
