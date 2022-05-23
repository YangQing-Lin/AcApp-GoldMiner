class TankMap extends AcGameObject {
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
}