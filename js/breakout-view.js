;
(function() {
  if (typeof BreakOut === "undefined") {
    window.BreakOut = {};
  }

  var View = BreakOut.View = function ($el) {
    this.$el = $el;
    this.ctx = this.$el[0].getContext("2d");
    this.width = $el.width();
    this.height = $el.height();
    this.game = new BreakOut.Game({ width: this.width, height: this.height });
    this.ctx.textAlign = "center";
    this.ctx.font = "12pt SilkScreen";
    this.isStarted = false;
    this.intervalId = setInterval(this.draw.bind(this), 1);

    $(window).keydown(this.handleKeyDown.bind(this));
    $(window).keyup(this.handleKeyUp.bind(this));
  }

  View.prototype.handleKeyDown = function(e) {
    e.preventDefault();

    if (e.keyCode === 39) {
      // right arrow key down
      this.game.movePaddleRight(true);
    } else if (e.keyCode === 37) {
      // left arrow key down
      this.game.movePaddleLeft(true);
    } else if (e.keyCode === 32) {
      // space bar key down
      this.reset();
    }
  }

  View.prototype.reset = function(){
    this.isStarted = true;
    this.game.reset();
    clearInterval(this.intervalId);
    this.intervalId = setInterval(this.draw.bind(this), 1);
  }

  View.prototype.handleKeyUp = function(e) {
    if (e.keyCode === 39) {
      // right arrow key up
      this.game.movePaddleRight(false);
    } else if (e.keyCode === 37) {
      // left arrow key up
      this.game.movePaddleLeft(false);
    }
  }

  View.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  View.prototype.showGameOverMsg = function () {
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "center";
    if (this.game.isWon()) {
      this.ctx.fillText("You won!", this.width / 2, this.height / 2);
    } else {
      this.ctx.fillText("Game Over", this.width / 2, this.height / 2);
    }
    this.ctx.fillText("Press space to restart", this.width / 2, this.height * (2 / 3));
  }

  View.prototype.renderStartScreen = function() {
      this.ctx.fillText("Breakout", this.width / 2, this.height / 2);
      this.ctx.fillText("Press space to start", this.width / 2, this.height * (2 / 3));
  }

  View.prototype.draw = function() {
    this.clear();
    if (this.isStarted) {
      this.game.render(this.ctx);
      if (this.game.isOver()) {
        this.showGameOverMsg();
        clearInterval(this.intervalId);
      }
      this.ctx.fillText("Score: " + this.game.score(), 43, 15);
      this.game.nextFrame();
    } else {
      this.renderStartScreen();
    }
  }
})();
