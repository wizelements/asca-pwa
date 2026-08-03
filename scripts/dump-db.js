#!/usr/bin/env node
/* Dump the Turso DB (schema + data) to a SQL file for backup. */
const { createClient } = require('@libsql/client');
const fs = require('node:fs');

function sqlValue(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'bigint') return v.toString();
  if (v instanceof Uint8Array || Buffer.isBuffer(v)) {
    return `X'${Buffer.from(v).toString('hex')}'`;
  }
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_DATABASE_URL not set');

  const out = process.argv[2];
  if (!out) throw new Error('usage: dump-db.js <output.sql>');

  const db = createClient({ url, authToken });
  const stream = fs.createWriteStream(out);
  const write = (s) => stream.write(s + '\n');

  write('-- Turso backup ' + new Date().toISOString());
  write('PRAGMA foreign_keys=OFF;');
  write('BEGIN TRANSACTION;');

  const master = await db.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' AND name != 'libsql_wasm_func_table' ORDER BY name"
  );

  for (const table of master.rows) {
    const name = table.name;
    write('');
    write(`-- Table: ${name}`);
    write(`${table.sql};`);

    const countRes = await db.execute(`SELECT COUNT(*) AS c FROM "${name}"`);
    const count = Number(countRes.rows[0].c);
    const cols = (await db.execute(`SELECT * FROM "${name}" LIMIT 0`)).columns;
    const colList = cols.map((c) => `"${c}"`).join(', ');

    const batch = 50;
    for (let offset = 0; offset < count; offset += batch) {
      const res = await db.execute(
        `SELECT * FROM "${name}" LIMIT ${batch} OFFSET ${offset}`
      );
      for (const row of res.rows) {
        const vals = cols.map((c) => sqlValue(row[c])).join(', ');
        write(`INSERT INTO "${name}" (${colList}) VALUES (${vals});`);
      }
    }
    console.log(`${name}: ${count} rows`);
  }

  const indexes = await db.execute(
    "SELECT sql FROM sqlite_master WHERE type IN ('index','trigger','view') AND sql IS NOT NULL"
  );
  write('');
  for (const row of indexes.rows) write(`${row.sql};`);

  write('COMMIT;');
  await new Promise((resolve) => stream.end(resolve));
  console.log('Backup written to ' + out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
