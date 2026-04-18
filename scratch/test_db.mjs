import pg from 'pg';
const { Client } = pg;

async function test() {
  const client = new Client({
    connectionString: "postgres://postgres:MEHDI123mehdi@db.ynucnmbfryminixhrtxc.supabase.co:5432/postgres?sslmode=require"
  });
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("Time from DB:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
