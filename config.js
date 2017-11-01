var config = {};

config.source_url = {
   analisadaily: [],
   liputan6: {
      data: [
         {label: "tekno", url: "http://tekno.liputan6.com/"},
         {label: "berita", url: "http://news.liputan6.com/"}
      ],
      page: []
   },
   merdeka: {
      data: [{label: "tekno", url: "https://www.merdeka.com/teknologi/"}],
      page: []
   },
   tribunmedan: {
      data:[
         {label: "berita", url: "http://medan.tribunnews.com/"}
      ],
      page:[]
   },
   jalantikus: {
      data: [
         {url: "https://jalantikus.com/all/article/order/published/page/1/", label: 'tekno'},
         {url: "https://jalantikus.com/tips/", label: 'tekno'}
      ],
      page: [
         {url: 'https://jalantikus.com/gokil/programmer-termuda-di-dunia/', label: 'tekno'}
      ]
   }
};

config.mysql_info = {
   connectionLimit: 10,
   host: 'localhost',
   user: 'root',
   password: 'terserahsaja',
   database: 'db_grabbing'
};


module.exports = config;