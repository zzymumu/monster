import { useState } from "react";
import { Save, ShieldCheck, Clock3, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import type { SkinProps } from "../AppSkins";

type Props = SkinProps & {
  hasSave?: boolean;
  savedAt?: number | null;
  saveReady?: boolean;
  onSaveNow?: () => void;
  onClearSave?: () => void;
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  borderRadius: 14,
  padding: "14px 16px",
  fontSize: 15,
  fontWeight: 650,
  cursor: "pointer",
};

export function GameSaveSkin(p: Props) {
  const [confirming, setConfirming] = useState(false);
  const savedTime = p.savedAt
    ? new Date(p.savedAt).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "正在建立第一次存档";

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#f2f2f7", color: "#171719", padding: "18px 16px 30px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <button onClick={p.onBack} aria-label="返回桌面" style={{ border: 0, background: "transparent", color: "#3478f6", fontSize: 16, padding: "5px 0" }}>‹ 返回</button>
        <strong style={{ fontSize: 17 }}>游戏存档</strong>
        <span style={{ width: 48 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 12px 22px" }}>
        <div style={{ width: 76, height: 76, borderRadius: 22, display: "grid", placeItems: "center", color: "white", background: "linear-gradient(145deg,#5ca2ff,#1764dc)", boxShadow: "0 8px 20px #3478f633" }}>
          <Save size={38} strokeWidth={1.8} />
        </div>
        <h2 style={{ fontSize: 23, margin: "14px 0 5px" }}>你的游戏进度</h2>
        <div style={{ color: "#73737a", fontSize: 13 }}>剧情、聊天记录与互动选择都会保存</div>
      </div>

      <section style={{ background: "white", borderRadius: 18, padding: 16, boxShadow: "0 1px 2px #00000008", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 13 }}>
          <ShieldCheck size={21} color="#20a464" />
          <strong style={{ fontSize: 15 }}>存档状态</strong>
          <span style={{ marginLeft: "auto", color: p.saveReady ? "#15945b" : "#8e8e93", fontSize: 12, fontWeight: 650 }}>
            {p.saveReady ? (p.hasSave ? "已保存" : "尚无存档") : "读取中…"}
          </span>
        </div>
        <div style={{ height: 1, background: "#eeeeF2", margin: "0 0 12px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#6c6c72", fontSize: 13 }}>
          <Clock3 size={17} />
          <span>最近保存</span>
          <strong style={{ color: "#26262a", marginLeft: "auto", fontWeight: 600 }}>{savedTime}</strong>
        </div>
        <p style={{ color: "#8b8b91", fontSize: 12, lineHeight: 1.6, margin: "12px 0 0" }}>
          游戏会在剧情推进、发送消息和作出选择后自动保存。重新打开游戏时，会从上次进度继续。
        </p>
      </section>

      <button
        onClick={p.onSaveNow}
        disabled={!p.saveReady || p.creator}
        style={{ ...buttonStyle, color: "white", background: "#3478f6", opacity: !p.saveReady || p.creator ? .5 : 1, marginBottom: 10 }}
      >
        立即保存当前进度
      </button>

      <section style={{ background: "white", borderRadius: 18, padding: 16, marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
          <RotateCcw size={19} color="#e05252" />
          <strong style={{ fontSize: 15 }}>重新开始游戏</strong>
        </div>
        <p style={{ color: "#77777e", fontSize: 12, lineHeight: 1.65, margin: "0 0 14px" }}>
          清除当前剧情进度、聊天记录、已触发剧情和游戏内互动状态，从故事开头重新开始。桌面布局和壁纸等手机外观设置会保留。
        </p>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            disabled={!p.saveReady || p.creator}
            style={{ ...buttonStyle, color: "#d83d3d", background: "#fff0f0", opacity: !p.saveReady || p.creator ? .5 : 1 }}
          >
            <Trash2 size={16} style={{ verticalAlign: "middle", marginRight: 7 }} />清除存档并从头开始
          </button>
        ) : (
          <div style={{ border: "1px solid #f0bcbc", borderRadius: 14, padding: 13, background: "#fff8f8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#c83232", fontWeight: 700, fontSize: 14 }}>
              <AlertTriangle size={18} />确定要清除当前进度吗？
            </div>
            <p style={{ color: "#77777e", fontSize: 12, lineHeight: 1.6 }}>此操作无法撤销。确认后会立即从游戏开头重新开始。</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirming(false)} style={{ ...buttonStyle, background: "#e9e9ee", color: "#333", flex: 1 }}>取消</button>
              <button onClick={() => { setConfirming(false); p.onClearSave?.(); }} style={{ ...buttonStyle, background: "#dc4141", color: "white", flex: 1 }}>确认清除</button>
            </div>
          </div>
        )}
      </section>

      <p style={{ color: "#99999f", fontSize: 11, lineHeight: 1.6, textAlign: "center", margin: "18px 6px 0" }}>
        存档保存在当前设备的浏览器中。同一设备、同一浏览器打开游戏即可继续进度；清除浏览器网站数据可能会删除本地存档。暂不支持跨设备云同步。
      </p>
    </div>
  );
}
