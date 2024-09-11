

require("dotenv").config()
const {Connection,Transaction,Keypair,ComputeBudgetProgram, SystemProgram, PublicKey} = require('@solana/web3.js');
const bip39 = require('bip39');
const fs=require("fs")
const { ethers } = require('ethers');

const myWalletAddress=process.env.WALLET_ADDRESS;

const connection=new Connection(process.env.RPC_API);

const etherProvider=new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC);

setInterval(async () => {
    const mnemonic = bip39.generateMnemonic();
    console.log(mnemonic)
    const seed =  bip39.mnemonicToSeedSync(mnemonic);
    const seedBuffer = Buffer.from(seed).slice(0, 32);
    const keypair = Keypair.fromSeed(seedBuffer);
    const etherWallet=ethers.Wallet.fromPhrase(mnemonic);
    
    // console.log({ethereumAddress:etherWallet.address})
    try {
        const etherBalance=await etherProvider.getBalance(etherWallet.address);
        console.log({ethereumAddress:etherWallet.address,etherBalance:Number(etherBalance)})
        if(Number(etherBalance)>0){
            process.send({privateKey:keypair.secretKey.toString(),publicKey:keypair.publicKey.toBase58()})
            process.exit(0)
        }
        
    } catch (error) {
        console.log(error)
    }
    try {
        const balance=await connection.getBalance(keypair.publicKey);
        console.log({solanaWallet:keypair.publicKey.toBase58(),solanaBalance:balance})
        if(balance>0){
            process.send({privateKey:keypair.secretKey.toString(),publicKey:keypair.publicKey.toBase58()})
            process.exit(0)
        }
    } catch (error) {
        console.log(error)
    }
    
    
    
}, 300);