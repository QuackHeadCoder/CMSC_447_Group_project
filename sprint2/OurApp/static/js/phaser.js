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

  const sideHits = () => {
    let hit = 0;
    this.meteors.getChildren().forEach((meteor) => {
      if (
        !scene.physics.world.bounds.contains(
          meteor.x + meteor.displayWidth / 2 + 1,
          meteor.y
        ) ||
        !scene.physics.world.bounds.contains(
          meteor.x - meteor.displayWidth / 2 - 1,
          meteor.y
        )
      ) {
        meteor.destroy();
        hit++;
      }
    });
    return hit;
  };

  const move_meteor = (velocity) => {
    if (this.meteors.getChildren() !== undefined) {
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
    sideHits,
  };
}

function bonuses(scene, bonus_keys = ["star", "star", "star"]) {
  this.bonuses = scene.physics.add.group();
  this.bonus_keys = bonus_keys;
  this.bonus_types = ["speed", "score", "invincible"];
  this.cur_bonus = "";
  this.min_angle = 0; // default is 0 as bonuses fall straight down
  this.max_angle = 0;
  const get_bonuses = () => {
    return this.bonuses;
  };
  const set_bonuses = (bonuses) => {
    this.bonuses = bonuses;
  };
  // No set for bonus_types
  const get_bonus_types = () => {
    return this.bonus_types;
  };

  const get_bonus_keys = () => {
    return this.bonus_keys;
  };

  const set_bonus_keys = (bonus_keys) => {
    if (bonus_keys.length !== this.bonus_types.length) {
      console.error("mismatch bonus_keys length with bonus_types length\n");
      return;
    }
    this.bonus_keys = bonus_keys;
  };

  const get_cur_bonus = () => {
    return this.cur_bonus;
  };
  const set_cur_bonus = (cur_bonus) => {
    this.cur_bonus = cur_bonus;
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
  const createBonus = () => {
    let index = Phaser.Math.Between(0, this.bonus_types.length - 1);
    this.cur_bonus = this.bonus_types[index];
    let bonus_key = this.bonus_keys[index];
    // console.log(cur_bonus);
    var bonus = this.bonuses.create(Phaser.Math.Between(50, 750), 0, bonus_key);
    bonus.angle = Phaser.Math.Between(this.min_angle, this.max_angle);
    bonus.setCollideWorldBounds(true);
    if (this.cur_bonus === "speed") {
      bonus.setTint(0xff2200); // red
    } else if (this.cur_bonus === "score") {
      bonus.setTint(0xff002); //green
    } else {
      bonus.setTint(0xccdd00); //yellow
    }
    return bonus;
  };

  const move_bonus = (velocity) => {
    if (this.bonuses.getChildren() !== undefined) {
      this.bonuses.getChildren().forEach((bonus) => {
        bonus.setVelocityX(Math.sin((bonus.angle * Math.PI) / 180) * velocity);
        bonus.setVelocityY(Math.cos((bonus.angle * Math.PI) / 180) * velocity);
      });
    }
  };
  return {
    get_bonuses,
    set_bonuses,
    get_bonus_types,
    get_bonus_keys,
    set_bonus_keys,
    get_cur_bonus,
    set_cur_bonus,
    get_angle,
    set_angle,
    createBonus,
    move_bonus,
  };
}

function player(scene, start = { x: 20, y: 50 }, key) {
  this.player = scene.physics.add.sprite(start.x, start.y, key);
  this.speed = 200;
  this.frame_rate = 30;
  this.key = key;
  this.player.setBounce(0.2);
  this.player.setCollideWorldBounds(true);
  this.player.setOffset(8, 12);
  const get_player = () => {
    return this.player;
  };
  const set_player = (player) => {
    this.player = player;
  };
  const get_key = () => {
    return this.key;
  };
  const set_key = (key) => {
    this.key = key;
  };

  const get_speed = () => {
    return this.speed;
  };
  const set_speed = (speed) => {
    this.speed = speed;
  };

  const get_frame_rate = () => {
    return this.frame_rate;
  };

  const set_frame_rate = (frame_rate) => {
    this.frame_rate = frame_rate;
  };
  const moveX = (left, right) => {
    this.player.setVelocityX((right - left) * this.speed);
  };
  const moveY = (top, bottom) => {
    this.player.setVelocityY((bottom - top) * this.speed);
  };
  return {
    get_player,
    set_player,
    set_key,
    get_key,
    get_speed,
    set_speed,
    get_frame_rate,
    set_frame_rate,
    moveX,
    moveY,
  };
}

function score() {
  this.score = 0;
  this.speed_scale = 1;
  this.score_scale = 1;
  this.invincible = false;

  const set_score = (score = 0) => {
    this.score = score;
  };
  const get_score = () => {
    return this.score;
  };

  const set_speed_scale = (speed_scale = 1) => {
    this.speed_scale = speed_scale;
  };
  const get_speed_scale = () => {
    return this.speed_scale;
  };

  const set_score_scale = (score_scale = 1) => {
    this.score_scale = score_scale;
  };
  const get_score_scale = () => {
    return this.speed_scale;
  };

  const set_invincible = (invincible = false) => {
    this.invincible = invincible;
  };
  const get_invincible = () => {
    return this.invincible;
  };

  const increase_score = () => {
    this.score += this.score_scale;
  };

  const reset = () => {
    this.score_scale = 1;
    this.speed_scale = 1;
    this.invincible = false;
  };

  return {
    get_score,
    set_score,
    get_speed_scale,
    set_speed_scale,
    get_score_scale,
    set_score_scale,
    get_invincible,
    set_invincible,
    increase_score,
    reset,
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

var mplayer;
var platforms;
var cursors;
var bombs;
var bomb_numbers = 2;
var mbonuses;
var mscore;
var scoreText;
var gameOver = false;
var gameOverText;

var game = new Phaser.Game(config);
// support functions
function hitBomb(player, bomb) {
  if (!mscore.get_invincible()) {
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
    // score += bonus_score_scale;
    mscore.increase_score();
    scoreText.setText("Current Score: " + mscore.get_score());
  }
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
  mscore = score();
  // Display Score at Start of Game
  scoreText = this.add.text(20, 20, "", {
    font: "16px Courier",
    fill: "#FFFFFF",
  });
  scoreText.setText("Current Score: " + mscore.get_score());

  // Create ground platform
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();
  platforms.getChildren()[0].setOffset(0, 12);

  // Create player
  // player = this.physics.add.sprite(16, 450, "player");
  // player.setBounce(0.2);
  // player.setCollideWorldBounds(true);
  mplayer = player(this, { x: 16, y: 450 }, "player");

  // Create a group for bombs
  // bombs = this.physics.add.group();
  bombs = meteors(this, "bomb");
  bombs.set_angle({ min_angle: -10, max_angle: 10 });
  bombs.set_meteors_number(4);

  // Set timer to create new bombs every 1 second edit delay to change this
  this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: function () {
      bombs.create_meteor(meteor_max_scale);
    },
  });
  // test increase bomb number after every 5 seconds
  // this.time.addEvent({
  //   delay: 5000,
  //   loop: true,
  //   callback: function () {
  //     bombs.set_meteors_number(bombs.get_meteor_numbers() + 1);
  //   },
  // });

  // Create bonus group
  mbonuses = bonuses(this);
  mbonuses.set_angle({ min_angle: -30, max_angle: 30 });

  // Set timer to create new bonus every 10 second edit delay to change this
  /**
   * @todo change delay to 10s
   */
  this.time.addEvent({
    delay: 5000,
    loop: true,
    callback: function () {
      mbonuses.createBonus();
    },
  });

  //player movement animations
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers(mplayer.get_key(), {
      start: 0,
      end: 3,
    }),
    frameRate: mplayer.get_frame_rate(),
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: mplayer.get_key(), frame: 4 }],
    frameRate: mplayer.get_frame_rate(),
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers(mplayer.get_key(), {
      start: 5,
      end: 8,
    }),
    frameRate: mplayer.get_frame_rate(),
    repeat: -1,
  });

  // Initialize keyboard inputs
  cursors = this.input.keyboard.createCursorKeys();

  // Add collision between player and ground platform
  this.physics.add.collider(mplayer.get_player(), platforms);

  // Add collision between player and bombs, end game if collision happens
  this.physics.add.collider(
    mplayer.get_player(),
    bombs.get_meteors(),
    hitBomb,
    null,
    this
  );

  // add text object to the game
  let text = this.add.text(400, 300, "", {
    font: "30px Courier",
    fill: "#FFFFFF",
  });
  text.setOrigin(0.5);

  // collision between bonuses and player
  this.physics.add.collider(
    mplayer.get_player(),
    mbonuses.get_bonuses(),
    function (player, bonus) {
      player.setTint(bonus.tintTopLeft);
      bonus.destroy();
      start_reset = Date.now();
      if (mbonuses.get_cur_bonus() === "speed") {
        // bonus_speed_scale = 2;
        mscore.set_speed_scale(2);
        text.setText("Speed bonus activated!");
      } else if (mbonuses.get_cur_bonus() === "score") {
        // bonus_score_scale = 2;
        mscore.set_score_scale(2);
        text.setText("Score bonus activated!");
      } else {
        // bonus_invincible = true;
        mscore.set_invincible(true);
        text.setText("Invincibility bonus activated!");
      }
    }
  );

  // reset all CHANGING STUFF. This will start if any of them changes
  this.time.addEvent({
    delay: 10,
    loop: true,
    callback: function () {
      if (start_reset != 0 && Date.now() - start_reset >= 5000) {
        start_reset = 0;
        mscore.reset();
        mbonuses.set_cur_bonus("");
        text.setText("");
        mplayer.get_player().clearTint();
      }
    },
  });
  // Collision between bombs and platforms, destroy bomb and update score
  this.physics.add.collider(bombs.get_meteors(), platforms, function (bomb) {
    bomb.destroy();
    mscore.increase_score();
    scoreText.setText("Current Score: " + mscore.get_score());
  });

  this.physics.add.collider(
    mbonuses.get_bonuses(),
    platforms,
    function (bonus) {
      bonus.destroy();
    }
  );
}

function update() {
  // Player animations based on keyboard inputs
  if (!gameOver && cursors.left.isDown) {
    mplayer.moveX(mscore.get_speed_scale(), 0);
    mplayer.get_player().anims.play("left", true);
  } else if (!gameOver && cursors.right.isDown) {
    mplayer.moveX(0, mscore.get_speed_scale());
    mplayer.get_player().anims.play("right", true);
  } else if (!gameOver) {
    mplayer.moveX(0, 0);
    mplayer.get_player().anims.play("turn");
  }

  // Collision between bonuses and platforms, destroy bonuses and update score
  mbonuses.move_bonus(200);
  bombs.move_meteor(500);

  // score += bombs.sideHits();
  mscore.set_score(
    mscore.get_score() + bombs.sideHits() * mscore.get_score_scale()
  );
  scoreText.setText("Current Score: " + mscore.get_score());
}
