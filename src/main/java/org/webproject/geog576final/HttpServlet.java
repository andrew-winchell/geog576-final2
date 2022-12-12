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
            System.out.println(sql);
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
            System.out.println(sql);
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


    public void main() throws JSONException {
    }
}