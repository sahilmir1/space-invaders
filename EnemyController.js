import Enemy from "./Enemy.js";
import MovingDirection from "./MovingDirection.js";

export default class EnemyController {
  enemyRows = [];
  currentDirection = MovingDirection.right;
  xVelocity = 0;
  yVelocity = 0;
  defaultXVelocity = 1;
  defaultYVelocity = 1;
  moveDownTimerDefault = 30;
  moveDownTimer = this.moveDownTimerDefault;
  fireBulletTimerDefault = 100;
  fireBulletTimer = this.fireBulletTimerDefault;

  spawnEnemyTimerDefault = 200; // Timer for spawning new enemies
  spawnEnemyTimer = this.spawnEnemyTimerDefault;

  constructor(
    canvas,
    enemyBulletController,
    playerBulletController,
    onEnemyKilled
  ) {
    this.canvas = canvas;
    this.enemyBulletController = enemyBulletController;
    this.playerBulletController = playerBulletController;
    this.onEnemyKilled = onEnemyKilled;

    this.enemyDeathSound = new Audio("sounds/enemy-death.wav");
    this.enemyDeathSound.volume = 0.1;

    this.createInitialEnemies(); // Create initial enemies
  }

  draw(ctx) {
    this.decrementMoveDownTimer();
    this.updateVelocityAndDirection();
    this.collisionDetection();
    this.drawEnemies(ctx);
    this.resetMoveDownTimer();
    this.fireBullet();
    this.spawnEnemies(); // Spawn new enemies
  }

  createInitialEnemies() {
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
      this.enemyRows[rowIndex] = [];
      for (let colIndex = 0; colIndex < 10; colIndex++) {
        this.enemyRows[rowIndex].push(
          new Enemy(colIndex * 50, rowIndex * 35, 1) // Initial type is 1
        );
      }
    }
  }

  spawnEnemies() {
    this.spawnEnemyTimer--;
    if (this.spawnEnemyTimer <= 0) {
      this.spawnEnemyTimer = this.spawnEnemyTimerDefault;

      const rowHeight = 35; // Height of each enemy row
      const enemyWidth = 50; // Width of each enemy
      let newRowY;

      // Check if there are existing rows
      if (this.enemyRows.length > 0) {
        // Get the current topmost row's Y position and subtract rowHeight
        newRowY = this.enemyRows[0][0].y - rowHeight;
      } else {
        // If no rows exist, start at Y = 0
        newRowY = 35;
      }

      // Spawn a new row shifted to the right by 1 enemy width
      const newRow = [];
      for (let colIndex = 0; colIndex < 10; colIndex++) {
        const enemyType = Math.ceil(Math.random() * 3); // Random enemy type
        const shiftedX = colIndex * enemyWidth + enemyWidth; // Shifted by 1 enemy width
        newRow.push(new Enemy(shiftedX, newRowY, enemyType));
      }

      // Add the new row to the beginning of the enemyRows array
      this.enemyRows.unshift(newRow);
    }
  }

  collisionDetection() {
    this.enemyRows.forEach((enemyRow) => {
      enemyRow.forEach((enemy, enemyIndex) => {
        if (this.playerBulletController.collideWith(enemy)) {
          this.enemyDeathSound.currentTime = 0;
          this.enemyDeathSound.play();
          enemyRow.splice(enemyIndex, 1);

          // Trigger the callback when an enemy is killed
          if (this.onEnemyKilled) {
            this.onEnemyKilled();
          }
        }
      });
    });

    this.enemyRows = this.enemyRows.filter((enemyRow) => enemyRow.length > 0);
  }

  fireBullet() {
    this.fireBulletTimer--;
    if (this.fireBulletTimer <= 0) {
      this.fireBulletTimer = this.fireBulletTimerDefault;
      const allEnemies = this.enemyRows.flat();
      if (allEnemies.length > 0) {
        const enemyIndex = Math.floor(Math.random() * allEnemies.length);
        const enemy = allEnemies[enemyIndex];
        this.enemyBulletController.shoot(
          enemy.x + enemy.width / 2,
          enemy.y,
          -3
        );
      }
    }
  }

  resetMoveDownTimer() {
    if (this.moveDownTimer <= 0) {
      this.moveDownTimer = this.moveDownTimerDefault;
    }
  }

  decrementMoveDownTimer() {
    if (
      this.currentDirection === MovingDirection.downLeft ||
      this.currentDirection === MovingDirection.downRight
    ) {
      this.moveDownTimer--;
    }
  }

  updateVelocityAndDirection() {
    for (const enemyRow of this.enemyRows) {
      if (this.currentDirection == MovingDirection.right) {
        this.xVelocity = this.defaultXVelocity;
        this.yVelocity = 0;
        const rightMostEnemy = enemyRow[enemyRow.length - 1];
        if (rightMostEnemy.x + rightMostEnemy.width >= this.canvas.width) {
          this.currentDirection = MovingDirection.downLeft;
          break;
        }
      } else if (this.currentDirection === MovingDirection.downLeft) {
        if (this.moveDown(MovingDirection.left)) {
          break;
        }
      } else if (this.currentDirection === MovingDirection.left) {
        this.xVelocity = -this.defaultXVelocity;
        this.yVelocity = 0;
        const leftMostEnemy = enemyRow[0];
        if (leftMostEnemy.x <= 0) {
          this.currentDirection = MovingDirection.downRight;
          break;
        }
      } else if (this.currentDirection === MovingDirection.downRight) {
        if (this.moveDown(MovingDirection.right)) {
          break;
        }
      }
    }
  }

  moveDown(newDirection) {
    this.xVelocity = 0;
    this.yVelocity = this.defaultYVelocity;
    if (this.moveDownTimer <= 0) {
      this.currentDirection = newDirection;
      return true;
    }
    return false;
  }

  drawEnemies(ctx) {
    this.enemyRows.flat().forEach((enemy) => {
      enemy.move(this.xVelocity, this.yVelocity);
      enemy.draw(ctx);
    });
  }

  collideWith(sprite) {
    return this.enemyRows.flat().some((enemy) => enemy.collideWith(sprite));
  }
}
