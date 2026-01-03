import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Input,
  Button,
  Select,
  List,
  Typography,
  notification,
  Card,
  Space,
  Tag,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useDropzone, Accept } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import "../styles/knowledgecenter.css";
import { db } from "../Utils/dataStorege.ts";

type Tab = "knowledge" | "news";

type NewsTopic = {
  key: string;
  label: string;
};

type NewsItem = {
  id: string;
  topicKey: string;
  title: string;
  link: string;
  description?: string;
  image_url?: string;
  pubDate?: string;
  source_id?: string;
};

type ShareVisibility = "private" | "public" | "restricted";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const NEWS_TOPICS: NewsTopic[] = [
  { key: "coal_allocation", label: "Coal Block Allocation / Auction" },
  { key: "coal_bidding", label: "Coal Block Bidding" },
  { key: "env_clearance", label: "Environment / Forest / Land" },
  { key: "modules_relevant", label: "Module Relevant Updates" },
];

function generateStaticNews(): NewsItem[] {
  const now = Date.now();
  const d = (daysAgo: number) =>
    new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "n1",
      topicKey: "coal_allocation",
      title: "Government announces next tranche of commercial coal block auctions",
      link: "#",
      description:
        "The Ministry of Coal released the tentative schedule and eligibility framework for the upcoming tranche of coal block auctions aimed at boosting domestic production.",
      image_url: "https://images.unsplash.com/photo-1509395176047-4a66953fd231",
      pubDate: d(1),
      source_id: "PIB",
    },
    {
      id: "n2",
      topicKey: "coal_allocation",
      title: "Operationalisation timelines clarified for recently allocated coal blocks",
      link: "#",
      description:
        "Updated guidance defines milestones for mine development, production commencement, and penalty triggers for delays.",
      image_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
      pubDate: d(3),
      source_id: "MoC",
    },
    {
      id: "n3",
      topicKey: "coal_allocation",
      title: "State governments align land transfer process for new coal block awardees",
      link: "#",
      description:
        "Coordination mechanisms have been outlined to streamline land handover and statutory approvals post auction.",
      image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      pubDate: d(6),
      source_id: "State Mining Dept",
    },
    {
      id: "n4",
      topicKey: "coal_bidding",
      title: "Clarifications issued on technical bid eligibility for coal block e-auctions",
      link: "#",
      description:
        "Authorities detailed experience criteria, net worth thresholds, and documentation requirements for bidders.",
      image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
      pubDate: d(2),
      source_id: "MSTC",
    },
    {
      id: "n5",
      topicKey: "coal_bidding",
      title: "Financial bid evaluation methodology explained for coal auctions",
      link: "#",
      description:
        "The evaluation framework covers revenue share computation, reserve price logic, and tie-breaker rules.",
      image_url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
      pubDate: d(5),
      source_id: "Auction Advisory",
    },
    {
      id: "n6",
      topicKey: "coal_bidding",
      title: "Post-award compliance checklist released for successful coal block bidders",
      link: "#",
      description:
        "Winning bidders must adhere to timelines related to performance security, agreement execution, and statutory filings.",
      image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      pubDate: d(7),
      source_id: "MoC",
    },
    {
      id: "n7",
      topicKey: "env_clearance",
      title: "MoEFCC updates documentation checklist for forest clearance proposals",
      link: "#",
      description:
        "The revised checklist highlights common deficiencies and recommends best practices for faster appraisal.",
      image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      pubDate: d(1),
      source_id: "MoEFCC",
    },
    {
      id: "n8",
      topicKey: "env_clearance",
      title: "Environmental clearance timelines impact coal project critical paths",
      link: "#",
      description:
        "Analysis of recent approvals indicates tighter scrutiny on baseline data and public consultation outcomes.",
      image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      pubDate: d(4),
      source_id: "Env Desk",
    },
    {
      id: "n9",
      topicKey: "env_clearance",
      title: "Land acquisition consent tracking becomes key audit focus",
      link: "#",
      description:
        "Regulators emphasize traceability of consent, compensation disbursement, and grievance redressal.",
      image_url: "https://images.unsplash.com/photo-1509395176047-4a66953fd231",
      pubDate: d(9),
      source_id: "LA Authority",
    },
    {
      id: "n10",
      topicKey: "modules_relevant",
      title: "Mine closure planning milestones integrated into project modules",
      link: "#",
      description:
        "Progressive reclamation, water management, and biodiversity measures are now tracked as module milestones.",
      image_url: "https://images.unsplash.com/photo-1581092334670-1f9a30f62f34",
      pubDate: d(3),
      source_id: "CMPDI",
    },
    {
      id: "n11",
      topicKey: "modules_relevant",
      title: "DGMS advisory standardises safety audit cadence across mining operations",
      link: "#",
      description:
        "Updated guidance outlines audit frequency, responsibility mapping, and digital record retention.",
      image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      pubDate: d(6),
      source_id: "DGMS",
    },
    {
      id: "n12",
      topicKey: "modules_relevant",
      title: "Digital reporting modules recommended for regulatory submissions",
      link: "#",
      description:
        "Authorities encourage structured data capture for approvals, inspections, and compliance reporting.",
      image_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
      pubDate: d(10),
      source_id: "RegTech",
    },
  ];
}

function isoToPretty(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function isoToPrettyTime(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString();
}

async function saveFileToDisk(file: File, fileId: string) {
  const reader = new FileReader();
  return new Promise<{ path: string; contentType: string }>((resolve, reject) => {
    reader.onload = async function () {
      try {
        const base64 = reader.result as string;
        const filePath = `knowledge/${fileId}`;
        const existing = await db.diskStorage.where("path").equals(filePath).first();
        if (!existing) await db.diskStorage.add({ path: filePath, content: base64 });
        resolve({ path: filePath, contentType: file.type || "" });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function vTag(v: ShareVisibility) {
  if (v === "public") return <Tag className="ks-tag ks-tag-public">Public</Tag>;
  if (v === "restricted") return <Tag className="ks-tag ks-tag-restricted">Restricted</Tag>;
  return <Tag className="ks-tag ks-tag-private">Private</Tag>;
}

export default function KnowledgeCenter() {
  const [activeTab, setActiveTab] = useState<Tab>("news");

  const allNews = useMemo(() => generateStaticNews(), []);
  const [newsQuery, setNewsQuery] = useState("");
  const [topicKey, setTopicKey] = useState<string>(NEWS_TOPICS[0].key);
  const [pageSize] = useState(6);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const selectedTopic = useMemo(
    () => NEWS_TOPICS.find((t) => t.key === topicKey) ?? NEWS_TOPICS[0],
    [topicKey]
  );

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [topicKey, newsQuery, pageSize]);

  const filteredNews = useMemo(() => {
    const q = newsQuery.trim().toLowerCase();
    return allNews
      .filter((n) => n.topicKey === topicKey)
      .filter((n) => {
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          (n.description || "").toLowerCase().includes(q) ||
          (n.source_id || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.pubDate || "").localeCompare(a.pubDate || ""));
  }, [allNews, topicKey, newsQuery]);

  const visibleNews = useMemo(
    () => filteredNews.slice(0, visibleCount),
    [filteredNews, visibleCount]
  );

  const hasMore = visibleCount < filteredNews.length;

  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<ShareVisibility>("private");
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const [postQuery, setPostQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const us = await db.getUsers();
        setUsers(us || []);
      } catch {
        setUsers([]);
      }
      try {
        const ps = await db.getKnowledgePosts();
        setPosts(ps || []);
      } catch {
        setPosts([]);
      }
    })();
  }, []);

  const reloadPosts = async () => {
    const ps = await db.getKnowledgePosts();
    setPosts(ps || []);
  };

  const onDrop = (acceptedFiles: File[]) => setFiles((prev) => [...prev, ...acceptedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*,application/pdf" as unknown as Accept,
    multiple: true,
  });

  const resetModal = () => {
    setEditingPostId(null);
    setTitle("");
    setContent("");
    setVisibility("private");
    setSharedWith([]);
    setFiles([]);
    setExistingAttachments([]);
  };

  const openCreate = () => {
    resetModal();
    setCreateOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingPostId(p.id ?? null);
    setTitle(p.title || "");
    setContent(p.content || "");
    setVisibility((p.visibility as ShareVisibility) || "private");
    setSharedWith(
      Array.isArray(p.sharedWith) ? p.sharedWith.map((x: any) => x.email).filter(Boolean) : []
    );
    setFiles([]);
    setExistingAttachments(Array.isArray(p.attachments) ? p.attachments : []);
    setCreateOpen(true);
  };

  const getCurrentUserEmail = () => {
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    return String(u?.email || "").toLowerCase();
  };

  const getCurrentUser = () => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  };

  const canView = (p: any) => {
    const myEmail = getCurrentUserEmail();
    if (!myEmail) return false;

    if (p.visibility === "public") return true;

    const authorEmail = String(p?.createdBy?.email || "").toLowerCase();
    if (authorEmail && authorEmail === myEmail) return true;

    if (p.visibility === "private") return false;

    const list = Array.isArray(p.sharedWith) ? p.sharedWith : [];
    return list.some((x: any) => String(x.email || "").toLowerCase() === myEmail);
  };

  const canEditOrDelete = (p: any) => {
    const myEmail = getCurrentUserEmail();
    const authorEmail = String(p?.createdBy?.email || "").toLowerCase();
    return myEmail && authorEmail && myEmail === authorEmail;
  };

  const previewAttachment = async (att: any) => {
    const data = await db.getDiskEntry(att.path);
    if (!data) {
      notification.error({ message: "File not found in IndexedDB" });
      return;
    }
    setPreviewContent(data);
    setPreviewVisible(true);
  };

  const removeNewFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingAttachment = (att: any) =>
    setExistingAttachments((prev) => prev.filter((x) => x.path !== att.path));

  const handleDeletePost = async (id: number) => {
    try {
      await db.deleteKnowledgePost(id);
      notification.success({ message: "Post deleted" });
      await reloadPosts();
    } catch {
      notification.error({ message: "Failed to delete post" });
    }
  };

  const handleSavePost = async () => {
    const c = content.trim();
    if (!c) {
      notification.warning({ message: "Content is required" });
      return;
    }
    if (visibility === "restricted" && sharedWith.length === 0) {
      notification.warning({ message: "Restricted visibility needs at least one person" });
      return;
    }

    const user = getCurrentUser();
    if (!user?.id) {
      notification.error({ message: "User info missing in localStorage" });
      return;
    }

    try {
      const nowIso = new Date().toISOString();

      const newAttachments: any[] = [];
      for (const f of files) {
        const docId = uuidv4();
        const saved = await saveFileToDisk(f, docId);
        newAttachments.push({ docId, name: f.name, path: saved.path, mime: saved.contentType });
      }

      const mergedAttachments = [...existingAttachments, ...newAttachments];

      const sharedPayload =
        visibility === "restricted"
          ? sharedWith
            .map((email) => {
              const u = users.find(
                (x: any) => String(x.email || "").toLowerCase() === String(email).toLowerCase()
              );
              return { userId: u?.id ? String(u.id) : undefined, email, name: u?.name };
            })
            .filter((x) => x.email)
          : undefined;

      if (editingPostId) {
        const old = await db.knowledgePosts.get(editingPostId);
        const oldAtts = Array.isArray(old?.attachments) ? old.attachments : [];
        const keepPaths = new Set(mergedAttachments.map((a: any) => a.path));
        const removed = oldAtts.filter((a: any) => a?.path && !keepPaths.has(a.path));
        for (const r of removed) {
          await db.deleteDiskEntry(r.path);
        }

        await db.knowledgePosts.update(editingPostId, {
          title: title.trim() || undefined,
          content: c,
          visibility,
          sharedWith: sharedPayload,
          attachments: mergedAttachments,
          updatedAt: nowIso,
        });

        notification.success({ message: "Post updated" });
      } else {
        await db.addKnowledgePost({
          guid: uuidv4(),
          title: title.trim() || undefined,
          content: c,
          visibility,
          sharedWith: sharedPayload,
          attachments: mergedAttachments,
          createdAt: nowIso,
          updatedAt: nowIso,
          createdBy: { userId: String(user.id), name: user.name, email: user.email },
        });

        notification.success({ message: "Post published" });
      }

      setCreateOpen(false);
      resetModal();
      await reloadPosts();
    } catch (e: any) {
      notification.error({ message: e?.message || "Failed to save post" });
    }
  };

  const visiblePosts = useMemo(() => posts.filter(canView), [posts]);

  const filteredPosts = useMemo(() => {
    const q = postQuery.trim().toLowerCase();
    if (!q) return visiblePosts;

    return visiblePosts.filter((p: any) => {
      const t = String(p.title || "").toLowerCase();
      const c = String(p.content || "").toLowerCase();
      const a = String(p.createdBy?.name || p.createdBy?.email || "").toLowerCase();
      return t.includes(q) || c.includes(q) || a.includes(q);
    });
  }, [visiblePosts, postQuery]);

  return (
    <div className="kc-root light">
      <header className="kc-header">
        <div>
          <p className="page-heading-title">Knowledge Center</p>
          <span className="pl-subtitle">Curated regulatory and operational updates</span>
        </div>

        <div className="kc-cta">
          <div className="kc-tabs">
            <button
              className={`kc-tab ${activeTab === "news" ? "active" : ""}`}
              onClick={() => setActiveTab("news")}
            >
              News Feed
            </button>
            <button
              className={`kc-tab ${activeTab === "knowledge" ? "active" : ""}`}
              onClick={() => setActiveTab("knowledge")}
            >
              Knowledge Sharing
            </button>
          </div>
        </div>
      </header>

      <main className="kc-main">
        <aside className="kc-aside">
          {activeTab === "news" ? (
            <div className="kc-card">
              <h3>News Topics</h3>
              <div className="topic-list">
                {NEWS_TOPICS.map((t) => (
                  <button
                    key={t.key}
                    className={`topic-btn ${topicKey === t.key ? "active" : ""}`}
                    onClick={() => setTopicKey(t.key)}
                  >
                    <div className="topic-title">{t.label}</div>
                    <div className="topic-sub">Curated feed</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="kc-card ks-aside-card">
              <div className="ks-aside-head">
                <h3>Knowledge Sharing</h3>
                <div className="ks-aside-sub">Share posts, attach PDFs/images, control access.</div>
              </div>

              <div className="ks-aside-actions">
                <Button className="ks-primary-btn" type="primary" icon={<PlusOutlined />} onClick={openCreate} block>
                  Create Post
                </Button>
              </div>

              <div className="ks-mini-stats">
                <div className="ks-stat">
                  <div className="ks-stat-label">Visible posts</div>
                  <div className="ks-stat-value">{visiblePosts.length}</div>
                </div>
              </div>
            </div>
          )}
        </aside>

        <section className="kc-content">
          {activeTab === "news" ? (
            <>
              <div className="kc-actions">
                <div className="result-count">
                  Topic: <b>{selectedTopic.label}</b>
                  <span className="muted"> • {filteredNews.length} items</span>
                </div>

                <div className="kc-search">
                  <Input
                    className="kc-search-input"
                    placeholder="Search news..."
                    prefix={<SearchOutlined />}
                    value={newsQuery}
                    onChange={(e) => setNewsQuery(e.target.value)}
                    allowClear
                  />
                  <div className="sort-anim">Newest</div>
                </div>
              </div>

              {filteredNews.length === 0 ? (
                <div className="kc-empty">No results found.</div>
              ) : (
                <>
                  <div className="news-list">
                    {visibleNews.map((n) => (
                      <div className="news-card card-anim" key={n.id}>
                        <div className="news-thumb">
                          {n.image_url ? (
                            <img src={n.image_url} alt={n.title} loading="lazy" />
                          ) : (
                            <div className="thumb-fallback" />
                          )}
                        </div>

                        <div className="news-body">
                          <div className="news-title">
                            <a href={n.link} target="_blank" rel="noreferrer">
                              {n.title}
                            </a>
                          </div>

                          <div className="news-meta">
                            {isoToPretty(n.pubDate)}
                            {n.source_id ? ` • ${n.source_id}` : ""}
                          </div>

                          {n.description && <div className="news-desc">{n.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="news-footer">
                    <button
                      className="btn"
                      onClick={() => setVisibleCount((v) => v + pageSize)}
                      disabled={!hasMore}
                    >
                      {hasMore ? "Load more" : "No more"}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="ks-wrap">
              <div className="ks-topbar">
                <div>
                  <div className="ks-title">Posts</div>
                  <div className="ks-subtitle">A clean feed for internal + external sharing</div>
                </div>

                <div className="ks-topbar-right">
                  <Input
                    className="ks-search"
                    placeholder="Search posts..."
                    prefix={<SearchOutlined />}
                    value={postQuery}
                    onChange={(e) => setPostQuery(e.target.value)}
                    allowClear
                  />
                </div>
              </div>

              <div className="ks-feed">
                {filteredPosts.length === 0 ? (
                  <div className="ks-empty">
                    <div className="ks-empty-title">No posts found</div>
                    <div className="ks-empty-sub">Try clearing search or create a new post.</div>
                  </div>
                ) : (
                  filteredPosts.map((p: any) => (
                    <Card key={p.id} className="ks-post" bordered>
                      <div className="ks-post-head">
                        <div className="ks-post-head-left">
                          <div className="ks-post-title">{p.title || "Untitled Post"}</div>
                          <div className="ks-post-meta">
                            <span className="ks-post-author">
                              {p.createdBy?.name || p.createdBy?.email || "Unknown"}
                            </span>
                            <span className="ks-dot">•</span>
                            <span>{isoToPrettyTime(p.createdAt)}</span>
                          </div>
                        </div>

                        <div className="ks-post-head-right">
                          {vTag((p.visibility as ShareVisibility) || "private")}

                          {canEditOrDelete(p) && (
                            <Space className="ks-post-actions">
                              <Button className="ks-icon-btn" size="small" icon={<EditOutlined />} onClick={() => openEdit(p)} />
                              <Button className="ks-icon-btn" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeletePost(p.id)} />
                            </Space>
                          )}
                        </div>
                      </div>

                      <div className="ks-post-body">
                        <div className="ks-post-content">{p.content}</div>

                        {Array.isArray(p.attachments) && p.attachments.length > 0 && (
                          <div className="ks-attachments">
                            <div className="ks-attachments-head">Attachments</div>
                            <List
                              className="ks-attachments-list"
                              size="small"
                              dataSource={p.attachments}
                              renderItem={(att: any) => (
                                <List.Item
                                  className="ks-attachment-item"
                                  actions={[
                                    <Button
                                      key="preview"
                                      className="ks-ghost-btn"
                                      size="small"
                                      icon={<EyeOutlined />}
                                      onClick={() => previewAttachment(att)}
                                    >
                                      Preview
                                    </Button>,
                                  ]}
                                >
                                  <div className="ks-attachment-row">
                                    <div className="ks-file-pill">
                                      <span className="ks-file-dot" />
                                      <Text className="ks-file-name">{att.name}</Text>
                                    </div>
                                  </div>
                                </List.Item>
                              )}
                            />
                          </div>
                        )}

                        {p.visibility === "restricted" &&
                          Array.isArray(p.sharedWith) &&
                          p.sharedWith.length > 0 && (
                            <div className="ks-sharedwith">
                              <span className="ks-sharedwith-label">Shared with:</span>
                              <span className="ks-sharedwith-value">
                                {p.sharedWith.map((x: any) => x.name || x.email).filter(Boolean).join(", ")}
                              </span>
                            </div>
                          )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <Modal
        open={createOpen}
        title={editingPostId ? "Edit Post" : "Create Post"}
        onCancel={() => {
          setCreateOpen(false);
          resetModal();
        }}
        onOk={handleSavePost}
        okText={editingPostId ? "Update" : "Publish"}
        width={760}
        className="ks-modal"
      >
        <div className="ks-form">
          <div className="ks-form-row">
            <div className="ks-form-label">Title</div>
            <Input
              className="ks-input"
              placeholder="Optional title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="ks-form-row">
            <div className="ks-form-label">Content</div>
            <TextArea
              className="ks-textarea"
              rows={6}
              placeholder="Write something…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="ks-form-grid">
            <div className="ks-form-row">
              <div className="ks-form-label">Visibility</div>
              <Select className="ks-select" value={visibility} onChange={setVisibility}>
                <Option value="private">Private (only me)</Option>
                <Option value="public">Public (everyone)</Option>
                <Option value="restricted">Restricted (specific people)</Option>
              </Select>
            </div>

            {visibility === "restricted" && (
              <div className="ks-form-row">
                <div className="ks-form-label">Share with</div>
                <Select
                  className="ks-select"
                  mode="multiple"
                  placeholder="Select people (email)"
                  value={sharedWith}
                  onChange={setSharedWith}
                  options={users
                    .filter((u: any) => u?.email)
                    .map((u: any) => ({
                      label: `${u.name || u.email} (${u.email})`,
                      value: u.email,
                    }))}
                  showSearch
                  optionFilterProp="label"
                />
              </div>
            )}
          </div>

          <div className="ks-form-row">
            <div className="ks-form-label">Attachments</div>

            <div className={`ks-dropzone ${isDragActive ? "active" : ""}`} {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="ks-dropzone-icon">
                <UploadOutlined />
              </div>
              <div className="ks-dropzone-text">
                <div className="ks-dropzone-title">{isDragActive ? "Drop files here" : "Drag & drop files"}</div>
                <div className="ks-dropzone-sub">or click to browse (Images / PDF)</div>
              </div>
            </div>

            {existingAttachments.length > 0 && (
              <div className="ks-attachment-block">
                <div className="ks-attachment-block-title">Existing</div>
                <List
                  className="ks-attachments-list"
                  size="small"
                  dataSource={existingAttachments}
                  renderItem={(att: any) => (
                    <List.Item
                      className="ks-attachment-item"
                      actions={[
                        <Button
                          key="preview"
                          className="ks-ghost-btn"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => previewAttachment(att)}
                        >
                          Preview
                        </Button>,
                        <CloseCircleOutlined
                          key="remove"
                          className="ks-remove-ic"
                          onClick={() => removeExistingAttachment(att)}
                        />,
                      ]}
                    >
                      <Text className="ks-file-name">{att.name}</Text>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {files.length > 0 && (
              <div className="ks-attachment-block">
                <div className="ks-attachment-block-title">New</div>
                <List
                  className="ks-attachments-list"
                  size="small"
                  dataSource={files}
                  renderItem={(f, idx) => (
                    <List.Item
                      className="ks-attachment-item"
                      actions={[
                        <CloseCircleOutlined
                          key="remove"
                          className="ks-remove-ic"
                          onClick={() => removeNewFile(idx)}
                        />,
                      ]}
                    >
                      <Text className="ks-file-name">{f.name}</Text>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="80%"
        title="Preview"
        className="ks-preview-modal"
      >
        <div className="ks-preview-body">
          {previewContent?.startsWith("data:application/pdf") ? (
            <iframe src={previewContent} title="PDF Preview" className="ks-preview-iframe" />
          ) : previewContent?.startsWith("data:image/") ? (
            <img src={previewContent} alt="Preview" className="ks-preview-image" />
          ) : (
            <div className="ks-preview-empty">Preview not available</div>
          )}
        </div>
      </Modal>
    </div>
  );
}