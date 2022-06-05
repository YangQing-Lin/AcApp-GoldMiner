import { GameMap } from "/static/js/src/playground/game_map/zbase.js";
import { Player } from "/static/js/src/playground/player/zbase.js";
import { Mineral } from "/static/js/src/playground/mineral/zbase.js";

export class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.operator = "pc"; // pc - phone
        this.base_scale = 1140;
        this.character = "pop up";  // shop, game, pop up

        this.hide();

        // 在show()之前append，为了之后实时更新地图大小
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * colors.length)];
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
        this.operator = this.check_operator();
        // 加载音频
        this.load_audio();
    }

    // 查看用户使用的是移动端还是PC端
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
        let unit = Math.min(this.width / 12, this.height / 9);
        this.width = unit * 12;
        this.height = unit * 9;

        // 基准
        this.scale = this.height;

        // 调用一下GameMap的resize()
        if (this.game_map) this.game_map.resize();
    }

    show(mode) {  // 打开playground界面
        this.$playground.show();
        this.resize();

        this.game_map = new GameMap(this.root, this);

        this.mode = mode;
        this.player_count = 0;
        this.players = [];
        this.miners = [];
        // 绘制玩家
        this.players.push(new Player(this, this.width / 2 / this.scale, 4.3 / 16, 0.04, "me", "test", "https://cdn.acwing.com/media/user/profile/photo/84494_lg_29c89a778e.jpg"));
    }

    // 加载游戏音频
    load_audio() {
        this.audio_bag = new Audio("/static/audio/bag.ogg");
        this.audio_counter = new Audio("/static/audio/counter.ogg");
        this.audio_explode = new Audio("/static/audio/explode.ogg");
        this.audio_fail = new Audio("/static/audio/fail.ogg");
        this.audio_getbomb = new Audio("/static/audio/getbomb.ogg");
        this.audio_getpower = new Audio("/static/audio/getpower.ogg");
        this.audio_good = new Audio("/static/audio/good.ogg");
        this.audio_great = new Audio("/static/audio/great.ogg");
        this.audio_low = new Audio("/static/audio/low.ogg");
        this.audio_machine = new Audio("/static/audio/machine.ogg");
        this.audio_music = new Audio("/static/audio/music.ogg");
        this.audio_point = new Audio("/static/audio/point.ogg");
        this.audio_pop = new Audio("/static/audio/pop.ogg");
        this.audio_puff = new Audio("/static/audio/puff.ogg");
        this.audio_purchase = new Audio("/static/audio/purchase.ogg");
        this.audio_rattle = new Audio("/static/audio/rattle.ogg");
        this.audio_start = new Audio("/static/audio/start.ogg");
        this.audio_success = new Audio("/static/audio/success.ogg");
    }

    hide() {  // 关闭playground界面
        while (this.players && this.players.length > 0) {
            // AcGameObject.destroy() ----> Player.on_destroy()
            //                          \--> AC_GAME_OBJECTS.splice(i, 1)
            this.players[0].destroy();
        }

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }

        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }

        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }



        // 清空当前的html对象
        this.$playground.empty();

        this.$playground.hide();
    }
}