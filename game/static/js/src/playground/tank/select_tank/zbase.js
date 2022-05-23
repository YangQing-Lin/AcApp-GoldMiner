/**
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
}