/* global __filename */

var request = require('request');
var cheerio = require('cheerio');
var fs = require('node:fs');
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

const { translate } = require('google-translate-api-browser');

function init() {
    _.forEach(scrapsources.data, function (value) {
        queue.add(function () {
            return  scrapeListingPage(value.url);
        }).then(function (itemsToScrape) {
            _.forEach(itemsToScrape, function (value) {
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
    // console.log('Ekstrasi halaman ' + url);
    var thePromise = new Promise(function (resolve, reject) {

        var onRequesting = function (error, responseHTTP, _html) {
            if (error) {
                var errMsg = '*** error [extractPage] : ' + error;
                console.log(errMsg);
                reject(errMsg);
                return;
            }
            _html = cleanString(_html);
            var html = _html.toString().replace('</html>', '') + '</html>';
            var $ch = cheerio.load(html);
            var content = {};
            var WpApiPost = {};
            
            WpApiPost.title = $ch('h1.article-title').text();
            if (!WpApiPost.title){
                return;
            }
            console.log(WpApiPost);
            
            translate(WpApiPost.title, {to: "en", from:"id"})
                    .then(function(res) {
                        // I do not eat six days
                        console.log(res);
                    })
                    .catch(err => {
                        console.error(err);
                    });


            try {
                var namafile = "page-" + url.toString().replace(/[:/.\n\t\r]/g, "_") + ".html";
                fs.writeFileSync('./webpages/' + namafile, _html);
                // file written successfully
            } catch (err) {

                console.error(err);
            }





            /*    
             fn.insertContent(content, function () {
             console.log(new Date().toLocaleString() + ' *** success [insertContent] : ' + response.request.href);
             if (typeof callback === 'function') {
             callback();
             }
             });
             */

            //console.log(new Date().toLocaleString() + ' *** success [extractPage] : ' + response.request.href);
            resolve(content);

        };



        request.get(url, onRequesting);



        /*
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
         * 
         */



    });
    return thePromise;
}

function scrapeListingPage(url) {
    //console.log('mulai ekstrak daftar Page di ' + url);
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


            try {
                var namafile = "listing_page-" + url.toString().replace(/[:/.\n\t\r]/g, "_") + ".html";
                fs.writeFileSync('./webpages/' + namafile, html);
                // file written successfully
            } catch (err) {
                console.error(err);
            }

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

            var itemsToScrape = [];

            //-- berita di slideshow
            var items = $('.article-asset a');
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

                if (xurl.indexOf('/foto/') >= 0) {
                    continue;
                }

                itemsToScrape.push({
                    url: xurl,
                    label: label
                });
            }
            console.log(new Date().toLocaleString() + ' *** success [scrapeListingPage] : terdapat ' + itemsToScrape.length + " konten untuk di ekstrak pada " + response.request.href);
            resolve(itemsToScrape);
        }
        request(url, onRequesting);
    });
    return thePromise;
}

module.exports = {
    doProcess: init,
    scrapeListingPage
};
