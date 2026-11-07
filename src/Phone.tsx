import { StatusGlyph } from "./ios/StatusGlyph";
import { SocialDetail, socialDetailApps } from "./skins/SocialDetails";
import { NativeCalculator } from "./ios/Calculator";
import { HomeLauncher } from "./launcher/HomeLauncher";
import { useDeviceLayout } from "./launcher/layout";
import "./launcher/launcher.css";
import { NativeDetail, nativeDetailApps } from "./ios/Details";
import "./ios/details.css";
import {
  SystemNotifications,
  notificationContent,
} from "./SystemNotifications";
import {
  readLauncherOrigin,
  AppWindow,
  screenOrigin,
} from "./vendor/ios-web/Launcher";
import {
  DeviceLock,
  WallpaperPicker,
  ControlCenter,
  DeviceKeyboard,
  KeyboardContext,
  NativeSettings,
} from "./DeviceSystem";
import { AppArtwork, hasNativeArtwork } from "./AppArtwork";
import { getFields } from "./fields";
import { catalogSkins } from "./skins/catalog";
import "./skins/skins.css";
import "./ios18.css";
import "./ios27.css";
import "./device-system.css";
import "./ios/tokens.css";
import "./ios/reference.css";
import "./ios/status-bar.css";
import "./ios27-system.css";
import { WeChatSkin, WhatsAppSkin, getCatRescueThreadForStage } from "./AppSkins";
import { GLOOMY_AVATAR } from "./gloomyAvatar";
import { RichText } from "./RichText";
import {
  useEffect,
  useState,
  useRef,
  Suspense,
  type CSSProperties,
} from "react";
import { AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Plus,
  Search,
  LockKeyhole,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ArrowUp,
  Folder,
  Phone as PhoneIcon,
  Mic,
  Volume2,
  VolumeX,
  Copy,
  UserRoundPlus,
} from "lucide-react";
import { getApp, type AppPlugin } from "./registry";
import {
  initialRuntime,
  makeItem,
  safeMedia,
  type Work,
  type Item,
  type Runtime,
  type UiValue,
} from "./schema";
import { dispatch, choose, visible, advance } from "./engine";
import { db } from "./persistence";
export function AppIcon({
  id,
  name,
  small = false,
  custom = "",
  date,
  time,
  badge = 0,
}: {
  id: string;
  name?: string;
  small?: boolean;
  custom?: string;
  date?: string;
  time?: string;
  badge?: number;
}) {
  const a = getApp(id);
  const Icon = a.icon;
  return (
    <span className={`app-icon-wrap ${small ? "small" : ""}`}>
      <span className="app-icon" style={{ background: a.color }}>
        {custom ? (
          safeMedia(custom) ? (
            <img src={safeMedia(custom)} alt="自定义图标" />
          ) : (
            <span>{custom.slice(0, 2)}</span>
          )
        ) : hasNativeArtwork(id) ? (
          <AppArtwork id={id} date={date} time={time} />
        ) : (
          <Icon size={small ? 21 : 28} strokeWidth={1.65} />
        )}
      </span>
      {badge > 0 && <span className="app-unread-badge">{badge > 99 ? "99+" : badge}</span>}
      {name && <span className="app-name">{name}</span>}
    </span>
  );
}
type PhoneProps = Omit<Parameters<typeof PhoneRuntime>[0], "deviceLayout">;
export function Phone(props: PhoneProps) {
  const deviceLayout = useDeviceLayout(props.work, props.creator);
  return (
    <PhoneRuntime
      {...props}
      work={deviceLayout.work}
      deviceLayout={deviceLayout}
    />
  );
}
function PhoneRuntime({
  deviceLayout,
  work,
  creator = false,
  onEdit,
  onAdd,
  onSettings,
  onOpen,
  runtime: external,
  onRuntime,
}: {
  deviceLayout: ReturnType<typeof useDeviceLayout>;
  work: Work;
  creator?: boolean;
  onEdit?: (app: string, item: Item) => void;
  onAdd?: (app: string) => void;
  onSettings?: () => void;
  onOpen?: (app: string) => void;
  runtime?: Runtime;
  onRuntime?: (s: Runtime) => void;
}) {
  const [app, setApp] = useState("");
  const [systemNow, setSystemNow] = useState(() => new Date());
  const [callElapsed, setCallElapsed] = useState(0);
  const [callMicOn, setCallMicOn] = useState(true);
  const [callSpeakerOn, setCallSpeakerOn] = useState(false);
  const [callTopNotice, setCallTopNotice] = useState("");
  useEffect(() => {
    const updateSystemClock = () => setSystemNow(new Date());
    updateSystemClock();
    const timer = window.setInterval(updateSystemClock, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const displayTime = systemNow.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const systemDate = [
    systemNow.getFullYear(),
    String(systemNow.getMonth() + 1).padStart(2, "0"),
    String(systemNow.getDate()).padStart(2, "0"),
  ].join("-");
  const [homeRequest, setHomeRequest] = useState(0);
  const [locked, setLocked] = useState(!creator);
  const [wallpaperChoice, setWallpaperChoice] = useState(() => {
    try { return localStorage.getItem("foundphone-lock-wallpaper") || "default"; } catch { return "default"; }
  });
  const [wallpaperPickerOpen, setWallpaperPickerOpen] = useState(false);
  // Load the original uploaded JPG directly; do not concatenate or transcode thumbnails.
  const defaultWallpaperUrl = "./wallpapers/monster-default.jpg?v=dddd2d5a44f3efafeb8af027c1ed0ab0f168919f";
  const [pinOpen, setPinOpen] = useState(false);
  const [quickCamera, setQuickCamera] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const keyboardSend = useRef<((value: string) => void) | undefined>(undefined);
  const [recent, setRecent] = useState<string[]>([]);
  const appSnapshots = useRef(new Map<string, HTMLElement>());
  const [banner, setBanner] = useState("");
  const noticesSeen = useRef(0);
  const [contextApp, setContextApp] = useState("");
  const [deviceScale, setDeviceScale] = useState(0.84);
  const shell = useRef<HTMLDivElement>(null);
  const gesture = useRef({ x: 0, y: 0, time: 0, zone: "" });
  const [launchOrigin, setLaunchOrigin] = useState(screenOrigin);

  const beginUnlock = () => {
    setPinError("");
    setQuickCamera(false);
    if (work.phone.passcode) setPinOpen(true);
    else unlock();
  };
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const gestureConsumed = useRef(false);
  const [pinError, setPinError] = useState("");
  const [folder, setFolder] = useState("");
  const [panel, setPanel] = useState("");
  const [own, setOwn] = useState(() => initialRuntime(work));
  const [ready, setReady] = useState(creator || !!external);
  const [loadError, setLoadError] = useState("");
  type SaveSlotMeta = { id: string; name: string; savedAt: number };
  const [saveInfo, setSaveInfo] = useState<{ hasSave: boolean; savedAt: number | null; slots: SaveSlotMeta[]; activeSaveId: string }>({ hasSave: false, savedAt: null, slots: [], activeSaveId: work.id + "::slot::main" });
  const defaultSaveId = work.id + "::slot::main";
  const activeSaveIdRef = useRef(defaultSaveId);
  const refreshSaveSlots = async (activeId = activeSaveIdRef.current) => {
    const records = await db.saves.toArray();
    const slots = records.filter((record) => (record.id === work.id || record.id.startsWith(work.id + "::slot::")) && record.state.workId === work.id).map((record) => ({ id: record.id, name: record.name || (record.id === defaultSaveId ? "自动存档" : "未命名存档"), savedAt: record.savedAt ?? 0 })).sort((x, y) => y.savedAt - x.savedAt);
    const active = slots.find((slot) => slot.id === activeId);
    setSaveInfo({ hasSave: !!active, savedAt: active?.savedAt ?? null, slots, activeSaveId: activeId });
  };
  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    const fit = () => {
      setDeviceScale(
        Math.max(
          0.4,
          Math.min(
            1,
            (el.parentElement!.clientWidth - 24) / 407,
            (window.innerHeight - (creator ? 170 : external ? 150 : 40)) / 866,
          ),
        ),
      );
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el.parentElement!);
    window.addEventListener("resize", fit);
    fit();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [creator, ready]);
  const s = external ?? own;
  const runtimeRef = useRef(s);
  runtimeRef.current = s;
  const update = (next: Runtime) => {
    runtimeRef.current = next;
    setOwn(next);
    onRuntime?.(next);
  };
  useEffect(() => {
    if (!ready || creator || external) return;
    const tickShipments = () => {
      const current = runtimeRef.current;
      const raw = current.ui?.shopee?.shopeeOrders;
      if (typeof raw !== "string") return;
      let savedOrders: Array<{id:string;name:string;status:string;shippingStep?:number;nextUpdateAt?:number;arrivalNotified?:boolean;carrier?:string}> = [];
      try { const parsed: unknown = JSON.parse(raw); if (Array.isArray(parsed)) savedOrders = parsed; } catch { return; }
      const stages = ["訂單成立","賣家備貨中","包裹已出貨","物流配送中","已送達取貨門市","已取貨完成"];
      const now = Date.now();
      let changed = false;
      const notices: string[] = [];
      const nextOrders = savedOrders.map((order) => {
        let step = order.shippingStep ?? 1;
        let nextAt = order.nextUpdateAt;
        let notified = order.arrivalNotified ?? false;
        let orderChanged = false;
        if (!nextAt || step >= 4) return order;
        while (now >= nextAt && step < 4) {
          step += 1;
          nextAt += 30000;
          orderChanged = true;
          if (step === 4 && !notified) {
            notified = true;
            notices.push("蝦皮購物：" + order.name + " 已送達 " + (order.carrier || "取貨門市") + "，記得在期限內取貨喔！");
          }
        }
        if (!orderChanged) return order;
        changed = true;
        return { ...order, shippingStep: step, status: stages[step], nextUpdateAt: step >= 4 ? undefined : nextAt, arrivalNotified: notified };
      });
      if (!changed) return;
      update({
        ...current,
        ui: { ...current.ui, shopee: { ...current.ui?.shopee, shopeeOrders: JSON.stringify(nextOrders) } },
        notifications: [...current.notifications, ...notices].slice(-60),
      });
    };
    tickShipments();
    const timer = window.setInterval(tickShipments, 1000);
    document.addEventListener("visibilitychange", tickShipments);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tickShipments);
    };
  }, [ready, creator, external]);

  useEffect(() => {
    let active = true;
    if (creator || external) return;
    void (async () => {
      try {
        const all = await db.saves.toArray();
        const legacy = all.find((record) => record.id === work.id && record.state.workId === work.id);
        let slots = all.filter((record) => record.id.startsWith(work.id + "::slot::") && record.state.workId === work.id);
        if (legacy && !slots.some((record) => record.id === defaultSaveId)) {
          await db.saves.put({ id: defaultSaveId, name: "自动存档", state: legacy.state, savedAt: legacy.savedAt ?? Date.now() });
          await db.saves.delete(work.id);
          slots = [...slots, { ...legacy, id: defaultSaveId, name: "自动存档" }];
        }
        if (!slots.length) {
          const fresh = dispatch(work, initialRuntime(work), "start");
          const created = { id: defaultSaveId, name: "自动存档", state: fresh, savedAt: Date.now() };
          await db.saves.put(created);
          slots = [created];
        }
        if (!active) return;
        const selected = slots.find((record) => record.id === activeSaveIdRef.current) ?? slots.find((record) => record.id === defaultSaveId) ?? slots.sort((x, y) => (y.savedAt ?? 0) - (x.savedAt ?? 0))[0];
        if (!selected) throw new Error("No valid save slot");
        activeSaveIdRef.current = selected.id;
        const fresh = dispatch(work, initialRuntime(work), "start");
        setOwn({ ...fresh, ...selected.state, workId: work.id, revision: work.updatedAt, ui: { ...fresh.ui, ...selected.state.ui }, messages: { ...fresh.messages, ...selected.state.messages } });
        await refreshSaveSlots(selected.id);
        setReady(true);
      } catch {
        if (!active) return;
        const fresh = dispatch(work, initialRuntime(work), "start");
        activeSaveIdRef.current = defaultSaveId;
        setOwn(fresh);
        setLoadError("无法读取本地存档。本次仍可游玩。");
        setReady(true);
      }
    })();
    return () => { active = false; };
  }, [work.id, work.updatedAt, creator, external]);
  useEffect(() => {
    if (creator || external || !ready) return;
    let active = true;
    const persist = () => {
      const snapshot = runtimeRef.current;
      const id = activeSaveIdRef.current;
      const name = saveInfo.slots.find((slot) => slot.id === id)?.name || (id === defaultSaveId ? "自动存档" : "未命名存档");
      const savedAt = Date.now();
      // Write directly in one IndexedDB put. Avoid a read-then-write chain on
      // pagehide: the tab may close before the preliminary read resolves.
      void db.saves.put({ id, name, state: snapshot, savedAt }).then(() => {
        if (active) void refreshSaveSlots(id);
      }).catch(() => { if (active) setLoadError("自动存档失败，请检查浏览器存储权限或导出备份。"); });
    };
    persist();
    const checkpoint = () => persist();
    const onVisibility = () => { if (document.visibilityState === "hidden") checkpoint(); };
    window.addEventListener("pagehide", checkpoint);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { active = false; window.removeEventListener("pagehide", checkpoint); document.removeEventListener("visibilitychange", onVisibility); };
  }, [own, creator, work.id, external, ready]);
  useEffect(() => {
    if (creator || !ready) return;
    const interval = setInterval(() => {
      const previous = runtimeRef.current;
      const next = advance(work, previous, 1000);
      runtimeRef.current = next;
      const changed =
        next.time !== previous.time ||
        next.trace.join() !== previous.trace.join() ||
        (next.scheduled?.length ?? 0) !== (previous.scheduled?.length ?? 0) ||
        (next.scheduled?.length ?? 0) > 0 ||
        Math.floor((next.elapsedMs ?? 0) / 5000) !==
          Math.floor((previous.elapsedMs ?? 0) / 5000);
      if (changed) update(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [creator, ready, work.id, work.updatedAt]);
  useEffect(() => {
    if (!s.incomingCall || s.incomingCall.status !== "answered") {
      setCallElapsed(0);
      setCallMicOn(true);
      setCallSpeakerOn(false);
      return;
    }
    const startedAt = Date.now();
    setCallElapsed(0);
    const timer = window.setInterval(() => setCallElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [s.incomingCall?.status, s.incomingCall?.caller, s.incomingCall?.target]);
  useEffect(() => {
    if (creator || !ready || locked || s.incomingCall) return;
    const request = s.ui?.wechat?.wxOutgoingCallRequest;
    if (request !== "audio" && request !== "video") return;
    const target = s.ui?.wechat?.openThread;
    if (typeof target !== "string" || !target) return;
    update({ ...s, incomingCall: { caller: target, target, status: "ringing", direction: "outgoing", callType: request }, ui: { ...s.ui, wechat: { ...s.ui?.wechat, wxOutgoingCallRequest: "" } } });
  }, [s.incomingCall, s.ui?.wechat?.wxOutgoingCallRequest, s.ui?.wechat?.openThread, ready, locked, creator]);
  useEffect(() => {
    if (creator || !ready || locked || s.incomingCall) return;
    const current = runtimeRef.current;
    const wx = current.ui?.wechat ?? {};
    if (wx.wxDrunkCallRequestedV8 !== true || wx.wxDrunkCallStartedV8 === true) return;
    update({
      ...current,
      incomingCall: { caller: "大G", target: "大G", status: "ringing" },
      ui: { ...current.ui, wechat: {
        ...wx,
        wxDrunkCallStartedV8: true,
        // Keep the legacy flag so the existing manual-hang-up follow-up remains compatible.
        wxDrunkFinalCallStartedV7: true,
      } },
    });
  }, [s.incomingCall, s.ui?.wechat?.wxDrunkCallRequestedV8, s.ui?.wechat?.wxDrunkCallStartedV8, ready, locked, creator]);

  useEffect(() => {
    if (creator || !ready || locked || s.incomingCall) return;
    const current = runtimeRef.current;
    const wx = current.ui?.wechat ?? {};
    if (wx.wxBroccoliCallRequestedV1 !== true || wx.wxBroccoliCallStartedV1 === true) return;
    update({ ...current, incomingCall: { caller: "西蓝花", target: "西蓝花", status: "ringing" }, ui: { ...current.ui, wechat: { ...wx, wxBroccoliCallStartedV1: true } } });
  }, [s.incomingCall, s.ui?.wechat?.wxBroccoliCallRequestedV1, s.ui?.wechat?.wxBroccoliCallStartedV1, ready, locked, creator]);

  useEffect(() => {
    if (creator || !ready || locked || s.incomingCall) return;
    const wx = runtimeRef.current.ui?.wechat ?? {};
    const openedThread = String(wx.openThread ?? "");
    const isBigGThread = openedThread === "大G" || openedThread === "温尚翊";
    if (!isBigGThread || wx.wxBroccoliAfterDoorCallV1 !== true || wx.wxBroccoliAfterDoorCallStartedV2 === true || wx.wxBroccoliAfterDoorCallDeclinedV1 === true) return;
    const current = runtimeRef.current;
    update({
      ...current,
      incomingCall: { caller: "西蓝花", target: "西蓝花", status: "ringing" },
      ui: { ...current.ui, wechat: { ...(current.ui?.wechat ?? {}), wxBroccoliAfterDoorCallStartedV2: true } },
    });
  }, [s.incomingCall, s.ui?.wechat?.openThread, s.ui?.wechat?.wxBroccoliAfterDoorCallV1, s.ui?.wechat?.wxBroccoliAfterDoorCallStartedV2, s.ui?.wechat?.wxBroccoliAfterDoorCallDeclinedV1, ready, locked, creator]);

  useEffect(() => {
    const call = s.incomingCall;
    if (creator || !ready || !call || call.caller !== "西蓝花" || call.status !== "ringing" || s.ui?.wechat?.wxBroccoliAfterDoorCallV1 !== true || s.ui?.wechat?.wxBroccoliAfterDoorCallDeclinedV1 === true) return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      const active = current.incomingCall;
      const wx = current.ui?.wechat ?? {};
      if (!active || active.caller !== "西蓝花" || active.status !== "ringing" || wx.wxBroccoliAfterDoorCallDeclinedV1 === true) return;
      const next = dispatch(work, { ...current, incomingCall: null }, "callDeclined", active.target || active.caller);
      const queued: Array<{ id: string; sender: string; body: string; thread: string; kind?: Item["kind"]; media?: string; outgoing?: boolean; meta?: Record<string, string> }> = [
        { id: "drunk-broccoli-missed-after-door-v2", sender: "西蓝花", body: "对方已取消", thread: "西蓝花", kind: "call", meta: { callStatus: "cancelled", switchThread: "西蓝花" } },
        { id: "drunk-door-bigg-intro-v1", sender: "大G", body: "你好我是溫尚翊，你朋友喝多了。", thread: "西蓝花" },
        { id: "drunk-door-broccoli-pause-v1", sender: "西蓝花", body: "………………", thread: "西蓝花" },
        { id: "drunk-door-broccoli-gasp-v1", sender: "西蓝花", body: "啊？？？", thread: "西蓝花" },
        { id: "drunk-door-broccoli-confirm-v1", sender: "西蓝花", body: "你是溫尚翊？？？", thread: "西蓝花" },
        { id: "drunk-door-broccoli-question-v1", sender: "西蓝花", body: "她在干嘛，能接电话吗？", thread: "西蓝花" },
        { id: "drunk-door-bigg-explain-v1", sender: "大G", body: "嗯，她刚刚喝了不少，现在已经睡着了。", thread: "西蓝花" },
        { id: "drunk-door-bigg-reassure-v1", sender: "大G", body: "不用擔心，我會照顧好她。", thread: "西蓝花" },
        { id: "drunk-door-broccoli-relief-v1", sender: "西蓝花", body: "好吧.....我就知道......", thread: "西蓝花" },
        { id: "drunk-door-broccoli-request-v1", sender: "西蓝花", body: "……那真的麻煩你了，醒了叫她回我消息！還有拜託你看好她，不要再讓她喝了……", thread: "西蓝花" },
      ];
      update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxBroccoliAfterDoorCallDeclinedV1: true, wxCatPendingLines: JSON.stringify(queued) } } });
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [s.incomingCall, s.ui?.wechat?.wxBroccoliAfterDoorCallV1, s.ui?.wechat?.wxBroccoliAfterDoorCallDeclinedV1, ready, creator, work.id]);

  const postDrunkThreadRef = useRef(String(s.ui?.wechat?.openThread ?? ""));
  useEffect(() => {
    const current = runtimeRef.current;
    const wx = current.ui?.wechat ?? {};
    const opened = String(wx.openThread ?? "");
    const previousNonEmpty = postDrunkThreadRef.current;
    if (opened) postDrunkThreadRef.current = opened;

    if (creator || !ready || locked || wx.wxDrunkFinalCallFinishedV7 !== true) return;

    const stored = current.messages.wechat ?? [];
    let story: { version?: number; stage?: number; branch?: string; messages?: Item[] } = {};
    try { if (typeof wx.catRescueState === "string") story = JSON.parse(wx.catRescueState); } catch { story = {}; }
    const storyMessages = Array.isArray(story.messages) ? story.messages : [];
    const transcript = [...stored, ...storyMessages];
    const doorLineDelivered = transcript.some((item) =>
      (item.sender === "大G" || item.title === "大G" || item.meta?.storyThread === "大G") &&
      ["我到门口了，开门吧。", "我到門口了，開門吧。"].includes(item.body.trim())
    );

    // Deliver Broccoli's push as soon as DaG's final door line is actually
    // present in the saved transcript, while the player is still in DaG's chat.
    if (doorLineDelivered && wx.wxPostDrunkBroccoliCheckInV1 !== true) {
      // At delivery time, create only the push notification. The chat bubble
      // is committed when the player taps this notification/opening Broccoli.
      update({
        ...current,
        notifications: [...current.notifications, "微信：西蓝花：亲，你是死了吗？"].slice(-60),
        ui: { ...current.ui, wechat: {
          ...wx,
          wxPostDrunkBroccoliCheckInV1: true,
        } },
      });
      return;
    }

    // Only after leaving DaG and re-entering Broccoli is the "....哈喽。" choice unlocked.
    const returnedToBroccoliFromDaG =
      (previousNonEmpty === "大G" || previousNonEmpty === "温尚翊") &&
      (opened === "西蓝花" || opened === "西兰花");
    if (returnedToBroccoliFromDaG && doorLineDelivered &&
        wx.wxPostDrunkBroccoliCheckInV1 === true &&
        wx.wxPostDoorBroccoliOpenedAfterDoorV1 !== true) {
      update({ ...current, ui: { ...current.ui, wechat: {
        ...wx, wxPostDoorBroccoliOpenedAfterDoorV1: true,
      } } });
    }
  }, [s.ui?.wechat?.openThread, s.ui?.wechat?.wxDrunkFinalCallFinishedV7, s.ui?.wechat?.catRescueState, s.messages.wechat, ready, locked, creator]);

  useEffect(() => {
    const wx = s.ui?.wechat ?? {};
    let pending: unknown[] = [];
    try {
      const parsed = typeof wx.wxCatPendingLines === "string" ? JSON.parse(wx.wxCatPendingLines) : [];
      if (Array.isArray(parsed)) pending = parsed;
    } catch { pending = []; }
    // The dot follows the completed borrowed-phone reassurance exchange.
    if (creator || !ready || locked || wx.wxDoorVoiceFollowupQueuedV1 !== true ||
        pending.length > 0 || wx.wxPostDrunkGDotDeliveredV1 === true) return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      const latestWx = current.ui?.wechat ?? {};
      if (latestWx.wxPostDrunkGDotDeliveredV1 === true) return;
      const avatar = "./assets/dag-new-avatar.jpg";
      const time = (current.date || work.phone.date) + " " + (current.time || work.phone.time);
      const message = makeItem({ id: "drunk-post-door-g-dot-v1", title: "大G", sender: "大G", body: "。", time, outgoing: false, avatar, meta: { storyId: "cat-rescue", storyThread: "大G", avatarFromMessage: "yes" } });
      const messages = current.messages.wechat ?? [];
      let story: { version?: number; stage?: number; branch?: string; messages?: Item[] } = {};
      try { if (typeof latestWx.catRescueState === "string") story = JSON.parse(latestWx.catRescueState); } catch { story = {}; }
      const storyMessages = Array.isArray(story.messages) ? story.messages : [];
      const exists = messages.some((item) => item.id === message.id) || storyMessages.some((item) => item.id === message.id);
      const nextMessage = exists ? [] : [message];
      // Persist the new DaG portrait from the first standalone dot onward.
      // Both the chat transcript and the inbox preview are derived from these
      // message records, so update both stores at the same boundary.
      const isDaGIncoming = (item: Item) =>
        !item.outgoing && (item.title === "大G" || item.title === "温尚翊" || item.sender === "大G" || item.sender === "温尚翊");
      const afterDotBoundary = (item: Item) =>
        item.id === message.id ||
        item.meta?.avatarFromMessage === "yes" ||
        (typeof item.time === "string" && item.time >= time);
      const updateDaGAvatar = (item: Item) =>
        isDaGIncoming(item) && afterDotBoundary(item) ? { ...item, avatar } : item;
      const updatedWechat = [...messages.map(updateDaGAvatar), ...nextMessage];
      const updatedStoryMessages = [...storyMessages.map(updateDaGAvatar), ...nextMessage];
      update({
        ...current,
        messages: { ...current.messages, wechat: updatedWechat },
        notifications: [...current.notifications, "微信：大G：。"].slice(-60),
        ui: { ...current.ui, wechat: {
          ...latestWx,
          wxDaGAvatarV2: avatar,
          wxPostDrunkGDotDeliveredV1: true,
          catRescueState: JSON.stringify({ ...story, messages: updatedStoryMessages }),
        } },
      });
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [s.ui?.wechat?.wxDoorVoiceFollowupQueuedV1, s.ui?.wechat?.wxCatPendingLines, s.ui?.wechat?.wxPostDrunkGDotDeliveredV1, ready, locked, creator, work.id]);

  const event = (event: string, target: string) => {
    if (!creator) update(dispatch(work, runtimeRef.current, event, target));
  };
  const markWeChatThreadRead = (contact: string) => {
    if (!contact) return;
    const current = runtimeRef.current;
    const prefix = "微信：" + contact + "：";
    update({
      ...current,
      notifications: current.notifications.filter((notice) => !notice.startsWith(prefix)),
    });
  };
  // Deliver queued story replies one at a time. Each incoming line is
  // persisted before the next is scheduled, so the chat reads naturally and
  // a refresh cannot silently discard the remaining replies.
  const pendingStoryQueueRaw = s.ui?.wechat?.wxCatPendingLines;
  const currentAppRef = useRef(app);
  currentAppRef.current = app;
  // Repair messages already stored by older builds: DaG's borrowed-phone
  // replies in Broccoli's thread were saved as incoming DaG messages.
  useEffect(() => {
    if (creator || !ready) return;
    const current = runtimeRef.current;
    const wx = current.ui?.wechat ?? {};
    let catState: { version?: number; stage?: number; branch?: string; messages?: Item[] } = {};
    try {
      if (typeof wx.catRescueState === "string") catState = JSON.parse(wx.catRescueState);
    } catch { catState = {}; }
    const normalize = (items: Item[]) => {
      let changed = false;
      const next = items.map((item) => {
        const thread = item.meta?.storyThread || item.title;
        if (
          item.meta?.storyId === "cat-rescue" &&
          (thread === "西蓝花" || thread === "西兰花") &&
          (item.sender === "大G" || item.sender === "温尚翊")
        ) {
          changed = true;
          return {
            ...item,
            sender: "我",
            outgoing: true,
            meta: { ...item.meta, impersonatedBy: item.sender },
          };
        }
        if (
          (item.id === "drunk-broccoli-missed-after-door-v1" || item.id === "drunk-broccoli-missed-after-door-v2") &&
          (thread === "西蓝花" || thread === "西兰花")
        ) {
          changed = true;
          const meta = Object.fromEntries(
            Object.entries(item.meta).filter(([key]) => key !== "systemNotice")
          );
          return {
            ...item,
            title: "西蓝花",
            sender: "西蓝花",
            body: "对方已取消",
            outgoing: false,
            kind: "call" as const,
            meta: { ...meta, callStatus: "cancelled", storyThread: "西蓝花" },
          };
        }
        return item;
      });
      const cancelledIndex = next.findIndex((item) =>
        item.id === "drunk-broccoli-missed-after-door-v1" || item.id === "drunk-broccoli-missed-after-door-v2"
      );
      const replyIndex = next.findIndex((item) =>
        item.id === "drunk-broccoli-call-ended-v2" ||
        item.body.includes("你在說什麼我聽不清") ||
        item.body.includes("你在说什么我听不清")
      );
      if (cancelledIndex >= 0 && replyIndex >= 0 && cancelledIndex > replyIndex) {
        const [cancelled] = next.splice(cancelledIndex, 1);
        next.splice(replyIndex, 0, cancelled);
        changed = true;
      }
      return { items: next, changed };
    };
    const catMessages = normalize(Array.isArray(catState.messages) ? catState.messages : []);
    const chatMessages = normalize(current.messages.wechat ?? []);
    if (!catMessages.changed && !chatMessages.changed) return;
    update({
      ...current,
      messages: {
        ...current.messages,
        ...(chatMessages.changed ? { wechat: chatMessages.items } : {}),
      },
      ui: {
        ...current.ui,
        wechat: {
          ...wx,
          ...(catMessages.changed
            ? { catRescueState: JSON.stringify({ ...catState, messages: catMessages.items }) }
            : {}),
        },
      },
    });
  }, [ready, creator, s.messages.wechat, s.ui?.wechat?.catRescueState, work.id]);
  useEffect(() => {
    if (creator || !ready || typeof pendingStoryQueueRaw !== "string" || !pendingStoryQueueRaw || pendingStoryQueueRaw === "[]") return;
    let parsedQueue: Array<{ id?: string; sender: string; body: string; thread?: string; kind?: Item["kind"]; media?: string; meta?: Record<string, string> }> = [];
    try {
      const parsed = JSON.parse(pendingStoryQueueRaw);
      if (Array.isArray(parsed)) parsedQueue = parsed.filter((line) =>
        line && typeof line.sender === "string" && typeof line.body === "string"
      );
    } catch { parsedQueue = []; }
    if (!parsedQueue.length) return;

    const timer = window.setTimeout(() => {
      const latest = runtimeRef.current;
      const wx = latest.ui?.wechat ?? {};
      let currentQueue: typeof parsedQueue = [];
      try {
        const raw = wx.wxCatPendingLines;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) currentQueue = parsed.filter((line) =>
          line && typeof line.sender === "string" && typeof line.body === "string"
        );
      } catch { currentQueue = []; }
      const line = currentQueue[0];
      // A UI rerender can refresh the queue object while this timer is waiting.
      // Match the head by its actual message payload rather than optional IDs or
      // a stale thread alias, otherwise a valid reply can be silently stranded.
      if (!line || line.sender !== parsedQueue[0].sender || line.body !== parsedQueue[0].body) return;

      let catState: { version?: number; stage?: number; branch?: string; messages?: Item[] } = {};
      try {
        const raw = wx.catRescueState;
        if (typeof raw === "string") catState = JSON.parse(raw);
      } catch { catState = {}; }
      const thread = line.thread || getCatRescueThreadForStage(Number(catState.stage) || 0);
      // In the drunk-phone scene, DaG is borrowing the owner's phone to reply
      // inside Broccoli's chat. Those lines must render as the owner's outgoing
      // messages (right side + owner's avatar), not as incoming DaG messages.
      const isOwnerImpersonation =
        (thread === "西蓝花" || thread === "西兰花") &&
        (line.sender === "大G" || line.sender === "温尚翊");
      const messageSender = isOwnerImpersonation ? "我" : line.sender;
      const orderAt = Date.now();
      const baseTime = (latest.date || work.phone.date) + " " + (latest.time || work.phone.time);
      const normalizeDoorVoice = (items: Item[]) => items.map((item) =>
        item.id === "drunk-big-g-door-voice-v1"
          ? { ...item, sender: "大G", outgoing: false, avatar: "", title: "大G", kind: "audio" as const, media: "./assets/dag-door-voice.mp3", body: "開門，我在外面。", meta: { ...item.meta, voiceDuration: "2", voiceTranscript: "開門，我在外面。" } }
          : item
      );
      const storyMessages = normalizeDoorVoice(Array.isArray(catState.messages) ? catState.messages : []);
      const wechatMessages = normalizeDoorVoice(latest.messages.wechat ?? []);
      const isBroccoliCancelledCall =
        (thread === "西蓝花" || thread === "西兰花") &&
        (line.id === "drunk-broccoli-missed-after-door-v1" || line.id === "drunk-broccoli-missed-after-door-v2" || line.meta?.callStatus === "cancelled");
      const created = makeItem({
        id: line.id || "cat-rescue-stage-" + (Number(catState.stage) || 0) + "-reply-" + thread + "-" + line.sender + "-" + orderAt,
        title: thread,
        sender: isBroccoliCancelledCall ? "西蓝花" : messageSender,
        body: isBroccoliCancelledCall ? "对方已取消" : line.body,
        time: baseTime,
        avatar: (thread === "大G" || thread === "温尚翊") && typeof wx.wxDaGAvatarV2 === "string" ? wx.wxDaGAvatarV2 : "",
        outgoing: isBroccoliCancelledCall ? false : messageSender === "我",
        kind: isBroccoliCancelledCall ? "call" : line.kind || "text",
        media: line.media || "",
        meta: {
          storyId: "cat-rescue",
          storyThread: thread,
          storyOrderAt: String(orderAt),
          ...(isOwnerImpersonation ? { impersonatedBy: line.sender } : {}),
          ...(isBroccoliCancelledCall ? { callStatus: "cancelled" } : {}),
          ...Object.fromEntries(Object.entries(line.meta || {}).filter(([key]) => key !== "systemNotice")),
        },
      });
      const alreadyDelivered = storyMessages.some((item) => item.id === created.id) ||
        wechatMessages.some((item) => item.id === created.id);
      const insertCancelledCallBeforeReply = (items: Item[]) => {
        if (alreadyDelivered) return items;
        if (!isBroccoliCancelledCall) return [...items, created];
        const replyIndex = items.findIndex((item) =>
          item.id === "drunk-broccoli-call-ended-v2" ||
          item.body.includes("你在說什麼我聽不清") ||
          item.body.includes("你在说什么我听不清")
        );
        if (replyIndex < 0) return [...items, created];
        return [...items.slice(0, replyIndex), created, ...items.slice(replyIndex)];
      };
      const nextStoryMessages = insertCancelledCallBeforeReply(storyMessages);
      const nextWechatMessages = insertCancelledCallBeforeReply(wechatMessages);
      const nextNotifications = [...latest.notifications];
      const openThread = String(wx.openThread || "");
      const sameContactThread = (openThread === thread) ||
        ((openThread === "西蓝花" || openThread === "西兰花") && (thread === "西蓝花" || thread === "西兰花")) ||
        ((openThread === "大G" || openThread === "温尚翊") && (thread === "大G" || thread === "温尚翊"));
      if (!alreadyDelivered && messageSender !== "我" && (currentAppRef.current !== "wechat" || !sameContactThread)) {
        const notification = "微信：" + thread + "：" + line.body;
        if (!nextNotifications.includes(notification)) nextNotifications.push(notification);
      }

      update({
        ...latest,
        incomingCall: line.meta?.startBroccoliCall === "yes"
          ? { caller: "西蓝花", target: "西蓝花", status: "ringing" }
          : line.meta?.startBigGCall === "yes" ? { caller: "大G", target: "大G", status: "ringing" } : latest.incomingCall,
        messages: { ...latest.messages, wechat: nextWechatMessages },
        ui: {
          ...latest.ui,
          wechat: {
            ...wx,
            catRescueState: JSON.stringify({
              version: 2,
              stage: Number(catState.stage) || 0,
              branch: typeof catState.branch === "string" ? catState.branch : "",
              messages: nextStoryMessages,
            }),
            wxCatPendingLines: JSON.stringify(
              currentQueue.slice(1)
            ),
            ...(line.meta?.switchThread ? { openThread: line.meta.switchThread } : {}),
            ...(line.meta?.startBroccoliCall === "yes" ? { wxBroccoliCallStartedV1: true } : {}),
            ...(line.meta?.startBroccoliAfterDoor === "yes" ? { wxBroccoliAfterDoorCallV1: true } : {}),
            ...(line.meta?.startBigGCall === "yes" ? { wxDrunkFinalCallStartedV7: true, wxDrunkFinalCallFinishedV7: false, wxBroccoliFinalGCallV1: true } : {}),
          },
        },
        notifications: nextNotifications.slice(-60),
      });
    }, 1150);
    return () => window.clearTimeout(timer);
  }, [creator, ready, pendingStoryQueueRaw, work.id]);

  const captureApp = () => {
    if (!app) return;
    const current = shell.current?.querySelector<HTMLElement>(".app-screen");
    if (!current) return;
    const snapshot = current.cloneNode(true) as HTMLElement;
    snapshot.style.transform = "none";
    snapshot.style.opacity = "1";
    snapshot.style.filter = "none";
    snapshot.style.borderRadius = "0";
    snapshot.querySelectorAll("audio").forEach((el) => el.remove());
    snapshot.querySelectorAll("video").forEach((el) => {
      el.removeAttribute("autoplay");
      el.removeAttribute("src");
    });
    snapshot.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    appSnapshots.current.set(app, snapshot);
    for (const id of appSnapshots.current.keys())
      if (!recent.includes(id) && id !== app) appSnapshots.current.delete(id);
  };
  const saveNow = async () => {
    if (creator || external || !ready) return;
    const id = activeSaveIdRef.current;
    const previous = await db.saves.get(id);
    const savedAt = Date.now();
    await db.saves.put({ id, name: previous?.name || (id === defaultSaveId ? "自动存档" : "未命名存档"), state: runtimeRef.current, savedAt });
    await refreshSaveSlots(id);
    setLoadError("");
  };
  const createSave = async (name: string) => {
    if (creator || external || !ready) return;
    const cleanName = name.trim().slice(0, 24) || "新的存档";
    const id = work.id + "::slot::" + crypto.randomUUID();
    const savedAt = Date.now();
    await db.saves.put({ id, name: cleanName, state: structuredClone(runtimeRef.current), savedAt });
    activeSaveIdRef.current = id;
    await refreshSaveSlots(id);
  };
  const loadSave = async (id: string) => {
    if (creator || external || !ready) return;
    const record = await db.saves.get(id);
    if (!record || record.state.workId !== work.id) { setLoadError("这个存档无法读取，可能已损坏或属于其他游戏。"); return; }
    const fresh = dispatch(work, initialRuntime(work), "start");
    const restored = { ...fresh, ...record.state, workId: work.id, revision: work.updatedAt, ui: { ...fresh.ui, ...record.state.ui }, messages: { ...fresh.messages, ...record.state.messages } };
    activeSaveIdRef.current = id;
    runtimeRef.current = restored;
    setOwn(restored);
    onRuntime?.(restored);
    await refreshSaveSlots(id);
    setLoadError("");
  };
  const renameSave = async (id: string, name: string) => {
    const record = await db.saves.get(id);
    const cleanName = name.trim().slice(0, 24);
    if (!record || !cleanName) return;
    await db.saves.put({ ...record, name: cleanName });
    await refreshSaveSlots();
  };
  const deleteSave = async (id: string) => {
    if (saveInfo.slots.length <= 1) { setLoadError("至少保留一个存档。"); return; }
    await db.saves.delete(id);
    if (activeSaveIdRef.current === id) {
      const next = saveInfo.slots.find((slot) => slot.id !== id);
      if (next) await loadSave(next.id);
    } else await refreshSaveSlots();
  };
  const clearSaveAndRestart = async () => {
    if (creator || external || !ready) return;
    const fresh = dispatch(work, initialRuntime(work), "start");
    runtimeRef.current = fresh;
    setOwn(fresh);
    onRuntime?.(fresh);
    const id = activeSaveIdRef.current;
    const previous = await db.saves.get(id);
    const savedAt = Date.now();
    await db.saves.put({ id, name: previous?.name || "自动存档", state: fresh, savedAt });
    await refreshSaveSlots(id);
    setLoadError("");
    setApp("");
  };
  const open = (id: string) => {
    if (!work.apps.some((a) => a.id === id && a.installed)) return;
    setApp(id);
    setKeyboard(false);
    setRecent((v) => [id, ...v.filter((a) => a !== id)].slice(0, 8));
    setFolder("");
    setPanel("");
    onOpen?.(id);
    event("openApp", id);
  };
  // The next DaG chapter is gated by the completed Moments/Vava exchange.
  // YouTube must remain the foreground app continuously for ten seconds.
  useEffect(() => {
    if (creator || !ready || locked || app !== "youtube") return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      const wx = current.ui?.wechat ?? {};
      if (wx.wxVavaMomentSeeded !== true || wx.wxVavaPlayCompleted !== true) return;
      if (Number(wx.wxReturnDinnerStage || 0) !== 0) return;
      let queued: Array<{ sender: string; body: string; thread?: string }> = [];
      try {
        const raw = wx.wxCatPendingLines;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) queued = parsed;
      } catch { queued = []; }
      queued.push({
        sender: "大G",
        body: "我明天就回去了，想問妳明天什麼時候方便？我過去接玩玩。",
        thread: "大G",
      });
      update({
        ...current,
        ui: {
          ...current.ui,
          wechat: {
            ...wx,
            wxReturnDinnerStage: 1,
            wxCatPendingLines: JSON.stringify(queued),
          },
        },
      });
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [app, locked, ready, creator, work.id, work.updatedAt]);
  // After the player leaves DaG's tipsy chat and stays in Bilibili for
  // ten seconds, deliver DaG's late-night check-in as a real WeChat notice.
  useEffect(() => {
    if (creator || !ready || locked || app !== "bilibili") return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      const wx = current.ui?.wechat ?? {};
      if (Number(wx.wxReturnDinnerStage) !== 261 || wx.wxDrunkBilibiliPingV1 === true) return;
      let queued: Array<{ id?: string; sender: string; body: string; thread?: string; kind?: Item["kind"]; media?: string; outgoing?: boolean; meta?: Record<string, string> }> = [];
      try {
        const raw = wx.wxCatPendingLines;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) queued = parsed;
      } catch { queued = []; }
      queued.push({ id: "drunk-bilibili-da-g-checkin-v1", sender: "大G", body: "不回消息喔？睡了是不是？晚安。", thread: "大G" });
      update({
        ...current,
        notifications: [...current.notifications, "微信：大G：不回消息喔？睡了是不是？晚安。"].slice(-60),
        ui: { ...current.ui, wechat: {
          ...wx,
          wxReturnDinnerStage: 262,
          wxDrunkBilibiliPingV1: true,
          wxCatPendingLines: JSON.stringify(queued),
        }},
      });
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [app, locked, ready, creator, work.id, work.updatedAt]);
  // The drunk-story segment is message-only for now; no automatic calls.
  // After the final Broccoli goodnight, staying in Xiaohongshu continuously
  // for ten seconds triggers DaG's hotel check-in message exactly once.
  useEffect(() => {
    if (creator || !ready || locked || app !== "redbook") return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      const wx = current.ui?.wechat ?? {};
      if (Number(wx.wxReturnDinnerStage) !== -1 || wx.wxRedbookHotelAfterPickupTriggeredV1 === true) return;
      let catState: { messages?: Array<{ sender?: string; body?: string }> } = {};
      try {
        const raw = wx.catRescueState;
        if (typeof raw === "string") catState = JSON.parse(raw);
      } catch { catState = {}; }
      const goodbyeExists = (catState.messages ?? []).some((item) =>
        item.sender === "我" && /好啦，愛妳呦，媽媽/.test(item.body?.trim() || "")
      );
      if (!goodbyeExists) return;
      let queued: Array<{ id?: string; sender: string; body: string; thread?: string; kind?: Item["kind"]; media?: string; outgoing?: boolean; meta?: Record<string, string> }> = [];
      try {
        const raw = wx.wxCatPendingLines;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) queued = parsed;
      } catch { queued = []; }
      if (queued.some((line) => line.id === "redbook-hotel-arrival-checkin")) return;
      queued.push(
        { id: "redbook-hotel-arrival-checkin-1", sender: "大G", body: "我到家了。", thread: "大G" },
        { id: "redbook-hotel-arrival-checkin-2", sender: "大G", body: "妳早點休息，酒店住得習慣嗎？", thread: "大G" },
      );
      update({
        ...current,
        ui: {
          ...current.ui,
          wechat: {
            ...wx,
            wxRedbookHotelAfterPickupTriggeredV1: true,
            wxReturnDinnerStage: 215,
            wxCatPendingLines: JSON.stringify(queued),
          },
        },
      });
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [app, locked, ready, creator, work.id, work.updatedAt]);
  const installedApps = work.apps.filter((a) => a.installed);
  const apps = installedApps.filter((a) => a.visible);
  const unlock = (pin = "") => {
    if (!work.phone.passcode || pin === work.phone.passcode) {
      setLocked(false);
      setPinOpen(false);
      if (work.phone.notifications && s.notifications.length) {
        setBanner(s.notifications.at(-1) || "");
        setTimeout(() => setBanner(""), 5000);
      }
      event("password", pin);
    } else {
      setPinError("密码不正确");
      setPinOpen(true);
    }
  };
  useEffect(() => {
    if (app && !work.apps.some((a) => a.id === app && a.installed)) setApp("");
  }, [app, work.apps]);
  const plugin = getApp(app);
  const wallpaperBackgrounds: Record<string, string> = {
    liquid: "radial-gradient(ellipse at 18% 18%,#f7d8ed 0%,transparent 36%),radial-gradient(ellipse at 78% 24%,#9fc8ff 0%,transparent 42%),radial-gradient(ellipse at 55% 78%,#f5b9a6 0%,transparent 38%),linear-gradient(145deg,#222b5b 0%,#6b6ba7 48%,#b8c9db 100%)",
    coast: "radial-gradient(ellipse at 72% 28%,#fff4d8 0%,transparent 24%),linear-gradient(165deg,#b9e4ed 0%,#6caec5 42%,#315e80 70%,#172d4b 100%)",
    aurora: "radial-gradient(ellipse at 22% 36%,#62e2c0aa 0%,transparent 34%),radial-gradient(ellipse at 75% 30%,#a17affaa 0%,transparent 36%),radial-gradient(ellipse at 50% 80%,#2678bd 0%,transparent 42%),linear-gradient(155deg,#07152d,#101b3e 58%,#080d21)",
    glacier: "radial-gradient(ellipse at 20% 22%,#fff 0%,transparent 28%),radial-gradient(ellipse at 84% 72%,#9dd8e8 0%,transparent 35%),linear-gradient(145deg,#d8e8f0 0%,#8fb6d2 42%,#527ba6 75%,#273f68 100%)",
    bloom: "radial-gradient(ellipse at 25% 18%,#ffe2d2 0%,transparent 33%),radial-gradient(ellipse at 80% 38%,#d6c3e9 0%,transparent 35%),radial-gradient(ellipse at 48% 85%,#9cb9a0 0%,transparent 38%),linear-gradient(145deg,#f2d8d0,#c4b7cf 52%,#536f75)",
  };
  const wallpaperStyle: CSSProperties = wallpaperChoice.startsWith("data:image/")
    ? { backgroundImage: `url(${wallpaperChoice})`, backgroundSize: "cover", backgroundPosition: "center" }
    : wallpaperChoice === "default"
      ? { backgroundImage: `url("${defaultWallpaperUrl}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", imageRendering: "auto" }
      : wallpaperBackgrounds[wallpaperChoice]
        ? { backgroundImage: wallpaperBackgrounds[wallpaperChoice], backgroundSize: "cover", backgroundPosition: "center" }
        : {};
  useEffect(() => {
    const count = s.notifications.length;
    if (!locked && work.phone.notifications && count > noticesSeen.current) {
      setBanner(s.notifications.at(-1) || "");
      const timer = setTimeout(() => setBanner(""), 4500);
      noticesSeen.current = count;
      return () => clearTimeout(timer);
    }
    noticesSeen.current = count;
  }, [s.notifications.length, locked, work.phone.notifications]);
  const contactRemarksForNotifications = (() => {
    const raw = s.ui?.wechat?.wxContactRemarks;
    if (typeof raw !== "string") return {} as Record<string, string>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
      }
    } catch { /* Ignore malformed saved remarks. */ }
    return {} as Record<string, string>;
  })();
  const notificationItems = (() => {
    let storyMessages: Item[] = [];
    const raw = s.ui?.wechat?.catRescueState;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.messages)) storyMessages = parsed.messages;
      } catch { storyMessages = []; }
    }
    return [...(work.data.wechat ?? []), ...(s.messages.wechat ?? []), ...storyMessages];
  })();
  const dismissNotice = (index: number) =>
    update({
      ...runtimeRef.current,
      notifications: runtimeRef.current.notifications.filter(
        (_, i) => i !== index,
      ),
    });
  const openNotification = (notice: ReturnType<typeof notificationContent>) => {
    setPanel("");
    if (notice.appId === "wechat" && notice.contact) {
      markWeChatThreadRead(notice.contact);
      const current = runtimeRef.current;
      const currentWx = current.ui?.wechat ?? {};
      let nextMessages = current.messages.wechat ?? [];
      let nextStory: { version?: number; stage?: number; branch?: string; messages?: Item[] } = {};
      try { if (typeof currentWx.catRescueState === "string") nextStory = JSON.parse(currentWx.catRescueState); } catch { nextStory = {}; }
      const storyMessages = Array.isArray(nextStory.messages) ? nextStory.messages : [];
      if ((notice.contact === "西蓝花" || notice.contact === "西兰花") &&
          currentWx.wxPostDrunkBroccoliCheckInV1 === true) {
        const checkIn = makeItem({
          id: "drunk-post-door-broccoli-checkin-v1",
          title: "西蓝花",
          sender: "西蓝花",
          body: "亲，你是死了吗？",
          time: (current.date || work.phone.date) + " " + (current.time || work.phone.time),
          outgoing: false,
          meta: { storyId: "cat-rescue", storyThread: "西蓝花" },
        });
        const exists = nextMessages.some((item) => item.id === checkIn.id) ||
          storyMessages.some((item) => item.id === checkIn.id);
        if (!exists) {
          nextMessages = [...nextMessages, checkIn];
          nextStory = { ...nextStory, messages: [...storyMessages, checkIn] };
        }
      }
      update({
        ...current,
        messages: { ...current.messages, wechat: nextMessages },
        ui: {
          ...current.ui,
          wechat: {
            ...currentWx,
            ...(notice.contact === "西蓝花" || notice.contact === "西兰花"
              ? { wxPostDoorBroccoliOpenedAfterDoorV1: true,
                  catRescueState: JSON.stringify(nextStory) }
              : {}),
            openThread: notice.contact,
          },
        },
      });
      open("wechat");
      if (locked) setPinOpen(true);
      return;
    }
    const target = installedApps.some((a) => a.id === notice.appId)
      ? notice.appId
      : installedApps.some((a) => a.id === "messages") ? "messages" : "";
    if (target) open(target);
    if (locked) setPinOpen(true);
  };
  if (!ready) return <div className="phone-loading">正在恢复进度…</div>;
  return (
    <div
      ref={shell}
      style={{ "--phone-scale": deviceScale } as CSSProperties}
      className={`phone-shell ios18 ios27 ${work.phone.theme === "dark" ? "dark-phone" : ""}`}
    >
      <KeyboardContext.Provider value={(open, onSend) => { keyboardSend.current = onSend; setKeyboard(open); }}>
        <div
          className={`phone-screen wallpaper-${work.phone.wallpaper} ${locked ? "is-locked" : ""} ${app ? "in-app" : ""} ${keyboard ? "keyboard-open" : ""}`}
          style={wallpaperStyle}
          data-app={app}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            gestureConsumed.current = false;
            const button = (e.target as HTMLElement).closest<HTMLElement>(
              "[data-app-id]",
            );
            if (button) {
              pressTimer.current = setTimeout(() => {
                gestureConsumed.current = true;
                setContextApp(button.dataset.appId || "");
              }, 550);
            }
            const box = e.currentTarget.getBoundingClientRect(),
              x = (e.clientX - box.left) / deviceScale,
              y = (e.clientY - box.top) / deviceScale;
            gesture.current = {
              x,
              y,
              time: Date.now(),
              zone: y < 90 ? "top" : y > 818 ? "bottom" : locked ? "lock" : "",
            };
          }}
          onPointerMove={(e) => {
            if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5)
              clearTimeout(pressTimer.current);
          }}
          onPointerCancel={() => clearTimeout(pressTimer.current)}
          onPointerUp={(e) => {
            clearTimeout(pressTimer.current);
            const box = e.currentTarget.getBoundingClientRect(),
              y = (e.clientY - box.top) / deviceScale,
              g = gesture.current;
            const dy = y - g.y;
            if (g.zone === "top" && dy > 45)
              setPanel(g.x > 230 ? "control" : "notification");
            else if ((g.zone === "bottom" || g.zone === "lock") && dy < -55) {
              gestureConsumed.current = true;
              if (!locked) captureApp();
              setKeyboard(false);
              if (panel) {
                setPanel("");
              } else if (locked) {
                beginUnlock();
              } else if (g.zone === "bottom" && Date.now() - g.time > 450) {
                captureApp();
                setPanel("switcher");
              } else {
                setApp("");
                setPanel("");
                setFolder("");
              }
            }
          }}
          onClickCapture={(e) => {
            const target = (e.target as HTMLElement).closest(
              ".home-app-grid button,.dock button",
            );
            if (target) {
              setLaunchOrigin(
                readLauncherOrigin(target as HTMLElement, e.currentTarget),
              );
            }
          }}
        >
          <AnimatePresence>
            {wallpaperPickerOpen && (
              <WallpaperPicker
                current={wallpaperChoice}
                imageUrl={defaultWallpaperUrl}
                onSelect={(value) => {
                  setWallpaperChoice(value);
                  try { localStorage.setItem("foundphone-lock-wallpaper", value); } catch { setLoadError("壁纸保存失败，图片可能过大。"); }
                }}
                onClose={() => setWallpaperPickerOpen(false)}
              />
            )}
          </AnimatePresence>
          <div className="wallpaper-orb orb-one" />
          <div className="wallpaper-orb orb-two" />
          <div className="status-bar">
            <button
              onClick={() =>
                setPanel(panel === "notification" ? "" : "notification")
              }
              className="status-time"
              aria-label="通知中心"
            >
              {displayTime}
            </button>
            <div className="dynamic-island" aria-label="灵动岛" />
            <button
              className="signals"
              onClick={() => setPanel(panel === "control" ? "" : "control")}
              aria-label="控制中心"
            >
              <StatusGlyph kind="cellular" />
              <StatusGlyph kind="wifi" />
              <span
                className={`ios-battery${work.phone.battery <= 20 ? " low-battery" : ""}`}
              >
                <span style={{ width: `${work.phone.battery}%` }} />
                <b>{work.phone.battery}</b>
              </span>
            </button>
          </div>
          <AnimatePresence mode="wait">
            {locked && !(quickCamera && app === "camera") ? (
              <DeviceLock
                work={{ ...work, phone: { ...work.phone, date: systemDate } }}
                time={displayTime}
                notices={s.notifications}
                notificationItems={notificationItems}
                notificationRemarks={contactRemarksForNotifications}
                onDismiss={dismissNotice}
                onNotificationOpen={openNotification}
                pinOpen={pinOpen}
                setPinOpen={setPinOpen}
                error={pinError}
                onUnlock={unlock}
                onLight={() => setPanel("light")}
                onWallpaperPicker={() => setWallpaperPickerOpen(true)}
                onCamera={() => {
                  setQuickCamera(true);
                  open("camera");
                }}
              />
            ) : app && app !== "appstore" ? (
              <AppWindow
                key={app}
                className={`app-screen engine-${plugin.engine} skin-${app}`}
                creator={creator}
                origin={launchOrigin}
              >
                <AppContent
                  app={plugin}
                  name={
                    work.apps.find((a) => a.id === app)?.name ?? plugin.name
                  }
                  items={[
                    ...(work.data[app] ?? []),
                    ...(s.messages[app] ?? []),
                  ]}
                  creator={creator}
                  state={s}
                  virtualTime={displayTime}
                  virtualDate={systemDate}
                  onRead={(id) => {
                    event("read", id);
                    if (app === "wechat") {
                      markWeChatThreadRead(id);
                      if (id === "drunk-big-g-door-voice-v1") {
                        const current = runtimeRef.current;
                        const wx = current.ui?.wechat ?? {};
                        if (wx.wxDoorVoiceFollowupQueuedV1 !== true) {
                          const queued = [
                            { id: "drunk-door-bigg-intro-v1", sender: "大G", body: "你好我是溫尚翊，你朋友喝多了。", thread: "西蓝花" },
                            { id: "drunk-door-broccoli-pause-v1", sender: "西蓝花", body: "………………", thread: "西蓝花" },
                            { id: "drunk-door-broccoli-gasp-v1", sender: "西蓝花", body: "啊？？？", thread: "西蓝花" },
                            { id: "drunk-door-broccoli-confirm-v1", sender: "西蓝花", body: "你是溫尚翊？？？", thread: "西蓝花" },
                            { id: "drunk-door-broccoli-question-v1", sender: "西蓝花", body: "她在干嘛，能接电话吗？", thread: "西蓝花" },
                            { id: "drunk-door-bigg-explain-v1", sender: "大G", body: "嗯，她刚刚喝了不少，现在已经睡着了。", thread: "西蓝花" },
                            { id: "drunk-door-bigg-reassure-v1", sender: "大G", body: "不用擔心，我會照顧好她。", thread: "西蓝花" },
                            { id: "drunk-door-broccoli-relief-v1", sender: "西蓝花", body: "好吧.....我就知道......", thread: "西蓝花" },
                            { id: "drunk-door-broccoli-request-v1", sender: "西蓝花", body: "……那真的麻煩你了，醒了叫她回我消息！還有拜託你看好她，不要再讓她喝了……", thread: "西蓝花" },
                          ];
                          update({
                            ...current,
                            ui: {
                              ...current.ui,
                              wechat: {
                                ...wx,
                                wxDoorVoiceFollowupQueuedV1: true,
                                wxBroccoliAfterDoorCallV1: false,
                                wxBroccoliAfterDoorCallStartedV2: true,
                                openThread: "西蓝花",
                                wxCatPendingLines: JSON.stringify(queued),
                              },
                            },
                          });
                        }
                      }
                    }
                  }}
                  onEdit={(item) => onEdit?.(app, item)}
                  onAdd={() => onAdd?.(app)}
                  onBack={() => setApp("")}
                  onSettings={onSettings}
                  onUi={(key, value) => {
                    const current = runtimeRef.current;
                    update(
                      dispatch(
                        work,
                        {
                          ...current,
                          ui: {
                            ...current.ui,
                            [app]: { ...current.ui?.[app], [key]: value },
                          },
                        },
                        "variable",
                        `ui:${app}:${key}`,
                      ),
                    );
                  }}
                  onAppUi={(targetApp, key, value) => {
                    const current = runtimeRef.current;
                    update(dispatch(work, {
                      ...current,
                      ui: { ...current.ui, [targetApp]: { ...current.ui?.[targetApp], [key]: value } },
                    }, "variable", `ui:${targetApp}:${key}`));
                  }}
                  onOpenApp={open}
                  work={work}
                  saveInfo={saveInfo}
                  saveReady={ready && !creator && !external}
                  onSaveNow={saveNow}
                  onClearSave={clearSaveAndRestart}
                  saveSlots={saveInfo.slots}
                  activeSaveId={saveInfo.activeSaveId}
                  onCreateSave={createSave}
                  onLoadSave={loadSave}
                  onRenameSave={renameSave}
                  onDeleteSave={deleteSave}
                />
              </AppWindow>
            ) : (
              <HomeLauncher
                key={
                  "home-" + homeRequest + (app === "appstore" ? "store" : "")
                }
                storeOpen={app === "appstore"}
                closeStore={() => setApp("")}
                work={work}
                layout={deviceLayout.layout}
                change={deviceLayout.change}
                importLayout={deviceLayout.importLayout}
                error={deviceLayout.error}
                open={open}
                onFolder={setFolder}
                search={() => setPanel("search")}
                time={displayTime}
                icon={(a, small) => (
                  <AppIcon
                    key={a.id}
                    id={a.id}
                    name={small ? undefined : a.name}
                    small={small}
                    custom={a.icon}
                    date={systemDate}
                    time={displayTime}
                    badge={a.id === "wechat" ? s.notifications.filter((notice) => notice.startsWith("微信：")).length : 0}
                  />
                )}
                clearApp={(id) =>
                  update({
                    ...runtimeRef.current,
                    messages: Object.fromEntries(
                      Object.entries(runtimeRef.current.messages).filter(
                        ([app]) => app !== id,
                      ),
                    ),
                  })
                }
              />
            )}
          </AnimatePresence>
          {folder && (
            <div className="folder-overlay" onClick={() => setFolder("")}>
              <h2>{folder}</h2>
              <div className="folder-apps" onClick={(e) => e.stopPropagation()}>
                {apps
                  .filter((a) => a.folder === folder)
                  .map((a) => (
                    <button key={a.id} onClick={() => open(a.id)}>
                      <AppIcon id={a.id} name={a.name} custom={a.icon} />
                    </button>
                  ))}
              </div>
              <button className="glass-btn" onClick={() => setFolder("")}>
                关闭文件夹
              </button>
            </div>
          )}
          {panel === "control" && (
            <ControlCenter
              battery={work.phone.battery}
              network={work.phone.network}
              close={() => setPanel("")}
            />
          )}
          {panel && panel !== "control" && panel !== "switcher" && (
            <div
              className={`system-panel ${panel === "light" ? "flash-on" : ""}`}
            >
              <button className="panel-close" onClick={() => setPanel("")}>
                关闭 <ChevronLeft size={14} />
              </button>
              {panel === "notification" ? (
                <>
                  <h2>通知中心</h2>
                  {work.phone.notifications && s.notifications.length ? (
                    <SystemNotifications
                      notices={s.notifications}
                      apps={work.apps}
                      items={notificationItems}
                      remarks={contactRemarksForNotifications}
                      onOpen={openNotification}
                      onDismiss={dismissNotice}
                    />
                  ) : (
                    <p>没有新通知</p>
                  )}
                </>
              ) : panel === "search" ? (
                <>
                  <h2>搜索 App</h2>
                  <AppSearch apps={installedApps} open={open} />
                </>
              ) : (
                <h2>手电筒已打开</h2>
              )}
            </div>
          )}
          {!creator && s.choices.length > 0 && !locked && (
            <div className="story-overlay">
              <span className="eyebrow">故事来到一个岔路口</span>
              <h3>你会如何选择？</h3>
              {s.choices.map((c) => (
                <button
                  key={c.target}
                  onClick={() => update(choose(work, s, c.target))}
                >
                  {c.label}
                  <ArrowUp size={15} />
                </button>
              ))}
            </div>
          )}
          {!creator && s.endings.length > 0 && !locked && (
            <div className="story-overlay ending">
              <span className="eyebrow">ENDING · {s.endings.length}</span>
              <h2>故事在这里停泊。</h2>
              <p>{s.endings[s.endings.length - 1]}</p>
              <button
                onClick={() => {
                  update(dispatch(work, initialRuntime(work), "start"));
                  setApp("");
                  setLocked(true);
                }}
              >
                重新开始
              </button>
            </div>
          )}
          {!creator && s.incomingCall && (
            <div className={`incoming-call-screen ${s.incomingCall.status === "answered" ? "is-connected" : ""} ${s.incomingCall.direction === "outgoing" ? "is-outgoing" : "is-incoming"}`}>
              {callTopNotice && <div className="wechat-call-top-notice">{callTopNotice}<button onClick={() => setCallTopNotice("")}>知道了</button></div>}
              <div className="wechat-call-top-actions">
                <button type="button" aria-label="切换通话设备" title="切换通话设备" onClick={() => setCallSpeakerOn(v => !v)}><Copy size={25}/></button>
                <button type="button" aria-label="添加通话成员" title="添加通话成员" onClick={() => setCallTopNotice("暂不支持添加通话成员")}><UserRoundPlus size={25}/></button>
              </div>
              {(() => {
                const caller = s.incomingCall!.caller;
                const isBigG = caller === "大G" || caller === "温尚翊";
                const displayName = contactRemarksForNotifications[caller] ||
                  contactRemarksForNotifications[isBigG ? "大G" : "西蓝花"] || caller;
                let savedStoryMessages: Array<{ id?: string; sender?: string; title?: string; body?: string; outgoing?: boolean; avatar?: string }> = [];
                try {
                  const rawStory = s.ui?.wechat?.catRescueState;
                  if (typeof rawStory === "string") {
                    const parsed = JSON.parse(rawStory);
                    if (Array.isArray(parsed?.messages)) savedStoryMessages = parsed.messages;
                  }
                } catch { savedStoryMessages = []; }
                const configuredAvatarCandidates = Object.values(work.data ?? {}).flat();
                const avatarCandidates = [...configuredAvatarCandidates, ...(s.messages.wechat ?? []), ...savedStoryMessages];
                const daGAvatarChanged =
                  s.ui?.wechat?.wxPostDrunkGDotDeliveredV1 === true ||
                  avatarCandidates.some((item) =>
                    !item.outgoing &&
                    (item.sender === "大G" || item.sender === "温尚翊" || item.title === "大G" || item.title === "温尚翊") &&
                    (item.id === "drunk-post-door-g-dot-v1" || item.body?.trim() === ".")
                  );
                const originalDaGAvatar = [...avatarCandidates].reverse().find((item) =>
                  !item.outgoing &&
                  (item.sender === "大G" || item.sender === "温尚翊" || item.title === "大G" || item.title === "温尚翊") &&
                  typeof item.avatar === "string" && item.avatar.trim()
                )?.avatar || "";
                const changedDaGAvatar = typeof s.ui?.wechat?.wxDaGAvatarV2 === "string" && s.ui.wechat.wxDaGAvatarV2.trim()
                  ? s.ui.wechat.wxDaGAvatarV2
                  : "./assets/dag-new-avatar.jpg";
                const avatarSrc = isBigG ? (daGAvatarChanged ? changedDaGAvatar : originalDaGAvatar) : GLOOMY_AVATAR;
                const connected = s.incomingCall!.status === "answered";
                const mm = String(Math.floor(callElapsed / 60)).padStart(2, "0");
                const ss = String(callElapsed % 60).padStart(2, "0");
                return <>
                  {connected ? <div className="wechat-call-timer">{mm}:{ss}</div> : <div className="wechat-call-topline">{s.incomingCall!.callType === "video" ? "微信视频通话" : "微信语音通话"}</div>}
                  <div className="incoming-avatar">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" onError={e => {
                        const holder = e.currentTarget.parentElement;
                        e.currentTarget.remove();
                        if (holder) holder.textContent = isBigG ? "🎸" : "🐻";
                      }} />
                    ) : <span className="incoming-avatar-fallback">{isBigG ? "🎸" : "🐻"}</span>}
                  </div>
                  <h2>{displayName}</h2>
                  <p className="wechat-call-state">{connected ? (s.incomingCall!.callType === "video" ? "视频通话中" : "语音通话中") : s.incomingCall!.direction === "outgoing" ? "等待对方接听…" : "邀请你进行语音通话…"}</p>
                </>;
              })()}
              <div className="incoming-actions">
                {s.incomingCall.status === "answered" || s.incomingCall.direction === "outgoing" ? (
                  <>
                    <button className={`call-control ${callMicOn ? "control-active" : "control-muted"}`} onClick={() => setCallMicOn(v => !v)} aria-label={callMicOn ? "关闭麦克风" : "打开麦克风"}>
                      <Mic size={27}/><span>{callMicOn ? "麦克风已开" : "麦克风已关"}</span>
                    </button>
                    <button className="decline-call call-control" onClick={() => {
                      const call = runtimeRef.current.incomingCall;
                      if (!call) return;
                      const current = runtimeRef.current;
                      const next = dispatch(work, { ...current, incomingCall: null }, call.status === "ringing" ? "callDeclined" : "callEnded", call.target || call.caller);
                      const wx = current.ui?.wechat ?? {};
                      const isDrunkFinalCall = call.caller === "大G" && wx.wxDrunkFinalCallStartedV7 === true && wx.wxDrunkFinalCallFinishedV7 !== true;
                      if (call.caller === "西蓝花" && call.status === "ringing" && wx.wxBroccoliAfterDoorCallV1 === true && wx.wxBroccoliAfterDoorCallDeclinedV1 !== true) {
                        const queued = [
                          { id: "drunk-broccoli-missed-after-door-v1", sender: "西蓝花", body: "对方已取消", thread: "西蓝花", kind: "call", meta: { callStatus: "cancelled", switchThread: "西蓝花" } },
                          { id: "drunk-door-bigg-intro-v1", sender: "大G", body: "你好我是溫尚翊，你朋友喝多了。", thread: "西蓝花" },
                          { id: "drunk-door-broccoli-pause-v1", sender: "西蓝花", body: "………………", thread: "西蓝花" },
                          { id: "drunk-door-broccoli-gasp-v1", sender: "西蓝花", body: "啊？？？", thread: "西蓝花" },
                          { id: "drunk-door-broccoli-confirm-v1", sender: "西蓝花", body: "你是溫尚翊？？？", thread: "西蓝花" },
                          { id: "drunk-door-broccoli-question-v1", sender: "西蓝花", body: "她在干嘛，能接电话吗？", thread: "西蓝花" },
                          { id: "drunk-door-bigg-explain-v1", sender: "大G", body: "嗯，她刚刚喝了不少，现在已经睡着了。", thread: "西蓝花" },
                          { id: "drunk-door-bigg-reassure-v1", sender: "大G", body: "不用擔心，我會照顧好她。", thread: "西蓝花" },
                          { id: "drunk-door-broccoli-relief-v1", sender: "西蓝花", body: "好吧.....我就知道......", thread: "西蓝花" },
                          { id: "drunk-door-broccoli-request-v1", sender: "西蓝花", body: "……那真的麻煩你了，醒了叫她回我消息！還有拜託你看好她，不要再讓她喝了……", thread: "西蓝花" },
                        ];
                        update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxBroccoliAfterDoorCallDeclinedV1: true, wxCatPendingLines: JSON.stringify(queued) } } });
                      } else if (call.caller === "西蓝花" && call.status === "answered" && wx.wxBroccoliCallStartedV1 === true) {
                        const queued = [
                          { id: "drunk-broccoli-call-duration-v1", sender: "我", body: "聊天时长 00:09", thread: "西蓝花", kind: "call" },
                          { id: "drunk-broccoli-call-ended-v2", sender: "西蓝花", body: "你在說什麼我聽不清！！", thread: "西蓝花" },
                          { id: "drunk-broccoli-where-v2", sender: "西蓝花", body: "妳現在到底在幹嘛？", thread: "西蓝花" },
                          { id: "drunk-broccoli-answer-v2", sender: "西蓝花", body: "喂？有沒有在聽我說話？", thread: "西蓝花" },
                          { id: "drunk-broccoli-poison-check-v2", sender: "西蓝花", body: "妳不回我，該不會真的中毒了吧？", thread: "西蓝花" },
                          { id: "drunk-broccoli-hotel-v2", sender: "西蓝花", body: "妳酒店到底在哪裡？把地址發我！", thread: "西蓝花", meta: { startBigGCall: "yes" } },
                        ];
                        update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxCatPendingLines: JSON.stringify(queued) } } });
                      } else if (isDrunkFinalCall && wx.wxBroccoliFinalGCallV1 === true) {
                        let queued: Array<{ id?: string; sender: string; body: string; thread?: string; kind?: Item["kind"]; media?: string; outgoing?: boolean; meta?: Record<string, string> }> = [];
                        try { const parsed = typeof wx.wxCatPendingLines === "string" ? JSON.parse(wx.wxCatPendingLines) : []; if (Array.isArray(parsed)) queued = parsed; } catch { queued = []; }
                        queued.push(
                          { id: "drunk-big-g-call-declined-first-v1", sender: "大G", body: "已拒绝", thread: "大G", kind: "call", meta: { callStatus: "declined" } },
                          { id: "drunk-big-g-door-v1", sender: "大G", body: "開門。", thread: "大G" },
                          { id: "drunk-big-g-door-voice-v1", sender: "大G", body: "開門，我在外面。", thread: "大G", kind: "audio", media: "./assets/dag-door-voice.mp3", outgoing: false, meta: { voiceDuration: "2", voiceTranscript: "開門，我在外面。" } },
                        );
                        update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxDrunkFinalCallFinishedV7: true, wxCatPendingLines: JSON.stringify(queued) } } });
                      } else if (isDrunkFinalCall) {
                        let queued: Array<{ id?: string; sender: string; body: string; thread?: string; kind?: Item["kind"]; media?: string; outgoing?: boolean; meta?: Record<string, string> }> = [];
                        try { const parsed = typeof wx.wxCatPendingLines === "string" ? JSON.parse(wx.wxCatPendingLines) : []; if (Array.isArray(parsed)) queued = parsed; } catch { queued = []; }
                        queued.push(
                          { id: "drunk-big-g-call-declined-v10", sender: "大G", body: "已拒绝", thread: "大G", kind: "call", meta: { callStatus: "declined" } },
                          { id: "drunk-big-g-pick-up-v9", sender: "大G", body: "接電話。", thread: "大G" },
                        );
                        update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxDrunkFinalCallFinishedV7: true, wxCatPendingLines: JSON.stringify(queued) } } });
                      } else update(next);
                    }}>
                      <PhoneIcon size={27}/><span>{s.incomingCall.status === "ringing" ? "取消" : "挂断"}</span>
                    </button>
                    <button className={`call-control ${callSpeakerOn ? "control-active" : "control-muted"}`} onClick={() => setCallSpeakerOn(v => !v)} aria-label={callSpeakerOn ? "关闭扬声器" : "打开扬声器"}>
                      {callSpeakerOn ? <Volume2 size={27}/> : <VolumeX size={27}/>}<span>{callSpeakerOn ? "扬声器已开" : "扬声器已关"}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="call-control control-active" onClick={() => setCallMicOn(v => !v)}><Mic size={27}/><span>{callMicOn ? "麦克风已开" : "麦克风已关"}</span></button>
                    <button className="decline-call call-control" onClick={() => {
                      const call = runtimeRef.current.incomingCall;
                      if (call) {
                        const current = runtimeRef.current;
                        const next = dispatch(work, { ...current, incomingCall: null }, "callDeclined", call.target || call.caller);
                        update(next);
                      }
                    }}><PhoneIcon size={27}/><span>拒接</span></button>
                    <button className="accept-call call-control" onClick={() => {
                      const call = runtimeRef.current.incomingCall;
                      if (call) update(dispatch(work, { ...runtimeRef.current, incomingCall: { ...call, status: "answered" } }, "callAnswered", call.target || call.caller));
                    }}><PhoneIcon size={27}/><span>接听</span></button>
                  </>
                )}
              </div>
            </div>
          )}
          {banner && !locked && (() => {
            const notice = notificationContent(banner, work.apps, notificationItems, contactRemarksForNotifications);
            return (
              <button
                className="device-banner"
                onClick={() => {
                  setBanner("");
                  if (notice.appId === "wechat" && notice.contact) {
                    markWeChatThreadRead(notice.contact);
                    const current = runtimeRef.current;
                    const currentWx = current.ui?.wechat ?? {};
                    let nextMessages = current.messages.wechat ?? [];
                    let nextStory: { version?: number; stage?: number; branch?: string; messages?: Item[] } = {};
                    try { if (typeof currentWx.catRescueState === "string") nextStory = JSON.parse(currentWx.catRescueState); } catch { nextStory = {}; }
                    const storyMessages = Array.isArray(nextStory.messages) ? nextStory.messages : [];
                    if ((notice.contact === "西蓝花" || notice.contact === "西兰花") &&
                        currentWx.wxPostDrunkBroccoliCheckInV1 === true) {
                      const checkIn = makeItem({
                        id: "drunk-post-door-broccoli-checkin-v1",
                        title: "西蓝花",
                        sender: "西蓝花",
                        body: "亲，你是死了吗？",
                        time: (current.date || work.phone.date) + " " + (current.time || work.phone.time),
                        outgoing: false,
                        meta: { storyId: "cat-rescue", storyThread: "西蓝花" },
                      });
                      const exists = nextMessages.some((item) => item.id === checkIn.id) ||
                        storyMessages.some((item) => item.id === checkIn.id);
                      if (!exists) {
                        nextMessages = [...nextMessages, checkIn];
                        nextStory = { ...nextStory, messages: [...storyMessages, checkIn] };
                      }
                    }
                    update({
                      ...current,
                      messages: { ...current.messages, wechat: nextMessages },
                      ui: {
                        ...current.ui,
                        wechat: {
                          ...currentWx,
                          ...(notice.contact === "西蓝花" || notice.contact === "西兰花"
                            ? { wxPostDoorBroccoliOpenedAfterDoorV1: true,
                                catRescueState: JSON.stringify(nextStory) }
                            : {}),
                          openThread: notice.contact,
                        },
                      },
                    });
                    open("wechat");
                  } else setPanel("notification");
                }}
              >
                {notice.avatar.startsWith("data:image/") ? (
                  <img className="device-banner-avatar" src={notice.avatar} alt="" />
                ) : (
                  <AppIcon id={notice.appId} small />
                )}
                <span>
                  <strong>{notice.title}</strong>
                  <span>{notice.body}</span>
                </span>
              </button>
            );
          })()}
          {panel === "switcher" && (
            <div className="device-switcher">
              <div className="switcher-cards">
                {recent
                  .filter(
                    (id) =>
                      installedApps.some((a) => a.id === id) &&
                      appSnapshots.current.has(id),
                  )
                  .map((id) => (
                    <button
                      className="recent-app-card"
                      key={id}
                      onClick={() => open(id)}
                    >
                      <span className="recent-app-label">
                        <AppIcon id={id} small />
                        <strong>
                          {work.apps.find((a) => a.id === id)?.name}
                        </strong>
                      </span>
                      <span className="recent-app-window">
                        <span
                          className="recent-app-snapshot"
                          aria-hidden="true"
                          inert
                          ref={(el) => {
                            const snapshot = appSnapshots.current.get(id);
                            if (el && snapshot)
                              el.replaceChildren(snapshot.cloneNode(true));
                          }}
                        />
                      </span>
                    </button>
                  ))}
              </div>
              <button className="switcher-done" onClick={() => setPanel("")}>
                完成
              </button>
            </div>
          )}
          {contextApp && (
            <div
              className="home-context-shade"
              onClick={() => setContextApp("")}
            >
              <div className="home-context-menu">
                <AppIcon id={contextApp} />
                <strong>
                  {work.apps.find((a) => a.id === contextApp)?.name}
                </strong>
                <button
                  onClick={() => {
                    open(contextApp);
                    setContextApp("");
                  }}
                >
                  打开 App
                </button>
                <button
                  onClick={() => {
                    setContextApp("");
                    setPanel("search");
                  }}
                >
                  在 App 库中查看
                </button>
                <button onClick={() => setContextApp("")}>取消</button>
              </div>
            </div>
          )}
          {keyboard && <DeviceKeyboard close={() => setKeyboard(false)} onSend={(value) => keyboardSend.current?.(value)} />}
          {loadError && (
            <button className="runtime-error" onClick={() => setLoadError("")}>
              {loadError}
            </button>
          )}
          <button
            className="home-indicator"
            aria-label="返回桌面"
            onClick={() => {
              if (gestureConsumed.current) return;
              if (locked) {
                beginUnlock();
                return;
              }
              captureApp();
              setHomeRequest((n) => n + 1);
              setKeyboard(false);
              setApp("");
              setFolder("");
              setPanel("");
            }}
          />
          <div className="screen-dimmer" />
          <div className="hardware-reflection" />
        </div>
      </KeyboardContext.Provider>
    </div>
  );
}
function AppSearch({
  apps,
  open,
}: {
  apps: Work["apps"];
  open: (id: string) => void;
}) {
  const [q, set] = useState("");
  return (
    <>
      <input
        autoFocus
        value={q}
        placeholder="App 名称"
        onChange={(e) => set(e.target.value)}
      />
      {apps
        .filter((a) => a.name.toLowerCase().includes(q.toLowerCase()))
        .map((a) => (
          <button
            className="search-result"
            key={a.id}
            onClick={() => open(a.id)}
          >
            <AppIcon id={a.id} small />
            {a.name}
          </button>
        ))}
    </>
  );
}
function Media({ item }: { item: Item }) {
  // This story photo is a bundled public asset. Resolve it from the site root
  // so an older local save with a stale media path still displays the image.
  const src =
    item.id === "hotel-wannwan-sleeping-photo-v2"
      ? "/assets/wannwan-sleeping-cat.jpg"
      : safeMedia(item.media);
  return src ? (
    item.kind === "audio" ? (
      <audio controls src={src} />
    ) : item.kind === "video" ? (
      <video controls playsInline src={src} />
    ) : (
      <img loading="eager" src={src} alt={item.title || "玩玩睡着了"} />
    )
  ) : (
    <div
      className={`original-art art-${item.id.includes("ticket") ? "ticket" : "rain"}`}
    >
      <span>
        {item.id.includes("ticket") ? "城南 / SOUTHBOUND" : "after the rain"}
      </span>
      <strong>{item.id.includes("ticket") ? "09 · 01" : "雨 后"}</strong>
      <small>
        {item.id.includes("ticket")
          ? "16:30 · 一张未完成的约定"
          : "a little moment of quiet"}
      </small>
    </div>
  );
}
function AppContent({
  app,
  name,
  items,
  creator,
  state,
  virtualTime,
  virtualDate,
  onRead,
  onEdit,
  onAdd,
  onBack,
  onSettings,
  onUi,
  onAppUi,
  onOpenApp,
  work,
  saveInfo,
  saveReady,
  onSaveNow,
  onClearSave,
  saveSlots,
  activeSaveId,
  onCreateSave,
  onLoadSave,
  onRenameSave,
  onDeleteSave,
}: {
  app: AppPlugin;
  name: string;
  items: Item[];
  creator: boolean;
  state: Runtime;
  virtualTime: string;
  virtualDate: string;
  onRead: (id: string) => void;
  onEdit: (item: Item) => void;
  onAdd: () => void;
  onBack: () => void;
  onSettings?: () => void;
  onUi?: (key: string, value: UiValue) => void;
  onAppUi?: (appId: string, key: string, value: UiValue) => void;
  onOpenApp?: (appId: string) => void;
  work: Work;
  saveInfo: { hasSave: boolean; savedAt: number | null; slots: Array<{ id: string; name: string; savedAt: number }>; activeSaveId: string };
  saveReady: boolean;
  onSaveNow: () => void;
  onClearSave: () => void;
  saveSlots: Array<{ id: string; name: string; savedAt: number }>;
  activeSaveId: string;
  onCreateSave: (name: string) => void;
  onLoadSave: (id: string) => void;
  onRenameSave: (id: string, name: string) => void;
  onDeleteSave: (id: string) => void;
}) {
  const [detail, setDetail] = useState<Item | null>(null);
  const [thread, setThread] = useState(() => String(state.ui?.[app.id]?.openThread ?? ""));
  // Notification deep-links are the source of truth for the rendered chat.
  // Derive the target synchronously so tapping a push cannot leave WeChat on
  // the conversation list while a local-state effect is still pending.
  const requestedThread = state.ui?.[app.id]?.openThread;
  const activeThread = typeof requestedThread === "string" ? requestedThread : thread;
  useEffect(() => {
    if (activeThread !== thread) setThread(activeThread);
  }, [activeThread, thread]);
  const [tab, setTab] = useState(app.tabs[0]);
  const [q, setQ] = useState("");
  const [pw, setPw] = useState("");
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [pwError, setPwError] = useState("");
  const [likes, setLikes] = useState<string[]>([]);
  const notificationTranscriptItems: Item[] = app.id === "wechat" ? [
    ...(state.ui?.wechat?.wxPostDrunkBroccoliCheckInV1 === true ? [makeItem({
      id: "drunk-post-door-broccoli-checkin-v1",
      title: "西蓝花", sender: "西蓝花", body: "亲，你是死了吗？",
      time: virtualDate + " " + virtualTime, outgoing: false,
      meta: { storyId: "cat-rescue", storyThread: "西蓝花" },
    })] : []),
    ...(state.ui?.wechat?.wxPostDrunkGDotDeliveredV1 === true ? [makeItem({
      id: "drunk-post-door-g-dot-v1",
      title: "大G", sender: "大G", body: "。",
      time: virtualDate + " " + virtualTime, outgoing: false,
      avatar: typeof state.ui?.wechat?.wxDaGAvatarV2 === "string" ? state.ui.wechat.wxDaGAvatarV2 : "",
      meta: { storyId: "cat-rescue", storyThread: "大G" },
    })] : []),
  ] : [];
  const shown = [
    ...items.filter((i) => creator || visible(i, state)),
    ...notificationTranscriptItems.filter((eventItem) => !items.some((item) => item.id === eventItem.id)),
  ].filter((i) =>
    (i.title + i.body + i.sender).toLowerCase().includes(q.toLowerCase()),
  );
  const filtered =
    tab === "收藏"
      ? shown.filter((i) => i.favorite)
      : tab === app.tabs[0]
        ? shown
        : shown.filter((i) => i.folder === tab);
  const read = (i: Item) => {
    if (creator) {
      onEdit(i);
      return;
    }
    setDetail(i);
    if (!i.password || unlocks.includes(i.id)) onRead(i.id);
  };
  const chats = [...new Set(shown.map((i) => i.title))];
  const back = () => {
    if (detail) setDetail(null);
    else if (activeThread) {
      setThread("");
      if (app.id === "wechat") onUi?.("openThread", "");
    } else onBack();
  };
  const Skin =
    app.id === "wechat"
      ? WeChatSkin
      : app.id === "whatsapp"
        ? WhatsAppSkin
        : (catalogSkins[app.id as keyof typeof catalogSkins] ?? null);
  const detailView = detail ? (
    <div className="phone-content detail-content">
      {detail.password && !creator && !unlocks.includes(detail.id) ? (
        <div className="locked-note">
          <LockKeyhole size={36} />
          <h3>这条内容已锁定</h3>
          <input
            type="password"
            placeholder="内容密码"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button
            onClick={() => {
              if (pw === detail.password) {
                setUnlocks([...unlocks, detail.id]);
                onRead(detail.id);
                setPwError("");
              } else setPwError("密码不正确");
            }}
          >
            解锁内容
          </button>
          <small>{pwError}</small>
        </div>
      ) : (
        <>
          <small className="detail-meta">
            {detail.time} · {detail.sender}
          </small>
          <h2>{detail.title}</h2>
          {(detail.media || ["media", "social"].includes(app.engine)) && (
            <Media item={detail} />
          )}
          <RichText value={detail.richText} fallback={detail.body} />
          <dl className="item-metadata">
            {getFields(app.id)
              .filter((f) => detail.meta?.[f.key])
              .map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>{detail.meta[f.key]}</dd>
                </div>
              ))}
          </dl>
          {detail.folder && (
            <span className="folder-label">
              <Folder size={12} />
              {detail.folder}
            </span>
          )}
          {detail.comments.map((c, i) => (
            <p key={i} className="comment">
              {c}
            </p>
          ))}
        </>
      )}
    </div>
  ) : null;
  if (Skin)
    return (
      <>
        <div className="catalog-slot" hidden={!!detail}>
          <Suspense fallback={<div className="catalog-loading">正在打开…</div>}>
            <Skin
              appId={app.id}
              owner={work.phone.owner}
              virtualTime={virtualTime}
              virtualDate={virtualDate}
              ui={state.ui?.[app.id]}
              allUi={state.ui}
              onUi={creator ? undefined : onUi}
              onAppUi={creator ? undefined : onAppUi}
              onOpenApp={onOpenApp}
              name={name}
              items={shown}
              creator={creator}
              onRead={onRead}
              onItem={read}
              onAdd={onAdd}
              onBack={onBack}
              thread={activeThread}
              hasSave={saveInfo.hasSave}
              savedAt={saveInfo.savedAt}
              saveReady={saveReady}
              onSaveNow={onSaveNow}
              onClearSave={onClearSave}
              saveSlots={saveSlots}
              activeSaveId={activeSaveId}
              onCreateSave={onCreateSave}
              onLoadSave={onLoadSave}
              onRenameSave={onRenameSave}
              onDeleteSave={onDeleteSave}
              onThread={(next) => {
                setThread(next);
                if (app.id === "wechat") onUi?.("openThread", next);
              }}
            />
          </Suspense>
        </div>
        {detail &&
          (socialDetailApps.has(app.id) &&
          (!detail.password || unlocks.includes(detail.id)) ? (
            <SocialDetail
              app={app.id}
              item={detail}
              back={back}
              owner={work.phone.owner}
              ui={state.ui?.[app.id]}
              onUi={onUi}
            />
          ) : nativeDetailApps.has(app.id) &&
            (!detail.password || unlocks.includes(detail.id)) ? (
            <NativeDetail app={app.id} item={detail} back={back} />
          ) : (
            <>
              <div className="app-nav">
                <button aria-label="返回" onClick={back}>
                  <ChevronLeft size={23} />
                </button>
                <strong>{detail.title}</strong>
                <span />
              </div>
              {detailView}
            </>
          ))}
      </>
    );
  return (
    <>
      <div className="app-nav">
        <button onClick={back} aria-label="返回">
          <ChevronLeft size={23} />
          {detail || activeThread ? "返回" : ""}
        </button>
        <strong>{activeThread || name}</strong>
        <button
          onClick={
            creator
              ? onAdd
              : () =>
                  document
                    .querySelector<HTMLInputElement>(
                      ".app-screen .phone-search input",
                    )
                    ?.focus()
          }
          aria-label={creator ? "新增内容" : "搜索内容"}
        >
          {creator ? <Plus size={22} /> : <Search size={20} />}
        </button>
      </div>
      {app.id === "settings" && !detail ? (
        <NativeSettings
          work={work}
          items={items}
          creator={creator}
          onItem={read}
          onSettings={onSettings}
        />
      ) : app.id === "calculator" && !detail ? (
        <NativeCalculator
          items={shown}
          onRead={read}
          ui={state.ui?.[app.id]}
          onUi={onUi}
        />
      ) : detail ? (
        detailView
      ) : app.engine === "messaging" && activeThread ? (
        <div className="chat-content">
          <div className="chat-time">2026 年 9 月 1 日</div>
          {shown
            .filter((i) => i.title === activeThread)
            .map((i) => (
              <button
                key={i.id}
                className={`message-row ${i.outgoing ? "outgoing" : ""} ${i.kind === "call" ? "call-history" : ""}`}
                onClick={() => (creator ? onEdit(i) : onRead(i.id))}
              >
                <span className="avatar">{i.sender.slice(0, 1)}</span>
                <span className="bubble">
                  {i.kind === "call" ? (
                    <span className="call-history-content">
                      <PhoneIcon size={23} strokeWidth={2.2} />
                      <span>{i.meta?.callStatus === "declined" ? "已拒绝" : i.body}</span>
                    </span>
                  ) : i.kind === "image" ||
                  i.kind === "audio" ||
                  i.kind === "video" ? (
                    <Media item={i} />
                  ) : i.kind === "transfer" ? (
                    <span className="transfer">
                      ¥ {i.body}
                      <small>虚构转账记录</small>
                    </span>
                  ) : (
                    i.body
                  )}
                  <small>
                    {i.time.slice(-5)} {i.read ? "✓✓" : ""}
                  </small>
                  {creator && (i.hidden || i.unlock) && (
                    <LockKeyhole size={12} />
                  )}
                </span>
              </button>
            ))}
          {creator ? (
            <button className="chat-compose" onClick={onAdd}>
              ＋ 添加一条消息
            </button>
          ) : (
            <div className="chat-compose muted">
              根据剧情推进，互动回复将在这里出现。
            </div>
          )}
        </div>
      ) : (
        <div
          className={`phone-content ${app.engine === "social" ? "feed-content" : ""}`}
        >
          {app.engine !== "media" && (
            <div className="phone-search">
              <Search size={15} />
              <input
                placeholder={`搜索${name}`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          )}
          {app.engine === "messaging" ? (
            chats.map((t) => {
              const list = shown.filter((i) => i.title === t),
                last = list[list.length - 1];
              return (
                <button
                  className="contact-row"
                  key={t}
                  onClick={() => {
                    setThread(t);
                    onRead(t);
                  }}
                >
                  <span className="avatar" style={{ background: app.color }}>
                    {t.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{t}</strong>
                    <p>{last.body}</p>
                  </span>
                  <small>{last.time.slice(-5)}</small>
                </button>
              );
            })
          ) : app.engine === "media" ? (
            <>
              <div className="media-heading">
                <h1>{tab}</h1>
                <p>{filtered.length} 个故事片段</p>
              </div>
              <div className="media-grid">
                {filtered.map((i) => (
                  <button key={i.id} onClick={() => read(i)}>
                    <Media item={i} />
                    <span>
                      {i.title} {creator && i.hidden ? "· 隐藏" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : app.engine === "social" ? (
            filtered.map((i) => (
              <article className="social-post" key={i.id}>
                <div className="post-author">
                  <span className="avatar" style={{ background: app.color }}>
                    {i.sender.slice(0, 1)}
                  </span>
                  <div>
                    <strong>{i.sender}</strong>
                    <small>{i.time}</small>
                  </div>
                  <button aria-label="查看帖子详情" onClick={() => read(i)}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <button className="post-image" onClick={() => read(i)}>
                  <Media item={i} />
                </button>
                <div className="post-actions">
                  <button
                    aria-label="虚构点赞"
                    onClick={() =>
                      setLikes(
                        likes.includes(i.id)
                          ? likes.filter((id) => id !== i.id)
                          : [...likes, i.id],
                      )
                    }
                  >
                    <Heart
                      size={22}
                      fill={likes.includes(i.id) ? "#d67670" : "none"}
                    />
                  </button>
                  <button aria-label="查看评论" onClick={() => read(i)}>
                    <MessageCircle size={22} />
                  </button>
                  <small>
                    {i.likes + (likes.includes(i.id) ? 1 : 0)} 次虚构喜欢
                  </small>
                </div>
                <button className="post-text" onClick={() => read(i)}>
                  <strong>{i.title}</strong>
                  <p>{i.body}</p>
                </button>
              </article>
            ))
          ) : (
            filtered.map((i) => (
              <button
                key={i.id}
                className={`record-row ${app.engine === "document" ? "document-row" : ""}`}
                onClick={() => read(i)}
              >
                <div className="record-symbol">
                  {app.engine === "records" ? (
                    <app.icon size={20} />
                  ) : (
                    <span>{i.title.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <strong>{i.title}</strong>
                  <p>{i.body.split("\n")[0]}</p>
                  <small>
                    {i.time} {i.folder && `· ${i.folder}`}
                  </small>
                </div>
                {i.password || i.hidden ? (
                  <LockKeyhole size={14} />
                ) : (
                  <ChevronLeft className="chevron-right" size={16} />
                )}
              </button>
            ))
          )}
          {!filtered.length && app.engine !== "messaging" && (
            <div className="empty-app">
              <app.icon size={36} />
              <h3>这一页还很安静</h3>
              <p>
                {creator
                  ? "添加属于这个 App 的故事内容。"
                  : "暂时没有可浏览的内容。"}
              </p>
            </div>
          )}
          {creator && (
            <button className="phone-add" onClick={onAdd}>
              <Plus size={15} />
              添加
              {app.engine === "messaging"
                ? "聊天"
                : app.engine === "social"
                  ? "帖子"
                  : app.engine === "media"
                    ? "素材"
                    : "内容"}
            </button>
          )}
        </div>
      )}
      {!detail &&
        !thread &&
        app.id !== "calculator" &&
        app.id !== "settings" && (
          <div className="app-tabs">
            {app.tabs.map((t, i) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {i === 0 ? (
                  <MessageCircle size={17} />
                ) : i === 1 ? (
                  <Search size={17} />
                ) : (
                  <UsersIcon />
                )}
                <span>{t}</span>
              </button>
            ))}
          </div>
        )}
    </>
  );
}
function UsersIcon() {
  return <PhoneIcon size={17} />;
}
