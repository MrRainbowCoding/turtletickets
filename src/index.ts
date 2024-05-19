/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more information.
*/

import fs from "fs-extra";
import path from "node:path";
const jsonc = require("jsonc-parser");
import { GatewayIntentBits } from "discord.js";
import { config as envconf } from "dotenv";
import { ConfigType, ExtendedClient } from "./structure";
import http from "http";

// Create an HTTP server
const server = http.createServer((req, res) => {
	res.setHeader("Content-Type", "text/html");
	res.end(`
    <html>
      <head>
        <title>Your Web View</title>
      </head>
      <body style="margin: 0; padding: 0;">
        <iframe width="100%" height="100%" src="https://axocoder.vercel.app/" frameborder="0" allowfullscreen></iframe>
      </body>
    </html>`);
});

// Initialize .env file as environment
try {
	envconf();
} catch (ex) {
	console.log(".env failed to load");
}

// Handling unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection:", reason, promise);
});

process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err);
});

// ASCII art and connecting message
process.stdout.write(`
\x1b[38;2;143;110;250m████████╗██╗ ██████╗██╗  ██╗███████╗████████╗    ██████╗  ██████╗ ████████╗
\x1b[38;2;157;101;254m╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝    ██╔══██╗██╔═══██╗╚══██╔══╝
\x1b[38;2;172;90;255m   ██║   ██║██║     █████╔╝ █████╗     ██║       ██████╔╝██║   ██║   ██║   
\x1b[38;2;188;76;255m   ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║       ██╔══██╗██║   ██║   ██║   
\x1b[38;2;205;54;255m   ██║   ██║╚██████╗██║  ██╗███████╗   ██║       ██████╔╝╚██████╔╝   ██║   
\x1b[38;2;222;0;255m   ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝       ╚═════╝  ╚═════╝    ╚═╝\x1b[0m
                 https://github.com/Sayrix/ticket-bot

Connecting to Discord...
`);

// Update Detector
fetch("https://api.github.com/repos/MrRainbowCoding/TurtleTickets/tags")
	.then((res) => {
		if (!res.ok) return console.warn("🔄  Failed to pull latest version from server");
		return res.json();
	})
	.then((json) => {
		const latest = json[0].name.split(".").map((k: string) => parseInt(k, 10));
		const current = require("../package.json")
			.version.split(".")
			.map((k: string) => parseInt(k, 10));
		if (
			latest[0] > current[0] ||
			(latest[0] === current[0] && latest[1] > current[1]) ||
			(latest[0] === current[0] && latest[1] === current[1] && latest[2] > current[2])
		) {
			console.warn(`🔄  New version available: ${json[0].name}; Current Version: ${current.join(".")}`);
		} else {
			console.log("🔄  The ticket-bot is up to date");
		}
	})
	.catch((err) => {
		console.error("Error fetching latest version:", err);
	});

// Load configuration
const configFilePath = path.join(__dirname, "../config/config.jsonc");
const configFileContent = fs.readFileSync(configFilePath, "utf8");
const config = jsonc.parse(configFileContent);

// Create a new instance of the bot client
const client = new ExtendedClient(
	{
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
		presence: {
			status: config.status?.status ?? "online",
		},
	},
	config,
);

// Login the bot
const token = process.env["TOKEN"];
if (!token || token.trim() === "") {
	throw new Error("TOKEN Environment Not Found");
}
client.login(token).catch((err) => {
	console.error("Error logging in:", err);
});

server.listen(3000, () => {
	console.log("Server Online because of Axo Coder ✅!!");
});
