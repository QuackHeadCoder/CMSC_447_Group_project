var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 300 },
        debug: false,
      },
    },
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
  };
  /* CONSTANT */
  // player
  const player_speed = 200;
  const player_framerate = 30;

  // meteor
  const meteor_max_scale = 4;

  /* END OF CONSTANT */

  // CHANGING BONUS
  var start_reset = 0;
  var end_reset = 0;
  var bonus_speed_cale = 1;

  // END OF CHANGING BONUS
  var player;
  var platforms;
  var cursors;
  var bombs;
  var bonus;
  var score = 0;
  var scoreText;

  var game = new Phaser.Game(config);
  function preload() {
    this.load.image("sky", "static/js/assets/sky.png");
    this.load.image("ground", "static/js/assets/platform.png");
    this.load.image("bomb", "static/js/assets/bomb.png");
    this.load.image("star", "static/js/assets/star.png");
    this.load.spritesheet("player", "static/js/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }
  function create() {
    this.add.image(400, 300, "sky");

    // Display Score at Start of Game
    scoreText = this.add.text(20, 20, "", {
      font: "16px Courier",
      fill: "#FFFFFF",
    });
    scoreText.setText("Current Score: " + score);

    // Create ground platform
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, "ground").setScale(2).refreshBody();

    // Create player
    player = this.physics.add.sprite(16, 450, "player");
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Create a group for bombs
    bombs = this.physics.add.group();

    // Set timer to create new bombs every 1 second edit delay to change this
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: function () {
        var bomb = bombs.create(Phaser.Math.Between(50, 750), 0, "bomb");
        bomb.setScale(Phaser.Math.FloatBetween(1, meteor_max_scale));
        bomb.setBounce(0.5);
        bomb.setCollideWorldBounds(true);
      },
    });

    // Create bonus group
    bonuses = this.physics.add.group();

    // Set timer to create new bombs every 1 second edit delay to change this
    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: function () {
        var bonus = bonuses.create(Phaser.Math.Between(50, 750), 0, "star");
        bonus.setScale(1);
        bonus.setCollideWorldBounds(true);
      },
    });

    //player movement animations
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 3,
      }),
      frameRate: player_framerate,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "player", frame: 4 }],
      frameRate: player_framerate,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", {
        start: 5,
        end: 8,
      }),
      frameRate: player_framerate,
      repeat: -1,
    });

    // Initialize keyboard inputs
    cursors = this.input.keyboard.createCursorKeys();

    // Add collision between player and ground platform
    this.physics.add.collider(player, platforms);

    // Add collision between player and bombs, end game if collision happens
    this.physics.add.collider(player, bombs, function (player, bomb) {
      bomb.destroy();
      player.destroy();
    });

    // collision between bonuses and player
    this.physics.add.collider(player, bonuses, function (player, bonus) {
      bonus.destroy();
      bonus_speed_cale = bonus_speed_cale * 2;
      start_reset = Date.now();
    });

    // reset all CHANGING STUFF. This will start if any of them changes
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: function () {
        if (start_reset != 0 && Date.now() - start_reset >= 5000) {
          start_reset = 0;
          bonus_speed_cale = 1;
        }
      },
    });
  }

  function update() {
    // Player animations based on keyboard inputs
    if (cursors.left.isDown) {
      player.setVelocityX(-player_speed*bonus_speed_cale);
      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(player_speed*bonus_speed_cale);
      player.anims.play("right", true);
    } else {
      player.setVelocityX(0);
      player.anims.play("turn");
    }

    // Collision between bombs and platforms, destroy bomb and update score
    this.physics.add.collider(bombs, platforms, function (bomb) {
      bomb.destroy();
      score += 1;
      scoreText.setText("Current Score: " + score);
    });

    // Collision between bonuses and platforms, destroy bonuses and update score
    this.physics.add.collider(bonuses, platforms, function (bonus) {
      bonus.destroy();
    });
  }