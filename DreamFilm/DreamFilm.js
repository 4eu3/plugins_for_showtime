/*
 *  DreamFilm  - Showtime Plugin
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
//ver 0.3
(function(plugin) {
    var plugin_info = plugin.getDescriptor();
    var PREFIX = plugin_info.id;
    // bazovyj adress saita
    var BASE_URL = 'http://dreamfilm.se';
    //logo
    var logo = plugin.path + 'logo.png';
    //tos
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
    settings.createBool("debug", "Debug", false, function(v) {
        service.debug = v;
    });
    //first level
    plugin.addURI(PREFIX + ":start", function(page) {
        page.metadata.logo = plugin.path + "logo.png";
        page.metadata.title = PREFIX;
        if (!service.tosaccepted) if (showtime.message(tos, true, true)) service.tosaccepted = 1;
        else {
            page.error("TOS not accepted. plugin disabled");
            return;
        }
        var v, re, m, i;
        re = /<div class='movie_container'>[\s\S]+?>(.+?)<[\s\S]+?<small>(.+?)<\/small>[\s\S]+?>([^<]+)[\s\S]+?href="http:\/\/dreamfilm.se([^"]+)[\s\S]+?img src="([^"]+)/g;
        //Filmer
        page.appendItem("", "separator", {
            title: new showtime.RichText('Filmer')
        });
        v = showtime.httpReq(BASE_URL + '/movies/').toString();
        m = re.execAll(v);
        for (i = 0; i < 7; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][4], "video", {
                title: new showtime.RichText(trim(showtime.entityDecode(m[i][1]))),
                genre: new showtime.RichText(trim(m[i][2])),
                description: new showtime.RichText(trim(m[i][3])),
                icon: m[i][5].indexOf('http') !== -1 ? m[i][5] : (BASE_URL + "/" + m[i][5]),
                year: +match(/(\d{4})/, m[i][1], 1)
            });
        }
        page.appendItem(PREFIX + ":index:" + '/movies/', "directory", {
            title: ('Visa mer') + ' ►',
            icon: logo
        });
        //TV-Serier
        page.appendItem("", "separator", {
            title: new showtime.RichText('TV-Serier')
        });
        v = showtime.httpReq(BASE_URL + '/series/').toString();
        m = re.execAll(v);
        for (i = 0; i < 7; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][4], "video", {
                title: new showtime.RichText(trim(m[i][1])),
                genre: new showtime.RichText(trim(m[i][2])),
                description: new showtime.RichText(trim(m[i][3])),
                icon: m[i][5].indexOf('http') !== -1 ? m[i][5] : (BASE_URL + "/" + m[i][5]),
                year: +match(/(\d{4})/, m[i][1], 1)
            });
        }
        page.appendItem(PREFIX + ":index:" + '/series/', "directory", {
            title: ('Visa mer') + ' ►',
            icon: logo
        });
        //720p
        page.appendItem("", "separator", {
            title: new showtime.RichText('720p')
        });
        v = showtime.httpReq(BASE_URL + '/hd/720p/').toString();
        m = re.execAll(v);
        for (i = 0; i < 7; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][4], "video", {
                title: new showtime.RichText(trim(showtime.entityDecode(m[i][1]))),
                genre: new showtime.RichText(trim(m[i][2])),
                description: new showtime.RichText(trim(m[i][3])),
                icon: m[i][5].indexOf('http') !== -1 ? m[i][5] : (BASE_URL + "/" + m[i][5]),
                year: +match(/(\d{4})/, m[i][1], 1)
            });
        }
        page.appendItem(PREFIX + ":index:" + '/hd/720p/', "directory", {
            title: ('Visa mer') + ' ►',
            icon: logo
        });
        page.type = "directory";
        // page.contents = "items";
        page.loading = false;
    });
    //Second level 
    plugin.addURI(PREFIX + ":index:(.*)", function(page, link) {
        var re, v, m;
        // page.contents = "items";
        page.type = "directory";
        page.metadata.logo = plugin.path + "logo.png";
        //v = showtime.httpReq(BASE_URL + link).toString();
        //re = /<title>(.*?)<\/title>/;
        //m = re.exec(v);
        //page.metadata.title = new showtime.RichText(PREFIX + ' | ' + (m[1].replace('Смотреть ', '').replace(' в 720p hd', '.')));
        //page.appendItem(PREFIX + ':select:' + link, 'directory', {
        //    title: new showtime.RichText('сортировка по : ' + (m[1].replace('Смотреть ', '').replace(' в 720p hd', '.')))
        //});
        var offset = 0;

        function loader() {
            if (link.indexOf('hd/720p') !== -1) {
                v = showtime.httpReq(BASE_URL + link + '?page=' + offset).toString();
                p(BASE_URL + link + '?page=' + offset);
            } else {
                v = showtime.httpReq(BASE_URL + link + 'main/?page=' + offset).toString();
                p(BASE_URL + link + '?page=' + offset);
            }
            var has_nextpage = false;
            var m = v.match(/class='btn'>N.*sta<\/a>/);
            p(offset + '#####' + has_nextpage + m);
            if (m) has_nextpage = true;
            re = /<div class='movie_container'>[\s\S]+?>(.+?)<[\s\S]+?<small>(.+?)<\/small>[\s\S]+?>([^<]+)[\s\S]+?href="http:\/\/dreamfilm.se([^"]+)[\s\S]+?img src="([^"]+)/g;
            m = re.execAll(v);
            for (var i = 0; i < m.length; i++) {
                page.appendItem(PREFIX + ":page:" + m[i][4], "video", {
                    title: new showtime.RichText(trim(showtime.entityDecode(m[i][1]))),
                    genre: new showtime.RichText(trim(m[i][2])),
                    description: new showtime.RichText(trim(m[i][3])),
                    icon: m[i][5].indexOf('http') !== -1 ? m[i][5] : (BASE_URL + "/" + m[i][5]),
                    year: +match(/(\d{4})/, m[i][1], 1)
                });
            }
            offset++;
            return has_nextpage;
            // return offset < parseInt(/<div class="navigation[\S\s]+?nav_ext[\S\s]+?">([^<]+)/.exec(v)[1], 10)
        }
        if (loader()) page.paginator = loader;
        page.loading = false;
    });
    //Third Level
    plugin.addURI(PREFIX + ":page:(.*)", function(page, link) {
        page.type = "directory";
        // page.contents = "items";
        page.loading = false;
        var i, v, item, re, re2, m, m2, data = {};
        p(BASE_URL + link);
        v = showtime.httpReq(BASE_URL + link).toString();
        try {
            var md = {};
            md.title = showtime.entityDecode(trim(match(/<div class="pull-left"><h4 style='margin-bottom: -10px;'>([^(]+)/, v, 1)));
            md.year = +match(/<div class="pull-left"><h4 style='margin-bottom: -10px;'>.*(\d{4})/, v, 1);
            page.metadata.title = md.title + ' (' + md.year + ')';
            //Трейлер:
            page.appendItem("", "separator", {
                title: new showtime.RichText('Trailer:')
            });
            page.appendItem("youtube:feed:" + escape("https://gdata.youtube.com/feeds/api/videos?q=" + encodeURIComponent('Trailer ' + md.title)), "directory", {
                title: 'Trailer on YouTube'
            });
            //serials
            //var eplist = match(/<ul id="episodes-list-(.+?)" class="b-episodes([\S\s]+?)ul>/, v, 1);
            var eplist = match(/<div class='class tab-pane.*season_([^']+)([\S\s]+?)<\/table>/, v, 1);
            if (eplist) {
                // if (link.indexOf('/series/') != -1) {
                md.title = showtime.entityDecode(trim(match(/<h4 style='margin-bottom: 0px;'>(.+)</, v, 1)));
                page.metadata.title = md.title;
                re = /<div class='class tab-pane.*season_([^']+)([\S\s]+?)<\/table>/g;
                m = re.execAll(v);
                for (i = 0; i < m.length; i++) {
                    page.appendItem("", "separator", {
                        title: new showtime.RichText('Säsong ' + m[i][1])
                    });
                    m2 = /rel="(.*)" class='showmovie epSelect.*<\/i>Avsnitt (.*)<\/a>/g.execAll(m[i][2]);
                    for (var j = 0; j < m2.length; j++) {
                        data.id = m2[j][1];
                        data.title = md.title;
                        data.season = m[i][1];
                        data.episode = m2[j][2];
                        item = page.appendItem(PREFIX + ":play:" + escape(showtime.JSONEncode(data)), "video", {
                            title: new showtime.RichText('Avsnitt ' + m2[j][2])
                        });

                            item.bindVideoMetadata({
                                title: data.title.trim(),
                                season: +data.season,
                                episode: +data.episode
                            });

                    }
                }
            } else
            //films
            if (link.indexOf('/movies/') != -1) {
                page.appendItem("", "separator", {
                    title: new showtime.RichText('Film:')
                });
                re = /(?:src='http:\/\/vk.com\/)([^']+)/g;
                m = re.execAll(v);
                if (m.toString()) {
                    for (i = 0; i < m.length; i++) {
                        data.title = md.title;
                        data.year = +md.year
                        data.vk = m[i][1]
                        item = page.appendItem(PREFIX + ":play:" + escape(showtime.JSONEncode(data)), "video", {
                            title: data.title,
                            year: data.year
                        });
                        item.bindVideoMetadata({
                            title: data.title,
                            year: data.year
                        });
                    }
                }
            }
        } catch (ex) {
            page.error("Failed to process page");
            e(ex);
        }
    });
    // Play links
    plugin.addURI(PREFIX + ":play:(.*)", function(page, data) {
        var canonicalUrl = PREFIX + ":play:" + (data);
        data = showtime.JSONDecode(unescape(data));
        var video = get_video_link(data);
        page.type = "video";
        page.source = "videoparams:" + showtime.JSONEncode({
            //subscan
            title: data.title,
            //imdbid: imdbid ? imdbid : '<unknown>',
            year: data.year ? data.year : 0,
            season: data.season ? data.season : -1,
            episode: data.episode ? data.episode : -1,
            no_fs_scan: true,
            canonicalUrl: canonicalUrl,
            sources: [{
                url: video
            }]
        });
        //} else {
        //    showtime.notify(video, 3);
        //    // showtime.message(video+"\n"+ "Go Back",1,0)
        //}
        page.metadata.logo = logo;
        page.loading = false;
    });
    plugin.addSearcher(PREFIX + " - Videos", plugin.path + "logo.png", function(page, query) {
        var v, re, m, i;
        try {
            showtime.trace("Search dreamfilm for: " + query);
            //http://dreamfilm.se/search/?q=lost
            v = showtime.httpReq(BASE_URL+'/search/', {
                debug: true,
                args: {
                    q: query
                    //q: encodeURIComponent(showtime.entityDecode(query))
                }
            }).toString();

            p()
            re = /href="http:\/\/dreamfilm.se([^"]+)[\s\S]+?img src="([^"]+)[\s\S]+?<h4>(.+)<\/h4>[\s\S]+?(.*)</g;
            m = re.execAll(v.match(/<ul class='autoComplete'>[\s\S]+<\/ul/));
            for (i = 0; i < m.length; i++) {
                page.appendItem(PREFIX + ":page:" + m[i][1], "video", {
                    title: new showtime.RichText(m[i][3].trim()),
                    description: new showtime.RichText(m[i][4].trim()),
                    icon: m[i][2].indexOf('http://') !== -1 ? m[i][2] : (BASE_URL + "/" + m[i][2])
                    //year: +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][4], 1)
                });
                page.entries = i;
            }
        } catch (err) {
            showtime.trace('dreamfilm - Ошибка поиска: ' + err);
            e(err);
        }
    });

    function get_video_link(data) {
        var JSON, v, result_url;
        try {
            if (data.id) {
                data.vk = showtime.httpReq(BASE_URL + '/CMS/modules/series/ajax.php', {
                    postdata: {
                        action: 'showmovie',
                        id: data.id
                    }
                }).toString();
                data.vk = (/(?:src='http:\/\/vk.com\/)([^']+)/.exec(data.vk)[1]);
            }
            result_url = 'http://vk.com/' + data.vk;
            showtime.trace('php Link for page: ' + result_url);
            v = showtime.httpGet(result_url).toString();
            JSON = (/var vars = (.+)/.exec(v)[1]);
            JSON = showtime.JSONDecode(JSON);
            if (JSON.no_flv == 1) {
                switch (Math.round(JSON.hd)) {
                case 0:
                    result_url = JSON.url240;
                    break;
                case 1:
                    result_url = JSON.url360;
                    break;
                case 2:
                    result_url = JSON.url480;
                    break;
                case 3:
                    result_url = JSON.url720;
                    break;
                }
            }
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

    function match(re, st, i) {
        i = typeof i !== 'undefined' ? i : 0;
        if (re.exec(st.toString())) {
            return re.exec(st)[i];
        } else return '';
    }

    function trim(s) {
        s = s.toString();
        s = s.replace(/\t/g, " ");
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
    const blue = "6699CC", orange = "FFA500";

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
        if (typeof(message) === 'object') message = showtime.JSONEncode(message);
        showtime.print(message);
    }

    function trace(msg) {
        if (service.debug == '1') {
            t(msg);
            p(msg);
        }
    }
})(this);