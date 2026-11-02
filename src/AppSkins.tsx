import { NativeComposer } from "./DeviceSystem";
import { useSkinState } from "./skinState";
import { useEffect, useRef, useState } from "react";
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
        name === "大G" || name === "温尚翊" ? "🎸" : name.slice(0, 1)
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
  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [items.length]);

  return (
    <div ref={messagesRef} className={`skin-messages ${whatsapp ? "wa-wallpaper" : ""}`}>
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
  lines: CatLine[];
};
const CAT_RESCUE_CHOICES: Record<number, CatChoice[]> = {
  0: [
    { id: "pity", label: "它看起来好可怜，瘦瘦小小的，一直在路边叫", nextStage: 1, lines: [
      { sender: "我", body: "它看起来好可怜，瘦瘦小小的，一直在路边叫，我都不忍心走了。" },
      { sender: "西蓝花", body: "等一下！！你家里不是还有 Vava 吗？先别急着带回家呀！" },
      { sender: "我", body: "我知道……可是它真的好小一只，身边也没有猫妈妈。" },
      { sender: "西蓝花", body: "我懂我懂，但流浪猫的健康情况不清楚，Vava 也要保护好，不能直接放一起。" },
    ]},
    { id: "cute", label: "它真的好可爱啊啊啊，我已经蹲在旁边看它十分钟了", nextStage: 1, lines: [
      { sender: "我", body: "它真的好可爱啊啊啊，我已经蹲在旁边看它十分钟了！" },
      { sender: "西蓝花", body: "你先站起来！！哈哈哈哈。等等，你家不是有 Vava 了吗？" },
      { sender: "我", body: "可是它一直用圆圆的眼睛看我，我真的走不动……" },
      { sender: "西蓝花", body: "可爱归可爱，健康风险也要考虑。先别让它接触 Vava，好不好？" },
    ]},
  ],
  1: [
    { id: "hesitate", label: "我也知道，可是把它留在这里我会一直惦记", nextStage: 2, lines: [
      { sender: "我", body: "我也知道，可是把它留在这里我会一直惦记。万一它晚上还在外面怎么办？" },
      { sender: "西蓝花", body: "唉……你这个人就是心太软。那至少先别直接抱回家，找个安全的方式安置它。" },
      { sender: "我", body: "它刚刚还主动蹭我的鞋，感觉一点都不怕我。" },
      { sender: "西蓝花", body: "啊啊啊你不要再描述了，我也要心软了！但 Vava 真的不能冒险。" },
    ]},
    { id: "vava", label: "我会把它和 Vava 完全隔离的，先带它去医院检查", nextStage: 2, lines: [
      { sender: "我", body: "我会把它和 Vava 完全隔离的，先带它去医院检查，可以吗？" },
      { sender: "西蓝花", body: "你已经开始计划了是吧……好吧，先去医院检查是比较稳妥的，别让它们接触。" },
      { sender: "我", body: "嗯，我会准备单独的航空箱，回家也单独隔离。" },
      { sender: "西蓝花", body: "那就先去医院！记得问医生传染病筛查、驱虫和芯片，路上小心。" },
    ]},
  ],
  2: [
    { id: "go-clinic", label: "好，我决定了，先带它去医院，检查完再说", nextStage: 3, lines: [
      { sender: "我", body: "好，我决定了，先带它去医院，检查完再说。我真的不放心把它留在路边。" },
      { sender: "西蓝花", body: "好吧好吧，知道你会心软。先去医院是对的，Vava 那边一定要隔离好！" },
      { sender: "我", body: "我已经叫到车了，小黑猫乖乖待在箱子里，希望它没事。" },
      { sender: "西蓝花", body: "你到了没有？路上还顺利吗？检查完第一时间告诉我！" },
    ]},
    { id: "ask-help", label: "我先联系附近医院，问问能不能马上接诊", nextStage: 3, lines: [
      { sender: "我", body: "我先联系附近医院，问问能不能马上接诊，确认好就带它过去。" },
      { sender: "西蓝花", body: "可以！你先确认医院能接诊，路上注意保暖。Vava 先不要接触它哦。" },
      { sender: "我", body: "联系好了，我现在带它过去。" },
      { sender: "西蓝花", body: "到了没有？我在等你的消息，千万别自己吓自己！" },
    ]},
  ],
  3: [
    { id: "arrived", label: "到了！医生正在给它做基础检查", nextStage: 4, lines: [
      { sender: "我", body: "到了！医生正在给它做基础检查，我先在外面等一下。" },
      { sender: "西蓝花", body: "呼……终于到了。你也别紧张，先听医生怎么说。" },
      { sender: "我", body: "医生说先检查皮肤、耳朵和基础体征，再做一下传染病筛查。" },
      { sender: "西蓝花", body: "好专业！希望小家伙健健康康的。对了，记得问问有没有主人信息。" },
    ]},
    { id: "waiting", label: "刚到，正在排队，猫猫有点紧张", nextStage: 4, lines: [
      { sender: "我", body: "刚到，正在排队，小猫有点紧张，一直缩在箱子角落里。" },
      { sender: "西蓝花", body: "可怜的小朋友……你把箱子放稳一点，别一直围着它，让它安心待着。" },
      { sender: "我", body: "轮到我们了，医生开始检查了！" },
      { sender: "西蓝花", body: "好，等结果！你记得问问有没有芯片，看看能不能找到主人。" },
    ]},
  ],
  4: [
    { id: "chip", label: "芯片主人真的写着温尚翊……我是不是看错了？", nextStage: 5, lines: [
      { sender: "我", body: "等一下……芯片登记的主人写的是温尚翊？" },
      { sender: "西蓝花", body: "温尚翊？？啊？？你说谁？？？" },
      { sender: "我", body: "五月天那个温尚翊啊！！！不会吧？？？" },
      { sender: "西蓝花", body: "你先等等……真的假的？会不会只是同名啊？" },
    ]},
    { id: "confirm", label: "医生把名字给我看了，真的是温尚翊三个字", nextStage: 5, lines: [
      { sender: "我", body: "医生把登记资料给我看了，真的是温尚翊三个字。" },
      { sender: "西蓝花", body: "啊？？？？温尚翊？？？我脑子突然空白了。" },
      { sender: "我", body: "我也傻了，怎么会这么巧啊……" },
      { sender: "西蓝花", body: "先冷静啦，世界上同名的人也不是没有吧！" },
    ]},
  ],
  5: [
    { id: "same-name", label: "我也觉得可能是重名，但还是好不真实……", nextStage: 6, lines: [
      { sender: "我", body: "可是这个名字也太巧了吧，我现在还是觉得很不真实。" },
      { sender: "西蓝花", body: "名字一样不代表就是本人啦，先不要自己吓自己。" },
      { sender: "我", body: "我知道啊，但如果真的是他呢？" },
      { sender: "西蓝花", body: "那也先把猫咪的事情确认清楚，别想太远哈哈哈。" },
    ]},
    { id: "maybe-him", label: "你说会不会真的是他啊……", nextStage: 6, lines: [
      { sender: "我", body: "你说……会不会真的是他啊？" },
      { sender: "西蓝花", body: "啊？？你还真的开始想了？？？" },
      { sender: "我", body: "我只是觉得太巧了嘛！" },
      { sender: "西蓝花", body: "我也觉得很离谱，但还是先当作重名吧，别越猜越紧张。" },
    ]},
  ],
  6: [
    { id: "call-owner", label: "行……我现在打电话过去问问。", nextStage: 7, lines: [
      { sender: "西蓝花", body: "算了不管了，可能是重名吧！主人肯定也等得着急了，先打电话过去问问啦。" },
      { sender: "我", body: "行……我现在打过去问问。" },
      { sender: "我", body: "我打了……一直响，沒有人接。" },
      { sender: "西蓝花", body: "电话打不通啊？要不试试看能不能通过手机号加微信？" },
    ]},
  ],
  7: [
    { id: "try-wechat", label: "好，我试试看用手机号加微信。", nextStage: 8, lines: [
      { sender: "我", body: "好，我试试看用这个手机号加微信。" },
      { sender: "西蓝花", body: "嗯嗯！先确认是不是本人，别一上来就把自己吓到。" },
      { sender: "我", body: "我去微信看看……" },
    ]},
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
    appendCatLines(choice.lines, choice.nextStage);
    if (choice.nextStage === 8) { setIdCopied(false); setAddIdModal(true); }
  };
  const appendNewFriendConversation = () => {
    const [hour, minute] = (p.virtualTime || "14:24").split(":").map(Number);
    const total = (Number.isFinite(hour) ? hour : 14) * 60 + (Number.isFinite(minute) ? minute : 24);
    const time = "2026-11-02 " + String(Math.floor(total / 60) % 24).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
    const created = [
      makeItem({ id: "monster-added-system-" + Date.now(), title: "大G", sender: "我", body: "你已添加了大G，現在可以開始聊天了。", time, outgoing: true, kind: "event", meta: { storyId: "cat-rescue-add-friend" } }),
      makeItem({ id: "monster-first-message-" + Date.now(), title: "大G", sender: "大G", body: "你是？", time, outgoing: false, meta: { storyId: "cat-rescue-add-friend", wechatId: "mo00oster111" } }),
    ];
    setCatRescueRaw(JSON.stringify({ ...catRescue, stage: 9, messages: [...catRescue.messages, ...created] }));
    setAddedFriends((current) => current.includes("大G") ? current : [...current, "大G"]);
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
  const [addIdModal, setAddIdModal] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [friendRequestModal, setFriendRequestModal] = useState<"" | "confirm" | "sent">("");
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
  const friendDirectory = Array.from(new Set(["西蓝花", "爸爸", "妈妈", ...allItems.flatMap((i) => [i.title, i.sender]).filter((s) => s && s !== "我" && s !== "机主")]));
  const friendMatches = addQuery.trim()
    ? addQuery.trim().toLowerCase() === "mo00oster111" && catRescue.stage >= 8
      ? ["温尚翊"]
      : friendDirectory.filter((name) => {
          const related = allItems.filter((i) => i.title === name || i.sender === name);
          const keys = [name, ...related.flatMap((i) => [i.meta.wechatId, i.meta.account, i.meta.phone, i.meta.handle])].filter(Boolean).join(" ").toLowerCase();
          return keys.includes(addQuery.trim().toLowerCase());
        })
    : [];
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
      {addIdModal && (
        <div className="wx-friend-flow-backdrop">
          <section className="wx-friend-flow-sheet" role="dialog" aria-modal="true" aria-label="微信号">
            <button className="wx-friend-flow-close" onClick={() => setAddIdModal(false)}>×</button>
            <div className="wx-friend-flow-avatar"><Avatar name="温尚翊" /></div>
            <strong>找到一個微信號</strong>
            <p>可以試著用這個微信號添加對方</p>
            <div className="wx-friend-id">mo00oster111</div>
            <button className="wx-friend-flow-primary" onClick={() => { try { void navigator.clipboard?.writeText("mo00oster111"); } catch {} setIdCopied(true); }}>{idCopied ? "已复制" : "复制微信号"}</button>
            {idCopied && <button className="wx-friend-flow-secondary" onClick={() => setAddIdModal(false)}>返回微信</button>}
          </section>
        </div>
      )}
      {friendRequestModal && (
        <div className="wx-friend-flow-backdrop">
          <section className="wx-friend-flow-sheet" role="dialog" aria-modal="true" aria-label="好友申请">
            <div className="wx-friend-flow-avatar"><Avatar name="温尚翊" /></div>
            {friendRequestModal === "confirm" ? (
              <>
                <strong>添加到通讯录</strong>
                <p>温尚翊 · 微信号 mo00oster111</p>
                <div className="wx-friend-id">你可以向对方发送好友申请</div>
                <button className="wx-friend-flow-primary" onClick={() => { appendNewFriendConversation(); setFriendRequestModal("sent"); }}>发送好友申请</button>
                <button className="wx-friend-flow-secondary" onClick={() => setFriendRequestModal("")}>取消</button>
              </>
            ) : (
              <>
                <strong>好友申请已发送</strong>
                <p>已向温尚翊发送好友申请</p>
                <div className="wx-friend-id">好友添加成功 · 微信名：大G</div>
                <button className="wx-friend-flow-primary" onClick={() => { setFriendRequestModal(""); setUtility(""); setTab("微信"); p.onThread("大G"); }}>完成，查看消息</button>
              </>
            )}
          </section>
        </div>
      )}
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
            {catRescue.stage >= 8 && idCopied && <button type="button" className="wx-add-paste" onClick={() => setAddQuery("mo00oster111")}>粘贴</button>}
            {catRescue.stage >= 8 && idCopied && <button type="button" className="wx-add-paste" onClick={() => setAddQuery("mo00oster111")}>粘贴</button>}
            {addQuery && <button aria-label="清空搜索" onClick={() => setAddQuery("")}>×</button>}
          </label>
          {addQuery.trim() ? (
            <div className="wx-add-results">
              {friendMatches.length ? friendMatches.map((name) => {
                const related = allItems.find((i) => i.title === name || i.sender === name);
                const isMonster = name === "温尚翊";
                const alreadyAdded = addedFriends.includes(isMonster ? "大G" : name);
                return (
                  <div className="wx-add-result" key={name}>
                    <Avatar name={isMonster ? "大G" : name} src={related?.avatar} />
                    <span><strong>{name}</strong><small>微信号：{isMonster ? "mo00oster111" : related?.meta.wechatId || related?.meta.account || name}</small></span>
                    <button disabled={alreadyAdded} onClick={() => isMonster ? setFriendRequestModal("confirm") : setAddedFriends((v) => v.includes(name) ? v : [...v, name])}>{alreadyAdded ? "已添加" : isMonster ? "添加到通讯录" : "添加"}</button>
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
              {catRescue.stage === 8 && !idCopied && <div className="cat-rescue-choices"><button onClick={() => setAddIdModal(true)}>查看對方的微信號</button></div>}
              {catChoices.length > 0 && (
                <div className="cat-rescue-choices" aria-label="剧情回复选项">
                  {catChoices.map((choice) => (
                    <button key={choice.id} onClick={() => chooseCatRescue(choice)}>{choice.label}</button>
                  ))}
                  <div className="cat-rescue-option-hint">选择一条回复发送</div>
                </div>
              )}
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
