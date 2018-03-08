require([
    'dojo/parser',
    'esri/map',
    'y2k/Census',
    'dijit/layout/ContentPane',
    'dijit/layout/BorderContainer',
    'dijit/form/Button',
    'dojo/_base/lang',
    'dijit/registry',
    'dojo/domReady!',
], function(
    parser, Map, Census, ContentPane, Bordercontainer, Button, lang, registry
) {
    parser.parse();

    var map = new Map("map", {
        basemap: "national-geographic",
        center: [-95, 45],
        zoom:3
    });

    var census = new Census({
        map: map,
        mapService:
        'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/'
    }, 'census-widget');

    var censusBtn = registry.byId('census-btn');

    censusBtn.on('click', lang.hitch(census, census.show));
});