// This application uses GitHub as its database via the frontend
// The server is minimal and only serves the static files
// All data operations happen through the GitHub API from the client

export interface IStorage {}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
