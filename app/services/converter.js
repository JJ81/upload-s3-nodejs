
var fs = require('fs');     // file system
var zlib = require('zlib'); // compress module
var path = require('path');

/**
 * 파일을 압축한다.
 * @file_path : 압축할 파일의 경로
 * @callback : 콜백함수
 * zlib 의 Gzip 모듈을 이용한다.
 */
exports.zip = function (file_name, callback) {

    console.log('compress start!');

    var folder_path = path.join(__dirname, '../temp/');
    var file_path = path.join(folder_path, file_name);

    var target_file = fs.createReadStream(file_path);             // 스트림으로부터 파일을 읽어들인다. 
    var output_name = path.join(folder_path, file_name + '.gz');  // 출력파일명을 지정한다.
    var output_file = fs.createWriteStream(output_name);          // 출력파일을 생성한다.

    // gzip 인스턴스 생성
    var gzip = zlib.createGzip({
      level: zlib.Z_BEST_COMPRESSION
    });      

    // gzip 압축시작
    target_file.pipe(gzip).pipe(output_file);    

    gzip.on('error', function () {
      console.log('compress failed.');
      callback('fail', output_name);
      gzip.removeAllListeners();
      gzip = null;          
    });

    gzip.on('end', function () { 
      console.log('compress finished.');
      callback('', output_name);
      gzip.removeAllListeners();
      gzip = null;

      fs.unlinkSync(file_path);
      console.log('original file has removed.');
    });

};

/**
 * 압추 파일을 해제한다.
 * @file_path : 해제할 압축 파일의 경로
 * @callback : 콜백함수
 * zlib 의 Gunzip 모듈을 이용한다.
 */
exports.unzip = function (file_name, callback) {

  console.log('decompress start!');
  
  var folder_path = path.join(__dirname, '../temp/');
  var file_path = path.join(folder_path, file_name);

  var target_file = fs.createReadStream(file_path); // 스트림으로부터 압축 파일을 읽어들인다.
  var output_name = path.join(folder_path, file_name.substr(0, file_name.lastIndexOf('.'))); // .gz 를 제거한다. 
  var output_file = fs.createWriteStream(output_name); // 출력 파일을 생성한다.
  
  // gunzip 인스턴스 생성
  var gunzip = zlib.createGunzip();

  // gzip 압축해제 시작
  target_file.pipe(gunzip).pipe(output_file);

  gunzip.on('error', function () {
    console.log('decompress failed.');
    callback('fail', output_name);
    gunzip.removeAllListeners();
    gunzip = null;
  });

  gunzip.on('end', function () { 
    console.log('decompress finished.');
    callback('', output_name);
    gunzip.removeAllListeners();
    gunzip = null;

    // fs.unlinkSync(file_path);
    // console.log('original file has removed.');    
  });

};