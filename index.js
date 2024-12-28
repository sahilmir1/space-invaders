import EnemyController from "./EnemyController.js";
import Player from "./Player.js";
import BulletController from "./BulletController.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = window.innerHeight * 0.8;

const background = new Image();
background.src = "images/space.jpg";

let score = 0; // Initialize score

const playerBulletController = new BulletController(canvas, 100, "black", true);
const enemyBulletController = new BulletController(canvas, 4, "red", false);
const enemyController = new EnemyController(
  canvas,
  enemyBulletController,
  playerBulletController,
  incrementScore // Pass the callback
);
const player = new Player(canvas, 3, playerBulletController);

let isGameOver = false;
let didWin = false;

// Function to increment the score
function incrementScore() {
  score += 0.1; // Increase score by 100 for each enemy
}

function game() {
  checkGameOver();
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  displayGameOver();
  displayScore(); // Show the score during the game

  if (!isGameOver) {
    enemyController.draw(ctx);
    player.draw(ctx);
    playerBulletController.draw(ctx);
    enemyBulletController.draw(ctx);
  }
}

function displayScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score.toFixed(1)}`, 10, 30); // Display score at the top-left corner
}

let formDisplayed = false; // Add a flag to track if the form has been displayed

function displayGameOver() {
  if (isGameOver) {
    // Render Game Over text on the canvas
    let text = didWin ? "You Win" : "Game Over";
    let textOffset = didWin ? 3.5 : 5;

    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.fillText(text, canvas.width / textOffset, canvas.height / 2);

    // Render the score on the canvas
    ctx.font = "30px Arial";
    ctx.fillText(
      `Score: ${score.toFixed(1)}`,
      canvas.width / 2 - 50,
      canvas.height / 2 + 50
    );

    // Create the form overlay only once
    if (!formDisplayed) {
      formDisplayed = true; // Set the flag to true when the form is displayed

      // Disable pointer events on the canvas
      canvas.style.pointerEvents = "none";

      // Create a form overlay for submitting the score
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.top = "50%";
      overlay.style.left = "50%";
      overlay.style.transform = "translate(-50%, -20%)";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      overlay.style.padding = "20px";
      overlay.style.color = "white";
      overlay.style.textAlign = "center";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.placeholder = "Enter your name";
      nameInput.style.margin = "10px";

      const submitButton = document.createElement("button");
      submitButton.innerText = "Submit Score";
      submitButton.style.margin = "10px";

      submitButton.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (name) {
          submitScore(name, score); // Call a function to send the data to the server
          overlay.remove();
          canvas.style.pointerEvents = "auto"; // Re-enable pointer events
        } else {
          alert("Please enter your name!");
        }
      });

      overlay.appendChild(nameInput);
      overlay.appendChild(submitButton);
      document.body.appendChild(overlay);

      // Automatically focus the input field
      nameInput.focus();
    }
  }
}

// Function to send score to the backend
function submitScore(name, score) {
  fetch("http://localhost:3000/submit-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, score }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Score submitted:", data);
    })
    .catch((error) => console.error("Error submitting score:", error));
}

function checkGameOver() {
  if (isGameOver) {
    return;
  }

  if (enemyBulletController.collideWith(player)) {
    isGameOver = true;
  }

  if (enemyController.collideWith(player)) {
    isGameOver = true;
  }

  // Check if any enemy reaches the bottom of the canvas
  for (let row of enemyController.enemyRows) {
    for (let enemy of row) {
      if (enemy.y + enemy.height >= canvas.height) {
        isGameOver = true;
        return;
      }
    }
  }

  if (enemyController.enemyRows.length === 0) {
    didWin = true;
    isGameOver = true;
  }
}

setInterval(game, 1000 / 60);
