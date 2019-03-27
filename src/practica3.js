//Código de la práctica 3

var game = function() {
// Set up an instance of the Quintus engine and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus({development: true})
.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI,Audio,TMX")
// Maximize this game to whatever the size of the browser is
.setup({ //maximize: true
	width: 800, // Set the default width to 800 pixels
	height: 600, // Set the default height to 600 pixels
	upsampleWidth: 420, // Double the pixel density of the
	upsampleHeight: 320, // game if the w or h is 420x320
	// or smaller (useful for retina phones)
	downsampleWidth: 1024, // Halve the pixel density if resolution
	downsampleHeight: 768 // is larger than or equal to 1024x768
})
// And turn on default input controls and touch input (for UI)
.controls().touch().enableSound();

	Q.loadTMX("level.tmx", function() {
			Q.stageScene("level1");
		});

	// ## Asset Loading and Game Launch

	// Q.load can be called at any time to load additional assets
	// assets that are already loaded will be skipped
	// The callback will be triggered when everything is loaded
	Q.load(["tiles.png", "bg.png", "bloopa.png", "bloopa.json", "coin.png","coin.json", "goomba.png","goomba.json",
		"mainTitle.png", "mario_small.png","mario_small.json", "princess.png"], function() {
		
		/*
		// Sprites sheets can be created manually
		Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });
		Q.sheet("bg","bg.png", { tilew: 32, tileh: 32 });
		Q.sheet("mainTitle","mainTitle.png", { tilew: 32, tileh: 32 });
		Q.sheet("princess","princess.png", { tilew: 32, tileh: 32 });
		*/


		// Or from a .json asset that defines sprite locations
		Q.compileSheets("bloopa.png", "bloopa.json");
		Q.compileSheets("coin.png","coin.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("mario_small.png","mario_small.json");

		// Finally, call stageScene to run the game
		Q.stageScene("level1");
	});


	// ## Player Sprite
	// The very basic player sprite, this is just a normal sprite
	// using the player sprite sheet with default controls added to it.
	Q.Sprite.extend("Player",{
		// the init constructor is called on creation
		init: function(p) {
			// You can call the parent's constructor with this._super(..)
			this._super(p, {
					sheet: "mario_small", // Setting a sprite sheet sets sprite width and height
					x: 500, // You can also set additional properties that can
					y: 90 // be overridden on object creation
				});

			this.add('2d, platformerControls');
				// Write event handlers to respond hook into behaviors

				// hit.sprite is called everytime the player collides with a sprite
				this.on("hit.sprite",function(collision) {
					// Check the collision, if it's the Tower, you win!
					/*if(collision.obj.isA("Tower")) {
						Q.stageScene("endGame",1, { label: "You Won!" });
						this.destroy();
					}*/
				});
			}
		});


	// ## Tower Sprite
	// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
	Q.Sprite.extend("Tower", {
		init: function(p) {
			this._super(p, { sheet: 'tower' });
		}
	});


	// ## Enemy Sprite
	// Create the Enemy class to add in some baddies
	Q.Sprite.extend("Enemy",{
		init: function(p) {
			this._super(p, { sheet: 'enemy', vx: 100 });

				// Enemies use the Bounce AI to change direction
				// whenver they run into something.
				this.add('2d, aiBounce');
				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top
				this.on("bump.left,bump.right,bump.bottom",function(collision) {
					if(collision.obj.isA("Player")) {
						Q.stageScene("endGame",1, { label: "You Died" });
						collision.obj.destroy();
					}
				});
				// If the enemy gets hit on the top, destroy it
				// and give the user a "hop"
				this.on("bump.top",function(collision) {
					if(collision.obj.isA("Player")) {
						this.destroy();
						collision.obj.p.vy = -300;
					}
				});
			}
		});

	// ##Añadir fichero tmx
	



	// ## Level1 scene

	// Create a new scene called level 1
	Q.scene("level1",function(stage) {
		
		Q.stageTMX("level.tmx",stage);

		// Add in a repeater for a little parallax action
		stage.insert(new Q.Repeater({ asset: "bg.png", speedX: 0.5, speedY: 0.5 }));

		// Add in a tile layer, and make it the collision layer
		stage.collisionLayer(new Q.TileLayer({
			dataAsset: 'level.tmx',
			sheet: 'tiles' }));

		// Create the player and add them to the stage
		var player = stage.insert(new Q.Player());
		// Give the stage a moveable viewport and tell it
		// to follow the player.
		stage.add("viewport").follow(player);


	});

	// To display a game over / game won popup box,
	// create a endGame scene that takes in a `label` option
	// to control the displayed message.
	Q.scene('endGame',function(stage) {

			var container = stage.insert(new Q.UI.Container({
				x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"}));

			var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
				label: "Play Again" }));

			var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h,
				label: stage.options.label }));

			// When the button is clicked, clear all the stages
			// and restart the game.
			button.on("click",function() {
				Q.clearStages();
				Q.stageScene('level1');
			});

		// Expand the container to visibily fit it's contents
		// (with a padding of 20 pixels)
		container.fit(20);
	});

};