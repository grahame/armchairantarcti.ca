$(function() {
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

    window.map = map;
    window.proj_wgs84 = proj_wgs84;
    window.proj_stereo = proj_stereo;

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

    make_imos_layer("Seal tracking", "imos:ctd_profile_mdb_workflow_vw_recent");


    var geojson_format = new OpenLayers.Format.GeoJSON();
    var vector_layer = new OpenLayers.Layer.Vector("countries", {
        projection: proj_stereo,
        preFeatureInsert: function(feature) {
            var style = {
                strokeColor: "#00FF00",
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

    map.setCenter(new OpenLayers.LonLat(357500, 58500), 1);
});
