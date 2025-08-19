import mysql from 'mysql2/promise';

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'caboose.proxy.rlwy.net',
      user: 'root',
      password: 'MXDQGVVFmPIvcrrHRLzcSfUDufTajAaG',
      database: 'railway',
      port: 46400,
      ssl: {
        rejectUnauthorized: false  // <-- autorise les certificats auto-signés
      }
    });

    const [rows] = await connection.query('SELECT 1+1 AS result');
    console.log('Connexion OK :', rows[0]);
    await connection.end();
  } catch (err) {
    console.error('Erreur connexion :', err);
  }
})();
