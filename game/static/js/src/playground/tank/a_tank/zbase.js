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
