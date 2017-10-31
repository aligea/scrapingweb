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
   //var url = 'http://news.analisadaily.com/read/pabrik-roti-terbakar-kerugian-mencapai-miliaran-rupiah/440636/2017/10/27';
   var onRequesting = function (error, response, _html) {
      if (error) {
         console.log(error);
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
         //-- 2017-10-25 23:00:00
         var output = "$tahun-$bulanke-$tanggal $jam:$menit:00";
         var fulldate = $ch("#data .dateNews").text();
         var q1 = fulldate.split(',');
         var q2 = q1[1].toString().split(' ');
         var q3 = (fulldate.toString().replace(/\s/g, '')).split('|');
         var q4 = q3[q3.length - 1].split(':');
         var namabulan = q2[2];
         output = output.replace('$jam', q4[0]);
         output = output.replace('$menit', q4[1]);
         output = output.replace('$tanggal', q2[1]);
         output = output.replace('$bulanke', namabulankeangka(namabulan));
         output = output.replace('$tahun', q2[3]);
			
			//-- ada bug, preventing
			return output.substr(0, 16);
      })();
      var imagedir = ('ad/') + (publishdate.toString().substr(0, 10));
		var fulltext = (function (imagedir) {

         var output = $ch.html($ch('#data'));
         output = cleanString(output);
         output = output.replace($ch.html($ch("#data h3")[0]), '');
         output = output.replace($ch.html($ch("#data h4")[0]), '');
         output = output.replace(cleanString($ch.html($ch("#data .share-container")[0])), '');
         output = output.replace(cleanString($ch.html($ch("#data .chatImage")[0])), '');
         output = output.replace(cleanString($ch.html($ch("#data .dateNews")[0])), '');
         output = output.replace(cleanString($ch.html($ch("#data #lifeSocial")[0])), '');
         output = output.replace(cleanString($ch.html($ch("#data .readNewsTag")[0])), '');
         output = output.replace(cleanString($ch.html($ch("#data .ininsial")[0])), '');
         output = output.replace(cleanString($ch.html($ch("#data .bacaJuga")[0])), '');
         output = output.replace(cleanString($ch.html($ch("#data .xs-mobile")[0])), '');

         var $imgtag = $ch('#data .chatNews img');
         for (var i = 0; i < $imgtag.length; i++) {
            var item = $imgtag[i];
            var imageurl = item.attribs.src;
            var newimgsrc = downloadImage(imageurl, imagedir);

            output = output.replace(imageurl, newimgsrc);
         }
         return $ch(output).html();
      })(imagedir);
      		
      if(!$ch('.mainImage img')[0].attribs || !$ch('.mainImage img')[0].attribs.src){
         return;
      }
      var imageurl = $ch('.mainImage img')[0].attribs.src;
		
      content.type = 'news';
      content.title = $ch('#data h3').text();
      content.introtext = getStringBetween(html, '<meta name="description" content="', '" />');
      content.fulltext = fulltext;
      content.created = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
      content.modified = content.created;
      content.publish_up = publishdate;
      content.images = downloadImage(imageurl, imagedir);
      content.metakey = getStringBetween(html, '<meta name="keywords" content="', '" />');
      content.metadesc = content.introtext;
      content.alias = md5(url);
      content.source = url;
      content.xreference = 'analisadaily';
      content.tagdata = (function () {
         var output = '';
         var tag = $ch('.readNewsTag a.tagged');
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
	validateRecord(md5(url), function(){
		request(url + '?' + (new Date().getTime()), onRequesting);
	});
	
   //console.log('### fetching... ' + url);
}

function scrapeListingPage() {
	var listpage = [
		{label : "berita", url : "http://news.analisadaily.com/"},
		//{label : "seleb", url : "http://entertainment.analisadaily.com/selebritis"},
		{label : "tekno", url : "http://tekno.analisadaily.com/"}
	];
	
  function onRequesting(error, response, _html) {
      if (error) {
         console.log(error);
         return;
      }
      _html = cleanString(response.body);
      var html = _html.toString().replace('</html>', '') + '</html>';
      var $ = cheerio.load(html);
      var items = $('.listviewCatg a');
//      fs.writeFile("./test.html", html, function (err) {
//         if (err) {
//            return console.log(err);
//         }
//         console.log("The file was saved!");
//      });
		
		var label = (function(){
			for(var i = 0; i < listpage.length; i++){
				var val = listpage[i];
				var vurl = val.url;
				if( vurl.indexOf(response.request.href) >= 0){
					return val.label;
				}
			}
			return 'berita';
		})();
      var tempUrl = [];

      //-- ambil headline
      tempUrl.push($('#headCatg a')[0].attribs.href);
      for (var i = 0; i < items.length; i++) {
         tempUrl.push(items[i].attribs.href);
      }

      //-- sekali 10 detik grab konten
      var delay = 5000;
      tempUrl.forEach(function (val) {
         setTimeout(function () {
            extractPage(val, label);
         }, delay);
         delay += 5000;
      });

      //-- sekali lima menit ambil lagi listing  datanya
      setTimeout(scrapeListingPage, (5 * 60000));
      console.log(new Date() + ' getting list ' + response.request.href);
   }
	
	listpage.forEach(function(v){
		request(v.url, onRequesting);
	});
}



module.exports = function(){
	console.log(new Date() + ' running ' + __filename);
	scrapeListingPage();
	
};

