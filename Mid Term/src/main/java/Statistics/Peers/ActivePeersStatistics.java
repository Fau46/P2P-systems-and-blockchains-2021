package Statistics.Peers;

import Aux_Classes.BufferedFileWriter;
import Aux_Classes.StreamFileWriter;
import Statistics.IPFSNode;
import Statistics.Peers.Classes.ActiveAndTotalPeers;
import Statistics.Peers.Classes.Peer;
import Statistics.TaskInterface;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import java.io.FileNotFoundException;
import java.io.IOException;
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
    private AtomicBoolean exit;
    private Map<String, Peer> mapActivePeers;
    private Map<String, JsonObject> swarmPeersInfo;

    private String threadName = "[ACTIVE_PEERS_STATISTICS] ";
    private String peersStatisticsFile = "peers_statistics.json";
    private String activePeersStatisticsFile = "active_peers_statistics.json";

    public ActivePeersStatistics(String IP){
        this.ipfsNode = new IPFSNode(IP);
        this.mapActivePeers = new HashMap<>();
        this.exit = new AtomicBoolean(false);
    }

    @Override
    public void run() {
        JsonArray peers;
        int totalPeers;
        int activePeers;
        Gson gson = new Gson();
        boolean first_write = true;
        StreamFileWriter streamFileWriter = null;

        swarmPeersInfo = getSwarmPeersInfo();
        if(swarmPeersInfo == null) swarmPeersInfo = new HashMap<>(); //If an error occurs I continue, if it is persistent it will be handle by the others functions 

        try {
            streamFileWriter = new StreamFileWriter(peersStatisticsFile); //Opening the stream file
            streamFileWriter.openStream();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        while (!exit.get()) {
            peers = ipfsNode.bitswapStat().get("Peers").getAsJsonArray();
            if(peers != null){ //If it is null an error has occurred, the statistics are not updated
                bitswapLedger(peers);

                totalPeers = peers.size(); //Total peers connected with the node
                activePeers = mapActivePeers.size(); //Total peers that send some data to the node
                ActiveAndTotalPeers activeAndTotalPeers = new ActiveAndTotalPeers(totalPeers, activePeers); 
                String output = (!first_write ? "," : "") + gson.toJson(activeAndTotalPeers); //If I don't write for the first time to the file, I add a comma
                first_write = false;

                try {
                    streamFileWriter.write(output);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            else System.out.println(threadName+"IPFS node error (bitswapStat)");

            try {
                if(!exit.get()) Thread.sleep(15000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println(threadName+"Writing statistics to the file and closing the stream");
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
            if (statsPeer == null){ //If it is null an error has occurred, the statistics are not updated
                System.out.println(threadName+"IPFS node error (bitswapLedger)");
                return;
            }
            if(statsPeer.get("Recv").getAsInt() > 0){ //Making sure that the peer is an active peer that send some data
                String peerID = statsPeer.get("Peer").getAsString();
                long recv = statsPeer.get("Recv").getAsLong();
                long sent = statsPeer.get("Sent").getAsLong();
                long exchanged = statsPeer.get("Exchanged").getAsLong();
                Peer p = mapActivePeers.get(peerID);

                if(p == null){ //Checking if the peer is new and insert new statistics about it
                    insertNewPeer(peerID, recv, sent, exchanged);
                }
                else{ //Otherwise I update the statistics already present in memory
                    p.update(recv,sent,exchanged);
                }
            }
        }
    }


    private void insertNewPeer(String peerID, long recv, long sent, long exchanged){
        JsonObject peerRawStat = ipfsNode.dhtFindpeer(peerID);
        if (peerRawStat == null){ //If it is null an error has occurred, the statistics are not updated
            System.out.println(threadName+"IPFS node error (dhtFindpeer)");
            return;
        }
        JsonArray responses = peerRawStat.get("Responses").getAsJsonArray();
        JsonArray addrsPeer = responses.get(0).getAsJsonObject().get("Addrs").getAsJsonArray(); //Taking all the addresses of peerID
        String peerIP = null;
        JsonObject peerInfo = null;

        for(JsonElement addrPeer : addrsPeer){
            String addr = addrPeer.getAsString();
            if(!addr.startsWith("/ip6") && !addr.startsWith("/ip4/127")){ //Discarding all ipv6 and localhost addresses
                String [] splitAddr = addr.split("/");
                peerIP = splitAddr[2]; //Taking the peer ip
                peerInfo = getPeerInfo(peerIP); //Retrieving information about the ip
                if(peerInfo != null) break; //If peerInfo is not null there are information about peerIP, then I exit from the cycle
            }
        }

        String continent = peerInfo != null ? peerInfo.get("continent_name").getAsString() : null;
        String country = peerInfo != null ? peerInfo.get("country_name").getAsString() : null;
        String region = peerInfo != null ? peerInfo.get("region_name").getAsString() : null;
        String city = peerInfo != null ? peerInfo.get("city").getAsString() : null;

        JsonObject swarmPeerInfo = null;
        while(swarmPeerInfo == null){
            swarmPeerInfo = swarmPeersInfo.get(peerID);
            if(swarmPeerInfo == null){
                swarmPeersInfo = getSwarmPeersInfo(); //If I don't find the peer in the map I update it
                if(swarmPeerInfo == null) return; //If swarmPeerInfo is null an error has occurred,then the statistics are not updated
            }
        }

        JsonArray streamsArray = swarmPeerInfo.get("Streams").getAsJsonArray();
        String stringLatency = swarmPeerInfo.get("Latency").getAsString().split("\\.")[0]; //Taking the integer part of latency
        int latency =  Integer.parseInt(stringLatency);

        Peer p = new Peer(recv, sent, exchanged, latency, streamsArray, peerIP, continent, country, region, city);
        mapActivePeers.put(peerID,p);
    }


//  This method use ipstack.com API for retrieve some information about peerIP. Return a JsonObject if the call has success, null otherwise
    private JsonObject getPeerInfo(String peerIP){
        String apiKey = "?access_key=fe37b6a2e1adc9e2de57159bf4ae75a5";
        String ipstackIP = "http://api.ipstack.com/";
        HttpClient httpClient = HttpClient.newBuilder().build();
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(ipstackIP+peerIP+apiKey))
                .build();
        HttpResponse<String> response = null;
        Gson gson = new Gson();


        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        } catch (InterruptedException e) {
            e.printStackTrace();
            return null;
        }

        if(response.statusCode() != 200) return  null;

        JsonObject jsonResponse = gson.fromJson(response.body(), JsonObject.class);

        return jsonResponse.get("country_name").isJsonNull() ? null : jsonResponse;
    }


//  This method return a map with the couples (peerID, information related ). If an error occur it return null
    private Map<String, JsonObject> getSwarmPeersInfo(){
        Gson gson = new Gson();
        JsonObject rawResponse = ipfsNode.swarmPeers();
        if (rawResponse == null){
            System.out.println(threadName+"IPFS node error");
            return null;
        }
        Map<String,JsonObject> mapPeers = new HashMap<>();
        ArrayList<JsonObject> peersList = gson.fromJson(rawResponse.get("Peers"),new TypeToken<List<JsonObject>>(){}.getType()); //Creating an array of peers

        peersList.parallelStream().forEach(p -> mapPeers.put(p.get("Peer").getAsString(), p)); //Using java stream the mapPeers is filled with couples (peerId, information related)
        return mapPeers;
    }
}
