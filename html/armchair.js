$(function() {
    /* stereographic projection we're using; openlayers doesn't know about this by default */
    Proj4js.defs["EPSG:3031"] = "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
    var proj_wgs84 = new OpenLayers.Projection("EPSG:4326");
    var proj_stereo = new OpenLayers.Projection("EPSG:3031");
    var map = new OpenLayers.Map("map", {
        div: "map",
        maxExtent: new OpenLayers.Bounds(-104000000,-104000000,104000000,104000000),
        maxResolution: 13000,
        units: 'meters',
        projection: "EPSG:3031"
    });
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    /* for debugging, get rid of later */
    window.map = map;
    window.proj_wgs84 = proj_wgs84;
    window.proj_stereo = proj_stereo;

    var add_lima_layer = function() {
        var lima_layer = new OpenLayers.Layer.WMS("lima", 
            "http://armchairantarcti.ca/mapproxy/service", {
                layers: "MOA_125_HP1_150_170_STRETCH",
                srs: "EPSG:3031",
                transparent: false
            }, {
                isBaseLayer: true,
                format: 'jpeg',
                opacity: 1.,
                visibility: true,
                SRS: "EPSG:3031",
                projection: proj_stereo
            });
        map.addLayer(lima_layer);
    };

    var make_imos_layer = function(name, layer_name) {
        var seal_layer = new OpenLayers.Layer.WMS(name, 
            "http://geoserver.imos.org.au/geoserver/wms", {
                layers: layer_name,
                srs: "EPSG:3031",
                transparent: true
            }, {
                isBaseLayer: false,
                format: 'png',
                opacity: 1.,
                visibility: true,
                SRS: "EPSG:3031",
                projection: proj_stereo
            });
        map.addLayer(seal_layer);
    };

    /*
     * GeoJSON layer with country outlines
     */
    var add_world_layer = function() {
        var geojson_format = new OpenLayers.Format.GeoJSON();
        var vector_layer = new OpenLayers.Layer.Vector("countries", {
            projection: proj_stereo,
            preFeatureInsert: function(feature) {
                var style = {
                    strokeColor: "#F9B009",
                    strokeWidth: 3,
                    pointRadius: 6,
                    pointerEvents: "visiblePainted",
                    title: feature.attributes.name
                };
                feature.geometry.transform(proj_wgs84, proj_stereo);
                feature.style = style;
            }
        }); 
        var features = geojson_format.read(window.countries_json);
        vector_layer.addFeatures(features);
        map.addLayer(vector_layer);
    }

    var add_points = function() {
        var our_icons = {};
        var icon_size = new OpenLayers.Size(32,32);
        var icon_offset = new OpenLayers.Pixel(-(icon_size.w/2), -icon_size.h);

        var icon_url = function(nm) {
            return 'icons/'+nm;
        };
        var make_or_get_icon = function(nm) {
            if (1||!our_icons[nm]) {
                var url = icon_url(nm);
                our_icons[nm] = new OpenLayers.Icon(url, icon_size, icon_offset);
            }
            return our_icons[nm].clone();
        };

        var infobar_set = false;
        var infobar_feed = [];
        var infobar_idx = 0;
        var set_infobar = function(elem) {
            $("#infobar").empty();
            $("#infobar").append(elem);
            infobar_set = true;
        };
        var clear_infobar = function() {
            $("#infobar").empty();
            infobar_set = false;
            swap_tweetfeed();
        };
        var swap_tweetfeed = function() {
            if (infobar_feed.length == 0) {
                return;
            }
            if (infobar_idx > infobar_feed.length - 1) {
                infobar_idx = 0;
            }
            $("#infobar").empty();
            $("#infobar").append(infobar_feed[infobar_idx]);
            infobar_idx = infobar_idx + 1;
        };
        setInterval(swap_tweetfeed, 5000);
        var add_infobar_tweetfeed = function(username) {
            $.getJSON("https://api.twitter.com/1/statuses/user_timeline/" + username + ".json?count=1&include_rts=1&callback=?",
                function(data) {
                    var span = $("<span/>");
                    var text = "@"+username + " - " + data[0].text;
                    if (text.length > 80) {
                        text = text.substr(0, 79);
                        text += "...";
                    }
                    span.append($("<img/>").attr('height', '32').attr('width', '32').attr('src', 'twitter-bird-dark-bgs.png'));
                    span.append($("<a/>").attr('target', '_blank').attr('href', 'http://twitter.com/' + username + '/status/' + data[0].id_str).text(text));
                    infobar_feed.push(span);
                });
        };
        var station_label = function(station) {
            var label = station['label'];
            if (station['established']) {
                label += " (" + station['established'] + ")";
            }
            if (station['jurisdiction']) {
                label += " - " + station['jurisdiction'];
            }
            return label;
        };
        var show_station_dialog = function(station) {
            $("#station-dialog-title").text(station_label(station));
            $("#station-dialog-flag").attr('src', station['logo']);
            var body = $("#station-dialog-body");
            body.empty();
            if (station['url']) {
                var visit = $("<p/>");
                var a = $("<a/>").attr('href', station['url']).attr('target', '_blank');
                a.text("More about " + station['label'] + ".");
                visit.append(a);
                body.append(visit);

                if (station['twitter']) {
                    $.each(station['twitter'], function(k, v) {
                        var tweet = $("<p/>");
                        var a = $("<a/>").attr('href', v).text(v);
                        tweet.append(a);
                        body.append(tweet);
                    });
                }
            }
            $("#station-dialog").modal();
        };

        $.getJSON("/point_data.json", function(data) {
            var make_stations = function() {
                /* annotate the stations */
                var layer = new OpenLayers.Layer.Markers("Stations");
                map.addLayer(layer);
                var stations = data['stations'];
                $.each(stations, function(k, v) {
                    var ll = new OpenLayers.LonLat(v['lng'], v['lat']).transform(proj_wgs84, proj_stereo);
                    var icon = make_or_get_icon(v['icon']);
                    // icon.imageDiv.title = v['label'];

                    if (v['twitter']) {
                        $.each(v['twitter'], function(k, v) {
                            add_infobar_tweetfeed(v);
                        });
                    }

                    var marker = new OpenLayers.Marker(ll, icon);
                    layer.addMarker(marker);
                    marker.events.register('mouseover', marker, function(evt) {
                        var sp = $("<span/>");
                        sp.append($("<img/>").attr('src', v['logo']).css("padding-right", "1em"));
                        sp.append($("<span/>").text(station_label(v)));
                        set_infobar(sp);
                        // naff, fixme
                        marker.setUrl(icon_url('inverse-' + v['icon']));
                    });
                    marker.events.register('mouseout', marker, function(evt) {
                        clear_infobar();
                        marker.setUrl(icon_url(v['icon']));
                    });
                    marker.events.register('click', marker, function(evt) {
                        show_station_dialog(v);
                    });
                });
            };
            make_stations();
        });
    }

    /* main initialisation code */
    add_lima_layer();
    add_world_layer();
    add_points();

    make_imos_layer("Seal tracking", "imos:ctd_profile_mdb_workflow_vw_recent");
    map.setCenter(new OpenLayers.LonLat(357500, 58500), 0);
});
