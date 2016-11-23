var express = require('express');
var router = express.Router();
var path = require('path');

var async = require('async');
var converter = require('../services/converter');    // compress, image minify
var formParser = require('../services/form-parser'); // formidable
var uploader = require('../services/uploader');      // file upload

var formidable = require('formidable');

router.get('/list', function(req, res) {
  res.json({
    'success' : true
  });
});

router.post('/parse', function (req, res) {
    
    // TODO 
    // 1. 작업완료 시 중간 결과물들은 모두 삭제
    // 2. DB 에 로그정보 기록
    // 3. GIF, ICO 등 기타 다른 포멧의 이미지 테스트 필요

    var tasks = [
        /**
         * @POST 요청을 처리한다.
         * formParser 에서는 formidable 을 통해 req 의 파일을 수신하고, 
         * 콜백함수를 통해 files (파일정보의 배열) 을 돌려준다. 
         */    
        function (callback) {
            formParser.parse(req, function (err, files) {
                if (err) return callback(err);
                callback(null, files);
            });
        },

        /**
         * @이미지 파일을 최적화 한다.
         * 이미지 파일이 아닐 경우 최적화 되지 않는다.
         */
        function (files, callback) {
            converter.minify(files, function (err) {
                if (err) return callback(err);
                callback(null, files);
            });
        },

        /**
         * @이미지 파일을 축소 한다.
         * 
         */
        function (files, callback) {
            converter.scale(files, function (err) {
                if (err) return callback(err);
                callback(null, files);
            });
        },        

        /**
         * @파일을 개별적으로 압축한다.
         */
        function (files, callback) {
            converter.compress(files, function (err) {
                if (err) return callback(err);
                callback(null, files);
            });
        },         

        /**
         * @파일을 개별적으로 업로드한다.
         */
        function (files, callback) {
            uploader.start(files, function (err) {
                if (err) return callback(err);
                callback(null);
            });
        }
    ];

    // 위에 정의된 tasks 를 series 로 실행한다음 res 를 반환한다.
    async.waterfall(tasks, function (err) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        } else {
            console.log('job completed!');
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('Upload received :\n');
            res.end();
        }        
    });

});


router.post('/upload', function (req, res) {
  var s3 = new AWS.S3(); // AWS 설정이 되고 나서 인스턴스를 실행해야 한다
  var form = new formidable.IncomingForm({
    encoding: 'utf-8',
    keepExtensions: true, // ??
    multiples: true // 파일이 여러 개의 파일을 업도르할 경우 반드시 이 부분은 설정해주어야 한다.
  });

  form.parse(req, function (err, fields, files) {
    /**
     * TODO 1. S3 버킷에 폴더를 생성한다. ok 자동으로 생성이 된다.
     * TODO 2. 해당 폴더에 이름을 바꾸어서 업로드한다. ok
     * TODO 3. 업로드할 이미지 미리 보기 기능을 구현한다. not yet; 클라이언트에서 구현하거나 미리 이미지를 업로드하고 나서 이미지를 다시 로드시켜서 보여주거나 해야 한다.
     * TODO 4. 업로드되는 동안 업로드되는 용량을 추적할 수 있어야 한다. ok
     *
     * TODO 5. 프로그래스바를 이쁘게 보일 수 있도록 css를 수정한다.
     * TODO 6. for문을 사용해서 모든 파일이 업로드될 수 있도록 한다
     * TODO 7. 업로드를 하면서 압축을 할 수 있도록 한다
     * TODO 8. 업로드를 하면서 이미지의 경우 압축을 하고 리사이즈도 할 수 있도록 한다
     * TODO 9. 이미지의 경우 특정 위치를 크롭할 수 있도록 설정을 한다.
     * TODO 10. 업로드를 하면서 용량을 줄여서 한벌 더 저장을 할 수 있다.
     * TODO 11. https://blueimp.github.io/jQuery-File-Upload/ 의 기능을 그대로 사용할 수 있다.
     * TODO 12. AK, SK를 은닉화해야 한다.
     * TODO 13.
     */

    console.log('image size');
    console.log(files['img_files[]'].length);

    console.info('files info');
    console.info(files);

    console.info('fields info');
    console.info(fields);

    //console.info(files['img_files[]'].name);
    //console.info(files['img_files[]'].path);

    // 이 구간에서 몇 번의 for문을 돌아서 업로드를 해야 한다??
    var params = {
      Bucket: S3_BUCKET_NAME,
      Key: 'channel4/test/' + files['img_files[]'].name, // 앞에 폴더이름을 넣어주면 버킷내에 자동으로 생성이 된다. 업로드 갯수에 따라서 배열을 넣고 빼는 기능이 필요하다
      ACL:'public-read',
      Body: require('fs').createReadStream(files['img_files[]'].path)
    };

    s3.upload(params, function(err, data){
      if(err){
        console.error('err : ' + err);
      }else{
        console.log('upload result');
        console.info(data);
        res.json({
          "success" : true,
          "statusCode" : "200"
        });
      }
    });
  });
});

module.exports = router;
