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
import { GLOOMY_AVATAR } from "./gloomyAvatar";
export type SkinProps = {
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
  appId?: string;
  owner?: string;
  virtualTime?: string;
  virtualDate?: string;
  name: string;
  items: Item[];
  creator: boolean;
  onRead: (id: string) => void;
  onItem: (i: Item) => void;
  onAdd: () => void;
  onBack: () => void;
  thread: string;
  onThread: (s: string) => void;
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
function Avatar({
  name,
  round = false,
  src = "",
}: {
  name: string;
  round?: boolean;
  src?: string;
}) {
  const safeSrc = safeMedia(src);
  const isBroccoli = name === "西蓝花" || name === "西兰花";
  const imageSrc = isBroccoli ? GLOOMY_AVATAR : (safeSrc.startsWith("data:image/") || safeSrc.startsWith("/assets/") || safeSrc.startsWith("./assets/")) ? safeSrc : "";
  return (
    <span className={`skin-avatar ${round ? "round" : ""} ${name === "大G" || name === "温尚翊" ? "guitar-avatar" : ""}`}>
      {imageSrc ? <img src={imageSrc} alt="" /> : name === "大G" || name === "温尚翊" ? "🎸" : name.slice(0, 1)}
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
      <div>
        <img loading="lazy" alt={item.title} src={src} style={{ display: "block", maxWidth: "220px", maxHeight: "280px", objectFit: "cover", borderRadius: "8px" }} />
        {item.meta?.photoCaption === "true" && <div style={{ paddingTop: "7px" }}>{item.body}</div>}
      </div>
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
  wechat = false,
  wallpaper = "",
  selfAvatar = "",
}: {
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onRead: (id: string) => void;
  whatsapp?: boolean;
  wechat?: boolean;
  wallpaper?: string;
  selfAvatar?: string;
}) {
  const messagesRef = useRef<HTMLDivElement>(null);
  // Include the final message identity and body: a transcript can be updated
  // without changing its length (for example when an old save is repaired).
  const messageContentKey = items.map((item) => item.id + ":" + item.body).join("\u001f");
  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    // Wait for React to commit the new bubbles, then re-check after layout.
    // This avoids leaving the player's freshly sent bubble just below the fold.
    const firstFrame = window.requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      window.requestAnimationFrame(() => {
        if (messagesRef.current === container) container.scrollTop = container.scrollHeight;
      });
    });
    return () => window.cancelAnimationFrame(firstFrame);
  }, [items.length, messageContentKey]);

  return (
    <div ref={messagesRef} className={`skin-messages ${whatsapp ? "wa-wallpaper" : ""} ${wechat && wallpaper ? "wx-photo-wallpaper" : ""}`} style={wechat && wallpaper ? { backgroundImage: `url("${wallpaper}")`, backgroundSize: "cover", backgroundPosition: "center center" } : undefined}>
      <div className="skin-date">{items[0]?.time.slice(0, 10)}</div>
      {items.map((i) => {
        const monsterMessage = wechat && !i.outgoing && (i.sender === "大G" || i.sender === "温尚翊");
        const simplifiedMessage = wechat && (i.outgoing || i.sender === "我" || i.sender === "西蓝花");
        const body = monsterMessage ? toTraditionalChinese(i.body) : simplifiedMessage ? toSimplifiedChinese(i.body) : i.body;
        return <div
          key={i.id}
          className={`skin-message ${i.outgoing ? "outgoing" : ""}`}
        >
          {!whatsapp && !i.outgoing && (
            <Avatar name={i.sender} src={i.outgoing ? selfAvatar : i.avatar} />
          )}
          <button
            className="skin-bubble"
            onClick={() => (creator ? onItem(i) : onRead(i.id))}
          >
            {i.kind === "call" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#777" }}>
                <Phone size={15} style={{ transform: "rotate(135deg)" }} />
                {body}
              </span>
            ) : ["image", "audio", "video"].includes(i.kind) ? (
              <ItemMedia item={i} />
            ) : i.kind === "transfer" ? (
              <div className="skin-transfer">
                ¥ {body}
                <small>转账记录 · 虚构</small>
              </div>
            ) : (
              body
            )}
            <small className={whatsapp ? undefined : "wx-message-time"}>
              {i.time.slice(-5)}{" "}
              {whatsapp && i.outgoing && <CheckCheck size={11} />}
            </small>
          </button>
          {!whatsapp && i.outgoing && <Avatar name={i.sender} src={selfAvatar || i.avatar} />}
        </div>;
      })}
    </div>
  );
}
function Compose({
  creator,
  onAdd,
  onSend,
  wa = false,
}: {
  creator: boolean;
  onAdd: () => void;
  onSend?: (value: string) => void;
  wa?: boolean;
}) {
  return (
    <div className={`skin-compose ${wa ? "wa-compose" : ""}`}>
      {wa ? <Plus size={20} /> : <Mic size={20} />}
      <NativeComposer creator={creator} onAdd={onAdd} onSend={onSend} />

      <Smile size={21} />
      {wa ? <Mic size={20} /> : <Plus size={22} />}
    </div>
  );
}


type CatRescueState = { version: number; stage: number; branch: string; messages: Item[] };
function parseCatRescueState(raw: string): CatRescueState {
  try {
    const value = JSON.parse(raw) as Partial<CatRescueState>;
    if (value.version !== 2) return { version: 2, stage: 0, branch: "", messages: [] };
    return {
      version: 2,
      stage: Number.isFinite(value.stage) ? Number(value.stage) : 0,
      branch: typeof value.branch === "string" ? value.branch : "",
      messages: Array.isArray(value.messages) ? value.messages as Item[] : [],
    };
  } catch {
    return { version: 2, stage: 0, branch: "", messages: [] };
  }
}

// Merge legacy phone messages and the canonical story transcript without
// losing player replies. Sort by their saved timestamp, preserving insertion
// order for messages with the same (or unavailable) timestamp.
export function orderCatRescueThreadItems(items: Item[]): Item[] {
  const unique = items.filter((item, index, all) =>
    all.findIndex((candidate) => candidate.id === item.id) === index
  );
  const handsome = unique.find((item) => /救命啊啊啊怪獸好帥|救命啊啊啊怪兽好帅/.test(item.body));
  const anchorRaw = handsome ? Number(handsome.meta?.storyOrderAt) : NaN;
  const anchorTime = handsome
    ? (Number.isFinite(anchorRaw) && anchorRaw > 0 ? anchorRaw : Date.parse(handsome.time))
    : NaN;
  const reflowIndex = (body: string): number => {
    // Explicit chronology for the meetup conversation. The four split
    // appearance questions must all precede the player's "I'm composed"
    // reply; then the physical-contact exchange and signature exchange follow.
    if (/他鼻子挺不挺/.test(body)) return 1;
    if (/皮膚白不白/.test(body)) return 2;
    if (/整個人在陽光下是不是會bulingbuling發光/.test(body)) return 3;
    if (/妳有沒有看著流口水/.test(body)) return 4;
    if (/等一下[，,]?先回答我！他鼻子挺不挺/.test(body)) return 1;
    if (/妳亂說什麼啊！！我很矜持的好不好/.test(body)) return 5;
    if (/好好好[，,]?矜持。那我再問一個/.test(body)) return 6;
    if (/沒有啦！！就是正常把玩玩交給他/.test(body)) return 7;
    if (/幫我要簽名了嗎/.test(body) || /行吧[，,]?就知道妳?慫.*有沒有幫我.*簽名/.test(body)) return 8;
    if (/斯米馬賽|斯米马赛/.test(body)) return 9;
    if (/妳怎麼這麼沒用！?$/.test(body)) return 10;
    if (/我都沒敢暴露我是粉絲/.test(body)) return 11;
    if (/啊啊啊啊啊妳怎麼這麼沒用|啊啊啊啊啊你怎么这么没用/.test(body)) return 12;
    if (/我哪裡沒用了/.test(body)) return 13;
    if (/妳少來！我才不會咧/.test(body)) return 14;
    if (/也不知道之前是誰.*演唱會大屏/.test(body)) return 15;
    if (/妳不也差點暈過去/.test(body)) return 16;
    if (/我那可能是低血糖了吧/.test(body)) return 17;
    if (/妳就扯/.test(body)) return 18;
    if (/要是早點買內場就好了/.test(body)) return 19;
    if (/而且妳也可以幫我要簽名/.test(body)) return 20;
    if (/我現在跟怪獸可是朋友/.test(body)) return 21;
    if (/放長線釣大魚/.test(body)) return 22;
    if (/妳說得對，妳說得都對/.test(body)) return 23;
    if (/好啦好啦，不跟妳鬧了/.test(body)) return 24;
    return 0;
  };
  const transformed = unique.map((item) => {
    if (/幫我要簽名了嗎/.test(item.body)) {
      return { ...item, body: "行吧，就知道妳慫。那妳有沒有幫我要簽名？" };
    }
    return item;
  });
  // Older saves already contain the nose/skin and physical-contact exchange
  // after the pickup announcement. Reflow those bubbles next to the first
  // handsome reaction so the existing transcript reads in the intended order.
  const hasFanConfession = transformed.some((item) => /我都沒敢暴露我是粉絲/.test(item.body));
  const additions: Item[] = [];
  if (handsome && hasFanConfession && !transformed.some((item) => /斯米馬賽|斯米马赛/.test(item.body)) && Number.isFinite(anchorTime)) {
    additions.push(makeItem({
      id: "wx-meetup-signature-apology-reflow-v2",
      title: "西蓝花",
      sender: "我",
      body: "……沒有，斯米馬賽。",
      time: handsome.time,
      outgoing: true,
      meta: { storyId: "cat-rescue", storyThread: "西蓝花", storyOrderAt: String(anchorTime + 6) },
    }));
  }
  return [...transformed, ...additions]
    .map((item, index) => {
      const precise = Number(item.meta?.storyOrderAt);
      const hasPrecise = Number.isFinite(precise) && precise > 0;
      const priority = reflowIndex(item.body);
      const isReflowTarget = priority > 0 && Number.isFinite(anchorTime) && item.id !== handsome?.id;
      return {
        item,
        index,
        timestamp: isReflowTarget ? anchorTime + priority / 1000 : hasPrecise ? precise : Date.parse(item.time),
      };
    })
    .sort((a, b) => {
      if (Number.isFinite(a.timestamp) && Number.isFinite(b.timestamp) && a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
      const aValid = Number.isFinite(a.timestamp);
      const bValid = Number.isFinite(b.timestamp);
      if (aValid !== bValid) return aValid ? 1 : -1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}
type CatLine = { id?: string; sender: "我" | "西蓝花" | "大G"; body: string; thread?: "西蓝花" | "大G"; kind?: Item["kind"]; media?: string; meta?: Record<string, string> };
type CatChoice = {
  id: string;
  label: string;
  nextStage: number;
  branch?: string;
  lines: CatLine[];
};
const SIMPLIFIED_CHARS = "这边显发现后里为会说话让还没对时间开关门来过进见听问题吗吧样么个们从头长点爱欢乐难当动给气车钱买卖东书读写认识记错实觉应该系亲脸声远近尽别处万无数机电脑网线号种变带帮张条鱼猫鸟药医检验结终简体国台湾温尚翊妳够随虽压惊叹将愿务业场联络续热梦岁历户层楼总办响钟块单员职传输页图标签档录那哪谁";
const TRADITIONAL_CHARS = "這邊顯發現後裡為會說話讓還沒對時間開關門來過進見聽問題嗎吧樣麼個們從頭長點愛歡樂難當動給氣車錢買賣東書讀寫認識記錯實覺應該係親臉聲遠近盡別處萬無數機電腦網線號種變帶幫張條魚貓鳥藥醫檢驗結終簡體國臺灣溫尚翊妳夠隨雖壓驚嘆將願務業場聯絡續熱夢歲歷戶層樓總辦響鐘塊單員職傳輸頁圖標籤檔錄那哪誰";
function toTraditionalChinese(value: string) {
  return Array.from(value, (char) => {
    const index = SIMPLIFIED_CHARS.indexOf(char);
    return index < 0 ? char : Array.from(TRADITIONAL_CHARS)[index];
  }).join("");
}
function toSimplifiedChinese(value: string) {
  return Array.from(value, (char) => {
    const index = TRADITIONAL_CHARS.indexOf(char);
    return index < 0 ? char : Array.from(SIMPLIFIED_CHARS)[index];
  }).join("");
}
export function getCatRescueThreadForStage(stage: number): "西蓝花" | "大G" {
  // Hospital arrival and clinic check-in remain in the friend's conversation.
  const broccoliStages = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 30, 31, 32, 33, 34, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 84, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 200, 201, 202, 203, 204, 207, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248]);
  return broccoliStages.has(stage) ? "西蓝花" : "大G";
}
export function shouldAutoReturnToBroccoli(stage: number, pendingCount: number, currentThread: string): boolean {
  return pendingCount === 0 &&
    [32, 33, 37, 38, 39, 63, 64, 65, 88, 89, 90, 91, 92, 93, 94, 95, 96].includes(stage) &&
    currentThread !== "西蓝花" && currentThread !== "西兰花";
}
export function shouldCloseBroccoliAtStoryEnd(_stage: number, _pendingCount: number, _currentThread: string): boolean {
  // Never force-close the chat at the end of the story. The player must be
  // able to reopen the completed conversation and leave it manually.
  return false;
}
export function getCatRescueStageAfterFriendAdd(stage: number, branch: string): number {
  if (stage === 13 && branch === "monster-prank") return 16;
  if (stage === 13) return 14;
  return 9;
}
export function shouldShowPrankHistoryLine(_item: Item, _branch: string, _prankPath = _branch === "monster-prank"): boolean {
  // The full exchange (……蛤？ / 妳哪位？ / deletion notice) is intentional.
  // Duplicate "妳是？" greetings are handled by sequence-aware filtering below.
  return true;
}
export function filterPrankHistoryLines(items: Item[], prankPath: boolean): Item[] {
  if (!prankPath) return items;

  // Some legacy saves contain the prank reactions once in the old transcript
  // before the friend-add notice, then append the canonical choice sequence
  // again after the player sends "我是你爸爸". Those pre-choice reactions
  // are orphaned history and must not be shown. Keep the reaction sequence
  // that follows the player's actual prank message.
  const prankReplyBodies = new Set([
    "……蛤？",
    "妳哪位？我不認識妳喔。",
    "好喔，那我先把妳刪掉了。掰。",
  ]);
  const firstPrankIndex = items.findIndex((item) =>
    item.sender === "我" && /我是你爸爸/.test(item.body.trim())
  );
  const seenReplies = new Set<string>();
  let keptGreeting = false;
  return items.filter((item, index) => {
    const body = item.body.trim();
    // The original "妳是？" is the one intended opener. A legacy duplicate
    // may have been stored again when the player selected the prank option.
    if (body === "妳是？" && item.sender !== "我") {
      if (keptGreeting) return false;
      keptGreeting = true;
      return true;
    }
    if (!prankReplyBodies.has(body)) return true;
    // Never show a stale copy that appears before the player actually chose
    // the prank response.
    if (firstPrankIndex >= 0 && index < firstPrankIndex) return false;
    // Sender aliases ("大G" and "温尚翊") refer to the same contact. Dedup
    // by the exact scripted text, not the internal sender label.
    if (seenReplies.has(body)) return false;
    seenReplies.add(body);
    return true;
  });
}
export function shouldMigrateLegacyPrankReadd(
  stage: number,
  friendAccepted: boolean,
  hasPrankHistory: boolean,
  hasReaddedEvent: boolean,
): boolean {
  return stage === 14 && friendAccepted && hasPrankHistory && hasReaddedEvent;
}
export function splitCatRescueMessages(messages: Item[]): { broccoli: Item[]; owner: Item[] } {
  const isHospitalStoryMessage = (item: Item) =>
    /我會帶它去醫院先檢查|我会带它去医院先检查|你都說到這個份上了|你都说到这个份上了|放進外出籠|放进外出笼|路上小心.*到了記得|路上小心.*到了记得|你到了嗎|你到了吗|我帶它走.*先去醫院|我带它走.*先去医院|我不是不相信你啦|我會先讓醫生檢查|我会先让医生检查|我等你消息|醫生正在幫它檢查|医生正在帮它检查|醫生開始幫它檢查|医生开始帮它检查|醫生有開始幫它檢查|医生有开始帮它检查|先陪著它|先陪着它|到了到了|刚到医院|剛到醫院|晶片或主人資料|晶片或主人资料/.test(item.body);
  const isOwnerStoryMessage = (item: Item) =>
    !isHospitalStoryMessage(item) && (
      item.meta?.storyThread === "大G" ||
      item.title === "大G" ||
      item.title === "温尚翊" ||
      item.sender === "大G" ||
      item.sender === "温尚翊" ||
      /我是你爸爸|妳是？|妳哪位|不認識妳|不認識你|發錯人|发错人|你好.*捡到.*小黑猫|你好.*撿到.*小黑貓|其實是因為我撿到|其实是因为我捡到/.test(item.body)
    );
  const ownerStart = messages.findIndex(isOwnerStoryMessage);
  const isExplicitBroccoliMessage = (item: Item) =>
    item.meta?.storyThread === "西蓝花" || item.meta?.storyThread === "西兰花";
  const owner = messages.filter((item, index) =>
    !isExplicitBroccoliMessage(item) &&
    (isOwnerStoryMessage(item) || (ownerStart >= 0 && index >= ownerStart && !isHospitalStoryMessage(item)))
  );
  const broccoli = messages.filter((item) =>
    isExplicitBroccoliMessage(item) || isHospitalStoryMessage(item) || !owner.includes(item)
  );
  return { broccoli, owner };
}
export const CAT_RESCUE_CHOICES: Record<number, CatChoice[]> = {
  0: [
    { id: "bring-home", label: "要不我先带它回家？", nextStage: 1, branch: "bring-home", lines: [
      { sender: "我", body: "牠一直待在外面也不是辦法……要不我先帶牠回家？" },
      { sender: "西蓝花", body: "不行啦！妳家裡還有 Vava 耶，萬一小貓身上有傳染病怎麼辦？不能這樣直接帶回家啦！" },
    ]},
    { id: "leave-first", label: "我真的不忍心把它留在这里……想带它回家", nextStage: 1, branch: "leave-first", lines: [
      { sender: "我", body: "我真的不忍心把牠留在這裡……想先帶牠回家。" },
      { sender: "西蓝花", body: "不行啦！妳家裡還有 Vava，萬一小貓有傳染病怎麼辦？先不要急著帶回家！" },
    ]},
  ],
  1: [
    { id: "separate-room", label: "我可以让它单独隔离在另一个房间，完全不碰到 Vava", nextStage: 2, lines: [
      { sender: "我", body: "我可以讓牠先住另一個房間，門關起來，完全不讓牠碰到 Vava。" },
      { sender: "西蓝花", body: "可是妳進出房間也可能把病菌帶來帶去，而且牠的健康狀況我們都不知道。" },
      { sender: "西蓝花", body: "還有跳蚤、耳疥蟲這些問題，沒有檢查前真的不能太放心。" },
      { sender: "西蓝花", body: "妳連隔離流程都想好了是不是……我真的要被妳說服了，但還是要先看醫生！" },
    ]},
    { id: "cant-leave", label: "可是我一想到它还要在外面待着就好难受", nextStage: 2, lines: [
      { sender: "我", body: "可是我一想到牠還要在外面待著，我就覺得好難受。牠看起來真的很小。" },
      { sender: "西蓝花", body: "我懂啦……但妳也不能因為心疼牠，就讓 Vava 冒風險啊。" },
      { sender: "西蓝花", body: "如果附近真的沒有貓媽媽，也可以先問問救援的人，不一定要直接帶回家。" },
      { sender: "西蓝花", body: "唉，妳這樣講我也開始心軟了……但一定要先檢查，答應我。" },
    ]},
  ],
  2: [
    { id: "clinic-first", label: "那我先带它去医院，检查完再决定怎么安置", nextStage: 3, lines: [
      { sender: "我", body: "不然這樣好了，我先帶牠去醫院，檢查完再決定怎麼安置。" },
      { sender: "西蓝花", body: "這樣比較好！可是妳確定牠願意讓妳抱嗎？也要小心別被抓傷。" },
      { sender: "西蓝花", body: "如果牠一直躲，就先不要硬抓，找附近有經驗的人幫忙會比較安全。" },
      { sender: "西蓝花", body: "等醫生檢查過再決定要不要帶回家，先答應我不要讓 Vava 冒險！" },
    ]},
    { id: "still-worried", label: "好吧……那我先带它去医院检查", nextStage: 3, lines: [
      { sender: "我", body: "好吧好吧，妳說得對！那我先帶牠去醫院檢查，確認健康狀況再決定怎麼安置。", thread: "西蓝花" },
      { sender: "西蓝花", body: "這樣比較安心！先讓醫生檢查，也保護 Vava。妳路上小心，到了醫院記得跟我說！", thread: "西蓝花" },
    ]},
  ],
  30: [
    { id: "still-on-way", label: "还在路上，快到了，我会小心", nextStage: 31, lines: [
      { sender: "我", body: "還在路上，應該快到了，我會小心開車，外出籠也有固定好。" },
      { sender: "西蓝花", body: "好！不要趕，安全最重要。到了先讓醫生幫牠檢查，再跟我說結果喔。" },
    ]},
    { id: "arrived-waiting", label: "到了！我刚到医院，正在等医生", nextStage: 31, lines: [
      { sender: "我", body: "到了！我剛到醫院，正在等醫生，牠先在外出籠裡休息。" },
      { sender: "西蓝花", body: "好！醫生有開始幫牠檢查了嗎？有沒有先掃描晶片或確認主人資料？" },
    ]},
  ],
  31: [
    { id: "doctor-started-check", label: "医生正在帮它检查，刚刚拿去扫描晶片了", nextStage: 46, lines: [
      { sender: "我", body: "醫生正在幫牠檢查，剛剛先拿去掃描晶片了。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好，那先等醫生確認！希望牠有晶片，這樣比較容易找到主人。", thread: "西蓝花" },
    ]},
    { id: "doctor-checking-now", label: "医生刚开始检查，我在旁边等结果", nextStage: 46, lines: [
      { sender: "我", body: "醫生剛開始幫牠檢查，我在旁邊等結果。", thread: "西蓝花" },
      { sender: "西蓝花", body: "嗯嗯，妳先陪著牠，不要太緊張，有消息再跟我說。", thread: "西蓝花" },
    ]},
  ],
  3: [
    { id: "carrier-and-treats", label: "我把外出笼放低一点，用零食慢慢引它进去", nextStage: 12, lines: [
      { sender: "我", body: "牠一直往後縮，我先把外出籠放低一點，拿零食慢慢引牠進去，不敢硬抓。" },
      { sender: "西蓝花", body: "對對對，先別追牠！讓牠自己靠近外出籠，妳也小心不要讓牠嚇到或抓傷妳。" },
    ]},
    { id: "towel-gently", label: "它一直躲，我想用毛巾輕輕包住再放進外出籠", nextStage: 12, lines: [
      { sender: "我", body: "牠一直躲來躲去，我想用毛巾輕輕包住牠，再穩穩地放進外出籠。" },
      { sender: "西蓝花", body: "可以先讓醫院的人教妳怎麼做，別突然撲過去喔！小心牠掙扎，也不要弄傷牠。" },
    ]},
  ],
  10: [
    { id: "talk-about-day", label: "先聊点别的吧，你今天不是说有件事要跟我讲？", nextStage: 0, lines: [
      { sender: "我", body: "我先不想小貓的事了……對了，妳今天不是說有件事要跟我講？" },
      { sender: "西蓝花", body: "哈哈哈哈妳終於想到別的事了！我今天上班真的遇到一個超誇張的人。" },
      { sender: "西蓝花", body: "有個客人把飲料打翻，還一臉理直氣壯叫我幫他擦，講到我都快笑死了。" },
      { sender: "西蓝花", body: "我跟妳說，當下真的差點翻白眼翻到後腦勺！" },
    ]},
    { id: "chat-food", label: "你先陪我聊聊天，我现在心里乱乱的", nextStage: 0, lines: [
      { sender: "我", body: "妳先陪我聊聊天嘛，我現在心裡亂亂的，想轉移一下注意力。" },
      { sender: "西蓝花", body: "好啦好啦，我在！那妳今天有沒有好好吃飯？" },
      { sender: "西蓝花", body: "不要又跟我說忙到忘記吃，妳每次都這樣。" },
      { sender: "西蓝花", body: "等一下先去弄點東西吃，聽到沒有！" },
    ]},
  ],
  11: [
    { id: "go-back", label: "不行，我还是放心不下，我想回去看看它", nextStage: 5, lines: [
      { sender: "我", body: "不行……我還是放心不下。牠那麼小一隻，我真的沒辦法當作沒看見，我回去看看。" },
      { sender: "西蓝花", body: "我就知道妳一定會回去啦！慢慢走，注意安全。" },
    ]},
    { id: "return-anyway", label: "我想了一路，还是决定回头找它", nextStage: 5, lines: [
      { sender: "我", body: "我本來想回家了，可是越走越不對勁……我還是回頭找牠好了。" },
      { sender: "西蓝花", body: "去吧去吧，但不要跑，注意車！" },
    ]},
  ],
  12: [
    { id: "finally-in-carrier", label: "好不容易把它安抚下来，终于进外出笼了", nextStage: 30, lines: [
      { sender: "我", body: "好不容易！牠終於安靜下來，也順利進外出籠了，我現在準備帶牠去醫院。" },
      { sender: "西蓝花", body: "太好了！妳先確認外出籠有關好，路上小心……妳到醫院了嗎？" },
    ]},
    { id: "staff-helped-carrier", label: "刚刚请附近的人帮忙，已经安全放进外出笼", nextStage: 30, lines: [
      { sender: "我", body: "剛剛請旁邊的人幫忙，終於安全把牠放進外出籠了，現在要出發去醫院。" },
      { sender: "西蓝花", body: "呼……那我放心一點了！記得把外出籠固定好，妳到醫院了嗎？" },
    ]},
  ],
  4: [
    { id: "tag-check", label: "我把牌子拍給你看了，真的是温尚翊", nextStage: 5, lines: [
      { sender: "我", body: "医生刚刚看了它脖子上的挂牌，上面清清楚楚写着主人：温尚翊。" },
      { sender: "西蓝花", body: "等一下……你说的是温尚翊？？？不会吧？？？" },
      { sender: "我", body: "真的！医生说牌子上留了联络电话，我现在脑袋一片空白。" },
      { sender: "西蓝花", body: "先把照片传給我！我确认一下……天啊，真的是这三个字欸！" },
    ]},
    { id: "check-name-again", label: "我再确认一下挂牌和联络方式，免得认错人", nextStage: 5, lines: [
      { sender: "我", body: "我再仔細確認一下挂牌和聯絡方式，免得真的認錯人。" },
      { sender: "西蓝花", body: "對，先確認清楚比較好！不過這名字真的太巧了啦。" },
    ]},
  ],
  5: [
    { id: "same-name", label: "我也觉得可能是重名，但还是好不真实……", nextStage: 6, lines: [
      { sender: "我", body: "可是这个名字也太巧了吧，我现在还是觉得很不真实。" },
      { sender: "西蓝花", body: "名字一样不代表就是本人啦，先不要自己吓自己。" },
      { sender: "我", body: "我知道啊，但如果真的是他呢？" },
      { sender: "西蓝花", body: "我也觉得很离谱……算了不管了，可能是重名吧！主人肯定等得很着急，先打电话过去问问啦。" },
    ]},
    { id: "maybe-him", label: "你说会不会真的是他啊……", nextStage: 6, lines: [
      { sender: "我", body: "你说……会不会真的是他啊？" },
      { sender: "西蓝花", body: "温尚翊？？啊？？啊？？？我真的要疯了！" },
      { sender: "我", body: "五月天那个温尚翊欸！！！" },
      { sender: "西蓝花", body: "我知道我知道！可是也可能只是同名啦……先打电话确认，拜托你冷静一点哈哈哈。" },
    ]},
  ],
  6: [
    { id: "call-owner", label: "行……我现在打电话过去问问。", nextStage: 7, lines: [
      { sender: "我", body: "行……我现在打过去问问。" },
      { sender: "我", body: "我打了……一直响，没有人接。" },
      { sender: "西蓝花", body: "电话打不通啊？要不试试看能不能透过微信号加好友？" },
      { sender: "我", body: "好像可以试试看，我看看牌子上有没有其他资料。" },
    ]},
    { id: "send-message-first", label: "我先不一直打电话，试着发条消息确认", nextStage: 7, lines: [
      { sender: "我", body: "我先不一直打電話了，試著用其他方式聯絡看看。" },
      { sender: "西蓝花", body: "可以啊，先簡單說明情況就好，別太緊張！" },
    ]},
  ],
  7: [
    { id: "try-wechat", label: "好，我试试看用这个微信号加好友。", nextStage: 8, lines: [
      { sender: "我", body: "好，我试试看用这个微信号加好友。" },
      { sender: "西蓝花", body: "嗯嗯！先确认是不是本人，别一上来就把自己吓到。" },
      { sender: "我", body: "我去微信看看……" },
    ]},
    { id: "check-contact-card", label: "我再看看挂牌上有没有其他联系方式", nextStage: 8, lines: [
      { sender: "我", body: "我再看看挂牌上有沒有其他聯絡方式，確認一下資料。" },
      { sender: "西蓝花", body: "好，慢慢找！有找到就先核對清楚再聯絡。" },
    ]},
  ],
  9: [
    { id: "monster-prank", label: "我是你爸爸", nextStage: 17, branch: "monster-prank", lines: [
      { sender: "我", body: "我是你爸爸。" },
      { sender: "大G", body: "……蛤？" },
      { sender: "大G", body: "妳哪位？我不認識妳喔。" },
      { sender: "大G", body: "好喔，那我先把妳刪掉了。掰。" },
    ]},
    { id: "monster-cat-intro", label: "你好，我捡到了一只小黑猫……", nextStage: 20, branch: "monster-cat", lines: [
      { sender: "我", body: "你好，我捡到了一只小黑猫。它脖子上挂着挂牌，上面有你的联系方式，我就照着上面的微信号加你了。" },
      { sender: "大G", body: "啊？小黑貓？妳在哪裡看到牠的？我這幾天都不在家，真的不知道牠什麼時候跑出去的……牠還好嗎？有沒有受傷？" },
      { sender: "我", body: "我刚刚已经带它去医院检查过了，医生说它很健康，没有受伤，你放心。" },
      { sender: "大G", body: "那就好……真的嚇到我了。牠平常很黏人，可能趁家裡沒人就偷偷溜出去了。" },
      { sender: "大G", body: "妳先別緊張，牠有沒有一直叫？還是看到妳就自己跑過去？" },
    ]},
  ],
  13: [],
  17: [
    { id: "prank-apology", label: "对不起我发错人了啊啊啊！", nextStage: 13, branch: "monster-prank", lines: [
      { sender: "我", body: "對不起我發錯人了啊啊啊！！！" },
    ]},
    { id: "prank-explain", label: "等等等等！我刚刚开玩笑的！", nextStage: 13, branch: "monster-prank", lines: [
      { sender: "我", body: "等等等等！我剛剛開玩笑的啦！！！" },
    ]},
  ],
  14: [
    { id: "monster-apology-legacy", label: "对不起我开玩笑的……我是真的捡到你的猫了", nextStage: 20, branch: "monster-cat", lines: [
      { sender: "我", body: "對不起，剛剛那句真的發錯了……我不是故意鬧你的。" },
      { sender: "我", body: "其實是因為我撿到一隻小黑貓，牠身上的牌子留了你的微信號，我才加你的。" },
      { sender: "大G", body: "蛤？小黑貓？妳在哪裡看到牠的？牠現在還好嗎？" },
    ]},
    { id: "apologize-and-explain", label: "真的对不起，我是捡到小猫才加你的", nextStage: 20, branch: "monster-cat", lines: [
      { sender: "我", body: "真的對不起，我不是故意鬧你的……我是撿到一隻小黑貓，看到牌子才聯絡你。" },
      { sender: "大G", body: "喔，原來是這樣……那小黑貓現在在哪裡？有沒有受傷？" },
    ]},
  ],
  16: [
    { id: "monster-apology-after-prank", label: "对不起，刚刚发错人了……", nextStage: 18, branch: "monster-prank", lines: [
      { sender: "我", body: "對不起，剛剛那句發錯人了啦……我不是故意要鬧你的。" },
      { sender: "大G", body: "我說呢，怎麼有人一上來就說奇奇怪怪的話，原來是這樣喔……" },
      { sender: "大G", body: "所以妳找我有事嗎？" },
    ]},
    { id: "monster-apology-explain", label: "真的对不起！刚刚是我发错了", nextStage: 18, branch: "monster-prank", lines: [
      { sender: "我", body: "真的對不起！剛剛只是想開個玩笑，沒想到你真的把我刪掉了。" },
      { sender: "大G", body: "我說呢，怎麼有人一上來就說奇奇怪怪的話，原來是這樣喔……" },
      { sender: "大G", body: "所以妳找我有事嗎？" },
    ]},
  ],
  18: [
    { id: "monster-found-cat", label: "我捡到你的猫了！", nextStage: 20, branch: "monster-cat", lines: [
      { sender: "我", body: "其實我是撿到你的貓了！牠脖子上的牌子有你的微信號，所以我才聯絡你。" },
      { sender: "大G", body: "夭壽！牠什麼時候跑出去的？！我完全不知道……牠現在還好嗎？有沒有受傷？" },
    ]},
    { id: "monster-found-cat-explain", label: "我是在路边捡到一只小黑猫，看到挂牌才联系你的", nextStage: 20, branch: "monster-cat", lines: [
      { sender: "我", body: "我在路邊撿到一隻小黑貓，看到牠脖子上的牌子有你的微信號，才知道是你的貓。" },
      { sender: "大G", body: "夭壽！牠怎麼會自己跑出去啦？我真的完全不知道……牠有沒有受傷？" },
    ]},
  ],
  20: [
    { id: "cat-temperament", label: "它很乖，一直窝在我怀里，也没有乱跑", nextStage: 21, lines: [
      { sender: "我", body: "它很乖，一直窝在我怀里，也没有乱跑，看起来还挺亲人的。" },
      { sender: "大G", body: "那就好，牠從小就不太怕生啦。只是有時候好奇心很重，門一開就想往外跑。" },
      { sender: "我", body: "难怪会自己跑出去，幸好这次遇到我了。" },
      { sender: "大G", body: "真的要謝謝妳欸，不然我回家才發現牠不見，一定會急死。" },
    ]},
    { id: "verify-owner-name", label: "你叫什么名字？我想核对一下和名牌上的名字对不对", nextStage: 21, lines: [
      { sender: "我", body: "對了，你叫什麼名字？我想核對一下，看看是不是跟牠名牌上的名字對得上。" },
      { sender: "大G", body: "我叫溫尚翊。這幾天都在外地，完全不知道牠會自己從家裡跑出去……也是剛剛才知道牠不見了。" },
      { sender: "我", body: "好，名牌上確實是這個名字，應該沒有找錯人。" },
      { sender: "大G", body: "嗯，那就沒錯了。真的謝謝妳特地聯絡我。" },
    ]},
  ],
  21: [
    { id: "ask-return", label: "那你什么时候方便回来接它呀？", nextStage: 22, lines: [
      { sender: "我", body: "那你什麼時候方便回來接牠呀？我可以先幫你照看，不過想先知道你大概什麼時候回來。" },
      { sender: "大G", body: "我這幾天都不在家，人在外地還有事情要處理，暫時沒辦法回去接牠。原本真的不知道牠自己跑出門了……" },
    ]},
    { id: "offer-care", label: "要不我先帮你照顾它几天，等你回来再接走？", nextStage: 22, lines: [
      { sender: "我", body: "要不我先帮你照顾它几天吧，等你回来再接走就好。" },
      { sender: "大G", body: "這樣真的可以嗎？我這幾天都在外地，根本不知道牠從家裡跑出去了，還好妳先發現牠。" },
      { sender: "我", body: "可以呀，反正它现在也在我这里，我会照顾好它的。" },
      { sender: "大G", body: "那我真的欠妳一個人情了……" },
    ]},
  ],
  22: [
    { id: "offer-care-first", label: "那我先帮你照顾它几天，等你回来再接它？", nextStage: 23, lines: [
      { sender: "我", body: "那要不我先幫你照顧牠幾天？等你忙完回來，再過來接牠就好。" },
      { sender: "大G", body: "真的可以嗎？那就太麻煩妳了……我這幾天都不在家，最放心不下的就是牠。" },
      { sender: "我", body: "沒關係啦，牠現在在我這裡，我會先照顧好牠，你不用太擔心。" },
      { sender: "大G", body: "謝謝妳，真的幫了我大忙。等我回去再好好謝謝妳。" },
    ]},
    { id: "offer-care-with-details", label: "我可以帮忙照顾几天，你把注意事项告诉我就好", nextStage: 23, lines: [
      { sender: "我", body: "我可以先幫你照顧幾天，你把牠平常的習慣和要注意的事情告訴我就好。" },
      { sender: "大G", body: "好，真的謝謝妳。我這幾天都不在家，還好牠遇到妳。牠的飼料跟習慣我晚點整理給妳。" },
      { sender: "我", body: "好呀，你慢慢整理，不用急，我先讓牠安心待著。" },
    ]},
  ],
  23: [
    { id: "ask-kitten-name-after-care", label: "对了，这只猫叫什么名字呀？", nextStage: 27, lines: [
      { sender: "我", body: "對了，聊了半天我還不知道牠叫什麼名字呢？這隻貓叫什麼呀？" },
      { sender: "大G", body: "牠叫玩玩。" },
    ]},
    { id: "ask-name-and-habits", label: "它叫什么名字？平常有什么特别习惯吗？", nextStage: 27, lines: [
      { sender: "我", body: "那牠叫什麼名字呀？平常有沒有什麼特別的習慣？" },
      { sender: "大G", body: "牠叫玩玩啦，平常很愛玩，也很黏人。" },
    ]},
  ],
  24: [
    { id: "prepare-space", label: "我先给它准备一个安静的小空间", nextStage: 25, lines: [
      { sender: "我", body: "好，我先给它准备一个安静的小空间，食物、水和猫砂都分开放好。" },
      { sender: "大G", body: "這樣最好，先讓牠慢慢適應。真的很謝謝妳，連這些都幫我想到。" },
      { sender: "我", body: "没事啦，它现在在我这里，我会照顾好它的。" },
    ]},
    { id: "send-photo", label: "等它安顿好了，我拍张照片给你", nextStage: 25, lines: [
      { sender: "我", body: "等它安顿好了，我拍张照片给你看，你也能放心一点。" },
      { sender: "大G", body: "好啊，我也想看看牠現在的樣子。麻煩妳了，記得先讓牠休息，不要為了拍照嚇到牠。" },
      { sender: "我", body: "知道啦，我会等它自己放松下来。" },
    ]},
  ],
  25: [
    { id: "tease-owner", label: "那你回来记得请我吃饭，算是小猫的感谢费", nextStage: 85, lines: [
      { sender: "我", body: "那你回來記得請我吃飯，算是小貓的感謝費！", thread: "大G" },
      { sender: "大G", body: "哈哈，可以啊！等我回去請妳吃飯，妳想吃什麼再跟我說。", thread: "大G" },
    ]},
  ],
  85: [
    { id: "playful-dinner-refusal", label: "欸欸，我刚刚开玩笑的啦！真的不用这么麻烦。", nextStage: 86, lines: [
      { sender: "我", body: "欸欸，我剛剛開玩笑的啦！真的不用這麼麻煩。", thread: "大G" },
      { sender: "大G", body: "沒關係啊，請妳吃頓飯而已，不麻煩啦。", thread: "大G" },
    ]},
  ],
  86: [
    { id: "big-appetite-joke", label: "不行不行，我饭量很大的欸！你到时候不要后悔喔。", nextStage: 87, lines: [
      { sender: "我", body: "不行不行，我飯量很大的欸！你到時候不要後悔喔。", thread: "大G" },
      { sender: "大G", body: "哈哈哈哈，沒關係啦，吃得多才好啊！", thread: "大G" },
    ]},
  ],
  87: [
    { id: "wait-until-return", label: "那我还是先好好照顾玩玩，等你回来再说好了。", nextStage: 59, lines: [
      { sender: "我", body: "那我還是先好好照顧玩玩，等你回來再說好了。", thread: "大G" },
      { sender: "大G", body: "好，就這麼說定。這幾天先麻煩妳照顧玩玩了。", thread: "大G" },
      { sender: "大G", body: "對了，我把玩玩平常的照顧方式整理給妳，妳先看看，有不清楚的再問我。", thread: "大G" },
      { sender: "大G", body: "【玩玩照顧小指南】\n1. 吃飯：平常吃固定的乾糧，早晚各一餐，先照原本份量，不要突然換新食物。\n2. 喝水：每天換乾淨的水，水碗放在牠容易找到的地方。\n3. 零食：先不要餵人吃的東西，零食也別一次給太多。\n4. 貓砂：牠習慣在安靜的位置上廁所，記得每天清理。\n5. 休息：剛換環境可能會躲起來，讓牠自己慢慢熟悉，不用一直抱牠。\n6. 個性：玩玩很愛玩，也很黏人，熟了會自己跑來蹭妳。\n如果食慾、精神或排泄有明顯異常，先跟我說，也麻煩請醫生看看。", thread: "大G" },
    ]},
  ],
  26: [
    { id: "finish-care-checkin", label: "好，那你先忙，有情况我再联系你", nextStage: 36, lines: [
      { sender: "我", body: "好，那你先忙，有情況我再聯絡你。玩玩這邊我會照顧好的。" },
      { sender: "大G", body: "好，真的謝謝妳。等我忙完回去就去接牠，這幾天就先麻煩妳了。" },
    ]},
    { id: "send-photo-later", label: "我晚点拍张玩玩的照片给你，让你安心", nextStage: 36, lines: [
      { sender: "我", body: "等牠安頓好，我晚點拍張照片給你，讓你放心一點。" },
      { sender: "大G", body: "好啊，謝謝妳。先讓牠休息，不用急著拍，別嚇到牠。" },
    ]},
  ],
  27: [
    { id: "recognize-wanwan", label: "玩玩……？我靠！", nextStage: 53, lines: [
      { sender: "我", body: "玩玩……？我靠！", thread: "大G" },
      { sender: "大G", body: "妳？？？怎麼啦？", thread: "大G" },
    ]},
    { id: "ask-name-again", label: "等一下……你刚刚说它叫玩玩？", nextStage: 53, lines: [
      { sender: "我", body: "等一下……你剛剛說牠叫玩玩？", thread: "大G" },
      { sender: "大G", body: "對啊，牠叫玩玩。怎麼了嗎？", thread: "大G" },
    ]},
  ],
  53: [
    { id: "say-name-is-perfect", label: "没事没事，我就是觉得这个名字太好了哈哈哈", nextStage: 32, lines: [
      { sender: "我", body: "沒事沒事，我就是覺得這個名字太好了哈哈哈！", thread: "大G" },
      { sender: "大G", body: "哈哈，原來是這樣。牠的名字跟牠的個性真的很搭。", thread: "大G" },
      { sender: "我", body: "對呀！我前面找牠找了半天，怎麼找都找不到，沒想到牠居然自己跑到我這邊來了！", thread: "大G" },
    ]},
    { id: "say-name-is-cute-to-owner", label: "我只是觉得玩玩这个名字也太可爱了", nextStage: 32, lines: [
      { sender: "我", body: "我只是覺得玩玩這個名字也太可愛了！", thread: "大G" },
      { sender: "大G", body: "哈哈，牠從小就很愛玩，家裡就一直這樣叫牠。", thread: "大G" },
      { sender: "我", body: "對呀！我前面抓牠的時候怎麼找都找不到，真的沒想到牠叫玩玩！", thread: "大G" },
    ]},
  ],
  41: [
    { id: "is-it-monster", label: "对啊……五月天那个怪兽，温尚翊？？？", nextStage: 42, lines: [
      { sender: "我", body: "對啊……五月天那個怪獸，溫尚翊？？？", thread: "西蓝花" },
      { sender: "西蓝花", body: "怪獸？？？？啊？？？？是那個怪獸嗎？？？妳確定不是我看錯字？？？", thread: "西蓝花" },
    ]},
    { id: "maybe-same-name", label: "我也不敢相信，会不会只是刚好同名？", nextStage: 42, lines: [
      { sender: "我", body: "我也不敢相信……會不會只是剛好同名啊？", thread: "西蓝花" },
      { sender: "西蓝花", body: "可是溫尚翊這三個字也太巧了吧……但、但也不是完全沒可能啦！", thread: "西蓝花" },
    ]},
  ],
  32: [
    { id: "shock-same-cat-name", label: "我靠我靠！！！牠叫玩玩？？？", nextStage: 33, lines: [
      { sender: "我", body: "我靠我靠！！！牠叫玩玩？？？", thread: "西蓝花" },
      { sender: "西蓝花", body: "蛤？？？玩玩？？？跟怪獸家那隻貓同一個名字？？？等一下，妳剛剛說名牌上的主人叫什麼？溫尚翊？？？", thread: "西蓝花" },
    ]},
    { id: "shock-owner-and-cat-names", label: "等等！！！猫叫玩玩，主人还叫温尚翊？？？", nextStage: 33, lines: [
      { sender: "我", body: "等等！！！牠叫玩玩，主人還叫溫尚翊？？？這也太巧了吧！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "不是吧？？？玩玩是怪獸家貓咪的名字，溫尚翊又是怪獸本名欸！妳撿到的該不會真的是他家的貓吧？？？", thread: "西蓝花" },
    ]},
  ],
  33: [
    { id: "insist-same-name", label: "可、可能……可能只是重名！", nextStage: 37, lines: [
      { sender: "我", body: "可、可能……可能只是重名！世界上同名同姓、同名的貓也不是不可能嘛！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳拉倒吧！主人名字跟寵物名字都重合嗎？妳怎麼不說明天地球毀滅呢？", thread: "西蓝花" },
    ]},
    { id: "try-to-explain-coincidence", label: "也、也不是不可能吧？你先别激动！", nextStage: 37, lines: [
      { sender: "我", body: "也、也不是不可能吧？妳先別激動啦！說不定真的只是剛好撞名啊！", thread: "西蓝花" },
      { sender: "西蓝花", body: "……妳自己聽聽看這合理嗎？連貓的名字都一樣，主人還剛好叫溫尚翊？", thread: "西蓝花" },
    ]},
  ],
  37: [
    { id: "double-down-coincidence", label: "我觉得也不是不可能嘛……真的有这么巧吧！", nextStage: 38, lines: [
      { sender: "我", body: "我覺得也不是不可能嘛……真的有這麼巧吧！", thread: "西蓝花" },
      { sender: "西蓝花", body: "……我真的不知道該怎麼吐槽妳。好啦，先不跟妳爭，妳現在是在醫院對不對？", thread: "西蓝花" },
      { sender: "我", body: "對啊，我還在等醫生確認玩玩的狀況。", thread: "西蓝花" },
      { sender: "西蓝花", body: "那先顧好玩玩啦！不管主人是不是怪獸，牠現在需要妳。等一下妳再想想要怎麼跟那個失主聊。", thread: "西蓝花" },
    ]},
    { id: "admit-too-coincidental", label: "好啦……我也觉得巧得有点离谱", nextStage: 38, lines: [
      { sender: "我", body: "好啦……我也覺得巧得有點離譜，我現在腦袋整個亂掉。", thread: "西蓝花" },
      { sender: "西蓝花", body: "這才正常！妳剛剛還硬要說重名，真的快被妳笑死。", thread: "西蓝花" },
      { sender: "我", body: "我只是還不敢相信嘛……先讓我冷靜一下。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦，深呼吸。先把玩玩照顧好，之後再跟大G確認清楚。", thread: "西蓝花" },
    ]},
  ],
  93: [
    { id: "tell-broccoli-shaking", label: "我现在整个人都在抖，我真的不敢相信欸！我只是出门捡到一只猫，怎么会直接捡到怪兽家的猫啦！！", nextStage: 92, lines: [
      { sender: "我", body: "我現在整個人都在抖，我真的不敢相信欸！我只是出門撿到一隻貓，怎麼會直接撿到怪獸家的貓啦！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "先讓我尖叫三秒！！！但妳先深呼吸，別嚇到玩玩啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "先等等！！！妳先不要一激動就全招了啦！他現在還不知道妳認出他了吧？", thread: "西蓝花" },
    ]},
    { id: "tell-broccoli-still-shocked", label: "我真的不敢相信，怎么会这么巧啦！", nextStage: 92, lines: [
      { sender: "我", body: "我真的不敢相信欸！我只是出門撿到一隻貓，怎麼會遇到怪獸家的玩玩啦！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "先讓我尖叫三秒！！！但妳先深呼吸，別嚇到玩玩啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "先等等！！！妳先不要一激動就全招了啦！他現在還不知道妳認出他了吧？", thread: "西蓝花" },
    ]},
  ],
  94: [
    { id: "broccoli-signature-first-round", label: "啊啊啊我先想办法！但我还没见到本人呢！", nextStage: 95, lines: [
      { sender: "我", body: "啊啊啊妳先冷靜啦！我現在連人都還沒見到，哪有那麼快拿到簽名啦哈哈哈哈！", thread: "西蓝花" },
      { sender: "西蓝花", body: "我不管啦！！！先幫我問問看嘛！如果真的可以，拜託一定要幫我簽名！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "最好寫我的名字！我想拿去跟大家炫耀，這可是怪獸本人欸！！！", thread: "西蓝花" },
    ]},
    { id: "broccoli-signature-tease", label: "你怎么比我还激动啦哈哈哈哈！", nextStage: 95, lines: [
      { sender: "我", body: "妳怎麼比我還激動啦哈哈哈哈！我自己都還在狀況外欸！", thread: "西蓝花" },
      { sender: "西蓝花", body: "這能不激動嗎！！！妳這根本是偶像劇等級的奇遇欸！簽名一定要幫我問！！！", thread: "西蓝花" },
    ]},
  ],
  95: [
    { id: "broccoli-signature-promise", label: "好啦好啦，有机会我一定帮你问！", nextStage: 96, lines: [
      { sender: "我", body: "好啦好啦，如果真的有機會我一定幫妳問！但妳先不要給我壓力啦哈哈哈！", thread: "西蓝花" },
      { sender: "西蓝花", body: "成交！！！我已經開始想像拿到簽名的樣子了，嗚嗚嗚我姐妹發達了！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "而且妳們見面吃飯的時候要記得自然一點，千萬不要緊張到講不出話喔！", thread: "西蓝花" },
    ]},
    { id: "broccoli-signature-laugh", label: "等我真的见到他再说啦！", nextStage: 96, lines: [
      { sender: "我", body: "等我真的見到他再說啦！妳現在幻想得也太遠了吧哈哈哈哈！", thread: "西蓝花" },
      { sender: "西蓝花", body: "我這叫未雨綢繆！！！簽名、見面、吃飯，妳一樣都不准漏掉細節！", thread: "西蓝花" },
    ]},
  ],
  96: [
    { id: "broccoli-return-date-question", label: "好啦我记住了！到时候回来跟你报告！", nextStage: 90, lines: [
      { sender: "我", body: "好啦我記住了！到時候有什麼進展一定第一時間跟妳報告啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "說好了喔！！！欸對了，差點忘記問，怪獸到底什麼時候回來啊？", thread: "西蓝花" },
    ]},
    { id: "broccoli-return-date-tease", label: "你比我还期待吧哈哈哈哈！", nextStage: 90, lines: [
      { sender: "我", body: "妳真的比我還期待欸哈哈哈哈！", thread: "西蓝花" },
      { sender: "西蓝花", body: "那當然！！！但認真問啦，他什麼時候回來？妳有問到歸期嗎？", thread: "西蓝花" },
    ]},
  ],
  92: [
    { id: "explain-still-just-the-cat-finder", label: "对啊，他应该还以为我只是捡到猫、照着名牌联系他的路人而已……", nextStage: 39, lines: [
      { sender: "我", body: "對啊，他應該還以為我只是撿到貓、照著名牌聯絡他的路人而已……", thread: "西蓝花" },
      { sender: "西蓝花", body: "那就先自然一點啊！先把玩玩照顧好，等他回來接貓再看情況。這種事慢慢來比較有趣！", thread: "西蓝花" },
    ]},
    { id: "promise-not-to-reveal", label: "放心啦！我不会说破的，就先正常跟他聊玩玩的事", nextStage: 39, lines: [
      { sender: "我", body: "放心啦！我不會說破的，就先正常跟他聊玩玩的事情。", thread: "西蓝花" },
      { sender: "西蓝花", body: "對嘛！先自然一點，把玩玩照顧好，等他回來接貓再慢慢看情況就好！", thread: "西蓝花" },
    ]},
  ],
  38: [
    { id: "notice-traditional-typing", label: "等等！我突然想起来，那个人打字一直是繁体字！", nextStage: 93, lines: [
      { sender: "我", body: "等等等等！我突然想起来一件事！那个人刚刚回我的消息一直都是繁体字欸！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳現在才想到喔？？？他就是五月天的怪獸本人啊！台灣人打繁體字很正常吧！名字、貓咪名字都對上了，妳還要硬說是重名是不是啦！", thread: "西蓝花" },
    ]},
    { id: "keep-natural", label: "好，我先不说破，正常跟他聊玩玩的事", nextStage: 39, lines: [
      { sender: "我", body: "對啊，他應該還以為我只是撿到貓、照著名牌聯絡他的路人而已……", thread: "西蓝花" },
      { sender: "西蓝花", body: "那就先自然一點啊！先把玩玩照顧好，等他回來接貓再看情況。這種事慢慢來比較有趣！", thread: "西蓝花" },
      { sender: "西蓝花", body: "對！就當作普通失主聯絡，別突然把人家嚇到。妳有新消息一定要第一時間跟我說！", thread: "西蓝花" },
      { sender: "我", body: "知道啦！我先回去看看玩玩，晚點再跟你說。", thread: "西蓝花" },
      { sender: "西蓝花", body: "快去快去！替我摸摸玩玩，啊不對，先確認牠願不願意給妳摸，哈哈哈哈！", thread: "西蓝花" },
    ]},
  ],
  39: [
    { id: "return-to-dag-after-reveal", label: "我先回去跟大G说玩玩现在很安全", nextStage: 40, lines: [
      { sender: "我", body: "我先回去跟大G說玩玩現在很安全，不能讓他太擔心。" , thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦快去！記得妳答應我要回來報告後續喔，我還等著聽呢！" , thread: "西蓝花" },
    ]},
    { id: "go-check-cat", label: "我先去看看玩玩，晚点再回来跟你说", nextStage: 40, lines: [
      { sender: "我", body: "我先去看看玩玩，晚點再回來跟妳說後續！", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦快去！記得照顧好牠，我等妳消息！", thread: "西蓝花" },
    ]},
  ],
  40: [
    { id: "return-to-owner-calmly", label: "我回去跟大G说：不好意思，刚刚有点激动", nextStage: 35, branch: "monster-cat", lines: [
      { sender: "我", body: "不好意思，剛剛有點激動，因為玩玩這個名字真的很可愛。", thread: "大G" },
      { sender: "大G", body: "哈哈，沒關係啦！牠平常就很有存在感，名字也跟牠很搭。", thread: "大G" },
    ]},
    { id: "ask-owner-about-name", label: "我再问大G：玩玩这个名字有什么由来吗？", nextStage: 35, branch: "monster-cat", lines: [
      { sender: "我", body: "對了，玩玩這個名字有什麼由來嗎？聽起來很可愛。", thread: "大G" },
      { sender: "大G", body: "因為牠從小就閒不下來，整天跑來跑去，家裡就一直叫牠玩玩了。", thread: "大G" },
    ]},
  ],
  42: [
    { id: "self-reassure-name", label: "先冷静，可能只是重名吧，哪有那么巧", nextStage: 43, lines: [
      { sender: "我", body: "先冷靜……可能只是重名吧，哪有那麼巧，對不對？", thread: "西蓝花" },
      { sender: "西蓝花", body: "也是啦……世界上同名同姓的人又不是沒有，哪有那麼巧真的遇到怪獸啦。", thread: "西蓝花" },
    ]},
    { id: "still-cant-believe", label: "可是我还是觉得太巧了，我现在手都在抖", nextStage: 43, lines: [
      { sender: "我", body: "可是我還是覺得太巧了……我現在手都在抖欸。", thread: "西蓝花" },
      { sender: "西蓝花", body: "我懂我懂！但先不要自己嚇自己，也可能只是同名啦……我們先確認本人比較實在。", thread: "西蓝花" },
    ]},
  ],
  43: [
    { id: "call-owner-now", label: "那我照名牌上的电话打过去确认一下", nextStage: 44, lines: [
      { sender: "我", body: "那我照名牌上的電話打過去確認一下好了……", thread: "西蓝花" },
      { sender: "西蓝花", body: "對對對！先打電話確認，妳不要一接通就太激動喔！", thread: "西蓝花" },
    ]},
    { id: "hesitate-before-call", label: "我有点不敢打……你陪我一起确认好不好", nextStage: 44, lines: [
      { sender: "我", body: "我有點不敢打欸……妳陪我一起確認好不好？", thread: "西蓝花" },
      { sender: "西蓝花", body: "我陪妳！快打快打，我也好想知道到底是不是本人！", thread: "西蓝花" },
    ]},
  ],
  34: [
    { id: "back-to-owner", label: "我先回去跟大G说玩玩现在很安全", nextStage: 35, branch: "monster-cat", lines: [
      { sender: "我", body: "我先回去跟大G說玩玩現在很安全，不能讓他太擔心。" , thread: "大G" },
      { sender: "西蓝花", body: "好啦，快去！記得有新消息再回來跟我說，我要聽後續！" , thread: "西蓝花" },
    ]},
    { id: "promise-message", label: "有新消息我一定第一时间告诉你", nextStage: 35, branch: "monster-cat", lines: [
      { sender: "我", body: "有新消息我一定第一時間告訴你，你先不用太擔心。", thread: "大G" },
      { sender: "西蓝花", body: "好！妳先去忙吧，記得有消息回來跟我說。", thread: "西蓝花" },
    ]},
  ],
  35: [
    { id: "tell-owner-safe", label: "玩玩现在很安全，我会先照顾好它", nextStage: 24, branch: "monster-cat", lines: [
      { sender: "我", body: "玩玩現在很安全，我會先照顧好牠，你不用擔心。" , thread: "大G" },
      { sender: "大G", body: "那就好……真的謝謝妳。玩玩就先拜託妳了，等我回去再好好跟妳道謝。" , thread: "大G" },
    ]},
    { id: "reassure-owner-gently", label: "我会让它先好好休息，你放心忙自己的事", nextStage: 24, branch: "monster-cat", lines: [
      { sender: "我", body: "我會先讓玩玩好好休息，你放心忙自己的事，有狀況我會聯絡你。", thread: "大G" },
      { sender: "大G", body: "好，謝謝妳幫忙照顧牠，我放心多了。", thread: "大G" },
    ]},
  ],
  44: [
    { id: "call-no-answer", label: "打了……一直响，没有人接电话", nextStage: 45, lines: [
      { sender: "我", body: "我打了……電話一直響，可是沒有人接。", thread: "西蓝花" },
      { sender: "西蓝花", body: "欸？？沒人接喔？是不是人在忙？那名牌上有沒有微信號？要不要試著加微信看看？", thread: "西蓝花" },
    ]},
    { id: "call-unreachable", label: "电话好像打不通，暂时联系不上主人", nextStage: 45, lines: [
      { sender: "我", body: "電話好像打不通，暫時聯絡不上主人……", thread: "西蓝花" },
      { sender: "西蓝花", body: "怎麼會這樣！那看看名牌上有沒有微信號吧，試著加好友聯絡看看？", thread: "西蓝花" },
    ]},
  ],
  45: [
    { id: "add-wechat-owner", label: "有微信号！我现在试着添加好友", nextStage: 8, lines: [
      { sender: "我", body: "有微信號！我現在試著添加好友看看。", thread: "西蓝花" },
      { sender: "西蓝花", body: "快去快去！但先不要把自己嚇到，等對方回覆再確認是不是本人！", thread: "西蓝花" },
    ]},
    { id: "check-wechat-id", label: "我再确认一下微信号，怕自己看错", nextStage: 8, lines: [
      { sender: "我", body: "我再確認一下微信號，怕自己太緊張看錯了……", thread: "西蓝花" },
      { sender: "西蓝花", body: "好，慢慢看清楚！確認沒錯再加，這件事真的太不可思議了。", thread: "西蓝花" },
    ]},
  ],
  46: [
    { id: "sudden-exclamation", label: "！！！！！！", nextStage: 47, lines: [
      { sender: "我", body: "！！！！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "？？？？怎麼了怎麼了？？妳怎麼突然發這麼多驚嘆號？？？", thread: "西蓝花" },
    ]},
    { id: "doctor-has-tag", label: "等一下！！！医生刚刚拿着它的名牌过来了……", nextStage: 47, lines: [
      { sender: "我", body: "等一下！！！醫生剛剛拿著牠的名牌過來了……", thread: "西蓝花" },
      { sender: "西蓝花", body: "名牌？上面寫了什麼？妳怎麼這麼激動？？", thread: "西蓝花" },
    ]},
  ],
  47: [
    { id: "reveal-owner-name", label: "医生说……主人名字叫温尚翊？？？？？", nextStage: 48, lines: [
      { sender: "我", body: "醫生說……名牌上的主人名字叫溫尚翊？？？？？", thread: "西蓝花" },
      { sender: "西蓝花", body: "溫尚翊？？？？等一下！！！！妳說的是溫尚翊？？？", thread: "西蓝花" },
    ]},
    { id: "show-tag-details", label: "名牌上写着温尚翊，还有一组联络电话", nextStage: 48, lines: [
      { sender: "我", body: "名牌上寫著溫尚翊，下面還有一組聯絡電話……", thread: "西蓝花" },
      { sender: "西蓝花", body: "溫尚翊？？？？這名字怎麼這麼耳熟……妳等一下！", thread: "西蓝花" },
    ]},
  ],
  48: [
    { id: "yes-mayday-monster", label: "对啊……五月天那个怪兽，温尚翊？？？", nextStage: 49, lines: [
      { sender: "我", body: "對啊……五月天那個怪獸，溫尚翊？？？", thread: "西蓝花" },
      { sender: "西蓝花", body: "怪獸？？？？啊？？？？是五月天那個怪獸？？？真的假的！！！", thread: "西蓝花" },
    ]},
    { id: "ask-if-same-person", label: "我也不敢相信，会不会只是刚好同名？", nextStage: 49, lines: [
      { sender: "我", body: "我也不敢相信……會不會只是剛好同名啊？", thread: "西蓝花" },
      { sender: "西蓝花", body: "可是溫尚翊這三個字也太巧了吧！！！妳先等等，我現在也好震驚！", thread: "西蓝花" },
    ]},
  ],
  49: [
    { id: "reassure-just-same-name", label: "先冷静，可能只是重名吧，哪有那么巧", nextStage: 50, lines: [
      { sender: "我", body: "先冷靜……可能只是重名吧，哪有那麼巧，對不對？", thread: "西蓝花" },
      { sender: "西蓝花", body: "也是啦……世界上同名同姓的人又不是沒有，哪有那麼巧真的遇到怪獸啦。", thread: "西蓝花" },
    ]},
    { id: "still-in-disbelief", label: "可是这也太巧了，我现在手都在抖", nextStage: 50, lines: [
      { sender: "我", body: "可是這也太巧了吧……我現在手都在抖欸。", thread: "西蓝花" },
      { sender: "西蓝花", body: "我懂我懂！先不要自己嚇自己，也可能只是同名啦，我們先確認本人比較實在。", thread: "西蓝花" },
    ]},
  ],
  50: [
    { id: "call-owner", label: "那我照名牌上的电话打过去确认一下", nextStage: 51, lines: [
      { sender: "我", body: "那我照名牌上的電話打過去確認一下好了……", thread: "西蓝花" },
      { sender: "西蓝花", body: "對對對！先打電話確認，妳不要一接通就太激動喔！", thread: "西蓝花" },
    ]},
    { id: "hesitate-call", label: "我有点不敢打……你陪我一起确认好不好", nextStage: 51, lines: [
      { sender: "我", body: "我有點不敢打欸……妳陪我一起確認好不好？", thread: "西蓝花" },
      { sender: "西蓝花", body: "我陪妳！快打快打，我也好想知道到底是不是本人！", thread: "西蓝花" },
    ]},
  ],
  51: [
    { id: "call-no-answer", label: "打了……一直响，没有人接电话", nextStage: 52, lines: [
      { sender: "我", body: "我打了……電話一直響，可是沒有人接。", thread: "西蓝花" },
      { sender: "西蓝花", body: "欸？？沒人接喔？是不是人在忙？那名牌上有沒有微信號？要不要試著加微信看看？", thread: "西蓝花" },
    ]},
    { id: "call-unreachable", label: "电话好像打不通，暂时联系不上主人", nextStage: 52, lines: [
      { sender: "我", body: "電話好像打不通，暫時聯絡不上主人……", thread: "西蓝花" },
      { sender: "西蓝花", body: "怎麼會這樣！那看看名牌上有沒有微信號吧，試著加好友聯絡看看？", thread: "西蓝花" },
    ]},
  ],
  52: [
    { id: "add-wechat-owner", label: "有微信号！我现在试着添加好友", nextStage: 8, lines: [
      { sender: "我", body: "有微信號！我現在試著添加好友看看。", thread: "西蓝花" },
      { sender: "西蓝花", body: "快去快去！先確認是不是本人，等對方回覆再說！", thread: "西蓝花" },
    ]},
    { id: "double-check-wechat", label: "我再确认一下微信号，怕自己看错", nextStage: 8, lines: [
      { sender: "我", body: "我再確認一下微信號，怕自己太緊張看錯了……", thread: "西蓝花" },
      { sender: "西蓝花", body: "好，慢慢看清楚！確認沒錯再加好友。", thread: "西蓝花" },
    ]},
  ],
  36: [
    { id: "ask-for-care-guide", label: "好呀！你整理一份发给我吧，我怕漏掉什么", nextStage: 54, lines: [
      { sender: "我", body: "好呀！你整理一份發給我吧，我怕自己漏掉什麼注意事項。", thread: "大G" },
      { sender: "大G", body: "好，我把玩玩平常吃的東西、份量和習慣整理一下，等一下傳給妳。", thread: "大G" },
      { sender: "大G", body: "【玩玩照顧小指南】\n1. 吃飯：平常吃固定的乾糧，早晚各一餐；先照平常份量，不要突然換新食物。\n2. 喝水：每天換乾淨的水，水碗放在牠容易找到的地方。\n3. 零食：先不要餵人吃的東西，也別一次給太多零食。\n4. 貓砂：牠習慣在安靜的位置上廁所，記得每天清一下。\n5. 休息：牠剛換環境可能會躲起來，讓牠自己慢慢熟悉，不用一直抱牠。\n6. 個性：玩玩很愛玩，也很黏人，熟了會自己跑來蹭妳。\n如果食慾、精神或排泄有明顯異常，先跟我說，也麻煩請醫生看看。", thread: "大G" },
    ]},
    { id: "ask-habits-first", label: "你先把平常吃什么、几点吃告诉我就好", nextStage: 54, lines: [
      { sender: "我", body: "你先把牠平常吃什麼、幾點吃告訴我就好，我照著做。", thread: "大G" },
      { sender: "大G", body: "好，我整理成一份簡單的照顧清單傳給妳，這樣比較不容易漏掉。", thread: "大G" },
      { sender: "大G", body: "【玩玩照顧小指南】\n早晚各吃一餐平常的乾糧，先維持原本份量；水每天換新。零食先少量，不要餵人吃的食物。貓砂放在安靜、固定的位置，每天清理。牠剛到新環境可能會躲一下，讓牠自己探索，不要勉強抱牠。玩玩很愛玩，熟悉之後會主動來找妳。若有食慾、精神或排泄異常，先聯絡我並請醫生確認。", thread: "大G" },
    ]},
  ],
  54: [
    { id: "wow-detailed-guide", label: "哇！好详细！你连这些都记得这么清楚啊", nextStage: 55, lines: [
      { sender: "我", body: "哇！好詳細！你連這些小細節都記得這麼清楚啊。", thread: "大G" },
      { sender: "大G", body: "哈哈，照顧牠久了就記得了。牠有些小習慣，換個地方可能會不太適應。", thread: "大G" },
    ]},
    { id: "thank-guide", label: "收到！有这份指南我就放心多了，谢谢你", nextStage: 55, lines: [
      { sender: "我", body: "收到！有這份指南我就放心多了，謝謝你整理得這麼仔細。", thread: "大G" },
      { sender: "大G", body: "不客氣啦，麻煩妳了。牠平常其實很好照顧，就是有點黏人。", thread: "大G" },
    ]},
  ],
  55: [
    { id: "ask-favorite-toy", label: "那它平常最喜欢玩什么？我找东西陪它玩", nextStage: 56, lines: [
      { sender: "我", body: "那牠平常最喜歡玩什麼？我找個東西陪牠玩。", thread: "大G" },
      { sender: "大G", body: "逗貓棒跟小球都可以，牠看到會追半天。不過剛到妳那邊，先讓牠休息，等牠主動想玩再陪牠。", thread: "大G" },
    ]},
    { id: "ask-if-cat-is-clingy", label: "难怪你说它很黏人，它会不会一直跟着人呀？", nextStage: 56, lines: [
      { sender: "我", body: "難怪你說牠很黏人，牠會不會一直跟著人呀？", thread: "大G" },
      { sender: "大G", body: "會喔，熟了之後妳走到哪牠可能就跟到哪，還會在旁邊喵喵叫。", thread: "大G" },
    ]},
  ],
  56: [
    { id: "promise-care-well", label: "哈哈哈，那我先努力跟它培养感情", nextStage: 61, lines: [
      { sender: "我", body: "哈哈哈，那我先努力跟牠培養感情，等牠願意親近我再說。", thread: "大G" },
      { sender: "大G", body: "慢慢來就好，不用急。牠很聰明，知道誰對牠好。這幾天真的要麻煩妳了。", thread: "大G" },
    ]},
    { id: "send-updates", label: "等它适应一点，我再拍照片给你看", nextStage: 61, lines: [
      { sender: "我", body: "等牠適應一點，我再拍照片給你看。", thread: "大G" },
      { sender: "大G", body: "好啊，等牠放鬆一點再拍就好，不用急。這幾天真的麻煩妳了。", thread: "大G" },
    ]},
  ],
  57: [],
  59: [
    { id: "wow-guide", label: "哇！好详细！你连这些小习惯都记得", nextStage: 60, lines: [
      { sender: "我", body: "哇！好詳細！你連這些小習慣都記得這麼清楚！", thread: "大G" },
      { sender: "大G", body: "哈哈，牠每天都在我旁邊晃來晃去，想不記得也難。牠有自己的小脾氣啦。", thread: "大G" },
    ]},
    { id: "thank-you-guide", label: "收到！有这份指南我就放心多了", nextStage: 60, lines: [
      { sender: "我", body: "收到！有這份指南我就放心多了，謝謝你整理得這麼仔細。", thread: "大G" },
      { sender: "大G", body: "不客氣，這幾天先麻煩妳照顧牠。有不確定的地方隨時問我。", thread: "大G" },
    ]},
  ],
  60: [
    { id: "ask-playthings", label: "它平常最喜欢玩什么？", nextStage: 61, lines: [
      { sender: "我", body: "牠平常最喜歡玩什麼？我找點東西陪牠。", thread: "大G" },
      { sender: "大G", body: "逗貓棒跟小球都可以，牠看到會追半天。不過剛換環境先讓牠休息，等牠主動想玩再陪牠。", thread: "大G" },
    ]},
    { id: "ask-personality", label: "它真的很黏人吗？会主动找人吗？", nextStage: 61, lines: [
      { sender: "我", body: "牠真的很黏人嗎？會主動跑來找人嗎？", thread: "大G" },
      { sender: "大G", body: "會喔，熟了之後妳走到哪牠可能就跟到哪，還會在旁邊喵喵叫。", thread: "大G" },
    ]},
  ],
  61: [
    { id: "promise-care", label: "好啦，我会好好照顾它的，你放心", nextStage: 82, lines: [
      { sender: "我", body: "好啦，我會好好照顧牠的，你放心。", thread: "大G" },
      { sender: "大G", body: "嗯，真的很謝謝妳。我這邊還有點事情要先處理，玩玩如果有什麼狀況，妳隨時傳訊息給我就好。", thread: "大G" },
      { sender: "大G", body: "只是我可能沒辦法馬上回覆，訊息看到我就會盡快回妳喔。", thread: "大G" },
    ]},
    { id: "send-cat-photo", label: "等它适应了我拍照片给你看", nextStage: 82, lines: [
      { sender: "我", body: "等牠適應了，我拍照片給你看。", thread: "大G" },
      { sender: "大G", body: "好啊，我很期待。真的謝謝妳。我這邊還有點事情要先處理，玩玩有什麼問題妳隨時找我就好。", thread: "大G" },
      { sender: "大G", body: "不過我可能回覆得比較慢一點，妳先別介意喔。", thread: "大G" },
    ]},
  ],
  82: [
    { id: "owner-goodbye-and-check-wanwan", label: "好的，掰掰，那我去看玩玩吃饭了没有～", nextStage: 63, lines: [
      { sender: "我", body: "好的，掰掰，那我去看玩玩吃飯了沒有～", thread: "大G" },
    ]},
  ],
  62: [
    { id: "goodbye-check-dinner", label: "没关系呀！掰掰，我去看看玩玩吃饭怎么样", nextStage: 63, lines: [
      { sender: "我", body: "沒關係呀！掰掰，我去看看玩玩吃飯怎麼樣。", thread: "大G" },
      { sender: "大G", body: "嗯嗯，辛苦妳了！那我先去忙，有玩玩任何情況都可以傳訊息給我喔。", thread: "大G" },
    ]},
    { id: "goodbye-no-rush", label: "没事没事，你先忙！我去看看玩玩有没有乖乖吃饭", nextStage: 63, lines: [
      { sender: "我", body: "沒事沒事，你先忙！我去看看玩玩有沒有乖乖吃飯。", thread: "大G" },
      { sender: "大G", body: "嗯嗯，辛苦妳了！有任何情況都可以傳訊息給我，妳先去看看玩玩吧。", thread: "大G" },
    ]},
  ],
  63: [
    { id: "tell-broccoli-he-promised-dinner", label: "你敢信！！他要请我吃饭！！！！", nextStage: 64, lines: [
      { sender: "我", body: "你敢信！！他要請我吃飯！！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "等一下！！！他怎麼會突然說要請妳吃飯？妳到底跟他說了什麼？", thread: "西蓝花" },
    ]},
    { id: "tell-broccoli-dinner-casual", label: "欸嘿，他刚刚答应回来请我吃饭了！", nextStage: 64, lines: [
      { sender: "我", body: "欸嘿，他剛剛答應回來請我吃飯了！", thread: "西蓝花" },
      { sender: "西蓝花", body: "真的假的？等等，他怎麼會突然說要請妳吃飯？妳先從頭講！", thread: "西蓝花" },
    ]},
  ],
  64: [
    { id: "explain-it-was-a-joke", label: "我就开玩笑的随口一说……没想到他真的答应了！", nextStage: 88, lines: [
      { sender: "我", body: "我就開玩笑的隨口一說……我也沒想到他真的會答應啊！", thread: "西蓝花" },
      { sender: "西蓝花", body: "瘋了瘋了瘋了！！！妳隨口一說他就答應？這也太不可思議了吧！！！", thread: "西蓝花" },
    ]},
    { id: "still-cannot-believe", label: "我也没想到他会答应，我现在还懵着！", nextStage: 88, lines: [
      { sender: "我", body: "我真的完全沒想到他會答應，我現在整個人都還懵著！", thread: "西蓝花" },
      { sender: "西蓝花", body: "啊啊啊啊啊！！！瘋了啦！！！五月天怪獸欸！妳居然真的要跟他吃飯了！！！", thread: "西蓝花" },
    ]},
  ],
  88: [
    { id: "fantasize-outfit", label: "我已经开始想那天要穿什么了！", nextStage: 89, lines: [
      { sender: "我", body: "我現在甚至開始幻想吃飯那天要穿什麼了，救命哈哈哈！", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈哈妳也太快進入狀況！要不要現在就開始挑衣服？", thread: "西蓝花" },
    ]},
    { id: "try-not-to-overthink", label: "先冷静！但我真的好期待！", nextStage: 89, lines: [
      { sender: "我", body: "我努力冷靜！可是光想像就覺得好緊張喔。", thread: "西蓝花" },
      { sender: "西蓝花", body: "緊張什麼啦！到時候穿得漂漂亮亮去吃飯就對了！", thread: "西蓝花" },
    ]},
  ],
  89: [
    { id: "pick-something-cute", label: "当然要穿得漂漂亮亮的！", nextStage: 94, lines: [
      { sender: "我", body: "那當然要穿得漂漂亮亮的！這可是大事欸！", thread: "西蓝花" },
      { sender: "西蓝花", body: "幫我找簽名嗚嗚我姐妹發達了！", thread: "西蓝花" },
    ]},
    { id: "outfit-nerves", label: "到时候再挑啦，我现在光想就紧张", nextStage: 94, lines: [
      { sender: "我", body: "到時候再挑啦，我現在光想就緊張到不行。", thread: "西蓝花" },
      { sender: "西蓝花", body: "等等等等！妳真的要跟怪獸吃飯了欸！幫我問問能不能簽名啦，我姐妹要出息了！！！", thread: "西蓝花" },
    ]},
  ],
  90: [
    { id: "forgot-return-date", label: "嘶……我还真忘了问！", nextStage: 91, lines: [
      { sender: "我", body: "嘶……我還真忘了問！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳真的很誇張欸！這麼重要的事情也能忘！", thread: "西蓝花" },
    ]},
    { id: "also-forgot-to-ask", label: "完了，我刚刚真的没问他什么时候回来", nextStage: 91, lines: [
      { sender: "我", body: "完了，我剛剛真的沒問他什麼時候回來。", thread: "西蓝花" },
      { sender: "西蓝花", body: "拜託！約吃飯這麼重要，回來時間當然也要問啊！妳怎麼會漏掉啦！", thread: "西蓝花" },
    ]},
  ],
  91: [
    { id: "too-excited-to-remember", label: "哎呀！还不是因为太激动了嘛！", nextStage: 65, lines: [
      { sender: "我", body: "哎呀！還不是因為太激動了嘛！當下腦袋一片空白，哪還記得問啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳真的沒救了啦哈哈哈！我查了一下，好像在北京吧？", thread: "西蓝花" },
      { sender: "西蓝花", body: "沒事，應該最晚就下週的事情？", thread: "西蓝花" },
    ]},
    { id: "laugh-it-off", label: "我那时候满脑子都是他答应请我吃饭了！", nextStage: 65, lines: [
      { sender: "我", body: "我那時候滿腦子都是他答應請我吃飯了，真的顧不上其他事啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈妳也太容易滿足！我看了一下，好像在北京吧？", thread: "西蓝花" },
      { sender: "西蓝花", body: "沒事，應該最晚就下週的事情？", thread: "西蓝花" },
    ]},
  ],
  65: [
    { id: "not-thinking-yet", label: "哦哦，那先不想啦！等他回来再说", nextStage: 79, lines: [
      { sender: "我", body: "哦哦，先不想啦！等他回來再說，現在先把玩玩照顧好。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦好啦，先照顧玩玩！不過妳記得有消息要第一時間跟我說喔！", thread: "西蓝花" },
      { sender: "西蓝花", body: "還有那頓飯！等他回來妳一定要跟我說後續，知道沒有！", thread: "西蓝花" },
    ]},
    { id: "focus-on-wanwan", label: "哦哦！先照顾好玩玩，等他回来再说", nextStage: 79, lines: [
      { sender: "我", body: "哦哦！那先不想啦，等他回來再說，現在先把玩玩照顧好。", thread: "西蓝花" },
      { sender: "西蓝花", body: "嗯嗯，先把玩玩照顧好！這頓飯妳可別忘了，等他回來再跟我報告！", thread: "西蓝花" },
      { sender: "西蓝花", body: "有新消息記得第一時間通知我，我真的超好奇啦！", thread: "西蓝花" },
    ]},
  ],
  77: [
    { id: "dinner-when", label: "哈哈哈你不要笑我啦！", nextStage: 78, lines: [
      { sender: "我", body: "哈哈哈妳不要笑我啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "我哪有笑妳啦！我是真的覺得妳很可愛欸，難得跟怪獸本人聊到天，腦袋都只剩開心了。", thread: "西蓝花" },
      { sender: "西蓝花", body: "不過認真問，妳有沒有想好想吃什麼？還是等他回來再決定？", thread: "西蓝花" },
    ]},
    { id: "dinner-still-surprised", label: "先不想啦！等他回来再说", nextStage: 78, lines: [
      { sender: "我", body: "先不想啦！等他回來再說，現在先把玩玩照顧好。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦，先照顧玩玩！但這頓飯我幫妳記著，妳不准裝沒這回事。", thread: "西蓝花" },
    ]},
  ],
  78: [
    { id: "dinner-tease", label: "我哪知道啦！等他回来再问他", nextStage: 79, lines: [
      { sender: "我", body: "我哪知道啦！等他回來再問他嘛。", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈好啦！到時候妳記得問清楚，別又光顧著傻笑。", thread: "西蓝花" },
      { sender: "西蓝花", body: "而且人家都答應請妳吃飯了，妳就安心等著吧！有進展第一時間跟我報告。", thread: "西蓝花" },
    ]},
    { id: "dinner-keep-calm", label: "好啦我知道啦！你比我还期待", nextStage: 79, lines: [
      { sender: "我", body: "好啦我知道啦！妳怎麼比我還期待啦哈哈哈。", thread: "西蓝花" },
      { sender: "西蓝花", body: "那當然！這可是怪獸本人欸，我怎麼可能不期待！", thread: "西蓝花" },
    ]},
  ],
  79: [
    { id: "report-dinner-later", label: "有消息我第一個告訴你！", nextStage: 84, lines: [
      { sender: "我", body: "有消息我第一個告訴妳！", thread: "西蓝花" },
      { sender: "西蓝花", body: "說好了喔！我等妳消息，先去照顧玩玩吧！", thread: "西蓝花" },
    ]},
    { id: "back-to-wanwan", label: "我先去看看玩玩，晚点再跟你聊", nextStage: 84, lines: [
      { sender: "我", body: "我先去看看玩玩，晚點再跟妳聊。", thread: "西蓝花" },
      { sender: "西蓝花", body: "去吧去吧！替我摸摸牠，記得吃飯喔！", thread: "西蓝花" },
    ]},
  ],
  66: [],
  84: [
    { id: "exit-wechat-after-broccoli", label: "好啦！我先去看看玩玩，退出微信", nextStage: 66, lines: [
      { sender: "我", body: "好啦！我先去看看玩玩，晚點再跟妳聊。", thread: "西蓝花" },
      { sender: "西蓝花", body: "去吧去吧！有消息記得跟我說，替我摸摸玩玩！", thread: "西蓝花" },
    ]},
    { id: "one-more-broccoli-message", label: "再跟你聊一句，我真的太惊讶了", nextStage: 66, lines: [
      { sender: "我", body: "我還是覺得好不可思議，今天也太戲劇化了吧！", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈今天真的很精彩！好啦，先去陪玩玩，晚點再聊！", thread: "西蓝花" },
    ]},
  ],
};
export function WeChatSkin(p: SkinProps) {
  const [tab, setTab] = useState("微信");
  const [query, setQuery] = useState("");
  const [moments, setMoments] = useState(false);
  const [contactRemarksRaw, setContactRemarksRaw] = useSkinState<string>(p, "wxContactRemarks", "{}");
  let contactRemarks: Record<string, string> = {};
  try {
    const parsedRemarks: unknown = JSON.parse(contactRemarksRaw);
    if (parsedRemarks && typeof parsedRemarks === "object" && !Array.isArray(parsedRemarks)) {
      contactRemarks = Object.fromEntries(Object.entries(parsedRemarks).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    }
  } catch { /* Ignore malformed legacy remark data and keep the original names. */ }
  const [remarkEditorContact, setRemarkEditorContact] = useState("");
  const [remarkDraft, setRemarkDraft] = useState("");

  const [catRescueRaw, setCatRescueRaw] = useSkinState<string>(p, "catRescueState", "");
  // This flag is written only when the user explicitly finishes the friend-add
  // flow. Older builds advanced the story stage too early, so stage alone
  // must never be treated as proof that the friend was actually added.
  const [monsterFriendAccepted, setMonsterFriendAccepted] = useSkinState<boolean>(p, "wxMonsterFriendAccepted", false);
  const [pendingCatLinesRaw, setPendingCatLinesRaw] = useSkinState<string>(p, "wxCatPendingLines", "[]");
  let pendingCatLines: CatLine[] = [];
  try {
    const parsed = JSON.parse(pendingCatLinesRaw);
    if (Array.isArray(parsed)) pendingCatLines = parsed.filter((line) =>
      line && typeof line.body === "string" && typeof line.sender === "string" && line.sender !== "我"
    ) as CatLine[];
  } catch { pendingCatLines = []; }
  const setPendingCatLines = (next: CatLine[] | ((current: CatLine[]) => CatLine[])) => {
    const updated = typeof next === "function" ? next(pendingCatLines) : next;
    setPendingCatLinesRaw(JSON.stringify(updated));
  };
  const storyClockRef = useRef(p.virtualTime || "14:24");
  storyClockRef.current = p.virtualTime || storyClockRef.current;
  const parsedCatRescue = parseCatRescueState(catRescueRaw);
  const hasPrankPath = parsedCatRescue.branch === "monster-prank" ||
    [...p.items, ...parsedCatRescue.messages].some((item) => item.body.trim() === "我是你爸爸。");
  const hasReaddedEvent = [...p.items, ...parsedCatRescue.messages].some((item) =>
    /你重新添加了大G/.test(item.body)
  );
  const legacyPrankReaddPending = shouldMigrateLegacyPrankReadd(
    parsedCatRescue.stage, monsterFriendAccepted, hasPrankPath, hasReaddedEvent
  );
  // Do not infer the WeChat-ID handoff from a stale friend-accepted flag:
  // stage 8 is reached only by the explicit "try WeChat" choice. The one
  // legacy prank save that already re-added the friend at stage 14 is migrated
  // to stage 16 so the missing "？？？" and cat-explanation choice can resume.
  const correctedPickupMessages = parsedCatRescue.messages.map((item) => {
    if (item.body.trim() === "那你什么时候回来接它呀？我可以先帮你照看，不过想先知道大概多久。") {
      return { ...item, body: "那你什麼時候方便回來接牠呀？我可以先幫你照看，不過想先知道你大概什麼時候回來。" };
    }
    if (/我這邊還有事情要處理，應該還要幾天才回得去/.test(item.body) ||
        /我這幾天都在外地，還要幾天才回得去/.test(item.body)) {
      return { ...item, body: "我這幾天都不在家，人在外地還有事情要處理，暫時沒辦法回去接牠。原本真的不知道牠自己跑出門了……" };
    }
    return item;
  });
  const pickupMessagesWereMigrated = correctedPickupMessages.some((item, index) =>
    item.body !== parsedCatRescue.messages[index]?.body
  );
  // Stage 53 is the intentional DaG reassurance reply before handing off to Broccoli.
  const catRescue = legacyPrankReaddPending
    ? { ...parsedCatRescue, messages: correctedPickupMessages, stage: 16, branch: "monster-prank" }
    : { ...parsedCatRescue, messages: correctedPickupMessages };
  const allItems = [...p.items, ...catRescue.messages];
  const postPickupGoodbyeSent = allItems.some((item) => item.sender === "我" && /好啦，愛妳呦，媽媽/.test(item.body.trim()));
  // One-time Vava/玩玩 Moments event. Its transcript is stored with the
  // existing DaG story messages so it survives app switches and reloads.
  const [vavaMomentSeeded, setVavaMomentSeeded] = useSkinState<boolean>(p, "wxVavaMomentSeeded", false);
  const [vavaPlayStage, setVavaPlayStage] = useSkinState<number>(p, "wxVavaPlayStage", -1);
  const [vavaPlayCompleted, setVavaPlayCompleted] = useSkinState<boolean>(p, "wxVavaPlayCompleted", false);
  const [returnDinnerStage, setReturnDinnerStage] = useSkinState<number>(p, "wxReturnDinnerStage", 0);
  const [pickupSceneRebuiltV1, setPickupSceneRebuiltV1] = useSkinState<boolean>(p, "wxPickupSceneRebuiltV1", false);
  const [hotelBroccoliFollowupQueued, setHotelBroccoliFollowupQueued] = useSkinState<boolean>(p, "wxHotelBroccoliFollowupQueuedV1", false);
  const handledReturnDinnerChoicesRef = useRef(new Set<string>());
  const [postPickupStoryMigrated, setPostPickupStoryMigrated] = useSkinState<boolean>(p, "wxPostPickupStoryMigratedV1", false);
  useEffect(() => {
    if (pickupSceneRebuiltV1) return;
    const legacyPickupBodies = new Set([
      "啊啊啊啊啊他說要來親自接我！怪獸！親自！開車！",
      "真的假的？！他居然要親自開車來接妳！妳晚上回來一定要跟我詳細報告！",
      "妳以為戀愛ing啊！不說了，我要去洗澡敷面膜了！",
      "嘖嘖，見色忘友欸！剛剛還在這裡跟我尖叫，現在就急著去洗澡敷面膜了喔？",
      "嗯嗯我就是見色忘友！我愛怪獸！我去準備了媽媽拜拜！！",
    ]);
    const hasLegacyPickupScene = [...allItems, ...pendingCatLines].some((item) => legacyPickupBodies.has(item.body.trim()));
    const hasNewPickupEnding = allItems.some((item) => item.sender === "我" && /好啦，愛妳呦，媽媽/.test(item.body.trim()));
    if (hasLegacyPickupScene && !hasNewPickupEnding && (returnDinnerStage < 0 || (returnDinnerStage >= 109 && returnDinnerStage <= 110))) {
      const cleanedMessages = catRescue.messages.filter((item) => !legacyPickupBodies.has(item.body.trim()));
      const cleanedPending = pendingCatLines.filter((item) => !legacyPickupBodies.has(item.body.trim()));
      setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2, stage: 207, messages: cleanedMessages }));
      if (cleanedPending.length !== pendingCatLines.length) setPendingCatLinesRaw(JSON.stringify(cleanedPending));
      setReturnDinnerStage(207);
    }
    setPickupSceneRebuiltV1(true);
  }, [pickupSceneRebuiltV1, allItems, pendingCatLinesRaw, returnDinnerStage, catRescueRaw]);
  const [bigGHomeSequenceQueuedV2, setBigGHomeSequenceQueuedV2] = useSkinState<boolean>(p, "wxBigGHomeSequenceQueuedV2", false);
  const [postMeetupDialogueMigratedV3, setPostMeetupDialogueMigratedV3] = useSkinState<boolean>(p, "wxPostMeetupDialogueMigratedV3", false);
  const [drunkNightOpeningOrderMigratedV2, setDrunkNightOpeningOrderMigratedV2] = useSkinState<boolean>(p, "wxDrunkNightOpeningOrderMigratedV2", false);
  useEffect(() => {
    if (drunkNightOpeningOrderMigratedV2) return;
    const cleaned = catRescue.messages.filter((item) =>
      !String(item.id || "").startsWith("drunk-night-handoff-opening-v1-")
    );
    if (cleaned.length !== catRescue.messages.length) {
      setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2, messages: cleaned }));
    }
    setDrunkNightOpeningOrderMigratedV2(true);
  }, [drunkNightOpeningOrderMigratedV2, catRescue.messages, catRescueRaw]);
  const [meetupQuestionSplitMigratedV1, setMeetupQuestionSplitMigratedV1] = useSkinState<boolean>(p, "wxMeetupQuestionSplitMigratedV1", false);
  // Existing saves may already contain the old single combined nose/skin
  // question. Rewrite that persisted bubble into four separate incoming
  // messages, both in the story transcript and in the pending delivery queue.
  useEffect(() => {
    if (meetupQuestionSplitMigratedV1) return;
    const isOldCombinedQuestion = (body: string) =>
      /鼻子挺不挺[？?].*皮膚白不白[？?].*(本人是不是比照片還好看|本人是不是比照片还好看)/.test(body) ||
      /等一下[，,]?先回答我[！!].*鼻子挺不挺[？?].*皮膚白不白/.test(body);
    const splitBodies = [
      "他鼻子挺不挺？",
      "皮膚白不白？",
      "整個人在陽光下是不是會bulingbuling發光？",
      "妳有沒有看著流口水？",
    ];
    let changedMessages = false;
    const migratedMessages = catRescue.messages.flatMap((item) => {
      if (item.sender !== "西蓝花" || !isOldCombinedQuestion(item.body)) return [item];
      changedMessages = true;
      const orderBase = Number(item.meta?.storyOrderAt || Date.now());
      return splitBodies.map((body, index) => ({
        ...item,
        id: String(item.id || "meetup-nose-question") + "-split-" + (index + 1),
        body,
        time: item.time,
        meta: { ...item.meta, storyOrderAt: String(orderBase + index) },
      }));
    });
    if (changedMessages) {
      setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2, messages: migratedMessages }));
    }
    let changedPending = false;
    const migratedPending = pendingCatLines.flatMap((line) => {
      if (line.sender !== "西蓝花" || !isOldCombinedQuestion(line.body)) return [line];
      changedPending = true;
      return splitBodies.map((body, index) => ({
        ...line,
        id: String(line.id || "meetup-nose-question") + "-split-" + (index + 1),
        body,
      }));
    });
    if (changedPending) setPendingCatLinesRaw(JSON.stringify(migratedPending));
    setMeetupQuestionSplitMigratedV1(true);
  }, [meetupQuestionSplitMigratedV1, catRescueRaw, pendingCatLinesRaw]);

  const hasNewBroccoliReply = allItems.some((item) => /我哪裡沒用了|我哪里没用了/.test(item.body));
  // Do not infer story progress from a single old line or jump from stage 103
  // to 200: stages 101-105 contain the nose/skin, physical-contact and
  // signature exchanges and must remain playable in their original order.
  useEffect(() => {
    if ((hasNewBroccoliReply || returnDinnerStage >= 200 || returnDinnerStage === -2) && !postMeetupDialogueMigratedV3) {
      setPostMeetupDialogueMigratedV3(true);
    }
  }, [postMeetupDialogueMigratedV3, hasNewBroccoliReply, returnDinnerStage]);
  // Do not run the old stage-200/201 recovery here. Those stage numbers are
  // now the intentional continuation after the fan-confession beat (stages
  // 200-204). The former effect reset them to 102/103 and deleted the player's
  // banter, causing the same nose/skin replies to loop and skipping the
  // concert-screen and fan-identity conversation.
  // Repair the handoff after Broccoli's final choice. Older saves can
  // advance the stage while leaving DaG's opening replies stranded in the
  // pending queue. Materialize them directly in DaG's transcript.
  // The stage-249 choice itself owns the two opening replies. Do not seed
  // them from an effect: that made DaG speak before the player's first bubble.
  // After the hotel goodnight is sent in DaG's chat, notify the player that Broccoli is waiting.
  useEffect(() => {
    if (returnDinnerStage !== 226 || hotelBroccoliFollowupQueued || pendingCatLines.length > 0) return;
    setHotelBroccoliFollowupQueued(true);
    setPendingCatLines((current) => [...current,
      { id: "hotel-night-broccoli-checkin", sender: "西蓝花", body: "妳怎麼沒消息？吃飯怎麼樣？", thread: "西蓝花" },
    ]);
    setReturnDinnerStage(227);
  }, [returnDinnerStage, hotelBroccoliFollowupQueued, pendingCatLines.length]);
  // After the final Broccoli line has arrived, start Big G's home update as
  // separate incoming chat messages. The phone-level queue creates the
  // notification because the player is still in Broccoli's conversation.
  useEffect(() => {
    if (returnDinnerStage !== 205 || pendingCatLines.length > 0 || bigGHomeSequenceQueuedV2) return;
    setBigGHomeSequenceQueuedV2(true);
    setPendingCatLines((current) => [...current,
      { sender: "大G", body: "剛剛帶玩玩到家了。", thread: "大G", id: "meetup-home-v2-1" },
      { sender: "大G", body: "牠一路上都很乖。", thread: "大G", id: "meetup-home-v2-2" },
      { sender: "大G", body: "看得出來妳真的把牠照顧得很好。", thread: "大G", id: "meetup-home-v2-3" },
      { sender: "大G", body: "謝謝妳這段時間這麼用心照顧牠。", thread: "大G", id: "meetup-home-v2-4" },
    ]);
  }, [returnDinnerStage, pendingCatLines.length, bigGHomeSequenceQueuedV2]);
  useEffect(() => {
    // Older saves ended stage 100 at -1. Resume the newly added follow-up once,
    // without replaying or rewriting any existing messages.
    if (!postPickupGoodbyeSent && !postPickupStoryMigrated && returnDinnerStage === -1 && catRescue.branch === "monster-cat") {
      setReturnDinnerStage(101);
      setPostPickupStoryMigrated(true);
    }
  }, [postPickupGoodbyeSent, postPickupStoryMigrated, returnDinnerStage, catRescue.branch]);
  const [meetupDayMigrated, setMeetupDayMigrated] = useSkinState<boolean>(p, "wxMeetupDayMigrationV1", false);
  useEffect(() => {
    if (meetupDayMigrated || catRescue.branch !== "monster-cat") return;
    const replacements = new Map<string, string>([
      ["哈哈，那我明天有口福了。唉，我最近工作真的有點忙，平常常常隨便吃個便當就算了，明天要好好吃一頓才行。", "哈哈，那我今天有口福了。唉，我最近工作真的有點忙，平常常常隨便吃個便當就算了，今天要好好吃一頓才行。"],
      ["知道啦，妳講話怎麼跟我媽一樣，哈哈哈。好啦，我明天一定好好吃，不會再隨便打發了。", "知道啦，妳講話怎麼跟我媽一樣，哈哈哈。好啦，我今天一定好好吃，不會再隨便打發了。"],
      ["哈哈，牠真的很有精神欸。看來在妳那邊過得很舒服，明天我去接牠應該會很捨不得吧。", "哈哈，牠真的很有精神欸。看來在妳那邊過得很舒服，今天我去接牠應該會很捨不得吧。"],
      ["希望啦！我也很想牠。欸，我到酒店了，終於可以坐下來了，今天真的有點累。", "希望啦！我也很想牠。欸，我還有半小時就到妳家附近了，妳可以先收拾一下，準備帶玩玩下樓啦。"],
      ["啊那你快去收拾收拾，早點休息吧，明天見～", "好！那我先去收拾一下，準備帶玩玩下樓～"],
      ["好啦，妳也早點休息！明天見，晚安。", "好，不急，妳慢慢來。我到了附近再跟妳說。"],
    ]);
    const removed = new Set(["晚安～你也早點休息，明天見！", "嗯嗯，晚安。明天見。"]);
    const migratedMessages = catRescue.messages
      .filter((item) => !removed.has(item.body.trim()))
      .map((item) => replacements.has(item.body.trim())
        ? { ...item, body: replacements.get(item.body.trim())! }
        : item);
    if (migratedMessages.some((item, index) => item !== catRescue.messages[index]) ||
        migratedMessages.length !== catRescue.messages.length) {
      setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2, messages: migratedMessages }));
    }
    if (returnDinnerStage === 45) setReturnDinnerStage(44);
    setMeetupDayMigrated(true);
  }, [meetupDayMigrated, catRescue.branch, catRescue.messages, returnDinnerStage]);

  const vavaOpenerEnqueuedRef = useRef(false);
  const vavaPlayMessagesExist = catRescue.messages.some((item) => item.meta?.storyId === "vava-play-story");
  const vavaPlayActive = vavaPlayStage >= 0 || vavaPlayMessagesExist;

  // Repair duplicate copies already persisted by earlier builds. Only dedupe
  // this exact one-time opener; never touch any other DaG or story messages.
  useEffect(() => {
    const openerText = "欸，Vava是你家的原住民喔？玩玩最近還好嗎？";
    let kept = false;
    const cleanedMessages = catRescue.messages.filter((item) => {
      if (item.sender !== "大G" || item.body !== openerText) return true;
      if (kept) return false;
      kept = true;
      return true;
    });
    if (cleanedMessages.length !== catRescue.messages.length) {
      setCatRescueRaw(JSON.stringify({ ...catRescue, messages: cleanedMessages }));
    }
    let pendingKept = false;
    const cleanedPending = pendingCatLines.filter((line) => {
      if (line.sender !== "大G" || line.thread !== "大G" || line.body !== openerText) return true;
      if (pendingKept) return false;
      pendingKept = true;
      return true;
    });
    if (cleanedPending.length !== pendingCatLines.length) {
      setPendingCatLinesRaw(JSON.stringify(cleanedPending));
    }
  }, [catRescueRaw, pendingCatLinesRaw]);

  const canonicalContactName = (name: string) => name === "温尚翊" ? "大G" : name;
  const displayName = (name: string) => {
    const canonical = canonicalContactName(name);
    return contactRemarks[canonical]?.trim() || canonical;
  };
  const openRemarkEditor = (name: string) => {
    const canonical = canonicalContactName(name);
    setRemarkEditorContact(canonical);
    setRemarkDraft(contactRemarks[canonical] || canonical);
  };
  const saveContactRemark = () => {
    const next = remarkDraft.trim();
    if (!next || !remarkEditorContact) return;
    setContactRemarksRaw(JSON.stringify({ ...contactRemarks, [remarkEditorContact]: next }));
    setRemarkEditorContact("");
  };
  const resolveContactName = (visible: string) =>
    Object.entries(contactRemarks).find(([_key, value]) => value === visible)?.[0] || visible;
  const isMonsterName = (name: string) => name === "大G" || name === "温尚翊";
  // The canonical story transcript stores an explicit destination on every
  // line. Render it directly in that contact's conversation; do not infer
  // ownership from sender text (the player's lines otherwise get misplaced).
  const isBroccoliThread = p.thread === "西蓝花" || p.thread === "西兰花";
  const isMonsterThread = p.thread === "大G" || p.thread === "温尚翊";
  // Keep the story UI active even before its first scripted message is saved.
  // The first choice is what starts the story, so requiring existing story
  // messages here prevents the initial choices from ever appearing.
  // The broccoli story remains available until the story itself reaches
  // the owner-chat handoff. Do not let a stale accepted-friend flag from an
  // older save hide the opening choices (stage 0) or the broccoli branches.
  // Later owner-chat stages prove the friend-add flow already completed,
  // even if an older save lost the separate accepted flag.
  const ownerChatStarted = [9, 14, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27, 35, 36, 40, 41, 42, 43, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 85, 86, 87].includes(catRescue.stage);
  // Keep both contact transcripts readable for the entire story, including
  // after the handoff. Hiding the Broccoli story view at later stages made
  // delivered replies appear in notifications but disappear when opened.
  const hasDrunkStoryInMonsterChat = isMonsterThread && [...allItems, ...pendingCatLines].some((item) =>
    ("title" in item ? item.title : item.thread) === "大G" && item.body.trim() === "喂！你怎么不说话！"
  );
  const catRescueActive =
    isBroccoliThread ||
    (isMonsterThread && (monsterFriendAccepted || ownerChatStarted || catRescue.stage === 53 || vavaPlayActive || hasDrunkStoryInMonsterChat));
  const _catAvatar = GLOOMY_AVATAR;
  const broccoliBaseItems = p.items.filter((item) =>
    (item.title === "西蓝花" || item.title === "西兰花") &&
    item.sender !== "大G" &&
    item.sender !== "温尚翊" &&
    item.meta?.storyThread !== "大G" &&
    // Hide a player line that an older build incorrectly auto-sent from the
    // scripted branch instead of waiting for the user to choose it.
    item.body.trim() !== "我知道啊，可是它这么小一只，身边也没有猫妈妈，我真的走不开。" &&
    // Keep the original seeded chat history: those messages also carry the
    // cat-rescue storyId, but belong to the broccoli conversation. Only
    // remove unmistakable owner-prank lines from legacy mixed saves.
    !/我是你爸爸|妳真的很會鬧|妳是？|蛤？小黑貓|對不起.*發錯|对不起.*发错/.test(item.body) &&
    // Keep player-authored text (even if it contains question marks). Only
    // the duplicated incoming opener is reconstructed below.
    !(item.sender !== "我" && item.body.trim() === "？？？")
  );
  const keepPrankHistoryClean = (item: Item) =>
    shouldShowPrankHistoryLine(item, catRescue.branch, hasPrankPath);
  const threadItems = isMonsterThread
    ? filterPrankHistoryLines(orderCatRescueThreadItems([
        ...p.items.filter((item) => (item.title === "大G" || item.title === "温尚翊") && keepPrankHistoryClean(item)),
        ...catRescue.messages.filter((item) =>
          (item.meta?.storyThread === "大G" || item.meta?.storyThread === "温尚翊" || item.title === "大G" || item.title === "温尚翊") &&
          keepPrankHistoryClean(item)
        ),
      ]), hasPrankPath)
    : isBroccoliThread
      ? orderCatRescueThreadItems([
          ...broccoliBaseItems,
          ...p.items.filter((item) =>
            (item.title === "西蓝花" || item.title === "西兰花") &&
            item.sender === "西蓝花" &&
            item.body.trim() === "？？？"
          ),
          // Include every canonical story line plus legacy player-authored
          // replies, then order the merged transcript by its saved timestamp.
          ...catRescue.messages.filter((item) =>
            item.meta?.storyThread === "西蓝花" ||
            item.meta?.storyThread === "西兰花" ||
            item.title === "西蓝花" ||
            item.title === "西兰花"
          ).filter((item) => item.body.trim() !== "我知道啊，可是它这么小一只，身边也没有猫妈妈，我真的走不开。"),
        ])
      : allItems.filter((item) => item.title === p.thread);
  // Never expose the next interaction branch while any scripted line is
  // still waiting to arrive. The stage advances when the player chooses, but
  // the next choice belongs after the complete incoming exchange, not before it.
  const choiceThread = getCatRescueThreadForStage(catRescue.stage);
  // Choices belong only to the contact whose conversation is active for this
  // story stage. In particular, once the owner-add flow hands off to 大G,
  // never render 大G's opening choices inside 西蓝花's chat.
  const isCurrentChoiceThread =
    (isBroccoliThread && choiceThread === "西蓝花") ||
    (isMonsterThread && choiceThread === "大G");
  const catChoices = vavaPlayStage >= 0 ? [] :
    // Stage 53 is the explicit DaG follow-up after "妳？？？怎麼啦？".
    // Keep its two replies visible in DaG's own chat even if an unrelated
    // stale queue entry remains from the previous contact.
    ((catRescue.stage === 53 && isMonsterThread) ||
      (pendingCatLines.length === 0 && isCurrentChoiceThread))
      ? (CAT_RESCUE_CHOICES[catRescue.stage] || [])
      : [];
  const vavaPlayChoices: CatChoice[] = [
    { id: "vava-play-intro", label: "嗯嗯，忘记跟你说了哈哈", nextStage: 1, lines: [
      { sender: "我", body: "嗯嗯，忘記跟你說了哈哈。Vava是我家的原住民，牠平常很有自己的地盤意識。", thread: "大G" },
      { sender: "大G", body: "哈哈，原來如此！那玩玩這陣子有沒有乖乖的？牠剛到妳那邊，還要麻煩妳多照顧一下了。", thread: "大G" },
    ]},
    { id: "vava-play-intro-alt", label: "对啊，Vava是家里的原住民", nextStage: 1, lines: [
      { sender: "我", body: "對啊，Vava本來就在我家，玩玩來了之後家裡就多了一位新室友。", thread: "大G" },
      { sender: "大G", body: "哈哈哈，這樣喔！那牠們兩個相處得還可以嗎？玩玩有沒有適應妳家的生活？", thread: "大G" },
    ]},
    { id: "vava-play-who-started", label: "Vava比玩玩大那么多，竟然还打不过玩玩", nextStage: 2, lines: [
      { sender: "我", body: "牠們今天還打起來了！Vava明明比玩玩大隻那麼多，結果竟然還打不過玩玩！", thread: "大G" },
      { sender: "大G", body: "真的假的啦？玩玩明明小小一隻欸！牠是怎麼打的？Vava有沒有被抓傷？妳有沒有看著牠們？", thread: "大G" },
    ]},
    { id: "vava-play-small", label: "玩玩小小一只，气势倒是很大", nextStage: 2, lines: [
      { sender: "我", body: "玩玩真的小小一隻，可是打起來氣勢超強，Vava都被牠逼到退開。", thread: "大G" },
      { sender: "大G", body: "牠平常看起來那麼小一隻，沒想到這麼有個性！不過Vava有沒有怎麼樣？不要真的受傷了喔。", thread: "大G" },
    ]},
    { id: "vava-play-apology", label: "没事啦，它们闹一闹而已，我会看着它们", nextStage: 3, lines: [
      { sender: "我", body: "沒事啦，應該只是互相試探、鬧一鬧而已，我會在旁邊看著牠們，不會讓牠們真的打傷彼此。", thread: "大G" },
      { sender: "大G", body: "那就好……唉，還是有點不好意思啦。明明是妳好心幫我照顧玩玩，結果牠還欺負妳家的Vava，反而害妳要多操心，真的給妳添麻煩了。", thread: "大G" },
    ]},
    { id: "vava-play-apology-alt", label: "我会注意的，你不用太担心", nextStage: 3, lines: [
      { sender: "我", body: "我會注意牠們的啦，你先不用太擔心，有狀況我會跟你說。", thread: "大G" },
      { sender: "大G", body: "好，妳有幫我顧著牠我真的很感謝。只是玩玩要是太皮，妳也要跟我說，不要自己一個人累到。", thread: "大G" },
    ]},
    { id: "vava-play-reassure", label: "真的没关系，我也很喜欢玩玩", nextStage: 4, lines: [
      { sender: "我", body: "真的沒關係啦，我也很喜歡玩玩，牠在我這裡挺好的，不用一直覺得麻煩我。", thread: "大G" },
      { sender: "大G", body: "妳這樣講我比較放心了。玩玩當初是我撿回來的，看到牠那麼小一隻，就想說不能放著不管。", thread: "大G" },
    ]},
    { id: "vava-play-reassure-alt", label: "你别客气啦，玩玩现在也是我家的小朋友", nextStage: 4, lines: [
      { sender: "我", body: "你別客氣啦，玩玩現在也是我家的小朋友，我會好好照顧牠的。", thread: "大G" },
      { sender: "大G", body: "真的很謝謝妳。牠是我當初撿回來的，沒想到現在有人跟我一起疼牠，這樣我就安心很多了。", thread: "大G" },
    ]},
    { id: "vava-play-rescue", label: "原来玩玩是你捡来的？你也太有爱心了吧", nextStage: 5, lines: [
      { sender: "我", body: "原來玩玩是你撿來的喔？你也太有愛心了吧，看到小小一隻就把牠帶回家。", thread: "大G" },
      { sender: "大G", body: "哪有啦，真的就是剛好遇到。那時候牠小小一隻又沒人照顧，我就捨不得走掉啊。", thread: "大G" },
    ]},
    { id: "vava-play-kind", label: "愿意把它带回家照顾就已经很温柔了", nextStage: 5, lines: [
      { sender: "我", body: "願意把牠帶回家照顧就已經很溫柔了，玩玩現在一定過得很幸福。", thread: "大G" },
      { sender: "大G", body: "希望牠有感受到啦。牠現在有妳照顧，還有Vava陪牠（雖然好像常常被牠欺負），比以前好多了。", thread: "大G" },
    ]},
    { id: "vava-play-wrap", label: "哈哈哈，现在它们两个都有人疼", nextStage: 6, lines: [
      { sender: "我", body: "哈哈哈，現在牠們兩個都有人疼啦，只希望下次不要再打架了。", thread: "大G" },
      { sender: "大G", body: "哈哈哈，我也希望。下次牠們又鬧起來記得拍給我看，我想看看玩玩到底有多勇猛。真的謝謝妳照顧牠。", thread: "大G" },
    ]},
    { id: "vava-play-final", label: "好啦，我会继续看着它们的", nextStage: -1, lines: [
      { sender: "我", body: "好啦，我會繼續看著牠們的，你放心忙你的。", thread: "大G" },
      { sender: "大G", body: "好，那就拜託妳了。等我回去再請妳吃飯，好好謝謝妳。", thread: "大G" },
    ]},
  ];
  type ReturnDinnerChoice = CatChoice & { stage: number; chat: "大G" | "西蓝花" };
  const returnDinnerChoices: ReturnDinnerChoice[] = [
    { stage: 1, chat: "大G", id: "return-time-confirm", label: "方便方便！明天可以呀，你接玩玩之前跟我说一声就好", nextStage: 2, lines: [
      { sender: "我", body: "方便方便！明天可以呀，你接玩玩之前跟我說一聲就好。", thread: "大G" },
      { sender: "大G", body: "好，那我明天出發前再跟妳聯絡，時間確定了我就告訴妳。這幾天真的辛苦妳了。", thread: "大G" },
    ]},
    { stage: 3, chat: "西蓝花", id: "tell-broccoli-tomorrow", label: "啊啊啊！他说明天就回来了！要来接玩玩！", nextStage: 4, lines: [
      { sender: "我", body: "啊啊啊啊啊！他說他明天就回來了欸！明天要來接玩玩！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "等一下！！！他有沒有說請妳吃飯的事情？！", thread: "西蓝花" },
    ]},
    { stage: 4, chat: "西蓝花", id: "no-dinner-mentioned", label: "没有啊！他只说要来接玩玩而已", nextStage: 5, lines: [
      { sender: "我", body: "沒有啊！他就只說明天要來接玩玩而已，完全沒提吃飯的事。", thread: "西蓝花" },
      { sender: "西蓝花", body: "蛤？？？他該不會忘記了吧！！！", thread: "西蓝花" },
    ]},
    { stage: 5, chat: "西蓝花", id: "should-i-mention-dinner", label: "你说……我要不要主动提一下吃饭的事？", nextStage: 6, lines: [
      { sender: "我", body: "妳說……那我要不要主動提一下吃飯的事情啊？", thread: "西蓝花" },
      { sender: "西蓝花", body: "先不要啦！！！妳現在主動提，不就顯得妳一直惦記著這頓飯、很上趕著嗎？意圖也太明顯了吧！", thread: "西蓝花" },
    ]},
    { stage: 6, chat: "西蓝花", id: "agree-not-mention-dinner", label: "好吧……那我还是先不提了", nextStage: 7, lines: [
      { sender: "我", body: "好吧……那我還是先不提了，順其自然好了。", thread: "西蓝花" },
      { sender: "西蓝花", body: "對嘛！就自然一點，先把玩玩交接好，其他的等他自己開口。", thread: "西蓝花" },
    ]},
    { stage: 7, chat: "西蓝花", id: "worry-fan-identity", label: "可是如果他发现我是他的粉丝怎么办？会不会觉得我图谋不轨啊？", nextStage: 8, lines: [
      { sender: "我", body: "可是我突然想到……如果他發現我是他的粉絲怎麼辦？他會不會覺得我一開始就圖謀不軌啊？", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳不要亂想啦！妳撿到玩玩的時候，又不知道牠是怪獸家的貓。妳就是剛好遇到牠、好心幫忙而已，哪有什麼圖謀不軌！", thread: "西蓝花" },
      { sender: "西蓝花", body: "而且妳也沒有刻意接近他啊，從頭到尾都是因為玩玩才聯絡上的。放輕鬆一點啦！", thread: "西蓝花" },
      { sender: "大G", body: "對了，如果妳明天方便的話，我接完玩玩之後想請妳一起吃個飯，謝謝妳這段時間這麼照顧牠。", thread: "大G" },
    ]},
    { stage: 8, chat: "西蓝花", id: "react-second-dinner-invite", label: "啊啊啊啊！他又给我发消息了！他说要请我吃饭！！！", nextStage: 10, lines: [
      { sender: "我", body: "啊啊啊啊啊！！！他又給我發消息了！！！他說如果方便的話，接完玩玩要請我一起吃飯！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "真的假的！！！這次真的自己提了欸！！！妳快先去跟他聊啦，剛好我主管在喊我了，我得先忙一下！", thread: "西蓝花" },
      { sender: "西蓝花", body: "快去快去！好好聊，等一下再回來跟我報告，細節一個都不准漏掉！", thread: "西蓝花" },
    ]},
    { stage: 10, chat: "大G", id: "accept-dinner-invite", label: "好呀！我明天都有空，可以一起吃飯。不過餐廳好像不能帶寵物欸……", nextStage: 11, lines: [
      { sender: "我", body: "好呀！我明天都有空，可以一起吃飯。不過餐廳好像不能帶寵物欸……", thread: "大G" },
      { sender: "大G", body: "喔對喔！幹！！我差點忘了這件事！哈哈哈，那怎麼辦？", thread: "大G" },
    ]},
    { stage: 11, chat: "大G", id: "suggest-dinner-before-pickup", label: "要不然我們先吃飯，吃完再去我家接玩玩？", nextStage: 12, lines: [
      { sender: "我", body: "要不然我們先吃飯，吃完再去我家接玩玩？", thread: "大G" },
      { sender: "大G", body: "嗯……我想想喔。這樣好像也可以欸，先吃飯再去接玩玩，時間上應該也還好。", thread: "大G" },
    ]},
    { stage: 12, chat: "大G", id: "suggest-nearby-restaurant", label: "到時候吃飯可以找我家附近的地方啊，吃完再過去接牠。", nextStage: 13, lines: [
      { sender: "我", body: "到時候吃飯可以找我家附近的地方啊，吃完再過去接牠。", thread: "大G" },
      { sender: "大G", body: "欸，不然妳先傳一下妳家的定位給我？我看一下位置跟路線，這樣比較好安排。", thread: "大G" },
    ]},
    { stage: 13, chat: "大G", id: "ask-why-location", label: "幹嘛？突然要我家地址喔？", nextStage: 14, lines: [
      { sender: "我", body: "幹嘛？突然要我家地址喔？", thread: "大G" },
      { sender: "大G", body: "沒有啦，想看一下妳家在哪裡，順便確認一下明天怎麼走比較順。方便的話傳個定位給我就好。", thread: "大G" },
    ]},
    { stage: 14, chat: "大G", id: "send-home-location", label: "（還是傳了定位）📍我的位置", nextStage: 15, lines: [
      { sender: "我", body: "📍 位置分享\n我的位置\n（已傳送定位）", thread: "大G" },
      { sender: "大G", body: "欸？妳就這樣把地址傳給陌生人喔？哈哈哈哈。", thread: "大G" },
    ]},
    { stage: 15, chat: "大G", id: "not-a-stranger", label: "你又不是陌生人！你這樣說我會傷心欸，我還以為我們是朋友。", nextStage: 16, lines: [
      { sender: "我", body: "你又不是陌生人！你這樣說我會傷心欸，我還以為我們是朋友。", thread: "大G" },
      { sender: "大G", body: "哈哈哈哈，開玩笑啦！不要這麼認真，我們當然是朋友啊。欸我看了一下，妳家剛好在我家跟機場中間欸，這樣超順路的！", thread: "大G" },
    ]},
    { stage: 16, chat: "大G", id: "explain-pickup-route", label: "真的欸！那明天就照你方便的路線安排吧。", nextStage: 17, lines: [
      { sender: "我", body: "真的欸！那明天就照你方便的路線安排吧。", thread: "大G" },
      { sender: "大G", body: "那我從機場出來先去妳家接玩玩，帶牠回我家安頓好，再出來找妳吃飯。這樣不用帶牠去餐廳，也不用吃完飯再繞回去，應該比較順啦。", thread: "大G" },
    ]},
    { stage: 17, chat: "大G", id: "confirm-pickup-first", label: "好啊！這樣確實比較順，那就先接玩玩回去安顿，再出来吃饭。", nextStage: 18, lines: [
      { sender: "我", body: "好啊！這樣確實比較順，那就先接玩玩回去安頓，再出來吃飯。", thread: "大G" },
      { sender: "大G", body: "對啊，就這樣決定！那妳有沒有想吃什麼？我都可以配合。", thread: "大G" },
    ]},
    { stage: 18, chat: "大G", id: "ask-food-preference", label: "你有什麼想吃的嗎？我都可以欸。", nextStage: 19, lines: [
      { sender: "我", body: "你有什麼想吃的嗎？我都可以欸。", thread: "大G" },
      { sender: "大G", body: "我最近有點想吃熱炒欸！可以點幾道菜一起吃，感覺比較輕鬆。妳覺得呢？", thread: "大G" },
    ]},
    { stage: 19, chat: "大G", id: "choose-hot-stir-fry", label: "好啊！那就吃热炒吧，可以点很多菜。", nextStage: 20, lines: [
      { sender: "我", body: "好啊！那就吃熱炒吧，可以點很多菜。", thread: "大G" },
      { sender: "大G", body: "好欸，那就熱炒！妳可以看看附近有沒有想吃的店，到時候把店名或地址傳給我就好，我再看看怎麼過去。", thread: "大G" },
    ]},
    { stage: 20, chat: "大G", id: "find-restaurant", label: "好，我等一下找找看，有看到喜欢的再发给你。", nextStage: 21, lines: [
      { sender: "我", body: "好，我等一下找找看，有看到喜歡的再發給你。", thread: "大G" },
      { sender: "大G", body: "好啊，不急啦！明天再確認也可以。對了，玩玩最近是不是又胖了一點？妳平常都餵牠吃什麼啊？", thread: "大G" },
    ]},
    { stage: 21, chat: "大G", id: "normal-cat-food", label: "就正常猫粮啊！每天定时定量，哪有特别喂它什么。", nextStage: 22, lines: [
      { sender: "我", body: "就正常貓糧啊！每天定時定量，哪有特別餵牠什麼。", thread: "大G" },
      { sender: "大G", body: "真的假的啦？那牠怎麼還是圓了一圈，該不會是自己偷偷加餐喔？哈哈哈。", thread: "大G" },
    ]},
    { stage: 22, chat: "大G", id: "cat-food-followup", label: "可能是它太会吃了吧！而且它每次都一脸无辜，我哪舍得拒绝。", nextStage: 23, lines: [
      { sender: "我", body: "可能是牠太會吃了吧！而且牠每次都一臉無辜，我哪捨得拒絕。", thread: "大G" },
      { sender: "大G", body: "哈哈哈哈，妳這樣真的很容易把牠寵壞欸！不過牠現在看起來應該過得很爽，完全不用擔心了。", thread: "大G" },
    ]},
    { stage: 23, chat: "大G", id: "defend-vava-cute", label: "明明就很可爱！而且它现在越来越会撒娇了。", nextStage: 24, lines: [
      { sender: "我", body: "明明就很可愛！而且牠現在越來越會撒嬌了。", thread: "大G" },
      { sender: "大G", body: "哈哈，聽妳這樣講，感覺牠在妳那邊過得很自在欸。牠現在是不是常常黏著妳？", thread: "大G" },
    ]},
    { stage: 24, chat: "大G", id: "talk-about-vava", label: "对啊！它现在每天都黏着我，常常一副不想理我的样子，结果又一直跟前跟后。", nextStage: 25, lines: [
      { sender: "我", body: "對啊！牠現在每天都黏著我，常常一副不想理我的樣子，結果又一直跟前跟後。", thread: "大G" },
      { sender: "大G", body: "哈哈哈哈，這很像牠欸！明明就很愛跟，還要裝作一副跩跩的樣子。聽起來牠真的被妳照顧得很好，我也放心多了。", thread: "大G" },
    ]},
    { stage: 25, chat: "大G", id: "ask-work-finished", label: "你今天工作忙完了吗？", nextStage: 26, lines: [
      { sender: "我", body: "你今天工作忙完了嗎？", thread: "大G" },
      { sender: "大G", body: "剛忙完啦，現在正要去慶功宴，大家都已經到了，我也差不多要過去了。", thread: "大G" },
    ]},
    { stage: 26, chat: "大G", id: "go-to-celebration", label: "那你先去吧！結束了再聊，記得少喝一點。", nextStage: 30, lines: [
      { sender: "我", body: "那你先去吧！結束了再聊，記得少喝一點。", thread: "大G" },
      { sender: "大G", body: "哈哈哈好啦，我盡量。那我先過去了，晚點再跟妳說。", thread: "大G" },
    ]},
    { stage: 30, chat: "西蓝花", id: "brag-friends", label: "哼哼哼，怪兽说我跟他是朋友～", nextStage: 31, lines: [
      { sender: "我", body: "哼哼哼，怪獸說我跟他是朋友～", thread: "西蓝花" },
      { sender: "西蓝花", body: "……妳等一下，這有什麼好得意成這樣啦？花痴欸妳！人家只是客氣一下，妳已經在那邊自己開心了是不是？", thread: "西蓝花" },
    ]},
    { stage: 31, chat: "西蓝花", id: "broccoli-teases-crush", label: "哪有！我只是觉得他人很好嘛，不行喔？", nextStage: 32, lines: [
      { sender: "我", body: "哪有！我只是覺得他人很好嘛，不行喔？", thread: "西蓝花" },
      { sender: "西蓝花", body: "可以可以，妳慢慢開心。欸，說正事，明天到底要吃什麼？不是說好要一起吃飯？", thread: "西蓝花" },
    ]},
    { stage: 32, chat: "西蓝花", id: "choose-hot-stir-fry-with-broccoli", label: "热炒吧！不过具体去哪家我还没想好。", nextStage: 33, lines: [
      { sender: "我", body: "熱炒吧！不過具體去哪一家我還沒想好。", thread: "西蓝花" },
      { sender: "西蓝花", body: "熱炒不錯欸！附近不是有幾家嗎？我記得阿嬤熱炒好像評價滿好的，菜色也很多。", thread: "西蓝花" },
    ]},
    { stage: 33, chat: "西蓝花", id: "hesitate-famous-person", label: "可是人会不会很多啊？他毕竟是大明星欸，会不会不太方便？", nextStage: 46, lines: [
      { sender: "我", body: "可是人會不會很多啊？他畢竟是大明星欸，跟他一起去熱炒店會不會不太方便？", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳們找個包廂不就好了！而且他自己都說要去吃熱炒了，妳怕什麼啦？", thread: "西蓝花" },
    ]},
    { stage: 97, chat: "西蓝花", id: "tell-broccoli-he-is-nearby", label: "啊啊啊！他说还有半小时就到我家附近了！！", nextStage: 98, lines: [
      { sender: "我", body: "啊啊啊啊啊！他剛剛跟我說還有半小時就到我家附近了！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "等一下！！！妳化妝了嗎？昨天有好好睡覺嗎？？？", thread: "西蓝花" },
    ]},
    { stage: 98, chat: "西蓝花", id: "admit-not-ready", label: "没有……昨天太兴奋了，根本没睡好，也还没来得及化妆。", nextStage: 99, lines: [
      { sender: "我", body: "沒有……我昨天太興奮了，根本沒睡好，而且也還沒來得及化妝。", thread: "西蓝花" },
      { sender: "西蓝花", body: "我就知道……算了啦，他搞不好就喜歡清純的啊。", thread: "西蓝花" },
    ]},
    { stage: 99, chat: "西蓝花", id: "protest-pure-look", label: "你乱说什么啦！！", nextStage: 100, lines: [
      { sender: "我", body: "妳亂說什麼啦！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈哈好啦，我開玩笑的啦！妳快去準備啦，不要讓人家等妳！", thread: "西蓝花" },
    ]},
    { stage: 100, chat: "西蓝花", id: "go-get-ready-now", label: "好啦好啦！我现在就去准备！", nextStage: 101, lines: [
      { sender: "我", body: "好啦好啦！我現在就去準備！", thread: "西蓝花" },
      { sender: "西蓝花", body: "快去快去！等妳忙完再跟我說，祝妳一切順利！", thread: "西蓝花" },
    ]},
    { stage: 101, chat: "西蓝花", id: "scream-monster-handsome", label: "救命啊啊啊怪兽好帅！！真人比照片好看无数倍，怎么可以这么帅？？？", nextStage: 102, lines: [
      { sender: "我", body: "救命啊啊啊怪獸好帥……我的天真人比照片好看無數倍，怎麼可以這麼帥？？？", thread: "西蓝花" },
      { sender: "西蓝花", body: "他鼻子挺不挺？", thread: "西蓝花" },
      { sender: "西蓝花", body: "皮膚白不白？", thread: "西蓝花" },
      { sender: "西蓝花", body: "整個人在陽光下是不是會bulingbuling發光？", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳有沒有看著流口水？", thread: "西蓝花" },
    ]},
    { stage: 102, chat: "西蓝花", id: "insist-i-was-composed-reordered", label: "妳亂說什麼啊！！我很矜持的好不好！！", nextStage: 103, lines: [
      { sender: "我", body: "妳亂說什麼啊！！我很矜持的好不好！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "好好好，矜持。那我再問一個——你們有沒有肢體接觸？有沒有碰到手？快從實招來！", thread: "西蓝花" },
    ]},
    { stage: 103, chat: "西蓝花", id: "deny-contact-before-signature", label: "沒有啦！！就是正常把玩玩交給他而已！！妳不要腦補了啦！", nextStage: 104, lines: [
      { sender: "我", body: "沒有啦！！就是正常把玩玩交給他而已！！妳不要腦補了啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "行吧，就知道妳慫。那妳有沒有幫我要簽名？", thread: "西蓝花" },
    ]},
    { stage: 104, chat: "西蓝花", id: "apologize-no-signature", label: "……沒有，斯米馬賽。", nextStage: 105, lines: [
      { sender: "我", body: "……沒有，斯米馬賽。", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳怎麼這麼沒用！", thread: "西蓝花" },
    ]},
    { stage: 105, chat: "西蓝花", id: "did-not-reveal-fan-reordered", label: "我都沒敢暴露我是粉絲！要什麼簽名啊！！", nextStage: 200, lines: [
      { sender: "我", body: "我都沒敢暴露我是粉絲！要什麼簽名啊！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "啊啊啊啊啊妳怎麼這麼沒用！！！這種近距離接觸的機會欸！！！", thread: "西蓝花" },
      // Big G's home update is queued only after the complete Broccoli exchange.
    ]},
    { stage: 200, chat: "西蓝花", id: "defend-not-useless-v2", label: "我哪裡沒用了！！換成妳妳指不定能當場暈過去好嗎！！！", nextStage: 201, lines: [
      { sender: "我", body: "我哪裡沒用了！！換成妳妳指不定能當場暈過去好嗎！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳少來！我才不會咧！", thread: "西蓝花" },
    ]},
    { stage: 201, chat: "西蓝花", id: "tease-big-screen-v2", label: "也不知道之前是誰，看個演唱會大屏就嗷嗷叫的！", nextStage: 202, lines: [
      { sender: "我", body: "也不知道之前是誰，之前看個演唱會大屏就嗷嗷叫的！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳不也差點暈過去，還說我？", thread: "西蓝花" },
    ]},
    { stage: 202, chat: "西蓝花", id: "low-blood-sugar-and-inner-seats-v2", label: "我那可能是低血糖了吧！", nextStage: 203, lines: [
      { sender: "我", body: "我那可能是低血糖了吧！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳就扯 🙄", thread: "西蓝花" },
      { sender: "西蓝花", body: "哎呀，要是早點買內場就好了，現在指不定就能平靜很多……", thread: "西蓝花" },
      { sender: "西蓝花", body: "而且妳也可以幫我要簽名啊！", thread: "西蓝花" },
    ]},
    { stage: 203, chat: "西蓝花", id: "signature-is-no-problem-v2", label: "簽名簽名簽名！妳就知道簽名！我現在跟怪獸可是朋友，簽名什麼時候要不到！", nextStage: 204, lines: [
      { sender: "我", body: "簽名簽名簽名！妳就知道簽名！我現在跟怪獸可是朋友，簽名什麼時候要不到！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳說得也對！我們要放長線釣大魚，不能急不能急！", thread: "西蓝花" },
    ]},
    { stage: 204, chat: "西蓝花", id: "agree-long-game-v2", label: "妳說得對，妳說得都對。", nextStage: 205, lines: [
      { sender: "我", body: "妳說得對，妳說得都對。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦好啦，不跟妳鬧了！妳先忙，等一下記得回來跟我報告後續！", thread: "西蓝花" },
    ]},
    { stage: 205, chat: "大G", id: "reply-thanks-for-wanwan-v2", label: "沒事啦，應該的！看到玩玩平安到家我就放心了。", nextStage: 206, lines: [
      { sender: "我", body: "沒事啦，應該的！看到玩玩平安到家我就放心了。", thread: "大G" },
      { sender: "大G", body: "我先帶玩玩在家裡玩一會。", thread: "大G" },
      { sender: "大G", body: "晚上八點我去找妳吃飯可以嗎？", thread: "大G" },
      { sender: "大G", body: "我開車過去接妳。", thread: "大G" },
    ]},
    { stage: 206, chat: "大G", id: "accept-eight-pm-pickup-v2", label: "可以的～那你快陪玩玩吧！", nextStage: 207, lines: [
      { sender: "我", body: "可以的～那你快陪玩玩吧！", thread: "大G" },
      { sender: "大G", body: "好，那我先陪牠玩一會，晚點見。", thread: "大G" },
      { sender: "西蓝花", body: "妳在幹嘛？怎麼不理我！", thread: "西蓝花" },
    ]},
    { stage: 207, chat: "西蓝花", id: "report-personal-pickup-v4", label: "啊啊啊啊啊他說要來親自接我！怪獸！親自！開車！", nextStage: 208, lines: [
      { sender: "我", body: "啊啊啊啊啊他說要來親自接我！怪獸！親自！開車！", thread: "西蓝花" },
      { sender: "西蓝花", body: "真的假的？！", thread: "西蓝花" },
      { sender: "西蓝花", body: "好幸福哦，可以坐怪獸的車欸……", thread: "西蓝花" },
      { sender: "西蓝花", body: "也不知道他開什麼車啊。", thread: "西蓝花" },
      { sender: "西蓝花", body: "他開車一定很帥吧……", thread: "西蓝花" },
      { sender: "西蓝花", body: "天哪！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳一定要坐副駕！", thread: "西蓝花" },
      { sender: "西蓝花", body: "看他完美的側臉、高挺的鼻樑……", thread: "西蓝花" },
    ]},
    { stage: 208, chat: "西蓝花", id: "offer-broccoli-to-go-instead", label: "要不妳替我去吧。", nextStage: 209, lines: [
      { sender: "我", body: "要不妳替我去吧。", thread: "西蓝花" },
      { sender: "西蓝花", body: "真的可以嗎？！", thread: "西蓝花" },
      { sender: "西蓝花", body: "那我現在就去收拾！", thread: "西蓝花" },
    ]},
    { stage: 209, chat: "西蓝花", id: "broccoli-joke-and-heartbeat", label: "喂！妳腦子壞了！", nextStage: 210, lines: [
      { sender: "我", body: "喂！妳腦子壞了！", thread: "西蓝花" },
      { sender: "西蓝花", body: "嘿嘿，我開玩笑嘛～", thread: "西蓝花" },
      { sender: "西蓝花", body: "我知道妳現在一定很激動。", thread: "西蓝花" },
      { sender: "西蓝花", body: "一顆心撲通撲通地亂跳，對不對！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳就是太激動了，所以才故作冷漠！", thread: "西蓝花" },
    ]},
    { stage: 210, chat: "西蓝花", id: "shower-mask-before-pickup-v2", label: "妳以為戀愛ing啊！不說了，我要去洗澡敷面膜了！", nextStage: 211, lines: [
      { sender: "我", body: "妳以為戀愛ing啊！不說了，我要去洗澡敷面膜了！", thread: "西蓝花" },
      { sender: "西蓝花", body: "嘖嘖嘖，見色忘友欸！", thread: "西蓝花" },
      { sender: "西蓝花", body: "我什麼時候能有這個待遇啊？", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳跟我出來逛街都不洗頭！", thread: "西蓝花" },
    ]},
    { stage: 211, chat: "西蓝花", id: "silent-face-and-bestie-reassurance", label: "……（無語）", nextStage: 212, lines: [
      { sender: "我", body: "……（無語）", thread: "西蓝花" },
      { sender: "西蓝花", body: "麼麼麼麼，逗妳玩啦～", thread: "西蓝花" },
      { sender: "西蓝花", body: "我知道，不洗頭見面可是最高待遇！", thread: "西蓝花" },
    ]},
    { stage: 212, chat: "西蓝花", id: "banter-before-leaving", label: "就妳會貧！", nextStage: 213, lines: [
      { sender: "我", body: "就妳會貧！", thread: "西蓝花" },
    ]},
    { stage: 213, chat: "西蓝花", id: "hurry-and-report-back-v2", label: "哎呀！時間真的要來不及，我先溜了！", nextStage: 214, lines: [
      { sender: "我", body: "哎呀！時間真的要來不及，我先溜了！", thread: "西蓝花" },
      { sender: "西蓝花", body: "去吧去吧～", thread: "西蓝花" },
      { sender: "西蓝花", body: "記得回來後跟我匯報～", thread: "西蓝花" },
    ]},
    { stage: 214, chat: "西蓝花", id: "bestie-love-mom-goodbye-v2", label: "好啦，愛妳呦，媽媽～", nextStage: -1, lines: [
      { sender: "我", body: "好啦，愛妳呦，媽媽～", thread: "西蓝花" },
    ]},
    { stage: 215, chat: "大G", id: "hotel-apology-for-key-v1", label: "對不起……我也沒想到我會忘記帶鑰匙😭", nextStage: 216, lines: [
      { sender: "我", body: "對不起……我也沒想到我會忘記帶鑰匙😭 讓你破費了。", thread: "大G" },
      { sender: "大G", body: "沒事啦，妳別放在心上。", thread: "大G" },
      { sender: "大G", body: "剛好那家酒店的早餐自助很好吃。", thread: "大G" },
      { sender: "大G", body: "明天我再過去找妳吃早餐，好不好？", thread: "大G" },
    ]},
    { stage: 216, chat: "大G", id: "hotel-breakfast-accept-v2", label: "好啊！", nextStage: 217, lines: [
      { sender: "我", body: "好啊！", thread: "大G" },
    ]},
    { stage: 217, chat: "大G", id: "hotel-breakfast-thanks-v2", label: "哎呀，真的很麻煩你！", nextStage: 218, lines: [
      { sender: "我", body: "哎呀，真的很麻煩你！", thread: "大G" },
      { sender: "大G", body: "不會啦！", thread: "大G" },
      { sender: "大G", body: "都是朋友，這麼客氣幹什麼。", thread: "大G" },
    ]},
    { stage: 218, chat: "大G", id: "hotel-thanks-emoji-v2", label: "真的謝謝妳🥺", nextStage: 219, lines: [
      { sender: "我", body: "真的謝謝妳🥺", thread: "大G" },
      { sender: "大G", body: "哈哈！這個表情好可愛。", thread: "大G" },
    ]},
    { stage: 219, chat: "大G", id: "hotel-cute-emoji-reply-v2", label: "對吧對吧！我可喜歡了！", nextStage: 220, lines: [
      { sender: "我", body: "對吧對吧！我可喜歡了！", thread: "大G" },
      { sender: "大G", body: "很適合妳。", thread: "大G" },
      { sender: "大G", body: "晚上吃飯還好嗎？", thread: "大G" },
      { sender: "大G", body: "不是說很能吃嗎？", thread: "大G" },
      { sender: "大G", body: "但我看妳都沒有吃多少，是不合口味嗎？", thread: "大G" },
    ]},
    { stage: 220, chat: "大G", id: "hotel-dinner-answer-v2", label: "沒有啦！很好吃！", nextStage: 221, lines: [
      { sender: "我", body: "沒有啦！很好吃！", thread: "大G" },
    ]},
    { stage: 221, chat: "大G", id: "hotel-daytime-food-reason-v2", label: "可能白天吃太多了……", nextStage: 222, lines: [
      { sender: "我", body: "可能白天吃太多了……", thread: "大G" },
      { sender: "大G", body: "哈哈，吃飽了好睡覺。", thread: "大G" },
    ]},
    { stage: 222, chat: "大G", id: "hotel-sleepy-cat-photo-v2", label: "對啦，我現在就有點困了。", nextStage: 223, lines: [
      { sender: "我", body: "對啦，我現在就有點困了。", thread: "大G" },
      { sender: "大G", body: "那不打擾妳了。", thread: "大G" },
      { sender: "大G", body: "", thread: "大G", kind: "image", media: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA8LDA0MCg8NDA0REA8SFyYZFxUVFy8iJBwmODE7OjcxNjU9RVhLPUFUQjU2TWlOVFteY2RjPEpsdGxgc1hhY1//2wBDARARERcUFy0ZGS1fPzY/X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1//wAARCAFAAPADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAQIAAwQFBgf/xAA2EAACAgEDAwMDAwMDAgcAAAAAAQIRAwQhMRJBUQUiYRMycUKBkRRSoSMzwQaxFTRiwtHh8P/EABkBAAMBAQEAAAAAAAAAAAAAAAABAgMEBf/EACQRAQEAAgMAAwEAAQUAAAAAAAABAhEDEiETMUFRIgQUQlJh/9oADAMBAAIRAxEAPwDkJgk9gokuDz3eVMIqGQyRclsN01fZlSLE2qEHCeTJ/cPBtxtvcrls3+R8f2nRWKwNAXIwjTsQgQABAEQRBAFABIQjA0CAIAQoAUIIQhANCABYyMKyWCwCNgbI2Cxk6IJ8EBJ7HO3oLgPAqYVyMjRY9lS5GcgDj5V75fljY/tJl/3J/lkx8HR+MP04wAiNCBAICRgCAQKIEAhCEQGiCSiABCgBAIQD4BYBANkbFbGQ2CwWSwCNitleXNGGy3l4QiyuSukVotu2LJFlCyjtuce3TpUhkgOcFy/4Feb+2N/kpJ3sK2VSlklzKvwL0ebZUhMuVN5ZUu40INR3L3GuwKNOyOpKJQ1EoBolBSDQaGRaCkNRKABRKCShkiIiBA0IEaEJz+2LYgQhqhockvukkXr06PebZPaH1rm2K3R2Y6PFDiNv53Enp8cuYIO0HWuPZLOjP05S+yXSVy9NyJbTV/grtC61z5SUeSqU5vikjov0xrd5H/Aj9NfbJ/KK7Qutc3prdc/gqd45f+lnTl6flXEosqn6fna+1P8ADKmUTca6rlkfG34FcG/ubZ0Fpskl7cU5fiLFlpskfuxyj+Ys8/s7NOf9P4J9M2/S+CfSRXYtMX0wOFGuUEiuSHKmxllERo0SRW0i5U2KaJQ7QrLlSUBGwWUk1kFTGGQkp9tyzBp8mon04435Z3dNo8emjFNJyfLZOWcxXjja4cNPmn9uNl0PT88+UkeheOKeyQHExvM0+Jx4emdO8n1GiOnlFUlS+DoqJHHYXyWq6SMKxSS2HUJJ01Zr6QTqEGw7Dqy5KSpbMplL3bFkH9VySXBXOLjIqVNFKmt9mM6fAncfjvxuwplcXzRW4l0fdRXlfS67hKFbihGkRyfkiTfYpL22LDGc4xbq+7NWT0+PS3CW68mVr5YX1VXU68WefjlJPYrLtb5WTLpcGRe/Gpf4f8nL1XprVy08nJf2y5/k7bQvQm0m6sJnY11P15KcJKTjKLTXKYjieo1mixzXTljUq9s1yv8A5POayEtNkePIt+zXDRvjn2RYySVFE2kNkyNsplbN5GdLKV8CN2M0K0aRFKQNBSb2SbK2kEXafDLPlUI/u/AY6bPLjFL+DraLTPBDi5PknLLUVjjutOHFHBjUYxpLuizNmjGDc2kkrsFzW7PN+tayWfO8EHWOHPyzLHHtWmWXWPR6bW4NRaxZYylHlJl733R4ODyYMkcuKTjKLtNHstBqY6zSQzR26luvD7hycXX2HhydvK1x+R+StNrndFkWmtmYWNdoUal+zfsaCjOrjxZWNKsWla+tJWWamLW63MsJdGdt82b8j6oI0vlRPYwNyu0OpdWwqjK6/wAFkYdNS8lpixVCGxnmnKVLll+8k15Hx46903v4J+jJDTqNKr8smSCUvbsXSk0tjPkmuWOB61778D480YRaljUr8itNiSTPOl1Val8pZy7lTm/2LsbiskXk+1Pct1bxSScWnL48D14rtqyaYnb7mfWaJavTSi0rXEvDNfSg30p132YS6u127mniMmJwk4yVSTpoqcDp+pq9fm6Ft1f5rcmj0Lk1kyrbsvJ2zLzdYdfdObHTZZ7xxya80WQ9PzTfu6Yr5e56NYk9qC8Ef7RfKfxuPh9MwR3yNzfybYafBBJQgomh4K4Qv05J72g7b/T66RYkld2Ho8IXdPdjqT7i9Nm1GT6ODJkf6Itnjepyk5S5k7Z6X17PDHop4oy9+SlXxZ5rHvJUdXFPNufkvuj8RaOj6BqXi1E9NJ+ya6or57//AL4MDSrncTHOWnzQyx5gzSzcsRvV29spLmL2Yyq7i9zzUPV5Lsa8XrEW1BLqkzlvHW85I76kpKuGVZWkjDD1HC2kpKU/jsPPURle64sjpZV9pWLUtxydRo0+dTh0t7mXNKM7p7MwzzS00rT2Nuu4z7adpyjF9TfYrlnxQW8kcHP6jJqotmOWpnLmTLx4r+ovJPx6ZarHH3KVbkn6hjXEjzEtRKXcreWT7sqcSflein6mnsmPDI5xts8yskk7svlr8yx9CdfI/i/gnL/X1b6ku0X/AAByk/0S/g7raF6jgv8Ap5P1Xz/+OE45Xxin/AVg1D4wy/g7nUDqJ+LGfp/7i/x5zV5JaSUY504ykrSSs52f1GbTWOPT8s73r2D62ieRL3Ynf7dzzWPDv1T/AGQTDGNsOS5QmDTucvqZOLvfudCC+Cnq6VvJJCS1uDHtLKkO7q5qNi5H2MC1+nltHNBv5dFi1MWtmn+GT1p7am0wPp8mCev06hJrLG18nMn6vlyQahFb7J+C8cLU3OR3JqPS3aVHH1Xq2LC3HF765fYw5M+bJBqWWTvtexy9U7lS7bHRhx++sc8/PDa3VS1OTrm7ZmhNRlbViXQNjqkkmnNb+r3mTfCElktfBU34I5WPQ2ZS3oPU1wypXY/5GkyyySpOl3+S6GqnxOT6bt/JnoDQtSnux18Or+o7lSj2SMWv1TzTUYv2x7mVSaVWI2KYyXZ3K2B1EsVkRog1kFCgCcCt2O0I0Afe4y6oKXlWBsVzVCOfyePlm1mJ3InUUvIhHlM+y5gbU+6CX6W6kvKex5XI+iTi1dOj0mTLtyeeypSnKVctsfd08OFZsk3JNVSOTmi4TaybJ8M7MorwczXyhVNpr4NOPLd00zx1NudlX4M0lJcWvwWSnWwrm68nZPHLdVnk3fI+Ob63v2/yVzdsEOW/CNdMf1ryZKxqtmY5ycpMbqsrfLDGaFuyyQtD8sLSS+S9pVAodxFGlEqCREA0I2R7CgQXYGRkGRWQjAMkIQIGKBIligH2n6y8ivN8nGjmzY397n8MmTWal10JLzaPAer8OnWeUR5KVt0cd6jVy/Uo/hGHU+oY8dqeV5pr9Kew5jb9H0mP27Wp1XXBxxSvy0cfP6hhw2nLql4RyNRr82VOPV0Q/tiY5SOjDg/7IvLMfMW7VepZs1xUuiPiJljl6qi3sjO2xOppnVjhJNRz5Z23dW5PJTKTSqwtubpbIWcdzSRnar5DwSgyS6duS0kumBvcDI+LKSF0yJ2xbIuRkd0/kAVvsiVsIASiXQrd8DCMlBUW+xGq5aQEQDLOlP8AV/CClFfIbGlXSwOJc6YjHsaVNUAdiDShAWEYfV3jSV7JI5er9U0mnbjB/Wn4jx/JxtX6hqtZay5Kh/ZHZGPpZ5OPBP8Ak9W8t/GrVeo6jVWpS6IP9Mdl/wDZje43QN0bG8kn0xtt+1LFaLnFISipU1S0K4nRxem6rMrWLpT7y2NeP0Wd/wCpmiviKDvIXW1xYe3lDqKabO3/AOE6aqcp9Xlsy5fS8mK3jfXDuq3CcmNK4WOV0rkpnwac0XHatjNJm0ZVVe4XwBunwPiTyPpRaFTQO5Zlg4PcrSsZHTpbAb7csFOwpXtYGG3d2Tq7IdQj3bbDaXCSDY0SpPngiSXyFyvsDnsII3sAjtAt+Rg1eBSWyDIrRW0WsrlyOFSkIQZPSqBOlDJiyZ570U2A2DqNfp2gya7L/bii/dL/AIC+e0vtTpdJm1mTpxR2XMnwj0Gk9LwaVJ9PXk7yl/wb8WDFpsSx4oKMV4FnKkYZcly+mkxkU5ZKEdjFkztOrtD6mfbs+5g5ko92PGFa1LqnP29+DbDS+3duhdFgpJtXL/sbZRpbuhWiR5r1X06eSTlhhv3+Tz+bDPG+mcJRfyj6A4pbWm/NFeWEZLonFNPybYctnjLPjl9fO5RZbplWaL7Hq9R6V6fNtfS6JN7uEqr/AIOPqdDjwyfRLrxp/udE5ZYxvHY5uaV9W3cohBvejZOEV7ktiiU0tlwi5f4mz+mhi6o7kliUXyqK5Zn2dFTyNhJSti59KVLkrbXZC71yTqcd07K0Vpoqt2HqbVUiKV77AfS33TAhe6qq/BXKPdOxqX4YLff+RggSMljIGIxmxGOFUATkPSxk9HaK5TEcx9Lp8uszxw4Vcny+yXk4dO/bT6fosmvz9EdoLecvCPYYcOPTYY4sUajHhFWk02LRaeOHEtly33fkslk+djmzy7Xz6a4zSZJUY82Ts2WZJq+9mbJKStJpCkFqjLKL4/gz4V1Z23yuC2eV21JcFeGVZpP9zX8Q7OGXTFIuk20jFhnurL55KXSmtzLXq9hPIoctWZ8mpiuX1Moz/UnfT2+DnZ1kjL3cGuOKLW3LqY0/Yt1ycjWZMcY+2T43TK8+o6Lt7nMzZnkbbZvhgxyyTNlctlwZ3Ijdi7nRJpz27R7gSvgNOgFEsjJRV1flMl9O6rpYtXu2Tqj2QjGle3AN19y2J1BU/KVASbedifh2DqT+AMAZoVgsjY9ArFfIzvsiLHN8Qk/whpAlvsFxlH7otflAAOrFTyTUYJyk3SS7ntPSdBH0/TJSSeeaub/4MH/T/piwwWszx/1JL2Rf6V5OxOb4Sf5PO5c9/wCMejhjr2pPJTezspllk9qTfgWbe+37srjd0nszKRdpnJJf+5lMpX8lk/CpRXBROW1PYqJqnLvxs/DKE6yL8DzVv2p0u9lOR9Movk0kRXTwz2q/yy/qUYuc/wBjDp3w5b+ETW6j6eNu0miNeq34TV6/p22OPn17knvwYdVq3km6ZjlNvudWHE58uRZlyynJyk+SptgbBbN5GNo7kB1RrigP4GRrrYFikHotp3CPjxyyP2o2YdFf3Mm5SHMbWFRb4RZHBll9sGdzT6KLqkdLDpowS9iszvLppOJ5nF6bqcn6HR0MPokaX1JSb8cHooY1Wyof6aT3MrzWtZxSOPj9G0i5w9X5bNMPTNPD7cMVXwdLoS70u5Go101T8md5LVzCRlWmhHiCX7BWKK7Ky9pRaTV/uS0t628C3T0zvHjkvdCM+zVWZsvpWiyRt6WMX8KjodSrZNx/Altu/cmOZWfQ6yulkmlwZ5T8knJ9v8lDpu5bmMjTZ3LbZKv+4kncfZt5+SuclwtxY9baorRbWSTUfdKk+yKfp9b2Za4b7tyfhBm+mNLfzYEzTj9NUqsxZpf6ivyasjcnKlXwc/UPpa/JpjEZOhhn7XLwcz1jUtQ6E1bfY0Y8lwSvbk4evyvJnk3wtkaYY/5Izy8ZGxGwtinVI5rTdiL8gIxkhCBAAW4sTk1fA+n088r9sG/2O5pPR886c0oL5M885F44WsWHHSVI6ODBKXJ09P6Xjx8u/wBjbDT4Yq+lM5suSOjHjYMOGuxqjjNC6E6SVLwBzTb8IyuW2smixjLxXyN0Pm0VyzWK88UhGua23ewnsj2v8meWeyqeZ1SAmqWWKfb4K5Z7fJhnmcnyCOTpK0W2/r+RXkXkxvK3yxetj0NupknfcplN1S5JN/uZ3N3VNEyHasT63u9kXQT6fbSXyyiLX6eRvqNbNbgFvC3k0VTunvaJ10t/4ElK2ELZem99vyYdfH2WuzOit1t/Bj1cbxS2Lx+036YccvZRydV/uS+DqY1s0c3W43GbdbM6MPthn9MYQEN2IBAMt9gJIpt0t2dXRaBOpZFZn0mBKSnPk6+KaS2Mc8v42wx/rp6TFjxxVJG5ZK4VnIx5vDo0R1G1RZyZS1042Oh9R1c9l4K8mbsmZnk6u+yEcidK20vNaUY7eRVkai9ylOkC9mg0Dym2qsqk9+SOXwRYpz+EMgUwSkmF4endyFcFV2Mlc9iu3VjzTrZAjCVb7FkTron1EO8a7iPCvIeE6MpTUtw1atO2HrjPaS3FcWt4tELGK23X7obp/CRX1PxTC3KuABpJLhGZtqRZKVbAx7tuhwqZSpFWfeErL2troplumOCuWlUgZsMckdy2SFUjTbNxc+ncG6WxVHFN9juzw/Ud1sBaTwjWcnjK8bkR0s3y6NGLR0zqR0j8M2YPTZSpytIm8qpxuXj0y23NuLRuVdNv9jr4tDhxpe1N/JqjCKVJbGGXI2mDlY/TpvltF0fTpL9Z0kQjtavq5/8ARTX64sP9HP8AuRvpEFsaYlo9t52MtHHyzXRHsGwojpMaob6UaaV7ljmhfqR4EFL02J8rgR6XH2iaepAcrGGb+mx/2kemx1TRosA9jTJLTQ8tC/00fJsaRXJIZaY27dcMZVVS2fZit97sik2AWJT5TT/JHO1xTE6kvtTC8lqqAK5PtVFmJUkVS3ZfjVRtjpJN3sJkj0x35L4R2soyvZoUOuZjd5GaI4YvdJWZ8KvI/wAm2MWjWs4Kw7V2LseBXbIti2PU+xnavSyEIx7F0WVwh3ZdH4RFqjLz2DfgASTRDChAIwpEQJzSQwkpUiieVCzyGac7sqRNq76qfcikY1Oh1kL0W2nqaIsjKFkGc0xaG131PknWZ3xsL1NchobanIRyKesnWg0NqL6WG5J32G6bjfJFxa3XgAi6mgNvxsHr8fwJJjBU7mjXBXS7GSH3muDpWwoh5ypUiifDGk7EfApAwYUlk38nQgYkunPXyboPgupi+KTLEq4Kol0XsZVpDr5HWyFiu7HSsk0QSX2BaAIFIgJOkAGUqKJzsmSWxRK/JUhUs5GeUh5yZVyzSM6VtjJizFToolyA20V9bApuxaNcptDqSfJVGmGhA7XgR2idQepDMsZU+RpO91sysKl5JCN2wNh+CuTHBT4t2aL2oowoschUQzewAXY2wGzTr+o/Y0w8mXL/AOYX4NWMd+in20wXwXwiUw2LosyrSLaI34FukI5CMWxercDkJJ0h6Jc5iSmvJR9QR5CtJ2tlIrlIRzK3PcqQrRnuIlsG9hlwUlRLkV7Fk1uJJOhkTljqLFi0h1NAE3QeonUmBpCMbA2KSwIzARsFiUayuQzEbtjJox/aGm2LDgsghU4ihXIzdEbsSSfJJqM1fVizTjMeaVZImrGyr9Jn21wZamUQZfHyzKtYdvYrcgTkVuQSC0XLcXLLYW/cJllsXInZZT2KuvcVyfBW5blyI2ucthOq2I5CxluPRbX2WQ3RQmXx4EYTF5QZMVMYJOPgrNKK5w8AVVKVDKYtUB7DJZ1ESb4Fxxcn8GuEFFCvhx//2Q==", id: "hotel-wannwan-sleeping-photo-v2" },
      { sender: "大G", body: "玩玩都睡著了。", thread: "大G", id: "hotel-wannwan-sleeping-caption-v2" },
    ]},
    { stage: 223, chat: "大G", id: "hotel-cat-is-cute-v2", label: "好可愛！", nextStage: 224, lines: [
      { sender: "我", body: "好可愛！", thread: "大G" },
    ]},
    { stage: 224, chat: "大G", id: "hotel-pat-cat-goodnight-v2", label: "幫我摸摸！", nextStage: 225, lines: [
      { sender: "我", body: "幫我摸摸！", thread: "大G" },
      { sender: "大G", body: "好啦！", thread: "大G" },
      { sender: "大G", body: "我替玩玩跟妳說晚安。", thread: "大G" },
    ]},
    { stage: 225, chat: "大G", id: "hotel-final-goodnight-v2", label: "嗯嗯，晚安！做個好夢！🌙", nextStage: 226, lines: [
      { sender: "我", body: "嗯嗯，晚安！做個好夢！🌙", thread: "大G" },
    ]},
    { stage: 227, chat: "西蓝花", id: "hotel-night-broccoli-reply-v1", label: "……我都不知道要怎麼跟妳說。", nextStage: 228, lines: [
      { sender: "我", body: "……我都不知道要怎麼跟妳說。", thread: "西蓝花" },
      { sender: "西蓝花", body: "怎麼了？", thread: "西蓝花" },
    ]},
    { stage: 228, chat: "西蓝花", id: "hotel-night-misunderstanding-v1", label: "……我現在在酒店。", nextStage: 229, lines: [
      { sender: "我", body: "……我現在在酒店。", thread: "西蓝花" },
      { sender: "西蓝花", body: "？？？", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳們進展這麼快？", thread: "西蓝花" },
      { sender: "西蓝花", body: "大嗎？", thread: "西蓝花" },
      { sender: "西蓝花", body: "活好嗎？", thread: "西蓝花" },
      { sender: "西蓝花", body: "舒服嗎？", thread: "西蓝花" },
    ]},
    { stage: 229, chat: "西蓝花", id: "hotel-key-explanation-v1", label: "什麼啊！！是我出門忘記帶鑰匙了，回不了家！！！", nextStage: 230, lines: [
      { sender: "我", body: "什麼啊！！是我出門忘記帶鑰匙了，回不了家！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "……白激動了。", thread: "西蓝花" },
    ]},
    { stage: 230, chat: "西蓝花", id: "hotel-yellow-thoughts-v1", label: "妳腦子裝的都是什麼啊！黃色廢料！！", nextStage: 231, lines: [
      { sender: "我", body: "妳腦子裝的都是什麼啊！黃色廢料！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳自己說的在酒店啊。", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳們前面剛吃完飯，現在就在酒店，讓人很難不多想啊🥺", thread: "西蓝花" },
    ]},
    { stage: 231, chat: "西蓝花", id: "hotel-first-meeting-worry-start-v2", label: "……（無語）唉，怎麼辦啊？", nextStage: 232, lines: [
      { sender: "我", body: "……（無語）唉，怎麼辦啊？", thread: "西蓝花" },
    ]},
    { stage: 232, chat: "西蓝花", id: "hotel-first-meeting-worry-middle-v2", label: "第一次見面就鬧成這樣，", nextStage: 233, lines: [
      { sender: "我", body: "第一次見面就鬧成這樣，", thread: "西蓝花" },
    ]},
    { stage: 233, chat: "西蓝花", id: "hotel-first-meeting-worry-end-v2", label: "他不會以為我故意不帶鑰匙，想騙他去酒店吧？", nextStage: 234, lines: [
      { sender: "我", body: "他不會以為我故意不帶鑰匙，想騙他去酒店吧？", thread: "西蓝花" },
      { sender: "西蓝花", body: "嗯……他現在對妳的態度怎麼樣？", thread: "西蓝花" },
    ]},
    { stage: 234, chat: "西蓝花", id: "hotel-breakfast-attitude-v2", label: "還好吧，沒什麼變化。", nextStage: 235, lines: [
      { sender: "我", body: "還好吧，沒什麼變化。", thread: "西蓝花" },
    ]},
    { stage: 235, chat: "西蓝花", id: "hotel-breakfast-habit-v2", label: "前面還問我酒店住得習不習慣。", nextStage: 236, lines: [
      { sender: "我", body: "前面還問我酒店住得習不習慣。", thread: "西蓝花" },
    ]},
    { stage: 236, chat: "西蓝花", id: "hotel-breakfast-invitation-v2", label: "哦對，他說明早要來找我吃早飯。", nextStage: 237, lines: [
      { sender: "我", body: "哦對，他說明早要來找我吃早飯。", thread: "西蓝花" },
      { sender: "西蓝花", body: "他這是在約妳？", thread: "西蓝花" },
    ]},
    { stage: 237, chat: "西蓝花", id: "hotel-breakfast-excuse-start-v2", label: "啊？不是啦，", nextStage: 238, lines: [
      { sender: "我", body: "啊？不是啦，", thread: "西蓝花" },
    ]},
    { stage: 238, chat: "西蓝花", id: "hotel-breakfast-excuse-end-v2", label: "他說這家酒店的早餐自助很好吃。", nextStage: 239, lines: [
      { sender: "我", body: "他說這家酒店的早餐自助很好吃。", thread: "西蓝花" },
      { sender: "西蓝花", body: "這他媽是他的藉口吧，他就是想跟妳繼續接觸。", thread: "西蓝花" },
    ]},
    { stage: 239, chat: "西蓝花", id: "hotel-mom-interview-defense-start-v2", label: "妳亂說什麼啊……", nextStage: 240, lines: [
      { sender: "我", body: "妳亂說什麼啊……", thread: "西蓝花" },
    ]},
    { stage: 240, chat: "西蓝花", id: "hotel-mom-interview-defense-middle-v2", label: "我有什麼好接觸的，", nextStage: 241, lines: [
      { sender: "我", body: "我有什麼好接觸的，", thread: "西蓝花" },
    ]},
    { stage: 241, chat: "西蓝花", id: "hotel-mom-interview-defense-simple-v2", label: "他就是單純人好。", nextStage: 242, lines: [
      { sender: "我", body: "他就是單純人好。", thread: "西蓝花" },
    ]},
    { stage: 242, chat: "西蓝花", id: "hotel-mom-interview-defense-interview-v2", label: "妳沒考古之前的採訪嗎？", nextStage: 243, lines: [
      { sender: "我", body: "妳沒考古之前的採訪嗎？", thread: "西蓝花" },
    ]},
    { stage: 243, chat: "西蓝花", id: "hotel-mom-interview-defense-mom-v2", label: "都說怪獸像媽媽，", nextStage: 244, lines: [
      { sender: "我", body: "都說怪獸像媽媽，", thread: "西蓝花" },
    ]},
    { stage: 244, chat: "西蓝花", id: "hotel-mom-interview-defense-end-v2", label: "他就是單純關心我而已。", nextStage: 245, lines: [
      { sender: "我", body: "他就是單純關心我而已。", thread: "西蓝花" },
      { sender: "西蓝花", body: "我話放這了，他要是沒看上妳，我跟妳姓！", thread: "西蓝花" },
    ]},
    { stage: 245, chat: "西蓝花", id: "hotel-bestie-surname-challenge-v1", label: "那妳跟我姓！天天就知道亂說話，一個大明星什麼漂亮女生沒見過啊，能看上我？", nextStage: 246, lines: [
      { sender: "我", body: "那妳跟我姓！天天就知道亂說話，一個大明星什麼漂亮女生沒見過啊，能看上我？", thread: "西蓝花" },
      { sender: "西蓝花", body: "緣分很難說啊！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳能撿到他的貓，這完全就是上天的旨意！", thread: "西蓝花" },
      { sender: "西蓝花", body: "🙏", thread: "西蓝花" },
      { sender: "西蓝花", body: "苟富貴，勿相忘！", thread: "西蓝花" },
    ]},
    { stage: 246, chat: "西蓝花", id: "hotel-bestie-godsend-reply-v1", label: "……行，我當上嫂子了妳就是怪獸嫂閨蜜。", nextStage: 247, lines: [
      { sender: "我", body: "……行，我當上嫂子了妳就是怪獸嫂閨蜜。", thread: "西蓝花" },
    ]},
    { stage: 247, chat: "西蓝花", id: "hotel-bestie-go-sleep-v1", label: "早點睡吧妳，夢裡啥都有。", nextStage: 248, lines: [
      { sender: "我", body: "早點睡吧妳，夢裡啥都有。", thread: "西蓝花" },
      { sender: "西蓝花", body: "嘻嘻，晚安啦怪獸嫂～", thread: "西蓝花" },
    ]},
    { stage: 248, chat: "西蓝花", id: "hotel-bestie-goodnight-end-v1", label: "滾。", nextStage: 249, lines: [
      { sender: "我", body: "滾。", thread: "西蓝花" },
    ]},
    { stage: 249, chat: "大G", id: "drunk-night-call-out-v1", label: "溫尚翊你混蛋！你耍我！！！", nextStage: 250, lines: [
      { sender: "我", body: "溫尚翊你混蛋！", thread: "大G" },
      { sender: "我", body: "你耍我！！！", thread: "大G" },
      { sender: "大G", body: "？", thread: "大G" },
      { sender: "大G", body: "妳還沒睡嗎？", thread: "大G" },
    ]},
    { stage: 250, chat: "大G", id: "drunk-night-why-prank-v1", label: "你管我睡沒睡！", nextStage: 251, lines: [
      { sender: "我", body: "你管我睡沒睡！", thread: "大G" },
    ]},
    { stage: 251, chat: "大G", id: "drunk-night-demand-explain-v1", label: "說！", nextStage: 252, lines: [
      { sender: "我", body: "說！", thread: "大G" },
      { sender: "我", body: "你為什麼耍我！", thread: "大G" },
      { sender: "大G", body: "我耍妳什麼了喔？", thread: "大G" },
      { sender: "大G", body: "突然這麼兇🤕", thread: "大G" },
    ]},
    { stage: 252, chat: "大G", id: "drunk-night-no-emoji-v1", label: "你說你耍我什麼了！", nextStage: 253, lines: [
      { sender: "我", body: "你說你耍我什麼了！", thread: "大G" },
      { sender: "我", body: "還有！不准用我的表情！", thread: "大G" },
      { sender: "大G", body: "好啦好啦，我不用。", thread: "大G" },
      { sender: "大G", body: "怎麼了這是？", thread: "大G" },
    ]},
    { stage: 253, chat: "大G", id: "drunk-night-fake-photo-v1", label: "我說你給我發玩玩的照片是假的！", nextStage: 254, lines: [
      { sender: "我", body: "我說你給我發玩玩的照片是假的！", thread: "大G" },
      { sender: "我", body: "根本點不開！", thread: "大G" },
      { sender: "我", body: "我還以為是我網不好呢！", thread: "大G" },
      { sender: "我", body: "結果我一看你發的明明是個表情包！", thread: "大G" },
      { sender: "大G", body: "哈哈，被妳發現。", thread: "大G" },
    ]},
    { stage: 254, chat: "大G", id: "drunk-night-why-laugh-v1", label: "你還好意思笑，耍我很好玩嗎？", nextStage: 255, lines: [
      { sender: "我", body: "你還好意思笑，耍我很好玩嗎？", thread: "大G" },
      { sender: "大G", body: "拍謝啦，今天剛看到這個表情包，覺得很有意思🤕", thread: "大G" },
    ]},
    { stage: 255, chat: "大G", id: "drunk-night-stop-emoji-v1", label: "我都說了你不准用我的表情！", nextStage: 256, lines: [
      { sender: "我", body: "我都說了你不准用我的表情！", thread: "大G" },
      { sender: "大G", body: "拍謝拍謝，我錯了大小姐。", thread: "大G" },
    ]},
    { stage: 256, chat: "大G", id: "drunk-night-forgive-v1", label: "哼，這還差不多。", nextStage: 257, lines: [
      { sender: "我", body: "哼，這還差不多。", thread: "大G" },
    ]},
    { stage: 257, chat: "大G", id: "drunk-night-feeling-sick-v1", label: "嗚嗚嗚嗚嗚我好難受，頭好暈，臉好熱。", nextStage: 258, lines: [
      { sender: "我", body: "嗚嗚嗚嗚嗚我好難受，頭好暈，臉好熱。", thread: "大G" },
      { sender: "大G", body: "欸？妳怎麼了？", thread: "大G" },
      { sender: "大G", body: "前面不是還好好的嗎？", thread: "大G" },
    ]},
    { stage: 258, chat: "大G", id: "drunk-night-sparkling-wine-v1", label: "嗚嗚嗚嗚我太渴了，去冰箱找飲料喝。", nextStage: 259, lines: [
      { sender: "我", body: "嗚嗚嗚嗚我太渴了，去冰箱找飲料喝。", thread: "大G" },
      { sender: "我", body: "喝完才發現是氣泡酒嗚嗚嗚嗚嗚😭", thread: "大G" },
      { sender: "大G", body: "等一下，妳喝了多少？", thread: "大G" },
    ]},
    { stage: 259, chat: "大G", id: "drunk-night-one-bottle-v1", label: "還好啦，就一瓶……", nextStage: 260, lines: [
      { sender: "我", body: "還好啦，就一瓶……", thread: "大G" },
      { sender: "大G", body: "一瓶？妳先不要再喝了，旁邊有沒有水？", thread: "大G" },
      { sender: "大G", body: "先坐下來休息一下，不要自己亂跑。", thread: "大G" },
    ]},
    { stage: 260, chat: "大G", id: "drunk-night-hotel-water-complaint-v1", label: "你混蛋！你定的什麼破酒店！都沒有水！！", nextStage: 261, lines: [
      { sender: "我", body: "你混蛋！", thread: "大G" },
      { sender: "我", body: "你定的什麼破酒店！", thread: "大G" },
      { sender: "我", body: "都沒有水！！", thread: "大G" },
      { sender: "大G", body: "好啦好啦，先不要生氣。", thread: "大G" },
      { sender: "大G", body: "我幫妳想辦法，先看看房間裡有沒有瓶裝水，或是打電話請櫃檯送上去。", thread: "大G" },
      { sender: "大G", body: "妳先坐著，慢慢來，不要再喝酒了，好不好？", thread: "大G" },
    ]},
    { stage: 261, chat: "大G", id: "drunk-night-no-reply-before-bilibili-v1", label: "（先不回覆，退出聊天）", nextStage: 262, lines: []},
    { stage: 262, chat: "大G", id: "drunk-night-bilibili-ping-v1", label: "你彈琴好帥啊溫尚翊...........", nextStage: 263, lines: [
      { sender: "我", body: "你彈琴好帥啊溫尚翊...........", thread: "大G" },
      { sender: "大G", body: "？", thread: "大G" },
      { sender: "大G", body: "是啦是啦，我很帥。", thread: "大G" },
      { sender: "大G", body: "現在放下手機睡覺好不好？", thread: "大G" },
    ]},
    { stage: 263, chat: "大G", id: "drunk-night-want-bilibili-v1", label: "不要！我不困！我要去B站刷視頻！", nextStage: 264, lines: [
      { sender: "我", body: "不要！我不困！", thread: "大G" },
      { sender: "我", body: "我要去B站刷視頻！", thread: "大G" },
      { sender: "大G", body: "視頻明天也可以看，對不對？", thread: "大G" },
      { sender: "大G", body: "現在很晚了，該睡了。", thread: "大G" },
    ]},
    { stage: 264, chat: "大G", id: "drunk-night-stay-awake-v1", label: "不要！", nextStage: 265, lines: [
      { sender: "我", body: "不要！", thread: "大G" },
      { sender: "大G", body: "好啦，聽話，先休息一下。", thread: "大G" },
    ]},
    { stage: 265, chat: "大G", id: "drunk-night-nausea-v2", label: "不行！一會再跟你說，我想吐了！", nextStage: 266, lines: [
      { sender: "我", body: "不行！一會再跟你說，我想吐了！", thread: "大G" },
      { sender: "大G", body: "怎麼突然想吐了？", thread: "大G" },
      { sender: "大G", body: "妳先坐著，不要亂動。", thread: "大G" },
      { sender: "大G", body: "有沒有很不舒服？", thread: "大G" },
      { sender: "大G", body: "先不要再喝了，聽到沒有？", thread: "大G" },
      { sender: "大G", body: "我有點擔心妳。", thread: "大G" },
    ]},

    { stage: 106, chat: "西蓝花", id: "bestie-interrogation", label: "我真的快晕了……你不要再说了！！", nextStage: 107, lines: [
      { sender: "我", body: "我真的快暈了……妳不要再說了！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "等一下，先回答我！他鼻子挺不挺？皮膚白不白？本人是不是比照片還好看？", thread: "西蓝花" },
    ]},
    { stage: 107, chat: "西蓝花", id: "insist-i-was-composed", label: "你乱说什么啊！！我很矜持的好不好！！", nextStage: 108, lines: [
      { sender: "我", body: "妳亂說什麼啊！！我很矜持的好不好！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "好好好，矜持。那我再問一個——你們有沒有肢體接觸？有沒有碰到手？快從實招來！", thread: "西蓝花" },
    ]},
    { stage: 108, chat: "西蓝花", id: "deny-contact-teasing", label: "没有啦！！就是正常把玩玩交给他而已！！", nextStage: 109, lines: [
      { sender: "我", body: "沒有啦！！就是正常把玩玩交給他而已！！妳不要腦補了啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈好啦好啦，不逗妳了。不過妳現在是不是小鹿亂撞，一顆心撲通撲通狂跳啊？？", thread: "西蓝花" },
    ]},
    { stage: 109, chat: "西蓝花", id: "shower-mask-and-date-prep", label: "妳以為戀愛ing啊！不說了，我要去洗澡敷面膜了！", nextStage: 110, lines: [
      { sender: "我", body: "妳以為戀愛ing啊！不說了，我要去洗澡敷面膜了！", thread: "西蓝花" },
      { sender: "西蓝花", body: "嘖嘖，見色忘友欸！剛剛還在這裡跟我尖叫，現在就急著去洗澡敷面膜了喔？", thread: "西蓝花" },
    ]},
    { stage: 110, chat: "西蓝花", id: "bestie-begging-goodbye", label: "嗯嗯我就是見色忘友！我愛怪獸！我去準備了媽媽拜拜！！", nextStage: -1, lines: [
      { sender: "我", body: "嗯嗯我就是見色忘友！我愛怪獸！我去準備了媽媽拜拜！！", thread: "西蓝花" },
    ]},
    { stage: 111, chat: "大G", id: "after-dinner-arrived-home", label: "剛到！玩玩還好嗎？", nextStage: 112, lines: [
      { sender: "我", body: "剛到！玩玩還好嗎？", thread: "大G" },
      { sender: "大G", body: "很好啦，能吃能喝的。對了，牠在妳家吃的是哪一款貓糧？感覺很不錯的樣子。", thread: "大G" },
    ]},
    { stage: 112, chat: "大G", id: "recommend-orijen-chicken", label: "渴望啦，就是很普通的那個雞肉味。", nextStage: 113, lines: [
      { sender: "我", body: "渴望啦，就是很普通的那個雞肉味。", thread: "大G" },
      { sender: "大G", body: "好哦，那我去網購一點好了～", thread: "大G" },
    ]},
    { stage: 113, chat: "大G", id: "offer-cat-food-shop", label: "嗯呐，我有一個常買的店家可以推薦給你。", nextStage: 114, lines: [
      { sender: "我", body: "嗯呐，我有一個常買的店家可以推薦給你。", thread: "大G" },
      { sender: "大G", body: "那就太好了！", thread: "大G" },
    ]},
    { stage: 114, chat: "大G", id: "ask-about-a-ma-hot-stir-fry", label: "對了，你覺得阿嬤熱炒好吃嗎？", nextStage: 115, lines: [
      { sender: "我", body: "對了，你覺得阿嬤熱炒好吃嗎？", thread: "大G" },
      { sender: "大G", body: "好吃！就是人好多……", thread: "大G" },
    ]},
    { stage: 115, chat: "大G", id: "agree-hot-stir-fry-crowded", label: "對啊，網紅店真的沒辦法！還好我們去得還比較早。", nextStage: 116, lines: [
      { sender: "我", body: "對啊，網紅店真的沒辦法！還好我們去得還比較早。", thread: "大G" },
      { sender: "大G", body: "真的，妳家附近好吃的店好多，下次可以試試別的。", thread: "大G" },
    ]},
    { stage: 116, chat: "大G", id: "agree-try-another-restaurant", label: "好呀！", nextStage: 117, lines: [
      { sender: "我", body: "好呀！", thread: "大G" },
    ]},
    { stage: 117, chat: "西蓝花", id: "tell-broccoli-next-restaurant", label: "怪獸說下次要跟我試試別的店！！", nextStage: 118, lines: [
      { sender: "我", body: "怪獸說下次要跟我試試別的店！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "？？？等一下，他是在約會嗎？？？", thread: "西蓝花" },
    ]},
    { stage: 118, chat: "西蓝花", id: "deny-monster-date", label: "不可能吧，他一個大明星，找我約會幹什麼？", nextStage: 119, lines: [
      { sender: "我", body: "不可能吧，他一個大明星，找我約會幹什麼？", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳不要急著否認啦！一般會主動說『下次再試試別家』，就是想跟妳再約下一次啊！這聽起來就很有意思欸。", thread: "西蓝花" },
    ]},
    { stage: 119, chat: "西蓝花", id: "explain-cat-food-gratitude", label: "萬一是因為我推薦了貓糧，他很感激呢！", nextStage: -1, lines: [
      { sender: "我", body: "萬一是因為我推薦了貓糧，他很感激呢！", thread: "西蓝花" },
      { sender: "大G", body: "我就是想謝謝妳一下，妳給我推薦的貓糧啦。", thread: "大G" },
    ]},
    { stage: 46, chat: "西蓝花", id: "private-room-and-queue", label: "好像也是……那到时候我提前去排队好了！不过我又开始烦恼明天穿什么了。", nextStage: 47, lines: [
      { sender: "我", body: "好像也是欸……那就找個包廂好了！人多的話我到時候提前去排隊，先把位置弄好。可是……我現在又開始煩惱明天到底要穿什麼了。", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈妳也太忙了吧，餐廳都還沒吃到，現在先煩惱穿搭喔？", thread: "西蓝花" },
    ]},
    { stage: 47, chat: "西蓝花", id: "outfit-worry-and-shower", label: "我真的想不出来啦！怎么想都觉得不对劲。", nextStage: 48, lines: [
      { sender: "我", body: "我真的想不出來啦！衣櫃裡的衣服怎麼想都覺得不對勁，明天到底要穿什麼啊……", thread: "西蓝花" },
      { sender: "西蓝花", body: "不要穿白衣服就好了啦！妳怎樣都好看啦，真的不用想那麼多。好啦不跟妳聊了，我要去洗澡了！", thread: "西蓝花" },
    ]},
    { stage: 48, chat: "大G", id: "ask-celebration-ended", label: "庆功宴结束了吗？你现在是在回酒店的路上吗？", nextStage: 49, lines: [
      { sender: "我", body: "慶功宴結束了嗎？你現在是在回酒店的路上嗎？", thread: "大G" },
      { sender: "大G", body: "結束啦，現在正要回酒店。今天真的又喝了好多酒，從頭到尾一直有人來敬，推都推不掉，現在整個人都有點暈。", thread: "大G" },
    ]},
    { stage: 49, chat: "大G", id: "check-drinking", label: "怎么又喝这么多？你还好吗，有没有不舒服？", nextStage: 50, lines: [
      { sender: "我", body: "怎麼又喝這麼多啦？你還好嗎？有沒有哪裡不舒服？", thread: "大G" },
      { sender: "大G", body: "還好啦，沒有到不舒服，就是有點暈而已。今天大家難得聚在一起，又一直被拉去聊天、敬酒，真的躲不掉。", thread: "大G" },
    ]},
    { stage: 50, chat: "大G", id: "remind-water-and-rest", label: "那你回去先喝点水，洗个澡早点休息，别再熬夜了。", nextStage: 51, lines: [
      { sender: "我", body: "那你回去先喝點水，洗個澡早點休息啦，不要再熬夜了。喝那麼多明天一定會不舒服。", thread: "大G" },
      { sender: "大G", body: "知道啦，妳怎麼突然變得這麼像保健室阿姨，哈哈哈。我有帶水，回去先灌一大杯。", thread: "大G" },
    ]},
    { stage: 51, chat: "大G", id: "tease-party", label: "我这是关心你欸！庆功宴很开心吗？", nextStage: 52, lines: [
      { sender: "我", body: "我這是在關心你欸！所以慶功宴還開心嗎？大家是不是聊到很晚？", thread: "大G" },
      { sender: "大G", body: "還不錯啦，好久沒跟大家這樣聚了，聊了很多以前的事。只是每次聚會都變成喝酒大賽，真的有夠累。", thread: "大G" },
    ]},
    { stage: 52, chat: "大G", id: "ask-about-work", label: "你们工作结束后终于能聚在一起，应该也挺难得的。", nextStage: 53, lines: [
      { sender: "我", body: "你們忙完一個階段，終於能聚在一起放鬆一下，應該也滿難得的吧。", thread: "大G" },
      { sender: "大G", body: "對啊，大家平常時間都兜不起來，趁這次好好碰個面。欸，不過我明天還要搭車回台北，現在只想趕快躺平。", thread: "大G" },
    ]},
    { stage: 53, chat: "大G", id: "tell-him-get-rest", label: "那你别聊太晚了，到了酒店就赶快休息。", nextStage: 54, lines: [
      { sender: "我", body: "那你就不要再聊太晚了啦，到了酒店趕快休息。明天還要回台北，別把自己累壞了。", thread: "大G" },
      { sender: "大G", body: "好啦好啦，我已經快到酒店了。今天真的有點累，等一下洗完澡就直接睡。", thread: "大G" },
    ]},
    { stage: 54, chat: "大G", id: "check-hotel-arrival", label: "到了吗？已经进酒店了吗？", nextStage: 55, lines: [
      { sender: "我", body: "到了嗎？已經進酒店了嗎？", thread: "大G" },
      { sender: "大G", body: "到了，剛進房間而已。今天真的喝得有點多，現在只想趕快洗澡躺下。", thread: "大G" },
    ]},
    { stage: 55, chat: "大G", id: "hotel-goodnight", label: "那你快去洗澡休息吧！晚安，明天再聊。", nextStage: 35, lines: [
      { sender: "我", body: "那你快去洗澡休息吧！晚安，明天再聊。", thread: "大G" },
      { sender: "大G", body: "好啦，晚安。妳也早點睡，明天再聊。", thread: "大G" },
    ]},
    { stage: 35, chat: "大G", id: "ask-arrived-home", label: "（今天早上）你到台北了吗？", nextStage: 36, lines: [
      { sender: "我", body: "早啊！你到台北了嗎？", thread: "大G" },
      { sender: "大G", body: "剛到台北！一下車就覺得好熱喔，外面真的又悶又熱。", thread: "大G" },
    ]},
    { stage: 36, chat: "大G", id: "welcome-back-taipei", label: "哈哈哈欢迎回来！台北最近真的很闷热，先喝点水啦。", nextStage: 37, lines: [
      { sender: "我", body: "哈哈哈歡迎回來！台北最近真的很悶熱欸，你先喝點水啦，搭飛機也辛苦了。", thread: "大G" },
      { sender: "大G", body: "真的，剛剛拿行李的時候就熱到不行。妳那邊餐廳有想好了嗎？", thread: "大G" },
    ]},
    { stage: 37, chat: "大G", id: "send-restaurant-location", label: "我刚刚查了一下，这家看起来还不错，先把定位传给你。📍阿嬷热炒", nextStage: 38, lines: [
      { sender: "我", body: "我剛剛查了一下，這家看起來還不錯，先把定位傳給你。\n📍 位置分享\n阿嬤熱炒\n（店家定位）", thread: "大G" },
      { sender: "大G", body: "喔！這家店！很有名欸！我好像有聽過，之前也有人跟我推薦過。", thread: "大G" },
    ]},
    { stage: 38, chat: "大G", id: "praise-restaurant", label: "对啊！我看评价很好，而且真的超好吃的！", nextStage: 39, lines: [
      { sender: "我", body: "對啊！我看評價很好，而且真的超好吃的！", thread: "大G" },
      { sender: "大G", body: "哈哈，那我今天有口福了。唉，我最近工作真的有點忙，平常常常隨便吃個便當就算了，今天要好好吃一頓才行。", thread: "大G" },
    ]},
    { stage: 39, chat: "大G", id: "remind-eat-well", label: "工作再忙也要好好吃饭啊！不能老是吃便当，身体会受不了的。", nextStage: 40, lines: [
      { sender: "我", body: "工作再忙也要好好吃飯啊！不能老是吃便當，身體會受不了的。", thread: "大G" },
      { sender: "大G", body: "知道啦，妳講話怎麼跟我媽一樣，哈哈哈。好啦，我今天一定好好吃，不會再隨便打發了。", thread: "大G" },
    ]},
    { stage: 40, chat: "大G", id: "send-vava-dinner-photo", label: "（发送玩玩的照片）玩玩刚吃完饭～", nextStage: 41, lines: [
      { sender: "我", body: "玩玩剛吃完飯～", thread: "大G", kind: "image", media: "./assets/wanwan-selfie.webp", meta: { photoCaption: "true" } },
      { sender: "大G", body: "哈哈哈哈，牠看起來好乖喔！吃飽了是不是？這張拍得很可愛欸，謝謝妳傳給我看。", thread: "大G" },
    ]},
    { stage: 41, chat: "大G", id: "talk-vava-after-photo", label: "对啊，刚吃饱就开始到处晃，精神很好。", nextStage: 42, lines: [
      { sender: "我", body: "對啊，剛吃飽就開始到處晃，精神很好，完全不像剛剛還在打瞌睡。", thread: "大G" },
      { sender: "大G", body: "哈哈，牠真的很有精神欸。看來在妳那邊過得很舒服，今天我去接牠應該會很捨不得吧。", thread: "大G" },
    ]},
    { stage: 42, chat: "大G", id: "vava-sweet-talk", label: "它现在已经很习惯我了，不过你来了应该还是会认得你的。", nextStage: 43, lines: [
      { sender: "我", body: "牠現在已經很習慣我了，不過你來了應該還是會認得你的。", thread: "大G" },
      { sender: "大G", body: "希望啦！我也很想牠。欸，我還有半小時就到妳家附近了，妳可以先收拾一下，準備帶玩玩下樓啦。", thread: "大G" },
    ]},
    { stage: 43, chat: "大G", id: "get-ready-for-pickup", label: "好！那我先去收拾一下，准备带玩玩下楼～", nextStage: 44, lines: [
      { sender: "我", body: "好！那我先去收拾一下，準備帶玩玩下樓～", thread: "大G" },
      { sender: "大G", body: "好，不急，妳慢慢來。我到了附近再跟妳說。", thread: "大G" },
    ]},
  ];
  // Contact handoffs are manual. When the player opens the destination
  // contact, activate that contact's waiting stage without navigating for them.
  useEffect(() => {
    if ((p.thread === "西蓝花" || p.thread === "西兰花") && returnDinnerStage === 2) {
      setReturnDinnerStage(3);
    } else if ((p.thread === "西蓝花" || p.thread === "西兰花") && returnDinnerStage === 44) {
      setReturnDinnerStage(97);
    }
  }, [returnDinnerStage, p.thread]);
  useEffect(() => {
    // Rewrite the already-saved pickup exchange from the previous ordering so
    // existing testers see the corrected away-from-home explanation too.
    if (!pickupMessagesWereMigrated) return;
    setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2 }));
  }, [pickupMessagesWereMigrated, catRescue.stage, catRescue.messages]);
  useEffect(() => {
    // Repair saves made by the broken build where the player had already sent
    // "我是你爸爸" but the three incoming reactions and reply choices vanished.
    if (catRescue.stage !== 17 || !hasPrankPath) return;
    const allBodies = new Set([...p.items, ...catRescue.messages].map((item) => item.body.trim()));
    const candidates: CatLine[] = [
      { sender: "大G", body: "……蛤？", thread: "大G" },
      { sender: "大G", body: "妳哪位？我不認識妳喔。", thread: "大G" },
      { sender: "大G", body: "好喔，那我先把妳刪掉了。掰。", thread: "大G" },
    ];
    const missing = candidates.filter((line) => !allBodies.has(line.body) &&
      !pendingCatLines.some((pending) => pending.body === line.body));
    if (missing.length) setPendingCatLines((current) => [...current, ...missing]);
  }, [catRescue.stage, catRescue.branch, catRescue.messages.length, hasPrankPath, pendingCatLines, p.items]);
  // Story progression never changes the active contact automatically.
  // Players switch between 大G and 西蓝花 from the conversation list.
  useEffect(() => {
    if (!legacyPrankReaddPending) return;
    const alreadyHasQuestion = [...p.items, ...parsedCatRescue.messages].some((item) => item.body.trim() === "？？？");
    // This first "？？？" is the conversation opener shown as soon as the
    // user enters DaG's chat. It is not part of the delayed reply sequence.
    const openingQuestion = alreadyHasQuestion ? null : makeItem({
      id: "cat-rescue-opening-question",
      title: "大G",
      sender: "大G",
      body: "？？？",
      time: "2026-11-02 " + (storyClockRef.current || "14:24"),
      outgoing: false,
      meta: { storyId: "cat-rescue", storyThread: "大G" },
    });
    setCatRescueRaw(JSON.stringify({
      ...parsedCatRescue,
      version: 2,
      stage: 16,
      branch: "monster-prank",
      messages: openingQuestion ? [...parsedCatRescue.messages, openingQuestion] : parsedCatRescue.messages,
    }));
    // No delayed queue entry for the opening question; only the replies after
    // the user continues are timed 30–60 seconds each.
  }, [legacyPrankReaddPending]);
  // Pending replies are persisted in WeChat UI state and delivered by the
  // phone-level scheduler, so they continue arriving while another app is open.

  const appendCatLines = (lines: CatLine[], nextStage = catRescue.stage, branch = catRescue.branch, eventKey = "") => {
    // Send every consecutive player-authored bubble at the start of this
    // choice, then queue incoming replies in order. Stop at the first incoming
    // message: later player lines belong to a later explicit choice.
    // This preserves deliberate split bubbles such as "溫尚翊你混蛋！"
    // followed by "你耍我！！！" without auto-sending replies from later turns.
    const destination = getCatRescueThreadForStage(nextStage);
    const prepared = lines.map((line) => ({ ...line, thread: line.thread || destination }));
    const immediateLines: CatLine[] = [];
    for (const line of prepared) {
      if (line.sender !== "我") break;
      immediateLines.push(line);
    }
    const queuedLines: CatLine[] = [];
    for (const line of prepared.slice(immediateLines.length)) {
      if (line.sender === "我") break;
      queuedLines.push({
        ...line,
        // One stable ID per incoming line/stage prevents duplicate delivery
        // if the choice handler or phone-level queue effect is replayed.
        id: line.id || "cat-rescue-story-" + (eventKey || branch + "-" + nextStage) + "-" + queuedLines.length,
      });
    }
    const immediateItems = immediateLines.map((line, index) => makeItem({
      id: "cat-rescue-" + Date.now() + "-" + index + "-" + Math.random().toString(36).slice(2, 7),
      title: line.thread || destination,
      sender: line.sender,
      body: line.body,
      time: "2026-11-02 " + (storyClockRef.current || "14:24"),
      outgoing: line.sender === "我",
      avatar: "",
      kind: line.kind || "text",
      media: line.media || "",
      meta: { storyId: "cat-rescue", storyThread: line.thread || destination, storyOrderAt: String(Date.now() + index), ...(line.meta || {}) },
    }));
    setCatRescueRaw(JSON.stringify({
      ...catRescue,
      version: 2,
      stage: nextStage,
      branch,
      messages: immediateItems.length ? [...catRescue.messages, ...immediateItems] : catRescue.messages,
    }));
    setPendingCatLines((current) => [...current, ...queuedLines]);
  };
  useEffect(() => {
    const delivered = [...p.items, ...parsedCatRescue.messages];
    const photoExists = delivered.some((item) =>
      item.kind === "image" && item.media.includes("wannwan-sleeping-cat")
    );
    if (!photoExists) return;
    const caption = "玩玩都睡著了。";
    const captionExists = delivered.some((item) => item.sender === "大G" && item.body.trim() === caption) ||
      pendingCatLines.some((line) => line.sender === "大G" && line.body.trim() === caption);
    if (!captionExists) {
      setPendingCatLines((current) => [...current, {
        id: "hotel-wannwan-sleeping-caption-v2",
        sender: "大G",
        body: caption,
        thread: "大G",
      }]);
    }
  }, [p.items, parsedCatRescue.messages, pendingCatLines]);
  const chooseCatRescue = (choice: CatChoice) => {
    appendCatLines(choice.lines, choice.nextStage, choice.branch || catRescue.branch, "cat-choice-" + choice.id);
    if (choice.nextStage === 8) { setIdCopied(false); setIdPasted(false); setAddIdModal(true); }
    if (choice.nextStage === 13 && (choice.branch || catRescue.branch) === "monster-prank") {
      // The player gets to compose an apology first; the send then visibly fails
      // because the prank has already cost them the friendship.
      setMonsterFriendAccepted(false);
      setMonsterRemoved(true);
      setMonsterSendFailed(false);
      setAddedFriends((current) => current.filter((name) => name !== "大G"));
    } else if (choice.nextStage === 13) {
      setMonsterRemoved(true);
      setAddedFriends((current) => current.filter((name) => name !== "大G"));
      p.onThread("");
      setTab("通讯录");
      setAddQuery("mo00oster111");
      setUtility("添加朋友");
    }
  };
  const appendNewFriendConversation = () => {
    const [hour, minute] = (p.virtualTime || "14:24").split(":").map(Number);
    const total = (Number.isFinite(hour) ? hour : 14) * 60 + (Number.isFinite(minute) ? minute : 24);
    const time = "2026-11-02 " + String(Math.floor(total / 60) % 24).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
    const readding = catRescue.stage === 13;
    const prankReadd = readding && hasPrankPath;
    // The phone's virtual clock can be earlier than timestamps on the
    // existing transcript (for example after a time reset). Use a monotonic
    // story-order timestamp so the friend-added event is appended after the
    // previous chat, and the owner's opener follows that event.
    const addFriendOrderAt = Date.now();
    const created = [
      makeItem({ id: "monster-added-system-" + addFriendOrderAt, title: "大G", sender: "我", body: readding ? "你重新添加了大G，现在可以继续聊天了。" : "你已添加了大G，现在可以开始聊天了。", time, outgoing: true, kind: "event", meta: { storyId: "cat-rescue-add-friend", storyThread: "大G", storyOrderAt: String(addFriendOrderAt) } }),
      ...(!readding ? [makeItem({ id: "monster-first-message-" + addFriendOrderAt, title: "大G", sender: "大G", body: "妳是？", time, outgoing: false, meta: { storyId: "cat-rescue-add-friend", storyThread: "大G", wechatId: "mo00oster111", storyOrderAt: String(addFriendOrderAt + 1) } })] : []),
    ];
    const nextStage = prankReadd ? 16 : getCatRescueStageAfterFriendAdd(catRescue.stage, catRescue.branch);
    const nextBranch = prankReadd ? "monster-prank" : catRescue.branch;
    setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2, stage: nextStage, branch: nextBranch, messages: [...catRescue.messages, ...created] }));
    if (prankReadd) setPendingCatLines((current) => [...current, { sender: "大G", body: "？？？", thread: "大G" }]);
    setMonsterRemoved(false);
    setMonsterSendFailed(false);
    setMonsterFriendAccepted(true);
    setAddedFriends((current) => current.includes("大G") ? current : [...current, "大G"]);
    // Do not navigate here: this function is called while the friend-request
    // sheet is still open. The explicit "完成，查看消息" action owns navigation.
  };


  const initialOwnerName = "\u5feb\u4e50\u5c0f\u72d7";
  const [profileName, setProfileName] = useSkinState<string>(p, "wxProfileName", initialOwnerName);
  const [profileAvatar, setProfileAvatar] = useSkinState<string>(p, "wxProfileAvatar", "");
  const ownerAvatar = profileAvatar || "./assets/wechat-owner-avatar.jpg";
  useEffect(() => {
    if (profileName === "\u6211\u7684\u5fae\u4fe1" || profileName === "\u673a\u4e3b") setProfileName("\u5feb\u4e50\u5c0f\u72d7");
  }, [profileName]);
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
  const [monsterRemoved, setMonsterRemoved] = useSkinState<boolean>(p, "wxMonsterRemoved", false);
  const [monsterSendFailed, setMonsterSendFailed] = useSkinState<boolean>(p, "wxMonsterSendFailed", false);
  const [addQuery, setAddQuery] = useState("");
  const [addIdModal, setAddIdModal] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [idPasted, setIdPasted] = useState(false);
  const [friendRequestModal, setFriendRequestModal] = useState<"" | "confirm" | "sent">("");
  const [momentCover, setMomentCover] = useSkinState<string>(p, "wxMomentCover", "");
  const [momentPostData, setMomentPostData] = useSkinState<string[]>(p, "wxMomentPosts", []);
  const [momentComposer, setMomentComposer] = useState(false);
  const [momentDraft, setMomentDraft] = useState("");
  const [drunkMomentSequenceStarted, setDrunkMomentSequenceStarted] = useSkinState<boolean>(p, "wxDrunkMomentSequenceStartedV1", false);
  const myMomentPosts = momentPostData.flatMap((raw) => {
    try {
      const post = JSON.parse(raw) as { id: string; body: string; time: string; comments?: string[] };
      return post.id && post.body ? [post] : [];
    } catch {
      return [];
    }
  });
  const publishMoment = () => {
    const body = momentDraft.trim();
    if (!body) return;
    const isDrunkLovePost = /我愛溫尚翊一輩子|我爱温尚翊一辈子/.test(body);
    setMomentPostData((current) => [...current, JSON.stringify({
      id: isDrunkLovePost ? "moment-drunk-love-monster-v1" : `moment-${Date.now()}`,
      body,
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
      ...(isDrunkLovePost ? { comments: ["西蓝花：？"] } : {}),
    })]);
    setMomentDraft("");
    setMomentComposer(false);
    if (isDrunkLovePost && !drunkMomentSequenceStarted) {
      setDrunkMomentSequenceStarted(true);
      // This story segment is message-only; phone-call triggers are disabled.
      setPendingCatLines((current) => [
        ...current,
        { id: "drunk-moment-broccoli-1", sender: "西蓝花", body: "？", thread: "西蓝花" },
        { id: "drunk-moment-broccoli-2", sender: "西蓝花", body: "妳幹嘛？", thread: "西蓝花" },
        { id: "drunk-moment-broccoli-3", sender: "西蓝花", body: "妳怎麼了？", thread: "西蓝花" },
        { id: "drunk-moment-broccoli-4", sender: "西蓝花", body: "妳瘋了？", thread: "西蓝花" },
        { id: "drunk-moment-broccoli-5", sender: "西蓝花", body: "妳夢遊了？", thread: "西蓝花" },
        { id: "drunk-moment-broccoli-call-1", sender: "西蓝花", body: "已取消", thread: "西蓝花", kind: "call", meta: { callStatus: "cancelled" } },
        { id: "drunk-moment-broccoli-call-2", sender: "西蓝花", body: "已取消", thread: "西蓝花", kind: "call", meta: { callStatus: "cancelled" } },
        { id: "drunk-moment-broccoli-call-3", sender: "西蓝花", body: "已取消", thread: "西蓝花", kind: "call", meta: { callStatus: "cancelled" } },
        { id: "drunk-moment-broccoli-6", sender: "西蓝花", body: "妳怎麼不說話？？？", thread: "西蓝花" },
        { id: "drunk-moment-big-g-checkin-v2", sender: "大G", body: "喂！你怎么不说话！", thread: "大G" },
      ]);
    }
  };
  useEffect(() => {
    // Phase 1: after the original found-cat conversation is complete,
    // create the Vava/玩玩 post with both likes. Do not message DaG yet.
    const foundCatConversationFinished =
      catRescue.branch === "monster-cat" && catRescue.stage >= 53;
    if (!moments || !foundCatConversationFinished || vavaMomentSeeded) return;
    const postId = "moment-vava-wanwan-play-fight";
    setMomentPostData((current) => current.some((raw) => {
      try { return JSON.parse(raw).id === postId; } catch { return false; }
    }) ? current : [...current, JSON.stringify({
      id: postId,
      body: "Vava和玩玩今天又打起来了😂 明明看着都小小一只，碰到一起却谁也不让谁……",
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
      likes: ["西蓝花", "大G"],
    })]);
    setVavaMomentSeeded(true);
  }, [moments, vavaMomentSeeded, catRescue.branch, catRescue.stage]);

  useEffect(() => {
    // Phase 2: only after the user has opened Moments and the post with
    // both likes has been rendered in that view, DaG may start the chat.
    // No Moments visit means no message, notification, or chat transcript.
    // This Moments-to-DaG conversation is a one-time event. Once its final
    // reply is sent, the persisted completion flag permanently blocks replay,
    // even if the user later posts, deletes, or revisits Moments.
    if (vavaPlayCompleted || !moments || !vavaMomentSeeded || vavaPlayMessagesExist || vavaPlayStage >= 0 || vavaOpenerEnqueuedRef.current) return;
    // Latch synchronously: React StrictMode and state persistence can replay effects.
    vavaOpenerEnqueuedRef.current = true;
    const postId = "moment-vava-wanwan-play-fight";
    const likesAreVisible = momentPostData.some((raw) => {
      try {
        const post = JSON.parse(raw);
        return post.id === postId && Array.isArray(post.likes) && post.likes.includes("大G") && post.likes.includes("西蓝花");
      } catch { return false; }
    });
    if (!likesAreVisible) return;
    // Hand the opener to the phone-level story queue. It persists the message,
    // creates the top WeChat banner when the user is elsewhere, and routes the
    // banner tap to the correct DaG conversation.
    setPendingCatLines((current) => current.some((line) =>
      line.sender === "大G" && line.thread === "大G" && line.body === "欸，Vava是你家的原住民喔？玩玩最近還好嗎？"
    ) ? current : [...current, {
      sender: "大G",
      body: "欸，Vava是你家的原住民喔？玩玩最近還好嗎？",
      thread: "大G",
    }]);
    setVavaPlayStage(0);
  }, [moments, vavaMomentSeeded, momentPostData, vavaPlayMessagesExist, vavaPlayStage, vavaPlayCompleted]);
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
  ).filter((name) => !(monsterRemoved && name === "大G")).sort((a, b) => {
    const aLast = allItems.filter((i) => i.title === a).at(-1)?.time ?? "";
    const bLast = allItems.filter((i) => i.title === b).at(-1)?.time ?? "";
    return bLast.localeCompare(aLast);
  });
  const contacts = Array.from(new Set([
    ...allItems.map((i) => displayName(i.sender)).filter((s) => s && s !== "我" && s !== "机主"),
    ...addedFriends.map(displayName),
  ])).filter((name) => !(monsterRemoved && name === "大G")).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const friendDirectory = Array.from(new Set(["西蓝花", "爸爸", "妈妈", ...allItems.flatMap((i) => [i.title, i.sender]).filter((s) => s && s !== "我" && s !== "机主")]));
  const friendMatches = addQuery.trim()
    ? addQuery.trim().toLowerCase() === "mo00oster111" && idPasted && catRescue.stage >= 8
      ? ["大G"]
      : friendDirectory.filter((name) => {
          const related = allItems.filter((i) => i.title === name || i.sender === name);
          const keys = [name, ...related.flatMap((i) => [i.meta.wechatId, i.meta.account, i.meta.phone, i.meta.handle])].filter(Boolean).join(" ").toLowerCase();
          return keys.includes(addQuery.trim().toLowerCase());
        })
    : [];
  const posts = allItems.filter((i) => i.folder === "朋友圈" || i.kind === "post");
  const filteredConversations = conversations.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()) ||
    displayName(name).toLowerCase().includes(query.toLowerCase()) ||
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
    // A sender name is not a conversation owner: a message sent by 大G can
    // still be part of another contact's thread. Always open the tapped
    // contact's canonical title, never infer it from the sender field.
    const canonicalName = isMonsterName(name) ? "大G" : name;
    p.onThread(canonicalName);
    p.onRead(canonicalName);
  };
  return (
    <div className="wechat-ui independent-skin wx-reference-layout" data-tab={tab} data-thread={!!p.thread} data-moments={moments} data-utility={!!utility} data-status-editor={statusEditorOpen}>
      {remarkEditorContact && (
        <div className="wx-friend-flow-backdrop" onClick={() => setRemarkEditorContact("")}>
          <section className="wx-friend-flow-sheet" role="dialog" aria-modal="true" aria-label="修改联系人备注" onClick={(event) => event.stopPropagation()} style={{ gap: 14 }}>
            <strong style={{ fontSize: 18 }}>设置备注</strong>
            <p style={{ margin: 0, color: "#888", fontSize: 13 }}>为「{canonicalContactName(remarkEditorContact)}」设置一个新备注</p>
            <input autoFocus value={remarkDraft} maxLength={30} onChange={(event) => setRemarkDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveContactRemark(); if (event.key === "Escape") setRemarkEditorContact(""); }} placeholder="请输入联系人备注" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 9, padding: "12px", fontSize: 16, outline: "none" }} />
            <div style={{ display: "flex", width: "100%", gap: 10 }}>
              <button type="button" onClick={() => setRemarkEditorContact("")} style={{ flex: 1, border: 0, borderRadius: 9, padding: 11, background: "#f1f1f1", color: "#333" }}>取消</button>
              <button type="button" disabled={!remarkDraft.trim()} onClick={saveContactRemark} style={{ flex: 1, border: 0, borderRadius: 9, padding: 11, background: remarkDraft.trim() ? "#07c160" : "#b8e8cc", color: "white" }}>确认</button>
            </div>
          </section>
        </div>
      )}
      {addIdModal && (
        <div className="wx-friend-flow-backdrop">
          <section className="wx-friend-flow-sheet" role="dialog" aria-modal="true" aria-label="微信号">
            <button className="wx-friend-flow-close" disabled={catRescue.stage === 15 && !idCopied} onClick={() => setAddIdModal(false)}>×</button>
            <div className="wx-friend-flow-avatar"><Avatar name="大G" /></div>
            <strong>找到一個微信號</strong>
            <p>可以試著用這個微信號添加對方</p>
            <div className="wx-friend-id">mo00oster111</div>
            <button className="wx-friend-flow-primary" onClick={() => { void navigator.clipboard?.writeText("mo00oster111").catch(() => undefined); setIdCopied(true); }}>{idCopied ? "已复制" : "复制微信号"}</button>
            {idCopied && <button className="wx-friend-flow-secondary" onClick={() => { setAddIdModal(false); setTab("通讯录"); setUtility("添加朋友"); setAddQuery(""); }}>前往通讯录，粘贴微信号添加</button>}
          </section>
        </div>
      )}
      {friendRequestModal && (
        <div className="wx-friend-flow-backdrop">
          <section className="wx-friend-flow-sheet" role="dialog" aria-modal="true" aria-label="好友申请">
            <div className="wx-friend-flow-avatar"><Avatar name="大G" /></div>
            {friendRequestModal === "confirm" ? (
              <>
                <strong>添加到通讯录</strong>
                <p>大G · 微信号 mo00oster111</p>
                <div className="wx-friend-id">你可以向对方发送好友申请</div>
                <button className="wx-friend-flow-primary" onClick={() => { setFriendRequestModal("sent"); }}>发送好友申请</button>
                <button className="wx-friend-flow-secondary" onClick={() => setFriendRequestModal("")}>取消</button>
              </>
            ) : (
              <>
                <strong>好友申请已发送</strong>
                <p>已向大G发送好友申请</p>
                <div className="wx-friend-id">好友添加成功 · 微信名：大G</div>
                <button className="wx-friend-flow-primary" onClick={() => { appendNewFriendConversation(); setFriendRequestModal(""); setUtility(""); setTab("微信"); p.onThread("大G"); }}>完成，查看消息</button>
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
        <strong onClick={() => p.thread && !statusEditorOpen ? openRemarkEditor(p.thread) : undefined} style={p.thread ? { cursor: "pointer" } : undefined} title={p.thread ? "点击修改备注" : undefined}>{statusEditorOpen ? "设个状态" : utility || (p.thread ? displayName(p.thread) : moments ? "朋友圈" : tab)}</strong>
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
            {idCopied && <button type="button" className="wx-add-paste" onClick={() => { setAddQuery("mo00oster111"); setIdPasted(true); }}>粘贴</button>}
            {addQuery && <button aria-label="清空搜索" onClick={() => setAddQuery("")}>×</button>}
          </label>
          {addQuery.trim() ? (
            <div className="wx-add-results">
              {friendMatches.length ? friendMatches.map((name) => {
                const isMonster = isMonsterName(name);
                const visibleName = displayName(name);
                const related = allItems.find((i) => displayName(i.title) === visibleName || displayName(i.sender) === visibleName);
                const alreadyAdded = addedFriends.includes(isMonster ? "大G" : name);
                return (
                  <div className="wx-add-result" key={visibleName}>
                    <Avatar name={visibleName} src={related?.avatar} />
                    <span><strong>{visibleName}</strong><small>微信号：{isMonster ? "mo00oster111" : related?.meta.wechatId || related?.meta.account || name}</small></span>
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
              <MessageList items={threadItems} creator={p.creator} onItem={p.onItem} onRead={p.onRead} wechat wallpaper="https://upload.wikimedia.org/wikipedia/commons/3/37/%E4%BA%94%E6%9C%88%E5%A4%A9-%E6%80%AA%E7%8D%B8_%285247925751%29.jpg" selfAvatar={ownerAvatar} />
              {isMonsterThread &&
                (() => {
                  const prompts = [
                    { trigger: "喂！你怎么不说话！", body: "我跟你說喔……那個燈一直在跟我講話……", replyId: "drunk-big-g-how-much-v4", reply: "你是喝了多少！" },
                    { trigger: "你是喝了多少！", body: "等一下……我的鞋子是不是不見了……", replyId: "drunk-big-g-stop-drinking-v4", reply: "我不是叫你別喝了！" },
                    { trigger: "我不是叫你別喝了！", body: "我明明有兩個手機……怎麼只有一個……", replyId: "drunk-big-g-vomit-v4", reply: "你吐過了？" },
                    { trigger: "你吐過了？", body: "你不要轉喔……房間在晃……", replyId: "drunk-big-g-last-warning-v4", reply: "前台跟我說敲門沒人開" },
                  ];
                  const transcript = threadItems.map((item) => item.body.trim());
                  const current = prompts.find((prompt) =>
                    transcript.includes(prompt.trigger) &&
                    !transcript.includes(prompt.body) &&
                    !transcript.includes(prompt.reply)
                  );
                  if (!current) return null;
                  return (
                    <div className="cat-rescue-choices" aria-label="醉酒后的手动回复" style={{ position: "sticky", bottom: 0, zIndex: 20, display: "flex", flexDirection: "column", gap: 8, padding: "10px 12px", background: "rgba(255,255,255,.96)", borderTop: "1px solid #e5e5e5" }}>
                      <button style={{ display: "block", width: "100%", minHeight: 44, padding: "10px 14px", borderRadius: 10, background: "#07c160", color: "#102010", fontSize: 15, fontWeight: 600, whiteSpace: "normal" }} onClick={() => {
                        appendCatLines([{ sender: "我", body: current.body, thread: "大G" }], catRescue.stage, catRescue.branch, "drunk-manual-user-line-v5-" + current.replyId);
                        setPendingCatLines([{ id: current.replyId, sender: "大G", body: current.reply, thread: "大G" }]);
                      }}>{current.body}</button>
                      <div className="cat-rescue-option-hint">點擊選項後才會發送</div>
                    </div>
                  );
                })()}
              {isBroccoliThread && catRescue.stage === 8 && !idCopied && pendingCatLines.length === 0 && <div className="cat-rescue-choices"><button onClick={() => setAddIdModal(true)}>查看对方的微信号</button></div>}
              {vavaPlayActive && isMonsterThread && vavaPlayStage >= 0 && pendingCatLines.length === 0 && (
                <div className="cat-rescue-choices" aria-label="大G关于Vava和玩玩的回复选项">
                  {vavaPlayChoices.filter((choice) => choice.nextStage === vavaPlayStage + 1 || (vavaPlayStage === 0 && choice.nextStage === 2) || (vavaPlayStage === 6 && choice.nextStage === -1)).slice(0, vavaPlayStage === 0 ? 2 : 1).map((choice) => (
                    <button key={choice.id} onClick={() => {
                      appendCatLines(choice.lines, catRescue.stage, catRescue.branch, "vava-" + vavaPlayStage + "-" + choice.id);
                      setVavaPlayStage(choice.nextStage);
                      if (choice.nextStage === -1) setVavaPlayCompleted(true);
                    }}>{choice.label}</button>
                  ))}
                  <div className="cat-rescue-option-hint">选择一条回复发送</div>
                </div>
              )}
              {returnDinnerStage !== 261 && (!postPickupGoodbyeSent || returnDinnerStage >= 111) && (returnDinnerStage === 249 || pendingCatLines.length === 0) && returnDinnerChoices.some((choice) => choice.stage === returnDinnerStage && choice.chat === (isMonsterThread ? "大G" : isBroccoliThread ? "西蓝花" : "")) && (
                <div className="cat-rescue-choices" aria-label="下一段剧情回复选项">
                  {returnDinnerChoices.filter((choice) => choice.stage === returnDinnerStage && choice.chat === (isMonsterThread ? "大G" : isBroccoliThread ? "西蓝花" : "")).map((choice) => (
                    <button key={choice.id} onClick={() => {
                      const choiceKey = returnDinnerStage + ":" + choice.id;
                      if (handledReturnDinnerChoicesRef.current.has(choiceKey)) return;
                      handledReturnDinnerChoicesRef.current.add(choiceKey);
                      appendCatLines(choice.lines, catRescue.stage, catRescue.branch, "return-dinner-" + returnDinnerStage + "-" + choice.id);
                      setReturnDinnerStage(choice.nextStage);
                      // If the next stage belongs to another contact, keep the
                      // current chat open. The player switches contacts manually.
                    }}>{choice.label}</button>
                  ))}
                  <div className="cat-rescue-option-hint">选择一条回复发送</div>
                </div>
              )}
              {!postPickupGoodbyeSent && catChoices.length > 0 && (
                <div className="cat-rescue-choices" aria-label="剧情回复选项">
                  {catChoices.map((choice) => (
                    <button key={choice.id} onClick={() => chooseCatRescue(choice)}>{choice.label}</button>
                  ))}
                  <div className="cat-rescue-option-hint">选择一条回复发送</div>
                </div>
              )}
              <Compose
                creator={p.creator}
                onAdd={p.onAdd}
                onSend={(value) => {
                  const reply = value.trim();
                  if (catRescue.stage === 30 && /(到了|到医院|到醫院|已经到|已經到)/.test(reply)) {
                    appendCatLines([
                      { sender: "我", body: reply },
                      { sender: "西蓝花", body: "好！医生有开始帮它检查了吗？有没有先看看有没有晶片？" },
                    ], 31, catRescue.branch);
                  } else if (catRescue.stage === 31) {
                    appendCatLines([
                      { sender: "我", body: reply },
                      { sender: "西蓝花", body: "嗯嗯，那你先陪着它，别让它紧张。等检查结果出来再告诉我！" },
                    ], 4, catRescue.branch);
                  } else {
                    appendCatLines([{ sender: "我", body: reply }]);
                  }
                }}
              />
            </div>
          ) : (
            <>
              <MessageList items={allItems.filter((i) => i.title === p.thread)} creator={p.creator} onItem={p.onItem} onRead={p.onRead} wechat wallpaper="https://upload.wikimedia.org/wikipedia/commons/3/37/%E4%BA%94%E6%9C%88%E5%A4%A9-%E6%80%AA%E7%8D%B8_%285247925751%29.jpg" selfAvatar={ownerAvatar} />
              {isMonsterThread && monsterRemoved && catRescue.stage === 13 && monsterSendFailed && (
                <div className="wx-send-failed" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", color: "#d93025", fontSize: 12 }}>
                  <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "#d93025", color: "#fff", fontWeight: 700 }}>!</span>
                  <button style={{ color: "#d93025", textAlign: "left", background: "transparent", border: 0, padding: 0 }} onClick={() => {
                    setIdCopied(true);
                    setIdPasted(true);
                    setMonsterSendFailed(false);
                    setAddQuery("mo00oster111");
                    setTab("通讯录");
                    setUtility("添加朋友");
                  }}>你不是对方的联系人，消息发送失败。点击重新添加好友</button>
                </div>
              )}
              <Compose
                creator={p.creator}
                onAdd={p.onAdd}
                onSend={isMonsterThread && monsterRemoved && catRescue.stage === 13 ? (value) => {
                  const [hour, minute] = (p.virtualTime || "14:24").split(":").map(Number);
                  const total = (Number.isFinite(hour) ? hour : 14) * 60 + (Number.isFinite(minute) ? minute : 24);
                  const time = "2026-11-02 " + String(Math.floor(total / 60) % 24).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
                  const failed = makeItem({
                    id: "monster-send-failed-" + Date.now(),
                    title: "大G",
                    sender: "我",
                    body: value,
                    time,
                    outgoing: true,
                    meta: { storyId: "cat-rescue", storyThread: "大G", sendFailed: "true", storyOrderAt: String(Date.now()) },
                  });
                  setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2, messages: [...catRescue.messages, failed] }));
                  setMonsterSendFailed(true);
                } : undefined}
              />
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
            <Avatar name={ownerName} src={ownerAvatar} />
            <button className="wx-moment-publish" onClick={() => setMomentComposer(true)}><Plus size={16} /> 发布朋友圈</button>
          </div>
          {myMomentPosts.map((post) => (
            <div key={post.id} className="wx-moment-post wx-moment-user-post">
              <Avatar name={ownerName} src={ownerAvatar} />
              <div><strong>{ownerName}</strong><p>{post.body}</p><small>{post.time}</small>{post.id === "moment-vava-wanwan-play-fight" && <div className="wx-moment-social-likes">♡ 西蓝花、大G 赞了这条朋友圈</div>}{post.comments?.map((comment, index) => <div className="wx-moment-social-likes" key={index}>{comment}</div>)}</div>
            </div>
          ))}
          {posts.map((i) => (
            <button key={i.id} className="wx-moment-post" onClick={() => p.onItem(i)}>
              <Avatar name={i.sender} src={i.sender === ownerName || i.sender === "我" || i.sender === "机主" ? ownerAvatar : i.avatar} />
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
                        <Avatar name={name} src={last.avatar || (name === "西蓝花" ? GLOOMY_AVATAR : "")} />
                        {unread && <b className="wx-unread">{list.filter((i) => !i.read).length || ""}</b>}
                      </span>
                      <div className="wx-chat-copy"><strong>{displayName(name)}</strong><p>{last.body}</p></div>
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
                  const avatarItem = allItems.find((i) => displayName(i.sender) === name || displayName(i.title) === name);
                  return <button className="wx-contact-row" key={name} onClick={() => openContact(resolveContactName(name))}>
                    <Avatar name={name} src={avatarItem?.avatar || (name === "西蓝花" ? GLOOMY_AVATAR : "")} /><span onClick={(event) => { event.stopPropagation(); openRemarkEditor(resolveContactName(name)); }} title="点击修改备注" style={{ cursor: "text" }}>{name}</span>
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
                  <Avatar name={ownerName} src={ownerAvatar} />
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
