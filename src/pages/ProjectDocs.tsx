import {
    Table,
    Card,
    Typography,
    Tooltip,
    Row,
    Col,
    Modal,
    Button,
    Space,
    Input,
    Tag,
    Spin,
    Empty
} from "antd";
import {
    BellOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    FileTextOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
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
    const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
    const [_projectDetails, setProjectDetails] = useState<any>({});
    const [documents, setDocuments] = useState<DocRow[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [docTypes, setDocTypes] = useState<any[]>([]);
    const [selectedType, setSelectedType] = useState<string>("All");

    useEffect(() => {
        db.getAllDocTypes()
            .then((dts: any[]) => setDocTypes(Array.isArray(dts) ? dts : []))
            .catch(() => setDocTypes([]));
    }, []);

    const pickTimelineEntry = (pr: any) => {
        const pt = Array.isArray(pr?.projectTimeline) ? pr.projectTimeline : [];
        const storedV = localStorage.getItem("latestProjectVersion");

        const byStored = storedV ? pt.find((t: any) => String(t?.version) === String(storedV)) : null;
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
                const milestone = mod?.keyActivity ?? mod?.moduleName ?? mod?.SrNo ?? "";

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
                return;
            }

            setProjectDetails(pr);
            const { data } = pickTimelineEntry(pr);
            setDocuments(Array.isArray(data) ? flattenDocs(data, pr.id) : []);
        } catch (e) {
            console.error(e);
            notify.error("Failed to load project documents.");
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [project?.code]);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    const normalizedDocTypes = useMemo(() => {
        const names = (docTypes || [])
            .map((d: any) => String(d?.name || "").trim())
            .filter(Boolean);

        const unique = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
        return ["All", ...unique];
    }, [docTypes]);

    useEffect(() => {
        if (!normalizedDocTypes.includes(selectedType)) setSelectedType("All");
    }, [normalizedDocTypes, selectedType]);

    const docTypeCounts = useMemo(() => {
        const counts: Record<string, number> = { All: documents.length };
        for (const d of documents) {
            const t = String(d.documentType || "").trim();
            if (!t) continue;
            counts[t] = (counts[t] || 0) + 1;
        }
        return counts;
    }, [documents]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();

        let base = documents;
        if (selectedType !== "All") {
            base = base.filter((d) => String(d.documentType || "").trim() === selectedType);
        }
        if (!s) return base;

        return base.filter((r) => {
            const hay = [
                r.moduleName,
                r.activityName,
                r.documentName,
                r.description,
                r.fileName,
                r.linkedActivity,
                r.milestone,
                r.uploadedBy,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return hay.includes(s);
        });
    }, [documents, q, selectedType]);

    const handlePreview = useCallback(async (record: DocRow) => {
        if (!record?.filePath) {
            notify.error("Invalid file path.");
            return;
        }
        try {
            const fileData = await db.getDiskEntry(record.filePath);
            if (!fileData) {
                notify.error("File not found in IndexedDB.");
                return;
            }
            setPreviewContent(fileData);
            setPreviewOpen(true);
        } catch (e) {
            console.error(e);
            notify.error("Preview failed.");
        }
    }, []);

    const handleDownload = useCallback(async (record: DocRow) => {
        if (!record?.filePath) {
            notify.error("Invalid file path.");
            return;
        }
        try {
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
        } catch (e) {
            console.error(e);
            notify.error("Download failed.");
        }
    }, []);

    const handleDeleteDoc = useCallback(
        async (row: DocRow) => {
            Modal.confirm({
                title: "Delete this document?",
                content: (
                    <div className="pd-confirm">
                        <div className="pd-confirm-title">{row.documentName || row.fileName}</div>
                        <div className="pd-confirm-sub">
                            {row.moduleName || "—"} <span className="pd-dot">•</span> {row.activityName || "—"}
                        </div>
                    </div>
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
                                const next = docs.filter((d: any) => String(d.id) !== docId);
                                return next.length !== docs.length ? { ...act, activityDocuments: next } : act;
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
                            const remainingFiles = originalFiles.filter((f: any) => String(f.docId || f.id) !== docId);

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
                                    updatedAt: new Date().toISOString(),
                                });
                            }
                        }

                        notify.success("Document deleted.");
                        await hydrate();
                    } catch (e) {
                        console.error(e);
                        notify.error("Failed to delete document.");
                    }
                },
            });
        },
        [hydrate, project?.code]
    );

    const columns: any[] = useMemo(
        () => [
            {
                title: "Doc Name",
                dataIndex: "documentName",
                width: 250,
                sorter: (a: DocRow, b: DocRow) => String(a.documentName || "").localeCompare(String(b.documentName || "")),
                render: (_: any, r: DocRow) => (
                    <div className="pd-doccell">
                        <div className="pd-docicon">
                            <FileTextOutlined />
                        </div>
                        <div className="pd-docmeta">
                            <div className="pd-docname">{r.documentName || r.fileName || "Unnamed Document"}</div>
                            <div className="pd-docsub">
                                <Tag className="pd-tag" bordered={false}>
                                    {String(r.documentType || "").trim() || "Uncategorized"}
                                </Tag>
                                <span className="pd-subtext">{r.fileName || ""}</span>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "Date Of Issuance",
                dataIndex: "uploadedAt",
                width: 160,
                sorter: (a: DocRow, b: DocRow) => String(a.uploadedAt || "").localeCompare(String(b.uploadedAt || "")),
                render: (v: string) => (v ? new Date(v).toLocaleDateString() : "—"),
            },
            {
                title: "Linked Activity",
                dataIndex: "activityName",
                width: 300,
                sorter: (a: DocRow, b: DocRow) => String(a.activityName || "").localeCompare(String(b.activityName || "")),
                render: (_: any, r: DocRow) => (
                    <div className="pd-activity">
                        <div className="pd-activity-name">{r.activityName || "—"}</div>
                        <div className="pd-activity-sub">
                            {r.activityCode ? `Code: ${String(r.activityCode)}` : "—"}
                            {r.linkedActivity ? ` • Link: ${r.linkedActivity}` : ""}
                        </div>
                    </div>
                ),
            },
            {
                title: "Milestone",
                dataIndex: "milestone",
                width: 200,
                sorter: (a: DocRow, b: DocRow) => String(a.milestone || "").localeCompare(String(b.milestone || "")),
                render: (v: string) => v || "—",
            },
            {
                title: "Actions",
                key: "actions",
                fixed: "right",
                width: 140,
                align: "center",
                render: (_: any, record: DocRow) => (
                    <Space size={8}>
                        <Button className="pd-iconbtn" icon={<EyeOutlined />} onClick={() => handlePreview(record)} size="small" />
                        <Button
                            className="pd-iconbtn"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(record)}
                            size="small"
                        />
                        <Button
                            className="pd-iconbtn"
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => handleDeleteDoc(record)}
                        />
                    </Space>
                ),
            },
        ],
        [handleDeleteDoc, handleDownload, handlePreview]
    );

    const previewKind = useMemo(() => {
        if (!previewContent) return "unknown";
        if (previewContent.startsWith("data:application/pdf")) return "pdf";
        if (previewContent.startsWith("data:image/")) return "image";
        return "unknown";
    }, [previewContent]);

    return (
        <div className="project-document-cont">
            <div className="pd-header">
                <div className="pd-title">
                    <Title level={5} className="pd-h3">
                        Project Documents
                    </Title>
                    <Text className="pd-sub">Search, filter and manage all project-linked documents.</Text>
                </div>

                <div className="pd-actions">
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search module, activity, doc name, type, user…"
                        className="pd-search"
                        allowClear
                    />
                    <Button className="pd-btn" icon={<ReloadOutlined />} onClick={hydrate}>
                        Refresh
                    </Button>
                    <Tooltip title="What's New">
                        <Button className="pd-bell" icon={<BellOutlined />} onClick={() => setIsWhatsNewOpen(true)} />
                    </Tooltip>
                </div>
            </div>

            <div className="pd-cards">
                <Row gutter={[12, 12]}>
                    {normalizedDocTypes
                        .filter((t) => t !== "All")
                        .slice(0, 8)
                        .map((t) => {
                            const active = selectedType === t;
                            return (
                                <Col xs={12} sm={8} md={6} lg={4} key={t}>
                                    <Card
                                        hoverable
                                        className={`pd-card ${active ? "active" : ""}`}
                                        onClick={() => setSelectedType(t)}
                                    >
                                        <div className="pd-card-top">
                                            <Text className="pd-card-count">{docTypeCounts[t] || 0}</Text>
                                            <Tag className="pd-card-tag" bordered={false}>
                                                {t}
                                            </Tag>
                                        </div>
                                        <Text className="pd-card-sub">Documents</Text>
                                    </Card>
                                </Col>
                            );
                        })}
                </Row>
            </div>

            <div className="pd-tablewrap">
                <Spin spinning={loading}>
                    {documents.length ? (
                        <Table
                            columns={columns}
                            dataSource={filtered}
                            pagination={false}
                            className="pd-table"
                            bordered
                            rowKey="guid"
                            scroll={{ x: 1150, y: "calc(100vh - 380px)" }}
                        />
                    ) : (
                        <Empty className="pd-empty" description="No documents found for this project" />
                    )}
                </Spin>
            </div>

            <Modal
                title="What's New"
                open={isWhatsNewOpen}
                onCancel={() => setIsWhatsNewOpen(false)}
                footer={null}
                className="modal-container"
            >
                <div className="pd-whatsnew">
                    <p>
                        <b>Tip:</b> Use search to filter by module, activity, document name, type or user.
                    </p>
                    <p>
                        <b>Quick filter:</b> Select a document type above to narrow results instantly.
                    </p>
                </div>
            </Modal>

            <Modal
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                footer={null}
                width="82%"
                title="Preview Document"
                className="modal-container"
            >
                <div className="pd-preview">
                    {previewKind === "pdf" ? (
                        <iframe src={previewContent || ""} title="PDF Preview" width="100%" height="100%" style={{ border: "none" }} />
                    ) : previewKind === "image" ? (
                        <img src={previewContent || ""} alt="Document Preview" className="pd-preview-img" />
                    ) : (
                        <div className="pd-preview-na">
                            <p>Preview not available for this file type. Please download to view.</p>
                        </div>
                    )}
                </div>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default ProjectDocs;