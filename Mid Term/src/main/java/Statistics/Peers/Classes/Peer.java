package Statistics.Peers.Classes;

import com.google.gson.JsonArray;

public class Peer {
    long recv;
    long sent;
    long exchanged;
    int latency;
    JsonArray streams;
    String IP;
    String continent;
    String country;
    String region;
    String city;

    public Peer(long recv, long sent, long exchanged, int latency, JsonArray streams, String IP, String continent, String country, String region, String city){
        this.recv = recv;
        this.sent = sent;
        this.exchanged = exchanged;
        this.latency = latency;
        this.streams = streams;
        this.IP = IP;
        this.continent = continent;
        this.country = country;
        this.region = region;
        this.city = city;
    }

    public void update(long recv, long sent, long exchanged){
        this.recv = this.recv != recv ? recv : this.recv;
        this.sent = this.sent != recv ? sent : this.sent;
        this.exchanged = this.exchanged != exchanged ? exchanged : this.exchanged;
    }
}
