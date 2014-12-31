/*
 *  ororo.tv  - Showtime Plugin
 *
 *  Copyright (C) 2014 Buksa, lprot
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
//ver 0.5.7
(function(plugin) {
    var plugin_info = plugin.getDescriptor();
    var PREFIX = plugin_info.id;
    var BASE_URL = 'http://ororo.tv/';
    var logo = plugin.path + plugin_info.icon;
    var loggedIn = false;

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
    var service = plugin.createService("Ororo.tv", PREFIX + ":start", "video", true, logo);
    //settings
    var settings = plugin.createSettings("Ororo.tv", logo, plugin_info.synopsis);
    var main_menu_order = plugin.createStore('main_menu_order', true);
    var items = [];
    var items_tmp = [];
    settings.createInfo("info", logo, "Plugin developed by " + plugin_info.author + ". \n");
    settings.createDivider('Settings:');
    settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin)", false, function(v) {
        service.tosaccepted = v;
    });
    settings.createBool("arrayview", "Show array view", false, function(v) {
        service.arrayview = v;
    });
    settings.createBool("thetvdb", "Show more information using thetvdb", false, function(v) {
        service.thetvdb = v;
    });
    settings.createBool("subs", "Show Subtitle from Ororo.tv ", true, function(v) {
        service.subs = v;
    });
    settings.createBool("debug", "Debug logging", false, function(v) {
        service.debug = v;
    });
    var Format = [
        ['.mp4', 'MP4', true],
        ['.webm', 'Webm/VP8']
    ];
    settings.createMultiOpt("Format", "Format", Format, function(v) {
        service.Format = v;
    });
    p(showtime.currentVersionInt)
    if (showtime.currentVersionInt >= 4 * 10000000 + 3 * 100000 + 261) {
        plugin.addItemHook({
            title: "Search in Another Apps",
            itemtype: "video",
            handler: function(obj, nav) {
                var title = obj.metadata.title;
                title = title.replace(/<.+?>/g, "").replace(/\[.+?\]/g, "");
                nav.openURL("search:" + title);
            }
        });
    }
    //set header and cookies for ororo.tv
    plugin.addHTTPAuth("http:\/\/.*ororo.tv.*", function(authreq) {
        authreq.setHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0");
        authreq.setCookie("video", "true");
    });

    function login(query, authenticity_token) {
        if (loggedIn)
            return false;
        var reason = "Login required";
        var do_query = false;
        while (1) {
            var credentials = plugin.getAuthCredentials("Ororo.tv", reason, do_query);
            if (!credentials) {
                if (query && !do_query) {
                    do_query = true;
                    continue;
                }
                return "No credentials";
            }
            if (credentials.rejected)
                return "Rejected by user";
            var v = showtime.httpReq("http://ororo.tv/users/sign_in", {
                postdata: {
                    utf8: '✓',
                    authenticity_token: authenticity_token,
                    'user[email]': credentials.username,
                    'user[password]': credentials.password,
                    'user[remember_me]': 0,
                    'user[remember_me]': 1
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1106.240 YaBrowser/1.5.1106.240 Safari/537.4',
                    'Host': 'ororo.tv',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'ru,en;q=0.9'
                }
            }).toString();

            if (v.match(/error message[\s\S]+?header'>([\s\S]+)</)) {
                reason = v.match(/error message[\s\S]+?header'>([\s\S]+?)</)[1].trim()
                p(reason)
                do_query = true;
                continue;
            }
            showtime.trace('Logged in to Ororo.tv as user: ' + credentials.username);
            loggedIn = true;
            return false;
        }
    }
    //First level start page
    plugin.addURI(PREFIX + ":start", function(page) {
        var i, v, remember_user_token;
        if (!service.tosaccepted) if (showtime.message(tos, true, true)) service.tosaccepted = 1;
            else {
                page.error("TOS not accepted. plugin disabled");
                return;
            }
        if (service.arrayview) page.metadata.glwview = plugin.path + "views/array2.view";
        page.metadata.logo = logo;
        page.metadata.title = PREFIX;
        pageMenu(page);
        items = [];
        items_tmp = [];
        var v = showtime.httpReq(BASE_URL).toString()
        if (v.match('error message')) {
            if (v.match(/<meta content="(.*?)" name="csrf-token"/))
                var authenticity_token = v.match(/<meta content="(.*?)" name="csrf-token"/)[1]
            login(true, authenticity_token)
        }
        var v = showtime.httpReq(BASE_URL).toString()
        page.metadata.title = new showtime.RichText((/<title>(.*?)<\/title>/.exec(v)[1]));
        var show = v.split("<div class='index show");
        for (i = 1; i < show.length; i++) {
            var title = trim(match(/<div class='title'>([^<]+)/, show[i], 1));
            var url = match(/href="\/([^"]+)/, show[i], 1);
            var icon = BASE_URL + match(/data-original="\/([^"]+)/, show[i], 1);
            var newest = match(/data-newest='([^']+)/, show[i], 1);
            var rating = +match(/class='star'>[\S\s]+?value'>([0-9]+(?:\.[0-9]*)?)</, show[i], 1);
            var item = page.appendItem(PREFIX + ":page:" + url, "video", {
                title: new showtime.RichText(title /*+ ' | ' + trim(m[i][6])*/ ),
                description: new showtime.RichText(match(/class='title'>[\s\S]+?<\/div>([\s\S]+?)<\/div>/, show[i], 1)),
                icon: icon,
                rating: rating * 10
            });
            item.title = title;
            item.newest = newest;
            item.rating = rating;
            items.push(item);
            items_tmp.push(item);
        }
        try {
            for (i in items) {
                items[i].id = i;
            }
            items_tmp = page.getItems();
            for (i = 0; i < items_tmp.length; i++) {
                if (!items_tmp[i].id) delete items_tmp[i];
            }
            items_tmp.sort(function(a, b) {
                return b.newest > a.newest;
            });
            var order = (items_tmp);
            for (i in order) {
                items[order[i].id].moveBefore(i);
            }
            page.reorderer = function(item, before) {
                item.moveBefore(before);
                var items = page.getItems();
                for (var i = 0; i < items.length; i++) {
                    if (!items[i].id) delete items[i];
                }
            };
        } catch (ex) {
            t("Error while parsing main menu order");
            e(ex);
        }
        page.type = "directory";
        page.contents = "items";
        page.loading = false;
    });
    plugin.addURI(PREFIX + ":page:(.*)", function(page, link) {
        page.type = "directory";
        var i, v, item;
        try {
            v = showtime.httpReq(BASE_URL + link, {
                debug: service.debug,
                headers: {
                    'Host': 'ororo.tv',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Referer': 'http://ororo.tv/' //,
                    //   'Cookie':this.id+'; '+this._ororo_session+'; '+this.remember_user_token
                }
            });
            var title = showtime.entityDecode(trim(match(/<img alt="(.+?)" id="poster"/, v, 1)));
            if (service.arrayview) {
                page.metadata.background = bg(title);
                page.metadata.backgroundAlpha = 0.5;
            }
            var year = parseInt(match(/<div id='year'[\S\s]+?([0-9]+(?:\.[0-9]*)?)/, v, 1), 10);
            var rating = parseInt(match(/<div id='rating'[\S\s]+?([0-9]+(?:\.[0-9]*)?)/, v, 1), 10) * 10;
            var duration = parseInt(match(/<div id='length'[\S\s]+?([0-9]+(?:\.[0-9]*)?)/, v, 1), 10);
            var genre = trim(match(/<div id='genres'>[\s\S]+?:<\/span>([\s\S]+?)</, v, 1));
            var icon = match(/id="poster" src="\/(.+?)"/, v, 1);
            page.metadata.logo = BASE_URL + icon;
            page.metadata.title = title + " (" + year + ")";
            //<a href="#1-3" class="episode" data-href="/shows/planet-earth/videos/2946" data-id="2946" data-time="null">№3 Fresh Water</a>
            var re = /<a href="#?([^-]+)-([^"]+)" [\S\s]+?data-href="\/([^"]+)[\S\s]+?>([^<]+)([\S\s]+?)<\/li/g;
            var m = re.execAll(v);
            page.loading = false;
            if (m.toString()) {
                for (i = 0; i < m.length; i++) {
                    if (m[i][2] == '1') {
                        page.appendItem("", "separator", {
                            title: new showtime.RichText('Season ' + m[i][1])
                        });
                    }
                    item = page.appendItem(PREFIX + ":play:" + m[i][3] + ':' + escape(m[i][4] + '|' + title + '|' + parseInt(m[i][1], 10) + '|' + parseInt(m[i][2], 10)), "video", {
                        title: new showtime.RichText(m[i][4]),
                        icon: BASE_URL + icon,
                        description: match(/plot'>([^<]+)/, m[i][5], 1) ? new showtime.RichText(match(/plot'>([^<]+)/, m[i][5], 1)) : '',
                        rating: rating,
                        duration: duration,
                        genre: genre,
                        year: year
                    });
                    if (service.thetvdb) {
                        item.bindVideoMetadata({
                            title: trim(title),
                            season: parseInt(m[i][1], 10),
                            episode: parseInt(m[i][2], 10)
                        });
                    }
                }
            }
        } catch (ex) {
            page.error("Failed to process page");
            e(ex);
        }
        page.type = "directory";
        page.loading = false;
    });
    // Play links
    plugin.addURI(PREFIX + ":play:(.*):(.*)", function(page, url, title) {
        page.loading = true;
        page.metadata.logo = logo;
        var s = unescape(title).split('|');
        var video = get_video_link(url);
        var videoparams = {
            no_fs_scan: true,
            title: unescape(s[1]),
            season: s[2],
            episode: s[3],
            canonicalUrl: PREFIX + ":play:" + url + ":" + title,
            sources: [{
                    url: video.url.replace('.webm', service.Format)
                }
            ],
            subtitles: service.subs === true ? ([{
                    url: video.sub,
                    language: 'English',
                    title: match(/subtitle\/.+?\/(.+)/, video.sub)
                }
            ]) : ''
        };
        page.source = "videoparams:" + showtime.JSONEncode(videoparams);
        page.loading = false;
        page.type = "video";
    });

    function get_video_link(url) {
        var video = [];
        try {
            var v = showtime.httpReq(BASE_URL + url, {
                debug: service.debug,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0' //,
                    //    'Cookie': this.id+"; "+ this._ororo_session+'; '+remember_user_token+'; video=true;',
                    //   'Location':'http://static-ua.ororo.tv/uploads/video/file/15896/Almost.Human.S01E03.HDTV.x264-LOL.mp4'
                }
            });
            video.url = match(/<source src='\/(.*?)' type='video/, v, 1) ? BASE_URL + match(/<source src='\/(.*?)' type='video/, v, 1) : match(/<source src='(.*?)' type='video/, v, 1);
            //<track default kind='subtitles' label='en' src='/uploads/subtitle/file/19219/Bob_s_Burgers_-_01x05_-_Hamburger_Dinner_Theater.LOL.English.HI.C.updated.Addic7ed.com.srt' srclang='en'>
            video.sub = BASE_URL + match(/subtitles'.[\s\S]{0,300} src='\/(.*)' srclang/, v, 1);
        } catch (err) {
            e(err);
        }
        return video;
    }

    function pageMenu(page) {
        if (service.arrayview) {
            page.metadata.background = plugin.path + "views/img/background.png";
            page.metadata.backgroundAlpha = 0.5;
        }
        //page.appendAction("pageevent", "sortDateDec", true, {
        //    title: "Sort by Date (Decrementing)",
        //    icon: plugin.path + "views/img/sort_date_dec.png"
        //});
        page.appendAction("pageevent", "sortViewsDec", true, {
            title: "Sort by Views (Decrementing)",
            icon: plugin.path + "views/img/sort_views_dec.png"
        });
        page.appendAction("pageevent", "sortAlphabeticallyInc", true, {
            title: "Sort Alphabetically (Incrementing)",
            icon: plugin.path + "views/img/sort_alpha_inc.png"
        });
        page.appendAction("pageevent", "sortAlphabeticallyDec", true, {
            title: "Sort Alphabetically (Decrementing)",
            icon: plugin.path + "views/img/sort_alpha_dec.png"
        });
        var sorts = [
            ["sortAlphabeticallyInc", "Alphabetically (A->Z)"],
            ["sortAlphabeticallyDec", "Alphabetically (Z->A)"],
            ["sortViewsDec", "Views (decrementing)"],
            ["sortDateDec", "Published (decrementing)"],
            ["sortDefault", "Default", true]
        ];
        page.options.createMultiOpt("sort", "Sort by...", sorts, function(v) {
            eval(v + "()");
        });

        function sortAlphabeticallyInc() {
            var its = sort(items, "title", true);
            pageUpdateItemsPositions(its);
        }

        function sortAlphabeticallyDec() {
            var its = sort(items, "title", false);
            pageUpdateItemsPositions(its);
        }

        function sortViewsDec() {
            var its = sort(items, "rating", false);
            pageUpdateItemsPositions(its);
        }

        function sortDateDec() {
            var its = sort(items, "newest", false);
            pageUpdateItemsPositions(its);
        }

        function sortDefault() {
            for (var i in items_tmp) {
                items[i].moveBefore(items_tmp[i].orig_index);
            }
        }
        page.onEvent('sortAlphabeticallyInc', function() {
            sortAlphabeticallyInc();
        });
        page.onEvent('sortAlphabeticallyDec', function() {
            sortAlphabeticallyDec();
        });
        page.onEvent('sortViewsDec', function() {
            sortViewsDec();
        });
        page.onEvent('sortDateDec', function() {
            sortDateDec();
        });
        page.onEvent('sortDefault', function() {
            sortDefault();
        });
    }

    function pageUpdateItemsPositions(its) {
        for (var i in its) {
            items[its[i].orig_index].moveBefore(i);
        }
    }

    function sort(items, field, reverse) {
        if (items.length === 0) return null;
        var its = [];
        for (var i in items) {
            items[i].orig_index = i;
            its.push(items[i]);
        }
        its.sort(function(a, b) {
            return b[field] > a[field];
        });
        if (reverse) its.reverse();
        return its;
    }
    //
    //extra functions
    //
    // Add to RegExp prototype
    RegExp.prototype.execAll = function(string) {
        var matches = [];
        var match = null;
        while ((match = this.exec(string)) !== null) {
            var matchArray = [];
            for (var i in match) {
                if (parseInt(i, 10) == i) {
                    matchArray.push(match[i]);
                }
            }
            matches.push(matchArray);
        }
        return matches;
    };

    function bg(title) {
        title = trim(title);
        var v = showtime.httpGet('http://www.thetvdb.com/api/GetSeries.php', {
            'seriesname': title,
            'language': 'ru'
        }).toString();
        var id = match(/<seriesid>(.+?)<\/seriesid>/, v, 1);
        if (id) {
            v = (showtime.httpReq('http://www.thetvdb.com/api/0ADF8BA762FED295/series/' + id + '/banners.xml').toString());
            id = match(/<BannerPath>fanart\/original\/([^<]+)/, v, 1);
            return "http://thetvdb.com/banners/fanart/original/" + id;
        }
        return plugin.path + "views/img/background.png";
    }

    function getCookie(name, multiheaders) {
        var cookie = showtime.JSONEncode(multiheaders['Set-Cookie']);
        p('cookie: ' + cookie);
        var matches = cookie.match(new RegExp('(?:^|; |","|")' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        return matches ? name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=' + decodeURIComponent(matches[1]) : false;
    }

    function match(re, st, i) {
        i = typeof i !== 'undefined' ? i : 0;
        if (re.exec(st)) {
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

    function e(ex) {
        t(ex);
        t("Line #" + ex.lineNumber);
    }

    function t(message) {
        if (service.debug) showtime.trace(message, plugin.getDescriptor().id);
    }

    function p(message) {
        if (typeof(message) === 'object') message = showtime.JSONEncode(message);
        if (service.debug) showtime.print(message);
    }

    function trace(msg) {
        if (service.debug) {
            t(msg);
            p(msg);
        }
    }
})(this);