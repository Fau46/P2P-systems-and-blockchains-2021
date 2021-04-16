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
    private IPFSNode ipfsNode;
    private AtomicBoolean exit;
    private Map<String,String> sawPeers;
    private Map<String,Integer> agentVersions;

    private String threadName = "[AGENT_VERSION_STATISTICS] ";
    private String fileName = "agent_versions_statistics.json";

    public AgentVersionStatistics(String IP){
        this.ipfsNode = new IPFSNode(IP);
        this.sawPeers = new HashMap<>();
        this.agentVersions = new HashMap<>();
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

        System.out.println(threadName+"Writing statistics to the file");
        Gson gson = new Gson();
        JsonElement agentVersionsJson = gson.fromJson(gson.toJson(agentVersions), JsonElement.class);
        JsonObject output = new JsonObject();
        output.addProperty("Checked_peers", agentVersions.size());
        output.add("Streams", agentVersionsJson);

        try {
            BufferedFileWriter bufferedFileWriter = new BufferedFileWriter(fileName);
            bufferedFileWriter.writeAndClose(gson.toJson(agentVersionsJson));
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println(threadName+"Terminated");
    }

    public void stop(){this.exit.set(true);}

    //Method that update the statistics fo agent
    private void updateStatistics(){
        JsonObject rawResponse = ipfsNode.statsDht();
        if (rawResponse == null){ //If it is null an error has occurred, the statistics are not updated
            System.out.println(threadName+"IPFS node error");
            return;
        }
        JsonArray buckets = rawResponse.get("Buckets").getAsJsonArray(); //Taking the buckets of the dht

        for(JsonElement jsonElement : buckets){
            JsonObject bucket = jsonElement.getAsJsonObject();

            if(!bucket.get("Peers").isJsonNull()){ //Checking if the bucket contains peers
                JsonArray peers = bucket.get("Peers").getAsJsonArray();

                for(JsonElement aux : peers){
                    JsonObject peer = aux.getAsJsonObject();
                    String peerID = peer.get("ID").getAsString();

                    if(!sawPeers.containsKey(peerID)){ //Making sure to update the statistics only with new peers
                        sawPeers.put(peerID, null);

                        String agentVersion = peer.get("AgentVersion").getAsString();
                        Integer agentVersionValue = agentVersions.get(agentVersion); //Taking the agentVersion from the map of already seen agentVersion
                        Integer newValue = agentVersionValue == null ? 1 : agentVersionValue + 1; //If agentVersion is new I insert 1 otherwise I update the counter
                        agentVersions.put(agentVersion, newValue);
                    }

                }
            }
        }

    }
}
