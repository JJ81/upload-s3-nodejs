
// set for using S3 in aws
var aws_config = require('../secret/aws.config.js');
var AWS = require('aws-sdk');
var S3_BUCKET_NAME;
var _s3;

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
 * @file_path : 업로드할 파일의 경로
 * @callback : 콜백함수
 * aws sdk를 이용한다.
 */
exports.start = function (file_path, callback) {

	setup();

	var file_name = file_path.split('/').pop();

	// 업로드
	var params = {
		Bucket: S3_BUCKET_NAME,
		Key: 'channel4/test/' + file_name,
		ACL:'public-read',
		Body: require('fs').createReadStream(file_path)
	};  

	_s3.upload(params, function(err, data){
		callback(err, data);
	});

};