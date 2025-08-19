import { useEffect, useState } from "react";
import "../styles/status-update.css";
import { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { Table } from "antd";
import eventBus from "../Utils/EventEmitter";
import { db } from "../Utils/dataStorege.ts";
import { getCurrentUser } from "../Utils/moduleStorage";
import { FolderOpenOutlined } from "@mui/icons-material";

interface Activity {
  code: string;
  activityName: string;
  prerequisite: string;
  slack: string;
  level: string;
  duration: number | string;
  start: string | null;
  end: string | null;
  activityStatus: string | null;
  actualStart?: string | null;
  actualFinish?: string | null;
  actualDuration?: number;
  notes?: any[];
  raci?: any;
  cost?: {
    dprCost?: number | string;
    projectCost?: number | string;
    opCost?: number | string;
    oppertunityCost?: number | string;
  };
  documents?: any;
}

interface Module {
  parentModuleCode: string;
  moduleName: string;
  activities: Activity[];
  moduleType?: string;
  orgId?: string;
}

type RowItem = {
  key: string;
  SrNo: string;
  Code: string;
  keyActivity: string;
  duration?: string | number;
  preRequisite?: string;
  notes?: any[];
  raci?: any;
  cost?: any;
  documents?: any;
  projectCost?: string | number;
  opCost?: string | number;
  dprCost?: string | number;
  isModule?: boolean;
  isTotal?: boolean;
  moduleName?: string;
};

const DPRCostBuilder = () => {
  const navigate = useNavigate();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<RowItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [modulesData, setModulesData] = useState<Module[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    db.getModules()
      .then((mods: Module[]) =>
        setModulesData(
          (mods || []).filter(
            (mod: any) => mod.orgId == currentUser.orgId && mod.moduleType != "MDTS"
          )
        )
      )
      .catch((err: any) => {
        console.error("Error fetching modules:", err);
        setModulesData([]);
      });
  }, [currentUser]);

  useEffect(() => {
    handleLibraryChange(modulesData);
  }, [modulesData]);

  const toNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number") return isFinite(val) ? val : 0;
    const n = parseFloat(String(val).replace(/,/g, "").trim());
    return isNaN(n) ? 0 : n;
  };

  const handleLibraryChange = (libraryItems: Module[]) => {
    if (!libraryItems || libraryItems.length === 0) {
      setDataSource([]);
      return;
    }

    const finDataSource: RowItem[] = libraryItems.map((module: Module, moduleIndex: number) => {
      let moduleDprTotal = 0;

      const children: RowItem[] = (module.activities || []).map(
        (activity: Activity, actIndex: number) => {
          const dprCostVal =
            activity?.cost?.dprCost !== undefined ? toNumber(activity.cost.dprCost) : 0;
          moduleDprTotal += dprCostVal;

          return {
            key: `activity-${moduleIndex}-${actIndex}`,
            SrNo: module.parentModuleCode,
            Code: activity.code,
            keyActivity: activity.activityName,
            duration: activity.duration ?? "",
            preRequisite: activity.prerequisite ?? "-",
            notes: activity.notes || [],
            raci: activity.raci || {},
            cost: activity.cost || {},
            documents: activity.documents || {},
            projectCost:
              activity.cost?.projectCost !== undefined ? activity.cost.projectCost : "",
            opCost: activity.cost?.opCost !== undefined ? activity.cost.opCost : "",
            dprCost:
              activity.cost?.dprCost !== undefined && toNumber(activity.cost.dprCost) > 0
                ? activity.cost.dprCost
                : "-",
          };
        }
      );

      children.push({
        key: `module-${moduleIndex}-total`,
        SrNo: "",
        Code: "",
        keyActivity: "Total DPR",
        isTotal: true,
        moduleName: module.moduleName,
        dprCost: moduleDprTotal,
      });

      return {
        key: `module-${moduleIndex}`,
        SrNo: module.parentModuleCode,
        Code: module.parentModuleCode,
        keyActivity: module.moduleName,
        isModule: true,
        children,
      } as RowItem;
    });

    setDataSource(finDataSource);
    setExpandedKeys(finDataSource.map((_, index) => `module-${index}`));
  };

  const baseColumns: ColumnsType<RowItem> = [
    {
      title: "Sr No",
      dataIndex: "Code",
      key: "Code",
      width: 100,
      align: "center",
      render: (value, record) => {
        if (record.isTotal) {
          return { children: null, props: { colSpan: 0 } as any };
        }
        return value;
      },
    },
    {
      title: "Key Activity",
      dataIndex: "keyActivity",
      key: "keyActivity",
      width: 250,
      align: "left",
      render: (_, record) => {
        if (record.isTotal) {
          return {
            children: (
              <div style={{ fontWeight: 600, textAlign: "right", paddingRight: 8 }}>
                {/* Total DPR ({record.moduleName}) */}
                Total DPR Cost
              </div>
            ),
            props: { colSpan: 4 } as any,
          };
        }
        return `${record.keyActivity ?? ""}`;
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 80,
      align: "center",
      render: (_, record) => {
        if (record.isTotal) {
          return { children: null, props: { colSpan: 0 } as any };
        }
        return `${record.duration ?? ""}`;
      },
    },
    {
      title: "Pre-Requisite",
      dataIndex: "preRequisite",
      key: "preRequisite",
      width: 120,
      align: "center",
      render: (value, record) => {
        if (record.isTotal) {
          return { children: null, props: { colSpan: 0 } as any };
        }
        return value;
      },
    },
    {
      title: "DPR Cost",
      dataIndex: "dprCost",
      key: "dprCost",
      width: 120,
      align: "right",
      render: (value, record) => {
        if (record.isModule) {
          return "";
        }

        const content =
          value === "-" ? "-" : new Intl.NumberFormat("en-IN").format(toNumber(value));

        if (record.isTotal) {
          return (
            <div
              style={{
                fontWeight: 700,
                borderTop: "1px solid #eee",
                padding: "8px 4px",
              }}
            >
              {content}
            </div>
          );
        }
        return content;
      },
    }
  ];

  const findActivityByKey = (list: any[], key: string): any => {
    for (const item of list) {
      if (item.key == key) return item;
      if (item.children) {
        const result = findActivityByKey(item.children, key);
        if (result) return result;
      }
    }
    return null;
  };

  return (
    <>
      <div className="status-heading">
        <div className="status-update-header">
          <p>DPR Cost Builder</p>
        </div>
      </div>

      <div className="main-status-update">
        {modulesData?.length > 0 ? (
          <>
            <div className="status-update-items">
              <div className="status-update-table">
                <Table<RowItem>
                  columns={baseColumns}
                  dataSource={dataSource}
                  className="project-timeline-table"
                  pagination={false}
                  expandable={{
                    expandedRowRender: () => null,
                    rowExpandable: (record: any) => !!record.children && record.children.length > 0,
                    expandedRowKeys: expandedKeys,
                    onExpand: (expanded, record: any) => {
                      setExpandedKeys(
                        expanded
                          ? [...expandedKeys, record.key]
                          : expandedKeys.filter((key) => key !== record.key)
                      );
                    },
                  }}
                  rowClassName={(record) => {
                    if (record.isModule) return "module-header";
                    if (record.isTotal) return "module-total-row";
                    return "activity-row";
                  }}
                  bordered
                  scroll={{
                    x: "max-content",
                    y: "calc(100vh - 200px)",
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="container-msg">
            <div className="no-project-message">
              <FolderOpenOutlined style={{ fontSize: "50px", color: "grey" }} />
              <>
                <h3>No Module Found</h3>
                <p>You need to create a module.</p>
                <button
                  onClick={() => {
                    eventBus.emit("updateTab", "/modules");
                    navigate(`/modules`);
                  }}
                >
                  Create Module
                </button>
              </>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DPRCostBuilder;
