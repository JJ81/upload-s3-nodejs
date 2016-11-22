
var fs = require('fs-extra');   // file system
var zlib = require('zlib');     // compress module
var path = require('path');

var imagemin = require('imagemin');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminPngquant = require('imagemin-pngquant');
// var imageminOptipng = require('imagemin-optipng'); // 압축율이 낮아 일단 패스

var async = require('async');

/**
 * 이미지 파일을 최적화 한다.
 * @files : formidable 의 파일 배열
 * @callback : 콜백함수
 * imagemin 을 이용한다.
 * imageminPngquant :
 *  quality min/max 를 미달/초과 하는 경우 오류가 발생한다. (https://github.com/pornel/pngquant/issues/176)
 * async : http://justinklemm.com/node-js-async-tutorial/ 참고
 */
exports.minify = function (files, callback) {
    
    console.log('minify start');

    // 빌드 후 출력할 폴더 경로
    var upload_path = path.join(__dirname, '/../uploads');
    var build_path = path.join(__dirname, '/../build/minified');
    fs.ensureDir(build_path, function (err) {
        if (err) {
            console.log('minify : build path creation failed.');
            return;
        }
    });

    // 최적화 시작
    var success_count = 0;
    async.each(files, function (item, cb) {
        imagemin([item.path], build_path, {
            plugins: [
                imageminMozjpeg(),
                imageminPngquant({quality: '0-100', verbose: true})
            ]
        }).then(function (file_info) { 
            success_count++;
            console.log("%d 개의 파일 중 %d 개 최적화 완료..", files.length, success_count);            
            cb();
        });
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            console.log('minify completed.');
            callback(null);
        }    
    });

};

/**
 * 파일을 압축한다.
 * @files : formidable 의 파일 배열
 * @callback : 콜백함수
 * zlib 의 Gzip 모듈을 이용한다.
 * async : http://justinklemm.com/node-js-async-tutorial/ 참고
 */
exports.compress = function (files, callback) {

    console.log('compress start!');

    var minified_path = path.join(__dirname, '/../build/minified');
    var build_path = path.join(__dirname, '/../build/compressed');
    fs.ensureDir(build_path, function (err) {
        if (err) {
            console.log('compress : build path creation failed.');
            return;
        }
    });

    // 압축 시작 (직렬)
    var success_count = 0;
    async.each(files, function (item, cb) {
        var file_name = item.path.split('/').pop();
        var build_file = fs.createWriteStream(path.join(build_path, file_name + '.gz'));
        var gzip = zlib.createGzip();
        fs.createReadStream(path.join(minified_path, file_name)).pipe(gzip).pipe(build_file);

        gzip.on('end', function () {
            success_count++;
            console.log("%d 개의 파일 중 %d 개 압축 완료..", files.length, success_count);            
            cb();
        });
        
        gzip.on('error', function () {
            cb('compress error!');
        });
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            console.log('compress completed.');
            callback(null);
        }
    });

    return;  

};