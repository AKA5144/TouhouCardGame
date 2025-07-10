import os
from PIL import Image
import discord
from discord import Embed
from Data import database
from Data.user_utils import ensure_user_registered
from discord.ui import View, Button
from discord import app_commands
import random
from shutil import copyfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
rarityMap = {
    0: None,  # Pas de bordure pour les cartes Common
    1: os.path.normpath(os.path.join(PROJECT_ROOT, "Assets", "Border", "bronze.png")),
    2: os.path.normpath(os.path.join(PROJECT_ROOT, "Assets", "Border", "silver.png")),
    3: os.path.normpath(os.path.join(PROJECT_ROOT, "Assets", "Border", "gold.png")),
    4: os.path.normpath(os.path.join(PROJECT_ROOT, "Assets", "Border", "rainbow.png")),
}

RARITY_WEIGHTS = {
    0: 85,  # Common
    1: 10,  # Bronze
    2: 4,  # Silver
    3: 0.75,   # Gold
    4: 0.25    # Rainbow
}

def compose_card_image(card_path, border_path, output_path):
    card_img = Image.open(card_path).convert("RGBA")
    border_img = Image.open(border_path).convert("RGBA")
    border_img = border_img.resize(card_img.size)
    combined = Image.alpha_composite(card_img, border_img)
    combined.save(output_path)

class AcquireCardView(View):
    def __init__(self, user_id: int, card_id: int, rarity: int = 1):
        super().__init__(timeout=60)
        self.user_id = user_id
        self.card_id = card_id
        self.rarity = rarity

    @discord.ui.button(label="Get", style=discord.ButtonStyle.green)
    async def acquire_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user.id != self.user_id:
            await interaction.response.send_message("❌ Do not steal!", ephemeral=True)
            return
        
        pool = await database.get_connection()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                rarity_str = str(self.rarity)
                json_path = f'$."{rarity_str}"'  # JSON path littéral
                
                # Construire la requête en insérant le JSON path directement dans la chaîne
                query = f"""
INSERT INTO user_cards (discord_id, card_id, quantity_by_rarity, first_acquired_at, last_acquired_at)
VALUES (%s, %s, JSON_SET('{{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0}}', '{json_path}', 1), NOW(), NOW())
ON DUPLICATE KEY UPDATE
    quantity_by_rarity = JSON_SET(
        quantity_by_rarity,
        '{json_path}',
        COALESCE(CAST(JSON_EXTRACT(quantity_by_rarity, '{json_path}') AS UNSIGNED), 0) + 1
    ),
    last_acquired_at = NOW()
"""
                # Attention, seuls user_id et card_id sont passés en paramètres ici
                await cursor.execute(query, (self.user_id, self.card_id))
                await conn.commit()

        await interaction.response.edit_message(content=f"✅ CARD GET (Rarity {self.rarity})", view=None)

async def spawn_command(interaction: discord.Interaction):
    await interaction.response.defer()
    pool = await database.get_connection()
    await ensure_user_registered(pool, interaction.user)

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT ID, name FROM deck ORDER BY RAND() LIMIT 1")
            deck_row = await cursor.fetchone()
            if deck_row is None:
                await interaction.followup.send("❌ Aucun deck trouvé.")
                return
            deck_id, deck_name = deck_row

            await cursor.execute(
                "SELECT id, name, image_url FROM card WHERE deck_id = %s ORDER BY RAND() LIMIT 1",
                (deck_id,)
            )
            card_row = await cursor.fetchone()
            if card_row is None:
                await interaction.followup.send(f"❌ Aucune carte trouvée dans le deck `{deck_name}`.")
                return
            card_id, card_name, image_path_relative = card_row

    # Construire le chemin absolu à partir de la racine projet
    image_path = os.path.normpath(os.path.join(PROJECT_ROOT, image_path_relative))

    if not os.path.isfile(image_path):
        await interaction.followup.send(f"❌ Image locale introuvable : `{image_path}`")
        return

    rarity = draw_random_rarity()
    border_path = rarityMap.get(rarity)
    if border_path is not None:
        if not os.path.isfile(border_path):
            await interaction.followup.send(f"❌ Bordure introuvable : `{border_path}`")
            return
    else:
        border_path = None

    combined_image_path = os.path.join(os.path.dirname(__file__), "temp_combined.png")

    if border_path is not None:
     compose_card_image(image_path, border_path, combined_image_path)
    else:
     copyfile(image_path, combined_image_path)

    file = discord.File(combined_image_path, filename="card_image.png")
    rarity_colors = {
    1: 0xcd7f32,  # Bronze
    2: 0xc0c0c0,  # Silver
    3: 0xffd700,  # Gold
    4: 0x9400d3,  # Rainbow → Violet
}
    rarity_messages = {
            1: "Border: Bronze",
            2: "Border: Silver",
            3: "Border: Gold",
            4: "Border: Rainbow !!!!!!!!"
            }

    rarity_text = rarity_messages.get(rarity, "Border: Common")
    color = rarity_colors.get(rarity, 0xaaaaaa) 

    embed = discord.Embed(
    title=f"Card : {card_name} (Deck : {deck_name})",
    description=f"Border: {rarity_text}",
    color=color
)
    embed.set_image(url="attachment://card_image.png")

    view = AcquireCardView(user_id=interaction.user.id, card_id=card_id, rarity=rarity)

    await interaction.followup.send(embed=embed, file=file, view=view)

def register_spawn(tree: app_commands.CommandTree):
    @tree.command(name="spawn", description="Affiche une carte aléatoire d'un deck aléatoire")
    async def spawn(interaction: discord.Interaction):
        await spawn_command(interaction)

def draw_random_rarity():
    rarities = list(RARITY_WEIGHTS.keys())
    weights = list(RARITY_WEIGHTS.values())
    return random.choices(rarities, weights=weights, k=1)[0]

def register_spawn(tree: app_commands.CommandTree):
    @tree.command(name="spawn", description="Affiche une carte aléatoire d'un deck aléatoire")
    async def spawn(interaction: discord.Interaction):
        await spawn_command(interaction)

def draw_random_rarity():
    rarities = list(RARITY_WEIGHTS.keys())
    weights = list(RARITY_WEIGHTS.values())
    return random.choices(rarities, weights=weights, k=1)[0]


def register_spawncard_debug(tree: app_commands.CommandTree):
    MY_USER_ID = 350765625511247873

    @tree.command(
        name="spawncard_debug",
        description="Spawn une carte spécifique pour un utilisateur avec une rareté donnée"
    )
    @app_commands.describe(
        user="Utilisateur qui recevra la carte",
        card_id="ID de la carte à spawn",
        rarity="Rareté de la carte (0 à 4)"
    )
    async def spawncard_debug(
        interaction: discord.Interaction,
        user: discord.User,
        card_id: int,
        rarity: int,
    ):  
        if interaction.user.id != MY_USER_ID:
            await interaction.response.send_message("❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral=True)
            return

        await interaction.response.defer()

        if rarity < 0 or rarity > 4:
            await interaction.followup.send("❌ La rareté doit être comprise entre 0 et 4.", ephemeral=True)
            return

        pool = await database.get_connection()

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Vérifier que la carte existe
                await cursor.execute("SELECT id, name, image_url, deck_id FROM card WHERE id = %s", (card_id,))
                card_row = await cursor.fetchone()
                if card_row is None:
                    await interaction.followup.send(f"❌ Carte avec ID {card_id} introuvable.", ephemeral=True)
                    return
                _, card_name, image_path_relative, deck_id = card_row

                # Récupérer le nom du deck
                await cursor.execute("SELECT name FROM deck WHERE ID = %s", (deck_id,))
                deck_row = await cursor.fetchone()
                deck_name = deck_row[0] if deck_row else "Unknown deck"

        image_path = os.path.normpath(os.path.join(PROJECT_ROOT, image_path_relative))
        if not os.path.isfile(image_path):
            await interaction.followup.send(f"❌ Image locale introuvable : `{image_path}`", ephemeral=True)
            return

        border_path = rarityMap.get(rarity)
        if border_path is not None and not os.path.isfile(border_path):
            await interaction.followup.send(f"❌ Bordure introuvable : `{border_path}`", ephemeral=True)
            return

        combined_image_path = os.path.join(os.path.dirname(__file__), "temp_combined_debug.png")
        if border_path is not None:
            compose_card_image(image_path, border_path, combined_image_path)
        else:
            copyfile(image_path, combined_image_path)

        file = discord.File(combined_image_path, filename="card_image.png")

        rarity_colors = {
            1: 0xcd7f32,  # Bronze
            2: 0xc0c0c0,  # Silver
            3: 0xffd700,  # Gold
            4: 0x9400d3,  # Rainbow
        }
        rarity_messages = {
            1: "Border: Bronze",
            2: "Border: Silver",
            3: "Border: Gold",
            4: "Border: Rainbow !!!!!!!!"
        }

        rarity_text = rarity_messages.get(rarity, "Border: Common")
        color = rarity_colors.get(rarity, 0xaaaaaa)

        embed = discord.Embed(
            title=f"Debug Spawn Card : {card_name} (Deck : {deck_name})",
            description=f"Border: {rarity_text}\nGive to : {user}",
            color=color
        )
        embed.set_image(url="attachment://card_image.png")

        view = AcquireCardView(user_id=user.id, card_id=card_id, rarity=rarity)

        await interaction.followup.send(embed=embed, file=file, view=view)