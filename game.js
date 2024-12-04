// Основные переменные
const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const highscoreElement = document.getElementById('highscore');
const gameOverElement = document.getElementById('game-over');

// Состояние игры
let isJumping = false;
let gameActive = true;
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
let obstacleTimeout = null;
let coinTimeout = null;
let giftCounter = 0;
highscoreElement.textContent = highscore;

// Константы
const JUMP_HEIGHT = 20;
const OBSTACLE_SPEED = 7;
const GIFT_FREQUENCY = 2;
const BACKGROUND_EMOJI = ['🌟', '✨', '💫', '⭐'];

// Звуки
const jumpSound = new Audio('sounds/jump1.mp3');
const collisionSound = new Audio('sounds/collision.mp3');
const giftSound = new Audio('sounds/gift.mp3');
giftSound.volume = 0.3;
const coinSound = new Audio('sounds/many.mp3');
coinSound.volume = 0.7;
const gameOverSound = new Audio('sounds/gameover.mp3');
gameOverSound.volume = 0.4;

// настройка громкости
jumpSound.volume = 0.3; // от 0 до 1
collisionSound.volume = 1; // от 0 до 1

function jump() {
    if (!isJumping && gameActive) {
        isJumping = true;
        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => console.log('Ошибка воспроизведения звука:', e));
        player.style.transform = `translateY(-${JUMP_HEIGHT}vh)`;
        
        setTimeout(() => {
            player.style.transform = 'translateY(0)';
            setTimeout(() => {
                isJumping = false;
            }, 300);
        }, 300);
    }
}

function createGift() {
    if (!gameActive) return;
    
    const gift = document.createElement('div');
    gift.className = 'gift';
    gift.textContent = '🎁';
    gift.style.left = '100%';
    game.appendChild(gift);

    let position = 100;
    
    const moveGift = () => {
        if (position <= -10) {
            gift.remove();
            return;
        }

        position -= OBSTACLE_SPEED * 0.1;
        gift.style.left = position + '%';

        const playerRect = player.getBoundingClientRect();
        const giftRect = gift.getBoundingClientRect();

        if (
            playerRect.right > giftRect.left &&
            playerRect.left < giftRect.right &&
            playerRect.bottom > giftRect.top &&
            playerRect.top < giftRect.bottom
        ) {
            gift.remove();
            giftSound.currentTime = 0;  
            giftSound.play();
            score += 5;
            scoreElement.textContent = score;
            if (score > highscore) {
                highscore = score;
                highscoreElement.textContent = highscore;
                localStorage.setItem('highscore', highscore);
            }
        }

        if (gameActive) {
            requestAnimationFrame(moveGift);
        }
    };

    requestAnimationFrame(moveGift);
}

function createCoin() {
    if (!gameActive) return;
    
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.textContent = '🍪';
    coin.style.left = '100%';
    game.appendChild(coin);

    let position = 100;
    
    const moveCoin = () => {
        if (position <= -10) {
            coin.remove();
            return;
        }

        position -= OBSTACLE_SPEED * 0.1;
        coin.style.left = position + '%';

        const playerRect = player.getBoundingClientRect();
        const coinRect = coin.getBoundingClientRect();

        if (
            playerRect.right > coinRect.left &&
            playerRect.left < coinRect.right &&
            playerRect.bottom > coinRect.top &&
            playerRect.top < coinRect.bottom
        ) {
            coin.remove();
            coinSound.currentTime = 0;
            coinSound.play(); 
            score += 2;
            giftCounter++;
            
            if (giftCounter >= GIFT_FREQUENCY) {
                giftCounter = 0;
                createGift();
            }
            
            scoreElement.textContent = score;
            if (score > highscore) {
                highscore = score;
                highscoreElement.textContent = highscore;
                localStorage.setItem('highscore', highscore);
            }
        }

        if (gameActive) {
            requestAnimationFrame(moveCoin);
        }
    };

    requestAnimationFrame(moveCoin);
}

function createObstacle() {
    if (!gameActive) return;

    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.textContent = '🎄';
    obstacle.style.left = '100%';
    game.appendChild(obstacle);

    let position = 100;
    
    const moveObstacle = () => {
        if (position <= -10) {
            obstacle.remove();
            score++;
            scoreElement.textContent = score;
            if (score > highscore) {
                highscore = score;
                highscoreElement.textContent = highscore;
                localStorage.setItem('highscore', highscore);
            }
            return;
        }

        position -= OBSTACLE_SPEED * 0.1;
        obstacle.style.left = position + '%';

        const playerRect = player.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        if (
            playerRect.right - 20 > obstacleRect.left &&
            playerRect.left + 20 < obstacleRect.right &&
            playerRect.bottom - 10 > obstacleRect.top &&
            playerRect.top + 10 < obstacleRect.bottom
        ) {
            gameOver();
        }

        if (gameActive) {
            requestAnimationFrame(moveObstacle);
        }
    };

    requestAnimationFrame(moveObstacle);
}

function gameOver() {
    gameActive = false;
    collisionSound.currentTime = 0;
    collisionSound.play().catch(e => console.log('Ошибка воспроизведения звука:', e));
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    gameOverElement.style.display = 'block';
    
   
}

function resetGame() {
    gameActive = true;
    score = 0;
    giftCounter = 0;
    scoreElement.textContent = score;
    
    document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
    document.querySelectorAll('.coin').forEach(coin => coin.remove());
    document.querySelectorAll('.gift').forEach(gift => gift.remove());
    document.querySelectorAll('.background-emoji').forEach(emoji => emoji.remove());
    
    if (obstacleTimeout) {
        clearTimeout(obstacleTimeout);
    }
    if (coinTimeout) {
        clearTimeout(coinTimeout);
    }
    
    startGame();
}

// Эта функция создаёт один летящий эмодзи на фоне
function createBackgroundEffect() {
    // Создаём новый элемент
    const emoji = document.createElement('div');
    // Даём ему класс для стилей
    emoji.className = 'background-emoji';
    // Выбираем случайный эмодзи из массива BACKGROUND_EMOJI
    emoji.textContent = BACKGROUND_EMOJI[Math.floor(Math.random() * BACKGROUND_EMOJI.length)];
    // Задаём случайный размер от 10px до 30px
    emoji.style.fontSize = Math.random() * 40 + 10 + 'px';
    // Задаём случайную высоту
    emoji.style.top = Math.random() * 70 + 'vh';
    // Начальная позиция справа
    emoji.style.left = '100%';
    // Добавляем элемент в игру
    game.appendChild(emoji);

    // Позиция для движения
    let position = 100;
    // Случайная скорость движения
    const speed = Math.random() * 1 + 0.5;

    // Функция движения
    const moveEmoji = () => {
        // Если вышел за пределы экрана - удаляем
        if (position < -10) {
            emoji.remove();
            return;
        }

        // Двигаем влево
        position -= speed;
        emoji.style.left = position + '%';

        // Если игра активна - продолжаем движение
        if (gameActive) {
            requestAnimationFrame(moveEmoji);
        }
    };

    // Запускаем движение
    requestAnimationFrame(moveEmoji);
    
    // Удаляем через 15 секунд, чтобы не засорять память
    setTimeout(() => emoji.remove(), 15000);
}
function startGame() {
    function generateObstacle() {
        if (gameActive) {
            createObstacle();
            obstacleTimeout = setTimeout(generateObstacle, Math.random() * 2000 + 3000);
        }
    }
    
    function generateCoin() {
        if (gameActive) {
            createCoin();
            coinTimeout = setTimeout(generateCoin, Math.random() * 3000 + 2000);
        }
    }

    generateObstacle();
    generateCoin();
    setInterval(() => {
        if (gameActive) {
            createBackgroundEffect();
        }
    }, 2000);
}


// Инициализация звуков при первом взаимодействии
document.addEventListener('click', function initSounds() {
    jumpSound.play().catch(() => {}).then(() => jumpSound.pause());
    collisionSound.play().catch(() => {}).then(() => collisionSound.pause());
    document.removeEventListener('click', initSounds);
}, { once: true });

// Обработчики событий
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameActive) {
            // Если игра неактивна, перезапускаем
            gameOverElement.style.display = 'none';
            resetGame();
        } else {
            // Если игра активна, прыгаем
            jump();
        }
    }
});

// Запуск игры
startGame();