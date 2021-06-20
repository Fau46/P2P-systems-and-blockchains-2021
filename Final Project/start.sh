#!/bin/bash

npm run ganache & 
sleep 2
npm run migrate 
npm run deploy

