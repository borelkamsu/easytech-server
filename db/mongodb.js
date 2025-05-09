// mongodb.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lama:lama@cluster0.254tgqb.mongodb.net/easytech?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'easytech';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Options for MongoDB client
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // If no connection, create a new one
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI, options);
    try {
      await cachedClient.connect();
      console.log('Connecté avec succès à MongoDB Atlas');
    } catch (error) {
      console.error('Erreur de connexion à MongoDB:', error);
      throw error;
    }
  }

  // Get reference to database
  cachedDb = cachedClient.db(DB_NAME);
  return cachedDb;
}

export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('Déconnexion de MongoDB Atlas');
  }
}
