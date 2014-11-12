/*
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
//ver 1.1
(function(plugin) {
    var plugin_info = plugin.getDescriptor();
    var PREFIX = plugin_info.id;
    var logo = plugin.path + 'logo.png';
    // Register a service (will appear on home page)
    var service = plugin.createService(plugin_info.title, PREFIX + ":start", "video", true, logo);
    //settings
    var settings = plugin.createSettings(plugin_info.title, logo, plugin_info.synopsis);
    settings.createInfo("info", logo, "Plugin developed by " + plugin_info.author + ". \n");
    settings.createDivider('Settings:');

    settings.createBool("debug", "Debug", false, function(v) {
        service.debug = v;
    });

    settings.createString("M3u Playlist", "playlist Source", "http://api.torrent-tv.ru/k/wumGpQ39Ef/4", function(v) {
        service.pl = v;
    });

    //First level start page
    plugin.addURI(PREFIX + ":start", function(page) {
        page.metadata.logo = plugin.path + "logo.png";
        page.metadata.title = PREFIX;
        if (service.pl == '') {
            pl = showtime.textDialog('play list location: ', true, false);
            service.pl = pl.input
        }
        var respond = showtime.httpReq(service.pl, {
            debug: service.debug/*,
            method: 'GET',
            headers: {
                'User-Agent': USER_AGENT
            }*/
        }).toString();
        var re = /#EXTINF:.*,(.*?)[\r\n|\n](.*)/g
        var m = re.exec(respond);
        while (m) {
            page.appendItem(m[2].trim(), "video", {
                title: new showtime.RichText(m[1].trim())
            });
            m = re.exec(respond);
        }
        page.type = "directory";
        page.contents = "items";
        page.loading = false;
    });

    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
})(this);