import { Account, Client, Realtime, TablesDB } from 'appwrite';

export const config = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT as string | undefined,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined,
  databaseId: (import.meta.env.VITE_APPWRITE_DATABASE_ID as string | undefined) || 'hearth',
  defaultCenter: [
    Number(import.meta.env.VITE_DEFAULT_LNG ?? 77.5946),
    Number(import.meta.env.VITE_DEFAULT_LAT ?? 12.9716),
  ] as [number, number],
};

export const isConfigured = Boolean(config.endpoint && config.projectId);

export const client = new Client();
if (isConfigured) client.setEndpoint(config.endpoint!).setProject(config.projectId!);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const realtime = new Realtime(client);

export const TABLES = { posts: 'posts', messages: 'messages', kudos: 'kudos' } as const;
