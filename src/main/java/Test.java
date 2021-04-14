import Statistics.IPFSNode;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.concurrent.Callable;
import java.util.concurrent.atomic.AtomicBoolean;

public class Test implements Callable {

    private AtomicBoolean exit = new AtomicBoolean(false);

    public void stop(){
        exit.set(true);
    }
    @Override
    public String call() {
        String CID = "QmdA5WkDNALetBn4iFeSepHjdLGJdxPBwZyY47ir1bZGAK";
        String IP = "192.168.1.128:5001";
        IPFSNode ipfsNode = new IPFSNode(IP);

        while(!exit.get()){
            try {
                Thread.sleep(30000);
//                JsonArray peers = ipfsNode.bitswapStat().get("Peers").getAsJsonArray();
//
//                for(JsonElement peer : peers){
//                    JsonObject stats = ipfsNode.swapLedger(peer.getAsString());
//                    if(stats.get("Exchanged").getAsInt() > 0)
//                        System.out.println(stats);
//                }
                System.out.println("fine");
                exit.set(true);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        return "test";


    }


}
