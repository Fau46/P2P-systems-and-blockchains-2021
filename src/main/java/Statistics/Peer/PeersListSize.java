package Statistics.Peer;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Calendar;

public class PeersListSize {
    private int totalPeers;
    private int activePeers;
    private String time;

    public PeersListSize(int totalPeers, int activePeers){
        this.totalPeers = totalPeers;
        this.activePeers = activePeers;
        this.time = LocalDateTime.now().toString();
    };
}
