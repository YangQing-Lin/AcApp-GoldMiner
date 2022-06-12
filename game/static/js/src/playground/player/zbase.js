import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";
import { Hook } from "/static/js/src/playground/hook/zbase.js";
import { Bomb } from "/static/js/src/playground/skill/bomb.js";
import { Explode } from "/static/js/src/playground/skill/explode.js";

export class Player extends AcGameObject {
    constructor(playground, x, y, radius, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.game_background = this.playground.game_map.game_background;
        this.shop = this.playground.game_map.shop;  // 载入商店界面对象
        this.pop_up = this.playground.game_map.pop_up;  // 载入弹窗界面对象
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.character = character;
        this.username = username;
        this.photo = photo;

        this.photo_x = this.x + this.radius * 2;
        this.photo_y = this.y - this.radius * 0.5;
        this.money = 0;

        this.img = new Image();
        this.img.src = this.photo;
        this.bomb = new Bomb(this.playground, this);
        this.hook = new Hook(this.playground, this, this.playground.game_map.score_number);
    }

    start() {
        this.add_listening_events();
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10)); // 返回[0, 1)
            res += x;
        }
        return res;
    }

    // 监听鼠标事件 
    add_listening_events() {
        if (this.playground.operator === "pc") {
            this.add_pc_listening_events(this.playground.game_map.$score_number_canvas);
            this.add_pc_listening_events(this.playground.game_map.$pop_up_canvas);
        } else {
            this.add_phone_listening_events();
        }
    }

    add_phone_listening_events() {
    }

    add_pc_listening_events(focus_canvas) {
        let outer = this;

        // 关闭右键菜单功能
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });


        // 监听鼠标右键点击事件，获取鼠标位置
        // 当前在最上层的canvas是哪个就要把监听事件绑定到哪个canvas上
        focus_canvas.mousedown(function (e) {
            // 项目在acapp的小窗口上运行会有坐标值的不匹配的问题，这里做一下坐标映射
            // 这里canvas前面不能加$，会报错
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let tx = (e.clientX - rect.left) / outer.playground.scale;
            let ty = (e.clientY - rect.top) / outer.playground.scale;
            if (e.which === 3) {
            } else if (e.which === 1) {
                // 各个页面点击事件计算坐标的路由
                if (outer.playground.character === "shop") {
                    outer.shop.click_skill(tx, ty);
                } else if (outer.playground.character === "pop up") {
                    outer.pop_up.click_button(tx, ty);
                } else if (outer.playground.character === "game") {
                    outer.game_background.click_button(tx, ty);
                }
            }
        });

        // 重新绑定监听对象到小窗口
        // 之前的监听对象：$(window).keydown(function (e) {
        focus_canvas.keydown(function (e) {

            if (e.which === 40) {  // ↓，出勾
                outer.hook.tick();
                return false;
            } else if (e.which === 38) {  // ↑，放炸弹
                outer.use_bomb();
                return false;
            } else if (e.which === 13) {  // Enter，点击下一步按钮
                if (outer.playground.character === "shop") {  // 在商店界面按Enter会进入下一关
                    outer.shop.use_item_control_player_behavior_in_shop(5);
                } else if (outer.playground.character === "pop up") {  // 在弹窗界面按Enter会开始游戏或进入商店
                    outer.pop_up.player_click_start_game_button();
                } else if (outer.playground.character === "game") {  // 在游戏界面按Enter会结束当前关卡
                    outer.game_background.click_next_level_button();
                }
            } else if (e.which >= 49 && e.which <= 53) {  // 1~5，购买对应的道具
                outer.shop.use_item_control_player_behavior_in_shop(e.which - 49);
            }

            return true;
        });
    }

    use_bomb() {
        if (this.bomb.number <= 0 || !this.hook.catched) {
            return false;
        }

        // 重置钩子状态、刷新炸弹个数、刷新背景图
        this.reset_hook_bomb_background();
        // 绘制炸弹爆炸动图
        this.draw_explode_gif();
    }

    draw_explode_gif() {
        new Explode(this.playground, this.hook.x, this.hook.y);
    }

    reset_hook_bomb_background() {
        this.hook.caught_item = "hook";  // 重置钩子图标
        this.hook.catched = false;  // 没抓到东西
        // this.hook.direction_flag = 4;  // 定成收回状态（可能不用）（确实不用）
        this.hook.moved = this.hook.base_moved * 2;  // 重置钩子收回速度

        this.bomb.number -= 1;
        this.game_background.render();  // 减去炸弹数量之后要刷新一次背景图
    }

    // 获取两点之间的直线距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;

        // 如果是自己就画出头像，如果是敌人就用颜色代替
        if (this.img) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.photo_x * scale, this.photo_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.photo_x - this.radius) * scale, (this.photo_y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.photo_x * scale, this.photo_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = "white";
            this.ctx.fill();
        }
    }

    // 玩家死亡后将其从this.playground.players里面删除
    // 这个函数和基类的destroy不同，基类的是将其从AC_GAME_OBJECTS数组里面删除
    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}

