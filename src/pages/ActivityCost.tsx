import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Select,
  InputNumber,
  Typography,
  Space,
  Spin,
  Button,
} from "antd";
import dayjs from "dayjs";
import { db } from "../Utils/dataStorege";
import type { ActivityCost } from "../Utils/dataStorege";
import "../styles/activitycost.css";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify";

const { Option } = Select;
const { Text } = Typography;

interface ActivityRow {
  key: string;
  SrNo: string | number | null;
  Code: string | null;
  keyActivity: string;
  plannedStart: string;
  plannedFinish: string;
  activityCode: string;
  activityName: string;

  projectCost?: number | null;
  opportunityCost?: number | null;

  // layout flags
  moduleName?: string;
  isModule?: boolean;
  children?: ActivityRow[];
}

interface ModulePanel {
  moduleKey: string;
  moduleName: string;
  rows: ActivityRow[];
}

const ActivityCost: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [modulesPanels, setModulesPanels] = useState<ModulePanel[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [savingAll, setSavingAll] = useState(false);

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

  // keep all modules expanded (like ProjectTimeline)
  useEffect(() => {
    setExpandedKeys(modulesPanels.map((p) => p.moduleKey));
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

  const buildPanelsFromModules = async (
    projectId: string,
    modules: any[]
  ) => {
    const costs = await db.getActivityCostsForProject(projectId);
    const map = new Map<string, ActivityCost>();
    costs.forEach((c) => map.set(String(c.activityCode), c));

    const panels: ModulePanel[] = [];

    modules.forEach((module: any, moduleIndex: number) => {
      const moduleName =
        module.moduleName || module.keyActivity || `Module ${moduleIndex + 1}`;
      const parentCode = module.parentModuleCode || module.Code || "";

      const rows: ActivityRow[] = (module.activities || []).map(
        (activity: any, actIndex: number) => {
          const code =
            activity.code || activity.guicode || `act-${moduleIndex}-${actIndex}`;
          const actName = activity.activityName || activity.keyActivity || "";
          const c = map.get(String(code));

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
            projectCost: c?.projectCost ?? null,
            opportunityCost: c?.opportunityCost ?? null,
            moduleName,
            isModule: false,
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
  };

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    await loadModulesForProject(projectId);
  };

  const handleProjectCostChange = (rowKey: string, val: number | null) => {
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) =>
          r.key === rowKey ? { ...r, projectCost: val } : r
        ),
      }))
    );
  };

  const handleOpportunityCostChange = (rowKey: string, val: number | null) => {
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) =>
          r.key === rowKey ? { ...r, opportunityCost: val } : r
        ),
      }))
    );
  };

  // keep save on focusout, but NO toaster here
  const handleProjectCostBlur = async (row: ActivityRow, moduleName: string) => {
    if (!selectedProjectId) return;

    if (
      row.projectCost === null ||
      row.projectCost === undefined ||
      Number.isNaN(row.projectCost)
    ) {
      // if both costs empty -> delete record
      if (row.opportunityCost == null || Number.isNaN(row.opportunityCost)) {
        await db.deleteActivityCost(String(selectedProjectId), row.activityCode);
        await loadModulesForProject(String(selectedProjectId));
      }
      return;
    }

    await db.upsertActivityCost({
      projectId: String(selectedProjectId),
      activityCode: row.activityCode,
      activityName: row.activityName,
      moduleName,
      projectCost: Number(row.projectCost),
      opportunityCost:
        row.opportunityCost != null && !Number.isNaN(row.opportunityCost)
          ? Number(row.opportunityCost)
          : undefined,
    });
  };

  const handleOpportunityCostBlur = async (
    row: ActivityRow,
    moduleName: string
  ) => {
    if (!selectedProjectId) return;

    if (
      row.opportunityCost === null ||
      row.opportunityCost === undefined ||
      Number.isNaN(row.opportunityCost)
    ) {
      if (row.projectCost == null || Number.isNaN(row.projectCost)) {
        await db.deleteActivityCost(String(selectedProjectId), row.activityCode);
        await loadModulesForProject(String(selectedProjectId));
      }
      return;
    }

    await db.upsertActivityCost({
      projectId: String(selectedProjectId),
      activityCode: row.activityCode,
      activityName: row.activityName,
      moduleName,
      projectCost:
        row.projectCost != null && !Number.isNaN(row.projectCost)
          ? Number(row.projectCost)
          : undefined,
      opportunityCost: Number(row.opportunityCost),
    });
  };

  const numericParser = (value: string | undefined): number => {
    const cleaned = (value || "").replace(/[^\d]/g, "");
    return cleaned ? Number(cleaned) : NaN;
  };

  // Build table data: parent (module) + children (activities)
  const tableData: any[] = useMemo(
    () =>
      modulesPanels.map((panel) => ({
        key: panel.moduleKey,
        SrNo: panel.rows[0]?.SrNo || "",
        Code: panel.rows[0]?.SrNo || "",
        keyActivity: panel.moduleName,
        plannedStart: "",
        plannedFinish: "",
        activityCode: "",
        activityName: "",
        projectCost: null,
        opportunityCost: null,
        moduleName: panel.moduleName,
        isModule: true,
        children: panel.rows,
      })),
    [modulesPanels]
  );

  const columns = [
    {
      title: "Sr No / Module Code",
      dataIndex: "SrNo",
      key: "SrNo",
      width: "10%",
      render: (text: any, record: ActivityRow) =>
        record.isModule ? <b>{text}</b> : text,
    },
    {
      title: "Activity Code",
      dataIndex: "Code",
      key: "Code",
      width: "10%",
      render: (text: any, record: ActivityRow) =>
        record.isModule ? "" : text,
    },
    {
      title: "Activity / Module",
      dataIndex: "keyActivity",
      key: "keyActivity",
      width: "20%",
      render: (text: any, record: ActivityRow) =>
        record.isModule ? (
          <span className="module-title-cell">{text}</span>
        ) : (
          text
        ),
    },
    {
      title: "Planned Start",
      dataIndex: "plannedStart",
      key: "plannedStart",
      width: "10%",
      render: (text: any, record: ActivityRow) =>
        record.isModule ? "" : text,
    },
    {
      title: "Planned Finish",
      dataIndex: "plannedFinish",
      key: "plannedFinish",
      width: "10%",
      render: (text: any, record: ActivityRow) =>
        record.isModule ? "" : text,
    },
    {
      title: "Project Cost (₹)",
      key: "projectCost",
      width: "15%",
      render: (_: any, row: ActivityRow) =>
        row.isModule ? null : (
          <InputNumber<number>
            style={{ width: "100%" }}
            min={0}
            precision={0}
            parser={numericParser}
            value={row.projectCost ?? undefined}
            onChange={(v) => handleProjectCostChange(row.key, v ?? null)}
            onBlur={() => handleProjectCostBlur(row, row.moduleName || "")}
          />
        ),
    },
    {
      title: "Opportunity Cost (₹)",
      key: "opportunityCost",
      width: "15%",
      render: (_: any, row: ActivityRow) =>
        row.isModule ? null : (
          <InputNumber<number>
            style={{ width: "100%" }}
            min={0}
            precision={0}
            parser={numericParser}
            value={row.opportunityCost ?? undefined}
            onChange={(v) => handleOpportunityCostChange(row.key, v ?? null)}
            onBlur={() => handleOpportunityCostBlur(row, row.moduleName || "")}
          />
        ),
    },
  ];

  // Bottom-right Save button: explicitly save everything & show toaster
  const handleSaveAll = async () => {
    if (!selectedProjectId) return;
    setSavingAll(true);

    try {
      const ops: Promise<any>[] = [];

      modulesPanels.forEach((panel) => {
        panel.rows.forEach((row) => {
          const bothEmpty =
            (row.projectCost == null || Number.isNaN(row.projectCost)) &&
            (row.opportunityCost == null ||
              Number.isNaN(row.opportunityCost));

          if (bothEmpty) {
            // delete
            ops.push(
              db.deleteActivityCost(String(selectedProjectId), row.activityCode)
            );
          } else {
            // upsert
            ops.push(
              db.upsertActivityCost({
                projectId: String(selectedProjectId),
                activityCode: row.activityCode,
                activityName: row.activityName,
                moduleName: row.moduleName || "",
                projectCost:
                  row.projectCost != null && !Number.isNaN(row.projectCost)
                    ? Number(row.projectCost)
                    : undefined,
                opportunityCost:
                  row.opportunityCost != null &&
                    !Number.isNaN(row.opportunityCost)
                    ? Number(row.opportunityCost)
                    : undefined,
              })
            );
          }
        });
      });

      await Promise.all(ops);
      notify.success("Activity cost saved");
      await loadModulesForProject(String(selectedProjectId));
    } catch (err) {
      console.error(err);
      notify.error("Failed to save activity cost");
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div className="activity-main-container">
      <div className="activity-heading">
        <Text className="activity-title">Activity Cost</Text>
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
                {p.projectParameters?.projectName ||
                  p.name ||
                  `Project ${p.id}`}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      {loading && modulesPanels.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Spin />
        </div>
      ) : (
        <>
          <div className="activity-table-wrapper">
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey="key"
              pagination={false}
              bordered
              loading={loading}
              size="small"
              expandable={{
                expandedRowKeys: expandedKeys,
                onExpand: (expanded, record: any) => {
                  if (expanded) {
                    setExpandedKeys((prev) => [...prev, record.key]);
                  } else {
                    setExpandedKeys((prev) =>
                      prev.filter((k) => k !== record.key)
                    );
                  }
                },
                rowExpandable: (record: any) =>
                  Array.isArray(record.children) &&
                  record.children.length > 0,
                expandIconColumnIndex: 0,
              }}
              rowClassName={(record: any) =>
                record.isModule ? "module-header-row" : "activity-row"
              }
              scroll={{ x: true, y: "calc(100vh - 260px)" }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "25px",
              right: "10px"
            }}
          >
            <Button type="primary" className="save-button"
              onClick={handleSaveAll}
              loading={savingAll}
            >
              Save
            </Button>
          </div>
        </>
      )}
       <ToastContainer />
    </div>
  );
};

export default ActivityCost;