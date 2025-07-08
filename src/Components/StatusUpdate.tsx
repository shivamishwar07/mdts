import { useEffect, useMemo, useState } from "react";
import "../styles/status-update.css";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { FolderOpenOutlined, SaveOutlined } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Select, Modal, Input, Table, DatePicker, List, Typography, Form, Row, Col } from "antd";
import { ClockCircleOutlined, CloseCircleOutlined, DollarOutlined, DownloadOutlined, EditOutlined, FileTextOutlined, FormOutlined, LikeOutlined, ReloadOutlined, ShareAltOutlined, SyncOutlined } from "@ant-design/icons";
import eventBus from "../Utils/EventEmitter";
import { db } from "../Utils/dataStorege.ts";
import { getCurrentUser } from '../Utils/moduleStorage';
import TextArea from "antd/es/input/TextArea";
import { ToastContainer } from 'react-toastify';
import { notify } from "../Utils/ToastNotify.tsx";
import { UserOutlined } from '@ant-design/icons';
interface Activity {
  code: string;
  activityName: string;
  prerequisite: string;
  slack: string;
  level: string;
  duration: number;
  start: string | null;
  end: string | null
  activityStatus: string | null;
  actualStart?: string | null;
  actualFinish?: string | null;
  actualDuration?: number;
}

interface Module {
  parentModuleCode: string;
  moduleName: string;
  activities: Activity[];
}

const { Option } = Select;

export const StatusUpdate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [sequencedModules, setSequencedModules] = useState<Module[]>([]);
  const [dataSource, setDataSource] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProjectTimeline, setSelectedProjectTimeline] = useState<any>([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [allVersions, setAllVersions] = useState<any>();
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [reviseRemarks, setReviseRemarks] = useState("");
  const [selectedActivityKey, setSelectedActivityKey] = useState<string | null>(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [openCostCalcModal, setOpenCostCalcModal] = useState(false);
  const [form] = Form.useForm();
  const [_formValid, setFormValid] = useState(false);
  const [replaneMode, setIsReplanMode] = useState(false);
  const [discardReplaneMode, setIsDiscardReplanMode] = useState(false);
  const [confirmReplan, setConfirmReplan] = useState(false);
  const [userOptions, setUserOptions] = useState<any>([]);
  const [openResponsibilityModal, setOpenResponsibilityModal] = useState(false);
  const [raciForm] = Form.useForm();

  useEffect(() => {
    defaultSetup();
  }, []);

  useEffect(() => {
    if (location.state && location.state.currentProject) {
      const selectedActiveProject = location.state.currentProject;
      if (selectedActiveProject?.id) {
        setSelectedProjectId(selectedActiveProject.id);
        setSelectedProject(selectedActiveProject);
        if (selectedActiveProject?.projectTimeline && Array.isArray(selectedActiveProject.projectTimeline)) {
          handleLibraryChange(selectedActiveProject.projectTimeline);
        } else if (selectedActiveProject?.initialStatus?.items && Array.isArray(selectedActiveProject.initialStatus.items)) {
          handleLibraryChange(selectedActiveProject.initialStatus.items.filter(
            (item: any) => item?.status?.toLowerCase() !== "completed"
          ));
        }
      }
      setTimeout(() => navigate(".", { replace: true }), 0);
    }
  }, [location.state]);

  useEffect(() => {
    if (openCostCalcModal && selectedActivityKey) {
      const activity = findActivityByKey(dataSource, selectedActivityKey);
      if (activity?.cost) {
        form.setFieldsValue({
          projectCost: activity.cost.projectCost,
          opCost: activity.cost.opCost
        });
      }
    }
  }, [openCostCalcModal, selectedActivityKey]);

  useEffect(() => {
    if (openResponsibilityModal && selectedActivityKey) {
      const activity = findActivityByKey(dataSource, selectedActivityKey);
      if (activity?.raci) {
        raciForm.setFieldsValue({
          responsible: activity.raci.responsible,
          accountable: activity.raci.accountable,
          consulted: activity.raci.consulted || [],
          informed: activity.raci.informed || []
        });
      }
    }
  }, [openResponsibilityModal, selectedActivityKey]);

  useEffect(() => {
    if (replaneMode) {
      const updated = dataSource.map((item: any) => {
        const recursiveUpdate = (activity: any): any => {
          if (activity.fin_status === 'yetToStart') {
            if (activity.actualStart) {
              activity.plannedStart = activity.actualStart;
            }
            if (activity.actualFinish) {
              activity.plannedFinish = activity.actualFinish;
            }
            if (activity.expectedDuration) {
              activity.duration = activity.expectedDuration;
            }
          }

          if (activity.children) {
            activity.children = activity.children.map((child: any) =>
              recursiveUpdate(child)
            );
          }

          return activity;
        };

        return recursiveUpdate(item);
      });

      setDataSource(updated);
    }

  }, [replaneMode]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenCostCalcModal = () => setOpenCostCalcModal(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    setEmail("");
  };

  const getProjectTimeline = async (project: any) => {
    if (Array.isArray(project?.projectTimeline)) {
      try {
        const latestVersionId = localStorage.getItem("latestProjectVersion");

        const foundTimeline = project.projectTimeline.filter(
          (item: any) => item.version == latestVersionId
        );

        const timelineId =
          !latestVersionId || foundTimeline.length === 0
            ? project.projectTimeline[0].timelineId
            : foundTimeline[0].timelineId;

        const timeline = await db.getProjectTimelineById(timelineId);
        if (!Array.isArray(timeline)) {
          console.warn("Timeline is not an array or is undefined", timeline);
          return [];
        }

        const finTimeline = timeline.map(({ id, ...rest }: any) => rest);
        return finTimeline;
      } catch (err) {
        console.error("Error fetching timeline:", err);
        return [];
      }
    }

    if (Array.isArray(project?.initialStatus?.items)) {
      return project.initialStatus.items.filter(
        (item: any) => item?.status?.toLowerCase() !== "completed"
      );
    }

    return [];
  };

  const defaultSetup = async () => {
    try {
      const storedData = (await db.getProjects()).filter((p) => p.projectTimeline);
      setAllProjects(storedData);

      const allUsers = await db.getUsers();
      setUserOptions(allUsers);
      
      let selectedProject = null;
      const lastVisitedProjectId = localStorage.getItem("selectedProjectId");

      if (storedData.length === 1) {
        selectedProject = storedData[0];
      } else if (lastVisitedProjectId) {
        selectedProject = storedData.find((p) => p.id == lastVisitedProjectId) || null;
      }

      if (selectedProject) {
        setSelectedProjectId(selectedProject.id);
        setSelectedProject(selectedProject);

        const timelineData = await getProjectTimeline(selectedProject);
        handleLibraryChange(timelineData);
      } else {
        handleLibraryChange([]);
      }

      const projectTimeline = selectedProject?.projectTimeline || [];

      const latestVersionId = localStorage.getItem("latestProjectVersion");

      const extractedTimelines = projectTimeline.map((version: any) => ({
        versionId: version.timelineId,
        version: version.version,
        status: version.status,
        addedBy: version.addedBy,
        addedUserEmail: version.addedUserEmail,
        currentStatus: version.currentStatus ? version.currentStatus : '',
        createdAt: version.createdAt || new Date().toISOString(),
        updatedAt: version.updatedAt || new Date().toISOString(),
      }));

      setAllVersions(extractedTimelines);
      if (extractedTimelines.length > 0) {
        const selectedTimeline = latestVersionId
          ? extractedTimelines.find((timeline: any) => timeline.version == latestVersionId) || extractedTimelines[0]
          : extractedTimelines[0];

        setSelectedVersionId(latestVersionId ?? extractedTimelines[0].versionId);
        setSelectedProjectTimeline(selectedTimeline);
      } else {
        console.warn("No project timeline data available.");
      }
    } catch (error) {
      console.error("An unexpected error occurred while fetching projects:", error);
    }
  };

  const handleProjectChange = async (projectId: any) => {
    setSelectedActivityKey(null);
    setSelectedProjectId(projectId);
    const project = allProjects.find((p) => p.id === projectId);
    localStorage.setItem('selectedProjectId', projectId);
    setSelectedProjectTimeline(project.projectTimeline[0]);
    defaultSetup();
    const timelineId = project.projectTimeline[0].timelineId;
    const timeline = await db.getProjectTimelineById(timelineId);
    const finTimeline = timeline.map(({ id, ...rest }: any) => rest);
    setSelectedProject(project);
    if (project?.projectTimeline) {
      handleLibraryChange(finTimeline);
    } else {
      handleLibraryChange([]);
    }
  };

  const handleDownload = async () => {
    const workbook: any = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Project Report");
    const currentUser = getCurrentUser();
    const titleStyle = {
      font: { bold: true, size: 16, color: { argb: "004d99" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    const subtitleStyle = {
      font: { bold: true, size: 12, color: { argb: "333333" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    const tableHeaderStyle = {
      font: { bold: true, size: 12, color: { argb: "FFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "258790" } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const moduleHeaderStyle = {
      font: { bold: true, size: 12, color: { argb: "000000" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "DDDDDD" } },
      alignment: { horizontal: "left", vertical: "middle" },
    };

    const dataRowStyle = {
      font: { size: 11 },
      alignment: { horizontal: "left", vertical: "middle" },
      border: { top: { style: "thin" }, bottom: { style: "thin" } },
    };

    worksheet.mergeCells("B1:G1");
    const projectTitle = worksheet.getCell("B1");
    projectTitle.value = `Project Report: ${selectedProject?.projectParameters.projectName}`;
    projectTitle.font = titleStyle.font;
    projectTitle.alignment = titleStyle.alignment;

    worksheet.mergeCells("B2:G2");
    const companyTitle = worksheet.getCell("B2");
    companyTitle.value = `Company: ${currentUser.company}`;
    companyTitle.font = subtitleStyle.font;
    companyTitle.alignment = subtitleStyle.alignment;

    worksheet.mergeCells("B3:G3");
    const timestamp = worksheet.getCell("B3");
    timestamp.value = `Generated On: ${dayjs().format("DD-MM-YYYY HH:mm:ss")}`;
    timestamp.font = { italic: true, size: 12, color: { argb: "555555" } };
    timestamp.alignment = subtitleStyle.alignment;

    worksheet.addRow([]);

    const globalHeader = [
      "Sr No.",
      "Key Activity",
      "Expected Duration (Days)",
      "Actual Duration (Days)",
      "Pre-Requisite",
      "Slack",
      "Planned Start",
      "Planned Finish",
      "Actual Start",
      "Actual Finish",
      "Status",
    ];

    const headerRow = worksheet.addRow(globalHeader);

    headerRow.eachCell((cell: any) => {
      Object.assign(cell, tableHeaderStyle);
    });

    worksheet.getRow(5).height = 25;
    let rowIndex = 6;
    sequencedModules.forEach((module, moduleIndex) => {
      const moduleHeaderRow = worksheet.addRow([
        `Module: ${module.parentModuleCode}`,
        module.moduleName,
        "",
        "",
        "",
        "",
        "",
      ]);

      moduleHeaderRow.eachCell((cell: any) => {
        Object.assign(cell, moduleHeaderStyle);
      });

      rowIndex++;
      module.activities.forEach((activity, activityIndex) => {
        const row = worksheet.addRow([
          `${moduleIndex + 1}.${activityIndex + 1}`,
          activity.activityName,
          activity.duration || 0,
          activity.actualDuration || 0,
          activity.prerequisite || "-",
          activity.slack || 0,
          activity.start ? dayjs(activity.start).format("DD-MM-YYYY") : "-",
          activity.end ? dayjs(activity.end).format("DD-MM-YYYY") : "-",
          activity.actualStart ? dayjs(activity.actualStart).format("DD-MM-YYYY") : "-",
          activity.actualFinish ? dayjs(activity.actualFinish).format("DD-MM-YYYY") : "-",
          activity.activityStatus || "-",
        ]);

        row.eachCell((cell: any) => {
          Object.assign(cell, dataRowStyle);
        });
        if (activityIndex % 2 === 0) {
          row.eachCell((cell: any) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F7F7F7" },
            };
          });
        }
        rowIndex++;
      });

      worksheet.addRow([]);
      rowIndex++;
    });

    worksheet.columns = [
      { width: 20 },
      { width: 45 },
      { width: 20 },
      { width: 20 },
      { width: 30 },
      { width: 15 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];

    worksheet.mergeCells(`B${rowIndex + 2}:G${rowIndex + 2}`);
    const createdByRow = worksheet.getCell(`B${rowIndex + 2}`);
    createdByRow.value = `Created by: ${currentUser.name || ""}`;
    createdByRow.font = { italic: true, size: 12, color: { argb: "777777" } };
    createdByRow.alignment = { horizontal: "right", vertical: "middle" };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${selectedProject?.projectParameters.projectName}.xlsx`);
    notify.success("Download started!");
  };

  const handleShare = () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      notify.error("Please enter a valid email address.");
      return;
    }
    notify.success(`Shared to ${email}`);
    setIsModalOpen(false);
    setEmail("");
  };

  const handleApproveTimeline = async () => {
    const updatedProjectTimeline = selectedProject.projectTimeline.map((timeline: any) => {
      if (timeline.timelineId === selectedProjectTimeline.versionId || selectedProjectTimeline.timelineId) {
        return { ...timeline, status: "Approved" };
      }
      return timeline;
    });

    const updatedSelectedProject = {
      ...selectedProject,
      projectTimeline: updatedProjectTimeline,
    };
    await db.updateProject(selectedProjectId, updatedSelectedProject);
    notify.success("Timeline approved successfully");
    setIsApproveModalOpen(false);
    defaultSetup();
  };

  const handleLibraryChange = (libraryItems: any) => {
    if (libraryItems) {
      setSequencedModules(libraryItems);
      let editingRequired = false;
      const finDataSource = libraryItems.map((module: any, moduleIndex: number) => {
        const children = (module.activities || []).map((activity: any, actIndex: number) => {
          if (activity.activityStatus === "completed" || activity.activityStatus === "inProgress") {
            editingRequired = true;
          }

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
            actualStart: activity.actualStart || null,
            actualFinish: activity.actualFinish || null,
            expectedStart: activity.expectedStart ? dayjs(activity.expectedStart).format("DD-MM-YYYY") : "",
            expectedFinish: activity.expectedFinish ? dayjs(activity.expectedFinish).format("DD-MM-YYYY") : "",
            actualDuration: activity.actualDuration ?? "",
            remarks: activity.remarks ?? "",
            isModule: false,
            activityStatus: activity.activityStatus || "yetToStart",
            fin_status: activity.fin_status || '',
            notes: activity.notes || [],
            raci: activity.raci || {},
            cost: activity.cost || {},

          };
        });

        return {
          key: `module-${moduleIndex}`,
          SrNo: module.parentModuleCode,
          Code: module.parentModuleCode,
          keyActivity: module.moduleName,
          isModule: true,
          children,
        };
      });
      setDataSource(finDataSource);
      setExpandedKeys(finDataSource.map((_: any, index: any) => `module-${index}`));
      if (editingRequired) {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    } else {
      setSequencedModules([]);
      setDataSource([]);
      setIsEditing(false);
    }
  };

  const editTimeBuilder = () => {
    eventBus.emit("updateTab", "/create/timeline-builder");
    navigate("/create/timeline-builder", { state: { selectedProject: selectedProject, selectedTimeline: selectedProjectTimeline } });
  };

  const rePlanTimeline = () => {
    eventBus.emit("updateTab", "/create/timeline-builder");
    setIsReplanMode(true);
  };

  const getAllActivities = (data: any[]): any[] => {
    const result: any[] = [];
    const traverse = (items: any[]) => {
      for (const item of items) {
        result.push(item);
        if (item.children) traverse(item.children);
      }
    };
    traverse(data);
    return result;
  };

  const renderStatusSelect = (
    status: string,
    record: any,
    dataSource: any[],
    replaneMode?: boolean
  ) => {

    const flatList = getAllActivities(dataSource);

    const isBlockedByPreRequisite = () => {
      if (!record.preRequisite) return false;

      const preReqCodes = record.preRequisite
        .split(',')
        .map((c: string) => c.trim().toLowerCase());

      return preReqCodes.some((code: any) => {
        const act = flatList.find((x) => (x.Code || '').toLowerCase() === code);
        return !act || (act.activityStatus || '').toLowerCase() !== 'completed';
      });
    };

    const isBlockedByChildStatus = () => {
      if (!record.children || !Array.isArray(record.children)) return false;
      return record.children.some((child: any) => {
        const st = (child.activityStatus || '').toLowerCase();
        return st === 'inprogress' || st === 'completed';
      });
    };

    const isBlockedByDependents = () => {
      const currentCode = (record.Code || '').toLowerCase();

      return flatList.some((item) => {
        const preReqs = (item.preRequisite || '')
          .split(',')
          .map((c: string) => c.trim().toLowerCase());

        return preReqs.includes(currentCode) &&
          ['inprogress', 'completed'].includes((item.activityStatus || '').toLowerCase());
      });
    };

    const disabled =
      isBlockedByPreRequisite() ||
      isBlockedByChildStatus() ||
      isBlockedByDependents() ||
      (replaneMode && ["completed", "inProgress"].includes(record.fin_status));

    return (
      <Select
        value={status}
        onChange={(value) => handleFieldChange(value, record.key, "activityStatus")}
        options={[
          { label: "Yet to Start", value: "yetToStart" },
          { label: "In Progress", value: "inProgress" },
          { label: "Completed", value: "completed" },
        ]}
        disabled={disabled}
        className={`status-select ${status}`}
        style={{ width: "100%", fontWeight: "bold" }}
        title={undefined}
      />
    );
  };

  const getWorkingDaysDiff = (start: dayjs.Dayjs, end: dayjs.Dayjs): number => {
    let count = 0;
    let current = start.clone();
    while (current.isBefore(end, 'day') || current.isSame(end, 'day')) {
      const day = current.day();
      if (day !== 0 && day !== 6) {
        count++;
      }
      current = current.add(1, 'day');
    }
    return count - 1;
  };

  function getBusinessDays(start: dayjs.Dayjs, end: dayjs.Dayjs): number {
    let count = 0;
    let current = start.clone();

    while (current.isBefore(end, 'day') || current.isSame(end, 'day')) {
      const day = current.day();
      if (day !== 0 && day !== 5) {
        count++;
      }
      current = current.add(1, 'day');
    }

    return count;
  }

  const baseColumns: ColumnsType = [
    { title: "Sr No", dataIndex: "Code", key: "Code", width: 100, align: "center" },
    {
      title: "Key Activity",
      dataIndex: "keyActivity",
      key: "keyActivity",
      width: 250,
      align: "left",
      render: (_, record) => {
        const {
          activityStatus, keyActivity, duration, actualStart, actualFinish, plannedStart, plannedFinish,
        } = record;

        const plannedStartDate = plannedStart ? dayjs(plannedStart, 'DD-MM-YYYY') : null;
        const actualStartDate = actualStart ? dayjs(actualStart, 'DD-MM-YYYY') : null;
        const plannedFinishDate = plannedFinish ? dayjs(plannedFinish, 'DD-MM-YYYY') : null;
        const actualFinishDate = actualFinish ? dayjs(actualFinish, 'DD-MM-YYYY') : null;

        let iconSrc = '';
        const isStartSame = plannedStartDate && actualStartDate && plannedStartDate.isSame(actualStartDate, 'day');
        const isFinishSame = plannedFinishDate && actualFinishDate && plannedFinishDate.isSame(actualFinishDate, 'day');
        const isWithinPlannedDuration =
          plannedStartDate && plannedFinishDate && actualStartDate &&
          getBusinessDays(actualStartDate, dayjs()) <= getBusinessDays(plannedStartDate, plannedFinishDate);

        if (activityStatus === 'completed') {
          const isCompletedOnTime = isStartSame && isFinishSame;
          iconSrc = isCompletedOnTime ? '/images/icons/completed.png' : '/images/icons/overdue.png';
        } else if (activityStatus === 'inProgress') {
          iconSrc = isWithinPlannedDuration ? '/images/icons/inprogress.png' : '/images/icons/overdue.png';
        } else {
          iconSrc = '/images/icons/yettostart.png';
        }

        return (
          <span
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => {
              if (record.duration != undefined)
                setSelectedActivityKey(prevKey => prevKey === record.key ? null : record.key);
            }}
          >
            {record.notes?.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedActivityKey(record.key);
                  setNoteModalVisible(true);
                  setNoteInput('');
                  setEditNoteId(null);
                }}
              >
                <FileTextOutlined style={{ fontSize: 22, color: '#1890ff' }} />
              </span>
            )}
            {duration ? (
              <img src={iconSrc} alt={activityStatus} style={{ width: 34, height: 34 }} />
            ) : (
              <span style={{ width: 34, height: 34 }} />
            )}
            {keyActivity}
          </span>
        );
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 80,
      align: "center",
      render: (_, record) => `${record.duration ? record.duration : ''}`
    },
    { title: "Pre-Requisite", dataIndex: "preRequisite", key: "preRequisite", width: 120, align: "center" },
    { title: "Slack", dataIndex: "slack", key: "slack", width: 80, align: "center" },
    { title: "Planned Start", dataIndex: "plannedStart", key: "plannedStart", width: 120, align: "center" },
    { title: "Planned Finish", dataIndex: "plannedFinish", key: "plannedFinish", width: 120, align: "center" },
  ];

  const editingColumns: ColumnsType = [
    {
      title: "Actual/Expected Duration",
      key: "durations",
      width: 200,
      align: "center",
      render: (_, record) => {
        const { actualStart, actualFinish, expectedDuration, duration, activityStatus, isModule } = record;

        const start = actualStart && dayjs(actualStart, 'DD-MM-YYYY').isValid()
          ? dayjs(actualStart, 'DD-MM-YYYY')
          : null;
        const finish = actualFinish && dayjs(actualFinish, 'DD-MM-YYYY').isValid()
          ? dayjs(actualFinish, 'DD-MM-YYYY')
          : null;

        const calculatedDuration = start && finish ? getWorkingDaysDiff(start, finish) : null;

        const displayDuration = expectedDuration ?? calculatedDuration ?? duration;

        const isEditable =
          isEditing &&
          !isModule &&
          activityStatus === "inProgress" &&
          !(replaneMode && ["completed", "inProgress"].includes(record.fin_status));
        return isEditable ? (
          <Input
            type="number"
            min={1}
            value={displayDuration}
            onChange={(e) => handleFieldChange(e.target.value, record.key, "expectedDuration")}
            style={{ width: 80 }}
          />
        ) : (
          displayDuration != null ? `${displayDuration}` : ""
        );
      }
    },
    {
      title: "Status",
      dataIndex: "activityStatus",
      key: "activityStatus",
      width: 150,
      align: "center",
      render: (_, record) => {
        return isEditing && !record.isModule
          ? renderStatusSelect(record.activityStatus, record, dataSource, replaneMode)
          : record.activityStatus;
      },

    },
    {
      title: "Actual / Expected Start",
      dataIndex: "actualStart",
      key: "actualStart",
      width: 180,
      align: "center",
      render: (_, record) => {
        const { actualStart, activityStatus, key, isModule, preRequisite, children, Code } = record;
        const disableDueToReplan =
          replaneMode && ["completed", "inProgress"].includes(record.fin_status)
        const flatList = getAllActivities(dataSource);
        const isBlocked = (() => {
          const isBlockedByPreRequisite = () => {
            if (!preRequisite) return false;
            const preReqCodes = preRequisite.split(',').map((c: string) => c.trim().toLowerCase());
            return preReqCodes.some((code: any) => {
              const act = flatList.find((x) => (x.Code || '').toLowerCase() === code);
              return !act || (act.activityStatus || '').toLowerCase() !== 'completed';
            });
          };

          const isBlockedByChildStatus = () => {
            if (!children || !Array.isArray(children)) return false;
            return children.some((child: any) => {
              const st = (child.activityStatus || '').toLowerCase();
              return st === 'inprogress' || st === 'completed';
            });
          };

          const isBlockedByDependents = () => {
            const currentCode = (Code || '').toLowerCase();
            return flatList.some((item) => {
              const preReqs = (item.preRequisite || '')
                .split(',')
                .map((c: string) => c.trim().toLowerCase());
              return preReqs.includes(currentCode) &&
                ['inprogress', 'completed'].includes((item.activityStatus || '').toLowerCase());
            });
          };

          return isBlockedByPreRequisite() || isBlockedByChildStatus() || isBlockedByDependents();
        })();

        const shouldDisable =
          activityStatus === "yetToStart" || (activityStatus === "completed" && isBlocked);

        return isEditing && !isModule ? (
          <DatePicker
            format="DD-MM-YYYY"
            value={
              actualStart && dayjs(actualStart, 'DD-MM-YYYY').isValid()
                ? dayjs(actualStart, 'DD-MM-YYYY')
                : null
            }
            onChange={(date) =>
              handleFieldChange(date ? dayjs(date).format('DD-MM-YYYY') : null, key, "actualStart")
            }
            disabled={shouldDisable || disableDueToReplan}
          />
        ) : (
          actualStart || ""
        );
      },
    },
    {
      title: "Actual / Expected Finish",
      dataIndex: "actualFinish",
      key: "actualFinish",
      width: 180,
      align: "center",
      render: (_, record) => {
        const { actualFinish, activityStatus, key, isModule, preRequisite, children, Code } = record;
        const disableDueToReplan =
          replaneMode && ["completed", "inProgress"].includes(record.fin_status)
        const flatList = getAllActivities(dataSource);
        const isBlocked = (() => {
          const isBlockedByPreRequisite = () => {
            if (!preRequisite) return false;
            const preReqCodes = preRequisite.split(',').map((c: string) => c.trim().toLowerCase());
            return preReqCodes.some((code: any) => {
              const act = flatList.find((x) => (x.Code || '').toLowerCase() === code);
              return !act || (act.activityStatus || '').toLowerCase() !== 'completed';
            });
          };

          const isBlockedByChildStatus = () => {
            if (!children || !Array.isArray(children)) return false;
            return children.some((child: any) => {
              const st = (child.activityStatus || '').toLowerCase();
              return st === 'inprogress' || st === 'completed';
            });
          };

          const isBlockedByDependents = () => {
            const currentCode = (Code || '').toLowerCase();
            return flatList.some((item) => {
              const preReqs = (item.preRequisite || '')
                .split(',')
                .map((c: string) => c.trim().toLowerCase());
              return preReqs.includes(currentCode) &&
                ['inprogress', 'completed'].includes((item.activityStatus || '').toLowerCase());
            });
          };

          return isBlockedByPreRequisite() || isBlockedByChildStatus() || isBlockedByDependents();
        })();

        const shouldDisable =
          activityStatus === "yetToStart" ||
          activityStatus === "inProgress" ||
          (activityStatus === "completed" && isBlocked);

        return isEditing && !isModule ? (
          <DatePicker
            format="DD-MM-YYYY"
            value={
              actualFinish && dayjs(actualFinish, 'DD-MM-YYYY').isValid()
                ? dayjs(actualFinish, 'DD-MM-YYYY')
                : null
            }
            onChange={(date) =>
              handleFieldChange(date ? dayjs(date).format('DD-MM-YYYY') : null, key, "actualFinish")
            }
            disabled={shouldDisable || disableDueToReplan}
          />
        ) : (
          actualFinish || ""
        );
      },
    }
  ];

  const finalColumns: ColumnsType = isEditing ? [...baseColumns, ...editingColumns] : baseColumns;
  const handleFieldChange = (value: any, recordKey: any, fieldName: any) => {
    setDataSource((prevData: any) => {
      const today = dayjs();

      const parseDate = (date: string | null | undefined) =>
        date && dayjs(date, 'DD-MM-YYYY').isValid() ? dayjs(date, 'DD-MM-YYYY') : null;

      const addBusinessDays = (start: dayjs.Dayjs, numDays: number): dayjs.Dayjs => {
        let count = 0;
        let date = start.clone();
        while (count < numDays) {
          date = date.add(1, 'day');
          const day = date.day();
          if (day !== 0 && day !== 6) count++;
        }
        return date;
      };

      const businessDaysBetween = (start: dayjs.Dayjs, end: dayjs.Dayjs): number => {
        let count = 0;
        let date = start.clone();
        while (date.isBefore(end, 'day') || date.isSame(end, 'day')) {
          const day = date.day();
          if (day !== 0 && day !== 6) count++;
          date = date.add(1, 'day');
        }
        return count;
      };

      const findActivityByCode = (data: any[], code: string): any | null => {
        for (const item of data) {
          if (item.Code === code) return item;
          if (item.children) {
            const found = findActivityByCode(item.children, code);
            if (found) return found;
          }
        }
        return null;
      };

      const getAllActivities = (data: any[]): any[] => {
        const result: any[] = [];
        const traverse = (items: any[]) => {
          for (const item of items) {
            result.push(item);
            if (item.children) traverse(item.children);
          }
        };
        traverse(data);
        return result;
      };

      const getLatestPreReqFinishDate = (data: any[], preReqCodes: string[]) => {
        const preReqActivities = preReqCodes
          .map((code: any) => findActivityByCode(data, code))
          .filter((item: any) => item && item.actualFinish);

        const dates = preReqActivities
          .map((item: any) => parseDate(item.actualFinish))
          .filter((d: any) => d != null)
          .sort((a: any, b: any) => b!.isAfter(a!) ? 1 : -1);

        return dates[0];
      };

      const updateDeepDependents = (data: any[], updatedCodes: Set<string>): any[] => {
        const flatList = getAllActivities(data);
        const updated = new Set<string>(updatedCodes);

        let changed = true;
        while (changed) {
          changed = false;
          for (const activity of flatList) {
            if (activity.actualStart || !activity.preRequisite) continue;

            const preReq = activity.preRequisite.split(',').map((c: string) => c.trim());
            const allPresent = preReq.every((code: any) =>
              flatList.find((x) => x.Code === code && x.actualFinish)
            );

            if (allPresent && preReq.some((code: any) => updated.has(code))) {
              const latest: any = getLatestPreReqFinishDate(data, preReq);
              const duration = activity.duration ? parseInt(activity.duration, 10) : 0;
              const start = latest.add(1, 'day');
              const finish = addBusinessDays(start, duration);

              activity.actualStart = start.format('DD-MM-YYYY');
              activity.actualFinish = finish.format('DD-MM-YYYY');
              activity.expectedDuration = duration;

              updated.add(activity.Code);
              changed = true;
            }
          }
        }
        return data;
      };

      let updatedCodes = new Set<string>();

      const updatedData = prevData.map((item: any) => {
        const recursiveUpdate = (subItem: any): any => {
          if (subItem.key === recordKey) {
            const plannedStart = parseDate(subItem.plannedStart);
            const plannedFinish = parseDate(subItem.plannedFinish);
            const plannedDuration = subItem.duration ? parseInt(subItem.duration, 10) : 0;
            if (fieldName === 'activityStatus') {
              if (value === 'inProgress' || value === 'completed') {
                if (['inProgress', 'completed'].includes(subItem.fin_status)) {
                  const actualStart = parseDate(subItem.actualStart);
                  const actualFinish = parseDate(subItem.actualFinish);

                  if (actualStart && actualStart.isAfter(today, 'day')) {
                    notify.error(`Cannot mark as '${value}' because actual start date has not reached today's date.`);
                    return subItem;
                  }

                  if (actualFinish && actualFinish.isAfter(today, 'day')) {
                    notify.error(`Cannot mark as '${value}' because actual finish date has not reached today's date.`);
                    return subItem;
                  }

                  subItem.activityStatus = value;
                  updatedCodes.add(subItem.Code);
                  return subItem;
                }

                const alreadyHasDates = subItem.actualStart && subItem.actualFinish;

                const actualStartDate = parseDate(subItem.actualStart);
                const actualFinishDate = parseDate(subItem.actualFinish);

                if (
                  alreadyHasDates &&
                  subItem.fin_status === 'completed' &&
                  value === 'inProgress' &&
                  actualStartDate &&
                  actualFinishDate &&
                  actualFinishDate.isBefore(today, 'day')
                ) {
                  subItem.actualFinish = today.format('DD-MM-YYYY');
                  subItem.expectedDuration = businessDaysBetween(actualStartDate, today);
                  subItem.activityStatus = value;
                  updatedCodes.add(subItem.Code);
                  return subItem;
                }

                if (alreadyHasDates && subItem.fin_status === 'completed') {
                  subItem.activityStatus = value;
                  updatedCodes.add(subItem.Code);
                  return subItem;
                }

                const preReqCodes = subItem.preRequisite
                  ? subItem.preRequisite.split(',').map((code: any) => code.trim())
                  : [];
                const latestPreReqFinish = getLatestPreReqFinishDate(prevData, preReqCodes);

                let tempStart = latestPreReqFinish ? latestPreReqFinish.add(1, 'day') : plannedStart;
                const plannedDuration = subItem.duration ? parseInt(subItem.duration, 10) : 0;

                if (
                  (tempStart && tempStart.isAfter(today, 'day')) ||
                  (value === 'completed' &&
                    tempStart &&
                    plannedDuration >= 0 &&
                    addBusinessDays(tempStart, plannedDuration).isAfter(today, 'day'))
                ) {
                  notify.error(`Cannot mark as '${value}' when actual dates exceed today's date.`);
                  return subItem;
                }

                subItem.actualStart = tempStart?.format('DD-MM-YYYY') || null;

                if ((value === 'inProgress') && tempStart && tempStart.isBefore(today, 'day')) {
                  const daysTillToday = businessDaysBetween(tempStart, today);
                  const effectiveDuration = Math.max(daysTillToday, plannedDuration);
                  const newFinish = addBusinessDays(tempStart, effectiveDuration);
                  subItem.actualFinish = newFinish.format('DD-MM-YYYY');
                  subItem.expectedDuration = effectiveDuration;
                } if ((value === 'completed') && tempStart) {
                  const duration = subItem.expectedDuration ?? plannedDuration;
                  const newFinish = addBusinessDays(tempStart, duration);
                  subItem.actualFinish = newFinish.format('DD-MM-YYYY');
                  subItem.expectedDuration = duration;
                }
                else {
                  const tempFinish = tempStart && plannedDuration >= 0
                    ? addBusinessDays(tempStart, plannedDuration)
                    : null;
                  subItem.actualFinish = tempFinish?.format('DD-MM-YYYY') || null;
                  subItem.expectedDuration = plannedDuration;
                }

                subItem.activityStatus = value;
                updatedCodes.add(subItem.Code);
              }

              else if (value === 'yetToStart') {
                const alreadyHasDates = subItem.actualStart && subItem.actualFinish;

                subItem.expectedDuration = plannedDuration;
                subItem.activityStatus = value;
                if (!alreadyHasDates || !['inProgress', 'completed'].includes(subItem.fin_status)) {
                  subItem.actualStart = plannedStart?.format('DD-MM-YYYY') || null;
                  subItem.actualFinish = plannedFinish?.format('DD-MM-YYYY') || null;
                  updatedCodes.add(subItem.Code);
                } else {
                  updatedCodes.add(subItem.Code);
                }
              }
            } else if (fieldName === 'actualStart') {
              const newStart = parseDate(value);
              const preReqCodes = subItem.preRequisite
                ? subItem.preRequisite.split(',').map((c: string) => c.trim())
                : [];
              const latestPreReqFinish = getLatestPreReqFinishDate(prevData, preReqCodes);

              if (
                latestPreReqFinish &&
                newStart &&
                (newStart.isBefore(latestPreReqFinish, 'day') || newStart.isSame(latestPreReqFinish, 'day'))
              ) {
                notify.error(`Actual start date cannot be before or on prerequisite completion date.`);
                return subItem;
              }

              if (newStart && newStart.isAfter(today, 'day')) {
                notify.error(`Actual start date cannot be in the future.`);
                return subItem;
              }
              if (
                subItem.activityStatus === 'completed' &&
                newStart &&
                subItem.expectedDuration != null
              ) {
                const newCalculatedFinish = addBusinessDays(newStart, subItem.expectedDuration);
                if (newCalculatedFinish.isAfter(today, 'day')) {
                  notify.error(`Cannot change actual start — it pushes actual finish beyond today's date for a completed activity.`);
                  return subItem;
                }
              }
              subItem.actualStart = value;
              if (newStart && subItem.expectedDuration != null) {
                subItem.actualFinish = addBusinessDays(newStart, subItem.expectedDuration).format('DD-MM-YYYY');
              }

            } else if (fieldName === 'actualFinish') {
              const newFinish = parseDate(value);
              const existingFinish = parseDate(subItem.actualFinish);

              if (newFinish && newFinish.isAfter(today, 'day')) {
                notify.error(`Actual finish date cannot be in the future.`);
                return subItem;
              }
              if (
                subItem.activityStatus === 'completed' &&
                existingFinish &&
                newFinish &&
                newFinish.isBefore(existingFinish, 'day')
              ) {
                notify.error(`Cannot reduce actual finish date for a completed activity.`);
                return subItem;
              }

              subItem.actualFinish = value;

              const start = parseDate(subItem.actualStart);
              if (start && newFinish) {
                const dur = businessDaysBetween(start, newFinish);
                subItem.expectedDuration = dur >= 0 ? dur : null;
              }

            } else if (fieldName === 'expectedDuration') {
              const duration = parseInt(value, 10);
              subItem.expectedDuration = duration;

              const actualStart = parseDate(subItem.actualStart);

              if (actualStart && dayjs(actualStart).isValid() && !isNaN(duration)) {
                const newFinish = addBusinessDays(actualStart, duration);
                subItem.actualFinish = newFinish.format('DD-MM-YYYY');
              } else {
                subItem.actualFinish = null;
              }
            } else {
              subItem[fieldName] = value;
            }

            const actualStart = parseDate(subItem.actualStart);
            const actualFinish = parseDate(subItem.actualFinish);
            if (
              subItem.activityStatus === 'inProgress' &&
              actualStart &&
              actualFinish &&
              actualFinish.isBefore(today, 'day')
            ) {
              const newFinish = today;
              const dur = businessDaysBetween(actualStart, newFinish);
              if (subItem.expectedDuration != null && dur < subItem.expectedDuration) {
                notify.error(`Cannot reduce duration by updating actual finish to today.`);
              } else {
                subItem.actualFinish = newFinish.format('DD-MM-YYYY');
                subItem.expectedDuration = dur >= 0 ? dur : null;
                updatedCodes.add(subItem.Code);
              }
            }

            return subItem;
          } else if (subItem.children) {
            return {
              ...subItem,
              children: subItem.children.map((child: any) => recursiveUpdate(child)),
            };
          }
          return subItem;
        };

        return recursiveUpdate(item);
      });

      return updateDeepDependents(updatedData, updatedCodes);
    });
  };

  const handleUpdateStatus = () => {
    setIsEditing(true);
  };

  const handleSaveStatus = async () => {
    let isValid = true;
    let errorMessage = "";

    dataSource.some((module: any) => {
      if (module.children) {
        return module.children.some((activity: any) => {
          const { activityStatus, actualStart, actualFinish } = activity;

          if (activityStatus === "inProgress" && !actualStart) {
            errorMessage = `Activity ${activity.keyActivity} is IN-PROGRESS but Actual Start is missing.`;
            isValid = false;
            return true;
          }

          if (activityStatus === "completed") {
            if (!actualStart && !actualFinish) {
              errorMessage = `Activity ${activity.keyActivity} is COMPLETED but Actual Start and Actual Finish are missing.`;
            } else if (!actualStart) {
              errorMessage = `Activity ${activity.keyActivity} is COMPLETED but Actual Start is missing.`;
            } else if (!actualFinish) {
              errorMessage = `Activity ${activity.keyActivity} is COMPLETED but Actual Finish is missing.`;
            }

            if (errorMessage) {
              isValid = false;
              return true;
            }
          }

          // if (activityStatus === "yetToStart" && (actualStart || actualFinish)) {
          //   errorMessage = `Activity ${activity.keyActivity} is Yet To Start but ${actualStart ? "Actual Start" : "Actual Finish"} is filled incorrectly.`;
          //   isValid = false;
          //   return true;
          // }  

          return false;
        });
      }
      return false;
    });

    if (!isValid) {
      notify.error(`${errorMessage}`);
      return;
    }

    if (!sequencedModules.length || !dataSource.length) return;

    const updatedActivityMap = new Map();
    dataSource.forEach((module: any) => {
      module.children.forEach((activity: any) => {
        updatedActivityMap.set(activity.Code, {
          actualStart: activity.actualStart,
          actualFinish: activity.actualFinish,
          activityStatus: activity.activityStatus,
          fin_status: activity.activityStatus,
        });
      });
    });

    const updatedSequencedModules = sequencedModules.map((module: any) => ({
      ...module,
      activities: module.activities.map((activity: any) => ({
        ...activity,
        ...(updatedActivityMap.has(activity.code) ? updatedActivityMap.get(activity.code) : {}),
      })),
    }));

    setSequencedModules(updatedSequencedModules);
    let updatedProject = selectedProject;
    updatedProject.projectTimeline = updatedSequencedModules;
    await db.updateProjectTimeline(selectedProjectTimeline.versionId || selectedProjectTimeline.timelineId, updatedSequencedModules);
    defaultSetup();
    notify.success(`Status updated successfully!`);
  };

  const getProjectTimelineById = (id: any) => {
    const data = selectedProject.projectTimeline.filter((item: any) => item.timelineId == id);
    if (data.length > 0) {
      setSelectedProjectTimeline(data[0]);
      localStorage.setItem("latestProjectVersion", data[0].version);
    } else {
      console.warn("No matching timeline found for id:", id);
    }
  };

  const handleChangeVersionTimeline = async (id: any) => {
    const timelineData = await db.getProjectTimelineById(id);
    getProjectTimelineById(id);
    handleLibraryChange(timelineData);
  }

  const handleReviseConfirm = () => {
    setIsReviseModalOpen(false);
  };

  const selectedNotes = useMemo(() => {
    const findNotes = (items: any[]): any[] => {
      for (const item of items) {
        if (item.key === selectedActivityKey) return item.notes || [];
        if (item.children) {
          const found = findNotes(item.children);
          if (found) return found;
        }
      }
      return [];
    };
    return findNotes(dataSource);
  }, [selectedActivityKey, dataSource]);

  const handleSaveNote = async () => {
    const timestamp = new Date();
    const newNote = {
      id: editNoteId || Date.now().toString(),
      text: noteInput.trim(),
      updatedAt: timestamp,
      createdAt: editNoteId ? undefined : timestamp,
      createdBy: selectedProjectTimeline?.addedBy,
    };

    const updatedDataSource = (prev: any[]): any[] =>
      prev.map(item => {
        if (item.key === selectedActivityKey) {
          const notes = item.notes || [];
          const updatedNotes = editNoteId
            ? notes.map((n: any) => (n.id === editNoteId ? { ...n, ...newNote } : n))
            : [...notes, newNote];
          return { ...item, notes: updatedNotes };
        }
        if (item.children) return { ...item, children: updatedDataSource(item.children) };
        return item;
      });

    const newDataSource = updatedDataSource(dataSource);
    setDataSource(newDataSource);

    const updatedNoteMap = new Map();
    newDataSource.forEach((module: any) => {
      module.children.forEach((activity: any) => {
        if (activity.notes) {
          updatedNoteMap.set(activity.Code, activity.notes);
        }
      });
    });

    const updatedSequencedModules = sequencedModules.map((module: any) => ({
      ...module,
      activities: module.activities.map((activity: any) => ({
        ...activity,
        ...(updatedNoteMap.has(activity.code) ? { notes: updatedNoteMap.get(activity.code) } : {}),
      })),
    }));

    setSequencedModules(updatedSequencedModules);
    let updatedProject = selectedProject;
    updatedProject.projectTimeline = updatedSequencedModules;
    await db.updateProjectTimeline(selectedProjectTimeline.versionId || selectedProjectTimeline.timelineId, updatedSequencedModules);
    setNoteInput('');
    setEditNoteId(null);
    setNoteModalVisible(false);
    notify.success(`Note ${editNoteId ? 'updated' : 'added'} successfully!`);
  };

  const handleDeleteNote = async (noteId: string) => {
    const updatedDataSource = (prev: any[]): any[] =>
      prev.map(item => {
        if (item.key === selectedActivityKey) {
          const notes = item.notes?.filter((n: any) => n.id !== noteId) || [];
          return { ...item, notes };
        }
        if (item.children) return { ...item, children: updatedDataSource(item.children) };
        return item;
      });

    const newDataSource = updatedDataSource(dataSource);
    setDataSource(newDataSource);

    const updatedNoteMap = new Map();
    newDataSource.forEach((module: any) => {
      module.children.forEach((activity: any) => {
        if (activity.notes) {
          updatedNoteMap.set(activity.Code, activity.notes);
        }
      });
    });

    const updatedSequencedModules = sequencedModules.map((module: any) => ({
      ...module,
      activities: module.activities.map((activity: any) => ({
        ...activity,
        ...(updatedNoteMap.has(activity.code) ? { notes: updatedNoteMap.get(activity.code) } : {}),
      })),
    }));

    setSequencedModules(updatedSequencedModules);
    let updatedProject = selectedProject;
    updatedProject.projectTimeline = updatedSequencedModules;
    await db.updateProjectTimeline(
      selectedProjectTimeline.versionId || selectedProjectTimeline.timelineId,
      updatedSequencedModules
    );

    notify.success(`Note deleted successfully!`);
  };

  const handleClose = () => {
    setOpenCostCalcModal(false);
    form.resetFields();
    setFormValid(false);
  };

  const handleValuesChange = () => {
    const { projectCost, opCost, delayCost } = form.getFieldsValue();
    if (projectCost && opCost && delayCost) {
      setFormValid(true);
    } else {
      setFormValid(false);
    }
  };

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

  const findActivityByKey = (list: any[], key: string): any => {
    for (const item of list) {
      if (item.key === key) return item;
      if (item.children) {
        const result = findActivityByKey(item.children, key);
        if (result) return result;
      }
    }
    return null;
  };

  const handleConfirm = async () => {
    try {
      const values = await form.validateFields();

      const updatedDataSource = (prev: any[]): any[] =>
        prev.map(item => {
          if (item.key === selectedActivityKey) {
            return {
              ...item,
              cost: {
                projectCost: values.projectCost,
                opCost: values.opCost
              }
            };
          }
          if (item.children) return { ...item, children: updatedDataSource(item.children) };
          return item;
        });

      const newDataSource = updatedDataSource(dataSource);
      setDataSource(newDataSource);

      const updatedCostMap = new Map();
      newDataSource.forEach((module: any) => {
        module.children.forEach((activity: any) => {
          if (activity.cost) {
            updatedCostMap.set(activity.Code, activity.cost);
          }
        });
      });

      const updatedSequencedModules = sequencedModules.map((module: any) => ({
        ...module,
        activities: module.activities.map((activity: any) => ({
          ...activity,
          ...(updatedCostMap.has(activity.code) ? { cost: updatedCostMap.get(activity.code) } : {})
        }))
      }));

      setSequencedModules(updatedSequencedModules);

      let updatedProject = selectedProject;
      updatedProject.projectTimeline = updatedSequencedModules;

      await db.updateProjectTimeline(
        selectedProjectTimeline.versionId || selectedProjectTimeline.timelineId,
        updatedSequencedModules
      );

      form.resetFields();
      setOpenCostCalcModal(false);
      notify.success("Cost updated successfully!");
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  const handleConfirmResponsibility = async () => {
    try {
      const values = await raciForm.validateFields();

      const updatedDataSource = (prev: any[]): any[] =>
        prev.map(item => {
          if (item.key === selectedActivityKey) {
            return {
              ...item,
              raci: {
                responsible: values.responsible,
                accountable: values.accountable,
                consulted: values.consulted || [],
                informed: values.informed || []
              }
            };
          }
          if (item.children) return { ...item, children: updatedDataSource(item.children) };
          return item;
        });

      const newDataSource = updatedDataSource(dataSource);
      setDataSource(newDataSource);

      const updatedRaciMap = new Map();
      newDataSource.forEach((module: any) => {
        module.children.forEach((activity: any) => {
          if (activity.raci) {
            updatedRaciMap.set(activity.Code, activity.raci);
          }
        });
      });

      const updatedSequencedModules = sequencedModules.map((module: any) => ({
        ...module,
        activities: module.activities.map((activity: any) => ({
          ...activity,
          ...(updatedRaciMap.has(activity.code) ? { raci: updatedRaciMap.get(activity.code) } : {})
        }))
      }));

      setSequencedModules(updatedSequencedModules);

      let updatedProject = selectedProject;
      updatedProject.projectTimeline = updatedSequencedModules;

      await db.updateProjectTimeline(
        selectedProjectTimeline.versionId || selectedProjectTimeline.timelineId,
        updatedSequencedModules
      );

      raciForm.resetFields();
      setOpenResponsibilityModal(false);
      notify.success("Responsibilities updated successfully!");
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  const handlesaveReplan = async () => {
    try {
      const currentUser = getCurrentUser();
      const currentTimestamp = new Date().toISOString();

      const createTimelineEntry = (timelineId: string, version: string) => ({
        timelineId,
        status: "pending",
        version,
        addedBy: currentUser.name,
        addedUserEmail: currentUser.email,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      });

      const updatedSequencedModules = sequencedModules.map((mod: any) => {
        const updatedActivities = mod.activities.map((act: any) => {
          if (act.fin_status === "yetToStart") {
            return {
              ...act,
              start: act.actualStart
                ? dayjs(act.actualStart, "DD-MM-YYYY").toISOString()
                : act.start,
              end: act.actualFinish
                ? dayjs(act.actualFinish, "DD-MM-YYYY").toISOString()
                : act.end,
              duration: act.expectedDuration || act.duration,
            };
          }
          return act;
        });

        return {
          ...mod,
          activities: updatedActivities,
        };
      });

      const createdTimeLineId: any = await db.addProjectTimeline(updatedSequencedModules);
      const existingTimeline = selectedProject.projectTimeline || [];
      const newVersion = `${existingTimeline.length + 1}.0`;
      localStorage.setItem("latestProjectVersion", newVersion);

      let updatedTimeline = [...existingTimeline];
      if (existingTimeline.length > 0) {
        const lastIndex = existingTimeline.length - 1;
        updatedTimeline[lastIndex] = {
          ...updatedTimeline[lastIndex],
          status: "replanned",
        };
      }

      const updatedProjectWithTimeline = {
        ...selectedProject,
        projectTimeline: [
          ...updatedTimeline,
          createTimelineEntry(createdTimeLineId, newVersion),
        ],
        processedTimelineData: sequencedModules,
      };

      await db.updateProject(selectedProject.id, updatedProjectWithTimeline);
      notify.success("Replanned timeline saved successfully!");
      navigate(".", { replace: true });
      setIsReplanMode(false);
      setConfirmReplan(false);
      defaultSetup();

    } catch (error) {
      console.error("Error saving replanned timeline:", error);
      notify.error("Failed to save replanned timeline. Please try again.");
    }
  };

  return (
    <>
      <div className="status-heading">
        <div className="status-update-header">
          <p>Project Timeline</p>
          {allProjects.length != 0 && (
            <div style={{ display: "flex", gap: "10px" }}>
              <span>Approval Status:</span>
              <span
                style={{ fontWeight: 'bold', textTransform: "uppercase" }}
                className={
                  selectedProjectTimeline?.status?.toLowerCase() === "approved"
                    ? "text-approved"
                    : selectedProjectTimeline?.status?.toLowerCase() === "pending"
                      ? "text-warning"
                      : selectedProjectTimeline?.status?.toLowerCase() === "replanned"
                        ? "text-replanned"
                        : "text-danger"
                }
              >
                {selectedProjectTimeline?.status}
              </span>
            </div>
          )}
          {allProjects.length != 0 && (
            <div className="times-stamps" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <p style={{ color: "#6c757d", fontWeight: "900", minWidth: "80px" }}>Created&nbsp;/&nbsp;Updated By</p>
                <p style={{ fontWeight: "bold", color: "#007bff" }}>
                  {selectedProjectTimeline?.addedBy}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <p style={{ color: "#6c757d", fontWeight: "900", minWidth: "80px" }}>Created&nbsp;/&nbsp;Updated At</p>
                <p style={{ fontWeight: "bold", color: "#007bff" }}>
                  {new Date(selectedProjectTimeline?.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="main-status-update">
        {allProjects.length != 0 && (
          <>
            <div className="status-toolbar">
              <div className="select-item">
                <div className="flex-item">
                  <label htmlFor="" style={{ fontWeight: "bold", marginTop: "3px", width: "100%" }}>Project</label>
                  <Select
                    placeholder="Select Project"
                    value={selectedProjectId}
                    onChange={handleProjectChange}
                    popupMatchSelectWidth={false}
                    style={{ width: "100%" }}
                    disabled={replaneMode}
                  >
                    {allProjects.map((project) => (
                      <Option key={project.id} value={project.id}>
                        {project.projectParameters.projectName}
                      </Option>
                    ))}
                  </Select>
                </div>
                {allVersions?.length > 0 && (
                  <div className="flex-item">
                    <label htmlFor="" style={{ fontWeight: "bold", marginTop: "3px", width: "100%" }}>
                      Version
                    </label>
                    <Select
                      placeholder="Select Version"
                      value={{
                        value: selectedVersionId,
                        label: (
                          <>
                            {selectedProjectTimeline?.status === 'pending' ? (
                              <ClockCircleOutlined style={{ color: 'orange', marginRight: 8 }} />
                            ) : selectedProjectTimeline?.status === 'replanned' ? (
                              <SyncOutlined style={{ color: '#6f42c1', marginRight: 8 }} />
                            ) : (
                              <LikeOutlined style={{ color: 'green', marginRight: 8 }} />
                            )}
                            {selectedProjectTimeline?.version}
                          </>
                        ),
                      }}
                      onChange={(valueObj) => {
                        const value = valueObj.value;
                        const selectedVersion = allVersions.find((version: any) => version.versionId === value);
                        setSelectedProjectTimeline(selectedVersion);
                        setSelectedVersionId(value);
                        handleChangeVersionTimeline(value);
                        setSelectedActivityKey(null);
                      }}
                      disabled={replaneMode}
                      popupMatchSelectWidth={false}
                      style={{ width: '100%' }}
                      labelInValue
                    >
                      {allVersions?.map((version: any) => (
                        <Option key={version.versionId} value={version.versionId}>
                          {version.status === 'pending' ? (
                            <ClockCircleOutlined style={{ color: 'orange', marginRight: 8 }} />
                          ) : version.status === 'replanned' ? (
                            <SyncOutlined style={{ color: 'blue', marginRight: 8 }} />
                          ) : (
                            <LikeOutlined style={{ color: 'green', marginRight: 8 }} />
                          )}
                          {version.version}
                        </Option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
              <div className="actions">
                <Button
                  icon={<DollarOutlined />}
                  disabled={!selectedActivityKey}
                  onClick={handleOpenCostCalcModal}
                  style={{
                    backgroundColor: selectedActivityKey ? '#e67e22' : '#f5f5f5',
                    color: selectedActivityKey ? '#fff' : '#bfbfbf',
                    cursor: selectedActivityKey ? 'pointer' : 'not-allowed',
                  }}
                >
                  Cost
                </Button>

                <Button
                  icon={<UserOutlined />}
                  disabled={!selectedActivityKey}
                  onClick={showResponsibilityModal}
                  style={{
                    backgroundColor: selectedActivityKey ? '#2c3e50' : '#f5f5f5',
                    color: selectedActivityKey ? '#fff' : '#bfbfbf',
                    cursor: selectedActivityKey ? 'pointer' : 'not-allowed',
                  }}
                >
                  RACI
                </Button>

                <Button
                  icon={<FormOutlined />}
                  disabled={!selectedActivityKey}
                  onClick={() => setNoteModalVisible(true)}
                  style={{
                    backgroundColor: selectedActivityKey ? '#990000' : '#f5f5f5',
                    color: selectedActivityKey ? '#fff' : '#bfbfbf',
                    cursor: selectedActivityKey ? 'pointer' : 'not-allowed',
                  }}
                >
                  Note
                </Button>
                {!replaneMode && (
                  <Button
                    type="primary"
                    disabled={!selectedProjectId}
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    style={{ backgroundColor: "#4CAF50" }}
                  >
                    Download Timeline
                  </Button>
                )}
                {(selectedProjectTimeline?.status != 'replanned' && !replaneMode) && (
                  <Button
                    type="primary"
                    disabled={!selectedProjectId}
                    icon={selectedProjectTimeline?.status != 'Approved' ? <EditOutlined /> : <ReloadOutlined />}
                    onClick={selectedProjectTimeline?.status != 'Approved' ? editTimeBuilder : rePlanTimeline}
                    style={{ backgroundColor: "#FF8A65" }}
                  >
                    {selectedProjectTimeline?.status != 'Approved' ? 'Edit Timeline' : 'Replan Timeline'}
                  </Button>
                )}

                {!replaneMode && (
                  <Button
                    type="primary"
                    disabled={!selectedProjectId}
                    icon={<ShareAltOutlined />}
                    onClick={showModal}
                    style={{ backgroundColor: "#00BFA6" }}
                  >
                    Share
                  </Button>
                )}
                {(selectedProjectTimeline?.status == 'Approved') && (
                  <Button
                    type={isEditing ? "primary" : "default"}
                    style={{
                      backgroundColor: isEditing ? "#AB47BC" : "#5C6BC0",
                      color: isEditing ? undefined : "#fff",
                    }}
                    icon={isEditing ? <SaveOutlined /> : <FormOutlined />}
                    onClick={isEditing ? handleSaveStatus : handleUpdateStatus}
                  >
                    {isEditing ? "Save Status" : "Update Status"}
                  </Button>
                )}

                {(selectedProjectTimeline?.status != 'Approved' && selectedProjectTimeline?.status != 'replanned') && getCurrentUser().role == 'Admin' && (
                  <div className="action-btn">
                    <Button
                      type="primary"
                      disabled={!selectedProjectId}
                      style={{ backgroundColor: "#E57373" }}
                      onClick={() => setIsReviseModalOpen(true)}
                    >
                      Revise
                    </Button>
                    <Button
                      type="primary"
                      disabled={!selectedProjectId}
                      onClick={() => setIsApproveModalOpen(true)}
                      style={{ backgroundColor: "#258780" }}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <hr />
          </>
        )}
        {selectedProject != null ? (
          <>
            <div className="status-update-items">
              <div className="status-update-table">
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
                  rowClassName={(record) => {
                    if (record.isModule) return "module-header";
                    return record.key === selectedActivityKey ? "activity-row selected-red-row" : "activity-row";
                  }}

                  bordered
                  scroll={{
                    x: "max-content",
                    y: replaneMode ? "calc(100vh - 290px)" : "calc(100vh - 250px)",
                  }}
                />
              </div>
              {replaneMode && (
                <div style={{ display: 'flex', gap: '10px', margin: '5px 10px 10px 0', justifyContent: 'end' }}>
                  <Button
                    type="primary"
                    disabled={!selectedProjectId}
                    icon={<CloseCircleOutlined />}
                    onClick={() => setIsDiscardReplanMode(true)}
                    style={{ marginLeft: "15px", backgroundColor: "#e74c3c", borderColor: "#e74c3c" }}
                  >
                    Discard
                  </Button>
                  <Button
                    type="primary"
                    disabled={!selectedProjectId}
                    onClick={() => setConfirmReplan(true)}
                    style={{ backgroundColor: "#258790" }}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="container-msg">
            <div className="no-project-message">
              <FolderOpenOutlined style={{ fontSize: "50px", color: "grey" }} />
              {allProjects.length === 0 ? (
                <>
                  <h3>No Projects Timeline Found</h3>
                  <p>You need to create a project for defining a timeline.</p>
                  <button onClick={() => {
                    eventBus.emit("updateTab", "/create/register-new-project");
                    navigate("/create/timeline-builder");
                  }}>Create Project Timeline</button>
                </>
              ) : (
                <>
                  <h3>No Project Selected</h3>
                  <p>Please select a project to continue.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Share Timeline"
        visible={isModalOpen}
        onCancel={handleCancel}
        onOk={handleShare}
        okText="Send"
        className="modal-container"
        okButtonProps={{ className: "bg-secondary" }}
      >
        <div style={{ padding: "0px 10px", fontWeight: "400", fontSize: "16px" }}>
          <span>Enter recipient's email:</span>
          <Input
            style={{ marginTop: "10px" }}
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        title="Project Timeline Confirmation"
        visible={isApproveModalOpen}
        onCancel={() => setIsApproveModalOpen(false)}
        onOk={handleApproveTimeline}
        okText="Yes"
        className="modal-container"
        okButtonProps={{ className: "bg-secondary" }}
      >
        <div style={{ padding: "0px 10px", fontWeight: "400", fontSize: "16px" }}>
          <p>Are You sure you want to confirm?</p>
        </div>
      </Modal>

      <Modal
        title="Revise Project Timeline"
        visible={isReviseModalOpen}
        onCancel={() => setIsReviseModalOpen(false)}
        onOk={handleReviseConfirm}
        okText="Confirm"
        cancelText="Cancel"
        className="modal-container"
        okButtonProps={{ danger: true }}
      >
        <div style={{ padding: "0px 20px" }}>
          <div className="times-stamps revise" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <p style={{ color: "#6c757d", fontWeight: "900", minWidth: "80px" }}>Created By</p>
              <p style={{ fontWeight: "bold", color: "#007bff" }}>
                {selectedProjectTimeline?.addedBy}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <p style={{ color: "#6c757d", fontWeight: "900", minWidth: "80px" }}>Created At</p>
              <p style={{ fontWeight: "bold", color: "#007bff" }}>
                {new Date(selectedProjectTimeline?.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>

          <TextArea
            rows={4}
            value={reviseRemarks}
            onChange={(e) => setReviseRemarks(e.target.value)}
            placeholder="Enter revision notes..."
          />
        </div>
      </Modal>

      <Modal
        title="Activity Notes"
        open={noteModalVisible}
        onCancel={() => {
          setNoteModalVisible(false);
          setNoteInput('');
          setEditNoteId(null);
        }}
        width={'60%'}
        footer={null}
        className="modal-container"
      >
        <div style={{ padding: "10px 24px" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Title level={5}>
              {editNoteId ? "Edit Note" : "Add New Note"}
            </Typography.Title>

            <Button
              type="primary"
              block
              onClick={handleSaveNote}
              disabled={!noteInput.trim()}
              style={{ width: '15%', marginBottom: 8 }}
            >
              {editNoteId ? "Update Note" : "Add Note"}
            </Button>

          </div>

          <Input.TextArea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Write your note here..."
            rows={4}
          />

          <List
            header={<strong style={{ fontSize: 16 }}>Previous Notes</strong>}
            dataSource={selectedNotes}
            locale={{ emptyText: "No notes available" }}
            itemLayout="horizontal"
            style={{ marginBottom: 20 }}
            renderItem={(item: any) => (
              <List.Item
                style={{ padding: "8px 0" }}
                actions={[
                  <a key="edit" onClick={() => {
                    setNoteInput(item.text);
                    setEditNoteId(item.id);
                  }}>Edit</a>,
                  <a key="delete" onClick={() => handleDeleteNote(item.id)}>Delete</a>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="note-meta">
                      {item.createdBy && (
                        <span className="note-author">
                          <UserOutlined />
                          {item.createdBy}
                        </span>
                      )}
                      {(item.createdAt || item.updatedAt) && (
                        <span className="note-timestamp">
                          <ClockCircleOutlined />
                          {dayjs(item.createdAt).format('DD MMM YYYY HH:mm')}
                        </span>
                      )}
                    </div>
                  }
                  description={item.text}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>

      <ToastContainer />

      <Modal
        title="Define Cost for Delay (₹ / Day)"
        open={openCostCalcModal}
        onCancel={handleClose}
        onOk={handleConfirm}
        // okButtonProps={{ disabled: !formValid }}
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
        // okButtonProps={{ disabled: !formValid }}
        destroyOnClose
        className="modal-container"
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
                    {userOptions.map((user:any) => (
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
                    {userOptions.map((user:any) => (
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
                    {userOptions.map((user:any) => (
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
                    {userOptions.map((user:any) => (
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
        title="Confirm Discard Changes"
        visible={discardReplaneMode}
        onOk={() => {
          setIsDiscardReplanMode(false);
          setIsReplanMode(false);
          defaultSetup();
        }}
        onCancel={() => {
          setIsDiscardReplanMode(false);
        }}
        okText="Yes, Discard"
        cancelText="Cancel"
        className="modal-container"
        okButtonProps={{ className: "bg-secondary" }}
      >
        <p style={{ padding: "10px" }}>
          Are you sure you want to discard? Any unsaved changes will be lost.
        </p>
      </Modal>

      <Modal
        title="Confirm Replan"
        visible={confirmReplan}
        onOk={() => {
          handlesaveReplan();
        }}
        onCancel={() => {
          setConfirmReplan(false);
        }}
        okText="Confirm"
        cancelText="Cancel"
        className="modal-container"
        okButtonProps={{ className: "bg-secondary" }}
      >
        <p style={{ padding: "10px" }}>
          Are you sure you want to submit?
        </p>
      </Modal>
    </>
  );
};

export default StatusUpdate;