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

