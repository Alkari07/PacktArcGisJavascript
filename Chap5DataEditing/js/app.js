require([
    'dojo/parser',
    'esri/map',
    'esri/graphic',
    'esri/geometry/Extent',
    'esri/dijit/editing/Editor',
    'esri/dijit/editing/TemplatePicker',
    'esri/tasks/query',
    'dijit/layout/BorderContainer', 
    'dijit/layout/ContentPane',
    'esri/layers/FeatureLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/symbols/SimpleMarkerSymbol',
    'dojo/domReady!'
], function(
    parser, Map, Graphic, Extent, Editor, TemplatePicker, Query, BorderContainer, ContentPane,
    FeatureLayer, ArcGISDynamicMapServiceLayer, MarkerSymbol
) {
    var maxExtent = new Extent({
        'xmin' : -13519092.335425414,
        'ymin' : 4413224.664902497,
        'xmax': -13507741.43672508,
        'ymax': 4421766.502813354,
        'spatialReference': {
            'wkid' : 102100
        }
    });
    var map, selected, updateFeature, attInspector, incidentLayer, visibleIncidentLayer;

    parser.parse();
    map = new Map("map", {
        basemap: 'osm',
        extent: maxExtent
    });

    incidentLayer = new FeatureLayer('http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/SanFrancisco/311Incidents/FeatureServer/0',
    {
        mode: FeatureLayer.MODE_SELECTION,
        outFields: ['req_type', 'req_date', 'req_time', 'address', 'district', 'status'],
        id: 'incidentLayer'
    });

    visibleIncidentLayer = new ArcGISDynamicMapServiceLayer('http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/SanFrancisco/311Incidents/MapServer');

    map.addLayers([visibleIncidentLayer, incidentLayer]);
});