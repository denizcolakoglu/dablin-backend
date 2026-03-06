import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function History() {
  const { getToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:3000/api/history", {
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

  if (items.length === 0) return (
    <div className="empty-page">
      <div className="empty-icon">📋</div>
      <h2>No generations yet</h2>
      <p>Your generated descriptions will appear here</p>
    </div>
  );

  return (
    <div className="history-page">
      <h2 className="page-title">Generation History</h2>
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
    </div>
  );
}
