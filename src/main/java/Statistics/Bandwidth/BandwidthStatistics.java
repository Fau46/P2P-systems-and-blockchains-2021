package Statistics.Bandwidth;

import Aux_Classes.StreamFileWriter;
import Statistics.IPFSNode;
import Statistics.TaskInterface;
import com.google.gson.JsonObject;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicBoolean;

public class BandwidthStatistics implements Runnable, TaskInterface {
    private AtomicBoolean exit;
    private IPFSNode ipfsNode;

    private String threadName = "[BANDWIDTH_STATISTICS] ";
    private String fileName = "bandwidth_statistics.json";

    public BandwidthStatistics(String IP){
        this.exit = new AtomicBoolean(false);
        this.ipfsNode = new IPFSNode(IP);
    }


    @Override
    public void run() {
        boolean first = true;
        StreamFileWriter streamFileWriter = null;

        try {
            streamFileWriter = new StreamFileWriter(fileName); //Opening the stream file
            streamFileWriter.openStream();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        while (!exit.get()){
            JsonObject bandwidthStats = ipfsNode.statsBw();
            if(bandwidthStats != null){ //If it is null an error has occurred, the statistics are not updated
                bandwidthStats.remove("TotalIn");
                bandwidthStats.remove("TotalOut");
                bandwidthStats.addProperty("time", LocalDateTime.now().toString());
                String output = first ? bandwidthStats.toString() : ","+bandwidthStats.toString();
                first = false;

                try {
                    streamFileWriter.write(output);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            else System.out.println(threadName+"IPFS node error");

            try {
                if(!exit.get()) Thread.sleep(15000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println(threadName+"Closing the stream");
        try {
            streamFileWriter.closeStream();
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println(threadName+"Terminated");
    }

    public void stop(){ this.exit.set(true);}

}
