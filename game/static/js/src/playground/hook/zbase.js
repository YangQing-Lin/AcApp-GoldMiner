class Hook extends AcGameObject {
    constructor(playground, player) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = 0.5;
        this.y = 0.8;
        this.radius = 0.012;
        this.angle = Math.PI / 2;
        this.direction_flag = 1;  //  1: left  2: right  3: stop-left  4: stop-right
        this.direction = null;
        this.base_tile_length = 0.1;
        this.max_tile_length = 0.6;
        this.tile_length = this.base_tile_length;
        this.moved = 0;
        this.catched = false;  // 是否抓到东西

        this.eps = 0.01;
    }

    start() {

    }

    tick() {
        this.direction_flag += 2;
        this.moved = 0.008;
    }

    update() {
        this.update_tile_length();
        this.update_angle();
        this.update_position();
        this.render();
    }

    update_tile_length() {
        // 控制绳子长短
        if (this.max_tile_length - this.tile_length < this.eps) {
            this.moved = -this.moved;
            // 标记为抓到东西
            this.catched = true;
        } else if (this.catched && this.tile_length - this.base_tile_length < this.eps) {
            this.moved = 0;
            // 标记为没抓到东西
            this.catched = false;
            // 钩子开始转动
            this.direction_flag -= 2;
        }
        this.tile_length += this.moved;
    }

    update_angle() {
        if (this.timedelta / 1000 > 1 / 50) {
            return false;
        }

        // 控制钩子转动方向和是否转动
        if (this.direction_flag === 1) {
            this.direction = -Math.PI / 2 * (this.timedelta / 1000);
        } else if (this.direction_flag === 2) {
            this.direction = Math.PI / 2 * (this.timedelta / 1000);
        } else if (this.direction_flag > 2) {
            this.direction = 0;
        }
        this.angle += this.direction;

        if (this.angle < -Math.PI / 2) {
            this.direction_flag = 2;
        } else if (this.angle > Math.PI / 2) {
            this.direction_flag = 1;
        }
    }

    update_position() {
        this.x = this.player.x + Math.sin(this.angle) * this.tile_length;
        this.y = this.player.y + Math.cos(this.angle) * this.tile_length;
    }

    render() {
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "white";
        this.ctx.fill();
    }
}