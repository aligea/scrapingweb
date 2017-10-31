var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var md5 = require('md5');
var dateFormat = require('dateformat');
var mysql = require('mysql');
var pool = mysql.createPool({
   connectionLimit: 10,
   host: 'localhost',
   user: 'root',
   password: 'terserahsaja',
   database: 'db_grabbing'
});

function validateRecord(alias, callback) {
   pool.getConnection(function (err, connection) {
      var sql = 'SELECT id FROM tb_content WHERE alias="' + alias + '" LIMIT 1';
      connection.query(sql, function (error, results, fields) {
         connection.release();
         if (error) {
            //console.log('mysql error :');
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
function insertContent(obj, callback) {
   if (!obj) {
      return;
   }

   pool.getConnection(function (err, connection) {
      var sql = 'INSERT INTO tb_content SET ?';
      connection.query(sql, obj, function (error, results, fields) {
         connection.release();
         if (error) {
            //console.log('mysql error :');
            return;
         }

         if (typeof callback === 'function') {
            callback(results, fields);
         }
      });
   });
}
function downloadImage(image_url, directory, callback) {
   var filename = '';

   var dir1 = './imgc';
   if (!fs.existsSync(dir1)) {
      fs.mkdirSync(dir1);
   }

   var dir2 = dir1 + '/' + directory;
   if (!fs.existsSync(dir2)) {
      fs.mkdirSync(dir2);
   }

   var f1 = md5(image_url);
   var filename = f1 + '.jpg';
   var filepath = dir2 + '/' + filename;
   var output = filepath.replace(dir1, '@prefix');

   //-- check jika gambar sudah ada maka gak usah lagi download
   if (fs.existsSync(filepath)) {
      //console.log('*** file exist ' + filepath);
      return;
   }

   request.head(image_url, function (err, res, body) {
      //console.log('content-type:', res.headers['content-type']);
      //console.log('content-length:', res.headers['content-length']);

      request(image_url).pipe(fs.createWriteStream(filepath)).on('close', function () {
         if (typeof callback === 'function') {
            callback(output);
         }
      });
   });

   return output;
}

function extractPage(url, label, callback) {
   //var url = 'http://waspada.co.id/medan/mahasiswa-tabagsel-kecewa-ketua-dprd-palas-positif-narkoba-cuma-direhabilitasi/';
   var onRequesting = function (error, response, _html) {
      if (error) {
         //console.log(error);
         return;
      }
      _html = cleanString(response.body);
      var html = _html.toString().replace('</html>', '') + '</html>';
      var $ch = cheerio.load(html);
      var content = {};
//      fs.writeFile("./test.html", html, function (err) {
//         if (err) {
//            return console.log(err);
//         }
//         console.log("The file was saved!");
//      });

      var publishdate = (function () {
         var datetag = getStringBetween(html, '<meta property="article:published_time" content="', '" />');
         var output = dateFormat(new Date(datetag), "yyyy-mm-dd HH:MM:ss");

         return output;
      })();

      var fulltext = (function () {
         var iklan = '<!-- Quick Adsense WordPress Plugin: http://quickadsense.com/ --><div style="float:none;margin:10px 0 10px 0;text-align:center;"><p align="center"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3424668230716175" data-ad-slot="2544187502" data-ad-format="auto"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></p></div>';
         var output = $ch.html($ch('#the-post .entry'));
         output = output.replace($ch.html($ch("#the-post #jp-relatedposts")[0]), '');
         output = output.replace($ch.html($ch("#the-post .sharedaddy")[0]), '');
         output = output.replace(iklan, '');

         return $ch(output).html();
      })();

      var imageurl = $ch('.single-post-thumb img')[0].attribs.src;

      content.type = 'news';
      content.title = $ch('.entry-title').text();
      content.introtext = getStringBetween(html, '<meta name="description"  content="', '" />');
      content.fulltext = fulltext;
      content.created = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
      content.modified = content.created;
      content.publish_up = publishdate;
      content.images = downloadImage(imageurl, 'wol');
      content.metakey = getStringBetween(html, '<meta name="keywords"  content="', '" />');
      content.metadesc = content.introtext;
      content.alias = md5(url);
      content.source = url;
      content.xreference = 'waspadaonline';
      content.tagdata = (function () {
         var output = '';
         var tag = $ch('.post-tag a');
         var temp = [];
         for (var i = 0; i < tag.length; i++) {
            var elm = tag[i];
            var strtag = $ch(elm).text();
            temp.push(strtag.replace('#', ''));
         }
         output = temp.join(', ');
         return output;
      })();
      content.label = label;

      insertContent(content, function () {
         //console.log('### done ' + content.source);
         if (typeof callback === 'function') {
            callback();
         }
      });

   };

   //-- check alias di db, jika sudah ada gak usah request lagi.
   validateRecord(md5(url), function () {
      request(url + '?' + (new Date().getTime()), onRequesting);
   });

   //console.log('### fetching... ' + url);
}
function scrapeListingPage() {
   var onRequesting = function (error, response, _html) {
      if (error) {
         //console.log(error);
         return;
      }
      _html = cleanString(response.body);
      var html = _html.toString().replace('</html>', '') + '</html>';
      var $ = cheerio.load(html);
      var items = $('.post-listing.archive-box .item-list .post-box-title a');
//      fs.writeFile("./test.html", html, function (err) {
//         if (err) {
//            return console.log(err);
//         }
//         console.log("The file was saved!");
//      });

      var tempUrl = [];

      for (var i = 0; i < items.length; i++) {
         tempUrl.push(items[i].attribs.href);
      }

      //-- sekali 10 detik grab konten
      var delay = 5000;
      tempUrl.forEach(function (val) {
         setTimeout(function () {
            extractPage(val, 'berita');
         }, delay);
         delay += 5000;
      });

      //-- sekali lima menit ambil lagi listing  datanya
      setTimeout(scrapeListingPage, (5 * 60000));
      console.log(dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + ' getting list waspadaonline');
   };


   var listpage = [
      'http://waspada.co.id/fokus-redaksi/',
      'http://waspada.co.id/medan/'
   ];

   listpage.forEach(function (url) {
      request(url, onRequesting);
   });

}

module.exports = function () {
   scrapeListingPage();

};