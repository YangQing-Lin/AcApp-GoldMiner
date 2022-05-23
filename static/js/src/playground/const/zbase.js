/**
 * 静态变量
 */

let MAGNIFICATION = 1;
let BASE_SCREEN_WIDTH = 512;
let BASE_SCREEN_HEIGHT = 448;
let SCREEN_WIDTH = 512; //屏幕宽
let SCREEN_HEIGHT = 448; //屏幕高


/**************图片资源*****************/
let MENU_IMAGE = new Image();
MENU_IMAGE.src = "https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/playground/menu.gif";
let RESOURCE_IMAGE = new Image();
RESOURCE_IMAGE.src = "https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/playground/tankAll.gif";


/**************各个图块在图片中的位置*****************/
let POS = new Array();
POS["selectTank"] = [128, 96];
POS["stageLevel"] = [396, 96];
POS["num"] = [256, 96];
POS["map"] = [0, 96];
POS["home"] = [256, 0];
POS["score"] = [0, 112];
POS["player"] = [0, 0];
POS["protected"] = [160, 96];
POS["enemyBefore"] = [256, 32];
POS["enemy1"] = [0, 32];
POS["enemy2"] = [128, 32];
POS["enemy3"] = [0, 64];
POS["bullet"] = [80, 96];
POS["tankBomb"] = [0, 160];
POS["bulletBomb"] = [320, 0];
POS["over"] = [384, 64];
POS["prop"] = [256, 110];

/**************声音资源*****************/
let START_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/start.mp3");
let BULLET_DESTROY_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/bulletCrack.mp3");
let TANK_DESTROY_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/tankCrack.mp3");
let PLAYER_DESTROY_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/playerCrack.mp3");
let MOVE_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/move.mp3");
let ATTACK_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/attack.mp3");
let PROP_AUDIO = new Audio("https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/audio/prop.mp3");


/**************游戏状态*****************/
let GAME_STATE_MENU = 0;
let GAME_STATE_INIT = 1;
let GAME_STATE_START = 2;
let GAME_STATE_OVER = 3;
let GAME_STATE_WIN = 4;

/**************地图块*****************/
let WALL = 1;
let GRID = 2;
let GRASS = 3;
let WATER = 4;
let ICE = 5;
let HOME = 9;
let ANOTHREHOME = 8;

/**************坦克及子弹的四个方向*****************/
let UP = 0;
let DOWN = 1;
let LEFT = 2;
let RIGHT = 3;

/**************坦克及子弹的四个方向*****************/
let ENEMY_LOCATION = [192, 0, 384]; //相对与主游戏区

/**************子弹类型*****************/
let BULLET_TYPE_PLAYER = 1;
let BULLET_TYPE_ENEMY = 2;
/**************爆炸类型****************/
let CRACK_TYPE_TANK = "tank";
let CRACK_TYPE_BULLET = "bullet";



