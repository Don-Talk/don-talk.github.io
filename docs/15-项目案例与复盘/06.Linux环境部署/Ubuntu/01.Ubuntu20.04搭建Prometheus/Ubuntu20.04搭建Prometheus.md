# Ubuntu20.04搭建Prometheus



> https://blog.csdn.net/zfgylbcc/article/details/137177631





promethus的启动、停止：

```
/etc/init.d/prometheus start/stop/restart
```text



启动报错，找不到deamond

```shell
sudo apt-get update
sudo apt-get install daemon



```shell
# 注意后面的#号
sudo -u node_exporter_user ./node_exporter --web.listen-address="183.233.197.205:9100" --log.level=info &

sudo -u node_exporter ./node_exporter --web.listen-address="0.0.0.0:9100" --log.level=debug
```

