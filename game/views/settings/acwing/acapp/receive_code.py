from django.http import JsonResponse
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from random import randint


def receive_code(request):
    data = request.GET

    if "errorcode" in data:
        return JsonResponse({
            'result': "apply failed",
            'errorcode': data['errorcode'],
            'errmsg': data['errmsg']
        })

    code = data.get('code')
    state = data.get('state')

    # 如果state不存在就直接跳过
    # 刚生成的state会保存两个小时，state不存在有两种情况：
    # 1. 用户过了两个小时还没点确定
    # 2. 这个是其他服务器的攻击
    if not cache.has_key(state):
        return JsonResponse({
            'result': "state not exist"
        })
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
    # filter函数的作用类似于re.findall()，比get好用
    players = Player.objects.filter(openid=openid)
    if players.exists():  # 如果该用户已存在，则无需重新获取信息，直接登陆即可
        player = players[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo
        })

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

    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo
    })