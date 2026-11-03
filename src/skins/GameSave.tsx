import { useState, type CSSProperties } from "react";
import { Save, ShieldCheck, Clock3, Trash2, RotateCcw, AlertTriangle, Plus, Pencil, FolderOpen, Check, X } from "lucide-react";
import type { SkinProps } from "../AppSkins";

type Props = SkinProps & {
  hasSave?: boolean;
  savedAt?: number | null;
  saveReady?: boolean;
  onSaveNow?: () => void;
  onClearSave?: () => void;
  saveSlots?: Array<{ id: string; name: string; savedAt: number }>;
  activeSaveId?: string;
  onCreateSave?: (name: string) => void;
  onLoadSave?: (id: string) => void;
  onRenameSave?: (id: string, name: string) => void;
  onDeleteSave?: (id: string) => void;
};
const buttonStyle: CSSProperties = { width: "100%", border: 0, borderRadius: 14, padding: "13px 15px", fontSize: 14, fontWeight: 650, cursor: "pointer" };
const timeLabel = (time: number) => time ? new Date(time).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "尚未保存";

export function GameSaveSkin(p: Props) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const slots = p.saveSlots ?? [];
  const active = slots.find((slot) => slot.id === p.activeSaveId);
  const create = () => { const name = newName.trim(); if (!name) return; p.onCreateSave?.(name); setNewName(""); };
  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#f2f2f7", color: "#171719", padding: "18px 16px 30px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button onClick={p.onBack} aria-label="返回桌面" style={{ border: 0, background: "transparent", color: "#3478f6", fontSize: 16, padding: "5px 0" }}>‹ 返回</button>
        <strong style={{ fontSize: 17 }}>游戏存档</strong><span style={{ width: 48 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 12px 18px" }}>
        <div style={{ width: 70, height: 70, borderRadius: 21, display: "grid", placeItems: "center", color: "white", background: "linear-gradient(145deg,#5ca2ff,#1764dc)", boxShadow: "0 8px 20px #3478f633" }}><Save size={35} strokeWidth={1.8} /></div>
        <h2 style={{ fontSize: 22, margin: "12px 0 5px" }}>我的游戏存档</h2>
        <div style={{ color: "#73737a", fontSize: 12 }}>保存不同进度，随时读取另一条故事线</div>
      </div>
      <section style={{ background: "white", borderRadius: 18, padding: 15, marginBottom: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><ShieldCheck size={19} color="#20a464" /><strong style={{ fontSize: 14 }}>当前正在游玩的进度</strong><span style={{ marginLeft: "auto", color: "#15945b", fontSize: 11, fontWeight: 700 }}>自动保存</span></div>
        <div style={{ fontWeight: 650, fontSize: 15 }}>{active?.name ?? "正在读取存档…"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#77777e", fontSize: 11, marginTop: 6 }}><Clock3 size={13} />最近保存：{timeLabel(active?.savedAt ?? p.savedAt ?? 0)}</div>
        <button onClick={p.onSaveNow} disabled={!p.saveReady || p.creator} style={{ ...buttonStyle, background: "#edf3ff", color: "#3478f6", marginTop: 12, opacity: !p.saveReady || p.creator ? .5 : 1 }}>立即保存当前进度</button>
      </section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 2px 10px" }}><strong style={{ fontSize: 15 }}>所有存档</strong><span style={{ color: "#888", fontSize: 11 }}>{slots.length} 个存档</span></div>
      {slots.map((slot, index) => (
        <section key={slot.id} style={{ background: "white", borderRadius: 17, padding: 13, marginBottom: 10, border: slot.id === p.activeSaveId ? "1.5px solid #8bb4ff" : "1px solid #e8e8ed" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 37, height: 37, flexShrink: 0, borderRadius: 11, display: "grid", placeItems: "center", background: "#edf3ff", color: "#3478f6" }}><FolderOpen size={19} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingId === slot.id ? <input autoFocus value={editingName} maxLength={24} onChange={(e) => setEditingName(e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd8ef", borderRadius: 8, padding: "7px 8px", fontSize: 13 }} /> : <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slot.name}</div>}
              <div style={{ color: "#85858c", fontSize: 10, marginTop: 4 }}>存档 {index + 1} · {timeLabel(slot.savedAt)}</div>
            </div>
            {slot.id === p.activeSaveId && <span style={{ color: "#15945b", background: "#e9f8ef", borderRadius: 20, padding: "4px 7px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>当前进度</span>}
          </div>
          {deletingId === slot.id ? <div style={{ background: "#fff5f5", borderRadius: 10, padding: 10, marginTop: 10 }}><div style={{ color: "#c83232", fontSize: 12, fontWeight: 650 }}>确定删除「{slot.name}」吗？</div><div style={{ display: "flex", gap: 7, marginTop: 8 }}><button onClick={() => setDeletingId("")} style={{ ...buttonStyle, padding: 9, background: "#ececf0", color: "#444", flex: 1 }}>取消</button><button onClick={() => { p.onDeleteSave?.(slot.id); setDeletingId(""); }} style={{ ...buttonStyle, padding: 9, background: "#dc4141", color: "white", flex: 1 }}>删除存档</button></div></div> : editingId === slot.id ? <div style={{ display: "flex", gap: 7, marginTop: 9 }}><button onClick={() => { p.onRenameSave?.(slot.id, editingName); setEditingId(""); }} style={{ ...buttonStyle, padding: 9, background: "#3478f6", color: "white", flex: 1 }}><Check size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />保存名称</button><button onClick={() => setEditingId("")} style={{ ...buttonStyle, padding: 9, background: "#ececf0", color: "#444", flex: 1 }}><X size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />取消</button></div> : <div style={{ display: "flex", gap: 7, marginTop: 10 }}><button onClick={() => p.onLoadSave?.(slot.id)} disabled={!p.saveReady || p.creator} style={{ ...buttonStyle, padding: 10, background: "#3478f6", color: "white", flex: 1 }}>{slot.id === p.activeSaveId ? "重新读取当前存档" : "读取存档"}</button><button aria-label="重命名" onClick={() => { setEditingId(slot.id); setEditingName(slot.name); }} style={{ border: 0, borderRadius: 11, padding: "0 12px", background: "#f0f0f4", color: "#555" }}><Pencil size={16} /></button><button aria-label="删除存档" onClick={() => setDeletingId(slot.id)} disabled={slots.length <= 1} style={{ border: 0, borderRadius: 11, padding: "0 12px", background: "#fff0f0", color: slots.length <= 1 ? "#c8a5a5" : "#d84a4a" }}><Trash2 size={16} /></button></div>}
        </section>
      ))}
      <section style={{ background: "white", borderRadius: 17, padding: 14, marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Plus size={18} color="#3478f6" /><strong style={{ fontSize: 14 }}>创建一个新存档</strong></div>
        <input value={newName} maxLength={24} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") create(); }} placeholder="给这段进度起个名字…" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #dedee5", borderRadius: 11, padding: "12px 11px", fontSize: 13, outlineColor: "#3478f6" }} />
        <button onClick={create} disabled={!p.saveReady || p.creator || !newName.trim()} style={{ ...buttonStyle, background: "#3478f6", color: "white", marginTop: 9, opacity: !p.saveReady || p.creator || !newName.trim() ? .45 : 1 }}><Plus size={15} style={{ verticalAlign: "middle", marginRight: 5 }} />保存为新进度</button>
        <p style={{ color: "#85858c", fontSize: 11, lineHeight: 1.55, margin: "9px 2px 0" }}>新存档会复制当前进度，之后独立保存。切换存档不会覆盖其他存档。</p>
      </section>
      <section style={{ background: "white", borderRadius: 17, padding: 14, marginTop: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}><RotateCcw size={17} color="#df5555" /><strong style={{ fontSize: 14 }}>重新开始当前进度</strong></div>
        <p style={{ color: "#77777e", fontSize: 11, lineHeight: 1.6, margin: "0 0 10px" }}>只会把当前选中的存档重置到故事开头，其他存档不会受到影响。</p>
        {!confirmingReset ? <button onClick={() => setConfirmingReset(true)} disabled={!p.saveReady || p.creator} style={{ ...buttonStyle, color: "#d83d3d", background: "#fff0f0", opacity: !p.saveReady || p.creator ? .5 : 1 }}>清除当前进度并从头开始</button> : <div style={{ border: "1px solid #f0bcbc", borderRadius: 12, padding: 11, background: "#fff8f8" }}><div style={{ display: "flex", alignItems: "center", gap: 6, color: "#c83232", fontWeight: 700, fontSize: 12 }}><AlertTriangle size={16} />确认重置当前存档？</div><div style={{ display: "flex", gap: 7, marginTop: 9 }}><button onClick={() => setConfirmingReset(false)} style={{ ...buttonStyle, padding: 9, background: "#e9e9ee", color: "#333", flex: 1 }}>取消</button><button onClick={() => { setConfirmingReset(false); p.onClearSave?.(); }} style={{ ...buttonStyle, padding: 9, background: "#dc4141", color: "white", flex: 1 }}>确认重置</button></div></div>}
      </section>
      <p style={{ color: "#99999f", fontSize: 10, lineHeight: 1.6, textAlign: "center", margin: "16px 6px 0" }}>存档保存在当前设备的浏览器中。同一设备、同一浏览器打开游戏即可读取；清除浏览器网站数据可能会删除本地存档。暂不支持跨设备云同步。</p>
    </div>
  );
}