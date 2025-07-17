import { useEffect, useState } from "react";
import "../styles/project-timeline.css";
import dayjs from "dayjs";
import { Select, Empty } from "antd";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import '../styles/project-statistic.css';

const { Option } = Select;

const GRAPH_TYPES = {
    START: "Planned Start vs Actual Start",
    FINISH: "Planned Finish vs Actual Finish",
    DELAY: "Planned Date vs Delay (Days)"
};

const ProjectStatistics = (_project: any) => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [selectedGraph, setSelectedGraph] = useState<string>(GRAPH_TYPES.START);
    const [graphData, setGraphData] = useState<any[]>([]);
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a83279', '#2f4f4f', '#00bcd4', '#f44336', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#3f51b5', '#009688', '#e91e63', '#795548'];
    const [selectedRange, setSelectedRange] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');

    useEffect(() => {
        defaultSetup();
    }, []);

    const getScatterDataByModule = () => {
        const moduleMap: Record<string, any[]> = {};

        selectedModules.forEach((modCode) => {
            const module = dataSource.find((mod: any) => mod.Code === modCode);
            if (!module) return;

            const grouped: Record<number, any> = {};

            module.children.forEach((activity: any) => {
                const plannedStart = dayjs(activity.plannedStart, "DD-MM-YYYY", true);
                const actualStart = dayjs(activity.actualStart, "DD-MM-YYYY", true);
                const plannedFinish = dayjs(activity.plannedFinish, "DD-MM-YYYY", true);
                const actualFinish = dayjs(activity.actualFinish, "DD-MM-YYYY", true);

                let x: any, y: any;

                if (selectedGraph === GRAPH_TYPES.START) {
                    x = plannedStart.isValid() ? plannedStart.valueOf() : null;
                    y = actualStart.isValid() ? actualStart.valueOf() : null;
                } else if (selectedGraph === GRAPH_TYPES.FINISH) {
                    x = plannedFinish.isValid() ? plannedFinish.valueOf() : null;
                    y = actualFinish.isValid() ? actualFinish.valueOf() : null;
                } else if (selectedGraph === GRAPH_TYPES.DELAY) {
                    x = plannedStart.isValid() ? plannedStart.valueOf() : null;
                    y = plannedStart.isValid() && actualStart.isValid()
                        ? Math.max(0, actualStart.diff(plannedStart, 'day'))
                        : null;
                }

                if (x !== null && y !== null) {
                    const bucket = groupByDateGranularity(x);
                    grouped[bucket] = {
                        x: bucket,
                        y,
                        activity: activity.keyActivity
                    };
                }
            });

            moduleMap[modCode] = Object.values(grouped);
        });

        return moduleMap;
    };


    const defaultSetup = async () => {
        try {
            const dummyModules = [
                {
                    parentModuleCode: 'CF',
                    moduleName: 'Contract Formulation',
                    mineType: 'OC',
                    level: 'L1',
                    activities: [
                        {
                            code: 'CF/10',
                            activityName: 'Declaration as H1 Bidder',
                            start: '2025-06-01T00:00:00.000Z',
                            end: '2025-06-03T00:00:00.000Z',
                            actualStart: '2025-06-02T00:00:00.000Z',
                            actualFinish: '2025-06-03T00:00:00.000Z',
                            activityStatus: 'completed'
                        },
                        {
                            code: 'CF/20',
                            activityName: 'Signing of CBDPA',
                            start: '2025-06-04T00:00:00.000Z',
                            end: '2025-06-06T00:00:00.000Z',
                            actualStart: '2025-06-05T00:00:00.000Z',
                            actualFinish: '2025-06-07T00:00:00.000Z',
                            activityStatus: 'completed'
                        },
                        {
                            code: 'CF/30',
                            activityName: 'Payment to MoC',
                            start: '2025-06-10T00:00:00.000Z',
                            end: '2025-06-12T00:00:00.000Z',
                            actualStart: '2025-06-11T00:00:00.000Z',
                            actualFinish: '2025-06-12T00:00:00.000Z',
                            activityStatus: 'completed'
                        },
                        {
                            code: 'CF/40',
                            activityName: 'Issuance of Vesting Order',
                            start: '2025-06-15T00:00:00.000Z',
                            end: '2025-06-17T00:00:00.000Z',
                            actualStart: '2025-06-16T00:00:00.000Z',
                            actualFinish: '2025-06-18T00:00:00.000Z',
                            activityStatus: 'completed'
                        }
                    ]
                },
                {
                    parentModuleCode: 'PR',
                    moduleName: 'Budgetary Planning',
                    mineType: 'OC',
                    level: 'L1',
                    activities: [
                        {
                            code: 'PR/10',
                            activityName: 'Submit Budget Sheet',
                            start: '2025-07-01T00:00:00.000Z',
                            end: '2025-07-03T00:00:00.000Z',
                            actualStart: '2025-07-02T00:00:00.000Z',
                            actualFinish: '2025-07-03T00:00:00.000Z',
                            activityStatus: 'completed'
                        },
                        {
                            code: 'PR/20',
                            activityName: 'Finance Approval',
                            start: '2025-07-05T00:00:00.000Z',
                            end: '2025-07-07T00:00:00.000Z',
                            actualStart: '2025-07-06T00:00:00.000Z',
                            actualFinish: '2025-07-08T00:00:00.000Z',
                            activityStatus: 'completed'
                        },
                        {
                            code: 'PR/30',
                            activityName: 'Release Funds',
                            start: '2025-08-01T00:00:00.000Z',
                            end: '2025-08-03T00:00:00.000Z',
                            actualStart: '2025-08-01T00:00:00.000Z',
                            actualFinish: '2025-08-02T00:00:00.000Z',
                            activityStatus: 'ongoing'
                        }
                    ]
                },
                {
                    parentModuleCode: 'EX',
                    moduleName: 'Excavation Planning',
                    mineType: 'UG',
                    level: 'L2',
                    activities: [
                        {
                            code: 'EX/10',
                            activityName: 'Site Survey',
                            start: '2025-08-05T00:00:00.000Z',
                            end: '2025-08-07T00:00:00.000Z',
                            actualStart: '2025-08-06T00:00:00.000Z',
                            actualFinish: '2025-08-07T00:00:00.000Z',
                            activityStatus: 'completed'
                        },
                        {
                            code: 'EX/20',
                            activityName: 'Drill Plan Approval',
                            start: '2025-08-08T00:00:00.000Z',
                            end: '2025-08-10T00:00:00.000Z',
                            actualStart: '2025-08-08T00:00:00.000Z',
                            actualFinish: '',
                            activityStatus: 'ongoing'
                        }
                    ]
                },
                {
                    parentModuleCode: 'SAF',
                    moduleName: 'Safety Compliance',
                    mineType: 'OC',
                    level: 'L1',
                    activities: [
                        {
                            code: 'SAF/10',
                            activityName: 'Site Risk Assessment',
                            start: '2025-07-15T00:00:00.000Z',
                            end: '2025-07-17T00:00:00.000Z',
                            actualStart: '',
                            actualFinish: '',
                            activityStatus: 'pending'
                        },
                        {
                            code: 'SAF/20',
                            activityName: 'PPE Distribution',
                            start: '2025-07-18T00:00:00.000Z',
                            end: '2025-07-20T00:00:00.000Z',
                            actualStart: '',
                            actualFinish: '',
                            activityStatus: 'pending'
                        }
                    ]
                },
                {
                    parentModuleCode: 'EN',
                    moduleName: 'Environmental Clearance',
                    mineType: 'UG',
                    level: 'L3',
                    activities: [
                        {
                            code: 'EN/10',
                            activityName: 'EIA Study',
                            start: '2025-06-20T00:00:00.000Z',
                            end: '2025-07-01T00:00:00.000Z',
                            actualStart: '2025-06-21T00:00:00.000Z',
                            actualFinish: '2025-07-01T00:00:00.000Z',
                            activityStatus: 'completed'
                        },
                        {
                            code: 'EN/20',
                            activityName: 'Public Hearing',
                            start: '2025-07-05T00:00:00.000Z',
                            end: '2025-07-06T00:00:00.000Z',
                            actualStart: '',
                            actualFinish: '',
                            activityStatus: 'pending'
                        }
                    ]
                },
                {
                    parentModuleCode: 'TR',
                    moduleName: 'Transport Infrastructure',
                    mineType: 'OC',
                    level: 'L2',
                    activities: [
                        {
                            code: 'TR/10',
                            activityName: 'Road Construction',
                            start: '2025-09-01T00:00:00.000Z',
                            end: '2025-09-10T00:00:00.000Z',
                            actualStart: '',
                            actualFinish: '',
                            activityStatus: 'pending'
                        },
                        {
                            code: 'TR/20',
                            activityName: 'Bridge Inspection',
                            start: '2025-09-12T00:00:00.000Z',
                            end: '2025-09-15T00:00:00.000Z',
                            actualStart: '',
                            actualFinish: '',
                            activityStatus: 'pending'
                        }
                    ]
                }
            ];

            handleLibraryChange(dummyModules);
        } catch (error) {
            console.error("Error during setup:", error);
        }
    };


    useEffect(() => {
        if (selectedModules.length > 0 && dataSource.length > 0) {
            const selectedActivities = dataSource
                .filter((mod: any) => selectedModules.includes(mod.Code))
                .flatMap((mod: any) => mod.children);

            const formatted = selectedActivities.map((activity: any) => {
                const plannedStart = dayjs(activity.plannedStart, "DD-MM-YYYY", true);
                const actualStart = dayjs(activity.actualStart, "DD-MM-YYYY", true);
                const plannedFinish = dayjs(activity.plannedFinish, "DD-MM-YYYY", true);
                const actualFinish = dayjs(activity.actualFinish, "DD-MM-YYYY", true);

                return {
                    activity: activity.keyActivity,
                    plannedStart: plannedStart.isValid() ? plannedStart.valueOf() : null,
                    actualStart: actualStart.isValid() ? actualStart.valueOf() : null,
                    plannedFinish: plannedFinish.isValid() ? plannedFinish.valueOf() : null,
                    actualFinish: actualFinish.isValid() ? actualFinish.valueOf() : null,
                    delay: (plannedStart.isValid() && actualStart.isValid())
                        ? Math.max(0, actualStart.diff(plannedStart, 'day'))
                        : null,
                };
            });

            setGraphData(formatted);
        } else {
            setGraphData([]);
        }
    }, [selectedModules, dataSource, selectedGraph]);

    const handleLibraryChange = (libraryItems: any) => {
        if (!libraryItems || libraryItems.length === 0) {
            setDataSource([]);
            return;
        }

        const finDataSource = libraryItems.map((module: any, moduleIndex: number) => {
            const children = (module.activities || []).map((activity: any, actIndex: number) => ({
                key: `activity-${moduleIndex}-${actIndex}`,
                SrNo: module.parentModuleCode,
                Code: activity.code,
                keyActivity: activity.activityName,

                // 👇 convert from raw format to formatted expected string
                plannedStart: activity.start ? dayjs(activity.start).format("DD-MM-YYYY") : null,
                plannedFinish: activity.end ? dayjs(activity.end).format("DD-MM-YYYY") : null,
                actualStart: activity.actualStart ? dayjs(activity.actualStart).format("DD-MM-YYYY") : null,
                actualFinish: activity.actualFinish ? dayjs(activity.actualFinish).format("DD-MM-YYYY") : null,

                isModule: false,
                activityStatus: activity.activityStatus || "yetToStart",
                fin_status: activity.fin_status || "",
            }));

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

        // ✅ auto-select first module
        setSelectedModules(finDataSource.slice(0, 1).map((m: any) => m.Code));
    };

    const getScatterData = () => {
        switch (selectedGraph) {
            case GRAPH_TYPES.START:
                return graphData.filter(d => d.actualStart).map(d => ({
                    x: d.plannedStart,
                    y: d.actualStart,
                    activity: d.activity
                }));
            case GRAPH_TYPES.FINISH:
                return graphData.filter(d => d.actualFinish).map(d => ({
                    x: d.plannedFinish,
                    y: d.actualFinish,
                    activity: d.activity
                }));
            case GRAPH_TYPES.DELAY:
                return graphData.filter(d => d.delay !== null).map(d => ({
                    x: d.plannedStart,
                    y: d.delay,
                    activity: d.activity
                }));
            default:
                return [];
        }
    };


    const groupByDateGranularity = (timestamp: number) => {
        const date = dayjs(timestamp);
        switch (selectedRange) {
            case 'Daily':
                return date.startOf('day').valueOf();
            case 'Weekly':
                return date.startOf('week').valueOf();
            case 'Monthly':
                return date.startOf('month').valueOf();
            case 'Yearly':
                return date.startOf('year').valueOf();
            default:
                return timestamp;
        }
    };

    return (
        <div className="project-statistics">
            <div className="top-heading-stats">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="label"><p>Select Module</p></div>
                    <Select
                        mode="multiple"
                        placeholder="Select Modules"
                        style={{ width: 280 }}
                        value={selectedModules}
                        onChange={setSelectedModules}
                        maxTagCount={1}
                        maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} more`}
                    >
                        {dataSource.map((mod: any) => (
                            <Option key={mod.Code} value={mod.Code}>
                                {mod.keyActivity}
                            </Option>
                        ))}
                    </Select>

                    <div className="label"><p>Select Graph</p></div>
                    <Select
                        value={selectedGraph}
                        onChange={setSelectedGraph}
                        style={{ width: 280 }}
                    >
                        {Object.values(GRAPH_TYPES).map(graph => (
                            <Option key={graph} value={graph}>{graph}</Option>
                        ))}
                    </Select>

                    <div className="label"><p>Time Range</p></div>
                    <Select
                        style={{ width: 120 }}
                        value={selectedRange}
                        onChange={(value) => setSelectedRange(value)}
                        placeholder="Select Time Range"
                    >
                        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((label) => (
                            <Option key={label} value={label}>
                                {label}
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>
            {/* <div className="label"><p>Time Range</p></div>
            <div className="range-buttons">
                {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((label) => (
                    <button
                        key={label}
                        onClick={() => setSelectedRange(label as any)}
                        className={`range-btn ${selectedRange === label ? 'active' : ''}`}
                    >
                        {label}
                    </button>
                ))}
            </div> */}

            {getScatterData().length > 0 ? (
                <>
                    <p className="graph-title">{selectedGraph}</p>
                    <ResponsiveContainer width="100%" height={445}>
                        <ScatterChart margin={{ top: 20, right: 30, left: 40, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                scale={'linear'}
                                domain={['auto', 'auto']}
                                tickFormatter={(tick) => dayjs(tick).format("DD MMM YY")}
                                label={{ value: selectedGraph.includes("Finish") ? "Planned Finish Date" : "Planned Start Date", position: "insideBottom", offset: -10 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                domain={selectedGraph === GRAPH_TYPES.DELAY ? [0, 'auto'] : ['auto', 'auto']}
                                tickFormatter={selectedGraph === GRAPH_TYPES.DELAY
                                    ? (tick) => `${tick}d`
                                    : (tick) => dayjs(tick).format("DD-MMM-YY")}
                                label={{ value: selectedGraph === GRAPH_TYPES.DELAY ? "Delay (Days)" : "Actual Date", angle: -90, position: "insideLeft", offset: -30 }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload || payload.length === 0) return null;
                                    const d = payload[0].payload;
                                    const planned = dayjs(d.x).format("DD-MM-YYYY");
                                    return (
                                        <div style={{ background: 'white', padding: '8px', border: '1px solid #ccc' }}>
                                            <p style={{ margin: 0 }}>Planned: {planned}</p>
                                            <p style={{ margin: 0 }}>{selectedGraph === GRAPH_TYPES.DELAY ? `Delay: ${d.y} days` : `Actual: ${dayjs(d.y).format("DD-MM-YYYY")}`}</p>
                                            {d.label && <p style={{ margin: 0 }}>{d.label}</p>}
                                        </div>
                                    );
                                }}
                            />

                            {Object.entries(getScatterDataByModule()).map(([modCode, points], idx) => (
                                <Scatter
                                    key={modCode}
                                    name={modCode}
                                    data={points}
                                    fill={COLORS[idx % COLORS.length]}
                                />
                            ))}
                        </ScatterChart>
                    </ResponsiveContainer>
                </>
            ) : (
                <Empty description="No data available. Select a module or change filter." />
            )}
        </div>
    );
};

export default ProjectStatistics;