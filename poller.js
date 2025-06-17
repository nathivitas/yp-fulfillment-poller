const mysql = require('mysql2/promise');
const axios = require('axios');

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  API_HOST
} = process.env;

async function run() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  });

  const [rows] = await connection.execute("SELECT mc_id FROM enhanced_profile_statuses WHERE ep_status != 'Complete'");
  for (const row of rows) {
    try {
      const response = await axios.post(`${API_HOST}/fulfill/status`, { mc_id: row.mc_id });
      console.log("✅", response.data);
    } catch (err) {
      console.error("❌", row.mc_id, err.message);
    }
  }

  await connection.end();
}

run();
