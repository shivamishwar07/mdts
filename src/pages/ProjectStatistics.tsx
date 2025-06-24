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
    FINISH: "Planned Finish vs Actual Finish"
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
                setDataSource(timelineData);

                const allModules = timelineData.map((mod: any) => mod.parentModuleCode);
                setSelectedModules(allModules);
            }
        } catch (error) {
            console.error("An unexpected error occurred while fetching projects:", error);
        }
    };

    useEffect(() => {
        if (selectedModules.length > 0 && dataSource.length > 0) {
            const selectedActivities = dataSource
                .filter((mod: any) => selectedModules.includes(mod.parentModuleCode))
                .flatMap((mod: any) => mod.activities || []);

            const formatted = selectedActivities.map((activity: any) => {
                const plannedStart = dayjs(activity.start);
                const actualStart = dayjs(activity.actualStart, "DD-MM-YYYY", true);
                const plannedFinish = dayjs(activity.end);
                const actualFinish = dayjs(activity.actualFinish, "DD-MM-YYYY", true);

                return {
                    activity: activity.activityName,
                    plannedStart: plannedStart.isValid() ? plannedStart.valueOf() : null,
                    actualStart: actualStart.isValid() ? actualStart.valueOf() : null,
                    plannedFinish: plannedFinish.isValid() ? plannedFinish.valueOf() : null,
                    actualFinish: actualFinish.isValid() ? actualFinish.valueOf() : null
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

    const getScatterData = () => {
        switch (selectedGraph) {
            case GRAPH_TYPES.START:
                return graphData.filter(d => d.actualStart).map(d => ({ x: d.plannedStart, y: d.actualStart, activity: d.activity }));
            case GRAPH_TYPES.FINISH:
                return graphData.filter(d => d.actualFinish).map(d => ({ x: d.plannedFinish, y: d.actualFinish, activity: d.activity }));
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
                            <Option key={mod.parentModuleCode} value={mod.parentModuleCode}>{mod.moduleName}</Option>
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
                                domain={[
                                    (dataMin: number) => dayjs(dataMin).subtract(7, 'day').valueOf(),
                                    'auto'
                                ]}
                                tickFormatter={(tick) => dayjs(tick).format("DD MMM YY")}
                                label={{
                                    value: selectedGraph === GRAPH_TYPES.FINISH ? "Planned Finish Date" : "Planned Start Date",
                                    position: "insideBottom",
                                    offset: -10
                                }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                domain={['auto', 'auto']}
                                tickFormatter={(tick) => dayjs(tick).format("DD MMM YY")}
                                label={{
                                    value: selectedGraph === GRAPH_TYPES.FINISH ? "Actual Finish" : "Actual Start",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: -20
                                }}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload || payload.length === 0) return null;

                                    const plannedDate = dayjs(label).format("DD-MM-YYYY");
                                    const actualDate = dayjs(Number(payload[0].value)).format("DD-MM-YYYY");
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