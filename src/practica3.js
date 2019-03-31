//Código de la práctica 3

var game = function() {
// Set up an instance of the Quintus engine and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus({development: true})
.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI,Audio,TMX")
// Maximize this game to whatever the size of the browser is
.setup({ //maximize: true
	width: 320, // Set the default width to 800 pixels
	height: 480, // Set the default height to 600 pixels
})
// And turn on default input controls and touch input (for UI)
.controls().touch().enableSound();


	// ## Asset Loading and Game Launch

	// Q.load can be called at any time to load additional assets
	// assets that are already loaded will be skipped
	// The callback will be triggered when everything is loaded
	Q.load(["tiles.png", "bg.png", "bloopa.png", "bloopa.json", "coin.png","coin.json", "goomba.png","goomba.json",
		"mainTitle.png", "mario_small.png","mario_small.json", "princess.png"], function() {

		Q.stageScene("startGame", 2);
		// Or from a .json asset that defines sprite locations
		Q.compileSheets("bloopa.png", "bloopa.json");
		Q.compileSheets("coin.png","coin.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("mario_small.png","mario_small.json");
		


		
	});


	// ## Player Sprite
	// The very basic player sprite, this is just a normal sprite
	// using the player sprite sheet with default controls added to it.
	Q.Sprite.extend("Player",{
		// the init constructor is called on creation
		init: function(p) {
			// You can call the parent's constructor with this._super(..)
			this._super(p, {
					sprite: "mario_anim",
					sheet: "marioR", // Setting a sprite sheet sets sprite width and height
					x: 32, // You can also set additional properties that can
					y: 32, // be overridden on object creation
				});

			this.add('2d, platformerControls, animation');
				// Write event handlers to respond hook into behaviors

			//this.step(){}

			this.on("hit.sprite",function(collision) {
					if(collision.obj.isA("Princess")) {
						Q.stageScene("endGame",1, { label: "You Won!" });
					}
					
			});
		}, //Cuidado, cada cosa que se defina como step, con una coma al final del parentesis

		step: function(dt){
			if( (this.p.vx > 0 && this.p.vy < 0) || (this.p.vx < 0 && this.p.vy < 0) || this.p.vy < 0){
				this.play("jump_" + this.p.direction);
			}else if(this.p.vy > 0){
				this.play("smash_" + this.p.direction);
			}else if(this.p.vx > 0) {
				this.play("walk_right");
			} else if(this.p.vx < 0) {
				this.play("walk_left");
			} else {
				this.play("stand_" + this.p.direction);
			}
		},

		die: function(enemy){
				this.play("die");
				enemy.destroy();
				//Falta que se reinicie al caer del escenario
		}

	});


	// ## Tower Sprite
	// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
	Q.Sprite.extend("Tower", {
		init: function(p) {
			this._super(p, { sheet: 'tower' });
		}
	});

	// Sprite del titulo
	Q.Sprite.extend("Title", {
		init: function(p) {
			this._super(p, { asset: "mainTitle.png", x: 160, y:240});
		}
	});


	// ## Bloopa Sprite
	
	// Create the Enemy class to add in some baddies
	Q.Sprite.extend("Bloopa",{
		init: function(p) {
			this._super(p, { 
				sprite: "bloopa_anim",
				sheet: 'bloopa',
				vy: -10,
				gravity:0 }); //gravity: 0

				// Enemies use the Bounce AI to change direction
				// whenver they run into something.
				this.add('2d, bump, aiBounce, animation');
				// Listen for a sprite collision, if it's the player,
				// end the game unless the enemy is hit on top
				this.on("bump.left, bump.right,bump.bottom",function(collision) {
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
			},

			step: function(dt){
				this.play("walk");
			}
		});
	

	// Create the GOOMBA class to add in some baddies
	Q.Sprite.extend("Goomba",{
		init: function(p) {
			this._super(p, { 
				sprite: "goomba_anim",
				sheet: 'goomba', 
				vx: 100 });

				this.add('2d, bump, aiBounce,animation');
				
				this.on("bump.left,bump.right",function(collision) {
					if(collision.obj.isA("Player")) {
						Q.stageScene("endGame",1, { label: "You Died" });
						collision.obj.destroy();
					}
				});
				
				this.on("bump.top",function(collision) {
					if(collision.obj.isA("Player")) {
						//this.die(collision.obj);
						this.destroy();
						collision.obj.p.vy = -300;
					}
				});
			},

			step: function(dt){
				this.play("walk");
			},

			die: function(obj){
				obj.play("die");
			}

	});


	// ## Princess Sprite, no se muestra
	Q.Sprite.extend("Princess",{
		init: function(p) {
			this._super(p, { asset: "princess.png"});
				this.add('2d');
			}
	});
	
	Q.loadTMX("level.tmx", function() {
		Q.stageScene("level1");
	});




// ## Level1 scene
	// Create a new scene called level 1
	Q.scene("level1",function(stage) {

		Q.stageTMX("level.tmx",stage);

		var player = stage.insert(new Q.Player({x:150, y:380})); // Create the player and add them to the stage
		stage.add("viewport").follow(player); //Para que siga a Mario
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 160;

		stage.insert(new Q.Bloopa({x:300, y:400}));
		stage.insert(new Q.Goomba({x:1500, y:450}));
		stage.insert(new Q.Princess({x:2000, y:350}));

	});

	
	//Crea el inicio de partida, con la caratula
	Q.scene('startGame',function(stage) {
			var title = stage.insert(new Q.Title());
			var container = stage.insert(new Q.UI.Container({
				x: Q.width/2, y: Q.height - 100, fill: "rgba(0,0,0,0.5)"}));

			var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
				label: "Start Game" }));

			button.on("click",function() {
				Q.clearStages();
				Q.stageScene('level1');
			});

		container.fit(20);
	});


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


	// ANIMACIONES

	//Animacion de MARIO
	Q.animations("mario_anim", {
		walk_right: { frames: [1,2,3], rate: 1/15,
					  flip: false, loop: true },
		walk_left: { frames: [1,2,3], rate: 1/15,
					  flip:"x", loop: true },
		stand_right: { frames:[0], rate: 1/10, flip: false },
		stand_left: { frames: [0], rate: 1/10, flip:"x" },
		jump_right: { frames: [4],  flip: false },
		jump_left: { frames: [4], flip: "x" },
		smash_right: { frames: [6,7], rate: 1/15, loop: true,  flip: false },
		smash_left: { frames: [6,7], rate: 1/15, loop: true, flip: "x" },
		die: { frames: [12], flip: false }
	});

	//Animacion de GOOMBA
	Q.animations("goomba_anim", {
		walk: { frames: [0,1], rate: 1/15,
					  flip: false, loop: true },
		die: { frames: [2,3], rate: 1/15, loop: false }
	});


	//Animacion de BLOOPA
	Q.animations("bloopa_anim", {
		walk: { frames: [0,1], rate: 1/5,
					  flip: false, loop: true },
		die: { frames: [2], loop: false }
	});
















};