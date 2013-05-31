$(function() {
    
    var proj_stereo = new OpenLayers.Projection("EPSG:3031");
    var map = new OpenLayers.Map("map", {
        div: "map",
        maxExtent: new OpenLayers.Bounds(-3250000,-3250000,3250000,3250000),
        maxResolution: 13000,
        units: 'meters',
        projection: "EPSG:3031"
    });
    map.addControl(new OpenLayers.Control.LayerSwitcher());

    window.map = map;

    var lima_layer = new OpenLayers.Layer.WMS("lima", 
        "http://172.16.1.100:8080/service", {
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

    map.zoomToExtent(map.getMaxExtent());

//     var bounds = new OpenLayers.Bounds();
//     bounds.extend(3250000,-3250000);
//     bounds.extend(3250000,3250000);
// //    bounds.extend(new OpenLayers.LonLat(-12367387.9301062, -12367395.2885885));
// //    bounds.extend(new OpenLayers.LonLat(12367394.4707058, 12367392.0189054));
//     map.zoomToExtent(bounds);

});
