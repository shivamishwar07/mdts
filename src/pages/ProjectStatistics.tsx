// import { useEffect, useState } from "react";
// import "../styles/project-timeline.css";
// import dayjs from "dayjs";
// import { db } from "../Utils/dataStorege.ts";
// import { Select, Empty } from "antd";
// import {
//     ScatterChart,
//     Scatter,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     ResponsiveContainer
// } from "recharts";
// import '../styles/project-statistic.css';

// const { Option } = Select;

// const GRAPH_TYPES = {
//     START: "Planned Start vs Actual Start",
//     FINISH: "Planned Finish vs Actual Finish"
// };

// const ProjectStatistics = (project: any) => {
//     const [dataSource, setDataSource] = useState<any>([]);
//     const [selectedModules, setSelectedModules] = useState<string[]>([]);
//     const [selectedGraph, setSelectedGraph] = useState<string>(GRAPH_TYPES.START);
//     const [graphData, setGraphData] = useState<any[]>([]);

//     useEffect(() => {
//         defaultSetup();
//     }, []);

//     const defaultSetup = async () => {
//         try {
//             const storedData: any = (await db.getProjects()).filter((p) => p.id == project.code);
//             const selectedProject = storedData[0];
//             if (selectedProject?.projectTimeline) {
//                 const timelineData = await getProjectTimeline(selectedProject);
//                 setDataSource(timelineData);

//                 const allModules = timelineData.map((mod: any) => mod.parentModuleCode);
//                 setSelectedModules(allModules);
//             }
//         } catch (error) {
//             console.error("An unexpected error occurred while fetching projects:", error);
//         }
//     };

//     useEffect(() => {
//         if (selectedModules.length > 0 && dataSource.length > 0) {
//             const selectedActivities = dataSource
//                 .filter((mod: any) => selectedModules.includes(mod.parentModuleCode))
//                 .flatMap((mod: any) => mod.activities || []);

//             const formatted = selectedActivities.map((activity: any) => {
//                 const plannedStart = dayjs(activity.start);
//                 const actualStart = dayjs(activity.actualStart, "DD-MM-YYYY", true);
//                 const plannedFinish = dayjs(activity.end);
//                 const actualFinish = dayjs(activity.actualFinish, "DD-MM-YYYY", true);

//                 return {
//                     activity: activity.activityName,
//                     plannedStart: plannedStart.isValid() ? plannedStart.valueOf() : null,
//                     actualStart: actualStart.isValid() ? actualStart.valueOf() : null,
//                     plannedFinish: plannedFinish.isValid() ? plannedFinish.valueOf() : null,
//                     actualFinish: actualFinish.isValid() ? actualFinish.valueOf() : null
//                 };
//             });

//             setGraphData(formatted);
//         } else {
//             setGraphData([]);
//         }
//     }, [selectedModules, dataSource, selectedGraph]);

//     const getProjectTimeline = async (project: any) => {
//         try {
//             const latestVersionId = localStorage.getItem("latestProjectVersion");
//             const foundTimeline = project.projectTimeline.filter((item: any) => item.version == latestVersionId);
//             const timelineId = !latestVersionId ? project.projectTimeline[0].timelineId : foundTimeline[0].timelineId;
//             const timeline = await db.getProjectTimelineById(timelineId);
//             return timeline.map(({ id, ...rest }: any) => rest);
//         } catch (err) {
//             console.error("Error fetching timeline:", err);
//             return [];
//         }
//     };

//     const getScatterData = () => {
//         switch (selectedGraph) {
//             case GRAPH_TYPES.START:
//                 return graphData.filter(d => d.actualStart).map(d => ({ x: d.plannedStart, y: d.actualStart, activity: d.activity }));
//             case GRAPH_TYPES.FINISH:
//                 return graphData.filter(d => d.actualFinish).map(d => ({ x: d.plannedFinish, y: d.actualFinish, activity: d.activity }));
//             default:
//                 return [];
//         }
//     };

//     return (
//         <div className="project-statistics">
//             <div className="top-heading-stats">
//                 <p className="main-header">Project Statistics</p>
//                 <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//                     <div className="label"><p>Select Module</p></div>
//                     <Select
//                         mode="multiple"
//                         placeholder="Select Modules"
//                         style={{ width: 300 }}
//                         value={selectedModules}
//                         onChange={setSelectedModules}
//                         allowClear
//                     >
//                         {dataSource.map((mod: any) => (
//                             <Option key={mod.parentModuleCode} value={mod.parentModuleCode}>{mod.moduleName}</Option>
//                         ))}
//                     </Select>
//                     <div className="label"><p>Select Graph</p></div>
//                     <Select
//                         value={selectedGraph}
//                         onChange={setSelectedGraph}
//                         style={{ width: 300 }}
//                     >
//                         {Object.values(GRAPH_TYPES).map(graph => (
//                             <Option key={graph} value={graph}>{graph}</Option>
//                         ))}
//                     </Select>
//                 </div>
//             </div>

//             {getScatterData().length > 0 ? (
//                 <>
//                     <p className="graph-title">{selectedGraph}</p>
//                     <ResponsiveContainer width="100%" height={445}>
//                         <ScatterChart margin={{ top: 20, right: 30, left: 40, bottom: 30 }}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis
//                                 type="number"
//                                 dataKey="x"
//                                 scale="time"
//                                 domain={[
//                                     (dataMin: number) => dayjs(dataMin).subtract(7, 'day').valueOf(),
//                                     'auto'
//                                 ]}
//                                 tickFormatter={(tick) => dayjs(tick).format("DD MMM YY")}
//                                 label={{
//                                     value: selectedGraph === GRAPH_TYPES.FINISH ? "Planned Finish Date" : "Planned Start Date",
//                                     position: "insideBottom",
//                                     offset: -10
//                                 }}
//                             />
//                             <YAxis
//                                 type="number"
//                                 dataKey="y"
//                                 domain={['auto', 'auto']}
//                                 tickFormatter={(tick) => dayjs(tick).format("DD MMM YY")}
//                                 label={{
//                                     value: selectedGraph === GRAPH_TYPES.FINISH ? "Actual Finish" : "Actual Start",
//                                     angle: -90,
//                                     position: "insideLeft",
//                                     offset: -20
//                                 }}
//                             />
//                             <Tooltip
//                                 content={({ active, payload, label }) => {
//                                     if (!active || !payload || payload.length === 0) return null;

//                                     const plannedDate = dayjs(label).format("DD-MM-YYYY");
//                                     const actualDate = dayjs(Number(payload[0].value)).format("DD-MM-YYYY");
//                                     const axisLabel = selectedGraph === GRAPH_TYPES.START ? 'Actual Start' : 'Actual Finish';
//                                     const xLabel = selectedGraph === GRAPH_TYPES.START ? 'Planned Start' : 'Planned Finish';

//                                     return (
//                                         <div style={{ background: 'white', padding: '8px', border: '1px solid #ccc' }}>
//                                             <p style={{ margin: 0 }}>{xLabel}: {plannedDate}</p>
//                                             <p style={{ margin: 0 }}>{axisLabel}: {actualDate}</p>
//                                         </div>
//                                     );
//                                 }}
//                             />
//                             <Scatter data={getScatterData()} name={selectedGraph} fill="#8884d8" />
//                         </ScatterChart>
//                     </ResponsiveContainer>
//                 </>
//             ) : (
//                 <Empty description="No data available. Select a module or change filter." />
//             )}
//         </div>
//     );
// };

// export default ProjectStatistics;

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

const TIME_VIEWS = ["day", "week", "month", "year"] as const;
type TimeView = typeof TIME_VIEWS[number];

const ProjectStatistics = (_project: any) => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [selectedGraph, setSelectedGraph] = useState<string>(GRAPH_TYPES.START);
    const [graphData, setGraphData] = useState<any[]>([]);
    const [timeView, setTimeView] = useState<TimeView>('day');

    useEffect(() => {
        defaultSetup();
    }, []);


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
        const raw = (() => {
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
        })();

        if (timeView === 'day') return raw;

        const formatKey = (timestamp: number) => {
            const date = dayjs(timestamp);
            if (timeView === 'week') return date.startOf('week').format('YYYY-[W]WW');
            if (timeView === 'month') return date.startOf('month').format('YYYY-MM');
            if (timeView === 'year') return date.startOf('year').format('YYYY');
            return date.format('YYYY-MM-DD');
        };

        const grouped = raw.reduce((acc: any, curr: any) => {
            const key = formatKey(curr.x);
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
        }, {});

        return Object.entries(grouped).map(([label, values]: any) => {
            const avgX = Math.round(values.reduce((sum: number, v: any) => sum + v.x, 0) / values.length);
            const avgY = Math.round(values.reduce((sum: number, v: any) => sum + v.y, 0) / values.length);
            return { x: avgX, y: avgY, activity: `${values.length} activities`, label };
        });
    };

    return (
        <div className="project-statistics">
            <div className="top-heading-stats">
                <p className="main-header">Project Statistics</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="label"><p>Select Module</p></div>
                    <Select
                        mode="multiple"
                        placeholder="Select Modules"
                        style={{ width: 280 }}
                        value={selectedModules}
                        onChange={setSelectedModules}
                        allowClear
                    >
                        {dataSource.map((mod: any) => (
                            <Option key={mod.Code} value={mod.Code}>{mod.keyActivity}</Option>
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
                </div>
            </div>

            {getScatterData().length > 0 ? (
                <>
                    <div className="time-filter">
                        {TIME_VIEWS.map(view => (
                            <button
                                key={view}
                                onClick={() => setTimeView(view)}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: timeView === view ? '#007bff' : '#eee',
                                    color: timeView === view ? '#fff' : '#000',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                {view.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <p className="graph-title">{selectedGraph}</p>
                    <ResponsiveContainer width="100%" height={445}>
                        <ScatterChart margin={{ top: 20, right: 30, left: 40, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                scale={timeView === 'day' ? 'time' : 'linear'}
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
                            <Scatter data={getScatterData()} name={selectedGraph} fill="#8884d8" />
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