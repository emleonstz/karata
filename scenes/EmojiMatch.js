class EmojiMatch extends Phaser.Scene {
    constructor() {
        super({ key: 'EmojiMatch' });
        this.showDemoShake = true; // Controls demo shake
        this.isFirstClick = true; // New variable to track first click
        this.isGameOver = false; // Flag to track game over state
    }

    preload() {
        //this.load.setBaseURL('/');
        //this.load.setPath('public/');
        // Load images and sounds as before
        this.load.image('card-back', 'assets/Cards/cardBack_green5.png');
        this.load.image('star', 'gui/upgrade/star.png');
        this.load.image('bg', 'assets/pich.jpeg');

        const totalUniqueCards = 20;
        for (let i = 1; i <= totalUniqueCards; i++) {
            this.load.image(`card-${i}`, `assets/Cards/card${i}.png`);
        }

        this.load.audio('bgm', 'assets/clappy.mp3');
        this.load.audio('ticking', 'assets/ticking.mp3');
        this.load.audio('flipping', 'assets/cardSlide1.ogg');
        this.load.audio('gone', 'assets/cardPlace3.ogg');
        this.load.audio('matched', 'assets/coin.mp3');
        this.load.audio('gameover', 'assets/game-over.mp3');
    }

    create() {
        this.bground = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Game State Variables
        this.score = 0;
        this.timer = 60 * 3;
        this.firstCard = null;
        this.secondCard = null;
        this.canFlip = true;
        this.starsCollected = 0;
        this.maxStars = 10;

        const { width, height } = this.sys.game.config;
        this.centerX = width / 2;
        this.centerY = height / 2;

        // Display UI Elements
        this.uiContainer = this.add.container(this.centerX - 120, 50);
        this.scoreText = this.add.text(0, 0, 'Score: 0', {
            fontSize: '24px',
            fill: '#000'
        });
        this.uiContainer.add(this.scoreText);

        this.timerText = this.add.text(150, 0, 'Time: --:--', {
            fontSize: '24px',
            fill: '#000'
        });
        this.uiContainer.add(this.timerText);

        this.starsContainer = this.add.container(this.centerX, 0);
        this.uiContainer.add(this.starsContainer);
        this.displayStars();

        // Initialize Cards
        this.cards = this.add.group();
        this.initializeCards();

        // Setup Timer Event
        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Play background music
        
        /* 
        this.bgm = this.sound.add('bgm', 
            { volume: 0.5, loop: true }
        );
        this.bgm.play();
        */

        

        // Sound effect for ticking
        this.tickingSound = this.sound.add('ticking');

        // Show hint for matching cards if applicable
        this.showMatchingCardHint();
    }

    initializeCards() {
        const totalPairs = 10;
        const cardNames = [];

        // Create pairs of card names
        for (let i = 1; i <= totalPairs; i++) {
            cardNames.push(`card-${i}`);
            cardNames.push(`card-${i}`);
        }

        // Shuffle the card names array
        Phaser.Utils.Array.Shuffle(cardNames);

        // Layout Configuration
        const cardSpacing = 120;
        const cardsPerRow = 5;
        const totalRows = Math.ceil(cardNames.length / cardsPerRow);
        const totalCols = Math.min(cardNames.length, cardsPerRow);

        const gridWidth = (cardsPerRow - 1) * cardSpacing;
        const gridHeight = (totalRows - 1) * cardSpacing;
        const startX = this.centerX - gridWidth / 2;
        const startY = this.centerY - gridHeight / 2 + 50;

        // Create Card Sprites
        cardNames.forEach((cardName, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;

            const card = this.add.sprite(
                startX + col * cardSpacing,
                startY + row * cardSpacing,
                'card-back'
            ).setInteractive().setScale(0.5);

            card.setData('cardName', cardName);
            card.setData('flipped', false);
            card.setData('matched', false);

            card.on('pointerdown', () => this.flipCard(card));
            this.cards.add(card);
        });
    }

    flipCard(card) {

        if (!this.canFlip || card.getData('flipped') || card.getData('matched')) {
            return;
        }

        this.sound.play('flipping');
        this.canFlip = false;

        this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 200,
            ease: 'Linear',
            onComplete: () => {
                card.setTexture(card.getData('cardName'));

                this.tweens.add({
                    targets: card,
                    scaleX: 0.5,
                    duration: 200,
                    ease: 'Linear',
                    onComplete: () => {
                        card.setData('flipped', true);

                        if (!this.firstCard) {
                            this.firstCard = card;
                            this.canFlip = true;
                        } else {
                            this.secondCard = card;
                            this.time.delayedCall(500, () => {
                                this.checkForMatch();
                            });
                        }

                        // Disable hint shaking after the first click
                        if (this.isFirstClick) {
                            this.isFirstClick = false; // Set to false after the first click
                        }
                    }
                });
            }
        });
    }

    checkForMatch() {
        if (this.firstCard.getData('cardName') === this.secondCard.getData('cardName')) {
            this.score += 10;
            this.scoreText.setText(`Score: ${this.score}`);
            this.resetTimer();
            this.collectStars();
            this.sound.play('matched');

            this.firstCard.setData('matched', true);
            this.secondCard.setData('matched', true);

            // Shake demo effect on first match
            if (this.showDemoShake) {
                this.shakeCards([this.firstCard, this.secondCard]);
                this.showDemoShake = false; // Disable shake demo after first use
            }

            this.time.delayedCall(500, () => {
                this.sound.play('gone');
                this.firstCard.destroy();
                this.secondCard.destroy();
                this.firstCard = null;
                this.secondCard = null;
                this.canFlip = true;

                // Check if all cards are matched
                if (this.cards.getChildren().length === 0) {
                    this.resetGame(); // Reset the game with a new set of cards
                }
            });
        } else {
            this.time.delayedCall(500, () => {
                this.tweens.add({
                    targets: [this.firstCard, this.secondCard],
                    scaleX: 0,
                    duration: 200,
                    ease: 'Linear',
                    onComplete: () => {
                        [this.firstCard, this.secondCard].forEach(card => {
                            card.setTexture('card-back');
                            card.setData('flipped', false);

                            this.tweens.add({
                                targets: card,
                                scaleX: 0.5,
                                duration: 200,
                                ease: 'Linear',
                                onComplete: () => {
                                    this.canFlip = true;
                                }
                            });
                        });

                        this.firstCard = null;
                        this.secondCard = null;
                    }
                });
            });
        }
    }

    shakeCards(cards) {
        cards.forEach(card => {
            this.tweens.add({
                targets: card,
                x: card.x - 10,
                duration: 100,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: 5 // Shake 5 times
            });
        });
    }

    updateTimer() {
        if (this.timer > 0) {
            this.timer -= 1;

            // Convert timer to minutes and seconds
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;

            // Format as MM:SS
            const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.timerText.setText(`Time: ${timeText}`);

            if (this.timer <= 5) {
                if (!this.tickingSound.isPlaying) {
                    this.tickingSound.play();
                }
            }
        }
        
        if (this.timer <= 59 && !this.timerAlert) {
            this.timerText.setColor('#FF0000'); // Set text to red
            this.timerTextTween = this.tweens.add({
                targets: this.timerText,
                scaleX: 1.5,
                scaleY: 1.5,
                yoyo: true,
                repeat: -1,
                duration: 300,
                ease: 'Sine.easeInOut'
            });
            this.timerAlert = true;
        }

        if (this.timer <= 0) {
            this.timer = 0; // Prevent timer from going negative
            this.gameOver();
        }
        
    }


    resetTimer() {
        this.timer = Math.max(this.timer - 5, 0); // Subtract 5 seconds for a match, preventing negative time
        this.timerText.setText(`Time: ${this.timer}`);
    }

    collectStars() {
        if (this.starsCollected < this.maxStars) {
            this.starsCollected++;
            this.updateStars();
        }
    }

    displayStars() {
        this.stars = [];
        const starSpacing = 30;
        for (let i = 0; i < this.maxStars; i++) {
            const star = this.add.image(i * starSpacing, 0, 'star').setOrigin(0.5, 0.5).setScale(0.1);
            this.starsContainer.add(star);
            this.stars.push(star);
        }

        this.updateStars();
    }

    updateStars() {
        this.stars.forEach((star, index) => {
            star.setAlpha(index < this.starsCollected ? 1 : 0.5);
        });
    }

    gameOver() {
        if (!this.isGameOver) { // Check if game is already over
            this.isGameOver = true; // Set game over flag to true
            this.sound.stopAll();
            this.sound.play('gameover');
            // Display Game Over UI (to be implemented)
            this.createGameOverUI();
        }
    }

    resetGame() {
        this.timer = 60 * 5; // Reset timer only
        this.timerText.setText(`Time: ${this.timer}`);
        this.starsCollected = 0;
        this.updateStars();
        this.reinitializeCards(); // Reinitialize the cards
        this.showDemoShake = true; //  the demo shake for the next game
        this.isGameOver = false; //  game over flag
        this.isFirstClick = true; //  first click flag
    }

    reinitializeCards() {
        const totalPairs = 10;
        const cardNames = [];

        // Create pairs of card names
        for (let i = 1; i <= totalPairs; i++) {
            cardNames.push(`card-${i}`);
            cardNames.push(`card-${i}`);
        }

        // Shuffle the card names array
        Phaser.Utils.Array.Shuffle(cardNames);

        // Layout Configuration
        const cardSpacing = 120;
        const cardsPerRow = 5;
        const totalRows = Math.ceil(cardNames.length / cardsPerRow);
        const totalCols = Math.min(cardNames.length, cardsPerRow);

        const gridWidth = (cardsPerRow - 1) * cardSpacing;
        const gridHeight = (totalRows - 1) * cardSpacing;
        const startX = this.centerX - gridWidth / 2;
        const startY = this.centerY - gridHeight / 2 + 50;

        // Create Card Sprites
        cardNames.forEach((cardName, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;

            const card = this.add.sprite(
                startX + col * cardSpacing,
                startY + row * cardSpacing,
                'card-back'
            ).setInteractive().setScale(0); 

            card.setData('cardName', cardName);
            card.setData('flipped', false);
            card.setData('matched', false);

            // Animate card entry
            this.tweens.add({
                targets: card,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 300,
                ease: 'Bounce.easeOut', 
                delay: index * 50 // Staggered delay for each card
            });

            card.on('pointerdown', () => this.flipCard(card));
            this.cards.add(card);
        });
    }


    showMatchingCardHint() {
        const cardsArray = this.cards.getChildren();
        const cardPairs = {};

        // Group cards by their name
        cardsArray.forEach(card => {
            const cardName = card.getData('cardName');
            if (!cardPairs[cardName]) {
                cardPairs[cardName] = [];
            }
            cardPairs[cardName].push(card);
        });

        // Find a matching pair
        const matchingPairs = Object.values(cardPairs).filter(pair => pair.length > 1);
        if (matchingPairs.length > 0) {
            const randomPair = Phaser.Utils.Array.GetRandom(matchingPairs);
            this.shakeCards([randomPair[0], randomPair[1]]);
        }
    }

    sendScoreToServer(score) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'your-server-endpoint-url'); 
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = () => {
            if (xhr.status === 200) {
                console.log('Score sent successfully:', xhr.responseText);
            } else {
                console.error('Failed to send score:', xhr.status, xhr.responseText);
            }
        };

        const data = JSON.stringify({ score: score });
        xhr.send(data);
    }
    createGameOverUI() {
        //  background overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // Display 'Game Over' text
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            'Game Over',
            {
                fontSize: '48px',
                color: '#FFFFFF',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);

        // Display final score
        const scoreText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Final Score: ${this.score}`, //  this.score holds the final score
            {
                fontSize: '32px',
                color: '#FFFFFF'
            }
        ).setOrigin(0.5);

        // Create a 'Restart Game' button
        const restartButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'Restart Game',
            {
                fontSize: '24px',
                color: '#FFFFFF',
                backgroundColor: '#007BFF',
                padding: { x: 20, y: 10 },
                borderRadius: 5
            }
        ).setOrigin(0.5).setInteractive();

        // Restart game on button click
        restartButton.on('pointerdown', () => this.scene.restart());

        // Create a 'Main Menu' button
        const mainMenuButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 160,
            'Main Menu',
            {
                fontSize: '24px',
                color: '#FFFFFF',
                backgroundColor: '#FF0000',
                padding: { x: 20, y: 10 },
                borderRadius: 50
            }
        ).setOrigin(0.5).setInteractive();

        mainMenuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene'); 
        });
    }

    
}
