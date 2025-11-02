import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

const styles = `
/* === Scoped Health Log Modal & Timeline Styles === */

/* Overlay */
.health-log-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

/* Modal Content */
.health-log-modal-content {
  position: relative;
  background-color: white;
  width: 100%;
  max-width: 32rem;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

/* Header */
.health-log-modal-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.health-log-cancel-btn-top {
  position: absolute;
  right: -0.5rem;
  top: -0.5rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, transform 0.1s;
}
.health-log-cancel-btn-top:hover {
  background-color: #e2e8f0;
  transform: rotate(90deg);
}
.health-log-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
}

/* Modal Body */
.health-log-modal-body {
  overflow-y: auto;
  padding-right: 0.5rem;
  padding-bottom: 1rem;
}
.health-log-modal-body::-webkit-scrollbar { width: 6px; }
.health-log-modal-body::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }

/* Modal Footer */
.health-log-modal-footer {
  display: flex;
  justify-content: flex-start !important;
  align-items: center;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
  margin-top: 1rem;
  flex-shrink: 0;
  position: relative;
  bottom: 0;
}
.health-log-save-btn {
  background-color: #f97316;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
  position: static;
  display: inline-block;
}
.health-log-save-btn:hover { background-color: #ea580c; }
.health-log-save-btn:active { transform: scale(0.98); }

/* Timeline/Grid Layout */
.timeline-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  position: relative;
  margin-top: 1.5rem;
}
.timeline-item {
  position: relative;
  padding-left: 2rem;
}
.timeline-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 11px;
  bottom: 0;
  width: 2px;
  background-color: rgba(249, 115, 22, 0.18);
  z-index: 0;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 10px;
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background-color: #fffbeb;
  border: 3px solid #f97316;
  z-index: 1;
}

/* Card */
.card {
  background-color: white;
  border: 1px solid #fef3c7;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  transition: all 0.2s ease-in-out;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.07); }
.log-photo {
  max-height: 250px;
  width: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}
.log-content {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dropdown & Buttons */
.month-dropdown {
  font-weight: 600;
  background-color: #fff7ed;
  border: 2px solid #fbbf24;
  color: #92400e;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.add-log-btn {
  font-weight: 600;
  background-color: #f97316;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
  transition: background-color 0.15s ease-in-out;
}
.add-log-btn:hover { background-color: #ea580c; }

/* Edit/Delete Buttons */
.log-action-btn { display: inline-flex; align-items: center; font-size: 0.875rem; font-weight: 500; padding: 0.4rem 0.8rem; border-radius: 0.5rem; transition: all 0.2s; cursor: pointer; border: 1px solid transparent; }
.edit-btn { color: #475569; background-color: #f1f5f9; }
.edit-btn:hover { background-color: #e2e8f0; }
.delete-btn { color: #dc2626; background-color: #fee2e2; }
.delete-btn:hover { background-color: #fecaca; }

/* File Drop */
.file-drop-area {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: 0.75rem;
  background-color: #f8fafc;
  cursor: pointer;
  border: 2px dashed #d1d5db;
  transition: all 0.2s;
}
.file-drop-area:hover { background-color: #f0f4f8; border-color: #f97316; }

/* Delete Confirmation Dialog */
.confirm-dialog {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 24rem;
  text-align: center;
}
.confirm-dialog h3 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
.confirm-dialog p { color: #64748b; margin-bottom: 1.5rem; }
.confirm-actions { display:flex; gap:1rem; justify-content: center; }
.confirm-actions button { flex-grow:1; padding:0.75rem; border-radius:0.5rem; font-weight:600; border:none; cursor:pointer; transition:background-color 0.2s; }
.confirm-delete-btn { background-color: #ef4444; color:white; }
.confirm-delete-btn:hover { background-color:#dc2626; }
.confirm-cancel-btn { background-color:#f1f5f9; color:#334155; }
.confirm-cancel-btn:hover { background-color:#e2e8f0; }

@media (max-width: 640px) {
    .health-log-modal-content { max-width: 100%; margin: 0.5rem; }
    .health-log-modal-header { margin-bottom: 1rem; }
    .health-log-modal-title { font-size: 1.25rem; }
}
`;

const injectStyles = (css) => {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("health-log-tab-styles");
  if (existing) { existing.textContent = css; return; }
  const styleTag = document.createElement("style");
  styleTag.id = "health-log-tab-styles";
  styleTag.textContent = css;
  document.head.appendChild(styleTag);
};

const HealthLogTab = () => {
  useEffect(() => injectStyles(styles), []);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => { fetchLogs(); }, []);
  useEffect(() => {
    setFilteredLogs(selectedMonth === "All" ? logs : logs.filter(l => l.date && l.date.startsWith(selectedMonth)));
  }, [selectedMonth, logs]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase.from("posts").select("*").eq("user_id", user.id).eq("is_private", true).order("date",{ascending:false});
      if (error) console.error("Error fetching logs:", error);
      else {
        setLogs(data || []);
        setAvailableMonths([...new Set((data||[]).map(l=>l.date?.substring(0,7)).filter(Boolean))]);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSaveLog = async e => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("You must be logged in."); return; }

      let photoUrl = editingLog?.photo_url || null;
      if (photoFile) {
        const fileName = `${user.id}/${Date.now()}-${photoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("log-photos").upload(fileName, photoFile);
        if (uploadError) { alert("Error uploading photo: " + uploadError.message); return; }
        const { data: urlData } = supabase.storage.from("log-photos").getPublicUrl(uploadData.path);
        photoUrl = urlData.publicUrl;
      }

      const logData = { user_id:user.id, title, content:details, date, photo_url:photoUrl, is_private:true };
      if (editingLog) {
        const { data, error } = await supabase.from("posts").update(logData).eq("id", editingLog.id).select().single();
        if (error) alert("Error updating log: "+error.message);
        else setLogs(prev => prev.map(l => l.id===data.id?data:l));
      } else {
        const { data, error } = await supabase.from("posts").insert(logData).select().single();
        if (error) alert("Error saving log: "+error.message);
        else setLogs(prev => [data,...prev]);
      }
      closeModal();
    } catch (err) { console.error(err); alert("Unexpected error. See console."); }
  };

  const handleDelete = (id) => { setLogToDelete(id); setShowDeleteConfirm(true); };
  const confirmDelete = async () => {
    if (!logToDelete) return;
    try {
      const { error } = await supabase.from("posts").delete().eq("id", logToDelete);
      if (error) console.error(error); else setLogs(prev => prev.filter(l=>l.id!==logToDelete));
    } catch (err) { console.error(err); }
    finally { setShowDeleteConfirm(false); setLogToDelete(null); }
  };

  const openModalForNew = () => { setEditingLog(null); setDate(new Date().toISOString().split("T")[0]); setTitle(""); setDetails(""); setPhotoFile(null); setIsModalOpen(true); };
  const openModalForEdit = (log) => { setEditingLog(log); setTitle(log.title||""); setDate(log.date||""); setDetails(log.content||""); setPhotoFile(null); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);
  const handleFileChange = e => { const f = e.target.files?.[0]; if(f && f.size<5*1024*1024) setPhotoFile(f); else if(f) alert("File is too large."); };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-3xl font-bold text-slate-800">My Private Health Logs</h2>
        <div className="flex items-center gap-4">
          <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} className="month-dropdown">
            <option value="All">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{new Date(month+"-02").toLocaleString("default",{month:"long",year:"numeric"})}</option>
            ))}
          </select>
          <button onClick={openModalForNew} className="add-log-btn">+ Add New Log</button>
        </div>
      </div>

      <main className="timeline-container">
        {loading ? <p>Loading...</p> : filteredLogs.map(log => (
          <div key={log.id} className="timeline-item">
            <div className="p-6 rounded-xl card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-800">{log.title}</h3>
                <span className="text-sm font-medium text-slate-500">{log.date}</span>
              </div>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed log-content">{log.content}</p>
              {log.photo_url && <img src={log.photo_url} alt={log.title} className="log-photo" />}
              <div className="flex items-center justify-end space-x-4 mt-4 pt-4 border-t border-slate-100">
                <button onClick={()=>openModalForEdit(log)} className="log-action-btn edit-btn">Edit</button>
                <button onClick={()=>handleDelete(log.id)} className="log-action-btn delete-btn">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {isModalOpen && (
        <div className="health-log-modal-overlay">
          <div className="health-log-modal-content">
            <div className="health-log-modal-header">
              <button onClick={closeModal} className="health-log-cancel-btn-top">X</button>
              <h3 className="health-log-modal-title">{editingLog?"Edit Health Log":"Add a New Health Log"}</h3>
            </div>

            <form onSubmit={handleSaveLog}>
              <div className="health-log-modal-body space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                  <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Details</label>
                  <textarea value={details} onChange={e=>setDetails(e.target.value)} rows="4" className="form-input" required></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Attach Photo</label>
                  <div className="file-drop-area" onClick={()=>fileInputRef.current?.click()}>
                    <p className="font-semibold text-indigo-600">{photoFile?`Selected: ${photoFile.name}`:"Upload a file"}</p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                </div>
              </div>

              <div className="health-log-modal-footer">
                <button type="submit" className="health-log-save-btn">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="health-log-modal-overlay">
          <div className="confirm-dialog">
            <h3>Delete Log</h3>
            <p>Are you sure you want to permanently delete this log? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button onClick={()=>setShowDeleteConfirm(false)} className="confirm-cancel-btn">Cancel</button>
              <button onClick={confirmDelete} className="confirm-delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthLogTab;
