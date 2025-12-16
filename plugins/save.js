const { cmd } = require("../command");

// 🖼️ SAVE View Once Image/Video Command
cmd(
{
    pattern: "save",
    react: "💾",
    desc: "Saves View Once image or video.",
    category: "media",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        // 1. Reply පණිවිඩයක් දැයි පරීක්ෂා කිරීම
        if (!m.quoted) {
            return reply("කරුණාකර *View Once Image* හෝ *Video* පණිවිඩයක් Reply කරන්න.");
        }

        const quotedMsg = m.quoted.msg;
        
        if (!quotedMsg) {
            return reply(`❌ Reply කළ පණිවිඩයේ දත්ත සොයා ගැනීමට නොහැක. එය media පණිවිඩයක් දැයි පරීක්ෂා කරන්න.`);
        }

        // 2. View Once Message එකක්දැයි පරීක්ෂා කිරීම
        const isViewOnce = quotedMsg.viewOnce === true;

        if (!isViewOnce) {
            // Reply කළ පණිවිඩයේ වර්ගය පෙන්වමු
            return reply(`මෙය *View Once* පණිවිඩයක් නොවේ. (Actual Type: ${m.quoted.type})`);
        }

        // 3. Image හෝ Video එකක්දැයි පරීක්ෂා කිරීම
        const actualMessageType = m.quoted.type;

        if (actualMessageType !== 'imageMessage' && actualMessageType !== 'videoMessage') {
            return reply("කරුණාකර *View Once Image* හෝ *Video* එකක් Reply කරන්න.");
        }

        reply("💾 View Once Media Download කරමින්...");

        // 4. Media Buffer එක Download කිරීම
        // lib/msg.js හි ඇති downloadMediaMessage function එක මෙහිදී ක්‍රියාත්මක වේ.
        const mediaBuffer = await m.quoted.download();

        if (!mediaBuffer || mediaBuffer.length === 0) {
            return reply("❌ Media Download කිරීමට නොහැකි විය. Media Key දෝෂයක් විය හැක.");
        }

        // 5. Media එක නැවත Chat එකට යැවීම
        const senderJid = m.quoted.sender;
        const captionText = `🖼️ *Saved View Once Media*\nSender: @${senderJid.split('@')[0]}`;
        
        if (actualMessageType === 'imageMessage') {
            await zanta.sendMessage(
                from,
                { image: mediaBuffer, caption: captionText, mentions: [senderJid] },
                { quoted: mek }
            );
        } else if (actualMessageType === 'videoMessage') {
            await zanta.sendMessage(
                from,
                { video: mediaBuffer, caption: captionText, mentions: [senderJid] },
                { quoted: mek }
            );
        }

        await zanta.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Save Command Error:", e);
        reply(`*Error:* Save කිරීමේදී දෝෂයක් සිදුවිය: ${e.message}`);
    }
});
