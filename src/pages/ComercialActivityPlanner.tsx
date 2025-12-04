import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    Select,
    Typography,
    Space,
    InputNumber,
    Button,
} from "antd";
import dayjs from "dayjs";
import { db } from "../Utils/dataStorege";
import "../styles/activitybudget.css";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify";

const { Text } = Typography;
const { Option } = Select;

interface TimelineInfo {
    status: string;
    version: string;
    updatedAt: string;
}

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
    budgetAmount?: number | null;
    isModule?: boolean;
    children?: CommercialActivityRow[];
}

// const ORDER_STATUS_OPTIONS = [
//     "Yet to Start",
//     "RFP Processed",
//     "Bidding/Reverse Auction Conducted",
//     "PO Processed",
//     "Quote Comparison Done",
// ];

interface RevisionEntry {
    amount: number;
    date: string;
}

const CommercialActivityPlanner: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [rows, setRows] = useState<CommercialActivityRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [timelineInfo, setTimelineInfo] = useState<TimelineInfo | null>(null);

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

            setTimelineInfo({
                status: latest.status ?? "",
                version: latest.version ?? "",
                updatedAt: latest.updatedAt ?? latest.createdAt ?? "",
            });
        } else {
            setTimelineInfo(null);
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
            const history: RevisionEntry[] = Array.isArray(b.revisionHistory)
                ? b.revisionHistory
                : [];

            const last = history.length > 0 ? history[history.length - 1] : null;
            const currentBudget =
                (last?.amount ?? null) ??
                (typeof b.originalBudget === "number" ? b.originalBudget : null) ??
                (typeof b.totalBudget === "number" ? b.totalBudget : null) ??
                (typeof b.budgetAmount === "number" ? b.budgetAmount : null);

            if (currentBudget != null) {
                budgetMap.set(String(b.activityCode), {
                    ...b,
                    currentBudget,
                });
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

                const budgetAmount: number | null =
                    typeof budget.currentBudget === "number"
                        ? budget.currentBudget
                        : (
                            budget.originalBudget ??
                            budget.totalBudget ??
                            budget.budgetAmount ??
                            null
                        );


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
                    budgetAmount,
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

    // const handleOrderStatusChange = (row: CommercialActivityRow, value: string) => {
    //     const updated: CommercialActivityRow = {
    //         ...row,
    //         orderProcessingStatus: value,
    //     };
    //     updateRow(row.key, updated);
    //     void persistRow(updated);
    // };

    const numericParser = (value: string | undefined): number => {
        const cleaned = (value || "").replace(/[^\d]/g, "");
        return cleaned ? Number(cleaned) : NaN;
    };

    const tableData: CommercialActivityRow[] = useMemo(() => {
        const groups = new Map<
            string,
            { moduleName: string | undefined; moduleCode: string | undefined; rows: CommercialActivityRow[] }
        >();

        rows.forEach((r) => {
            const key = `${r.moduleCode || ""}::${r.moduleName || ""}`;
            if (!groups.has(key)) {
                groups.set(key, {
                    moduleName: r.moduleName,
                    moduleCode: r.moduleCode,
                    rows: [],
                });
            }
            groups.get(key)!.rows.push(r);
        });

        const parents: CommercialActivityRow[] = [];
        let idx = 0;
        groups.forEach((group, key) => {
            parents.push({
                key: `module-${idx}-${key}`,
                projectId: selectedProjectId || "",
                moduleCode: group.moduleCode,
                moduleName: group.moduleName,
                activityCode: "",
                activityName: "",
                plannedStart: null,
                plannedFinish: null,
                actualStart: null,
                actualFinish: null,
                commercialUndertaken: false,
                leadTimeDays: null,
                orderProcessingStatus: "",
                isModule: true,
                children: group.rows,
                budgetAmount: null,
            });
            idx++;
        });

        return parents;
    }, [rows, selectedProjectId]);

    useEffect(() => {
        setExpandedKeys(tableData.map((p) => p.key));
    }, [tableData]);

    const handleSaveAll = async () => {
        for (const row of rows) {
            await persistRow(row);
        }
        notify.success("Commercial activity details saved");
    };

    const columns = [
        {
            title: "Module",
            dataIndex: "moduleName",
            key: "moduleName",
            width: "8%",
            render: (_: any, row: CommercialActivityRow) =>
                row.isModule ? <b>{row.moduleName}</b> : row.moduleName,
        },
        {
            title: "Activity",
            dataIndex: "activityName",
            key: "activityName",
            width: "20%",
            render: (val: string, row: CommercialActivityRow) =>
                row.isModule ? "" : val,
        },
        {
            title: "Budget (₹)",
            dataIndex: "budgetAmount",
            key: "budgetAmount",
            width: "8%",
            align: "right" as const,
            render: (val: number | null | undefined, row: CommercialActivityRow) =>
                row.isModule
                    ? ""
                    : val != null
                        ? val.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                        })
                        : "-",
        },
        {
            title: "Planned Start",
            dataIndex: "plannedStart",
            key: "plannedStart",
            width: "10%",
            render: (val: string | null | undefined, row: CommercialActivityRow) =>
                row.isModule ? "" : val ? dayjs(val).format("DD-MM-YYYY") : "-",
        },
        {
            title: "Planned Finish",
            dataIndex: "plannedFinish",
            key: "plannedFinish",
            width: "10%",
            render: (val: string | null | undefined, row: CommercialActivityRow) =>
                row.isModule ? "" : val ? dayjs(val).format("DD-MM-YYYY") : "-",
        },
        {
            title: "Actual Start",
            dataIndex: "actualStart",
            key: "actualStart",
            width: "10%",
            render: (val: string | null | undefined, row: CommercialActivityRow) =>
                row.isModule ? "" : val ? dayjs(val).format("DD-MM-YYYY") : "-",
        },
        {
            title: "Actual Finish",
            dataIndex: "actualFinish",
            key: "actualFinish",
            width: "10%",
            render: (val: string | null | undefined, row: CommercialActivityRow) =>
                row.isModule ? "" : val ? dayjs(val).format("DD-MM-YYYY") : "-",
        },
        {
            title: "Commercial Activity Undertaken",
            key: "commercialUndertaken",
            width: "18%",
            render: (_: any, row: CommercialActivityRow) =>
                row.isModule ? null : (
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
            title: "Lead Time",
            key: "leadTime",
            width: "8%",
            render: (_: any, row: CommercialActivityRow) =>
                row.isModule ? null : (
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        precision={0}
                        parser={numericParser}
                        disabled={!row.commercialUndertaken}
                        value={row.leadTimeDays ?? undefined}
                        onChange={(val) =>
                            handleLeadTimeChange(row, val as number | null)
                        }
                    />
                ),
        },
        // {
        //     title: "Order Processing Status",
        //     key: "orderProcessingStatus",
        //     width: "15%",
        //     render: (_: any, row: CommercialActivityRow) =>
        //         row.isModule ? null : (
        //             <Select
        //                 style={{ width: "100%" }}
        //                 disabled={!row.commercialUndertaken}
        //                 value={row.orderProcessingStatus || "Yet to Start"}
        //                 onChange={(val: string) => handleOrderStatusChange(row, val)}
        //             >
        //                 {ORDER_STATUS_OPTIONS.map((s) => (
        //                     <Option key={s} value={s}>
        //                         {s}
        //                     </Option>
        //                 ))}
        //             </Select>
        //         ),
        // },
    ];

    return (
        <div className="budget-main-container">
            <div className="budget-heading">
                <Text className="budget-title">Commercial Activity Planner</Text>

                <div className="budget-meta-row">
                    <Space size={20} align="center">
                        <Space>
                            <Text className="meta-label">Project:</Text>
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
                                    {timelineInfo.updatedAt
                                        ? dayjs(timelineInfo.updatedAt).format("DD-MM-YYYY HH:mm")
                                        : "-"}
                                </Text>
                            </Space>
                        )}
                    </Space>
                </div>
            </div>

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
                        Array.isArray(record.children) && record.children.length > 0,
                    expandIconColumnIndex: 0,
                }}
                rowClassName={(record: any) =>
                    record.isModule ? "module-header-row" : "activity-row"
                }
                scroll={{ x: true, y: "calc(100vh - 260px)" }}
            />

            <div
                style={{
                    position: "absolute",
                    bottom: "25px",
                    right: "10px"
                }}
            >
                <Button type="primary" className="save-button" onClick={handleSaveAll}>
                    Save
                </Button>
            </div>
            <ToastContainer />
        </div>
    );
};

export default CommercialActivityPlanner;