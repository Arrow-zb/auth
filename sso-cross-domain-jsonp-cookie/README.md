# sso-cross-domain-jsonp
基于 jsonp 实现跨域的单点登录
假设存在以下三个域：
域A：sso.cn     登录系统
域B：note.cn    子系统 1
域C：ui.cn      子系统 2

子系统 1 和 2 均需要登录，基于 jsonp 来实现单点登录，无论访问哪一个子系统，在未登录情况下，首先重定向到登录系统进行登录，登录成功后调转回对应的子系统，子系统即可访问，同时其它的子系统也无需再次登录即可访问。
# 实现思路
1. 首先在 `sso.cn` 下搭建一个登陆系统，无论是在域 A B C 哪一个，只要未登录的情况下，首先都重定向(携带者到来的url)到这个域下面进行登录，校验完成后，颁发一个cookie给前端，cookie的值为包含用户信息(如用户ID)的一个 token 值。



https://stackoverflow.com/questions/10956488/cross-domain-login-using-jsonp-and-cookies/10956489