package Aux_Classes;

import java.io.*;

public class StreamFileWriter {
    private DataOutputStream dataOutputStream;
    private String directory = "./StatisticsFiles/";

    public StreamFileWriter(String fileName) throws FileNotFoundException {
        File file = new File(directory+fileName);
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        dataOutputStream = new DataOutputStream(fileOutputStream);
    }

    public void openStream() throws IOException {
        write("[");
    }

    public void write(String data) throws IOException {
        dataOutputStream.writeChars(data);

    }

    public void closeStream() throws IOException {
        write("]");
        dataOutputStream.close();
    }
}
