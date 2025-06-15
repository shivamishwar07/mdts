import { useEffect, useState } from "react";
import { generateTwoLetterAcronym } from "../Utils/generateTwoLetterAcronym";
import { useLocation } from "react-router-dom";
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import "../styles/module.css"
import { Input, Button, Tooltip, Row, Col, Typography, Modal, Select, notification, AutoComplete, Radio, message, Form, Switch } from 'antd';
import { SearchOutlined, ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, UserOutlined, BellOutlined, PlusOutlined, ExclamationCircleOutlined, ReloadOutlined, SortAscendingOutlined, SortDescendingOutlined, DollarOutlined, MinusCircleOutlined, FileTextOutlined } from '@ant-design/icons';
const { Option } = Select;
import CreateNotification from "./CreateNotification.tsx";
import UserRolesPage from "./AssignRACI";
import { db } from "../Utils/dataStorege.ts";
import { getCurrentUserId } from '../Utils/moduleStorage';
import { RollbackOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

const Module = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const existingAcronyms = useState(["FC", "BP", "AM", "IM"])[0];
    const moduleName = state?.moduleName ?? "";
    const mineType = state?.mineType ?? "";
    const moduleCode = state?.moduleCode ?? null;
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [openPopup, setOpenPopup] = useState<boolean>(false);
    const [openCancelUpdateModulePopup, setOpenCancelUpdateModulePopup] = useState<boolean>(false);
    const [newModelName, setNewModelName] = useState<string>("");
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [options, setOptions] = useState<string[]>([]);
    const [mineTypePopupOpen, setMineTypePopupOpen] = useState<boolean>(false);
    const [newMineType, setNewMineType] = useState<string>("");
    const [shorthandCode, setShorthandCode] = useState<string>("");
    const [moduleCodeName, setModuleCodeName] = useState<string>("");
    const [filteredModuleData, _setFilteredModuleData] = useState<any>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [openCostCalcModal, setOpenCostCalcModal] = useState(false);
    const parentModuleCode = moduleCode
        ? moduleCode
        : generateTwoLetterAcronym(moduleName, existingAcronyms);
    const [moduleData, setModuleData] = useState<any>({
        parentModuleCode: parentModuleCode,
        moduleName: moduleName,
        level: "",
        mineType: mineType,
        duration: '',
        activities: state?.activities || []
    });
    let isEditing = !!state;
    const [moduleType, setModuleType] = useState("custom");
    const [selectedMDTSModule, setSelectedMDTSModule] = useState(null);
    const mdtsModules = ["MDTS-001", "MDTS-002", "MDTS-003"];
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [discardEditByCreating, setDiscardEditByCreating] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'original'>('original');
    const [originalActivities, setOriginalActivities] = useState<any[]>(moduleData.activities);
    const [isOriginalActivitiesStateStored, setIsOriginalActivitiesStateStored] = useState(false);
    const [openNotificationModal, setOpenNotificationModal] = useState(false);
    const [openDocumentModal, setOpenDocumentModal] = useState(false);
    const [notificationForm] = Form.useForm();
    const [documentForm] = Form.useForm();
    const [undoStack, setUndoStack] = useState<any[]>([]);
    const [form] = Form.useForm();
    const [formValid, setFormValid] = useState(false);
    const [openResponsibilityModal, setOpenResponsibilityModal] = useState(false);
    const [raciForm] = Form.useForm();
    const userOptions = [
        { id: '6fa84f42-81e4-49fd-b9fc-1cbced2f1d90', name: 'Amit Sharma' },
        { id: '2de753d4-1be2-4230-a1ee-ec828ef10f6a', name: 'Priya Verma' },
        { id: '12fcb989-f9ae-4904-bdcf-9c9d8b63e8cd', name: 'Rahul Mehta' },
        { id: '9d8f16ee-e21c-4c58-9000-dc3d51f25f2e', name: 'Sneha Reddy' },
        { id: 'c5c07f70-dbb6-4b02-9cf2-8f9e2d6b3c5f', name: 'Vikram Iyer' },
        { id: 'a95f34d0-3cf9-4c58-9a70-dcc68a0c32a4', name: 'Neha Kapoor' },
        { id: 'b4ac3f1b-0591-4435-aabb-b7a7fc5c3456', name: 'Ankit Jaiswal' },
        { id: 'e7a54111-0a0c-4f91-849c-6816f74e7b12', name: 'Divya Narayan' },
        { id: '15b7ecdc-65a6-4652-9441-6ce4eacc6dfc', name: 'Rohit Das' },
        { id: 'f8db6b6b-2db1-4a9e-bdc0-bf2c4015f6a7', name: 'Meera Joshi' }
    ];
    const pushToUndoStack = (currentState: any) => {
        setUndoStack((prevStack) => {
            const newStack = [...prevStack, currentState];
            if (newStack.length > 10) {
                return newStack.slice(1);
            }
            return newStack;
        });
        setIsOriginalActivitiesStateStored(false);
    };

    useEffect(() => {
        if (state && state.activities) {
            setModuleData({
                id: state.id,
                parentModuleCode: state.parentModuleCode,
                moduleName: state.moduleName,
                level: state.level,
                mineType: state.mineType,
                duration: state.duration,
                activities: state.activities
            });
            setUndoStack([]);
            if (originalActivities.length === 0) {
                setOriginalActivities(JSON.parse(JSON.stringify(state.activities)));
            }
        } else {
            console.error("State or state.activities is not available.");
        }
    }, [state]);

    useEffect(() => {
        const fetchMineTypes = async () => {
            try {
                const storedOptions: any = await db.getAllMineTypes();
                setOptions(storedOptions);
            } catch (error) {
                console.error("Error fetching mine types:", error);
            }
        };
        fetchMineTypes();
    }, []);

    useEffect(() => {
        if (moduleData.activities.length > 0) {
            //handlePrerequisite();
        }
    }, [moduleData.activities]);

    useEffect(() => {
        if (isOriginalActivitiesStateStored === false) {
            setOriginalActivities(JSON.parse(JSON.stringify(moduleData.activities)));
            setIsOriginalActivitiesStateStored(true);
        }
        handleSortModule(sortOrder);
    }, [sortOrder]);

    const handleSaveModuleAndActivity = async () => {
        try {
            const userId = getCurrentUserId();
            if (!moduleData || Object.keys(moduleData).length === 0 || !moduleData.parentModuleCode) {
                notification.error({
                    message: "Module data is empty or missing required fields.",
                    duration: 3,
                });
                return;
            }

            if (isEditing) {
                if (!moduleData.id || typeof moduleData.id !== "number") {
                    notification.error({
                        message: "Invalid module ID. Unable to update module.",
                        duration: 3,
                    });
                    return;
                }

                const existingModule = await db.modules.get(moduleData.id);

                if (existingModule) {
                    const updatedCount = await db.modules.update(moduleData.id, {
                        ...existingModule,
                        ...moduleData,
                    });

                    if (updatedCount) {
                        notification.success({
                            message: "Module updated successfully!",
                            duration: 3,
                        });
                        navigate('/create/module-library');
                    } else {
                        notification.error({
                            message: "Module update failed. No changes detected.",
                            duration: 3,
                        });
                    }
                } else {
                    notification.error({
                        message: "Module not found in IndexedDB.",
                        duration: 3,
                    });
                }
            } else {
                await db.addModule({ ...moduleData, userId });
                console.log(moduleData);
                notification.success({
                    message: "Module saved successfully!",
                    duration: 3,
                });
            }

            navigate('/create/module-library');
        } catch (error) {
            notification.error({
                message: "Failed to save/update module.",
                description: "Check the console for details.",
                duration: 3,
            });
        }
    };

    const addActivity = () => {
        pushToUndoStack(moduleData);
        if (!selectedRow) return;

        const isModuleSelected = selectedRow.level === "L1";
        const parentCode = isModuleSelected ? moduleData.parentModuleCode : selectedRow.code;
        const newLevel = isModuleSelected ? "L2" : selectedRow.level;
        const sameLevelActivities = moduleData.activities.filter((a: any) => a.level === newLevel);
        const lastActivity = sameLevelActivities.length > 0 ? sameLevelActivities[sameLevelActivities.length - 1] : null;
        const lastNumber = lastActivity ? parseInt(lastActivity.code.split('/').pop()) : 0;

        const newNumber = isModuleSelected
            ? (lastNumber ? lastNumber + 10 : 10)
            : parseInt(selectedRow.code.split('/').pop()) + 10;

        const newCode = isModuleSelected
            ? `${moduleData.parentModuleCode}/${newNumber}`
            : `${parentCode.split('/').slice(0, -1).join('/')}/${newNumber}`;

        const timestamp = new Date().toLocaleTimeString('en-GB');
        const generatedId = uuidv4();
        const newActivity = {
            code: newCode,
            activityName: "New Activity " + timestamp,
            duration: 1,
            guicode: generatedId,
            prerequisite: isModuleSelected ? "" : selectedRow.code,
            level: newLevel
        };

        const updatedActivities: any = [];
        let inserted = false;

        moduleData.activities.forEach((activity: any) => {
            if (activity.code === selectedRow.code) {
                updatedActivities.push(activity);
                updatedActivities.push(newActivity);
                inserted = true;
            } else if (inserted && activity.level === newLevel) {
                const activityNumber = parseInt(activity.code.split('/').pop());
                const updatedCode = activity.code.replace(`/${activityNumber}`, `/${activityNumber + 10}`);
                updatedActivities.push({ ...activity, code: updatedCode });
            } else {
                updatedActivities.push(activity);
            }
        });

        if (isModuleSelected && !inserted) {
            updatedActivities.push(newActivity);
        }


        setModuleData((prev: any) => {
            const newData = { ...prev, activities: updatedActivities };
            return newData;
        });

        setTimeout(() => {
            handlePrerequisite();
        }, 0);
    };

    const deleteActivity = async () => {
        if (!selectedRow) return;
        else {
            pushToUndoStack(moduleData);
            if (selectedRow.parentModuleCode && selectedRow.id) {
                setModuleData({
                    parentModuleCode: "",
                    moduleName: "",
                    level: "",
                    mineType: "",
                    duration: "",
                    activities: []
                })
                try {
                    await db.deleteModule(selectedRow.id);
                    setTimeout(() => navigate(".", { replace: true }), 0);
                    message.success("Module removed successfully!");
                } catch (error: any) {
                    message.error(error);
                }
            }
            else if (selectedRow.parentModuleCode && selectedRow.id) {
                setModuleData({
                    parentModuleCode: "",
                    moduleName: "",
                    level: "",
                    mineType: "",
                    duration: "",
                    activities: []
                })
            }
            else {
                setModuleData((prev: any) => {
                    let activities = [...prev.activities];
                    let children = activities.filter(activity => activity.code.startsWith(selectedRow.code + "/"));

                    children.forEach(child => {
                        let newParentCode = selectedRow.prerequisite || "";
                        let childParts = child.code.split("/");
                        childParts[selectedRow.code.split("/").length - 1] = newParentCode.split("/").pop();
                        child.code = newParentCode ? `${newParentCode}/${childParts.slice(-1)}` : childParts.slice(-1).join("/");
                        child.prerequisite = newParentCode;
                    });
                    let updatedActivities = activities.filter(activity => activity.code !== selectedRow.code);
                    let parentCode = selectedRow.code.split("/").slice(0, -1).join("/");
                    let sameLevelActivities = updatedActivities.filter(activity =>
                        activity.code.startsWith(parentCode) && activity.level === selectedRow.level
                    );

                    sameLevelActivities.sort((a, b) => parseInt(a.code.split("/").pop()) - parseInt(b.code.split("/").pop()));
                    sameLevelActivities.forEach((activity, index) => {
                        let newCode = `${parentCode}/${(index + 1) * 10}`;
                        activity.code = newCode;
                    });

                    return {
                        ...prev,
                        activities: updatedActivities
                    };
                });

                setSelectedRow(null);
                handlePrerequisite();
                setIsDeleteModalVisible(false);
            }
        }
        setSelectedRow(null);
        handlePrerequisite();
        setIsDeleteModalVisible(false);
    };

    const increaseLevel = () => {
        pushToUndoStack(moduleData);
        if (!selectedRow || selectedRow.level === "L1") return;

        setModuleData((prev: any) => {
            let activities = [...prev.activities];
            let activityIndex = activities.findIndex((a) => a.code === selectedRow.code);
            if (activityIndex === -1) return prev;

            let activity = activities[activityIndex];
            let currentLevel = parseInt(activity.level.slice(1));

            let aboveIndex = activityIndex - 1;
            while (aboveIndex >= 0 && activities[aboveIndex].level !== activity.level) {
                aboveIndex--;
            }

            if (aboveIndex < 0) return prev;
            let aboveActivity = activities[aboveIndex];

            let lastChildCode = aboveActivity.code;
            let children = activities.filter((a) => a.code.startsWith(`${aboveActivity.code}/`));
            if (children.length > 0) {
                let lastChild = children[children.length - 1];
                let lastChildParts = lastChild.code.split("/");
                let lastChildNumber = parseInt(lastChildParts[lastChildParts.length - 1]);
                lastChildCode = `${aboveActivity.code}/${lastChildNumber + 10}`;
            } else {
                lastChildCode = `${aboveActivity.code}/10`;
            }

            let newLevelValue = currentLevel + 1;

            let updatedActivity = {
                ...activity,
                code: lastChildCode,
                prerequisite: aboveActivity.code,
                level: `L${newLevelValue}`,
            };

            let updatedActivities = [...activities];
            updatedActivities[activityIndex] = updatedActivity;

            let previousLevel = `L${currentLevel}`;
            let siblings = updatedActivities.filter((a) => a.level === previousLevel && a.code !== activity.code);

            if (siblings) {
                let lastSiblingCode = aboveActivity.code;
                let lastSiblingPrefix = removeLastSegment(lastSiblingCode);
                let count = 10;

                siblings.forEach((sibling) => {
                    let newSiblingCode = `${lastSiblingPrefix}/${count}`;
                    sibling.code = newSiblingCode;
                    sibling.prerequisite = lastSiblingCode;
                    count += 10;
                    lastSiblingCode = newSiblingCode;
                });
            }

            updatedActivities.sort((a, b) => {
                let aParts = a.code.split("/").map(Number);
                let bParts = b.code.split("/").map(Number);
                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                    let aPart = aParts[i] || 0;
                    let bPart = bParts[i] || 0;
                    if (aPart !== bPart) return aPart - bPart;
                }
                return 0;
            });

            return { ...prev, activities: updatedActivities };
        });
        handlePrerequisite();
    };

    const removeLastSegment = (code: any) => {
        let parts = code.split('/');
        if (parts.length > 1) {
            parts.pop();
        }
        return parts.join('/');
    };

    const decreaseLevel = () => {
        pushToUndoStack(moduleData);
        if (!selectedRow || selectedRow.level === "L1" || selectedRow.level === "L2") return;

        setModuleData((prev: any) => {
            let activities = [...prev.activities];
            let activityIndex = activities.findIndex((a) => a.code === selectedRow.code);
            if (activityIndex === -1) return prev;

            let activity = activities[activityIndex];
            let currentLevel = parseInt(activity.level.slice(1));

            let aboveIndex = activityIndex - 1;
            let newParentCode = "";
            while (aboveIndex >= 0) {
                let aboveActivity = activities[aboveIndex];
                let aboveLevel = parseInt(aboveActivity.level.slice(1));

                if (aboveLevel < currentLevel) {
                    newParentCode = aboveActivity.code;
                    break;
                }
                aboveIndex--;
            }

            if (!newParentCode) return prev;

            let splited = newParentCode.split("/");
            let newNumber = parseInt(splited[splited.length - 1]) + 10;
            let newCode = `${removeLastSegment(newParentCode)}/${newNumber}`;
            let newLevel = `L${currentLevel - 1}`;
            let updatedActivity = {
                ...activity,
                code: newCode,
                prerequisite: newParentCode,
                level: newLevel,
            };

            let updatedActivities = [...activities];
            updatedActivities[activityIndex] = updatedActivity;

            let siblings = updatedActivities.filter((a) => a.level === newLevel && a.code.startsWith(removeLastSegment(newCode)));
            siblings.sort((a, b) => parseInt(a.code.split("/").pop()) - parseInt(b.code.split("/").pop()));

            let count = 10;
            siblings.forEach((sibling, index) => {
                let newSiblingCode = `${removeLastSegment(newCode)}/${count}`;
                sibling.code = newSiblingCode;
                if (index > 0) {
                    sibling.prerequisite = siblings[index - 1].code;
                }
                count += 10;
            });

            updatedActivities.sort((a, b) => {
                let aParts = a.code.split("/").map(Number);
                let bParts = b.code.split("/").map(Number);
                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                    let aPart = aParts[i] || 0;
                    let bPart = bParts[i] || 0;
                    if (aPart !== bPart) return aPart - bPart;
                }
                return 0;
            });

            return { ...prev, activities: updatedActivities };
        });
        handlePrerequisite();
    };

    const handleEdit = (field: any, value: any) => {
        setModuleData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleActivityEdit = (code: any, field: any, value: any) => {
        setModuleData((prev: any) => ({
            ...prev,
            activities: prev.activities.map((activity: any) =>
                activity.code === code ? { ...activity, [field]: value } : activity
            ),
        }));
    };

    const handleModulePlus = () => {
        if (newModelName && selectedOption) {
            if (newModelName.trim()) {
                const generatedId = uuidv4();
                setModuleData({
                    guiId: generatedId,
                    parentModuleCode: moduleCodeName
                        ? moduleCodeName
                        : generateTwoLetterAcronym(newModelName, existingAcronyms),
                    moduleName: newModelName,
                    level: "L1",
                    mineType: selectedOption,
                    activities: []
                })
                setNewModelName("");
                setSelectedOption("");
                setOpenPopup(false);
            }
        }
        else {
            console.error("Module Added Error:", { newModelName, selectedOption, moduleCode });
        }
    }

    const generateShorthand = (input: string): string => {
        return input
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase())
            .join("");
    };

    const handleAddNewMineType = async () => {
        if (newMineType && shorthandCode) {
            try {
                const mineTypeData: any = { type: shorthandCode, description: newMineType };
                const id = await db.addMineType(mineTypeData);
                setOptions([...options, { id, ...mineTypeData }]);
                setNewMineType("");
                setShorthandCode("");
                setMineTypePopupOpen(false);
            } catch (error) {
                console.error("Error adding mine type:", error);
            }
        }
    };

    const handleMineTypeChange = (value: string) => {
        setNewMineType(value);
        setShorthandCode(generateShorthand(value));
    };

    const getAllPrerequisites = () => {
        return moduleData.activities
            .filter((activity: any) => activity.level !== "L1")
            .map((activity: any) => activity.code);
    };

    const handlePrerequisiteChange = (activityCode: any, value: any) => {
        const updatedActivities = moduleData.activities.map((activity: any) =>
            activity.code === activityCode ? { ...activity, prerequisite: value } : activity
        );
        setModuleData((prev: any) => ({ ...prev, activities: updatedActivities }));
    };

    const filterPrerequisites = (inputValue: string, option: any) => {
        return option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
    };

    const handlePrerequisite = () => {
        setModuleData((prev: any) => {
            let parentCode: string = "";
            let firstIndex = 0;

            const updatedActivities = prev.activities.map((activity: any, index: number) => {
                if (firstIndex === 0) {
                    firstIndex = 1;
                    parentCode = activity.code;
                    return { ...activity, prerequisite: "" };
                } else if (activity.level === "L2") {
                    parentCode = activity.code;
                    return { ...activity, prerequisite: prev.activities[index - 1]?.code || "" };
                } else if (activity.level !== "L1") {
                    return { ...activity, prerequisite: parentCode };
                }
                return activity;
            });

            return { ...prev, activities: updatedActivities };
        });
    };

    // const handleAssignRACI = () => {
    //     console.log(selectedRow);

    //     if (!selectedRow) {
    //         notification.warning({
    //             message: "Please select a row to assign RACI.",
    //             duration: 3,
    //         });
    //         return;
    //     }

    //     const filteredData = {
    //         ...moduleData,
    //         activities: moduleData.activities.filter(
    //             (activity: any) => activity.code === selectedRow.code
    //         ),
    //     };
    //     setFilteredModuleData(filteredData);

    //     setOpenModal(true);
    // };

    const handleCancelUpdateModule = () => {
        setOpenCancelUpdateModulePopup(false);

        if (!discardEditByCreating) {
            navigate('/create/module-library');
        }
        else {
            setModuleData({
                parentModuleCode: "",
                moduleName: "",
                level: "",
                mineType: "",
                duration: "",
                activities: []
            })
            isEditing = false;
            setTimeout(() => navigate(".", { replace: true }), 0);
        }
    }

    const handleCreateNewModule = () => {
        if (isEditing) {
            setDiscardEditByCreating(true);
            setOpenCancelUpdateModulePopup(true);
        }
        else {
            setOpenPopup(true)
        }
    }

    const handleSortModule = (order: 'asc' | 'desc' | 'original') => {

        let sortedActivities;

        if (order === "asc") {
            sortedActivities = [...moduleData.activities].sort((a, b) => a.level.localeCompare(b.level));
        } else if (order === "desc") {
            sortedActivities = [...moduleData.activities].sort((a, b) => b.level.localeCompare(a.level));
        } else {
            if (originalActivities.length === 0) {
                return;
            }
            sortedActivities = JSON.parse(JSON.stringify(originalActivities));
        }


        setModuleData((prev: any) => ({
            ...prev,
            activities: sortedActivities
        }));
    };

    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'original' ? 'asc' : sortOrder === 'asc' ? 'desc' : 'original';
        setSortOrder(newOrder);
    };

    const getSortIcon = () => {
        if (sortOrder === 'asc') return <SortAscendingOutlined />;
        if (sortOrder === 'desc') return <SortDescendingOutlined />;
        return <ReloadOutlined />;
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;

        const lastState = undoStack[undoStack.length - 1];
        setUndoStack((prevStack) => prevStack.slice(0, -1));
        setModuleData(lastState);
    };

    const handleClose = () => {
        setOpenCostCalcModal(false);
        form.resetFields();
        setFormValid(false);
    };

    const handleValuesChange = async () => {
        try {
            await form.validateFields();
            setFormValid(true);
        } catch {
            setFormValid(false);
        }
    };

    const showNotificationModal = () => setOpenNotificationModal(true);
    const showDocumentModal = () => setOpenDocumentModal(true);
    const handleOpenCostCalcModal = () => setOpenCostCalcModal(true);

    const showResponsibilityModal = () => {
        setOpenResponsibilityModal(true);
    };

    const handleCloseResponsibility = () => {
        setOpenResponsibilityModal(false);
        raciForm.resetFields();
    };

    const handleRaciChange = async () => {
        try {
            await raciForm.validateFields();
            setFormValid(true);
        } catch {
            setFormValid(false);
        }
    };

    const handleConfirmResponsibility = async () => {
        try {
            const values = await raciForm.validateFields();

            const selectedActivityCode = selectedRow?.code;
            if (!selectedActivityCode) {
                console.error("No activity selected");
                return;
            }

            const updatedActivities = moduleData.activities.map((activity: any) => {
                if (activity.code === selectedActivityCode) {
                    return {
                        ...activity,
                        raci: {
                            responsible: values.responsible,
                            accountable: values.accountable,
                            consulted: values.consulted || [],
                            informed: values.informed || []
                        }
                    };
                }
                return activity;
            });

            const updatedModuleData = {
                ...moduleData,
                activities: updatedActivities
            };
            setModuleData(updatedModuleData);
            handleCloseResponsibility();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleCloseNotification = () => {
        setOpenNotificationModal(false);
        notificationForm.resetFields();
    };

    const handleNotificationChange = () => {
        // Optional validation logic here
    };

    const handleConfirmNotification = async () => {
        try {
            const values = await notificationForm.validateFields();

            const selectedActivityCode = selectedRow?.code;
            const updatedActivities = moduleData.activities.map((activity: any) => {
                if (activity.code === selectedActivityCode) {
                    return {
                        ...activity,
                        notifications: values
                    };
                }
                return activity;
            });

            const updatedModuleData = {
                ...moduleData,
                activities: updatedActivities
            };

            setModuleData(updatedModuleData);

            handleCloseNotification();
        } catch (err) {
            console.error('Validation Error:', err);
        }
    };

    const handleCloseDocument = () => {
        setOpenDocumentModal(false);
        documentForm.resetFields();
    };

    const handleConfirmDocument = async () => {
        try {
            const values = await documentForm.validateFields();
            const selectedActivityCode = selectedRow?.code;

            const updatedActivities = moduleData.activities.map((activity: any) => {
                if (activity.code === selectedActivityCode) {
                    return {
                        ...activity,
                        documents: values.documents
                    };
                }
                return activity;
            });

            const updatedModuleData = {
                ...moduleData,
                activities: updatedActivities
            };

            setModuleData(updatedModuleData);
            handleCloseDocument();
        } catch (err) {
            console.error("Document form error:", err);
        }
    };

    const handleCostConfirm = async () => {
        try {
            const values = await form.validateFields();

            const selectedActivityCode = selectedRow?.code;
            if (!selectedActivityCode) {
                console.warn("No activity selected");
                return;
            }

            const updatedActivities = moduleData.activities.map((activity: any) => {
                if (activity.code === selectedActivityCode) {
                    return {
                        ...activity,
                        cost: {
                            projectCost: values.projectCost,
                            opCost: values.opCost
                        }
                    };
                }
                return activity;
            });

            const updatedModuleData = {
                ...moduleData,
                activities: updatedActivities
            };
            setModuleData(updatedModuleData);
            handleClose();
        } catch (err) {
            console.error("Validation Failed:", err);
        }
    };
    useEffect(() => {
        if (openResponsibilityModal && selectedRow?.code) {
            const activity = moduleData.activities.find((a: any) => a.code === selectedRow.code);
            if (activity?.raci) {
                raciForm.setFieldsValue(activity.raci);
            }
        }
    }, [openResponsibilityModal, selectedRow]);

    useEffect(() => {
        if (openCostCalcModal && selectedRow?.code) {
            const activity = moduleData.activities.find((a: any) => a.code === selectedRow.code);
            if (activity?.cost) {
                form.setFieldsValue({
                    projectCost: activity.cost.projectCost,
                    opCost: activity.cost.opCost
                });
            } else {
                form.resetFields();
            }
        }
    }, [openCostCalcModal, selectedRow]);

    useEffect(() => {
        if (openNotificationModal && selectedRow?.code) {
            const activity = moduleData.activities.find((a: any) => a.code === selectedRow.code);
            if (activity?.notifications) {
                notificationForm.setFieldsValue(activity.notifications);
            } else {
                notificationForm.resetFields();
            }
        }
    }, [openNotificationModal, selectedRow]);
    useEffect(() => {
        if (openDocumentModal && selectedRow?.code) {
            const activity = moduleData.activities.find((a: any) => a.code === selectedRow.code);
            if (activity?.documents) {
                documentForm.setFieldsValue({ documents: activity.documents });
            } else {
                documentForm.resetFields();
            }
        }
    }, [openDocumentModal, selectedRow]);


    return (
        <div>
            <div className="module-main">
                <div className="top-item" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div className="module-title" style={{ display: "flex", justifyContent: "space-between", gap: "100px", alignItems: "center" }}>
                        <span className="">Modules</span>
                        <div className="searching-and-create">
                            <Input
                                placeholder="Search modules, activities, levels"
                                size="small"
                                className="search-input"
                                style={{
                                    height: "30px",
                                    fontSize: "14px",
                                    boxShadow: isFocused ? "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" : "none",
                                    transition: "box-shadow 0.3s ease-in-out",
                                }}
                                prefix={<SearchOutlined />}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                            />
                        </div>
                    </div>
                    <div className="toolbar-container">
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Row gutter={16}>
                                    <Col>
                                        <Tooltip title="Define Activity Cost">
                                            <Button
                                                icon={<FileTextOutlined style={{ color: '#7f8c8d' }} />}
                                                className="icon-button"
                                                onClick={showDocumentModal}
                                                disabled={!selectedRow}
                                            />
                                        </Tooltip>
                                    </Col>
                                    <Col>
                                        <Tooltip title="Define Activity Cost">
                                            <Button
                                                icon={<DollarOutlined style={{ color: '#52c41a' }} />}
                                                className="icon-button"
                                                onClick={handleOpenCostCalcModal}
                                                disabled={!selectedRow}
                                            />
                                        </Tooltip>
                                    </Col>
                                    <Col>
                                        <Tooltip title="Decrease Level">
                                            <Button
                                                icon={<ArrowDownOutlined />}
                                                className="icon-button orange"
                                                onClick={decreaseLevel}
                                                disabled={!selectedRow}
                                            />
                                        </Tooltip>
                                    </Col>
                                    <Col>
                                        <Tooltip title="Increase Level">
                                            <Button
                                                icon={<ArrowUpOutlined />}
                                                className="icon-button orange"
                                                onClick={increaseLevel}
                                                disabled={!selectedRow}
                                            />
                                        </Tooltip>
                                    </Col>

                                    <Col>
                                        <Tooltip title="Delete">
                                            <Button
                                                icon={<DeleteOutlined />}
                                                className="icon-button red"
                                                onClick={() => setIsDeleteModalVisible(true)}
                                                disabled={!selectedRow}
                                            />
                                        </Tooltip>
                                    </Col>
                                    <Col>
                                        <Tooltip title="Undo">
                                            <Button
                                                icon={<RollbackOutlined />}
                                                className="icon-button blue"
                                                onClick={handleUndo}
                                                disabled={undoStack.length === 0}
                                            />
                                        </Tooltip>
                                    </Col>

                                    <Col>
                                        <Tooltip title={`${sortOrder.toUpperCase()}`}>
                                            <Button onClick={toggleSortOrder} icon={getSortIcon()} disabled={moduleData.activities.length == 0} className="icon-button blue" />
                                        </Tooltip>
                                    </Col>
                                    <Col>
                                        <Tooltip title="Assign RACI">
                                            <Button
                                                icon={<UserOutlined />}
                                                onClick={showResponsibilityModal}
                                                className="icon-button blue"
                                                disabled={!selectedRow}
                                            />
                                        </Tooltip>
                                        <Modal
                                            title={<span style={{ fontWeight: "bold", fontSize: "20px" }}>Assign User Roles</span>}
                                            open={openModal}
                                            onCancel={() => setOpenModal(false)}
                                            footer={false}
                                            width={"50%"}
                                        >
                                            <UserRolesPage
                                                open={openModal}
                                                onClose={() => setOpenModal(false)}
                                                selectedRow={selectedRow}
                                                moduleData={filteredModuleData}
                                            />
                                        </Modal>
                                    </Col>
                                    <Col>
                                        <Tooltip title="Notifications">
                                            <Button
                                                icon={<BellOutlined />}
                                                onClick={showNotificationModal}
                                                className="icon-button blue"
                                                disabled={!selectedRow}
                                            />
                                        </Tooltip>
                                        <Modal
                                            title="Notification Settings"
                                            visible={open}
                                            onCancel={() => setOpen(false)}
                                            width={"70%"}
                                            footer={false}
                                        >
                                            <CreateNotification open={open} onClose={() => setOpen(false)} />
                                        </Modal>
                                    </Col>
                                    <Col>
                                        <Tooltip title="Add Activity">
                                            <Button
                                                type="primary"
                                                onClick={addActivity}
                                                className="add-button"
                                                style={{ height: "30px", fontSize: "14px" }}
                                                disabled={!selectedRow}
                                            >
                                                Add Activity
                                            </Button>
                                        </Tooltip>
                                    </Col>

                                    <Col>
                                        <Tooltip title="Create New Module">
                                            <Button
                                                type="primary"
                                                onClick={() => handleCreateNewModule()}
                                                className="add-module-button"
                                                style={{ height: "30px", fontSize: "14px" }}
                                            >
                                                Create New Module
                                            </Button>
                                        </Tooltip>
                                    </Col>

                                    {isEditing && (
                                        <Col>
                                            <Tooltip title="Update Module">
                                                <Button
                                                    type="primary"
                                                    onClick={() => setOpenCancelUpdateModulePopup(true)}
                                                    className="bg-tertiary"
                                                    style={{ height: "30px", fontSize: "14px" }}
                                                >
                                                    Cancel
                                                </Button>
                                            </Tooltip>
                                        </Col>
                                    )}
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="modules-data">
                    <div className="modules-items">
                        <Paper elevation={3}>
                            <Table className="custom-table">
                                <TableHead className="custom-header">
                                    <TableRow sx={{ backgroundColor: '#258790' }}>
                                        <TableCell sx={{ fontWeight: 'bold', color: "white" }}>Code</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: "white" }}>Module Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: "white" }}>Duration (in days)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: "white" }}>Prerequisites</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: "white" }}>Level</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    <TableRow
                                        hover
                                        selected={selectedRow === moduleData}
                                        onClick={() => setSelectedRow(moduleData)}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleEdit('parentModuleCode', e.target.innerText)}
                                            sx={{ cursor: 'text', outline: 'none', padding: '10px' }}
                                        >{moduleData.parentModuleCode}</TableCell>
                                        <TableCell
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleEdit('moduleName', e.target.innerText)}
                                            sx={{ cursor: 'text', outline: 'none', padding: '10px' }}
                                        >
                                            {moduleData.moduleName}
                                        </TableCell>
                                        {/* <TableCell
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleEdit('duration', e.target.innerText)}
                                            sx={{ cursor: 'text', outline: 'none', padding: '10px' }}
                                        >{moduleData.duration}
                                        </TableCell> */}
                                        <TableCell sx={{ padding: '10px', color: '#808080' }}>
                                            {moduleData.duration}
                                        </TableCell>
                                        {/* <TableCell contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleEdit('', e.target.innerText)}
                                            sx={{ cursor: 'text', outline: 'none', padding: '10px' }}></TableCell> */}

                                        <TableCell sx={{ padding: '10px', color: '#808080' }}>
                                            {moduleData.prerequisite || ''}
                                        </TableCell>

                                        <TableCell sx={{ padding: '10px', cursor: "pointer" }}>{moduleData.level}</TableCell>
                                    </TableRow>
                                    {moduleData.activities
                                        // .sort((a: any, b: any) => a.code.localeCompare(b.code))
                                        .map((activity: any, index: any, sortedActivities: any) => (
                                            <TableRow
                                                hover
                                                key={activity.code}
                                                selected={selectedRow?.code === activity.code}
                                                onClick={() => setSelectedRow(activity)}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell sx={{ padding: '10px', cursor: "pointer" }}>{activity.code}</TableCell>
                                                <TableCell
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleActivityEdit(activity.code, 'activityName', e.target.innerText)}
                                                    sx={{ cursor: 'text', outline: 'none', padding: '10px' }}
                                                >
                                                    {activity.activityName}
                                                </TableCell>
                                                <TableCell
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleActivityEdit(activity.code, 'duration', e.target.innerText)}
                                                    sx={{ cursor: 'text', outline: 'none', padding: '10px' }}
                                                >
                                                    {activity.duration}
                                                </TableCell>
                                                <TableCell sx={{ padding: '10px' }}>
                                                    <AutoComplete
                                                        value={activity.prerequisite || (index === 0 && activity.level === 'L2' ? "" : (sortedActivities[index - 1]?.code || ""))}
                                                        options={getAllPrerequisites().map((code: string) => ({ value: code }))}
                                                        onChange={(value) => handlePrerequisiteChange(activity.code, value)}
                                                        filterOption={filterPrerequisites}
                                                        placeholder="Select Prerequisite"
                                                        style={{ width: '100%' }}
                                                        allowClear
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ padding: '10px', cursor: "pointer" }}>{activity.level}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>

                            </Table>
                        </Paper>
                    </div>
                    <div className="save-button-container">
                        <Button
                            type="primary"
                            className="save-button"
                            onClick={handleSaveModuleAndActivity}
                            disabled={!moduleData.parentModuleCode}
                        >
                            {isEditing ? "Update" : "Save"}
                        </Button>
                    </div>
                </div>

                <Modal
                    title="Create New Module"
                    open={openPopup}
                    onCancel={() => setOpenPopup(false)}
                    onOk={handleModulePlus}
                    okButtonProps={{ className: "bg-secondary" }}
                    cancelButtonProps={{ className: "bg-tertiary" }}
                    maskClosable={false}
                    keyboard={false}
                    className="modal-container"
                    style={{ marginBottom: "10px !important" }}
                >
                    <div className="modal-body-item-padding">
                        <Radio.Group
                            value={moduleType}
                            onChange={(e) => setModuleType(e.target.value)}
                            style={{ marginBottom: "10px" }}
                        >
                            <Radio value="custom">Custom Module</Radio>
                            <Radio value="mdts">MDTS Module</Radio>
                        </Radio.Group>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <Select
                                style={{ width: "100%", marginBottom: "10px" }}
                                value={selectedOption || undefined}
                                onChange={setSelectedOption}
                                placeholder="Select mine type"
                            >
                                {options.map((option: any, index) => (
                                    <Option key={index} value={option.type}>
                                        {option.type}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => setMineTypePopupOpen(true)}
                            />
                        </div>

                        {moduleType === "custom" ? (
                            <Input
                                placeholder="Module Name"
                                value={newModelName}
                                onChange={(e) => setNewModelName(e.target.value)}
                                style={{ marginBottom: "10px" }}
                            />
                        ) : (
                            <Select
                                style={{ width: "100%", marginBottom: "10px" }}
                                value={selectedMDTSModule || undefined}
                                onChange={setSelectedMDTSModule}
                                placeholder="Select MDTS Module"
                            >
                                {mdtsModules.map((module, index) => (
                                    <Option key={index} value={module}>
                                        {module}
                                    </Option>
                                ))}
                            </Select>
                        )}
                        <Input
                            placeholder="Module Code"
                            value={moduleCodeName}
                            onChange={(e) => setModuleCodeName(e.target.value)}
                            style={{ marginBottom: "10px" }}
                        />
                    </div>
                </Modal>

                <Modal
                    title="Add Mine Type"
                    open={mineTypePopupOpen}
                    onCancel={() => setMineTypePopupOpen(false)}
                    onOk={handleAddNewMineType}
                    okButtonProps={{ className: "bg-secondary" }}
                    cancelButtonProps={{ className: "bg-tertiary" }}
                    maskClosable={false}
                    keyboard={false}
                    className="modal-container"
                >
                    <div className="modal-body-item-padding">
                        <Input
                            placeholder="Enter Mine Type"
                            value={newMineType}
                            onChange={(e) => handleMineTypeChange(e.target.value)}
                            style={{ marginBottom: "10px" }}
                        />

                        <Typography>Shorthand Code: <strong>{shorthandCode}</strong></Typography>
                    </div>
                </Modal>

                <Modal
                    title="Confirm Delete"
                    visible={isDeleteModalVisible}
                    onOk={deleteActivity}
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
                            {selectedRow?.parentModuleCode
                                ? "Are you sure you want to delete this module? All associated activities will also be removed. This action cannot be undone."
                                : "Are you sure you want to remove this activity? This action cannot be undone."}
                        </p>
                    </div>
                </Modal >

                <Modal
                    title="Confirm Cancel"
                    visible={openCancelUpdateModulePopup}
                    onOk={handleCancelUpdateModule}
                    onCancel={() => setOpenCancelUpdateModulePopup(false)}
                    okText="Yes Discard"
                    cancelText="Cancel"
                    okType="danger"
                    className="modal-container"
                >
                    <div style={{ padding: "0px 10px" }}>
                        <p>
                            Are you sure you want to cancel?
                        </p>
                    </div>
                </Modal >

                <Modal
                    title="Define Cost for Delay (₹ / Day)"
                    open={openCostCalcModal}
                    onCancel={handleClose}
                    onOk={handleCostConfirm}
                    destroyOnClose
                    className="modal-container"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={handleValuesChange}
                        style={{ padding: "0px 10px", display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                        <Form.Item
                            label=""
                            style={{ marginBottom: 16 }}
                        >
                            <Row align="middle" gutter={8}>
                                <Col flex="150px">Project Cost</Col>
                                <Col flex="auto">
                                    <Form.Item
                                        name="projectCost"
                                        noStyle
                                        rules={[{ required: true, message: 'Please enter Project Cost' }]}
                                    >
                                        <Input type="number" min={0} placeholder="Enter Project Cost" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>

                        <Form.Item label="" style={{ marginBottom: 24 }}>
                            <Row align="middle" gutter={8}>
                                <Col flex="150px">Opportunity Cost</Col>
                                <Col flex="auto">
                                    <Form.Item
                                        name="opCost"
                                        noStyle
                                        rules={[{ required: true, message: 'Please enter OP Cost' }]}
                                    >
                                        <Input type="number" min={0} placeholder="Enter OP Cost" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Form>

                </Modal>

                <Modal
                    title="Assign Responsibility"
                    open={openResponsibilityModal}
                    onCancel={handleCloseResponsibility}
                    onOk={handleConfirmResponsibility}
                    okButtonProps={{ disabled: !formValid }}
                    destroyOnClose
                    className="modal-container"
                    maskClosable={false}
                    keyboard={false}
                >
                    <Form
                        form={raciForm}
                        layout="vertical"
                        onValuesChange={handleRaciChange}
                        style={{ padding: "0px 10px", display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                        <Form.Item label="" style={{ marginBottom: 16 }}>
                            <Row align="middle" gutter={8}>
                                <Col flex="150px">Responsible</Col>
                                <Col flex="auto">
                                    <Form.Item
                                        name="responsible"
                                        noStyle
                                        rules={[{ required: true, message: 'Please select a Responsible person' }]}
                                    >
                                        <Select placeholder="Select Responsible">
                                            {userOptions.map(user => (
                                                <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>

                        <Form.Item label="" style={{ marginBottom: 16 }}>
                            <Row align="middle" gutter={8}>
                                <Col flex="150px">Accountable</Col>
                                <Col flex="auto">
                                    <Form.Item
                                        name="accountable"
                                        noStyle
                                        rules={[{ required: true, message: 'Please select an Accountable person' }]}
                                    >
                                        <Select placeholder="Select Accountable">
                                            {userOptions.map(user => (
                                                <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>

                        <Form.Item label="" style={{ marginBottom: 16 }}>
                            <Row align="middle" gutter={8}>
                                <Col flex="150px">Consulted</Col>
                                <Col flex="auto">
                                    <Form.Item
                                        name="consulted"
                                        noStyle
                                    >
                                        <Select mode="multiple" placeholder="Select Consulted">
                                            {userOptions.map(user => (
                                                <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>

                        <Form.Item label="" style={{ marginBottom: 24 }}>
                            <Row align="middle" gutter={8}>
                                <Col flex="150px">Informed</Col>
                                <Col flex="auto">
                                    <Form.Item
                                        name="informed"
                                        noStyle
                                    >
                                        <Select mode="multiple" placeholder="Select Informed">
                                            {userOptions.map(user => (
                                                <Select.Option key={user.id} value={user.id}>{user.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title="Configure Notifications"
                    open={openNotificationModal}
                    onCancel={handleCloseNotification}
                    onOk={handleConfirmNotification}
                    maskClosable={false}
                    keyboard={false}
                    destroyOnClose
                    className="modal-container"
                >
                    <Form
                        form={notificationForm}
                        layout="vertical"
                        onValuesChange={handleNotificationChange}
                        style={{ padding: "0px 10px", display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                        {['started', 'completed', 'delayed'].map((key) => (
                            <Form.Item label="" key={key}>
                                <Row align="middle" gutter={8}>
                                    <Col flex="150px" style={{ textTransform: 'capitalize' }}>
                                        {key}
                                    </Col>
                                    <Col>
                                        <Form.Item name={[key, 'enabled']} valuePropName="checked" noStyle>
                                            <Switch />
                                        </Form.Item>
                                    </Col>
                                    <Col flex="auto">
                                        {key !== 'delayed' ? (
                                            <Form.Item name={[key, 'message']} noStyle>
                                                <Input placeholder="Enter text here" />
                                            </Form.Item>
                                        ) : (
                                            <Form.Item
                                                shouldUpdate={(prev, curr) =>
                                                    prev.delayed?.enabled !== curr.delayed?.enabled
                                                }
                                                noStyle
                                            >
                                                {({ getFieldValue }) => (
                                                    <Form.Item
                                                        name={['delayed', 'duration']}
                                                        noStyle
                                                        rules={[
                                                            {
                                                                required: getFieldValue(['delayed', 'enabled']),
                                                                message: 'Select duration if Delayed is enabled'
                                                            }
                                                        ]}
                                                    >
                                                        <Select
                                                            placeholder="Select delay duration"
                                                            disabled={!getFieldValue(['delayed', 'enabled'])}
                                                            showSearch
                                                            optionFilterProp="children"
                                                        >
                                                            <Select.Option value="1 day">1 day</Select.Option>
                                                            <Select.Option value="7 days">7 days</Select.Option>
                                                            <Select.Option value="14 days">14 days</Select.Option>
                                                            <Select.Option value="30 days">30 days</Select.Option>
                                                        </Select>
                                                    </Form.Item>
                                                )}
                                            </Form.Item>
                                        )}
                                    </Col>
                                </Row>
                            </Form.Item>
                        ))}
                    </Form>
                </Modal>

                <Modal
                    title="Configure Required Documents"
                    open={openDocumentModal}
                    onCancel={handleCloseDocument}
                    onOk={handleConfirmDocument}
                    maskClosable={false}
                    keyboard={false}
                    destroyOnClose
                    className="modal-container"
                >
                    <Form
                        form={documentForm}
                        layout="vertical"
                        name="documentForm"
                        style={{ padding: "0px 10px", display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                        <Form.List name="documents">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Form.Item key={key} required={false}>
                                            <Row gutter={8} align="middle">
                                                <Col flex="auto">
                                                    <Form.Item
                                                        {...restField}
                                                        name={name}
                                                        rules={[{ required: true, message: 'Please enter document name' }]}
                                                        noStyle
                                                    >
                                                        <Input placeholder="Enter document name" />
                                                    </Form.Item>
                                                </Col>
                                                <Col>
                                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                                </Col>
                                            </Row>
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Add Document
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default Module;