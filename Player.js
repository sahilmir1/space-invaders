export default class Player {
  rightPressed = false;
  leftPressed = false;
  shootPressed = false;

  constructor(canvas, velocity, bulletController) {
    this.canvas = canvas;
    this.velocity = velocity;
    this.bulletController = bulletController;

    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 75;
    this.width = 50;
    this.height = 48;
    this.image = new Image();
    this.image.src = "images/player.png";

    // Keyboard controls
    document.addEventListener("keydown", this.keydown);
    document.addEventListener("keyup", this.keyup);

    // Touch controls
    this.addTouchControls();
  }

  draw(ctx) {
    if (this.shootPressed) {
      this.bulletController.shoot(this.x + this.width / 2, this.y, 4, 10);
    }
    this.move();
    this.collideWithWalls();
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  collideWithWalls() {
    if (this.x < 0) this.x = 0; // Left wall
    if (this.x > this.canvas.width - this.width)
      this.x = this.canvas.width - this.width; // Right wall
  }

  move() {
    if (this.rightPressed) {
      this.x += this.velocity;
    }
    if (this.leftPressed) {
      this.x -= this.velocity;
    }
  }

  keydown = (event) => {
    if (event.code === "ArrowRight") this.rightPressed = true;
    if (event.code === "ArrowLeft") this.leftPressed = true;
    if (event.code === "Space") this.shootPressed = true;
  };

  keyup = (event) => {
    if (event.code === "ArrowRight") this.rightPressed = false;
    if (event.code === "ArrowLeft") this.leftPressed = false;
    if (event.code === "Space") this.shootPressed = false;
  };

  // Add touch controls for mobile
  addTouchControls() {
    const leftButton = document.getElementById("leftButton");
    const rightButton = document.getElementById("rightButton");
    const shootButton = document.getElementById("shootButton");

    // Left button
    leftButton.addEventListener("touchstart", () => (this.leftPressed = true));
    leftButton.addEventListener("touchend", () => (this.leftPressed = false));

    // Right button
    rightButton.addEventListener(
      "touchstart",
      () => (this.rightPressed = true)
    );
    rightButton.addEventListener("touchend", () => (this.rightPressed = false));

    // Shoot button
    shootButton.addEventListener(
      "touchstart",
      () => (this.shootPressed = true)
    );
    shootButton.addEventListener("touchend", () => (this.shootPressed = false));
  }
}
