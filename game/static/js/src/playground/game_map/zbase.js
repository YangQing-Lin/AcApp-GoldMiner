class GameMap extends AcGameObject {
    constructor(playground) {
        super();  // 调用基类的构造函数
        this.playground = playground;
        this.$canvasDiv = $(`<div id="canvasDiv" class="canvasDiv"></div>`);
        this.$wallCanvas = $(`<canvas id="wallCanvas"></canvas>`);
        this.$tankCanvas = $(`<canvas id="tankCanvas"></canvas>`);
        this.$grassCanvas = $(`<canvas id="grassCanvas"></canvas>`);
        this.$overCanvas = $(`<canvas id="overCanvas"></canvas>`);
        this.$stageCanvas = $(`<canvas id="stageCanvas"></canvas>`);

        this.initScreen();
        this.playground.$playground.append(this.$canvasDiv);

        this.ctx;//2d画布
        this.wallCtx;//地图画布
        this.grassCtx;//草地画布
        this.tankCtx;//坦克画布
        this.overCtx;//结束画布
        this.menu = null;//菜单
        this.stage = null;//舞台
        this.map = null;//地图
        this.player1 = null;//玩家1
        this.player2 = null;//玩家2
        this.prop = null;
        this.enemyArray = [];//敌方坦克
        this.bulletArray = [];//子弹数组
        this.keys = [];//记录按下的按键
        this.crackArray = [];//爆炸数组

        this.gameState = GAME_STATE_MENU;//默认菜单状态
        this.level = 1;
        this.maxEnemy = 20;//敌方坦克总数
        this.maxAppearEnemy = 5;//屏幕上一起出现的最大数
        this.appearEnemy = 0; //已出现的敌方坦克
        this.mainframe = 0;
        this.propTime = 300;

    }

    // 初始化所有canvas画布
    initScreen() {
        this.$canvasDiv.css({ "width": SCREEN_WIDTH });
        this.$canvasDiv.css({ "height": SCREEN_HEIGHT });
        this.$canvasDiv.css({ "background-color": "#000000" });
        this.$canvasDiv.css({ "margin": "auto" });

        this.ctx = this.$stageCanvas[0].getContext("2d");
        this.$stageCanvas.attr({ "width": SCREEN_WIDTH });
        this.$stageCanvas.attr({ "height": SCREEN_HEIGHT });


        this.wallCtx = this.$wallCanvas[0].getContext("2d");
        this.$wallCanvas.attr({ "width": SCREEN_WIDTH });
        this.$wallCanvas.attr({ "height": SCREEN_HEIGHT });

        this.grassCtx = this.$grassCanvas[0].getContext("2d");
        this.$grassCanvas.attr({ "width": SCREEN_WIDTH });
        this.$grassCanvas.attr({ "height": SCREEN_HEIGHT });

        this.tankCtx = this.$tankCanvas[0].getContext("2d");
        this.$tankCanvas.attr({ "width": SCREEN_WIDTH });
        this.$tankCanvas.attr({ "height": SCREEN_HEIGHT });

        this.overCtx = this.$overCanvas[0].getContext("2d");
        this.$overCanvas.attr({ "width": SCREEN_WIDTH });
        this.$overCanvas.attr({ "height": SCREEN_HEIGHT });

        this.$canvasDiv.append(this.$wallCanvas);
        this.$canvasDiv.append(this.$tankCanvas);
        this.$canvasDiv.append(this.$grassCanvas);
        this.$canvasDiv.append(this.$overCanvas);
        this.$canvasDiv.append(this.$stageCanvas);
    }

    start() {
        this.menu = new Menu(this.ctx);
        this.map = new TankMap(this.wallCtx, this.grassCtx, this.maxEnemy);
        // this.initMap();
        this.stage = new Stage(this.ctx, this.level, this);
        this.appearEnemy = 0; //已出现的敌方坦克
        this.enemyArray = [];//敌方坦克
        this.keys = [];//记录按下的按键
        this.crackArray = [];//爆炸数组

        // 一定要在所有变量初始化之后再创建玩家啊啊啊啊啊啊啊啊啊啊啊啊
        // 之前player的创建是在this.bulletArray数组初始化之前的
        // 所以player的子弹数组和enemy的子弹数组就不一样了！
        // 导致玩家按了攻击键子弹只画一帧，根本看不到！！！
        // 这个BUG我改了一个半小时才找到！！！
        // 现在22：41了，我还在基地没回寝室，淦！
        this.player1 = new PlayTank(this, this.tankCtx, this.map);
        this.player1.x = 129 + this.map.offsetX;
        this.player1.y = 385 + this.map.offsetY;
        this.player2 = new PlayTank(this, this.tankCtx, this.map);
        // TODO
        this.player2.offsetX = 128; //player2的图片x与图片1相距128
        this.player2.x = 256 + this.map.offsetX;
        this.player2.y = 385 + this.map.offsetY;

        this.isGameOver = false;
        this.overX = 176;
        this.overY = 384;
        this.overCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.enemyStopTime = 0;
        this.homeProtectedTime = -1;
        this.propTime = 1000;

        // my
        this.keyboard = new Keyboard();

        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        $(document).keydown(function (e) {
            switch (outer.gameState) {
                case GAME_STATE_MENU:
                    if (e.keyCode == outer.keyboard.ENTER) {
                        outer.gameState = GAME_STATE_INIT;
                        //只有一个玩家
                        if (outer.menu.playNum == 1) {
                            outer.player2.lives = 0;
                        }
                    } else {
                        let n = 0;
                        if (e.keyCode == outer.keyboard.DOWN) {
                            n = 1;
                        } else if (e.keyCode == outer.keyboard.UP) {
                            n = -1;
                        }
                        outer.menu.next(n);
                    }
                    break;
                case GAME_STATE_START:
                    if (!outer.keys.includes(e.keyCode)) {
                        outer.keys.push(e.keyCode);
                    }
                    //射击
                    if (e.keyCode == outer.keyboard.SPACE && outer.player1.lives > 0) {
                        outer.player1.shoot(BULLET_TYPE_PLAYER);
                    } else if (e.keyCode == outer.keyboard.ENTER && outer.player2.lives > 0) {
                        outer.player2.shoot(BULLET_TYPE_ENEMY);
                    } else if (e.keyCode == outer.keyboard.N) {
                        outer.nextLevel();
                    } else if (e.keyCode == outer.keyboard.P) {
                        outer.preLevel();
                    }
                    break;
            }
        });

        $(document).keyup(function (e) {
            for (let i = 0; i < outer.keys.length; i++) {
                if (outer.keys[i] === e.keyCode) {
                    outer.keys.splice(i, 1);
                }
            }
        });

    }

    // 动态修改GameMap的长宽
    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.resize_all_canvas();
    }

    resize_all_canvas() {
        this.$canvasDiv.css({ "width": SCREEN_WIDTH });
        this.$canvasDiv.css({ "height": SCREEN_HEIGHT });

        this.$stageCanvas.attr({ "width": SCREEN_WIDTH });
        this.$stageCanvas.attr({ "height": SCREEN_HEIGHT });

        this.$wallCanvas.attr({ "width": SCREEN_WIDTH });
        this.$wallCanvas.attr({ "height": SCREEN_HEIGHT });

        this.$grassCanvas.attr({ "width": SCREEN_WIDTH });
        this.$grassCanvas.attr({ "height": SCREEN_HEIGHT });

        this.$tankCanvas.attr({ "width": SCREEN_WIDTH });
        this.$tankCanvas.attr({ "height": SCREEN_HEIGHT });

        this.$overCanvas.attr({ "width": SCREEN_WIDTH });
        this.$overCanvas.attr({ "height": SCREEN_HEIGHT });

        this.start();
    }

    update() {
        this.render();
    }

    // 渲染游戏地图
    render() {
        switch (this.gameState) {
            case GAME_STATE_MENU:
                this.menu.draw();
                break;
            case GAME_STATE_INIT:
                this.stage.draw();
                if (this.stage.isReady == true) {
                    this.gameState = GAME_STATE_START;
                }
                break;
            case GAME_STATE_START:
                this.drawAll();
                if (this.isGameOver || (this.player1.lives <= 0 && this.player2.lives <= 0)) {
                    this.gameState = GAME_STATE_OVER;
                    this.map.homeHit();
                    PLAYER_DESTROY_AUDIO.play();
                }
                if (this.appearEnemy == this.maxEnemy && this.enemyArray.length == 0) {
                    this.gameState = GAME_STATE_WIN;
                }
                break;
            case GAME_STATE_WIN:
                this.nextLevel();
                break;
            case GAME_STATE_OVER:
                this.gameOver();
                break;
        }
    }

    initMap() {
        this.map.setMapLevel(this.level);;
        this.map.draw();
        this.drawLives();
    }

    drawLives() {
        this.map.drawLives(this.player1.lives, 1);
        this.map.drawLives(this.player2.lives, 2);
    }

    drawBullet() {
        if (this.bulletArray != null && this.bulletArray.length > 0) {
            for (let i = 0; i < this.bulletArray.length; i++) {
                let bulletObj = this.bulletArray[i];
                bulletObj.draw();
            }
        }
    }

    // TODO
    keyEvent() {
        if (this.keys.includes(this.keyboard.W)) {
            this.player1.dir = UP;
            this.player1.hit = false;
            this.player1.move();
        } else if (this.keys.includes(this.keyboard.S)) {
            this.player1.dir = DOWN;
            this.player1.hit = false;
            this.player1.move();
        } else if (this.keys.includes(this.keyboard.A)) {
            this.player1.dir = LEFT;
            this.player1.hit = false;
            this.player1.move();
        } else if (this.keys.includes(this.keyboard.D)) {
            this.player1.dir = RIGHT;
            this.player1.hit = false;
            this.player1.move();
        }

        if (this.keys.includes(this.keyboard.UP)) {
            this.player2.dir = UP;
            this.player2.hit = false;
            this.player2.move();
        } else if (this.keys.includes(this.keyboard.DOWN)) {
            this.player2.dir = DOWN;
            this.player2.hit = false;
            this.player2.move();
        } else if (this.keys.includes(this.keyboard.LEFT)) {
            this.player2.dir = LEFT;
            this.player2.hit = false;
            this.player2.move();
        } else if (this.keys.includes(this.keyboard.RIGHT)) {
            this.player2.dir = RIGHT;
            this.player2.hit = false;
            this.player2.move();
        }
    }

    addEnemyTank() {
        if (this.enemyArray == null || this.enemyArray.length >= this.maxAppearEnemy || this.maxEnemy == 0) {
            return;
        }
        this.appearEnemy++;
        // 随机一个[1, 3]的整数用于生成不同的敌人坦克
        let rand = parseInt(Math.random() * 3) + 1;
        let obj = null;
        // TODO
        if (rand == 1) {
            obj = new EnemyTank(this, this.tankCtx, this.map, rand);
        } else if (rand == 2) {
            obj = new EnemyTank(this, this.tankCtx, this.map, rand);
        } else if (rand == 3) {
            obj = new EnemyTank(this, this.tankCtx, this.map, rand);
        }
        obj.x = ENEMY_LOCATION[parseInt(Math.random() * 3)] + this.map.offsetX;
        obj.y = this.map.offsetY;
        obj.dir = DOWN;
        this.enemyArray.push(obj);
        //更新地图右侧坦克数
        this.map.clearEnemyNum(this.maxEnemy, this.appearEnemy);
    }

    drawEnemyTanks() {
        if (this.enemyArray != null || this.enemyArray.length > 0) {
            for (let i = 0; i < this.enemyArray.length; i++) {
                let enemyObj = this.enemyArray[i];
                if (enemyObj.isDestroyed) {
                    this.enemyArray.splice(i, 1);
                    i--;
                } else {
                    enemyObj.draw();
                }
            }
        }
        if (this.enemyStopTime > 0) {
            this.enemyStopTime--;
        }
    }

    drawAll() {
        this.tankCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        if (this.player1.lives > 0) {
            this.player1.draw();
        }
        if (this.player2.lives > 0) {
            this.player2.draw();
        }
        this.drawLives();
        if (this.appearEnemy < this.maxEnemy) {
            if (this.mainframe % 100 == 0) {
                this.addEnemyTank();
                this.mainframe = 0;
            }
            this.mainframe++;
        }
        this.drawEnemyTanks();
        this.drawBullet();
        this.drawCrack();
        this.keyEvent();
        // 绘制道具
        if (this.propTime <= 0) {
            this.drawProp();
        } else {
            this.propTime--;
        }
        if (this.homeProtectedTime > 0) {
            this.homeProtectedTime--;
        } else if (this.homeProtectedTime == 0) {
            this.homeProtectedTime = -1;
            this.homeNoProtected();
        }
    }

    drawCrack() {
        if (this.crackArray != null && this.crackArray.length > 0) {
            for (let i = 0; i < this.crackArray.length; i++) {
                let crackObj = this.crackArray[i];
                if (crackObj.isOver) {
                    this.crackArray.splice(i, 1);
                    i--;
                    if (crackObj.owner == this.player1) {
                        this.player1.renascenc(1);
                    } else if (crackObj.owner == this.player2) {
                        this.player2.renascenc(2);
                    }
                } else {
                    crackObj.draw();
                }
            }
        }
    }

    gameOver() {
        while (this.bulletArray.length > 0) {
            this.bulletArray.pop();
        }
        this.overCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.overCtx.drawImage(RESOURCE_IMAGE, POS["over"][0], POS["over"][1], 64, 32, this.overX * MAGNIFICATION + this.map.offsetX, this.overY * MAGNIFICATION + this.map.offsetY, 64 * MAGNIFICATION, 32 * MAGNIFICATION);
        this.overY -= 2;
        if (this.overY <= parseInt(this.map.mapHeight / 2)) {
            this.start();
            //只有一个玩家
            if (this.menu.playNum == 1) {
                this.player2.lives = 0;
            }
            this.gameState = GAME_STATE_MENU;
        }
    }

    nextLevel() {
        this.level++;
        if (this.level == 21) {
            this.level = 1;
        }
        this.start();
        //只有一个玩家
        if (this.menu.playNum == 1) {
            this.player2.lives = 0;
        }
        this.stage.init(this.level);
        this.gameState = GAME_STATE_INIT;
    }

    preLevel() {
        this.level--;
        if (this.level == 0) {
            this.level = 20;
        }
        this.start();
        //只有一个玩家
        if (this.menu.playNum == 1) {
            this.player2.lives = 0;
        }
        this.stage.init(this.level);
        this.gameState = GAME_STATE_INIT;
    }

    drawProp() {
        let rand = Math.random();
        if (rand < 0.4 && this.prop == null) {
            this.prop = new Prop(this, this.overCtx, this.map, this.player1, this.player2);
            this.prop.init();
        }
        if (this.prop != null) {
            this.prop.draw();
            if (this.prop.isDestroyed) {
                this.prop = null;
                this.propTime = 1000;
            }
        }
    }

    homeNoProtected() {
        let mapChangeIndex = [[23, 11], [23, 12], [23, 13], [23, 14], [24, 11], [24, 14], [25, 11], [25, 14]];
        this.map.updateMap(mapChangeIndex, WALL);
    }

    on_destroy() {
        this.gameState = GAME_STATE_OVER;
        while (this.enemyArray && this.enemyArray.length > 0) {
            this.enemyArray[0].destroy();
            this.enemyArray.splice(0, 1);
        }

        while (this.bulletArray && this.bulletArray.length > 0) {
            this.bulletArray[0].destroy();
            this.bulletArray.splice(0, 1);
        }

        if (this.keys && this.keys.length > 0) {
            this.keys = [];
        }

        if (this.crackArray && this.crackArray.length > 0) {
            this.crackArray = [];
        }

        if (this.player1) {
            this.player1.destroy();
            this.player1 = null;
        }

        if (this.player2) {
            this.player2.destroy();
            this.player2 = null;
        }

        this.menu.destroy();
        this.menu = null;

        this.map.destroy();
        this.map = null;

        this.stage.destroy();
        this.stage = null;

        this.$canvasDiv.empty();

        this.$canvasDiv.hide();
    }

    hide() {
        this.$canvasDiv.hide();
    }
}