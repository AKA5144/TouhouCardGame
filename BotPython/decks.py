import discord
from discord.ui import View, Button

class Card :
  def __init__(self, name: str, image: str):
    self.name = name
    self.image = image


imagePath = [
  "../Assets/Decks/Default/marisa-neutral.webp",
  "../Assets/Decks/Default/reimu-neutral.webp",
  "../Assets/Decks/Default/kirin-neutral.webp",
]

defaultDeck = []

def initDeck():
    defaultDeck.clear()
    defaultDeck.extend([
        Card("Marisa Kirisame", imagePath[0]),
        Card("Reimu Hakurei", imagePath[1]),
        Card("Satsuki Rin", imagePath[2]),
    ])

class DeckView(View):
    def __init__(self, deck):
        super().__init__(timeout=120)  
        self.deck = deck
        self.index = 0

    async def update_embed(self, interaction):
        card = self.deck[self.index]
        filename = f"image_{self.index}.webp"
        file = discord.File(card.image, filename=filename)
        embed = discord.Embed(title=card.name)
        embed.set_image(url=f"attachment://{filename}")
        await interaction.response.edit_message(embed=embed, attachments=[file], view=self)

    @discord.ui.button(label="Previous", style=discord.ButtonStyle.primary)
    async def previous(self, interaction: discord.Interaction, button: Button):
        self.index = (self.index - 1) % len(self.deck)
        await self.update_embed(interaction)

    @discord.ui.button(label="Next", style=discord.ButtonStyle.primary)
    async def next(self, interaction: discord.Interaction, button: Button):
        self.index = (self.index + 1) % len(self.deck)
        await self.update_embed(interaction)


async def send_deck(interaction: discord.Interaction):
    view = DeckView(defaultDeck)
    card = defaultDeck[0]
    file = discord.File(card.image, filename="image_0.webp")
    embed = discord.Embed(title=card.name)
    embed.set_image(url="attachment://image_0.webp")
    await interaction.response.send_message(embed=embed, file=file, view=view)