require("dotenv").config()
const solanaWeb3 = require('@solana/web3.js');
const bip39 = require('bip39');
const { fork } = require('child_process');
const path = require('path');
const fs=require("fs")
const processPath=path.resolve(__dirname,"process.js");


if(!fs.existsSync(path.resolve(__dirname,"logs"))){
    fs.mkdirSync(path.resolve(__dirname,"logs"))
}

const childProcesses=[];

for (let index = 0; index < 10; index++) {
    const childProcess=fork(processPath);
    childProcesses.push(childProcess)
    childProcess.on("exit",()=>{
        for(var oneChildProcess of childProcesses){
            oneChildProcess.kill();
        }
    })
}


