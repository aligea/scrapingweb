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
         var output = $ch('.read-page--header--author__datetime-wrapper time.read-page--header--author__datetime')[0].attribs.datetime;

         return output;
      })();
      var imagedir = ('lp6/') + (publishdate.toString().substr(0, 10));
      var fulltext = (function (imagedir) {
         var tag = $ch('.article-content-body__item-content');
         var output = $ch(tag).html();

         //-- hapus baca juga
         var bacajuga = $ch(tag).find('.baca-juga');
         if (bacajuga.length > 0) {
            output = output.replace(bacajuga, '');
         }

         //-- hapus iframe
         var iframe = $ch(tag).find('iframe.vidio-embed');
         if (iframe.length > 0) {
            output = output.replace(iframe, '');
         }

         //-- hapus saksikan juga
         var prg = $ch(tag).find('p');
         for (var i = 0; i < prg.length; i++) {
            var elm = $ch(prg[i]);
            var etx = elm.text();
            if (etx.indexOf('Saksikan juga video') >= 0 || etx === '&#xA0;') {
               //var innertext = $ch.html(elm);
               output = output.replace(elm, '');
               output = output.replace('<p></p>', '');
            }
            output = output.replace('<p>&#xA0;</p>', '');
         }

         //-- tambahkan halaman selanjutnya
         for (var i = 1; i < tag.length; i++) {
            output += $ch(tag[i]).html();
         }

         fs.writeFile("./test.html", output);

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
         var output = fn.getStringBetween(html, '<meta property="og:image" content="', '">');
         return output;
      })();

      content.type = 'news';
      content.title = fn.getStringBetween(html, '<meta property="og:title" content="', '">');
      content.introtext = fn.getStringBetween(html, '<meta name="description" content="', '">');
      content.fulltext = fulltext;
      content.created = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
      content.modified = content.created;
      content.publish_up = publishdate;
      content.images = downloadImage(imageurl, imagedir);
      content.metakey = fn.getStringBetween(html, '<meta name="news_keywords" content="', '">');
      content.metadesc = content.introtext;
      content.alias = md5(url);
      content.source = url;
      content.xreference = 'liputan6';
      content.tagdata = (function () {
         var output = '';
         var tag = $ch('li.tags--snippet__item a');
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
      {label: "lifestyle", url: "http://health.liputan6.com/kategori/seks"},
      {label: "tekno", url: "http://tekno.liputan6.com/"},
      {label: "berita", url: "http://news.liputan6.com/"}
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
      var label = (function () {
         for (var i = 0; i < listpage.length; i++) {
            var val = listpage[i];
            var vurl = val.url;
            if (vurl.indexOf(response.request.href) >= 0) {
               return val.label;
            }
         }
         return 'berita';
      })();

      //-- berita di slideshow
      var items = $('#latest-news-headline a');
      for (var i = 0; i < items.length; i++) {
         tempUrl.push(items[i].attribs.href);
      }

      //-- latest news
      var items = $('a.articles--iridescent-list--text-item__title-link');
      for (var i = 0; i < items.length; i++) {
         tempUrl.push(items[i].attribs.href);
      }

      //-- filter duplikasi 
      tempUrl = tempUrl.filter(function (elem, index, self) {
         return index === self.indexOf(elem);
      });

      //-- binding-transfrom data
      for (var idx in tempUrl) {
         itemToScrape.push({
            url: tempUrl[idx],
            label: label
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
   //extractPage('http://health.liputan6.com/read/3144609/4-trik-jaga-gairah-seks-wanita-tetap-membara', 'lifestyle');
};

