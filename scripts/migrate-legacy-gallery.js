require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { runLegacyMigration, isProductionDatabaseUrl } = require('../lib/gallery/migration.ts');

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('TURSO_DATABASE_URL is not set');
    process.exit(1);
  }

  if (isProductionDatabaseUrl(url) && apply) {
    console.error('Refusing to run with --apply on a suspected production database.');
    console.error('Use a local or staging database, or explicitly override with --force-production if you accept the risk.');
    process.exit(1);
  }

  const report = await runLegacyMigration({ url, authToken, apply });

  console.log('\n--- Migration Report ---');
  console.log('Applied schema:', report.applied);
  console.log('Categories seeded:', report.categoriesSeeded);
  console.log('Albums created:', report.albumsCreated);
  console.log('Horse profiles created:', report.horseProfilesCreated);
  console.log('Review queue rows:', report.reviewQueueRows);
  console.log('Legacy rows processed:', report.legacyRows);
  console.log('By category:', report.byCategory);
  if (report.warnings.length) {
    console.log('\nWarnings:');
    for (const w of report.warnings) console.log(' -', w);
  }
  if (report.errors.length) {
    console.log('\nErrors:');
    for (const e of report.errors) console.log(' -', e);
  }

  const total = report.albumsCreated + report.horseProfilesCreated + report.reviewQueueRows;
  if (total !== report.legacyRows) {
    console.error(`\nRECONCILIATION FAILED: ${total} rows accounted for out of ${report.legacyRows} legacy rows.`);
    process.exit(1);
  }
  console.log('\nReconciliation OK:', `${total}/${report.legacyRows}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
