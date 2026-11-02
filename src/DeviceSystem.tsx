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
  Timer,
  Calculator,
  Globe,
  Mic,
  ArrowUp,
  ChevronUp,
  Plus,
  Power,
  Signal,
  House,
  ScanLine,
  Circle,
  Radio,
  Wifi,
  Battery,
  Heart,
  Music2,
  Airplay,
  ChevronRight,
  Lock,
  ImagePlus,
  Check,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { type Work } from "./schema";
export const KeyboardContext = createContext<(open: boolean) => void>(() => {});
export function NativeComposer({
  creator,
  onAdd,
}: {
  creator: boolean;
  onAdd: () => void;
}) {
  const open = useContext(KeyboardContext);
  return (
    <button
      className="native-compose-field"
      aria-label={creator ? "添加消息" : "输入消息"}
      onClick={() => (creator ? onAdd() : open(true))}
    >
      {creator ? "添加消息" : ""}
    </button>
  );
}
export function DeviceLock({
  work,
  time,
  notices,
  onDismiss,
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
  onDismiss: (index: number) => void;
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
  const open = () => (work.phone.passcode ? setPinOpen(true) : onUnlock(""));
  const lockDate = new Date((work.phone.date || new Date().toISOString().slice(0, 10)) + "T12:00:00");
  const lockDateLabel = new Intl.DateTimeFormat("zh-CN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(lockDate);
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
                onOpen={open}
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
  onSelect,
  onClose,
}: {
  current: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(current);
  const presets = [
    { id: "default", name: "当前壁纸", background: "linear-gradient(145deg,#607c9e,#d9c9ad 48%,#243d36)" },
    { id: "sunset", name: "日落", background: "linear-gradient(155deg,#35134d 0%,#f34c58 42%,#ffb347 68%,#3a8cbd 100%)" },
    { id: "ocean", name: "海岸", background: "linear-gradient(160deg,#a9d8e8 0%,#3f91b8 48%,#123f68 100%)" },
    { id: "midnight", name: "深空", background: "radial-gradient(circle at 65% 28%,#536c9c,#171b35 55%,#05060b)" },
    { id: "pink", name: "柔粉", background: "linear-gradient(150deg,#f4b8c9,#b5a6e5 55%,#6a8bc5)" },
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
            <span className="wallpaper-preview-art" style={{ background: preset.background }}>
              <small>周一 · 9:41</small><b>09:41</b><i>天气 日历</i>
            </span>
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
  battery = 94,
  network,
  close,
}: {
  battery?: number;
  network: string;
  close: () => void;
}) {
  const [rotation, setRotation] = useState(true),
    [focus, setFocus] = useState(false),
    [playing, setPlaying] = useState(false);
  const [brightness, setBrightness] = useState(50),
    [volume, setVolume] = useState(25);
  const [tool, setTool] = useState("");
  return (
    <motion.div
      className="system-panel device-control"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
    >
      <button className="cc-close" aria-label="关闭控制中心" onClick={close}>
        <Power />
      </button>
      <button
        className="cc-edit"
        aria-label="控制中心编辑"
        onClick={() => setTool("编辑控制")}
      >
        <Plus />
      </button>
      <div className="cc-current">
        <span>
          <Airplay size={13} />
        </span>
        控制中心 <ChevronRight size={16} />
      </div>
      <div className="cc-status" aria-label={"蜂窝网络 " + network}>
        <div>
          <span>
            <Signal size={18} />
            <small>主号</small> 中国移动 <Wifi size={17} />
          </span>
          <span>
            <Signal size={18} />
            <small>副号</small> 中国电信
          </span>
        </div>
        <span>
          <Lock size={13} /> {battery}% <Battery size={27} />
        </span>
      </div>
      <nav className="cc-page-rail" aria-label="控制中心分类">
        {[Heart, Music2, House, Radio].map((Icon, i) => (
          <button
            key={i}
            aria-label={["常用控制", "媒体控制", "家庭控制", "连接控制"][i]}
            onClick={() =>
              document
                .querySelector(
                  [".cc-grid", ".cc-music", ".cc-home", ".cc-connect"][i],
                )
                ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
            }
          >
            <Icon fill={i === 0 ? "currentColor" : "none"} />
          </button>
        ))}
      </nav>
      <div className="cc-grid">
        <ConnectivityModule />
        <div className="cc-music">
          <div className="cc-media-top">
            <span>
              <Music2 size={28} />
            </span>
            <Airplay size={21} />
          </div>
          <div className="cc-media-title">
            <strong>{playing ? "测试播放" : "未在播放"}</strong>
            <small>音乐</small>
          </div>
          <div>
            <button aria-label="上一首">
              <SkipForward style={{ transform: "rotate(180deg)" }} />
            </button>
            <button
              aria-label={playing ? "暂停" : "播放"}
              onClick={() => setPlaying(!playing)}
            >
              <Play fill="currentColor" />
            </button>
            <button aria-label="下一首">
              <SkipForward />
            </button>
          </div>
        </div>
        <button
          className={"cc-square " + (rotation ? "cc-white" : "")}
          aria-label="旋转锁定"
          aria-pressed={rotation}
          onClick={() => setRotation(!rotation)}
        >
          <span className="cc-rotation">
            <RotateCcw />
            <Lock size={14} />
          </span>
        </button>
        <button
          className="cc-square"
          onClick={() => setTool(tool ? "" : "屏幕镜像")}
          aria-label="屏幕镜像"
        >
          <Monitor />
        </button>
        <SliderModule
          type="brightness"
          value={brightness}
          onChange={setBrightness}
        />
        <SliderModule type="volume" value={volume} onChange={setVolume} />
        <button
          className={"cc-focus " + (focus ? "cc-white" : "")}
          aria-pressed={focus}
          onClick={() => setFocus(!focus)}
        >
          <Moon />
          <span>专注模式</span>
          <ChevronDown size={14} />
        </button>
        <button className="cc-home" onClick={() => setTool("家庭")}>
          <House size={38} />
          <span>未设置家庭</span>
        </button>
        {[Flashlight, Timer, Calculator, Camera].map((Icon, i) => (
          <button
            className={"cc-square cc-tool-" + i}
            aria-label={["手电筒", "计时器", "计算器", "相机"][i]}
            key={i}
            onClick={() =>
              setTool(tool ? "" : ["手电筒", "计时器", "计算器", "相机"][i])
            }
          >
            <Icon />
          </button>
        ))}
        {[ScanLine, Circle, Radio].map((Icon, i) => (
          <button
            key={i}
            className={"cc-square cc-bottom-tool cc-bottom-" + i}
            aria-label={["扫码", "屏幕录制", "声音识别"][i]}
            onClick={() => setTool(["扫码", "屏幕录制", "声音识别"][i])}
          >
            <Icon />
          </button>
        ))}
      </div>
      {tool && (
        <div className="cc-tool">
          <strong>{tool}</strong>
          <p>
            {tool === "屏幕镜像" ? "正在搜索作品中的设备…" : "作品内快捷控制"}
          </p>
          <button onClick={() => setTool("")}>完成</button>
        </div>
      )}
      <button className="cc-dismiss" onClick={close}>
        轻扫以关闭
        <ChevronUp size={16} />
      </button>
    </motion.div>
  );
}
export function DeviceKeyboard({ close }: { close: () => void }) {
  const [value, setValue] = useState(""),
    [shift, setShift] = useState(false),
    [numbers, setNumbers] = useState(false);
  return (
    <div className="device-keyboard" role="dialog" aria-label="屏幕键盘">
      <div className="keyboard-draft">
        <input
          autoFocus
          aria-label="消息草稿"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入消息"
        />
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
