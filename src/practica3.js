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
	Q.load(["tiles.png", "bg.png", "bloopa.png", "bloopa.json", "coin.png","coin.json", "goomba.png","goomba.json",
		"mainTitle.png", "mario_small.png","mario_small.json", "princess.png"], function() {

		Q.stageScene("startGame", 1);
		// Or from a .json asset that defines sprite locations
		Q.compileSheets("bloopa.png", "bloopa.json");
		Q.compileSheets("coin.png","coin.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("mario_small.png","mario_small.json");
			
	});


	//Carga de audios
	Q.load(["coin.mp3", "music_die.mp3", "music_level_complete.mp3", "music_main.mp3"], function () { });

	// ## Player Sprite
	Q.Sprite.extend("Player",{
		
		init: function(p) {
			
			this._super(p, {
					sprite: "mario_anim",
					sheet: "marioR", // Setting a sprite sheet sets sprite width and height
					x: 32, // You can also set additional properties that can
					y: 32, // be overridden on object creation
					died: false, 
					score: 0,
				});

			this.add('2d, platformerControls, animation');

			this.on("hit.sprite",function(collision) {
					if(collision.obj.isA("Princess")) {
						this.vx = 0;
						this.vy = 0;
						Q.audio.stop('music_main.mp3');
                    	Q.audio.play('music_level_complete.mp3');
						Q.stageScene("endGame",1, { label: "You Win!" });
					}
			});
		}, 
		step: function(dt){

			if(this.p.y > 700){
			 	this.destroy();
			 	Q.stageScene("endGame",1, { label: "Game Over" }); 
			 } 
			 else {
				if( (this.p.vx > 0 && this.p.vy < 0) || (this.p.vx < 0 && this.p.vy < 0) || this.p.vy < 0){
					this.play("jump_" + this.p.direction);
				}else if(this.p.vy > 0){
					this.play("smash_" + this.p.direction);
				}else if(this.p.vx !== 0) {
					this.play("walk_" + this.p.direction);
				} else {
					this.play("stand_" + this.p.direction);
				}
			}
		},

		die: function(){
				Q.audio.stop("music_main.mp3");
                //Q.audio.play("music_die.mp3"); Para habilitarlo hay que destruirlo primero.
                //this.play("die");
				//this.destroy();

		}

	});


	// ## Coin sprite
	Q.Sprite.extend("Coin", {
		init: function(p) {
			this.touched = false;
			this._super(p, { 
				sheet: 'coin',
				sprite: 'coin_anim', 
				gravity: 0
			});
		

		this.add('2d, animation, tween');
				// Write event handlers to respond hook into behaviors

			this.on("hit.sprite", function (collision) {
				if (collision.obj.isA("Player") && !this.touched) {
					this.touched = true;
					Q.audio.play("coin.mp3");
					this.animate({y: p.y-34, vy: p.vy -100}, 0.2, Q.Easing.Linear, {callback: this.destroy});
					collision.obj.score += 1;
				}
			});
		},
		step: function (dt) {
			this.play("catch");
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
				vy: -200,
				gravity:0 }); //gravity: 0

				this.add('2d, bump, aiBounce, animation, DefaultEnemy');
				
			},

			step: function(dt){
				if(this.p.y > 550)
					this.destroy();

				if(this.p.y < 350){
					this.p.y = 350;
					this.p.vy = 200;
				}
				else if(this.p.y > 525){
					this.p.vy = -200;
					this.p.y = 525;
				}

				this.play("walk");
			}, 

			die: function(){
				this.p.vy = 200;
				this.play("die");
			}
		});
	
	// Create the GOOMBA class to add in some baddies
	Q.Sprite.extend("Goomba",{
		init: function(p) {
			this._super(p, { 
				sprite: "goomba_anim",
				sheet: 'goomba', 
				vx: 100 });

				this.add('2d, bump, aiBounce, animation, DefaultEnemy');
				
				var finish = false;
			},

			step: function(dt){
				this.play("walk");
			},

			die: function(){
				this.p.vy = 200;
				this.play("die");
			}

	});

	Q.component("DefaultEnemy", {
		added: function(){
			
				this.entity.on("bump.left, bump.right,bump.bottom",function(collision) {
					if(collision.obj.isA("Player")) {
						Q.audio.play("music_die.mp3");
						Q.audio.stop("music_main.mp3");
						Q.stageScene("endGame",1, { label: "Game Over" });
						collision.obj.destroy();WW
					}
				});
				
				this.entity.on("bump.top",function(collision) {
					if(collision.obj.isA("Player")) {
						this.destroy();
						this.die();
						collision.obj.p.vy = -300;
					}
				});
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

		var player = stage.insert(new Q.Player({x:150, y:380}));
		stage.add("viewport").centerOn(160,360); 
		stage.add("viewport").follow(player, {x: true, y:false}); 
		//Que le siga hasta cierto punto
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 160;

		Q.audio.play('music_main.mp3', {loop: true});



		stage.insert(new Q.Bloopa({ x: 300, y: 525 }));
		stage.insert(new Q.Bloopa({ x: 340, y: 525 }));
		stage.insert(new Q.Bloopa({ x: 380, y: 525 }));

		stage.insert(new Q.Goomba({ x: 500, y: 525 }));
		stage.insert(new Q.Goomba({ x: 1500, y: 450 }));
		
		stage.insert(new Q.Princess({ x: 2000, y: 350 }));

		stage.insert(new Q.Coin({ x: 420, y: 470 }));
		stage.insert(new Q.Coin({ x: 460, y: 450 }));
		stage.insert(new Q.Coin({ x: 500, y: 450 }));

		stage.insert(new Q.Coin({ x: 940, y: 460 }));
		stage.insert(new Q.Coin({ x: 974, y: 470 }));
		stage.insert(new Q.Coin({ x: 1008, y: 470 }));
		stage.insert(new Q.Coin({ x: 1042, y: 470 }));
		stage.insert(new Q.Coin({ x: 1074, y: 460 }));

		stage.insert(new Q.Coin({ x: 1120, y: 470 }));
		stage.insert(new Q.Coin({ x: 1150, y: 460 }));
		stage.insert(new Q.Coin({ x: 1180, y: 470 }));
		stage.insert(new Q.Coin({ x: 1210, y: 460 }));


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

			button.on("click",function() {
				Q.clearStages();
				Q.stageScene('startGame', 1);
			});


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
		die: { frames: [2,3], rate: 0.5/3, loop: true }
	});


	//Animacion de BLOOPA
	Q.animations("bloopa_anim", {
		walk: { frames: [0,1], rate: 1/5,
					  flip: false, loop: true },
		die: { frames: [2], loop: false }
	});


	//Animacion de COIN
	Q.animations("coin_anim", {
		catch: {
			frames: [0, 1, 2], rate: 0.5 / 3,
			flip: false, loop: true
		}
	});









};
