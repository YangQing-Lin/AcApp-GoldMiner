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
