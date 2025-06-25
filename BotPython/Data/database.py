import aiomysql
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def get_connection():
    return await aiomysql.connect(
        host='localhost',
        port=3306,
        user='root',
        password=os.getenv("DB_PASS", ""),
        db='Touhou_decks',
    )