import aiomysql
import os
from dotenv import load_dotenv

load_dotenv()

pool = None

async def get_connection():
    global pool
    if pool is None:
        pool = await aiomysql.create_pool(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASS', ''),
            db=os.getenv('DB_NAME', 'Touhou_decks'),
            autocommit=True
        )
    return pool
