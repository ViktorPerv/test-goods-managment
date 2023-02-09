# Symfony тестовый проект
Цель - загрузка xml документа произвольной велечины от 3М до 600М.
Xml парсится в модель product и выводится на странице /product
Таблица с пагинацией, фильтром и сортировкой

## Работа с docker
- cp .env.dist .env
- docker-compose up -d --build

По умолчанию url проекта http://localhost:8080

## Тесты
- Для генерации тестов
`symfony php .\vendor\bin\phpunit --coverage-html public/coverage`
