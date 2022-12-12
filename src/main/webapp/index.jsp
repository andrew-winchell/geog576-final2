<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SITREP Creator</title>

    <!--Main CSS-->
    <link rel="stylesheet" type="text/css" href="css/style.css">

    <!--ESRI JS CSS-->
    <link rel="stylesheet" href="https://js.arcgis.com/4.24/esri/themes/light/main.css">

    <!--Calcite Maps Bootstrap-->
    <link rel="stylesheet" type="text/css" href="https://esri.github.io/calcite-maps/dist/css/calcite-maps-bootstrap.min-v0.10.css" />

    <!--Calcite Maps-->
    <link rel="stylesheet" href="https://esri.github.io/calcite-maps/dist/css/calcite-maps-arcgis-4.x.min-v0.10.css">

    <!--[if IE<9]
        <link rel="stylesheet" href="css/style.css">
    <![endIf]-->
</head>

<body>

<!--Start Navbar-->
<nav class="navbar calcite-navbar navbar-fixed-top calcite-text-light calcite-bg-dark">
    <!--Data Sources-->
    <div class="dropdown calcite-dropdown calcite-text-dark calcite-bg-light" role="presentation">
        <a class="dropdown-toggle" role="menubutton" aria-haspopup="true" aria-expanded="false" tabindex="0">
            <div class="calcite-dropdown-toggle">
                <span class="sr-only">Toggle dropdown menu</span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </a>
        <!--Dropdown Menu-->
        <ul class="dropdown-menu" role="menu">
            <!--Dropdown List Items-->
            <li id="dropdownTitle">
                Data Sources
            </li>
            <li>
                <!--Link to FAA NASR Data Source-->
                <a role="menuitem" tabindex="0" href="https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription_2022-12-01/" target="_blank" rel="noopener noreferrer" aria-haspopup="true">
                    <span class="glyphicon glyphicon-menu-right"></span>
                    FAA NASR
                </a>
            </li>
        </ul>
    </div>
    <!--Title-->
    <div class="calcite-title calcite-overflow-hidden">
        <span class="calcite-title-main">Situational Report Creation Tool</span>
        <span class="calcite-title-divider hidden-xs"></span>
        <span class="calcite-title-sub hidden-xs">Airspace Analysis</span>
    </div>
    <!--Search-->
    <ul class="nav navbar-nav calcite-nav">
        <li>
            <div class="calcite-navbar-search calcite-search-expander">
                <div id="searchWidgetDiv"></div>
            </div>
        </li>
    </ul>
</nav>
<!--End Navbar-->

<!--Main Layout-->
<div class="grid-container">

    <!--Start Query Section-->
    <div class="queryTools">
        <!--Tab List-->
        <ul class="nav nav-tabs-justified" id="tool-tabs">
            <li class="nav-item">
                <a class="nav-link active" href="#weather-event">1. Weather Event</a>
            </li>
            <li class="nav-item disabled" id="iwa-list-item">
                <a class="nav-link" href="#iwa" id="iwa-tab">2. IWA</a>
            </li>
            <li class="nav-item disabled"id="report-list-item">
                <a class="nav-link" href="#report" id="report-tab">3. Report</a>
            </li>
        </ul>

        <!--Tab Content-->
        <div class="tab-content" id="tabContent">
            <div role="tabpanel" class="tab-pane active" id="weather-event">
                <div class="main-dropdown">
                    <calcite-select class="dropdown" id="weather-dropdown">
                        <calcite-option selected class="default-dropdown" id="weather-default">Select Weather Event</calcite-option>
                    </calcite-select>
                </div>

                <form id="weather-form">
                    <div>
                        <label>Name:&nbsp</label><input type="text" placeholder="Weather System Name" name="system-name" class="form-input" required>
                        <label>Date:&nbsp</label><input type="date" min="2022-01-01" id="weather-date" name="weather-date" class="form-input" required>
                        <label>Weather Type:</label>
                        <select name="disaster-type" id="disaster-type" class="form-input" required>
                            <option value="">Choose the weather type</option>
                            <option value="blizzard">Blizzard</option>
                            <option value="earthquake">Earthquake</option>
                            <option value="flood">Flood</option>
                            <option value="hurricane">Hurricane</option>
                            <option value="tornado">Tornado</option>
                            <option value="wildfire">Wildfire</option>
                            <option value="other">other</option>
                        </select>
                        <label>Location:&nbsp</label><input type="text" id="weather-loc" name="weather-loc" class="form-input" disabled required>
                        <label>Submitter:&nbsp</label><input type="text" placeholder="Your Name" id="weather-submitter" name="weather-submitter" class="form-input" required>
                    </div>
                    <button type="submit" class="btn btn-default" id="event-submit-btn" disabled>
                        <span class="glyphicon glyphicon-plus"></span> Place Event
                    </button>
                </form>

            </div>
            <div role="tabpanel" class="tab-pane" id="iwa">
                <div class="main-dropdown">
                    <calcite-select class="dropdown" id="iwa-dropdown">
                        <calcite-option selected class="default-dropdown" id="iwa-default">Select Watch Area</calcite-option>
                    </calcite-select>
                </div>

                <form id="iwa-form">
                    <div>
                        <label>ID:&nbsp</label><input type="text" placeholder="IWA ID" name="iwa-id" class="form-input" required>
                        <label>Date:&nbsp</label><input type="date" id="iwa-date" name="iwa-date" class="form-input" required>
                        <label>Location:&nbsp</label><input type="text" id="iwa-loc" name="iwa-loc" class="form-input" required>
                        <label>Submitter:&nbsp</label><input type="text" placeholder="Your Name" id="iwa-submitter" name="iwa-submitter" class="form-input" required>
                    </div>
                    <button type="submit" class="btn btn-default" id="iwa-submit-btn">
                        <span class="glyphicon glyphicon-plus"></span> Draw IWA
                    </button>
                </form>
            </div>
            <div role="tabpanel" class="tab-pane" id="report">
                <button type="button" class="btn btn-primary" id="gen-button" disabled>Generate Report</button>
            </div>
        </div>
    </div>
    <!--End Query Section-->

    <!--Start Map-->
    <div class="mapArea">
        <div id="viewDiv">
            <div id='point-button'
                 class='esri-widget esri-widget--button esri-interactive'
                 title='Add Point'>
                <calcite-icon icon='point' scale='m'></calcite-icon>
            </div>
            <div id="polygon-button"
                 class="esri-widget esri-widget--button esri-interactive"
                 title="Draw polygon">
                <span class="esri-icon-polygon"></span>
            </div>
        </div>
    </div>
    <!--End Map-->

    <script type="text/javascript">
        var dojoConfig = {
            packages: [{
                name: "bootstrap",
                location: "https://esri.github.io/calcite-maps/dist/vendor/dojo-bootstrap"
            },
                {
                    name: "calcite-maps",
                    location: "https://esri.github.io/calcite-maps/dist/js/dojo"
                }]
        };
    </script>
</div>
<!--End Main Layout-->

<script src="https://js.arcgis.com/4.24/"></script>
<script type="module" src="https://js.arcgis.com/calcite-components/1.0.0-beta.91/calcite.esm.js"></script>
<script src="lib/jquery-3.6.0.js"></script>
<script src="lib/tab.js"></script>
<script src="lib/util.js"></script>
<script src="js/main.js"></script>

</body>
</html>