export const serverUrl = process.env.CLOUD_URL || 'http://localhost:3000/offline',
    isOffline = serverUrl.includes('localhost');
