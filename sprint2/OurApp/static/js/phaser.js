/**
 * @todo factorize meteor code into 1 object with functions
 * @todo add angle feature for meteor
 * @todo create varied meteor
 */

/**
 * @todo add doc
 */
function meteors(scene, meteor_key) {
  // private
  this.meteors = scene.physics.add.group();
  this.meteors_numbers = 1;
  this.min_angle = 0; // default is 0 as meteors fall straight down
  this.max_angle = 0;
  this.meteor_key = meteor_key;
  this.score = 0;
  this.bonus_score_scale = 1;
  this.meteor_start_range = {
    min_x: 0,
    max_x: 750,
    min_y: 0,
    max_y: 100,
  };

  // public
  const get_meteors = () => {
    return this.meteors;
  };
  const set_meteors = (meteors) => {
    this.meteors = meteors;
  };

  const get_meteor_key = () => {
    return this.meteor_key;
  };
  const set_meteor_key = (meteor_key) => {
    this.meteor_key = meteor_key;
  };

  const get_meteor_numbers = () => {
    return this.meteors_numbers;
  };
  const set_meteors_number = (meteors_numbers) => {
    this.meteors_numbers = meteors_numbers;
  };

  const get_angle = () => {
    return {
      min_angle: this.min_angle,
      max_angle: this.max_angle,
    };
  };
  const set_angle = (angle = { min_angle: 0, max_angle: 0 }) => {
    this.max_angle = angle.max_angle;
    this.min_angle = angle.min_angle;
  };

  const create_meteor = (meteor_max_scale) => {
    for (let index = 0; index < this.meteors_numbers; index++) {
      var meteor = this.meteors.create(
        Phaser.Math.Between(
          this.meteor_start_range.min_x,
          this.meteor_start_range.max_x
        ),
        Phaser.Math.Between(
          this.meteor_start_range.min_y,
          this.meteor_start_range.max_y
        ),
        this.meteor_key
      );
      meteor.angle = Phaser.Math.Between(this.min_angle, this.max_angle);
      meteor.setScale(Phaser.Math.FloatBetween(1, meteor_max_scale));
      // meteor.setBounce(0.5);
      meteor.setCollideWorldBounds(true);
    }
  };

  const move_meteor = (velocity) => {
    if (this.meteors.getChildren() != undefined) {
      this.meteors.getChildren().forEach((meteor) => {
        meteor.setVelocityX(
          Math.sin((meteor.angle * Math.PI) / 180) * velocity
        );
        meteor.setVelocityY(
          Math.cos((meteor.angle * Math.PI) / 180) * velocity
        );
      });
    }
  };

  return {
    get_angle,
    get_meteor_numbers,
    get_meteor_key,
    get_meteors,
    set_angle,
    set_meteors_number,
    set_meteor_key,
    set_meteors,
    create_meteor,
    move_meteor,
  };
}
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game",
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
var bonus_speed_scale = 1;
var bonus_score_scale = 1;
var bonus_invincible = false;
var bonus_type = ["speed", "score", "invincible"];
var cur_bonus = "";

// END OF CHANGING BONUS
var player;
var platforms;
var cursors;
var bombs;
var bomb_numbers = 2;
var bonus;
var score = 0;
var scoreText;
var gameOver = false;
var gameOverText;

var game = new Phaser.Game(config);
// support functions
function hitBomb(player, bomb) {
  if (!bonus_invincible) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play("turn");
    gameOver = true;
    gameOverText = this.add.text(300, 250, "Game Over!", {
      font: "30px Courier",
      fill: "#FFFFFF",
    });
    this.time.removeAllEvents();
  } else {
    bomb.destroy();
    score += bonus_score_scale;
    scoreText.setText("Current Score: " + score);
  }
}

function createBonus(bonusesGroup) {
  cur_bonus = bonus_type[Phaser.Math.Between(0, 2)];
  console.log(cur_bonus);
  var bonus = bonuses.create(Phaser.Math.Between(50, 750), 0, "star");
  bonus.setCollideWorldBounds(true);
  if (cur_bonus === "speed") {
    bonus.setTint(0xff2200);
  } else if (cur_bonus === "score") {
    bonus.setTint(0xff002);
  } else {
    bonus.setTint(0xccdd00);
  }
  return bonus;
}

// end of support functions

function preload() {
  console.log(this);
  this.load.image("sky", "../static/js/assets/sky.png");
  this.load.image("ground", "../static/js/assets/platform.png");
  this.load.image("bomb", "../static/js/assets/bomb.png");
  this.load.image("star", "../static/js/assets/star.png");
  this.load.spritesheet("player", "../static/js/assets/dude.png", {
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
  // bombs = this.physics.add.group();
  bombs = meteors(this, "bomb");
  bombs.set_angle({ min_angle: -30, max_angle: 30 });
  bombs.set_meteors_number(1);

  // Set timer to create new bombs every 1 second edit delay to change this
  this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: function () {
      bombs.create_meteor(meteor_max_scale);
    },
  });
  // test increase bomb number after every 5 seconds
  this.time.addEvent({
    delay: 5000,
    loop: true,
    callback: function () {
      bombs.set_meteors_number(bombs.get_meteor_numbers() + 1);
    },
  });

  // Create bonus group
  bonuses = this.physics.add.group();

  // Set timer to create new bonus every 10 second edit delay to change this
  /**
   * @todo change delay to 10s
   */
  this.time.addEvent({
    delay: 5000,
    loop: true,
    callback: function () {
      var bonus = createBonus(bonuses);
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
  this.physics.add.collider(player, bombs.get_meteors(), hitBomb, null, this);

// add text object to the game
let text = this.add.text(400, 300, '', { font: "30px Courier", fill: "#FFFFFF", });
text.setOrigin(0.5);

// collision between bonuses and player
this.physics.add.collider(player, bonuses, function (player, bonus) {
  player.setTint(bonus.tintTopLeft);
  bonus.destroy();
  start_reset = Date.now();
  if (cur_bonus === "speed") {
    bonus_speed_scale = 2;
    text.setText('Speed bonus activated!');
  } else if (cur_bonus === "score") {
    bonus_score_scale = 2;
    text.setText('Score bonus activated!');
  } else {
    bonus_invincible = true;
    text.setText('Invincibility bonus activated!');
  }
});


  // reset all CHANGING STUFF. This will start if any of them changes
  this.time.addEvent({
    delay: 100,
    loop: true,
    callback: function () {
      if (start_reset != 0 && Date.now() - start_reset >= 5000) {
        start_reset = 0;
        bonus_speed_scale = 1;
        bonus_score_scale = 1;
        bonus_invincible = false;
        cur_bonus = "";
        text.setText('');
        player.clearTint();
      }
    },
  });
  // Collision between bombs and platforms, destroy bomb and update score
  this.physics.add.collider(bombs.get_meteors(), platforms, function (bomb) {
    bomb.destroy();
    score += bonus_score_scale;
    scoreText.setText("Current Score: " + score);
  });

  this.physics.add.collider(bonuses, platforms, function (bonus) {
    bonus.destroy();
  });
}

function update() {
  // Player animations based on keyboard inputs
  if (!gameOver && cursors.left.isDown) {
    player.setVelocityX(-player_speed * bonus_speed_scale);
    player.anims.play("left", true);
  } else if (!gameOver && cursors.right.isDown) {
    player.setVelocityX(player_speed * bonus_speed_scale);
    player.anims.play("right", true);
  } else if (!gameOver) {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  // Collision between bonuses and platforms, destroy bonuses and update score
  bombs.move_meteor(500);

  // Check if the meteors hit the sides, act as hitting platform
  bombs
    .get_meteors()
    .getChildren()
    .forEach((bomb) => {
      if (
        !this.physics.world.bounds.contains(
          bomb.x + bomb.displayWidth / 2 + 1,
          bomb.y
        ) ||
        !this.physics.world.bounds.contains(
          bomb.x - bomb.displayWidth / 2 - 1,
          bomb.y
        )
      ) {
        bomb.destroy();
        score += bonus_score_scale;
        scoreText.setText("Current Score: " + score);
      }
    });
}
