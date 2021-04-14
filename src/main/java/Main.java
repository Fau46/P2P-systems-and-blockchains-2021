import Statistics.AgentVersion.AgentVersionStatistics;
import Statistics.Bandwidth.BandwidthStatistics;
import Statistics.IPFSNode;
import Statistics.OutputStats;
import Statistics.Peer.ActivePeersStatistics;
import Statistics.Streams.StreamsStatistics;
import Statistics.TaskInterface;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        String IP = "192.168.1.128:5001";
        String CID = "QmNoscE3kNc83dM5rZNUC5UDXChiTdDcgf16RVtFCRWYuU ";
        String time = null;

        //Check if the node is available
        try {
            Socket socket = new Socket("192.168.1.128",5001);
            socket.close();
        } catch (IOException e) {
            System.out.println("The node is not available");
            return;
        }

        IPFSNode ipfsNode = new IPFSNode(IP);
        JsonObject bitswapStat = ipfsNode.bitswapStat();


        //Create thread pool and task list
        ExecutorService threadPool = Executors.newCachedThreadPool();
        List<TaskInterface> taskList = new ArrayList<>();

        //Setup tasks
        Test test = new Test();
        GetObject getObjectTask = new GetObject(IP,CID);
        OutputStats outputStatTask = new OutputStats(IP, CID, bitswapStat);
        ActivePeersStatistics activePeersStatisticsTask = new ActivePeersStatistics(IP, CID);
        BandwidthStatistics bandwidthStatisticsTask = new BandwidthStatistics(IP);
        StreamsStatistics streamsStatisticsTask = new StreamsStatistics(IP);
        AgentVersionStatistics agentVersionStatisticsTask = new AgentVersionStatistics(IP);

        taskList.add(outputStatTask);
        taskList.add(activePeersStatisticsTask);
        taskList.add(bandwidthStatisticsTask);
        taskList.add(streamsStatisticsTask);
        taskList.add(agentVersionStatisticsTask);


        //Start the threads
//        Future<String> futureGetObjectTask = threadPool.submit(test);
        Future<String> futureGetObjectTask = threadPool.submit(getObjectTask);
        for(TaskInterface task : taskList){
            threadPool.submit((Runnable) task);
        }


        try {
            time = futureGetObjectTask.get();

            //Stop tasks
            for(TaskInterface task : taskList){
                task.stop();
            }

            //Shutdown threadpool
            threadPool.shutdown();
            threadPool.awaitTermination(90,TimeUnit.SECONDS);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }

        System.out.println("\nDownload finished, total time "+time);


    }



}
