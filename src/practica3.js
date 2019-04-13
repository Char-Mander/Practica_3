//Código de la práctica 3

var game = function () {
	// Set up an instance of the Quintus engine and include
	// the Sprites, Scenes, Input and 2D module. The 2D module
	// includes the `TileLayer` class as well as the `2d` componet.
	var Q = window.Q = Quintus({ development: true })
	.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI,Audio,TMX")
		// Maximize this game to whatever the size of the browser is
		.setup({ //maximize: true
			width: 320, // Set the default width to 800 pixels
			height: 480, // Set the default height to 600 pixels
		})
		// And turn on default input controls and touch input (for UI)
		.controls().touch().enableSound();
		

	// ## Asset Loading and Game Launch
	Q.load(["tiles.png", "bg.png", "bloopa.png", "bloopa.json", "coin.png", "coin.json", "goomba.png", "goomba.json",
		"mainTitle.png", "mario_small.png", "mario_small.json", "princess.png"], function () {

			Q.stageScene("startGame", 1);
			// Or from a .json asset that defines sprite locations
			Q.compileSheets("bloopa.png", "bloopa.json");
			Q.compileSheets("coin.png", "coin.json");
			Q.compileSheets("goomba.png", "goomba.json");
			Q.compileSheets("mario_small.png", "mario_small.json");

		});


	//Carga de audios
	Q.load(["coin.mp3", "music_die.mp3", "music_level_complete.mp3", "music_main.mp3", "kill_enemy.mp3"], function () { });

	// ## Player Sprite
	Q.Sprite.extend("Player", {

		init: function (p) {
			var died = false;
			this._super(p, {
				sprite: "mario_anim",
				sheet: "marioR", // Setting a sprite sheet sets sprite width and height
				x: 32, // You can also set additional properties that can
				y: 32, // be overridden on object creation
			});

			this.add('2d, platformerControls, animation, tween');

			this.on("hit.sprite", function (collision) {
				if (collision.obj.isA("Princess") && !this.died) {
					this.died = true;
					this.del('2d, platformerControls');
					this.play("stand_right");
					Q.audio.stop('music_main.mp3');
					Q.audio.play('music_level_complete.mp3');
					Q.stageScene("endGame", 1, { label: "You Win!" });
				}
			});

			this.on("endAnimation", this, "fall");

		},
		step: function (dt) {
			if (!this.died) {
				if (this.p.y > 550) {
					this.startAnimation();	

					if(Q.state.p.lives == 1){
						Q.stageScene("endGame", 1, { label: "Game Over" });
					}else
						Q.stageScene("livesLeft", 1);

					Q.state.dec("lives", 1);
				}
				else {

					if ((this.p.vx > 0 && this.p.vy < 0) || (this.p.vx < 0 && this.p.vy < 0) || this.p.vy < 0) {
						this.p.vy += -6;
						this.play("jump_" + this.p.direction);
					} else if (this.p.vy > 0) {
						this.play("smash_" + this.p.direction);
					} else if (this.p.vx !== 0) {
						this.play("walk_" + this.p.direction);
					} else {
						this.play("stand_" + this.p.direction);
					}

				}
			}

		},

		startAnimation() {
			this.died = true;
			this.del('2d, platformerControls');
			this.play("die");
			Q.audio.play("music_die.mp3");
		},

		fall: function () {
			this.stage.unfollow();
			this.animate({ y: this.p.y + 400, vy: this.p.vy - 50 }, 1.5, Q.Easing.Linear, { callback: function(){this.destroy();} });
		}

	});


	// ## Coin sprite
	Q.Sprite.extend("Coin", {
		init: function (p) {
			this.touched = false;
			this._super(p, {
				sheet: 'coin',
				sprite: 'coin_anim',
				gravity: 0
			});


			this.add('2d, animation, tween');
			// Write event handlers to respond hook into behaviors
			if (!this.died) {
				this.on("hit.sprite", function (collision) {
					if (collision.obj.isA("Player") && !this.touched) {
						this.touched = true;
						Q.audio.play("coin.mp3");
						this.animate({ y: p.y - 34, vy: p.vy - 200 }, 0.1, Q.Easing.Linear, { callback: this.destroy });
						Q.state.inc("score", 1);
					}
				});
			}
		},

		step: function (dt) {
			if (!this.touched) {
				this.play("catch");
			}
		}
	});


	// Sprite del titulo
	Q.Sprite.extend("Title", {
		init: function (p) {
			this._super(p, { asset: "mainTitle.png", x: 160, y: 240 });
		}
	});


	// ## Bloopa Sprite

	// Create the Enemy class to add in some baddies
	Q.Sprite.extend("Bloopa", {

		init: function (p) {
			var died = false;
			this._super(p, {
				sprite: "bloopa_anim",
				sheet: 'bloopa',
				vy: -200,
				gravity: 0
			}); 

			this.add('2d, bump, aiBounce, animation, tween');

			this.on("bump.left, bump.right,bump.bottom", function (collision) {
				if (collision.obj.isA("Player")) {

					//Q.audio.play("music_die.mp3");

					if(Q.state.p.lives == 1){
						Q.stageScene("endGame", 1, { label: "Game Over" });
					}else{
						Q.stageScene("livesLeft", 1);
					}

					Q.state.dec("lives", 1);


					collision.obj.startAnimation();
					this.p.vy = -200;
				}
			});

			this.on("bump.top", function (collision, that) {
				if (collision.obj.isA("Player")) {
					Q.audio.play("kill_enemy.mp3");
					collision.obj.p.vy = -300;
					Q.state.inc("score", 5);
					this.startAnimation();
				}
			});


			this.on("endAnimation", this, "die");


		},

		step: function (dt) {
			if (!this.died) {

				if (this.p.y < 350) {
					this.p.y = 350;
					this.p.vy = 200;
				}
				else if (this.p.y > 525) {
					this.p.vy = -200;
					this.p.y = 525;
				}

				this.play("walk");
			}
		},

		startAnimation: function () {
			this.died = true;
			this.play("die");

		},

		die: function () {
			this.destroy();
		}
	});

	// Create the GOOMBA class to add in some baddies
	Q.Sprite.extend("Goomba", {
		init: function (p) {
			var died = false;
			this._super(p, {
				sprite: "goomba_anim",
				sheet: 'goomba',
				vx: 100
			});

			this.add('2d, bump, aiBounce, animation, tween');

			this.on("bump.left, bump.right,bump.bottom", function (collision) {
				if (collision.obj.isA("Player")) {
					//Q.audio.play("music_die.mp3");

					if(Q.state.p.lives == 1){
						Q.stageScene("endGame", 1, { label: "Game Over" });
					}else{
						Q.stageScene("livesLeft", 1);
					}
					Q.state.dec("lives", 1);
					collision.obj.startAnimation();
				}
			});

			this.on("bump.top", function (collision, that) {
				if (collision.obj.isA("Player")) {
					Q.audio.play("kill_enemy.mp3");
					collision.obj.p.vy = -300;
					Q.state.inc("score", 5);
					this.startAnimation();
				}
			});

			this.on("endAnimation", this, "die");
		},

		step: function (dt) {
			if (!this.died) {
				this.play("walk");
			}
		},

		startAnimation: function () {
			this.died = true;
			this.play("die");
		},

		die: function () {
			this.destroy();
		}


	});

	// ## Princess Sprite, no se muestra
	Q.Sprite.extend("Princess", {
		init: function (p) {
			this._super(p, { asset: "princess.png" });
			this.add('2d');
		}
	});

	Q.loadTMX("ourlevel.tmx", function () {
		Q.stageScene("level1");
	});


	//Label que muestra la puntuacion
	Q.UI.Text.extend("Score", {
		init: function (p) {
			this._super({
				label: "Score: 0",
				x: 0,
				y: 0
			});
			Q.state.on("change.score", this, "score");
		},
		score: function (score) {
			this.p.label = "Score: " + score;
		}
	});

	//Label que muestra las vidas
	Q.UI.Text.extend("Lives", {
		init: function (p) {
			this._super({
				label: "Lives: 3",
				color: "white",
				x: 0,
				y: 0
			});
			Q.state.on("change.lives", this, "lives");
		},
		lives: function (lives) {
			this.p.label = "Lives: " + lives;
		}
	});




	// ## Level1 scene
	// Create a new scene called level 1
	Q.scene("level1", function (stage) {
		Q.stageTMX("ourlevel.tmx", stage);

		Q.audio.stop("music_main.mp3");


		var player = stage.insert(new Q.Player({ x: 150, y: 380 }));
		stage.add("viewport").centerOn(160, 360);
		stage.add("viewport").follow(player, { x: true, y: false });
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 160;

		Q.audio.play('music_main.mp3', { loop: true });



		stage.insert(new Q.Bloopa({ x: 660, y: 525 }));
		stage.insert(new Q.Bloopa({ x: 730, y: 525 }));
		stage.insert(new Q.Bloopa({ x: 790, y: 525 }));
		stage.insert(new Q.Bloopa({ x: 860, y: 525 }));
		stage.insert(new Q.Bloopa({ x: 940, y: 525 }));
		stage.insert(new Q.Bloopa({ x: 985, y: 525 }));

		stage.insert(new Q.Bloopa({ x: 2430, y: 450 }));
		stage.insert(new Q.Bloopa({ x: 2570, y: 450 }));


		stage.insert(new Q.Goomba({ x: 500, y: 525 }));
		stage.insert(new Q.Goomba({ x: 1500, y: 450 }));
		stage.insert(new Q.Goomba({ x: 1630, y: 400 }));
		stage.insert(new Q.Goomba({ x: 1780, y: 400 }));
		stage.insert(new Q.Goomba({ x: 1920, y: 400 }));
		

		stage.insert(new Q.Princess({ x: 3230, y: 200 }));


		stage.insert(new Q.Coin({ x: 625, y: 400 }));
		stage.insert(new Q.Coin({ x: 765, y: 400 }));
		stage.insert(new Q.Coin({ x: 900, y: 400 }));

		stage.insert(new Q.Coin({ x: 1040, y: 400 }));
		stage.insert(new Q.Coin({ x: 1080, y: 370 }));
		stage.insert(new Q.Coin({ x: 1120, y: 370 }));
		stage.insert(new Q.Coin({ x: 1160, y: 400 }));



		stage.insert(new Q.Coin({ x: 1510, y: 300 }));
		stage.insert(new Q.Coin({ x: 1550, y: 300 }));
		stage.insert(new Q.Coin({ x: 1590, y: 300 }));

		stage.insert(new Q.Coin({ x: 1710, y: 300 }));
		stage.insert(new Q.Coin({ x: 1850, y: 300 }));


		stage.insert(new Q.Coin({ x: 1995, y: 300 }));

		stage.insert(new Q.Coin({ x: 2020, y: 300 }));

		stage.insert(new Q.Coin({ x: 1520, y: 450 }));
		stage.insert(new Q.Coin({ x: 1550, y: 450 }));
		stage.insert(new Q.Coin({ x: 1580, y: 450 }));

		stage.insert(new Q.Coin({ x: 2130, y: 450 }));
		stage.insert(new Q.Coin({ x: 2170, y: 400 }));
		stage.insert(new Q.Coin({ x: 2210, y: 400 }));
		stage.insert(new Q.Coin({ x: 2250, y: 450 }));

		stage.insert(new Q.Coin({ x: 2700, y: 370 }));
		stage.insert(new Q.Coin({ x: 2750, y: 370 }));
		stage.insert(new Q.Coin({ x: 2800, y: 370 }));
		stage.insert(new Q.Coin({ x: 2850, y: 370 }));

	});


	//Crea el inicio de partida, con la caratula
	Q.scene('startGame', function (stage) {
		var title = stage.insert(new Q.Title());
		var container = stage.insert(new Q.UI.Container({
			x: Q.width / 2, y: Q.height - 100, fill: "rgba(0,0,0,0.5)"
		}));

		var button = container.insert(new Q.UI.Button({
			x: 0, y: 0, fill: "#CCCCCC",
			label: "Start Game" 
		}));

		button.on("click", function () {
			Q.clearStages();
			Q.audio.stop("music_main.mp3");
			//Q.state.reset({ score: 0 });
			Q.state.set({ score: 0, lives: 3 });
			Q.stageScene('level1');
			Q.stageScene('scoreInfo', 1);
			Q.stageScene('livesInfo', 2);

		});

		container.fit(20);
	});


	Q.scene('scoreInfo', function (stage) {
		var container = stage.insert(new Q.UI.Container({
			x: 65,
			y: 20,
			w: Q.width,
			h: 20,
		}));

		var score = new Q.Score({
			x: 0,
			y: 0
		});
		

		container.insert(score);
	});

	Q.scene('livesInfo', function (stage) {
		var container = stage.insert(new Q.UI.Container({
			x: 265,
			y: 20,
			w: Q.width,
			h: 20,
		}));

		var lives = new Q.Lives({
			x: 0,
			y: 0
		});
		

		container.insert(lives);
	});


	//Escenario que se muestra cuando todavía le quedan vidas
	Q.scene('livesLeft', function (stage) {
			var life = Q.state.p.lives;

			Q.clearStages();
			Q.state.reset({ score: 0, lives: life });
			Q.stageScene('level1');
			Q.stageScene('scoreInfo', 1);
			Q.stageScene('livesInfo', 2);
	});


	Q.scene('endGame', function (stage) {

		var container = stage.insert(new Q.UI.Container({
			x: Q.width / 2, y: Q.height / 2, fill: "rgba(0,0,0,0.5)"
		}));

		var button = container.insert(new Q.UI.Button({
			x: 0, y: 0, fill: "#CCCCCC",
			label: "Play Again"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 10, y: -10 - button.p.h,
			label: stage.options.label
		}));

		var labelScore = container.insert(new Q.UI.Text({
			x: 10, y: button.p.h, color: "white",
			label: "Score : " + Q.state.p.score
		}));

		button.on("click", function () {
			Q.clearStages();
			Q.stageScene('startGame', 1);
		});


		container.fit(20);
	});


	// ANIMACIONES

	//Animacion de MARIO
	Q.animations("mario_anim", {
		walk_right: {
			frames: [1, 2, 3], rate: 1 / 15,
			flip: false, loop: true
		},
		walk_left: {
			frames: [1, 2, 3], rate: 1 / 15,
			flip: "x", loop: true
		},
		stand_right: { frames: [0], rate: 1 / 10, flip: false },
		stand_left: { frames: [0], rate: 1 / 10, flip: "x" },
		jump_right: { frames: [4], flip: false },
		jump_left: { frames: [4], flip: "x" },
		smash_right: { frames: [6, 7], rate: 1 / 15, loop: true, flip: false },
		smash_left: { frames: [6, 7], rate: 1 / 15, loop: true, flip: "x" },
		die: { frames: [12], flip: false, rate: 1 / 3, loop: false, trigger: "endAnimation" }
	});

	//Animacion de GOOMBA
	Q.animations("goomba_anim", {
		walk: {
			frames: [0, 1], rate: 1 / 15,
			flip: false, loop: true
		},
		die: { frames: [2], rate: 1 / 3, loop: false, trigger: "endAnimation" }
	});


	//Animacion de BLOOPA
	Q.animations("bloopa_anim", {
		walk: {
			frames: [0, 1], rate: 1 / 5,
			flip: false, loop: true
		},
		die: { frames: [2], rate: 0.5 / 3, loop: false, trigger: "endAnimation" }
	});


	//Animacion de COIN
	Q.animations("coin_anim", {
		catch: {
			frames: [0, 1, 2], rate: 0.5 / 3,
			flip: false, loop: true
		}
	});

};
