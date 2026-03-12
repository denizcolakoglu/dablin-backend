import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function History() {
  const { getToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState("descriptions");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const token = await getToken();
      const res = await fetch("https://dablin-backend-production.up.railway.app/api/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="page-loading">Loading history...</div>;

  return (
    <div className="history-page">
      <style>{`
        .history-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 2px solid #d4e8d6; }
        .history-tab {
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          color: #5a7a5e;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }
        .history-tab.active { color: #2d7a3a; border-bottom-color: #2d7a3a; }
        .history-tab:hover { color: #2d7a3a; }
        .audit-history-empty {
          background: #f7fbf7;
          border: 1px solid #d4e8d6;
          border-radius: 14px;
          padding: 48px 24px;
          text-align: center;
          color: #5a7a5e;
        }
        .audit-history-empty h3 { font-size: 18px; font-weight: 700; color: #0f1a10; margin-bottom: 8px; }
      `}</style>

      <h2 className="page-title">History</h2>

      <div className="history-tabs">
        <button
          className={`history-tab ${activeTab === "descriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("descriptions")}
        >
          Descriptions {items.length > 0 && `(${items.length})`}
        </button>
        <button
          className={`history-tab ${activeTab === "audits" ? "active" : ""}`}
          onClick={() => setActiveTab("audits")}
        >
          SEO Audits
        </button>
      </div>

      {activeTab === "descriptions" && (
        <>
          {items.length === 0 ? (
            <div className="empty-page">
              <div className="empty-icon">📋</div>
              <h2>No generations yet</h2>
              <p>Your generated descriptions will appear here</p>
            </div>
          ) : (
            <>
              <p className="page-sub">{items.length} descriptions generated</p>
              <div className="history-list">
                {items.map((item, i) => {
                  const input  = item.input_json;
                  const output = item.output_json;
                  const isOpen = expanded === i;
                  return (
                    <div className={`history-card ${isOpen ? "open" : ""}`} key={item.id}>
                      <div className="history-card-header" onClick={() => setExpanded(isOpen ? null : i)}>
                        <div className="history-meta">
                          <span className="history-name">{input.productName}</span>
                          <span className="history-category">{input.category}</span>
                        </div>
                        <div className="history-right">
                          <span className="history-date">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <span className="history-chevron">{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="history-card-body">
                          <div className="history-field">
                            <span className="history-label">Title</span>
                            <span className="history-value">{output.title}</span>
                          </div>
                          <div className="history-field">
                            <span className="history-label">Meta</span>
                            <span className="history-value">{output.meta_description}</span>
                          </div>
                          <div className="history-field">
                            <span className="history-label">Tags</span>
                            <div className="tags-row">
                              {output.tags?.map((t, j) => (
                                <span key={j} className="tag-chip">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "audits" && (
        <div className="audit-history-empty">
          <h3>No audits yet</h3>
          <p>Run an SEO audit from the Audit tab and your results will appear here.</p>
        </div>
      )}
    </div>
  );
}
