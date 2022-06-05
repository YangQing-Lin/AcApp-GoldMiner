#! /bin/bash


rsync -avzu --progress \
/mnt/d/Project/AcWing/AcApp-GoldMiner/game/static/ \
gold:AcApp-GoldMiner/game/static/

rsync -avzu --progress \
/mnt/d/Project/AcWing/AcApp-GoldMiner/game/templates/multiends/web.html \
gold:AcApp-GoldMiner/game/templates/multiends/web.html

rsync -avzu --progress \
/mnt/d/Project/AcWing/AcApp-GoldMiner/scripts/ \
gold:AcApp-GoldMiner/scripts/