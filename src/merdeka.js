/* global __filename */

var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var md5 = require('md5');
var dateFormat = require('dateformat');

var fn = require('./global-functions.js');
var cleanString = fn.cleanString;
var validateRecord = fn.validateRecord;
var downloadImage = fn.downloadImage;
var namabulankeangka = fn.namabulankeangka;
var getStringBetween = fn.getStringBetween;
var insertContent = fn.insertContent;

function extractPage(url, label, callback) {

   var onRequesting = function (error, response, _html) {
      if (error) {
         console.log(error);
         return;
      }
      _html = cleanString(_html);
      var html = _html.toString().replace('</html>', '') + '</html>';
      var $ch = cheerio.load(html);
      var content = {};

      //fs.writeFile("./test.html", html);
      //return;

      var publishdate = (function () {
         var pubdate = fn.getStringBetween(html, '<meta name="pubdate" content="', '"/>');
         var output = dateFormat(new Date(pubdate), "yyyy-mm-dd HH:MM:ss");

         return output;
      })();
      var imagedir = ('mdk/') + (publishdate.toString().substr(0, 10));
      var fulltext = (function (imagedir) {
         var tag = $ch('.mdk-body-paragpraph')[0];
         var output = $ch(tag).html();

         var $imgtag = $ch(tag).find('img');
         for (var i = 0; i < $imgtag.length; i++) {
            var item = $imgtag[i];
            var imageurl = item.attribs.src;
            var newimgsrc = downloadImage(imageurl, imagedir);

            output = output.replace(imageurl, newimgsrc);
         }
         return output;
      })(imagedir);

      var imageurl = (function () {
         var output = '';
         var tag = $ch('.mdk-dt-img img');
         if (tag.length > 0) {
            output = tag[0].attribs.src;
         }
         return output;
      })();

      content.type = 'news';
      content.title = $ch('.mdk-dt-headline h1').text();
      content.introtext = fn.getStringBetween(html, '<meta name="description" content="', '" />');
      content.fulltext = fulltext;
      content.created = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
      content.modified = content.created;
      content.publish_up = publishdate;
      content.images = downloadImage(imageurl, imagedir);
      content.metakey = fn.getStringBetween(html, '<meta name="keywords" content="', '" />');
      content.metadesc = content.introtext;
      content.alias = md5(url);
      content.source = url;
      content.xreference = 'merdeka';
      content.tagdata = (function () {
         var output = '';
         var tag = $ch('.mdk-list-terkait li a');
         var temp = [];
         for (var i = 0; i < tag.length; i++) {
            var elm = tag[i];
            var strtag = $ch(elm).text();
            temp.push(strtag.replace('#', ''));
         }
         output = temp.join(', ');
         return output;
      })();
      content.label = (function () {
         var kanal = fn.getStringBetween(html, '<meta property="section" content="', '"/>');

         if (kanal === 'teknologi') {
            return 'tekno';
         }

         return label;
      })();

      insertContent(content, function () {
         //console.log('### done ' + content.source);
         if (typeof callback === 'function') {
            callback();
         }
      });

   };

   //-- check alias di db, jika sudah ada gak usah request lagi.
   validateRecord(md5(url), function () {
      request.get(url, onRequesting);
   });

   //console.log('### fetching... ' + url);
}

function scrapeListingPage() {
   var listpage = [
      {label: "tekno", url: "https://www.merdeka.com/teknologi/"}
   ];

   function onRequesting(error, response, _html) {
      if (error) {
         console.log(error);
         return;
      }
      _html = cleanString(response.body);
      var html = _html.toString().replace('</html>', '') + '</html>';
      var $ = cheerio.load(html);

      //fs.writeFile("./test.html", html);
      //return;

      var delay = 5000;
      var tempUrl = [];

      var itemToScrape = [];

      //-- berita di slideshow
      var items = $('.inner-content li a');
      for (var i = 0; i < items.length; i++) {
         tempUrl.push(items[i].attribs.href);
      }

      //-- filter duplikasi 
      tempUrl = tempUrl.filter(function (elem, index, self) {
         return index === self.indexOf(elem);
      });

      //-- binding-transfrom data
      for (var idx in tempUrl) {
         var xurl = tempUrl[idx];
         if (xurl.indexOf('merdeka.com') < 0) {
            xurl = 'http://www.merdeka.com' + xurl;
         }

         itemToScrape.push({
            url: xurl,
            label: 'berita'
         });
      }

      //-- sekali 10 detik grab konten
      var delay = 5000;
      itemToScrape.forEach(function (val) {
         setTimeout(function () {
            extractPage(val.url, val.label);
         }, delay);
         delay += 5000;
      });

      //-- sekali lima menit ambil lagi listing  datanya
      setTimeout(scrapeListingPage, (5 * 60000));
      console.log(new Date() + ' getting list ' + response.request.href);
   }

   listpage.forEach(function (v) {
      request(v.url, onRequesting);
   });
}

module.exports = function () {
   console.log(new Date() + ' running ' + __filename);
   scrapeListingPage();
   //extractPage('https://www.merdeka.com/dunia/arsip-pembunuhan-jfk-ungkap-cia-ingin-habisi-nyawa-soekarno.html', 'berita');
};

