/* global __dirname */

var config = require('../config.js');
var request = require('request');
//var cheerio = require('cheerio');
var fs = require('fs');
var md5 = require('md5');
var dateFormat = require('dateformat');
var mysql = require('mysql');
//var pool = mysql.createPool(config.mysql_info);

var fn = {
   validateRecord: validateRecord,
   cleanString: cleanString,
   namabulankeangka: namabulankeangka,
   getStringBetween: getStringBetween,
   insertContent: insertContent,
   downloadImage: downloadImage,

   /**
    * config variable from config.js
    */
   config: config,

   /**
    * Check row di tb_content berdasarkan kolom alias
    * @param {string} alias
    * @param {function} callback success
    * @returns {Promise}
    */
   checkRecord: function (alias, callback) {
      var thePromise = new Promise(function (resolve, reject) {
         pool.getConnection(function (err, connection) {
            if (err) {
               reject(err);
               console.log('*** mysql connection error');
               return;
            }
            var sql = 'SELECT id FROM tb_content WHERE alias="' + alias + '" LIMIT 1';
            connection.query(sql, function (error, results, fields) {
               connection.release();
               if (error) {
                  console.log('*** mysql query error : ' + error.sqlMessage);
                  reject(error.sqlMessage);
                  return;
               }

               var row = results[0];
               if (row && Number(row['id']) > 0) {
                  //console.log('sudah ada');
                  //reject('sudah ada');
                  resolve(false);
               } else {
                  if (typeof callback === 'function') {
                     callback(results, fields);
                  }
                  //console.log('aku disini');
                  resolve(true);
               }
               
            });
         });
      });
      return thePromise;
   }
};

function randonAlphaNumeric(strlen) {
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

   var limit = (strlen) ? Number(strlen) : 8;
   for (var i = 0; i < limit; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
   }
   return text;
}
function validateRecord(alias, callback) {
   pool.getConnection(function (err, connection) {
      if (err) {
         console.log('*** mysql connection error : ' + err.sqlMessage);
         return;
      }
      var sql = 'SELECT id FROM tb_content WHERE alias="' + alias + '" LIMIT 1';
      connection.query(sql, function (error, results, fields) {
         connection.release();
         if (error) {
            console.log('*** mysql query error : ' + error.sqlMessage);
            return;
         }

         var row = results[0];
         if (row && Number(row['id']) > 0) {
            //console.log('sudah ada');
         } else {
            if (typeof callback === 'function') {
               callback(results, fields);
            }
         }
      });
   });
}
function cleanString(str) {
   return str.toString().replace(/[\n\t\r]/g, "");
}
function namabulankeangka(namabulan) {
   var bulan = [
      'januari', 'febuari', 'maret', 'april', 'mei', 'juni',
      'juli', 'agustus', 'september', 'oktober', 'desember'
   ];

   var bulanke = dateFormat(new Date(), "mm");
   for (var i = 0; i < bulan.length; i++) {
      var value = bulan[i].toLowerCase();
      if (namabulan.toString().toLowerCase() === value) {
         bulanke = i + 1;
         break;
      }
   }

   if (bulanke.length === 1) {
      bulanke = '0' + bulanke;
   }
   return bulanke;
}
function getStringBetween(teks, sebelum, sesudah) {
   var $text = teks.toString();
   var $ini = $text.indexOf(sebelum);

   if ($ini < 0) {
      return '';
   }
   $ini += sebelum.toString().length;
   var panjang = ($text.indexOf(sesudah, $ini)) - $ini;
   return $text.substr($ini, panjang);
}

/**
 * Insert tb_content row mysql
 * @param {object} obj row of mysql tb_content
 * @param {function} callback fires when mysql query success
 * @returns {undefined}
 */
function insertContent(obj, callback) {
   if (!obj) {
      console.log('no obj');
      return;
   }
   var pubdate = Date.parse(obj.publish_up);
   var $now = new Date().getTime();
   if(pubdate > $now){
      return callback();
   }

   pool.getConnection(function (err, connection) {
      if (err) {
         console.log('*** [insertContent] connection error : ' + err.sqlMessage);
         return;
      }
      var sql = 'INSERT INTO tb_content SET ?';
      connection.query(sql, obj, function (error, results, fields) {
         connection.release();
         if (error) {
            console.log('*** [insertContent] fail : ' + error.sqlMessage);
            console.log('*** source : ' + obj.source);
            return;
         }

         if (typeof callback === 'function') {
            callback(results, fields);
         }
      });
   });
}
function downloadImage(image_url, directory, callback) {
   if (image_url === '' || !image_url) {
      return '@prefix/default.jpg';
   }
   var filename = '';
   callback = (typeof callback === 'function') ? callback : function () {};
   //-- fix bug kadang ada string diawali //
   if (image_url.toString().indexOf('//') === 0) {
      image_url = image_url.toString().replace("//", '');
   }

   //-- jika gambar gif  jangan di download
   if (image_url.toLowerCase().indexOf('.gif') >= 0) {
      console.log(image_url);
      return image_url;
   }

   var dir1 = __dirname + '/../imgc';
   if (!fs.existsSync(dir1)) {
      fs.mkdirSync(dir1);
   }

   /*
    var dir2 = dir1 + '/' + directory;
    if (!fs.existsSync(dir2)) {
    fs.mkdirSync(dir2);
    }
    */

   //-- jika direktori banyak cth : /wol/2017-10-20/satu/
   var directories = dir1;
   var adir = directory.split('/');
   for (var i = 0; i < adir.length; i++) {
      var dirname = adir[i].toString();
      if (dirname === '') {
         continue;
      }
      directories = directories + '/' + dirname;
      if (!fs.existsSync(directories)) {
         fs.mkdirSync(directories);
      }
   }

   var f1 = md5(image_url);
   var filename = f1 + '.jpg';
   var filepath = directories + '/' + filename;
   var output = filepath.replace(dir1, '@prefix');

   //-- check jika gambar sudah ada maka gak usah lagi download
   if (fs.existsSync(filepath)) {
      callback(output, 'file exist');
      //console.log('*** file exist ' + filepath);
      return output;
   }

   request.get(image_url, function (err, res, body) {
      if (err) {
         console.log('*** error image : ' + image_url);
         return;
      }
      request(image_url).pipe(fs.createWriteStream(filepath)).on('close', function () {
         if (typeof callback === 'function') {
            callback(output, 'file just added');
         }
      });
   });
   return output;
}

module.exports = fn;