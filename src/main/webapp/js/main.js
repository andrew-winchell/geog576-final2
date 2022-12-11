require([
    //ArcGIS JS API
    "esri/config",
    "esri/Map",
    "esri/layers/FeatureLayer",
    "esri/views/MapView",
    "esri/views/draw/Draw",
    "esri/Graphic",
    "esri/geometry/geometryEngine",
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

], function(esriConfig, Map, FeatureLayer, MapView, Draw, Graphic, geometryEngine, Home, Search, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport){

    //esri agol api key
    esriConfig.apiKey = "AAPK81762376d6974634a978fa72c12fdfbdqcwchnbMurlNeJgk4ov0WxRZLEi9rayVxvBJeTGwyKw9Vy2_Azi6YAtY1QAlpkkm";

    //weather events layer
    const eventLayer = new FeatureLayer({
        id: "weather_events",
        url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/SITREP_DATA/FeatureServer/0"
    });

    //symbol style for events layer
    let eventSymbol = {
        type: "simple-marker",
        color: "red",
        size: 4
    };

    //apply eventSymbol style to eventLayer
    eventLayer.renderer = {
        type: "simple",
        symbol: eventSymbol
    };

    //static facilities layer
    const facilityLayer = new FeatureLayer({
        id: "facilities",
        url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/SITREP_DATA/FeatureServer/1"
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

    //construct a new web map using basic topographic basemap
    //add weather event and facility layers by default
    const map = new Map({
        basemap: "topo-vector",
        layers: [eventLayer, facilityLayer]
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
        console.log(graphic);
    }

    //on start-up, populate weather events dropdown
    $(document).ready(() => {
        populateDropdown("event");
        tabContentResize();
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
            populateDropdown("iwa");
            //send the selected weather event to the eventSelected function
            eventSelected(e.target.value);
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

            //append each of the existing weather events as a new option
            $("#weather-default").after(
                '<calcite-option>New Event</calcite-option>' +
                '<calcite-option>Test Event</calcite-option>'
            );
        } else if (dropdown == "iwa") {
            //clear iwa dropdown options except for the default
            $("#iwa-dropdown calcite-option:not(:first)").remove();

            //append each of the existing iwa's for the selected weather event
            $("#iwa-default").after(
                '<calcite-option>New IWA</calcite-option>' +
                '<calcite-option>Test IWA</calcite-option>'
            )
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
            //Enable Step 2. IWA tab
            $("#iwa-list-item").removeClass("disabled");
            //hide the point button as it will not be used passed Step 1. Weather Event
            $("#point-button").css("display", "none");
            //move to the 2. IWA tab
            $("#iwa-tab").tab("show");
            //add a header to the IWA panel indicating the selected weather event
            $("#iwa").prepend(
                "<p id='event-label'>Weather Event: " + selection + "</p>"
            );
            //filter to the selected weather event graphic
            filterWeatherEvent();
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
            //filter to the selected iwa graphic
            filterIWA();
        }
    };

    function clearForms(form) {
        if (form == "event") {
            $("#weather-form").closest('form').find("input[type=text], textarea").val("");
            $("#weather-form").closest('form').find("input[type=date], textarea").val("");
            $("#disaster-type").val("");
            $("p").remove("#event-label");
        } else if (form == "iwa") {
            $("#iwa-form").closest('form').find("input[type=text], textarea").val("");
            $("#iwa-form").closest('form').find("input[type=date], textarea").val("");

        };
    }

    //show only the selected weather event
    function filterWeatherEvent() {
        //remove any existing weather event drawings
        view.graphics.removeAll();
        //filter weather event layer to the selected event
    }

    //show only the selected weather event
    function filterIWA() {
        //remove any existing iwa drawings
        view.graphics.removeAll();
        //filter wia layer to the selected area
    }
});