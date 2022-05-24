class Miner extends AcGameObject {
    constructor(playground, x, y) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = 0.02;
        this.fraction = 1.5;
    }

    start() {

    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "gold";
        this.ctx.fill();
    }

    on_destroy() {
        for (let i = 0; i < this.playground.miners.length; i++) {
            let miner = this.playground.miners[i];
            if (miner === this) {
                this.playground.miners.splice(i, 1);
                break;
            }
        }
    }

}