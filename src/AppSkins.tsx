import { NativeComposer } from "./DeviceSystem";
import { useSkinState } from "./skinState";
import { useState } from "react";
import {
  ChevronLeft,
  Plus,
  CirclePlus,
  Search,
  MessageCircle,
  Users,
  Compass,
  User,
  Camera,
  Phone,
  Video,
  Settings,
  Heart,
  Send,
  Home,
  Play,
  Bookmark,
  MoreHorizontal,
  Mic,
  Smile,
  Grid,
  CheckCheck,
  AtSign,
  Star,
  Music,
  Image as ImageIcon,
  Layers,
  Monitor,
  ChevronRight,
  Tag,
  ContactRound,
  Radio,
  ScanLine,
  Sparkles,
  MapPin,
  Wallet,
  BookOpen,
} from "lucide-react";
import { makeItem, safeMedia, type Item, type UiValue } from "./schema";
export type SkinProps = {
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
  appId?: string;
  owner?: string;
  virtualTime?: string;
  name: string;
  items: Item[];
  creator: boolean;
  onRead: (id: string) => void;
  onItem: (i: Item) => void;
  onAdd: () => void;
  onBack: () => void;
  thread: string;
  onThread: (s: string) => void;
};
function Avatar({
  name,
  round = false,
  src = "",
}: {
  name: string;
  round?: boolean;
  src?: string;
}) {
  return (
    <span className={`skin-avatar ${round ? "round" : ""}`}>
      {safeMedia(src)?.startsWith("data:image/") ? (
        <img src={safeMedia(src)} alt="" />
      ) : (
        name.slice(0, 1)
      )}
    </span>
  );
}
function ItemMedia({ item }: { item: Item }) {
  const src = safeMedia(item.media);
  return src ? (
    item.kind === "audio" ? (
      <audio controls src={src} />
    ) : item.kind === "video" ? (
      <video controls playsInline src={src} />
    ) : (
      <img loading="lazy" alt={item.title} src={src} />
    )
  ) : (
    <div className="skin-photo">
      <span>{item.title}</span>
    </div>
  );
}
function MessageList({
  items,
  creator,
  onItem,
  onRead,
  whatsapp = false,
}: {
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onRead: (id: string) => void;
  whatsapp?: boolean;
}) {
  return (
    <div className={`skin-messages ${whatsapp ? "wa-wallpaper" : ""}`}>
      <div className="skin-date">{items[0]?.time.slice(0, 10)}</div>
      {items.map((i) => (
        <div
          key={i.id}
          className={`skin-message ${i.outgoing ? "outgoing" : ""}`}
        >
          {!whatsapp && !i.outgoing && (
            <Avatar name={i.sender} src={i.avatar} />
          )}
          <button
            className="skin-bubble"
            onClick={() => (creator ? onItem(i) : onRead(i.id))}
          >
            {["image", "audio", "video"].includes(i.kind) ? (
              <ItemMedia item={i} />
            ) : i.kind === "transfer" ? (
              <div className="skin-transfer">
                ¥ {i.body}
                <small>转账记录 · 虚构</small>
              </div>
            ) : (
              i.body
            )}
            <small className={whatsapp ? undefined : "wx-message-time"}>
              {i.time.slice(-5)}{" "}
              {whatsapp && i.outgoing && <CheckCheck size={11} />}
            </small>
          </button>
          {!whatsapp && i.outgoing && <Avatar name={i.sender} src={i.avatar} />}
        </div>
      ))}
    </div>
  );
}
function Compose({
  creator,
  onAdd,
  wa = false,
}: {
  creator: boolean;
  onAdd: () => void;
  wa?: boolean;
}) {
  return (
    <div className={`skin-compose ${wa ? "wa-compose" : ""}`}>
      {wa ? <Plus size={20} /> : <Mic size={20} />}
      <NativeComposer creator={creator} onAdd={onAdd} />

      <Smile size={21} />
      {wa ? <Mic size={20} /> : <Plus size={22} />}
    </div>
  );
}


type CatRescueState = { stage: number; branch: string; messages: Item[] };
function parseCatRescueState(raw: string): CatRescueState {
  try {
    const value = JSON.parse(raw) as Partial<CatRescueState>;
    return {
      stage: Number.isFinite(value.stage) ? Number(value.stage) : 0,
      branch: typeof value.branch === "string" ? value.branch : "",
      messages: Array.isArray(value.messages) ? value.messages as Item[] : [],
    };
  } catch {
    return { stage: 0, branch: "", messages: [] };
  }
}
type CatLine = { sender: "我" | "西蓝花"; body: string };
type CatChoice = {
  id: string;
  label: string;
  nextStage: number;
  branch?: string;
  lines: CatLine[];
};
const CAT_RESCUE_CHOICES: Record<number, CatChoice[]> = {
  0: [
    {
      id: "hesitate",
      label: "想带它回家，可是 Vava 还在家，我怕有传染病……",
      nextStage: 1,
      branch: "hesitant",
      lines: [
        { sender: "我", body: "我有点想带它回家……可是 Vava 还在家，我怕有传染病。" },
        { sender: "西蓝花", body: "你先别冲动！Vava 还在家呢，外面的猫情况不清楚，不能直接抱回去。" },
        { sender: "我", body: "我知道呀，可是它一直跟着我，还一直喵喵叫……" },
        { sender: "西蓝花", body: "我懂你心软，但先保持距离，别让它碰到 Vava。我们慢慢想办法。" },
      ],
    },
    {
      id: "decide",
      label: "我已经决定带它回家了，先去医院检查！",
      nextStage: 11,
      branch: "decided",
      lines: [
        { sender: "我", body: "我已经决定带它回家了！我先带它去医院检查，Vava 那边我会隔离好。" },
        { sender: "西蓝花", body: "……你这行动力也太快了吧！好吧，既然决定了，先去医院，别直接和 Vava 接触。" },
        { sender: "我", body: "我现在就去，等下给你直播汇报！" },
        { sender: "西蓝花", body: "去吧！记得问医生猫瘟、猫癣、耳螨和驱虫，检查完再安排。" },
      ],
    },
  ],
  1: [
    {
      id: "food",
      label: "我先去买点吃的，陪它待一会儿",
      nextStage: 2,
      lines: [
        { sender: "我", body: "我先去便利店买点吃的，陪它待一会儿。" },
        { sender: "西蓝花", body: "可以，但先别徒手喂，买点猫粮或罐头，别喂牛奶哦。" },
        { sender: "我", body: "它吃完还一直蹭我的鞋，眼巴巴看着我……" },
        { sender: "西蓝花", body: "啊啊你不要用这种语气描述，我都能想象到了。但 Vava 真的要保护好。" },
      ],
    },
    {
      id: "box",
      label: "我先找个纸箱，把它安置好",
      nextStage: 2,
      lines: [
        { sender: "我", body: "我先找个纸箱，把它安置好，别让它乱跑。" },
        { sender: "西蓝花", body: "对，箱子底下垫件旧衣服，注意保暖，别让它接触其他猫。" },
        { sender: "我", body: "它乖乖蹲在里面，还一直看我，我心都化了。" },
        { sender: "西蓝花", body: "你已经完蛋了……但先做好隔离，带回家也要给它单独空间。" },
      ],
    },
  ],
  2: [
    {
      id: "bathroom",
      label: "我还是想带它回家，先让它在浴室隔离",
      nextStage: 99,
      lines: [
        { sender: "我", body: "我还是想带它回家，先让它在浴室隔离，绝不让它碰到 Vava。" },
        { sender: "西蓝花", body: "好吧……我就知道你会心软。先把浴室收拾干净，准备水和纸箱，Vava 的东西也别共用。" },
        { sender: "我", body: "我真的不忍心把它丢在路边，先让它安全待着，明天一早就去医院。" },
        { sender: "西蓝花", body: "那就先救急，但一定要隔离。摸完记得洗手换衣服，今天晚上也别让两只猫碰面。" },
        { sender: "我", body: "到家啦！小黑猫先在浴室安置好了，Vava 完全没见到它。" },
        { sender: "西蓝花", body: "做得好！先隔离，给它一点水和安静的地方。你也别太累啦。" },
        { sender: "我", body: "我刚发现它脖子上有挂牌，上面写着温先生，还有一个电话号码。" },
        { sender: "西蓝花", body: "那快打一下呀！也许主人正在找它。" },
        { sender: "我", body: "打了两次都没人接，电话一直响到自动挂断……" },
        { sender: "西蓝花", body: "电话不通的话，要不试试加微信？用号码或者名字搜一下，看看能不能联系到主人。" },
      ],
    },
    {
      id: "follow",
      label: "它一直跟着我，我真的不忍心把它留在外面",
      nextStage: 99,
      lines: [
        { sender: "我", body: "它一直跟着我，我真的不忍心把它留在外面……我带它回家吧。" },
        { sender: "西蓝花", body: "唉，我就知道。那你先把它放在单独的房间，千万别和 Vava 接触，用品也分开。" },
        { sender: "我", body: "嗯！我会注意的，先让它有个安全的地方，明天就带它检查。" },
        { sender: "西蓝花", body: "好，今晚先别让它们见面。你到家记得告诉我，别光顾着撸猫！" },
        { sender: "我", body: "到家啦！我把它安置在浴室了，Vava 还在客厅，完全没碰到。" },
        { sender: "西蓝花", body: "呼……那就好。先让它休息，记得给水，别急着洗澡。" },
        { sender: "我", body: "它脖子上有挂牌，写着温先生和一个电话。我打过去了，可是一直没人接。" },
        { sender: "西蓝花", body: "那试试加微信呀！搜一下电话号码或名字，说不定能找到主人。" },
      ],
    },
  ],
  11: [
    {
      id: "healthy",
      label: "医生说暂时没发现明显外伤，状态还可以",
      nextStage: 99,
      branch: "decided",
      lines: [
        { sender: "我", body: "医生先给它做了基础检查，说暂时没发现明显外伤，精神状态还可以。" },
        { sender: "西蓝花", body: "那太好了！不过检查报告还是要等一下，先别急着和 Vava 接触。" },
        { sender: "我", body: "然后医生用仪器扫了一下，居然发现它身体里有芯片！" },
        { sender: "西蓝花", body: "真的？！那应该能查到主人信息吧？快问问医生！" },
        { sender: "我", body: "芯片登记的是温先生，留了一个联系电话。" },
        { sender: "西蓝花", body: "那你赶紧打电话问问是不是他家的，先确认一下小猫的情况。" },
        { sender: "我", body: "我打过去了，可是一直没人接……响了很久也没接。" },
        { sender: "西蓝花", body: "电话打不通的话，要不试试加微信？搜一下手机号或者名字看看。" },
      ],
    },
    {
      id: "dehydrated",
      label: "医生说有点脱水和营养不良，要先观察",
      nextStage: 99,
      branch: "decided",
      lines: [
        { sender: "我", body: "医生说它有点脱水和营养不良，要先补水、观察一下。" },
        { sender: "西蓝花", body: "可怜的小家伙……好在你带它去医院了，先听医生安排，别急着带回去和 Vava 接触。" },
        { sender: "我", body: "医生又扫到它身体里有芯片，说可以查到主人信息。" },
        { sender: "西蓝花", body: "那快问问主人是谁，说不定人家正急着找它！" },
        { sender: "我", body: "芯片登记的是温先生，留了一个联系电话。" },
        { sender: "西蓝花", body: "先打电话确认一下吧，也问问它之前有没有生病。" },
        { sender: "我", body: "我打了，可是没人接，电话一直没人接听……" },
        { sender: "西蓝花", body: "那你试试加微信呀！搜一下手机号或者名字，说不定能联系上。" },
      ],
    },
  ],
};

export function WeChatSkin(p: SkinProps) {
  const [tab, setTab] = useState("微信");
  const [query, setQuery] = useState("");
  const [moments, setMoments] = useState(false);

  const [catRescueRaw, setCatRescueRaw] = useSkinState<string>(p, "catRescueState", "");
  const catRescue = parseCatRescueState(catRescueRaw);
  const allItems = [...p.items, ...catRescue.messages];
  const catRescueActive = p.thread === "西蓝花" && allItems.some((item) => item.meta.storyId === "cat-rescue");
  const [catDraft, setCatDraft] = useState("");
  const catAvatar = allItems.find((item) => item.sender === "西蓝花" && item.avatar)?.avatar || "";
  const catChoices = CAT_RESCUE_CHOICES[catRescue.stage] || [];
  const appendCatLines = (lines: CatLine[], nextStage = catRescue.stage, branch = catRescue.branch) => {
    const [hour, minute] = (p.virtualTime || "14:24").split(":").map(Number);
    const start = (Number.isFinite(hour) ? hour : 14) * 60 + (Number.isFinite(minute) ? minute : 24);
    const created = lines.map((line, index) => {
      const total = start + Math.floor(index / 2);
      const time = "2026-11-02 " + String(Math.floor(total / 60) % 24).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
      return makeItem({
        id: "cat-rescue-" + Date.now() + "-" + index + "-" + Math.random().toString(36).slice(2, 7),
        title: "西蓝花",
        sender: line.sender,
        body: line.body,
        time,
        outgoing: line.sender === "我",
        avatar: line.sender === "西蓝花" ? catAvatar : "",
        meta: { storyId: "cat-rescue" },
      });
    });
    setCatRescueRaw(JSON.stringify({
      stage: nextStage,
      branch,
      messages: [...catRescue.messages, ...created],
    }));
  };
  const chooseCatRescue = (choice: CatChoice) => {
    appendCatLines(choice.lines, choice.nextStage, choice.branch || catRescue.branch);
  };
  const sendCatDraft = () => {
    const body = catDraft.trim();
    if (!body) return;
    const reply =
      catRescue.stage === 99
        ? "你先试试看！有消息马上告诉我，我陪你一起想办法。"
        : catRescue.branch === "decided"
          ? "我听着呢！你先按医生说的来，别着急，Vava 那边也一定要做好隔离。"
          : "我在我在！你先别着急做决定，先照顾好自己，也别让小黑猫和 Vava 接触。";
    appendCatLines([{ sender: "我", body }, { sender: "西蓝花", body: reply }]);
    setCatDraft("");
  };

  const initialOwnerName = p.owner && p.owner !== "机主" ? p.owner : "我的微信";
  const [profileName, setProfileName] = useSkinState<string>(p, "wxProfileName", initialOwnerName);
  const [profileAvatar, setProfileAvatar] = useSkinState<string>(p, "wxProfileAvatar", "");
  const [profileStatus, setProfileStatus] = useSkinState<string>(p, "wxProfileStatus", "");
  const [statusEditorOpen, setStatusEditorOpen] = useState(false);
  const [customStatusOpen, setCustomStatusOpen] = useState(false);
  const [customStatusDraft, setCustomStatusDraft] = useState("");
  const saveProfileStatus = (value: string) => {
    const nextStatus = value.trim();
    if (!nextStatus) return;
    setProfileStatus(nextStatus);
    setStatusEditorOpen(false);
    setCustomStatusOpen(false);
    setCustomStatusDraft("");
  };
  const [nameEditorOpen, setNameEditorOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(profileName || initialOwnerName);
  const ownerName = profileName || initialOwnerName;
  const saveProfileName = () => {
    const nextName = nameDraft.trim();
    if (!nextName) return;
    setProfileName(nextName);
    setNameEditorOpen(false);
  };
  const updateProfileAvatar = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) {
      window.alert("头像图片请控制在 3MB 以内");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setProfileAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const [menu, setMenu] = useState(false);
  const [utility, setUtility] = useState("");
  const [readThreads, setReadThreads] = useSkinState<string[]>(p, "readThreads", []);
  const [addedFriends, setAddedFriends] = useSkinState<string[]>(p, "wxAddedFriends", []);
  const [addQuery, setAddQuery] = useState("");
  const [momentCover, setMomentCover] = useSkinState<string>(p, "wxMomentCover", "");
  const [momentPostData, setMomentPostData] = useSkinState<string[]>(p, "wxMomentPosts", []);
  const [momentComposer, setMomentComposer] = useState(false);
  const [momentDraft, setMomentDraft] = useState("");
  const myMomentPosts = momentPostData.flatMap((raw) => {
    try {
      const post = JSON.parse(raw) as { id: string; body: string; time: string };
      return post.id && post.body ? [post] : [];
    } catch {
      return [];
    }
  });
  const publishMoment = () => {
    const body = momentDraft.trim();
    if (!body) return;
    setMomentPostData((current) => [...current, JSON.stringify({
      id: `moment-${Date.now()}`,
      body,
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
    })]);
    setMomentDraft("");
    setMomentComposer(false);
  };
  const updateMomentCover = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) {
      window.alert("图片请控制在 4MB 以内");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setMomentCover(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const conversations = Array.from(
    new Set(allItems.filter((i) => !["朋友圈", "我"].includes(i.folder)).map((i) => i.title)),
  ).sort((a, b) => {
    const aLast = allItems.filter((i) => i.title === a).at(-1)?.time ?? "";
    const bLast = allItems.filter((i) => i.title === b).at(-1)?.time ?? "";
    return bLast.localeCompare(aLast);
  });
  const contacts = Array.from(new Set([
    ...allItems.map((i) => i.sender).filter((s) => s && s !== "我" && s !== "机主"),
    ...addedFriends,
  ])).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const friendDirectory = Array.from(new Set(["温尚翊", "西兰花", "爸爸", "妈妈", ...allItems.flatMap((i) => [i.title, i.sender]).filter((s) => s && s !== "我" && s !== "机主")]));
  const friendMatches = addQuery.trim() ? friendDirectory.filter((name) => {
    const related = allItems.filter((i) => i.title === name || i.sender === name);
    const keys = [name, ...related.flatMap((i) => [i.meta.wechatId, i.meta.account, i.meta.phone, i.meta.handle])].filter(Boolean).join(" ").toLowerCase();
    return keys.includes(addQuery.trim().toLowerCase());
  }) : [];
  const posts = allItems.filter((i) => i.folder === "朋友圈" || i.kind === "post");
  const filteredConversations = conversations.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()) ||
    allItems.some((i) => i.title === name && i.body.toLowerCase().includes(query.toLowerCase())),
  );
  const shortcutRows = [
    { label: "新的朋友", icon: Users, color: "#f4a23a" },
    { label: "仅聊天的朋友", icon: ContactRound, color: "#f4a23a" },
    { label: "群聊", icon: MessageCircle, color: "#16b86a" },
    { label: "标签", icon: Tag, color: "#278bd8" },
    { label: "公众号", icon: BookOpen, color: "#168de0" },
    { label: "服务号", icon: Layers, color: "#14a9d6" },
    { label: "企业微信联系人", icon: Users, color: "#368bd0" },
  ];
  const discoverGroups = [
    [{ label: "朋友圈", icon: Camera, color: "#24b66a" }],
    [
      { label: "视频号", icon: Play, color: "#f2a53a" },
      { label: "直播", icon: Radio, color: "#e77970" },
    ],
    [
      { label: "扫一扫", icon: ScanLine, color: "#368fd0" },
      { label: "听一听", icon: Music, color: "#e66b79" },
    ],
    [
      { label: "看一看", icon: Sparkles, color: "#e6b735" },
      { label: "搜一搜", icon: Search, color: "#e8757d" },
    ],
    [
      { label: "附近的人", icon: MapPin, color: "#368fd0" },
      { label: "游戏", icon: Grid, color: "#e2a83c" },
      { label: "小程序", icon: Layers, color: "#7c72cf" },
    ],
  ];
  const profileRows = [
    { label: "服务", icon: MessageCircle, color: "#18b77b" },
    { label: "收藏", icon: Bookmark, color: "#e5b13c" },
    { label: "朋友圈", icon: ImageIcon, color: "#389bd2" },
    { label: "视频号", icon: Play, color: "#399bd5" },
    { label: "卡包", icon: Wallet, color: "#e47e68" },
    { label: "表情", icon: Smile, color: "#e6b83d" },
    { label: "设置", icon: Settings, color: "#389bd2" },
  ];
  const openUtility = (label: string) => setUtility(label);
  const openContact = (name: string) => {
    const related = allItems.find((i) => i.sender === name || i.title === name);
    if (related) {
      p.onThread(related.title);
      p.onRead(related.title);
    } else setUtility(name);
  };
  return (
    <div className="wechat-ui independent-skin wx-reference-layout" data-tab={tab} data-thread={!!p.thread} data-moments={moments} data-utility={!!utility} data-status-editor={statusEditorOpen}>
      <div className="app-nav wx-nav">
        <button aria-label={statusEditorOpen ? "关闭状态编辑" : "返回"} onClick={() => {
          if (statusEditorOpen) { setStatusEditorOpen(false); setCustomStatusOpen(false); }
          else if (utility) setUtility("");
          else if (p.thread) p.onThread("");
          else if (moments) setMoments(false);
          else if (tab !== "微信") setTab("微信");
          else setUtility("收藏");
        }}>
          {statusEditorOpen ? <span className="wx-status-close">×</span> : utility || p.thread || moments || tab !== "微信" ? <ChevronLeft size={22} /> : <Star size={22} />}
        </button>
        <strong>{statusEditorOpen ? "设个状态" : utility || p.thread || (moments ? "朋友圈" : tab)}</strong>
        <button aria-label={statusEditorOpen ? " " : p.thread ? "聊天详情" : "微信菜单"} onClick={() => statusEditorOpen ? undefined : p.thread ? setUtility("聊天信息") : setMenu((v) => !v)}>
          {statusEditorOpen ? null : p.thread ? <MoreHorizontal size={22} /> : <CirclePlus size={23} />}
        </button>
      </div>

      {menu && !p.thread && !moments && !utility && (
        <div className="wx-popup-menu" role="menu">
          {["发起群聊", "添加朋友", "扫一扫", "收付款"].map((label) => (
            <button role="menuitem" key={label} onClick={() => { setMenu(false); setUtility(label); }}>{label}</button>
          ))}
        </div>
      )}

      {statusEditorOpen ? (
        <div className="wx-status-editor">
          <div className="wx-status-subtitle">朋友 24 小时内可见</div>
          <button className="wx-status-custom-tile" onClick={() => { setCustomStatusDraft(profileStatus); setCustomStatusOpen(true); }}>
            <span className="wx-status-custom-plus">＋</span>
            <strong>{profileStatus || "填写状态"}</strong>
          </button>
          <section className="wx-status-category"><h3>心情想法</h3><div className="wx-status-grid">
            {[[ "☺","美滋滋"],["♧","裂开"],["♨","求锦鲤"],["☼","等天晴"],["☕","疲惫"],["☂","发呆"],["↗","冲"],["〰","emo"],["☁","胡思乱想"],["✦","元气满满"],["▣","bot"]].map(([icon,label]) => <button key={label} onClick={() => saveProfileStatus(label)}><span>{icon}</span><small>{label}</small></button>)}
          </div></section>
          <section className="wx-status-category"><h3>工作学习</h3><div className="wx-status-grid">
            {[[ "♟","搬砖"],["⌁","沉迷学习"],["♙","忙"],["♧","摸鱼"],["✈","出差"],["➶","飞奔回家"],["☾","勿扰模式"]].map(([icon,label]) => <button key={label} onClick={() => saveProfileStatus(label)}><span>{icon}</span><small>{label}</small></button>)}
          </div></section>
          <section className="wx-status-category"><h3>活动</h3><div className="wx-status-grid">
            {[[ "♬","浪"],["✌","打卡"],["↗","运动"],["☕","喝咖啡"],["▤","喝奶茶"],["♫","听音乐"],["⌂","在家"]].map(([icon,label]) => <button key={label} onClick={() => saveProfileStatus(label)}><span>{icon}</span><small>{label}</small></button>)}
          </div></section>
          {customStatusOpen && <div className="wx-status-custom-backdrop"><section className="wx-status-custom-sheet" role="dialog" aria-modal="true" aria-label="自定义状态">
            <header><button onClick={() => setCustomStatusOpen(false)}>取消</button><strong>填写状态</strong><button disabled={!customStatusDraft.trim()} onClick={() => saveProfileStatus(customStatusDraft)}>确认</button></header>
            <textarea autoFocus maxLength={30} value={customStatusDraft} onChange={(e) => setCustomStatusDraft(e.target.value)} placeholder="此刻的心情或正在做的事..." /><small>{customStatusDraft.length}/30</small>
          </section></div>}
        </div>
      ) : utility === "添加朋友" ? (
        <div className="wx-add-friend-page">
          <label className="wx-add-search">
            <Search size={19} />
            <input aria-label="搜索微信号或手机号" placeholder="账号/手机号" value={addQuery} onChange={(e) => setAddQuery(e.target.value)} />
            {addQuery && <button aria-label="清空搜索" onClick={() => setAddQuery("")}>×</button>}
          </label>
          {addQuery.trim() ? (
            <div className="wx-add-results">
              {friendMatches.length ? friendMatches.map((name) => {
                const related = allItems.find((i) => i.title === name || i.sender === name);
                const alreadyAdded = addedFriends.includes(name);
                return (
                  <div className="wx-add-result" key={name}>
                    <Avatar name={name} src={related?.avatar} />
                    <span><strong>{name}</strong><small>微信号：{related?.meta.wechatId || related?.meta.account || name}</small></span>
                    <button disabled={alreadyAdded} onClick={() => setAddedFriends((v) => v.includes(name) ? v : [...v, name])}>{alreadyAdded ? "已添加" : "添加"}</button>
                  </div>
                );
              }) : <div className="wx-add-no-results"><Search size={27} /><strong>没有找到相关用户</strong><span>请检查微信号或手机号是否正确</span></div>}
            </div>
          ) : (
            <div className="wx-add-methods">
              {[
                {label:"扫一扫",desc:"扫描二维码名片",icon:ScanLine,color:"#269bd7"},
                {label:"手机联系人",desc:"添加通讯录中的朋友",icon:Phone,color:"#20b879"},
                {label:"雷达",desc:"添加身边的朋友",icon:Compass,color:"#7770ce"},
                {label:"企业微信联系人",desc:"通过手机号搜索企业微信用户",icon:Users,color:"#2996c8"},
                {label:"面对面建群",desc:"与身边的朋友进入同一个群聊",icon:Users,color:"#20b879"},
                {label:"公众号",desc:"获取更多资讯",icon:BookOpen,color:"#268bd0"},
                {label:"服务号",desc:"获取更多购物信息和服务",icon:Layers,color:"#e47768"},
              ].map(({label,desc,icon:Icon,color}) => (
                <button className="wx-add-method" key={label} onClick={() => setUtility(label)}>
                  <Icon size={25} style={{color}} />
                  <span><strong>{label}</strong><small>{desc}</small></span>
                  <ChevronRight size={21} />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : utility ? (
        <div className="skin-scroll wx-utility">
          {utility === "聊天信息" && (
            <div className="wx-members">
              {Array.from(new Set(allItems.filter((i) => i.title === p.thread).map((i) => i.sender))).map((name) => (
                <div key={name}><Avatar name={name} src={allItems.find((i) => i.sender === name)?.avatar} /><small>{name}</small></div>
              ))}
            </div>
          )}
          {allItems.filter((i) => i.folder === utility).map((i) => (
            <button key={i.id} className="wx-discovery" onClick={() => p.onItem(i)}>{i.title}<span>›</span></button>
          ))}
          {!allItems.some((i) => i.folder === utility) && utility !== "聊天信息" && (
            <div className="wx-empty-state"><span>{utility}</span><p>这里还没有内容</p></div>
          )}
        </div>
      ) : p.thread ? (
        <>
          {catRescueActive ? (
            <div className="cat-rescue-thread">
              <MessageList items={allItems.filter((i) => i.title === p.thread)} creator={p.creator} onItem={p.onItem} onRead={p.onRead} />
              {catChoices.length > 0 && (
                <div className="cat-rescue-choices" aria-label="剧情回复选项">
                  {catChoices.map((choice) => (
                    <button key={choice.id} onClick={() => chooseCatRescue(choice)}>{choice.label}</button>
                  ))}
                </div>
              )}
              <form className="cat-rescue-compose" onSubmit={(event) => { event.preventDefault(); sendCatDraft(); }}>
                <input value={catDraft} onChange={(event) => setCatDraft(event.target.value)} placeholder="发消息…" aria-label="给西蓝花发送消息" />
                <button type="submit" disabled={!catDraft.trim()}>发送</button>
              </form>
            </div>
          ) : (
            <>
              <MessageList items={allItems.filter((i) => i.title === p.thread)} creator={p.creator} onItem={p.onItem} onRead={p.onRead} />
              <Compose creator={p.creator} onAdd={p.onAdd} />
            </>
          )}
        </>
      ) : moments ? (
        <div className="wx-moments">
          <div className="wx-moment-cover" style={momentCover ? { backgroundImage: `linear-gradient(#0002,#0002), url("${momentCover}")` } : undefined}>
            <span>朋友圈</span>
            <label className="wx-moment-cover-edit" title="更换朋友圈背景">
              <Camera size={17} />
              <span>更换背景</span>
              <input type="file" accept="image/*" onChange={(e) => updateMomentCover(e.target.files?.[0])} />
            </label>
          </div>
          <div className="wx-moment-compose-row">
            <Avatar name={ownerName} src={profileAvatar} />
            <button className="wx-moment-publish" onClick={() => setMomentComposer(true)}><Plus size={16} /> 发布朋友圈</button>
          </div>
          {myMomentPosts.map((post) => (
            <div key={post.id} className="wx-moment-post wx-moment-user-post">
              <Avatar name={ownerName} src={profileAvatar} />
              <div><strong>{ownerName}</strong><p>{post.body}</p><small>{post.time}</small></div>
            </div>
          ))}
          {posts.map((i) => (
            <button key={i.id} className="wx-moment-post" onClick={() => p.onItem(i)}>
              <Avatar name={i.sender} src={i.sender === ownerName || i.sender === "我" || i.sender === "机主" ? profileAvatar : i.avatar} />
              <div><strong>{i.sender}</strong><p>{i.body}</p>{i.media && <ItemMedia item={i} />}<small>{i.time}</small></div>
            </button>
          ))}
          {!posts.length && !myMomentPosts.length && <p className="skin-empty">还没有动态，发布一条朋友圈吧</p>}
          {momentComposer && (
            <div className="wx-moment-composer-backdrop">
              <section className="wx-moment-composer">
                <header><button onClick={() => { setMomentComposer(false); setMomentDraft(""); }}>取消</button><strong>发表文字</strong><button disabled={!momentDraft.trim()} onClick={publishMoment}>发表</button></header>
                <textarea autoFocus value={momentDraft} onChange={(e) => setMomentDraft(e.target.value)} placeholder="这一刻的想法..." />
                <small>分享此刻的心情</small>
              </section>
            </div>
          )}
        </div>
      ) : (
        <div className="wx-page-scroll">
          {tab === "微信" && (
            <>
              <label className="wx-search wx-search-persistent">
                <Search size={17} />
                <input aria-label="搜索微信内容" placeholder="搜索" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
              <button className="wx-desktop-login" onClick={() => setUtility("文件传输助手")}>
                <Monitor size={22} /><span>已登录 Windows 电脑</span><ChevronRight size={16} />
              </button>
              <div className="wx-conversation-list">
                {filteredConversations.map((name) => {
                  const list = allItems.filter((i) => i.title === name);
                  const last = list.at(-1)!;
                  const unread = !readThreads.includes(name) && list.some((i) => !i.read);
                  return (
                    <button className="wx-chat-row" key={name} onClick={() => {
                      setReadThreads((v) => v.includes(name) ? v : [...v, name]);
                      p.onThread(name);
                      p.onRead(name);
                    }}>
                      <span className="wx-chat-avatar">
                        <Avatar name={name} src={last.avatar} />
                        {unread && <b className="wx-unread">{list.filter((i) => !i.read).length || ""}</b>}
                      </span>
                      <div className="wx-chat-copy"><strong>{name}</strong><p>{last.body}</p></div>
                      <time>{last.time.slice(-5)}</time>
                    </button>
                  );
                })}
                {!filteredConversations.length && <p className="skin-empty">没有找到相关聊天</p>}
              </div>
            </>
          )}

          {tab === "通讯录" && (
            <div className="wx-contacts-page">
              <label className="wx-search wx-search-persistent">
                <Search size={17} /><input placeholder="搜索" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="搜索联系人" />
              </label>
              <div className="wx-shortcut-list">
                {shortcutRows.map(({label, icon: Icon, color}) => (
                  <button key={label} onClick={() => openUtility(label)}>
                    <span className="wx-shortcut-icon" style={{background: color}}><Icon size={21} /></span>{label}
                  </button>
                ))}
              </div>
              <div className="wx-contact-section-title">我的联系人</div>
              <div className="wx-contact-list">
                {contacts.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map((name) => {
                  const avatarItem = allItems.find((i) => i.sender === name);
                  return <button className="wx-contact-row" key={name} onClick={() => openContact(name)}>
                    <Avatar name={name} src={avatarItem?.avatar} /><span>{name}</span>
                  </button>;
                })}
                {!contacts.length && <p className="skin-empty">联系人会在聊天后显示在这里</p>}
              </div>
              <div className="wx-alpha-index" aria-hidden="true">⌕<br />A<br />B<br />C<br />D<br />E<br />F<br />G<br />H<br />I<br />J<br />K<br />L<br />M<br />N<br />O<br />P<br />Q<br />R<br />S<br />T<br />U<br />V<br />W<br />X<br />Y<br />Z<br />#</div>
            </div>
          )}

          {tab === "发现" && (
            <div className="wx-discover-page">
              {discoverGroups.map((group, index) => (
                <section className="wx-discover-group" key={index}>
                  {group.map(({label, icon: Icon, color}) => (
                    <button className="wx-discover-row" key={label} onClick={() => label === "朋友圈" ? setMoments(true) : openUtility(label)}>
                      <Icon size={23} style={{color}} /><span>{label}</span><ChevronRight size={18} />
                    </button>
                  ))}
                </section>
              ))}
            </div>
          )}

          {tab === "我" && (
            <div className="wx-me-page">
              <div className="wx-me-profile">
                <label className="wx-me-avatar-edit" title="更换头像">
                  <Avatar name={ownerName} src={profileAvatar} />
                  <input aria-label="更换头像" type="file" accept="image/*" onChange={(e) => updateProfileAvatar(e.target.files?.[0])} />
                </label>
                <div className="wx-me-identity">
                  <button className="wx-me-name-edit" onClick={() => { setNameDraft(ownerName); setNameEditorOpen(true); }}>
                    <strong>{ownerName}</strong>
                  </button>
                  <small>微信号：IloveMayday</small>
                  <div className="wx-me-profile-actions">
                    <button className="wx-profile-status" onClick={() => setStatusEditorOpen(true)}>{profileStatus ? "● " + profileStatus : "＋ 状态"}</button>
                  </div>
                </div>
                <div className="wx-me-profile-trailing">
                  <button aria-label="我的二维码" onClick={() => openUtility("我的二维码")}><ScanLine size={25} /></button>
                  <ChevronRight size={23} />
                </div>
              </div>
              {nameEditorOpen && (
                <div className="wx-profile-edit-backdrop" role="presentation">
                  <section className="wx-profile-edit-sheet" role="dialog" aria-modal="true" aria-label="修改昵称">
                    <header><button onClick={() => setNameEditorOpen(false)}>取消</button><strong>修改昵称</strong><span /></header>
                    <input autoFocus maxLength={24} value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="请输入昵称" aria-label="输入新昵称" />
                    <button className="wx-profile-confirm" disabled={!nameDraft.trim()} onClick={saveProfileName}>确认</button>
                  </section>
                </div>
              )}
              <div className="wx-me-group">
                {profileRows.slice(0, 1).map(({label, icon: Icon, color}) => <button key={label} onClick={() => openUtility(label)}><Icon size={22} style={{color}}/><span>{label}</span><ChevronRight size={18}/></button>)}
              </div>
              <div className="wx-me-group">
                {profileRows.slice(1, 6).map(({label, icon: Icon, color}) => <button key={label} onClick={() => label === "朋友圈" ? setMoments(true) : openUtility(label)}><Icon size={22} style={{color}}/><span>{label}</span><ChevronRight size={18}/></button>)}
              </div>
              <div className="wx-me-group">
                {profileRows.slice(6).map(({label, icon: Icon, color}) => <button key={label} onClick={() => openUtility(label)}><Icon size={22} style={{color}}/><span>{label}</span><ChevronRight size={18}/></button>)}
              </div>
            </div>
          )}
        </div>
      )}

      {!p.thread && !moments && !utility && (
        <nav className="wx-bottom">
          {[
            {label:"微信", icon:MessageCircle},
            {label:"通讯录", icon:Users},
            {label:"发现", icon:Compass},
            {label:"我", icon:User},
          ].map(({label, icon: Icon}) => (
            <button className={tab === label ? "selected" : ""} key={label} onClick={() => { setTab(label); setQuery(""); }}>
              <Icon size={23} /><span>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
export function WhatsAppSkin(p: SkinProps) {
  const [tab, setTab] = useState("聊天"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("全部");
  const tabs = [
    { label: "动态", icon: Compass },
    { label: "通话", icon: Phone },
    { label: "社区", icon: Users },
    { label: "聊天", icon: MessageCircle },
    { label: "设置", icon: Settings },
  ];
  const conversations = [
    ...new Set(
      p.items
        .filter((i) => !["动态", "通话", "社区", "设置"].includes(i.folder))
        .filter((i) => filter !== "未读" || !i.read)
        .map((i) => i.title),
    ),
  ];
  const name = tab === "聊天" ? p.name : tab;
  return (
    <div className="whatsapp-ui independent-skin">
      <div className="app-nav wa-nav">
        <button
          aria-label="返回"
          onClick={() => (p.thread ? p.onThread("") : p.onBack())}
        >
          <ChevronLeft size={22} />
        </button>
        <strong>{p.thread || name}</strong>
        <button
          aria-label={p.creator ? "新增内容" : "搜索内容"}
          onClick={
            p.creator
              ? p.onAdd
              : () =>
                  document
                    .querySelector<HTMLInputElement>(".wa-search input")
                    ?.focus()
          }
        >
          {p.creator ? <Plus size={21} /> : <Search size={20} />}
        </button>
      </div>
      {p.thread ? (
        <>
          <div className="wa-thread-profile">
            <button aria-label="返回聊天列表" onClick={() => p.onThread("")}>
              <ChevronLeft size={23} />
            </button>
            <Avatar
              name={p.thread}
              src={p.items.find((i) => i.title === p.thread)?.avatar}
              round
            />
            <div>
              <strong>{p.thread}</strong>
              <small>联系人</small>
            </div>
            <Video size={18} />
            <Phone size={17} />
          </div>
          <MessageList
            items={p.items.filter((i) => i.title === p.thread)}
            creator={p.creator}
            onItem={p.onItem}
            onRead={p.onRead}
            whatsapp
          />
          <Compose creator={p.creator} onAdd={p.onAdd} wa />
        </>
      ) : (
        <div className="skin-scroll">
          <h1 className="wa-large-title">{tab}</h1>
          {tab === "聊天" ? (
            <>
              <label className="wa-search">
                <Search size={16} />
                <input
                  placeholder="搜索"
                  aria-label="搜索WhatsApp"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="wa-filters">
                {["全部", "未读", "群组"].map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "selected" : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {conversations
                .filter((t) => t.includes(query))
                .filter(
                  (t) =>
                    filter !== "群组" ||
                    p.items.some((i) => i.title === t && i.folder === "群组"),
                )
                .map((t) => {
                  const last = p.items.filter((i) => i.title === t).at(-1)!;
                  return (
                    <button
                      className="wa-chat-row"
                      key={t}
                      onClick={() => {
                        p.onThread(t);
                        p.onRead(t);
                      }}
                    >
                      <Avatar name={t} src={last.avatar} round />
                      <div>
                        <strong>{t}</strong>
                        <p>
                          {last.outgoing && <CheckCheck size={12} />}{" "}
                          {last.body}
                        </p>
                      </div>
                      <time>{last.time.slice(-5)}</time>
                    </button>
                  );
                })}
            </>
          ) : tab === "设置" ? (
            <>
              <div className="wa-settings-profile">
                <Avatar name="我" round />
                <h2>个人资料</h2>
              </div>
              {p.items
                .filter((i) => i.folder === "设置")
                .map((i) => (
                  <button
                    key={i.id}
                    className="wa-record"
                    onClick={() => p.onItem(i)}
                  >
                    {i.title}
                    <span>›</span>
                  </button>
                ))}
            </>
          ) : (
            <>
              {tab === "动态" && (
                <div className="wa-status">
                  <Avatar name="我" round />
                  <span>我的状态</span>
                  {p.creator && (
                    <button aria-label="添加状态" onClick={p.onAdd}>
                      <Plus size={17} />
                    </button>
                  )}
                </div>
              )}
              {p.items
                .filter(
                  (i) =>
                    i.folder === tab || (tab === "通话" && i.kind === "call"),
                )
                .map((i) => (
                  <button
                    className="wa-record"
                    key={i.id}
                    onClick={() => p.onItem(i)}
                  >
                    <Avatar name={i.sender} src={i.avatar} round />
                    <div>
                      <strong>{i.title}</strong>
                      <p>{i.body}</p>
                    </div>
                    <span>
                      {tab === "通话" ? (
                        <Phone size={17} />
                      ) : (
                        <ChevronLeft size={15} />
                      )}
                    </span>
                  </button>
                ))}
              {!p.items.some((i) => i.folder === tab) && (
                <p className="skin-empty">暂无{tab}内容</p>
              )}
            </>
          )}
          {p.creator && (
            <button className="phone-add" onClick={p.onAdd}>
              添加{tab === "聊天" ? "聊天" : tab}内容
            </button>
          )}
        </div>
      )}
      {!p.thread && (
        <nav className="wa-bottom">
          {tabs.map((t) => (
            <button
              className={tab === t.label ? "selected" : ""}
              key={t.label}
              onClick={() => setTab(t.label)}
            >
              <t.icon size={20} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
export function InstagramSkin(p: SkinProps) {
  const [tab, setTab] = useState("首页"),
    [dm, setDm] = useState(false),
    [query, setQuery] = useState(""),
    [likes, setLikes] = useSkinState<string[]>(p, "likes", []),
    [saved, setSaved] = useSkinState<string[]>(p, "saved", []),
    [showSaved, setShowSaved] = useState(false);
  const posts = p.items.filter(
      (i) =>
        i.kind === "post" ||
        !["私信", "Story", "Reels", "个人主页"].includes(i.folder),
    ),
    stories = p.items.filter((i) => i.folder === "Story"),
    reels = p.items.filter((i) => i.kind === "video" || i.folder === "Reels"),
    messages = p.items.filter((i) => i.folder === "私信");
  const tabs = [
    { label: "首页", icon: Home },
    { label: "搜索", icon: Search },
    { label: "Reels", icon: Play },
    { label: "个人主页", icon: User },
  ];
  const shown = (
    showSaved ? posts.filter((i) => saved.includes(i.id)) : posts
  ).filter((i) => (i.title + i.body + i.sender).includes(query));
  return (
    <div className="instagram-ui independent-skin">
      <div className="app-nav ig-nav">
        <button
          aria-label="返回"
          onClick={() => (dm ? setDm(false) : p.onBack())}
        >
          <ChevronLeft size={22} />
        </button>
        <strong>{dm ? "私信" : p.name}</strong>
        <div>
          {p.creator && (
            <button aria-label="新增内容" onClick={p.onAdd}>
              <Plus size={21} />
            </button>
          )}
          <button aria-label="Instagram 私信" onClick={() => setDm(!dm)}>
            <Send size={20} />
          </button>
        </div>
      </div>
      <div className="skin-scroll ig-scroll">
        {dm ? (
          <>
            {messages.map((i) => (
              <button
                key={i.id}
                className="ig-dm-row"
                onClick={() => p.onItem(i)}
              >
                <Avatar name={i.sender} round />
                <div>
                  <strong>{i.sender}</strong>
                  <p>{i.body}</p>
                </div>
              </button>
            ))}
            {!messages.length && <p className="skin-empty">暂无私信</p>}
            {p.creator && (
              <button className="phone-add" onClick={p.onAdd}>
                添加私信
              </button>
            )}
          </>
        ) : tab === "首页" ? (
          <>
            <div className="ig-stories">
              <button
                className="ig-story"
                onClick={
                  p.creator
                    ? p.onAdd
                    : () => {
                        if (stories[0]) p.onItem(stories[0]);
                      }
                }
                disabled={!p.creator && !stories.length}
              >
                <span>
                  <Avatar name="我" round />
                </span>
                <small>你的快拍</small>
              </button>
              {stories.map((i) => (
                <button
                  key={i.id}
                  className="ig-story"
                  onClick={() => p.onItem(i)}
                >
                  <span>
                    <Avatar name={i.sender} round />
                  </span>
                  <small>{i.sender}</small>
                </button>
              ))}
            </div>
            {posts.map((i) => (
              <article className="ig-post" key={i.id}>
                <div className="ig-post-author">
                  <Avatar name={i.sender} round />
                  <strong>{i.sender}</strong>
                  <button
                    aria-label={`帖子详情${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <MoreHorizontal size={19} />
                  </button>
                </div>
                <button className="ig-post-media" onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
                <div className="ig-post-controls">
                  <button
                    aria-label={`喜欢${i.title}`}
                    onClick={() =>
                      setLikes(
                        likes.includes(i.id)
                          ? likes.filter((x) => x !== i.id)
                          : [...likes, i.id],
                      )
                    }
                  >
                    <Heart
                      size={23}
                      fill={likes.includes(i.id) ? "#ed4956" : "none"}
                      color={likes.includes(i.id) ? "#ed4956" : "currentColor"}
                    />
                  </button>
                  <button
                    aria-label={`评论${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <MessageCircle size={22} />
                  </button>
                  <button
                    aria-label={`查看${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <Send size={21} />
                  </button>
                  <button
                    aria-label={`收藏${i.title}`}
                    onClick={() =>
                      setSaved(
                        saved.includes(i.id)
                          ? saved.filter((x) => x !== i.id)
                          : [...saved, i.id],
                      )
                    }
                  >
                    <Bookmark
                      size={22}
                      fill={saved.includes(i.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="ig-post-caption">
                  <strong>
                    {i.likes + (likes.includes(i.id) ? 1 : 0)} 次赞
                  </strong>
                  <p>
                    <b>{i.sender}</b> {i.body}
                  </p>
                  <button onClick={() => p.onItem(i)}>
                    查看全部 {i.comments.length} 条评论
                  </button>
                  <time>{i.time}</time>
                </div>
              </article>
            ))}
          </>
        ) : tab === "搜索" ? (
          <>
            <label className="ig-search">
              <Search size={15} />
              <input
                value={query}
                aria-label="搜索Instagram"
                placeholder="搜索"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="ig-explore">
              {shown.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
              ))}
            </div>
          </>
        ) : tab === "Reels" ? (
          <>
            {reels.map((i) => (
              <div className="ig-reel" key={i.id}>
                <ItemMedia item={i} />
                <button onClick={() => p.onItem(i)}>
                  {i.sender} · {i.title}
                </button>
              </div>
            ))}
            {!reels.length && <p className="skin-empty">暂无 Reels</p>}
          </>
        ) : (
          <>
            <div className="ig-profile">
              <Avatar name={posts[0]?.sender ?? "我"} round />
              <div>
                <strong>{posts.length}</strong>
                <small>帖子</small>
              </div>
              <div>
                <strong>0</strong>
                <small>关注者</small>
              </div>
              <div>
                <strong>0</strong>
                <small>正在关注</small>
              </div>
            </div>
            <h3 className="ig-profile-name">{posts[0]?.sender ?? "我"}</h3>
            <div className="ig-profile-tabs">
              <button aria-label="帖子网格" onClick={() => setShowSaved(false)}>
                <Grid size={21} />
              </button>
              <button
                aria-label="已收藏帖子"
                onClick={() => setShowSaved(true)}
              >
                <Bookmark size={21} />
              </button>
              <button
                aria-label="资料内容"
                onClick={() => {
                  const i = p.items.find((i) => i.folder === "个人主页");
                  if (i) p.onItem(i);
                  else if (p.creator) p.onAdd();
                }}
              >
                <AtSign size={21} />
              </button>
            </div>
            <div className="ig-explore">
              {shown.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <nav className="ig-bottom">
        {tabs.map((t) => (
          <button
            key={t.label}
            className={tab === t.label ? "selected" : ""}
            aria-label={`Instagram ${t.label}`}
            onClick={() => {
              setTab(t.label);
              setDm(false);
            }}
          >
            <t.icon size={23} />
          </button>
        ))}
      </nav>
    </div>
  );
}
