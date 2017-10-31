(function (global) {
   var express = require('express');
   //var fs = require('fs');
   //var request = require('request');
   //var cheerio = require('cheerio');
   var http = require('http');

   var app = express();
   var server = http.createServer(app);

   const low = require('lowdb');
   const FileSync = require('lowdb/adapters/FileSync');

   var analisadaily = require('./src/analisadaily.js');
   //var waspadaonline = require('./src/waspadaonline.js');
   var tribunmedan = require('./src/tribunmedan.js');
   var merdeka = require('./src/merdeka.js');
   var liputan6 = require('./src/liputan6.js');

   function onServerReady() {
      console.log(new Date() + ' Server is listening on port %d', server.address().port);
      merdeka();
      analisadaily();
      tribunmedan();
      liputan6();
   }

   server.listen('8081', onServerReady);

   module.exports = app;
})(this);
