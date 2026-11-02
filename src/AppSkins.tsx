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
  const safeSrc = safeMedia(src);
  const isBroccoli = name === "西蓝花" || name === "西兰花";
  const imageSrc = isBroccoli ? GLOOMY_AVATAR : safeSrc.startsWith("data:image/") ? safeSrc : "";
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
  wechat = false,
}: {
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onRead: (id: string) => void;
  whatsapp?: boolean;
  wechat?: boolean;
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
    <div ref={messagesRef} className={`skin-messages ${whatsapp ? "wa-wallpaper" : ""}`}>
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
          {!whatsapp && i.outgoing && <Avatar name={i.sender} src={i.avatar} />}
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
  return unique
    .map((item, index) => {
      const precise = Number(item.meta?.storyOrderAt);
      const hasPrecise = Number.isFinite(precise) && precise > 0;
      return {
        item,
        index,
        timestamp: hasPrecise ? precise : Date.parse(item.time),
        precise: hasPrecise,
      };
    })
    .sort((a, b) => {
      // Story messages carry millisecond delivery timestamps. Use those
      // before the display clock (which only has minute precision), so a
      // later player reply can never be moved above an earlier incoming line.
      if (Number.isFinite(a.timestamp) && Number.isFinite(b.timestamp) && a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
      const aValid = Number.isFinite(a.timestamp);
      const bValid = Number.isFinite(b.timestamp);
      if (aValid && bValid && a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
      if (aValid !== bValid) return aValid ? 1 : -1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}
type CatLine = { sender: "我" | "西蓝花" | "大G"; body: string; thread?: "西蓝花" | "大G" };
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
  const broccoliStages = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 30, 31, 32, 33, 34, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 84]);
  return broccoliStages.has(stage) ? "西蓝花" : "大G";
}
export function shouldAutoReturnToBroccoli(stage: number, pendingCount: number, currentThread: string): boolean {
  return pendingCount === 0 &&
    [32, 33, 37, 38, 39, 63, 64, 65].includes(stage) &&
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
  let prankWasSent = false;
  return items.filter((item) => {
    const body = item.body.trim();
    if (body === "我是你爸爸。" || body === "我是你爸爸") prankWasSent = true;
    if (prankWasSent && body === "妳是？") return false;
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
    { id: "talk-about-day", label: "先聊点别的吧，你今天不是说有件事要跟我讲？", nextStage: 67, lines: [
      { sender: "我", body: "我先不想小貓的事了……對了，妳今天不是說有件事要跟我講？" },
      { sender: "西蓝花", body: "哈哈哈哈妳終於想到別的事了！我今天上班真的遇到一個超誇張的人。" },
      { sender: "西蓝花", body: "有個客人把飲料打翻，還一臉理直氣壯叫我幫他擦，講到我都快笑死了。" },
      { sender: "西蓝花", body: "我跟妳說，當下真的差點翻白眼翻到後腦勺！" },
    ]},
    { id: "chat-food", label: "你先陪我聊聊天，我现在心里乱乱的", nextStage: 67, lines: [
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
    { id: "monster-apology-after-prank", label: "对不起，刚刚发错人了……其实我是捡到你的小猫了", nextStage: 20, branch: "monster-cat", lines: [
      { sender: "我", body: "對不起，剛剛那句發錯人了啦……我不是故意要鬧你的。" },
      { sender: "大G", body: "我說呢，怎麼有人一上來就說奇奇怪怪的話，原來是這樣喔……" },
      { sender: "我", body: "其實我撿到一隻小黑貓，牠脖子上掛著牌子，上面留了你的微信號，所以才想聯絡你。" },
      { sender: "大G", body: "蛤？小黑貓？妳在哪裡看到牠的？牠現在還好嗎？有沒有受傷？" },
    ]},
    { id: "monster-apology-explain", label: "真的对不起！我刚捡到一只小黑猫，看到牌子才联系你", nextStage: 20, branch: "monster-cat", lines: [
      { sender: "我", body: "真的對不起！我剛剛只是想開個玩笑，沒想到你真的把我刪掉了。" },
      { sender: "大G", body: "我說呢，怎麼有人一上來就說奇奇怪怪的話，原來是這樣喔……" },
      { sender: "我", body: "我是在路邊撿到一隻小黑貓，牠脖子上的牌子有你的微信號，所以才急著聯絡你。" },
      { sender: "大G", body: "蛤？原來是這樣……小黑貓現在在哪裡？牠有沒有受傷？妳先跟我說一下。" },
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
    { id: "reassure-owner", label: "你先安心忙你的事，有消息我就告诉你", nextStage: 26, lines: [
      { sender: "我", body: "你先安心忙你的事，有消息我就告诉你。小猫这边我会照顾好。" },
      { sender: "大G", body: "好，真的謝謝妳。這次欠妳一個大人情，等我回去一定好好謝謝妳。" },
      { sender: "我", body: "不用这么客气啦，你先忙，路上也注意安全。" },
      { sender: "大G", body: "嗯，牠就先拜託妳了。有任何狀況，隨時找我，不用客氣。" },
    ]},
    { id: "tease-owner", label: "那你回来记得请我吃饭，算是小猫的感谢费", nextStage: 58, lines: [
      { sender: "我", body: "那你回来记得请我吃饭，算是小猫的感谢费！", thread: "大G" },
      { sender: "大G", body: "哈哈，這樣就想敲我一頓喔？可以啦，等我回去請妳吃飯，妳想吃什麼再跟我說。", thread: "大G" },
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
  38: [
    { id: "notice-traditional-typing", label: "等等！我突然想起来，那个人打字一直是繁体字！", nextStage: 39, lines: [
      { sender: "我", body: "等等等等！我突然想起来一件事！那个人刚刚回我的消息一直都是繁体字欸！", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳現在才想到喔？？？他就是五月天的怪獸本人啊！台灣人打繁體字很正常吧！名字、貓咪名字都對上了，妳還要硬說是重名是不是啦！", thread: "西蓝花" },
      { sender: "我", body: "我刚刚真的脑袋一片空白嘛……现在想起来更不对劲了！", thread: "西蓝花" },
      { sender: "西蓝花", body: "拜託，這已經不是巧合了啦！妳先冷靜，等一下再去跟他確認玩玩的事情。", thread: "西蓝花" },
    ]},
    { id: "keep-natural", label: "好，我先不说破，正常跟他聊玩玩的事", nextStage: 39, lines: [
      { sender: "我", body: "好啦，我先不說破，先正常跟他聊玩玩的事情好了。" , thread: "西蓝花" },
      { sender: "西蓝花", body: "對！就當作普通失主聯絡，別突然把人家嚇到。妳有新消息一定要第一時間跟我說！" , thread: "西蓝花" },
      { sender: "我", body: "知道啦！我先回去看看玩玩，晚點再跟你說。" , thread: "西蓝花" },
      { sender: "西蓝花", body: "快去快去！替我摸摸玩玩，啊不對，先確認牠願不願意給妳摸，哈哈哈哈！" , thread: "西蓝花" },
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
  58: [
    { id: "promise-no-backing-out", label: "说好了，不许赖账！", nextStage: 59, lines: [
      { sender: "我", body: "說好了，不許賴帳！", thread: "大G" },
      { sender: "大G", body: "好啦，答應妳的事我記著，不會賴帳啦。", thread: "大G" },
      { sender: "大G", body: "對了，我把玩玩平常的照顧方式整理給妳，妳先看看，有不清楚的再問我。", thread: "大G" },
      { sender: "大G", body: "【玩玩照顧小指南】\n1. 吃飯：平常吃固定的乾糧，早晚各一餐，先照原本份量，不要突然換新食物。\n2. 喝水：每天換乾淨的水，水碗放在牠容易找到的地方。\n3. 零食：先不要餵人吃的東西，零食也別一次給太多。\n4. 貓砂：牠習慣在安靜的位置上廁所，記得每天清理。\n5. 休息：剛換環境可能會躲起來，讓牠自己慢慢熟悉，不用一直抱牠。\n6. 個性：玩玩很愛玩，也很黏人，熟了會自己跑來蹭妳。\n如果食慾、精神或排泄有明顯異常，先跟我說，也麻煩請醫生看看。", thread: "大G" },
    ]},
    { id: "remember-dinner", label: "那我记住啦！等你回来请我吃好吃的", nextStage: 59, lines: [
      { sender: "我", body: "那我記住啦！等你回來請我吃好吃的！", thread: "大G" },
      { sender: "大G", body: "哈哈，好，這次真的不賴帳。先把玩玩照顧好，牠的事情我也整理給妳了。", thread: "大G" },
      { sender: "大G", body: "【玩玩照顧小指南】\n1. 吃飯：固定乾糧，早晚各一餐，先維持原本份量。\n2. 喝水：每天換乾淨的水。\n3. 零食：不要餵人吃的東西。\n4. 貓砂：放在安靜的位置並每天清理。\n5. 休息：讓牠慢慢適應，不要勉強抱牠。\n6. 個性：玩玩很愛玩，也很黏人，熟了會主動來蹭妳。", thread: "大G" },
    ]},
  ],
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
    { id: "owner-thanks-and-dinner", label: "那你要不请我吃饭？", nextStage: 86, lines: [
      { sender: "大G", body: "真的很謝謝妳願意照顧玩玩，這段時間要麻煩妳了。", thread: "大G" },
      { sender: "我", body: "那你要不請我吃飯？", thread: "大G" },
      { sender: "大G", body: "哈哈，好啊，等我回去請妳吃飯。", thread: "大G" },
    ]},
    { id: "owner-tease-dinner", label: "那你忙完记得回来看看它哦", nextStage: 83, lines: [
      { sender: "我", body: "那你忙完記得回來看看牠喔，牠應該也會想你。", thread: "大G" },
      { sender: "大G", body: "一定會啦。說起來，妳可是玩玩的救命恩人欸，我是不是也該請妳吃頓飯？哈哈。", thread: "大G" },
    ]},
  ],
  86: [
    { id: "accept-dinner-playfully", label: "好啊，不准反悔！我可是能吃很多的！", nextStage: 87, lines: [
      { sender: "我", body: "好啊，不准反悔！我可是能吃很多的！", thread: "大G" },
      { sender: "大G", body: "哈哈哈，答應妳的當然不反悔。那妳可要好好想想想吃什麼了。", thread: "大G" },
    ]},
    { id: "accept-dinner-shyly", label: "那我就不客气啦，谢谢你！", nextStage: 87, lines: [
      { sender: "我", body: "那我就不客氣啦，謝謝你！", thread: "大G" },
      { sender: "大G", body: "哈哈，不用客氣，說好了就不會反悔。", thread: "大G" },
    ]},
  ],
  87: [
    { id: "owner-after-dinner-talk-care", label: "放心啦，我会先让玩玩慢慢适应", nextStage: 62, lines: [
      { sender: "我", body: "放心啦，我會先讓玩玩慢慢適應，有什麼情況我再跟你說。", thread: "大G" },
      { sender: "大G", body: "好，牠剛換地方可能會先躲起來，妳給牠一點時間。牠平常吃飯跟貓砂的習慣，我也可以再整理給妳。", thread: "大G" },
    ]},
    { id: "owner-after-dinner-ask-food", label: "那玩玩现在吃饭了吗？", nextStage: 62, lines: [
      { sender: "我", body: "那玩玩現在吃飯了嗎？牠剛剛有沒有吃東西？", thread: "大G" },
      { sender: "大G", body: "有吃一點就好，先不要突然換食物。真的謝謝妳，後面有狀況再傳訊息給我。", thread: "大G" },
    ]},
  ],
  83: [
    { id: "owner-fake-refuse-dinner", label: "会不会太麻烦你了？照顾玩玩本来就是我应该做的", nextStage: 85, lines: [
      { sender: "我", body: "欸？會不會太麻煩你了？照顧玩玩本來就是我應該做的，不用特地請我吃飯啦。", thread: "大G" },
      { sender: "大G", body: "不麻煩啦，這怎麼會麻煩？妳幫我照顧玩玩，我請妳吃頓飯也是應該的啊。妳就別跟我客氣了，哈哈。", thread: "大G" },
    ]},
    { id: "owner-accept-after-tease", label: "那我就先谢谢你啦！等你回来再说", nextStage: 85, lines: [
      { sender: "我", body: "那我就先謝謝你啦！等你回來再說，現在先把玩玩照顧好。", thread: "大G" },
      { sender: "大G", body: "好，說定了。妳先照顧牠，有任何狀況都可以傳訊息給我。", thread: "大G" },
    ]},
  ],
  85: [
    { id: "owner-accept-dinner-kindly", label: "那我就先谢谢你啦！等你回来再说", nextStage: 62, lines: [
      { sender: "我", body: "那我就先謝謝你啦！等你回來再說，現在先把玩玩照顧好。", thread: "大G" },
      { sender: "大G", body: "好，說定了。妳先照顧牠，有任何狀況都可以傳訊息給我。我這邊也差不多要去忙了。", thread: "大G" },
    ]},
    { id: "owner-still-polite", label: "哈哈，那我就不跟你客气啦", nextStage: 62, lines: [
      { sender: "我", body: "哈哈，那我就不跟你客氣啦！不過你先忙，不用特地為了這件事費心。", thread: "大G" },
      { sender: "大G", body: "不會費心啦，妳放心。那我先去忙，玩玩就麻煩妳了，有事隨時找我。", thread: "大G" },
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
    { id: "tell-broccoli-he-promised-dinner", label: "嘻嘻！他要请我吃饭！", nextStage: 64, lines: [
      { sender: "我", body: "嘻嘻！他要请我吃饭！", thread: "西蓝花" },
      { sender: "西蓝花", body: "真的假的！！！他真的要請妳吃飯？妳運氣也太好了吧！你們吃什麼？", thread: "西蓝花" },
    ]},
    { id: "tell-broccoli-dinner-casual", label: "欸嘿，他刚刚答应回来请我吃饭了！", nextStage: 64, lines: [
      { sender: "我", body: "欸嘿，他刚刚答应回来请我吃饭了！", thread: "西蓝花" },
      { sender: "西蓝花", body: "真的假的！！！他真的要請妳吃飯？妳運氣也太好了吧！你們吃什麼？", thread: "西蓝花" },
    ]},
  ],
  64: [
    { id: "fangirl-details", label: "我哪知道啊！我当时光顾着开心了，根本没想到要问！", nextStage: 65, lines: [
      { sender: "我", body: "我哪知道啊！我当时光顾着开心了，根本没想到要问！", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈妳也太可愛了吧！人家都說要請妳吃飯了，妳居然連吃什麼都沒問。", thread: "西蓝花" },
      { sender: "西蓝花", body: "那他有沒有說什麼時候回來？還是也沒講？", thread: "西蓝花" },
    ]},
    { id: "fangirl-scream", label: "我哪知道啦！我当时整个人都懵了！", nextStage: 65, lines: [
      { sender: "我", body: "我哪知道啦！我當時整個人都懵了，根本沒想到要問！", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈我真的要被妳笑死！妳是不是只記得他答應請妳吃飯，其他都忘光了？", thread: "西蓝花" },
      { sender: "西蓝花", body: "不過也正常啦，換成我我可能也會開心到忘記問。", thread: "西蓝花" },
    ]},
  ],
  65: [
    { id: "settle-down-broccoli", label: "哈哈哈你不要笑我啦！", nextStage: 77, lines: [
      { sender: "我", body: "哈哈哈你不要笑我啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "我哪有笑妳！我是在替妳開心欸！不過妳也太可愛了吧，人家說請吃飯，妳連吃什麼都忘了問。", thread: "西蓝花" },
      { sender: "西蓝花", body: "那妳現在有沒有想好要吃什麼？先偷偷想一下嘛！", thread: "西蓝花" },
    ]},
    { id: "end-broccoli-chat", label: "先不想啦！等他回来再说", nextStage: 77, lines: [
      { sender: "我", body: "先不想啦！等他回来再说，现在先把玩玩照顾好。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦好啦，先照顧玩玩！但我一定會記得這頓飯，妳不准裝沒這回事。", thread: "西蓝花" },
    ]},
  ],
  72: [
    { id: "agree-go-home", label: "好吧……我听你的，先回家好了", nextStage: 73, lines: [
      { sender: "我", body: "好吧……我聽妳的，先回家好了。我不把牠帶回去，至少先不要讓 Vava 冒險。", thread: "西蓝花" },
      { sender: "西蓝花", body: "這樣才乖！妳不是不幫牠，只是先不要急著把牠帶進家裡。路上小心，到家跟我說一聲。", thread: "西蓝花" },
    ]},
    { id: "reluctant-go-home", label: "嗯……我先回家，可是还是有点难受", nextStage: 73, lines: [
      { sender: "我", body: "嗯……我先回家，可是想到牠還一個人在那裡，我心裡還是很難受。", thread: "西蓝花" },
      { sender: "西蓝花", body: "我知道啦，我也會心疼。但妳先回去休息，我們不是不管牠，是要用安全一點的方法幫牠。", thread: "西蓝花" },
    ]},
  ],
  73: [
    { id: "home-arrived-chat", label: "我到家啦！今天真的发生好多事", nextStage: 74, lines: [
      { sender: "我", body: "我到家啦！今天真的發生好多事，整個人都累了。", thread: "西蓝花" },
      { sender: "西蓝花", body: "辛苦啦！先喝點水、坐下來休息。妳今天是不是又忙到沒好好吃東西？", thread: "西蓝花" },
    ]},
    { id: "home-food-chat", label: "我回家了，先跟你聊点别的转换心情", nextStage: 74, lines: [
      { sender: "我", body: "我回家了，先跟妳聊點別的轉換一下心情，不然我腦袋一直都是那隻小貓。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啊！那妳今天晚餐想吃什麼？不要又隨便泡個東西就算了喔。", thread: "西蓝花" },
    ]},
  ],
  74: [
    { id: "ask-more-about-work", label: "有啦有啦！对了，你上次说那个同事后来怎么样了？", nextStage: 75, lines: [
      { sender: "我", body: "有啦有啦！我有吃東西。對了，妳上次說那個很雷的同事後來怎麼樣了？", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈妳還記得喔！後來主管出面處理，他終於不敢再亂甩鍋了，想到就好笑。", thread: "西蓝花" },
    ]},
    { id: "answer-food", label: "还没吃呢……我等一下就去弄点东西", nextStage: 75, lines: [
      { sender: "我", body: "還沒吃啦……我等一下就去弄點東西，妳不要先罵我！", thread: "西蓝花" },
      { sender: "西蓝花", body: "我就知道！快去弄點吃的，不要忙起來又忘記。妳吃東西的時候我跟妳講，我今天工作上也遇到一件超好笑的事！", thread: "西蓝花" },
    ]},
  ],
  75: [
    { id: "ask-about-her-day", label: "哈哈哈那你今天还遇到什么好笑的事？", nextStage: 76, lines: [
      { sender: "我", body: "哈哈哈那妳今天還遇到什麼好笑的事？快講，我想聽。", thread: "西蓝花" },
      { sender: "西蓝花", body: "還有一個客人點錯飲料，喝了一口才發現，居然怪我做錯！我真的差點當場笑出來。", thread: "西蓝花" },
    ]},
    { id: "tease-her-work", label: "你今天听起来也很忙欸，辛苦啦", nextStage: 76, lines: [
      { sender: "我", body: "妳今天聽起來也很忙欸，辛苦啦！今天總算可以休息一下了吧？", thread: "西蓝花" },
      { sender: "西蓝花", body: "對啊！所以今天真的被搞得很累。還好現在可以跟妳聊天放鬆一下。", thread: "西蓝花" },
    ]},
  ],
  76: [
    { id: "cannot-leave-kitten", label: "不行！我還是要回去找牠！牠一隻貓太可憐了", nextStage: 71, lines: [
      { sender: "我", body: "不行！我還是要回去找牠！牠一隻貓待在那裡太可憐了，我真的沒辦法當作沒看見。", thread: "西蓝花" },
      { sender: "西蓝花", body: "唉……我就知道妳一定忍不住。好啦，妳回去看看可以，但一定要注意安全，不要自己冒險抓牠！", thread: "西蓝花" },
      { sender: "西蓝花", body: "如果牠還在，就先看看有沒有名牌或聯絡方式，找到主人最重要。", thread: "西蓝花" },
    ]},
    { id: "go-back-to-check", label: "我真的放心不下，我想親眼確認牠還在不在", nextStage: 71, lines: [
      { sender: "我", body: "我真的放心不下，我想親眼確認牠還在不在。就算不帶牠回家，我也想回去看一眼。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好吧，那妳去吧！路上小心，看到牠先別急著抱，看看牠脖子上有沒有名牌。", thread: "西蓝花" },
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
  67: [
    { id: "suggest-isolation", label: "我可以让它单独住一个房间，跟 Vava 隔离呀", nextStage: 81, lines: [
      { sender: "我", body: "可是我可以讓牠單獨住一個房間啊！門關起來，不讓牠跟 Vava 接觸，這樣也不行嗎？", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳先等等！隔離不是把門關起來就沒事了啦。", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳每天還是要進出房間，手、衣服、鞋子都可能把病菌或寄生蟲帶出來，Vava 一樣有風險。", thread: "西蓝花" },
      { sender: "西蓝花", body: "而且小貓有沒有跳蚤、耳疥蟲，甚至其他傳染病都還不知道，不能只靠隔離就放心。", thread: "西蓝花" },
    ]},
    { id: "still-wants-to-help", label: "可是我真的不想把它继续留在外面", nextStage: 81, lines: [
      { sender: "我", body: "我知道妳是擔心 Vava，可是牠一直待在外面我真的很不放心……", thread: "西蓝花" },
      { sender: "西蓝花", body: "我也心疼牠啊！但妳想想，萬一牠真的有傳染病，妳把牠帶回家，Vava 怎麼辦？", thread: "西蓝花" },
      { sender: "西蓝花", body: "而且妳照顧牠的時候走來走去，也可能把病菌帶到家裡其他地方。先確認健康狀況比較安全，好不好？", thread: "西蓝花" },
    ]},
  ],
  68: [
    { id: "home-chat-work", label: "我到家啦。对了，你上次说的工作后来怎么样了？", nextStage: 69, lines: [
      { sender: "我", body: "我到家啦。對了，妳上次說工作上那個很難搞的人，後來怎麼樣了？", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈妳還記得喔！後來主管出來處理了，那個人瞬間安靜，超好笑。", thread: "西蓝花" },
      { sender: "西蓝花", body: "我才沒那麼容易生氣咧！欸對了，妳今天晚餐吃什麼？", thread: "西蓝花" },
      { sender: "西蓝花", body: "不要跟我說又隨便吃兩口喔，我會生氣！", thread: "西蓝花" },
    ]},
    { id: "home-chat-food", label: "终于到家了，先跟你吐槽一下今天发生的事", nextStage: 69, lines: [
      { sender: "我", body: "終於到家了，先跟妳吐槽一下今天發生的事，真的有夠累。", thread: "西蓝花" },
      { sender: "西蓝花", body: "來來來，我的耳朵借妳！不過妳先去喝水，講完記得吃點東西。", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳怎麼跟我媽一樣一直提醒妳吃飯？因為妳真的很需要人盯著啊哈哈哈！", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦，今天先放過妳，明天再跟我報告後續。", thread: "西蓝花" },
    ]},
  ],
  69: [
    { id: "still-thinking-kitten", label: "我刚刚休息了一下，可是脑子里还是那只小猫", nextStage: 70, lines: [
      { sender: "我", body: "我剛剛休息了一下，可是腦子裡還是一直想到那隻小貓。", thread: "西蓝花" },
      { sender: "西蓝花", body: "妳不要又來喔！我不是不心疼牠，只是妳真的要先考慮 Vava，還有小貓自己的健康狀況。", thread: "西蓝花" },
      { sender: "我", body: "我知道，我沒有要直接把牠帶回家……可是牠一個人在那裡，我真的不安心。", thread: "西蓝花" },
      { sender: "西蓝花", body: "唉，我知道妳心軟。要不然先看看附近有沒有動保或救援的人可以幫忙？不要自己冒險喔。", thread: "西蓝花" },
    ]},
    { id: "ask-rescue-advice", label: "你说我是不是应该联系附近的救援？", nextStage: 70, lines: [
      { sender: "我", body: "妳說我是不是應該聯絡附近的救援？我一直覺得把牠留在那裡不太好。", thread: "西蓝花" },
      { sender: "西蓝花", body: "可以啊！先找有經驗的人幫忙，也看看附近有沒有貓媽媽或主人在找牠。", thread: "西蓝花" },
      { sender: "我", body: "嗯……我再想一下，但我真的一直想到牠。", thread: "西蓝花" },
    ]},
  ],
  70: [
    { id: "home-smalltalk", label: "先不想小猫了，跟你聊点别的吧", nextStage: 76, lines: [
      { sender: "我", body: "先不想小貓了……妳今天還有沒有遇到什麼好笑的事？", thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈有啊！我剛剛又想到一件事，今天有個客人把飲料拿錯了，還堅持說是我做錯，真的很好笑。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦，先不講工作了。妳今天也累了一天，等一下記得休息喔。", thread: "西蓝花" },
    ]},
    { id: "home-chat-more", label: "哈哈哈你今天真的好多故事，再跟我讲讲", nextStage: 76, lines: [
      { sender: "我", body: "哈哈哈妳今天真的好多故事，再跟我講講啦！", thread: "西蓝花" },
      { sender: "西蓝花", body: "還不是因為今天上班太精彩！不過妳也先放鬆一下，別一直惦記著小貓，先喝點水。", thread: "西蓝花" },
    ]},
  ],
  71: [
    { id: "kitten-still-there", label: "！！！（小猫居然还在原地！）", nextStage: 80, lines: [
      { sender: "我", body: "！！！牠居然還在原地！我剛剛還怕牠已經不見了……", thread: "西蓝花" },
      { sender: "西蓝花", body: "？？？怎麼了怎麼了？妳找到牠了嗎？發生什麼事？", thread: "西蓝花" },
    ]},
    { id: "kitten-still-there-again", label: "！！！我回去看了，小猫居然还在！", nextStage: 80, lines: [
      { sender: "我", body: "！！！我回去看了，牠居然還在原地！我還以為牠已經不見了。", thread: "西蓝花" },
      { sender: "西蓝花", body: "？？？怎麼了？妳找到牠了嗎？快跟我說！", thread: "西蓝花" },
    ]},
  ],
  81: [
    { id: "agree-clinic-first", label: "好吧好吧，那我先带它去医院看看", nextStage: 3, lines: [
      { sender: "我", body: "好吧好吧！妳說得也有道理，那我先帶牠去醫院看看，讓醫生檢查一下再決定怎麼安置。", thread: "西蓝花" },
      { sender: "西蓝花", body: "這樣最好！先確認牠有沒有傳染病或寄生蟲，也保護 Vava。妳帶牠去醫院的路上小心喔！", thread: "西蓝花" },
      { sender: "西蓝花", body: "如果牠不肯讓妳抱就不要硬來，安全第一，到了醫院記得跟我說！", thread: "西蓝花" },
    ]},
    { id: "clinic-is-safest", label: "那就先检查，等医生说可以再考虑带回家", nextStage: 3, lines: [
      { sender: "我", body: "好啦，我妥協！那我先帶牠去醫院檢查，等醫生確認沒問題，再考慮後面的事。", thread: "西蓝花" },
      { sender: "西蓝花", body: "乖啦！不是不讓妳救牠，是要把妳跟 Vava 都顧好。先去檢查，後面我們再一起想辦法。", thread: "西蓝花" },
    ]},
  ],
  80: [
    { id: "explain-nameplate", label: "我看到小猫铭牌了，上面写着温尚翊！！！", nextStage: 49, lines: [
      { sender: "我", body: "我看到小貓銘牌了，上面寫著溫尚翊！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "不會吧？？？溫尚翊？？？這不是怪獸的本名嗎？？？", thread: "西蓝花" },
      { sender: "西蓝花", body: "等一下，妳先別急！貓咪的名字也寫在上面嗎？這也太巧了吧？？？", thread: "西蓝花" },
    ]},
    { id: "confirm-tag", label: "我没看错！铭牌上真的就是温尚翊！", nextStage: 49, lines: [
      { sender: "我", body: "我沒看錯！銘牌上真的就是溫尚翊！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "真的假的啦？？？這名字也太熟悉了吧！妳先看看有沒有電話，我們確認一下。", thread: "西蓝花" },
    ]},
  ],
};
export function WeChatSkin(p: SkinProps) {
  const [tab, setTab] = useState("微信");
  const [query, setQuery] = useState("");
  const [moments, setMoments] = useState(false);

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
  const displayName = (name: string) => name === "温尚翊" ? "大G" : name;
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
  const ownerChatStarted = [9, 14, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27, 35, 36, 40, 41, 42, 43, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62].includes(catRescue.stage);
  // Keep both contact transcripts readable for the entire story, including
  // after the handoff. Hiding the Broccoli story view at later stages made
  // delivered replies appear in notifications but disappear when opened.
  const catRescueActive =
    isBroccoliThread ||
    (isMonsterThread && (monsterFriendAccepted || ownerChatStarted || catRescue.stage === 53));
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
  const catChoices =
    // Stage 53 is the explicit DaG follow-up after "妳？？？怎麼啦？".
    // Keep its two replies visible in DaG's own chat even if an unrelated
    // stale queue entry remains from the previous contact.
    ((catRescue.stage === 53 && isMonsterThread) ||
      (pendingCatLines.length === 0 && isCurrentChoiceThread))
      ? (CAT_RESCUE_CHOICES[catRescue.stage] || [])
      : [];
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
  useEffect(() => {
    // After the owner reacts to the name reveal, move the visible chat to
    // Broccoli only once every queued DaG message has appeared. Later, return
    // to DaG after the Broccoli follow-up is fully delivered.
    if (pendingCatLines.length > 0) return;
    if (shouldAutoReturnToBroccoli(catRescue.stage, pendingCatLines.length, p.thread)) {
      setTab("微信");
      p.onThread("西蓝花");
    } else if ([35, 40].includes(catRescue.stage) && p.thread !== "大G" && p.thread !== "温尚翊") {
      setTab("微信");
      p.onThread("大G");
    }
  }, [catRescue.stage, pendingCatLines.length, p.thread, p.onThread]);
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

  const appendCatLines = (lines: CatLine[], nextStage = catRescue.stage, branch = catRescue.branch) => {
    // A choice sends exactly the player's first line. Then only incoming
    // replies are queued, in order, until the next player-authored line.
    // Later player lines in legacy script arrays are NOT auto-sent: the next
    // stage's visible choices are how the player responds.
    const destination = getCatRescueThreadForStage(nextStage);
    const prepared = lines.map((line) => ({ ...line, thread: line.thread || destination }));
    const immediateLines: CatLine[] = [];
    if (prepared[0]?.sender === "我") immediateLines.push(prepared[0]);
    const queuedLines: CatLine[] = [];
    for (const line of prepared.slice(immediateLines.length)) {
      if (line.sender === "我") break;
      queuedLines.push(line);
    }
    const immediateItems = immediateLines.map((line, index) => makeItem({
      id: "cat-rescue-" + Date.now() + "-" + index + "-" + Math.random().toString(36).slice(2, 7),
      title: line.thread || destination,
      sender: line.sender,
      body: line.body,
      time: "2026-11-02 " + (storyClockRef.current || "14:24"),
      outgoing: line.sender === "我",
      avatar: "",
      meta: { storyId: "cat-rescue", storyThread: line.thread || destination, storyOrderAt: String(Date.now() + index) },
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
  const chooseCatRescue = (choice: CatChoice) => {
    appendCatLines(choice.lines, choice.nextStage, choice.branch || catRescue.branch);
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
        <strong>{statusEditorOpen ? "设个状态" : utility || (p.thread ? displayName(p.thread) : moments ? "朋友圈" : tab)}</strong>
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
              <MessageList items={threadItems} creator={p.creator} onItem={p.onItem} onRead={p.onRead} wechat />
              {isBroccoliThread && catRescue.stage === 8 && !idCopied && pendingCatLines.length === 0 && <div className="cat-rescue-choices"><button onClick={() => setAddIdModal(true)}>查看对方的微信号</button></div>}
              {catChoices.length > 0 && (
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
              <MessageList items={allItems.filter((i) => i.title === p.thread)} creator={p.creator} onItem={p.onItem} onRead={p.onRead} wechat />
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
                  return <button className="wx-contact-row" key={name} onClick={() => openContact(name)}>
                    <Avatar name={name} src={avatarItem?.avatar || (name === "西蓝花" ? GLOOMY_AVATAR : "")} /><span>{name}</span>
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
