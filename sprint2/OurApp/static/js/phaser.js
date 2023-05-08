/**
 * @todo factorize meteor code into 1 object with functions
 * @todo add angle feature for meteor
 * @todo create varied meteor
 */

/**
 * @todo add doc/API call to request user information
 * @todo when game is finished it should make a PUT request to update user information
 */

//for API get/put calls
url = "http://127.0.0.1:5000/";

var playerData = null;
/**
 * Getting user data
 * null otherwise
 **/
async function getData() {
  //attempts to get data
  try {
    response = await fetch(url + "get");
    jsonData = await response.json();
    let id = jsonData["id"];
    let username = jsonData["username"];
    let password = jsonData["password"];
    let currentLevel = jsonData["currentLevel"];
    let topScore = jsonData["topScore"];
    playerData = { id, username, password, currentLevel, topScore };
    return playerData;
  } catch (error) {
    //catches error if user is not currently logged in
    return null;
  }
}

/**
 * Update user will only take in current level and top score values
 * If top score is not changed then we just ignore and return null
 **/
async function updateUser(currentLevel, topScore) {
  //get data, if no data is loaded we quit
  data = await getData();
  if (data == null) return null;

  //if top score does not need to be updated we quit
  if (topScore <= data["topScore"]) return null;

  data["currentLevel"] = currentLevel;
  data["topScore"] = topScore;

  //data packet that needs to be sent
  const response = await fetch(url + "api/update_user", {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  //simple logging of response
  const ret = await response;
  console.log(ret);
  return ret;
}
/*
A simple example on how to use the get Data function
As well as how to update User
Delete this when to reduce console logs
*/
async function test() {
  //since it is async it needs an await call to wait for the response from the server
  //then once it is stored we can manipulate the data in which way we want such as printing out the id
  data = await getData();
  console.log(data["currentLevel"]);

  //updates user level,score
  updateUser(3, 15);
  data = await getData();
  console.log(data["currentLevel"]);
}
test();

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

  const destroy_all = () => {
    this.meteors.destroy();
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
    destroy_all,
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
  this.invincible = false;
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

  const isInvincible = () => {
    return this.invincible;
  };
  const set_invincible = (invincible) => {
    if (typeof invincible === "boolean") {
      this.invincible = invincible;
    } else {
      this.invincible = false;
    }
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
    isInvincible,
    set_invincible,
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
};
/* CONSTANT */

// meteor
const meteor_max_scale = 4;
const level1scenekey = "level1Scene";
const level2scenekey = "level2Scene";
const level3scenekey = "level3Scene";

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
var level2 = false;
var level3 = false;
var nextLevelText = "";

// support functions
function hitBomb(player, bomb) {
  if (!mscore.get_invincible()) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play("dead");
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
/*Preload anything needed for all scenes here */
// function preload() {
//   console.log(this);
//   this.load.image("sky", "../static/js/assets/sky.png");
//   this.load.image("ground", "../static/js/assets/platform.png");
//   this.load.image("bomb", "../static/js/assets/bomb.png");
//   this.load.image("star", "../static/js/assets/star.png");
//   this.load.image("night", "../static/js/assets/level2night.webp");
//   this.load.image("level2ground", "../static/js/assets/emptyplatform.png");
//   this.load.image("level2platform", "../static/js/assets/level2platform.png");
//   this.load.spritesheet("player", "../static/js/assets/dude.png", {
//     frameWidth: 32,
//     frameHeight: 48,
//   });
//   this.load.audio("gaming_music", ["../static/js/assets/hey_ya.mp3"]);

//   //Progress bar

//   //creating box and bar and some coloring
//   var progressBar = this.add.graphics();
//   var progressBox = this.add.graphics();
//   progressBox.fillStyle(0x222222, 0.8);
//   progressBox.fillRect(240, 270, 320, 50);

//   //adjusting dimensions
//   var width = this.cameras.main.width;
//   var height = this.cameras.main.height;
//   var loadingText = this.make.text({
//     x: width / 2,
//     y: height / 2 - 50,
//     text: "Loading...",
//     style: {
//       font: "20px monospace",
//       fill: "#000000",
//     },
//   });
//   loadingText.setOrigin(0.5, 0.5);

//   var percentText = this.make.text({
//     x: width / 2,
//     y: height / 2 - 5,
//     text: "0%",
//     style: {
//       font: "18px monospace",
//       fill: "#ffffff",
//     },
//   });
//   percentText.setOrigin(0.5, 0.5);

//   var assetText = this.make.text({
//     x: width / 2,
//     y: height / 2 + 50,
//     text: "",
//     style: {
//       font: "18px monospace",
//       fill: "#ffffff",
//     },
//   });
//   assetText.setOrigin(0.5, 0.5);

//   //setting value of progress bar and to be placed in the bar
//   this.load.on("progress", function (value) {
//     percentText.setText(parseInt(value * 100) + "%");
//     progressBar.clear();
//     progressBar.fillStyle(0xffffff, 1);
//     progressBar.fillRect(250, 280, 300 * value, 30);
//   });

//   //setting value of asset loading to be placed under bar
//   this.load.on("fileprogress", function (file) {
//     assetText.setText("Loading asset: " + file.key);
//   });

//   //simple cleanup
//   this.load.on("complete", function () {
//     progressBar.destroy();
//     progressBox.destroy();
//     loadingText.destroy();
//     percentText.destroy();
//     assetText.destroy();
//   });
// }
/*LEVEL 1 CODE BEGINS */
function create() {}

function update() {
  this.scene.start(level1scenekey);
}

/* LEVEL 1 CODE ENDS */
var level1Scene = new Phaser.Scene(level1scenekey);

level1Scene.preload = function () {
  console.log(this);
  this.load.image("sky", "../static/js/assets/sky.png");
  this.load.image("ground", "../static/js/assets/platform.png");
  this.load.image("bomb", "../static/js/assets/bomb.png");
  this.load.image("star", "../static/js/assets/star.png");
  this.load.image("night", "../static/js/assets/level2night.webp");
  this.load.image("level2ground", "../static/js/assets/emptyplatform.png");
  this.load.image("level2platform", "../static/js/assets/level2platform.png");
  this.load.spritesheet("default", "../static/js/assets/players/defaultSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("player", "../static/js/assets/players/basketballSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("cdawg", "../static/js/assets/players/cdawgSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("djsang", "../static/js/assets/players/djsangSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("duck", "../static/js/assets/players/duckSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("pig", "../static/js/assets/players/pigSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.audio("gaming_music", ["../static/js/assets/hey_ya.mp3"]);

  //Progress bar

  //creating box and bar and some coloring
  var progressBar = this.add.graphics();
  var progressBox = this.add.graphics();
  progressBox.fillStyle(0x222222, 0.8);
  progressBox.fillRect(240, 270, 320, 50);

  //adjusting dimensions
  var width = this.cameras.main.width;
  var height = this.cameras.main.height;
  var loadingText = this.make.text({
    x: width / 2,
    y: height / 2 - 50,
    text: "Loading...",
    style: {
      font: "20px monospace",
      fill: "#000000",
    },
  });
  loadingText.setOrigin(0.5, 0.5);

  var percentText = this.make.text({
    x: width / 2,
    y: height / 2 - 5,
    text: "0%",
    style: {
      font: "18px monospace",
      fill: "#ffffff",
    },
  });
  percentText.setOrigin(0.5, 0.5);

  var assetText = this.make.text({
    x: width / 2,
    y: height / 2 + 50,
    text: "",
    style: {
      font: "18px monospace",
      fill: "#ffffff",
    },
  });
  assetText.setOrigin(0.5, 0.5);

  //setting value of progress bar and to be placed in the bar
  this.load.on("progress", function (value) {
    percentText.setText(parseInt(value * 100) + "%");
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(250, 280, 300 * value, 30);
  });

  //setting value of asset loading to be placed under bar
  this.load.on("fileprogress", function (file) {
    assetText.setText("Loading asset: " + file.key);
  });

  //simple cleanup
  this.load.on("complete", function () {
    progressBar.destroy();
    progressBox.destroy();
    loadingText.destroy();
    percentText.destroy();
    assetText.destroy();
  });
};
level1Scene.create = function () {
  //music
  music = this.sound.add("gaming_music", { loop: true, volume: 0.1 });
  music.play();

  this.add.image(400, 300, "sky");
  // mscore = score();
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
  mplayer = player(this, { x: 200, y: 450 }, "player");

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
      if (!level2) {
        bombs.create_meteor(meteor_max_scale);
      }
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
      if (!level2) {
        mbonuses.createBonus();
      }
    },
  });

  this.physics.add.collider(
    mplayer.get_player(),
    bombs.get_meteors(),
    hitBomb,
    null,
    this
  );
  
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
    frames: this.anims.generateFrameNumbers(mplayer.get_key(), {
      start: 4,
      end: 7,
    }),
    frameRate: mplayer.get_frame_rate()/2,
    repeat: -1,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers(mplayer.get_key(), {
      start: 8,
      end: 11,
    }),
    frameRate: mplayer.get_frame_rate(),
    repeat: -1,
  });

  this.anims.create({
    key: "dead",
    frames: [{ key: mplayer.get_key(), frame: 7 }],
    frameRate: mplayer.get_frame_rate(),
  });

  // Initialize keyboard inputs
  cursors = this.input.keyboard.createCursorKeys();

  // Add collision between player and ground platform
  this.physics.add.collider(mplayer.get_player(), platforms);

  // Add collision between player and bombs, end game if collision happens
  this.physics.add.collider(mplayer, bombs.get_meteors(), hitBomb, null, this);

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
        mplayer.set_invincible(true);
        text.setText("Invincibility bonus activated!");
      }
    }
  );

  // reset all CHANGING STUFF. This will start if any of them changes
  this.time.addEvent({
    delay: 10,
    loop: true,
    callback: function () {
      if (!level2) {
        if (start_reset != 0 && Date.now() - start_reset >= 5000) {
          start_reset = 0;
          mscore.reset();
          mbonuses.set_cur_bonus("");
          text.setText("");
          mplayer.get_player().clearTint();
          mplayer.set_invincible(false);
        }
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
};

level1Scene.update = function () {
  if (level2) {
    //show text to player for 2 seconds then start next level!
    nextLevelText = this.add.text(250, 250, "Level 1 Completed!", {
      font: "30px Courier",
      fill: "#FFFFFF",
    });

    this.time.delayedCall(
      1500,
      function () {
        nextLevelText = "";
        this.scene.start(level2scenekey);
      },
      [],
      this
    );
  }
  // Player animations based on keyboard inputs
  if (!gameOver && cursors.left.isDown) {
    mplayer.moveX(mscore.get_speed_scale(), 0);
    mplayer.get_player().anims.play("left", true);
  } else if (!gameOver && cursors.right.isDown) {
    mplayer.moveX(0, mscore.get_speed_scale());
    mplayer.get_player().anims.play("right", true);
  } else if (!gameOver) {
    mplayer.moveX(0, 0);
    mplayer.get_player().anims.play("turn", true);
  }

  // Collision between bonuses and platforms, destroy bonuses and update score
  mbonuses.move_bonus(200);
  bombs.move_meteor(500);

  // score += bombs.sideHits();
  mscore.set_score(
    mscore.get_score() + bombs.sideHits() * mscore.get_score_scale()
  );
  if (mscore.get_score() >= 20) {
    level2 = true;
    // bombs.destroy_all();
  }
};

/* LEVEL 2 CODE BEGINS*/
var level2Scene = new Phaser.Scene(level2scenekey);

level2Scene.create = function () {
  this.time.timeScale = 1;
  this.add.image(400, 300, "night").setScale(2);
  // Display Score at Start of Game
  scoreText = this.add.text(20, 20, "", {
    font: "16px Courier",
    fill: "#FFFFFF",
  });
  this.player = mplayer;
  scoreText.setText("Current Score: " + mscore.get_score());

  platforms = this.physics.add.staticGroup();
  platforms.create(400, 725, "level2ground").setScale(2).refreshBody();
  platforms.getChildren()[0].setOffset(0, 12);

  level2platforms = this.physics.add.staticGroup();
  level2platforms.create(0, 300, "level2platform").setScale(1).refreshBody();
  level2platforms.create(750, 300, "level2platform").setScale(1).refreshBody();
  level2platforms.getChildren()[0].setOffset(0, 12);

  mplayer.set_player(this.physics.add.sprite(16, 450, "player"));
  // level2 has increase player speed
  mplayer.set_speed(500);
  bombs.set_meteors(this.physics.add.group());
  bombs.set_angle({ min_angle: -10, max_angle: 10 });
  bombs.set_meteors_number(4);
  mplayer.get_player().setGravityY(300);
  mplayer.get_player().setCollideWorldBounds(true);

  // Create bonus group
  mbonuses.set_bonuses(this.physics.add.group());
  mbonuses.set_angle({ min_angle: -30, max_angle: 30 });
  // time event for creating meteor
  this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: function () {
      bombs.create_meteor(meteor_max_scale);
    },
  });
  // time event are creating bonuses
  this.time.addEvent({
    delay: 5000,
    loop: true,
    callback: function () {
      mbonuses.createBonus();
    },
  });

  // Add collision between player and bombs, end game if collision happens

  this.physics.add.collider(
    mplayer.get_player(),
    bombs.get_meteors(),
    hitBomb,
    null,
    this
  );

  this.anims.create({
    key: "up",
    frames: [{ key: mplayer.get_key(), frame: 4 }],
    frameRate: mplayer.get_frame_rate(),
  });

  cursors = this.input.keyboard.createCursorKeys();

  // Add collision between player and ground platform
  this.physics.add.collider(mplayer.get_player(), platforms);
  this.physics.add.collider(mplayer.get_player(), level2platforms);
  this.physics.add.collider(mbonuses.get_bonuses(), level2platforms);
  // Collision between bombs and platforms, destroy bomb and update score
  this.physics.add.collider(bombs.get_meteors(), platforms, function (bomb) {
    bomb.destroy();
    mscore.increase_score();
    scoreText.setText("Current Score: " + mscore.get_score());
  });

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

  this.time.addEvent({
    delay: 10,
    loop: true,
    callback: function () {
      if (start_reset != 0 && Date.now() - start_reset >= 5000) {
        start_reset = 0;
        mscore.reset();
        mplayer.set_invincible(false);
        mbonuses.set_cur_bonus("");
        text.setText("");
        mplayer.get_player().clearTint();
      }
    },
  });

  this.physics.add.collider(
    mbonuses.get_bonuses(),
    platforms,
    function (bonus) {
      bonus.destroy();
    }
  );
};

level2Scene.update = function () {
  if (level3) {
    //show text to player for 2 seconds then start next level!
    nextLevelText = this.add.text(250, 250, "Level 2 Completed!", {
      font: "30px Courier",
      fill: "#FFFFFF",
    });

    this.time.delayedCall(
      1500,
      function () {
        nextLevelText = "";
        this.scene.start("level3Scene");
      },
      [],
      this
    );
  }
  // Player animations based on keyboard inputs
  if (!gameOver && cursors.left.isDown) {
    mplayer.moveX(mscore.get_speed_scale(), 0);
    mplayer.get_player().anims.play("left", true);
  } else if (!gameOver && cursors.right.isDown) {
    mplayer.moveX(0, mscore.get_speed_scale());
    mplayer.get_player().anims.play("right", true);
  } else if (
    !gameOver &&
    cursors.up.isDown &&
    (mplayer.get_player().body.onFloor() ||
      mplayer.get_player().body.touching.down)
  ) {
    mplayer.get_player().setVelocityY(-600);
    mplayer.get_player().anims.play("up", true);
  } else if (!gameOver) {
    mplayer.moveX(0, 0);
    mplayer.get_player().anims.play("turn", true);
  }

  // speeds up how fast the objects fall
  mbonuses.move_bonus(300);
  bombs.move_meteor(300);

  if (mscore.get_score() == 50) {
    level3 = true;
  }
};

// END OF LEVEL 2 CODE

/* LEVEL 3 CODE BEGINS*/
var level3Scene = new Phaser.Scene("level3Scene");

level3Scene.preload = function () {
  this.load.image("sky", "../static/js/assets/sky.png");
  this.load.image("ground", "../static/js/assets/platform.png");
  this.load.image("bomb", "../static/js/assets/bomb.png");
  this.load.image("star", "../static/js/assets/star.png");
  this.load.image("night", "../static/js/assets/level2night.webp");
  this.load.image("level3ground", "../static/js/assets/emptyplatform.png");
  this.load.image("level3platform", "../static/js/assets/level2platform.png");
  this.load.spritesheet("default", "../static/js/assets/players/defaultSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("player", "../static/js/assets/players/basketballSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("cdawg", "../static/js/assets/players/cdawgSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("djsang", "../static/js/assets/players/djsangSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("duck", "../static/js/assets/players/duckSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.spritesheet("pig", "../static/js/assets/players/pigSprite.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  this.load.audio("gaming_music", ["../static/js/assets/hey_ya.mp3"]);
};

level3Scene.create = function () {
  music = this.sound.add("gaming_music", { loop: true, volume: 0.5 });
  music.play();

  this.time.timeScale = 1;
  this.add.image(400, 300, "night").setScale(2);
  // Display Score at Start of Game
  scoreText = this.add.text(20, 20, "", {
    font: "16px Courier",
    fill: "#FFFFFF",
  });
  this.player = mplayer;

  scoreText.setText("Current Score: " + mscore.get_score());

  ground = this.physics.add.staticGroup();
  ground.create(400, 725, "level3ground").setScale(2).refreshBody();
  ground.getChildren()[0].setOffset(0, 12);

  level3platforms = this.physics.add.staticGroup();
  level3platforms.create(0, 300, "level3platform").setScale(1).refreshBody();
  level3platforms.create(750, 300, "level3platform").setScale(1).refreshBody();
  level3platforms.getChildren()[0].setOffset(0, 12);

  // mplayer.set_player(this.physics.add.sprite(16, 450, "player"));
  mplayer = player(this, { x: 100, y: 400 }, "player");
  // level2 has increase player speed
  mplayer.set_speed(500);
  bombs = meteors(this, "bomb");
  // bombs.set_meteors(this.physics.add.group());
  bombs.set_angle({ min_angle: -10, max_angle: 10 });
  bombs.set_meteors_number(4);
  mplayer.get_player().setGravityY(300);
  mplayer.get_player().setCollideWorldBounds(true);

  // Create bonus group
  mbonuses = bonuses(this);
  mbonuses.set_bonuses(this.physics.add.group());
  mbonuses.set_angle({ min_angle: -30, max_angle: 30 });
  // time event for creating meteor
  this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: function () {
      bombs.create_meteor(meteor_max_scale);
    },
  });
  // time event are creating bonuses
  this.time.addEvent({
    delay: 5000,
    loop: true,
    callback: function () {
      mbonuses.createBonus();
    },
  });

  // Add collision between player and bombs, end game if collision happens
  this.physics.add.collider(
    mplayer.get_player(),
    bombs.get_meteors(),
    hitBomb,
    null,
    this
  );
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
    frames: this.anims.generateFrameNumbers(mplayer.get_key(), {
      start: 4,
      end: 7,
    }),
    frameRate: mplayer.get_frame_rate(),
    repeat: -1,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers(mplayer.get_key(), {
      start: 8,
      end: 11,
    }),
    frameRate: mplayer.get_frame_rate(),
    repeat: -1,
  });

  this.anims.create({
    key: "up",
    frames: [{ key: mplayer.get_key(), frame: 4 }],
    frameRate: mplayer.get_frame_rate(),
  });
  
  this.anims.create({
    key: "dead",
    frames: [{ key: mplayer.get_key(), frame: 7 }],
    frameRate: mplayer.get_frame_rate(),
  });

  cursors = this.input.keyboard.createCursorKeys();

  // Add collision between player and ground platform
  this.physics.add.collider(mplayer.get_player(), ground);
  this.physics.add.collider(mplayer.get_player(), level3platforms);
  this.physics.add.collider(mbonuses.get_bonuses(), level3platforms);
  // Collision between bombs and platforms, destroy bomb and update score
  this.physics.add.collider(bombs.get_meteors(), ground, function (bomb) {
    bomb.destroy();
    mscore.increase_score();
    scoreText.setText("Current Score: " + mscore.get_score());
  });

  // add text object to the game
  let text = this.add.text(400, 300, "", {
    font: "30px Courier",
    fill: "#FFFFFF",
  });
  text.setOrigin(0.5);
  // collision between bonuses and player
  this.physics.add.collider(
    mplayer,
    mbonuses.get_bonuses(),
    function (player, bonus) {
      player.get_player().setTint(bonus.tintTopLeft);
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
        play.set_invincible(true);
        text.setText("Invincibility bonus activated!");
      }
    }
  );

  this.time.addEvent({
    delay: 10,
    loop: true,
    callback: function () {
      if (start_reset != 0 && Date.now() - start_reset >= 5000) {
        start_reset = 0;
        mscore.reset();
        mbonuses.set_cur_bonus("");
        text.setText("");
        mplayer.set_invincible(false);
        mplayer.get_player().clearTint();
      }
    },
  });

  this.physics.add.collider(mbonuses.get_bonuses(), ground, function (bonus) {
    bonus.destroy();
  });
};

level3Scene.update = function () {
  // Player animations based on keyboard inputs
  if (!gameOver && cursors.left.isDown) {
    mplayer.moveX(mscore.get_speed_scale(), 0);
    mplayer.get_player().anims.play("left", true);
  } else if (!gameOver && cursors.right.isDown) {
    mplayer.moveX(0, mscore.get_speed_scale());
    mplayer.get_player().anims.play("right", true);
  } else if (
    !gameOver &&
    cursors.up.isDown &&
    (mplayer.get_player().body.onFloor() ||
      mplayer.get_player().body.touching.down)
  ) {
    mplayer.get_player().setVelocityY(-600);
    mplayer.get_player().anims.play("up", true);
  } else if (!gameOver) {
    mplayer.moveX(0, 0);
    mplayer.get_player().anims.play("turn", true);
  }

  // speeds up how fast the objects fall
  mbonuses.move_bonus(300);
  bombs.move_meteor(600);
};

// END OF LEVEL 3 CODE

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
  scene: [level1Scene, level2Scene, level3Scene],
};

mscore = score();
var game = new Phaser.Game(config);
