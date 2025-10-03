import { useMemo, useState } from 'react';
import '../styles/knowledgecenter.css';

export type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  date: string;
  image?: string;
};

function generateFeatureArticles(): Article[] {
  return [
    {
      id: '1',
      title: 'Company Self Registration',
      summary: 'How companies register, verify credentials, and set up their organizational profile.',
      content: 'Companies self-register to create an authenticated organization account. During registration they provide company details, contact points, licences and compliance documents. Once verified, administrators can invite team members, assign roles, and configure access controls. This central company profile becomes the authoritative source for all projects and filings on the platform. Use the profile to store contact details, regulatory IDs, standard operating procedures and company-level templates that apply across projects.',
      tags: ['Onboarding', 'Compliance'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f'
    },
    {
      id: '2',
      title: 'Team Building and Role Permissions',
      summary: 'Best practices to create teams, define roles, and secure project access.',
      content: 'Teams group users by function such as operations, geology, safety, environment and management. Define roles (owner, manager, editor, viewer) and map them to responsibilities. Role-based permissions limit who can create modules, modify timelines, approve submissions, or download reports. Recommended practice is to assign a single approver for each critical milestone and maintain at least one backup approver to avoid approval bottlenecks.',
      tags: ['Team', 'Security'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a'
    },
    {
      id: '3',
      title: 'Module Creation and Activity Planning',
      summary: 'Design reusable modules that contain activities, documents and checklists.',
      content: 'Modules act as building blocks for projects. Each module contains a curated set of activities such as surveying, drilling, blasting, hauling, environmental clearance or community consultations. Within activities you attach documents, assign owners, set durations and add prerequisites. Use modular design to reuse common workflows across projects and to standardize data collection and reporting for regulatory compliance.',
      tags: ['Modules', 'Planning'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e'
    },
    {
      id: '4',
      title: 'Grouping Modules by Mine Type',
      summary: 'Organize modules into groups tailored to mine types like open cast and underground.',
      content: 'Group modules by mine type to reflect operational differences between open cast (open-pit) and underground mining. For open cast mines, include modules for bench design, load-and-haul, slope stability and water management. For underground mines, include modules for shaft sinking, development headings, ventilation, ground support and emergency egress. Grouping simplifies reporting, allows filtered analytics and ensures the right templates and safety checks apply to the right mine categories.',
      tags: ['Grouping', 'Mine Type'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1581092334670-1f9a30f62f34'
    },
    {
      id: '5',
      title: 'Project Creation and Timeline Management',
      summary: 'Link groups to projects and create clear, dependency-aware timelines.',
      content: 'Projects represent the full scope of work for a mine or a specific phase. Link one or more groups to a project to bring in their modules and activities. Create a timeline by sequencing activities, adding start and end dates, setting dependencies and tagging milestones. Timelines should capture critical path items and regulatory submission dates. Use dependencies to ensure that prerequisite approvals or surveys are completed before execution tasks begin.',
      tags: ['Projects', 'Timeline'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1538474705339-e87de81450e8'
    },
    {
      id: '6',
      title: 'Approval Workflow and Status Tracking',
      summary: 'Submit timelines for approval, track reviewer comments and capture status changes.',
      content: 'Once a timeline is prepared it is submitted to designated approvers. Approvers review linked documents, assess risks, and either approve, request changes or reject. The platform logs every action, comment and approval timestamp to create a tamper-evident audit trail. After approval the timeline status updates automatically and notifications are sent to responsible users. Status history aids audits and demonstrates compliance during inspections.',
      tags: ['Approval', 'Workflow'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1505842465776-3d90f616310d'
    },
    {
      id: '7',
      title: 'Downloadable Reports and Compliance Exports',
      summary: 'Export approved timelines and reports for regulators and stakeholders.',
      content: 'Approved timelines and their supporting documents can be exported as PDFs or Excel workbooks. Reports include activity-level details, resource assignments, durations, approval stamps and change logs. Exports are formatted for regulatory submissions and board reviews, making it simple to demonstrate compliance or to archive project records for future reference.',
      tags: ['Reports', 'Download'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
    },
    {
      id: '8',
      title: 'Open Cast (Open-pit) Mining Overview',
      summary: 'Key concepts, operational steps and risks associated with open cast mining.',
      content: 'Open cast mining is a surface mining method used when mineral deposits are close to the surface. Operations include site clearing, bench design, drilling and blasting, loading and hauling, and progressive rehabilitation. Key risks include slope instability, dust generation, water management and noise. Best practices involve staged benching, real-time slope monitoring, dust suppression systems and phased rehabilitation to reduce environmental footprint.',
      tags: ['Mining Types', 'Open Cast'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1505842465776-3d90f616310d'
    },
    {
      id: '9',
      title: 'Underground Mining Overview',
      summary: 'Methods, ventilation, ground support and safety considerations for underground mining.',
      content: 'Underground mining accesses deep ore bodies through shafts and tunnels. Common methods include room-and-pillar, longwall, cut-and-fill and block caving. Critical systems are ventilation to manage air quality and gas, robust ground support to prevent collapses, and emergency egress routes. Monitoring with geotechnical sensors, seismic networks and gas detectors is essential to maintain operational safety and reduce the likelihood of incidents.',
      tags: ['Mining Types', 'Underground'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
    },
    {
      id: '10',
      title: 'Environmental Management and Reclamation',
      summary: 'How to minimise impacts: water, dust, biodiversity and progressive reclamation.',
      content: 'Effective environmental management starts with impact assessment and continues through operations and closure. Practices include sediment controls, water recycling, dust suppression, progressive revegetation and biodiversity offsets. Closure planning should be integrated into project timelines so rehabilitation milestones are tracked, approved and evidenced with photographs and monitoring reports.',
      tags: ['Environment', 'Reclamation'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e'
    },
    {
      id: '11',
      title: 'Technology in Mining: Drones, Sensors and Analytics',
      summary: 'Using modern technology for monitoring, surveying and data-driven decision making.',
      content: 'Drones speed up surveying and volumetrics, IoT sensors monitor equipment health, slope movement and environmental conditions, while analytics platforms transform raw data into insights. Integrate sensor feeds and drone surveys into modules so that activities automatically receive updated site data, improving accuracy of timelines and reducing the need for manual reporting.',
      tags: ['Tech', 'Innovation'],
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1581090700227-4c4f8a5c6f4d'
    }
  ];
}

export default function KnowledgeCenter() {
  const allArticles = useMemo(() => generateFeatureArticles(), []);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const tags = useMemo(() => {
    const s = new Set<string>();
    allArticles.forEach(a => a.tags.forEach(t => s.add(t)));
    return Array.from(s);
  }, [allArticles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allArticles.filter(a => {
      if (selectedTag && !a.tags.includes(selectedTag)) return false;
      if (!q) return true;
      return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
    });
  }, [allArticles, query, selectedTag]);

  return (
    <div className="kc-root light">
      <header className="kc-header">
        <div className="kc-brand">Knowledge Center</div>
        <div className="kc-cta">
          <input
            aria-label="Search articles"
            className="kc-search"
            placeholder="Search guides, regs, case studies..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="kc-toggle">
            <button className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">▦</button>
            <button className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">≡</button>
          </div>
        </div>
      </header>

      <main className="kc-main">
        <aside className="kc-aside">
          <div className="kc-card kc-filters">
            <h3>Filters</h3>
            <div className="tag-cloud">
              <button className={`tag ${selectedTag === null ? 'tag-active' : ''}`} onClick={() => setSelectedTag(null)}>All</button>
              {tags.map(t => (
                <button
                  key={t}
                  className={`tag ${selectedTag === t ? 'tag-active' : ''}`}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="kc-card kc-quicklinks">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">Onboard a new company</a></li>
              <li><a href="#">Create project timeline</a></li>
              <li><a href="#">Download compliance reports</a></li>
            </ul>
          </div>

          <div className="kc-card kc-stats">
            <h3>Stats</h3>
            <div className="stat-row">
              <div>
                <div className="stat-big">{allArticles.length}</div>
                <div className="stat-label">Articles</div>
              </div>
              <div>
                <div className="stat-big">{tags.length}</div>
                <div className="stat-label">Tags</div>
              </div>
            </div>
          </div>
        </aside>

        <section className={`kc-content ${viewMode}`}>
          <div className="kc-actions">
            <div className="result-count">{filtered.length} results</div>
            <div className="sort-anim">Newest ▾</div>
          </div>

          <div className="kc-grid">
            {filtered.map(a => (
              <article
                key={a.id}
                className={`kc-article card-anim ${expandedId === a.id ? 'expanded' : ''}`}
              >
                {a.image && (
                  <div className="art-thumb">
                    <img src={a.image} alt={a.title} />
                  </div>
                )}
                <header className="art-head" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                  <h4 className="art-title">{a.title}</h4>
                  <div className="art-meta">{new Date(a.date).toLocaleDateString()} • {a.tags.join(', ')}</div>
                </header>

                <div className="art-body">
                  <p className="art-summary">{a.summary}</p>
                  <div className="art-actions">
                    <button className="btn" onClick={() => setExpandedId(a.id)}>Read</button>
                    <button className="btn ghost">Save</button>
                    <button className="btn ghost">Share</button>
                  </div>

                  <div className="art-full" aria-hidden={expandedId !== a.id}>
                    {a.content.split('\n\n').map((p, idx) => <p key={idx}>{p}</p>)}
                  </div>
                </div>

              </article>
            ))}
          </div>

        </section>
      </main>
    </div>
  );
}