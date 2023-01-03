// import mwrapper's "Bot" class
import pkg from './wrapper.cjs';
const { Bot } = pkg;
import * as dotenv from 'dotenv'
dotenv.config()
import random from 'random'
import pkg2 from '@-silver/random-rng'
const { gen_word } = pkg2;
import Audic from 'audic';

// make a new bot
const bot = new Bot('Amethyst', process.env.PASSWORD)

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

//lowdb
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)
await db.read()

//lowdb
if (!db.data) db.data = {"users": {}};

// thanks stack overflow :)
const capitalize = s => (s && s[0].toUpperCase() + s.slice(1)) || ""
function isPositiveInteger(n) {
    return 0 === n % (!isNaN(parseFloat(n)) && 0 <= ~~n);
}

// Used for !hello
const helloquotes = [
    "Hello %s!", "Amethyst has entered the chat", "Howdy hey, %s!",
    "Welcome back, %s!", "Your quote here!", "Welcome, %s!"
]

// Used for !whois
const permnames = ["User", "Moderator", "Mod Mark II", "Admin", "Sysadmin"]

// Used for !catsfx
const sfxVineBoom = new Audic('sfx/vineboom.mp3');
const sfxBoopBingBop = new Audic('sfx/boopbingbop.mp3');
const sfxHonk = new Audic('sfx/honk.mp3');
const sfxClown = new Audic('sfx/clown.mp3');

// Used for !gems daily
const twentyTwoHours = 22 * 60 * 60 * 1000

// all the bot stuff
bot.on('ready', () => {
    console.log('Bot is ready!');
})

bot.on('error', (err) => {
    console.log(err);
})

bot.on('post', async (message) => {
    try {
        if (!message.content.startsWith("!")) {
            return;
        }
    } catch {
        return;
    }
    let parsed = bot.parse(message, '!')

    if (parsed.command == 'help') {
        bot.post("!help - Shows this page. \n!hello - Hello! \n!rng - More random then life*. \n!catsfx - Terrorize @cat with sound effects. \n!whois - Who is that person?", message.origin)
        return;
    }
    if (parsed.command == 'hello') {
        bot.post(`${random.choice(helloquotes).replace("%s", message.author)}\n\nMade with mwrapper - Version 1 - Made by @cat`, message.origin)
        return;
    }
    if (parsed.command == 'rng') {
        bot.post(`Dice: ${random.int(1, 6)} \n1-100: ${random.int(1, 100)} \nCoinflip: ${random.choice(["Heads", "Tails"])} \nWord: ${gen_word()}`, message.origin)
        return;
    }
    if (parsed.command == 'catsfx') {
        if (parsed.args.length > 0) {
            switch(parsed.args[0]) {
                case "vineboom":
                    bot.post("Playing the vine boom sound effect on @cat's computer...", message.origin)
                    sfxVineBoom.play()
                    break;
                case "boopbingbop":
                    bot.post("Playing the boop bing bop sound effect on @cat's computer...", message.origin)
                    sfxBoopBingBop.play()
                    break;
                case "honk":
                    bot.post("Playing the goose honk sound effect on @cat's computer...", message.origin) 
                    sfxHonk.play()
                    break;
                case "clown":
                    bot.post("Playing the clown honk sound effect on @cat's computer...", message.origin)
                    sfxClown.play()
                    break;
            }
        } else {
            bot.post("Options: vineboom, boopbingbop, honk, clown", message.origin)
        }
        return;
    }
    if (parsed.command == 'whois') {
        if (parsed.args.length > 0) {
            try {
                let userData = await bot.get("profile", parsed.args[0])
                bot.post(`  「${userData['lower_username'].toUpperCase()}」  \nBanned: ${capitalize(userData['banned'].toString())} \nLevel: ${permnames[userData['lvl']]} \nCreated: ${new Date(userData['created'] * 1000).toLocaleString()} \nQuote: ${userData['quote']} \nUUID: ${userData['uuid']}`, message.origin)
            } catch {
                bot.post("Either that person doesn't exist, or something went wrong.", message.origin)
            }
        } else {
            bot.post("Please provide a user.", message.origin)
        }
        return;
    }
    if (parsed.command == 'gems') {
        if (!(db.data.users.hasOwnProperty(message.author))) {
            db.data.users[message.author] = {"gems": 0, "lastDaily": 0, "inventory": [], "equipped": []}
        }
        if (parsed.args.length == 0) {
            bot.post(`You have ${db.data.users[message.author].gems} gems. \n!gems daily (d) - Get some gems every 22 hours. \n!gems coinflip (cf) - Gamble your life savings away.`, message.origin)
        } else {
            switch(parsed.args[0].toLowerCase()) {
                case "daily":
                case "d":
                    if (db.data.users[message.author].lastDaily + twentyTwoHours < Date.now()) {
                        let randomAmount = random.int(20, 35)
                        db.data.users[message.author].gems += randomAmount
                        db.data.users[message.author].lastDaily = Date.now()
                        bot.post(`You got ${randomAmount} gems! You now have ${db.data.users[message.author].gems} gems.`, message.origin)
                        await db.write()
                    } else {
                        bot.post("You've already used your daily today!", message.origin)
                    }
                    break;
                case "coinflip":
                case "cf":
                    if (parsed.args.length > 1) {
                        if (isPositiveInteger(parsed.args[1])) {
                            if (db.data.users[message.author].gems >= parseInt(parsed.args[1])) {
                                if (random.bool()) {
                                    db.data.users[message.author].gems += parseInt(parsed.args[1])
                                    bot.post(`It landed on heads! You now have ${db.data.users[message.author].gems} gems.`, message.origin)
                                    await db.write()
                                } else {
                                    db.data.users[message.author].gems -= parseInt(parsed.args[1])
                                    bot.post(`Aww, it landed on tails. You now have ${db.data.users[message.author].gems} gems.`, message.origin)
                                    await db.write()
                                }
                            } else {
                                bot.post("You don't have enough gems for this.", message.origin)
                            }
                        } else {
                            bot.post("Please provide a valid number.", message.origin)
                        }
                    } else {
                        bot.post("Please provide many gems you want to coinflip.", message.origin)
                    }
                    break;
            }
        }
        return;
    }
})

// initialize bot
bot.login()
