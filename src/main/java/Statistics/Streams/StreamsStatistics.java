package Statistics.Streams;

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

public class StreamsStatistics implements Runnable, TaskInterface {
    private String IP;
    private AtomicBoolean exit;
    private Map<String,String> sawSwarmPeers;
    private Map<String,Integer> streamsProtocols;
    private IPFSNode ipfsNode;

    private String threadName = "[STREAMS_STATISTICS] ";
    private String fileName = "streams_statistics.json";

    public StreamsStatistics(String IP){
        this.IP = IP;
        this.exit = new AtomicBoolean(false);
        this.sawSwarmPeers = new HashMap<>();
        this.streamsProtocols = new HashMap<>();
        this.ipfsNode = new IPFSNode(IP);
    }

    @Override
    public void run() {

        while (!exit.get()){
            updateStatistics();

            try {
                if(!exit.get()) Thread.sleep(15000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        //Write the stats into the file
        System.out.println(threadName+"Write statistics into the file");
        Gson gson = new Gson();
        JsonElement streamsProtocolsJson = gson.fromJson(gson.toJson(streamsProtocols), JsonElement.class);
        JsonObject output = new JsonObject();
        output.addProperty("Checked_peers", sawSwarmPeers.size());
        output.add("Streams", streamsProtocolsJson);

        try {
            BufferedFileWriter bufferedFileWriter = new BufferedFileWriter(fileName);
            bufferedFileWriter.writeAndClose(output.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println(threadName+"Terminated");

    }

    @Override
    public void stop() {
        this.exit.set(true);
    }

    private void updateStatistics(){
        JsonObject rawResponse = ipfsNode.swarmPeers();
        JsonArray peers = rawResponse.get("Peers").getAsJsonArray();

        for(JsonElement jsonElement : peers){
            JsonObject peer = jsonElement.getAsJsonObject();
            String peerID = peer.get("Peer").toString();

            JsonElement streamsRaw = peer.get("Streams");
            if(sawSwarmPeers.get(peerID) == null && !streamsRaw.isJsonNull()){ //check if I saw peerID or streams array is null
                JsonArray streams = streamsRaw.getAsJsonArray();
                sawSwarmPeers.put(peerID, null);

                for (JsonElement aux : streams) {
                    JsonObject stream = aux.getAsJsonObject();
                    String protocol = stream.get("Protocol").getAsString();

                    if (!protocol.equals("")) { //Assert that protocol is not empty
                        Integer valueProtocol = streamsProtocols.get(protocol);
                        Integer newValueProtocol = valueProtocol == null ? 1 : valueProtocol + 1;
                        streamsProtocols.put(protocol, newValueProtocol);
                    }
                }
            }
        }
    }
}
