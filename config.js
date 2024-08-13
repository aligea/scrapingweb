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
    url: "http://www.scorpionmonitor.org/newslist?page=" + i,
    label: "news",
    list_href_attr: ".posting-content a",
    title_attr: "div.page-header",
    image_attr: "img.img-responsive.img-thumbnail",
    content_attr: "div#content-news",
  };
  config.list_of_main_page_to_scrape.push(obj1);
}


const shuffle = (array) => { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
};

var list_of_main_page_to_scrape = config.list_of_main_page_to_scrape;
const shuffledArray = shuffle(list_of_main_page_to_scrape); 
config.list_of_main_page_to_scrape = shuffledArray;

module.exports = config;
