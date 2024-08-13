const express = require("express");
const fs = require("fs");
const request = require("request");
const http = require("http");
const cheerio = require("cheerio");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const _ = require("lodash");
const globalFunction = require("./src/global-functions.js");
const { cleanString, downloadImage } = globalFunction;
const config = require("./config.js");
const app = express();
const server = http.createServer(app);
const queue = (function () {
  let idx = 0;
  const self = {
    data: [],
    listener: [],
    add(fn) {
      idx++;
      const obj = { id: idx, processing: fn };
      self.data.push(obj);
      const res = {
        then(callback) {
          if (typeof callback === "function") {
            obj.callback = callback;
          }
        },
      };
      obj.success = function (data) {
        if (typeof obj.callback === "function") {
          obj.callback(data);
        }
        self.done(obj);
      };
      obj.error = function () {
        self.done(obj);
      };
      obj.processing().then(obj.success).catch(obj.error);
      return res;
    },
    done(obj) {
      self.data = self.data.filter((item) => item.id !== obj.id);
      if (self.data.length === 0) {
        idx = 0;
        self.listener.forEach((fn) => {
          if (typeof fn === "function") fn();
        });
      }
    },
    addListener(fn) {
      if (typeof fn === "function") self.listener.push(fn);
    },
  };
  return self;
})();
global.queue = queue;

function sendToWpEndpoint(postData) {
  const clientServerOptions = {
    uri: config.endpointserver,
    form: postData,
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  };
  request(clientServerOptions).on("error", function (err) {
    console.error("cannot connect to " + clientServerOptions.uri);
  });
}

function extractPage(pageToScrape) {
  return new Promise((resolve, reject) => {
    request.get(pageToScrape.url, (error, response, _html) => {
      if (error) {
        reject(error);
        return;
      }
      const html = cleanString(_html).replace("</html>", "") + "</html>";
      const $ch = cheerio.load(html);
      const WpApiPost = {
        post_title: $ch(pageToScrape.title_attr).text(),
        post_content: $ch(pageToScrape.content_attr).html(),
        image_url: $ch(pageToScrape.image_attr).attr("src"),
        post_category: pageToScrape.label,
      };

      if (
        WpApiPost.post_title &&
        WpApiPost.post_content &&
        WpApiPost.image_url
      ) {
        sendToWpEndpoint(WpApiPost);
        resolve(WpApiPost);
      } else {
        reject("Error extracting page content");
      }
    });
  });
}

function scrapeListingPage(pageToScrape) {
  return new Promise((resolve, reject) => {
    request(pageToScrape.url, (error, response, _html) => {
      if (error) {
        reject(error);
        return;
      }
      const html =
        cleanString(response.body).replace("</html>", "") + "</html>";
      const $ = cheerio.load(html);
      const listofHrefURL = $(pageToScrape.list_href_attr)
        .map((_, el) => $(el).attr("href"))
        .get();
      const listofSinglePageItem = _.uniq(listofHrefURL).map((href) => ({
        url: pageToScrape.baseurl + href.replace(pageToScrape.baseurl, ""),
        content_attr: pageToScrape.content_attr,
        image_attr: pageToScrape.image_attr,
        label: pageToScrape.label,
        title_attr: pageToScrape.title_attr,
      }));

      if (listofSinglePageItem.length > 0) {
        resolve(listofSinglePageItem);
      } else {
        reject("No URLs found to scrape");
      }
    });
  });
}

function onServerReady() {
  /**
   * ambil data array di config
   */
  for (i = 0; i < config.list_of_main_page_to_scrape.length; i++) {
    var mainpagetobescrape = config.list_of_main_page_to_scrape[i];
    var listener = scrapeListingPage(mainpagetobescrape).then(
      (listofSinglePageItem) => {
        listofSinglePageItem.forEach((item) =>
          queue.add(() => extractPage(item))
        );
      }
    );
    queue.addListener(listener);
  }

  for (i = 0; i < config.list_of_sigle_page_to_scrape.length; i++) {
    var objtoscrape = config.list_of_sigle_page_to_scrape[i];
    var listener2 = extractPage(objtoscrape);
    queue.addListener(listener2);
  }
}

app.get("/", function (req, res) {
 // res.send("<h1>Hello the sadness world!</h1>");
  res.send(" Server is listening on port " + server.address().port);
});

server.listen("3000", function () {
  console.info(
    new Date().toLocaleString() + " Server is listening on port %d",
    server.address().port
  );
  onServerReady();
  queue.addListener(function () {
    setTimeout(() => {
      console.info(new Date().toLocaleString() + "===== start again =====");
      onServerReady();
    }, 60000);
  });
});

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
});

module.exports = app;
