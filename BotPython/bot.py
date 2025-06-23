import os
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv
import webbrowser


load_dotenv()

# Configuration des intents
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.presences = True

# Création du bot avec le préfixe "/"
bot = commands.Bot(command_prefix="/", intents=intents)

# Quand le bot est prêt
@bot.event
async def on_ready():
    print(f"Connected as {bot.user} (ID: {bot.user.id})")

@bot.event
async def on_message(message):
    if message.author.bot:
        return
    if bot.user in message.mentions:
        await message.channel.send("STOP PINGING ME !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ")
        await message.channel.send("https://media.tenor.com/CWf8Fm-fnT0AAAAM/marisad-marisa-kirisame.gif")
    await bot.process_commands(message)

@bot.command()
async def openhtml(ctx):
    chemin_absolu = os.path.abspath("WEBinterface/Main.html")
    url_locale = f"file:///{chemin_absolu.replace(os.sep, '/')}"
    webbrowser.open(url_locale)
    await ctx.send("Le fichier HTML a été ouvert dans le navigateur.")


# Lancement du bot avec le token sécurisé
if __name__ == "__main__":
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        print("ERROR: DISCORD_TOKEN not found in environment variables.")
    else:
        bot.run(token)