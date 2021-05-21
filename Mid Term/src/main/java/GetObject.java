import Statistics.IPFSNode;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.Callable;

public class GetObject implements Callable {
    String CID;
    String IP;


    public GetObject(String IP, String CID){
        this.CID = CID;
        this.IP = IP;
    }

    @Override
    public String call() throws Exception {
        IPFSNode ipfsNode = new IPFSNode(IP);
        Instant start = Instant.now();

        try {
            ipfsNode.get(CID);
        }catch (IOException | InterruptedException e){
            e.printStackTrace();
            return null;
        }

        Instant end = Instant.now();
        Duration interval = Duration.between(start,end);
        long seconds = interval.getSeconds();

        return String.format(
                "%d:%02d:%02d",
                seconds / 3600,
                (seconds % 3600) / 60,
                seconds % 60);
    }
}
