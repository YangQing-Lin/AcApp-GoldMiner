#! /bin/bash

JS_PATH=/home/gold/AcApp-GoldMiner/game/static/js/
JS_PATH_DIST=${JS_PATH}dist/
JS_PATH_SRC=${JS_PATH}src/

JS_FILE_NAME=game-version-1.1.js

# find . $JS_PATH_SRC -type f -name '*.js' | sort | xargs cat > ${JS_PATH_DIST}${JS_FILE_NAME}
# find . $JS_PATH_SRC -type f -name '*.js' | sort | xargs cat | terser -c -m > ${JS_PATH_DIST}${JS_FILE_NAME}

# 归档静态文件
echo yes | python3 /home/gold/AcApp-GoldMiner/manage.py collectstatic

uwsgi --ini /home/gold/AcApp-GoldMiner/scripts/uwsgi.ini



# 记录一下这里的坑点，项目进行到这里已经需要多个服务了，顺序是：
# 启动nginx服务             sudo /etc/init.d/nginx start
# 启动redis-server服务      sudo redis-server /etc/redis/redis.conf
# 启动uwsgi服务             uwsgi –-ini scripts/uwsgi.ini
# 启动django_channels服务   daphne -b 0.0.0.0 -p 5015 acapp.asgi:application
# 启动匹配系统              （在match_system/src目录下） ./main.py
