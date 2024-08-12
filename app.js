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
//var PQueue = require('p-queue');
//var queue = new PQueue({concurrency: 1});
var queue = (function () {
   var self = {};
   var idx = 0;
   var timer;

   self.data = [];
   self.listener = [];
   self.add = function (fn) {
      idx++;
      var obj = {id: idx, processing: fn};
      self.data.push(obj);
      var res = {
         then: function (what) {
            //console.log(what);
            if (typeof what === 'function') {
               //obj.listener.push(what);
            }
            //console.log(what);
            obj.callback = what;
            //return what;
         }
      };
      //obj.listener = [];
      obj.callback = null;
      obj.success = function (data) {
         if (typeof obj.callback === 'function') {
            //obj.callback(what);
            //console.log(obj.callback);
            //console.log(obj.callback);
            obj.callback(data);

         }
         // console.log(obj.callback);
         //console.log(obj.listener);
         //console.log(typeof what);

         self.done(obj);
      };
      obj.error = function () {
         self.done(obj);
         console.log('do-error pid: ' + obj.id);
         //self.done(obj);
      };

      obj.processing().then(obj.success).catch(obj.error);

      if (self.data.length === 1) {
         //run();
      }
      return res;
      //console.log(fn);
   };
   self.delete = function () {};
   self.done = function (obj) {
      for (var i = 0; i < self.data.length; i++) {
         if (self.data[i].id === obj.id) {
            self.data.splice(i, 1);
            break;
         }
      }

      if (self.data.length === 0) {
         idx = 0;
         console.info('empty queue');
         self.listener.map(function (fn) {
            if (typeof fn === 'function') {
               fn();
            }
         });
      }
      timer = setTimeout(function () {
         if (self.data.length === 0) {
            return;
         }
         self.done(self.data[0]);
      }, 60000);
      //console.info(self.data.length);
      //console.log('process pending ' + self.data.length);
   };
   self.addListener = function (fn) {
      if (typeof fn === 'function') {
         self.listener.push(fn);
      }
   };

   function run() {
      if (self.data.length > 0) {
         var obj = self.data[0];
         console.info('=== processing-id: ' + obj.id);
         var res = obj.processing();

         res.then(function (data) {
            console.info('=== sukses-id: ' + obj.id);
            obj.success(data);
            setImmediate(run);
         });
         res.catch(function (e) {
            console.info('=== gagal-id: ' + obj.id);
            obj.error(e);
            setImmediate(run);
         });
      } else {
         setImmediate(run);
      }
   }

   self.run = run;
   return self;
})();
global.queue = queue;

function onServerReady() {
   /*
    _.forEach(config.source_url, function (value, key) {
      let srcfile = './src/' + key;
      if (!value.data) {
         return;
      }
      //console.log('--initialize ' + srcfile);
      var mod = require(srcfile);

      mod.doProcess();
      //console.log(mod);
   });
    */
   var targetWebsite = require('./src/jalantikus.js');
   targetWebsite.doProcess();
   //console.log(config.source_url.merdeka);
}

server.listen('8080', function () {
   console.info(new Date().toLocaleString() + ' Server is listening on port %d', server.address().port);
   onServerReady();
   queue.addListener(function () {
      setTimeout(function () {
         console.info(new Date().toLocaleString() +  '===== start again =====');
         onServerReady();
      }, 1 * (60000));
   });
   //console.log = function(){};
});
process.on('unhandledRejection', (reason, p) => {
   console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
   // application specific logging, throwing an error, or other logic here
});
module.exports = app;