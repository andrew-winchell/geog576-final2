require([
    //ArcGIS JS API
    "esri/config",
    "esri/Map",
    "esri/layers/GeoJSONLayer",
    "esri/views/MapView",
    "esri/views/draw/Draw",
    "esri/Graphic",
    "esri/geometry/geometryEngine",
    "esri/geometry/support/webMercatorUtils",
    //"esri/symbols/WebStyleSymbol",
    //"esri/smartMapping/renderers/location",

    //Widgets
    "esri/widgets/Home",
    "esri/widgets/Search",

    //Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    //Calcite Maps
    "calcite-maps/calcitemaps-v0.10",

    //Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",

    //Dojo
    "dojo/domReady!"

], function(esriConfig, Map, GeoJSONLayer, MapView, Draw, Graphic, geometryEngine, webMercatorUtils, Home, Search, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport){

    //esri agol api key
    esriConfig.apiKey = "AAPK81762376d6974634a978fa72c12fdfbdqcwchnbMurlNeJgk4ov0WxRZLEi9rayVxvBJeTGwyKw9Vy2_Azi6YAtY1QAlpkkm";

    //construct a new web map using basic topographic basemap
    //add weather event and facility layers by default
    const map = new Map({
        basemap: "topo-vector",
    });

    //construct new map view
    const view = new MapView({
        //placed in viewDiv html
        container: "viewDiv",
        //use the web map as the map for the view
        map: map,
        zoom: 4.5,
        center: [-100, 41]
    });

    // create a new instance of draw
    let draw = new Draw({
        view: view
    });
    view.ui.add("point-button", "top-left");
    $("#point-button").css("display", "none");
    view.ui.add("polygon-button", "top-left");
    $("#polygon-button").css("display", "none");

    $("#point-button").on("click", () => {
        enableInsertPoint(draw, view);
    })

    // Cancel drawing when user presses "ESC" key.
    $(document).keydown((k) => {
        if (k.keyCode == 27) {
            //cancel drawing point
            draw.reset();

            //remove any remaining graphics
            view.graphics.removeAll();

            //clear location geometry from forms
            $("#weather-loc").val("");
            $("#iwa-loc").val("");
        }
    });

    function enableInsertPoint(draw, view) {
        const action = draw.create("point");

        // PointDrawAction.cursor-update
        // Give a visual feedback to users as they move the pointer over the view
        action.on("cursor-update", (e) => {
            followPointGraphic(e.coordinates);
        });

        // PointDrawAction.draw-complete
        // Create a point when user clicks on the view or presses "C" key.
        action.on("draw-complete", (e) => {
            createPointGraphic(e.coordinates);
        });
    }

    function followPointGraphic(coordinates){
        view.graphics.removeAll();
        let point = {
            type: "point", // autocasts as /Point
            x: coordinates[0],
            y: coordinates[1],
            spatialReference: view.spatialReference
        };

        let graphic = new Graphic({
            geometry: point,
            symbol: {
                type: "picture-marker", // autocasts as SimpleMarkerSymbol
                url: "img/dmg_marker.png",
                width: "20px",
                height: "20px"
            }
        });
        view.graphics.add(graphic);
    }

    function createPointGraphic(coordinates){
        view.graphics.removeAll();
        let point = {
            type: "point", // autocasts as /Point
            x: coordinates[0],
            y: coordinates[1],
            spatialReference: view.spatialReference
        };

        let graphic = new Graphic({
            geometry: point,
            symbol: {
                type: "picture-marker", // autocasts as SimpleMarkerSymbol
                url: "img/dmg_marker.png",
                width: "20px",
                height: "20px"
            }
        });
        view.graphics.add(graphic);
        console.log(graphic.geometry)

        addPointGeom(graphic.geometry.longitude, graphic.geometry.latitude);
    }

    function addPointGeom(x,y) {
        $("#weather-loc").val(x + ", " + y);
        $("#event-submit-btn").prop("disabled", false);
    }

    //When the polygon widget is clicked, call the polygon drawing function
    $("#polygon-button").on("click", () => {
        enableCreatePolygon(draw, view)
    });

    //Start listening for events to draw a polygon
    function enableCreatePolygon(draw, view) {
        //create a polygon drawing action
        const action = draw.create("polygon");
        //listen for the vertex-add action
        action.on("vertex-add", (e) => {
            drawPolygonGraphic(e.vertices)
        });
        //listen for the vertex-remove action
        action.on("vertex-remove", (e) => {
            drawPolygonGraphic(e.vertices)
        });
        //listen for the cursor-update action
        action.on("cursor-update", (e) => {
            drawPolygonGraphic(e.vertices)
        });
        //listen for the draw-complete action
        action.on("draw-complete", (e) => {
            completePolygonGraphic(e.vertices)
        });
    };

    //Update the polygon as drawing actions occur
    function drawPolygonGraphic(vertices) {
        view.graphics.removeAll();
        let polygon = {
            type: "polygon",
            rings: vertices,
            spatialReference: view.spatialReference
        };

        let graphic = new Graphic({
            geometry: polygon,
            symbol: {
                type: "simple-line",
                color: "red",
                width: 1.5
            }
        });
        view.graphics.add(graphic);
    }

    //Called when the polygon is finished being drawn
    function completePolygonGraphic(vertices) {
        let polygon = {
            type: "polygon",
            rings: vertices,
            spatialReference: view.spatialReference
        };

        let graphic = new Graphic({
            geometry: polygon,
            symbol: {
                type: "simple-line",
                color: "red",
                width: 1.5
            }
        });
        view.graphics.add(graphic);
        for (let i=0; i<graphic.geometry.rings.length; i++){
            for (let j=0; j<i<graphic.geometry.rings[i].length; j++) {
                console.log(graphic.geometry.rings[i][j])
            }
            //var geom = webMercatorUtils.xyToLngLat(graphic.geometry.rings[i])
            //console.log(graphic.geometry.rings[i][i])
            //console.log(graphic.geometry.rings)
        }
        addPolygonGeom(graphic.geometry.rings)
    }

    function addPolygonGeom(rings) {
        $("#iwa-loc").val(rings);
        $("#iwa-submit-btn").prop("disabled", false);
    }

    //on start-up, populate weather events dropdown
    $(document).ready(() => {
        populateDropdown("event");
        tabContentResize();
        getWeatherEvents();
    });

    //on window resize, call the function to resize the tab contents
    $(window).resize(function() {
        tabContentResize();
    });

    //update the size of the tab content to keep layout dynamic
    function tabContentResize() {
        //get height of tab panels
        let tabsHeight = $("#tool-tabs").css("height");
        //calculate height of tab panels and content
        let heightContent = "calc(100vh - 50px - " + tabsHeight + ")"
        let heightPane = "calc(100vh - 60px - " + tabsHeight + ")"
        //set heights of tab panels and content
        $("#tabContent").css("height", heightContent);
        $(".tab-pane").css("height", heightPane);
    }

    //switch the tab panel to the selected tab
    $('#tool-tabs a').on('click', function (e) {
        e.preventDefault()
        $(this).tab('show')
    });

    //listen for the selection on the weather event dropdown
    $("#weather-dropdown").on("calciteSelectChange", (e) => {
            //call the populateDropdown function with the iwa option
            populateDropdown("iwa", e.target.value);
            //send the selected weather event to the eventSelected function
            eventSelected(e.target.value);
            getWeatherEvents(e.target.value);
        }
    );

    //listen for the selection on the iwa dropdown
    $("#iwa-dropdown").on("calciteSelectChange", (e) => {
            //send the selected iwa to the iwaSelected function
            iwaSelected(e.target.value);
        }
    );

    //When called, populates the dropdown with default values and existing values from database
    function populateDropdown(dropdown, event) {
        //determine which dropdown to populate
        if (dropdown == "event") {
            //clear weather dropdown options except for the default
            $("#weather-dropdown calcite-option:not(:first)").remove();

            //query database for weather events
            let e = [];
            e.push({name: "tab_id", value: "1"})
            $.ajax({
                url: 'HttpServlet',
                type: 'POST',
                data: e,
                success: (events) => {
                    let evt = events.reverse();
                    for (const e in evt) {
                        $("#weather-default").after(
                            '<calcite-option>' + evt[e] + '</calcite-option>'
                        );
                    };

                    $("#weather-default").after(
                        '<calcite-option>New Event</calcite-option>'
                    );
                },
                error: (xhr, status, error) => {
                    alert("Status: " + status + "\nError: " + error);
                }
            });

        } else if (dropdown == "iwa") {
            //clear iwa dropdown options except for the default
            $("#iwa-dropdown calcite-option:not(:first)").remove();

            //query database for iwa's in the selected weather event
            let e = [];
            e.push({name: "tab_id", value: "3"})
            e.push({name: "event_name", value: event})
            $.ajax({
                url: 'HttpServlet',
                type: 'POST',
                data: e,
                success: (iwas) => {
                    iwas.reverse();
                    for (const i in iwas) {
                        $("#iwa-default").after(
                            '<calcite-option>' + iwas[i] + '</calcite-option>'
                        );
                    };
                    $("#iwa-default").after(
                        '<calcite-option>New IWA</calcite-option>'
                    );
                },
                error: (xhr, status, error) => {
                    alert("Status: " + status + "\nError: " + error);
                }
            });
        };
    }

    //control what happens depending on the selected event option
    function eventSelected(selection) {
        //New Event will prompt user to fill form for a new weather event
        if (selection == "New Event") {
            //show the weather form in the side panel and add point button to map widgets
            $("#weather-form").css("display", "block");
            $("#point-button").css("display", "flex");
            //make sure user is getting an empty form to fill
            clearForms("event");
        }
        //This is the default weather option
        else if (selection == "Select Weather Event") {
            //hide all forms and map widgets that may be visible
            $("#weather-form").css("display", "none");
            $("#iwa-form").css("display", "none");
            $("#point-button").css("display", "none");
            $("#polygon-button").css("display", "none");
            //make sure all forms are cleared of any information
            clearForms("event");
        }
        //This indicates that an existing weather event has been selected
        else {
            //make sure all forms are cleared of any information
            clearForms("event");
            //Enable Step 2. IWA tab
            $("#iwa-list-item").removeClass("disabled");
            //hide the point button as it will not be used passed Step 1. Weather Event
            $("#point-button").css("display", "none");
            //move to the 2. IWA tab
            $("#iwa-tab").tab("show");
            //add a header to the IWA panel indicating the selected weather event
            $("#iwa").prepend(
                "<p id='related-event'>Weather Event: " + selection + "</p>"
            );
            getIWAs(selection);
        };
    }

    function iwaSelected(selection) {
        if (selection == "New IWA") {
            $("#iwa-form").css("display", "block");
            //add the button for the polygon tool
            $("#polygon-button").css("display", "flex");
            clearForms("iwa");
        } else if (selection == "Select Watch Area") {
            $("#weather-form").css("display", "none");
            $("#iwa-form").css("display", "none");
            $("#polygon-button").css("display", "none");
            clearForms("iwa");
        } else {
            $("#report-list-item").removeClass("disabled");
            $("#report-tab").tab("show");
            $("#polygon-button").css("display", "none");
        }
    };

    function clearForms(form) {
        if (form == "event") {
            $("#weather-form").closest('form').find("input[type=text], textarea").val("");
            $("#weather-form").closest('form').find("input[type=date], textarea").val("");
            $("#disaster-type").val("");
            $("p").remove("#related-event");
        } else if (form == "iwa") {
            $("#iwa-form").closest('form').find("input[type=text], textarea").val("");
            $("#iwa-form").closest('form').find("input[type=date], textarea").val("");

        };
    }

    //listen for weather_event form submission
    $("#weather-form").on("submit", createWeatherEvent);

    function createWeatherEvent(evt) {
        //override the normal form action
        evt.preventDefault();

        //parse lat,long from the form
        let location = $("#weather-loc").val()

        //push values to data array
        let w = $("#weather-form").serializeArray();
        w.push({name: "weather-loc", value: location})
        w.push({name: "tab_id", value: "0"});
        $.ajax({
            url: 'HttpServlet',
            type: 'POST',
            data: w,
            success: () => {
                //remove any existing iwa drawings
                view.graphics.removeAll();
                clearForms("event");
            },
            error: (xhr, status, error) => {
                alert("Status: " + status + "\nError: " + error);
            }
        });
        populateDropdown("event");
    }
    //listen for weather_event form submission
    $("#iwa-form").on("submit", createIWA);

    function createIWA(evt) {
        //override the normal form action
        evt.preventDefault();

        //parse lat,long from the form
        let location = $("#iwa-loc").val().split(",");
        let locGeom = [];
        //join every coordinate pair
        for (let j=0; j<location.length; j++) {
            locGeom.push(location[j] + " " + location[(j+1)]);
            j++;
        }
        //add starting point at the end to close the polygon
        locGeom.push(location.slice(0,2).join(" "))
        let related_event = $("#weather-dropdown").val();

        //push values to data array
        let i = $("#iwa-form").serializeArray();
        i.push({name: "iwa-loc", value: locGeom})
        i.push({name: "tab_id", value: "2"});
        i.push({name: "related-event", value: related_event})
        $.ajax({
            url: 'HttpServlet',
            type: 'POST',
            data: i,
            success: () => {
                //remove any existing iwa drawings
                view.graphics.removeAll();
                //Reset form
                clearForms("iwa");
            },
            error: (xhr, status, error) => {
                console.log("js error")
                alert("Status: " + status + "\nError: " + error);
            }
        });
        populateDropdown("iwa", related_event);

        let iwa_val = i[5].value + "-" + i[0].value;
        $("#iwa_dropdown select").val(iwa_val).change();
    }

    function getFacilities() {
        let f = [{name: "tab_id", value: "4"}];
        f.push()
        $.ajax({
            url: 'HttpServlet',
            type: 'POST',
            data: f,
            success: (list) => {
                convertFacilityToGeoJSON(list);
            },
            error: (xhr, status, error) => {
                console.log("js error")
                alert("Status: " + status + "\nError: " + error);
            }
        });
    }

    function getWeatherEvents(event) {
        if (event == "New Event" || event == "Select Weather Event" || event == undefined){
            event = "1=1";
        } else {
            event = "system_name = '" + event + "'";
        }
        let we = [
            {name: "tab_id", value: "5"},
            {name: "event", value: event}];
        we.push()
        $.ajax({
            url: 'HttpServlet',
            type: 'POST',
            data: we,
            success: (list) => {
                convertEventsToGeoJSON(list);
            },
            error: (xhr, status, error) => {
                console.log("js error")
                alert("Status: " + status + "\nError: " + error);
            }
        });
    }

    function getIWAs(event) {
        event = "event_name='" + event + "'";
        let we = [
            {name: "tab_id", value: "6"},
            {name: "event", value: event}];
        we.push()
        $.ajax({
            url: 'HttpServlet',
            type: 'POST',
            data: we,
            success: (list) => {
                convertIWAsToGeoJSON(list);
            },
            error: (xhr, status, error) => {
                console.log("js error")
                alert("Status: " + status + "\nError: " + error);
            }
        });
    }

    function convertFacilityToGeoJSON(dataset) {
        const geojson = {
            type: "FeatureCollection",
            features: []
        }
        for (let i=0; i <dataset.length; i++) {
            const feature = {
                type: "Feature",
                id: i+1,
                geometry: {
                    type: "Point",
                    coordinates: [
                        dataset[i][0], dataset[i][1]
                    ]
                },
                properties: {
                    ARPT_ID: dataset[i][2],
                    ARPT_NAME: dataset[i][3],
                    CITY: dataset[i][4],
                    STATE_CODE: dataset[i][5],
                    COUNTY_NAME: dataset[i][6],
                    ELEVATION: dataset[i][7],
                    ARTCC: dataset[i][8],
                    SINGLE_ENG: dataset[i][9],
                    MULTI_ENG: dataset[i][10],
                    JET_ENG: dataset[i][11],
                    HELI: dataset[i][12],
                    MILITARY_ACFT: dataset[i][13],
                    COMMERCIAL_OPS: dataset[i][14],
                    LOCAL_OPS: dataset[i][15],
                    MILITARY_OPS: dataset[i][16]
                }
            }
            geojson.features.push(feature);
        }
        plotFeatures(geojson, "0");
    }

    function convertEventsToGeoJSON(dataset) {
        const geojson = {
            type: "FeatureCollection",
            features: []
        }
        for (let i=0; i <dataset.length; i++) {
            const feature = {
                type: "Feature",
                id: i+1,
                geometry: {
                    type: "Point",
                    coordinates: [
                        dataset[i][0], dataset[i][1]
                    ]
                },
                properties: {
                    SYSTEM_NAME: dataset[i][2],
                    EVENT_DATE: dataset[i][3],
                    TYPE: dataset[i][4],
                    SUBMITTER: dataset[i][4],
                }
            }
            geojson.features.push(feature);
        }
        plotFeatures(geojson, "1");
    }

    function convertIWAsToGeoJSON(dataset) {
        let rings = dataset[0][4].slice(9,-2).split(",");
        const geojson = {
            type: "FeatureCollection",
            features: []
        }
        for (let i=0; i <dataset.length; i++) {
            const feature = {
                type: "Feature",
                id: i+1,
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        rings
                    ]
                },
                properties: {
                    SYSTEM_NAME: dataset[i][2],
                    EVENT_DATE: dataset[i][3],
                    TYPE: dataset[i][4],
                    SUBMITTER: dataset[i][4],
                }
            }
            geojson.features.push(feature);
        }
        plotFeatures(geojson, "2");
    }

    function plotFeatures(template, layer) {
        if (layer == "0"){

            // create a new blob from geojson featurecollection
            const blob = new Blob([JSON.stringify(template)], {
                type: "application/json"
            });

            // URL reference to the blob
            const url = URL.createObjectURL(blob);

            const facilityLayer = new GeoJSONLayer({
                url: url
            });

            //symbol style for facility layer
            let facilitySymbol = {
                type: "simple-marker",
                color: "green",
                size: 5
            };

            //apply facilitySymbol style to facilityLayer
            facilityLayer.renderer = {
                type: "simple",
                symbol: facilitySymbol
            };

            map.add(facilityLayer);
        }
        else if (layer == "1"){
            //check if an existing events layer is already on the map
            for (let m=0; m<map.layers.items.length; m++) {
                //if yes, remove it
                if (map.layers.items[m].id == "events") {
                    map.remove(map.layers.items[m])
                }
            }

            // create a new blob from geojson featurecollection
            const blob = new Blob([JSON.stringify(template)], {
                type: "application/json"
            });

            // URL reference to the blob
            const url = URL.createObjectURL(blob);

            //apply facilitySymbol style to facilityLayer
            const eventRenderer = {
                type: "unique-value",
                defaultSymbol: {
                    type: "picture-marker",
                    url: "img/dmg_marker.png",
                    width: "20px",
                    height: "20px"
                },
                defaultLabel: "Other",
                field: "type",

                uniqueValueInfos: [
                    {
                        value: "blizzard",
                        symbol: {
                            type: "picture-marker",
                            url: "img/blizzard.png",
                            width: "20px",
                            height: "20px"
                        },
                        label: "Blizzard"
                    },
                    {
                        value: "earthquake",
                        symbol: {
                            type: "picture-marker",
                            url: "img/earthquake.png",
                            width: "20px",
                            height: "20px"
                        },
                        label: "Earthquake"
                    },
                    {
                        value: "flood",
                        symbol: {
                            type: "picture-marker",
                            url: "img/flood.png",
                            width: "20px",
                            height: "20px"
                        },
                        label: "Flood"
                    },
                    {
                        value: "hurricane",
                        symbol: {
                            type: "picture-marker",
                            url: "img/hurricane.png",
                            width: "20px",
                            height: "20px"
                        },
                        label: "Hurricane"
                    },
                    {
                        value: "tornado",
                        symbol: {
                            type: "picture-marker",
                            url: "img/tornado.png",
                            width: "20px",
                            height: "20px"
                        },
                        label: "Tornado"
                    },
                    {
                        value: "wildfire",
                        symbol: {
                            type: "picture-marker",
                            url: "img/wildfire.png",
                            width: "20px",
                            height: "20px"
                        },
                        label: "Wildfire"
                    }
                ]
            };

            const eventLayer = new GeoJSONLayer({
                url: url,
                id: "events",
                renderer: eventRenderer
            });

            map.add(eventLayer);
        }
        else if (layer == "2"){
            //check if an existing events layer is already on the map
            for (let m=0; m<map.layers.items.length; m++) {
                //if yes, remove it
                if (map.layers.items[m].id == "iwas") {
                    map.remove(map.layers.items[m])
                }
            }

            // create a new blob from geojson featurecollection
            const blob = new Blob([JSON.stringify(template)], {
                type: "application/json"
            });

            // URL reference to the blob
            const url = URL.createObjectURL(blob);

            const iwaLayer = new GeoJSONLayer({
                url: url,
                id: "events"
            });

            //symbol style for iwa layer
            let iwaSymbol = {
                type: "simple-fill",
                color: "red",
                style: "none",
                outline: {
                    color: "red",
                    width: 1.5
                }
            };

            //apply facilitySymbol style to facilityLayer
            iwaLayer.renderer = {
                type: "simple",
                symbol: iwaSymbol
            };

            map.add(iwaLayer);
        }
    }
});