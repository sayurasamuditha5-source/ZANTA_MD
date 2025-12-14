const { cmd, commands } = require("../command");
const os = require('os');
const config = require("../config"); 

// 🖼️ MENU Image URL එක 
const MENU_IMAGE_URL = "https://github.com/Akashkavindu/ZANTA_MD/blob/main/images/menu.jpg?raw=true";

// 🎯 Memory Map to store the last sent Menu message ID for reply functionality.
// Key: Chat ID (from), Value: Message ID (id)
const lastMenuMessage = new Map(); // 🚨 FIX: මේ Map එක දැන් index.js වෙත Export කළ යුතුය.

cmd(
    {
        // 🚨 FIX: Pattern එක නැවතත් 'menu' ලෙස පමණක් තබා ඇත.
        pattern: "menu",
        react: "📜",
        desc: "Displays the main menu or a category list.",
        category: "main",
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

            const finalPrefix = prefix || config.PREFIX || '.'; 
            const botName = config.BOT_NAME || "ZANTA-MD"; 
            const ownerName = config.OWNER_NAME || 'Akash ';
            const totalCommands = commands.filter(c => c.pattern).length;
            const mode = config.WORK_TYPE || "Public"; 

            // 1. Commands Category අනුව Group කිරීම
            const groupedCommands = {};
            const activeCommands = commands.filter(c => c.pattern); 
            const categoryMap = {}; 
            const categoryKeys = []; 

            activeCommands.forEach(cmdData => {
                let cat = cmdData.category?.toLowerCase() || "other";
                if (cat === "genaral") cat = "other"; 
                if (cmdData.pattern === "menu") return; 

                if (!groupedCommands[cat]) {
                    groupedCommands[cat] = [];
                    categoryKeys.push(cat);
                }
                groupedCommands[cat].push(cmdData);
            });

            let catIndexForMap = 1;
            categoryKeys.forEach(cat => {
                categoryMap[catIndexForMap] = cat; 
                catIndexForMap++;
            });


            // ------------------------------------------------------------------
            // A. SELECTION LOGIC (Arguments OR Reply)
            // index.js මගින් reply selection එක args[0] හෝ m.body ලෙස යවන නිසා, 
            // මෙහිදී සෘජුවම එම අගය ලබාගත හැක.
            // ------------------------------------------------------------------

            let selectedCategory;
            // 🚨 FIX: args[0] හි අගය (උදා: .menu 1) හෝ m.body හි අගය (උදා: Reply කළ 1) ලබා ගැනීම.
            let selectionText = args[0]?.toLowerCase() || m.body?.toLowerCase(); 

            if (selectionText) {

                // .menu 1 ලෙස යැවූ විට .menu ඉවත් කර 1 පමණක් තබා ගැනීම
                if (selectionText.startsWith(finalPrefix + 'menu')) {
                    selectionText = selectionText.replace(finalPrefix + 'menu', '').trim().toLowerCase();
                } else if (selectionText.startsWith('menu')) {
                    // .menu නැති prefix menu 1 වැනි දේ
                    selectionText = selectionText.replace('menu', '').trim().toLowerCase();
                }

                const num = parseInt(selectionText);

                 if (!isNaN(num) && categoryMap[num]) {
                     selectedCategory = categoryMap[num];
                 } else {
                     // Category Name එක හරහා සෙවීම
                     selectedCategory = categoryKeys.find(cat => cat.toLowerCase() === selectionText);
                 }

                // Reply එක successful වූ පසු, ID එක ඉවත් කරන්න. (මෙය index.js මගින් ද කළ හැක.)
                if (selectedCategory && m.quoted) {
                     
                }
            }


            if (selectedCategory && groupedCommands[selectedCategory]) {
                // 📄 Selected Category එකේ Commands පෙන්වීම
                let displayTitle = selectedCategory.toUpperCase();
                if (displayTitle === 'OTHER') displayTitle = 'GENERAL'; 

                let commandList = `*Hello.. ${m.pushName || 'User'}🖐*\n`;
                commandList += `╭━─━─━─━─━─━─━─━╮\n`;
                commandList += `┃🎡 ${displayTitle} Command List:\n`;
                commandList += `╰━─━─━─━─━─━─━─━╯\n`;

                groupedCommands[selectedCategory].forEach((c) => {
                    const commandPattern = c.pattern.replace(finalPrefix, ''); 
                    const usage = c.pattern.startsWith(finalPrefix) ? c.pattern : finalPrefix + c.pattern;
                    const descLine = c.desc ? c.desc.split('\n')[0].trim() : 'No description provided.'; 
                    const usageDisplay = c.desc && c.desc.includes('<') ? usage + ' <args>' : usage; 

                    commandList += `\n╭──────────●●►\n`;
                    commandList += `│⛩ Command ☛ ${commandPattern}\n`; 
                    commandList += `│🌟 Desc ☛ ${descLine}\n`; 
                    commandList += `╰──────────●●►\n`;
                });

                commandList += `\n➠ Total Commands in ${displayTitle}: ${groupedCommands[selectedCategory].length}\n`;

                return reply(commandList); 

            } else if (selectionText && !selectedCategory) {
                 // Invalid argument/reply එකක් දුන්නොත්
                return reply(`❌ Invalid category number or name: *${selectionText}*\n\nType ${finalPrefix}menu to see available categories.`);
            }


            // ------------------------------------------------------------------
            // B. MAIN MENU MODE: .menu යැවූ විට (Categories List)
            // ------------------------------------------------------------------

            let menuText = `╭━〔 ${botName} WA BOT 〕━··๏\n`;
            menuText += `┃★╭──────────────\n`;
            menuText += `┃★│ 👑 Owner : ${ownerName}\n`; 
            menuText += `┃★│ ⚙ Mode : [${mode}]\n`;
            menuText += `┃★│ 🔣 Prefix : [${finalPrefix}]\n`;
            menuText += `┃★│ 📚 Commands : ${totalCommands}\n`;
            menuText += `┃★╰──────────────\n`;
            menuText += `╰━━━━━━━━━━━━━━┈⊷\n`;

            menuText += `╭━━〔 📜 MENU LIST 〕━━┈⊷\n`;

            let categoryNumber = 1; 

            categoryKeys.forEach(catKey => {
                const commandCount = groupedCommands[catKey].length;
                let title = catKey.toUpperCase();
                if (title === 'OTHER') title = 'GENERAL';

                let emoji;
                switch (catKey) {
                    case 'main': emoji = '🏠'; break;
                    case 'download': emoji = '📥'; break;
                    case 'convert': emoji = '🔄'; break;
                    case 'fun': emoji = '🙃'; break;
                    case 'game': emoji = '😎'; break;
                    case 'group': emoji = '👥'; break;
                    case 'media': emoji = '📸'; break; 
                    case 'search': emoji = '🔍'; break;
                    default: emoji = '📌'; break;
                }

                menuText += `┃◈╭─────────────·๏\n`;
                menuText += `┃◈│ ${categoryNumber}. ${emoji} ${title} (${commandCount})\n`; 
                menuText += `┃◈╰───────────┈⊷\n`;
                categoryNumber++;
            });

            menuText += `╰──────────────┈⊷\n`;

            menuText += `\n_💡 Commands බැලීමට:_\n`;
            menuText += `_1. *${finalPrefix}menu <අංකය>* ලෙස යවන්න (උදා: ${finalPrefix}menu 1)._\n`;
            menuText += `_2. *මෙම Menu එකට Reply කර අංකය යවන්න* (උදා: Reply කර 1 යවන්න)._`;

            // SEND IMAGE + MENU TEXT
            const sentMessage = await zanta.sendMessage(
                from,
                {
                    image: { url: MENU_IMAGE_URL },
                    caption: menuText.trim(),
                },
                { quoted: mek }
            );

            // 🎯 Sent Menu Message ID එක Memory එකේ store කිරීම
            lastMenuMessage.set(from, sentMessage.key.id);

        } catch (err) {
            console.error("Menu Command Error:", err);
            reply("❌ Error generating menu.");
        }
    }
);

// 🚨 FIX: index.js වෙත ප්‍රවේශය සඳහා lastMenuMessage Map එක Export කිරීම
module.exports = {
    lastMenuMessage
};

