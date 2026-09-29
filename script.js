const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameOverScreen = document.getElementById("gameOver");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const healthText = document.getElementById("health");
const scoreText = document.getElementById("score");
const finalScore = document.getElementById("finalScore");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = false;
let score = 0;

const keys = {};

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    down: false
};

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 5,
    health: 100,
    angle: 0
};

let bullets = [];
let enemies = [];

document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

canvas.addEventListener("mousedown", () => {
    mouse.down = true;
});

canvas.addEventListener("mouseup", () => {
    mouse.down = false;
});

function startGame() {
    menu.style.display = "none";
    gameOverScreen.style.display = "none";

    gameRunning = true;

    score = 0;

    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = 100;

    bullets = [];
    enemies = [];

    updateHUD();

    gameLoop();
}

function endGame() {
    gameRunning = false;

    finalScore.textContent = score;

    gameOverScreen.style.display = "block";
}

function updateHUD() {
    healthText.textContent = Math.max(0, Math.floor(player.health));
    scoreText.textContent = score;
}

function movePlayer() {

    if (keys["w"] || keys["arrowup"]) {
        player.y -= player.speed;
    }

    if (keys["s"] || keys["arrowdown"]) {
        player.y += player.speed;
    }

    if (keys["a"] || keys["arrowleft"]) {
        player.x -= player.speed;
    }

    if (keys["d"] || keys["arrowright"]) {
        player.x += player.speed;
    }

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

function shoot() {

    const angle = Math.atan2(
        mouse.y - player.y,
        mouse.x - player.x
    );

    bullets.push({
        x: player.x,
        y: player.y,

        dx: Math.cos(angle) * 10,
        dy: Math.sin(angle) * 10,

        radius: 5,

        damage: 25
    });
}

let lastShot = 0;

function automaticShoot() {

    const now = Date.now();

    if (mouse.down && now - lastShot > 180) {
        shoot();
        lastShot = now;
    }
}

function createEnemy() {

    const side = Math.floor(Math.random() * 4);

    let x;
    let y;

    if (side === 0) {
        x = Math.random() * canvas.width;
        y = -30;
    }

    if (side === 1) {
        x = canvas.width + 30;
        y = Math.random() * canvas.height;
    }

    if (side === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height + 30;
    }

    if (side === 3) {
        x = -30;
        y = Math.random() * canvas.height;
    }

    enemies.push({
        x: x,
        y: y,

        radius: 18,

        speed: 1.5 + Math.random() * 1.5,

        health: 50
    });
}

let enemyTimer = 0;

function updateEnemies() {

    enemyTimer++;

    if (enemyTimer > 60) {
        createEnemy();
        enemyTimer = 0;
    }

    enemies.forEach((enemy, enemyIndex) => {

        const angle = Math.atan2(
            player.y - enemy.y,
            player.x - enemy.x
        );

        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;

        const distance = Math.hypot(
            player.x - enemy.x,
            player.y - enemy.y
        );

        if (distance < player.radius + enemy.radius) {

            player.health -= 0.5;

            enemy.x -= Math.cos(angle) * 3;
            enemy.y -= Math.sin(angle) * 3;

            if (player.health <= 0) {
                endGame();
            }
        }
    });
}

function updateBullets() {

    bullets.forEach((bullet, bulletIndex) => {

        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullets.splice(bulletIndex, 1);
            return;
        }

        enemies.forEach((enemy, enemyIndex) => {

            const distance = Math.hypot(
                bullet.x - enemy.x,
                bullet.y - enemy.y
            );

            if (distance < bullet.radius + enemy.radius) {

                enemy.health -= bullet.damage;

                bullets.splice(bulletIndex, 1);

                if (enemy.health <= 0) {

                    enemies.splice(enemyIndex, 1);

                    score += 10;

                    updateHUD();
                }
            }
        });
    });
}

function drawPlayer() {

    player.angle = Math.atan2(
        mouse.y - player.y,
        mouse.x - player.x
    );

    ctx.save();

    ctx.translate(player.x, player.y);

    ctx.rotate(player.angle);

    // Corpo
    ctx.fillStyle = "#00eaff";

    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Arma
    ctx.fillStyle = "#ffffff";

    ctx.fillRect(5, -5, 30, 10);

    ctx.restore();
}

function drawBullets() {

    bullets.forEach((bullet) => {

        ctx.fillStyle = "#ffe600";

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}

function drawEnemies() {

    enemies.forEach((enemy) => {

        ctx.fillStyle = "#ff3155";

        ctx.beginPath();

        ctx.arc(
            enemy.x,
            enemy.y,
            enemy.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Barra de vida
        ctx.fillStyle = "#222";

        ctx.fillRect(
            enemy.x - 20,
            enemy.y - 30,
            40,
            5
        );

        ctx.fillStyle = "#00ff66";

        ctx.fillRect(
            enemy.x - 20,
            enemy.y - 30,
            40 * (enemy.health / 50),
            5
        );
    });
}

function drawCrosshair() {

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        mouse.x,
        mouse.y,
        10,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(mouse.x - 15, mouse.y);
    ctx.lineTo(mouse.x - 5, mouse.y);

    ctx.moveTo(mouse.x + 5, mouse.y);
    ctx.lineTo(mouse.x + 15, mouse.y);

    ctx.moveTo(mouse.x, mouse.y - 15);
    ctx.lineTo(mouse.x, mouse.y - 5);

    ctx.moveTo(mouse.x, mouse.y + 5);
    ctx.lineTo(mouse.x, mouse.y + 15);

    ctx.stroke();
}

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBullets();
    drawEnemies();
    drawPlayer();
    drawCrosshair();
}

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    movePlayer();

    automaticShoot();

    updateBullets();

    updateEnemies();

    draw();

    updateHUD();

    requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", startGame);

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});