import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class JDBC {

    public static void main(String[] args) {
        Connection conn;
        Statement stmt;
        try {
            // load the JDBC driver
            Class.forName("org.postgresql.Driver");

            // establish connection
            String url = "jdbc:postgresql://ec2-44-206-89-185.compute-1.amazonaws.com:5432/d7akf5i6bm35lb";
            conn = DriverManager.getConnection(url, "uebkpzusrzhuqj", "0ef6dad38db0f71678cdee208c755e00a7637109a16506388bda1490bd0fadd6");

            // query the database
            String sql = "SELECT * FROM report";
            stmt = conn.createStatement();
            ResultSet res = stmt.executeQuery(sql);

            // print the result
            if (res != null) {
                while (res.next()) {
                    System.out.println("id: " + res.getString("report_id"));
                    System.out.println("submitter: " + res.getString("submitter"));
                    System.out.println("event: " + res.getString("event_name"));
                    System.out.println("iwa: " + res.getString("iwa_id"));
                    System.out.println("date: " + res.getString("report_date"));
                }
            }
            //print that no results were returned
            else {
                System.out.println("No results found for query");
            }

            // clean up
            stmt.close();
            conn.close();
        }

        catch (Exception e) {
            e.printStackTrace();
        }
    }
}
