const { cmd, commands } = require("../command");

// 🖼️ MENU Image URL එක 
const MENU_IMAGE_URL = "https://raw.githubusercontent.com/Akashkavindu/ZANTA_MD/refs/heads/main/images/ChatGPT%20Image%20Nov%2021%2C%202025%2C%2001_49_53%20AM.png";

cmd(
    {
        pattern: "menu",
        react: "📜",
        desc: "Displays the main menu.",
        category: "main",
        filename: __filename,
    },
    async (
        zanta,
        mek,
        m,
        {
            from,
            reply
        }
    ) => {
        try {
            const categories = {};

            // Commands, Category Key අනුව වෙන් කිරීම
            for (let cmdName in commands) {
                const cmdData = commands[cmdName];
                
                // Category Case Sensitivity Fix එක තවදුරටත් තබමු.
                let cat = cmdData.category?.toLowerCase() || "other";
                if (cat === "genaral") cat = "other"; 

                if (cmdData.pattern === "menu") continue;
                
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push({
                    pattern: cmdData.pattern,
                    desc: cmdData.desc || `Use .${cmdData.pattern}`,
                });
            }

            // -----------------------------------------------------
            // A. Full Menu Generation (Non-Interactive)
            // -----------------------------------------------------
            
            let menuText = "╭━─━─━─━─━─━─━─━─━╮\n";
            menuText += "┃ 👑 *𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐙𝐀𝐍𝐓𝐀-𝐌𝐃* 🤖\n";
            menuText += "┃   _All Available Commands_\n";
            menuText += "╰━─━─━─━─━─━─━─━─━╯\n";
            
            // Iterate over all categories and list all commands
            for (const catKey in categories) {
                const catCommands = categories[catKey];

                let title = catKey.toUpperCase();
                if (title === 'OTHER') title = 'GENERAL'; // Revert 'other' back to 'GENERAL' for display

                menuText += `\n╭━━〔 📜 ${title}〕━━┈⊷\n`;

                catCommands.forEach(c => {
                    menuText += `│◻${c.pattern}\n`;
                    menuText += `╰──────────●●►\n`;
                });
            }
            
            // 3. Footer
            menuText += "\n➖➖➖➖➖➖➖➖➖➖➖\n";
            menuText += "> © 𝟐𝟎𝟐𝟓 | 𝐀𝐤𝐚𝐬𝐡 𝐊𝐚𝐯𝐢𝐧𝐝𝐮\n";
            
            // SEND IMAGE + MENU TEXT
            await zanta.sendMessage(
                from,
                {
                    image: { url: MENU_IMAGE_URL },
                    caption: menuText.trim(),
                },
                { quoted: mek }
            );

        } catch (err) {
            console.error(err);
            reply("❌ Error generating menu.");
        }
    }
);




