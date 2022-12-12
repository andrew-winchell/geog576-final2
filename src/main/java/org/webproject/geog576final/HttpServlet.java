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

        // create a report
        if (tab_id.equals("0")) {
            System.out.println("A report is submitted!");
            try {
                System.out.println("CREATE REPORT");
                createReport(request, response);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    private void createReport(HttpServletRequest request, HttpServletResponse
            response) throws SQLException, IOException {
        DBUtility dbutil = new DBUtility();
        String sql;

        // 1. create weather event
        int contact_id = 0;
        String system_name = request.getParameter("system-name");
        String event_date = request.getParameter("weather-date");
        String type = request.getParameter("disaster-type");
        String location = request.getParameter("weather-loc");
        String[] coords = location.split(", ",2);
        String loc = coords[0] + " " + coords[1];
        String locGeom = "ST_GeomFromText('POINT(" + loc + ")', 4326)";
        String submitter = request.getParameter("weather-submitter");
        if (system_name != null) {system_name = "'" + system_name + "'";}
        if (event_date != null) {event_date = "'" + event_date + "'";}
        if (type != null) {type = "'" + type + "'";}
        if (loc != null) {loc = "'" + loc + "'";}
        if (submitter != null) {submitter = "'" + submitter + "'";}
        if (submitter != null) {
            // create the event
            sql = "insert into weather_event (system_name, event_date, type, location, submitter) " +
                    "values (" + system_name + "," + event_date + "," + type +
                    ", " + locGeom + "," +
                    submitter + ")";
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

    public void main() throws JSONException {
    }
}