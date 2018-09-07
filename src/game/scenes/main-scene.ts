import 'phaser';

export class MainScene extends Phaser.Scene {

    private player: Phaser.Physics.Arcade.Sprite;
    private platforms: Phaser.Physics.Arcade.StaticGroup;
    private stars: Phaser.Physics.Arcade.Group;
    private bombs: Phaser.Physics.Arcade.Group;
    private score: {
        value: number,
        text: Phaser.GameObjects.Text;
    };
    
    private gameOver: boolean = false;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    // #region - preload ~ create ~ update -
    public preload(): void {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    public create(): void {

        /** init objects
         */
        this.add.image(400, 300, 'sky'); // background creation
        this.platformCreation()
        this.playerCreation()
        this.starsCreation()
        this.bombsCreation();
        this.scoreCreation();
        

        /** set collision & overlapping
         */
        // set player & platforms to not overlap.
        this.physics.add.collider(this.player, this.platforms); 
        
        // set stars & platforms to not overlap.
        this.physics.add.collider(this.stars, this.platforms); 
        
        // call collectStar whan player & star overlap.
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        
        // set bombs & platforms to not overlap.
        this.physics.add.collider(this.bombs, this.platforms); 

        // call hitBomb whan player & bomb overlap.
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);


    }

    public update() {
        let cursors = this.input.keyboard.createCursorKeys();

        if (cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        // define jump action
        if (cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }
    // #endregion


    // #region - Objects Creation -
    private platformCreation() {
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody(); // bottom ground
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
    }

    private playerCreation() {
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    private starsCreation() {
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate((child) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        }, undefined);

    }

    private bombsCreation() {
        this.bombs = this.physics.add.group();
    }

    private scoreCreation() {
        this.score = {
            value: 0,
            text: this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })
        }

    }
    // #endregion


    // #region  - private - 
    private collectStar(player, star) {
        star.disableBody(true, true);

        this.incScore();
        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate((child) => {
                child.enableBody(true, child.x, 0, true, true);
            }, undefined);
            this.spawnBomb();
        }
    }

    private hitBomb(player, bomb) {
        this.endGame();
    }

    private endGame() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.gameOver = true;
    }

    private incScore() {
        this.score.value += 10;
        this.score.text.setText('Score: ' + this.score.value);
    }

    private spawnBomb() {
        let x = (this.player.x < 400) ?
            Phaser.Math.Between(400, 800) :
            Phaser.Math.Between(0, 400);
        let bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
    // #endregion
}