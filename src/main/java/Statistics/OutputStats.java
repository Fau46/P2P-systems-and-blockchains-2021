package Statistics;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicBoolean;

public class OutputStats implements Runnable,TaskInterface{
    private String IP;
    private String CID;
    private JsonObject bitswapStat;
    private IPFSNode ipfsNode;
    private AtomicBoolean exit;

    private String threadName = "[OUTPUT_STATS] ";


    public OutputStats(String IP, String CID, JsonObject bitswapStat){
        this.IP = IP;
        this.CID = CID;
        this.bitswapStat = bitswapStat;
        this.ipfsNode = new IPFSNode(IP);
        this.exit = new AtomicBoolean(false);
    }

    public void stop(){
        exit.set(true);
    }

    @Override
    public void run() {
        Double size = getSize();
        if(size == null){//If it is null an error has occurred, the statistics are not taken
            System.out.println(threadName+"IPFS node error");
            return;
        }

        double initialDataReceived = (bitswapStat.get("DataReceived").getAsDouble() - bitswapStat.get("DupDataReceived").getAsDouble()); //Removing the dupData from the all received data. This is the snapshot of the initial state of bitswap
        Instant start = Instant.now();
        dagStat(); //Printing the dag statistics associated to CID

        while (!exit.get()){
            bitswapStat(initialDataReceived, size, start);

            try {
                if(!exit.get()) Thread.sleep(3500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        }
    }

//  Return the size of object associated to CID. If an error occurs null is returned
    private Double getSize(){
      JsonObject jsonObject = ipfsNode.objectStat(CID);
      if(jsonObject == null) return null;
      return  jsonObject.get("CumulativeSize").getAsDouble();
    }


//  Print the dag statistics associated to CID
    private void dagStat(){
        try {
            JsonObject dagObject = ipfsNode.dagGet(CID);
            if (dagObject == null){ //If it is null an error has occurred, the statistics are not updated
                System.out.println(threadName+"IPFS node error (dagObject)");
                return;
            }
            JsonArray linksArray = dagObject.getAsJsonArray("links"); //Taking the links from the dag
            String outputString = null;
            double size = 0;

            for(JsonElement aux : linksArray){
                JsonObject link = aux.getAsJsonObject();
                String name_link = link.get("Name").getAsString();
                String cid_Link = (link.get("Cid").getAsJsonObject().get("/").getAsString());
                double size_Link = link.get("Size").getAsDouble();
                size += size_Link;
                outputString = String.format("Name: %-60s Size: %-30s CID: %-30s\n",name_link, convertSize(size_Link), cid_Link);
                System.out.printf(outputString);
            }

            System.out.println("-".repeat(outputString.length()));
            System.out.printf("Total links: %-53s Total size: %-24s Root CID: %-30s\n\n",linksArray.size(),convertSize(size),CID);
        } catch (InterruptedException | IOException e) {
            e.printStackTrace();
        }
    }


//  This method print the statistics retrieved from bitswap
    private void bitswapStat(double initialDataReceived, double size, Instant start){
        JsonObject newBitSwapStat = ipfsNode.bitswapStat();
        if (newBitSwapStat == null){ //If it is null an error has occurred, the statistics are not updated
            System.out.println(threadName+"IPFS node error (bitswapStat)");
            return;
        }
        double dataReceived = (newBitSwapStat.get("DataReceived").getAsDouble() - newBitSwapStat.get("DupDataReceived").getAsDouble()); //Removing the dup data from all the data received
        double totalDataReceivedNow = dataReceived - initialDataReceived;
        double percentage = (totalDataReceivedNow/size)*100;

        JsonArray wantList = newBitSwapStat.getAsJsonArray("Wantlist");
        JsonArray peersList = newBitSwapStat.getAsJsonArray("Peers");

        Instant end = Instant.now();
        Duration interval = Duration.between(start,end);
        String time = getTime(interval);

//        System.out.print("\033[5A\r\033[J");
        System.out.printf("%s / %s - %.2f%% | Wantlist [%d] | Peers[%d] | Time [%s]\n", convertSize(totalDataReceivedNow), convertSize(size), percentage, wantList.size(), peersList.size(), time);
    }


//  This method convert the byte size for make it more human readable. It return a string.
    private String convertSize(double size){
        double kb = 1024;
        double mb = kb * 1024;
        double gb = mb * 1024;
        double tb = gb * 1024;

        if(size < kb) return String.format("%.0fB",size);
        else if(size >= kb && size < mb) return String.format("%.2fKB",size/kb);
        else if(size >= mb && size < gb) return String.format("%.2fMB",size/mb);
        else if(size >= gb && size < tb) return String.format("%.2fGB",size/gb);
        else if(size >= tb) return String.format("%.2TB",size/tb);


        return null;
    }


    private String getTime(Duration interval){
        long seconds = interval.getSeconds();

        return String.format(
                "%d:%02d:%02d",
                seconds / 3600,
                (seconds % 3600) / 60,
                seconds % 60);
    }

}
