const MODULE_KEY = "modules";
const FORM_DATA = "formDatas";
const MINE_TYPE_KEY = "mineTypes";
const DOCUMENTS_KEY = " documents";
const USERS = "users";

export const getModules = () => {
  const savedModules = localStorage.getItem(MODULE_KEY);
  const modules = savedModules ? JSON.parse(savedModules) : [];
  return flattenModules(modules);
};

const flattenModules = (modules: any) => {
  return modules.reduce((acc: any, item: any) => {
    if (Array.isArray(item)) {
      return acc.concat(flattenModules(item));
    }
    return acc.concat(item);
  }, []);
};

export const saveModules = (modules: any) => {
  localStorage.setItem(MODULE_KEY, JSON.stringify(modules));
};

export const addModule = (newModule: any) => {
  const modules = getModules();
  modules.push(newModule);
  saveModules(modules);
};

export const updateModule = (newModule: any) => {
  let modules = getModules();
  const moduleIndex = modules.findIndex(
    (mod: any) =>
      mod.parentModuleCode === newModule.parentModuleCode &&
      mod.moduleName === newModule.moduleName
  );

  if (moduleIndex !== -1) {
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      ...newModule,
    };
  } else {
    window.alert("Didn't find any module with this module name & code!");
  }
  saveModules(modules);
};

export const findModule = (parentModuleCode: string, moduleName: string) => {
  const modules = getModules();
  return modules.find(
    (mod: any) =>
      mod.parentModuleCode === parentModuleCode &&
      mod.moduleName === moduleName
  );
};

export const isDuplicateModuleName = (moduleName: string) => {
  const modules = getModules();
  return modules.some((mod: any) => mod.moduleName === moduleName);
};

export const isDuplicateModuleCode = (moduleCode: string) => {
  const modules = getModules();
  return modules.some((mod: any) => mod.parentModuleCode === moduleCode);
};

export const initializeModules = () => {
  if (!localStorage.getItem(MODULE_KEY)) {
    saveModules([]);
  }
};

/**
 * Get a sorted list of module names based on a predefined sequence.
 * @returns {Array<string>} - List of module names in the specified sequence.
 */
export const getOrderedModuleNames = () => {
  const savedModules = localStorage.getItem(MODULE_KEY);
  const modules = savedModules ? JSON.parse(savedModules) : [];

  const moduleSequence = [
    "Explored",
    "GR Approved",
    "Mine Plan Approved",
    "Grant of TOR",
    "EC",
    "FC",
    "CTE",
    "CTO",
    "Mine Opening Permission",
  ];

  const moduleNames = modules
    .map((module: any) => module?.moduleName)
    .filter((name: any) => name);

  const orderedModules = moduleSequence.filter((name) =>
    moduleNames.includes(name)
  );

  const otherModules = moduleNames
    .filter((name: any) => !moduleSequence.includes(name))
    .sort((a: any, b: any) => a.localeCompare(b));
  return [...orderedModules, ...otherModules];
};

export const saveFormDataToListInLocalStorage = (formData: any) => {
  const formDatas = loadFormDataListFromLocalStorage();
  formData.project_id = getNewProjectId();
  formDatas.push(formData);
  localStorage.setItem(FORM_DATA, JSON.stringify(formDatas));
};

export const loadFormDataListFromLocalStorage = () => {
  const storedData = localStorage.getItem(FORM_DATA);
  if (storedData) {
    return JSON.parse(storedData);
  }
  return [];
};

export const clearFormDataListInLocalStorage = () => {
  localStorage.removeItem(FORM_DATA);
};

export const isDuplicateProjectName = (projectName: string) => {
  const existingData = loadFormDataListFromLocalStorage();
  return existingData.some(
    (data: any) => data.projectName.toLowerCase() === projectName.toLowerCase()
  );
}

export const listOfProjectName = () => {
  const storedData = loadFormDataListFromLocalStorage();
  return storedData.map((data: any) => data.projectName);
};

export const getFormDataByProjectName = (projectName: string) => {
  const allFormData = loadFormDataListFromLocalStorage();
  return allFormData.find((data: any) => data.projectName === projectName) || null;
};

const getNewProjectId = () => {
  const allFormData = loadFormDataListFromLocalStorage();
  const maxProjectId = allFormData.reduce((maxId: number, data: any) => {
    return data.project_id > maxId ? data.project_id : maxId;
  }, 0);

  return maxProjectId + 1;
};

export const getAllMineType = () => {
  const savedModules = localStorage.getItem(MINE_TYPE_KEY);
  if (savedModules === null || savedModules === 'undefined') {
    console.warn("mineTypes is not available or is 'undefined' in localStorage.");
    return [];
  }
  let modules = [];
  try {
    modules = JSON.parse(savedModules);
    if (!Array.isArray(modules)) {
      console.warn("Parsed mineTypes is not an array. Returning empty array.");
      modules = [];
    }
  } catch (error) {
    console.error("Error parsing mine types from localStorage:", error);
    modules = [];
  }

  return modules;
};

export const updateMineType = (mineTypes: any) => {
  if (mineTypes === undefined || mineTypes === null) {
    console.warn("mineTypes is undefined or null. Setting to default empty array.");
    mineTypes = [];
  }

  try {
    const serializedMineTypes = JSON.stringify(mineTypes);
    localStorage.setItem(MINE_TYPE_KEY, serializedMineTypes);
  } catch (error) {
    console.error("Error saving mine types to localStorage:", error);
  }
};

export const getAllDocuments = () => {
  const savedDocuments = localStorage.getItem(DOCUMENTS_KEY);
  if (savedDocuments === null || savedDocuments === "undefined") {
    console.warn("Documents are not available or are 'undefined' in localStorage.");
    return [];
  }
  return savedDocuments ? JSON.parse(savedDocuments) : [];
};

export const saveDocument = (document: any) => {
  if (!document || typeof document !== "object") {
    console.error("Invalid document object provided.");
    return false;
  }
  const existingDocuments = getAllDocuments();
  existingDocuments.push(document);
  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(existingDocuments));
    return true;
  } catch (error) {
    console.error("Error saving documents to localStorage:", error);
    return false;
  }
};

export const updateDocument = (_id: Number, document: any) => {
  if (!document || typeof document !== "object") {
    console.error("Invalid document object provided.");
    return false;
  }

  const existingDocuments = getAllDocuments();
  existingDocuments.push(document);

  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(existingDocuments));
    return true;
  } catch (error) {
    console.error("Error saving documents to localStorage:", error);
    return false;
  }
};

export const deleteDocument = (id: number): boolean => {
  const existingDocuments = getAllDocuments();
  if (!Array.isArray(existingDocuments)) {
    console.error("Invalid document list.");
    return false;
  }
  const documentExists = existingDocuments.some(doc => doc.id === id);
  if (!documentExists) {
    console.error("Document with the given ID does not exist.");
    return false;
  }
  const updatedDocuments = existingDocuments.filter(doc => doc.id !== id);
  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updatedDocuments));
    return true;
  } catch (error) {
    console.error("Error deleting document from localStorage:", error);
    return false;
  }
};

export const addNewMineType = (mineTypes: any): void => {
  try {
    if (!mineTypes || typeof mineTypes !== "object") {
      throw new Error("Invalid data: mineTypes must be an object or array");
    }
    localStorage.setItem("mineTypes", JSON.stringify(mineTypes));
  } catch (error) {
    console.error("Error saving mine types:", error);
  }
};

export const getAllMineTypes = (): any[] => {
  try {
    const storedOptions = localStorage.getItem("mineTypes");
    if (!storedOptions) return [];

    const parsedOptions = JSON.parse(storedOptions);
    if (!Array.isArray(parsedOptions)) {
      console.warn("Stored mine types data is not an array. Resetting.");
      return [];
    }

    return parsedOptions;
  } catch (error) {
    console.error("Error retrieving mine types:", error);
    return [];
  }
};

export const getAllLibraries = (): any[] => {
  try {
    const userId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
    const savedLibraries = userId && localStorage.getItem(`libraries_${userId}`);
    const parsedLibraries = JSON.parse(savedLibraries);
    if (!parsedLibraries) return [];
    return parsedLibraries;
  } catch (error) {
    console.error("Error retrieving mine types:", error);
    return [];
  }
}

export const getCurrentUser = (): any => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
};

export const getCurrentUserId = (): string | null => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}")?.id || null;
  } catch (error) {
    console.error("Error retrieving current user ID:", error);
    return null;
  }
};

export const getAllUsers = () => {
  try {
    const savedUsers = localStorage.getItem(USERS);
    if (!savedUsers) {
      console.warn("No users found in localStorage.");
      return [];
    }

    const users = JSON.parse(savedUsers);
    return users;
  } catch (error) {
    console.error("Error parsing users from localStorage:", error);
    return [];
  }
};

export const saveUsers = (userList: any) => {
  try {
    const usersString = JSON.stringify(userList);
    localStorage.setItem(USERS, usersString);
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
  }
};

export const updateUser = (userId: any, updatedData: any) => {
  let users = getAllUsers();
  users = users.map((user: any) => user.id === userId ? { ...user, ...updatedData } : user);
  saveUsers(users);
}

export const deleteModuleById = (id: any) => {
  const updatedModules:any = getModules().filter((module:any) => module.id !== id);
  saveModules(updatedModules);
}