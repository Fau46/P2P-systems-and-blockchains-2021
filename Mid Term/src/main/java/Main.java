import Aux_Classes.BufferedFileWriter;
import Statistics.AgentVersions.AgentVersionStatistics;
import Statistics.Bandwidth.BandwidthStatistics;
import Statistics.IPFSNode;
import Statistics.OutputStats;
import Statistics.Peers.ActivePeersStatistics;
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
        String CID = "QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm";
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
        if(bitswapStat == null) { //If it is null an error has occurred
            System.out.println("[MAIN] IPFS node error");
            return;
        }

        //Create thread pool and task list
        ExecutorService threadPool = Executors.newCachedThreadPool();
        List<TaskInterface> taskList = new ArrayList<>();

        //Setup tasks
        GetObject getObjectTask = new GetObject(IP,CID);
        OutputStats outputStatTask = new OutputStats(IP, CID, bitswapStat);
        ActivePeersStatistics activePeersStatisticsTask = new ActivePeersStatistics(IP);
        BandwidthStatistics bandwidthStatisticsTask = new BandwidthStatistics(IP);
        StreamsStatistics streamsStatisticsTask = new StreamsStatistics(IP);
        AgentVersionStatistics agentVersionStatisticsTask = new AgentVersionStatistics(IP);

        taskList.add(outputStatTask);
        taskList.add(activePeersStatisticsTask);
        taskList.add(bandwidthStatisticsTask);
        taskList.add(streamsStatisticsTask);
        taskList.add(agentVersionStatisticsTask);


        //Start the threads
        Future<String> futureGetObjectTask = threadPool.submit(getObjectTask);
        for(TaskInterface task : taskList){
            threadPool.submit((Runnable) task);
        }


        try {
            time = futureGetObjectTask.get();
            System.out.println("\n");

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

        try {
            BufferedFileWriter bufferedFileWriter = new BufferedFileWriter("time.txt");
            bufferedFileWriter.writeAndClose(time);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }



}
