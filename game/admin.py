from django.contrib import admin
from game.models.player.player import Player

# Register your models here.

# 将玩家数据表注册到后台数据库中
admin.site.register(Player)