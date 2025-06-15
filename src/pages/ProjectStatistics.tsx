import { useEffect, useState } from "react";
import "../styles/project-timeline.css";
import dayjs from "dayjs";
import { db } from "../Utils/dataStorege.ts";
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

const ProjectStatistics = (project: any) => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [selectedGraph, setSelectedGraph] = useState<string>(GRAPH_TYPES.START);
    const [graphData, setGraphData] = useState<any[]>([]);

    useEffect(() => {
        defaultSetup();
    }, []);

    const defaultSetup = async () => {
        try {
            const storedData: any = (await db.getProjects()).filter((p) => p.id == project.code);
            const selectedProject = storedData[0];
            if (selectedProject?.projectTimeline) {
                const timelineData = await getProjectTimeline(selectedProject);
                handleLibraryChange(timelineData);
            }
            
        } catch (error) {
            console.error("An unexpected error occurred while fetching projects:", error);
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

    const getProjectTimeline = async (project: any) => {
        try {
            const latestVersionId = localStorage.getItem("latestProjectVersion");
            const foundTimeline = project.projectTimeline.filter((item: any) => item.version == latestVersionId);
            const timelineId = !latestVersionId ? project.projectTimeline[0].timelineId : foundTimeline[0].timelineId;
            const timeline = await db.getProjectTimelineById(timelineId);
            return timeline.map(({ id, ...rest }: any) => rest);
        } catch (err) {
            console.error("Error fetching timeline:", err);
            return [];
        }
    };

    const handleLibraryChange = (libraryItems: any) => {
        if (libraryItems) {
            const finDataSource = libraryItems.map((module: any, moduleIndex: number) => {
                const children = (module.activities || []).map((activity: any, actIndex: number) => ({
                    key: `activity-${moduleIndex}-${actIndex}`,
                    SrNo: module.parentModuleCode,
                    Code: activity.code,
                    keyActivity: activity.activityName,
                    plannedStart: activity.start ? dayjs(activity.start).format("DD-MM-YYYY") : "-",
                    plannedFinish: activity.end ? dayjs(activity.end).format("DD-MM-YYYY") : "-",
                    actualStart: activity.actualStart || null,
                    actualFinish: activity.actualFinish || null,
                    isModule: false,
                    activityStatus: activity.activityStatus || "yetToStart",
                    fin_status: activity.fin_status || '',
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
            setSelectedModules(finDataSource.slice(0, 1).map((m: any) => m.Code));
        } else {
            setDataSource([]);
        }
    };

    const getScatterData = () => {
        switch (selectedGraph) {
            case GRAPH_TYPES.START:
                return graphData.filter(d => d.actualStart).map(d => ({ x: d.plannedStart, y: d.actualStart, activity: d.activity }));
            case GRAPH_TYPES.FINISH:
                return graphData.filter(d => d.actualFinish).map(d => ({ x: d.plannedFinish, y: d.actualFinish, activity: d.activity }));
            case GRAPH_TYPES.DELAY:
                return graphData.filter(d => d.delay !== null).map(d => ({ x: d.plannedStart, y: d.delay, activity: d.activity }));
            default:
                return [];
        }
    };

    return (
        <div className="project-statistics">
            <div className="top-heading-stats">
                <p className="main-header">Project Statistics</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="label"><p>Select Module</p></div>
                    <Select
                        mode="multiple"
                        placeholder="Select Modules"
                        style={{ width: 300 }}
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
                        style={{ width: 300 }}
                    >
                        {Object.values(GRAPH_TYPES).map(graph => (
                            <Option key={graph} value={graph}>{graph}</Option>
                        ))}
                    </Select>
                </div>
            </div>

            {getScatterData().length > 0 ? (
                <>
                    <p className="graph-title">{selectedGraph}</p>
                    <ResponsiveContainer width="100%" height={445}>
                        <ScatterChart margin={{ top: 20, right: 30, left: 40, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                scale="time"
                                domain={['auto', 'auto']}
                                tickFormatter={(tick) => dayjs(tick).format("DD MMM YY")}
                                label={{ value: selectedGraph.includes("Finish") ? "Planned Finish Date" : "Planned Start Date", position: "insideBottom", offset: -10 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                domain={selectedGraph === GRAPH_TYPES.DELAY ? [0, 'auto'] : ['auto', 'auto']}
                                tickFormatter={selectedGraph === GRAPH_TYPES.DELAY ? (tick) => `${tick}d` : (tick) => dayjs(tick).format("DD MMM YY")}
                                label={{ value: selectedGraph === GRAPH_TYPES.DELAY ? "Delay (Days)" : "Actual Date", angle: -90, position: "insideLeft", offset: -20 }}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload || payload.length === 0) return null;

                                    const plannedDate = dayjs(label).format("DD-MM-YYYY");
                                    const value = payload[0].value;

                                    if (selectedGraph === GRAPH_TYPES.DELAY) {
                                        return (
                                            <div style={{ background: 'white', padding: '8px', border: '1px solid #ccc' }}>
                                                <p style={{ margin: 0 }}>Planned: {plannedDate}</p>
                                                <p style={{ margin: 0, color: '#FF8042' }}>Delay (days): {value} days</p>
                                            </div>
                                        );
                                    }

                                    const actualDate = dayjs(Number(value)).format("DD-MM-YYYY");
                                    const axisLabel = selectedGraph === GRAPH_TYPES.START ? 'Actual Start' : 'Actual Finish';
                                    const xLabel = selectedGraph === GRAPH_TYPES.START ? 'Planned Start' : 'Planned Finish';

                                    return (
                                        <div style={{ background: 'white', padding: '8px', border: '1px solid #ccc' }}>
                                            <p style={{ margin: 0 }}>{xLabel}: {plannedDate}</p>
                                            <p style={{ margin: 0 }}>{axisLabel}: {actualDate}</p>
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