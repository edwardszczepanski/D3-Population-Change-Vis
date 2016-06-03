import java.io.*;
import java.util.*;

public class ReadCVS {

  public static void main(String[] args) {
  	ReadCVS obj = new ReadCVS();
  	obj.run();

  }

  public void run() {
    int files = 100;
    int fileSize = 5500;
    BufferedWriter writer = null;
  	// String csvFile = "/users/howardlinsanity/Google Drive/college/datafest/datafest-sf11/_data/approved_ga_data_v2.csv";
    // String csvFile = "/users/howardlinsanity/Desktop/approved_data_purchase-v5.csv";
    String csvFile = "/users/howardlinsanity/Desktop/approved_adwords_v3.csv";

  	BufferedReader br = null;
  	String line = "";
  	String cvsSplitBy = ",";

  	try {
      br = new BufferedReader(new FileReader(csvFile));
      line = br.readLine();
      String[] firstPart = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
      for(int j = 0; j < files; j++){
        File file = new File("/users/howardlinsanity/desktop/Reduced Data Files/approved_adwords_v3/approved_adwords_v3" + j + ".csv");
        // File file = new File("/users/howardlinsanity/desktop/Reduced Data Files/approved_ga_data_v2/approved_ga_data_v2" + j + ".csv");

        file.createNewFile();
        writer = new BufferedWriter(new FileWriter(file.getAbsoluteFile()));
        int size = firstPart.length;
        for(int z = 0; z < size; z++){
          writer.append(firstPart[z]);
          writer.append(',');
        }
        writer.append("\n");
        
        int count = 0;
    		while ((line = br.readLine()) != null && count < fileSize) {
    			String[] event = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
          for(int i = 0; i < size ; i++){
            writer.append(event[i]);
            writer.append(',');
          }
          writer.append("\n");
          count++;
    		}
      }

  	} catch (FileNotFoundException e) {
  		e.printStackTrace();
  	} catch (IOException e) {
  		e.printStackTrace();
  	} finally {
  		if (br != null) {
  			try {
  				br.close();
          writer.close();
  			} catch (IOException e) {
  				e.printStackTrace();
  			}
  		}
  	}

  	System.out.println("Done");
    }

}
