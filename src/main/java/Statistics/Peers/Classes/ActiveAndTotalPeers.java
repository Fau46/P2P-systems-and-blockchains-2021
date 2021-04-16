package Statistics.Peers.Classes;

import java.time.LocalDateTime;

public class ActiveAndTotalPeers {
    private String time;
    private int totalPeers;
    private int activePeers;

    public ActiveAndTotalPeers(int totalPeers, int activePeers){
        this.totalPeers = totalPeers;
        this.activePeers = activePeers;
        this.time = LocalDateTime.now().toString();
    };
}
