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
  const broccoliStages = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 30, 31, 32, 33, 34, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52]);
  return broccoliStages.has(stage) ? "西蓝花" : "大G";
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
    { id: "bring-home", label: "我真的不忍心把它留在这里……想带它回家", nextStage: 1, branch: "bring-home", lines: [
      { sender: "我", body: "我越看越舍不得……它一直在路边叫，我想先把它带回家。" },
      { sender: "西蓝花", body: "等等等等！！你先不要冲動啦！你家里还有 Vava 耶！" },
      { sender: "我", body: "我知道啊，可是它这么小一只，身边也没有猫妈妈，我真的走不开。" },
      { sender: "西蓝花", body: "我不是不让你救它啦，我是怕它身上有跳蚤或传染病，回家碰到 Vava 怎么办？" },
    ]},
    { id: "leave-first", label: "先不带走好了……可是我真的有点放心不下", nextStage: 10, branch: "leave-first", lines: [
      { sender: "我", body: "我先不带它走好了……可是它一直在那里，我真的有点放心不下。" },
      { sender: "西蓝花", body: "嗯……先不要急着抱回家也可以，至少先确认它附近有没有妈妈或其他人照顾。" },
      { sender: "我", body: "好吧，我先走一段看看，可是我一定会一直想它。" },
      { sender: "西蓝花", body: "你先去忙一下啦，有时候它可能只是躲在附近，等等再看看也好。" },
    ]},
  ],
  1: [
    { id: "separate-room", label: "我可以让它住另一个房间，完全不碰到 Vava", nextStage: 2, lines: [
      { sender: "我", body: "我可以让它先住另一个房间，门关起来，完全不让它碰到 Vava。" },
      { sender: "西蓝花", body: "可是你进出房间也会把病菌带来带去啊，而且它的健康状况我们都不知道。" },
      { sender: "我", body: "那我回家先换衣服、洗手消毒，东西也分开用，好不好？" },
      { sender: "西蓝花", body: "你连隔离流程都想好了是不是……我真的要被你说服了，但还是要先看医生！" },
    ]},
    { id: "cant-leave", label: "可是我一想到它还要在外面待着就好难受", nextStage: 2, lines: [
      { sender: "我", body: "可是我一想到它还要在外面待着，我就觉得好难受。它看起来真的很小。" },
      { sender: "西蓝花", body: "我懂啦……但你也不能因为心疼它，就让 Vava 冒风险啊。" },
      { sender: "我", body: "我没有要让它们见面，我只是想先把它安置好。" },
      { sender: "西蓝花", body: "唉，你这样讲我也开始心软了……但一定要先检查，答应我。" },
    ]},
  ],
  2: [
    { id: "clinic-first", label: "那我先带它去医院，检查完再决定怎么安置", nextStage: 3, lines: [
      { sender: "我", body: "不然这样好了，我先带它去医院，检查完再决定怎么安置。" },
      { sender: "西蓝花", body: "这样比較好！可是你确定它愿意让你抱吗？也要小心别被抓傷。" },
      { sender: "我", body: "我慢慢靠近它了，它没有躲，还一直蹭我的手。" },
      { sender: "西蓝花", body: "啊啊啊不要讲得这么可爱啦！我现在也很难叫你放下它了。" },
    ]},
    { id: "still-worried", label: "我还是怕带回家不安全……要不先送医院？", nextStage: 3, lines: [
      { sender: "我", body: "我还是怕带回家不安全……要不先送医院？至少先让医生看看它。" },
      { sender: "西蓝花", body: "对！先去医院最安心，记得跟医生说家里还有 Vava。" },
      { sender: "我", body: "嗯，我会跟医生说，也会准备单独的外出笼。" },
      { sender: "西蓝花", body: "那我稍微放心一点了……但你真的确定要带它回家吗？" },
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
    { id: "talk-about-day", label: "先聊点别的吧，你今天不是说有件事要跟我讲？", nextStage: 11, lines: [
      { sender: "我", body: "我先不想小貓的事了……對了，妳今天不是說有件事要跟我講？" },
      { sender: "西蓝花", body: "哈哈哈哈妳終於想到別的事了！我今天上班真的遇到一個超誇張的人。" },
    ]},
    { id: "chat-food", label: "你先陪我聊聊天，我现在心里乱乱的", nextStage: 11, lines: [
      { sender: "我", body: "妳先陪我聊聊天嘛，我現在心裡亂亂的，想轉移一下注意力。" },
      { sender: "西蓝花", body: "好啦好啦，我在！那妳今天有沒有好好吃飯？" },
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
    { id: "tease-owner", label: "那你回来记得请我吃饭，算是小猫的感谢费", nextStage: 26, lines: [
      { sender: "我", body: "那你回来记得请我吃饭，算是小猫的感谢费！" },
      { sender: "大G", body: "哈哈，這樣就想敲我一頓喔？可以啦，等我回去請妳吃飯，妳想吃什麼再跟我說。" },
      { sender: "我", body: "说好了，不许赖账！" },
      { sender: "大G", body: "不會啦，答應妳的事我記著。" },
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
    ]},
    { id: "say-name-is-cute-to-owner", label: "我只是觉得玩玩这个名字也太可爱了", nextStage: 32, lines: [
      { sender: "我", body: "我只是覺得玩玩這個名字也太可愛了！", thread: "大G" },
      { sender: "大G", body: "哈哈，牠從小就很愛玩，家裡就一直這樣叫牠。", thread: "大G" },
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
    { id: "shock-wanwan-name", label: "我靠我靠！！！牠叫玩玩？？？", nextStage: 33, lines: [
      { sender: "我", body: "我靠我靠！！！牠叫玩玩？？？", thread: "西蓝花" },
      { sender: "西蓝花", body: "？？？？等一下！！！怪獸家的貓就叫玩玩？？？妳說的是五月天那個怪獸嗎？？？", thread: "西蓝花" },
    ]},
    { id: "double-check-wanwan", label: "等等等等，你说它叫玩玩？这也太巧了吧！", nextStage: 33, lines: [
      { sender: "我", body: "等等等等，妳說牠叫玩玩？這也太巧了吧！！！", thread: "西蓝花" },
      { sender: "西蓝花", body: "蛤？？？妳怎麼突然這麼激動？怪獸家的貓就叫玩玩？？？", thread: "西蓝花" },
    ]},
  ],
  33: [
    { id: "explain-just-lucky-coincidence", label: "真的啦！只是觉得太巧了，没想到会叫玩玩", nextStage: 37, lines: [
      { sender: "我", body: "真的啦！只是覺得太巧了，沒想到牠會叫玩玩，我一時有點反應不過來。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好啦好啦，先相信妳！但這名字真的很有記憶點，妳先別在大G面前露餡喔。", thread: "西蓝花" },
    ]},
    { id: "keep-it-to-myself", label: "我先不告诉你原因，等一下慢慢跟你说", nextStage: 37, lines: [
      { sender: "我", body: "我先不告訴妳原因啦，等一下慢慢跟妳說，現在真的有點亂。", thread: "西蓝花" },
      { sender: "西蓝花", body: "好！我等妳整理好再說。可是妳這個反應真的很可疑欸！", thread: "西蓝花" },
    ]},
  ],
  37: [
    { id: "ask-should-tell", label: "我要不要直接告诉大G我知道他是谁啊？", nextStage: 38, lines: [
      { sender: "我", body: "可是我現在有點猶豫欸……我要不要直接跟大G說我知道他是誰啊？", thread: "西蓝花" },
      { sender: "西蓝花", body: "先等等！！！妳先不要一激動就全招了啦！他現在還不知道妳認出他了吧？", thread: "西蓝花" },
      { sender: "我", body: "對啊，他應該還以為我只是撿到貓、照著名牌聯絡他的路人而已……", thread: "西蓝花" },
      { sender: "西蓝花", body: "那就先自然一點啊！先把玩玩照顧好，等他回來接貓再看情況。這種事慢慢來比較有趣！", thread: "西蓝花" },
    ]},
    { id: "still-cant-believe", label: "我真的还在震惊，这也太离谱了吧！", nextStage: 38, lines: [
      { sender: "我", body: "我真的還在震驚……這也太離譜了吧！我到現在都覺得像在做夢。" , thread: "西蓝花" },
      { sender: "西蓝花", body: "哈哈哈哈妳先冷靜！但我完全懂妳為什麼會瘋掉，這機率也太低了吧！" , thread: "西蓝花" },
      { sender: "我", body: "而且我剛剛還跟他說我可以幫忙照顧玩玩，我現在突然覺得好不真實。" , thread: "西蓝花" },
      { sender: "西蓝花", body: "那妳就好好照顧牠呀！這可是怪獸家的小朋友，先把牠平平安安照顧好最重要！" , thread: "西蓝花" },
    ]},
  ],
  38: [
    { id: "keep-natural", label: "好，我先不说破，正常跟他聊玩玩的事", nextStage: 39, lines: [
      { sender: "我", body: "好啦，我先不說破，先正常跟他聊玩玩的事情好了。" , thread: "西蓝花" },
      { sender: "西蓝花", body: "對！就當作普通失主聯絡，別突然把人家嚇到。妳有新消息一定要第一時間跟我說！" , thread: "西蓝花" },
      { sender: "我", body: "知道啦！我先回去看看玩玩，晚點再跟你說。" , thread: "西蓝花" },
      { sender: "西蓝花", body: "快去快去！替我摸摸玩玩，啊不對，先確認牠願不願意給妳摸，哈哈哈哈！" , thread: "西蓝花" },
    ]},
    { id: "promise-update", label: "我先去照顾玩玩，有消息马上回来告诉你", nextStage: 39, lines: [
      { sender: "我", body: "我先去照顧玩玩，有消息一定馬上回來告訴你！" , thread: "西蓝花" },
      { sender: "西蓝花", body: "好！妳先忙，記得吃飯喝水，不要光顧著激動。玩玩就交給妳啦！" , thread: "西蓝花" },
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
  36: [],
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
  const ownerChatStarted = [9, 14, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27, 35, 40, 41, 42, 43, 53].includes(catRescue.stage);
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
    if ([32, 33, 37, 38, 39].includes(catRescue.stage) && p.thread !== "西蓝花" && p.thread !== "西兰花") {
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
