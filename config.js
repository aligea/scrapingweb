var config = {};
config.endpointserver = "http://localhost:8080/wp-scraping/wp-insert-post.php";
//config.endpointserver = "http://aligea.icu/wp-scraping/wp-insert-post.php";
config.list_of_main_page_to_scrape = [
  {
    baseurl: "https://www.waspada.id",
    url: "https://www.waspada.id/features/",
    label: "news",
    list_href_attr: ".entry-title a",
    title_attr: "h1.entry-title",
    image_attr: ".post-thumbnail img",
    content_attr: ".entry-content-single",
  },
  {
    baseurl: "https://www.waspada.id",
    url: "https://www.waspada.id/teknologi/",
    label: "news",
    list_href_attr: ".entry-title a",
    title_attr: "h1.entry-title",
    image_attr: ".post-thumbnail img",
    content_attr: ".entry-content-single",
  },
];

config.list_of_sigle_page_to_scrape = [
  {
    url: "https://www.waspada.id/derap-nusantara/menangkal-praktik-judi-online-lewat-pemanfaatan-teknologi/",
    label: "news",
    title_attr: "h1.entry-title",
    image_attr: ".post-thumbnail img",
    content_attr: ".entry-content-single",
  },
];

/**
 * scraping 108 listing page scorpionmonitor.org
 */
for (i = 1; i <= 108; i++) {
  var obj1 = {
    baseurl: "http://www.scorpionmonitor.org",
    url: "http://scorpionmonitor.org/newslist?page=" + i,
    label: "news",
    list_href_attr: ".posting-content a",
    title_attr: "h1.entry-title",
    image_attr: ".post-thumbnail img",
    content_attr: ".entry-content-single",
  };
  config.list_of_main_page_to_scrape.push(obj1);
}

config.source_url = {
  analisadaily: [],
  liputan6: {
    data: [
      { label: "tekno", url: "http://tekno.liputan6.com/" },
      { label: "berita", url: "http://news.liputan6.com/" },
    ],
    page: [],
  },
  merdeka: {
    data: [{ label: "tekno", url: "https://www.merdeka.com/teknologi/" }],
    page: [],
  },
  tribunmedan: {
    data: [{ label: "berita", url: "http://medan.tribunnews.com/" }],
    page: [],
  },
  jalantikus: {
    data: [
      {
        url: "https://jalantikus.com/all/article/order/published/page/1/",
        label: "tekno",
      },
      { url: "https://jalantikus.com/tips/", label: "tekno" },
    ],
    page: [
      {
        url: "https://jalantikus.com/gokil/programmer-termuda-di-dunia/",
        label: "tekno",
      },
    ],
  },
};

config.mysql_info = {
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "terserahsaja",
  database: "db_grabbing",
};
console.log(config.list_of_main_page_to_scrape);
module.exports = config;
