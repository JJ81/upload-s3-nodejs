
var fs = require('fs-extra');   // file system
var path = require('path');
var aws_config = require('../secret/aws.config.js');
var AWS = require('aws-sdk');
var S3_BUCKET_NAME;
var _s3;
var async = require('async');

/**
 * 환경설정
 * 버킷과 s3 인스턴스를 설정한다.
 */
function setup () {
  
	AWS.config.region = aws_config.region;
	AWS.config.accessKeyId = aws_config.accessKeyId;
	AWS.config.secretAccessKey = aws_config.secretAccessKey;
	S3_BUCKET_NAME = aws_config.bucketName;

	_s3 = new AWS.S3();  // AWS 설정이 되고 나서 인스턴스를 실행해야 한다
}

/**
 * 파일을 s3 버킷에 업로드한다.
 * @files : formidable 의 파일 배열
 * @callback : 콜백함수
 * aws sdk를 이용한다.
 * async : http://justinklemm.com/node-js-async-tutorial/ 참고
 */
exports.start = function (files, callback) {

    console.log('upload start!');

	setup();

    var compressed_path = path.join(__dirname, '/../build/compressed');

	// 업로드 시작 (직렬)
    var success_count = 0;
    async.each(files, function (item, cb) {    
        var file_name = item.path.split('/').pop();
        var params = {
            Bucket: S3_BUCKET_NAME,
            Key: 'channel4/test/' + file_name + '.gz',
            ACL:'public-read',
            Body: fs.createReadStream(path.join(compressed_path, file_name + '.gz'))
        };        

        _s3.upload(params, function(err, data){
            if (err) {
                cb(err);
            } else {
                success_count++;
                console.log("%d 개의 파일 중 %d 개 업로드 완료..", files.length, success_count);
                cb();
            }
        });        
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            console.log('upload completed.');
            callback(null);
        }
    });

    // 업로드 시작 (병렬)
    // TODO 오류가 발생했을 경우 처리는?
    // var asyncTasks = [];
    // files.forEach(function (item) {
    //     asyncTasks.push(function (cb) {
    //         var file_name = item.path.split('/').pop();
    //         var params = {
    //             Bucket: S3_BUCKET_NAME,
    //             Key: 'channel4/test/' + file_name + '.gz',
    //             ACL:'public-read',
    //             Body: fs.createReadStream(path.join(compressed_path, file_name + '.gz'))
    //         };        

    //         _s3.upload(params, function(err, data){
    //             if (err) {
    //                 cb(err);
    //             } else {
    //                 cb();
    //             }
    //         });
    //     });
    // });
    
    // async.parallel(asyncTasks, function(){
    //     // All tasks are done now
    //     console.log('upload completed.');
    //     callback(null);
    // });

    return;
};