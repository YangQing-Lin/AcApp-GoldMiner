from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache


def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "1695"
    # 替换链接中的特殊字符
    redirect_uri = quote("https://app1695.acapp.acwing.com.cn:4434/settings/acwing/web/receive_code/")
    scope = "userinfo"
    state = get_state()

    # 有效期2小时
    cache.set(state, True, 7200)

    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })