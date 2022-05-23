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
}