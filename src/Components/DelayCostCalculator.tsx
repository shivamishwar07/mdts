// import { useEffect, useState } from "react";
// import "../styles/status-update.css";
// import { ColumnsType } from "antd/es/table";
// import dayjs from "dayjs";
// import { FolderOpenOutlined } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import { Select, Table } from "antd";
// import eventBus from "../Utils/EventEmitter";
// import { db } from "../Utils/dataStorege.ts";
// import { getCurrentUser } from '../Utils/moduleStorage';

// const { Option } = Select;

// const DelayCostCalculator = () => {
//   const navigate = useNavigate();
//   const [expandedKeys, setExpandedKeys] = useState<any>([]);
//   const [allProjects, setAllProjects] = useState<any[]>([]);
//   const [selectedProjectId, setSelectedProjectId] = useState(null);
//   const [selectedProject, setSelectedProject] = useState<any>(null);
//   const [dataSource, setDataSource] = useState<any>([]);
//   const [currentUser, setCurrentUser] = useState<any>(null);

//   useEffect(() => {
//     const fetchUser = async () => {
//       const user = await getCurrentUser();
//       setCurrentUser(user);
//     };
//     fetchUser();
//   }, []);

//   useEffect(() => {
//     if (currentUser && currentUser.orgId) {
//       setup();
//     }
//   }, [currentUser]);

//   const setup = async () => {
//     const projects = (await db.getProjects()).filter(p => p.orgId === currentUser.orgId);
//     setAllProjects(projects);
//     let selected = null;
//     const lastId = localStorage.getItem("selectedProjectId");
//     if (projects.length === 1) selected = projects[0];
//     else if (lastId) selected = projects.find(p => p.id == lastId);
//     if (selected) {
//       setSelectedProjectId(selected.id);
//       setSelectedProject(selected);
//       const timelineId = selected.projectTimeline?.[0]?.timelineId;

//       if (timelineId) {
//         const timeline = await db.getProjectTimelineById(timelineId);
//         const finTimeline = timeline.map(({ id, ...rest }: any) => rest);
//         const viewData = finTimeline.map((mod: any, i: number) => ({
//           key: `mod-${i}`,
//           Code: mod.parentModuleCode,
//           keyActivity: mod.moduleName,
//           isModule: true,
//           children: (mod.activities || []).map((act: any, j: number) => ({
//             key: `act-${i}-${j}`,
//             Code: act.code,
//             keyActivity: act.activityName,
//             preRequisite: act.prerequisite ?? '-',
//             plannedStart: act.start ? act.start : '-',
//             plannedFinish: act.end ? act.end : '-',
//             actualStart: act.start ? act.actualStart : '-',
//             actualFinish: act.end ? act.actualFinish : '-',
//             delay: getWeekdayDifferenceInDays(act.end, act.start),
//             projectCost: act.cost.projectCost ?? '',
//             opCost: act.cost.opCost ?? '',
//           }))
//         }));
//         setDataSource(viewData);
//         setExpandedKeys(viewData.map((_: any, idx: any) => `mod-${idx}`));
//       }
//     }
//   };

//   const baseColumns: ColumnsType = [
//     { title: "Sr No", dataIndex: "Code", key: "Code", align: "center", width: 100 },
//     { title: "Key Activity", dataIndex: "keyActivity", key: "keyActivity", width: 250 },
//     { title: "Pre-Requisite", dataIndex: "preRequisite", key: "preRequisite", align: "center", width: 120 },
//     { title: "Planned Start", dataIndex: "plannedStart", key: "plannedStart", align: "center", width: 120 },
//     { title: "Planned Finish", dataIndex: "plannedFinish", key: "plannedFinish", align: "center", width: 120 },
//     { title: "Actual Start", dataIndex: "actualStart", key: "actualStart", align: "center", width: 120 },
//     { title: "Actual Finish", dataIndex: "actualFinish", key: "actualFinish", align: "center", width: 120 },
//     { title: "Delay (Days)", dataIndex: "delay", key: "delay", align: "center", width: 120 },
//     { title: "Project Cost", dataIndex: "projectCost", key: "projectCost", align: "right", width: 120 },
//     { title: "Oppertunity Cost", dataIndex: "opCost", key: "opCost", align: "right", width: 120 },
//   ];

//   const handleProjectChange = async (projectId: any) => {
//     setSelectedProjectId(projectId);
//     const project = allProjects.find(p => p.id === projectId);
//     localStorage.setItem("selectedProjectId", projectId);
//     if (project?.projectTimeline?.length) {
//       const timelineId = project.projectTimeline[0].timelineId;
//       const timeline = await db.getProjectTimelineById(timelineId);
//       const finTimeline = timeline.map(({ id, ...rest }: any) => rest);
//       const viewData = finTimeline.map((mod: any, i: number) => ({
//         key: `mod-${i}`,
//         Code: mod.parentModuleCode,
//         keyActivity: mod.moduleName,
//         isModule: true,
//         children: (mod.activities || []).map((act: any, j: number) => ({
//           key: `act-${i}-${j}`,
//           Code: act.code,
//           keyActivity: act.activityName,
//           duration: act.duration ?? '',
//           preRequisite: act.prerequisite ?? '-',
//           slack: act.slack ?? '0',
//           plannedStart: act.start ? dayjs(act.start).format("DD-MM-YYYY") : '-',
//           plannedFinish: act.end ? dayjs(act.end).format("DD-MM-YYYY") : '-',
//         }))
//       }));
//       setSelectedProject(project);
//       setDataSource(viewData);
//       setExpandedKeys(viewData.map((_: any, idx: any) => `mod-${idx}`));
//     } else {
//       setDataSource([]);
//     }
//   };

//   const getWeekdayDifferenceInDays = (date1: any, date2: any): number => {
//     let start = new Date(date2);
//     let end = new Date(date1);

//     if (start > end) {
//       [start, end] = [end, start];
//     }

//     let count = 0;

//     while (start <= end) {
//       const day = start.getDay();
//       if (day !== 0 && day !== 6) {
//         count++;
//       }
//       start.setDate(start.getDate() + 1);
//     }

//     return count;
//   };

//   return (
//     <>
//       <div className="status-heading">
//         <div className="status-update-header">
//           <p>Delay Cost Builder</p>
//           <div className="flex-item">
//             <label htmlFor="" style={{ fontWeight: "bold", marginTop: "3px", width: "100%" }}>Select Project</label>
//             <Select
//               placeholder="Select Project"
//               value={selectedProjectId}
//               onChange={handleProjectChange}
//               popupMatchSelectWidth={false}
//               style={{ width: "100%" }}
//             >
//               {allProjects.map((project) => (
//                 <Option key={project.id} value={project.id}>
//                   {project.projectParameters.projectName}
//                 </Option>
//               ))}
//             </Select>
//           </div>
//         </div>
//       </div>

//       <div className="main-status-update">
//         {selectedProject?.projectTimeline != null ? (
//           <>
//             <div className="status-update-items">
//               <div className="status-update-table">
//                 <Table
//                   columns={baseColumns}
//                   dataSource={dataSource}
//                   className="project-timeline-table"
//                   pagination={false}
//                   expandable={{
//                     expandedRowRender: () => null,
//                     rowExpandable: (record) => record.children && record.children.length > 0,
//                     expandedRowKeys: expandedKeys,
//                     onExpand: (expanded, record) => {
//                       setExpandedKeys(
//                         expanded
//                           ? [...expandedKeys, record.key]
//                           : expandedKeys.filter((key: any) => key !== record.key)
//                       );
//                     },
//                   }}
//                   rowClassName={(record) => record.isModule ? "module-header" : "activity-row"}
//                   bordered
//                   scroll={{
//                     x: "max-content",
//                     y: "calc(100vh - 250px)",
//                   }}
//                 />
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="container-msg">
//             <div className="no-project-message">
//               <FolderOpenOutlined style={{ fontSize: "50px", color: "grey" }} />
//               {selectedProject?.projectTimeline == null ? (
//                 <>
//                   <h3>No Projects Timeline Found</h3>
//                   <p>You need to create a project for defining a timeline.</p>
//                   <button
//                     onClick={() => {
//                       eventBus.emit("updateTab", "/create/register-new-project");
//                       navigate(`/create/timeline-builder`);
//                     }}
//                   >
//                     Create Project Timeline
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <h3>No Project Selected</h3>
//                   <p>Please select a project to continue.</p>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default DelayCostCalculator

import { useEffect, useState } from "react";
import "../styles/status-update.css";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd";

const DelayCostCalculator = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);

  useEffect(() => {
    const data = getStaticTimeline();
    setDataSource(data);
    setExpandedKeys(data.map((item: any) => item.key));
  }, []);

  const baseColumns: ColumnsType<any> = [
    { title: "Sr No", dataIndex: "Code", key: "Code", align: "center", width: 100 },
    { title: "Key Activity", dataIndex: "keyActivity", key: "keyActivity", width: 240 },
    { title: "Pre-Requisite", dataIndex: "preRequisite", key: "preRequisite", align: "center", width: 120 },
    { title: "Planned Start", dataIndex: "plannedStart", key: "plannedStart", align: "center", width: 120 },
    { title: "Planned Finish", dataIndex: "plannedFinish", key: "plannedFinish", align: "center", width: 120 },
    { title: "Actual Start", dataIndex: "actualStart", key: "actualStart", align: "center", width: 120 },
    { title: "Actual Finish", dataIndex: "actualFinish", key: "actualFinish", align: "center", width: 120 },
    {
      title: "Delay (Days)",
      dataIndex: "delay",
      key: "delay",
      align: "center",
      width: 100,
      sorter: (a, b) => a.delay - b.delay,
      render: (value: number) => {
        let color = "#52c41a"; // green
        if (value > 30) color = "#ff4d4f"; // red
        else if (value > 10) color = "#faad14"; // orange

        return <span style={{ color, fontWeight: value > 0 ? 600 : 400 }}>{value}</span>;
      }
    },
    {
      title: "Project Cost (/day)",
      dataIndex: "projectCost",
      key: "projectCost",
      align: "right",
      width: 140,
      render: (value: number) =>
        <span style={{ fontWeight: value > 2000 ? 600 : 400 }}>
          ₹{value.toLocaleString("en-IN")}
        </span>
    },
    {
      title: "Opportunity Cost (/day)",
      dataIndex: "opCost",
      key: "opCost",
      align: "right",
      width: 150,
      render: (value: number) =>
        <span style={{ fontWeight: value > 2000 ? 600 : 400 }}>
          ₹{value.toLocaleString("en-IN")}
        </span>
    },
  ];

  const getStaticTimeline = () => {
    const activities = [
      {
        "code": "CF/10",
        "activityName": "Declaration as H1 Bidder",
        "prerequisite": null,
        "start": "01-05-2025",
        "end": "02-05-2025",
        "actualStart": "01-05-2025",
        "actualFinish": "05-08-2025",
        "cost": {
          "projectCost": 1000,
          "opCost": 1000
        },
        "delay": 95
      },
      {
        "code": "CF/20",
        "activityName": "Signing of CBDPA",
        "prerequisite": "CF/10",
        "start": "05-05-2025",
        "end": "16-06-2025",
        "actualStart": "06-08-2025",
        "actualFinish": "17-09-2025",
        "cost": {
          "projectCost": 2000,
          "opCost": 2000
        },
        "delay": 93
      },
      {
        "code": "CF/30",
        "activityName": "Payment to MoC",
        "prerequisite": "CF/20",
        "start": "17-06-2025",
        "end": "29-07-2025",
        "actualStart": "18-09-2025",
        "actualFinish": "30-10-2025",
        "cost": {
          "projectCost": 3000,
          "opCost": 3000
        },
        "delay": 63
      },
      {
        "code": "GY/10",
        "activityName": "Preparation of NFA for interim budget",
        "prerequisite": null,
        "start": "01-06-2025",
        "end": "15-06-2025",
        "actualStart": "01-06-2025",
        "actualFinish": "15-06-2025",
        "cost": {
          "projectCost": 500,
          "opCost": 500
        },
        "delay": 0
      },
      {
        "code": "GY/20",
        "activityName": "Approval of Interim Budget",
        "prerequisite": "GY/10",
        "start": "23-06-2025",
        "end": "14-07-2025",
        "actualStart": "23-06-2025",
        "actualFinish": "10-07-2025",
        "cost": {
          "projectCost": 1000,
          "opCost": 1000
        },
        "delay": -4
      },
      {
        "code": "GY/30",
        "activityName": "Preparation of DPR",
        "prerequisite": "GY/20",
        "start": "15-07-2025",
        "end": "18-11-2025",
        "actualStart": "15-07-2025",
        "actualFinish": "18-11-2025",
        "cost": {
          "projectCost": 1500,
          "opCost": 1500
        },
        "delay": 0
      },
      {
        "code": "RD/10",
        "activityName": "Requirement Finalization",
        "prerequisite": null,
        "start": "10-06-2025",
        "end": "20-06-2025",
        "actualStart": "10-06-2025",
        "actualFinish": "30-06-2025",
        "cost": {
          "projectCost": 800,
          "opCost": 900
        },
        "delay": 10
      },
      {
        "code": "RD/20",
        "activityName": "Development",
        "prerequisite": "RD/10",
        "start": "21-06-2025",
        "end": "15-07-2025",
        "actualStart": "01-07-2025",
        "actualFinish": "25-07-2025",
        "cost": {
          "projectCost": 2500,
          "opCost": 3000
        },
        "delay": 10
      }
    ]

    const parseDate = (dateString: string) => {
      const [day, month, year] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const calculateDelay = (plannedFinishStr: string, actualFinishStr: string) => {
      const plannedFinish = parseDate(plannedFinishStr);
      const actualFinish = parseDate(actualFinishStr);
      if (actualFinish <= plannedFinish) return 0;
      const diffTime = actualFinish.getTime() - plannedFinish.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const augmentedActivities = activities.map(a => ({
      ...a,
      delay: calculateDelay(a.end, a.actualFinish),
      children: [] as any[],
    }));
    const activityMap = new Map(augmentedActivities.map(a => [a.code, a]));

    const allRoots: any[] = [];
    augmentedActivities.forEach(activity => {
      if (activity.prerequisite && activityMap.has(activity.prerequisite)) {
        activityMap.get(activity.prerequisite)!.children.push(activity);
      } else {
        allRoots.push(activity);
      }
    });

    const delayedHeaders: any[] = [];
    const collectAllDescendants = (node: any, descendants: any[] = []) => {
      for (const child of node.children) {
        descendants.push(child);
        collectAllDescendants(child, descendants);
      }
      return descendants;
    };

    const findDelayedChains = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.delay > 0) {
          const flatDescendants = collectAllDescendants(node);
          const cleanedDescendants = flatDescendants.map(desc => ({ ...desc, children: undefined }));
          const headerWithFlatChildren = {
            ...node,
            children: cleanedDescendants,
          };
          delayedHeaders.push(headerWithFlatChildren);

        } else {
          findDelayedChains(node.children);
        }
      });
    };
    findDelayedChains(allRoots);

    const mapActivityToRow = (a: any): any => ({
      key: a.code,
      Code: a.code,
      keyActivity: a.activityName,
      preRequisite: a.prerequisite ?? '-',
      plannedStart: a.start,
      plannedFinish: a.end,
      actualStart: a.actualStart,
      actualFinish: a.actualFinish,
      delay: a.delay,
      projectCost: a.cost.projectCost,
      opCost: a.cost.opCost,
      children: a.children?.map(mapActivityToRow),
    });

    return delayedHeaders.map(mapActivityToRow);
  };

  return (
    <>
      <div className="status-heading">
        <div className="status-update-header">
          <p>Delay Cost Builder</p>
        </div>
      </div>
      <div className="main-status-update">
        <div className="status-update-items">
          <div className="status-update-table">
            <Table
              columns={baseColumns}
              dataSource={dataSource}
              className="project-timeline-table"
              pagination={false}
              expandable={{
                expandedRowKeys: expandedKeys,
                onExpand: (expanded, record) => {
                  setExpandedKeys(
                    expanded
                      ? [...expandedKeys, record.key]
                      : expandedKeys.filter((key) => key !== record.key)
                  );
                },
              }}
              rowClassName={(record) => {
                if (record.delay > 30) return 'row-high-delay';
                if (record.delay > 10) return 'row-medium-delay';
                return '';
              }}

              bordered
              scroll={{ x: "max-content", y: "calc(100vh - 250px)" }}
              summary={() => {
                const flatten = (rows: any[]): any[] => {
                  return rows.flatMap(row => [row, ...(row.children ? flatten(row.children) : [])]);
                };

                const allRows = flatten(dataSource);

                const totalProjectCost = allRows.reduce((sum, r) => {
                  return sum + (r.delay > 0 ? r.delay * (r.projectCost || 0) : 0);
                }, 0);

                const totalOpCost = allRows.reduce((sum, r) => {
                  return sum + (r.delay > 0 ? r.delay * (r.opCost || 0) : 0);
                }, 0);

                const formatCurrency = (value: number) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0
                  }).format(value);

                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={8} align="right">
                        <strong>Total Cost (Based on Delay × Per Day Cost)</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8} align="right">
                        <strong>{formatCurrency(totalProjectCost)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={9} align="right">
                        <strong>{formatCurrency(totalOpCost)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}

            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DelayCostCalculator;