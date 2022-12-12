<%--
  Created by IntelliJ IDEA.
  User: Andrew
  Date: 12/11/2022
  Time: 3:54 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page import="java.io.*"%>
<%@ page import="org.json.*"%>
<%@ page import="java.sql.SQLException"%>
<%@ page import="java.sql.ResultSet"%>
<%@ page import="org.webproject.geog576final.DBUtility"%>
<%@ page import="java.util.HashMap"%>

<html>
<body>

<%

  PrintWriter output = response.getWriter();
  response.setContentType("application/json");
  response.setCharacterEncoding("UTF-8");

  String tab_id = request.getParameter("tab_id");

// create a report
  if (tab_id.equals("0")) {
    System.out.println("A report is submitted!");
    try {
      DBUtility dbutil = new DBUtility();
      String sql;

      // 1. create weather event
      int contact_id = 0;
      String system_name = request.getParameter("system_name");
      String event_date = request.getParameter("event_date");
      String type = request.getParameter("type");
      String lat = request.getParameter("latitude");
      String lon = request.getParameter("longitude");
      String submitter = request.getParameter("submitter");
      if (system_name != null) {
        system_name = "'" + system_name + "'";
      }
      if (event_date != null) {
        event_date = "'" + event_date + "'";
      }
      if (type != null) {
        type = "'" + type + "'";
      }
      if (submitter != null) {
        submitter = "'" + submitter + "'";
      }
      if (system_name != null && submitter != null) {
        // create the event
        sql = "insert into weather_event (system_name, event_date, type, location, submitter) " +
                "values (" + system_name + "," + event_date + "," + type +
                " ST_GeomFromText('POINT(" + lon + " " + lat + ")', 4326)" +
                submitter + ")";
        dbutil.modifyDB(sql);

        System.out.println("Success! Event created.");
      }
    } finally {}
  };
  output.close();

%>
</body>
</html>