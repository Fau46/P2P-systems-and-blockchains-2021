#!/bin/bash
docker build -t ipfs .
docker run -it -v $HOME/ipfs:/ipfs/StatisticsFiles ipfs
