package Statistics;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicBoolean;

public class OutputStats implements Runnable,TaskInterface{
    private String IP;
    private String CID;
    private JsonObject bitswapStat;
    private IPFSNode ipfsNode;
    private AtomicBoolean exit;


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
        double size = getSize();
        double initialDataReceived = (bitswapStat.get("DataReceived").getAsDouble() - bitswapStat.get("DupDataReceived").getAsDouble()); //Take the initial state of data received
        dagStat();

        while (!exit.get()){
            bitswapStat(initialDataReceived, size);

            try {
                if(!exit.get()) Thread.sleep(3500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        }
    }


    private double getSize(){
      JsonObject jsonObject = ipfsNode.objectStat(CID);
      return  jsonObject.get("CumulativeSize").getAsDouble();
    }


    private void dagStat(){
        try {
            JsonObject dagObject = ipfsNode.dagGet(CID);
            JsonArray linksArray = dagObject.getAsJsonArray("links");
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


    private void bitswapStat(double initialDataReceived, double size){
        JsonObject newBitSwapStat = ipfsNode.bitswapStat();
        double dataReceived = (newBitSwapStat.get("DataReceived").getAsDouble() - newBitSwapStat.get("DupDataReceived").getAsDouble());
        double totalDataReceivedNow = dataReceived - initialDataReceived;
        double percentage = (totalDataReceivedNow/size)*100;

        JsonArray wantList = newBitSwapStat.getAsJsonArray("Wantlist");
        JsonArray peersList = newBitSwapStat.getAsJsonArray("Peers");

        System.out.print("\033[5A\r\033[J");
        System.out.printf("%s / %s - %.2f%% | Wantlist [%d] | Peers[%d] ", convertSize(totalDataReceivedNow), convertSize(size), percentage, wantList.size(), peersList.size());
    }

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

}
