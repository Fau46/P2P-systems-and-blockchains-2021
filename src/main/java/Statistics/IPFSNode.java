package Statistics;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class IPFSNode {
    private String IP;

    public IPFSNode(String IP){
        this.IP = "http://"+IP+"/api/v0";
    }


//  /bitswap/stat
    public JsonObject bitswapStat(){
        return sendRequestRetrieveResponse("/bitswap/stat");
     }


//  /object/stat
    public JsonObject objectStat(String CID){
        return sendRequestRetrieveResponse("/object/stat?arg="+CID);
    }


//  /get
    public int get(String CID) throws IOException, InterruptedException {
        String API = "/get?arg=";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(IP+API+CID))
                .timeout(Duration.ofDays(100))
                .POST(HttpRequest.BodyPublishers.ofString(""))
                .build();

        HttpClient client= HttpClient.newBuilder().build();
        HttpResponse<?> response = client.send(request, HttpResponse.BodyHandlers.discarding());
        return response.statusCode();
    }


//  /dag/get
    public JsonObject dagGet(String CID) throws IOException, InterruptedException { return sendRequestRetrieveResponse("/dag/get?arg="+CID); }


// /bitswap/ledger
    public JsonObject bitswapLedger(String peerID){ return sendRequestRetrieveResponse("/bitswap/ledger?arg="+peerID); }


//  /dht/findpeer
    public JsonObject dhtFindpeer(String peerID){
        return sendRequestRetrieveResponse("/dht/findpeer?arg="+peerID);
    }


//  /stats/bw
    public JsonObject statsBw(){
        return sendRequestRetrieveResponse("/stats/bw");
    }


//  /swarm/peers/
    public JsonObject swarmPeers(){
        return sendRequestRetrieveResponse("/swarm/peers?latency=true&streams=true");
    }


//  /stats/dht
    public JsonObject statsDht(){
        return sendRequestRetrieveResponse("/stats/dht?arg=wan");
    }


//  This method sends the request to the IPFS node and retrieves the response. Return a JsonObject if the request has success, null otherwise
    private JsonObject sendRequestRetrieveResponse(String httpCommand){
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(IP+httpCommand))
                .timeout(Duration.ofDays(100))
                .POST(HttpRequest.BodyPublishers.ofString(""))
                .build();

        HttpClient client= HttpClient.newBuilder().build();
        Gson gson = new Gson();
        String body = null;
        try {
            HttpResponse<?> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            body = response.body().toString();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return null;
        }

        JsonObject jsonObject = gson.fromJson(body, JsonObject.class);
        return  jsonObject;
    }

}
