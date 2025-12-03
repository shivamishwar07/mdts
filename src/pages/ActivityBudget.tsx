import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Select,
  InputNumber,
  Typography,
  Space,
  Button,
  Popconfirm,
  Modal,
  Input,
} from "antd";
import { FileTextOutlined, UploadOutlined, EyeOutlined, DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { db, ActivityBudgetDocument } from "../Utils/dataStorege";
import "../styles/activitybudget.css";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify";

const { Option } = Select;
const { Text } = Typography;

interface RevisionEntry {
  amount: number;
  date: string;
}

interface TimelineInfo {
  status: string;
  version: string;
  updatedAt: string;
}

interface ActivityRow {
  key: string;
  SrNo: string | number | null;
  Code: string | null;
  keyActivity: string;
  plannedStart: string;
  plannedFinish: string;
  activityCode: string;
  activityName: string;
  originalBudget?: number | null;
  originalBudgetDate?: string | null;
  revisedBudget?: number | null;
  revisedBudgetDate?: string | null;
  revisionHistory?: RevisionEntry[];
}

interface ModulePanel {
  moduleKey: string;
  moduleName: string;
  rows: ActivityRow[];
}

type TableRow = ActivityRow & {
  isModule?: boolean;
  moduleName?: string;
  children?: TableRow[];
};

const ActivityBudget: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [modulesPanels, setModulesPanels] = useState<ModulePanel[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [timelineInfo, setTimelineInfo] = useState<TimelineInfo | null>(null);
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalActivity, setDocModalActivity] = useState<{
    activityCode: string;
    activityName: string;
    moduleName: string;
  } | null>(null);
  const [docModalDocs, setDocModalDocs] = useState<ActivityBudgetDocument[]>([]);
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreviewVisible, setDocPreviewVisible] = useState(false);
  const [docPreviewContent, setDocPreviewContent] = useState<string | null>(null);


  useEffect(() => {
    (async () => {
      const all = await db.getProjects();
      setProjects(all || []);
      if (all && all.length > 0) {
        const firstId = String(all[0].id);
        setSelectedProjectId(firstId);
        await loadModulesForProject(firstId);
      }
    })();
  }, []);

  const loadModulesForProject = async (projectId: string) => {
    setLoading(true);
    const all = await db.getProjects();
    const proj = all.find((p: any) => String(p.id) === String(projectId));
    console.log(proj);
    let latestTimeline: any | null = null;
    if (proj?.projectTimeline?.length) {
      latestTimeline = proj.projectTimeline[proj.projectTimeline.length - 1];

      setTimelineInfo({
        status: latestTimeline.status ?? "",
        version: latestTimeline.version ?? "",
        updatedAt: latestTimeline.updatedAt ?? latestTimeline.createdAt ?? "",
      });
    } else {
      setTimelineInfo(null);
    }
    let modules: any[] = [];

    if (proj?.processedTimelineData?.length) {
      modules = proj.processedTimelineData;
    } else if (proj?.projectTimeline?.length) {
      const latest = proj.projectTimeline[proj.projectTimeline.length - 1];
      const timelineId = latest.timelineId || latest.versionId;
      if (timelineId) {
        const t = await db.getProjectTimelineById(timelineId);
        modules = Array.isArray(t) ? t : [];
      }
    }

    await buildPanelsFromModules(projectId, modules);
    setLoading(false);
  };

  const buildPanelsFromModules = async (projectId: string, modules: any[]) => {
    const budgets = await db.getActivityBudgetsForProject(projectId);
    const map = new Map<string, any>();
    budgets.forEach((b: any) => map.set(String(b.activityCode), b));

    const panels: ModulePanel[] = [];
    console.log(modules);


    modules.forEach((module: any, moduleIndex: number) => {
      const moduleName =
        module.moduleName || module.keyActivity || `Module ${moduleIndex + 1}`;
      const parentCode = module.parentModuleCode || module.Code || "";

      const rows: ActivityRow[] = (module.activities || []).map(
        (activity: any, actIndex: number) => {
          const code =
            activity.code || activity.guicode || `act-${moduleIndex}-${actIndex}`;
          const actName = activity.activityName || activity.keyActivity || "";
          const b = map.get(String(code));

          const history: RevisionEntry[] =
            b?.revisionHistory && Array.isArray(b.revisionHistory)
              ? b.revisionHistory
              : b?.revisedBudget && b?.revisedBudgetDate
                ? [
                  {
                    amount: b.revisedBudget,
                    date: b.revisedBudgetDate,
                  },
                ]
                : [];

          return {
            key: `activity-${moduleIndex}-${actIndex}`,
            SrNo: parentCode || "",
            Code: activity.code || "",
            keyActivity: actName,
            plannedStart: activity.start
              ? dayjs(activity.start).format("DD-MM-YYYY")
              : "-",
            plannedFinish: activity.end
              ? dayjs(activity.end).format("DD-MM-YYYY")
              : "-",
            activityCode: code,
            activityName: actName,
            originalBudget: b?.originalBudget ?? null,
            originalBudgetDate: b?.originalBudgetDate ?? null,
            revisedBudget: b?.revisedBudget ?? null,
            revisedBudgetDate: b?.revisedBudgetDate ?? null,
            revisionHistory: history,
          };
        }
      );

      panels.push({
        moduleKey: `module-${moduleIndex}`,
        moduleName,
        rows,
      });
    });

    setModulesPanels(panels);
    setExpandedKeys(panels.map((p) => p.moduleKey));
  };

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    await loadModulesForProject(projectId);
  };

  const handleOriginalBudgetChange = (rowKey: string, val: number | null) => {
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) =>
          r.key === rowKey ? { ...r, originalBudget: val } : r
        ),
      }))
    );
  };

  const handleOriginalBudgetBlur = async (row: ActivityRow, moduleName: string) => {
    if (!selectedProjectId) return;

    const hasExisting = !!row.originalBudgetDate;

    if (
      row.originalBudget === null ||
      row.originalBudget === undefined ||
      Number.isNaN(row.originalBudget)
    ) {
      if (hasExisting) {
        notify.warning("Budget ko delete karne ke liye Clear action use karein.");
        await loadModulesForProject(String(selectedProjectId));
      }
      return;
    }

    const now = new Date().toISOString();

    await db.upsertActivityBudget({
      projectId: String(selectedProjectId),
      activityCode: row.activityCode,
      activityName: row.activityName,
      moduleName,
      originalBudget: Number(row.originalBudget),
      originalBudgetDate: hasExisting ? row.originalBudgetDate || now : now,
      revisedBudget: row.revisedBudget ?? undefined,
      revisedBudgetDate: row.revisedBudgetDate ?? undefined,
      revisionHistory: row.revisionHistory ?? [],
    });

    // update originalBudgetDate in state, but NO toast here
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) =>
          r.key === row.key
            ? {
              ...r,
              originalBudgetDate: hasExisting ? r.originalBudgetDate || now : now,
            }
            : r
        ),
      }))
    );
  };

  const handleRevisedBudgetChange = (rowKey: string, val: number | null) => {
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) =>
          r.key === rowKey ? { ...r, revisedBudget: val } : r
        ),
      }))
    );
  };

  const handleRevisedBudgetBlur = async (row: ActivityRow, moduleName: string) => {
    if (!selectedProjectId) return;

    const now = new Date().toISOString();
    const hasExisting = !!row.revisedBudgetDate;

    if (
      row.revisedBudget === null ||
      row.revisedBudget === undefined ||
      Number.isNaN(row.revisedBudget)
    ) {
      if (hasExisting) {
        notify.warning(
          "Revised budget ko delete karne ke liye Clear action use karein."
        );
        await loadModulesForProject(String(selectedProjectId));
      }
      return;
    }

    const newHistory: RevisionEntry[] = [
      ...(row.revisionHistory || []),
      {
        amount: Number(row.revisedBudget),
        date: now,
      },
    ];

    await db.upsertActivityBudget({
      projectId: String(selectedProjectId),
      activityCode: row.activityCode,
      activityName: row.activityName,
      moduleName,
      originalBudget: row.originalBudget ?? undefined,
      originalBudgetDate: row.originalBudgetDate ?? undefined,
      revisedBudget: Number(row.revisedBudget),
      revisedBudgetDate: now,
      revisionHistory: newHistory,
    });

    // update state, but NO toast here
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) =>
          r.key === row.key
            ? {
              ...r,
              revisedBudgetDate: now,
              revisionHistory: newHistory,
            }
            : r
        ),
      }))
    );
  };

  const handleClearBudget = async (row: ActivityRow) => {
    if (!selectedProjectId) return;
    await db.deleteActivityBudget(String(selectedProjectId), row.activityCode);
    await loadModulesForProject(String(selectedProjectId));
    notify.success("Budget cleared");
  };

  const numericParser = (value: string | undefined): number => {
    const cleaned = (value || "").replace(/[^\d]/g, "");
    return cleaned ? Number(cleaned) : NaN;
  };

  const tableData: TableRow[] = useMemo(
    () =>
      modulesPanels.map((panel) => ({
        key: panel.moduleKey,
        SrNo: panel.rows[0]?.SrNo ?? "",
        Code: panel.rows[0]?.Code ?? "",
        keyActivity: panel.moduleName,
        plannedStart: "",
        plannedFinish: "",
        activityCode: "",
        activityName: "",
        originalBudget: null,
        revisedBudget: null,
        originalBudgetDate: null,
        revisedBudgetDate: null,
        revisionHistory: [],
        isModule: true,
        moduleName: panel.moduleName,
        children: panel.rows.map((row) => ({
          ...row,
          isModule: false,
          moduleName: panel.moduleName,
        })),
      })),
    [modulesPanels]
  );

  const renderColumns = (): ColumnsType<TableRow> => [
    {
      title: "odule Code",
      dataIndex: "SrNo",
      key: "SrNo",
      width: 120,
    },
    {
      title: "Activity Code",
      dataIndex: "Code",
      key: "Code",
      width: 120,
      render: (value, record) => (record.isModule ? "" : value),
    },
    {
      title: "Activity / Module",
      dataIndex: "keyActivity",
      key: "keyActivity",
      width: 250,
      render: (text, record) =>
        record.isModule ? <strong>{text}</strong> : text,
    },
    {
      title: "Planned Start",
      dataIndex: "plannedStart",
      key: "plannedStart",
      width: 120,
      render: (value, record) => (record.isModule ? "" : value),
    },
    {
      title: "Planned Finish",
      dataIndex: "plannedFinish",
      key: "plannedFinish",
      width: 120,
      render: (value, record) => (record.isModule ? "" : value),
    },
    {
      title: "Budget (₹)",
      key: "originalBudget",
      width: 140,
      render: (_: any, row: TableRow) =>
        row.isModule ? null : (
          <InputNumber<number>
            style={{ width: "100%" }}
            min={0}
            precision={0}
            parser={numericParser}
            value={row.originalBudget ?? undefined}
            disabled={!!row.originalBudgetDate}
            onChange={(v) => handleOriginalBudgetChange(row.key, v ?? null)}
            onBlur={() =>
              handleOriginalBudgetBlur(row, row.moduleName || "")
            }
          />
        ),
    },
    {
      title: "Revised Budget (₹)",
      key: "revisedBudget",
      width: 160,
      render: (_: any, row: TableRow) =>
        row.isModule ? null : (
          <InputNumber<number>
            style={{ width: "100%" }}
            min={0}
            precision={0}
            parser={numericParser}
            disabled={!row.originalBudgetDate}
            value={row.revisedBudget ?? undefined}
            onChange={(v) => handleRevisedBudgetChange(row.key, v ?? null)}
            onBlur={() =>
              handleRevisedBudgetBlur(row, row.moduleName || "")
            }
          />
        ),
    },
    {
      title: "Budgeted On",
      key: "budgetedOn",
      width: 120,
      render: (_: any, row: TableRow) =>
        row.isModule
          ? ""
          : row.originalBudgetDate
            ? dayjs(row.originalBudgetDate).format("DD-MM-YYYY")
            : "-",
    },
    {
      title: "Revised On",
      key: "revisedOn",
      width: 120,
      render: (_: any, row: TableRow) => {
        if (row.isModule) return "";
        const history = row.revisionHistory || [];
        if (history.length > 0) {
          const last = history[history.length - 1];
          return dayjs(last.date).format("DD-MM-YYYY");
        }
        if (row.revisedBudgetDate) {
          return dayjs(row.revisedBudgetDate).format("DD-MM-YYYY");
        }
        return "-";
      },
    },
    {
      title: "Action",
      key: "actions",
      width: 100,
      render: (_: any, row: TableRow) => {
        if (row.isModule) return null;
        const disabled = !row.originalBudgetDate && !row.revisedBudgetDate;
        return (
          <Popconfirm
            title="Clear budget?"
            description="For this activity all the budget will be delete! Are you sure?."
            onConfirm={() => handleClearBudget(row)}
            okText="Yes"
            cancelText="No"
            disabled={disabled}
          >
            <Button type="link" danger disabled={disabled}>
              Clear
            </Button>
          </Popconfirm>
        );
      },
    },
    {
      title: "Docs",
      key: "docs",
      width: 90,
      render: (_: any, row: TableRow) =>
        row.isModule ? null : (
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => openDocsModal(row)}
          >
            Docs
          </Button>
        ),
    },
  ];

  const handleSaveAll = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      for (const panel of modulesPanels) {
        for (const row of panel.rows) {
          // Only persist rows that have some budget info
          if (
            row.originalBudget != null ||
            row.revisedBudget != null ||
            (row.revisionHistory && row.revisionHistory.length > 0)
          ) {
            await db.upsertActivityBudget({
              projectId: String(selectedProjectId),
              activityCode: row.activityCode,
              activityName: row.activityName,
              moduleName: panel.moduleName,
              originalBudget:
                row.originalBudget != null
                  ? Number(row.originalBudget)
                  : undefined,
              originalBudgetDate: row.originalBudgetDate || undefined,
              revisedBudget:
                row.revisedBudget != null
                  ? Number(row.revisedBudget)
                  : undefined,
              revisedBudgetDate: row.revisedBudgetDate || undefined,
              revisionHistory: row.revisionHistory || [],
            });
          }
        }
      }
      notify.success("Budget saved");
    } finally {
      setLoading(false);
    }
  };

  const openDocsModal = async (row: TableRow) => {
    if (!selectedProjectId || row.isModule) return;

    const activityCode = row.activityCode;
    const activityName = row.activityName;
    const moduleName = row.moduleName || "";

    const docs = await db.getActivityBudgetDocs(
      String(selectedProjectId),
      activityCode
    );

    setDocModalActivity({ activityCode, activityName, moduleName });
    setDocModalDocs(docs);
    setDocName("");
    setDocFile(null);
    setDocModalVisible(true);
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setDocFile(f);
  };

  const handleSaveDoc = async () => {
    if (!selectedProjectId || !docModalActivity) {
      notify.error("Project / activity missing.");
      return;
    }
    const name = docName.trim();
    if (!name) {
      notify.error("Please enter document name.");
      return;
    }
    if (!docFile) {
      notify.error("Please select a file.");
      return;
    }

    try {
      const base64 = await readFileAsDataUrl(docFile);
      const path = `activity-budget/${selectedProjectId}/${docModalActivity.activityCode}/${Date.now()}-${docFile.name}`;

      await db.addDiskEntry(path, base64);

      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      const nowIso = new Date().toISOString();

      await db.addActivityBudgetDoc({
        projectId: String(selectedProjectId),
        activityCode: docModalActivity.activityCode,
        activityName: docModalActivity.activityName,
        moduleName: docModalActivity.moduleName,
        name,
        filePath: path,
        uploadedAt: nowIso,
        uploadedBy: user?.name || undefined,
      });

      const updated = await db.getActivityBudgetDocs(
        String(selectedProjectId),
        docModalActivity.activityCode
      );
      setDocModalDocs(updated);
      setDocName("");
      setDocFile(null);
      notify.success("Document saved.");
    } catch (e) {
      console.error(e);
      notify.error("Failed to save document.");
    }
  };

  const handlePreviewDoc = async (doc: ActivityBudgetDocument) => {
    const content = await db.getDiskEntry(doc.filePath);
    if (!content) {
      notify.error("File not found.");
      return;
    }
    setDocPreviewContent(content);
    setDocPreviewVisible(true);
  };

  const handleDownloadDoc = async (doc: ActivityBudgetDocument) => {
    const content = await db.getDiskEntry(doc.filePath);
    if (!content) {
      notify.error("File not found.");
      return;
    }
    downloadBase64File(content, doc.name || "document");
  };

  const handleDeleteDoc = async (doc: ActivityBudgetDocument) => {
    try {
      if (doc.id != null) {
        await db.deleteActivityBudgetDoc(doc.id);
      }
      if (doc.filePath) {
        await db.deleteDiskEntry(doc.filePath);
      }
      if (selectedProjectId && docModalActivity) {
        const updated = await db.getActivityBudgetDocs(
          String(selectedProjectId),
          docModalActivity.activityCode
        );
        setDocModalDocs(updated);
      }
      notify.success("Document deleted.");
    } catch (e) {
      console.error(e);
      notify.error("Failed to delete document.");
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const downloadBase64File = (base64: string, filename: string) => {
    try {
      const [meta, data] = base64.split(",");
      const mimeMatch = meta.match(/:(.*?);/);
      const mime = mimeMatch?.[1] || "application/octet-stream";

      const binary = atob(data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      notify.error("Failed to download file.");
    }
  };

  return (
    <div className="budget-main-container">
      <div className="budget-heading">
        <Text className="budget-title">Activity Budget</Text>

        <div className="budget-meta-row">
          <Space size={20} align="center">
            <Space>
              <Text className="meta-label">Project:</Text>
              <Select
                style={{ minWidth: 220 }}
                value={selectedProjectId ?? undefined}
                onChange={handleProjectChange}
              >
                {projects.map((p) => (
                  <Option key={p.id} value={String(p.id)}>
                    {p.projectParameters?.projectName || p.name}
                  </Option>
                ))}
              </Select>
            </Space>

            {timelineInfo && (
              <Space>
                <Text className="meta-label">Version:</Text>
                <Text className="meta-value">{timelineInfo.version}</Text>
              </Space>
            )}

            {timelineInfo && (
              <Space>
                <Text className="meta-label">Status:</Text>
                <Text className="meta-value">{timelineInfo.status}</Text>
              </Space>
            )}

            {timelineInfo && (
              <Space>
                <Text className="meta-label">Updated:</Text>
                <Text className="meta-value">
                  {dayjs(timelineInfo.updatedAt).format("DD-MM-YYYY HH:mm")}
                </Text>

              </Space>
            )}
          </Space>
        </div>
      </div>

      <div className="budget-table-container">
        <Table<TableRow>
          columns={renderColumns()}
          dataSource={tableData}
          rowKey="key"
          pagination={false}
          bordered
          loading={loading}
          size="small"
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpand: (expanded, record) => {
              setExpandedKeys((prev) =>
                expanded
                  ? [...prev, record.key]
                  : prev.filter((k) => k !== record.key)
              );
            },
            rowExpandable: (record: any) =>
              record.isModule && !!record.children?.length,
          }}
          rowClassName={(record) =>
            record.isModule ? "module-header" : "activity-row"
          }
          scroll={{ x: true, y: "calc(100vh - 260px)" }}
        />
      </div>

      <div className="budget-footer" style={{
        position: "absolute",
        bottom: "25px",
        right: "10px"
      }}
      >
        <Button type="primary" className="save-button"
          onClick={handleSaveAll}
          disabled={!selectedProjectId}
        >
          Save
        </Button>
      </div>
      
      <Modal
        open={docModalVisible}
        title={
          docModalActivity
            ? `Documents – ${docModalActivity.activityName} (${docModalActivity.activityCode})`
            : "Documents"
        }
        onCancel={() => setDocModalVisible(false)}
        footer={null}
        width="50%"
        className="modal-container"
      >
        <div className="" style={{ padding: "10px" }}>
          <Table<ActivityBudgetDocument>
            dataSource={docModalDocs}
            rowKey="id"
            size="small"
            pagination={false}
            bordered
            columns={[
              {
                title: "Name",
                dataIndex: "name",
                key: "name",
              },
              {
                title: "Uploaded At",
                dataIndex: "uploadedAt",
                key: "uploadedAt",
                width: 160,
                render: (val: string) =>
                  val ? dayjs(val).format("DD-MM-YYYY HH:mm") : "-",
              },
              {
                title: "Uploaded By",
                dataIndex: "uploadedBy",
                key: "uploadedBy",
                width: 140,
                render: (v: string) => v || "-",
              },
              {
                title: "Actions",
                key: "actions",
                width: 170,
                render: (_: any, rec: ActivityBudgetDocument) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreviewDoc(rec)}
                    />
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownloadDoc(rec)}
                    />
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteDoc(rec)}
                    />
                  </Space>
                ),
              },
            ]}
          />

          <div
            style={{
              marginTop: 16,
              borderTop: "1px solid #f0f0f0",
              paddingTop: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
              }}
            >
              <Input
                placeholder="Document name"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                style={{ flex: 3 }}
              />

              <Button
                icon={<UploadOutlined />}
                onClick={() =>
                  document.getElementById("activity-doc-file-input")?.click()
                }
                style={{ flex: 1 }}
              >
                {docFile ? "Change file" : "Choose file"}
              </Button>

              <span
                style={{
                  flex: 2,
                  fontSize: 12,
                  color: "#888",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {docFile ? docFile.name : "No file selected"}
              </span>

              <Button
                type="primary"
                size="small"
                onClick={handleSaveDoc}
                style={{ marginLeft: "auto" }}
              >
                Save
              </Button>
            </div>

            <input
              id="activity-doc-file-input"
              type="file"
              style={{ display: "none" }}
              onChange={handleDocFileChange}
            />
          </div>

        </div>
      </Modal>

      <Modal
        open={docPreviewVisible}
        onCancel={() => setDocPreviewVisible(false)}
        footer={null}
        width="80%"
        bodyStyle={{ height: "75vh" }}
        title="Preview Document"
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {docPreviewContent?.startsWith("data:application/pdf") ? (
            <iframe
              src={docPreviewContent}
              title="PDF Preview"
              style={{ border: "none", width: "100%", height: "100%" }}
            />
          ) : docPreviewContent?.startsWith("data:image/") ? (
            <img
              src={docPreviewContent}
              alt="Document Preview"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <p>Preview not available. Download to view.</p>
          )}
        </div>
      </Modal>

    </div>
  );
  <ToastContainer />
};

export default ActivityBudget;