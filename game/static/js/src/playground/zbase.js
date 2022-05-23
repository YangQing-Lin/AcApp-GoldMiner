class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.operator = "pc"; // pc - phone

        this.hide();

        // 在show()之前append，为了之后实时更新地图大小
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    // 创建一个唯一编号用来准确移除resize监听函数
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10)); // 返回[0, 1)
            res += x;
        }
        return res;
    }

    start() {
        let outer = this;

        let uuid = this.create_uuid();
        // 用户改变窗口大小的时候就会触发这个事件
        // 用on来绑定监听函数，之后就可以用off来移除
        $(window).on(`resize.${uuid}`, function () {
            outer.resize();
        });

        if (this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function () {
                $(window).off(`resize.${uuid}`);
                outer.hide();
            });
        }

        // 查看用户当前使用什么设备登录
        this.check_operator();
    }

    check_operator() {
        let sUserAgent = navigator.userAgent.toLowerCase();
        let pc = sUserAgent.match(/windows/i) == "windows";
        if (!pc) {
            return "phone";
        } else {
            return "pc";
        }
    }

    // 让界面的长宽比固定为16：9，并且等比例放到最大
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 8, this.height / 7);
        this.width = unit * 8;
        this.height = unit * 7;

        // 基准
        this.scale = this.height;
        MAGNIFICATION = this.height / BASE_SCREEN_HEIGHT;
        SCREEN_WIDTH = BASE_SCREEN_WIDTH * MAGNIFICATION;
        SCREEN_HEIGHT = BASE_SCREEN_HEIGHT * MAGNIFICATION;

        // 调用一下GameMap的resize()
        if (this.game_map) this.game_map.resize();
    }

    show() {  // 打开playground界面
        this.$playground.show();

        this.resize();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
    }

    hide() {  // 关闭playground界面
        if (this.game_map) {
            this.game_map.destroy();
        }

        // 清空当前的html对象
        this.$playground.empty();

        this.$playground.hide();
    }
}