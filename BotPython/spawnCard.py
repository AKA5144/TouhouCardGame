import discord
from discord import app_commands, Embed
from discord.ui import View, Button
import os
from Data import database
from Data.user_utils import ensure_user_registered

class AcquireCardView(View):
    def __init__(self, user_id: int, card_id: int):
        super().__init__(timeout=60)  # bouton actif 60 sec max
        self.user_id = user_id
        self.card_id = card_id

    @discord.ui.button(label="Get", style=discord.ButtonStyle.green)
    async def acquire_button(self, interaction: discord.Interaction, button: Button):
        # Vérifie que c'est bien le même utilisateur
        if interaction.user.id != self.user_id:
            await interaction.response.send_message("❌ do not steal !!!!!!!!!!!!!!", ephemeral=True)
            return
        
        pool = await database.get_connection()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                query = """
                INSERT INTO user_cards (discord_id, card_id, quantity, first_acquired_at, last_acquired_at)
                VALUES (%s, %s, 1, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                  quantity = quantity + 1,
                  last_acquired_at = NOW()
                """
                print(f"Executing query to add card: user_id={self.user_id}, card_id={self.card_id}")
                await cursor.execute(query, (self.user_id, self.card_id))
                await conn.commit()
                print("Query executed and committed")

        await interaction.response.edit_message(content="✅ CARD GET", view=None)


async def spawn_command(interaction: discord.Interaction):
    await interaction.response.defer()
    pool = await database.get_connection()
    await ensure_user_registered(pool, interaction.user)

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            # Tirage aléatoire d'un deck
            await cursor.execute("SELECT ID, name FROM deck ORDER BY RAND() LIMIT 1")
            deck_row = await cursor.fetchone()
            if deck_row is None:
                await interaction.followup.send("❌ Aucun deck trouvé.")
                return
            deck_id, deck_name = deck_row

            # Tirage aléatoire d'une carte dans ce deck
            await cursor.execute(
                "SELECT id, name, image_url FROM card WHERE deck_id = %s ORDER BY RAND() LIMIT 1",
                (deck_id,)
            )
            card_row = await cursor.fetchone()
            if card_row is None:
                await interaction.followup.send(f"❌ Aucune carte trouvée dans le deck `{deck_name}`.")
                return
            card_id, card_name, image_path = card_row

    if not os.path.isfile(image_path):
        await interaction.followup.send(f"❌ Image locale introuvable : `{image_path}`")
        return

    file = discord.File(image_path, filename="card_image.webp")
    embed = Embed(title=f"Carte : {card_name} (Deck : {deck_name})")
    embed.set_image(url="attachment://card_image.webp")

    view = AcquireCardView(user_id=interaction.user.id, card_id=card_id)

    await interaction.followup.send(embed=embed, file=file, view=view)


def register_spawn(tree: app_commands.CommandTree):
    @tree.command(name="spawn", description="Affiche une carte aléatoire d'un deck aléatoire")
    async def spawn(interaction: discord.Interaction):
        await spawn_command(interaction)
