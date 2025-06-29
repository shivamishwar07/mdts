import Dexie, { Table } from "dexie";
import { message } from "antd";
export interface MineType {
  id?: number;
  type: string;
  description?: string;
}

export interface Library {
  id?: number;
  title: string;
  content?: string;
}

export interface Document {
  id?: number;
  [key: string]: any;
}

export interface DiskStorage {
  id?: number;
  path: string;
  content: string;
}


export class DataStorage extends Dexie {
  mineTypes!: Table<MineType, number>;
  modules!: Table<any, number>;
  projects!: Table<any, number>;
  moduleLibrary!: Table<Library, number>;
  users!: Table<any, number>;
  holidays!: Table<any, number>;
  projectTimelines!: Table<any, number>;
  documents!: Table<Document, number>;
  diskStorage!: Table<DiskStorage, number>;
  constructor() {
    super("MTDS");
    this.version(1).stores({
      mineTypes: "++id, type",
      modules: "++id",
      moduleLibrary: "++id",
      projects: "++id",
      users: "++id",
      holidays: "++id",
      projectTimelines: "++id",
      documents: "++id, name",
      diskStorage: "++id, path",
    });

    this.mineTypes = this.table("mineTypes");
    this.modules = this.table("modules");
    this.moduleLibrary = this.table("moduleLibrary");
    this.projects = this.table("projects");
    this.users = this.table("users");
    this.holidays = this.table("holidays");
    this.projectTimelines = this.table("projectTimelines");
    this.documents = this.table("documents");
    this.diskStorage = this.table("diskStorage");
  }

  async addModule(module: any): Promise<number> {
    if (!module || typeof module !== "object") {
      throw new Error("Invalid module data: Module must be an object.");
    }
    return this.modules.add({ ...module });
  }

  async getModules(): Promise<any> {
    return this.modules.toArray();
  }

  async saveModules(modules: any[]): Promise<void> {
    await this.modules.clear();
    await this.modules.bulkAdd(modules);
  }

  async deleteModule(id: number): Promise<void> {
    await this.modules.delete(id);
  }

  async addMineType(mineType: MineType): Promise<number> {
    return this.mineTypes.add(mineType);
  }

  async getAllMineTypes(): Promise<MineType[]> {
    return this.mineTypes.toArray();
  }

  async addProject(project: any): Promise<number> {
    return this.projects.add(project);
  }

  async getProjects(): Promise<any[]> {
    return this.projects.toArray();
  }

  async deleteProject(id: number): Promise<void> {
    await this.projects.delete(id);
  }

  async updateProject(id: any, updatedData: any): Promise<void> {
    const numericId = Number(id);

    if (isNaN(numericId)) {
      throw new Error(`Invalid project ID: ${id}`);
    }
    const existingProject = await this.projects.get(numericId);

    if (!existingProject) {
      console.warn(`Project with ID ${numericId} not found. Adding it as a new record.`);
    }

    function sanitizeData(obj: any): any {
      return JSON.parse(
        JSON.stringify(obj, (_key: any, value) => {
          if (typeof value === "function") {
            return undefined;
          }
          if (value && typeof value === "object" && value["$isDayjsObject"]) {
            return value.$d;
          }
          return value;
        })
      );
    }

    const sanitizedData = sanitizeData(updatedData);
    sanitizedData.id = numericId;
    await this.deleteProject(id);
    await this.projects.put(sanitizedData);
  }

  async addLibrary(library: any): Promise<number> {
    return this.moduleLibrary.add(library);
  }

  async getAllLibraries(): Promise<any> {
    return this.moduleLibrary.toArray();
  }

  async getLibraryById(id: any): Promise<any> {
    return this.moduleLibrary.get(id);
  }

  async updateLibrary(id: number, newRecord: any): Promise<void> {
    try {
      const existingLibrary = await this.moduleLibrary.get(id);
      if (existingLibrary) {
        const updatedLibrary = { ...newRecord, id };
        await this.moduleLibrary.put(updatedLibrary);
        message.success(`Library with ID ${id} updated successfully.`);
      } else {
        message.warning(`Library with ID ${id} not found.`);
      }
    } catch (error) {
      message.error("Error updating library in IndexedDB:");
    }
  }

  async deleteLibrary(id: number): Promise<void> {
    try {
      const existingLibrary = await this.moduleLibrary.get(id);
      if (existingLibrary) {
        await this.moduleLibrary.delete(id);
        message.success(`Library with ID ${id} deleted successfully.`);
      } else {
        message.warning(`Library with ID ${id} not found.`);
      }
    } catch (error) {
      message.error("Error deleting library from IndexedDB:");
    }
  }

  async addUsers(users: any): Promise<number> {
    return this.users.add(users);
  }

  async getUsers(): Promise<any[]> {
    return this.users.toArray();
  }

  async deleteUser(id: number): Promise<void> {
    await this.users.delete(id);
  }

  async updateUsers(id: any, updatedData: any): Promise<void> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error(`Invalid user ID: ${id}`);
    }
    const existingUser = await this.users.get(numericId);

    if (!existingUser) {
      console.warn(`User with ID ${numericId} not found. Adding it as a new record.`);
    }

    function sanitizeData(obj: any): any {
      return JSON.parse(
        JSON.stringify(obj, (_key: any, value) => {
          if (typeof value === "function") {
            return undefined;
          }
          if (value && typeof value === "object" && value["$isDayjsObject"]) {
            return value.$d;
          }
          return value;
        })
      );
    }

    const sanitizedData = sanitizeData(updatedData);
    sanitizedData.id = numericId;
    await this.deleteUser(id);
    await this.users.put(sanitizedData);
  }

  async getUserById(id: any): Promise<any | undefined> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error(`Invalid user ID: ${id}`);
    }
    return await this.users.get(numericId);
  }

  async addHolidays(holiday: any): Promise<number> {
    return this.holidays.add(holiday);
  }

  async getAllHolidays(): Promise<any> {
    return this.holidays.toArray();
  }

  async getHolidaysById(id: any): Promise<any> {
    return this.holidays.get(id);
  }

  async updateHolidays(id: number, newRecord: any): Promise<void> {
    try {
      const existingholiday = await this.holidays.get(id);
      if (existingholiday) {
        const updatedholiday = { ...newRecord, id };
        await this.holidays.put(updatedholiday);
        message.success(`Holiday with ID ${id} updated successfully.`);
      } else {
        message.warning(`Holiday with ID ${id} not found.`);
      }
    } catch (error) {
      message.error("Error updating holiday in IndexedDB:");
    }
  }

  async deleteHolidays(id: number): Promise<void> {
    try {
      const existingholiday = await this.holidays.get(id);
      if (existingholiday) {
        await this.holidays.delete(id);
        message.success(`Holiday with ID ${id} deleted successfully.`);
      } else {
        message.warning(`Holiday with ID ${id} not found.`);
      }
    } catch (error) {
      message.error("Error deleting Holiday from IndexedDB:");
    }
  }

  async addProjectTimeline(timeline: any): Promise<number> {
    const serializableTimeline = JSON.parse(JSON.stringify(timeline));
    return this.projectTimelines.add(serializableTimeline);
  }

  async getAllProjectTimeline(): Promise<any> {
    return this.projectTimelines.toArray();
  }

  async getProjectTimelineById(id: any): Promise<any> {
    return this.projectTimelines.get(id);
  }

  async updateProjectTimeline(id: number, newRecord: any): Promise<void> {
    try {
      const existingProjectTimeline = await this.projectTimelines.get(id);
      if (existingProjectTimeline) {
        const sanitizedRecord = JSON.parse(JSON.stringify(newRecord));
        sanitizedRecord['id'] = id;

        await this.projectTimelines.put(sanitizedRecord);
      } else {
        message.warning(`Project Timeline with ID ${id} not found.`);
      }
    } catch (error) {
      console.error("Error updating Project Timeline in IndexedDB:", error);
      message.error("Error updating Project Timeline in IndexedDB");
    }
  }

  async deleteProjectTimeline(id: number): Promise<void> {
    try {
      const existingprojectTimelines = await this.projectTimelines.get(id);
      if (existingprojectTimelines) {
        await this.projectTimelines.delete(id);
        message.success(`Project Timelines with ID ${id} deleted successfully.`);
      } else {
        message.warning(`Project Timelines with ID ${id} not found.`);
      }
    } catch (error) {
      message.error("Error deleting Project Timelines from IndexedDB:");
    }
  }

  //documents
  async addDocument(doc: any): Promise<number> {
    return this.documents.add({ ...doc });
  }

  async getAllDocuments(): Promise<any[]> {
    return this.documents.toArray();
  }

  async getDocumentById(id: number): Promise<any> {
    return this.documents.get(id);
  }

  async updateDocument(id: number, updatedData: any): Promise<void> {
    const existingDoc = await this.documents.get(id);
    if (existingDoc) {
      await this.documents.put({ ...existingDoc, ...updatedData, id });
    } else {
      message.warning(`Document with ID ${id} not found.`);
    }
  }

  async deleteDocument(id: number): Promise<void> {
    const existingDoc = await this.documents.get(id);
    if (existingDoc) {
      await this.documents.delete(id);
    } else {
      message.warning(`Document with ID ${id} not found.`);
    }
  }
  
  //disk storage
  async addDiskEntry(path: string, content: string): Promise<void> {
    await this.diskStorage.add({ path, content });
  }

  async getDiskEntry(path: string): Promise<string | null> {
    const entry = await this.diskStorage.where("path").equals(path).first();
    return entry?.content || null;
  }
}

export const db = new DataStorage();
