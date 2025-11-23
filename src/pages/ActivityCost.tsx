import React, { useEffect, useState } from "react";
import { Collapse, Table, Select, InputNumber, Typography, Space, message } from "antd";
import dayjs from "dayjs";
import { db } from "../Utils/dataStorege";
import type { ActivityCost } from "../Utils/dataStorege";
import "../styles/activitycost.css";

const { Panel } = Collapse;
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
}

interface ModulePanel {
  moduleKey: string;
  moduleName: string;
  rows: ActivityRow[];
}

const ActivityCost: React.FC = () => {
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
    const costs = await db.getActivityCostsForProject(projectId);
    const map = new Map<string, ActivityCost>();
    costs.forEach((c) => map.set(String(c.activityCode), c));

    const panels: ModulePanel[] = [];

    modules.forEach((module: any, moduleIndex: number) => {
      const moduleName = module.moduleName || module.keyActivity || `Module ${moduleIndex + 1}`;
      const parentCode = module.parentModuleCode || module.Code || "";

      const rows: ActivityRow[] = (module.activities || []).map((activity: any, actIndex: number) => {
        const code = activity.code || activity.guicode || `act-${moduleIndex}-${actIndex}`;
        const actName = activity.activityName || activity.keyActivity || "";
        const c = map.get(String(code));

        return {
          key: `activity-${moduleIndex}-${actIndex}`,
          SrNo: parentCode || "",
          Code: activity.code || "",
          keyActivity: actName,
          plannedStart: activity.start ? dayjs(activity.start).format("DD-MM-YYYY") : "-",
          plannedFinish: activity.end ? dayjs(activity.end).format("DD-MM-YYYY") : "-",
          activityCode: code,
          activityName: actName,
          projectCost: c?.projectCost ?? null,
          opportunityCost: c?.opportunityCost ?? null,
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

  const handleProjectCostChange = (rowKey: string, val: number | null) => {
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) => (r.key === rowKey ? { ...r, projectCost: val } : r)),
      }))
    );
  };

  const handleOpportunityCostChange = (rowKey: string, val: number | null) => {
    setModulesPanels((prev) =>
      prev.map((p) => ({
        ...p,
        rows: p.rows.map((r) => (r.key === rowKey ? { ...r, opportunityCost: val } : r)),
      }))
    );
  };

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
        message.success("Cost cleared");
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

    message.success("Project cost saved");
  };

  const handleOpportunityCostBlur = async (row: ActivityRow, moduleName: string) => {
    if (!selectedProjectId) return;

    if (
      row.opportunityCost === null ||
      row.opportunityCost === undefined ||
      Number.isNaN(row.opportunityCost)
    ) {
      if (row.projectCost == null || Number.isNaN(row.projectCost)) {
        await db.deleteActivityCost(String(selectedProjectId), row.activityCode);
        await loadModulesForProject(String(selectedProjectId));
        message.success("Cost cleared");
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

    message.success("Opportunity cost saved");
  };

//   const handleClearCost = async (row: ActivityRow) => {
//     if (!selectedProjectId) return;
//     await db.deleteActivityCost(String(selectedProjectId), row.activityCode);
//     await loadModulesForProject(String(selectedProjectId));
//     message.success("Cost cleared");
//   };

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
      title: "Project Cost (₹)",
      key: "projectCost",
      width: "15%",
      render: (_: any, row: ActivityRow) => (
        <InputNumber<number>
          style={{ width: "100%" }}
          min={0}
          precision={0}
          parser={numericParser}
          value={row.projectCost ?? undefined}
          onChange={(v) => handleProjectCostChange(row.key, v ?? null)}
          onBlur={() => handleProjectCostBlur(row, moduleName)}
        />
      ),
    },
    {
      title: "Opportunity Cost (₹)",
      key: "opportunityCost",
      width: "15%",
      render: (_: any, row: ActivityRow) => (
        <InputNumber<number>
          style={{ width: "100%" }}
          min={0}
          precision={0}
          parser={numericParser}
          value={row.opportunityCost ?? undefined}
          onChange={(v) => handleOpportunityCostChange(row.key, v ?? null)}
          onBlur={() => handleOpportunityCostBlur(row, moduleName)}
        />
      ),
    },
    // {
    //   title: "Action",
    //   key: "actions",
    //   width: "10%",
    //   render: (_: any, row: ActivityRow) => {
    //     const disabled =
    //       (row.projectCost == null || Number.isNaN(row.projectCost)) &&
    //       (row.opportunityCost == null || Number.isNaN(row.opportunityCost));
    //     return (
    //       <Popconfirm
    //         title="Clear cost?"
    //         description="For this activity project & opportunity cost will be deleted. Are you sure?"
    //         onConfirm={() => handleClearCost(row)}
    //         okText="Yes"
    //         cancelText="No"
    //         disabled={disabled}
    //       >
    //         <Button type="link" danger disabled={disabled}>
    //           Clear
    //         </Button>
    //       </Popconfirm>
    //     );
    //   },
    // },
  ];

  return (
    <div className="activity-main-container">
      <div className="activity-heading ">
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

export default ActivityCost;