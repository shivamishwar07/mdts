import React, { useEffect, useState } from "react";
import {
    Table,
    Select,
    Typography,
    Space,
    InputNumber,
    message,
} from "antd";
import dayjs from "dayjs";
import { db } from "../Utils/dataStorege";
import "../styles/activitybudget.css";

const { Text } = Typography;
const { Option } = Select;

interface CommercialActivityRow {
    key: string;
    projectId: string;

    moduleCode?: string;
    moduleName?: string;

    activityCode: string;
    activityName: string;

    plannedStart?: string | null;
    plannedFinish?: string | null;

    actualStart?: string | null;
    actualFinish?: string | null;

    commercialUndertaken: boolean;
    leadTimeDays: number | null;
    orderProcessingStatus: string;
}

const ORDER_STATUS_OPTIONS = [
    "Yet to Start",
    "RFP Processed",
    "Bidding/Reverse Auction Conducted",
    "PO Processed",
    "Quote Comparison Done",
];

const CommercialActivityPlanner: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [rows, setRows] = useState<CommercialActivityRow[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const all = await db.getProjects();
            setProjects(all || []);
            if (all && all.length > 0) {
                const firstId = String(all[0].id);
                setSelectedProjectId(firstId);
                await loadRowsForProject(firstId);
            }
        })();
    }, []);

    const loadRowsForProject = async (projectId: string) => {
        setLoading(true);

        const all = await db.getProjects();
        const proj = all.find((p: any) => String(p.id) === String(projectId));

        if (!proj) {
            setRows([]);
            setLoading(false);
            return;
        }

        let timelineId: number | string | undefined;

        if (Array.isArray(proj.projectTimeline) && proj.projectTimeline.length > 0) {
            const latest = proj.projectTimeline[proj.projectTimeline.length - 1];
            timelineId = latest.timelineId || latest.versionId || latest.id;
        }

        if (!timelineId) {
            setRows([]);
            setLoading(false);
            return;
        }

        const timelineData = await db.getProjectTimelineById(timelineId);

        let modules: any[] = [];

        if (Array.isArray(timelineData)) {
            modules = timelineData;
        } else if (timelineData && Array.isArray(timelineData.modules)) {
            modules = timelineData.modules;
        } else if (timelineData && Array.isArray(timelineData.activities)) {
            modules = [timelineData];
        }

        const budgets = await db.getActivityBudgetsForProject(String(projectId));
        const budgetMap = new Map<string, any>();
        budgets.forEach((b: any) => {
            if (b.originalBudget != null) {
                budgetMap.set(String(b.activityCode), b);
            }
        });

        const existingCommercial = await db.getCommercialActivitiesForProject(
            String(projectId)
        );
        const commercialMap = new Map<string, any>();
        existingCommercial.forEach((c) => {
            commercialMap.set(String(c.activityCode), c);
        });

        const flatRows: CommercialActivityRow[] = [];

        modules.forEach((module: any, moduleIndex: number) => {
            const moduleName =
                module.moduleName || module.keyActivity || `Module ${moduleIndex + 1}`;
            const moduleCode = module.parentModuleCode || module.Code || "";

            (module.activities || []).forEach((activity: any, actIndex: number) => {
                const code =
                    activity.code || activity.guicode || `act-${moduleIndex}-${actIndex}`;
                const budget = budgetMap.get(String(code));
                if (!budget) return;

                const existing = commercialMap.get(String(code));
                const plannedStartIso: string | null =
                    activity.start || activity.plannedStart || null;
                const plannedFinishIso: string | null =
                    activity.end || activity.plannedFinish || null;

                flatRows.push({
                    key: `${projectId}-${code}`,
                    projectId: String(projectId),

                    moduleCode: moduleCode || undefined,
                    moduleName,

                    activityCode: String(code),
                    activityName: activity.activityName || activity.keyActivity || "",

                    plannedStart: existing?.plannedStart ?? plannedStartIso,
                    plannedFinish: existing?.plannedFinish ?? plannedFinishIso,

                    actualStart: existing?.actualStart ?? activity.actualStart ?? null,
                    actualFinish: existing?.actualFinish ?? activity.actualFinish ?? null,

                    commercialUndertaken: existing?.commercialUndertaken ?? false,
                    leadTimeDays:
                        existing?.leadTimeDays !== undefined ? existing.leadTimeDays : null,
                    orderProcessingStatus: existing?.orderProcessingStatus || "Yet to Start",
                });
            });
        });

        setRows(flatRows);
        setLoading(false);
    };

    const handleProjectChange = async (projectId: string) => {
        setSelectedProjectId(projectId);
        await loadRowsForProject(projectId);
    };

    const updateRow = (key: string, partial: Partial<CommercialActivityRow>) => {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...partial } : r)));
    };

    const persistRow = async (row: CommercialActivityRow) => {
        await db.upsertCommercialActivity({
            projectId: row.projectId,
            moduleCode: row.moduleCode,
            moduleName: row.moduleName,
            activityCode: row.activityCode,
            activityName: row.activityName,
            plannedStart: row.plannedStart ?? null,
            plannedFinish: row.plannedFinish ?? null,
            actualStart: row.actualStart ?? null,
            actualFinish: row.actualFinish ?? null,
            commercialUndertaken: row.commercialUndertaken,
            leadTimeDays: row.leadTimeDays,
            orderProcessingStatus: row.orderProcessingStatus,
        });
        message.success("Commercial activity details saved");
    };

    const handleCommercialUndertakenChange = (
        row: CommercialActivityRow,
        value: "Yes" | "No"
    ) => {
        const undertaken = value === "Yes";
        const updated: CommercialActivityRow = {
            ...row,
            commercialUndertaken: undertaken,
            leadTimeDays: undertaken ? row.leadTimeDays : null,
            orderProcessingStatus: undertaken
                ? row.orderProcessingStatus || "Yet to Start"
                : "Yet to Start",
        };
        updateRow(row.key, updated);
        void persistRow(updated);
    };

    const handleLeadTimeChange = (
        row: CommercialActivityRow,
        value: number | null
    ) => {
        const updated: CommercialActivityRow = {
            ...row,
            leadTimeDays: value ?? null,
        };
        updateRow(row.key, updated);
        void persistRow(updated);
    };

    const handleOrderStatusChange = (row: CommercialActivityRow, value: string) => {
        const updated: CommercialActivityRow = {
            ...row,
            orderProcessingStatus: value,
        };
        updateRow(row.key, updated);
        void persistRow(updated);
    };

    const columns = [
        {
            title: "Module",
            dataIndex: "moduleName",
            key: "moduleName",
            width: "15%",
        },
        {
            title: "Activity",
            dataIndex: "activityName",
            key: "activityName",
            width: "20%",
        },
        {
            title: "Planned Start",
            dataIndex: "plannedStart",
            key: "plannedStart",
            width: "10%",
            render: (val: string | null | undefined) =>
                val ? dayjs(val).format("DD-MM-YYYY") : "-",
        },
        {
            title: "Planned Finish",
            dataIndex: "plannedFinish",
            key: "plannedFinish",
            width: "10%",
            render: (val: string | null | undefined) =>
                val ? dayjs(val).format("DD-MM-YYYY") : "-",
        },
        {
            title: "Actual Start",
            dataIndex: "actualStart",
            key: "actualStart",
            width: "10%",
            render: (val: string | null | undefined) =>
                val ? dayjs(val).format("DD-MM-YYYY") : "-",
        },
        {
            title: "Actual Finish",
            dataIndex: "actualFinish",
            key: "actualFinish",
            width: "10%",
            render: (val: string | null | undefined) =>
                val ? dayjs(val).format("DD-MM-YYYY") : "-",
        },
        {
            title: "Commercial Activity Undertaken",
            key: "commercialUndertaken",
            width: "12%",
            render: (_: any, row: CommercialActivityRow) => (
                <Select
                    value={row.commercialUndertaken ? "Yes" : "No"}
                    style={{ width: "100%" }}
                    onChange={(val: "Yes" | "No") =>
                        handleCommercialUndertakenChange(row, val)
                    }
                >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                </Select>
            ),
        },
        {
            title: "Lead Time (Days)",
            key: "leadTime",
            width: "10%",
            render: (_: any, row: CommercialActivityRow) => (
                <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    precision={0}
                    disabled={!row.commercialUndertaken}
                    value={row.leadTimeDays ?? undefined}
                    onChange={(val) => handleLeadTimeChange(row, val as number | null)}
                />
            ),
        },
        {
            title: "Order Processing Status",
            key: "orderProcessingStatus",
            width: "15%",
            render: (_: any, row: CommercialActivityRow) => (
                <Select
                    style={{ width: "100%" }}
                    disabled={!row.commercialUndertaken}
                    value={row.orderProcessingStatus || "Yet to Start"}
                    onChange={(val: string) => handleOrderStatusChange(row, val)}
                >
                    {ORDER_STATUS_OPTIONS.map((s) => (
                        <Option key={s} value={s}>
                            {s}
                        </Option>
                    ))}
                </Select>
            ),
        },
    ];

    return (
        <div className="budget-main-container">
            <div className="budget-heading ">
                <Text className="budget-title">Commercial Activity Planner</Text>
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

            <Table
                columns={columns}
                dataSource={rows}
                rowKey="key"
                pagination={false}
                bordered
                loading={loading}
                size="small"
            />
        </div>
    );
};

export default CommercialActivityPlanner;