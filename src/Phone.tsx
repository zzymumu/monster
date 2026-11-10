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
        ) : id === "trip" ? (
          <img src="https://img1.paisawapas.com/images/2025/01/04165310/logo-1.png" alt="Trip" />
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
  const [milkTeaCallStep, setMilkTeaCallStep] = useState(-1);
  const [milkTeaCallReply, setMilkTeaCallReply] = useState(-1);
  const [dagHotpotCallStep, setDagHotpotCallStep] = useState(-1);
  const [dagHotpotReplyReady, setDagHotpotReplyReady] = useState(false);
  const [postDinnerCallStep, setPostDinnerCallStep] = useState(-1);
  const [postDinnerReplyReady, setPostDinnerReplyReady] = useState(false);
  const [outgoingDaGCallStep, setOutgoingDaGCallStep] = useState(-1);
  const [outgoingDaGReplyReady, setOutgoingDaGReplyReady] = useState(false);
  const outgoingDaGCallAudio = Array.from({ length: 13 }, (_, index) => `./assets/dag-outgoing-call-${String(index + 1).padStart(2, "0")}.mp3`);
  const outgoingDaGCallLines = ["喂？怎么啦？","欸你等我一下，太吵了，我出去接哦。好啦，你说。","真的不来哦？我本来还想说演出结束后带你去吃好吃的。","白痴哦，这有什么好道歉的，下次再来看不就好了。","好啊你说的哦，等我回来请我吃饭。","才不要吃榴莲咧，臭死了。","原来你喜欢吃榴莲。","我记得我第一次吃榴莲好像是在录综艺，我以为我吃到屎了。","哈哈哈实话啊，真的很臭欸。","好啦不气不气，逗你玩的嘛。","好哦，那我先去忙了哦，晚点聊。","ok啦会记得吃饭，你也是。","拜拜~"];
  const outgoingDaGCallReplies = ["嗯...就是.....","我想了一下，大马我还是不去了。","嗯真的去不了啦，那几天有点事，对不起哦....","嗯嗯，等你回来我请你吃饭。","嗯哼，君子一言驷马难追。对了，大马的榴莲超好吃诶，帮我多吃点。","你放屁，明明那么好吃！","对啊，榴莲是世界上最完美的水果了~你到底有没有吃过，没吃过就在乱说。","...........",".............","赶紧去忙吧你。","要按时吃饭啊，别又不吃。","好，拜拜~"];

  const postDinnerCallAudio = Array.from({ length: 21 }, (_, index) => `./assets/dag-wechat-call-${String(index + 10).padStart(2, "0")}.mp3`);
  const postDinnerCallLines = ["喂？能听到我说话吗？","弹了一下午吉他晚上又开车，手很酸欸！","对啊，好心人给你点奶茶，晚上还请你吃饭，陪我聊聊天怎么啦？","嗯...不知道诶，随便说嘛！晚上的日料好吃吗？","好吃就好啦，下次还可以去。对啦突然想到，下周的演唱会要不要来？我可以给你留票。","没关系啦，这又不是什么麻烦事。","没有啊，你又不上台，怎么会打扰到我。","你考虑好了明天跟我说喔。","对啊就一直练团练团练团，手都要断了。","还好啦都习惯了。欸你声音怎么怪怪的，该不会是还在害羞？","没有吼？那怎么今晚这么安静啦？之前不是最喜欢改改叫的吗？","好啦不闹你。你有听到玩玩在叫吗？它刚吃完饭现在在家里跑酷。","是夜宵啦！会长不要那么警惕好不好？","好好好我的错我的错，你是不是该去洗洗睡？","我一会就睡了啦，还有点工作没忙完。","嗯嗯，晚安哦~","你怎么还不挂电话？舍不得哦？","对啊，我舍不得。","那我真不挂喽。","我哪有！好了好了，快去洗澡。","嗯哼，你快挂电话。"];
  const postDinnerCallReplies = ["嗯嗯可以啦！干嘛不打字讲话哦？","喔...所以我现在是陪聊？","想聊什么？我陪你五块钱的。","好吃的！","啊，真的可以？","会不会打扰到你....","那我考虑一下啦，大马有点点远....","嗯呐~你今天就一直在练团吗？","真的好辛苦，我看你手上茧都练脱皮，会不会痛？","....你乱说什么！","偶尔安静一下不行吗？我很淑女的。","这么晚了才给玩玩吃饭！你要死啊！！","谁叫你不说清楚啊！","欸都这么晚了，是要睡了，你呢？还不睡吗？","好啦，那你早忙完早休息哦！","晚安~","你也没挂啊！",".......那你别挂。","你是不是想偷听我洗澡！","喔，那我去了哦...","掰掰。"];
  const dagHotpotCallAudio = Array.from({ length: 9 }, (_, index) => `./assets/dag-wechat-call-${String(index + 1).padStart(2, "0")}.mp3`);
  const dagHotpotCallLines = [
    "喂？",
    "喔，就是想問你晚上吃壽喜鍋嗎？",
    "哈哈哈哈好啦不逗你了，我現在剛從錄音室出來喔，大概要20分鐘到你那邊。",
    "靠北，有點堵車。",
    "下午有沒有吃點東西墊墊肚子？我這邊還有一會才到。",
    "那就好。好啦，你準備下樓吧，我在路邊喔，車牌號還記得嗎？",
    "ok，那我樓下等你。不著急啦，你慢慢來。",
    "那我先掛了喔，你好了跟我說一聲，我把車開近一點。",
    "嗯呐，掰掰。",
  ];
  const dagHotpotCallReplies = [
    "嗯嗯在呢。", "...........吃。", "哦哦那我现在去收拾一下。",
    "你慢慢开啦，晚高峰就是这样。", "有啦。", "嗯嗯记得！",
    "马上马上，很快啦！", "好~掰掰。", "嗯呐，掰掰。",
  ];  const milkTeaAudioRef = useRef<HTMLAudioElement | null>(null);
  const milkTeaCallAudio = ["./assets/audio/dag-call-01.mp3","./assets/audio/dag-call-02.mp3","./assets/audio/dag-call-03.mp3","./assets/audio/dag-call-04.mp3"];
  const milkTeaCallLines = ["你到了是不是？pai seh，我刚才在录音没听到，我现在去接你。","你在哪啦？我怎么没有看见你。","啊，我看到你了，怎么买那么多，不是叫你少买点嘛！","好啦好啦，我帮你拿，走吧。"];
  const milkTeaCallReplies = ["嗯嗯我到啦。","啊？我在路边欸，穿白色衣服的，提了个大袋子。","没事呀，我想着你们可能会有蛮多人，喝不完可以分给其他同事嘛！"];

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
  const outgoingDaGCallActive = s?.ui?.wechat?.wxOutgoingDaGCallV1 === true && s?.incomingCall?.direction === "outgoing" && (s?.incomingCall?.caller === "大G" || s?.incomingCall?.caller === "温尚翊");
  const postDinnerCallActive = !outgoingDaGCallActive && s?.ui?.wechat?.wxPostDinnerCallStartedV1 === true && s?.incomingCall?.caller === "大G";
  const milkTeaCallActive = !outgoingDaGCallActive && s?.ui?.wechat?.wxMilkTeaArrivalCallV1 === true && s?.incomingCall?.caller === "大G";
  // A later post-dinner call must never render/play the earlier hotpot-call subtitles.
  const dagHotpotCallActive = !outgoingDaGCallActive && !postDinnerCallActive && s?.ui?.wechat?.wxDaGHotpotCallStartedV1 === true && s?.incomingCall?.caller === "大G";
  const deliveryCallActive = s?.incomingCall?.caller === "外卖";
  const [deliveryCallReplySent, setDeliveryCallReplySent] = useState(false);
  const finishDeliveryCall = (outcome: "answered" | "missed") => {
    const current = runtimeRef.current;
    const call = current.incomingCall;
    if (!call || call.caller !== "外卖") return;
    let history: Array<Record<string, string>> = [];
    try {
      const raw = current.ui?.phone?.phoneCallHistory;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) history = parsed.filter((item) => item && typeof item === "object");
    } catch { history = []; }
    const elapsed = outcome === "answered" ? Math.max(0, callElapsed) : 0;
    const duration = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
    const record = {
      id: `delivery-call-${Date.now()}`,
      number: "0972518369",
      name: "外卖",
      time: new Date().toISOString(),
      duration,
      status: outcome === "missed" ? "未接" : "已接",
      direction: "incoming",
    };
    const next = dispatch(work, { ...current, incomingCall: null }, outcome === "missed" ? "callDeclined" : "callEnded", call.target || call.caller);
    update({
      ...next,
      ui: {
        ...next.ui,
        phone: {
          ...(next.ui?.phone ?? {}),
          phoneCallHistory: JSON.stringify([record, ...history].slice(0, 100)),
          // Arm the one-shot Moments scene only after the player answers and hangs up.
          wxDeliveryCallMomentsReadyV1: outcome === "answered",
        },
      },
    });
    setDeliveryCallReplySent(false);
  };
  const runtimeRef = useRef(s);
  runtimeRef.current = s;
  const update = (next: Runtime) => {
    runtimeRef.current = next;
    setOwn(next);
    onRuntime?.(next);
  };
  useEffect(() => {
    if (!ready || creator || external) return;
    const current = runtimeRef.current;
    const list = current.messages.wechat ?? [];
    const oldRecord = list.find((item) => item.id === "milk-tea-call-duration-0143-v1");
    if (!oldRecord || (oldRecord.sender === "大G" && oldRecord.outgoing === false)) return;
    const fixed = list.map((item) => item.id === "milk-tea-call-duration-0143-v1"
      ? { ...item, title: "大G", sender: "大G", outgoing: false, meta: { ...item.meta, thread: "大G", callStatus: "ended", callDuration: "01:43" } }
      : item);
    update({ ...current, messages: { ...current.messages, wechat: fixed } });
  }, [ready, creator, external]);
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
    if (creator || !ready || locked || s.incomingCall) return;
    const wx = runtimeRef.current.ui?.wechat ?? {};
    if (wx.wxDaGHotpotCallRequestedV1 !== true || wx.wxDaGHotpotCallStartedV1 === true || wx.wxDaGHotpotCallFinishedV1 === true) return;
    const current = runtimeRef.current;
    update({ ...current, incomingCall: { caller: "大G", target: "大G", status: "ringing", callType: "audio" },
      ui: { ...current.ui, wechat: { ...(current.ui?.wechat ?? {}), wxDaGHotpotCallStartedV1: true } } });
  }, [s.incomingCall, s.ui?.wechat?.wxDaGHotpotCallRequestedV1, s.ui?.wechat?.wxDaGHotpotCallStartedV1, s.ui?.wechat?.wxDaGHotpotCallFinishedV1, ready, locked, creator]);

  useEffect(() => {
    if (!dagHotpotCallActive || s.incomingCall?.status !== "answered" || dagHotpotCallStep < 0 || dagHotpotCallStep > 8) return;
    const audio = milkTeaAudioRef.current;
    if (!audio) return;
    audio.src = dagHotpotCallAudio[dagHotpotCallStep];
    audio.currentTime = 0;
    setDagHotpotReplyReady(false);
    void audio.play().catch(() => setCallTopNotice("语音播放失败，请检查设备音量"));
  }, [dagHotpotCallActive, s.incomingCall?.status, dagHotpotCallStep]);

  const sendDagHotpotCallReply = () => {
    if (!runtimeRef.current.incomingCall || runtimeRef.current.incomingCall.status !== "answered" || !dagHotpotReplyReady) return;
    setDagHotpotReplyReady(false);
    if (dagHotpotCallStep < 8) setDagHotpotCallStep((step) => step + 1);
    else setCallTopNotice("你们已经说完啦，可以挂断电话了");
  };

  const finishDagHotpotCall = () => {
    const current = runtimeRef.current;
    if (!current.incomingCall || current.incomingCall.status !== "answered") return;
    const record = {
      id: "dag-hotpot-wechat-call-duration-0531-v1", title: "大G", body: "通话时长：05:31",
      richText: "", meta: { thread: "大G", callStatus: "ended", callDuration: "05:31" },
      time: new Date().toISOString(), sender: "大G", avatar: "", kind: "call" as const,
      media: "", hidden: false, unlock: "", password: "", folder: "", favorite: false,
      outgoing: false, read: true, likes: 0, comments: [],
    };
    update({ ...current, incomingCall: null,
      messages: { ...current.messages, wechat: [...(current.messages.wechat ?? []).filter((item) => item.id !== record.id), record] },
      ui: { ...current.ui, wechat: { ...(current.ui?.wechat ?? {}), wxDaGHotpotCallRequestedV1: false, wxDaGHotpotCallFinishedV1: true } } });
    setDagHotpotCallStep(-1);
    setDagHotpotReplyReady(false);
    if (milkTeaAudioRef.current) { milkTeaAudioRef.current.pause(); milkTeaAudioRef.current.currentTime = 0; }
  };

  useEffect(() => {
    if (creator || !ready || locked || s.incomingCall) return;
    const wx = runtimeRef.current.ui?.wechat ?? {};
    if (wx.wxPostDinnerCallRequestedV1 !== true || wx.wxPostDinnerCallStartedV1 === true || wx.wxPostDinnerCallFinishedV1 === true) return;
    const current = runtimeRef.current;
    update({ ...current, incomingCall: { caller: "大G", target: "大G", status: "ringing", callType: "audio" },
      ui: { ...current.ui, wechat: { ...(current.ui?.wechat ?? {}), wxPostDinnerCallStartedV1: true } } });
  }, [s.incomingCall, s.ui?.wechat?.wxPostDinnerCallRequestedV1, s.ui?.wechat?.wxPostDinnerCallStartedV1, s.ui?.wechat?.wxPostDinnerCallFinishedV1, ready, locked, creator]);

  useEffect(() => {
    if (!postDinnerCallActive || s.incomingCall?.status !== "answered" || postDinnerCallStep < 0 ||
        (postDinnerCallStep > 15 && (postDinnerCallStep < 17 || postDinnerCallStep > 21))) return;
    const audio = milkTeaAudioRef.current;
    if (!audio) return;
    audio.src = postDinnerCallAudio[postDinnerCallStep <= 15 ? postDinnerCallStep : postDinnerCallStep - 1];
    audio.currentTime = 0; setPostDinnerReplyReady(false);
    void audio.play().catch(() => setCallTopNotice("语音播放失败，请检查设备音量"));
  }, [postDinnerCallActive, s.incomingCall?.status, postDinnerCallStep]);

  useEffect(() => {
    if (!postDinnerCallActive || s.incomingCall?.status !== "answered" || postDinnerCallStep !== 16) return;
    const timer = window.setTimeout(() => {
      if (runtimeRef.current.incomingCall?.status === "answered") setPostDinnerCallStep(17);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [postDinnerCallActive, s.incomingCall?.status, postDinnerCallStep]);

  const sendPostDinnerCallReply = () => {
    if (runtimeRef.current.incomingCall?.status !== "answered" || !postDinnerReplyReady) return;
    setPostDinnerReplyReady(false);
    if (postDinnerCallStep < 15) setPostDinnerCallStep((step) => step + 1);
    else if (postDinnerCallStep === 15) setPostDinnerCallStep(16);
    else if (postDinnerCallStep >= 17 && postDinnerCallStep < 21) setPostDinnerCallStep((step) => step + 1);
    else if (postDinnerCallStep === 21) setCallTopNotice("晚安啦，可以挂断电话了");
  };

  const finishPostDinnerCall = () => {
    const current = runtimeRef.current;
    if (!current.incomingCall || current.incomingCall.status !== "answered") return;
    const record = { id: "dag-post-dinner-wechat-call-duration-1314-v1", title: "大G", body: "通话时长：13:14",
      richText: "", meta: { thread: "大G", callStatus: "ended", callDuration: "13:14" }, time: new Date().toISOString(),
      sender: "大G", avatar: "", kind: "call" as const, media: "", hidden: false, unlock: "", password: "", folder: "", favorite: false,
      outgoing: false, read: true, likes: 0, comments: [] };
    const completedPostDinnerDialogue = postDinnerCallStep === 21;
    update({ ...current, incomingCall: null,
      messages: { ...current.messages, wechat: [...(current.messages.wechat ?? []).filter((item) => item.id !== record.id), record] },
      ui: { ...current.ui, wechat: {
        ...(current.ui?.wechat ?? {}),
        wxPostDinnerCallRequestedV1: false,
        wxPostDinnerCallFinishedV1: true,
        // Unlock the Malaysia outgoing call only after the complete 13:14 dialogue.
        wxOutgoingDaGCallRequestedV1: completedPostDinnerDialogue,
        wxOutgoingDaGCallFinishedV1: false,
      } } });
    setPostDinnerCallStep(-1); setPostDinnerReplyReady(false);
    if (milkTeaAudioRef.current) { milkTeaAudioRef.current.pause(); milkTeaAudioRef.current.currentTime = 0; }
  };

  useEffect(() => {
    if (!outgoingDaGCallActive || s.incomingCall?.status !== "ringing") return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      if (!current.incomingCall || current.incomingCall.status !== "ringing") return;
      setOutgoingDaGCallStep(0); setOutgoingDaGReplyReady(false);
      update({ ...current, incomingCall: { ...current.incomingCall, status: "answered" } });
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [outgoingDaGCallActive, s.incomingCall?.status]);

  useEffect(() => {
    if (!outgoingDaGCallActive || s.incomingCall?.status !== "answered" || outgoingDaGCallStep < 0 || outgoingDaGCallStep > 12) return;
    const audio = milkTeaAudioRef.current;
    if (!audio) return;
    audio.src = outgoingDaGCallAudio[outgoingDaGCallStep]; audio.currentTime = 0;
    setOutgoingDaGReplyReady(false);
    void audio.play().catch(() => setCallTopNotice("语音播放失败，请检查设备音量"));
  }, [outgoingDaGCallActive, s.incomingCall?.status, outgoingDaGCallStep]);

  const sendOutgoingDaGCallReply = () => {
    if (runtimeRef.current.incomingCall?.status !== "answered" || !outgoingDaGReplyReady) return;
    setOutgoingDaGReplyReady(false);
    if (outgoingDaGCallStep < 12) setOutgoingDaGCallStep((step) => step + 1);
  };

  const finishOutgoingDaGCall = () => {
    const current = runtimeRef.current;
    if (!current.incomingCall || current.incomingCall.status !== "answered") return;
    const duration = `${String(Math.floor(callElapsed / 60)).padStart(2,"0")}:${String(callElapsed % 60).padStart(2,"0")}`;
    const record = { id: "dag-outgoing-wechat-call-v1", title: "大G", body: `通话时长：${duration}`,
      richText: "", meta: { thread: "大G", callStatus: "ended", callDuration: duration }, time: new Date().toISOString(),
      sender: "大G", avatar: "", kind: "call" as const, media: "", hidden: false, unlock: "", password: "", folder: "", favorite: false,
      outgoing: true, read: true, likes: 0, comments: [] };
    const completedMalaysiaCall = outgoingDaGCallStep === 12;
    update({ ...current, incomingCall: null,
      messages: { ...current.messages, wechat: [...(current.messages.wechat ?? []).filter((item) => item.id !== record.id), record] },
      ui: { ...current.ui, wechat: {
        ...(current.ui?.wechat ?? {}),
        wxOutgoingDaGCallV1: false,
        wxOutgoingDaGCallFinishedV1: true,
        wxMalaysiaCallCompletedV1: completedMalaysiaCall,
        wxMalaysiaBroccoliInvitePendingV1: completedMalaysiaCall,
      } } });
    setOutgoingDaGCallStep(-1); setOutgoingDaGReplyReady(false);
    if (milkTeaAudioRef.current) { milkTeaAudioRef.current.pause(); milkTeaAudioRef.current.currentTime = 0; }
  };

  useEffect(() => {
    if (!milkTeaCallActive || s.incomingCall?.status !== "ringing" || s.incomingCall?.direction !== "outgoing") return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      if (!current.incomingCall || current.incomingCall.status !== "ringing") return;
      update({ ...current, incomingCall: { ...current.incomingCall, status: "answered" } });
      setMilkTeaCallStep(0); setMilkTeaCallReply(-1);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [milkTeaCallActive, s.incomingCall?.status, s.incomingCall?.direction]);

  useEffect(() => {
    if (!milkTeaCallActive || s.incomingCall?.status !== "answered" || milkTeaCallStep < 0 || milkTeaCallStep > 3) return;
    const audio = milkTeaAudioRef.current;
    if (!audio) return;
    audio.src = milkTeaCallAudio[milkTeaCallStep]; audio.currentTime = 0;
    void audio.play().catch(() => setCallTopNotice("语音播放失败，请检查设备音量"));
  }, [milkTeaCallActive, s.incomingCall?.status, milkTeaCallStep]);

  const sendMilkTeaCallReply = (replyIndex: number) => {
    if (!runtimeRef.current.incomingCall || runtimeRef.current.incomingCall.status !== "answered") return;
    if (!milkTeaCallReplies[replyIndex]) return;
    // Call replies are spoken interactions shown only in the call UI.
    // Do not persist them as ordinary WeChat chat messages.
    setMilkTeaCallReply(-1);
    setMilkTeaCallStep(replyIndex + 1);
  };

  const finishMilkTeaCall = () => {
    const current = runtimeRef.current; if (!current.incomingCall) return;
    const messages = current.messages.wechat ?? [];
    const record = {
      id: "milk-tea-call-duration-0143-v1", title: "大G", body: "通话时长：01:43",
      richText: "", meta: { thread: "大G", callStatus: "ended", callDuration: "01:43" },
      time: new Date().toISOString(), sender: "大G", avatar: "", kind: "call" as const,
      media: "", hidden: false, unlock: "", password: "", folder: "", favorite: false,
      outgoing: false, read: true, likes: 0, comments: [],
    };
    update({ ...current, incomingCall: null, messages: { ...current.messages, wechat: [...messages.filter((item) => item.id !== record.id), record] },
      ui: { ...current.ui, wechat: { ...(current.ui?.wechat ?? {}), wxMilkTeaArrivalCallV1: false, wxMilkTeaArrivalCallFinishedV1: true } } });
    setMilkTeaCallStep(-1); setMilkTeaCallReply(-1);
    if (milkTeaAudioRef.current) { milkTeaAudioRef.current.pause(); milkTeaAudioRef.current.currentTime = 0; }
  };
  const onMilkTeaAudioEnded = () => {
    if (outgoingDaGCallActive && outgoingDaGCallStep >= 0 && outgoingDaGCallStep <= 11) { setOutgoingDaGReplyReady(true); return; }
    if (outgoingDaGCallActive && outgoingDaGCallStep === 12) { finishOutgoingDaGCall(); return; }
    if (postDinnerCallActive && ((postDinnerCallStep >= 0 && postDinnerCallStep <= 15) || (postDinnerCallStep >= 17 && postDinnerCallStep <= 21))) { setPostDinnerReplyReady(true); return; }
    if (dagHotpotCallActive && dagHotpotCallStep >= 0 && dagHotpotCallStep <= 8) { setDagHotpotReplyReady(true); return; }
    if (milkTeaCallStep === 3) finishMilkTeaCall();
    else if (milkTeaCallStep >= 0 && milkTeaCallStep <= 2) setMilkTeaCallReply(milkTeaCallStep);
  };

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
    const wx = runtimeRef.current.ui?.wechat ?? {};
    if (wx.wxBroccoliSignatureCallRequestedV1 !== true || wx.wxBroccoliSignatureCallStartedV1 === true) return;
    const current = runtimeRef.current;
    update({ ...current, incomingCall: { caller: "西蓝花", target: "西蓝花", status: "ringing" },
      ui: { ...current.ui, wechat: { ...(current.ui?.wechat ?? {}), wxBroccoliSignatureCallStartedV1: true } } });
  }, [s.incomingCall, s.ui?.wechat?.wxBroccoliSignatureCallRequestedV1, s.ui?.wechat?.wxBroccoliSignatureCallStartedV1, ready, locked, creator]);

  // One-time incoming call from Broccoli after the three-person group chat.
  // The call history belongs in the private Broccoli DM, never in the group.
  useEffect(() => {
    if (creator || !ready || locked || s.incomingCall) return;
    const wx = runtimeRef.current.ui?.wechat ?? {};
    if (wx.wxThreeWayGroupCallRequestedV1 !== true || wx.wxThreeWayGroupCallStartedV1 === true) return;
    const current = runtimeRef.current;
    update({
      ...current,
      incomingCall: { caller: "西蓝花", target: "西蓝花", status: "ringing" },
      ui: { ...current.ui, wechat: {
        ...(current.ui?.wechat ?? {}),
        wxThreeWayGroupCallStartedV1: true,
      } },
    });
  }, [s.incomingCall, s.ui?.wechat?.wxThreeWayGroupCallRequestedV1, s.ui?.wechat?.wxThreeWayGroupCallStartedV1, ready, locked, creator]);

  useEffect(() => {
    if (creator || !ready || locked || s.incomingCall) return;
    const request = s.ui?.wechat?.wxOutgoingCallRequest;
    if (request !== "audio" && request !== "video") return;
    const target = s.ui?.wechat?.openThread;
    if (typeof target !== "string" || !target) return;
    const isDaG = target === "大G" || target === "温尚翊" || target === "温尚翊（大G）";
    const wx = s.ui?.wechat ?? {};
    // The scripted Malaysia conversation is opt-in from its exact story node only.
    // Ordinary/manual calls to DaG must always remain normal calls.
    const scriptedDaGCall = isDaG && request === "audio" && wx.wxPostDinnerCallFinishedV1 === true && wx.wxOutgoingDaGCallRequestedV1 === true && wx.wxOutgoingDaGCallFinishedV1 !== true;
    update({
      ...s,
      incomingCall: { caller: target, target, status: "ringing", direction: "outgoing", callType: request },
      ui: { ...s.ui, wechat: {
        ...wx,
        wxOutgoingCallRequest: "",
        wxOutgoingDaGCallRequestedV1: false,
        wxOutgoingDaGCallV1: scriptedDaGCall,
      } },
    });
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
        // Reset stale completion flags for this new scripted incoming call.
        // The first hang-up must always queue "已拒绝" + "接電話。".
        wxDrunkFinalCallStartedV7: true,
        wxDrunkFinalCallFinishedV7: false,
        wxDrunkInitialCallHangupHandledV1: false,
        wxDrunkSecondCallStartedV1: false,
        wxBroccoliFinalGCallV1: false,
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

  const malaysiaInviteThreadRef = useRef(String(s.ui?.wechat?.openThread ?? ""));
  useEffect(() => {
    const current = runtimeRef.current;
    const wx = current.ui?.wechat ?? {};
    const opened = String(wx.openThread ?? "");
    const previous = malaysiaInviteThreadRef.current;
    if (opened) malaysiaInviteThreadRef.current = opened;
    const isBroccoli = opened === "西蓝花" || opened === "西兰花";
    const justOpenedBroccoli = isBroccoli && previous !== opened;
    if (creator || !ready || locked || !justOpenedBroccoli ||
        wx.wxMalaysiaCallCompletedV1 !== true ||
        wx.wxMalaysiaBroccoliInvitePendingV1 !== true ||
        wx.wxMalaysiaBroccoliInviteStartedV1 === true) return;
    const raw = wx.wxCatPendingLines;
    let pending: Array<{id?: string; sender: string; body: string; thread?: string}> = [];
    try { const parsed = typeof raw === "string" ? JSON.parse(raw) : []; if (Array.isArray(parsed)) pending = parsed; } catch { pending = []; }
    const rows: Array<[string,string]> = [
      ["我","下周末有空吗？"],["西蓝花","怎么啦？"],["我","能不能陪我去一趟大马？"],["西蓝花","马来西亚？"],["西蓝花","你怎么突然要去马来西亚？"],["我","嗯嗯……"],["西蓝花","你要去看演唱会啊？"],["我","嗯嗯……"],["我","就是温尚翊本来跟我说可以帮我留票的。"],["我","但是我拒绝了。"],["西蓝花","？？？？？？"],["西蓝花","不是。"],["西蓝花","你拒绝了？？？"],["西蓝花","人家都说要帮你留票了你居然拒绝？？？"],["我","哎呀……"],["我","我就是想突然跑过去给他一个惊喜嘛。"],["西蓝花","…………"],["西蓝花","你有没有想过其实你可以先把票收下。我们再卖掉。"],["西蓝花","然后拿卖掉的钱再去买新票？"],["西蓝花","这样他看到本来应该是你的位置结果是别人哈哈哈，效果不是更好吗？"],["西蓝花","又省钱又能有惊喜。"],["我","我把他给我的票卖了不好吧......万一他生气了怎么办？"],["西蓝花","嗯...你说的有道理。"],["我","对呀对呀！"],["西蓝花","你真的……"],["西蓝花","哎呦，我现在都不知道该说你什么好了。"],["西蓝花","你这是准备给他惊喜，还是准备给我惊吓？"],["我","嘿嘿，陪我去嘛陪我去嘛，我一个人去大马我害怕🥺"],["西蓝花","那你票买了吗？"],["西蓝花","机票呢？"],["西蓝花","酒店订了吗？"],["西蓝花","你不会什么都还没准备吧？？？"],["我","……"],["我","我这不是先来找你了嘛。"],["西蓝花","？？？？？"],["西蓝花","合着你连计划都没有就准备把我拐去马来西亚？"],["我","你就说陪不陪我嘛！"],["西蓝花","哈哈哈哈哈哈。"],["西蓝花","陪陪陪！"],["我","我就知道你最好了！！"],["西蓝花","既然都要特地飞去马来西亚了。"],["西蓝花","那我们不得买大舞台？"],["西蓝花","不然你跑那么远，结果离他十万八千里？"],["我","嘿嘿，我也是这么想的，我在想第一排应该可以看到我吧？"],["西蓝花","你现在有钱吗？"],["西蓝花","第一排欸！！不是随便买买就好！"],["我","有啦！！！"],["西蓝花","真的假的？"],["西蓝花","你什么时候这么有钱了？"],["我","我也是有存款的好吗！"],["西蓝花","行，那我就放心了。"],["西蓝花","不过机票、酒店、门票，这些加起来可不少哦。"],["我","没关系！"],["我","难得去一次嘛！"],["西蓝花","好啦，那我先去请假，你可以先去看看机酒，合适的话你就一起买，然后我转账给你~"],["我","好~我现在去看。"],["我","对了！"],["我","你千万不能跟他说我们要去啊！"],["西蓝花","我才不会说！你以为我漏勺啊！"],["我","相信你相信你啦~"]
    ];
    const delivered = new Set([...(current.messages.wechat ?? []), ...((() => { try { const st = typeof wx.catRescueState === "string" ? JSON.parse(wx.catRescueState) : {}; return Array.isArray(st.messages) ? st.messages : []; } catch { return []; } })())].map(item => item.id));
    const lines = rows.map(([sender,body],i)=>({id:"malaysia-broccoli-invite-"+String(i+1).padStart(2,"0"),sender,body,thread:"西蓝花"})).filter(line=>!delivered.has(line.id));
    update({...current,ui:{...current.ui,wechat:{...wx,wxMalaysiaBroccoliInvitePendingV1:false,wxMalaysiaBroccoliInviteStartedV1:true,wxCatPendingLines:JSON.stringify([...pending,...lines])}}});
  }, [s.ui?.wechat?.openThread, s.ui?.wechat?.wxMalaysiaCallCompletedV1, s.ui?.wechat?.wxMalaysiaBroccoliInvitePendingV1, ready, locked, creator, work.id]);
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
    // Malaysia trip dialogue: player-authored lines must wait for an explicit tap.
    if (String(parsedQueue[0].id || "").startsWith("malaysia-broccoli-invite-") && parsedQueue[0].sender === "我") return;

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

      // Only the hotel-address message may trigger the second DaG call.
      // This rejects stale startBigGCall metadata from older saved queues.
      const isBroccoliHotelAddressTrigger = line.id === "drunk-broccoli-hotel-v2" && line.sender === "西蓝花" && line.body === "妳酒店到底在哪裡？把地址發我！";
      const hpOrderDeliveredNow = line.meta?.hpOrderDeliveredPush === "yes" && wx.wxHpOrderDeliveredPushSentV1 !== true;
      const hpExternalCallNow = line.meta?.startExternalDeliveryCall === "yes";
      if (hpOrderDeliveredNow) nextNotifications.push("HungryPanda：您的订单已送达！奶茶已放在门口，请及时查收。");
      update({
        ...latest,
        incomingCall: hpExternalCallNow
          ? { caller: "外卖", target: "外卖", status: "ringing" }
          : line.meta?.startBroccoliCall === "yes"
            ? { caller: "西蓝花", target: "西蓝花", status: "ringing" }
            : (line.meta?.startBigGCall === "yes" && isBroccoliHotelAddressTrigger) ? { caller: "大G", target: "大G", status: "ringing" } : latest.incomingCall,
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
            ...(line.meta?.startBigGCall === "yes" && isBroccoliHotelAddressTrigger ? { wxDrunkFinalCallStartedV7: true, wxDrunkFinalCallFinishedV7: false, wxDrunkSecondCallStartedV1: true, wxBroccoliFinalGCallV1: true } : {}),
            ...(hpOrderDeliveredNow ? { wxHpOrderDeliveredPushSentV1: true } : {}),
          },
          ...(hpOrderDeliveredNow
            ? { delivery: { ...(latest.ui?.delivery ?? {}), hpStoryOrderDeliveredV1: true } }
            : {}),
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
    // This is a single immediate post-call moment: opening another app first
    // consumes the opportunity, while opening WeChat keeps it available for Moments.
    const current = runtimeRef.current;
    if (current.ui?.phone?.wxDeliveryCallMomentsReadyV1 === true && id !== "wechat") {
      update({ ...current, ui: { ...current.ui, phone: { ...current.ui?.phone, wxDeliveryCallMomentsReadyV1: false } } });
    }
    setApp(id);
    setKeyboard(false);
    setRecent((v) => [id, ...v.filter((a) => a !== id)].slice(0, 8));
    setFolder("");
    setPanel("");
    onOpen?.(id);
    event("openApp", id);
  };
  // After the 43:51 Broccoli signature call ends, the player must open Shopee
  // and remain there for ten uninterrupted seconds before HungryPanda pushes.
  // Use the signature-call completion flag: the three-way group call is an
  // earlier, separate scene and must not gate this milk-tea delivery chapter.
  useEffect(() => {
    if (creator || external || !ready || locked || app !== "shopee") return;
    const wx = s.ui?.wechat ?? {};
    if (wx.wxBroccoliSignatureCallFinishedV1 !== true || wx.wxHungryPandaDeliveryNoticeSentV1 === true) return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      const latestWx = current.ui?.wechat ?? {};
      if (latestWx.wxBroccoliSignatureCallFinishedV1 !== true || latestWx.wxHungryPandaDeliveryNoticeSentV1 === true) return;
      update({
        ...current,
        ui: {
          ...current.ui,
          wechat: { ...latestWx, wxHungryPandaDeliveryNoticeSentV1: true },
          delivery: { ...current.ui?.delivery, hpStoryOrderUnlockedV1: true },
        },
        notifications: [...current.notifications, "HungryPanda：您的订单正在配送中！骑手预计约 12 分钟送达。"].slice(-60),
      });
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [app, locked, ready, creator, external, s.ui?.wechat?.wxBroccoliSignatureCallFinishedV1, s.ui?.wechat?.wxHungryPandaDeliveryNoticeSentV1]);

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
  const resolveWeChatNotificationContact = (notice: ReturnType<typeof notificationContent>) => {
    const contact = typeof notice.contact === "string" ? notice.contact.trim() : "";
    if (contact) return contact;
    const title = typeof notice.title === "string" ? notice.title.trim() : "";
    const remarkOwner = Object.entries(contactRemarksForNotifications).find(([, remark]) => remark.trim() === title)?.[0];
    return remarkOwner || title;
  };
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
    const targetContact = resolveWeChatNotificationContact(notice);
    if (notice.appId === "shopee") {
      const current = runtimeRef.current;
      update({
        ...current,
        ui: {
          ...current.ui,
          shopee: { ...current.ui?.shopee, shopeeStoryOpenOrdersV1: true },
        },
      });
      open("shopee");
      if (locked) setPinOpen(true);
      return;
    }
    if (notice.appId === "delivery") {
      const current = runtimeRef.current;
      update({
        ...current,
        ui: {
          ...current.ui,
          delivery: { ...current.ui?.delivery, hpStoryOpenOrdersV1: true },
        },
      });
      open("delivery");
      if (locked) setPinOpen(true);
      return;
    }
    if (notice.appId === "wechat" && targetContact) {
      markWeChatThreadRead(targetContact);
      const current = runtimeRef.current;
      const currentWx = current.ui?.wechat ?? {};
      let nextMessages = current.messages.wechat ?? [];
      let nextStory: { version?: number; stage?: number; branch?: string; messages?: Item[] } = {};
      try { if (typeof currentWx.catRescueState === "string") nextStory = JSON.parse(currentWx.catRescueState); } catch { nextStory = {}; }
      const storyMessages = Array.isArray(nextStory.messages) ? nextStory.messages : [];
      const isBroccoliThread = targetContact === "西蓝花" || targetContact === "西兰花";
      if (isBroccoliThread && currentWx.wxMalaysiaCallCompletedV1 === true &&
          currentWx.wxMalaysiaBroccoliInvitePendingV1 === true &&
          currentWx.wxMalaysiaBroccoliInviteStartedV1 !== true) {
        const inviteLines = [
          { id: "malaysia-broccoli-invite-01", sender: "我", body: "下周末有空吗？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-02", sender: "西蓝花", body: "怎么啦？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-03", sender: "我", body: "能不能陪我去一趟大马？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-04", sender: "西蓝花", body: "马来西亚？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-05", sender: "西蓝花", body: "你怎么突然要去马来西亚？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-06", sender: "我", body: "嗯嗯……", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-07", sender: "西蓝花", body: "你要去看演唱会啊？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-08", sender: "我", body: "嗯嗯……", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-09", sender: "我", body: "就是温尚翊本来跟我说可以帮我留票的。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-10", sender: "我", body: "但是我拒绝了。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-11", sender: "西蓝花", body: "？？？？？？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-12", sender: "西蓝花", body: "不是。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-13", sender: "西蓝花", body: "你拒绝了？？？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-14", sender: "西蓝花", body: "人家都说要帮你留票了你居然拒绝？？？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-15", sender: "我", body: "哎呀……", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-16", sender: "我", body: "我就是想突然跑过去给他一个惊喜嘛。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-17", sender: "西蓝花", body: "…………", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-18", sender: "西蓝花", body: "你有没有想过其实你可以先把票收下。我们再卖掉。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-19", sender: "西蓝花", body: "然后拿卖掉的钱再去买新票？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-20", sender: "西蓝花", body: "这样他看到本来应该是你的位置结果是别人哈哈哈，效果不是更好吗？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-21", sender: "西蓝花", body: "又省钱又能有惊喜。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-22", sender: "我", body: "我把他给我的票卖了不好吧......万一他生气了怎么办？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-23", sender: "西蓝花", body: "嗯...你说的有道理。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-24", sender: "我", body: "对呀对呀！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-25", sender: "西蓝花", body: "你真的……", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-26", sender: "西蓝花", body: "哎呦，我现在都不知道该说你什么好了。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-27", sender: "西蓝花", body: "你这是准备给他惊喜，还是准备给我惊吓？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-28", sender: "我", body: "嘿嘿，陪我去嘛陪我去嘛，我一个人去大马我害怕🥺", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-29", sender: "西蓝花", body: "那你票买了吗？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-30", sender: "西蓝花", body: "机票呢？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-31", sender: "西蓝花", body: "酒店订了吗？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-32", sender: "西蓝花", body: "你不会什么都还没准备吧？？？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-33", sender: "我", body: "……", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-34", sender: "我", body: "我这不是先来找你了嘛。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-35", sender: "西蓝花", body: "？？？？？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-36", sender: "西蓝花", body: "合着你连计划都没有就准备把我拐去马来西亚？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-37", sender: "我", body: "你就说陪不陪我嘛！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-38", sender: "西蓝花", body: "哈哈哈哈哈哈。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-39", sender: "西蓝花", body: "陪陪陪！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-40", sender: "我", body: "我就知道你最好了！！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-41", sender: "西蓝花", body: "既然都要特地飞去马来西亚了。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-42", sender: "西蓝花", body: "那我们不得买大舞台？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-43", sender: "西蓝花", body: "不然你跑那么远，结果离他十万八千里？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-44", sender: "我", body: "嘿嘿，我也是这么想的，我在想第一排应该可以看到我吧？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-45", sender: "西蓝花", body: "你现在有钱吗？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-46", sender: "西蓝花", body: "第一排欸！！不是随便买买就好！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-47", sender: "我", body: "有啦！！！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-48", sender: "西蓝花", body: "真的假的？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-49", sender: "西蓝花", body: "你什么时候这么有钱了？", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-50", sender: "我", body: "我也是有存款的好吗！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-51", sender: "西蓝花", body: "行，那我就放心了。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-52", sender: "西蓝花", body: "不过机票、酒店、门票，这些加起来可不少哦。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-53", sender: "我", body: "没关系！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-54", sender: "我", body: "难得去一次嘛！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-55", sender: "西蓝花", body: "好啦，那我先去请假，你可以先去看看机酒，合适的话你就一起买，然后我转账给你~", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-56", sender: "我", body: "好~我现在去看。", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-57", sender: "我", body: "对了！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-58", sender: "我", body: "你千万不能跟他说我们要去啊！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-59", sender: "西蓝花", body: "我才不会说！你以为我漏勺啊！", thread: "西蓝花" },
          { id: "malaysia-broccoli-invite-60", sender: "我", body: "相信你相信你啦~", thread: "西蓝花" },
        ];
        const deliveredIds = new Set([...nextMessages, ...storyMessages].map((item) => item.id));
        const unseenInviteLines = inviteLines.filter((line) => !deliveredIds.has(line.id));
        update({ ...current, messages: { ...current.messages, wechat: nextMessages }, ui: { ...current.ui,
          wechat: { ...currentWx, wxMalaysiaBroccoliInvitePendingV1: false, wxMalaysiaBroccoliInviteStartedV1: true,
            wxCatPendingLines: JSON.stringify([...(Array.isArray((() => { try { return JSON.parse(String(currentWx.wxCatPendingLines || "[]")); } catch { return []; } })()) ? (() => { try { return JSON.parse(String(currentWx.wxCatPendingLines || "[]")); } catch { return []; } })() : []), ...unseenInviteLines]),
            openThread: targetContact, catRescueState: JSON.stringify({ ...nextStory, messages: storyMessages }) } } });
        open("wechat");
        if (locked) setPinOpen(true);
        return;
      }
      if (isBroccoliThread && currentWx.wxPostDrunkBroccoliCheckInV1 === true) {
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
            ...(targetContact === "西蓝花" || targetContact === "西兰花"
              ? { wxPostDoorBroccoliOpenedAfterDoorV1: true,
                  catRescueState: JSON.stringify(nextStory) }
              : {}),
            openThread: targetContact,
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
                  onNotification={(notice) => {
                    const current = runtimeRef.current;
                    update({ ...current, notifications: [...current.notifications, notice].slice(-60) });
                  }}
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
                    const dispatched = dispatch(
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
                    );
                    // Every explicit No!!! reply starts a fresh two-call sequence.
                    // Reset all stale save flags here, before the incoming-call
                    // effect evaluates whether it should create the first call.
                    if (app === "wechat" && key === "wxDrunkCallRequestedV8" && value === true) {
                      update({
                        ...dispatched,
                        ui: {
                          ...dispatched.ui,
                          wechat: {
                            ...(dispatched.ui?.wechat ?? {}),
                            wxDrunkCallStartedV8: false,
                            wxDrunkFinalCallStartedV7: true,
                            wxDrunkFinalCallFinishedV7: false,
                            wxDrunkInitialCallHangupHandledV1: false,
                            wxDrunkSecondCallStartedV1: false,
                            wxBroccoliFinalGCallV1: false,
                          },
                        },
                      });
                      return;
                    }
                    update(dispatched);
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
          {!creator && !locked && app === "wechat" && (s.ui?.wechat?.openThread === "西蓝花" || s.ui?.wechat?.openThread === "西兰花") && (() => {
            let queued: Array<{id?:string; sender:string; body:string; thread?:string}> = [];
            try { const parsed = JSON.parse(String(s.ui?.wechat?.wxCatPendingLines || "[]")); if (Array.isArray(parsed)) queued = parsed; } catch { queued = []; }
            const next = queued[0];
            if (!next || next.sender !== "我" || !String(next.id || "").startsWith("malaysia-broccoli-invite-")) return null;
            return (
              <div className="story-overlay" style={{ left: 8, right: 8, bottom: 76, padding: "8px 10px 5px", borderRadius: 12, background: "#f8f8f6f2", boxShadow: "0 -2px 12px #00000012" }}>
                <button style={{ padding: "10px 12px", margin: "0 0 7px", fontSize: 13, fontWeight: 500, color: "#71977a", background: "#ffffff", border: "1px solid #e2e9df", borderRadius: 9, justifyContent: "center", textAlign: "center" }} onClick={() => {
                  const current = runtimeRef.current;
                  const wx = current.ui?.wechat ?? {};
                  let lines: Array<{id?:string; sender:string; body:string; thread?:string}> = [];
                  try { const parsed = JSON.parse(String(wx.wxCatPendingLines || "[]")); if (Array.isArray(parsed)) lines = parsed; } catch { lines = []; }
                  const head = lines[0];
                  if (!head || head.id !== next.id || head.sender !== "我") return;
                  let story: {version?:number; stage?:number; branch?:string; messages?:Item[]} = {};
                  try { if (typeof wx.catRescueState === "string") story = JSON.parse(wx.catRescueState); } catch { story = {}; }
                  const orderAt = Date.now();
                  const now = (current.date || work.phone.date) + " " + (current.time || work.phone.time);
                  const sent = makeItem({
                    id: head.id || "malaysia-broccoli-reply-" + orderAt,
                    title: "西蓝花", sender: "我", body: head.body, time: now,
                    outgoing: true,
                    meta: { storyId: "cat-rescue", storyThread: "西蓝花", storyOrderAt: String(orderAt) },
                  });
                  const oldMessages = current.messages.wechat ?? [];
                  const oldStory = Array.isArray(story.messages) ? story.messages : [];
                  const alreadyStored = oldMessages.some(item => item.id === sent.id) || oldStory.some(item => item.id === sent.id);
                  const nextStored = alreadyStored ? oldMessages : [...oldMessages, sent];
                  const nextStory = alreadyStored ? oldStory : [...oldStory, sent];
                  update({ ...current,
                    messages: { ...current.messages, wechat: nextStored },
                    ui: { ...current.ui, wechat: {
                      ...wx,
                      wxCatPendingLines: JSON.stringify(lines.slice(1)),
                      catRescueState: JSON.stringify({ ...story, messages: nextStory }),
                    } },
                  });
                }}>
                  {next.body}
                </button>
                <div style={{ textAlign: "center", color: "#a3a3a3", fontSize: 10, padding: "3px 0 2px", borderTop: "1px solid #ececec" }}>选择一条回复发送</div>
              </div>
            );
          })()}
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
              {deliveryCallActive && (
                <div className={`native-phone-call ${s.incomingCall?.status === "answered" ? "connected" : "ringing"}`}>
                  <div className="native-phone-status" aria-label="iPhone 状态栏">
                    <span className="native-phone-status-time">{displayTime}</span>
                    <span className="native-phone-dynamic-island"><i /></span>
                    <button className="signals native-phone-status-signals" type="button" aria-label="系统状态">
                      <StatusGlyph kind="cellular" />
                      <StatusGlyph kind="wifi" />
                      <span className={`ios-battery${work.phone.battery <= 20 ? " low-battery" : ""}`}>
                        <span style={{ width: `${work.phone.battery}%` }} />
                        <b>{work.phone.battery}</b>
                      </span>
                    </button>
                  </div>
                  {s.incomingCall?.status === "ringing" ? (
                    <>
                      <div className="native-phone-contact"><small>主号</small><strong>0972518369</strong></div>
                      <div className="native-phone-incoming-tools">
                        <div><span><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8.5c-9.1 0-16.5 6.7-16.5 15s7.4 15 16.5 15h8.2c4.4 0 8.3-3.3 8.3-7.8V23.5c0-8.3-7.4-15-16.5-15Z" fill="currentColor"/></svg></span><label>信息</label></div><div><span><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7a3 3 0 0 1 3 3v2.1a14 14 0 0 1 11 13.7v9.4H10v-9.4a14 14 0 0 1 11-13.7V10a3 3 0 0 1 3-3Z" fill="currentColor"/><path d="M18 39a6 6 0 0 0 12 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="m9 17 4-4m26 4-4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></span><label>提醒我</label></div>
                      </div>
                      <div className="native-phone-ring-actions">
                        <button className="native-reject" onClick={() => {
                          finishDeliveryCall("missed");
                        }}><b><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5.2 23.5c4.8-5.1 11.3-7.8 18.8-7.8s14 2.7 18.8 7.8c1.2 1.3 1.1 3.3-.2 4.5l-4.7 4.3c-1.2 1.1-3.1 1.1-4.3-.1l-3.4-3.4c-1.1-1.1-1.1-2.8-.1-4l.4-.5c-4.3-1.4-8.7-1.4-13 0l.4.5c1 1.2 1 2.9-.1 4l-3.4 3.4c-1.2 1.2-3.1 1.2-4.3.1l-4.7-4.3c-1.3-1.2-1.4-3.2-.2-4.5Z" fill="currentColor"/></svg></b><span>拒绝</span></button>
                        <button className="native-answer" onClick={() => {
                          const call = runtimeRef.current.incomingCall;
                          if (call) { setDeliveryCallReplySent(false); update(dispatch(work, { ...runtimeRef.current, incomingCall: { ...call, status: "answered" } }, "callAnswered", call.target || call.caller)); }
                        }}><b><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13.7 6.8c1.5-.9 3.4-.5 4.4.9l4.1 5.8c.9 1.3.7 3.1-.4 4.2l-2.8 2.8c2.1 4.2 5.5 7.6 9.7 9.7l2.8-2.8c1.1-1.1 2.9-1.3 4.2-.4l5.8 4.1c1.4 1 1.8 2.9.9 4.4l-2.3 3.8c-.9 1.5-2.6 2.2-4.3 1.8C21.3 38.2 9.8 26.7 7.7 12.2c-.4-1.7.3-3.4 1.8-4.3l4.2-1.1Z" fill="currentColor"/></svg></b><span>接听</span></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="native-phone-connected-info"><small>主号</small><strong>0972518369</strong><span>{String(Math.floor(callElapsed / 60)).padStart(2, "0")}:{String(callElapsed % 60).padStart(2, "0")}</span></div>
                      <div className="native-phone-caption"><small>外卖员</small><p>奶茶放门口了。</p>{deliveryCallReplySent ? <p>你：好，谢谢你！我现在去拿。</p> : <button onClick={() => setDeliveryCallReplySent(true)}>好，谢谢你！我现在去拿。</button>}</div>
                      <div className="native-phone-controls">
                        <button onClick={() => setCallSpeakerOn(v => !v)}><b><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 19v10h8l11 9V10L15 19H7Z" fill="currentColor"/><path d="M32 17c3 3 3 11 0 14M37 12c6 6 6 18 0 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/></svg></b><span>免提</span></button>
                        <button><b><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="13" width="25" height="22" rx="3" fill="currentColor"/><path d="m32 20 9-6v20l-9-6" fill="currentColor"/><path d="M13 19h13v10H13z" fill="#777"/></svg></b><span>FaceTime通话</span></button>
                        <button onClick={() => setCallMicOn(v => !v)}><b><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="18" y="6" width="12" height="22" rx="6" fill="currentColor"/><path d="M12 23a12 12 0 0 0 24 0M24 35v7M17 42h14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="m10 10 28 28" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/></svg></b><span>静音</span></button>
                        <button><b><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="10" cy="24" r="3.5" fill="currentColor"/><circle cx="24" cy="24" r="3.5" fill="currentColor"/><circle cx="38" cy="24" r="3.5" fill="currentColor"/></svg></b><span>更多</span></button>
                        <button className="native-end" onClick={() => {
                          finishDeliveryCall("answered");
                        }}><b><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5.2 23.5c4.8-5.1 11.3-7.8 18.8-7.8s14 2.7 18.8 7.8c1.2 1.3 1.1 3.3-.2 4.5l-4.7 4.3c-1.2 1.1-3.1 1.1-4.3-.1l-3.4-3.4c-1.1-1.1-1.1-2.8-.1-4l.4-.5c-4.3-1.4-8.7-1.4-13 0l.4.5c1 1.2 1 2.9-.1 4l-3.4 3.4c-1.2 1.2-3.1 1.2-4.3.1l-4.7-4.3c-1.3-1.2-1.4-3.2-.2-4.5Z" fill="currentColor"/></svg></b><span>结束</span></button>
                        <button><b><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="14" cy="14" r="3" fill="currentColor"/><circle cx="24" cy="14" r="3" fill="currentColor"/><circle cx="34" cy="14" r="3" fill="currentColor"/><circle cx="14" cy="24" r="3" fill="currentColor"/><circle cx="24" cy="24" r="3" fill="currentColor"/><circle cx="34" cy="24" r="3" fill="currentColor"/><circle cx="14" cy="34" r="3" fill="currentColor"/><circle cx="24" cy="34" r="3" fill="currentColor"/><circle cx="34" cy="34" r="3" fill="currentColor"/></svg></b><span>拨号键盘</span></button>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="wechat-call-top-actions">
                <button type="button" aria-label="切换通话设备" title="切换通话设备" onClick={() => setCallSpeakerOn(v => !v)}><Copy size={25}/></button>
                <button type="button" aria-label="添加通话成员" title="添加通话成员" onClick={() => setCallTopNotice("暂不支持添加通话成员")}><UserRoundPlus size={25}/></button>
              </div>
              {(() => {
                const caller = s.incomingCall!.caller;
                const isBigG = caller === "大G" || caller === "温尚翊";
                const isExternalDelivery = caller === "外卖";
                const displayName = isExternalDelivery ? "外卖" : contactRemarksForNotifications[caller] ||
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
                const avatarSrc = isExternalDelivery ? "" : isBigG ? (daGAvatarChanged ? changedDaGAvatar : originalDaGAvatar) : GLOOMY_AVATAR;
                const connected = s.incomingCall!.status === "answered";
                const mm = String(Math.floor(callElapsed / 60)).padStart(2, "0");
                const ss = String(callElapsed % 60).padStart(2, "0");
                return <>
                  {connected ? <div className="wechat-call-timer">{mm}:{ss}</div> : <div className="wechat-call-topline">{isExternalDelivery ? "外部来电" : s.incomingCall!.callType === "video" ? "微信视频通话" : "微信语音通话"}</div>}
                  <div className="incoming-avatar">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" onError={e => {
                        const holder = e.currentTarget.parentElement;
                        e.currentTarget.remove();
                        if (holder) holder.textContent = isBigG ? "🎸" : "🐻";
                      }} />
                    ) : <span className="incoming-avatar-fallback">{isExternalDelivery ? "🛵" : isBigG ? "🎸" : "🐻"}</span>}
                  </div>
                  <h2>{displayName}</h2>
                  <p className="wechat-call-state">{connected ? (isExternalDelivery ? "通话中" : s.incomingCall!.callType === "video" ? "视频通话中" : "语音通话中") : isExternalDelivery ? "来电…" : s.incomingCall!.direction === "outgoing" ? "等待对方接听…" : "邀请你进行语音通话…"}</p>
                </>;
              })()}
              {deliveryCallActive && s.incomingCall.status === "answered" && (
                <div style={{ width: "min(88%, 360px)", margin: "18px auto 12px", padding: "14px", borderRadius: "18px", background: "rgba(255,255,255,.14)", color: "white", textAlign: "center" }}>
                  <div style={{ fontSize: 12, opacity: .72, marginBottom: 8 }}>外卖员</div>
                  <div style={{ fontSize: 16, lineHeight: 1.6 }}>奶茶放门口了。</div>
                  {deliveryCallReplySent
                    ? <div style={{ marginTop: 12, fontSize: 15 }}>你：好，谢谢你！我现在去拿。</div>
                    : <button type="button" onClick={() => setDeliveryCallReplySent(true)} style={{ width: "100%", marginTop: 14, border: 0, borderRadius: 14, padding: "12px", background: "rgba(255,255,255,.92)", color: "#222", fontSize: 14 }}>好，谢谢你！我现在去拿。</button>}
                </div>
              )}
              {outgoingDaGCallActive && s.incomingCall.status === "answered" && (
                <div style={{ width: "min(88%, 360px)", margin: "18px auto 12px", padding: "14px", borderRadius: "18px", background: "rgba(255,255,255,.14)", color: "white", textAlign: "center" }}>
                  <div style={{ fontSize: 12, opacity: .72, marginBottom: 8 }}>{contactRemarksForNotifications["大G"] || contactRemarksForNotifications["温尚翊"] || "大G"} · 语音字幕</div>
                  <div style={{ fontSize: 16, lineHeight: 1.6 }}>{outgoingDaGCallLines[outgoingDaGCallStep] ?? "正在通话…"}</div>
                  {outgoingDaGReplyReady && outgoingDaGCallStep <= 11 && <button type="button" onClick={sendOutgoingDaGCallReply} style={{ width: "100%", marginTop: 14, border: 0, borderRadius: 14, padding: "12px", background: "rgba(255,255,255,.92)", color: "#222", fontSize: 14 }}>{outgoingDaGCallReplies[outgoingDaGCallStep]}</button>}
                </div>
              )}
              {postDinnerCallActive && s.incomingCall.status === "answered" && (
                <div style={{ width: "min(88%, 360px)", margin: "18px auto 12px", padding: "14px", borderRadius: "18px", background: "rgba(255,255,255,.14)", color: "white", textAlign: "center" }}>
                  <div style={{ fontSize: 12, opacity: .72, marginBottom: 8 }}>大G · 语音字幕</div>
                  <div style={{ fontSize: 16, lineHeight: 1.6 }}>{postDinnerCallStep === 16 ? "……" : postDinnerCallLines[postDinnerCallStep <= 15 ? postDinnerCallStep : postDinnerCallStep - 1] ?? "正在通话…"}</div>
                  {postDinnerReplyReady && <button type="button" onClick={sendPostDinnerCallReply} style={{ width: "100%", marginTop: 14, border: 0, borderRadius: 14, padding: "12px", background: "rgba(255,255,255,.92)", color: "#222", fontSize: 14 }}>{postDinnerCallReplies[postDinnerCallStep <= 15 ? postDinnerCallStep : postDinnerCallStep - 1]}</button>}
                </div>
              )}
              {dagHotpotCallActive && s.incomingCall.status === "answered" && (
                <div style={{ width: "min(88%, 360px)", margin: "18px auto 12px", padding: "14px", borderRadius: "18px", background: "rgba(255,255,255,.14)", color: "white", textAlign: "center" }}>
                  <div style={{ fontSize: 12, opacity: .72, marginBottom: 8 }}>大G · 语音字幕</div>
                  <div style={{ fontSize: 16, lineHeight: 1.6 }}>{dagHotpotCallLines[dagHotpotCallStep] ?? "正在通话…"}</div>
                  {dagHotpotReplyReady && <button type="button" onClick={sendDagHotpotCallReply} style={{ width: "100%", marginTop: 14, border: 0, borderRadius: 14, padding: "12px", background: "rgba(255,255,255,.92)", color: "#222", fontSize: 14 }}>{dagHotpotCallReplies[dagHotpotCallStep]}</button>}
                </div>
              )}
              {milkTeaCallActive && s.incomingCall.status === "answered" && (
                <div style={{ width: "min(88%, 360px)", margin: "18px auto 12px", padding: "14px", borderRadius: "18px", background: "rgba(255,255,255,.14)", color: "white", textAlign: "center" }}>
                  <div style={{ fontSize: 12, opacity: .72, marginBottom: 8 }}>大G · 语音字幕</div>
                  <div style={{ fontSize: 16, lineHeight: 1.6 }}>{milkTeaCallLines[milkTeaCallStep] ?? "正在通话…"}</div>
                  {milkTeaCallReply >= 0 && milkTeaCallReply <= 2 && <button type="button" onClick={() => sendMilkTeaCallReply(milkTeaCallReply)} style={{ width: "100%", marginTop: 14, border: 0, borderRadius: 14, padding: "12px", background: "rgba(255,255,255,.92)", color: "#222", fontSize: 14 }}>{milkTeaCallReplies[milkTeaCallReply]}</button>}
                </div>
              )}
              <audio ref={milkTeaAudioRef} onEnded={onMilkTeaAudioEnded} preload="auto" />
              <div className="incoming-actions">
                {s.incomingCall.status === "answered" || s.incomingCall.direction === "outgoing" ? (
                  <>
                    <button className={`call-control ${callMicOn ? "control-active" : "control-muted"}`} onClick={() => setCallMicOn(v => !v)} aria-label={callMicOn ? "关闭麦克风" : "打开麦克风"}>
                      <Mic size={27}/><span>{callMicOn ? "麦克风已开" : "麦克风已关"}</span>
                    </button>
                    <button className="decline-call call-control" onClick={() => {
                      const call = runtimeRef.current.incomingCall;
                      if (!call) return;
                      // The milk-tea scripted call must finish through its own
                      // persisted completion path when the player taps hang up.
                      // Otherwise the Broccoli handoff flag is never written.
                      if (outgoingDaGCallActive && call.status === "answered") { finishOutgoingDaGCall(); return; }
                      if (postDinnerCallActive && call.status === "answered") { finishPostDinnerCall(); return; }
                      if (dagHotpotCallActive && call.status === "answered") { finishDagHotpotCall(); return; }
                      if (milkTeaCallActive && call.status === "answered" &&
                          (call.caller === "大G" || call.caller === "温尚翊")) {
                        finishMilkTeaCall();
                        return;
                      }
                      if (call.caller === "外卖") setDeliveryCallReplySent(false);
                      const current = runtimeRef.current;
                      const next = dispatch(work, { ...current, incomingCall: null }, call.status === "ringing" ? "callDeclined" : "callEnded", call.target || call.caller);
                      const wx = current.ui?.wechat ?? {};
                      // Scripted drunk-story calls are incoming calls from DaG.
                      // Match both saved contact-name variants, and key off the
                      // explicit story request rather than a fragile "started"
                      // flag that can be stale or lost during call-state updates.
                      const callIdentity = String(call.caller || call.target || "").trim();
                      const isDaGCall = callIdentity === "大G" || callIdentity === "温尚翊" ||
                        callIdentity === "温尚翊（大G）";
                      const isScriptedIncomingDaGCall = isDaGCall && call.direction !== "outgoing";
                      const isInitialDrunkCall = isScriptedIncomingDaGCall &&
                        wx.wxDrunkCallRequestedV8 === true &&
                        wx.wxDrunkInitialCallHangupHandledV1 !== true &&
                        wx.wxDrunkSecondCallStartedV1 !== true;
                      const isDrunkFinalCall = isScriptedIncomingDaGCall &&
                        wx.wxDrunkFinalCallFinishedV7 !== true &&
                        wx.wxDrunkSecondCallStartedV1 === true;
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
                      } else if (call.caller === "西蓝花" && call.status === "answered" && wx.wxThreeWayGroupCallStartedV1 === true && wx.wxThreeWayGroupCallFinishedV1 !== true) {
                        const record = {
                          id: "threeway-broccoli-private-call-duration-1721-v1", title: "西蓝花",
                          body: "通话时长：17:21", richText: "",
                          meta: { thread: "西蓝花", callStatus: "ended", callDuration: "17:21" },
                          time: new Date().toISOString(), sender: "西蓝花", avatar: "", kind: "call" as const,
                          media: "", hidden: false, unlock: "", password: "", folder: "", favorite: false,
                          outgoing: false, read: true, likes: 0, comments: [],
                        };
                        update({ ...next, messages: { ...next.messages, wechat: [...(next.messages.wechat ?? []).filter((item) => item.id !== record.id), record] },
                          ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), openThread: "西蓝花", wxThreeWayGroupCallFinishedV1: true, wxThreeWayGroupCallRequestedV1: false } } });
                      } else if (call.caller === "西蓝花" && call.status === "answered" && wx.wxBroccoliSignatureCallStartedV1 === true) {
                        const record = {
                          id: "broccoli-signature-call-duration-4351-v1", title: "西蓝花",
                          body: "通话时长：43:51", richText: "",
                          meta: { thread: "西蓝花", callStatus: "ended", callDuration: "43:51" },
                          time: new Date().toISOString(), sender: "我", avatar: "", kind: "call" as const,
                          media: "", hidden: false, unlock: "", password: "", folder: "", favorite: false,
                          outgoing: true, read: true, likes: 0, comments: [],
                        };
                        update({ ...next, messages: { ...next.messages, wechat: [...(next.messages.wechat ?? []).filter((item) => item.id !== record.id), record] },
                          ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxBroccoliSignatureCallFinishedV1: true } } });
                      } else if (
                        (call.caller === "西蓝花" || call.caller === "西兰花") &&
                        call.status === "answered" &&
                        wx.wxBroccoliCallFinishedV1 !== true &&
                        (
                          wx.wxBroccoliCallStartedV1 === true ||
                          (() => {
                            // Save-compatible fallback: older saves may contain the
                            // final ellipsis message but have lost the call-start flag.
                            let story: { messages?: Array<{ body?: string; thread?: string }> } = {};
                            try {
                              if (typeof wx.catRescueState === "string") story = JSON.parse(wx.catRescueState);
                            } catch { story = {}; }
                            const candidates = [
                              ...(current.messages.wechat ?? []),
                              ...(Array.isArray(story.messages) ? story.messages : []),
                            ];
                            return candidates.some((item) => {
                              const body = String(item.body ?? "").replace(/\s/g, "");
                              return ("thread" in item && (item.thread === "西蓝花" || item.thread === "西兰花")) &&
                                /^[.。…]{12,}$/.test(body);
                            });
                          })()
                        )
                      ) {
                        const queued = [
                          { id: "drunk-broccoli-call-duration-v1", sender: "我", body: "聊天时长 00:09", thread: "西蓝花", kind: "call" },
                          { id: "drunk-broccoli-call-ended-v2", sender: "西蓝花", body: "你在說什麼我聽不清！！", thread: "西蓝花" },
                          { id: "drunk-broccoli-where-v2", sender: "西蓝花", body: "妳現在到底在幹嘛？", thread: "西蓝花" },
                          { id: "drunk-broccoli-answer-v2", sender: "西蓝花", body: "喂？有沒有在聽我說話？", thread: "西蓝花" },
                          { id: "drunk-broccoli-poison-check-v2", sender: "西蓝花", body: "妳不回我，該不會真的中毒了吧？", thread: "西蓝花" },
                          { id: "drunk-broccoli-hotel-v2", sender: "西蓝花", body: "妳酒店到底在哪裡？把地址發我！", thread: "西蓝花", meta: { startBigGCall: "yes" } },
                        ];
                        update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxBroccoliCallFinishedV1: true, wxCatPendingLines: JSON.stringify(queued) } } });
                      } else if (isDrunkFinalCall && wx.wxBroccoliFinalGCallV1 === true) {
                        let queued: Array<{ id?: string; sender: string; body: string; thread?: string; kind?: Item["kind"]; media?: string; outgoing?: boolean; meta?: Record<string, string> }> = [];
                        try { const parsed = typeof wx.wxCatPendingLines === "string" ? JSON.parse(wx.wxCatPendingLines) : []; if (Array.isArray(parsed)) queued = parsed; } catch { queued = []; }
                        queued.push(
                          { id: "drunk-big-g-call-declined-first-v1", sender: "大G", body: "已拒绝", thread: "大G", kind: "call", meta: { callStatus: "declined" } },
                          { id: "drunk-big-g-door-v1", sender: "大G", body: "開門。", thread: "大G" },
                          { id: "drunk-big-g-door-voice-v1", sender: "大G", body: "開門，我在外面。", thread: "大G", kind: "audio", media: "./assets/dag-door-voice.mp3", outgoing: false, meta: { voiceDuration: "2", voiceTranscript: "開門，我在外面。" } },
                        );
                        update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxDrunkFinalCallFinishedV7: true, wxCatPendingLines: JSON.stringify(queued) } } });
                      } else if (isInitialDrunkCall) {
                        let queued: Array<{ id?: string; sender: string; body: string; thread?: string; kind?: Item["kind"]; media?: string; outgoing?: boolean; meta?: Record<string, string> }> = [];
                        try { const parsed = typeof wx.wxCatPendingLines === "string" ? JSON.parse(wx.wxCatPendingLines) : []; if (Array.isArray(parsed)) queued = parsed; } catch { queued = []; }
                        queued.push(
                          { id: "drunk-big-g-call-declined-v11", sender: "大G", body: "已拒绝", thread: "大G", kind: "call", meta: { callStatus: "declined" } },
                          { id: "drunk-big-g-pick-up-v10", sender: "大G", body: "接電話。", thread: "大G" },
                        );
                        update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxDrunkInitialCallHangupHandledV1: true, wxCatPendingLines: JSON.stringify(queued) } } });
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
                        const wx = current.ui?.wechat ?? {};
                        const identity = String(call.caller || call.target || "").trim();
                        const isDaG = identity === "大G" || identity === "温尚翊" || identity === "温尚翊（大G）";
                        const isScriptedDaGIncoming = isDaG && call.direction !== "outgoing";
                        const isFirstDrunkCall = isScriptedDaGIncoming &&
                          wx.wxDrunkCallRequestedV8 === true &&
                          wx.wxDrunkInitialCallHangupHandledV1 !== true &&
                          wx.wxDrunkSecondCallStartedV1 !== true;
                        const isSecondDrunkCall = isScriptedDaGIncoming &&
                          wx.wxDrunkSecondCallStartedV1 === true &&
                          wx.wxDrunkFinalCallFinishedV7 !== true &&
                          wx.wxBroccoliFinalGCallV1 === true;
                        if (isFirstDrunkCall) {
                          let queued: Array<{id?: string; sender: string; body: string; thread?: string; kind?: Item["kind"]; meta?: Record<string,string>}> = [];
                          try { const parsed = typeof wx.wxCatPendingLines === "string" ? JSON.parse(wx.wxCatPendingLines) : []; if (Array.isArray(parsed)) queued = parsed; } catch { queued = []; }
                          queued.push(
                            { id: "drunk-big-g-call-declined-v11", sender: "大G", body: "已拒绝", thread: "大G", kind: "call", meta: { callStatus: "declined" } },
                            { id: "drunk-big-g-pick-up-v10", sender: "大G", body: "接電話。", thread: "大G" },
                          );
                          update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxDrunkInitialCallHangupHandledV1: true, wxCatPendingLines: JSON.stringify(queued) } } });
                        } else if (isSecondDrunkCall) {
                          let queued: Array<{id?: string; sender: string; body: string; thread?: string; kind?: Item["kind"]; media?: string; outgoing?: boolean; meta?: Record<string,string>}> = [];
                          try { const parsed = typeof wx.wxCatPendingLines === "string" ? JSON.parse(wx.wxCatPendingLines) : []; if (Array.isArray(parsed)) queued = parsed; } catch { queued = []; }
                          queued.push(
                            { id: "drunk-big-g-call-declined-first-v1", sender: "大G", body: "已拒绝", thread: "大G", kind: "call", meta: { callStatus: "declined" } },
                            { id: "drunk-big-g-door-v1", sender: "大G", body: "開門。", thread: "大G" },
                            { id: "drunk-big-g-door-voice-v1", sender: "大G", body: "開門，我在外面。", thread: "大G", kind: "audio", media: "./assets/dag-door-voice.mp3", outgoing: false, meta: { voiceDuration: "2", voiceTranscript: "開門，我在外面。" } },
                          );
                          update({ ...next, ui: { ...next.ui, wechat: { ...(next.ui?.wechat ?? {}), wxDrunkFinalCallFinishedV7: true, wxCatPendingLines: JSON.stringify(queued) } } });
                        } else update(next);
                      }
                    }}><PhoneIcon size={27}/><span>拒接</span></button>
                    <button className="accept-call call-control" onClick={() => {
                      const call = runtimeRef.current.incomingCall;
                      if (call) {
                        if (call.caller === "外卖") setDeliveryCallReplySent(false);
                        if (call.caller === "大G" && runtimeRef.current.ui?.wechat?.wxDaGHotpotCallStartedV1 === true) { setDagHotpotCallStep(0); setDagHotpotReplyReady(false); }
                        if (call.caller === "大G" && runtimeRef.current.ui?.wechat?.wxPostDinnerCallStartedV1 === true) { setPostDinnerCallStep(0); setPostDinnerReplyReady(false); }
                        update(dispatch(work, { ...runtimeRef.current, incomingCall: { ...call, status: "answered" } }, "callAnswered", call.target || call.caller));
                      }
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
                          openThread: resolveWeChatNotificationContact(notice),
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
  onNotification,
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
  onNotification?: (text: string) => void;
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
  ].filter((item) => !item.id.startsWith("milk-tea-call-player-reply-"))
    .map((item) =>
      item.id.startsWith("milk-tea-call-")
        ? { ...item, title: "大G", meta: { ...item.meta, thread: "大G" } }
        : item,
    ).filter((i) =>
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
              onNotification={onNotification}
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
