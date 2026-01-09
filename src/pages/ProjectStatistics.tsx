import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Empty, Select } from "antd";
import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import "../styles/project-statistic.css";

const { Option } = Select;

const GRAPH_TYPES = {
    START: "Planned Start vs Actual Start",
    FINISH: "Planned Finish vs Actual Finish",
    DELAY: "Planned Date vs Delay (Days)",
} as const;

type GraphType = (typeof GRAPH_TYPES)[keyof typeof GRAPH_TYPES];
type RangeType = "Daily" | "Weekly" | "Monthly" | "Yearly";

type RawActivity = {
    code: string;
    activityName: string;
    start?: string;
    end?: string;
    actualStart?: string;
    actualFinish?: string;
    activityStatus?: string;
    fin_status?: string;
};

type RawModule = {
    parentModuleCode: string;
    moduleName: string;
    mineType?: string;
    level?: string;
    activities: RawActivity[];
};

type TableActivity = {
    key: string;
    Code: string;
    keyActivity: string;
    plannedStart: string | null;
    plannedFinish: string | null;
    actualStart: string | null;
    actualFinish: string | null;
    activityStatus: string;
};

type TableModule = {
    key: string;
    Code: string;
    keyActivity: string;
    isModule: true;
    children: TableActivity[];
};

type GraphPoint = {
    x: number;
    y: number;
    activity: string;
};

type GraphRow = {
    activity: string;
    plannedStart: number | null;
    actualStart: number | null;
    plannedFinish: number | null;
    actualFinish: number | null;
    delay: number | null;
};

const COLORS = [
    "#1F7A63",
    "#34D399",
    "#4B5563",
    "#166A55",
    "#15803D",
    "#D97706",
    "#B91C1C",
];

const toDMY = (iso?: string) => {
    if (!iso) return null;
    const d = dayjs(iso);
    return d.isValid() ? d.format("DD-MM-YYYY") : null;
};

const parseDMY = (v: string | null) => {
    if (!v) return null;
    const d = dayjs(v, "DD-MM-YYYY", true);
    return d.isValid() ? d : null;
};

const groupByDateGranularity = (timestamp: number, range: RangeType) => {
    const date = dayjs(timestamp);
    switch (range) {
        case "Daily":
            return date.startOf("day").valueOf();
        case "Weekly":
            return date.startOf("week").valueOf();
        case "Monthly":
            return date.startOf("month").valueOf();
        case "Yearly":
            return date.startOf("year").valueOf();
        default:
            return timestamp;
    }
};

export default function ProjectStatistics() {
    const [dataSource, setDataSource] = useState<TableModule[]>([]);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [selectedGraph, setSelectedGraph] = useState<GraphType>(GRAPH_TYPES.START);
    const [selectedRange, setSelectedRange] = useState<RangeType>("Daily");

    useEffect(() => {
        const dummyModules: RawModule[] = [
            {
                parentModuleCode: "CF",
                moduleName: "Contract Formulation",
                mineType: "OC",
                level: "L1",
                activities: [
                    {
                        code: "CF/10",
                        activityName: "Declaration as H1 Bidder",
                        start: "2025-06-01T00:00:00.000Z",
                        end: "2025-06-03T00:00:00.000Z",
                        actualStart: "2025-06-02T00:00:00.000Z",
                        actualFinish: "2025-06-03T00:00:00.000Z",
                        activityStatus: "completed",
                    },
                    {
                        code: "CF/20",
                        activityName: "Signing of CBDPA",
                        start: "2025-06-04T00:00:00.000Z",
                        end: "2025-06-06T00:00:00.000Z",
                        actualStart: "2025-06-05T00:00:00.000Z",
                        actualFinish: "2025-06-07T00:00:00.000Z",
                        activityStatus: "completed",
                    },
                    {
                        code: "CF/30",
                        activityName: "Payment to MoC",
                        start: "2025-06-10T00:00:00.000Z",
                        end: "2025-06-12T00:00:00.000Z",
                        actualStart: "2025-06-11T00:00:00.000Z",
                        actualFinish: "2025-06-12T00:00:00.000Z",
                        activityStatus: "completed",
                    },
                    {
                        code: "CF/40",
                        activityName: "Issuance of Vesting Order",
                        start: "2025-06-15T00:00:00.000Z",
                        end: "2025-06-17T00:00:00.000Z",
                        actualStart: "2025-06-16T00:00:00.000Z",
                        actualFinish: "2025-06-18T00:00:00.000Z",
                        activityStatus: "completed",
                    },
                ],
            },
            {
                parentModuleCode: "PR",
                moduleName: "Budgetary Planning",
                mineType: "OC",
                level: "L1",
                activities: [
                    {
                        code: "PR/10",
                        activityName: "Submit Budget Sheet",
                        start: "2025-07-01T00:00:00.000Z",
                        end: "2025-07-03T00:00:00.000Z",
                        actualStart: "2025-07-02T00:00:00.000Z",
                        actualFinish: "2025-07-03T00:00:00.000Z",
                        activityStatus: "completed",
                    },
                    {
                        code: "PR/20",
                        activityName: "Finance Approval",
                        start: "2025-07-05T00:00:00.000Z",
                        end: "2025-07-07T00:00:00.000Z",
                        actualStart: "2025-07-06T00:00:00.000Z",
                        actualFinish: "2025-07-08T00:00:00.000Z",
                        activityStatus: "completed",
                    },
                    {
                        code: "PR/30",
                        activityName: "Release Funds",
                        start: "2025-08-01T00:00:00.000Z",
                        end: "2025-08-03T00:00:00.000Z",
                        actualStart: "2025-08-01T00:00:00.000Z",
                        actualFinish: "2025-08-02T00:00:00.000Z",
                        activityStatus: "ongoing",
                    },
                ],
            },
            {
                parentModuleCode: "EX",
                moduleName: "Excavation Planning",
                mineType: "UG",
                level: "L2",
                activities: [
                    {
                        code: "EX/10",
                        activityName: "Site Survey",
                        start: "2025-08-05T00:00:00.000Z",
                        end: "2025-08-07T00:00:00.000Z",
                        actualStart: "2025-08-06T00:00:00.000Z",
                        actualFinish: "2025-08-07T00:00:00.000Z",
                        activityStatus: "completed",
                    },
                    {
                        code: "EX/20",
                        activityName: "Drill Plan Approval",
                        start: "2025-08-08T00:00:00.000Z",
                        end: "2025-08-10T00:00:00.000Z",
                        actualStart: "2025-08-08T00:00:00.000Z",
                        actualFinish: "",
                        activityStatus: "ongoing",
                    },
                ],
            },
        ];

        const finDataSource: TableModule[] = dummyModules.map((module, moduleIndex) => {
            const children: TableActivity[] = (module.activities || []).map((activity, actIndex) => ({
                key: `activity-${moduleIndex}-${actIndex}`,
                Code: activity.code,
                keyActivity: activity.activityName,
                plannedStart: toDMY(activity.start),
                plannedFinish: toDMY(activity.end),
                actualStart: toDMY(activity.actualStart),
                actualFinish: toDMY(activity.actualFinish),
                activityStatus: activity.activityStatus || "yetToStart",
            }));

            return {
                key: `module-${moduleIndex}`,
                Code: module.parentModuleCode,
                keyActivity: module.moduleName,
                isModule: true,
                children,
            };
        });

        setDataSource(finDataSource);
        setSelectedModules(finDataSource.slice(0, 1).map((m) => m.Code));
    }, []);

    const graphRows = useMemo<GraphRow[]>(() => {
        if (selectedModules.length === 0 || dataSource.length === 0) return [];
        const selectedActivities = dataSource
            .filter((mod) => selectedModules.includes(mod.Code))
            .flatMap((mod) => mod.children);

        return selectedActivities.map((activity) => {
            const plannedStart = parseDMY(activity.plannedStart);
            const actualStart = parseDMY(activity.actualStart);
            const plannedFinish = parseDMY(activity.plannedFinish);
            const actualFinish = parseDMY(activity.actualFinish);

            return {
                activity: activity.keyActivity,
                plannedStart: plannedStart ? plannedStart.valueOf() : null,
                actualStart: actualStart ? actualStart.valueOf() : null,
                plannedFinish: plannedFinish ? plannedFinish.valueOf() : null,
                actualFinish: actualFinish ? actualFinish.valueOf() : null,
                delay: plannedStart && actualStart ? Math.max(0, actualStart.diff(plannedStart, "day")) : null,
            };
        });
    }, [selectedModules, dataSource]);

    const scatterByModule = useMemo(() => {
        const moduleMap: Record<string, GraphPoint[]> = {};

        selectedModules.forEach((modCode) => {
            const module = dataSource.find((m) => m.Code === modCode);
            if (!module) return;

            const grouped: Record<number, GraphPoint> = {};

            module.children.forEach((activity) => {
                const plannedStart = parseDMY(activity.plannedStart);
                const actualStart = parseDMY(activity.actualStart);
                const plannedFinish = parseDMY(activity.plannedFinish);
                const actualFinish = parseDMY(activity.actualFinish);

                let x: number | null = null;
                let y: number | null = null;

                if (selectedGraph === GRAPH_TYPES.START) {
                    x = plannedStart ? plannedStart.valueOf() : null;
                    y = actualStart ? actualStart.valueOf() : null;
                } else if (selectedGraph === GRAPH_TYPES.FINISH) {
                    x = plannedFinish ? plannedFinish.valueOf() : null;
                    y = actualFinish ? actualFinish.valueOf() : null;
                } else if (selectedGraph === GRAPH_TYPES.DELAY) {
                    x = plannedStart ? plannedStart.valueOf() : null;
                    y = plannedStart && actualStart ? Math.max(0, actualStart.diff(plannedStart, "day")) : null;
                }

                if (x !== null && y !== null) {
                    const bucket = groupByDateGranularity(x, selectedRange);
                    grouped[bucket] = { x: bucket, y, activity: activity.keyActivity };
                }
            });

            moduleMap[modCode] = Object.values(grouped);
        });

        return moduleMap;
    }, [selectedModules, dataSource, selectedGraph, selectedRange]);

    const flatScatter = useMemo(() => {
        if (selectedGraph === GRAPH_TYPES.START) {
            return graphRows
                .filter((d) => d.actualStart !== null && d.plannedStart !== null)
                .map((d) => ({ x: d.plannedStart as number, y: d.actualStart as number, activity: d.activity }));
        }
        if (selectedGraph === GRAPH_TYPES.FINISH) {
            return graphRows
                .filter((d) => d.actualFinish !== null && d.plannedFinish !== null)
                .map((d) => ({ x: d.plannedFinish as number, y: d.actualFinish as number, activity: d.activity }));
        }
        if (selectedGraph === GRAPH_TYPES.DELAY) {
            return graphRows
                .filter((d) => d.delay !== null && d.plannedStart !== null)
                .map((d) => ({ x: d.plannedStart as number, y: d.delay as number, activity: d.activity }));
        }
        return [];
    }, [graphRows, selectedGraph]);

    const axisDomain = useMemo(() => {
        if (flatScatter.length === 0) return null;

        const xs = flatScatter.map((d) => d.x);
        const ys = flatScatter.map((d) => d.y);

        const xMin = Math.min(...xs);
        const xMax = Math.max(...xs);

        const yMin = selectedGraph === GRAPH_TYPES.DELAY ? 0 : Math.min(...ys);
        const yMax = Math.max(...ys);

        const hideOriginYLabel =
            selectedGraph !== GRAPH_TYPES.DELAY && dayjs(xMin).isSame(dayjs(yMin), "day");

        return { xMin, xMax, yMin, yMax, hideOriginYLabel };
    }, [flatScatter, selectedGraph]);

    return (
        <div className="project-statistics">
            <div className="top-heading-stats">
                <div className="stats-toolbar">
                    <div className="stats-control">
                        <div className="label">
                            <p>Select Module</p>
                        </div>
                        <Select
                            mode="multiple"
                            placeholder="Select Modules"
                            className="stats-select"
                            value={selectedModules}
                            onChange={setSelectedModules}
                            maxTagCount={1}
                            maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} more`}
                        >
                            {dataSource.map((mod) => (
                                <Option key={mod.Code} value={mod.Code}>
                                    {mod.keyActivity}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="stats-control">
                        <div className="label">
                            <p>Select Graph</p>
                        </div>
                        <Select value={selectedGraph} onChange={(v) => setSelectedGraph(v)} className="stats-select">
                            {Object.values(GRAPH_TYPES).map((g) => (
                                <Option key={g} value={g}>
                                    {g}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="stats-control">
                        <div className="label">
                            <p>Time Range</p>
                        </div>
                        <Select value={selectedRange} onChange={(v) => setSelectedRange(v)} className="stats-select-sm">
                            {(["Daily", "Weekly", "Monthly", "Yearly"] as RangeType[]).map((label) => (
                                <Option key={label} value={label}>
                                    {label}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {flatScatter.length > 0 ? (
                <>
                    <p className="graph-title">{selectedGraph}</p>
                    <ResponsiveContainer width="100%" height={445}>
                        <ScatterChart margin={{ top: 20, right: 30, left: 40, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                scale="linear"
                                domain={axisDomain ? [axisDomain.xMin, axisDomain.xMax] : ["auto", "auto"]}
                                tickFormatter={(tick) => dayjs(tick).format("DD MMM YY")}
                                label={{
                                    value: selectedGraph.includes("Finish") ? "Planned Finish Date" : "Planned Start Date",
                                    position: "insideBottom",
                                    offset: -10,
                                }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                domain={
                                    selectedGraph === GRAPH_TYPES.DELAY
                                        ? [0, "auto"]
                                        : axisDomain
                                            ? [axisDomain.yMin, axisDomain.yMax]
                                            : ["auto", "auto"]
                                }
                                tickFormatter={(tick) => {
                                    if (
                                        axisDomain?.hideOriginYLabel &&
                                        dayjs(tick).isSame(dayjs(axisDomain.yMin), "day")
                                    ) {
                                        return "";
                                    }
                                    return selectedGraph === GRAPH_TYPES.DELAY
                                        ? `${tick}d`
                                        : dayjs(tick).format("DD-MMM-YY");
                                }}
                                label={{
                                    value: selectedGraph === GRAPH_TYPES.DELAY ? "Delay (Days)" : "Actual Date",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: -30,
                                }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload || payload.length === 0) return null;
                                    const d: any = payload[0].payload;
                                    const planned = dayjs(d.x).format("DD-MM-YYYY");
                                    return (
                                        <div className="stats-tooltip">
                                            <p>Planned: {planned}</p>
                                            <p>
                                                {selectedGraph === GRAPH_TYPES.DELAY
                                                    ? `Delay: ${d.y} days`
                                                    : `Actual: ${dayjs(d.y).format("DD-MM-YYYY")}`}
                                            </p>
                                            {d.activity ? <p>{d.activity}</p> : null}
                                        </div>
                                    );
                                }}
                            />

                            {Object.entries(scatterByModule).map(([modCode, points], idx) => (
                                <Scatter key={modCode} name={modCode} data={points} fill={COLORS[idx % COLORS.length]} />
                            ))}
                        </ScatterChart>
                    </ResponsiveContainer>
                </>
            ) : (
                <Empty description="No data available. Select a module or change filter." />
            )}
        </div>
    );
}