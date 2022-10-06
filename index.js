//variable waves API
const WavesAPI = require('waves-api');

const fs = require("fs")

var testnet = true; //true for testnet and false for mainnet

//defining the blockchain network - mainnet or testnet
const Waves = WavesAPI.create(testnet ? WavesAPI.TESTNET_CONFIG : WavesAPI.MAINNET_CONFIG);

//for stagenet
const newConfig = {

    // The byte allowing to distinguish networks (mainnet, testnet, devnet, etc)
    networkByte: 'S'.charCodeAt(0),

    // Node and Matcher addresses, no comments here
    nodeAddress: 'https://nodes-stagenet.wavesnodes.com',
    matcherAddress: 'https://nodes-stagenet.wavesnodes.com/matcher',

    // If a seed phrase length falls below that value an error will be thrown
    minimumSeedLength: 50

};

Waves.config.set(newConfig);

//setting the address
const seedpai = testnet ? "admit alley year floor write carry loop corn clown saddle follow you syrup wide awesome" : ""

//get keypair
const wk = Waves.Seed.fromExistingPhrase(seedpai)

//extension
const ex = ".waves"

/*
   How will the bot work?

   1. The bot will read the wordlist, get the name and check if it exists in the Waves blockchain already registered with the .waves extension
   2. After checking, if it exists it will remove that name from wordlsit
   3. If the name is not yet registered, a transaction will be sent with the name and extension .waves
   4. After creating the .waves domain, the whole process restarts until the end of the wordlist.

   Time spent on creation: 5 min
*/


async function start()
{
    console.log("Address:" + wk.address)
    var data = fs.readFileSync(__dirname+ '/wordlist.txt', 'utf-8')
    var linhas = data.split(/\r?\n/);
    linhas.forEach(async (linha) => {
        var aliases = linha.replace(" ","").toLocaleLowerCase()+ex
        if(await Waves.API.Node.v1.aliases.byAlias(aliases).then((data) => {return data.error == undefined || data.error == null ? false : true}).catch((err) => {return true}))
        {
            console.log("Valido:" + aliases)
            var createAliasData = {

                // That's a kind of a nickname you attach to your address
                alias: aliases,
            
                fee: 100000,
                timestamp: Date.now()
            
            };
            await Waves.API.Node.v1.aliases.createAlias(createAliasData,wk.keyPair).then((data) => {
                console.log("Criado com sucesso:" + linha);
            })
            .catch((err) => {console.log(err);})
        }
        else
        {
            data.replace(linha)
            fs.writeFileSync(__dirname+ '/wordlist.txt', data)
        }
    })
    // for(let i=0;i<content.length;i++){
    //     data.replace(content[i])
    // }
    // console.log(content)
    // fs.writeFileSync(__dirname+ '/wordlist.txt', content)
}

start();
