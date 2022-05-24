from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint


def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    # 如果state不存在就直接跳过
    # 刚生成的state会保存两个小时，state不存在有两种情况：
    # 1. 用户过了两个小时还没点确定
    # 2. 这个是其他服务器的攻击
    if not cache.has_key(state):
        return redirect("index")
    cache.delete(state)

    # 二. 向acwing请求access_token
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': "1695",
        'secret': "替换自己的secret",
        'code': code
    }
    access_token_res = requests.get(apply_access_token_url, params=params).json()

    # 三. 申请用户信息
    access_token = access_token_res['access_token']
    openid = access_token_res['openid']
    players = Player.objects.filter(openid=openid)
    if players.exists():  # 如果该用户已存在，则无需重新获取信息，直接登陆即可
        login(request, players[0].user)
        return redirect("index")
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'access_token': access_token,
        'openid': openid
    }
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    # 找到一个新的用户名
    while User.objects.filter(username=username):
        username += str(randint(0, 9))
    
    # 创建用户（不用管密码），并且create包含了save的功能
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    # 登录
    login(request, user)
    
    return redirect("index")