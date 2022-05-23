/**
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
}