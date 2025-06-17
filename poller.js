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
  console.log("🚀 Starting poller...");
  console.log("🔧 DB Host:", DB_HOST);
  console.log("🔧 API Host:", API_HOST);

  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    console.log("✅ Connected to database");

    const [rows] = await connection.execute(
      "SELECT mc_id FROM enhanced_profile_statuses WHERE ep_status != 'Complete'"
    );

    console.log(`📄 Retrieved ${rows.length} records to process`);

    for (const row of rows) {
      console.log(`➡️ Sending POST for mc_id: ${row.mc_id}`);
      try {
        const response = await axios.post(`${API_HOST}/fulfill/status`, { mc_id: row.mc_id });
        console.log("✅ Success:", response.data);
      } catch (err) {
        console.error("❌ API Error:", row.mc_id, err.message);
      }
    }

    await connection.end();
    console.log("✅ Connection closed. Poller finished.");
  } catch (err) {
    console.error("❌ Poller Failed:", err);
  }
}

run();

