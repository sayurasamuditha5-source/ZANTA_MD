const { cmd } = require("../command");

cmd({
    pattern: "jid",
    alias: ["myid", "userjid"],
    react: "🆔",
    desc: "Get user's JID or replied user's JID.",
    category: "main",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, sender }) => {
    try {
        // Reply karapu message ekak thiyanawanam eyage JID eka gannawa
        // Nathnam message eka ewapu kenage JID eka gannawa
        let targetJid = m.quoted ? m.quoted.sender : sender;

        let jidMsg = `╭━─━─━─━─━╮\n┃ 🆔 *USER JID INFO* ┃\n╰━─━─━─━─━╯\n\n`;
        jidMsg += `👤 *User:* @${targetJid.split('@')[0]}\n`;
        jidMsg += `🎫 *JID:* ${targetJid}\n\n`;

        if (isGroup) {
            jidMsg += `🏢 *Group JID:* ${from}\n\n`;
        }

        jidMsg += `> *© ZANTA-MD ID FINDER*`;

        // Mention ekak ekka message eka yawamu
        await zanta.sendMessage(from, { 
            text: jidMsg, 
            mentions: [targetJid] 
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ JID එක ලබා ගැනීමට නොහැකි විය.");
    }
});

cmd({
    pattern: "ping",
    alias: ["speed", "ms"],
    react: "⚡",
    desc: "Check bot's response speed.",
    category: "main",
    filename: __filename,
}, async (zanta, mek, m, { from, reply }) => {
    try {
        const startTime = Date.now(); // මැසේජ් එක ලැබුණු වෙලාව
        
        // මුලින්ම පුංචි මැසේජ් එකක් යවනවා
        const pinger = await zanta.sendMessage(from, { text: "🚀 *Checking Speed...*" }, { quoted: mek });
        
        const endTime = Date.now(); // රිප්ලයි එක යැවූ වෙලාව
        const ping = endTime - startTime; // කාලය අතර වෙනස

        const botName = global.CURRENT_BOT_SETTINGS?.botName || "ZANTA-MD";

        // රිප්ලයි එක Edit කරලා Speed එක පෙන්වනවා
        await zanta.sendMessage(from, { 
            text: `⚡ *${botName} SPEED REPORT*\n\n🚄 *Response Time:* ${ping}ms\n📡 *Status:* Online\n\n> *© ZANTA-MD*`, 
            edit: pinger.key 
        });

    } catch (err) {
        console.error(err);
        reply("❌ වේගය පරීක්ෂා කිරීමේදී දෝෂයක් විය.");
    }
});
