package Statistics.Bandwidth;

import Aux_Classes.StreamFileWriter;
import Statistics.IPFSNode;
import Statistics.TaskInterface;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicBoolean;

public class BandwidthStatistics implements Runnable, TaskInterface {
    private String IP;
    private AtomicBoolean exit;
    private IPFSNode ipfsNode;

    private String threadName = "[BANDWIDTH_STATISTICS] ";
    private String fileName = "bandwidth_statistics.json";

    public BandwidthStatistics(String IP){
        this.IP = IP;
        this.exit = new AtomicBoolean(false);
        this.ipfsNode = new IPFSNode(IP);
    }


    @Override
    public void run() {
        boolean first = true;
        StreamFileWriter streamFileWriter = null;

        try {
            streamFileWriter = new StreamFileWriter(fileName);
            streamFileWriter.openStream();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        while (!exit.get()){
            JsonObject bandwithStats = ipfsNode.statsBw();
            bandwithStats.remove("TotalIn");
            bandwithStats.remove("TotalOut");
            bandwithStats.addProperty("time", LocalDateTime.now().toString());
            String output = first ? bandwithStats.toString() : ","+bandwithStats.toString();
            first = false;

            try {
                streamFileWriter.write(output);
            } catch (IOException e) {
                e.printStackTrace();
            }

            try {
                if(!exit.get()) Thread.sleep(15000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println(threadName+"Close the streams");
        try {
            streamFileWriter.closeStream();
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println(threadName+"Terminated");



    }

    public void stop(){ this.exit.set(true);}
}
