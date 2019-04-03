//Código de la práctica 3

var game = function () {







    //---------------------------------------------------- CONFIGURACIÓN Y CARGA DE DATOS ----------------------------------------------------//


    // Set up an instance of the Quintus engine and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the`TileLayer`class as well as the`2d`componet.
    var Q = window.Q = Quintus({
        audioSupported: ['mp3'],
        development: true,
    })
        .include('Scenes, Sprites, Input, UI, Touch, Audio, Anim, 2D, TMX')
        // Maximize this game to whatever the size of the browser is
        .setup({
            width: 320,
            height: 480
        })
        // And turn on default input controls and touch input (for UI)
        .controls()
        .touch()
        .enableSound();



    // ## Asset Loading and Game Launch

    Q.load(["coin.mp3", "music_die.mp3", "music_level_complete.mp3", "music_main.mp3"], function () { });
    // Q.load can be called at any time to load additional assets
    // assets that are already loaded will be skipped
    // The callback will be triggered when everything is loaded coin.mp3,  level.tmx, music_main.mp3, music_die.mp3, music_level_complete.mp3,
    Q.load(["bg.png", "bloopa.json", "bloopa.png", "coin.png", "coin.json", "goomba.json", "goomba.png",
        "mainTitle.png", "mario_small.json", "mario_small.png", "princess.png", "tiles.png"],
        function () {
            // Sprites sheets can be created manually
            // Or from a .json asset that defines sprite locations
            Q.compileSheets("mario_small.png", "mario_small.json");
            Q.compileSheets("coin.png", "coin.json");
            Q.compileSheets("bloopa.png", "bloopa.json");
            Q.compileSheets("goomba.png", "goomba.json");

            Q.stageScene("mainTitle");
        });

   







    //----------------------------------------------------CREACIÓN DEL JUEGADOR Y LOS ENEMIGOS----------------------------------------------------//


    // ## Mario Sprite
    // The very basic player sprite, this is just a normal sprite
    // using the player sprite sheet with default controls added to it.
    Q.Sprite.extend("Mario", {
        // the init constructor is called on creation
        init: function (p) {
            // You can call the parent's constructor with this._super(..)
            this._super(p, {
                sprite: 'mario_animation',
                sheet: "marioR",
                x: 150,
                y: 380,
                direction: 'right',
                jumpSpeed: -400,
                speed: 200,
                vy: 10,
                died: false,
                // movement: true

            });
            // Add in pre-made components to get up and running quickly
            // The `2d` component adds in default 2d collision detection
            // and kinetics (velocity, gravity)
            // The `platformerControls` makes the player controllable by the
            // default input actions (left, right to move, up or action to jump)
            // It also checks to make sure the player is on a horizontal surface before
            // letting them jump.
            this.add('2d, platformerControls, animation, tween');
            this.on("drag");


            // hit.sprite is called everytime the player collides with a sprite
            this.on("hit.sprite", function (collision) {
                // Check the collision, if it's the Tower, you win!
                if (collision.obj.isA("Princess")) {
                    this.p.speed = 0;
                    this.p.jumpSpeed = 0;
                    Q.audio.stop('music_main.mp3');
                    Q.audio.play('music_level_complete.mp3');
                    Q.stageScene('endGame', 1, { label: 'You win!' });
                }
                
            });
        },

        drag: function (touch) {
            this.p.x = touch.origX + touch.dx;
            this.p.y = touch.origY + touch.dy;
        },


        step: function (dt) {
            if (this.p.y > 700) {
                this.die();
            }

            if (this.p.died) {
                this.play('death');
            } else {
                if (this.p.vx != 0) {
                    this.play("walk_" + this.p.direction);
                } else if (this.p.vy != 0) {
                    this.play("fall_" + this.p.direction);
                }
                else {
                    this.play("stand_" + this.p.direction);
                }

            }
        },

        jump: function () {
            this.p.vy = -200;
        },


        fall: function () {
            this.animate({ y: this.p.y + 200 }, 0.8, Q.Easing.Linear/*, {callback: this.destroy}*/);
            this.destroy();
        },
        /*
                destroy: function(){
                  this.destroy();  
                },
        */
        die: function () {
            if (!this.died) {
                this.died = true;
                this.p.speed = 0;
                this.p.jumpSpeed = 0;
                Q.audio.stop();
                Q.audio.play("music_die.mp3");
                Q.stageScene("endGame", 1, { label: "You Died" });
            }
        }
    });


    //Animación de Mario

    Q.animations('mario_animation', {
        'walk_right': { frames: [1, 2, 3], rate: 1 / 7 },
        'walk_left': { frames: [15, 16, 17], rate: 1 / 7 },
        'stand_right': { frames: [0], loop: false },
        'stand_left': { frames: [14], loop: false },
        'jump_right': { frames: [4], loop: false },
        'jump_left': { frames: [18], loop: false },
        'fall_right': { frames: [4], loop: false },
        'fall_left': { frames: [18], loop: false },
        'death': { frames: [12], loop: true }
    });






    // ## Princess Sprite
    // Sprites can be simple, the Princess sprite just sets a custom sprite sheet
    Q.Sprite.extend("Princess", {
        init: function (p) {
            this._super(p, { 
            asset: 'princess.png',
            x: 200,
            y: 380    
            });

            this.add('2d');
        }
    });



    // ## Enemy Sprite
    // Create the Enemy class to add in some baddies
    Q.Sprite.extend("Goomba", {
        init: function (p) {
            this._super(p, { 
                sheet: 'goomba', 
                sprite: "goomba_animation",
                x: 1000,
                y: 450,
                vx: 100,
                direction: 'left' 
                });
            // Enemies use the Bounce AI to change direction
            // whenver they run into something.
            this.add('2d, aiBounce, animation');
            // Listen for a sprite collision, if it's the player,
            // end the game unless the enemy is hit on top
            this.on("bump.left,bump.right,bump.bottom", function (collision) {
                if (collision.obj.isA("Mario")) {
                    Q.stageScene("endGame", 1, { label: "You Died" });
                    collision.obj.destroy();
                }
            });
            // If the enemy gets hit on the top, destroy it
            // and give the user a "hop"
            this.on("bump.top", function (collision) {
                if (collision.obj.isA("Mario")) {
                    this.play('death');
                    collision.obj.p.vy = -300;
                    this.destroy();
                }
            });

        },

            
        step: function(dt){
            if(this.p.vx != 0 && !this.died){
                this.play('walk');
            }
        }

    });




    //Animación de Goomba

    Q.animations('goomba_animation', {
        'walk': { frames: [0, 1], rate: 1 / 3},
        'death': { frames: [2], rate: 1 / 3, loop: false }
    });






    //---------------------------------------------------- DISTINTAS PANTALLAS DEL JUEGO ----------------------------------------------------//


    //----------------------------------------------------  CARGA DE LA PANTALLA INICIAL  ----------------------------------------------------//

    Q.loadTMX("level.tmx", function () {
        Q.stageScene("mainTitle");
        //Q.stageScene("mainTitle");
        //stage.add("viewport");
        //stage.viewport.offsetX = -100;
        //stage.viewport.offsetY = 160;
    });

    //----------------------------------------------------          NIVEL BÁSICO          ----------------------------------------------------//

    Q.scene("level1", function (stage) {
        Q.stageTMX("level.tmx", stage);
        Q.audio.play('music_main.mp3', { loop: true });
        stage.add("viewport").centerOn(160, 370);
        var player = stage.insert(new Q.Mario());
        stage.insert(new Q.Princess());
        stage.add("viewport").follow(player, { x: true, y: false });
        

    });

    //----------------------------------------------------        PANTALLA INICIAL        ----------------------------------------------------//
    Q.scene('mainTitle', function (stage) {
        var title = stage.insert(new Q.UI.Button({
            x: Q.width / 2, y: Q.height / 2, asset: "mainTitle.png"
        }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        title.on("click", function () {
            Q.clearStages();
            Q.stageScene('level1');
        });
        // Expand the button to visibly fit it's contents
        // (with a padding of 20 pixels)
        title.fit(20);
    });


    //----------------------------------------------------  PANTALLA FIN DEL JUEGO  ----------------------------------------------------//
    Q.scene('endGame', function (stage) {

        var win;
        if (Q.state.get("lives") > 0) { win = "PLAY AGAIN"; }
        else { win = "GAME OVER" }

        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2, y: Q.height / 2, fill: "rgba(0,0,0,0.5)"
        }));
        var button = container.insert(new Q.UI.Button({
            x: 0, y: 0, fill: "#CCCCCC", label: win
        }));
        var label = container.insert(new Q.UI.Text({
            x: 10, y: -10 - button.p.h, label: stage.options.label
        }));

        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click", function () {
            Q.clearStages();
            Q.stageScene('mainTitle');
        });
        // Expand the container to visibly fit it's contents
        // (with a padding of 20 pixels)
        container.fit(20);
    });

    /*
    // ## Enemy Sprite
    // Create the Enemy class to add in some baddies
    Q.Sprite.extend("Enemy", {
        init: function (p) {
            this._super(p, { sheet: 'enemy', vx: 100 });
            // Enemies use the Bounce AI to change direction
            // whenver they run into something.
            this.add('2d, aiBounce');
            // Listen for a sprite collision, if it's the player,
            // end the game unless the enemy is hit on top
            this.on("bump.left,bump.right,bump.bottom", function (collision) {
                if (collision.obj.isA("Player")) {
                    Q.stageScene("endGame", 1, { label: "You Died" });
                    collision.obj.destroy();
                }
            });
            // If the enemy gets hit on the top, destroy it
            // and give the user a "hop"
            this.on("bump.top", function (collision) {
                if (collision.obj.isA("Player")) {
                    this.destroy();
                    collision.obj.p.vy = -300;
                }
            });
        }
    });
        
 
    // ## Level1 scene
    // Create a new scene called level 1
    Q.scene("level1", function (stage) {
        // Add in a repeater for a little parallax action
        stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));
        // Add in a tile layer, and make it the collision layer
        stage.collisionLayer(new Q.TileLayer({
            dataAsset: 'level.json',
            sheet: 'tiles'
        }));
        // Create the player and add them to the stage
        var mario = stage.insert(new Q.Mario());
        // Give the stage a moveable viewport and tell it
        // to follow the player.
        stage.add("viewport").follow(mario);
        // Add in a couple of enemies
      //  stage.insert(new Q.Enemy({ x: 700, y: 0 }));
        //stage.insert(new Q.Enemy({ x: 800, y: 0 }));
        // Finally add in the tower goal
        stage.insert(new Q.Princess({ x: 180, y: 50 }));
    });
    // To display a game over / game won popup box,
    // create a endGame scene that takes in a `label` option
    // to control the displayed message.
    Q.scene('endGame', function (stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2, y: Q.height / 2, fill: "rgba(0,0,0,0.5)"
        }));
        var button = container.insert(new Q.UI.Button({
            x: 0, y: 0, fill: "#CCCCCC",
            label: "Play Again"
        }))
        var label = container.insert(new Q.UI.Text({
            x: 10, y: -10 - button.p.h,
            label: stage.options.label
        }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click", function () {
            Q.clearStages();
            Q.stageScene('level1');
        });
        6
        // Expand the container to visibily fit it's contents
        // (with a padding of 20 pixels)
        container.fit(20);
    });
 
*/
}
