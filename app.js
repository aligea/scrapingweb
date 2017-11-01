var express = require('express');
//var fs = require('fs');
//var request = require('request');
//var cheerio = require('cheerio');
var http = require('http');

var app = express();
var server = http.createServer(app);

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

var config = require('./config.js');
var _ = require('lodash');
var PQueue = require('p-queue');
var queue = new PQueue({concurrency: 1});

global.queue = queue;

function onServerReady() {
   _.forEach(config.source_url, function (value, key) {
      let srcfile = './src/' + key;
      if (!value.data) {
         return;
      }
      //console.log('--initialize ' + srcfile);
      var mod = require(srcfile);

      queue.add(function () {
         return new Promise(function (resolve, reject) {
            try {
               mod.doProcess();
               resolve('--initialize ' + srcfile);
            } catch (e) {
               reject(e);
            }
         });
      });
      queue.onIdle().then(function () {
         setTimeout(onServerReady, 60000);
      });
   });
}

server.listen('8080', function () {
   console.log(new Date().toLocaleString() + ' Server is listening on port %d', server.address().port);
   onServerReady();
});
process.on('unhandledRejection', (reason, p) => {
   console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
   // application specific logging, throwing an error, or other logic here
});
module.exports = app;