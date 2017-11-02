/* global __filename */

var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var md5 = require('md5');
var dateFormat = require('dateformat');

var fn = require('./global-functions.js');
var cleanString = fn.cleanString;
var downloadImage = fn.downloadImage;

var _ = require('lodash');
var fn = require('./global-functions.js');
var config = fn.config;
var queue = global.queue;

var scrapsources = config.source_url.merdeka;
var listpage = scrapsources.data;

function init() {
   _.forEach(scrapsources.data, function (value) {
      queue.add(function () {
         return  scrapeListingPage(value.url);
      }).then(function (itemToScrape) {
         _.forEach(itemToScrape, function (value) {
            queue.add(function () {
               return extractPage(value.url, value.label);
            });
         });
      });
   });

   _.forEach(scrapsources.page, function (value) {
      queue.add(function () {
         return extractPage(value.url, value.label);
      });
   });

}
function extractPage(url, label, callback) {
   var thePromise = new Promise(function (resolve, reject) {
      var onRequesting = function (error, response, _html) {
         if (error) {
            var errMsg = '*** error [extractPage] : ' +error;
            console.log(errMsg);
            reject(errMsg);
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

         fn.insertContent(content, function () {
            console.log(new Date().toLocaleString() + ' *** success [insertContent] : ' + response.request.href);
            if (typeof callback === 'function') {
               callback();
            }
         });
         console.log(new Date().toLocaleString() + ' *** success [extractPage] : ' + response.request.href);
         resolve(content);

      };
      
      fn.checkRecord(md5(url)).then(function (res) {
         //console.log('im here', res);
         if (res) {
            request.get(url, onRequesting);
         } else {
            resolve('duplicate entry');
         }
      }).catch(function () {
         reject('error validation');
      });
   });
   return thePromise;
}

function scrapeListingPage(url) {
   var thePromise = new Promise(function (resolve, reject) {
      function onRequesting(error, response, _html) {
         if (error) {
            //var errMessage = 'Failed to load ' + response.request.href;
            console.log(new Date().toLocaleString() + ' *** error [scrapeListingPage] : ' + error);
            reject(error);
            return;
         }
         _html = cleanString(response.body);
         var html = _html.toString().replace('</html>', '') + '</html>';
         var $ = cheerio.load(html);

         //fs.writeFile("./test.html", html);
         //return;

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
            
            if(xurl.indexOf('/foto/') >= 0){
               continue;
            }

            itemToScrape.push({
               url: xurl,
               label: label
            });
         }
         console.log(new Date().toLocaleString() + ' *** success [scrapeListingPage] : ' + response.request.href);
         resolve(itemToScrape);
      }
      request(url, onRequesting);
   });
   return thePromise;
}

module.exports = {doProcess: init, scrapeListingPage};
