const { cmd } = require("../command");

cmd(
    {
        pattern: "save",
        react: "✅",
        desc: "Resend Status or One-Time View Media",
        category: "download",
        filename: __filename,
    },
    async (
        zanta,
        mek,
        m,
        {
            from,
            quoted,
            reply,
            // You can destructure more variables if needed
        }
    ) => {
        try {
            // 1. Check if the user replied to a message
            if (!quoted) {
                return reply("*කරුණාකර ඔබට save කර ගැනීමට අවශ්‍ය Media Message එකකට (Status, OTV, Photo/Video) reply කරන්න!* 🧐");
            }

            // 2. Check for the actual media content container (fakeObj is crucial for OTV/Status)
            const mediaMessage = quoted.fakeObj;
            
            if (!mediaMessage) {
                // If fakeObj is null or undefined, it means it's not a message containing media data.
                return reply("*The replied message does not contain any Status, One-Time View, or recognizable Media!* 🤷‍♂️");
            }

            let saveCaption = "*💾 Saved and Resent!*";

            // 3. Set a specific caption based on the message type
            if (quoted.isStatus) {
                saveCaption = "*✅ Saved and Resent from Status!*";
            } else if (quoted.isViewOnce) {
                // One-Time View media is ready to be forwarded via mediaMessage
                saveCaption = "*📸 Saved and Resent from One-Time View!*";
            } 
            
            // Note: We don't need complex mtype checks here. copyNForward handles the media type (image, video, etc.) inside mediaMessage.
            
            // 4. Copy and Forward the media
            // zanta.copyNForward is the correct method for OTV and Status media extraction/resending.
            await zanta.copyNForward(from, mediaMessage, {
                caption: saveCaption,
                quoted: mek // Quote the original 'save' message
            });

            return reply("*Media successfully processed and resent!* ✨");

        } catch (e) {
            console.error(e);
            reply(`*Error saving media:* ${e.message || e}`);
        }
    }
);
