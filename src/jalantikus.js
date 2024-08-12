/* global __filename */

var request = require("request");
var cheerio = require("cheerio");
var fs = require("node:fs");
var md5 = require("md5");
var dateFormat = require("dateformat");

var fn = require("./global-functions.js");
var cleanString = fn.cleanString;
var downloadImage = fn.downloadImage;

var _ = require("lodash");
var fn = require("./global-functions.js");
var config = fn.config;
var queue = global.queue;

var scrapsources = config.source_url.jalantikus;
var listpage = scrapsources.data;

const { translate } = require("google-translate-api-browser");
const translate2 = require("translate-google");

var title_attr = "";
var content_attr = "";

function send_content(contentobj) {
  // Import the http module
  const http = require("http");

  // Create an options object
  const options = {
    hostname: "jsonplaceholder.typicode.com",
    port: 80,
    path: "/posts",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Node.js",
    },
  };

  // Create a data object
  const data = {
    title: "Hello, world!",
    body: "This is a test post",
    userId: 1,
  };

  // Stringify the data object
  const dataString = JSON.stringify(data);

  // Update the options object with the data length
  options.headers["Content-Length"] = dataString.length;

  // Create a request object
  const request = http.request(options, (response) => {
    // Initialize a variable to store the response data
    let data = "";

    // Listen to the data event
    response.on("data", (chunk) => {
      // Append the chunk to the data variable
      data += chunk.toString();
    });

    // Listen to the end event
    response.on("end", () => {
      // Log the status code and the headers
      console.log(`Status code: ${response.statusCode}`);
      console.log(`Headers: ${JSON.stringify(response.headers)}`);

      // Parse the data as JSON
      const post = JSON.parse(data);

      // Log the post information
      console.log(`Post ID: ${post.id}`);
      console.log(`Post Title: ${post.title}`);
      console.log(`Post Body: ${post.body}`);
      console.log(`Post User ID: ${post.userId}`);
    });

    // Listen to the error event
    response.on("error", (error) => {
      // Throw the error
      throw error;
    });
  });

  // Write the data to the request object
  request.write(dataString);

  // End the request object
  request.end();
}

function init() {
  // test scraping page
  return extractPage(
    "https://jalantikus.com/tips/aplikasi-tv-streaming-android/",
    "blog",
    function (a, b, c) {
      console.log(a, b, c);
    }
  );

  _.forEach(scrapsources.data, function (value) {
    queue
      .add(function () {
        return scrapeListingPage(value.url);
      })
      .then(function (itemsToScrape) {
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
  console.log("Ekstrasi halaman " + url);
  var thePromise = new Promise(function (resolve, reject) {
    var onRequesting = function (error, responseHTTP, _html) {
      if (error) {
        var errMsg = "*** error [extractPage] : " + error;
        console.log(errMsg);
        reject(errMsg);
        return;
      }
      _html = cleanString(_html);
      var html = _html.toString().replace("</html>", "") + "</html>";
      var $ch = cheerio.load(html);
      var content = {};
      var WpApiPost = {};

      WpApiPost.title = $ch("h1.article-top-info__title").text();
      WpApiPost.content = $ch(".article-main-content__inner").html();
      WpApiPost.image_url =  $ch(".article-main-content__banner img").attr('src');
      

      console.log(WpApiPost);
      //WpApiPost.content = WpApiPost.content.toString();

      if (!WpApiPost.title || !WpApiPost.content) {
        return console.log("content not identified");
      }

      //content = encodeURI(WpApiPost.content);
      console.log(WpApiPost);

      
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
        console.log(
          new Date().toLocaleString() +
            " *** error [scrapeListingPage] : " +
            error
        );
        reject(error);
        return;
      }
      _html = cleanString(response.body);
      var html = _html.toString().replace("</html>", "") + "</html>";
      var $ = cheerio.load(html);

      try {
        var namafile =
          "listing_page-" +
          url.toString().replace(/[:/.\n\t\r]/g, "_") +
          ".html";
        fs.writeFileSync("./webpages/" + namafile, html);
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
        return "berita";
      })();
      var tempUrl = [];

      var itemsToScrape = [];

      //-- berita di slideshow
      var items = $(".article-asset a");
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
        if (xurl.indexOf("merdeka.com") < 0) {
          xurl = "http://www.merdeka.com" + xurl;
        }

        if (xurl.indexOf("/foto/") >= 0) {
          continue;
        }

        itemsToScrape.push({
          url: xurl,
          label: label,
        });
      }
      console.log(
        new Date().toLocaleString() +
          " *** success [scrapeListingPage] : terdapat " +
          itemsToScrape.length +
          " konten untuk di ekstrak pada " +
          response.request.href
      );
      resolve(itemsToScrape);
    }
    request(url, onRequesting);
  });
  return thePromise;
}

module.exports = {
  doProcess: init,
  scrapeListingPage,
};
