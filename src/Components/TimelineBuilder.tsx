import { useEffect, useState } from "react";
import { Input, DatePicker, Select, Table, Button, Checkbox, Steps, Modal, Result, notification, Progress, Typography } from "antd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/time-builder.css";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
const { Option } = Select;
const { Step } = Steps;
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, ClockCircleOutlined, CloseCircleOutlined, CloseOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, FolderOpenOutlined, LinkOutlined, PlusOutlined, SaveOutlined, ToolOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { db } from "../Utils/dataStorege.ts";
import { getCurrentUser } from '../Utils/moduleStorage';
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";
import { Box } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
interface Activity {
  [x: string]: string;
  code: string;
  activityName: string;
  prerequisite: string;
  slack: string;
  level: string;
  duration: string;
  start: any;
  end: any;
  activityStatus: any;
}

interface Module {
  parentModuleCode: string;
  moduleName: string;
  activities: Activity[];
}

interface HolidayData {
  key: string;
  from: string;
  to: string;
  holiday: string;
  module: string[];
  impact: Record<string, string>;
}

interface Column {
  title: any;
  width?: string;
  dataIndex: string;
  key: string;
  align?: "center" | "left" | "right";
  render?: any;
}

const TimeBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [sequencedModules, setSequencedModules] = useState<Module[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [_activitiesData, setActivitiesData] = useState<Activity[]>([]);
  const [holidayData, setHolidayData] = useState<HolidayData[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [dataSource, setDataSource] = useState<any>([]);
  const [finalData, setFinalData] = useState<Module[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<any>(null);
  const [_libraryName, setLibraryName] = useState<any>();
  const [isCancelEditModalVisible, setIsCancelEditModalVisiblVisible] = useState(false);
  const [selectedProjectMineType, setSelectedProjectMineType] = useState("");
  const [finalHolidays, setFinalHolidays] = useState<HolidayData[]>();
  const [isSaturdayWorking, setIsSaturdayWorking] = useState(false);
  const [isSundayWorking, setIsSundayWorking] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const location = useLocation();
  const [isMenualTimeline, setIsMenualTimeline] = useState(false);
  const [allProjectsTimelines, setAllProjectsTimelines] = useState<any[]>([]);
  const [openExistingTimelineModal, setOpenExistingTimelineModal] = useState(false);
  const [selectedExistingProjectId, setSelectedExistingProjectId] = useState(null);
  const [selectedExistingProject, setSelectedExistigProject] = useState<any>(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editedImpact, setEditedImpact] = useState<any>({});
  const [_deletedModules, setDeletedModules] = useState<any>([]);
  const [isDeletionInProgress, setIsDeletionInProgress] = useState(false);
  const [_deletedActivities, setDeletedActivities] = useState<any[]>([]);
  const [deletingActivity, setDeletingActivity] = useState<string | null>(null);
  const [selectedTimelineId, setSelectedTimelineId] = useState<any>("");
  const [isReplanMode, setIsReplanMode] = useState(false);
  const finalColumns: ColumnsType = [
    { title: "Sr No", dataIndex: "Code", key: "Code", width: 100, align: "center" },
    { title: "Key Activity", dataIndex: "keyActivity", key: "keyActivity", width: 250, align: "left" },
    { title: "Duration", dataIndex: "duration", key: "duration", width: 80, align: "center" },
    { title: "Pre-Requisite", dataIndex: "preRequisite", key: "preRequisite", width: 120, align: "center" },
    { title: "Slack", dataIndex: "slack", key: "slack", width: 80, align: "center" },
    { title: "Planned Start", dataIndex: "plannedStart", key: "plannedStart", width: 120, align: "center" },
    { title: "Planned Finish", dataIndex: "plannedFinish", key: "plannedFinish", width: 120, align: "center" }
  ];
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState<any>(null);
  const moduleOptions = ["Land Acquisition", "Forest Clearance", "Budget Planning"];
  const [isAddHolidayModalVisible, setAddHolidayModalVisible] = useState(false);
  const [libraries, setAllLibraries] = useState<any>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState(null);
  const [selectedLibrary, setSelectedLibrary] = useState(null);

  const [newHoliday, setNewHoliday] = useState({
    from: null,
    to: null,
    holiday: "",
    module: [],
    impact: {},
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [_rows, setRows] = useState([
    {
      from: null, to: null, holiday: "", module: [], impact: {}, editing: true
    },
  ]);

  // const userOptions = [
  //   { id: '6fa84f42-81e4-49fd-b9fc-1cbced2f1d90', name: 'Amit Sharma' },
  //   { id: '2de753d4-1be2-4230-a1ee-ec828ef10f6a', name: 'Priya Verma' },
  //   { id: '12fcb989-f9ae-4904-bdcf-9c9d8b63e8cd', name: 'Rahul Mehta' },
  //   { id: '9d8f16ee-e21c-4c58-9000-dc3d51f25f2e', name: 'Sneha Reddy' },
  //   { id: 'c5c07f70-dbb6-4b02-9cf2-8f9e2d6b3c5f', name: 'Vikram Iyer' },
  //   { id: 'a95f34d0-3cf9-4c58-9a70-dcc68a0c32a4', name: 'Neha Kapoor' },
  //   { id: 'b4ac3f1b-0591-4435-aabb-b7a7fc5c3456', name: 'Ankit Jaiswal' },
  //   { id: 'e7a54111-0a0c-4f91-849c-6816f74e7b12', name: 'Divya Narayan' },
  //   { id: '15b7ecdc-65a6-4652-9441-6ce4eacc6dfc', name: 'Rohit Das' },
  //   { id: 'f8db6b6b-2db1-4a9e-bdc0-bf2c4015f6a7', name: 'Meera Joshi' }
  // ];
  const [userOptions, setUserOptions] = useState<any>([]);
  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.orgId) {
      fetchAllLibrary(currentUser);
      fetchHolidays();
    }
  }, [currentUser]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setExpandedRowKeys(modules.map((module) => module.parentModuleCode));
      setFinalData(modules);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [modules]);

  useEffect(() => {
    if (currentStep == 6) {
      setExpandedKeys(finalData.map((_, index) => `module-${index}`));
      const finDataSource = sequencedModules.map((module: any, moduleIndex: number) => {
        return {
          key: `module-${moduleIndex}`,
          SrNo: module.parentModuleCode,
          Code: module.parentModuleCode,
          keyActivity: module.moduleName,
          isModule: true,
          children: (module.activities || []).map((activity: any, actIndex: number) => {
            return {
              key: `activity-${moduleIndex}-${actIndex}`,
              SrNo: module.parentModuleCode,
              Code: activity.code,
              keyActivity: activity.activityName,
              duration: activity.duration ?? "",
              preRequisite: activity.prerequisite ?? "-",
              slack: activity.slack ?? "0",
              plannedStart: activity.start ? dayjs(activity.start).format("DD-MM-YYYY") : "-",
              plannedFinish: activity.end ? dayjs(activity.end).format("DD-MM-YYYY") : "-",
              actualStart: activity.actualStart,
              actualFinish: activity.actualFinish,
              actualDuration: "",
              remarks: "",
              expectedStart: "",
              expectedFinish: "",
              isModule: false,
              activityStatus: activity.activityStatus || "Pending",
            };
          }),
        };
      });
      setDataSource(finDataSource);
      const hasStatus = sequencedModules.some((item: any) => !!item.status);
      const hasActualStart = sequencedModules.some((item: any) => !!item.actualStart);
      const hasActualFinish = sequencedModules.some((item: any) => !!item.actualFinish);
      if (hasStatus) {
        finalColumns.push({
          title: "Status",
          dataIndex: "status",
          key: "status",
          align: "center",
          render: (text: string) => {
            const status = text?.toLowerCase();
            let color = "", label = "";

            switch (status) {
              case "completed":
                color = "green";
                label = "COMPLETED";
                break;
              case "inprogress":
                color = "#faad14";
                label = "IN PROGRESS";
                break;
              case "yettostart":
                color = "#8c8c8c";
                label = "YET TO START";
                break;
              default:
                color = "#000";
                label = status?.toUpperCase() || "";
            }

            return <span style={{ fontWeight: 'bold', color }}>{label}</span>;
          }
        });
      }

      if (hasActualStart) {
        finalColumns.push({
          title: "Actual Start",
          dataIndex: "actualStart",
          key: "actualStart",
          align: "center",
        });
      }

      if (hasActualFinish) {
        finalColumns.push({
          title: "Actual Finish",
          dataIndex: "actualFinish",
          key: "actualFinish",
          align: "center",
        });
      }
    }
  }, [currentStep, finalData]);

  useEffect(() => {
    finalData.forEach((module) => {
      module.activities.forEach((activity) => {
        if (activity.start) {
          handleStartDateChange(activity.code, activity.start);
        }
      });
    });
  }, [isSaturdayWorking, isSundayWorking, finalHolidays]);

  useEffect(() => {
    const fetchData = async () => {
      const state = location.state;
      if (!state?.selectedProject || !state?.selectedTimeline) return;

      setIsReplanMode(state.rePlanTimeline || false);

      const { selectedProject, selectedTimeline } = state;
      const { projectParameters, id, holidays, projectTimeline, initialStatus } = selectedProject || {};

      const timelineId = selectedTimeline.versionId || selectedTimeline.timelineId;
      setSelectedTimelineId(timelineId);
      getProjectTimeline(timelineId);
      setIsUpdateMode(true);
      setSelectedProjectName(projectParameters?.projectName || "");
      setSelectedProjectId(id || "");
      setSelectedProject(selectedProject || {});
      setFinalHolidays(holidays || []);

      setLibraryName(initialStatus?.library || []);

      if (projectTimeline?.length) {
        setIsSaturdayWorking(projectTimeline[0]?.saturdayWorking || false);
        setIsSundayWorking(projectTimeline[0]?.sundayWorking || false);
        setSelectedProjectMineType(projectParameters?.typeOfMine || "");
      } else {
        setLibraryName([]);
      }

      setIsMenualTimeline(true);
    };

    fetchData();
  }, [location.state]);

  const fetchHolidays = async () => {
    try {
      const holidays = (await db.getAllHolidays())
        .filter((h: any) => h.orgId == currentUser.orgId);
      if (holidays) {
        const updatedData: HolidayData[] = holidays.map((item: any, index: number) => ({
          ...item,
          from: item.from?.$d ? item.from.$d : item.from,
          to: item.to?.$d ? item.to.$d : item.to,
          key: String(index + 1),
        }));

        setHolidayData(updatedData);
        setFinalHolidays(updatedData);
        setSelected(Object.fromEntries(updatedData.map((item) => [item.key, true])));
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const getProjectTimeline = async (timelineId: any) => {
    if (timelineId) {
      try {
        const timeline = await db.getProjectTimelineById(timelineId);
        if (timeline?.orgId !== currentUser.orgId) return;
        const finTimeline = timeline.map(({ id, ...rest }: any) => rest);
        if (Array.isArray(finTimeline)) {
          handleLibraryChange(finTimeline);
        } else {
          handleLibraryChange([]);
        }

        return finTimeline;
      } catch (err) {
        console.error("Error fetching timeline:", err);
        return [];
      }
    }
    return [];
  };

  const defaultSetup = async (allFoundlibrary: any = []) => {
    try {
      const allUsers = await db.getUsers();
      setUserOptions(allUsers);
      const allProjects = (await db.getProjects())
        .filter((p: any) => p.orgId == currentUser.orgId);
      const frestTimelineProject = allProjects.filter((item: any) => item.projectTimeline == undefined);
      setAllProjectsTimelines(allProjects.filter((item: any) => item.projectTimeline != undefined))
      if (!Array.isArray(frestTimelineProject) || frestTimelineProject.length == 0) {
        setAllProjects([]);
        return;
      }
      setAllProjects(frestTimelineProject);
      if (frestTimelineProject && Array.isArray(frestTimelineProject) && frestTimelineProject.length == 1) {
        const firstProject = frestTimelineProject[0];
        if (firstProject && firstProject.id) {
          setSelectedProjectId(firstProject.id);
          setSelectedProject(frestTimelineProject[0]);

          const project = frestTimelineProject.find((p) => p?.id == firstProject.id);
          const selectedProjectLibrary = project.initialStatus.library || [];
          setLibraryName(selectedProjectLibrary);
          if (selectedProjectLibrary) {
            const matchedLibrary = allFoundlibrary.find(
              (lib: any) => lib.name == selectedProjectLibrary
            );

            if (matchedLibrary) {
              setSelectedLibraryId(matchedLibrary.id);
              setSelectedLibrary(matchedLibrary);
            } else {
              console.log("Library not found:", selectedProjectLibrary);
            }
          }
          if (project && project.projectTimeline) {
            if (project.projectParameters) {
              setSelectedProjectMineType(project.projectParameters.typeOfMine || "");
            }
            setIsSaturdayWorking(project.projectTimeline[0].saturdayWorking)
            setIsSundayWorking(project.projectTimeline[0].sundayWorking)

            if (Array.isArray(project.projectTimeline)) {
              handleLibraryChange(project.projectTimeline);
            } else {
              handleLibraryChange([]);
            }
          }
          else if (project && project.initialStatus) {
            if (project.projectParameters) {
              setSelectedProjectMineType(project.projectParameters.typeOfMine || "");
            }

            if (Array.isArray(project.initialStatus.items)) {
              handleLibraryChange(
                project.initialStatus.items.filter(
                  (item: any) => item?.status?.toLowerCase() !== "completed"
                )
              );
            } else {
              handleLibraryChange([]);
            }
          } else {
            setLibraryName([]);
          }
        }
      }

    } catch (error) {
      console.error("An unexpected error occurred while fetching projects:", error);
    }
  }

  const toggleCheckbox = (key: string) => {
    setSelected((prev) => {
      const updatedSelected = { ...prev, [key]: !prev[key] };
      const updatedHolidays = holidayData.filter((holiday) => updatedSelected[holiday.key]);
      setFinalHolidays(updatedHolidays);
      const updatedModules = finalData.map((module) => ({
        ...module,
        holidays: updatedHolidays,
      }));

      setFinalData(updatedModules);

      return updatedSelected;
    });
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      if (isUpdateMode) {
        handleSaveProjectTimeline(sequencedModules);
        setTimeout(() => {
          navigate("/create/project-timeline");
        }, 1000);
      }
      else {
        handleSaveProjectTimeline(sequencedModules);
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(sequencedModules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFinalData(items);
    setSequencedModules(items);
  };

  const handleDurationChange = (code: any, newDuration: any) => {
    let updatedFinalData = [...finalData];
    let updatedSequencedModules = [...sequencedModules];

    function updateActivities(activities: any) {
      return activities.map((activity: any) => {
        if (activity.activityStatus == "completed" || activity.fin_status == "completed") {
          return activity;
        }

        if (activity.code == code) {
          activity.duration = newDuration;
          if (activity.start && !isUpdateMode && !isReplanMode) {
            const startDate = activity.start;
            const duration = parseInt(newDuration, 10) || 0;

            const { date: endDate, holidays: durationHolidays } = addBusinessDays(startDate, duration);

            activity.end = endDate;
            activity.holidays = [...(activity.holidays || []), ...durationHolidays];

            updateDependentActivities(activity.code, endDate);
          }
        }

        return activity;
      });
    }

    updatedFinalData = updatedFinalData.map((module) => ({
      ...module,
      activities: updateActivities(module.activities),
    }));

    updatedSequencedModules = updatedSequencedModules.map((module) => ({
      ...module,
      activities: updateActivities(module.activities),
    }));

    setFinalData(updatedFinalData);
    setSequencedModules(updatedSequencedModules);
  };

  const handleSlackChange = (code: any, newSlack: any) => {
    let updatedFinalData = [...finalData];
    let updatedSequencedModules = [...sequencedModules];

    function updateActivities(activities: any) {
      return activities.map((activity: any) => {
        if (activity.activityStatus == "completed" || activity.fin_status == "completed") {
          return activity;
        }
        if (activity.code == code) {
          activity.slack = newSlack;
          const prerequisiteEndDate = activity.prerequisite
            ? getActivityEndDate(activity.prerequisite)
            : activity.start;
          const { date: startDate, holidays: slackHolidays } = addBusinessDays(prerequisiteEndDate, parseInt(newSlack, 10) + 1);
          const duration = parseInt(activity.duration, 10) || 0;
          const { date: endDate, holidays: durationHolidays } = addBusinessDays(startDate, duration);

          activity.start = startDate;
          activity.end = endDate;
          activity.holidays = [...slackHolidays, ...durationHolidays];
          updateDependentActivities(activity.code, endDate);
        }
        return activity;
      });
    }

    updatedFinalData = updatedFinalData.map((module) => ({
      ...module,
      activities: updateActivities(module.activities),
    }));

    updatedSequencedModules = updatedSequencedModules.map((module) => ({
      ...module,
      activities: updateActivities(module.activities),
    }));

    setFinalData(updatedFinalData);
    setSequencedModules(updatedSequencedModules);
  };

  const getActivityEndDate = (prerequisiteCode: any) => {
    let endDate = null;
    finalData.forEach((module) => {
      module.activities.forEach((activity) => {
        if (activity.code == prerequisiteCode) {
          endDate = activity.end;
        }
      });
    });
    return endDate;
  };

  const addBusinessDays = (startDate: string, days: number) => {
    let date = new Date(startDate);
    let addedDays = 0;
    let holidays: { date: string; reason: string }[] = [];

    while (addedDays < days) {
      date.setDate(date.getDate() + 1);

      const day = date.getDay();
      const formattedDate = date.toISOString().split("T")[0];

      const isSaturday = day == 6;
      const isSunday = day == 0;

      const holidayEntry: any = finalHolidays?.find((holiday: any) => {
        const holidayDate = new Date(holiday.from).toISOString().split("T")[0];
        return holidayDate == formattedDate;
      });

      if (isSaturday && !isSaturdayWorking) {
        holidays.push({ date: formattedDate, reason: "Saturday" });
      } else if (isSunday && !isSundayWorking) {
        holidays.push({ date: formattedDate, reason: "Sunday" });
      } else if (holidayEntry) {
        holidays.push({
          date: formattedDate,
          reason: holidayEntry.holiday || "Holiday",
        });
      } else {
        addedDays++;
      }
    }

    const finalDate = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return { date: finalDate, holidays };
  };

  const handleStartDateChange = (code: any, date: any) => {
    let updatedFinalData = [...finalData];
    let updatedSequencedModules = [...sequencedModules];

    function updateActivities(activities: any) {
      return activities.map((activity: any) => {
        if (activity.code == code) {
          const duration = parseInt(activity.duration, 10) || 0;
          const { date: endDate, holidays } = addBusinessDays(date, duration);

          activity.start = date;
          activity.end = endDate;
          activity.holidays = holidays;
          activity.saturdayWorking = isSaturdayWorking;
          activity.sundayWorking = isSundayWorking;

          updateDependentActivities(activity.code, endDate);
        }
        return activity;
      });
    }

    updatedFinalData = updatedFinalData.map((module) => ({
      ...module,
      activities: updateActivities(module.activities),
    }));

    updatedSequencedModules = updatedSequencedModules.map((module) => ({
      ...module,
      saturdayWorking: isSaturdayWorking,
      sundayWorking: isSundayWorking,
      activities: updateActivities(module.activities),
    }));

    setFinalData(updatedFinalData);
    setSequencedModules(updatedSequencedModules);
  };

  const updateDependentActivities = (prerequisiteCode: any, prerequisiteEndDate: any) => {
    let updatedFinalData = [...finalData];
    let updatedSequencedModules = [...sequencedModules];

    function updateActivities(activities: any) {
      return activities.map((activity: any) => {
        if (activity.prerequisite == prerequisiteCode) {
          const slack = parseInt(activity.slack, 10) || 0;
          const { date: startDate, holidays: slackHolidays } = addBusinessDays(prerequisiteEndDate, slack + 1);
          const duration = parseInt(activity.duration, 10) || 0;
          const { date: endDate, holidays: durationHolidays } = addBusinessDays(startDate, duration);

          activity.start = startDate;
          activity.end = endDate;
          activity.holidays = [...slackHolidays, ...durationHolidays];
          activity.saturdayWorking = isSaturdayWorking;
          activity.sundayWorking = isSundayWorking;

          updateDependentActivities(activity.code, endDate);
        }
        return activity;
      });
    }

    updatedFinalData = updatedFinalData.map((module) => ({
      ...module,
      activities: updateActivities(module.activities),
    }));

    updatedSequencedModules = updatedSequencedModules.map((module) => ({
      ...module,
      saturdayWorking: isSaturdayWorking,
      sundayWorking: isSundayWorking,
      activities: updateActivities(module.activities),
    }));

    setFinalData(updatedFinalData);
    setSequencedModules(updatedSequencedModules);
  };

  const handleActivitySelection = (activityCode: string, isChecked: boolean) => {
    if (isDeletionInProgress) return;
    const module = sequencedModules.find(m => m.parentModuleCode == "moduleCode");
    const hasCompletedActivities = module?.activities.some(activity =>
      activity.activityStatus == "completed" || activity.fin_status == "completed"
    );

    if (hasCompletedActivities) {
      notify.warning("Cannot delete module with completed activities");
      return;
    }

    setSelectedActivities((prevSelectedActivities) => {
      if (!isChecked) {
        let removedActivityIndex: number | null = null;
        let removedActivity: any = null;
        let parentModuleCode: string | null = null;

        setSequencedModules((prevFinalData) =>
          prevFinalData.map((module) => {
            const index = module.activities.findIndex(
              (activity) => activity.code == activityCode
            );

            if (index !== -1) {
              removedActivityIndex = index;
              removedActivity = { ...module.activities[index] };
              parentModuleCode = module.parentModuleCode;
            }

            return {
              ...module,
              activities: module.activities.filter(
                (activity) => activity.code !== activityCode
              ),
            };
          })
        );

        if (removedActivity && parentModuleCode) {
          setDeletedActivities((prevDeleted: any) => [
            ...prevDeleted,
            { ...removedActivity, index: removedActivityIndex, parentModuleCode },
          ]);
        }

        setIsDeletionInProgress(true);
        setDeletingActivity(activityCode);

        const key = `delete-activity-${activityCode}`;
        let progress = 100;
        let isUndoClicked = false;

        const updateProgress = () => {
          if (isUndoClicked) {
            setIsDeletionInProgress(false);
            setDeletingActivity(null);
            return;
          }
          progress -= 2;
          if (progress <= 0) {
            notification.destroy(key);
            setIsDeletionInProgress(false);
            setDeletingActivity(null);
            return;
          }

          notification.open({
            key,
            message: null,
            duration: 0,
            closeIcon: null,
            style: {
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.15)",
              background: "#FFF8F0",
              width: "100%",
              display: "flex",
              alignItems: "center",
            },
            btn: (
              <>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      margin: "0px 8px 0 4px",
                      fontSize: "13px",
                      color: "#444",
                      fontWeight: "500",
                      width: "200px",
                    }}
                  >
                    {removedActivity?.name} has been deleted.
                  </p>

                  <div>
                    <Button
                      type="primary"
                      size="small"
                      style={{
                        background: "#258790",
                        border: "none",
                        fontWeight: "bold",
                        color: "#fff",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        minWidth: "60px",
                      }}
                      onClick={() => {
                        isUndoClicked = true;
                        restoreDeletedActivity(activityCode);
                        notification.destroy(key);
                        setIsDeletionInProgress(false);
                        setDeletingActivity(null);
                        notification.success({
                          message: "✅ Rollback Successful",
                          description: `${removedActivity?.activityName} has been restored successfully.`,
                          placement: "topRight",
                          duration: 0.1,
                          style: {
                            borderRadius: "10px",
                            background: "#E6FFFB",
                            color: "#006D75",
                          },
                        });
                      }}
                    >
                      Undo
                    </Button>
                  </div>
                </div>
                <div className="progress-bar-item">
                  <Progress
                    percent={progress}
                    showInfo={false}
                    status="active"
                    strokeColor={{ from: "#FF4D4F", to: "#FF9C6E" }}
                    strokeWidth={6}
                    style={{ flex: 1, borderRadius: "6px", margin: 0 }}
                  />
                </div>
              </>
            ),
          });

          setTimeout(updateProgress, 100);
        };

        setTimeout(updateProgress, 100);

        return prevSelectedActivities.filter((code) => code !== activityCode);
      } else {
        return [...prevSelectedActivities, activityCode];
      }
    });
  };

  const restoreDeletedActivity = (activityCode: string) => {
    setDeletedActivities((prevDeleted: any) => {
      const restoredActivity = prevDeleted.find(
        (activity: any) => activity.code == activityCode
      );
      if (restoredActivity) {
        setSequencedModules((prevModules) =>
          prevModules.map((module) =>
            module.parentModuleCode == restoredActivity.parentModuleCode
              ? {
                ...module,
                activities: [
                  ...module.activities.slice(0, restoredActivity.index),
                  { ...restoredActivity },
                  ...module.activities.slice(restoredActivity.index),
                ],
              }
              : module
          )
        );

        return prevDeleted.filter(
          (activity: any) => activity.code !== activityCode
        );
      }

      return prevDeleted;
    });

    setSelectedActivities((prevSelected) => [...prevSelected, activityCode]);
  }

  // const handleProjectChange = (projectId: any) => {
  //   setCurrentStep(0);
  //   setSelectedProjectId(projectId);
  //   const project = allProjects.find((p) => p.id == projectId);
  //   setSelectedProject(project);
  //   if (project) {
  //     const selectedProjectLibrary = project.initialStatus.library;
  //     setLibraryName(selectedProjectLibrary);
  //     setSelectedProjectMineType(project.projectParameters.typeOfMine)
  //     handleLibraryChange((project.initialStatus.items.filter((item: any) => item.status?.toLowerCase() != "completed")));
  //   } else {
  //     setLibraryName([]);
  //   }
  // };

  const handleProjectChange = (projectId: any) => {
    setCurrentStep(0);
    setSelectedProjectId(projectId);

    const project = allProjects.find((p) => p.id == projectId);
    setSelectedProject(project);

    if (project) {
      const selectedProjectLibrary = project.initialStatus?.library || null;
      setLibraryName(selectedProjectLibrary || null);

      if (project.projectParameters) {
        setSelectedProjectMineType(project.projectParameters.typeOfMine || "");
      } else {
        setSelectedProjectMineType("");
      }

      if (selectedProjectLibrary) {
        const matchedLibrary = (libraries || []).find(
          (lib: any) => lib.name === selectedProjectLibrary
        );

        if (matchedLibrary) {
          setSelectedLibraryId(matchedLibrary.id);
          setSelectedLibrary(matchedLibrary);
        } else {
          console.log("Library not found in libraries list:", selectedProjectLibrary);
          setSelectedLibraryId(null);
          setSelectedLibrary(null);
        }
      } else {
        setSelectedLibraryId(null);
        setSelectedLibrary(null);
      }

      if (Array.isArray(project.initialStatus?.items)) {
        const filteredItems = project.initialStatus.items.filter(
          (item: any) => item.status?.toLowerCase() !== "completed"
        );
        handleLibraryChange(filteredItems);
      } else {
        handleLibraryChange([]);
      }

    } else {
      setLibraryName(null);
      setSelectedProjectMineType("");
      setSelectedLibraryId(null);
      setSelectedLibrary(null);
      handleLibraryChange([]);
    }
  };

  const handleLibraryChange = (libraryItems: any) => {
    if (libraryItems) {
      setSequencedModules(libraryItems);
      setModules(libraryItems);
      const allActivityCodes = libraryItems.flatMap((module: any) =>
        module.activities.map((activity: any) => activity.code)
      );

      setActivitiesData(libraryItems.flatMap((module: any) => module.activities));
      setSelectedActivities(allActivityCodes);

    } else {
      setSequencedModules([]);
      setModules([]);
      setActivitiesData([]);
      setSelectedActivities([]);
    }
  };

  const handleSaveProjectTimeline = async (sequencedModules: any) => {
    try {
      if (!selectedProject || !selectedProjectId) {
        throw new Error("Project or Project ID is missing.");
      }

      const currentUser = getCurrentUser();
      const currentTimestamp = new Date().toISOString();

      const createTimelineEntry = (
        timelineId: string,
        version: string,
        reviewerId: string
      ) => {
        const reviewer = userOptions.find((u:any) => u.id == reviewerId);

        return {
          timelineId,
          status: "pending",
          version,
          addedBy: currentUser.name,
          addedUserEmail: currentUser.email,
          approver: {
            id: reviewer?.id,
            Name: reviewer?.name,
          },
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
          guiId: uuidv4(),
          userGuiId: currentUser?.guiId,
          orgId: currentUser?.orgId,
        };
      };

      if (!isUpdateMode || isReplanMode) {
        const createdTimeLineId: any = await db.addProjectTimeline(sequencedModules);
        const existingTimeline = selectedProject.projectTimeline || [];

        const newVersion = `${existingTimeline.length + 1}.0`;
        localStorage.setItem("latestProjectVersion", newVersion);

        let updatedTimeline = [...existingTimeline];
        if (isReplanMode && existingTimeline.length > 0) {
          const lastIndex = existingTimeline.length - 1;
          updatedTimeline[lastIndex] = {
            ...updatedTimeline[lastIndex],
            status: "replanned",
          };
        }

        const newEntry = createTimelineEntry(createdTimeLineId, newVersion, selectedReviewerId);

        const updatedProjectWithTimeline = {
          ...selectedProject,
          projectTimeline: [
            ...updatedTimeline,
            newEntry,
          ],
          processedTimelineData: sequencedModules,
        };

        await db.updateProject(selectedProjectId, updatedProjectWithTimeline);
      } else {
        await db.updateProjectTimeline(selectedTimelineId, sequencedModules);
      }

      setTimeout(() => navigate(".", { replace: true }), 0);
      notify.success(isUpdateMode ? "Project timeline updated successfully!" : "Project timeline saved successfully!");

      localStorage.setItem("selectedProjectId", selectedProjectId);
      resetProjectState();
    } catch (error) {
      console.error("Error saving project timeline:", error);
      notify.error("Failed to save project timeline. Please try again.");
    }
  };

  const resetProjectState = () => {
    setSelectedProject(null);
    setSelectedProjectId(null);
    setIsMenualTimeline(false);
    setLibraryName(null);
    setSelectedProjectMineType("");
    defaultSetup();
  };

  const holidayColumns: any = [
    {
      title: "From Date",
      dataIndex: "from",
      key: "from",
      width: "10%",
      render: (text: any) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "To Date",
      dataIndex: "to",
      key: "to",
      align: "left",
      width: "10%",
      render: (text: any) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Holiday Name",
      dataIndex: "holiday",
      key: "holiday",
      align: "left",
      width: "25%",
    },
    {
      title: "Module Name",
      dataIndex: "module",
      key: "module",
      align: "left",
      width: "25%",
      render: (modules: any) => (
        <div>
          {Array.isArray(modules) &&
            modules.map((module: any, index: number) => (
              <div key={index}>{module}</div>
            ))}
        </div>
      ),

    },
    {
      title: "Impact",
      dataIndex: "impact",
      key: "impact",
      align: "left",
      width: "20%",
      render: (impact: any, record: any) =>
        editingKey == record.key ? (
          <div style={{
            backgroundColor: editingKey == record.key ? "#9AA6B2" : "transparent",
            padding: "5px",
            borderRadius: "4px",
          }}>
            {Object.keys(impact).map((module: any, index: any) => (
              <div key={index}>
                <Input
                  value={editedImpact[module]}
                  onChange={(e) => handleImpactChange(module, e.target.value)}
                  style={{ width: "60px", marginRight: "5px", marginBottom: "2px" }}
                />
                <span style={{ fontSize: "10px", marginLeft: "2px" }}>%</span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {Object.values(impact).map((value: any, index: any) => (
              <div key={index}>
                {value}
                <span style={{ fontSize: "10px", marginLeft: "2px" }}>%</span>
              </div>
            ))}
          </div>
        ),
    },
    {
      title: "✔",
      key: "checkbox",
      width: "5%",
      align: "center",
      render: (_: any, record: any) => (
        <Checkbox
          checked={selected[record.key]}
          onChange={() => toggleCheckbox(record.key)}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: "5%",
      render: (_: any, record: any) =>
        editingKey == record.key ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
            <Button
              type="link"
              icon={<SaveOutlined />}
              className="bg-secondary"
              onClick={() => handleSaveHoliday(record.key)}
            />
            <Button
              type="link"
              className="bg-tertiary"
              icon={<CloseOutlined />}
              onClick={handleCancel}
            />
          </div>
        ) : (
          <Button
            type="link"
            className="bg-info text-white"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.key, record.impact)}
          />
        ),
    },
  ];

  const handleSaveHoliday = async (key: any) => {
    const updatedHolidays: any = finalHolidays?.map((item) =>
      item.key == key ? { ...item, impact: { ...editedImpact } } : item
    );
    const updatedProjectWithHoliday = {
      ...selectedProject,
      holidays: updatedHolidays
    };
    await db.updateProject(selectedProjectId, updatedProjectWithHoliday);
    notify.success(isUpdateMode
      ? "Project timeline updated successfully!"
      : "Project timeline saved successfully!"
    );
    setFinalHolidays([...updatedHolidays]);
    setHolidayData([...updatedHolidays]);
    setEditingKey(null);
  };

  const handleImpactChange = (module: any, value: any) => {
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setEditedImpact((prev: any) => ({ ...prev, [module]: Number(value) }));
    }
  };

  const handleEdit = (key: any, impact: any) => {
    setEditingKey(key);
    setEditedImpact({ ...impact });
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditedImpact({});
  };

  const getColumnsForStep = (step: number) => {
    const baseColumns: any = [
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        align: "left",
        render: (_: any, record: any) => (
          <span className={record.activityStatus == "completed" ? "completed-field" : ""}>
            {record.code}
          </span>
        ),
      },
      {
        title: "Activity Name",
        dataIndex: "activityName",
        key: "activityName",
        align: "left",
        render: (text: any, record: any) => (
          <span className={record.activityStatus == "completed" ? "completed-field" : ""}>
            {text}
          </span>
        ),
      },
      {
        title: "Duration",
        dataIndex: "duration",
        key: "duration",
        align: "center",
        render: (_duration: any, record: any) => {
          const isDisabled = record.activityStatus == "completed" || step !== 1;

          return (
            <Input
              placeholder="Duration"
              type="text"
              value={record.duration || "0"}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                handleDurationChange(record.code, value);
              }}
              onKeyDown={(e) => {
                if (
                  !/^\d$/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight"
                ) {
                  e.preventDefault();
                }
              }}
              disabled={isDisabled}
            />
          );
        }

      },
    ];

    if (step == 1 && (isUpdateMode || isReplanMode)) {
      baseColumns.push(
        {
          title: "Status",
          dataIndex: "activityStatus",
          key: "activityStatus",
          render: (text: string) => {
            const status = text?.toLowerCase();

            let color = "";
            let label = "";

            switch (status) {
              case "completed":
                color = "green";
                label = "COMPLETED";
                break;
              case "inprogress":
                color = "#faad14";
                label = "IN PROGRESS";
                break;
              case "yettostart":
                color = "#8c8c8c";
                label = "YET TO START";
                break;
              default:
                color = "#000000";
                label = status?.toUpperCase() || "";
            }

            return (
              <span style={{ fontWeight: 'bold', color }}>
                {label}
              </span>
            );
          },
        });
    }

    if (step == 1) {
      baseColumns.push(
        {
          key: "finalize",
          align: "right",
          className: step == 1 ? "active-column" : "",
          onCell: () => ({ className: step == 1 ? "first-column-red" : "" }),
          render: (_: any, record: any) => (
            <div style={{ marginRight: '20px' }}>
              <Checkbox
                checked={selectedActivities.includes(record.code)}
                onChange={(e) => handleActivitySelection(record.code, e.target.checked)}
                disabled={
                  isDeletionInProgress &&
                  deletingActivity !== record.code ||
                  record.activityStatus == "completed" || record.activityStatus == "inProgress"
                }
              />
            </div>
          ),
        });
    }

    if (step >= 2) {
      baseColumns.push({
        key: "prerequisite",
        className: step == 2 ? "active-column" : "",
        render: (_: any, record: any) => {
          const isDisabled = step !== 2 || record.activityStatus == "completed";
          const selectClass = step == 2 && !isDisabled ? "highlighted-select" : "";

          return (
            <div className={selectClass}>
              <Select
                showSearch
                placeholder="Select Prerequisite"
                value={record.prerequisite == "-" ? undefined : record.prerequisite}
                onChange={(value) => {
                  setSequencedModules((prevModules: any) =>
                    prevModules.map((module: any) => ({
                      ...module,
                      activities: module.activities.map((activity: any) =>
                        activity.code == record.code
                          ? { ...activity, prerequisite: value }
                          : activity
                      ),
                    }))
                  );
                }}
                disabled={isDisabled}
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                options={[
                  { value: "", label: "-" },
                  ...sequencedModules.flatMap((module) =>
                    module.activities
                      .filter((activity) => activity.activityStatus !== "completed")
                      .map((activity) => ({
                        value: activity.code,
                        label: activity.code,
                      }))
                  ),
                ]}
                style={{ width: "95%" }}
                allowClear
              />
            </div>
          );
        },
      });
    }

    if (step >= 3) {
      baseColumns.push({
        key: "slack",
        className: step == 3 ? "active-column" : "",
        render: (_: any, record: any) => {
          const isDisabled = step !== 3 || record.activityStatus == "completed";
          const inputClass = step == 3 && !isDisabled ? "highlighted-input" : "";

          return (
            <div className={inputClass}>
              <Input
                placeholder="Slack"
                type="text"
                value={record.slack || "0"}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  handleSlackChange(record.code, value);
                }}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight"
                  ) {
                    e.preventDefault();
                  }
                }}
                style={{ width: "95%" }}
                disabled={isDisabled}
              />
            </div>
          );
        },
      });
    }

    if (step >= 4) {
      baseColumns.push({
        key: "start",
        className: step == 4 ? "active-column" : "",
        render: (_: any, record: any) => {
          const isDisabled =
            step !== 4 || record.activityStatus == "completed" || record.prerequisite !== "";
          const datePickerClass = step == 4 && !isDisabled ? "highlighted-datepicker" : "";

          return (
            <div className={datePickerClass}>
              <DatePicker
                placeholder="Start Date"
                value={
                  record.start ? dayjs(record.start) : null
                }
                onChange={(date) => handleStartDateChange(record.code, date)}
                disabled={isDisabled}
                style={{ width: "95%" }}
                format="DD-MM-YYYY"
              />
            </div>
          );
        },
      });
    }
    const hasStatus = sequencedModules.some((mod: any) =>
      mod.activities?.some((act: any) => !!act.activityStatus)
    );
    const hasActualStart = sequencedModules.some((mod: any) =>
      mod.activities?.some((act: any) => !!act.actualStart)
    );
    const hasActualFinish = sequencedModules.some((mod: any) =>
      mod.activities?.some((act: any) => !!act.actualFinish)
    );

    if (hasStatus && step != 1) {
      baseColumns.push({
        title: "Status",
        dataIndex: "activityStatus",
        key: "activityStatus",
        align: 'center',
        render: (_: any, record: any) => (
          <Select
            value={record.activityStatus?.toLowerCase() || ""}
            disabled
            style={{ fontWeight: "bold", width: 160 }}
            options={[
              { value: "completed", label: "COMPLETED" },
              { value: "inprogress", label: "IN PROGRESS" },
              { value: "yettostart", label: "YET TO START" },
            ]}
          />
        ),
      });
    }

    if (hasActualStart && step != 1) {
      baseColumns.push({
        title: "Actual Start",
        dataIndex: "actualStart",
        key: "actualStart",
        render: (_: any, record: any) => (
          <Input
            placeholder="Actual Start"
            value={record.actualStart || ""}
            disabled
            style={{ fontWeight: "bold" }}
          />
        ),
      });
    }

    if (hasActualFinish && step != 1) {
      baseColumns.push({
        title: "Actual Finish",
        dataIndex: "actualFinish",
        key: "actualFinish",
        render: (_: any, record: any) => (
          <Input
            placeholder="Actual Finish"
            value={record.actualFinish || ""}
            disabled
            style={{ fontWeight: "bold" }}
          />
        ),
      });
    }

    return baseColumns;
  };

  const getOuterTableColumns = (step: number): Column[] => {
    let columns: Column[] = [
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        render: (_: any, record: any) => record.parentModuleCode || record.code,
      },
      {
        title: "Key Activity",
        dataIndex: "moduleName",
        key: "moduleName",
      },
      {
        title: "Duration",
        dataIndex: "duration",
        key: "duration",
        align: "center",
        render: (duration: any) => (duration ? duration : ""),
      },
    ];

    if (step == 1 && (isUpdateMode || isReplanMode)) {
      columns.push({
        title: "Status",
        dataIndex: "activityStatus",
        key: "activityStatus",
        align: "center",
        render: (text: any) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
      },);
    }

    if (step >= 2) {
      columns.push({
        title: "Prerequisite",
        dataIndex: "prerequisite",
        key: "prerequisite",
        align: "center",
        render: (prerequisite: any) => (prerequisite?.code ? prerequisite.code : ""),
      });
    }

    if (step >= 3) {
      columns.push({
        title: "Slack",
        dataIndex: "slack",
        key: "slack",
      });
    }

    if (step >= 4) {
      columns.push({
        title: "Start Date",
        dataIndex: "startDate",
        key: "startDate",
      });
    }

    const hasStatus = sequencedModules.some((mod: any) =>
      mod.activities?.some((act: any) => !!act.activityStatus)
    );
    const hasActualStart = sequencedModules.some((mod: any) =>
      mod.activities?.some((act: any) => !!act.actualStart)
    );
    const hasActualFinish = sequencedModules.some((mod: any) =>
      mod.activities?.some((act: any) => !!act.actualFinish)
    );

    if (hasStatus && step != 1) {
      columns.push({
        title: "Status",
        dataIndex: "status",
        key: "status",
      });
    }

    if (hasActualStart && step != 1) {
      columns.push({
        title: "Actual Start",
        dataIndex: "actualStart",
        key: "actualStart",
      });
    }

    if (hasActualFinish && step != 1) {
      columns.push({
        title: "Actual Finish",
        dataIndex: "actualFinish",
        key: "actualFinish",
      });
    }

    if (step == 1) {
      columns.push({
        title: (
          <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "20px" }}>
            <span>Actions</span>
          </div>
        ),
        dataIndex: "actions",
        key: "actions",
        align: "center",
        render: (_text: any, record: any) => (
          <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <Button
              type="primary"
              danger
              onClick={() => handleModuleSelection(record.parentModuleCode, false)}
              icon={<DeleteOutlined />}
              size="small"
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
              }}
              disabled={
                isDeletionInProgress ||
                record.activities.some((activity: any) =>
                  ["completed", "inProgress"].includes(activity.activityStatus)
                )
              }
            >
              Delete
            </Button>
          </div>
        ),
      });
    }

    return columns;
  };

  const handleExistingProjectChange = async (projectId: any) => {
    setSelectedExistingProjectId(projectId);
    const storedAllProjects = (await db.getProjects())
      .filter((p: any) => p.orgId == currentUser.orgId);
    const selectedExProject = storedAllProjects.find((p: any) => p.id == selectedExistingProjectId);
    setSelectedExistigProject(selectedExProject);
  };

  const handleLinkProjectTimeline = async () => {
    try {
      const storedAllProjects = (await db.getProjects())
        .filter((p: any) => p.orgId == currentUser.orgId);
      const selectedExProject = storedAllProjects.find((p: any) => p.id == selectedExistingProjectId);

      if (!selectedExistingProjectId) return;

      if (selectedExProject?.initialStatus.library == selectedProject.initialStatus.library &&
        selectedExProject?.projectParameters.typeOfMine == selectedProject.projectParameters.typeOfMine) {
        const updatedProjectWithTimeline = { ...selectedProject, projectTimeline: [] };
        if (selectedExProject.projectTimeline && selectedExProject.projectTimeline.length > 0) {
          updatedProjectWithTimeline.projectTimeline = selectedExProject.projectTimeline.map((module: any) => ({
            ...module,
            activities: module.activities.map((activity: any) => ({
              ...activity,
              start: "",
              end: "",
            })),
          }));
        }
        await db.updateProject(selectedProject.id, updatedProjectWithTimeline);
        await db.addProjectTimeline(updatedProjectWithTimeline.projectTimeline);
        localStorage.setItem('selectedProjectId', selectedProject.id);

        setTimeout(() => notify.success("Project timeline linked successfully!"), 0);
        navigate("/create/project-timeline");
      } else {
        setTimeout(() => notify.error("Selected project and existing project do not match library and mine type!"), 0);
      }
    } catch (error: any) {
      setTimeout(() => notify.warning(error.message || "An error occurred"), 0);
    }
  };

  const handleCancelUpdateProjectTimeline = () => {
    setIsCancelEditModalVisiblVisible(false)
    setIsUpdateMode(false);
    setSelectedProject(null);
    setSelectedProjectMineType("");
    setLibraryName("");
    setSelectedProjectId(null);
    setIsMenualTimeline(false);
    defaultSetup();
    setTimeout(() => navigate(".", { replace: true }), 0);
  };

  const isNextStepAllowed = () => {
    if (currentStep == 4) {
      return sequencedModules.every((module: any) =>
        module.activities.every((activity: any) => {
          if (!activity.prerequisite) {
            return Boolean(activity.start);
          }
          return true;
        })
      );
    }
    return true;
  };

  const handleModuleSelection = (moduleCode: any, isChecked: any) => {
    setSequencedModules((prevModules) => {
      if (!isChecked) {
        const index = prevModules.findIndex(
          (module) => module.parentModuleCode == moduleCode
        );

        if (index == -1) return prevModules;

        const removedModule = prevModules[index];
        setDeletedModules((prevDeleted: any) => [
          ...prevDeleted,
          { ...removedModule, originalIndex: index },
        ]);

        setIsDeletionInProgress(true);

        const key = `delete-${moduleCode}`;
        let progress = 100;
        let isUndoClicked = false;

        const updateProgress = () => {
          if (isUndoClicked) {
            setIsDeletionInProgress(false);
            return;
          }
          progress -= 2;
          if (progress <= 0) {
            notification.destroy(key);
            setIsDeletionInProgress(false);
            return;
          }

          notification.open({
            key,
            message: null,
            duration: 0,
            closeIcon: null,
            style: {
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.15)",
              background: "#FFF8F0",
              width: "100%",
              display: "flex",
              alignItems: "center",
            },
            btn: (
              <>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: " 0px 8px 0 4px", fontSize: "13px", color: "#444", fontWeight: "500", width: "200px" }}>
                    {removedModule.moduleName} has been deleted.
                  </p>

                  <div>
                    <Button
                      type="primary"
                      size="small"
                      style={{
                        background: "#258790",
                        border: "none",
                        fontWeight: "bold",
                        color: "#fff",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        minWidth: "60px",
                      }}
                      onClick={() => {
                        isUndoClicked = true;
                        restoreDeletedModule(moduleCode);
                        notification.destroy(key);
                        setIsDeletionInProgress(false);
                        notification.success({
                          message: "✅ Roleback Successful",
                          description: `${removedModule.moduleName} has been restored successfully.`,
                          placement: "topRight",
                          duration: 0.1,
                          style: { borderRadius: "10px", background: "#E6FFFB", color: "#006D75" },
                        });
                      }}
                    >
                      Undo
                    </Button>
                  </div>
                </div>
                <div className="progress-bar-item">
                  <Progress
                    percent={progress}
                    showInfo={false}
                    status="active"
                    strokeColor={{ from: "#FF4D4F", to: "#FF9C6E" }}
                    strokeWidth={6}
                    style={{ flex: 1, borderRadius: "6px", margin: 0 }}
                  />
                </div>
              </>
            ),
          });

          setTimeout(updateProgress, 100);
        };

        setTimeout(updateProgress, 100);

        return prevModules.filter((module) => module.parentModuleCode !== moduleCode);
      }
      return prevModules;
    });
  };

  const restoreDeletedModule = (moduleCode: string) => {
    setDeletedModules((prevDeleted: any) => {
      const restoredModuleIndex = prevDeleted.findIndex(
        (module: any) => module.parentModuleCode == moduleCode
      );

      if (restoredModuleIndex == -1) return prevDeleted;

      const restoredModule = prevDeleted[restoredModuleIndex];
      const { originalIndex } = restoredModule;

      setSequencedModules((prevModules) => {
        const newModules = [...prevModules];
        newModules.splice(originalIndex, 0, restoredModule);
        return newModules;
      });

      return prevDeleted.filter((module: any) => module.parentModuleCode !== moduleCode);
    });
  };

  const handleModalChange = (field: string, value: any) => {
    const updatedHoliday = { ...newHoliday, [field]: value };

    if (field == "module") {
      let selectedModules = value;
      const impact: Record<string, string> = {};
      if (selectedModules.includes("all")) {
        impact["all"] = "100";
      } else if (selectedModules.length > 0) {
        selectedModules.forEach((module: any) => {
          impact[module] = "100";
        });
      }
      updatedHoliday.impact = impact;
    }

    setNewHoliday(updatedHoliday);
  };

  const handleModalSave = async () => {
    const { from, to, holiday, module } = newHoliday;

    if (!from || !to || !holiday.trim() || module.length == 0) {
      notify.error("Please fill all required fields before saving.");
      return;
    }

    try {
      const holidayEntry = {
        ...newHoliday,
        id: Date.now().toString(),
      };

      await db.addHolidays(holidayEntry);
      setRows((prev: any) => [...prev, { ...holidayEntry, editing: false }]);
      setAddHolidayModalVisible(false);
      setNewHoliday({ from: null, to: null, holiday: "", module: [], impact: {} });
      fetchHolidays();
      notify.success("Holiday added successfully");
    } catch (err) {
      notify.error("Failed to save holiday. Try again.");
    }
  };

  const handleModalImpactChange = (module: string, value: string) => {
    const updatedImpact = { ...newHoliday.impact, [module]: value };
    setNewHoliday({ ...newHoliday, impact: updatedImpact });
  };

  const fetchAllLibrary = async (user: any) => {
    try {
      const libs = await db.getAllLibraries();
      setAllLibraries(libs.filter((lib: any) => lib.orgId == user.orgId));
      defaultSetup(libs);
    } catch (err) {
      console.error("Error fetching libraries:", err);
      setAllLibraries([]);
    }
  };

  const handleGroupLibChange = async (libraryId: any) => {
    try {
      setSelectedLibraryId(libraryId);

      const foundLibrary = libraries.find((lib: any) => lib.id == libraryId) || null;
      setSelectedLibrary(foundLibrary);

      console.log("Selected Library Object:", foundLibrary);

      if (foundLibrary && selectedProjectId) {
        const selectedProject = allProjects.find(
          (proj) => proj.id == selectedProjectId
        );

        if (!selectedProject) {
          notify.error("Selected project not found.");
          return;
        }

        const existingLibrary = selectedProject.initialStatus?.library;
        let confirmMessage = "";
        if (existingLibrary) {
          confirmMessage = `A group (${existingLibrary}) is already linked to this project. Do you want to replace it?`;
        } else {
          confirmMessage = "Do you want to link this group to your project?";
        }
        Modal.confirm({
          title: "Confirm Group Linking",
          content: confirmMessage,
          okText: "Yes",
          cancelText: "No",
          async onOk() {
            const updatedProjects = allProjects.map((proj) => {
              if (proj.id == selectedProjectId) {
                return {
                  ...proj,
                  initialStatus: {
                    ...proj.initialStatus,
                    library: foundLibrary.name,
                    items: foundLibrary.items
                  }
                };
              }
              return proj;
            });

            setAllProjects(updatedProjects);
            const updatedProject = updatedProjects.find(
              (p) => p.id === selectedProjectId
            );
            if (updatedProject) {
              await db.updateProject(selectedProjectId, updatedProject);
              notify.success("Group linked successfully!");
            }
          },
          onCancel() {
            console.log("User cancelled linking group.");
          }
        });
      }
    } catch (error) {
      console.error(error);
      notify.error("An error occurred while linking group.");
    }
  };





  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "100%" }} className="time-builder-page">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="title-and-filter">
              <div className="heading">
                <span>Timeline Builder</span>
              </div>
              {(allProjects.length > 0 || selectedProject) && (
                <div>
                  <div className="filters">
                    <div className="form-row">
                      <label>Project</label>
                      <Select
                        placeholder="Select Project"
                        disabled={isUpdateMode}
                        value={isUpdateMode ? selectedProjectName : selectedProjectId}
                        onChange={handleProjectChange}
                        style={{ minWidth: 200 }}
                      >
                        {allProjects.map((project) => (
                          <Option key={project.id} value={project.id}>
                            {project.projectParameters.projectName}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div className="form-row">
                      <label>Mine Type</label>
                      <Input
                        value={selectedProjectMineType}
                        placeholder="Project Mine Type"
                        disabled
                        style={{ minWidth: 200 }}
                      />
                    </div>

                    <div className="form-row">
                      <label>Library</label>
                      <Select
                        placeholder="Select Library"
                        disabled={isUpdateMode || !selectedProjectId}
                        value={selectedLibraryId}
                        onChange={handleGroupLibChange}
                        style={{ minWidth: 200 }}
                      >
                        {(libraries || []).map((lib: any) => (
                          <Option key={lib.id} value={lib.id}>
                            {lib.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(isUpdateMode || isMenualTimeline) && (<>
              <div style={{ paddingRight: "5px" }}>
                <Button
                  type="primary"
                  disabled={!selectedProjectId}
                  icon={<CloseCircleOutlined />}
                  onClick={() => setIsCancelEditModalVisiblVisible(true)}
                  style={{ marginLeft: "15px", backgroundColor: "#e74c3c", borderColor: "#e74c3c" }}
                >
                  Discard
                </Button>
              </div>
            </>)}
          </div>
          <hr style={{ margin: 0 }} />
          {selectedProject != null && isMenualTimeline && (
            <div className="timeline-steps">
              <Steps current={currentStep}>
                <Step title="Sequencing" />
                <Step title="Activities & Duration" />
                <Step title="Prerequisites" />
                <Step title="Slack" />
                <Step title="Start Date" />
                <Step title="Holiday" />
                <Step title="Project Timeline" />
              </Steps>
            </div>
          )}

          {selectedProject != null && isMenualTimeline ? (
            <div className="main-item-container">
              <div className="timeline-items">
                {currentStep == 0 ? (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="modules">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {sequencedModules.map((module, index) => (
                            <Draggable key={module.parentModuleCode} draggableId={module.parentModuleCode} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    padding: "10px",
                                    margin: "0px 0px 8px 0px",
                                    backgroundColor: "#00d8d6",
                                    borderRadius: "4px",
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <strong>{module.parentModuleCode}</strong> {module.moduleName}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : currentStep == 5 ? (
                  <div>
                    <div className="holiday-actions">
                      <div className="st-sun-field">
                        <Checkbox
                          className="saturday-sunday-checkbox"
                          checked={isSaturdayWorking}
                          onChange={(e) => setIsSaturdayWorking(e.target.checked)}
                        >
                          Saturday Working
                        </Checkbox>
                        <Checkbox
                          className="saturday-sunday-checkbox"
                          checked={isSundayWorking}
                          onChange={(e) => setIsSundayWorking(e.target.checked)}
                        >
                          Sunday Working
                        </Checkbox>
                      </div>
                      {holidayData.length > 0 && (
                        <div className="add-new-holiday">
                          <Button type="primary" className="bg-secondary" size="small" onClick={() => setAddHolidayModalVisible(true)}>
                            Add New Holiday
                          </Button>
                        </div>
                      )}
                    </div>
                    {holidayData.length > 0 ? (
                      <>
                        <Table
                          className="project-timeline-table"
                          dataSource={isUpdateMode ? finalHolidays : holidayData}
                          columns={holidayColumns}
                          pagination={false}
                          scroll={{ y: "calc(100vh - 350px)" }}
                        />
                      </>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Result
                          icon={<CalendarOutlined style={{ color: "#1890ff", fontSize: "48px" }} />}
                          title="No Holiday Records Found"
                          subTitle="You haven't added any holidays yet. Click below to add one."
                          extra={
                            <Button type="primary" className="bg-secondary" size="large" onClick={() => setAddHolidayModalVisible(true)}>
                              Add Holiday
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </div>
                ) : currentStep == 6 || currentStep == 7 ? (
                  <div style={{ overflowX: "hidden" }}>
                    <Table
                      columns={finalColumns}
                      dataSource={dataSource}
                      className="project-timeline-table"
                      pagination={false}
                      expandable={{
                        expandedRowRender: () => null,
                        rowExpandable: (record) => record.children && record.children.length > 0,
                        expandedRowKeys: expandedKeys,
                        onExpand: (expanded, record) => {
                          setExpandedKeys(
                            expanded
                              ? [...expandedKeys, record.key]
                              : expandedKeys.filter((key: any) => key !== record.key)
                          );
                        },
                      }}
                      rowClassName={(record) => (record.isModule ? "module-header" : "activity-row")}
                      bordered
                      scroll={{
                        x: "max-content",
                        y: "calc(100vh - 320px)",
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <Table
                      columns={getOuterTableColumns(currentStep)}
                      className="project-timeline-table"
                      dataSource={sequencedModules}
                      pagination={false}
                      sticky={{ offsetHeader: 0 }}
                      rowClassName={(record) => (record.activities ? "module-heading" : "")}
                      expandedRowKeys={expandedRowKeys}
                      onExpand={(expanded, record) => {
                        setExpandedRowKeys(expanded
                          ? [...expandedRowKeys, record.parentModuleCode]
                          : expandedRowKeys.filter((key) => key !== record.parentModuleCode)
                        );
                      }}
                      expandable={{
                        expandedRowRender: (module) => (
                          <Table
                            columns={getColumnsForStep(currentStep)}
                            dataSource={module.activities}
                            pagination={false}
                            showHeader={false}
                            bordered
                            sticky
                            style={{ overflowX: "hidden" }}
                          />
                        ),
                        rowExpandable: (module) => module.activities.length > 0,
                      }}
                      scroll={{ y: `${window.innerHeight - 300}px`, x: "hidden" }}
                      style={{ overflowX: "hidden" }}
                      rowKey="parentModuleCode"
                    />
                  </div>
                )}
              </div>
              <hr />
              <div className={`action-buttons ${currentStep == 0 ? "float-right" : ""}`}>
                {currentStep > 0 && (
                  <Button className="bg-tertiary" onClick={handlePrev} style={{ marginRight: 8 }} size="small">
                    Previous
                  </Button>
                )}
                <Button
                  disabled={selectedProjectId == null || !isNextStepAllowed()}
                  className="bg-secondary"
                  onClick={() => {
                    if (currentStep == 6) {
                      setIsReviewModalVisible(true);
                    } else {
                      handleNext();
                    }
                  }}
                  type="primary"
                  size="small"
                >
                  {currentStep == 7
                    ? isUpdateMode
                      ? "Update"
                      : "Save"
                    : currentStep == 6
                      ? "Send For Review"
                      : "Next"}
                </Button>
              </div>
            </div>
          ) : <div className="container">
            <div className="no-project-message">

              {allProjects.length == 0 ? (
                <>
                  <h3>No Projects Available</h3>
                  <p>Start by creating a new project to define a timeline.</p>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate("/create/register-new-project")}
                    className="bg-secondary"
                  >
                    Create Project
                  </Button>
                </>
              ) : !selectedProject ? (
                <>
                  <ExclamationCircleOutlined style={{ fontSize: "50px", color: "#258790" }} />
                  <h3>No Project Selected</h3>
                  <p>Please select a project to continue.</p>
                </>
              ) : (
                <>
                  <ClockCircleOutlined style={{ fontSize: "50px", color: "#258790" }} />
                  <h3>Manage Your Timeline</h3>
                  <p>Choose an option below to proceed !</p>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button
                      type="primary"
                      disabled={!selectedProjectId || !selectedLibrary}
                      icon={<LinkOutlined />}
                      onClick={() => setOpenExistingTimelineModal(true)}
                      style={{ marginLeft: "15px", backgroundColor: "grey", borderColor: "#4CAF50" }}
                    >
                      Link Existing Timeline
                    </Button>
                    <Button
                      type="primary"
                      disabled={!selectedProjectId || !selectedLibrary}
                      icon={<FolderOpenOutlined />}
                      onClick={() => setIsMenualTimeline(true)}
                      style={{ marginLeft: "15px", backgroundColor: "#D35400", borderColor: "#FF9800" }}
                    >
                      Create Timeline Manually
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>}
        </div>
      </div>

      <Modal
        title="Confirm Discard Changes"
        visible={isCancelEditModalVisible}
        onOk={handleCancelUpdateProjectTimeline}
        onCancel={() => setIsCancelEditModalVisiblVisible(false)}
        okText="Yes, Discard"
        cancelText="Cancel"
        className="modal-container"
        okButtonProps={{ className: "bg-secondary" }}
      >
        <p style={{ padding: "10px" }}>
          Are you sure you want to exit? Any unsaved changes will be lost.
        </p>
      </Modal>

      <Modal
        title="Link Existing Project Timeline"
        visible={openExistingTimelineModal}
        onCancel={() => setOpenExistingTimelineModal(false)}
        className="modal-container"
        footer={
          allProjectsTimelines.length > 0 ? (
            <Button
              key="save"
              onClick={handleLinkProjectTimeline}
              className="bg-secondary"
            >
              Save
            </Button>
          ) : (
            <Button
              key="create"
              onClick={() => { setIsMenualTimeline(true); setOpenExistingTimelineModal(false) }}
              type="primary"
              className="bg-secondary"
            >
              Create Manually
            </Button>
          )
        }
      >
        <div style={{ padding: "0px 10px 10px 5px" }}>
          <div className="filters" style={{ marginTop: "8px" }}>
            {allProjectsTimelines.length > 0 ? (
              <>
                <span style={{ marginLeft: "10px", fontSize: "16px", fontWeight: "400" }}>Select Project</span>
                <Select
                  placeholder="Select Project"
                  disabled={isUpdateMode}
                  value={selectedExistingProjectId}
                  onChange={handleExistingProjectChange}
                  style={{ width: "100%" }}
                  allowClear={true}
                >
                  {allProjectsTimelines.map((project) => (
                    <Option key={project.id} value={project.id}>
                      {project.projectParameters.projectName}
                    </Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  disabled={!selectedExistingProjectId}
                  icon={<ToolOutlined />}
                  onClick={() => navigate("/create/project-timeline", { state: { selectedExistingProject } })}
                  style={{ marginLeft: "15px", backgroundColor: "#d35400" }}
                >
                  View Timeline
                </Button>
              </>
            ) : (
              <p style={{ marginLeft: "10px", marginTop: "10px" }}>No existing project timelines found.</p>
            )}
          </div>
        </div>
        <hr />
      </Modal>

      <Modal
        title="Add New Holiday"
        visible={isAddHolidayModalVisible}
        onCancel={() => setAddHolidayModalVisible(false)}
        onOk={handleModalSave}
        okText="Save"
        cancelText="Cancel"
        className="modal-container"
        maskClosable={false}
        keyboard={false}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }}>
          <DatePicker
            value={newHoliday.from}
            onChange={(date) => handleModalChange("from", date)}
            placeholder="From Date"
            style={{ width: "100%" }}
          />
          <DatePicker
            value={newHoliday.to}
            onChange={(date) => handleModalChange("to", date)}
            placeholder="To Date"
            style={{ width: "100%" }}
          />
          <Input
            value={newHoliday.holiday}
            onChange={(e) => handleModalChange("holiday", e.target.value)}
            placeholder="Holiday Name"
          />
          <Select
            mode="multiple"
            value={newHoliday.module}
            onChange={(value) => handleModalChange("module", value)}
            placeholder="Select Modules"
            style={{ width: "100%" }}
          >
            <Select.Option key="all" value="all">
              Select All
            </Select.Option>
            {moduleOptions.map((module) => (
              <Select.Option key={module} value={module}>
                {module}
              </Select.Option>
            ))}
          </Select>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {Object.entries(newHoliday.impact).map(([module, impact]) => (
              <Box key={module} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>{module}</Typography>
                <Input
                  value={impact as any}
                  onChange={(e) => handleModalImpactChange(module, e.target.value)}
                  style={{ width: "60px" }}
                />
              </Box>
            ))}
          </Box>
        </div>
      </Modal>

      <Modal
        title="Select Reviewer"
        visible={isReviewModalVisible}
        onOk={() => {
          if (selectedReviewerId) {
            setIsReviewModalVisible(false);
            handleNext();
          } else {
            notify.warning("Please select a reviewer.");
          }
        }}
        onCancel={() => setIsReviewModalVisible(false)}
        okText="Send"
        cancelText="Cancel"
      >
        <Select
          showSearch
          placeholder="Select a reviewer"
          value={selectedReviewerId}
          onChange={(value) => setSelectedReviewerId(value)}
          style={{ width: "100%" }}
          optionFilterProp="children"
          filterOption={(input: any, option: any) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {userOptions.map((user:any) => (
            <Option key={user.id} value={user.id}>
              {user.name}
            </Option>
          ))}
        </Select>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default TimeBuilder;