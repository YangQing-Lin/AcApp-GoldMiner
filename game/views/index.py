# render：在服务器端渲染一个文件（拼接字符串）
from django.shortcuts import render


def index(request):
    return render(request, "multiends/web.html")