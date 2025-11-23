import { Table, Card, Typography, Tooltip, Row, Col, Modal, Button, Space, Input, Tag, Spin, Empty } from "antd";
import { BellOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, FileTextOutlined, ReloadOutlined } from "@ant-design/icons";
import "../styles/ProjectDocs.css";
import { useEffect, useMemo, useState, useCallback } from "react";
import { db } from "../Utils/dataStorege.ts";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";

const { Text, Title } = Typography;

type DocRow = {
    guid: string;
    id: string;
    projectId: string;
    moduleCode?: string | number;
    moduleName?: string;
    activityCode?: string | number;
    activityName?: string;
    linkedActivity?: string;
    documentName: string;
    description: string;
    documentType?: string;
    fileName: string;
    filePath: string;
    milestone?: string;
    uploadedAt?: string;
    uploadedBy?: string;
};

const ProjectDocs = (project: any) => {
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [_projectDetails, setProjectDetails] = useState<any>({});
    const [documents, setDocuments] = useState<DocRow[]>([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [docTypes, setDocTypes] = useState<any[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const showModal = () => setIsModalVisible(true);
    const handleCancel = () => setIsModalVisible(false);

    const gradientColors = [
        "linear-gradient(135deg, #74ebd5, #ACB6E5)",
        "linear-gradient(135deg, #ff9a9e, #fad0c4)",
        "linear-gradient(135deg, #a18cd1, #fbc2eb)",
        "linear-gradient(135deg, #fddb92, #d1fdff)",
    ];

    useEffect(() => {
        db.getAllDocTypes().then(setDocTypes);
    }, []);

    useEffect(() => {
        if (docTypes.length && !selectedType) {
            setSelectedType(docTypes[0].name);
        }
    }, [docTypes, selectedType]);

    const pickTimelineEntry = (pr: any) => {
        const pt = Array.isArray(pr?.projectTimeline) ? pr.projectTimeline : [];
        if (!pt.length) return { entry: null, data: [] };
        const v = localStorage.getItem("latestProjectVersion");
        const byStored = v ? pt.find((t: any) => String(t?.version) === String(v)) : null;
        if (Array.isArray(byStored?.data)) return { entry: byStored, data: byStored.data };
        const approved = pt.find((t: any) => String(t?.status || "").toLowerCase() === "approved");
        if (Array.isArray(approved?.data)) return { entry: approved, data: approved.data };
        const last = pt[pt.length - 1];
        if (Array.isArray(last?.data)) return { entry: last, data: last.data };
        if (Array.isArray(pr?.processedTimelineData)) return { entry: null, data: pr.processedTimelineData };
        return { entry: null, data: [] };
    };

    const flattenDocs = (mods: any[], projectId: string) => {
        const rows: DocRow[] = [];
        (mods || []).forEach((mod: any) => {
            const moduleName = mod?.moduleName ?? mod?.keyActivity ?? mod?.SrNo ?? "";
            const moduleCode = mod?.SrNo ?? mod?.moduleCode;
            (mod?.activities || []).forEach((act: any) => {
                const activityName = act?.activityName ?? act?.keyActivity ?? "";
                const activityCode = act?.Code ?? act?.code;
                const milestone = mod?.keyActivity ?? mod?.moduleName ?? mod?.SrNo;
                (act?.activityDocuments || []).forEach((d: any) => {
                    rows.push({
                        guid: String(d.id),
                        id: String(d.id),
                        projectId,
                        moduleName,
                        moduleCode,
                        activityName,
                        activityCode,
                        linkedActivity: d.linkedActivity,
                        documentName: d.documentName,
                        description: d.description,
                        documentType: d.documentType,
                        fileName: d.fileName,
                        filePath: d.filePath,
                        milestone,
                        uploadedAt: d.uploadedAt,
                        uploadedBy: d.uploadedBy,
                    });
                });
            });
        });
        rows.sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));
        return rows;
    };

    const hydrate = useCallback(async () => {
        if (!project?.code) return;
        setLoading(true);
        try {
            const projects = await db.getProjects();
            const pr = (projects || []).find((p: any) => p.id === project.code);
            if (!pr) {
                setProjectDetails({});
                setDocuments([]);
                setLoading(false);
                return;
            }
            setProjectDetails(pr);
            const { data } = pickTimelineEntry(pr);
            if (!Array.isArray(data)) {
                setDocuments([]);
                setLoading(false);
                return;
            }
            const rows = flattenDocs(data, pr.id);
            setDocuments(rows);
        } catch (err) {
            console.error("Error loading ProjectDocs:", err);
            notify.error("Failed to load project documents.");
        } finally {
            setLoading(false);
        }
    }, [project?.code]);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        const hydrateLocal = async () => {
            if (!project?.code) return;
            const all = await db.getProjects();
            const pr = (all || []).find((p: any) => p.id === project.code);
            if (!pr) {
                setDocuments([]);
                return;
            }
            const tl = Array.isArray(pr.projectTimeline) ? pr.projectTimeline : [];
            const storedV = localStorage.getItem("latestProjectVersion");
            const byStored = storedV ? tl.find((t: any) => String(t.version) === String(storedV)) : null;
            const approved = tl.find((t: any) => String(t.status || "").toLowerCase() === "approved");
            const last = tl[tl.length - 1];
            const seqMods =
                (Array.isArray(byStored?.data) && byStored.data) ||
                (Array.isArray(approved?.data) && approved.data) ||
                (Array.isArray(last?.data) && last.data) ||
                (Array.isArray(pr.processedTimelineData) && pr.processedTimelineData) ||
                [];
            const rows = flattenDocs(seqMods, pr.id);
            setDocuments(rows);
        };
        hydrateLocal();
    }, [project?.code]);

    const filtered = useMemo(() => {
        let base = documents;
        if (selectedType) {
            base = base.filter(
                d => String(d.documentType || "").trim() === selectedType
            );
        }
        const s = q.trim().toLowerCase();
        if (!s) return base;
        return base.filter(r =>
            (r.moduleName || "").toLowerCase().includes(s) ||
            (r.activityName || "").toLowerCase().includes(s) ||
            (r.documentName || "").toLowerCase().includes(s) ||
            (r.description || "").toLowerCase().includes(s) ||
            (r.fileName || "").toLowerCase().includes(s) ||
            (r.linkedActivity || "").toLowerCase().includes(s) ||
            (r.milestone || "").toLowerCase().includes(s) ||
            (r.uploadedBy || "").toLowerCase().includes(s)
        );
    }, [documents, q, selectedType]);

    const handlePreview = async (record: DocRow) => {
        if (!record?.filePath) {
            notify.error("Invalid file path.");
            return;
        }
        const fileData = await db.getDiskEntry(record.filePath);
        if (fileData) {
            setPreviewContent(fileData);
            setPreviewVisible(true);
        } else {
            notify.error("File not found in IndexedDB.");
        }
    };

    const handleDownload = async (record: DocRow) => {
        if (!record?.filePath) {
            notify.error("Invalid file path.");
            return;
        }
        const fileData = await db.getDiskEntry(record.filePath);
        if (!fileData) {
            notify.error("File not found.");
            return;
        }
        const a = document.createElement("a");
        a.href = fileData;
        a.download = record.fileName || record.documentName || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const handleDeleteDoc = async (row: any) => {
        Modal.confirm({
            title: "Delete this document?",
            content: (
                <>
                    <div><b>{row.documentName || row.fileName}</b></div>
                    <div style={{ color: "#666" }}>{row.moduleName} → {row.activityName}</div>
                </>
            ),
            okText: "Delete",
            okButtonProps: { danger: true },
            cancelText: "Cancel",
            async onOk() {
                const docId = String(row.id);
                try {
                    const projects = await db.getProjects();
                    const pr = (projects || []).find((p: any) => p.id === row.projectId || p.id === project.code);
                    if (!pr) {
                        notify.error("Project not found.");
                        return;
                    }
                    const { entry, data } = pickTimelineEntry(pr);
                    if (!Array.isArray(data)) {
                        notify.error("No timeline data found.");
                        return;
                    }
                    const updatedMods = (data || []).map((mod: any) => ({
                        ...mod,
                        activities: (mod?.activities || []).map((act: any) => {
                            const docs = Array.isArray(act?.activityDocuments) ? act.activityDocuments : [];
                            const filteredDocs = docs.filter((d: any) => String(d.id) !== docId);
                            return filteredDocs.length !== docs.length ? { ...act, activityDocuments: filteredDocs } : act;
                        }),
                    }));
                    if (entry) {
                        const targetId = entry.versionId || entry.timelineId;
                        await db.updateProjectTimeline(targetId, updatedMods);
                        const updatedPT = (pr.projectTimeline || []).map((t: any) => {
                            const tid = t.versionId || t.timelineId;
                            return tid === targetId ? { ...t, data: updatedMods } : t;
                        });
                        await db.updateProject(pr.id, { ...pr, projectTimeline: updatedPT });
                    } else {
                        await db.updateProject(pr.id, { ...pr, processedTimelineData: updatedMods });
                    }
                    if (row.filePath) {
                        try {
                            const existing: any = await db.diskStorage.where("path").equals(row.filePath).first();
                            if (existing) {
                                await db.diskStorage.delete(existing.id ?? existing.path);
                            } else {
                                await db.diskStorage.where("path").equals(row.filePath).delete();
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    const allDocs = await db.getAllDocuments();
                    for (const d of allDocs) {
                        const originalFiles = Array.isArray(d.files) ? d.files : [];
                        const remainingFiles = originalFiles.filter(
                            (f: any) => String(f.docId || f.id) !== docId
                        );
                        if (remainingFiles.length === originalFiles.length) continue;
                        if (remainingFiles.length === 0) {
                            for (const f of originalFiles) {
                                if (f.path) {
                                    const existing: any = await db.diskStorage.where("path").equals(f.path).first();
                                    if (existing) {
                                        await db.diskStorage.delete(existing.id ?? existing.path);
                                    } else {
                                        await db.diskStorage.where("path").equals(f.path).delete();
                                    }
                                }
                            }
                            await db.deleteDocument(d.id ?? d.guid);
                        } else {
                            await db.documents.update(d.id ?? d.guid, {
                                files: remainingFiles,
                                updatedAt: new Date().toISOString()
                            });
                        }
                    }
                    notify.success("Document deleted everywhere.");
                    await hydrate();
                } catch (e) {
                    console.error("Delete failed:", e);
                    notify.error("Failed to delete document. Try again.");
                }
            },
        });
    };

    const columns: any[] = [
        {
            title: "Doc Name",
            dataIndex: "documentName",
            width: 250,
            render: (_: any, r: DocRow) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileTextOutlined />
                    <span style={{ fontWeight: 600 }}>{r.documentName || r.fileName || "Unnamed Document"}</span>
                    <Tag>{r.documentType || r.description || "—"}</Tag>
                </div>
            ),
            sorter: (a: DocRow, b: DocRow) => String(a.documentName || "").localeCompare(String(b.documentName || "")),
        },
        {
            title: "Date Of Issuance",
            dataIndex: "uploadedAt",
            width: 120,
            render: (text: string) => (text ? new Date(text).toLocaleDateString() : "—"),
            sorter: (a: DocRow, b: DocRow) => String(a.uploadedAt || "").localeCompare(String(b.uploadedAt || "")),
        },
        {
            title: "Linked Activity",
            dataIndex: "activityName",
            width: 220,
            render: (_: any, r: DocRow) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{r.activityName || "-"}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                        {r.activityCode ? `Code: ${String(r.activityCode)}` : "-"}
                        {r.linkedActivity ? ` • Link: ${r.linkedActivity}` : ""}
                    </div>
                </div>
            ),
            sorter: (a: DocRow, b: DocRow) => String(a.activityName || "").localeCompare(String(b.activityName || "")),
        },
        {
            title: "Milestone",
            dataIndex: "milestone",
            width: 180,
            render: (v: string) => v || "—",
            sorter: (a: DocRow, b: DocRow) => String(a.milestone || "").localeCompare(String(b.milestone || "")),
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 120,
            align: "center",
            render: (_: any, record: DocRow) => (
                <Space size="middle">
                    <Button icon={<EyeOutlined />} onClick={() => handlePreview(record)} size="small" />
                    <Button icon={<DownloadOutlined />} onClick={() => handleDownload(record)} size="small" />
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => handleDeleteDoc(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="project-document-cont">
            <div className="header-row">
                <Title level={3} style={{ margin: 0 }}>Project Documents</Title>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Input.Search
                        placeholder="Search module, activity, doc name, type, user…"
                        allowClear
                        onSearch={setQ}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ width: 360 }}
                    />
                    <Button icon={<ReloadOutlined />} onClick={hydrate}>Refresh</Button>
                    <Tooltip title="What's New">
                        <BellOutlined onClick={showModal} className="bell-notif" />
                    </Tooltip>
                </div>
            </div>

            <div style={{ overflowX: "auto", paddingBottom: 8 }}>
                <Row
                    gutter={[16, 16]}
                    className="summary-cards-flex"
                    style={{ flexWrap: "nowrap", minWidth: "max-content" }}
                >
                    {docTypes.length > 0 ? (
                        docTypes.map((dt: any, index: number) => {
                            const isActive = selectedType === dt.name;
                            const count = documents.filter(
                                d => String(d.documentType || "").trim() === dt.name
                            ).length;
                            return (
                                <Col
                                    xs={12}
                                    sm={8}
                                    md={6}
                                    key={dt.id || dt.name}
                                    style={{ minWidth: 180 }}
                                >
                                    <Card
                                        hoverable
                                        className={`summary-card ${isActive ? "active" : ""}`}
                                        onClick={() => setSelectedType(dt.name)}
                                        style={{
                                            background: gradientColors[index % gradientColors.length],
                                            border: isActive ? "2px solid #1890ff" : "1px solid transparent",
                                            boxShadow: isActive
                                                ? "0 4px 14px rgba(0,0,0,0.18)"
                                                : "0 1px 4px rgba(0,0,0,0.08)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Text className="count">{count}</Text>
                                        <br />
                                        <Text className="label">{dt.name}</Text>
                                    </Card>
                                </Col>
                            );
                        })
                    ) : (
                        <Col span={24}>
                            <Empty description="No Document Types Found" />
                        </Col>
                    )}
                </Row>
            </div>

            <div className="table-data">
                <Spin spinning={loading}>
                    {documents.length ? (
                        <Table
                            columns={columns}
                            dataSource={filtered}
                            pagination={false}
                            className="document-table"
                            bordered
                            rowKey="guid"
                            scroll={{
                                x: "max-content",
                                y: "calc(100vh - 360px)",
                            }}
                            style={{
                                width: "100%",
                                overflowX: "auto",
                            }}
                        />
                    ) : (
                        <Empty description="No documents found for this project" />
                    )}
                </Spin>
            </div>

            <Modal
                title="What's New"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                className="modal-container"
            >
                <div style={{ padding: "10px" }}>
                    <p><strong>New Documents</strong> have been uploaded and indexed.</p>
                    <p>Use the search box to quickly filter by module, activity, type or user.</p>
                </div>
            </Modal>

            <Modal
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                width="80%"
                bodyStyle={{ height: "75vh" }}
                title="Preview Document"
                className="modal-container"
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px", height: "calc(100vh - 180px)" }}>
                    {previewContent?.startsWith("data:application/pdf") ? (
                        <iframe src={previewContent} title="PDF Preview" width="100%" height="100%" style={{ border: "none" }} />
                    ) : previewContent?.startsWith("data:image/") ? (
                        <img src={previewContent} alt="Document Preview" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    ) : (
                        <div><p>Preview not available for this file type. Please download to view.</p></div>
                    )}
                </div>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default ProjectDocs;
