import React, { useEffect, useState } from "react";
import {
  Collapse,
  Table,
  Select,
  InputNumber,
  Typography,
  Space,
  message,
  Button,
  Popconfirm,
} from "antd";
import dayjs from "dayjs";
import { db } from "../Utils/dataStorege";
import "../styles/activitybudget.css";
const { Panel } = Collapse;
const { Option } = Select;
const { Text } = Typography;

interface RevisionEntry {
  amount: number;
  date: string;
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

const ActivityBudget: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [modulesPanels, setModulesPanels] = useState<ModulePanel[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

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

  useEffect(() => {
    setActiveKeys(modulesPanels.map((p) => p.moduleKey));
  }, [modulesPanels]);

  const loadModulesForProject = async (projectId: string) => {
    setLoading(true);
    const all = await db.getProjects();
    const proj = all.find((p: any) => String(p.id) === String(projectId));
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
    budgets.forEach((b) => map.set(String(b.activityCode), b));

    const panels: ModulePanel[] = [];

    modules.forEach((module: any, moduleIndex: number) => {
      const moduleName = module.moduleName || module.keyActivity || `Module ${moduleIndex + 1}`;
      const parentCode = module.parentModuleCode || module.Code || "";

      const rows: ActivityRow[] = (module.activities || []).map((activity: any, actIndex: number) => {
        const code = activity.code || activity.guicode || `act-${moduleIndex}-${actIndex}`;
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
          plannedStart: activity.start ? dayjs(activity.start).format("DD-MM-YYYY") : "-",
          plannedFinish: activity.end ? dayjs(activity.end).format("DD-MM-YYYY") : "-",
          activityCode: code,
          activityName: actName,
          originalBudget: b?.originalBudget ?? null,
          originalBudgetDate: b?.originalBudgetDate ?? null,
          revisedBudget: b?.revisedBudget ?? null,
          revisedBudgetDate: b?.revisedBudgetDate ?? null,
          revisionHistory: history,
        };
      });

      panels.push({
        moduleKey: `module-${moduleIndex}`,
        moduleName,
        rows,
      });
    });

    setModulesPanels(panels);
  };

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    await loadModulesForProject(projectId);
  };

  const handleOriginalBudgetChange = (rowKey: string, val: number | null) => {
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) => (r.key === rowKey ? { ...r, originalBudget: val } : r)),
      }))
    );
  };

  const handleOriginalBudgetBlur = async (row: ActivityRow, moduleName: string) => {
    if (!selectedProjectId) return;

    const hasExisting = !!row.originalBudgetDate;

    if (row.originalBudget === null || row.originalBudget === undefined || Number.isNaN(row.originalBudget)) {
      if (hasExisting) {
        message.warning("Budget ko delete karne ke liye Clear action use karein.");
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

    message.success("Budget saved");
  };

  const handleRevisedBudgetChange = (rowKey: string, val: number | null) => {
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) => (r.key === rowKey ? { ...r, revisedBudget: val } : r)),
      }))
    );
  };

  const handleRevisedBudgetBlur = async (row: ActivityRow, moduleName: string) => {
    if (!selectedProjectId) return;

    const now = new Date().toISOString();
    const hasExisting = !!row.revisedBudgetDate;

    if (row.revisedBudget === null || row.revisedBudget === undefined || Number.isNaN(row.revisedBudget)) {
      if (hasExisting) {
        message.warning("Revised budget ko delete karne ke liye Clear action use karein.");
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

    message.success("Revised budget saved");
  };

  const handleClearBudget = async (row: ActivityRow) => {
    if (!selectedProjectId) return;
    await db.deleteActivityBudget(String(selectedProjectId), row.activityCode);
    await loadModulesForProject(String(selectedProjectId));
    message.success("Budget cleared");
  };

  const numericParser = (value: string | undefined): number => {
    const cleaned = (value || "").replace(/[^\d]/g, "");
    return cleaned ? Number(cleaned) : NaN;
  };

  const renderColumns = (moduleName: string) => [
    {
      title: "Sr No / Module Code",
      dataIndex: "SrNo",
      key: "SrNo",
      width: "10%",
    },
    {
      title: "Activity Code",
      dataIndex: "Code",
      key: "Code",
      width: "10%",
    },
    {
      title: "Activity",
      dataIndex: "keyActivity",
      key: "keyActivity",
      width: "20%",
    },
    {
      title: "Planned Start",
      dataIndex: "plannedStart",
      key: "plannedStart",
      width: "10%",
    },
    {
      title: "Planned Finish",
      dataIndex: "plannedFinish",
      key: "plannedFinish",
      width: "10%",
    },
    {
      title: "Budget (₹)",
      key: "originalBudget",
      width: "10%",
      render: (_: any, row: ActivityRow) => (
        <InputNumber<number>
          style={{ width: "100%" }}
          min={0}
          precision={0}
          parser={numericParser}
          value={row.originalBudget ?? undefined}
          disabled={!!row.originalBudgetDate}
          onChange={(v) => handleOriginalBudgetChange(row.key, v ?? null)}
          onBlur={() => handleOriginalBudgetBlur(row, moduleName)}
        />
      ),
    },
    {
      title: "Revised Budget (₹)",
      key: "revisedBudget",
      width: "10%",
      render: (_: any, row: ActivityRow) => (
        <InputNumber<number>
          style={{ width: "100%" }}
          min={0}
          precision={0}
          parser={numericParser}
          disabled={!row.originalBudgetDate}
          value={row.revisedBudget ?? undefined}
          onChange={(v) => handleRevisedBudgetChange(row.key, v ?? null)}
          onBlur={() => handleRevisedBudgetBlur(row, moduleName)}
        />
      ),
    },
    {
      title: "Budgeted On",
      key: "budgetedOn",
      width: "10%",
      render: (_: any, row: ActivityRow) =>
        row.originalBudgetDate ? dayjs(row.originalBudgetDate).format("DD-MM-YYYY") : "-",
    },
    {
      title: "Revised On",
      key: "revisedOn",
      width: "10%",
      render: (_: any, row: ActivityRow) => {
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
      width: "10%",
      render: (_: any, row: ActivityRow) => {
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
  ];

  return (
    <div className="budget-main-container">
      <div className="budget-heading ">
        <Text className="budget-title">Activity Budget</Text>
        <Space>
          <Text>Select Project:</Text>
          <Select
            style={{ minWidth: 260 }}
            value={selectedProjectId ?? undefined}
            onChange={handleProjectChange}
            showSearch
            optionFilterProp="children"
          >
            {projects.map((p) => (
              <Option key={p.id} value={String(p.id)}>
                {p.projectParameters?.projectName || p.name || `Project ${p.id}`}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      <Collapse
        activeKey={activeKeys}
        onChange={(keys) =>
          setActiveKeys(Array.isArray(keys) ? (keys as string[]) : [keys as string])
        }
      >
        {modulesPanels.map((panel) => (
          <Panel header={panel.moduleName} key={panel.moduleKey}>
            <Table
              columns={renderColumns(panel.moduleName)}
              dataSource={panel.rows}
              rowKey="key"
              pagination={false}
              bordered
              loading={loading}
              size="small"
            />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default ActivityBudget;