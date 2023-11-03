import { InMemoryDatabase } from './InMemoryDatabase.js';
import { AceBaseClient } from './AcebaseClient.js';
import { Database } from './Database.js';

export async function getDatabase(deleteDbOnStart: boolean, databaseType: string, databasePath = '.'): Promise<Database | null> {
  if (databaseType === 'ACEBASE') {
    const acebaseClient = new AceBaseClient();
    await acebaseClient.connect('airswapDb', deleteDbOnStart, databasePath);
    return Promise.resolve(acebaseClient);
  } else if (databaseType === 'IN_MEMORY') {
    const inMemoryDb = new InMemoryDatabase();
    await inMemoryDb.connect('airswapDb', deleteDbOnStart, databasePath);
    return Promise.resolve(inMemoryDb);
  }
  return Promise.resolve(null);
}
