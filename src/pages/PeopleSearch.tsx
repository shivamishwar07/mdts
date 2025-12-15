import "../styles/peoplesearch.css";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Input, List, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FolderOpenOutlined, UserOutlined } from "@ant-design/icons";
import "../styles/manageraci.css";
import eventBus from "../Utils/EventEmitter";
import { db } from "../Utils/dataStorege";
import { getCurrentUser } from "../Utils/moduleStorage";
import "../styles/status-update.css";

const { Text } = Typography;

interface Activity {
    code: string;
    activityName: string;
    start: string | null;
    end: string | null;
    actualStart?: string | null;
    actualFinish?: string | null;
    activityStatus: string | null;
    raci?: {
        responsible?: string;
        accountable?: string;
        consulted?: string[];
        informed?: string[];
    };
}

interface Module {
    parentModuleCode: string;
    moduleName: string;
    activities: Activity[];
}

interface PersonRaciRow {
    key: string;
    moduleName: string;
    activityName: string;
    plannedStart: string;
    plannedFinish: string;
    actualStart: string;
    actualFinish: string;
    activityStatus: string;
    category: string;
}

interface PersonProjectBlock {
    projectId: string;
    projectName: string;
    rows: PersonRaciRow[];
}
const PeopleSearch = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [allProjects, setAllProjects] = useState<any[]>([]);
    const [userOptions, setUserOptions] = useState<any[]>([]);
    const [selectedPersonId, setSelectedPersonId] = useState<string | undefined>();
    const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
    const [personProjects, setPersonProjects] = useState<PersonProjectBlock[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    const userMap = useMemo(
        () => Object.fromEntries(userOptions.map((u: any) => [u.id, u])),
        [userOptions]
    );

    useEffect(() => {
        const fetchUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!currentUser?.orgId) return;

        const init = async () => {
            const storedProjects = (await db.getProjects()).filter(
                (p: any) => p.orgId === currentUser.orgId
            );
            setAllProjects(storedProjects);

            const allUsers = (await db.getUsers()).filter(
                (u: any) => u.orgId === currentUser.orgId
            );
            setUserOptions(allUsers);
        };

        init();
    }, [currentUser]);

    const getProjectTimeline = async (project: any) => {
        if (Array.isArray(project?.projectTimeline)) {
            try {
                const projectTimeline = project.projectTimeline;
                if (!projectTimeline.length) return [];

                const latestTimelineMeta = projectTimeline[projectTimeline.length - 1];
                const timelineId = latestTimelineMeta.timelineId;

                const timeline = await db.getProjectTimelineById(timelineId);
                if (!Array.isArray(timeline)) {
                    console.warn("Timeline is not array", timeline);
                    return [];
                }
                const finTimeline = timeline.map(({ id, ...rest }: any) => rest);
                return finTimeline as Module[];
            } catch (e) {
                console.error("Error fetching timeline:", e);
                return [];
            }
        }

        if (Array.isArray(project?.initialStatus?.items)) {
            return project.initialStatus.items.filter(
                (item: any) => item?.status?.toLowerCase() !== "completed"
            );
        }

        return [];
    };

    const buildPersonProjects = async (personId: string) => {
        if (!personId || !allProjects.length) {
            setPersonProjects([]);
            return;
        }

        const blocks: PersonProjectBlock[] = [];

        for (const project of allProjects) {
            const modules = await getProjectTimeline(project);
            if (!Array.isArray(modules)) continue;

            const rows: PersonRaciRow[] = [];

            modules.forEach((module: Module, moduleIndex: number) => {
                (module.activities || []).forEach(
                    (activity: Activity, actIndex: number) => {
                        const raci = activity.raci || {};
                        const categories: string[] = [];

                        if (raci.responsible === personId) categories.push("R");
                        if (raci.accountable === personId) categories.push("A");
                        if ((raci.consulted || []).includes(personId)) categories.push("C");
                        if ((raci.informed || []).includes(personId)) categories.push("I");

                        if (!categories.length) return;

                        const plannedStart = activity.start
                            ? dayjs(activity.start).format("DD-MM-YYYY")
                            : "-";
                        const plannedFinish = activity.end
                            ? dayjs(activity.end).format("DD-MM-YYYY")
                            : "-";

                        const actualStart =
                            activity.actualStart && activity.actualStart !== "null"
                                ? activity.actualStart
                                : "";
                        const actualFinish =
                            activity.actualFinish && activity.actualFinish !== "null"
                                ? activity.actualFinish
                                : "";

                        rows.push({
                            key: `${project.id}-${moduleIndex}-${actIndex}`,
                            moduleName: module.moduleName,
                            activityName: activity.activityName,
                            plannedStart,
                            plannedFinish,
                            actualStart,
                            actualFinish,
                            activityStatus: activity.activityStatus || "yetToStart",
                            category: categories.join(","),
                        });
                    }
                );
            });

            if (rows.length) {
                blocks.push({
                    projectId: project.id,
                    projectName: project.projectParameters.projectName,
                    rows,
                });
            }
        }

        setPersonProjects(blocks);
    };

    useEffect(() => {
        if (!selectedPersonId) {
            setPersonProjects([]);
            setSelectedPerson(null);
            return;
        }

        const person = userMap[selectedPersonId];
        setSelectedPerson(person || null);
        buildPersonProjects(selectedPersonId);
    }, [selectedPersonId, allProjects, userMap]);

    const columns: ColumnsType<PersonRaciRow> = [
        {
            title: "Module Name",
            dataIndex: "moduleName",
            key: "moduleName",
            width: 220,
        },
        {
            title: "Activity",
            dataIndex: "activityName",
            key: "activityName",
            width: 260,
        },
        {
            title: "Planned Start",
            dataIndex: "plannedStart",
            key: "plannedStart",
            width: 130,
            align: "center",
        },
        {
            title: "Planned Finish",
            dataIndex: "plannedFinish",
            key: "plannedFinish",
            width: 130,
            align: "center",
        },
        {
            title: "Actual Start",
            dataIndex: "actualStart",
            key: "actualStart",
            width: 130,
            align: "center",
            render: (val: string) => val || "—",
        },
        {
            title: "Actual Finish",
            dataIndex: "actualFinish",
            key: "actualFinish",
            width: 130,
            align: "center",
            render: (val: string) => val || "—",
        },
        {
            title: "Status",
            dataIndex: "activityStatus",
            key: "activityStatus",
            width: 120,
            align: "center",
            render: (status: string) => {
                if (!status) return "—";
                const st = status.toLowerCase();
                if (st === "yettostart") return <Tag>Yet to Start</Tag>;
                if (st === "inprogress") return <Tag color="blue">In Progress</Tag>;
                if (st === "completed") return <Tag color="green">Completed</Tag>;
                return <Tag>{status}</Tag>;
            },
        },
        {
            title: "Category (R/A/C/I)",
            dataIndex: "category",
            key: "category",
            width: 120,
            align: "center",
        },
    ];

    const matchedUsers = useMemo(() => {
        if (!searchText) return [];
        const lower = searchText.toLowerCase();
        return userOptions.filter((u: any) => {
            const name = (u.name || "").toLowerCase();
            const email = (u.email || u.primaryEmail || "").toLowerCase();
            return name.startsWith(lower) || email.startsWith(lower);
        });
    }, [searchText, userOptions]);

    return (
        <div className="people-search-container">
            <div className="people-search-top-container status-update-header raci-header">
                <span>Search by People – RACI View</span>
            </div>
            {allProjects.length ? (
                <div className="people-search-body">
                    <div className="raci-toolbar">
                        <div className="raci-search-container">
                            <Input
                                className="raci-search-input"
                                placeholder="Type name or email"
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                prefix={<UserOutlined />}
                                allowClear
                            />
                        </div>

                        {selectedPerson && (
                            <div className="raci-person-details">
                                <div>
                                    <Text strong>Name:&nbsp;</Text>
                                    <Text>{selectedPerson.name || "-"}</Text>
                                </div>
                                <div>
                                    <Text strong>Contact:&nbsp;</Text>
                                    <Text>
                                        {selectedPerson.phone ||
                                            selectedPerson.contact ||
                                            selectedPerson.mobile ||
                                            "-"}
                                    </Text>
                                </div>
                                <div>
                                    <Text strong>Email:&nbsp;</Text>
                                    <Text>
                                        {selectedPerson.email ||
                                            selectedPerson.primaryEmail ||
                                            "-"}
                                    </Text>
                                </div>
                            </div>
                        )}
                    </div>

                    {showSuggestions && searchText && (
                        <div className="raci-suggestion-wrapper">
                            <List
                                className="raci-suggestion-list"
                                bordered
                                size="small"
                                dataSource={matchedUsers}
                                locale={{ emptyText: "No records found" }}
                                renderItem={(user: any) => (
                                    <List.Item
                                        className="raci-suggestion-item"
                                        onClick={() => {
                                            setSelectedPersonId(user.id);
                                            setSearchText(user.name || "");
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <div className="raci-suggestion-content">
                                            <span className="raci-suggestion-name">
                                                {user.name}
                                            </span>
                                            <span className="raci-suggestion-email">
                                                {user.email || user.primaryEmail || "-"}
                                            </span>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}

                    <hr className="raci-divider" />

                    {!selectedPerson && (
                        <div className="container-msg">
                            <div className="no-project-message">
                                <FolderOpenOutlined className="raci-empty-icon" />
                                <h3>No Person Selected</h3>
                                <p>Please search and select a person to see RACI details.</p>
                            </div>
                        </div>
                    )}

                    {selectedPerson && personProjects.length === 0 && (
                        <div className="container-msg">
                            <div className="no-project-message">
                                <FolderOpenOutlined className="raci-empty-icon" />
                                <h3>No RACI Assignments</h3>
                                <p>
                                    This person is currently not mapped as R/A/C/I in any
                                    project.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="raci-main-page">
                        {selectedPerson &&
                            personProjects.map((project) => {
                                if (!project.rows.length) return null;

                                return (
                                    <div
                                        key={project.projectId}
                                        className="raci-project-block status-update-items"
                                    >
                                        <div className="raci-project-header">
                                            {project.projectName}
                                        </div>
                                        <div className="status-update-table">
                                            <Table<PersonRaciRow>
                                                rowKey="key"
                                                columns={columns}
                                                dataSource={project.rows}
                                                pagination={false}
                                                bordered
                                                scroll={{
                                                    x: "max-content",
                                                    y: "calc(50vh - 80px)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            ) : (
                <div className="container-msg">
                    <div className="no-project-message">
                        <FolderOpenOutlined className="raci-empty-icon" />
                        <h3>No Projects Found</h3>
                        <p>
                            You need to create a project and its timeline before viewing
                            RACI.
                        </p>
                        <button
                            onClick={() => {
                                eventBus.emit("updateTab", "/create/register-new-project");
                            }}
                        >
                            Create Project
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PeopleSearch;