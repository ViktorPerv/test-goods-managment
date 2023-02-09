/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/global.scss';

// start the Stimulus application
import './bootstrap';

import DataTable from "datatables.net";

const $ = require('jquery');
// this "modifies" the jquery module: adding behavior to it
// the bootstrap module doesn't export/return anything
require('bootstrap');


window.addEventListener('DOMContentLoaded', function () {

    const table = new DataTable('#goodsTable', {
        serverSide: true,
        ajax: '/product/load',
        orderMulti: false,
        columns: [
            {data: "id"},
            {data: "name"},
            {data: "description"},
            {data: "weight"},
            {data: "category"}
        ]
    });

    const form = document.getElementById('xmlUploader');
    const progressBar = document.getElementById('fileUploadProgress');

    if (form && progressBar) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            console.log('submit form');
        });
    }

    if (!XMLHttpRequest.prototype.sendAsBinary) {
        // фикс для старой версии браузера Chrome
        XMLHttpRequest.prototype.sendAsBinary = function(dataset) {
            function byteValue(x) {
                return x.charCodeAt(0) & 0xff;
            }
            let ords = Array.prototype.map.call(dataset, byteValue);
            let ui8a = new Uint8Array(ords);
            this.send(ui8a.buffer);
        }
    }
})

function ShowForm() {

    // Создаем объект - FileUploader. Задаем опции.
    var uploader=new FileUploader( {

        // Сообщение об ошибке
        message_error: 'Ошибка при загрузке файла',

        // ID элемента формы
        form: 'xmlUploader',

        // ID элемента <input type=file
        formfiles: 'files',

        // Идентификатор загрузки. В нашему случе хэш.
        uploadid: '<?php print $hash;?>',

        // URL скрипта загрузки (описан выше).
        uploadscript: './upload.php',

        // URL, куда перенаправить пользователя при успешной загрузке
        redirect_success: './step2.php?hash=<?php print $hash;?>',

        // URL, куда отправить пользователя при ошибке загрузки
        redirect_abort: './abort.php?hash=<?php print $hash;?>',

        // Размер порции. 2 Мб
        portion: 1024*1024*2
    });

    // Если не удалось создать объект, то перенаправим пользователя на простую форму загруки.
    if (!uploader) document.location='/upload/simple.php?hash=<?php print $hash;?>';
    else {
        // Если браузер не поддерживается, то перенаправим пользователя на простую форму загруки.
        if (!uploader.CheckBrowser()) document.location='/upload/simple.php?hash=<?php print $hash;?>';
        else {
            // Если все нормально, то отобразим форму (по умолчанию она скрыта)
            var e=document.getElementById('uploadform');
            if (e) e.style.display='block';

        }
    }
}

/**
 * Класс FileUploader.
 * @param options массив опций загрузки
 * @returns {null}
 * @constructor
 */
function FileUploader(options) {

    // Позиция, с которой будем загружать файл
    this.position=0;

    // Размер загружаемого файла
    this.filesize=0;

    // Объект Blob или File (FileList[i])
    this.file = null;

    // Ассоциативный массив опций
    this.options=options;

    // Если не определена опция uploadscript, то возвращаем null. Нельзя
    // продолжать, если эта опция не определена.
    if (this.options['uploadscript'] === undefined) return null;

    /*
    * Проверка, поддерживает ли браузер необходимые объекты
    * @return true, если браузер поддерживает все необходимые объекты
    */
    this.CheckBrowser=function() {
        return !!(window.File && window.FileReader && window.FileList && window.Blob);
    }


    /*
    * Загрузка части файла на сервер
    * @param from Позиция, с которой будем загружать файл
    */
    this.UploadPortion=function(from) {

        // Объект FileReader, в него будем считывать часть загружаемого файла
        const reader = new FileReader();

        // Текущий объект
        const that = this;

        // Позиция с которой будем загружать файл
        const loadfrom = from;

        // Объект Blob, для частичного считывания файла
        const blob = null;

        // Таймаут для функции setTimeout. С помощью этой функции реализована повторная попытка загрузки
        // по таймауту (что не совсем корректно)
        const xhrHttpTimeout = null;

        /*
        * Событие срабатывающее после чтения части файла в FileReader
        * @param evt Событие
        */
        reader.onloadend = function(evt) {
            if (evt.target.readyState === FileReader.DONE) {

                // Создадим объект XMLHttpRequest, установим адрес скрипта для POST
                // и необходимые заголовки HTTP запроса.
                const xhr = new XMLHttpRequest();
                xhr.open('POST', that.options['uploadscript'], true);
                xhr.setRequestHeader("Content-Type", "application/x-binary; charset=x-user-defined");

                // Идентификатор загрузки (чтобы знать на стороне сервера что с чем склеивать)
                xhr.setRequestHeader("Upload-Id", that.options['uploadid']);
                // Позиция начала в файле
                xhr.setRequestHeader("Portion-From", from);
                // Размер порции
                xhr.setRequestHeader("Portion-Size", that.options['portion']);

                // Установим таймаут
                that.xhrHttpTimeout=setTimeout(function() {
                    xhr.abort();
                },that.options['timeout']);

                /*
                * Событие XMLHttpRequest.onProcess. Отрисовка ProgressBar.
                * @param evt Событие
                */
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {

                        // Посчитаем количество закаченного в процентах (с точность до 0.1)
                        var percentComplete = Math.round((loadfrom+evt.loaded) * 1000 / that.filesize);percentComplete/=10;

                        // Посчитаем ширину синей полоски ProgressBar
                        var width=Math.round((loadfrom+evt.loaded) * 300 / that.filesize);

                        // Изменим свойства элементом ProgressBar'а, добавим к нему текст
                        var div1=document.getElementById('cnuploader_progressbar');
                        var div2=document.getElementById('cnuploader_progresscomplete');

                        div1.style.display='block';
                        div2.style.display='block';
                        div2.style.width=width+'px';
                        if (percentComplete<30) {
                            div2.textContent='';
                            div1.textContent=percentComplete+'%';
                        }
                        else {
                            div2.textContent=percentComplete+'%';
                            div1.textContent='';
                        }
                    }

                }, false);



                /*
                * Событие XMLHttpRequest.onLoad. Окончание загрузки порции.
                * @param evt Событие
                */
                xhr.addEventListener("load", function(evt) {

                    // Очистим таймаут
                    clearTimeout(that.xhrHttpTimeout);

                    // Если сервер не вернул HTTP статус 200, то выведем окно с сообщением сервера.
                    if (evt.target.status !== 200) {
                        alert(evt.target.responseText);
                        return;
                    }

                    // Добавим к текущей позиции размер порции.
                    that.position+=that.options['portion'];

                    // Закачаем следующую порцию, если файл еще не кончился.
                    if (that.filesize>that.position) {
                        that.UploadPortion(that.position);
                    }
                    else {
                        // Если все порции загружены, сообщим об этом серверу. XMLHttpRequest, метод GET,
                        // PHP скрипт тот-же.
                        var gxhr = new XMLHttpRequest();
                        gxhr.open('GET', that.options['uploadscript']+'?action=done', true);

                        // Установим идентификатор загруки.
                        gxhr.setRequestHeader("Upload-Id", that.options['uploadid']);

                        /*
                        * Событие XMLHttpRequest.onLoad. Окончание загрузки сообщения об окончании загрузки файла :).
                        * @param evt Событие
                        */
                        gxhr.addEventListener("load", function(evt) {

                            // Если сервер не вернул HTTP статус 200, то выведем окно с сообщением сервера.
                            if (evt.target.status !== 200) {
                                alert(evt.target.responseText.toString());

                            }
                                // Если все нормально, то отправим пользователя дальше. Там может быть сообщение
                            // об успешной загрузке или следующий шаг формы с дополнительным полями.
                            else window.parent.location=that.options['redirect_success'];
                        }, false);

                        // Отправим HTTP GET запрос
                        gxhr.sendAsBinary('');
                    }
                }, false);

                /*
                * Событие XMLHttpRequest.onError. Ошибка при загрузке
                * @param evt Событие
                */
                xhr.addEventListener("error", function(evt) {

                    // Очистим таймаут
                    clearTimeout(that.xhrHttpTimeout);

                    // Сообщим серверу об ошибке во время загруке, сервер сможет удалить уже загруженные части.
                    // XMLHttpRequest, метод GET,  PHP скрипт тот-же.
                    const gxhr = new XMLHttpRequest();

                    gxhr.open('GET', that.options['uploadscript']+'?action=abort', true);

                    // Установим идентификатор загруки.
                    gxhr.setRequestHeader("Upload-Id", that.options['uploadid']);

                    /*
                    * Событие XMLHttpRequest.onLoad. Окончание загрузки сообщения об ошибке загрузки :).
                    * @param evt Событие
                    */
                    gxhr.addEventListener("load", function(evt) {

                        // Если сервер не вернул HTTP статус 200, то выведем окно с сообщением сервера.
                        if (evt.target.status !== 200) {
                            alert(evt.target.responseText);

                        }
                    }, false);

                    // Отправим HTTP GET запрос
                    gxhr.sendAsBinary('');

                    // Отобразим сообщение об ошибке
                    if (that.options['message_error'] === undefined) alert("There was an error attempting to upload the file."); else alert(that.options['message_error']);
                }, false);

                /*
                * Событие XMLHttpRequest.onAbort. Если по какой-то причине передача прервана, повторим попытку.
                * @param evt Событие
                */
                xhr.addEventListener("abort", function(evt) {
                    clearTimeout(that.xhrHttpTimeout);
                    that.UploadPortion(that.position);
                }, false);

                // Отправим порцию методом POST
                xhr.sendAsBinary(evt.target.result);
            }
        };

        that.blob=null;

        // Считаем порцию в объект Blob. Три условия для трех возможных определений Blob.[.*]slice().
        if (this.file.slice) that.blob=this.file.slice(from,from+that.options['portion']);
        else {
            if (this.file.webkitSlice) that.blob=this.file.webkitSlice(from,from+that.options['portion']);
            else {
                if (this.file.mozSlice) that.blob=this.file.mozSlice(from,from+that.options['portion']);
            }
        }

        // Считаем Blob (часть файла) в FileReader
        reader.readAsBinaryString(that.blob);
    }


    /*
    * Загрузка файла на сервер
    * return Число. Если не 0, то произошла ошибка
    */
    this.Upload=function() {

        // Скроем форму, чтобы пользователь не отправил файл дважды
        const e = document.getElementById(this.options['form']);
        if (e) e.style.display='none';

        if (!this.file) return -1;
        else {

            // Если размер файла больше размера порциии ограничимся одной порцией
            if (this.filesize>this.options['portion']) this.UploadPortion(0,this.options['portion']);

            // Иначе отправим файл целиком
            else this.UploadPortion(0,this.filesize);
        }
    }



    if (this.CheckBrowser()) {

        // Установим значения по умолчанию
        if (this.options['portion']===undefined) this.options['portion']=1048576;
        if (this.options['timeout']===undefined) this.options['timeout']=15000;

        const that = this;

        // Добавим обработку события выбора файла
        document.getElementById(this.options['formfiles']).addEventListener('change', function (evt) {

            const files = evt.target.files;

            // Выберем только первый файл
            for (let i = 0, f; f = files[i]; i++) {
                that.filesize=f.size;
                that.file = f;
                break;
            }
        }, false);

        // Добавим обработку события onSubmit формы
        document.getElementById(this.options['form']).addEventListener('submit', function (evt) {
            that.Upload();
            (arguments[0].preventDefault)? arguments[0].preventDefault(): arguments[0].returnValue = false;
        }, false);
    }


}