SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `tb_content` (
  `id` int(10) UNSIGNED NOT NULL,
  `asset_id` int(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'FK to the #__assets table.',
  `type` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT '',
  `alias` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '',
  `introtext` mediumtext NOT NULL,
  `fulltext` mediumtext NOT NULL,
  `state` tinyint(3) NOT NULL DEFAULT '1',
  `catid` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `created` datetime DEFAULT NULL,
  `created_by` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `created_by_alias` varchar(255) NOT NULL DEFAULT '',
  `modified` datetime DEFAULT NULL,
  `modified_by` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `checked_out` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `checked_out_time` datetime DEFAULT NULL,
  `publish_up` datetime DEFAULT NULL,
  `publish_down` datetime DEFAULT NULL,
  `images` text NOT NULL,
  `urls` text,
  `attribs` varchar(5120) DEFAULT NULL,
  `version` int(10) UNSIGNED NOT NULL DEFAULT '1',
  `ordering` int(11) NOT NULL DEFAULT '0',
  `metakey` text NOT NULL,
  `metadesc` text NOT NULL,
  `access` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `hits` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `metadata` text,
  `featured` tinyint(3) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Set if article is featured.',
  `language` char(7) DEFAULT NULL COMMENT 'The language code for the article.',
  `xreference` varchar(50) DEFAULT NULL COMMENT 'A reference to enable linkages to external data sets.',
  `label` mediumtext,
  `tagdata` mediumtext,
  `source` mediumtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `tb_content` (`id`, `asset_id`, `type`, `title`, `alias`, `introtext`, `fulltext`, `state`, `catid`, `created`, `created_by`, `created_by_alias`, `modified`, `modified_by`, `checked_out`, `checked_out_time`, `publish_up`, `publish_down`, `images`, `urls`, `attribs`, `version`, `ordering`, `metakey`, `metadesc`, `access`, `hits`, `metadata`, `featured`, `language`, `xreference`, `label`, `tagdata`, `source`) VALUES
(2308, 0, 'news', 'Resmi Menikah, Tagar SongSongCoupleWedding Mendunia di Twitter', '787857000353f092da001c5a989e8f51', 'Song Joong Ki dan Song Hye Kyo resmi menikah hari ini, 31 Oktober 2017. Tagar SongSongCoupleWedding menjadi trending topic dunia.', '<p><b>Liputan6.com, Jakarta -</b> Hari ini, Selasa (31/10/2017), Song Joong Ki dan Song Hye Kyo resmi mengikrarkan janji suci mereka pada pukul 04.00 sore waktu setempat. Pernikahan keduanya telah dinanti-nantikan banyak orang sejak&#xA0;Juli lalu.</p><p></p><p></p><p>Tak heran, postingan #SongSongCoupleWedding menggaung ramai di linimasa Twitter. Bahkan tagar tersebut menjadi <em>trending topic</em> dunia hingga berita ini diturunkan.</p><p>Berdasarkan pantauan <strong>Tekno Liputan6.com</strong>, sebanyak lebih dari 127 ribu cuitan dibagikan. Tak sedikit yang menyampaikan ucapan selamat dan harapannya dengan pasangan yang bertemu di drama&#xA0;<em>Descendants of The Sun</em> ini.&#xA0;</p><p>Meski digelar secara tertutup, sejumlah media menerbangkan&#xA0;<em>drone</em> untuk bisa menyaksikan suasana di dalam&#xA0;lokasi pernikahan. Alhasil, banyak foto dan video keduanya tengah bersiap-siap, dibagikan di media sosial.</p><blockquote class="twitter-tweet" data-lang="en"><p dir="ltr" lang="en">Based on their personality, kyo must be teasing joongki rn. &#x1F602;&#x3131;&#x3147;&#x3147; <a href="https://twitter.com/hashtag/SongSongCouplewedding?src=hash&amp;ref_src=twsrc%5Etfw">#SongSongCouplewedding</a> <a href="https://t.co/TDwH21KIHb">pic.twitter.com/TDwH21KIHb</a></p>&#x2014; Nurul Hanifah (@nmh2205) <a href="https://twitter.com/nmh2205/status/925242348837023744?ref_src=twsrc%5Etfw">October 31, 2017</a></blockquote><p><script src="https://platform.twitter.com/widgets.js"></script></p><blockquote class="twitter-video" data-lang="en"><p dir="ltr" lang="en">I CANT BELIEVE THEY&apos;RE FINALLY GETTING MARRIED. IM SO HAPPY FOR BOTH OF THEM &#x1F62D;&#x1F495; <a href="https://twitter.com/hashtag/SongSongcouplewedding?src=hash&amp;ref_src=twsrc%5Etfw">#SongSongcouplewedding</a> <a href="https://t.co/vwGYyqrJip">pic.twitter.com/vwGYyqrJip</a></p>&#x2014; &#x200E;&#x9E7F;&#x6657; (@windlessdeer) <a href="https://twitter.com/windlessdeer/status/925241961769865216?ref_src=twsrc%5Etfw">October 31, 2017</a></blockquote><p><script src="https://platform.twitter.com/widgets.js"></script></p><blockquote class="twitter-tweet" data-lang="en"><p dir="ltr" lang="en">The excitement of this day is really palpable! I&#x2019;m half around the world, yet I can feel it, I can almost taste it!<a href="https://twitter.com/hashtag/SongsongCoupleWedding?src=hash&amp;ref_src=twsrc%5Etfw">#SongsongCoupleWedding</a> <a href="https://t.co/rLmT6aThwE">pic.twitter.com/rLmT6aThwE</a></p>&#x2014; MabzyMabz &#x1F48B; (@SongSongSyrup) <a href="https://twitter.com/SongSongSyrup/status/925205573829910528?ref_src=twsrc%5Etfw">October 31, 2017</a></blockquote><p><script src="https://platform.twitter.com/widgets.js"></script></p><blockquote class="twitter-tweet" data-lang="en"><p dir="ltr" lang="en">This is it! &#x2764; Best wishes Captain Big Boss and Beauty &#x2764; <a href="https://twitter.com/hashtag/SongSongCouplewedding?src=hash&amp;ref_src=twsrc%5Etfw">#SongSongCouplewedding</a></p>&#x2014; imlongyyyangge (@angelica_longos) <a href="https://twitter.com/angelica_longos/status/925249592228057089?ref_src=twsrc%5Etfw">October 31, 2017</a></blockquote><p><script src="https://platform.twitter.com/widgets.js"></script></p><blockquote class="twitter-tweet" data-lang="en"><p dir="ltr" lang="en">wedding of the century! &#x2764;&#xFE0F; <a href="https://twitter.com/hashtag/SongSongCouplewedding?src=hash&amp;ref_src=twsrc%5Etfw">#SongSongCouplewedding</a></p>&#x2014; &#x2113; (@fanguuums) <a href="https://twitter.com/fanguuums/status/925254097745223680?ref_src=twsrc%5Etfw">October 31, 2017</a></blockquote><blockquote class="twitter-tweet" data-lang="en"><blockquote class="twitter-tweet" data-lang="en"><p dir="ltr" lang="en">Such a blessing&#x1F607;Finally found your true love&#x1F60D;Best wishes!&#x1F495;<a href="https://twitter.com/hashtag/SongSongCouplewedding?src=hash&amp;ref_src=twsrc%5Etfw">#SongSongCouplewedding</a></p>&#x2014; Jazmien Joy Sampiano (@Jassumien) <a href="https://twitter.com/Jassumien/status/925253679581556736?ref_src=twsrc%5Etfw">October 31, 2017</a></blockquote><script src="https://platform.twitter.com/widgets.js"></script></blockquote><p><script src="https://platform.twitter.com/widgets.js"></script></p><p>Sebagaimana diketahui, popularitas drama <em>Descendants of The Sun</em>&#xA0;pada 2016 sukses melambungkan nama SongSong Couple di jagat hiburan, tak hanya di Korea tetapi hingga seluruh dunia.&#xA0;</p><p>Publik sempat mencurigai keduanya memiliki hubungan khusus usai drama berakhir. Setelah sempat diisukan berlibur bersama,&#xA0;SongSong Couple akhirnya mengumumkan hubungan dan rencana pernikahannya secara resmi pada Juli lalu.</p><p>Selamat menempuh hidup baru, SongSong Couple!</p><p>(Cas/Isk)</p><p><strong>Saksikan Video Pilihan Berikut Ini:</strong></p><p></p><div></div><p></p>', 1, 0, '2017-10-31 19:13:50', 0, '', '2017-10-31 19:13:50', 0, 0, NULL, '2017-10-31 14:30:17', NULL, '@prefix/lp6/2017-10-31/1f45572fad8c5913d6f2b16112a23847.jpg', NULL, NULL, 1, 0, 'SongSongCouple', 'Song Joong Ki dan Song Hye Kyo resmi menikah hari ini, 31 Oktober 2017. Tagar SongSongCoupleWedding menjadi trending topic dunia.', 0, 0, NULL, 0, NULL, 'liputan6', 'tekno', 'SongSongCouple', 'http://tekno.liputan6.com/read/3146538/resmi-menikah-tagar-songsongcouplewedding-mendunia-di-twitter'),
(2309, 0, 'news', 'Dibantai Timnas Indonesia 5-0, Pelatih Timnas Brunei Belum Mau Menyerah', '8fc87c03d56519dd1fa23bf678c96189', 'Usai kekalahan tersebut, pelatih Brunei Darussalam, Takao Fujiwara mengungkapkan Indonesia merupakan tim yang sulit di kalahkan.', '<p><strong>TRIBUN-MEDAN.com</strong>-Timnas U-19 Indonesia sukses mengalahkan Timnas Brunei Darussalam di kualifikasi Piala Asia U-19 2018, Selasa (31/10/2017).</p><p>Garuda Nusantara menumbangkan Brunei dengan skor telak 5-0 di Paju Public Stadium, Korea Selatan.</p><p>Usai kekalahan tersebut, pelatih Brunei Darussalam, Takao Fujiwara mengungkapkan Indonesia merupakan tim yang sulit di kalahkan.</p><div>Dirinya bahkan sudah memprediksi pertandingan melawan Indonesia akan menjadi tantangan berat.</div><p><img layout="responsive" src="https://assets-a1.bolasport.com/assets/new_uploaded/images/medium_390d86e2b8c2ffeb2dfade3679f41816.jpg" width="780" height="390">Aksi pemain tim nasional U-19 Indonesia, Egy Maulana, saat melawan Brunei pada pertandingan Grup F Kualifikasi Piala Asia U-19 di Paju Public Stadium, Korea Selatan, Selasa (31/10/2017) siang WIB. (Dok. PSSI)</amp-img></p><div class="ad-container"><amp-ad width="300" height="250" type="doubleclick" data-slot="/31800665/TribunMedanMobile/Article" json="{&quot;targeting&quot;:{&quot;pos&quot;:[&quot;InsideMediumRectangle&quot;], &quot;page&quot;:[&quot;amp&quot;]}}"></amp-ad></div><p><em>&quot;Kami menyadari bahwa pertandingan melawan Indonesia akan menjadi tantangan berat,&quot;</em> ungkap Takao Fujirawa, seperti dikutip dari the-afc.com.</p><p><em>&quot;Di babak pertama, pemain kami melakukan yang terbaik untuk mempertahankan kebuntuan,&quot;</em> lanjutnya.</p><p>Kekalahan itu merupakan kekalahan kedua Brunei Darussalaam dari Timnas U-19.</p><p>Sebelumnya, Brunei juga pernah digilas Garuda Nusantara di Piala AFF U-18 2017.</p><p>Mereka harus tunduk di tangan Indonesia dengan skor 8-0.</p><p><img layout="responsive" src="http://cdn2.tstatic.net/wow/foto/bank/images/timnas-u-19-indonesia_20171013_161152.jpg" width="700" height="393">Timnas U-19 Indonesia (INSTAGRAM)</amp-img></p><p>Meski begitu, Takao mengaku tak menyerah untuk mendapatkan hasil bagus.</p><p>Dirinya akan memperbaiki strategi anak asuhnya.</p><p>Apalagi, pada laga selanjutnya Brunei harus menghadapi tim tuan rumah, Korea Selatan.</p><p><em>&quot;Pertandingan berikutnya akan lebih menantang, tetapi kami akan terus berjuang untuk mencapai tujuan terbaik,&quot;</em> kata Takao Fujirawa.</p><p><strong>(TribunWow.com/Claudia N)</strong></p>        ', 1, 0, '2017-10-31 19:19:11', 0, '', '2017-10-31 19:19:11', 0, 0, NULL, '2017-10-31 19:14:18', NULL, '@prefix/tbm/2017-10-31/5be34648479b44d59ea32fb4c201fdab.jpg', NULL, NULL, 1, 0, 'Timnas U-19, Brunei Darussalam, Kualifikasi Piala Asia U-19, Lainnya, Super Ball', 'Usai kekalahan tersebut, pelatih Brunei Darussalam, Takao Fujiwara mengungkapkan Indonesia merupakan tim yang sulit di kalahkan.', 0, 1, NULL, 0, NULL, 'tribunmedan', 'berita', 'Timnas U-19, Brunei Darussalam, Kualifikasi Piala Asia U-19', 'http://medan.tribunnews.com/amp/2017/10/31/dibantai-timnas-indonesia-5-0-pelatih-timnas-brunei-belum-mau-menyerah');


ALTER TABLE `tb_content`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `alias` (`alias`),
  ADD KEY `idx_access` (`access`),
  ADD KEY `idx_checkout` (`checked_out`),
  ADD KEY `idx_state` (`state`),
  ADD KEY `idx_catid` (`catid`),
  ADD KEY `idx_createdby` (`created_by`),
  ADD KEY `idx_featured_catid` (`featured`,`catid`),
  ADD KEY `idx_language` (`language`),
  ADD KEY `idx_xreference` (`xreference`);


ALTER TABLE `tb_content`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2565;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
