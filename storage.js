// storage.js
import { mongoStorage } from "./db/MongoStorage.js";

// Export the MongoDB implementation directly
export const storage = mongoStorage;
