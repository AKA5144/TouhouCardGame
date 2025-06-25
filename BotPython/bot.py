import os
import discord
from discord.ext import commands
from discord import app_commands,Embed
from dotenv import load_dotenv
import decks
from Data import database

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="/", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (ID: {bot.user.id})")
    conn = await database.get_connection()
    await decks.initDeck(conn, 1)
    await bot.tree.sync(guild=None) 
    print("Slash commands synchronisées.")

@bot.event
async def on_message(message):
    if message.author.bot:
        return
    if bot.user in message.mentions:
        await message.channel.send ("STOP PINGING ME !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ")
        await message.channel.send("https://media.tenor.com/CWf8Fm-fnT0AAAAM/marisad-marisa-kirisame.gif")
    await bot.process_commands(message)

@bot.tree.command(name="website", description="get the website")
async def website(interaction: discord.Interaction):
    embed = Embed(title="Online Website !", url="https://aka5144.github.io/TouhouCardGame")
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="showdeck", description="Display the Deck")
async def showdeck(interaction: discord.Interaction):
    await decks.send_deck(interaction)

if __name__ == "__main__":
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        print("ERROR: DISCORD_TOKEN not found in environment variables.")
    else:
        bot.run(token)
