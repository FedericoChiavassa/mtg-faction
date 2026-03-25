# Workers

This package contains the code responsible for importing and processing card data from Scryfall through a [cron job](../.github/workflows/sync-scryfall.yml).

Main script is [import-scryfall.ts](import-scryfall.ts).

Responsibilities:

- Fetch data from the Scryfall API
- Normalize card data as needed
- Calculate faction statistics
- Run in batches to avoid memory and performance issues
- Track sync status in the database
- Testable using Vitest

## Local Development

See [../README.md](../README.md)
