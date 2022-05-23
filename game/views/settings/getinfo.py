from django.http import JsonResponse
from game.models.player.player import Player


def getinfo_acapp(request):
    # 取出第一名玩家
    player = Player.objects.all()[0]
    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })


def getinfo_web(request):
    user = request.user
    # 判断用户是否登录
    if not user.is_authenticated:
        return JsonResponse({
            'result': "未登录",
        })
    else:
        # 查询用户
        player = Player.objects.get(user=user)
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })


def getinfo(request):
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)