import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, Tooltip } from "@mui/material";
import { FilterList } from "@mui/icons-material";
import { Select, Input, Button, Typography, Modal } from "antd";
import { SearchOutlined, DeleteOutlined, RobotOutlined, ExclamationCircleOutlined, ApartmentOutlined, ClusterOutlined, UserOutlined, RetweetOutlined } from "@ant-design/icons";
import "../styles/module-library.css";
import { Link } from "react-router-dom";
import { getCurrentUser } from '../Utils/moduleStorage';
const { Option } = Select;
import { db } from "../Utils/dataStorege.ts";
import { notify } from "../Utils/ToastNotify.tsx";
import { ToastContainer } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
interface Activity {
  code: string;
  activityName: string;
  duration: number | string;
  prerequisite: string;
  level: string;
  cost: any;
  notifications: any;
  rasi: any;
}

interface Module {
  parentModuleCode: string;
  moduleName: string;
  level: string;
  id: number;
  mineType: string;
  activities: Activity[];
  duration?: string;
  orgId: string;
  userGuiId: string;
  moduleType: string;
  createdAt: string;
  guiId?: string
}

interface Library {
  name: string;
  mineType: string;
  items: Module[];
  id: any;
  orgId: string;
  userGuiId: string;
  createdAt: string;
  guiId: string;
}

const ModuleLibrary = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();
  // const [_page, setPage] = useState<number>(0);
  // const _rowsPerPage = 10;
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [newLibraryName, setNewLibraryName] = useState<string>("");
  const [newLibraryMineType, setNewLibraryMineType] = useState<string>("");
  const [newLibraryMineTypeFilter, setNewLibraryMineTypeFilter] = useState<string>("");
  const [libraryType, _setLibraryType] = useState("custom");
  const [modulesData, setModulesData] = useState<Module[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [_selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
  const [mineTypes, setMineTypes] = useState<any>([]);
  const [_moduleTypes, _setModuleTypes] = useState<any>(["Organizational Module", "Personal Module"]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleteModuleModalVisible, setIsDeleteModuleModalVisible] = useState(false);
  const [selectedLibrryId, setSelectedLibraryId] = useState<any>();
  const [selectedModuleId, setSelectedModuleId] = useState<any>();
  const [filteredModules, setFilteredModules] = useState<Module[]>(modulesData);
  const [librarySearchTerm, setLibrarySearchTerm] = useState("");
  const [filteredLibraries, setFilteredLibraries] = useState<Library[]>(libraries);
  const [isConvertModalVisible, setIsConvertModalVisible] = useState(false);
  const [selectedModuleToConvert, setSelectedModuleToConvert] = useState<Module | null>(null);
  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    if (currentUser) {
      db.getAllLibraries()
        .then((libs) => setLibraries(libs.filter((lib: any) => lib.orgId == currentUser.orgId)))
        .catch((err) => {
          console.error("Error fetching libraries:", err);
          setLibraries([]);
        });

      db.getModules()
        .then((mods) => setModulesData(mods.filter((mod: any) => mod.orgId == currentUser.orgId)))
        .catch((err) => {
          console.error("Error fetching modules:", err);
          setModulesData([]);
        });
      console.log(modulesData);


      db.getAllMineTypes()
        .then((mine) => setMineTypes(mine.filter((item: any) => item.orgId == currentUser.orgId)))
        .catch((err) => {
          console.error("Error fetching minetypes:", err);
          setModulesData([]);
        });

      db.getProjects()
        .then((projects) => {
          const filteredProjects = (projects || []).filter(
            (proj: any) => proj.orgId == currentUser.orgId
          );

          setAllProjects(filteredProjects);
          setProjects(
            filteredProjects.map((p: any) => p.projectParameters.projectName)
          );
        })
        .catch((err) => {
          console.error("Error fetching projects:", err);
          setAllProjects([]);
          setProjects([]);
        });
    }
  }, [currentUser]);

  useEffect(() => {
    const filtered = modulesData.filter((module) => {
      const searchLower = searchTerm.toLowerCase();
      const typeLabel =
        module.moduleType === "PERSONAL"
          ? "personal module"
          : module.moduleType === "ORG"
            ? "organizational module"
            : "";
      const formattedDate = dayjs(module.createdAt).format("DD MMM YYYY").toLowerCase();

      const searchMatches =
        !searchTerm ||
        module.moduleName.toLowerCase().includes(searchLower) ||
        module.parentModuleCode.toLowerCase().includes(searchLower) ||
        module.mineType.toLowerCase().includes(searchLower) ||
        typeLabel.includes(searchLower) ||
        formattedDate.includes(searchLower);

      const moduleTypeMatches =
        !selectedOption ||
        module.moduleType === selectedOption ||
        (
          selectedOption === "PERSONAL" &&
          module.userGuiId === currentUser?.guiId
        );

      const mineTypeMatches = !newLibraryMineTypeFilter || module.mineType === newLibraryMineTypeFilter;

      return moduleTypeMatches && mineTypeMatches && searchMatches;
    });

    setFilteredModules(filtered);
    console.log(filtered);
    
  }, [searchTerm, selectedOption, newLibraryMineTypeFilter, modulesData]);

  const handleModuleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLibrarySearchTerm(e.target.value);
  };

  const handleMineTypeChange = (value: string) => {
    setNewLibraryMineTypeFilter(value);
  };

  // const handleChangePage = (_: any, newPage: number) => {
  //   setPage(newPage);
  // };

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    const selected: any = allProjects.find((project: any) => project.projectParameters.projectName == value);
    setNewLibraryMineType(selected?.projectParameters.typeOfMine || null);
    setNewLibraryName(value);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, module: Module) => {
    e.dataTransfer.setData("application/json", JSON.stringify(module));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!selectedLibrary) return;
    const data = e.dataTransfer.getData("application/json");
    const moduleData: Module = JSON.parse(data);
    if (moduleData.mineType !== selectedLibrary.mineType) {
      notify.error(
        `Module Mine Type (${moduleData.mineType}) does not match library Mine Type (${selectedLibrary.mineType}).`
      );
      return;
    }
    if (selectedLibrary.items.some((item: any) => item.guiId == moduleData.guiId)) {
      notify.info("Module already exists in this library.");
      return;
    }
    const updatedLibrary = { ...selectedLibrary, items: [...selectedLibrary.items, moduleData] };
    setSelectedLibrary(updatedLibrary);
    setLibraries(prev => prev.map(lib => lib.id == updatedLibrary.id ? updatedLibrary : lib));
  };

  const handleModuleClick = (module: Module) => {
    if (canEditModule(module)) {
      navigate('/modules', { state: module });
    }
  };

  const handleDeleteModule = (modIndex: number) => {
    if (!selectedLibrary) return;
    Modal.confirm({
      title: "Are you sure you want to delete this module?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: () => {
        const updatedLibrary = {
          ...selectedLibrary,
          items: selectedLibrary.items.filter((_, index) => index !== modIndex),
        };

        setSelectedLibrary(updatedLibrary);
        setLibraries(prev =>
          prev.map(lib => (lib.id == updatedLibrary.id ? updatedLibrary : lib))
        );
        updateLibraryData(updatedLibrary);
      },
    });
  };

  const handleModuleDelete = async () => {
    if (!selectedModuleId) return;
    try {
      await db.deleteModule(selectedModuleId);
      db.getModules()
        .then((mods) => setModulesData(mods.filter((mod: any) => mod.orgId == currentUser.orgId)))
        .catch((err) => {
          console.error("Error fetching modules:", err);
          setModulesData([]);
        });
    } catch (error) {
      notify.error("Error deleting module.");
    }
    setIsDeleteModuleModalVisible(false);
  };

  const handleCreateLibrary = () => {
    if (!newLibraryName.trim() || !newLibraryMineType.trim()) return notify.error("Library name and Mine Type are mandatory.");
    if (!currentUser) return notify.error("User not found.");
    const newLibrary: Library = {
      id: Date.now(),
      guiId: uuidv4(),
      name: newLibraryName,
      mineType: newLibraryMineType,
      items: [],
      userGuiId: currentUser?.guiId,
      orgId: currentUser?.orgId,
      createdAt: new Date().toISOString(),
    };

    setLibraries((prev) => [...prev, newLibrary]);
    setSelectedLibrary(newLibrary);
    handleSaveLibrary(newLibrary);
    setNewLibraryName("");
    setNewLibraryMineType("");
  };

  const updateLibraryData = async (updatedLibrary: Library) => {
    try {
      await db.updateLibrary(updatedLibrary.id, updatedLibrary);
    } catch (error) {
      console.error("Error updating library:", error);
    }
  };

  const handleDeleteLibrary = async () => {
    try {
      await db.deleteLibrary(selectedLibrryId);
      setLibraries((prev) => prev.filter((lib) => lib.id !== selectedLibrryId));
      setIsDeleteModalVisible(false);
      if (selectedLibrary?.id == selectedLibrryId) setSelectedLibrary(null);
    } catch (error) {
      console.error("Error deleting library:", error);
    }
  };

  const handleSaveLibrary = async (library: any) => {
    try {
      const existingLibrary = await db.getLibraryById(library.id ? library.id : selectedLibrary?.id);
      if (existingLibrary) {
        await updateLibraryData(library.id ? library : selectedLibrary);
        notify.success("Library updated successfully!");
      } else {
        await db.addLibrary(library.id ? library : selectedLibrary);
        notify.success("Library created successfully!");
      }
      db.getAllLibraries()
        .then((libs) => setLibraries(libs.filter((lib: any) => lib.orgId == currentUser.orgId)))
        .catch((err) => {
          console.error("Error fetching libraries:", err);
          setLibraries([]);
        });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error saving library.");
    } finally {
      setSelectedLibrary(library.id ? library : null);
    }
  };

  useEffect(() => {
    const searchLower = librarySearchTerm.toLowerCase();

    const filtered = libraries.filter((lib) => {
      const nameMatch = lib.name.toLowerCase().includes(searchLower);
      const mineMatch = lib.mineType.toLowerCase().includes(searchLower);

      const itemMatch = lib.items?.some(
        (item) =>
          item.moduleName.toLowerCase().includes(searchLower) ||
          item.parentModuleCode.toLowerCase().includes(searchLower)
      );

      return nameMatch || mineMatch || itemMatch;
    });

    setFilteredLibraries(filtered);
  }, [librarySearchTerm, libraries]);

  const renderModuleType = (type: string) => {
    let icon = null;
    let tooltip = "";

    switch (type?.toUpperCase()) {
      case "PERSONAL":
        icon = <UserOutlined style={{ color: "#1890ff" }} />;
        tooltip = "Personal Module";
        break;
      case "ORG":
        icon = <ClusterOutlined style={{ color: "#52c41a" }} />;
        tooltip = "Organization Module";
        break;
      case "MDTS":
        icon = <ApartmentOutlined style={{ color: "#faad14" }} />;
        tooltip = "MDTS Standard Module";
        break;
      default:
        return type;
    }

    return (
      <Tooltip title={tooltip}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
          {icon}
        </span>
      </Tooltip>
    );
  };

  const handleConvertToOrgClick = (e: React.MouseEvent, module: Module) => {
    e.stopPropagation();
    setSelectedModuleToConvert(module);
    setIsConvertModalVisible(true);
  };

  const canEditModule = (module: Module) => {
    return module.moduleType == "PERSONAL" || currentUser?.guiId === module.userGuiId;
  };

  const handleConfirmConvertToOrg = async () => {
    if (!selectedModuleToConvert) return;
    try {
      const updatedCount = await db.modules.update(selectedModuleToConvert.id, {
        ...selectedModuleToConvert,
        moduleType: "ORG",
      });
      if (updatedCount) {
        notify.success("Module successfully converted to Organizational type.");
        db.getModules()
          .then((mods) => setModulesData(mods.filter((mod: any) => mod.orgId == currentUser.orgId)))
          .catch((err) => {
            console.error("Error fetching modules:", err);
            setModulesData([]);
          });
      } else {
        notify.error("Conversion failed. No changes were made.");
      }
    } catch (error) {
      console.error("Error converting module:", error);
      notify.error("Error converting module.");
    } finally {
      setIsConvertModalVisible(false);
      setSelectedModuleToConvert(null);
    }
  };

  return (
    <>
      <div className="page-heading-module-library">
        <span>Module Library</span>
      </div>

      <div className="headings">
        <div className="heading-one">
          <span>Modules</span>
        </div>
        <div className="heading-two">
          <span>Groups</span>
        </div>
        <div className="heading-three">
          <span>Create Group</span>
        </div>
      </div>

      <Box className="main-section">
        <div className="module-list-page">
          <Box sx={{ flex: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px" }}>
              <Input
                size="small"
                placeholder="Search..."
                onChange={handleModuleSearch}
                prefix={<SearchOutlined />}
                style={{ height: "26px", fontSize: "12px" }}
              />
              <Select
                value={selectedOption || undefined}
                onChange={setSelectedOption}
                allowClear
                size="small"
                placeholder="Select Module Type"
                style={{ width: "100%", height: "26px", fontSize: "12px" }}
              >
                <Option value="MDTS">MDTS Module</Option>
                <Option value="PERSONAL">Personal Module</Option>
                <Option value="ORG">Organizational Module</Option>
              </Select>

              <Select
                size="small"
                placeholder="Mine Type"
                value={newLibraryMineTypeFilter || undefined}
                onChange={handleMineTypeChange}
                allowClear
                style={{ width: "100%", height: "26px" }}
                disabled={libraryType == "project"}
              >
                {mineTypes?.map((type: any) => (
                  <Option key={type.type} value={type.type}>
                    {type.type}
                  </Option>
                ))}
              </Select>

              <IconButton color="primary" style={{ padding: "0px" }}>
                <FilterList />
              </IconButton>
            </Box>

            <hr style={{ margin: 0, marginBottom: "8px" }} />

            <TableContainer component={Paper} style={{ marginTop: "5px" }}>
              <Table>
                <TableHead style={{ display: "block", background: "#258790", color: "white" }}>
                  <TableRow style={{ display: "flex", width: "100%" }}>
                    <TableCell style={{ color: "white", fontWeight: "bold", flex: "0 0 15%", padding: "5px 10px" }}>Code</TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold", flex: "0 0 32%", padding: "5px 10px" }}>Name</TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold", flex: "0 0 8%", textAlign: "center", padding: "5px 10px" }}>Type</TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold", flex: "0 0 20%", textAlign: "center", padding: "5px 10px" }}>Created On</TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold", flex: "0 0 15%", textAlign: "center", padding: "5px 10px" }}>Mine Type</TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold", flex: "0 0 10%", textAlign: "center", padding: "5px 10px" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody style={{ display: "block", overflowY: "auto", overflowX: "hidden", maxHeight: "calc(100vh - 245px)" }}>
                  {modulesData.length > 0 ? (
                    filteredModules.map((module, index) => (
                      <TableRow
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, module)}
                        onClick={() => handleModuleClick(module)}
                        style={{ display: "flex", width: "100%", cursor: canEditModule(module) ? "pointer" : "default" }}
                      >
                        <TableCell style={{ flex: "0 0 15%", padding: "8px" }}>{module.parentModuleCode}</TableCell>
                        <TableCell style={{ flex: "0 0 32%", padding: "8px" }}>{module.moduleName}</TableCell>
                        <TableCell style={{ flex: "0 0 8%", padding: "8px", textAlign: "center" }}>
                          {renderModuleType(module.moduleType)}
                        </TableCell>
                        <TableCell style={{ flex: "0 0 20%", padding: "8px", textAlign: "center" }}>
                          {dayjs(module.createdAt).format("DD MMM YYYY")}
                        </TableCell>
                        <TableCell style={{ flex: "0 0 15%", padding: "8px", textAlign: "center" }}>{module.mineType}</TableCell>
                        <TableCell style={{ flex: "0 0 10%", padding: "8px 12px", display: "flex", alignItems: "center" }}>
                          {module.moduleType == 'PERSONAL' ||  module.userGuiId == currentUser.guiId &&(
                            <Button
                              icon={<DeleteOutlined />}
                              type="primary"
                              danger
                              size="small"
                              style={{ marginRight: module.moduleType === "PERSONAL" ? 8 : 0 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleteModuleModalVisible(true);
                                setSelectedModuleId(module.id);
                              }}
                            />
                          )}
                          {module.moduleType === "PERSONAL" && (
                            <Tooltip title="Convert to Organizational Module">
                              <Button
                                icon={<RetweetOutlined />}
                                type="default"
                                size="small"
                                onClick={(e) => handleConvertToOrgClick(e, module)}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <div style={{ padding: "10px", fontSize: "12px", color: "grey", display: "flex", justifyContent: "center" }}>
                      No Module available. Please add a Module to get started.
                      <div style={{ marginLeft: "30px" }}>
                        <Button type="default" size="small" style={{ backgroundColor: "#3C3D37", color: "#ddd" }} icon={<RobotOutlined />}>
                          <Link style={{ color: "inherit", textDecoration: "none" }} to={"/modules"}>New</Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  {filteredModules.length === 0 && (
                    <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#999" }}>
                      No Module found.
                    </div>
                  )}

                </TableBody>
              </Table>
            </TableContainer>

            {/* <TablePagination
              component="div"
              count={modulesData.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[]}
              sx={{ mt: 2 }}
            /> */}
          </Box>
        </div>

        <div style={{ position: "relative" }} className="create-library-section">
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px" }}>
            <Input
              size="small"
              placeholder="Search..."
              onChange={handleSearch}
              prefix={<SearchOutlined />}
              style={{ height: "26px", fontSize: "12px" }}
            />
            <IconButton color="primary" style={{ padding: "0px" }}>
              <FilterList />
            </IconButton>
          </Box>
          <hr style={{ margin: 0, marginBottom: "8px" }} />
          <div style={{ height: "calc(100vh - 245px)" }}>
            {selectedLibrary ? (
              <div style={boxStyle} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                <strong>
                  {selectedLibrary.name} ({selectedLibrary.mineType})
                </strong>
                {selectedLibrary.items?.length == 0 ? (
                  <p style={emptyTextStyle}>Drop modules here</p>
                ) : null}
                {selectedLibrary?.items?.length > 0 && selectedLibrary.items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "10px" }}>
                    <span style={itemStyle}>
                      {item.moduleName}
                    </span>
                    <span>
                      <DeleteOutlined
                        onClick={() => handleDeleteModule(idx)}
                        style={deleteButtonStyle}
                      />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...boxStyle, textAlign: "center", padding: "20px" }}>
                <p>Please select a group from the right side or create a new one.</p>
              </div>
            )}
          </div>
          <div>
            {selectedLibrary && (
              <>
                <hr />
                <Button
                  style={{ float: "right", height: "26px", marginTop: "5px", marginRight: "10px" }}
                  type="primary"
                  className="bg-secondary"
                  onClick={handleSaveLibrary}
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="library-details">
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px" }}>
            <Input
              size="small"
              placeholder="Search..."
              onChange={handleSearch}
              prefix={<SearchOutlined />}
              style={{ height: "26px", fontSize: "12px" }}
            />
            <IconButton color="primary" style={{ padding: "0px" }}>
              <FilterList />
            </IconButton>
          </Box>
          <hr style={{ margin: 0, marginBottom: "8px" }} />
          <div style={{ padding: "0px 10px" }}>

            <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}>
              {libraryType == "project" ? (
                <Select
                  value={newLibraryName || undefined}
                  onChange={handleProjectChange}
                  placeholder="Select Project"
                  style={{ width: "100%", height: "26px" }}
                >
                  {projects.map((project) => (
                    <Option key={project} value={project}>
                      {project}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input
                  size="small"
                  placeholder="Enter Group Name"
                  type="text"
                  value={newLibraryName}
                  onChange={(e) => setNewLibraryName(e.target.value)}
                />
              )}

              <Select
                size="small"
                placeholder="Mine Type"
                value={newLibraryMineType || undefined}
                onChange={(value) => setNewLibraryMineType(value)}
                style={{ width: "100%", height: "26px" }}
                disabled={libraryType == "project"}
              >
                {mineTypes.map((type: any) => (
                  <Option key={type.type} value={type.type}>
                    {type.type}
                  </Option>
                ))}
              </Select>

              <Button style={{ height: "26px" }} type="primary" className="bg-secondary" onClick={handleCreateLibrary}>
                Create
              </Button>
            </div>
            <div style={{ marginTop: "24px", flexWrap: "wrap" }}>
              {filteredLibraries.map((library) => (
                <div
                  key={library.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    marginBottom: "5px",
                    background: selectedLibrary && selectedLibrary.id == library.id ? "#d0ebff" : "#eee",
                  }}
                >
                  <Typography.Text style={{ cursor: "pointer" }} onClick={() => setSelectedLibrary(library)}>
                    {library.name} ({library.mineType})
                  </Typography.Text>
                  <DeleteOutlined
                    onClick={() => { setIsDeleteModalVisible(true); setSelectedLibraryId(library.id) }}
                    style={{ color: "red", cursor: "pointer", marginLeft: "10px" }}
                  />
                </div>
              ))}
              {filteredLibraries.length === 0 && (
                <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#999" }}>
                  No libraries found.
                </div>
              )}
            </div>
          </div>
        </div>

      </Box>

      <Modal
        title="Confirm Delete"
        visible={isDeleteModalVisible}
        onOk={handleDeleteLibrary}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okType="danger"
        width={"45%"}
        className="modal-container"
        centered
      >
        <div style={{ padding: "0px 10px" }}>
          <p>
            <ExclamationCircleOutlined style={{ color: "red", marginRight: "8px" }} />
            Are you sure you want to Remove this library? This action cannot be undone.
          </p>
        </div>
      </Modal >

      <Modal
        title="Confirm Delete"
        visible={isDeleteModuleModalVisible}
        onOk={handleModuleDelete}
        onCancel={() => setIsDeleteModuleModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okType="danger"
        width={"45%"}
        className="modal-container"
        centered
      >
        <div style={{ padding: "0px 10px" }}>
          <p>
            <ExclamationCircleOutlined style={{ color: "red", marginRight: "8px" }} />
            Are you sure you want to Remove this module? This action cannot be undone.
          </p>
        </div>
      </Modal >

      <Modal
        title="Convert to Organizational Module"
        visible={isConvertModalVisible}
        onOk={handleConfirmConvertToOrg}
        onCancel={() => setIsConvertModalVisible(false)}
        okText="Convert"
        cancelText="Cancel"
        okType="primary"
        width="45%"
        className="modal-container"
        centered
      >
        <div style={{ padding: "0px 10px" }}>
          <p>
            <ExclamationCircleOutlined style={{ color: "#faad14", marginRight: "8px" }} />
            Are you sure you want to convert this module to an Organizational Module?
          </p>
        </div>
      </Modal>

      <ToastContainer />
    </>
  );
};

const boxStyle: React.CSSProperties = {
  padding: "10px",
  width: "98.5%",
  borderRadius: "8px",
  margin: "4px",
  paddingBottom: "50px",
  border: "2px dashed #ddd"
};

const deleteButtonStyle: React.CSSProperties = {
  marginTop: "4px",
  backgroundColor: "#ee4d4d",
  color: "#fff",
  cursor: "pointer",
  padding: "10px",
  borderRadius: "5px"
};

const itemStyle: React.CSSProperties = {
  padding: "6px",
  margin: "5px 0",
  width: "100%",
  borderRadius: "5px",
  background: "#ddd",
  color: "#000",
  cursor: "grab",
  fontWeight: "400",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#888"
};

export default ModuleLibrary;

