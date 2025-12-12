const { cmd } = require("../command");
const { getContentType } = require("@whiskeysockets/baileys"); 
const config = require("../config"); 

cmd(
    {
        pattern: "send", 
        react: "📥",
        desc: "Download status",
        category: "media",
        filename: __filename,
    },
    async (
        zanta,
        mek,
        m,
        {
            from,
            reply,
            args,
            prefix 
        }
    ) => {
        try {

            if (!m.quoted) {
                return reply(`❌ Status message එකකට reply කර *${prefix}get* ලෙස යවන්න.`);
            }

            const quotedObject = m.quoted;

            // View Once Saver එකේ තිබූ Logic එක භාවිතා කරමින් innerMessage එක සොයා ගැනීම
            const innerMessage = quotedObject.msg || quotedObject.message; 

            if (!innerMessage) {
                return reply(`❌ Reply කළ පණිවිඩයේ දත්ත සොයා ගැනීමට නොහැක.`);
            }

            // 1. 🚨 Status Message එකක් දැයි පරීක්ෂා කිරීම
            if (!quotedObject.isStatus) {

                // Status Message එකක් නොවේ නම්, Type එක පෙන්වමු.
                // ඔබගේ .save command එකේ logic එක: innerMessage.type || getContentType(innerMessage)
                let actualType = innerMessage.type || getContentType(innerMessage);

                // පෙර නිවැරදි කළ Custom Logic
                if (innerMessage.mimetype) {
                    if (innerMessage.mimetype.startsWith('image')) {
                        actualType = 'imageMessage';
                    } else if (innerMessage.mimetype.startsWith('video')) {
                        actualType = 'videoMessage';
                    } else if (innerMessage.mimetype.startsWith('audio')) {
                        actualType = 'audioMessage';
                    }
                }

                if (typeof innerMessage === 'string' && innerMessage.length > 0) {
                     actualType = 'conversation';
                }

                return reply(`⚠️ කරුණාකර reply කරන්න *Status Message* එකකට පමණි. (Actual Type: ${actualType || 'unknown'})`);
            }

            // 2. 🌟 FIX: Status එකේ Media type එක හඳුනා ගැනීම (mtype වෙනුවට type භාවිතා කිරීම)
            // m.quoted.type යනු ඔබගේ sms function එකේ set කළ Baileys Content Type එකයි.
            const type = quotedObject.type; // <-- මෙතන වෙනස් කළා

            if (type === 'imageMessage' || type === 'videoMessage') {

                reply("📥 Status Download කරමින්...");

                await zanta.sendMessage(from, { react: { text: "⏳", key: mek.key } });

                // 3. Media buffer එක ලබා ගැනීම
                const media = await quotedObject.download();

                if (!media || media.length === 0) {
                    return reply("❌ Status එක Download කිරීමට නොහැකි විය.");
                }

                // 4. Status එක නැවත Send කිරීම

                const senderJid = quotedObject.sender;

                if (type === 'imageMessage') {
                    await zanta.sendMessage(
                        from, 
                        { 
                            image: media, 
                            caption: `🖼️ *Status Image Saved*\nStatus Owner: @${senderJid.split('@')[0]}`,
                            mentions: [senderJid]
                        }, 
                        { quoted: mek }
                    );

                } else if (type === 'videoMessage') {
                    await zanta.sendMessage(
                        from, 
                        { 
                            video: media, 
                            caption: `📹 *Status Video Saved*\nStatus Owner: @${senderJid.split('@')[0]}`,
                            mentions: [senderJid]
                        }, 
                        { quoted: mek }
                    );
                }

                await zanta.sendMessage(from, { react: { text: "✅", key: mek.key } });

            } else {
                return reply(`❌ මෙම Status වර්ගය (${type}) Save කළ නොහැක.`);
            }


        } catch (err) {
            console.error("Status Saver Command Error:", err);
            reply("❌ Status එක Download කිරීමේදී දෝෂයක් සිදුවිය.");
        }
    }
);
