const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
const aliveMessageData = require('./plugins/aliveMsg'); 

function convertToBool(text, fault = 'true') {
return text === fault ? true : false;
}


const OWNER_NUMBER = '94743404814'; // ඔබගේ Bot Owner ගේ අංකය
const DEFAULT_BOT_NAME = process.env.BOT_NAME || "ZANTA-MD";
const ALIVE_MSG_TEMPLATE = aliveMessageData.getAliveMessage();


const FINAL_ALIVE_MSG = ALIVE_MSG_TEMPLATE
    .replace(/{BOT_NAME}/g, DEFAULT_BOT_NAME)
    .replace(/{OWNER_NUMBER}/g, OWNER_NUMBER); 


module.exports = {
SESSION_ID: process.env.SESSION_ID || "sZ1VHISb#0YiwxzcjtmS7PHR2QqIKMZlf31VCGH9VZ7vMa6l6GGc", //Your session id
ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Akashkavindu/ZANTA_MD/refs/heads/main/images/ChatGPT%20Image%20Nov%2021%2C%202025%2C%2001_21_32%20AM.png",
ALIVE_MSG: process.env.ALIVE_MSG || FINAL_ALIVE_MSG, 
BOT_OWNER: OWNER_NUMBER, 
BOT_NAME: DEFAULT_BOT_NAME,
AUTO_STATUS_REACT: (process.env.AUTO_STATUS_REACT || "true") === "true", //true or false
ALWAYS_ONLINE: (process.env.ALWAYS_ONLINE || "false") === "true" // 'true' or 'false'
};
