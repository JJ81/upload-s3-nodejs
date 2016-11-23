var formidable = require('formidable'),
    util = require('util'),
    fs = require('fs-extra'),
    path = require('path');

/**
 * formidable 을 이용하여, POST 요청을 처리한다.  
 */
exports.parse = function (req, res, callback) {
    
    if (req.method.toLowerCase() === 'post') {
        var form = new formidable.IncomingForm({
            encoding: 'utf-8',  // Sets encoding for incoming form fields
            uploadDir: path.join(__dirname, '/../uploads'), // Sets the directory for placing file uploads in.
            keepExtensions: true, // Preserve file extension when writing to uploadDir 
            multiples: true, // Submit multiple files using the HTML5 multiple attribute             
        });

        console.log('formidable start!');

        form.parse(req, function(err, fields, files) {
            if (err) {
                console.error('form.parse(error) : ' + err);
            } else {
                console.log('form.parse success!');
            }
        });

        form.on('end', function () {
            callback(null, this.openedFiles);
        });

        form.on('error', function (err) {
            callback('form.on(error) :' + err);
        });

        form.on('aborted', function () {            
            callback('form.on(aborted)');
        });        

        return;
    }
};
