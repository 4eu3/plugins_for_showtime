/*
 *  iLive  - Showtime Plugin
 *
 *  Copyright (C) 2013 Buksa
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
//ver 0.4
(function(plugin) {
    var plugin_info = plugin.getDescriptor();
    var PREFIX = plugin_info.id;
    // bazovyj adress saita
    var BASE_URL = 'http://www.ilive.to/';
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
    var service = plugin.createService(plugin_info.title, PREFIX + ":index:channels", "video", true, logo);
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
    //First level start page
    plugin.addURI(PREFIX + ":start", function(page) {
        page.metadata.logo = plugin.path + "logo.png";
        page.metadata.title = PREFIX;
        if (!service.tosaccepted) if (showtime.message(tos, true, true)) service.tosaccepted = 1;
        else page.error("TOS not accepted. plugin disabled");
        var v = showtime.httpReq(BASE_URL + 'channels/?sort=1').toString();
        var re = /data-lazy-src="(.+?)"[\s\S]+?href="(.+?)".+?>(.+?)</g;
        var m = re.execAll(v);
        var data = [];
        for (var i = 0; i < m.length; i++) {
            data.push([{
                title: m[i][1],
                href: m[i][2]
            }]);
            page.appendItem(PREFIX + ":page:" + m[i][3] + ":" + escape(m[i][2]), "video", {
                title: new showtime.RichText(m[i][3]),
                description: new showtime.RichText(m[i][3] + '\n' + "Updated: "),
                icon: m[i][1]
            });
        }
        //p(data);
        //p(showtime.httpReq('http://www.iguide.to/serverfile.php?id='+new Date().getTime(),{debug: true, noFollow: 1}).toString())
        page.type = "directory";
        page.contents = "items";
        page.loading = false;
    });
    plugin.addURI(PREFIX + ":sort:(.*)", function(page, link) {
        page.metadata.logo = plugin.path + "logo.png";
        page.metadata.title = link;
        var v, url, re, re2, m, m2;
        v = showtime.httpReq(BASE_URL + 'channels/?sort=1').toString();
        re = /name="(.+?)".*channels\/.*(\?sort=.+?)'([\s\S]+?)<\/se/g;
        re2 = /<option value="(.*?)".*?>(.+?)<\/option>/g;
        m = re.execAll(v);
        for (var i = 0; i < m.length; i++) {
            page.appendItem("", "separator", {
                title: new showtime.RichText(m[i][1])
            });
            m2 = re2.execAll(m[i][3].trim());
            for (var j = 0; j < m2.length; j++) {
                if (m[i][1] == 'category') {
                    page.appendItem(PREFIX + ":index:" + 'channels/' + m2[j][1], "video", {
                        title: new showtime.RichText(m2[j][1] + ' | ' + m2[j][2])
                    });
                }
                if (m[i][1] == 'language') {
                    url = addParameter(link, 'lang', m2[j][1]);
                    page.appendItem(PREFIX + ":index:" + url, "video", {
                        title: new showtime.RichText(m2[j][1] + ' | ' + m2[j][2])
                    });
                    //page.appendItem(PREFIX + ":index:" + link+'?lang='+m2[j][1], "video", {
                    //    title: new showtime.RichText(m2[j][1] + ' | ' + m2[j][2])
                    //});
                }
                if (m[i][1] == 'sort') {
                    url = (addParameter(link, 'sort', m2[j][1]));
                    page.appendItem(PREFIX + ":index:" + url, "video", {
                        title: new showtime.RichText(m2[j][1] + ' | ' + m2[j][2])
                    });
                }
            }
        }
        page.type = "directory";
        page.contents = "items";
        page.loading = false;
    });
    //addParameter('http://www.ilive.to/channels/', 'sort', this.options[this.selectedIndex].value)">

    function addParameter(url, param, value) {
        var val = new RegExp('(\\?|\\&)' + param + '=.*?(?=(;|&|$))'),
            qstring = /\?.+$/;
        if (val.test(url) && value !== '') {
            return url.replace(val, '$1' + param + '=' + value);
        } else if (qstring.test(url) && value !== '') {
            return url + '&' + param + '=' + value;
        } else {
            if (value !== '') return url + '?' + param + '=' + value;
            return url;
        }
    }
    //Second level 
    plugin.addURI(PREFIX + ":index:(.*)", function(page, link) {
        var re, v, m;
        var res = getUrlArgs(link);
        p(res);
        page.contents = "items";
        page.type = "directory";
        page.metadata.logo = plugin.path + "logo.png";
        v = showtime.httpReq(BASE_URL + link, {
            debug: 1
        }).toString();
        //p(v)
        page.metadata.title = new showtime.RichText(PREFIX + ' | ' + (/<title>(.*?)<\/title>/.exec(v)[1]));
        re = /<title>(.*?)<\/title>/;
        m = re.exec(v);
        page.appendItem(PREFIX + ':sort:' + link, 'directory', {
            title: new showtime.RichText('сортировка по : ' + link)
        });
        var offset = 1;
        var total_page = parseInt(match(/class="pages".+">(.+?)</, v, 1), 10);

        function loader() {
            res.args.p = offset;
            var v = showtime.httpReq(BASE_URL + res.url, {
                debug: 1,
                args: res.args
            });
            re = /data-lazy-src="(.+?)"[\s\S]+?href="(.+?)".+?>(.+?)</g;
            m = re.execAll(v);
            for (var i = 0; i < m.length; i++) {
                page.appendItem(PREFIX + ":play:" + escape(m[i][2]) + ":" + m[i][3], "video", {
                    title: new showtime.RichText(m[i][3]),
                    description: new showtime.RichText(m[i][3]),
                    icon: m[i][1]
                });
            }
            offset++;
            return offset < total_page;
        }
        if (total_page) loader();
        page.loading = false;
        page.paginator = loader;
    });
    // Play links
    plugin.addURI(PREFIX + ":play:(.*):(.*)", function(page, url, title) {
        //        //rtmp://ny.iguide.to/edge playpath=aam1zoddl477ym5 swfUrl=http://player.ilive.to/player_ilive_2.swf token=UYDk93k#09sdafjJDHJKAD873 live=1 pageUrl=http://www.ilive.to/view/52560/watch-live-PBS-streaming-channel-for-free
        var video = get_video_link(url);
        page.type = "video";
        page.source = "videoparams:" + showtime.JSONEncode({
            //subscan
            title: unescape(title),
            no_fs_scan: true,
            canonicalUrl: PREFIX + ":play:" + url + ":" + title,
            sources: [{
                url: video
            }]
        });
        showtime.notify(video, 3);
        page.metadata.logo = logo;
        page.loading = false;
    });

    function get_video_link(url) {
        var result_url = unescape(url);
        try {
            showtime.trace('php Link for page: ' + result_url);
            //var token = (showtime.httpReq('http://www.ilive.to/server/server.php?id='+new Date().getTime(),{debug: true, noFollow: 1,headers: {
            //    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:22.0) Gecko/20100101 Firefox/22.0',
            //    Referer :'http://www.ilive.to/view/52560/watch-live-PBS-streaming-channel-for-free'
            //}}).toString())
            var v = showtime.httpGet(result_url).toString();
            //p(v)
            //var token = (/getJSON\("(.+?)"/.exec(v)[1])
            //var JSON = showtime.JSONDecode(showtime.httpReq(token+'&_='+new Date().getTime(),{debug: true, noFollow: 1,headers: {
            //    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:22.0) Gecko/20100101 Firefox/22.0',
            //    Referer : result_url
            //}}).toString())
            var JSON = showtime.JSONDecode(showtime.httpReq('http://www.ilive.to/server.php?id=1', {
                debug: true,
                noFollow: 1,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:22.0) Gecko/20100101 Firefox/22.0',
                    Referer: result_url
                }
            }).toString());
            //p(JSON)
            //         token = JSON.token
            var stream = (/flashplayer: "(.+?)"[\s\S]+?streamer: "(.+?)"[\s\S]+?file: "(.+?)\./.exec(v));
            //rtmp://ny.iguide.to/edge playpath=aam1zoddl477ym5 swfUrl=http://player.ilive.to/player_ilive_2.swf token=UYDk93k#09sdafjJDHJKAD873 live=1 pageUrl=http://www.ilive.to/view/52560/watch-live-PBS-streaming-channel-for-free
            result_url = stream[2] + ' playpath=' + stream[3] + ' swfUrl=' + stream[1] + ' token=' + JSON.token + ' swfVfy=1 live=1' + ' pageUrl=' + unescape(url) + ' timeout=15';
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

    function getUrlArgs(url) {
        //facanferf's function mod
        //split url for url and query args
        var link = url;
        var result = {
            url: link,
            args: {}
        };
        var args = {};
        if (link.indexOf('?') != -1) {
            args = showtime.queryStringSplit(url.slice(url.indexOf('?') + 1));
            link = link.slice(0, link.indexOf('?'));
        }
        result.url = link;
        result.args = args;
        showtime.trace("getUrlArgs: Result " + showtime.JSONEncode(result));
        showtime.print("getUrlArgs: Result " + showtime.JSONEncode(result));
        return result;
    }
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
        if (re.exec(st)) {
            return re.exec(st)[i];
        } else return false;
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