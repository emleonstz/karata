class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
        this.h = config.height;
        this.w = config.width;
        this.rows = 5;
        this.cols = 5;
        this.scene = config.scene;
        this.cw = this.w / this.cols;
        this.ch = this.h / this.rows;
    }
    preload() {
        //this.load.setBaseURL('/');
        //this.load.setPath('public/');
        
        this.load.image('logo', '/img/logo.PNG');
        this.load.image('background', '/games/intro/assets/background.png');
        this.load.audio('beat','/games/intro/assets/audios/logo.mp3');
    }
    create() {
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        var logo = this.add.image(0, 0, 'logo').setScale(1.5);
       
        //var text = this.add.text(0, 0, 'Loading..', { font: '10px Arial', fill: '#ffffff' });
        //var brand = this.add.text(0, 0, 'Designed by Emleons Software ©2024', { font: '10px Arial', fill: '#ffffff' });
        var centerX = this.cameras.main.centerX;
        var centerY = this.cameras.main.centerY;
        //this.showGriding();
        //this.showNumbers();
        this.placeAt(2, 2, logo);
        this.setScalling(logo);

        this.tweens.add({
            targets: logo,
            y: centerY - 50,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            loop: -1
        });
        
        this.time.delayedCall(3000, this.startNextScene, [], this);
        
    }
    update() {
    }

    showGriding(a = 1) {
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(4, 0xff0000, a);
        //this.graphics.beginPath();
        for (var i = 0; i < this.w; i += this.cw) {
            this.graphics.moveTo(i, 0);
            this.graphics.lineTo(i, this.h);
        }
        for (var i = 0; i < this.h; i += this.ch) {
            this.graphics.moveTo(0, i);
            this.graphics.lineTo(this.w, i);
        }
        this.graphics.strokePath();
    }

    showNumbers(a = 1) {
        this.showGriding(a);
        var n = 0;
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var numText = this.add.text(0, 0, n, {
                    color: 'red'
                });
                numText.setOrigin(0.5, 0.5);
                this.placeAt(j, i, numText);
                n++;
            }
        }
    }

    placeAt(xx, yy, obj) {
        var x2 = this.cw * xx + this.cw / 2;
        var y2 = this.ch * yy + this.ch / 2;
        obj.x = x2;
        obj.y = y2;
    }
    placeAtIndex(index, obj) {
        var yy = Math.floor(index / this.cols);
        var xx = index - (yy * this.cols);
        this.placeAt(xx - 0.2, yy, obj);
    }

    setScalling(obj) {
        obj.displayWidth = game.config.width / 5;
        obj.scaleY = obj.scaleX;
    }
    startNextScene() {
        this.scene.start('EmojiMatch');
    }
}

// main.js






