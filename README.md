# Liqo.JS

Untuk saat ini [Liqo.JS](https://github.com/berkedel/liqo-js) bisa digunakan sebagai backend program mutabaah.

## Pra-Instalasi

Untuk menjalankan sistem ini, dibutuhkan:
* [node.js](https://nodejs.org/en/)
* [mongodb](https://www.mongodb.com/)

## Instalasi

```
$ git clone https://github.com/berkedel/liqo-js.git
$ cd liqo-js
$ npm install
$ npm start
```

Secara default, server akan berjalan di port `3000`. Semua API bisa diakses dengan awalan `http://localhost:3000/api/`.

## Penggunaan API

Penggunaan API bisa dicoba dilakukan dengan menggunakan [curl](https://curl.haxx.se/).

### Users

* `curl -v -X GET http://localhost:3000/api/users`
* `curl -v -X GET http://localhost:3000/api/users/:id`
* `curl -v -X POST -H "Content-Type: application/json" -d '{"username": "user", "password": "pass"}' http://localhost:3000/api/users/:id`
* `curl -v -X PUT -H "Content-Type: application/json" -d '{"password":"newpass"}' http://localhost:3000/api/users/:id`
* `curl -v -X DELETE http://localhost:3000/api/users/:id`

### Auth

* `curl -v -X POST -H "Content-Type: application/json" -d '{"username":"user","password":"pass"}' http://localhost:3000/auth`

### Ibadah

* `curl -v -X GET http://localhost:3000/api/ibadahs`
* `curl -v -X GET http://localhost:3000/api/ibadahs/:id`
* `curl -v -X POST -H "Content-Type: application/json" -d '{"name": "Sholat Jamaah", "type": "fillnumber"}' http://localhost:3000/api/ibadahs/:id`
* `curl -v -X PUT -H "Content-Type: application/json" -d '{"name":"Sholat Dhuha"}' http://localhost:3000/api/ibadahs/:id`
* `curl -v -X DELETE http://localhost:3000/api/ibadahs/:id`

### Mutabaah

* `curl -v -X GET http://localhost:3000/api/mutabaahs`
* `curl -v -X GET http://localhost:3000/api/mutabaahs/:id`
* `curl -v -X POST -H "Content-Type: application/json" -d '{"user_id": "57cb459276184042cc64c38e","date": "2016-09-06","records":[{"ibadah_id":"57cd533a6f8d8a4df8ad5a17", "value":3}]}' http://localhost:3000/api/mutabaahs/:id`
* `curl -v -X PUT -H "Content-Type: application/json" -d '{"date":"2016-09-04"}' http://localhost:3000/api/mutabaahs/:id`
* `curl -v -X DELETE http://localhost:3000/api/mutabaahs/:id`

## Otorisasi API

API yang tidak memerlukan otorisasi:
* Auth API
* Users API (hanya POST)

API yang butuh otorisasi:
* Users API (GET, PUT, DELETE)
* Ibadah API
* Mutabaah API

Setelah melakukan otentifikasi via Auth API, server akan memberikan [json-web-token](https://jwt.io/) dalam header response dengan format berikut:

```
Authorization: Bearer <token>
```

Header di atas perlu disertakan dalam setiap request untuk resource yang butuh otorisasi. Contoh via [curl](https://curl.haxx.se/):

```
$ curl -v -X GET -H "Authorization: Bearer <token>" http://localhost:3000/api/users
```

## Author

Akhmad Syaikhul Hadi

## License

[The MIT License](http://opensource.org/licenses/MIT)
