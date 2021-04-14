package Statistics.AgentVersion;

import Aux_Classes.BufferedFileWriter;
import Statistics.IPFSNode;
import Statistics.TaskInterface;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

public class AgentVersionStatistics implements Runnable, TaskInterface {
    private String IP;
    private AtomicBoolean exit;
    private Map<String,String> sawPeers;
    private Map<String,Integer> agentsVersion;
    private IPFSNode ipfsNode;

    private String threadName = "[AGENT_VERSION_STATISTICS] ";
    private String fileName = "agent_version_statistics.json";

    public AgentVersionStatistics(String IP){
        this.IP =IP;
        this.ipfsNode = new IPFSNode(IP);
        this.sawPeers = new HashMap<>();
        this.agentsVersion = new HashMap<>();
        this.exit = new AtomicBoolean(false);
    }

    public void run(){

        while (!exit.get()){
            updateStatistics();

            try {
                Thread.sleep(15000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        //TODO mettere log finali
        Gson gson = new Gson();
        try {
            BufferedFileWriter bufferedFileWriter = new BufferedFileWriter(fileName);
            bufferedFileWriter.writeAndClose(gson.toJson(agentsVersion));
        } catch (IOException e) {
            e.printStackTrace();
        }


    }

    public void stop(){this.exit.set(true);}

    private void updateStatistics(){
        JsonObject rawResponse = ipfsNode.statsDht();
        JsonArray buckets = rawResponse.get("Buckets").getAsJsonArray();

        for(JsonElement jsonElement : buckets){
            JsonObject bucket = jsonElement.getAsJsonObject();

            if(!bucket.get("Peers").isJsonNull()){
                JsonArray peers = bucket.get("Peers").getAsJsonArray();

                for(JsonElement aux : peers){
                    JsonObject peer = aux.getAsJsonObject();
                    String peerID = peer.get("ID").getAsString();

                    if(sawPeers.get(peerID) == null){
                        sawPeers.put(peerID, null);

                        String agentVersion = peer.get("AgentVersion").getAsString();
                        Integer agentVersionValue = agentsVersion.get(agentVersion);
                        Integer newValue = agentVersionValue == null ? 1 : agentVersionValue + 1;
                        agentsVersion.put(agentVersion, newValue);
                    }

                }
            }
        }

    }
}
