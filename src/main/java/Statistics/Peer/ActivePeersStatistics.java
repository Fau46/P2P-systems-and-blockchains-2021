package Statistics.Peer;

import Aux_Classes.BufferedFileWriter;
import Aux_Classes.StreamFileWriter;
import Statistics.IPFSNode;
import Statistics.TaskInterface;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

public class ActivePeersStatistics implements Runnable, TaskInterface {
    private IPFSNode ipfsNode;
    private String IP;
    private String CID;
    Map<String, Peer> mapActivePeers;
    private AtomicBoolean exit;
    private Map<String, JsonObject> swarmPeersInfo;

    String threadName = "[ACTIVE_PEERS_STATISTICS] "; //TODO elimina
    private String peersStatisticsFile = "peers_statistics.json";
    private String activePeersStatisticsFile = "active_peers_statistics.json";

    public ActivePeersStatistics(String IP, String CID){
        this.ipfsNode = new IPFSNode(IP);
        this.IP = IP;
        this.CID = CID;
        this.mapActivePeers = new HashMap<>();
        this.exit = new AtomicBoolean(false);
    }

    @Override
    public void run() {
        JsonArray peers;
        int totalPeers;
        Gson gson = new Gson();
        int activePeers;
        StreamFileWriter streamFileWriter = null;
        swarmPeersInfo = getSwarmPeersInfo();

        try {
            streamFileWriter = new StreamFileWriter(peersStatisticsFile);
            streamFileWriter.openStream();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        while (!exit.get()) {
            peers = ipfsNode.bitswapStat().get("Peers").getAsJsonArray();
            bitswapLedger(peers);

            totalPeers = peers.size();
            activePeers = mapActivePeers.size();
            PeersListSize peersListSize = new PeersListSize(totalPeers, activePeers); //TODO sistemare per bene
            String output = gson.toJson(peersListSize);

            try {
                streamFileWriter.write(output);
            } catch (IOException e) {
                e.printStackTrace();
            }

            try {
//                System.out.println(logging+"SLEEP | TOTAL PEERS: "+mapActivePeers.size()); //todo elimina
                if(!exit.get()) Thread.sleep(15000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println(threadName+"Write statistics into the file and close stream");
        try {
            BufferedFileWriter bufferedFileWriter = new BufferedFileWriter(activePeersStatisticsFile);
            bufferedFileWriter.writeAndClose(gson.toJson(mapActivePeers));

            streamFileWriter.closeStream();
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println(threadName+"Terminated");

    }

    public void stop(){
        exit.set(true);
    }

    private void bitswapLedger(JsonArray peers){
        for (JsonElement peer : peers){
            JsonObject statsPeer = ipfsNode.bitswapLedger(peer.getAsString());
            if(statsPeer.get("Recv").getAsInt() > 0){
//                System.out.println(logging+"\n"+peer.getAsString()+" recv: "+statsPeer.get("Recv").getAsInt()); //todo elimina
                String id = statsPeer.get("Peer").getAsString();
                long recv = statsPeer.get("Recv").getAsLong();
                long sent = statsPeer.get("Sent").getAsLong();
                long exchanged = statsPeer.get("Exchanged").getAsLong();
                Peer p = mapActivePeers.get(id);

                if(p == null){ //Check if the peer is in the map of peers
//                    System.out.println(logging+"New peer "+peer.getAsString()); // TODO elimina
                    JsonObject peerRawStat = ipfsNode.dhtFindpeer(peer.getAsString());
                    JsonArray responses = peerRawStat.get("Responses").getAsJsonArray();
                    JsonArray addrsPeer = responses.get(0).getAsJsonObject().get("Addrs").getAsJsonArray();
                    String peerIP = null;
                    JsonObject peerInfo = null;

                    for(JsonElement addrPeer : addrsPeer){
                        String addr = addrPeer.getAsString();
//                        System.out.println(logging+"Addr "+addr); //TODO elimina
                        if(!addr.startsWith("/ip6") && !addr.startsWith("/ip4/127")){
                            String [] splitAddr = addr.split("/");
//                            System.out.println("splitaddr "+splitAddr.toString()); //TODO elimina
                            peerIP = splitAddr[2];
                            peerInfo = getPeerInfo(peerIP);
                            if(peerInfo != null) break;
                        }
                    }

                    String continent = peerInfo != null ? peerInfo.get("continent_name").getAsString() : null;
                    String country = peerInfo != null ? peerInfo.get("country_name").getAsString() : null;
                    String region = peerInfo != null ? peerInfo.get("region_name").getAsString() : null;
                    String city = peerInfo != null ? peerInfo.get("city").getAsString() : null;

                    JsonObject swarmPeerInfo = null;
                    while(swarmPeerInfo == null){
                        swarmPeerInfo = swarmPeersInfo.get(peer.toString());
                        if(swarmPeerInfo == null){
                            swarmPeersInfo = getSwarmPeersInfo(); //If I don't find the peer in the map I update it
                        }

                    }

                    JsonArray streamsArray = swarmPeerInfo.get("Streams").getAsJsonArray();
                    String stringLatency = swarmPeerInfo.get("Latency").getAsString().split("\\.")[0]; //take the integer part of latency
                    int latency =  Integer.parseInt(stringLatency);

                    p = new Peer(recv, sent, exchanged, latency, streamsArray, peerIP, continent, country, region, city);
                    mapActivePeers.put(id,p);
                }
                else{
//                    System.out.println(logging+"Update existing peer"); //todo elimina
                    p.update(recv,sent,exchanged);
                }
            }
        }
    }

    public JsonObject getPeerInfo(String peerIP){
        String apiKey = "?access_key=fe37b6a2e1adc9e2de57159bf4ae75a5";
        String ipstackIP = "http://api.ipstack.com/";
        HttpClient httpClient = HttpClient.newBuilder().build();
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(ipstackIP+peerIP+apiKey))
                .build();
        HttpResponse<String> response = null;
        Gson gson = new Gson();

//        System.out.println(logging+"Send request"); todo elmina
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        JsonObject jsonResponse = gson.fromJson(response.body(), JsonObject.class);

        return jsonResponse.get("country_name").isJsonNull() ? null : jsonResponse;
    }

    private Map<String, JsonObject> getSwarmPeersInfo(){
        Gson gson = new Gson();
        JsonObject rawResponse = ipfsNode.swarmPeers();
        Map<String,JsonObject> mapPeers = new HashMap<>();
        ArrayList<JsonObject> peersList = gson.fromJson(rawResponse.get("Peers"),new TypeToken<List<JsonObject>>(){}.getType());

        peersList.parallelStream().forEach(p -> mapPeers.put(p.get("Peer").toString(),p));
        return mapPeers;
    }
}
