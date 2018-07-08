// 元素
var container = document.getElementById('game');
var music = document.getElementById("bg-music");
var effect = document.getElementById("effect-music");
var gameAllSuccess = document.querySelector('.game-all-success');
var scoreText = document.querySelector('.game-info .score');
var totalScoreText = document.querySelector('.game-all-success .score');
var resultText = document.querySelector('.game-all-success .section-title');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

//设置画布宽度和高度
container.width = window.innerWidth;
container.height = window.innerHeight;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//获取画布相关信息
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

// 判断是否有 requestAnimationFrame 方法，如果有则模拟实现
window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 30);
  };

//随机生成方向
function randomDirection() {
  var left = 'left';
  var right = 'right';
  var direction = Math.round(Math.random());
  if (direction === 0) {
    direction = left;
  } else {
    direction = right;
  }
  console.log('direction', direction);
  return direction;
}

//返回结果
function famousMan(score) {
  var goalkeeper = '';
  var total = (CONFIG.numPerLine + CONFIG.totalLevel * CONFIG.numPerLine) * CONFIG.totalLevel / 2;
  if (0 <= score && score < total / 3) {
    goalkeeper = '中国队派来的卧底';
    gameAllSuccess.style.backgroundImage = 'url(./img/bg-end-1.png)';
  } else if (total / 3 <= score && score < total * 2 / 3) {
    goalkeeper = '冰岛门将哈尔多松';
    gameAllSuccess.style.backgroundImage = 'url(./img/bg-end-2.png)';
  } else if (total * 2 / 3 <= score && score < total) {
    goalkeeper = '英格兰门将皮克福德';
    gameAllSuccess.style.backgroundImage = 'url(./img/bg-end-3.png)';
  } else {
    goalkeeper = '全部扑中，获得金手套奖！';
    gameAllSuccess.style.backgroundImage = 'url(./img/bg-end-4.png)';
  }
  console.log('goalkeeper', goalkeeper);
  return goalkeeper;
}

/**
 * 整个游戏对象
 */
var GAME = {
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts 
   * @return {[type]}      [description]
   */
  init: function (opts) {
    //设置opts
    var opts = Object.assign({}, opts, CONFIG);//合并所有参数
    this.opts = opts;
    this.status = 'start';
    //计算飞机对象初始坐标
    this.planePosX = canvasWidth / 2 - opts.planeSize.width / 2;
    this.planePosY = canvasHeight - opts.planeSize.height - opts.canvasPadding;
    //飞机极限坐标
    this.planeMinX = opts.canvasPadding;
    this.planeMaxX = canvasWidth - opts.canvasPadding - opts.planeSize.width;
    this.planeMinY = opts.canvasPadding;
    this.planeMaxY = canvasHeight - opts.canvasPadding - opts.planeSize.height;
    //飞机触摸坐标
    this.newPlaneX = this.planePosX;
    this.newPlaneY = this.planePosY;
    //计算敌人移动区域
    this.enemyMinX = opts.canvasPadding;
    this.enemyMaxX = canvasWidth - opts.canvasPadding - opts.enemySize;

    //分数设置为0
    this.score = 0;
    this.enemies = [];

    this.bindEvent();
    this.bindTouchEvent();
  },
  bindTouchEvent: function () {
    var self = this;
    //飞机位置
    var newPlaneX = this.newPlaneX;
    var newPlaneY = this.newPlaneY;
    //手指初始位置坐标
    var startTouchX;
    var startTouchY;
    //飞机初始位置
    var startPlaneX;
    var startPlaneY;
    //首次触屏
    canvas.addEventListener('touchstart', function (e) {
      var plane = self.plane;
      //记录首次触摸位置
      startTouchX = e.touches[0].pageX;
      startTouchY = e.touches[0].pageY;
      //consol.log('touchstart', startTouchX, startTouchY);
      //记录飞机初始位置
      startPlaneX = plane.x;
      startPlaneY = plane.y;
    });
    //滑动触屏
    canvas.addEventListener('touchmove', function (e) {
      var newTouchX = e.touches[0].pageX;
      var newTouchY = e.touches[0].pageY;
      console.log('newTouch', newTouchX, newTouchY);
      //飞机新坐标=飞机起始坐标+飞手指滑动距离
      newPlaneX = startPlaneX + newTouchX - startTouchX;
      newPlaneY = startPlaneY + newTouchY - startTouchY;
      console.log('touchmove', newPlaneX, newPlaneY);
      if (newPlaneX < self.planeMinX) {
        newPlaneX = self.planeMinX;
      }
      if (newPlaneX > self.planeMaxX) {
        newPlaneX = self.planeMaxX;
      }
      if (newPlaneY < self.planeMinY) {
        newPlaneY = self.planeMinY;
      }
      if (newPlaneY > self.planeMaxY) {
        newPlaneY = self.planeMaxY;
      }
      self.plane.setPosition(newPlaneX, newPlaneY);
      //禁止默认事件，防止滚动屏幕
      e.preventDefault();
    });
  },
  bindEvent: function () {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    var replayBtn = document.querySelector('.js-replay');
    // 开始游戏按钮绑定
    playBtn.onclick = function () {
      self.start();
      music.play();
    };
    //重新开始游戏按钮绑定
    replayBtn.onclick = function () {
      self.opts.level = 1;
      self.start();
      self.score = 0;
      totalScoreText.innerText = self.score;
    };
  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * all-success 游戏通过
   * stop 游戏暂停（可选）
   */
  setStatus: function (status) {
    this.status = status;
    container.setAttribute('data-status', status);
  },
  //start  游戏前
  start: function () {
    var opts = this.opts;
    //创建飞机
    this.plane = new Plane({
      x: this.newPlaneX,
      y: this.newPlaneY,
      width: opts.planeSize.width,
      height: opts.planeSize.height,
      minX: this.planeMinX,
      speed: opts.planeSpeed,
      maxX: this.planeMaxX,
      status: 'normal',
      planeIcon: opts.planeIcon
    });
    //this.plane.shoot();
    this.playing();
  },
  //playing 游戏中
  playing: function () {
    this.setStatus('playing');
    //清空敌人
    this.enemies = [];
    //创建敌人
    this.createEnemy('normal');
    console.log(this.enemies);

    //console.log(this.planeMinX);
    this.updateElement();
  },
  //stop  游戏暂停
  stop: function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.setStatus('stop');
    return;
  },
  end: function (status) {
    var self = this;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.setStatus(status);
    totalScoreText.innerText = this.score;
    resultText.innerText = famousMan(self.score);
    return;
  },
  //更新所有元素状态
  updateElement: function () {
    var self = this;
    var opts = this.opts;
    var plane = this.plane;
    var enemies = this.enemies;
    if (plane.status === 'booming') {
      return;
    }
    //清理画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //绘制画布
    this.draw();

    if (enemies.length === 0) {
      if (opts.level === opts.totalLevel) {
        this.end('all-success');
      } else {
        this.opts.level += 1;
        this.playing();
      }
      return;
    }

    //更新元素状态
    this.updateEnemeis();

    //不断循环updateElement
    requestAnimationFrame(function () {
      if (self.status === 'stop') {
        return;
      } else {
        self.updateElement();
        rAF(loop);//计算FPS值
      }
    });
  },
  //更新敌人状态
  updateEnemeis: function () {
    var opts = this.opts;
    var plane = this.plane;
    //console.log('updateElement:plane',this.plane);
    //console.log('updateElement:this.opts',this.opts);
    var enemies = this.enemies;
    //console.log('updateElement:this.enemies',this.enemies);
    var i = enemies.length;

    //循环更新敌人
    while (i--) {
      var enemy = enemies[i];
      if (enemy.x < this.enemyMinX || enemy.x >= this.enemyMaxX) {
        enemy.enemyDirection = enemy.enemyDirection === 'right' ? 'left' : 'right';
      }
      enemy.down();
      enemy.direction(enemy.enemyDirection);
      switch (enemy.status) {
        case 'normal':
          if (plane.hasCrash(enemy)) {
            enemy.booming();
            effect.cloneNode().play();//会造成资源变大！
          }
          if (enemy.y >= canvasHeight) {
            enemies.splice(i, 1);
          }
          break;
        case 'booming':
          enemy.booming();
          break;
        case 'boomed':
          enemies.splice(i, 1);
          this.score += 1;
          break;
        default:
          break;
      }
    }
  },
  //生成敌人
  createEnemy: function (enemyType) {
    var opts = this.opts;
    var level = opts.level;
    var enemies = this.enemies;
    var numPerLine = opts.numPerLine;
    var padding = opts.canvasPadding;
    var gap = opts.enemyGap;
    var size = opts.enemySize;
    var speed = opts.enemySpeed;

    //每升级一关敌人多numPerLine个
    for (var i = 0; i < level * numPerLine; i++) {
      var initOpt = {
        x: parseInt(Math.random() * (canvasWidth - size - 0 + 1) + 0, 10),
        y: -parseInt(Math.random() * (canvasHeight - size - 0 + 1) + 0, 10),
        size: size,
        speed: Math.ceil(Math.random() * 10 + 3, 10),
        status: enemyType,
        enemyDirection: randomDirection(),
        enemyIcon: opts.enemyIcon,
        enemyBoomIcon: opts.enemyBoomIcon
      };
      console.log('initOpt.direction', initOpt.enemyDirection);
      console.log('enemies', enemies);
      enemies.push(new Enemy(initOpt));
    }
    return enemies;
  },
  draw: function () {
    this.renderScore();
    this.plane.draw();
    this.enemies.forEach(function (enemy) {
      //console.log('draw:this.enemy',enemy);
      enemy.draw();
    });
  },
  renderScore: function () {
    scoreText.innerText = this.score;
  }
};

// 初始化
GAME.init(CONFIG);
