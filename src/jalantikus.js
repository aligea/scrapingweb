/* global __filename */

var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var md5 = require('md5');
var dateFormat = require('dateformat');
var _ = require('lodash');
var fn = require('./global-functions.js');
var config = fn.config;
var queue = global.queue;

var scrapsources = config.source_url.jalantikus;
var listpage = config.source_url.jalantikus.data;
//var async = require('async')
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
            var errMsg = '*** error [extractPage] : ' + error;
            console.log(errMsg);
            reject(errMsg);
            return;
         }
         _html = fn.cleanString(_html);
         var html = _html.toString().replace('</html>', '') + '</html>';
         var $ch = cheerio.load(html);
         var content = {};

         //fs.writeFile("./test.html", html);
         //return;

         var publishdate = (function () {
            var tag = $ch('.property').find('.timestamp');
            var randomHourMinute = new Date().getHours() + ':' + _.random(10, 59);
            var pubdate = $ch(tag[0]).text();

            try {
               var output = dateFormat(new Date(pubdate), "yyyy-mm-dd");
               output = output + ' ' + randomHourMinute + ':00';
               return output;
            } catch (e) {
               return dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            }

         })();
         var imagedir = ('jlt/') + (publishdate.toString().substr(0, 10));
         var fulltext = (function (imagedir) {
            var tag = $ch('.entry-content');
            tag.contents().filter(function () {
               return this.type === 'comment';
            }).remove();
            tag.find('.partner-banner-aftc-artikel-menarik').remove();
            tag.find('.bacajuga').remove();
            tag.find('.artikelmenarik').remove();
            tag.find('script').remove();
            tag.find('style').remove();
            tag.find('.appsinner').remove();
            tag.find('.emoji-container').remove();
            tag.find('.partner-banner-aftc-wrapper').remove();
            tag.find('.partner-banner-aftc-baca-juga').remove();
            tag.find('.anchor-read').remove();
            tag.find('.partner-inline-article-desktop').remove();
            tag.find('.partner-inline-article-mobile').remove();

            var output = $ch(tag).html();

            var $imgtag = $ch(tag).find('img');
            for (var i = 0; i < $imgtag.length; i++) {
               var item = $imgtag[i];
               var imageurl = item.attribs.src;
               var newimgsrc = fn.downloadImage(imageurl, imagedir);

               output = output.replace(imageurl, newimgsrc);
            }
            return output;
         })(imagedir);
         var imageurl = (function () {
            var output = '';
            var tag = $ch('.content-primary .cover-image-container img');
            if (tag.length > 0) {
               output = tag[0].attribs.src;
            }
            return output;
         })();

         content.type = 'news';
         content.title = $ch('.info h1').text();
         content.introtext = fn.getStringBetween(html, '<meta name="description" content="', '">');
         content.fulltext = fulltext;
         content.created = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
         content.modified = content.created;
         content.publish_up = publishdate;
         content.images = fn.downloadImage(imageurl, imagedir);
         content.metakey = fn.getStringBetween(html, '<meta name="keywords" content="', '">');
         content.metadesc = content.introtext;
         content.alias = md5(url);
         content.source = url;
         content.xreference = 'jalantikus';
         content.tagdata = (function () {
            var output = '';
            var tag = $ch('.property category a');
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
         content.urls = imageurl;

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
         _html = fn.cleanString(response.body);
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

         //-- berita di listing search, cth : https://jalantikus.com/search/keyword/programmer
         var items = $('.content-description .article-detail.stretch a.click-target');
         for (var i = 0; i < items.length; i++) {
            tempUrl.push(items[i].attribs.href);
         }

         //-- berita di listing search, cth : https://jalantikus.com/news/
         var items = $('.content-list .article-detail a.click-target');
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

