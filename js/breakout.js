;
(function () {
  if (typeof BreakOut === 'undefined') {
    window.BreakOut = {}
  }

  var Coordinate = BreakOut.Coordinate = function (x, y) {
    this.x = x;
    this.y = y;
  }

  Coordinate.prototype.plus = function (coord) {
      return new BreakOut.Coordinate(this.x + coord.x, this.y + coord.y);
  }

  var Ball = BreakOut.Ball = function (options) {
    // ball actually renders as square
    options = options || {};

    this.game = options.game
    this.size = options.size || 8;
    this.topLeftCoord = new Coordinate(
      Math.floor(this.game.screenWidth / 2 - this.size / 2),
      Math.floor(this.game.screenHeight - 25)
    );
    this.bottomRightCoord = new Coordinate(
      this.topLeftCoord.x + this.size,
      this.topLeftCoord.y + this.size
    );
    this.dx = 1;
    this.dy = 1;
  }

  Ball.prototype.move = function () {
    if (this.bottomRightCoord.x + this.dx > this.game.screenWidth ||
        this.topLeftCoord.x + this.dx < 0) {
          this.dx = -this.dx;
        }

    var paddle = this.game.paddle;
    var ball = this;

    if (ball.topLeftCoord.y < 0) {
      this.dy = -this.dy;
    } else if (!(ball.bottomRightCoord.y + ball.dy < paddle.topLeftCoord.y) &&
               !(ball.topLeftCoord.y + ball.dy > paddle.bottomRightCoord.y) &&
               !(ball.bottomRightCoord.x + ball.dx < paddle.topLeftCoord.x) &&
               !(ball.topLeftCoord.x + ball.dx > paddle.bottomRightCoord.x)) {
      this.dy = -this.dy;

      //scale dx by position on paddle hit
      var ballCenterX = ball.topLeftCoord.x + (ball.size / 2);
      var paddleCenterX = paddle.topLeftCoord.x + (paddle.width / 2);
      var pctFrmCenter = (Math.abs(ballCenterX - paddleCenterX) / (paddle.width / 2));

      var sign = this.dx < 0 ? -1 : 1;
      this.dx = sign * pctFrmCenter * 4;
      ball.bottomRightCoord.y = paddle.topLeftCoord.y - 1;
      ball.topLeftCoord.y = ball.bottomRightCoord.y - ball.size;
    } else if (ball.bottomRightCoord.y > this.game.screenHeight) {
      this.game.lives -= 1;
      this.game.reset(false);
    }
    this.topLeftCoord.x += this.dx;
    this.bottomRightCoord.x += this.dx;

    this.topLeftCoord.y += this.dy;
    this.bottomRightCoord.y += this.dy;
  }

  Ball.prototype.render = function (ctx) {
    if (ctx) {
      ctx.beginPath();
      ctx.rect(this.topLeftCoord.x, this.topLeftCoord.y, this.size, this.size);
      ctx.closePath();
      ctx.fill();
    }
  }

  var Paddle = BreakOut.Paddle = function (options) {
    options = options || {};

    this.game = options.game;
    this.width = 80;
    this.height = 10;

    this.topLeftCoord = new Coordinate(
      (this.game.screenWidth / 2) - (this.width / 2),
      this.game.screenHeight - this.height
    );
    this.bottomRightCoord = new BreakOut.Coordinate(
      this.topLeftCoord.x + this.width,
      this.topLeftCoord.y + this.height
    );
  }

  Paddle.prototype.render = function (ctx) {
    if (ctx) {
      ctx.beginPath();
      ctx.rect(this.topLeftCoord.x, this.topLeftCoord.y, this.width, this.height);
      ctx.closePath();
      ctx.fill();
    }
  }

  Paddle.prototype.moveRight = function (isMoving) {
    this._moveRight = isMoving;
  }

  Paddle.prototype.moveLeft = function (isMoving) {
    this._moveLeft = isMoving;
  }

  Paddle.prototype.move = function () {
    if (this._moveRight &&
        this.bottomRightCoord.x < this.game.screenWidth) {
      this.topLeftCoord.x += 4;
      this.bottomRightCoord.x += 4;
    } else if (this._moveLeft &&
               this.topLeftCoord.x > 0) {
      this.topLeftCoord.x -= 4;
      this.bottomRightCoord.x -= 4;
    }
  }

  var Brick = BreakOut.Brick = function (topLeftCoord, bottomRightCoord) {
    this.topLeftCoord = topLeftCoord;
    this.bottomRightCoord = bottomRightCoord;
    this.isBroken = false;
  }

  Brick.prototype.width = function () {
    return this.bottomRightCoord.x - this.topLeftCoord.x;
  }

  Brick.prototype.height = function () {
    return this.bottomRightCoord.y - this.topLeftCoord.y;
  }

  Brick.prototype.render = function (ctx) {
    if (ctx && !this.isBroken) {
      ctx.beginPath();
      ctx.rect(this.topLeftCoord.x, this.topLeftCoord.y, this.width(), this.height());
      ctx.closePath();
      ctx.fill();
    }
  }

  var Game = BreakOut.Game = function (options) {
    options = options || {};

    this.screenWidth = options.width || 300;
    this.screenHeight = options.height || 300;
    this.balls = [ new BreakOut.Ball({ game: this }) ];
    this.paddle = new BreakOut.Paddle({ game: this });
    this.bricks = this.createBricks();
    this.brickCount = this.bricks.length;
    this.lives = 3;
  }

  Game.prototype.createBricks = function () {
    var cols = 8
    var rows = 4
    var padding = 5;
    var width = 60;
    var height = 10;
    var bricks = [];

    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        var topLeft = new BreakOut.Coordinate(
          j * (width + padding) + padding,
          i * (height + padding) + padding + 30);
        var bottomRight = new BreakOut.Coordinate(topLeft.x + width, topLeft.y + height);
        bricks.push(new BreakOut.Brick(topLeft, bottomRight));
      }
    }

    return bricks;
  }

  Game.prototype.render = function (ctx) {
    var game = this;
    this.balls.forEach(function (ball) { ball.render(ctx); });
    this.paddle.render(ctx);
    this.bricks.forEach(function (brick) {
      if (brick.isBroken) { return; }
      this.balls.forEach(function (ball) {
        if  ( !(ball.bottomRightCoord.y < brick.topLeftCoord.y) &&
              !(ball.topLeftCoord.y > brick.bottomRightCoord.y) &&
              !(ball.bottomRightCoord.x < brick.topLeftCoord.x) &&
              !(ball.topLeftCoord.x > brick.bottomRightCoord.x)) {
                // ball and brick intersecting

                var wy = (ball.width + brick.width) *
                  ((ball.topLeftCoord.y + (ball.size / 2)) -
                  (brick.topLeftCoord.y + (brick.height / 2)));
                var hx = (ball.height + brick.height) *
                  ((ball.topLeftCoord.x + (ball.size / 2)) -
                  (brick.bottomRightCoord.x + (brick.width / 2)));

                if (wy > hx) {
                    if (wy > -hx) {
                        // top
                        ball.dy = -ball.dy;
                    } else {
                        // left
                        ball.dx = -ball.dx;
                    }
               } else {
                    if (wy > -hx) {
                      // right
                      ball.dx = -ball.dx;
                    } else {
                      // bottom
                      ball.dy = -ball.dy
                    }
              }
              brick.isBroken = true;
              game.brickCount -= 1;
        }
      })
      brick.render(ctx);
    }.bind(this))
  }

  Game.prototype.nextFrame = function () {
    this.balls.forEach(function(ball) { ball.move(); });
    this.paddle.move();
  }

  Game.prototype.movePaddleRight = function (isMoving) {
    this.paddle.moveRight(isMoving);
  }

  Game.prototype.movePaddleLeft = function (isMoving) {
    this.paddle.moveLeft(isMoving);
  }

  Game.prototype.isOver = function () {
    return this.lives < 0 || this.brickCount < 1;
  }

  Game.prototype.reset = function (isFullReset) {
    this.screenWidth = 525;
    this.screenHeight = 400;
    if (isFullReset) {
      this.balls = [ new BreakOut.Ball({ game: this }) ];
      this.paddle = new BreakOut.Paddle({ game: this });
      this.bricks = this.createBricks();
      this.brickCount = this.bricks.length;
      this.lives = 3;
    } else {
      this.balls = [ new BreakOut.Ball({ game: this }) ];
      this.paddle = new BreakOut.Paddle({ game: this });
    }
  }

  Game.prototype.score = function () {
    return this.bricks.length - this.brickCount;
  }

  Game.prototype.isWon = function () {
    return this.brickCount < 1 && this.lives >= 0;
  }
})();
