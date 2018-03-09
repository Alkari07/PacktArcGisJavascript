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
    'esri/config',
    'esri/dijit/LocateButton',
    'dojo/dom-construct',
    'esri/dijit/AttributeInspector',
    'dijit/form/Button',
    'dojo/domReady!'
], function(
    parser, Map, Graphic, Extent, Editor, TemplatePicker, Query, BorderContainer, ContentPane,
    FeatureLayer, ArcGISDynamicMapServiceLayer, MarkerSymbol, config, LocateButton,
    domConstruct, AttributeInspector, Button
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
    var map, selected, updateFeature, attInspector, incidentLayer, visibleIncidentLayer, selected;

    parser.parse();
    map = new Map("map", {
        basemap: 'osm',
        extent: maxExtent
    });

    //et up a proxy for the feature layer
    esriConfig.defaults.io.proxyUrl = './proxy/proxy.ashx';
    incidentLayer = new FeatureLayer('http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/SanFrancisco/311Incidents/FeatureServer/0',
    {
        mode: FeatureLayer.MODE_SELECTION,
        outFields: ['req_type', 'req_date', 'req_time', 'address', 'district', 'status'],
        id: 'incidentLayer'
    });

    visibleIncidentLayer = new ArcGISDynamicMapServiceLayer('http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/SanFrancisco/311Incidents/MapServer');

    
    function generateAttributeInspector(layer) {
        var layerInfo = [{
            featureLayer: layer,
            showAttachments: true,
            isEditable: true,
        }];

        attInspector = new AttributeInspector({
            layerInfos: layerInfo
        }, domConstruct.create('div', null, document.body));
        attInspector.startup();
    
        //add a save button next to the delete button
        var saveButton = new Button({
            label: "Save", 
            class: "savebutton"
        });
        domConstruct.place(saveButton.domNode, attInspector.deleteBtn.domNode, 'after');
    
        saveButton.on('click', function() {
            updateFeature.getLayer().applyEdits(null, [updateFeature], null);
        });
    
        attInspector.on('attribute-change', function(evt) {
            //store the updates to apply when the save button is clicked
            updateFeature.attributes[evt.fieldname] = evt.fieldValue;
        });
    
        attInsspector.on('next', function(evt) {
            updateFeature = evt.feature;
            console.log("Next: " + updateFeature.attributes.objectid);
        });
    
        attInspector.on('delete', function(evt) {
            evt.feature.getLayer().applyEdits(null, null, [updateFeature]);
            map.infoWindow.hide();
        });
        if (attInspector.domNode) {
            map.infoWindow.setContent(attInspector.domNode);
            map.infoWindow.resize(350, 240);
        }
    }

    

    function showInspector(evt) {
        var selectQuery = new Query();
        var point = evt.mapPoint;
        var mapScale = mapgetScale();

        selectQuery.geometry = evt.mapPoint;

        incidentLayer.selectFeatures(selectQuery, FeatureLayer.SELECTION_NEW, function (features) {
            if (!features.length) {
                map.infoWindow.hide();
                return;
            }

            updateFeature = features[0];

            map.infoWindow.setTitle(updateFeature.getLayer().name);
            map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
        
        });
    }

    function generateTemplatePicker(layer) {
        console.log('layer', layer);
        var widget = new TemplatePicker({
            featureLayers: [layer],
            rows: layer.types.length,
            columns: 1,
            grouping: false,
            style: "width: 98%;"
        }, "editordiv");

        widget.startup();

        widget.on("selection-change", function() {
            selected=widget.getSelected();
            console.log("selected: ", selected);
        });
    }
    function startEditing() {
        //add locate button
        var locator = new LocateButton({map: map}, "locatebutton");
        var incidentLayer = map.getLayer('incidentLayer');
        generateTemplatePicker(incidentLayer);
        generateAttributeInspector(incidentLayer);
        //add map click event to create th new editable feature
        map.on('click', function(evt) {
            // if a feature template has been selected.
            if (selected) {
                var currentDate = new Date();
                var incidentAttributes = {
                    req_type: selected.template.name,
                    req_date: (currentDate.getMonth() + 1) + "/" + 
                        currentDate.getDate() + "/" + currentDate.getFullYear(),
                    req_time: currentDate.toLocaleTimeString,
                    address: "",
                    district: "",
                    status: 1
                };
                var incidentGraphic = new Graphic(evt.mapPoint, selected.symbol, incidentAttributes);
                incidentLayer.applyEdits([incidentGraphic,null,null]).then(function() {
                showInspector(evt);  
            });
            } else {
                showInspector(evt);
            }
        });

        incidentLayer.setSelectionSymbol(
            new MarkerSymbol({color: [255,0,0]})
        );

        map.infoWindow.on('hide', function() {
            incidentLayer.clearSelection();
        });

        incidentLayer.on('click', showInspector);

    }
    incidentLayer.on('edits-complete', function() {
        visibleIncidentLayer.refresh();
    });

    map.on('layers-add-result', startEditing);

    map.addLayers([visibleIncidentLayer, incidentLayer]);
});