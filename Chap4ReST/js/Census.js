define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_OnDijitClickMixin',
    'dojo/text!http://localhost:8080/js/templates/Census.html',
    'dojo/dom-style',
    'dojo/dom',
    'esri/tasks/IdentifyTask',
    'dojo/on', 
    'dojo/_base/lang',
    'esri/tasks/IdentifyParameters',
    'dojo/_base/array',
    'esri/InfoTemplate',
    'dojo/text!http://localhost:8080/js/templates/StateCensus.html',
    'dojo/text!http://localhost:8080/js/templates/CountyCensus.html',
    'dojo/text!http://localhost:8080/js/templates/BlockGroupCensus.html',
    'dojo/text!http://localhost:8080/js/templates/BlockCensus.html',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleFillSymbol'],
    function (declare, _WidgetBase, _TemplatedMixin, _OnDijitClickMixin, censusTemplate, domStyle,
        dom, IdentifyTask, dojoOn, lang, IdentifyParameters,
        arrayUtils, InfoTemplate, StateTemplate, CountyTemplate, BlockGroupTemplate, BlockTemplate,
        MarkerSymbol, FillSymbol) {
        return declare ([_WidgetBase, _TemplatedMixin, _OnDijitClickMixin], {
            templateString: censusTemplate,
            baseClass: 'y2k-census',
            show: function() {
                
                domStyle.set(this.domNode, 'display', 'block');
                this._mapClickHandler = this.map.on('click', lang.hitch(this, this._onMapClick));
            },
            hide: function() {
                domStyle.set(this.domNode, 'display', 'none');
                if (this._mapClickHandler && this._mapClickHandler.remove) {
                    this._mapClickHandler.remove();
                }
            },
            constructor: function(options, srcRefNode) {
                if (typeof srcRefNode ==="string") {
                    srcRefNode = dom.byId(srcRefNode);
                }
                this.identifyTask = new IdentifyTask(options.mapService);
                this.map = options.map || null;
                this.domNode = srcRefNode;

                if (this.map.loaded) {
                    this._onMapLoad();
                } else {
                    this.map.on('load', lang.hitch(this, this._onMapLoad));
                }
            },
            _onMapLoad: function() {
                //chage the infoWindow symbol
                this.map.infoWindow.markerSymbol = new MarkerSymbol({
                    style: 'esriSMSDiamond',
                    color: [255, 200,30],
                    size: 12,
                    outline: {
                        width: 1,
                        color: [111, 98, 34]
                    }
                });
                this.map.infoWindow.fillSymbol = new fillSymbol({
                    style: 'esriSFSSolid',
                    color: [255, 250, 169, 128],
                    outline: {
                        width: 2,
                        color: [111, 98, 34]
                    }
                });
            },
            _onMapClick: function(event) {
                var params = new IdentifyParameters();
                var defResults;

                //the map is now a property of the class instance, and so needs to be referenced by this
                params.geometry = event.mapPoint;
                params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                params.mapExtent = this.map.extent;
                params.returnGeometry = true;
                params.width = this.map.width;
                params.height = this.map.height;
                params.spatialReference= this.map.spatialReference;
                params.tolerance = 3;

                this.map.graphics.clear();
                defResults = this.identifyTask.execute(params).addCallback(
                    lang.hitch(this, this._onIdentifyComplete)
                );
                this.map.infoWindow.setFeatures([defResults]);
                this.map.infoWindow.show(event.mapPoint);
            },
            _onIdentifyComplete: function (results) {
                return arrayUtils.map(results, function(result) {
                    var feature = result.feature;
                    var title = result.layerName;
                    var content;
                    
                    switch(title) {
                        case "Census Block Points":
                            content = BlockTemplate;
                            break;
                        // case "Census Block Group":
                        //     content = BlockGroupTemplate;
                        //     break;
                        // case "Detailed Counties":
                        //     content = CountryTemplate;
                        //     break;
                        // case "states":
                        //     content = StateTemplate;
                        //     break;
                        default:
                            content = "${*}";
                    }

                    feature.infoTemplate = new InfoTemplate(title, content);
                    return feature;
                });
            }
        });
    }
);