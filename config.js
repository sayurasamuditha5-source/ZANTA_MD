const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
const aliveMessageData = require('./plugins/aliveMsg'); 

function convertToBool(text, fault = 'true') {
return text === fault ? true : false;
}


const OWNER_NUMBER = '94766247995'; // ඔබගේ Bot Owner ගේ අංකය
const DEFAULT_BOT_NAME = process.env.BOT_NAME || "ZANTA-MD-v2";
const ALIVE_MSG_TEMPLATE = aliveMessageData.getAliveMessage();


const FINAL_ALIVE_MSG = ALIVE_MSG_TEMPLATE
    .replace(/{BOT_NAME}/g, DEFAULT_BOT_NAME)
    .replace(/{OWNER_NUMBER}/g, OWNER_NUMBER); 


module.exports = {
SESSION_ID: process.env.SESSION_ID || "sE8AEAqB#N8IswjTJ8U4VdoFH3vw8KtaJZYX4NEkhjz_tuT6faA0", //Your session id
ALIVE_IMG: process.env.ALIVE_IMG || "https://github.com/Akashkavindu/ZANTA_MD/blob/main/images/alive-new.jpg?raw=true",
ALIVE_MSG: process.env.ALIVE_MSG || FINAL_ALIVE_MSG, 
BOT_OWNER: OWNER_NUMBER, 
BOT_NAME: DEFAULT_BOT_NAME
};
