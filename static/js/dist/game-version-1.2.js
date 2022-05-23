class AcGameMenu {
    // root就是web.html里的ac_game对象
    constructor(root) {
        this.root = root;
        // 前面加$表示js对象
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            开始游戏
        </div>
        </br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出
        </div>
    </div>
</div>
`);
        this.$menu.hide();
        // 将menu对象添加到ac_game对象中，这样就能动态更改页面了
        this.root.$ac_game.append(this.$menu);

        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function () {
            outer.hide();
            outer.root.playground.show();
        });
        this.$settings.click(function () {
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        // 使用的是jQuery的API
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
} let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0;  // 当前距离上一帧的时间间隔（单位：ms）
        this.uuid = this.create_uuid();
    }

    // 创建一个唯一编号，用于识别每一个对象
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10)); // 返回[0, 1)
            res += x;
        }
        return res;
    }

    start() {  // 只会在第一帧执行

    }

    update() {  // 每一帧都会执行一次

    }

    late_update() {  // 在每一帧的最后执行一次

    }

    on_destroy() {  // 在被销毁前执行一次

    }

    destroy() {  // 销毁该物体
        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
            if (AC_GAME_OBJECTS[i].uuid === this.uuid) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function (timestamp) {

    for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();  // 如果是子类就会先找子类的update()函数执行，如果没有的话就执行基类的，所以只要继承了这个基类就会每秒自动执行60次update()
        }
    }

    // 在前面都绘制完成了之后调用late_update，这样就能实现将某些对象显示在最上面了
    for (let i = 1; i < AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        obj.late_update();
    }

    last_timestamp = timestamp;

    // 递归调用，这样就会每一帧调用一次了
    requestAnimationFrame(AC_GAME_ANIMATION);
}

// 会将函数的执行时间控制在1/60秒（这一整行是一帧）
requestAnimationFrame(AC_GAME_ANIMATION);

class Bullet extends AcGameObject {
    constructor(game_map, context, owner, type, dir, map, bulletArray, isAI) {
        super();  // 调用基类的构造函数
        this.game_map = game_map;
        this.player1 = this.game_map.player1;
        this.player2 = this.game_map.player2;
        this.crackArray = this.game_map.crackArray;
        this.enemyArray = this.game_map.enemyArray;
        this.ctx = context;
        this.owner = owner; //子弹的所属者
        this.type = type;//1、玩家  2、敌人
        this.dir = dir;
        this.map = map;
        this.bulletArray = bulletArray;
        this.isAI = isAI;
        this.x = 0;
        this.y = 0;
        this.speed = 3;
        this.size = 6;
        this.hit = false;
        this.isDestroyed = false;
        this.isDraw = false;
    }

    draw() {
        this.ctx.drawImage(RESOURCE_IMAGE, POS["bullet"][0] + this.dir * this.size, POS["bullet"][1], this.size, this.size, this.x * MAGNIFICATION, this.y * MAGNIFICATION, this.size * MAGNIFICATION, this.size * MAGNIFICATION);
        this.isDraw = true;
        this.move();
    }

    move() {
        if (this.dir == UP) {
            this.y -= this.speed;
        } else if (this.dir == DOWN) {
            this.y += this.speed;
        } else if (this.dir == RIGHT) {
            this.x += this.speed;
        } else if (this.dir == LEFT) {
            this.x -= this.speed;
        }

        this.isHit();
    }

    /**
     * 碰撞检测
     */
    isHit() {
        if (this.isDestroyed) {
            return;
        }
        //临界检测
        if (this.x < this.map.offsetX) {
            this.x = this.map.offsetX;
            this.hit = true;
        } else if (this.x > this.map.offsetX + this.map.mapWidth - this.size) {
            this.x = this.map.offsetX + this.map.mapWidth - this.size;
            this.hit = true;
        }
        if (this.y < this.map.offsetY) {
            this.y = this.map.offsetY;
            this.hit = true;
        } else if (this.y > this.map.offsetY + this.map.mapHeight - this.size) {
            this.y = this.map.offsetY + this.map.mapHeight - this.size;
            this.hit = true;
        }
        //子弹是否碰撞了其他子弹
        if (!this.hit) {
            if (this.bulletArray != null && this.bulletArray.length > 0) {
                for (var i = 0; i < this.bulletArray.length; i++) {
                    if (this.bulletArray[i] != this && this.owner.isAI != this.bulletArray[i].owner.isAI && this.bulletArray[i].hit == false && CheckIntersect(this.bulletArray[i], this, 0)) {
                        this.hit = true;
                        this.bulletArray[i].hit = true;
                        break;
                    }
                }
            }
        }

        if (!this.hit) {
            //地图检测
            if (bulletMapCollision(this, this.map, this.game_map)) {
                this.hit = true;
            }
            //是否击中坦克
            if (this.type == BULLET_TYPE_PLAYER) {
                if (this.enemyArray != null || this.enemyArray.length > 0) {
                    for (var i = 0; i < this.enemyArray.length; i++) {
                        var enemyObj = this.enemyArray[i];
                        if (!enemyObj.isDestroyed && CheckIntersect(this, enemyObj, 0)) {
                            CheckIntersect(this, enemyObj, 0);
                            if (enemyObj.lives > 1) {
                                enemyObj.lives--;
                            } else {
                                enemyObj.destroy();
                            }
                            this.hit = true;
                            break;
                        }
                    }
                }
            } else if (this.type == BULLET_TYPE_ENEMY) {
                if (this.player1.lives > 0 && CheckIntersect(this, this.player1, 0)) {
                    if (!this.player1.isProtected && !this.player1.isDestroyed) {
                        this.player1.destroy();
                    }
                    this.hit = true;
                } else if (this.player2.lives > 0 && CheckIntersect(this, this.player2, 0)) {
                    if (!this.player2.isProtected && !this.player2.isDestroyed) {
                        this.player2.destroy();
                    }
                    this.hit = true;
                }
            }
        }

        if (this.hit) {
            this.destroy();
        }
    }

    on_destroy() {
        this.play_destroy_audio();
        this.owner.isShooting = false;
        this.isDestroyed = true;

        for (let i = 0; i < this.bulletArray.length; i++) {
            if (this.bulletArray[i] === this) {
                this.bulletArray.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 销毁
     */
    play_destroy_audio() {
        this.isDestroyed = true;
        this.crackArray.push(new CrackAnimation(CRACK_TYPE_BULLET, this.ctx, this));
        if (!this.owner.isAI) {
            BULLET_DESTROY_AUDIO.play();
        }
    }
}

/**
 * 检测2个物体是否碰撞
 * @param object1 物体1
 * @param object2 物体2
 * @param overlap 允许重叠的大小
 * @returns {Boolean} 如果碰撞了，返回true
 */
function CheckIntersect(object1, object2, overlap) {
    //    x-轴                      x-轴
    //  A1------>B1 C1              A2------>B2 C2
    //  +--------+   ^              +--------+   ^
    //  | object1|   | y-轴         | object2|   | y-轴
    //  |        |   |              |        |   |
    //  +--------+  D1              +--------+  D2
    //
    //overlap是重叠的区域值
    let A1 = object1.x + overlap;
    let B1 = object1.x + object1.size - overlap;
    let C1 = object1.y + overlap;
    let D1 = object1.y + object1.size - overlap;

    let A2 = object2.x + overlap;
    let B2 = object2.x + object2.size - overlap;
    let C2 = object2.y + overlap;
    let D2 = object2.y + object2.size - overlap;

    //假如他们在x-轴重叠
    if (A1 >= A2 && A1 <= B2
        || B1 >= A2 && B1 <= B2) {
        //判断y-轴重叠
        if (C1 >= C2 && C1 <= D2 || D1 >= C2 && D1 <= D2) {
            return true;
        }
    }
    return false;
}



/**
 * 子弹与地图块的碰撞
 * @param bullet 子弹对象
 * @param mapobj 地图对象
 */
function bulletMapCollision(bullet, mapobj, game_map) {
    let tileNum = 0;//需要检测的tile数
    let rowIndex = 0;//map中的行索引
    let colIndex = 0;//map中的列索引
    let mapChangeIndex = [];//map中需要更新的索引数组
    let result = false;//是否碰撞
    //根据bullet的x、y计算出map中的row和col
    if (bullet.dir == UP) {
        rowIndex = parseInt((bullet.y - mapobj.offsetY) / mapobj.tileSize);
        colIndex = parseInt((bullet.x - mapobj.offsetX) / mapobj.tileSize);
    } else if (bullet.dir == DOWN) {
        //向下，即dir==1的时候，行索引的计算需要+bullet.Height
        rowIndex = parseInt((bullet.y - mapobj.offsetY + bullet.size) / mapobj.tileSize);
        colIndex = parseInt((bullet.x - mapobj.offsetX) / mapobj.tileSize);
    } else if (bullet.dir == LEFT) {
        rowIndex = parseInt((bullet.y - mapobj.offsetY) / mapobj.tileSize);
        colIndex = parseInt((bullet.x - mapobj.offsetX) / mapobj.tileSize);
    } else if (bullet.dir == RIGHT) {
        rowIndex = parseInt((bullet.y - mapobj.offsetY) / mapobj.tileSize);
        //向右，即dir==3的时候，列索引的计算需要+bullet.Height
        colIndex = parseInt((bullet.x - mapobj.offsetX + bullet.size) / mapobj.tileSize);
    }
    if (rowIndex >= mapobj.HTileCount || rowIndex < 0 || colIndex >= mapobj.wTileCount || colIndex < 0) {
        return true;
    }

    if (bullet.dir == UP || bullet.dir == DOWN) {
        let tempWidth = parseInt(bullet.x - mapobj.offsetX - (colIndex) * mapobj.tileSize + bullet.size);
        if (tempWidth % mapobj.tileSize == 0) {
            tileNum = parseInt(tempWidth / mapobj.tileSize);
        } else {
            tileNum = parseInt(tempWidth / mapobj.tileSize) + 1;
        }
        for (let i = 0; i < tileNum && colIndex + i < mapobj.wTileCount; i++) {
            let mapContent = mapobj.mapLevel[rowIndex][colIndex + i];
            if (mapContent == WALL || mapContent == GRID || mapContent == HOME || mapContent == ANOTHREHOME) {
                result = true;
                if (mapContent == WALL) {
                    //墙被打掉
                    mapChangeIndex.push([rowIndex, colIndex + i]);
                } else if (mapContent == GRID) {

                } else {
                    game_map.isGameOver = true;
                    break;
                }
            }
        }
    } else {
        let tempHeight = parseInt(bullet.y - mapobj.offsetY - (rowIndex) * mapobj.tileSize + bullet.size);
        if (tempHeight % mapobj.tileSize == 0) {
            tileNum = parseInt(tempHeight / mapobj.tileSize);
        } else {
            tileNum = parseInt(tempHeight / mapobj.tileSize) + 1;
        }
        for (let i = 0; i < tileNum && rowIndex + i < mapobj.HTileCount; i++) {
            let mapContent = mapobj.mapLevel[rowIndex + i][colIndex];
            if (mapContent == WALL || mapContent == GRID || mapContent == HOME || mapContent == ANOTHREHOME) {
                result = true;
                if (mapContent == WALL) {
                    //墙被打掉
                    mapChangeIndex.push([rowIndex + i, colIndex]);
                } else if (mapContent == GRID) {

                } else {
                    game_map.isGameOver = true;
                    break;
                }
            }
        }
    }
    //更新地图
    mapobj.updateMap(mapChangeIndex, 0);
    return result;
}
/**
 * 静态变量
 */

let MAGNIFICATION = 1;
let BASE_SCREEN_WIDTH = 512;
let BASE_SCREEN_HEIGHT = 448;
let SCREEN_WIDTH = 512; //屏幕宽
let SCREEN_HEIGHT = 448; //屏幕高


/**************图片资源*****************/
let MENU_IMAGE = new Image();
MENU_IMAGE.src = "https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/playground/menu.gif";
let RESOURCE_IMAGE = new Image();
RESOURCE_IMAGE.src = "https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/playground/tankAll.gif";


/**************各个图块在图片中的位置*****************/
let POS = new Array();
POS["selectTank"] = [128, 96];
POS["stageLevel"] = [396, 96];
POS["num"] = [256, 96];
POS["map"] = [0, 96];
POS["home"] = [256, 0];
POS["score"] = [0, 112];
POS["player"] = [0, 0];
POS["protected"] = [160, 96];
POS["enemyBefore"] = [256, 32];
POS["enemy1"] = [0, 32];
POS["enemy2"] = [128, 32];
POS["enemy3"] = [0, 64];
POS["bullet"] = [80, 96];
POS["tankBomb"] = [0, 160];
POS["bulletBomb"] = [320, 0];
POS["over"] = [384, 64];
POS["prop"] = [256, 110];

/**************声音资源*****************/
let START_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/start.mp3");
let BULLET_DESTROY_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/bulletCrack.mp3");
let TANK_DESTROY_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/tankCrack.mp3");
let PLAYER_DESTROY_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/playerCrack.mp3");
let MOVE_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/move.mp3");
let ATTACK_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/attack.mp3");
let PROP_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/prop.mp3");


/**************游戏状态*****************/
let GAME_STATE_MENU = 0;
let GAME_STATE_INIT = 1;
let GAME_STATE_START = 2;
let GAME_STATE_OVER = 3;
let GAME_STATE_WIN = 4;

/**************地图块*****************/
let WALL = 1;
let GRID = 2;
let GRASS = 3;
let WATER = 4;
let ICE = 5;
let HOME = 9;
let ANOTHREHOME = 8;

/**************坦克及子弹的四个方向*****************/
let UP = 0;
let DOWN = 1;
let LEFT = 2;
let RIGHT = 3;

/**************坦克及子弹的四个方向*****************/
let ENEMY_LOCATION = [192, 0, 384]; //相对与主游戏区

/**************子弹类型*****************/
let BULLET_TYPE_PLAYER = 1;
let BULLET_TYPE_ENEMY = 2;
/**************爆炸类型****************/
let CRACK_TYPE_TANK = "tank";
let CRACK_TYPE_BULLET = "bullet";



// 爆炸动画
var CrackAnimation = function (type, context, crackObj) {
    this.ctx = context;
    this.owner = crackObj;
    this.times = 0;
    this.frame = 0;
    this.x = 0;
    this.y = 0;
    this.posName = "";
    this.size = 0;
    this.isOver = false;
    this.tempDir = 1;

    if (type == CRACK_TYPE_TANK) {
        this.posName = "tankBomb";
        this.size = 66;
        this.frame = 4;
    } else {
        this.posName = "bulletBomb";
        this.size = 32;
        this.frame = 3;
    }
    this.x = crackObj.x + (parseInt(crackObj.size - this.size) / 2);
    this.y = crackObj.y + (parseInt(crackObj.size - this.size) / 2);

    this.draw = function () {
        var gaptime = 3;
        var temp = parseInt(this.times / gaptime);
        var temp = parseInt(this.times / gaptime);
        this.ctx.drawImage(RESOURCE_IMAGE, POS[this.posName][0] + temp * this.size, POS[this.posName][1], this.size, this.size, this.x * MAGNIFICATION, this.y * MAGNIFICATION, this.size * MAGNIFICATION, this.size * MAGNIFICATION);
        this.times += this.tempDir;
        if (this.times > this.frame * gaptime - parseInt(gaptime / 2)) {
            this.tempDir = -1;
        }
        if (this.times <= 0) {
            this.isOver = true;
        }
    };
};

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
}/**
 * 键盘按钮
 */
class Keyboard {
    constructor() {
        this.UP = 38;
        this.DOWN = 40;
        this.RIGHT = 39;
        this.LEFT = 37;

        this.SPACE = 32;
        this.TAB = 9;
        this.ENTER = 13;
        this.CTRL = 17;
        this.ALT = 18;

        this.Num0 = 48;
        this.Num1 = 49;
        this.Num2 = 50;
        this.Num3 = 51;
        this.Num4 = 52;
        this.Num5 = 53;
        this.Num6 = 54;
        this.Num7 = 55;
        this.Num8 = 56;
        this.Num9 = 57;

        this.A = 65;
        this.B = 66;
        this.C = 67;
        this.D = 68;
        this.E = 69;
        this.F = 70;
        this.G = 71;
        this.H = 72;
        this.I = 73;
        this.J = 74;
        this.K = 75;
        this.L = 76;
        this.M = 77;
        this.N = 78;
        this.O = 79;
        this.P = 80;
        this.Q = 81;
        this.R = 82;
        this.S = 83;
        this.T = 84;
        this.U = 85;
        this.V = 86;
        this.W = 87;
        this.X = 88;
        this.Y = 89;
        this.Z = 90;
    }
}
/**
 * 地图数组
 * 1：水泥墙 2：铁墙 3：草 4：水 5：冰 9：家
 */
var map1 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1],
        [2, 2, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

var map2 =
    [
        [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
        [3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1, 1, 3, 3, 1, 1, 2, 2],
        [3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1, 1, 3, 3, 1, 1, 2, 2],
        [3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 2, 2, 0, 0, 3, 3, 0, 0, 0, 0],
        [3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 2, 2, 0, 0, 3, 3, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 2, 2, 0, 0, 0, 0, 3, 3, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 2, 2, 0, 0, 0, 0, 3, 3, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [2, 2, 1, 1, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [2, 2, 1, 1, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    ];
var map3 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
        [0, 0, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 3, 3, 0, 0],
        [0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 3, 3, 0, 0],
        [0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3],
        [1, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 0, 0],
        [1, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
        [1, 1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
        [1, 1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
        [2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    ];

var map4 =
    [
        [0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0],
        [0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0],
        [3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3],
        [3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 3, 3],
        [3, 3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2],
        [3, 3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [2, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
        [4, 4, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [4, 4, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 4, 4, 4, 4],
        [0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 4, 4, 4, 4],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 3, 3],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 3, 3],
        [3, 3, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 3, 3, 3, 3],
        [3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3],
        [2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 3, 3, 3, 3, 2, 2],
        [2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 3, 3, 3, 3, 2, 0],
    ];

var map5 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0],
        [2, 2, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
        [2, 2, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 4, 4, 4, 4, 0, 0, 4, 4],
        [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 4, 4, 4, 4, 0, 0, 4, 4],
        [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 0, 0, 4, 4, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 4, 4, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
        [4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0],
        [4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];



var map6 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 1, 3, 3],
        [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 1, 3, 3],
        [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 3, 3, 1, 0, 0, 1, 3, 3],
        [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 3, 3, 1, 0, 0, 1, 3, 3],
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 1, 1, 3, 3, 0, 0, 1, 1, 3, 3],
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 1, 1, 3, 3, 0, 0, 1, 1, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 0, 0, 1, 1, 0, 0, 1, 1, 2, 0, 0, 0, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 2, 0, 0, 0, 3, 3, 3, 3],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3, 1, 1, 3, 3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3, 1, 1, 3, 3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 1, 1, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 1, 1, 1, 1, 2, 2],
        [2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2],
        [2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3],
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3],
    ];

var map7 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0],
        [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
        [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
        [0, 0, 2, 2, 0, 0, 3, 3, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 2, 2, 0, 0, 3, 3, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0],
        [2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2, 0, 0],
        [2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2, 0, 0],
        [0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 3, 3, 0, 0, 0, 0, 2, 2, 0, 0],
        [0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 3, 3, 0, 0, 0, 0, 2, 2, 0, 0],
        [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0],
        [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0],
        [0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];


var map8 =
    [
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0],
        [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
        [3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4],
        [3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 3, 3, 1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 3, 3, 1, 1, 2, 2, 2, 2, 1, 1],
        [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0],
        [4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4],
        [4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4],
        [3, 3, 3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [3, 3, 3, 3, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 2, 1, 1, 1, 1, 0, 0],
        [3, 3, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [3, 3, 2, 2, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    ];

var map9 =
    [
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 2, 2, 2, 2, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 0, 2, 2, 2, 2, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 2, 2, 2, 2, 0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 3, 3, 0, 0, 3, 3, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0],
        [2, 2, 1, 1, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 3, 3, 2, 2],
        [2, 2, 1, 1, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 3, 3, 2, 2],
        [0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 3, 3, 0, 0, 3, 3, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 3, 3, 2, 2, 3, 3, 0, 0, 3, 3, 2, 2, 3, 3, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 3, 3, 2, 2, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    ];


var map10 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 2, 2, 2, 2, 3, 3, 1, 1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 2, 2, 2, 2, 3, 3, 1, 1, 1, 0, 0, 0, 1, 1],
        [0, 1, 0, 0, 0, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 0, 0, 1, 1, 0, 0, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 0, 0, 1, 1, 0, 0, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1],
        [1, 1, 3, 3, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 1, 1],
        [1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1],
        [1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1],
        [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
        [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 1, 1, 1, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    ];

var map11 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 2, 2],
        [0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 3, 3, 3, 3, 0, 0, 2, 2],
        [0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 3, 3, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 3, 3, 0, 0, 0, 1],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0],
        [2, 2, 1, 1, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0],
        [2, 2, 1, 1, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0],
        [0, 1, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 1, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 4, 4, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 4, 4, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 3, 3, 3, 3, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

var map12 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 1, 1, 0, 0, 2, 2, 2, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 4, 4, 0, 0, 1, 1, 0, 0, 2, 2, 2, 0, 1, 1, 0, 0],
        [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 1, 1, 1, 1, 0, 0],
        [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 4, 0, 0, 0, 0, 0, 0, 4, 4, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 4, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0],
        [4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 1, 1, 1, 1, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0],
        [4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 1, 1, 1, 1, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

var map13 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
        [0, 0, 2, 2, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1],
        [0, 0, 1, 1, 0, 0, 1, 0, 3, 3, 0, 0, 2, 2, 0, 0, 3, 3, 0, 1, 0, 0, 2, 2, 1, 1],
        [0, 0, 1, 1, 0, 0, 0, 0, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 0, 1, 0, 0, 2, 2, 1, 1],
        [0, 0, 1, 1, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 2, 2, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 2, 2, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 2, 2, 0, 0, 1, 0, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 0, 1, 0, 0, 1, 1, 0, 0],
        [1, 1, 2, 2, 0, 0, 1, 0, 3, 3, 0, 0, 2, 2, 0, 0, 3, 3, 0, 1, 0, 0, 1, 1, 0, 0],
        [1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 2, 2, 0, 0],
        [1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
var map14 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3],
        [3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 3, 3, 3, 3],
        [3, 3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3],
        [3, 3, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 1, 1, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [3, 3, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 3, 3],
        [3, 3, 0, 0, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 3, 3],
        [3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 3, 3, 1, 1, 3, 3, 1, 1, 0, 0, 0, 0, 3, 3, 3, 3],
        [3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 3, 3, 3, 3],
        [4, 4, 4, 4, 4, 4, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 4, 4, 4, 4, 4, 4],
        [4, 4, 4, 4, 4, 4, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 4, 4, 4, 4, 4, 4],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0],
        [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
        [2, 0, 2, 0, 2, 0, 0, 2, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 0, 2, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0, 2]
    ];
var map15 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [3, 3, 2, 2, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2],
        [3, 3, 0, 0, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2],
        [3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 1, 1, 2, 0, 1, 1, 0, 0],
        [3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 0, 0, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 3, 3, 3, 3, 1, 1, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 3, 3, 3, 3, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 1, 0, 3, 3, 3, 3],
        [0, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 3, 3, 3, 3],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 1, 0, 3, 3],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 2, 2, 1, 1, 0, 0, 3, 3, 3, 3, 1, 1, 1, 0, 3, 3],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 3, 3],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 3, 3],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3],
        [0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 1, 3, 3, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 0, 1, 1, 1, 1, 0, 1, 1, 3, 3, 0, 0, 3, 3, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0]
    ];

var map16 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 2, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 2, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 2, 2],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 2, 2],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3],
        [2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3],
        [2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3],
        [2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 1, 9, 8, 1, 0, 3, 3, 0, 0, 0, 0, 3, 3, 3, 3],
        [2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 1, 8, 8, 1, 0, 3, 3, 0, 0, 0, 0, 3, 3, 3, 3]
    ];
var map17 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0],
        [3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0],
        [3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0],
        [3, 3, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
        [3, 3, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
        [3, 3, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
        [3, 3, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
        [3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 1, 1, 1, 1, 1, 0],
        [3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 1, 1, 1, 1, 1, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2],
        [2, 2, 0, 0, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 2, 2],
        [2, 2, 0, 0, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [0, 0, 2, 2, 1, 1, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 0],
        [0, 0, 2, 2, 1, 1, 0, 0, 2, 2, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

var map18 =
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 3, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 3, 3, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0],
        [1, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 0, 0],
        [1, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 0, 0],
        [0, 0, 1, 1, 3, 3, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 1, 1, 2, 2, 2, 2, 0, 0],
        [0, 0, 1, 1, 3, 3, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 1, 1, 2, 2, 2, 2, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 2, 2, 1, 1, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 2, 2, 1, 1, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 1, 1, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 1, 1, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 2, 2, 2, 2, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [2, 2, 2, 2, 2, 2, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 0, 0, 0, 0],
        [2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 0, 0, 0, 0],
        [2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 1, 1, 0, 0],
        [2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 1, 1, 0, 0],
        [3, 3, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2],
        [3, 3, 2, 2, 2, 2, 2, 2, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2]
    ];

var map19 =
    [
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
        [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
        [2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 3, 3, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 3, 3, 3, 3],
        [3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 3, 3, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

var map20 =
    [
        [0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
        [2, 2, 0, 0, 1, 1, 4, 4, 0, 0, 2, 2, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 4, 4, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 4, 4, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 4, 4, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 1, 1, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 1, 1, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 4, 4, 0, 0, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 0, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0],
        [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3],
        [0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 3, 3, 3, 3, 3, 3],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 4, 4, 3, 3, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0]
    ];
// var map21 =
//     [
//         [0, 0, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
//         [4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 2, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 3],
//         [4, 0, 2, 4, 1, 1, 4, 1, 3, 3, 3, 4, 3, 0, 2, 4, 2, 2, 4, 0, 0, 0, 3, 3, 3, 3],
//         [4, 0, 2, 4, 4, 4, 4, 0, 3, 0, 0, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 3, 2, 0, 0],
//         [4, 0, 2, 0, 3, 3, 3, 3, 3, 2, 2, 2, 3, 2, 2, 5, 5, 5, 5, 5, 0, 4, 3, 2, 0, 0],
//         [4, 4, 4, 0, 3, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 5, 0, 1, 0, 0, 0, 4, 3, 2, 0, 4],
//         [0, 0, 4, 0, 3, 0, 0, 0, 2, 4, 4, 4, 4, 4, 3, 5, 3, 3, 3, 0, 0, 4, 3, 2, 0, 4],
//         [0, 0, 4, 1, 3, 0, 0, 0, 2, 4, 0, 5, 5, 5, 5, 5, 1, 1, 3, 0, 0, 4, 4, 4, 4, 4],
//         [0, 3, 4, 3, 3, 1, 0, 0, 3, 4, 3, 5, 3, 4, 0, 0, 1, 1, 3, 3, 3, 3, 3, 2, 0, 4],
//         [0, 3, 4, 0, 1, 0, 1, 0, 3, 4, 0, 5, 3, 4, 4, 4, 4, 3, 3, 3, 1, 1, 0, 2, 0, 4],
//         [4, 4, 4, 0, 1, 4, 4, 4, 4, 4, 0, 5, 1, 1, 0, 0, 4, 1, 0, 3, 1, 1, 0, 2, 4, 4],
//         [4, 3, 2, 0, 1, 0, 1, 0, 5, 5, 5, 5, 1, 0, 1, 2, 4, 3, 3, 3, 3, 3, 2, 2, 4, 0],
//         [4, 3, 2, 1, 1, 1, 0, 0, 5, 1, 1, 3, 1, 1, 0, 2, 4, 1, 0, 3, 1, 3, 0, 0, 4, 0],
//         [4, 3, 2, 1, 1, 0, 0, 0, 5, 0, 1, 3, 1, 0, 4, 4, 4, 3, 4, 4, 4, 3, 0, 0, 4, 0],
//         [4, 3, 3, 3, 3, 3, 0, 0, 5, 3, 3, 3, 1, 0, 4, 3, 0, 1, 4, 0, 4, 4, 4, 3, 4, 0],
//         [4, 0, 2, 0, 1, 5, 5, 5, 5, 4, 4, 0, 1, 0, 4, 3, 2, 2, 4, 2, 0, 1, 4, 3, 4, 4],
//         [4, 0, 2, 1, 1, 5, 4, 1, 3, 1, 4, 1, 1, 1, 4, 3, 0, 1, 4, 2, 0, 1, 4, 3, 0, 4],
//         [4, 4, 4, 4, 1, 5, 4, 0, 3, 3, 4, 3, 3, 3, 4, 3, 0, 1, 4, 2, 0, 1, 4, 3, 0, 4],
//         [0, 0, 2, 4, 1, 5, 4, 0, 3, 0, 4, 4, 4, 4, 4, 0, 0, 1, 4, 2, 0, 1, 4, 4, 3, 4],
//         [0, 1, 5, 5, 5, 5, 4, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 3, 3, 3, 3, 4, 0, 4],
//         [0, 0, 5, 4, 4, 4, 4, 3, 3, 0, 0, 0, 3, 3, 3, 3, 3, 1, 4, 4, 4, 0, 3, 4, 0, 4],
//         [0, 0, 5, 0, 1, 3, 5, 0, 3, 0, 0, 0, 3, 1, 1, 1, 3, 1, 0, 3, 4, 0, 3, 4, 3, 4],
//         [5, 5, 5, 0, 1, 3, 5, 0, 3, 0, 2, 2, 3, 2, 2, 0, 3, 0, 0, 3, 4, 0, 0, 4, 4, 4],
//         [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 4, 4, 3, 3, 3, 3, 3, 3],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 8, 1, 0, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0]
//     ];

class Num extends AcGameObject {
    constructor(context) {
        super();  // 调用基类的构造函数
        this.ctx = context;
        this.size = 14;
    }

    draw(num, x, y) {
        let tempX = x;
        let tempY = y;
        let tempNumArray = [];
        if (num == 0) {
            tempNumArray.push(0);
        } else {
            while (num > 0) {
                tempNumArray.push(num % 10);
                num = parseInt(num / 10);
            }
        }
        for (let i = tempNumArray.length - 1; i >= 0; i--) {
            tempX = x + (tempNumArray.length - i - 1) * this.size * MAGNIFICATION;
            this.ctx.drawImage(
                RESOURCE_IMAGE,
                POS["num"][0] + tempNumArray[i] * 14,
                POS["num"][1],
                this.size,
                this.size,
                tempX,
                tempY,
                this.size * MAGNIFICATION,
                this.size * MAGNIFICATION
            );
        }
    }
}

class Prop {
    constructor(game_map, context, map, player1, player2) {
        this.game_map = game_map;
        this.enemyArray = this.game_map.enemyArray;
        this.ctx = context;
        this.map = map;
        this.player1 = player1;
        this.player2 = player2;
        this.x = 0;
        this.y = 0;
        this.duration = 600;
        this.type = 0;
        this.hit = false;
        this.width = 30;
        this.height = 28;
        this.isDestroyed = false;
        this.size = 28;
    }

    init() {
        this.ctx.clearRect(this.x, this.y, this.width, this.height);
        this.duration = 600;
        this.type = parseInt(Math.random() * 6);
        this.x = parseInt(Math.random() * 384) + this.map.offsetX;
        this.y = parseInt(Math.random() * 384) + this.map.offsetY;
        this.isDestroyed = false;
    }

    draw() {
        if (this.duration > 0 && !this.isDestroyed) {
            this.ctx.drawImage(RESOURCE_IMAGE, POS["prop"][0] + this.type * this.width, POS["prop"][1], this.width, this.height, this.x * MAGNIFICATION, this.y * MAGNIFICATION, this.width * MAGNIFICATION, this.height * MAGNIFICATION);
            this.duration--;
            this.isHit();
        } else {
            this.ctx.clearRect(this.x * MAGNIFICATION, this.y * MAGNIFICATION, this.width * MAGNIFICATION, this.height * MAGNIFICATION);
            this.isDestroyed = true;
        }
    }

    isHit() {
        let player = null;
        if (this.player1.lives > 0 && CheckIntersect(this, this.player1, 0)) {
            this.hit = true;
            player = this.player1;
        } else if (this.player2.lives > 0 && CheckIntersect(this, this.player2, 0)) {
            this.hit = true;
            player = this.player2;
        }
        if (this.hit) {
            PROP_AUDIO.play();
            this.isDestroyed = true;
            /*
                clearRect() 方法清空给定矩形内的指定像素。
                context.clearRect(x,y,width,height);
                x		要清除的矩形左上角的 x 坐标。
                y		要清除的矩形左上角的 y 坐标。
                width	要清除的矩形的宽度，以像素计。
                height	要清除的矩形的高度，以像素计。
            */
            this.ctx.clearRect(this.x * MAGNIFICATION, this.y * MAGNIFICATION, this.width * MAGNIFICATION, this.height * MAGNIFICATION);
            switch (this.type) {
                case 0:
                    player.lives++;
                    break;
                case 1:
                    this.game_map.enemyStopTime = 500;
                    break;
                case 2:
                    let mapChangeIndex = [[23, 11], [23, 12], [23, 13], [23, 14], [24, 11], [24, 14], [25, 11], [25, 14]];
                    this.map.updateMap(mapChangeIndex, GRID);
                    this.game_map.homeProtectedTime = 500;
                    break;
                case 3:
                    if (this.enemyArray != null || this.enemyArray.length > 0) {
                        for (let i = 0; i < this.enemyArray.length; i++) {
                            let enemyObj = this.enemyArray[i];
                            enemyObj.play_destroy_audio();
                        }
                    }
                    break;
                case 4:
                    break;
                case 5:
                    player.isProtected = true;
                    player.protectedTime = 500;
                    break;
            }
        }
    }
}

class Stage extends AcGameObject {
    constructor(context, level, gameMap) {
        super();
        this.ctx = context;
        this.level = level;
        this.gameMap = gameMap;
        this.ctx.fillStyle = "#7f7f7f";
        this.drawHeigth = 15;
        this.temp = 0;
        this.dir = 1; //中间切换的方向，1：合上，2：展开
        this.isReady = false;//标识地图是否已经画好
        this.levelNum = new Num(context);
    }

    init(level) {
        this.dir = 1;
        this.isReady = false;
        this.level = level;
        this.temp = 0;
    }

    draw() {
        if (this.dir == 1) {
            //temp = 15*15 灰色屏幕已经画完
            if (this.temp == 225) {
                //78,14为STAGE字样在图片资源中的宽和高，194,208为canvas中的位置
                this.ctx.drawImage(RESOURCE_IMAGE, POS["stageLevel"][0], POS["stageLevel"][1], 78, 14, 194 * MAGNIFICATION, 208 * MAGNIFICATION, 78 * MAGNIFICATION, 14 * MAGNIFICATION);
                //14为数字的宽和高，308, 208为canvas中的位置
                this.levelNum.draw(this.level, 308 * MAGNIFICATION, 208 * MAGNIFICATION);
                //this.ctx.drawImage(RESOURCE_IMAGE,POS["num"][0]+this.level*14,POS["num"][1],14, 14,308, 208,14, 14);
                //绘制地图,调用main里面的方法
                this.gameMap.initMap();

            } else if (this.temp == 225 + 600) {
                //600即调用了600/15次，主要用来停顿
                this.temp = 225;
                this.dir = -1;
                START_AUDIO.play();
            } else {
                this.ctx.fillRect(0 * MAGNIFICATION, this.temp * MAGNIFICATION, 512 * MAGNIFICATION, this.drawHeigth * MAGNIFICATION);
                this.ctx.fillRect(0 * MAGNIFICATION, (448 - this.temp - this.drawHeigth) * MAGNIFICATION, 512 * MAGNIFICATION, this.drawHeigth * MAGNIFICATION);
            }
        } else {
            if (this.temp >= 0) {
                this.ctx.clearRect(0 * MAGNIFICATION, this.temp * MAGNIFICATION, 512 * MAGNIFICATION, this.drawHeigth * MAGNIFICATION);
                this.ctx.clearRect(0 * MAGNIFICATION, (448 - this.temp - this.drawHeigth) * MAGNIFICATION, 512 * MAGNIFICATION, this.drawHeigth * MAGNIFICATION);
            } else {
                this.isReady = true;
            }
        }
        this.temp += this.drawHeigth * this.dir;
    }

    on_destroy() {
        this.levelNum.destroy();
        this.levelNum = null;
    }
}
/**
 * 坦克基类
 * @returns
 */
class Tank extends AcGameObject {
    constructor() {
        super();  // 调用基类的构造函数
        this.x = 0;
        this.y = 0;
        this.size = 32;//坦克的大小
        this.dir = UP;//方向0：上 1：下 2：左3：右
        this.speed = 1;//坦克的速度
        this.frame = 0;//控制敌方坦克切换方向的时间
        this.hit = false; //是否碰到墙或者坦克
        this.isAI = false; //是不是AI
        this.isShooting = false;//子弹是否在运行中
        this.bullet = null;//子弹
        this.shootRate = 0.6;//射击的概率
        this.isDestroyed = false;
        this.tempX = 0;
        this.tempY = 0;

        this.enemyStopTime = 0;
    }

    move() {
        //如果是AI坦克，在一定时间或者碰撞之后切换方向
        if (this.isAI && this.enemyStopTime > 0) {
            return;
        }

        this.tempX = this.x;
        this.tempY = this.y;

        if (this.isAI) {
            this.frame++;
            if (this.frame % 100 == 0 || this.hit) {
                this.dir = parseInt(Math.random() * 4);//随机一个方向
                this.hit = false;
                this.frame = 0;
            }
        }
        if (this.dir == UP) {
            this.tempY -= this.speed;
        } else if (this.dir == DOWN) {
            this.tempY += this.speed;
        } else if (this.dir == RIGHT) {
            this.tempX += this.speed;
        } else if (this.dir == LEFT) {
            this.tempX -= this.speed;
        }
        this.isHit();
        if (!this.hit) {
            this.x = this.tempX;
            this.y = this.tempY;
        }
    }

    // 碰撞检测
    isHit() {
        //临界检测
        if (this.dir == LEFT) {
            if (this.x <= this.map.offsetX) {
                this.x = this.map.offsetX;
                this.hit = true;
            }
        } else if (this.dir == RIGHT) {
            if (this.x >= this.map.offsetX + this.map.mapWidth - this.size) {
                this.x = this.map.offsetX + this.map.mapWidth - this.size;
                this.hit = true;
            }
        } else if (this.dir == UP) {
            if (this.y <= this.map.offsetY) {
                this.y = this.map.offsetY;
                this.hit = true;
            }
        } else if (this.dir == DOWN) {
            if (this.y >= this.map.offsetY + this.map.mapHeight - this.size) {
                this.y = this.map.offsetY + this.map.mapHeight - this.size;
                this.hit = true;
            }
        }
        if (!this.hit) {
            //地图检测
            if (this.tankMapCollision(this, this.map)) {
                this.hit = true;
            }
        }
        //坦克检测
        /*if(enemyArray != null && enemyArray.length >0){
            let enemySize = enemyArray.length;
            for(let i=0;i<enemySize;i++){
                if(enemyArray[i] != this && CheckIntersect(enemyArray[i],this,0)){
                    this.hit = true;
                    break;
                }
            }
        }*/
    }

    /**
     * 是否被击中
     */
    isShot() {

    };
    /**
     * 射击
     */
    shoot(type) {
        if (this.isAI && this.enemyStopTime > 0) {
            return;
        }
        if (this.isShooting) {
            return;
        } else {
            let tempX = this.x;
            let tempY = this.y;
            this.bullet = new Bullet(this.game_map, this.ctx, this, type, this.dir, this.map, this.bulletArray, this.isAI);
            //将子弹加入的子弹数组中
            this.bulletArray.push(this.bullet);
            this.isShooting = true;
            if (this.dir == UP) {
                tempX = this.x + parseInt(this.size / 2) - parseInt(this.bullet.size / 2);
                tempY = this.y - this.bullet.size;
            } else if (this.dir == DOWN) {
                tempX = this.x + parseInt(this.size / 2) - parseInt(this.bullet.size / 2);
                tempY = this.y + this.size;
            } else if (this.dir == LEFT) {
                tempX = this.x - this.bullet.size;
                tempY = this.y + parseInt(this.size / 2) - parseInt(this.bullet.size / 2);
            } else if (this.dir == RIGHT) {
                tempX = this.x + this.size;
                tempY = this.y + parseInt(this.size / 2) - parseInt(this.bullet.size / 2);
            }
            this.bullet.x = tempX;
            this.bullet.y = tempY;
            if (!this.isAI) {
                ATTACK_AUDIO.play();
            }
            this.bullet.draw();
        }
    };

    on_destroy() {
        this.play_destroy_audio();
    }

    /**
     * 坦克被击毁
     */
    play_destroy_audio() {
        this.isDestroyed = true;
        if (this.crackArray) {
            this.crackArray.push(new CrackAnimation(CRACK_TYPE_TANK, this.ctx, this));
        }
        TANK_DESTROY_AUDIO.play();
    }

    /**
     * 坦克与地图块碰撞
     * @param tank 坦克对象
     * @param mapobj 地图对象
     * @returns {Boolean} 如果碰撞，返回true
     */
    tankMapCollision(tank, mapobj) {
        //移动检测，记录最后一次的移动方向，根据方向判断+-overlap,
        let tileNum = 0;//需要检测的tile数
        let rowIndex = 0;//map中的行索引
        let colIndex = 0;//map中的列索引
        let overlap = 3;//允许重叠的大小

        //根据tank的x、y计算出map中的row和col
        if (tank.dir == UP) {
            rowIndex = parseInt((tank.tempY + overlap - mapobj.offsetY) / mapobj.tileSize);
            colIndex = parseInt((tank.tempX + overlap - mapobj.offsetX) / mapobj.tileSize);
        } else if (tank.dir == DOWN) {
            //向下，即dir==1的时候，行索引的计算需要+tank.Height
            rowIndex = parseInt((tank.tempY - overlap - mapobj.offsetY + tank.size) / mapobj.tileSize);
            colIndex = parseInt((tank.tempX + overlap - mapobj.offsetX) / mapobj.tileSize);
        } else if (tank.dir == LEFT) {
            rowIndex = parseInt((tank.tempY + overlap - mapobj.offsetY) / mapobj.tileSize);
            colIndex = parseInt((tank.tempX + overlap - mapobj.offsetX) / mapobj.tileSize);
        } else if (tank.dir == RIGHT) {
            rowIndex = parseInt((tank.tempY + overlap - mapobj.offsetY) / mapobj.tileSize);
            //向右，即dir==3的时候，列索引的计算需要+tank.Height
            colIndex = parseInt((tank.tempX - overlap - mapobj.offsetX + tank.size) / mapobj.tileSize);
        }
        if (rowIndex >= mapobj.HTileCount || rowIndex < 0 || colIndex >= mapobj.wTileCount || colIndex < 0) {
            return true;
        }
        if (tank.dir == UP || tank.dir == DOWN) {
            let tempWidth = parseInt(tank.tempX - mapobj.offsetX - (colIndex) * mapobj.tileSize + tank.size - overlap);//去除重叠部分
            if (tempWidth % mapobj.tileSize == 0) {
                tileNum = parseInt(tempWidth / mapobj.tileSize);
            } else {
                tileNum = parseInt(tempWidth / mapobj.tileSize) + 1;
            }
            for (let i = 0; i < tileNum && colIndex + i < mapobj.wTileCount; i++) {
                let mapContent = mapobj.mapLevel[rowIndex][colIndex + i];
                if (mapContent == WALL || mapContent == GRID || mapContent == WATER || mapContent == HOME || mapContent == ANOTHREHOME) {
                    if (tank.dir == UP) {
                        tank.y = mapobj.offsetY + rowIndex * mapobj.tileSize + mapobj.tileSize - overlap;
                    } else if (tank.dir == DOWN) {
                        tank.y = mapobj.offsetY + rowIndex * mapobj.tileSize - tank.size + overlap;
                    }
                    return true;
                }
            }
        } else {
            let tempHeight = parseInt(tank.tempY - mapobj.offsetY - (rowIndex) * mapobj.tileSize + tank.size - overlap);//去除重叠部分
            if (tempHeight % mapobj.tileSize == 0) {
                tileNum = parseInt(tempHeight / mapobj.tileSize);
            } else {
                tileNum = parseInt(tempHeight / mapobj.tileSize) + 1;
            }
            for (let i = 0; i < tileNum && rowIndex + i < mapobj.HTileCount; i++) {
                let mapContent = mapobj.mapLevel[rowIndex + i][colIndex];
                if (mapContent == WALL || mapContent == GRID || mapContent == WATER || mapContent == HOME || mapContent == ANOTHREHOME) {
                    if (tank.dir == LEFT) {
                        tank.x = mapobj.offsetX + colIndex * mapobj.tileSize + mapobj.tileSize - overlap;
                    } else if (tank.dir == RIGHT) {
                        tank.x = mapobj.offsetX + colIndex * mapobj.tileSize - tank.size + overlap;
                    }
                    return true;
                }
            }
        }
        return false;
    }
}
/**
 * 敌方坦克1
 * @param context 画坦克的画布
 * @returns
 */
class EnemyTank extends Tank {
    constructor(game_map, context, map, rand) {
        super();  // 调用基类的构造函数
        this.game_map = game_map;
        this.enemyStopTime = this.game_map.enemyStopTime;
        this.bulletArray = this.game_map.bulletArray;
        this.crackArray = this.game_map.crackArray;
        this.rand = rand;
        this.tank_rand = "enemy" + this.rand.toString();
        this.ctx = context;
        this.map = map;
        this.isAppear = false;
        this.times = 0;
        this.isAI = true;

        this.set_up();
    }

    set_up() {
        if (this.rand === 1 || this.rand === 2) {
            this.lives = 1;
        } else {
            this.lives = 3;
        }

        if (this.rand === 1) {
            this.speed = 1;
        } else if (this.rand === 2) {
            this.speed = 1.7;
        } else if (this.rand === 3) {
            this.speed = 0.6;
        }
    }

    draw() {
        // 敌方坦克实时更新停止时间
        this.updateStopTime()

        this.times++;
        if (!this.isAppear) {
            var temp = parseInt(this.times / 5) % 7;
            this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, this.x * MAGNIFICATION, this.y * MAGNIFICATION, 32 * MAGNIFICATION, 32 * MAGNIFICATION);
            if (this.times == 34) {
                this.isAppear = true;
                this.times = 0;
                this.shoot(2);
            }
        } else {
            if (this.rand === 3) {
                this.ctx.drawImage(
                    RESOURCE_IMAGE,
                    POS[this.tank_rand][0] + this.dir * this.size + (3 - this.lives) * this.size * 4,
                    POS[this.tank_rand][1],
                    32,
                    32,
                    this.x * MAGNIFICATION,
                    this.y * MAGNIFICATION,
                    32 * MAGNIFICATION,
                    32 * MAGNIFICATION
                );

            } else {
                this.ctx.drawImage(
                    RESOURCE_IMAGE,
                    POS[this.tank_rand][0] + this.dir * this.size,
                    POS[this.tank_rand][1],
                    32,
                    32,
                    this.x * MAGNIFICATION,
                    this.y * MAGNIFICATION,
                    32 * MAGNIFICATION,
                    32 * MAGNIFICATION
                );
            }

            //以一定的概率射击
            if (this.times % 50 == 0) {
                var ra = Math.random();
                if (ra < this.shootRate) {
                    this.shoot(2);
                }
                this.times = 0;
            }
            this.move();
        }
    }

    updateStopTime() {
        this.enemyStopTime = this.game_map.enemyStopTime;
    }
}


// /**
//  * 敌方坦克2
//  * @param context 画坦克的画布
//  * @returns
//  */
//  var EnemyTwo = function (context) {
//     this.ctx = context;
//     this.isAppear = false;
//     this.times = 0;
//     this.lives = 2;
//     this.isAI = true;
//     this.speed = 1;

//     this.draw = function () {
//         this.times++;
//         if (!this.isAppear) {
//             var temp = parseInt(this.times / 5) % 7;
//             this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, this.x, this.y, 32, 32);
//             if (this.times == 35) {
//                 this.isAppear = true;
//                 this.times = 0;
//                 this.shoot(2);
//             }
//         } else {
//             this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy2"][0] + this.dir * this.size, POS["enemy2"][1], 32, 32, this.x, this.y, 32, 32);
//             //以一定的概率射击
//             if (this.times % 50 == 0) {
//                 var ra = Math.random();
//                 if (ra < this.shootRate) {
//                     this.shoot(2);
//                 }
//                 this.times = 0;
//             }
//             this.move();
//         }
//     };

// };
// EnemyTwo.prototype = new Tank();



// /**
//  * 敌方坦克3
//  * @param context 画坦克的画布
//  * @returns
//  */
// var EnemyThree = function (context) {
//     this.ctx = context;
//     this.isAppear = false;
//     this.times = 0;
//     this.lives = 3;
//     this.isAI = true;
//     this.speed = 0.5;

//     this.draw = function () {
//         this.times++;
//         if (!this.isAppear) {
//             var temp = parseInt(this.times / 5) % 7;
//             this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, this.x, this.y, 32, 32);
//             if (this.times == 35) {
//                 this.isAppear = true;
//                 this.times = 0;
//                 this.shoot(2);
//             }
//         } else {
//             this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy3"][0] + this.dir * this.size + (3 - this.lives) * this.size * 4, POS["enemy3"][1], 32, 32, this.x, this.y, 32, 32);
//             //以一定的概率射击
//             if (this.times % 50 == 0) {
//                 var ra = Math.random();
//                 if (ra < this.shootRate) {
//                     this.shoot(2);
//                 }
//                 this.times = 0;
//             }
//             this.move();
//         }

//     };

// };
// EnemyThree.prototype = new Tank();
/**
 * 玩家坦克
 * @param context 画坦克的画布
 * @returns
 */
class PlayTank extends Tank {
    constructor(game_map, context, map) {
        super();  // 调用基类的构造函数
        this.game_map = game_map;
        this.bulletArray = this.game_map.bulletArray;
        this.crackArray = this.game_map.crackArray;
        this.ctx = context;
        this.map = map;
        this.lives = 3;//生命值
        this.isProtected = true;//是否受保护
        this.protectedTime = 500;//保护时间
        this.offsetX = 0;//坦克2与坦克1的距离
        this.isAI = false;
        this.speed = 2;//坦克的速度
    }

    draw() {
        this.hit = false;
        this.ctx.drawImage(
            RESOURCE_IMAGE,
            POS["player"][0] + this.offsetX + this.dir * this.size,
            POS["player"][1],
            this.size,
            this.size,
            this.x * MAGNIFICATION,
            this.y * MAGNIFICATION,
            this.size * MAGNIFICATION,
            this.size * MAGNIFICATION
        );
        if (this.isProtected) {
            let temp = parseInt((500 - this.protectedTime) / 5) % 2;
            this.ctx.drawImage(RESOURCE_IMAGE, POS["protected"][0], POS["protected"][1] + 32 * temp, 32, 32, this.x * MAGNIFICATION, this.y * MAGNIFICATION, 32 * MAGNIFICATION, 32 * MAGNIFICATION);
            this.protectedTime--;
            if (this.protectedTime == 0) {
                this.isProtected = false;
            }
        }
    }

    // 重生函数
    renascenc(player) {
        this.lives--;
        this.dir = UP;
        this.isProtected = true;
        this.protectedTime = 500;
        this.isDestroyed = false;
        let temp = 0;
        if (player == 1) {
            temp = 129;
        } else {
            temp = 256;
        }
        this.x = temp + this.map.offsetX;
        this.y = 385 + this.map.offsetY;
    }
}/**
 * 菜单选择坦克
 * @returns
 */
class SelectTank extends Tank {
    constructor() {
        super();  // 调用基类的构造函数
        this.start();
    }

    start() {
        this.resize();
    }

    resize() {
        this.ys = [250 * MAGNIFICATION, 281 * MAGNIFICATION]; //两个Y坐标，分别对应1p和2p
        this.x = 140 * MAGNIFICATION;
        this.size = 27;
    }
} class TankMap extends AcGameObject {
    constructor(wCtx, gCtx, maxEnemy) {
        super();  // 调用基类的构造函数
        this.level = 1;
        this.mapLevel = null;
        this.wallCtx = wCtx;
        this.grassCtx = gCtx;
        this.maxEnemy = maxEnemy;

        this.offsetX = 32; //主游戏区的X偏移量
        this.offsetY = 16;//主游戏区的Y偏移量
        this.wTileCount = 26; //主游戏区的宽度地图块数
        this.HTileCount = 26;//主游戏区的高度地图块数
        this.tileSize = 16;	//地图块的大小
        this.homeSize = 32; //家图标的大小
        this.num = new Num(this.wallCtx);
        this.mapWidth = 416 * MAGNIFICATION;
        this.mapHeight = 416 * MAGNIFICATION;
    }

    // 初始化地图数组
    setMapLevel(level) {
        this.level = level;
        let tempMap = eval("map" + this.level);
        this.mapLevel = new Array();
        for (let i = 0; i < tempMap.length; i++) {
            this.mapLevel[i] = new Array();
            for (let j = 0; j < tempMap[i].length; j++) {
                this.mapLevel[i][j] = tempMap[i][j];
            }
        }
    }

    // 绘制地图
    draw() {
        this.wallCtx.fillStyle = "#7f7f7f";
        this.wallCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.wallCtx.fillStyle = "#000";
        // 主游戏区
        this.wallCtx.fillRect(this.offsetX * MAGNIFICATION, this.offsetY * MAGNIFICATION, this.mapWidth, this.mapHeight);

        this.grassCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        for (let i = 0; i < this.HTileCount; i++) {
            for (let j = 0; j < this.wTileCount; j++) {
                if (this.mapLevel[i][j] == WALL || this.mapLevel[i][j] == GRID || this.mapLevel[i][j] == WATER || this.mapLevel[i][j] == ICE) {
                    /* 
                        剪切图像，并在画布上定位被剪切的部分：
                        context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
                        img		规定要使用的图像、画布或视频。	 
                        sx		可选。开始剪切的 x 坐标位置。
                        sy		可选。开始剪切的 y 坐标位置。
                        swidth	可选。被剪切图像的宽度。
                        sheight	可选。被剪切图像的高度。
                        x		在画布上放置图像的 x 坐标位置。
                        y		在画布上放置图像的 y 坐标位置。
                        width	可选。要使用的图像的宽度（伸展或缩小图像）。
                        height	可选。要使用的图像的高度（伸展或缩小图像）。
                    */
                    this.wallCtx.drawImage(
                        RESOURCE_IMAGE,
                        this.tileSize * (this.mapLevel[i][j] - 1) + POS["map"][0],
                        POS["map"][1],
                        this.tileSize,
                        this.tileSize,
                        j * this.tileSize * MAGNIFICATION + this.offsetX * MAGNIFICATION,
                        i * this.tileSize * MAGNIFICATION + this.offsetY * MAGNIFICATION,
                        this.tileSize * MAGNIFICATION,
                        this.tileSize * MAGNIFICATION
                    );
                } else if (this.mapLevel[i][j] == GRASS) {
                    this.grassCtx.drawImage(RESOURCE_IMAGE, this.tileSize * (this.mapLevel[i][j] - 1) + POS["map"][0], POS["map"][1], this.tileSize, this.tileSize, j * this.tileSize * MAGNIFICATION + this.offsetX * MAGNIFICATION, i * this.tileSize * MAGNIFICATION + this.offsetY * MAGNIFICATION, this.tileSize * MAGNIFICATION, this.tileSize * MAGNIFICATION);
                } else if (this.mapLevel[i][j] == HOME) {
                    this.wallCtx.drawImage(RESOURCE_IMAGE, POS["home"][0], POS["home"][1], this.homeSize, this.homeSize, j * this.tileSize * MAGNIFICATION + this.offsetX * MAGNIFICATION, i * this.tileSize * MAGNIFICATION + this.offsetY * MAGNIFICATION, this.homeSize * MAGNIFICATION, this.homeSize * MAGNIFICATION);
                }
            }
        }
        this.drawNoChange();
        this.drawEnemyNum(this.maxEnemy);
        this.drawLevel();
        this.drawLives(0, 1);
        this.drawLives(0, 2);
    }

    // 画固定不变的部分
    drawNoChange() {
        //player1
        this.wallCtx.drawImage(RESOURCE_IMAGE, POS["score"][0], POS["score"][1], 30, 32, 464 * MAGNIFICATION, 256 * MAGNIFICATION, 30 * MAGNIFICATION, 32 * MAGNIFICATION);

        //player2
        this.wallCtx.drawImage(RESOURCE_IMAGE, 30 + POS["score"][0], POS["score"][1], 30, 32, 464 * MAGNIFICATION, 304 * MAGNIFICATION, 30 * MAGNIFICATION, 32 * MAGNIFICATION);

        //30,32旗帜的size, 464, 352旗帜在canvas中位置
        //画旗帜
        this.wallCtx.drawImage(RESOURCE_IMAGE, 60 + POS["score"][0], POS["score"][1], 30, 32, 464 * MAGNIFICATION, 352 * MAGNIFICATION, 32 * MAGNIFICATION, 30 * MAGNIFICATION);
    }

    // 画关卡数
    drawLevel() {
        this.num.draw(this.level, 468 * MAGNIFICATION, 384 * MAGNIFICATION);
    };

    /**
     * 画右侧敌方坦克数
     * @param enemyNum 地方坦克总数
     */
    drawEnemyNum(enemyNum) {
        let x = 466;
        let y = 34;
        let enemySize = 16;
        for (let i = 1; i <= enemyNum; i++) {
            let tempX = x;
            let tempY = y + parseInt((i + 1) / 2) * enemySize;
            if (i % 2 == 0) {
                tempX = x + enemySize;
            }
            this.wallCtx.drawImage(RESOURCE_IMAGE, 92 + POS["score"][0], POS["score"][1], 14, 14, tempX * MAGNIFICATION, tempY * MAGNIFICATION, 14 * MAGNIFICATION, 14 * MAGNIFICATION);
        }
    }

    /**
     * 清除右侧敌方坦克数，从最下面开始清除
     * @param totolEnemyNum 敌方坦克的总数
     * @param enemyNum 已出现的敌方坦克数
     */
    clearEnemyNum(totolEnemyNum, enemyNum) {
        let x = 466;
        let y = 34 + this.offsetY * MAGNIFICATION;
        if (enemyNum <= 0) {
            return;
        }
        let enemySize = 16;
        this.wallCtx.fillStyle = "#7f7f7f";
        let tempX = x + (enemyNum % 2) * enemySize;
        let tempY = y + (Math.ceil(totolEnemyNum / 2) - 1) * enemySize - (parseInt((enemyNum - 1) / 2)) * enemySize;
        this.wallCtx.fillRect(
            tempX * MAGNIFICATION,
            tempY * MAGNIFICATION,
            14 * MAGNIFICATION,
            14 * MAGNIFICATION
        );
    }

    /**
     * 画坦克的生命数
     * @param lives 生命数
     * @param which 坦克索引，1、代表玩家1  2、代表玩家2
     */
    drawLives(lives, which) {
        let x = 482;
        let y = 272;
        if (which == 2) {
            y = 320;
        }
        this.wallCtx.fillStyle = "#7f7f7f";
        /*
            fillRect() 方法绘制"已填充"的矩形。默认的填充颜色是黑色。
            context.fillRect(x,y,width,height);
            x		矩形左上角的 x 坐标。
            y		矩形左上角的 y 坐标。
            width	矩形的宽度，以像素计。
            height	矩形的高度，以像素计。
        */
        this.wallCtx.fillRect(
            x * MAGNIFICATION,
            y * MAGNIFICATION,
            this.num.size * MAGNIFICATION,
            this.num.size * MAGNIFICATION
        );
        this.num.draw(lives, x * MAGNIFICATION, y * MAGNIFICATION);
    }

    /**
         * 更新地图
         * @param indexArr 需要更新的地图索引数组，二维数组，如[[1,1],[2,2]]
         * @param target 更新之后的数值
         */
    updateMap(indexArr, target) {
        if (indexArr != null && indexArr.length > 0) {
            let indexSize = indexArr.length;
            for (let i = 0; i < indexSize; i++) {
                let index = indexArr[i];
                this.mapLevel[index[0]][index[1]] = target;
                if (target > 0) {
                    this.wallCtx.drawImage(
                        RESOURCE_IMAGE,
                        this.tileSize * (target - 1) + POS["map"][0], POS["map"][1],
                        this.tileSize,
                        this.tileSize,
                        index[1] * this.tileSize * MAGNIFICATION + this.offsetX * MAGNIFICATION,
                        index[0] * this.tileSize * MAGNIFICATION + this.offsetY * MAGNIFICATION,
                        this.tileSize * MAGNIFICATION,
                        this.tileSize * MAGNIFICATION
                    );
                } else {
                    this.wallCtx.fillStyle = "#000";
                    this.wallCtx.fillRect(index[1] * this.tileSize * MAGNIFICATION + this.offsetX * MAGNIFICATION, index[0] * this.tileSize * MAGNIFICATION + this.offsetY * MAGNIFICATION, this.tileSize * MAGNIFICATION, this.tileSize * MAGNIFICATION);
                }
            }
        }
    }

    // 基地炸了
    homeHit() {
        this.wallCtx.drawImage(RESOURCE_IMAGE, POS["home"][0] + this.homeSize, POS["home"][1], this.homeSize, this.homeSize, 12 * this.tileSize * MAGNIFICATION + this.offsetX * MAGNIFICATION, 24 * this.tileSize * MAGNIFICATION + this.offsetY * MAGNIFICATION, this.homeSize * MAGNIFICATION, this.homeSize * MAGNIFICATION);
    }

    on_destroy() {
        this.num.destroy();
        this.num = null;
    }
}/**
 * 游戏开始菜单
 **/
class Menu extends AcGameObject {
    constructor(context) {
        super();  // 调用基类的构造函数
        this.ctx = context;
        this.x = 0;
        this.y = SCREEN_HEIGHT;
        // TO DO
        this.selectTank = new SelectTank();
        this.playNum = 1;
        this.times = 0;

        this.draw();
    }

    /**
     * 画菜单
     */
    draw() {
        this.times++;
        var temp = 0;
        if (parseInt(this.times / 6) % 2 == 0) {
            temp = 0;
        } else {
            temp = this.selectTank.size;
        }
        if (this.y <= 0) {
            this.y = 0;
        } else {
            this.y -= 5;
        }
        this.ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.ctx.save();
        //画菜单背景
        this.ctx.drawImage(MENU_IMAGE, this.x, this.y, SCREEN_WIDTH, SCREEN_HEIGHT);
        //画选择坦克
        this.selectTank.resize();
        this.ctx.drawImage(RESOURCE_IMAGE, POS["selectTank"][0], POS["selectTank"][1] + temp, this.selectTank.size, this.selectTank.size, this.selectTank.x, this.y + this.selectTank.ys[this.playNum - 1], this.selectTank.size * MAGNIFICATION, this.selectTank.size * MAGNIFICATION);
        this.ctx.restore();
    }

    /**
     * 选择坦克上下移动
     */
    next(n) {
        this.playNum += n;
        if (this.playNum > 2) {
            this.playNum = 1;
        } else if (this.playNum < 1) {
            this.playNum = 2;
        }
    }

    on_destroy() {
        this.selectTank.destroy();
        this.selectTank = null;
    }
} class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.operator = "pc"; // pc - phone

        this.hide();

        // 在show()之前append，为了之后实时更新地图大小
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    // 创建一个唯一编号用来准确移除resize监听函数
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10)); // 返回[0, 1)
            res += x;
        }
        return res;
    }

    start() {
        let outer = this;

        let uuid = this.create_uuid();
        // 用户改变窗口大小的时候就会触发这个事件
        // 用on来绑定监听函数，之后就可以用off来移除
        $(window).on(`resize.${uuid}`, function () {
            outer.resize();
        });

        if (this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function () {
                $(window).off(`resize.${uuid}`);
                outer.hide();
            });
        }

        // 查看用户当前使用什么设备登录
        this.check_operator();
    }

    check_operator() {
        let sUserAgent = navigator.userAgent.toLowerCase();
        let pc = sUserAgent.match(/windows/i) == "windows";
        if (!pc) {
            return "phone";
        } else {
            return "pc";
        }
    }

    // 让界面的长宽比固定为16：9，并且等比例放到最大
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 8, this.height / 7);
        this.width = unit * 8;
        this.height = unit * 7;

        // 基准
        this.scale = this.height;
        MAGNIFICATION = this.height / BASE_SCREEN_HEIGHT;
        SCREEN_WIDTH = BASE_SCREEN_WIDTH * MAGNIFICATION;
        SCREEN_HEIGHT = BASE_SCREEN_HEIGHT * MAGNIFICATION;

        // 调用一下GameMap的resize()
        if (this.game_map) this.game_map.resize();
    }

    show() {  // 打开playground界面
        this.$playground.show();

        this.resize();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
    }

    hide() {  // 关闭playground界面
        if (this.game_map) {
            this.game_map.destroy();
        }

        // 清空当前的html对象
        this.$playground.empty();

        this.$playground.hide();
    }
} class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-title">
            登录
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app1695.acapp.acwing.com.cn:4434/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            登录
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app1695.acapp.acwing.com.cn:4434/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
</div>
    
        `);

        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.$acwing_login = this.$settings.find('.ac-game-settings-acwing img');

        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    start() {
        if (this.platform === "ACAPP") {
            this.getinfo_acapp();
        } else if (this.platform === "WEB") {
            this.getinfo_web();
            this.add_listening_events();
        } else {
            // console.log("not known what is platform");
        }
    }

    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login.click(function () {
            outer.acwing_login();
        });
    }

    add_listening_events_login() {
        let outer = this;

        // 登录界面跳转到注册界面
        this.$login_register.click(function () {
            outer.register();
        });
        // 登录按钮
        this.$login_submit.click(function () {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;

        // 注册界面跳转到登录界面
        this.$register_login.click(function () {
            outer.login();
        });
        // 注册按钮
        this.$register_submit.click(function () {
            outer.register_on_remote();
        });
    }

    // acwing一键登录
    acwing_login() {
        $.ajax({
            url: "https://app1695.acapp.acwing.com.cn:4434/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    // 在远程服务器上登录
    login_on_remote() {
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "https://app1695.acapp.acwing.com.cn:4434/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    // 在远程服务器上注册
    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app1695.acapp.acwing.com.cn:4434/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();  // 刷新页面
                } else {
                    // 展示错误信息
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    // 在远程服务器上登出
    logout_on_remote() {
        if (this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close();
        } else {
            $.ajax({
                url: "https://app1695.acapp.acwing.com.cn:4434/settings/logout/",
                type: "GET",
                success: function (resp) {
                    if (resp.result === "success") {
                        // 刷新页面
                        location.reload();
                    }
                }
            });
        }
    }

    // 打开注册界面
    register() {
        this.$login.hide();
        this.$register.show();
    }

    // 打开登陆界面
    login() {
        this.$register.hide();
        this.$login.show();
    }

    // acapp端一键登录
    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;

        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function (resp) {
            if (resp.result === "success") {
                // 获取用户信息成功的话就存储用户信息
                outer.username = resp.username;
                outer.photo = resp.photo;

                // 打开菜单界面
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_acapp() {
        let outer = this;

        $.ajax({
            url: "https://app1695.acapp.acwing.com.cn:4434/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    getinfo_web() {
        let outer = this;

        $.ajax({
            url: "https://app1695.acapp.acwing.com.cn:4434/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function (resp) {
                // 输出登录信息
                // console.log(resp);
                if (resp.result === "success") {
                    // 获取用户信息成功的话就存储用户信息
                    outer.username = resp.username;
                    outer.photo = resp.photo;

                    // 打开菜单界面
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
} export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        // 前面加$表示js对象，前面加#能够找到id对应的div
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;

        // 顺序不要随便换
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {

    }
}