$(function() {
    
    var proj_stereo = new OpenLayers.Projection("EPSG:3031");
    var map = new OpenLayers.Map("map", {
        div: "map",
        maxExtent: new OpenLayers.Bounds(-26000000,-26000000,26000000,26000000),
        maxResolution: 13000,
        units: 'meters',
        projection: "EPSG:3031"
    });
    map.addControl(new OpenLayers.Control.LayerSwitcher());

    window.map = map;

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

    var seal_layer = new OpenLayers.Layer.WMS("seals", 
        "http://geoserver.imos.org.au/geoserver/wms", {
            layers: "imos:ctd_profile_mdb_workflow_vw_recent",
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

    // var countries = new OpenLayers.Layer.WMS('Country Boundaries',
    //     'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/geolinks', {
    //         layers: 'world_countries',
    //         transparent: 'true',
    //         srs: "EPSG:3031"
    //     }, {
    //         SRS: "EPSG:3031"
    //     });
    // map.addLayer(countries);

    map.setCenter(new OpenLayers.LonLat(357500, 58500), 1);

});
