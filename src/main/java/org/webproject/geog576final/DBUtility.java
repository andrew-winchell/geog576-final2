package org.webproject.geog576final;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DBUtility {
    private static final String Driver = "org.postgresql.Driver";
    private static final String ConnUrl = "jdbc:postgresql://ec2-44-206-89-185.compute-1.amazonaws.com:5432/d7akf5i6bm35lb";
    private static final String Username = "uebkpzusrzhuqj";
    private static final String Password = "0ef6dad38db0f71678cdee208c755e00a7637109a16506388bda1490bd0fadd6";

    // This is a constructor
    public DBUtility() {
    }

    // create a Connection to the database
    private Connection connectDB() {
        Connection conn = null;
        try {
            Class.forName(Driver);
            conn = DriverManager.getConnection(ConnUrl, Username, Password);
            return conn;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return conn;
    }

    // execute a sql query (e.g. SELECT) and return a ResultSet
    public ResultSet queryDB(String sql) {
        Connection conn = connectDB();
        ResultSet res = null;
        try {
            if (conn != null) {
                Statement stmt = conn.createStatement();
                res = stmt.executeQuery(sql);
                conn.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return res;
    }

    // execute a sql query (e.g. INSERT) to modify the database;
    // no return value needed
    public void modifyDB(String sql) {
        Connection conn = connectDB();
        try {
            if (conn != null) {
                Statement stmt = conn.createStatement();
                stmt.execute(sql);
                stmt.close();
                conn.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * @param args
     * @throws SQLException
     */
    public static void main(String[] args) throws SQLException {
        // You can test the methods you created here
        DBUtility util = new DBUtility();

        // 1. create a user
       // util.modifyDB("insert into person (first_name, last_name) values ('test_user_1_fN', 'test_user_1_lN')");

        // 2. query the database
        ResultSet res = util.queryDB("SELECT * FROM report");
        while (res.next()) {
            System.out.println(res.getString("report_id"));
        }
    }
}