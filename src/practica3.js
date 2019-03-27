//Código de la práctica 3

var game = function () {
    // Set up an instance of the Quintus engine and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the`TileLayer`class as well as the`2d`componet.
    var Q = window.Q = Quintus({
        development: true,
        imagesPath: "images/",
        audioPath: "audio/",
        dataPath: "data/",
    })
        .include("Scenes, Sprites, Input, UI, Touch")
        // Maximize this game to whatever the size of the browser is
        .setup({
            width: 320,
            height: 480,
        })
        // And turn on default input controls and touch input (for UI)
        .controls()
        .touch()
        .enableSound();

    /*  Quintus.Random = function (Q) {
          Q.random = function (min, max) {
              return min + Math.random() * (max - min);
          }
      };*/
    /*
        Q.preload("sprites.png");
            Q.preload([ "coin.mp3", "music_die.mp3", "music_level_complete.mp3", "music_main.mp3" ]);
            Q.preload(function() {
                // Go time
            });*/



    // ## Asset Loading and Game Launch
    // Q.load can be called at any time to load additional assets
    // assets that are already loaded will be skipped
    // The callback will be triggered when everything is loaded
    Q.load("bg.png", "bloopa.json", "bloopa.png", "coin.json", "coin.png", "goomba.json", "goomba.png",
        "mainTitle.png", "mario_small.json", "mario_small.png", "princess.png", "tiles.png",
        function () {
            // Sprites sheets can be created manually
            // Or from a .json asset that defines sprite locations
            Q.compileSheets("mario_small.png", "mario_small.json");
            Q.compileSheets("coin.png", "coin.json");
            Q.compileSheets("bloopa.png", "bloopa.json");
            Q.compileSheets("goomba.png", "goomba.json");
            // Finally, call stageScene to run the game

            //   Q.stageScene("level1");
        });

    /* Q.load("level.tmx", function(){
 
     });  
 */



    // ## Player Sprite
    // The very basic player sprite, this is just a normal sprite
    // using the player sprite sheet with default controls added to it.
    Q.Sprite.extend("Player", {
        // the init constructor is called on creation
        init: function (p) {
            // You can call the parent's constructor with this._super(..)
            this._super(p, {
                sheet: "player", // Setting a sprite sheet sets sprite width and height
                x: 410, // You can also set additional properties that can
                y: 90 // be overridden on object creation
            });
            // Add in pre-made components to get up and running quickly
            // The `2d` component adds in default 2d collision detection
            // and kinetics (velocity, gravity)
            // The `platformerControls` makes the player controllable by the
            // default input actions (left, right to move, up or action to jump)
            // It also checks to make sure the player is on a horizontal surface before
            // letting them jump.
            this.add('2d, platformerControls');
            // Write event handlers to respond hook into behaviors.

            // hit.sprite is called everytime the player collides with a sprite
            this.on("hit.sprite", function (collision) {
                // Check the collision, if it's the Tower, you win!
                if (collision.obj.isA("Tower")) {
                    Q.stageScene("endGame", 1, { label: "You Won!" });
                    this.destroy();
                }
            });
        }
    });

    var player1 = new Q.Player();

    // ## Tower Sprite
    // Sprites can be simple, the Tower sprite just sets a custom sprite sheet
    Q.Sprite.extend("Tower", {
        init: function (p) {
            this._super(p, { sheet: 'tower' });
        }
    });
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
        var player = stage.insert(new Q.Player());
        // Give the stage a moveable viewport and tell it
        // to follow the player.
        //Editar para que siga a Mario
        stage.add("viewport").follow(player);
        // Add in a couple of enemies
        stage.insert(new Q.Enemy({ x: 700, y: 0 }));
        stage.insert(new Q.Enemy({ x: 800, y: 0 }));
        // Finally add in the tower goal
        stage.insert(new Q.Tower({ x: 180, y: 50 }));
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
        // Expand the container to visibily fit it's contents
        // (with a padding of 20 pixels)
        container.fit(20);
    });





}
