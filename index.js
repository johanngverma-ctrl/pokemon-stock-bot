require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");

console.log("Starting bot...");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// 🔎 PRODUCTS
const products = [
  // KMART NZ
  {
    name: "Kmart - Ascended Heroes",
    url: "https://www.kmart.co.nz/search/?searchTerm=Pokemon%20Ascended%20Heroes",
    selector: "button, a"
  },
  {
    name: "Kmart - First Partner Collection",
    url: "https://www.kmart.co.nz/search/?searchTerm=Pokemon%20First%20Partner%20Collection",
    selector: "button, a"
  },
  {
    name: "Kmart - Prismatic Evolutions",
    url: "https://www.kmart.co.nz/search/?searchTerm=Pokemon%20Prismatic%20Evolutions",
    selector: "button, a"
  },

  // FARMERS
  {
    name: "Farmers - Ascended Heroes",
    url: "https://www.farmers.co.nz/search?q=Pokemon%20Ascended%20Heroes",
    selector: "button, a"
  },
  {
    name: "Farmers - First Partner Collection",
    url: "https://www.farmers.co.nz/search?q=Pokemon%20First%20Partner%20Collection",
    selector: "button, a"
  },
  {
    name: "Farmers - Prismatic Evolutions",
    url: "https://www.farmers.co.nz/search?q=Pokemon%20Prismatic%20Evolutions",
    selector: "button, a"
  },

  // JB HI-FI
  {
    name: "JB Hi-Fi - Ascended Heroes",
    url: "https://www.jbhifi.co.nz/search?query=Pokemon%20Ascended%20Heroes",
    selector: "button, a"
  },
  {
    name: "JB Hi-Fi - First Partner Collection",
    url: "https://www.jbhifi.co.nz/search?query=Pokemon%20First%20Partner%20Collection",
    selector: "button, a"
  },
  {
    name: "JB Hi-Fi - Prismatic Evolutions",
    url: "https://www.jbhifi.co.nz/search?query=Pokemon%20Prismatic%20Evolutions",
    selector: "button, a"
  },

  // PAPER PLUS
  {
    name: "Paper Plus - Ascended Heroes",
    url: "https://www.paperplus.co.nz/search?q=Pokemon%20Ascended%20Heroes",
    selector: "button, a"
  },
  {
    name: "Paper Plus - First Partner Collection",
    url: "https://www.paperplus.co.nz/search?q=Pokemon%20First%20Partner%20Collection",
    selector: "button, a"
  },
  {
    name: "Paper Plus - Prismatic Evolutions",
    url: "https://www.paperplus.co.nz/search?q=Pokemon%20Prismatic%20Evolutions",
    selector: "button, a"
  },

  // FOUR SQUARE (no product pages, fallback)
  {
    name: "Four Square - Pokemon Cards",
    url: "https://www.foursquare.co.nz/",
    selector: "button, a"
  },

  // WHITCOULLS
  {
    name: "Whitcoulls - Ascended Heroes",
    url: "https://www.whitcoulls.co.nz/search?q=Pokemon%20Ascended%20Heroes",
    selector: "button, a"
  },
  {
    name: "Whitcoulls - First Partner Collection",
    url: "https://www.whitcoulls.co.nz/search?q=Pokemon%20First%20Partner%20Collection",
    selector: "button, a"
  },
  {
    name: "Whitcoulls - Prismatic Evolutions",
    url: "https://www.whitcoulls.co.nz/search?q=Pokemon%20Prismatic%20Evolutions",
    selector: "button, a"
  },

  // CACIO KEEP
  {
    name: "Cacio Keep - Pokemon",
    url: "https://caciokeep.co.nz/search?q=Pokemon",
    selector: "button, a"
  },

  // THE WAREHOUSE
  {
    name: "The Warehouse - Ascended Heroes",
    url: "https://www.thewarehouse.co.nz/search?q=Pokemon%20Ascended%20Heroes",
    selector: "button, a"
  },
  {
    name: "The Warehouse - First Partner Collection",
    url: "https://www.thewarehouse.co.nz/search?q=Pokemon%20First%20Partner%20Collection",
    selector: "button, a"
  },
  {
    name: "The Warehouse - Prismatic Evolutions",
    url: "https://www.thewarehouse.co.nz/search?q=Pokemon%20Prismatic%20Evolutions",
    selector: "button, a"
  },

  // PAK'N SAVE (fallback)
  {
    name: "Pak'n Save - Pokemon Cards",
    url: "https://www.paknsave.co.nz/",
    selector: "button, a"
  },

  // TOYWORLD
  {
    name: "Toyworld - Ascended Heroes",
    url: "https://www.toyworld.co.nz/search?q=Pokemon%20Ascended%20Heroes",
    selector: "button, a"
  },
  {
    name: "Toyworld - First Partner Collection",
    url: "https://www.toyworld.co.nz/search?q=Pokemon%20First%20Partner%20Collection",
    selector: "button, a"
  },
  {
    name: "Toyworld - Prismatic Evolutions",
    url: "https://www.toyworld.co.nz/search?q=Pokemon%20Prismatic%20Evolutions",
    selector: "button, a"
  }

];

let stockStatus = {}; // keeps track of previous stock state

// 🔍 CHECK STOCK
async function checkStock(product) {
  try {
    const response = await axios.get(product.url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    let inStock = false;

$(product.selector).each((i, el) => {
  const text = $(el).text().toLowerCase();

  if (
    (text.includes("add to cart") ||
     text.includes("buy now") ||
     text.includes("add to basket") ||
     text.includes("add to bag")) &&
    !text.includes("out of stock") &&
    !text.includes("sold out")
  ) {
    inStock = true;
  }
});
    // Detect stock keywords
    return text.includes("add to cart") || text.includes("buy now") || text.includes("add to basket");

  } catch (err) {
    console.log(`Error checking ${product.name}:`, err.message);
    return false;
  }
}

// 🔁 MAIN LOOP
async function monitorStock() {
  console.log("--- Running stock check ---");

  try {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);

    for (let product of products) {
      const inStock = await checkStock(product);
      console.log(`${product.name} | In Stock: ${inStock}`);

      // Only alert if previously out of stock and now in stock
      if (inStock && stockStatus[product.name] === false) {
        console.log("🚨 Sending @everyone alert!");
        await channel.send(`🚨 **@everyone IN STOCK!**\n**Product:** ${product.name}\n**Link:** ${product.url}`);
      }

      // Update status
      stockStatus[product.name] = inStock;
    }

  } catch (error) {
    console.error("Failed to fetch channel. Check your CHANNEL_ID in .env");
  }
}

// ✅ BOT READY
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  await channel.send("✅ **Stock Bot is now online and monitoring!**");

  // Initialize stock statuses to false
  products.forEach(p => stockStatus[p.name] = false);

  // Run immediately, then every 15 seconds
  monitorStock();
  setInterval(monitorStock, 15000);
});

client.login(process.env.TOKEN);