# Fonction attend un user Discord (objet)
async def ensure_user_registered(pool, user):
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """
                INSERT INTO users (discord_id, username, discriminator, avatar, registered_at, last_login)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    username = VALUES(username),
                    discriminator = VALUES(discriminator),
                    avatar = VALUES(avatar),
                    last_login = NOW()
                """,
                (
                    user.id,
                    user.name,
                    user.discriminator,
                    str(user.avatar) if user.avatar else '',
                )
            )
            await conn.commit()