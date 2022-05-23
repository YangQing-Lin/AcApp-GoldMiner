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

