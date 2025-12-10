const { cmd, commands } = require("../command");
const os = require('os');
const config = require("../config"); 

// 🖼️ MENU Image URL එක (ඔබගේ code එකේ තිබූ පරිදි)
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
            reply,
            args,
            prefix 
        }
    ) => {
        try {

            // 🚨 FIX: Prefix එක නිවැරදිව ලබා ගැනීම
            const finalPrefix = prefix || config.PREFIX || '.'; 

            // 🌟 Status & Owner Data
            const botName = config.BOT_NAME || "ZANTA-MD"; 
            const ownerName = config.OWNER_NAME || 'Akash ';

            // සැබෑ RAM/RUNTIME ලබා ගැනීම සඳහා ඔබගේ බොට් එකේ code එකට අදාළ functions භාවිතා කරන්න
            const totalCommands = commands.filter(c => c.pattern).length;
            const mode = config.WORK_TYPE || "Public"; // Default to Public

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
            // A. ARGUMENTS MODE: .menu 1 හෝ .menu media යැවූ විට (Commands List)
            // ------------------------------------------------------------------
            if (args.length > 0) {

                let selectedCategory;
                const input = args[0].toLowerCase();

                const num = parseInt(input);
                if (!isNaN(num) && categoryMap[num]) {
                    selectedCategory = categoryMap[num];
                } else {
                    // Category Name එක හරහා සෙවීම
                    selectedCategory = categoryKeys.find(cat => cat.toLowerCase() === input);
                }

                if (selectedCategory && groupedCommands[selectedCategory]) {
                    // 📄 Selected Category එකේ Commands පෙන්වීම

                    let displayTitle = selectedCategory.toUpperCase();
                    if (displayTitle === 'OTHER') displayTitle = 'GENERAL'; 

                    // ✨ FANCY COMMAND LIST
                    let commandList = `*Hello.. ${m.pushName || 'User'}🖐*\n`;

                    commandList += `╭━─━─━─━─━─━─━─━╮\n`;
                    commandList += `┃🎡 ${displayTitle} Command List:\n`;
                    commandList += `╰━─━─━─━─━─━─━─━╯\n`;

                    groupedCommands[selectedCategory].forEach((c) => {
                        const commandPattern = c.pattern.replace(finalPrefix, ''); 
                        const usage = c.pattern.startsWith(finalPrefix) ? c.pattern : finalPrefix + c.pattern;

                        // desc එකේ පළමු පේළිය පමණක් ගන්න.
                        const descLine = c.desc ? c.desc.split('\n')[0].trim() : 'No description provided.'; 

                        // use එකට <args> එකතු කිරීමට 
                        const usageDisplay = c.desc && c.desc.includes('<') ? usage + ' <args>' : usage; 

                        commandList += `\n╭──────────●●►\n`;
                        commandList += `│⛩ Command ☛ ${commandPattern}\n`; 
                        commandList += `│🌟 Desc ☛ ${descLine}\n`; 
                        commandList += `╰──────────●●►\n`;
                    });

                    commandList += `\n➠ Total Commands in ${displayTitle}: ${groupedCommands[selectedCategory].length}\n`;

                    return reply(commandList); 

                } else {
                    return reply(`❌ Invalid category number or name: *${args[0]}*\n\nType ${finalPrefix}menu to see available categories.`);
                }
            }


            // ------------------------------------------------------------------
            // B. MAIN MENU MODE: .menu යැවූ විට (Categories List)
            // ------------------------------------------------------------------

            // ✨ FANCY MAIN MENU
            let menuText = `╭━〔 ${botName} WA BOT 〕━··๏\n`;
            menuText += `┃★╭──────────────\n`;
            menuText += `┃★│ 👑 Owner : ${ownerName}\n`; 
            menuText += `┃★│ ⚙ Mode : [${mode}]\n`;
            menuText += `┃★│ 🔣 Prefix : [${finalPrefix}]\n`;
            menuText += `┃★│ 📚 Commands : ${totalCommands}\n`;
            menuText += `┃★╰──────────────\n`;
            menuText += `╰━━━━━━━━━━━━━━┈⊷\n`;

            menuText += `╭━━〔 📜 MENU LIST 〕━━┈⊷\n`;

            let categoryNumber = 1; // අනුක්‍රමික අංකය 1 න් ආරම්භ කිරීම

            categoryKeys.forEach(catKey => {
                const commandCount = groupedCommands[catKey].length;
                let title = catKey.toUpperCase();
                if (title === 'OTHER') title = 'GENERAL';

                // Emoji mapping 
                let emoji;
                switch (catKey) {
                    case 'main':
                        emoji = '🏠';
                        break;
                    case 'download':
                        emoji = '📥';
                        break;
                    case 'convert':
                        emoji = '🔄';
                        break;
                    case 'fun':
                        emoji = '🙃';
                        break;
                    case 'game':
                        emoji = '😎';
                        break;
                    case 'group':
                        emoji = '👥';
                        break;
                    case 'image':
                        emoji = '🖼';
                        break;
                    case 'logo':
                        emoji = '🎨';
                        break;
                    case 'owner':
                        emoji = '👑';
                        break;
                    case 'search':
                        emoji = '🔍';
                        break;
                    case 'settings':
                        emoji = '⚙';
                        break;
                    default:
                        emoji = '📌';
                        break;
                }

                menuText += `┃◈╭─────────────·๏\n`;
                menuText += `┃◈│ ${categoryNumber}. ${emoji} ${title} (${commandCount})\n`; 
                menuText += `┃◈╰───────────┈⊷\n`;
                categoryNumber++;
            });

            // අවසාන කොටස වසා දැමීම
            menuText += `╰──────────────┈⊷\n`;

            menuText += `\n_💡 Type ${finalPrefix}menu <number> or ${finalPrefix}menu <category> to see commands._`;

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
            console.error("Menu Command Error:", err);
            reply("❌ Error generating menu.");
        }
    }
);

