from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player


def register(request):
    data = request.GET
    # 查找用户名（如果没找到就返回空字符串），并去除前后空格
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()
    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空",
        })
    if password != password_confirm:
        return JsonResponse({
            'result': "两次密码不一致",
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "用户名已存在",
        })
    user = User(username=username)
    user.set_password(password)
    user.save()

    Player.objects.create(user=user, photo="https://cdn.acwing.com/media/user/profile/photo/193834_lg_8bd6d6d9ca.jpg")
    login(request, user)
    return JsonResponse({
        'result': "success",
    })