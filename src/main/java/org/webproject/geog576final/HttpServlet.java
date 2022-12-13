package org.webproject.geog576final;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Servlet implementation class HttpServlet
 */
@WebServlet("/HttpServlet")
public class HttpServlet extends jakarta.servlet.http.HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     *
     */
    public HttpServlet() {
        super();
    }

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    }

    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse
            response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String tab_id = request.getParameter("tab_id");
        String event = request.getParameter("event_name");
        String sqlWhere = request.getParameter("event");

        // create weather event
        if (tab_id.equals("0")) {
            System.out.println("A new weather event has been submitted!");
            try {
                createEvent(request, response);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        // query events
        else if (tab_id.equals("1")) {
            System.out.println("Queried events for dropdown!");
            try {
                populateEventsDropdown(request, response);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        // create iwa
        else if (tab_id.equals("2")) {
            System.out.println("A new IWA has been submitted!");
            try {
                createIWA(request, response);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        // populate iwa dropdown
        else if (tab_id.equals("3")) {
            System.out.println("Queried IWA's for dropdown!");
            try {
                populateIWADropdown(request, response, event);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        // get facility features
        else if (tab_id.equals("4")) {
            try {
                facilityFeatures(request, response);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        // get event features
        else if (tab_id.equals("5")) {
            try {
                eventFeatures(request, response, sqlWhere);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        // get event features
        else if (tab_id.equals("6")) {
            try {
                System.out.println(sqlWhere);
                iwaFeatures(request, response, sqlWhere);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    private void createEvent(HttpServletRequest request, HttpServletResponse
            response) throws SQLException, IOException {
        DBUtility dbutil = new DBUtility();
        String sql;

        // 0. Create Weather Event
        String system_name = request.getParameter("system-name");
        String event_date = request.getParameter("weather-date");
        String type = request.getParameter("disaster-type");
        String location = request.getParameter("weather-loc");
        String[] coords = location.split(", ", 2);
        String loc = coords[0] + " " + coords[1];
        String locGeom = "ST_GeomFromText('POINT(" + loc + ")', 4326)";
        String submitter = request.getParameter("weather-submitter");
        if (system_name != null) {system_name = "'" + system_name + "'";}
        if (event_date != null) {event_date = "'" + event_date + "'";}
        if (type != null) {type = "'" + type + "'";}
        if (location != null) {location = "'" + location + "'";}
        if (submitter != null) {submitter = "'" + submitter + "'";}
        if (submitter != null) {
            // create the event
            sql = "insert into weather_event (system_name, event_date, type, location, submitter) " +
                    "values (" + system_name + ", " + event_date + ", " + type +
                    ", " + locGeom + ", " + submitter + ");";
            dbutil.modifyDB(sql);
            System.out.println("Success! Weather Event created.");
        }

        // response that the report submission is successful
        JSONObject data = new JSONObject();
        try {
            data.put("status", "success");
        } catch (JSONException e) {
            e.printStackTrace();
        }
        response.getWriter().write(data.toString());
    }

    private void populateEventsDropdown(HttpServletRequest request, HttpServletResponse
            response) throws SQLException, IOException {
        JSONArray list = new JSONArray();
        DBUtility dbutil = new DBUtility();
        String sql = "SELECT system_name FROM weather_event ORDER BY system_name";
        ResultSet res = dbutil.queryDB(sql);
        while (res.next()) {
            String m = res.getString("system_name");
            list.put(m);
        }
        response.getWriter().write(list.toString());
    }

    private void createIWA(HttpServletRequest request, HttpServletResponse
            response) throws SQLException, IOException {
        DBUtility dbutil = new DBUtility();
        String sql;

        // 1. Create IWA
        String related_event = request.getParameter("related-event");
        String iwa_id = request.getParameter("iwa-id");
        String iwa_date = request.getParameter("iwa-date");
        String iwa_loc = request.getParameter("iwa-loc");
        String iwaGeom = "ST_GeomFromText('POLYGON((" + iwa_loc + "))')";
        String iwa_submitter = request.getParameter("iwa-submitter");
        if (related_event != null) {related_event = "'" + related_event + "'";}
        if (iwa_id != null) {iwa_id = "'" + iwa_id + "'";}
        if (iwa_date != null) {iwa_date = "'" + iwa_date + "'";}
        if (iwa_submitter != null) {iwa_submitter = "'" + iwa_submitter + "'";}
        if (iwa_submitter != null) {
            // create the event
            sql = "insert into iwa (event_name, iwa_date, iwa_id, location, submitter) " +
                    "values (" + related_event + "," + iwa_date + "," + iwa_id +
                    ", " + iwaGeom + "," + iwa_submitter + ")";
            dbutil.modifyDB(sql);
            System.out.println("Success! IWA created.");
        }

        // response that the report submission is successful
        JSONObject data = new JSONObject();
        try {
            data.put("status", "success");
        } catch (JSONException e) {
            e.printStackTrace();
        }
        response.getWriter().write(data.toString());

    }

    private void populateIWADropdown(HttpServletRequest request, HttpServletResponse
            response, String event) throws SQLException, IOException {
        JSONArray list = new JSONArray();
        DBUtility dbutil = new DBUtility();
        String sql = "SELECT event_name, iwa_id FROM iwa WHERE event_name='" + event + "'";
        ResultSet res = dbutil.queryDB(sql);
        while (res.next()) {
            String sys = res.getString("event_name");
            String id = res.getString("iwa_id");
            String m = sys + "-" + id;
            list.put(m);
        }
        response.getWriter().write(list.toString());
    }

    private void facilityFeatures(HttpServletRequest request, HttpServletResponse
            response) throws SQLException, IOException {
        JSONArray list = new JSONArray();
        DBUtility dbutil = new DBUtility();
        String sql = "SELECT * FROM facility";
        ResultSet res = dbutil.queryDB(sql);
        while (res.next()) {
            String arpt_id = res.getString("arpt_id");
            String arpt_name = res.getString("arpt_name");
            String city = res.getString("city");
            String state_code = res.getString("state_code");
            String county_name = res.getString("county_name");
            String lat = res.getString("lat");
            String lon = res.getString("long");
            String elevation = res.getString("elevation");
            String artcc = res.getString("artcc");
            String single_eng = res.getString("single_eng");
            String multi_eng = res.getString("multi_eng");
            String jet_eng = res.getString("jet_eng");
            String heli = res.getString("heli");
            String military_acft = res.getString("military_acft");
            String commerc_ops = res.getString("commerc_ops");
            String local_ops = res.getString("local_ops");
            String military_ops = res.getString("military_ops");
            String geom = res.getString("geom");
            String[] row = {lon, lat, arpt_id, arpt_name, city, state_code, county_name, elevation, artcc, single_eng, multi_eng, jet_eng, heli, military_acft, commerc_ops, local_ops, military_ops, geom};
            list.put(row);
        }
        response.getWriter().write(list.toString());
    }

    private void eventFeatures(HttpServletRequest request, HttpServletResponse
            response, String sqlWhere) throws SQLException, IOException {
        JSONArray list = new JSONArray();
        DBUtility dbutil = new DBUtility();
        String sql = "SELECT ST_X (ST_Transform (location, 4326)) AS long,\n" +
                "ST_Y (ST_Transform (location, 4326)) AS lat,\n" +
                "system_name,\n" +
                "event_date,\n" +
                "type,\n" +
                "submitter\n" +
                "FROM weather_event\n" +
                "WHERE " + sqlWhere;
        ResultSet res = dbutil.queryDB(sql);
        while (res.next()) {
            String lon = res.getString("long");
            String lat = res.getString("lat");
            String system_name = res.getString("system_name");
            String event_date = res.getString("event_date");
            String type = res.getString("type");
            String submitter = res.getString("submitter");
            String[] row = {lon, lat, system_name, event_date, type, submitter};
            list.put(row);
        }
        response.getWriter().write(list.toString());
    }

    private void iwaFeatures(HttpServletRequest request, HttpServletResponse
            response, String sqlWhere) throws SQLException, IOException {
        JSONArray list = new JSONArray();
        DBUtility dbutil = new DBUtility();
        String sql = "SELECT ST_AsText(ST_PolyFromWKB(iwa.location,4326)) AS rings,\n" +
                "event_name,\n" +
                "iwa_id,\n" +
                "iwa_date,\n" +
                "location\n," +
                "submitter\n" +
                "FROM iwa\n" +
                "WHERE " + sqlWhere;
        ResultSet res = dbutil.queryDB(sql);
        while (res.next()) {
            String event_name = res.getString("event_name");
            String iwa_id = res.getString("iwa_id");
            String iwa_date = res.getString("iwa_date");
            String submitter = res.getString("submitter");
            String geom = res.getString("rings");
            System.out.println(geom);
            String[] row = {event_name, iwa_id, iwa_date, submitter, geom};
            list.put(row);
        }
        response.getWriter().write(list.toString());
    }


    public void main() throws JSONException {
    }
}