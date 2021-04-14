package Aux_Classes;

import com.google.gson.JsonObject;

import java.io.*;

public class BufferedFileWriter {
    private File file;
    private BufferedWriter bufferedWriter;
    String directory = "./StatisticsFiles/";

    public BufferedFileWriter(String fileName) throws IOException {
        this.file = new File(directory+fileName);
        bufferedWriter = new BufferedWriter(new FileWriter(this.file));
    }


    public void writeAndClose(String output) throws IOException {
        this.bufferedWriter.write(output);
        this.bufferedWriter.close();
    }




}