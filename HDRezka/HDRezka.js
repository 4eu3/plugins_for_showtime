/*
 *  HDRezka  - Showtime Plugin
 *
 *  Copyright (C) 2014 Buksa
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
//ver 0.4.3
(function(plugin) {

    var plugin_info = plugin.getDescriptor();

    var PREFIX = plugin_info.id;

    var BASE_URL = 'http://hdrezka.tv';

    var logo = plugin.path + 'logo.png';

    var tos = 'The developer has no affiliation with the sites what so ever.\n';
    tos += 'Nor does he receive money or any other kind of benefits for them.\n\n';
    tos += 'The software is intended solely for educational and testing purposes,\n';
    tos += 'and while it may allow the user to create copies of legitimately acquired\n';
    tos += 'and/or owned content, it is required that such user actions must comply\n';
    tos += 'with local, federal and country legislation.\n\n';
    tos += 'Furthermore, the author of this software, its partners and associates\n';
    tos += 'shall assume NO responsibility, legal or otherwise implied, for any misuse\n';
    tos += 'of, or for any loss that may occur while using plugin.\n\n';
    tos += 'You are solely responsible for complying with the applicable laws in your\n';
    tos += 'country and you must cease using this software should your actions during\n';
    tos += 'plugin operation lead to or may lead to infringement or violation of the\n';
    tos += 'rights of the respective content copyright holders.\n\n';
    tos += "plugin is not licensed, approved or endorsed by any online resource\n ";
    tos += "proprietary. Do you accept this terms?";

    // Register a service (will appear on home page)
    var service = plugin.createService(plugin_info.title, PREFIX + ":start", "video", true, logo);

    //settings
    var settings = plugin.createSettings(plugin_info.title, logo, plugin_info.synopsis);
    settings.createInfo("info", logo, "Plugin developed by " + plugin_info.author + ". \n");
    settings.createDivider('Settings:');
    settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin):", false, function(v) {
        service.tosaccepted = v;
    });

    var Format = [
        ['hls', 'HLS', true],
        ['mp4', 'MP4']
    ];

    var Resolution = [
        ['0', 'Auto', true],
        ['1', '720p'],
        ['2', '480p'],
        ['3', '360p'],
    ];

    settings.createMultiOpt("Resolution", "Разрешение", Resolution, function(v) {
        service.Resolution = v;
    });
    settings.createMultiOpt("Format", "Format", Format, function(v) {
        service.Format = v;
    });
    settings.createBool("thetvdb", "Show more information using thetvdb", false, function(v) {
        service.thetvdb = v;
    });
    settings.createBool("debug", "Debug", false, function(v) {
        service.debug = v;
    });

    function startPage(page) {
        page.metadata.logo = plugin.path + "logo.png";
        page.metadata.title = PREFIX;
        if (!service.tosaccepted)
            if (showtime.message(tos, true, true)) service.tosaccepted = 1;
            else {
                page.error("TOS not accepted. plugin disabled");
                return;
            }
        var v, re, m, i;
        //page.loading = true;
        re = /data-url="http:\/\/hdrezka.tv(.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
        //Фильмы
        page.appendItem("", "separator", {
            title: new showtime.RichText('Фильмы')
        });
        v = showtime.httpReq(BASE_URL + '/films/').toString();
        m = re.execAll(v);
        for (i = 0; i < 7; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                title: new showtime.RichText(m[i][3]),
                description: new showtime.RichText(m[i][4]),
                icon: BASE_URL + m[i][2],
                year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
            });
        }
        page.appendItem(PREFIX + ":sort:" + '/films/', "directory", {
            title: ('Дальше больше') + ' ►',
            icon: logo
        });
        //Сериалы
        page.appendItem("", "separator", {
            title: new showtime.RichText('Сериалы')
        });
        v = showtime.httpReq(BASE_URL + '/series/').toString();
        //re = /data-url="http:\/\/hdrezka.tv(.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)/g;
        m = re.execAll(v);
        for (i = 0; i < 7; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                title: new showtime.RichText(m[i][3]),
                description: new showtime.RichText(m[i][4]),
                icon: BASE_URL + m[i][2],
                year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][
                    4
                ], 1)
            });
        }
        page.appendItem(PREFIX + ":sort:" + '/series/', "directory", {
            title: ('Дальше больше') + ' ►',
            icon: logo
        });
        //Мультфильмы
        page.appendItem("", "separator", {
            title: new showtime.RichText('Мультфильмы')
        });
        v = showtime.httpReq(BASE_URL + '/cartoons/').toString();
        //re = /data-url="http:\/\/hdrezka.tv(.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)/g;
        m = re.execAll(v);
        for (i = 0; i < 7; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                title: new showtime.RichText(m[i][3]),
                description: new showtime.RichText(m[i][4]),
                icon: BASE_URL + m[i][2],
                year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][
                    4
                ], 1)
            });
        }
        page.appendItem(PREFIX + ":sort:" + '/cartoons/', "directory", {
            title: ('Дальше больше') + ' ►',
            icon: logo
        });
        page.type = "directory";
        // page.contents = "items";
        page.loading = false;
    }

    function indexPage(page, link, filter){
        var re, v, m;
        // page.contents = "items";
        page.type = "directory";
        page.metadata.logo = plugin.path + "logo.png";
        v = showtime.httpReq(BASE_URL + link).toString();
        re = /<title>(.*?)<\/title>/;
        m = re.exec(v);
        page.metadata.title = new showtime.RichText(PREFIX + ' | ' + (m[1].replace('Смотреть ', '').replace(' в 720p hd', '.')));
        page.appendItem(PREFIX + ':select:' + link, 'directory', {
            title: new showtime.RichText('сортировка по : ' + (m[1].replace('Смотреть ', '').replace(' в 720p hd', '.')))
        });
        var offset = 1;

        function loader() {
            var v = showtime.httpReq(BASE_URL + link + 'page/' + offset + '/', {
                args: {
                    filter: filter
                }
            }).toString();
            p(BASE_URL + link + 'page/' + offset + '/');
            var has_nextpage = false;
            var m = v.match(/href="http:\/\/hdrezka.tv(.+?)"><span class="b-navigation__next i-sprt">.*<\/span><\/a>/);
            if (m) has_nextpage = true;
            re = /data-url="http:\/\/hdrezka.tv(.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
            m = re.execAll(v);
            for (var i = 0; i < m.length; i++) {
                page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                    title: new showtime.RichText(m[i][3]),
                    description: new showtime.RichText(m[i][4]),
                    icon: BASE_URL + m[i][2],
                    year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
                });
            }
            offset++;
            return has_nextpage;
            // return offset < parseInt(/<div class="navigation[\S\s]+?nav_ext[\S\s]+?">([^<]+)/.exec(v)[1], 10)
        }
        if (loader()) page.paginator = loader;
        page.loading = false;
    }
    
    function page(page, link) {
        page.type = "directory";
        // page.contents = "items";
        page.loading = false;
        var i, v, item, re, re2, m, m2;
        p(BASE_URL + link);
        v = showtime.httpReq(BASE_URL + link).toString();
        p(v)
        try {
            var md = {};
            var data = {};
            md.url = BASE_URL + link;
            data.id = match(/\/([0-9]+(?:\.[0-9]*)?)-/, link, 1);
            md.title = showtime.entityDecode(match(/<h1 itemprop="name">(.+?)<\/h1>/, v, 1));
            data.title = md.title;
            md.eng_title = showtime.entityDecode(match(/<div class="b-post__origtitle" itemprop="alternativeHeadline">(.+?)<\/div>/, v, 1));
            data.eng_title = md.eng_title;
            md.icon = match(/<img itemprop="image" src="(.+?)"/, v, 1);
            md.rating = +match(/<span class="b-post__info_rates imdb">IMDb:[\S\s]+?([0-9]+(?:\.[0-9]*)?)<\/span>/, v, 1);
            md.year = +match(/http:\/\/hdrezka.tv\/year\/(\d{4})/, v, 1);
            data.year = md.year ? md.year : 0;
            md.slogan = match(/>Слоган:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.rel_date = match(/>Дата выхода:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.country = match(/>Страна:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.director = match(/>Режиссер:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.genre = match(/>Жанр:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.duration = match(/>Время:<\/td>[\S\s]+?>(.+?)<\/td>/, v, 1);
            md.actor = match(/>В ролях актеры:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            md.description = match(/>Описание:<\/td>[\S\s]+?<td>(.+?)<\/td>/, v, 1);
            page.metadata.title = md.title + ' (' + md.year + ')';
            //Трейлер:
            page.appendItem("", "separator", {
                title: new showtime.RichText('Трейлер:')
            });
            var trailer = match(/http:\\\/\\\/www.youtube.com\\\/embed\\\/(.+?)\?iv_load_policy/, v, 1);
            if (trailer) {
                page.appendItem('youtube:video:simple:' + escape(page.metadata.title + " - " + 'Трейлер') + ":" + trailer, "video", {
                    title: new showtime.RichText(md.title),
                    icon: "http://i.ytimg.com/vi/" + trailer + "/hqdefault.jpg",
                    rating: +md.rating * 10
                });
            } else page.appendItem("youtube:feed:" + escape("https://gdata.youtube.com/feeds/api/videos?q=" + 'Трейлер ' + md.title), "directory", {
                    title: 'найти трейлер на YouTube'
                });
            //serials
            //serial na moonwalk
            //http://hdcdn.nl/
            var moonwalk = match(/(http:\/\/hdcdn.nl\/.*?iframe)/, v, 1);
            p('iframe: ' + moonwalk)
            if (moonwalk) {
                var html = showtime.httpReq(moonwalk,{
                        method: 'GET',
                        headers: {
                            'Referer': BASE_URL + link
                            }
                    } ).toString();
                re = /<option .*value="(.*)">(.*)<\/option>/g;
                m = re.execAll(html.match(/<select id="season"[\S\s]+?option><\/select>/));
                p('count seasons:' + m.length)
                for (i = 0; i < m.length; i++) {
                    page.appendItem("", "separator", {
                        title: new showtime.RichText(m[i][2])
                    });
                    var seasons = moonwalk + '?season=' + m[i][1];
                    p('season ' + m[i][1])
                    p('iframe: ' + seasons)
                    var html2 = showtime.httpReq(seasons,{
                        method: 'GET',
                        headers: {
                            'Referer': BASE_URL +link
                            }
                    } ).toString();
                    m2 = re.execAll(html2.match(/<select id="episode"[\S\s]+?option><\/select>/));
                    p('count episode: ' + m2.length)
                    for (j = 0; j < m2.length; j++) {
                        data.series = {
                            url: moonwalk + '?season=' + m[i][1] + '&episode=' + m2[j][1],
                            season: +m[i][1],
                            episode: m2[j][1]
                        };
                        page.appendItem(PREFIX + ':play:' + escape(showtime.JSONEncode(data)), 'video', {
                            title: m2[j][2],
                            year: md.year,
                            icon: md.icon,
                            genre: new showtime.RichText(md.genre),
                            duration: md.duration ? getDuration(md.duration) : '',
                            rating: +md.rating * 10,
                            description: new showtime.RichText(
                            (md.slogan ? coloredStr('Слоган: ', orange) + md.slogan + '\n' : '') + (md.rel_date ? coloredStr('Дата выхода: ', orange) + md.rel_date + ' ' : '') + (md.country ? coloredStr(' Страна: ', orange) + md.country + '\n' : '') + (md.director ? coloredStr('Режиссер: ', orange) + md.director + ' ' : '') + (md.actor ? '\n' + coloredStr('В ролях актеры: ', orange) + md.actor + '\n' : '') + (md.description ? '\n ' + md.description + '\n' : ''))
                        });
                    }
                }
            }
            // serial na hdrezke
            var eplist = match(/<ul id="episodes-list-(.+?)" class="b-episodes__list clearfix">([\S\s]+?)ul>/, v, 1);
            if (eplist) {
                data.series = {};
                // if (link.indexOf('/series/') != -1) {
                re = /<ul id="episodes-list-(.+?)" class="b-episodes__list([\S\s]+?)ul>/g;
                m = re.execAll(v.match(/<div class="b-episodes__wrapper">[\S\s]+?<div class="b-content__columns/));
                for (i = 0; i < m.length; i++) {
                    page.appendItem("", "separator", {
                        title: new showtime.RichText('Сезон ' + m[i][1])
                    });
                    m2 = /data-id="(.+?)" data-season_id="(.+?)" data-episode_id="(.+?)"[\S\s]+?<img src="(.+?)"/g.execAll(m[i][2]);
                    for (var j = 0; j < m2.length; j++) {
                        data.id = m2[j][1];
                        data.series = {
                            season: m2[j][2],
                            episode: m2[j][3]
                        };
                        item = page.appendItem(PREFIX + ":play:" + escape(showtime.JSONEncode(data)), "video", {
                            title: new showtime.RichText(m2[j][3] + " серия"),
                            year: md.year,
                            icon: BASE_URL + m2[j][4],
                            genre: new showtime.RichText(md.genre),
                            duration: md.duration ? getDuration(md.duration) : '',
                            rating: +md.rating * 10,
                            description: new showtime.RichText(
                            (md.slogan ? coloredStr('Слоган: ', orange) + md.slogan + '\n' : '') + (md.rel_date ? coloredStr('Дата выхода: ', orange) + md.rel_date + ' ' : '') + (md.country ? coloredStr(' Страна: ', orange) + md.country + '\n' : '') + (md.director ? coloredStr('Режиссер: ', orange) + md.director + ' ' : '') + (md.actor ? '\n' + coloredStr('В ролях актеры: ', orange) + md.actor + '\n' : '') + (md.description ? '\n ' + md.description + '\n' : ''))
                        });
                        if (service.thetvdb) {
                            item.bindVideoMetadata({
                                title: md.eng_title.trim(),
                                season: +data.season,
                                episode: +data.episode
                            });
                        }
                    }
                }
            } else
            //films
            if (link.indexOf('/films/') !== -1) {
                page.appendItem("", "separator", {
                    title: new showtime.RichText('Фильм:')
                });
                data.series = {} //re = /sof.tv.initEvents[\S\s]+?(\{.+?\})/;
                //data.links = showtime.JSONDecode(match(/sof.tv.initEvents[\S\s]+?(\{.+?\})/, v, 1));
                item = page.appendItem(PREFIX + ":play:" + escape(showtime.JSONEncode(data)), "video", {
                    title: new showtime.RichText(md.title + (md.eng_title ? ' | ' + md.eng_title : '')),
                    season: +md.season,
                    year: md.year,
                    imdbid: md.imdbid,
                    icon: md.icon,
                    genre: new showtime.RichText(md.genre),
                    duration: md.duration ? getDuration(md.duration) : '',
                    rating: +md.rating * 10,
                    description: new showtime.RichText((md.slogan ? coloredStr('Слоган: ', orange) + md.slogan + '\n' : '') + (md.rel_date ? coloredStr('Дата выхода: ', orange) + md.rel_date + ' ' : '') + (md.country ? coloredStr(' Страна: ', orange) + md.country + '\n' : '') + (md.director ? coloredStr('Режиссер: ', orange) + md.director + ' ' : '') + (md.actor ? '\n' + coloredStr('В ролях актеры: ', orange) + md.actor + '\n' : '') + (md.description ? '\n ' + md.description + '\n' : ''))
                });
                if (service.thetvdb) {
                    item.bindVideoMetadata({
                        title: md.eng_title,
                        year: md.year
                    });
                }
            }
            var sidetitle = match(/<div class="b-sidetitle">.*>(.+?)</, v, 1);
            if (sidetitle) {
                page.appendItem("", "separator", {
                    title: new showtime.RichText(sidetitle.replace(' бесплатные', '').replace('Смотреть п', 'П'))
                });
                re = /data-url="http:\/\/hdrezka.tv(.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div.*>(.+?)<\/div>/g;
                m = re.execAll(v);
                for (i = 0; i < m.length; i++) {
                    page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                        title: new showtime.RichText(m[i][3]),
                        description: new showtime.RichText(m[i][4]),
                        icon: BASE_URL + m[i][2],
                        year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
                    });
                }
            }
        } catch (ex) {
            page.error("Failed to process page");
            e(ex);
        }
    
    }
    
    function select(page, url){
        //\/.+?\/
        page.metadata.title = PREFIX + ' | ' + 'Жанры и Категории';
        try {
            var v = showtime.httpReq(BASE_URL).toString();
            var re = new RegExp('href="(' + url.match(/\/.+?\//) + '\\w+/)">(.+?)</a>', 'g');
            var m = re.execAll(v);
            page.appendItem(PREFIX + ":start", "directory", {
                title: 'На начальную страницу',
                description: 'На начальную страницу',
                icon: logo
            });
            for (var i = 1; i < m.length; i++) {
                page.appendItem(PREFIX + ":sort:" + (m[i][1]), "directory", {
                    title: new showtime.RichText(m[i][2]),
                    description: new showtime.RichText(m[i]
                    [2]),
                    icon: logo
                });
            }
        } catch (ex) {
            page.error("Failed to process categories page (get_cat)");
            e(ex);
        }
        page.type = "directory";
        page.loading = false;
        page.metadata.logo = logo;
    }
    
    function sort(page, url) {
        page.metadata.title = PREFIX + ' | ' + 'Сортировать по:';
        page.appendItem(PREFIX + ":index:" + url + ':' + 'last', "directory", {
            title: 'Последние поступления',
            description: 'Последние поступления',
            icon: logo
        });
        page.appendItem(PREFIX + ":index:" + url + ':' + 'popular', "directory", {
            title: 'Популярные',
            description: 'Популярные',
            icon: logo
        });
        page.appendItem(PREFIX + ":index:" + url + ':' + 'watching', "directory", {
            title: 'Сейчас смотрят',
            description: 'Сейчас смотрят',
            icon: logo
        });
        page.type = "directory";
        page.loading = false;
        page.metadata.logo = logo;
    }
    
    function play(page, data) {
        var canonicalUrl = PREFIX + ":play:" + (data);
        data = showtime.JSONDecode(unescape(data));
        page.type = "video";
        page.title = data.title;
        if (data.series) {
            page.source = "videoparams:" + showtime.JSONEncode({
                //subscan
                title: data.eng_title ? data.eng_title : data.title,
                //imdbid: imdbid ? imdbid : '<unknown>',
                year: data.year,
                season: (data.series.season ? data.series.season : -1),
                episode: data.series.episode ? data.series.episode : -1,
                no_fs_scan: true,
                canonicalUrl: canonicalUrl,
                sources: [{
                        url: get_video_link(data)
                    }
                ]
            });
        } else {
            page.source = "videoparams:" + showtime.JSONEncode({
                //subscan
                title: data.eng_title ? data.eng_title : data.title,
                //imdbid: imdbid ? imdbid : '<unknown>',
                year: data.year,
                no_fs_scan: true,
                canonicalUrl: canonicalUrl,
                sources: [{
                        url: get_video_link(data)
                    }
                ]
            });
        }
        page.metadata.logo = logo;
        page.loading = false;
    }
    
    function searcher(page, query) {
        var v, re, m, i;
        try {
            showtime.trace("Search HDRezka Videos for: " + query);
            v = showtime.httpReq(BASE_URL, {
                debug: true,
                args: {
                    do :'search',
                    subaction: 'search',
                    q: query
                    //q: encodeURIComponent(showtime.entityDecode(query))
                }
            });
            re = /data-url="http:\/\/hdrezka.tv(.+?)"[\S\s]+?<img src="([^"]+)[\S\s]+?item-link[\S\s]+?">([^<]+)[\S\s]+?<div>(.+?)<\/div>/g;
            m = re.execAll(v);
            for (i = 0; i < m.length; i++) {
                page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                    title: new showtime.RichText(m[i][3]),
                    description: new showtime.RichText(m[i]
                    [4]),
                    icon: BASE_URL + m[i][2],
                    year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
                });
                page.entries = i;
            }
        } catch (err) {
            showtime.trace('HDRezka - Ошибка поиска: ' + err);
            e(err);
        }
    }
    //first level
    plugin.addURI(PREFIX + ":start", startPage);
    //Second level 
    plugin.addURI(PREFIX + ":index:(.*):(.*)", indexPage);
    //Third Level
    plugin.addURI(PREFIX + ":page:(.*)", page);
    
    plugin.addURI(PREFIX + ":select:(.*)", select);
    
    plugin.addURI(PREFIX + ":sort:(.*)", sort);
    // Play links
    plugin.addURI(PREFIX + ":play:(.*)", play);
    plugin.addSearcher(PREFIX + " - Videos", plugin.path + "logo.png", searcher);

    function get_video_link(data) {
        p('############# get_video_link ###########')
        var v, result_url;
        p(data)
        try {
            //serialy hdserials
            if (data.series && data.series.url) {
                v = showtime.httpReq(data.series.url,{
                        method: 'GET',
                        headers: {
                            'Referer': BASE_URL
                            }
                    } ).toString();
                p(v)

                //                var postdata = {}
                //              postdata = (/sessions\/create_session', {([^}]+)/.exec(v)[1])
                //            p(postdata)
                var JSON = showtime.JSONDecode(showtime.httpReq(data.series.url.match(/http:\/\/.*?\//) + 'sessions/create_session', {
                    debug: true,
                    postdata: {
                        partner: /partner: (.*),/.exec(v)[1],
                        d_id: /d_id: (.*),/.exec(v)[1],
                        video_token: /video_token: '(.*)'/.exec(v)[1],
                        stats_version: /stats_version: (.*),/.exec(v)[1],
                        video_secret: /video_secret: '(.*)'/.exec(v)[1],
                        content_type: /content_type: '(.*)'/.exec(v)[1]
                    }
                }));
                p(JSON)
                return JSON.manifest_m3u8;
            }
            if (data.series) {
                v = showtime.JSONDecode(showtime.httpReq(BASE_URL + '/engine/ajax/getvideo.php', {
                    postdata: {
                        id: data.id,
                        season: data.series.season ? data.series.season : '',
                        episode: data.series.episode ? data.series.episode : ''
                    }
                }).toString());
                data.links = showtime.JSONDecode(v.link);
            }
            //filmy
            if (!data.series) {
                p('############ !data.series ###########')
                v = showtime.httpReq(BASE_URL + '/engine/ajax/getvideo.php', {
                    postdata: {
                        id: data.id
                    }
                }).toString();
                p('source:' + BASE_URL + '/engine/ajax/getvideo.php')
                p(v)
                v = showtime.JSONDecode(v)
                //hdserials
                if (v.link.match(/http:\/\/.+?iframe/)) {
                    p('Open url:' + v.link.match(/http:\/\/.+?iframe/))
                    var hdcdn = v.link.match(/http:\/\/.+?iframe/).toString()
                    v = showtime.httpReq(hdcdn,{
                        method: 'GET',
                        headers: {
                            'Referer': BASE_URL
                            }
                    } ).toString();


                    var JSON = showtime.JSONDecode(showtime.httpReq(hdcdn.match(/http:\/\/.*?\//) + 'sessions/create_session', {
                        debug: true,
                        postdata: {
                            partner: /partner: (.*),/.exec(postdata)[1],
                            d_id: /d_id: (.*),/.exec(postdata)[1],
                            video_token: /video_token: '(.*)'/.exec(postdata)[1],
                            stats_version: /stats_version: (.*),/.exec(postdata)[1],
                            video_secret: /video_secret: '(.*)'/.exec(postdata)[1],
                            content_type: /content_type: '(.*)'/.exec(postdata)[1]
                        }
                    }));
                    p(JSON)
                    return JSON.manifest_m3u8;
                }

                //vk.com
                if (v.link.match('vk.com')) {
                    var v = showtime.httpGet(/src="(.*?)"/.exec(v.link)[1]).toString();
                    var JSON = (/var vars = (.+)/.exec(v)[1]);
                    JSON = showtime.JSONDecode(JSON);

                    if (JSON.no_flv == 1) {
                        p('service.Resolution: ' + service.Resolution)
                        result_url = undefined
                        switch (service.Resolution) {
                            case '0':
                                //if max resolution 720p
                                result_url = JSON.url720;

                                if (result_url == undefined) {
                                    result_url = JSON.url480;
                                }
                                if (result_url == undefined) {
                                    result_url = JSON.url360;
                                }
                                if (result_url == undefined) {
                                    result_url = JSON.url240;
                                }
                                break;
                            case '1':
                                result_url = JSON.url480;

                                if (result_url == undefined) {
                                    result_url = JSON.url360;
                                }
                                if (result_url == undefined) {
                                    result_url = JSON.url240;
                                }
                                break;
                            case '2':
                                result_url = JSON.url360;
                                if (result_url == undefined) {
                                    result_url = JSON.url240;
                                }
                                break;
                            case '3':
                                result_url = JSON.url240;
                                break;
                        }
                    }
                    showtime.trace("Video Link: " + result_url);

                }

                if (match(/src="(.+?)"/, v.link, 1)) {
                    v = showtime.httpReq(/src="(.*?)"/.exec(v.link)[1]).toString()
                    return v.match(/setFlash\('([\s\S]*?)\s/)[1].replace(/manifest.f4m/, "index.m3u8");
                }
                data.links = showtime.JSONDecode(v.link);
            }
            if (service.Format == 'mp4') {
                result_url = data.links.mp4;
            } else result_url = data.links.hls;
            showtime.trace("Video Link: " + result_url);
        } catch (err) {
            e(err);
            e(err.stack);
        }
        return result_url;
    }
    //
    //extra functions
    //
    // Add to RegExp prototype


    RegExp.prototype.execAll = function(e) {
        for (var c = [], b = null; null !== (b = this.exec(e));) {
            var d = [],
                a;
            for (a in b) {
                parseInt(a, 10) == a && d.push(b[a]);
            }
            c.push(d);
        }
        return c;
    };

    function match(re, st, i) {
        i = typeof i !== 'undefined' ? i : 0;
        if (re.exec(st.toString())) {
            return re.exec(st)[i];
        } else return '';
    }

    function trim(s) {
        s = s.toString();
        s = s.replace(/(\r\n|\n|\r)/gm, "");
        s = s.replace(/(^\s*)|(\s*$)/gi, "");
        s = s.replace(/[ ]{2,}/gi, " ");
        return s;
    }
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
    var blue = "6699CC",
        orange = "FFA500";

    function colorStr(str, color) {
        return '<font color="' + color + '">(' + str + ')</font>';
    }

    function coloredStr(str, color) {
        return '<font color="' + color + '">' + str + '</font>';
    }

    function getDuration(duration) {
        var tmp = duration.split(':');
        if (tmp.length >= 2) {
            var h = parseInt(tmp[0], 10);
            var m = parseInt(tmp[1], 10);
            var total = m;
            total += h * 60;
            return total;
        }
        return parseInt(duration, 10);
    }

    function e(ex) {
        t(ex);
        t("Line #" + ex.lineNumber);
    }

    function t(message) {
        showtime.trace(message, plugin.getDescriptor().id);
    }

    function p(message) {
        if (typeof(message) === 'object') message = '### object ###' + '\n' + showtime.JSONEncode(message) + '\n' + '### object ###';
        if (service.debug) showtime.print(message);
    }
})(this);