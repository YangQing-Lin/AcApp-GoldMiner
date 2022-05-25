import { Settings } from "/static/js/src/settings/zbase.js";
import { AcGameMenu } from "/static/js/src/menu/zbase.js";
import { AcGamePlayground } from "/static/js/src/playground/zbase.js";

export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        // 前面加$表示js对象，前面加#能够找到id对应的div
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;

        // 顺序不要随便换
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {

    }
}