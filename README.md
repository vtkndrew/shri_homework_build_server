# ШРИ ДЗ: Инфраструктура (build server + build agent)

## Структура папок в репозитории

`Build server` лежит в папке [server](server).

`Build agent` лежит в папке [agent](agent).

## Необходимая версия node

`v10.15.2`

## Как запустить

1. Чтобы запустить, предварительно надо заполнить в [server-config.json](server/server-conf.json) поле `apiToken`. Этот токен для запросов к апи надо получить отсюда: [https://hw.shri.yandex/](https://hw.shri.yandex/)

2. Для каждого из каталогов выполнить в терминале:

```
cd $dir && npm ci && npm start
```

## Порты, конфиги

`Build server` по дефолту запустится на `12345` порту. Изменить можно в конфиге сервера: [server-config.json](server/server-conf.json)

`Build agent` по дефолту запустится на `12346` порту. Изменить можно в конфиге агента: [agent-conf.json](agent/agent-conf.json)

## Клиентское приложение + сервер API

Для удобного добавления новых сборок и наглядного отображения статуса сборок, можно воспользоваться: [https://github.com/spelot/shri_homework_ci](https://github.com/spelot/shri_homework_ci)
