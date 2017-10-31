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

      var amphtml = fn.getStringBetween(_html, '<link rel="amphtml" href="', '" data-component-name="amp:html:link">');

      if (amphtml && amphtml !== '') {
         callback = fn.getStringBetween(html, '<meta name="news_keywords" content="', '" />');
         return extractPage(amphtml, label, callback);
      }
      /*		
       fs.writeFile("./test.html", html, function (err) {
       if (err) {
       return console.log(err);
       }
       console.log("The file was saved!");
       }); 
       */
      
		var schemastring = fn.getStringBetween(html, '<script type="application/ld+json">', '</script>');
      var schemaobject = (function(schemastring){
			try {
				return JSON.parse(schemastring);
			} catch(e) {
				return false;
			}
		})(schemastring); 
		if(!schemaobject){
			return console.log('*** error json - ' + response.request.href);
		}

      var publishdate = (function () {
         var output = dateFormat(new Date(schemaobject.datePublished), "yyyy-mm-dd HH:MM:ss");

         return output;
      })();
      var imagedir = ('tbm/') + (publishdate.toString().substr(0, 10));
      var fulltext = (function (imagedir) {
         var tag = $ch('.article-body')[0];
         var output = $ch(tag).html();
         var adcont = (function () {
            var a = $ch('.ad-container').parent();
            var b = $ch.html(a[0]);
            return b;
         })();
         output = output.replace(new RegExp('<amp-img', 'g'), '<img');
         output = output.replace(new RegExp('></amp-img>', 'g'), ' />');
         output = output.replace(adcont, '');
         //fs.writeFile("./test.html", output);

         var $imgtag = $ch('.article-body img');
         for (var i = 0; i < $imgtag.length; i++) {
            var item = $imgtag[i];
            var imageurl = item.attribs.src;
            var newimgsrc = downloadImage(imageurl, imagedir);

            output = output.replace(imageurl, newimgsrc);
         }
         return output;
      })(imagedir);

      var imageurl = schemaobject.image.url;

      content.type = 'news';
      content.title = schemaobject.headline;
      content.introtext = schemaobject.description;
      content.fulltext = fulltext;
      content.created = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
      content.modified = content.created;
      content.publish_up = publishdate;
      content.images = downloadImage(imageurl, imagedir);
      content.metakey = callback;
      content.metadesc = content.introtext;
      content.alias = md5(url);
      content.source = url;
      content.xreference = 'tribunmedan';
      content.tagdata = (function () {
         var output = '';
         var tag = $ch('.tagcload3 a');
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
      request.get(url, onRequesting);
   });

   //console.log('### fetching... ' + url);
}

function scrapeListingPage() {
   var listpage = [
      {label: "berita", url: "http://medan.tribunnews.com/"}
              //{label : "berita", url : "http://www.tribunnews.com/"},
              //{label : "berita", url : "http://style.tribunnews.com/"}
   ];

   function onRequesting(error, response, _html) {
      if (error) {
         console.log(error);
         return;
      }
      _html = cleanString(response.body);
      var html = _html.toString().replace('</html>', '') + '</html>';
      var $ = cheerio.load(html);

//      fs.writeFile("./test.html", html, function (err) {
//         if (err) {
//            return console.log(err);
//         }
//         console.log("The file was saved!");
//      });

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
      var delay = 5000;
      var tempUrl = [];

      var itemToScrape = [];

      //-- berita di slideshow
      var items = $('#slideshow .pos_abs a');
      for (var i = 0; i < items.length; i++) {
         if (items[i].attribs.href.indexOf('/topic/') >= 0) {
            continue;
         }
         tempUrl.push(items[i].attribs.href);
      }
      //-- filter duplikasi 
      tempUrl = tempUrl.filter(function (elem, index, self) {
         return index === self.indexOf(elem);
      });
      for (var idx in tempUrl) {
         itemToScrape.push({
            url: tempUrl[idx],
            label: 'berita'
         });
      }


      //-- berita terakhir
      var items = $('#latestul .art-list.pos_rel');
      var delay = 5000;
      for (var i = 0; i < items.length; i++) {
         var elm = $(items[i]).find('.fbo2.tsa-2');
         var a = $(items[i]).find('h3 a');
         var kanal = elm.text();
         var xlabel = label;

         if (kanal === '' || !a[0]) {
            continue;
         }

         if (kanal === 'Seleb') {
            xlabel = 'seleb';
         }
         if (kanal === 'Techno') {
            xlabel = 'tekno';
         }


         itemToScrape.push({
            url: a[0].attribs.href,
            label: xlabel
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
   //extractPage('http://medan.tribunnews.com/2017/10/30/bikin-bergidik-dokter-gigi-temukan-hal-mengerikan-ini-di-mulut-pasiennya?page=all', 'berita');
};

