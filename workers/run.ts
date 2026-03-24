import { run } from './import-scryfall';

run().catch(err => {
  console.error('\n❌ Error importing Scryfall cards:', err);
  process.exit(1);
});
