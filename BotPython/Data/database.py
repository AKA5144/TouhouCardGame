import aiomysql
import os
from dotenv import load_dotenv

load_dotenv()

pool = None

async def get_connection():
    global pool
    if pool is None:
        pool = await aiomysql.create_pool(
            host='caboose.proxy.rlwy.net',
            port=46400,
            user='root',
            password=os.getenv("DB_PASS", ""),
            db='railway',
            autocommit=True
        )
    return pool
