import { SystemNotifications } from "./SystemNotifications";
import {
  ConnectivityModule,
  SliderModule,
} from "./vendor/ios-web/ControlModules";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  LockKeyhole,
  Flashlight,
  Camera,
  Delete,
  ChevronDown,
  Play,
  SkipForward,
  Moon,
  RotateCcw,
  Monitor,
  Calculator,
  Globe,
  Mic,
  ArrowUp,
  Send,
  ChevronUp,
  Plus,
  Power,
  Signal,
  House,
  Circle,
  Radio,
  Wifi,
  Battery,
  Heart,
  Music2,
  Airplay,
  Lock,
  ImagePlus,
  Bell,
  BatteryLow,
  QrCode,
  Check,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { type Item, type Work } from "./schema";
export const KeyboardContext = createContext<(open: boolean, onSend?: (value: string) => void) => void>(() => {});
export function NativeComposer({
  creator,
  onAdd,
  onSend,
}: {
  creator: boolean;
  onAdd: () => void;
  onSend?: (value: string) => void;
}) {
  const open = useContext(KeyboardContext);
  return (
    <button
      className="native-compose-field"
      aria-label={creator ? "添加消息" : "输入消息"}
      onClick={() => (creator ? onAdd() : open(true, onSend))}
    >
      {creator ? "添加消息" : ""}
    </button>
  );
}
export function DeviceLock({
  work,
  time,
  notices,
  notificationItems = [],
  onDismiss,
  onNotificationOpen,
  pinOpen,
  setPinOpen,
  error,
  onUnlock,
  onCamera,
  onLight,
  onWallpaperPicker,
}: {
  work: Work;
  time: string;
  notices: string[];
  notificationItems?: Item[];
  onDismiss: (index: number) => void;
  onNotificationOpen: (notice: ReturnType<typeof import("./SystemNotifications").notificationContent>) => void;
  pinOpen: boolean;
  setPinOpen: (v: boolean) => void;
  error: string;
  onUnlock: (v: string) => void;
  onCamera: () => void;
  onLight: () => void;
  onWallpaperPicker: () => void;
}) {
  const [code, setCode] = useState("");
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearLongPress = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); longPressTimer.current = null; };
  useEffect(() => {
    if (error) setCode("");
  }, [error]);
  useEffect(() => {
    if (!pinOpen) setCode("");
  }, [pinOpen]);
  const digit = (key: string) => {
    const value = key === "⌫" ? code.slice(0, -1) : (code + key).slice(0, 12);
    setCode(value);
    if (
      /^\d+$/.test(work.phone.passcode) &&
      value.length === work.phone.passcode.length
    ) {
      onUnlock(value);
      setCode("");
    }
  };
  const lockDate = new Date((work.phone.date || new Date().toISOString().slice(0, 10)) + "T12:00:00");
  const solarDateLabel =
    new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric" }).format(lockDate) +
    new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(lockDate);
  const lunarParts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).formatToParts(lockDate);
  const lunarYear = lunarParts.find((part) => String(part.type) === "yearName")?.value?.replace(/^\\d{4}/, "");
  const lunarMonth = lunarParts.find((part) => part.type === "month")?.value;
  const lunarDayNumber = Number(lunarParts.find((part) => part.type === "day")?.value);
  const lunarDayNames = [
    "",
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九",
    "廿", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
  ];
  const lunarDateLabel =
    lunarYear && lunarMonth && lunarDayNames[lunarDayNumber]
      ? `${lunarYear}年${lunarMonth}${lunarDayNames[lunarDayNumber]}`
      : new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(lockDate);
  const lockDateLabel = `${solarDateLabel} · ${lunarDateLabel}`;
  return (
    <motion.div
      className={"lock-screen device-lock " + (pinOpen ? "pin-open" : "")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: -852, opacity: 0 }}
      transition={{ duration: 0.48, ease: [0.32, 0.72, 0, 1] }}
      onPointerDown={(event) => {
        if (pinOpen || (event.target as HTMLElement).closest("button")) return;
        clearLongPress();
        longPressTimer.current = setTimeout(() => { onWallpaperPicker(); }, 550);
      }}
      onPointerUp={clearLongPress}
      onPointerLeave={clearLongPress}
      onPointerCancel={clearLongPress}
      onContextMenu={(event) => { event.preventDefault(); if (!pinOpen) onWallpaperPicker(); }}
    >
      {!pinOpen ? (
        <>
          <div className="lock-clock-block">
            <p className="lock-unlock-hint">{lockDateLabel}</p>
            <h1>{time.replace(/^0(?=\\d:)/, "")}</h1>
          </div>
          <div className="lock-notifications">
            {work.phone.notifications && (
              <SystemNotifications
                compact
                notices={notices}
                apps={work.apps}
                items={notificationItems}
                onOpen={onNotificationOpen}
                onDismiss={onDismiss}
              />
            )}
          </div>
          <div className="lock-tools">
            <button onClick={onLight} aria-label="手电筒">
              <Flashlight size={23} />
            </button>
            <button
              onClick={onCamera}
              disabled={
                !work.apps.some((a) => a.installed && a.id === "camera")
              }
              aria-label="相机"
            >
              <Camera size={25} />
            </button>
          </div>
        </>
      ) : (
        <div className="device-passcode">
          <LockKeyhole size={22} />
          <h2>输入密码</h2>
          <div
            className={"passcode-dots " + (error ? "pin-shake" : "")}
            aria-label={"已输入" + code.length + "位密码"}
          >
            {Array.from({ length: work.phone.passcode.length }, (_, i) => (
              <i key={i} className={i < code.length ? "filled" : ""} />
            ))}
          </div>
          <input
            className={
              /^\d+$/.test(work.phone.passcode)
                ? "accessible-pin"
                : "legacy-passcode"
            }
            aria-label="锁屏密码"
            autoComplete="off"
            inputMode="numeric"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onUnlock(code)}
          />
          <div className="pin-keypad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""].map(
              (n, i) =>
                n ? (
                  <button
                    key={i}
                    aria-label={"密码键" + n}
                    onClick={() => digit(n)}
                  >
                    <b>{n}</b>
                    <small>
                      {
                        [
                          "",
                          "",
                          "ABC",
                          "DEF",
                          "GHI",
                          "JKL",
                          "MNO",
                          "PQRS",
                          "TUV",
                          "WXYZ",
                        ][Number(n)]
                      }
                    </small>
                  </button>
                ) : (
                  <span key={i} />
                ),
            )}
          </div>
          <span role="status" className="pin-error">
            {error}
          </span>
          {!/^[0-9]+$/.test(work.phone.passcode) && (
            <button onClick={() => onUnlock(code)}>解锁</button>
          )}
          <div className="pin-footer">
            <button onClick={() => setEmergencyOpen(true)}>紧急情况</button>
            <button onClick={() => { setEmergencyOpen(false); setPinOpen(false); }}>取消</button>
          </div>
          {emergencyOpen && (
            <div className="pin-emergency">
              <h3>紧急呼叫</h3>
              <p>此处为手机模拟器，不会拨打真实电话。</p>
              <div>{["110", "120", "119"].map((number) => <span key={number}>{number}</span>)}</div>
              <button onClick={() => setEmergencyOpen(false)}>返回</button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function WallpaperPicker({
  current,
  imageUrl,
  onSelect,
  onClose,
}: {
  current: string;
  imageUrl: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(current);
  const presets = [
    { id: "default", name: "怪兽 · 我的照片", image: imageUrl, background: "linear-gradient(145deg,#607c9e,#d9c9ad 48%,#243d36)" },
    { id: "liquid", name: "液态玻璃", image: "", background: "radial-gradient(ellipse at 18% 18%,#f7d8ed 0%,transparent 36%),radial-gradient(ellipse at 78% 24%,#9fc8ff 0%,transparent 42%),radial-gradient(ellipse at 55% 78%,#f5b9a6 0%,transparent 38%),linear-gradient(145deg,#222b5b 0%,#6b6ba7 48%,#b8c9db 100%)" },
    { id: "coast", name: "海岸晨光", image: "", background: "radial-gradient(ellipse at 72% 28%,#fff4d8 0%,transparent 24%),linear-gradient(165deg,#b9e4ed 0%,#6caec5 42%,#315e80 70%,#172d4b 100%)" },
    { id: "aurora", name: "极光夜色", image: "", background: "radial-gradient(ellipse at 22% 36%,#62e2c0aa 0%,transparent 34%),radial-gradient(ellipse at 75% 30%,#a17affaa 0%,transparent 36%),radial-gradient(ellipse at 50% 80%,#2678bd 0%,transparent 42%),linear-gradient(155deg,#07152d,#101b3e 58%,#080d21)" },
    { id: "glacier", name: "冰川蓝", image: "", background: "radial-gradient(ellipse at 20% 22%,#fff 0%,transparent 28%),radial-gradient(ellipse at 84% 72%,#9dd8e8 0%,transparent 35%),linear-gradient(145deg,#d8e8f0 0%,#8fb6d2 42%,#527ba6 75%,#273f68 100%)" },
    { id: "bloom", name: "柔雾花园", image: "", background: "radial-gradient(ellipse at 25% 18%,#ffe2d2 0%,transparent 33%),radial-gradient(ellipse at 80% 38%,#d6c3e9 0%,transparent 35%),radial-gradient(ellipse at 48% 85%,#9cb9a0 0%,transparent 38%),linear-gradient(145deg,#f2d8d0,#c4b7cf 52%,#536f75)" },
  ];
  const chooseFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      if (value) { setSelected(value); onSelect(value); onClose(); }
    };
    reader.readAsDataURL(file);
  };
  return (
    <motion.div className="wallpaper-picker-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="wallpaper-picker-header">
        <button aria-label="关闭壁纸选择" onClick={onClose}><X /></button>
        <strong>壁纸</strong>
        <span />
      </div>
      <div className="wallpaper-picker-label">锁定屏幕</div>
      <div className="wallpaper-picker-carousel">
        {presets.map((preset) => (
          <button key={preset.id} className={"wallpaper-preview " + (selected === preset.id ? "selected" : "")} onClick={() => setSelected(preset.id)}>
            {preset.image ? (
              <img className="wallpaper-preview-art" src={preset.image} alt="默认锁屏壁纸" />
            ) : (
              <span className="wallpaper-preview-art" style={{ background: preset.background }}>
                <small>周一 · 9:41</small><b>09:41</b><i>天气 日历</i>
              </span>
            )}
            <span className="wallpaper-preview-name">{preset.name}</span>
            {selected === preset.id && <Check className="wallpaper-preview-check" size={18} />}
          </button>
        ))}
        {selected.startsWith("data:image/") && (
          <button className="wallpaper-preview selected" onClick={() => setSelected(current)}>
            <img className="wallpaper-preview-art" src={selected} alt="自定义壁纸预览" />
            <span className="wallpaper-preview-name">自定义照片</span><Check className="wallpaper-preview-check" size={18} />
          </button>
        )}
      </div>
      <div className="wallpaper-picker-actions">
        <button className="wallpaper-customize" onClick={() => { onSelect(selected); onClose(); }}>自定义</button>
        <button className="wallpaper-add" aria-label="添加新壁纸" onClick={() => fileInput.current?.click()}><ImagePlus /></button>
      </div>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={(event) => chooseFile(event.target.files?.[0])} />
    </motion.div>
  );
}

export function ControlCenter({
  battery = 82,
  network,
  close,
}: {
  battery?: number;
  network: string;
  close: () => void;
}) {
  const [rotation, setRotation] = useState(true),
    [focus, setFocus] = useState(false),
    [playing, setPlaying] = useState(false),
    [bell, setBell] = useState(false),
    [lowPower, setLowPower] = useState(false),
    [recording, setRecording] = useState(false);
  const [brightness, setBrightness] = useState(50),
    [volume, setVolume] = useState(25);
  const [tool, setTool] = useState("");
  return (
    <motion.div
      className="system-panel device-control cc-reference-layout"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
    >
      <button className="cc-edit" aria-label="添加控制" onClick={() => setTool("添加控制")}><Plus /></button>
      <button className="cc-close" aria-label="关闭控制中心" onClick={close}><Power /></button>
      <div className="cc-status" aria-label={"蜂窝网络 " + network}>
        <div className="cc-sim-lines">
          <span><Signal size={17} /><small>主号</small>中国移动 5G <Wifi size={17} /><em>VPN</em></span>
          <span><Signal size={17} /><small>商务</small>中国电信</span>
        </div>
        <span className="cc-battery"><Lock size={13} /> {battery}% <Battery size={28} /></span>
      </div>
      <nav className="cc-page-rail" aria-label="控制中心分类">
        {[Heart, Music2, House, Radio].map((Icon, i) => (
          <button key={i} aria-label={["常用控制", "媒体控制", "家庭控制", "连接控制"][i]}
            onClick={() => document.querySelector([".cc-grid", ".cc-music", ".cc-focus", ".cc-connect"][i])?.scrollIntoView({ block: "nearest", behavior: "smooth" })}>
            <Icon fill={i === 0 ? "currentColor" : "none"} />
          </button>
        ))}
      </nav>
      <div className="cc-grid">
        <ConnectivityModule />
        <div className="cc-music">
          <div className="cc-media-top"><span><Music2 size={28} /></span><Airplay size={21} /></div>
          <div className="cc-media-title"><strong>{playing ? "正在播放" : "未在播放"}</strong><small>音乐</small></div>
          <div className="cc-media-controls">
            <button aria-label="上一首"><SkipForward style={{ transform: "rotate(180deg)" }} /></button>
            <button aria-label={playing ? "暂停" : "播放"} onClick={() => setPlaying(!playing)}><Play fill="currentColor" /></button>
            <button aria-label="下一首"><SkipForward /></button>
          </div>
        </div>
        <button className={"cc-square cc-rotation-button " + (rotation ? "cc-white" : "")} aria-label="旋转锁定" aria-pressed={rotation} onClick={() => setRotation(!rotation)}>
          <span className="cc-rotation"><RotateCcw /><Lock size={14} /></span>
        </button>
        <button className={"cc-square cc-bell-button " + (bell ? "cc-white" : "")} aria-label="静音模式" aria-pressed={bell} onClick={() => setBell(!bell)}><Bell fill={bell ? "currentColor" : "none"} /></button>
        <SliderModule type="brightness" value={brightness} onChange={setBrightness} />
        <SliderModule type="volume" value={volume} onChange={setVolume} />
        <button className={"cc-focus " + (focus ? "cc-white" : "")} aria-pressed={focus} onClick={() => setFocus(!focus)}>
          <Moon /><span>专注模式</span><ChevronDown size={14} />
        </button>
        <button className="cc-square cc-tool-flashlight" aria-label="手电筒" onClick={() => setTool(tool ? "" : "手电筒")}><Flashlight /></button>
        <button className="cc-square cc-tool-calculator" aria-label="计算器" onClick={() => setTool(tool ? "" : "计算器")}><Calculator /></button>
        <button className="cc-square cc-tool-camera" aria-label="相机" onClick={() => setTool(tool ? "" : "相机")}><Camera /></button>
        <button className={"cc-square cc-tool-record " + (recording ? "cc-recording" : "")} aria-label="屏幕录制" aria-pressed={recording} onClick={() => setRecording(!recording)}><Circle /></button>
        <button className="cc-square cc-tool-qr" aria-label="扫描二维码" onClick={() => setTool("扫描二维码")}><QrCode /></button>
        <button className={"cc-square cc-tool-battery " + (lowPower ? "cc-white" : "")} aria-label="低电量模式" aria-pressed={lowPower} onClick={() => setLowPower(!lowPower)}><BatteryLow /></button>
        <button className="cc-square cc-tool-mirror" aria-label="屏幕镜像" onClick={() => setTool("屏幕镜像")}><Monitor /></button>
      </div>
      {tool && <div className="cc-tool"><strong>{tool}</strong><p>{tool === "屏幕镜像" ? "正在搜索作品中的设备…" : "作品内快捷控制"}</p><button onClick={() => setTool("")}>完成</button></div>}
      <button className="cc-dismiss" onClick={close}>轻扫以关闭 <ChevronUp size={16} /></button>
    </motion.div>
  );
}
export function DeviceKeyboard({ close, onSend }: { close: () => void; onSend?: (value: string) => void }) {
  const [value, setValue] = useState(""),
    [shift, setShift] = useState(false),
    [numbers, setNumbers] = useState(false);
  const submit = () => {
    const message = value.trim();
    if (!message) return;
    onSend?.(message);
    setValue("");
    close();
  };
  return (
    <div className="device-keyboard" role="dialog" aria-label="屏幕键盘">
      <div className="keyboard-draft">
        <input
          autoFocus
          aria-label="消息草稿"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="输入消息"
        />
        {value.trim() && <button aria-label="发送消息" onClick={submit}><Send size={19} /></button>}
        <button aria-label="收起键盘" onClick={close}>
          <ChevronDown />
        </button>
      </div>
      <div className="keyboard-candidates">
        {(value ? [value, "好的", "知道了"] : ["我", "你", "好的"]).map(
          (v, i) => (
            <button key={i} onClick={() => setValue(value + v)}>
              {v}
            </button>
          ),
        )}
      </div>
      {(numbers
        ? ["1234567890", "-/:;()¥&@", ".,?!'"]
        : ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
      ).map((row, i) => (
        <div className="keyboard-row" key={i}>
          {i === 2 && (
            <button
              className="key-special"
              aria-label="切换大小写"
              onClick={() => setShift(!shift)}
            >
              <ArrowUp size={19} />
            </button>
          )}
          {[...row].map((k) => (
            <button
              key={k}
              onClick={() => setValue(value + (shift ? k.toUpperCase() : k))}
            >
              {shift ? k.toUpperCase() : k}
            </button>
          ))}
          {i === 2 && (
            <button
              className="key-special"
              aria-label="退格"
              onClick={() => setValue(value.slice(0, -1))}
            >
              <Delete size={20} />
            </button>
          )}
        </div>
      ))}
      <div className="keyboard-row keyboard-bottom">
        <button onClick={() => setNumbers(!numbers)}>
          {numbers ? "ABC" : "123"}
        </button>
        <button className="key-space" onClick={() => setValue(value + " ")}>
          空格
        </button>
        <button onClick={close}>完成</button>
      </div>
      <div className="keyboard-accessories">
        <Globe size={24} />
        <small>草稿</small>
        <Mic size={23} />
      </div>
    </div>
  );
}
export { NativeSettings } from "./ios/Settings";
