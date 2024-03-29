export class AcGameMenu {
    // root就是web.html里的ac_game对象
    constructor(root) {
        this.root = root;
        // 前面加$表示js对象
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            开始游戏
        </div>
        </br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出
        </div>
    </div>
    <div class="ac-game-version">
        v-1.6
    </div>
</div>
`);
        this.$menu.hide();
        // 将menu对象添加到ac_game对象中，这样就能动态更改页面了
        this.root.$ac_game.append(this.$menu);

        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function () {
            outer.hide();
            outer.root.playground.show();
            outer.root.playground.audio_start.play();
        });
        this.$settings.click(function () {
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        // 使用的是jQuery的API
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}