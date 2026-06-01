# nginx入门及相关案例 



## 1.安装nginx

> https://blog.csdn.net/weixin_53742691/article/details/130437012

```shell
# 1.安装epel-release
yum -y install epel-release

# 2.安装Nginx
 yum -y install nginx

# 3.启动Nginx
 systemctl start nginx  	#启动服务
 systemctl enable nginx 	#设置开机自启
 systemctl status nginx  	#查看启动状态
 
# 4.配置Nginx
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak

# 5.重启Nginx
systemctl restart nginx

# 6.重新加载nginx配置
nginx -s reload
```



## 2.nginx.conf文件配置

```shell
user  nginx;
worker_processes  auto;
worker_rlimit_nofile 8192;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    access_log  /var/log/nginx/access.log;
    error_log   /var/log/nginx/error.log;

    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;

    #gzip  on;

    server {
        listen       8082;
        server_name  localhost;
        root         /www/wwwroot/dist;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        location  /prod-api/ 
        {
                rewrite /api(.*) $1 break;
                proxy_pass http://127.0.0.1:8086/;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header REMOTE-HOST $remote_addr;
                proxy_http_version 1.1;
        }

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }
}
```



## 3.部署Vue前端项目

1. 打包前端项目，生成`dist`文件夹
2. 将`dist文件夹`复制到服务器的`/www/wwwroot`目录下
3. 修改`/etc/nginx/nginx.conf`文件的内容为如上
4. 刷新nginx
5. 浏览器访问

