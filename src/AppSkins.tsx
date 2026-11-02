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
  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [items.length]);

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
  const broccoliStages = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 30, 31]);
  return broccoliStages.has(stage) ? "西蓝花" : "大G";
}
export function getCatRescueStageAfterFriendAdd(stage: number, branch: string): number {
  if (stage === 13 && branch === "monster-prank") return 16;
  if (stage === 13) return 14;
  return 9;
}
export function shouldShowPrankHistoryLine(item: Item, branch: string): boolean {
  const obsoletePrankReply = /^(妳是？|……蛤？|妳哪位？我不認識妳喔。|好喔，那我先把妳刪掉了。掰。)$/;
  return branch !== "monster-prank" || !obsoletePrankReply.test(item.body);
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
  const owner = messages.filter((item, index) =>
    isOwnerStoryMessage(item) || (ownerStart >= 0 && index >= ownerStart && !isHospitalStoryMessage(item))
  );
  const broccoli = messages.filter((item) =>
    isHospitalStoryMessage(item) || !owner.includes(item)
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
    { id: "arrived-hospital", label: "到了！我刚到医院，正在等医生", nextStage: 31, lines: [
      { sender: "我", body: "到了到了！我刚到医院，正在等医生。" },
      { sender: "西蓝花", body: "好！医生有开始帮它检查了吗？有没有先看看有没有晶片？" },
    ]},
    { id: "already-checking", label: "到了！医生已经开始帮它检查了", nextStage: 31, lines: [
      { sender: "我", body: "到了！医生已经开始帮它检查了。" },
      { sender: "西蓝花", body: "那就好！记得问医生有没有晶片，也顺便确认一下它的健康状况。" },
    ]},
  ],
  31: [
    { id: "chip-check", label: "医生正在帮它检查，等一下会扫描晶片", nextStage: 4, lines: [
      { sender: "我", body: "医生正在帮它检查，等一下要看看有没有晶片或主人资料。" },
      { sender: "西蓝花", body: "嗯嗯，那你先陪着它，别让它紧张。等医生检查完再跟我说！" },
    ]},
    { id: "worried-about-cat", label: "它看起来有点紧张，我先陪陪它", nextStage: 4, lines: [
      { sender: "我", body: "它看起来有点紧张，我先陪陪它，等医生检查完再说。" },
      { sender: "西蓝花", body: "好可怜喔……你陪着它就好，检查结果出来记得第一时间告诉我！" },
    ]},
  ],
  3: [
    { id: "promise-check", label: "放心吧，我会先带它去医院检查，绝对不会让它碰到 Vava", nextStage: 30, lines: [
      { sender: "我", body: "放心吧，我会带它去医院先检查，医生确认安全之前绝对不会让它碰到 Vava。" },
      { sender: "西蓝花", body: "好啦……你都说到这个份上了，我就相信你一次。先带它去检查，其他的等医生说了再决定。" },
      { sender: "我", body: "好！我把它放进外出笼了，现在就去医院。" },
      { sender: "西蓝花", body: "路上小心！到了记得跟我说，还有不要忘记问医生有没有晶片哦。" },
      { sender: "西蓝花", body: "欸，你到了嗎？" },
    ]},
    { id: "go-now", label: "好啦好啦，我带它走，先去医院再说", nextStage: 30, lines: [
      { sender: "我", body: "好啦好啦，我带它走，先去医院再说。你放心，我不会让它直接接触 Vava。" },
      { sender: "西蓝花", body: "我不是不相信你啦，我是怕你一心软就什么都忘了！" },
      { sender: "我", body: "知道啦，我会先让医生检查，回家也会隔离。" },
      { sender: "西蓝花", body: "那就好……快去吧，我等你消息。" },
      { sender: "西蓝花", body: "欸，你到了嗎？" },
    ]},
  ],
  10: [
    { id: "talk-about-day", label: "先聊点别的吧，你今天不是说有件事要跟我讲？", nextStage: 11, lines: [
      { sender: "我", body: "我先不想小猫的事了……对了，你今天不是说有件事要跟我讲？" },
      { sender: "西蓝花", body: "哈哈哈哈你终於想到别的事了！我今天上班真的遇到一个超夸张的人。" },
      { sender: "我", body: "怎么了怎么了，快说！" },
      { sender: "西蓝花", body: "他把咖啡放在影印机旁边，结果整杯打翻，文件全部变咖啡味，笑死我了。" },
      { sender: "我", body: "救命哈哈哈哈哈，你们办公室每天都这么精彩吗？" },
      { sender: "西蓝花", body: "差不多啦！欸你晚餐想吃什么？不要又随便吃哦。" },
    ]},
    { id: "chat-food", label: "你先陪我聊聊天，我现在心里乱乱的", nextStage: 11, lines: [
      { sender: "我", body: "你先陪我聊聊天嘛，我现在心里乱乱的，想转移一下注意力。" },
      { sender: "西蓝花", body: "好啦好啦，我在！那你今天有没有好好吃饭？" },
      { sender: "我", body: "还没欸，本来想说回家再吃。" },
      { sender: "西蓝花", body: "不行！先去买点东西吃，不要饿着肚子乱想。" },
      { sender: "我", body: "知道啦……你最近有没有看到什么好看的剧？" },
      { sender: "西蓝花", body: "有啊，我晚点传給你！你先去吃点东西。" },
    ]},
  ],
  11: [
    { id: "go-back", label: "不行，我还是放心不下，我想回去看看它", nextStage: 5, lines: [
      { sender: "我", body: "不行……我还是放心不下。它那么小一只，我真的没办法当作没看见，我回去看看。" },
      { sender: "西蓝花", body: "我就知道你一定会回去啦！慢慢走，注意安全。" },
      { sender: "我", body: "我回到刚才那个地方了……天啊，它竟然还在！" },
      { sender: "西蓝花", body: "真的假的？？它还在那里等你哦？" },
      { sender: "我", body: "它跑过来蹭我了！我抱起来才发现脖子上挂着一个牌子，上面写着主人：温尚翊。" },
      { sender: "西蓝花", body: "……等一下。你说什么？？？温尚翊？？？" },
    ]},
    { id: "return-anyway", label: "我想了一路，还是决定回头找它", nextStage: 5, lines: [
      { sender: "我", body: "我本来想回家了，可是越走越不对勁……我还是回头找它好了。" },
      { sender: "西蓝花", body: "去吧去吧，但不要跑，注意车！" },
      { sender: "我", body: "我找到它了！！它竟然还在原地！" },
      { sender: "西蓝花", body: "天啊，还好它没有跑掉……" },
      { sender: "我", body: "它脖子上有个小挂牌，我刚刚看清楚了，上面写着主人：温尚翊。" },
      { sender: "西蓝花", body: "蛤？？？？你再说一次？？温尚翊？？？" },
    ]},
  ],
  4: [
    { id: "tag-check", label: "我把牌子拍給你看了，真的是温尚翊", nextStage: 5, lines: [
      { sender: "我", body: "医生刚刚看了它脖子上的挂牌，上面清清楚楚写着主人：温尚翊。" },
      { sender: "西蓝花", body: "等一下……你说的是温尚翊？？？不会吧？？？" },
      { sender: "我", body: "真的！医生说牌子上留了联络电话，我现在脑袋一片空白。" },
      { sender: "西蓝花", body: "先把照片传給我！我确认一下……天啊，真的是这三个字欸！" },
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
  ],
  7: [
    { id: "try-wechat", label: "好，我试试看用这个微信号加好友。", nextStage: 8, lines: [
      { sender: "我", body: "好，我试试看用这个微信号加好友。" },
      { sender: "西蓝花", body: "嗯嗯！先确认是不是本人，别一上来就把自己吓到。" },
      { sender: "我", body: "我去微信看看……" },
    ]},
  ],
  9: [
    { id: "monster-prank", label: "我是你爸爸", nextStage: 17, branch: "monster-prank", lines: [
      { sender: "我", body: "我是你爸爸。" },
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
  ],
  16: [
    { id: "monster-apology-after-prank", label: "对不起，刚刚发错人了……其实我是捡到你的小猫了", nextStage: 20, branch: "monster-cat", lines: [
      { sender: "我", body: "對不起，剛剛那句發錯人了啦……我不是故意要鬧你的。" },
      { sender: "我", body: "其實我撿到一隻小黑貓，牠脖子上掛著牌子，上面留了你的微信號，所以才想聯絡你。" },
      { sender: "大G", body: "蛤？小黑貓？妳在哪裡看到牠的？牠現在還好嗎？有沒有受傷？" },
    ]},
  ],
  20: [
    { id: "cat-temperament", label: "它很乖，一直窝在我怀里，也没有乱跑", nextStage: 21, lines: [
      { sender: "我", body: "它很乖，一直窝在我怀里，也没有乱跑，看起来还挺亲人的。" },
      { sender: "大G", body: "那就好，牠從小就不太怕生啦。只是有時候好奇心很重，門一開就想往外跑。" },
      { sender: "我", body: "难怪会自己跑出去，幸好这次遇到我了。" },
      { sender: "大G", body: "真的要謝謝妳欸，不然我回家才發現牠不見，一定會急死。" },
    ]},
    { id: "cat-tag", label: "挂牌上写着你的联系方式，我怕它走丢才赶紧联系你", nextStage: 21, lines: [
      { sender: "我", body: "它脖子上的挂牌还挺清楚的，上面有你的联系方式，我怕它再跑丢才赶紧联系你。" },
      { sender: "大G", body: "那個牌子掛很久了，還好有留電話。牠平常都在家附近活動，我也沒想到會跑遠。" },
      { sender: "我", body: "它现在很安全，你先不用担心。" },
      { sender: "大G", body: "嗯，謝謝妳。真的麻煩妳了。" },
    ]},
  ],
  21: [
    { id: "ask-return", label: "那你什么时候回来接它呀？", nextStage: 22, lines: [
      { sender: "我", body: "那你什么时候回来接它呀？我可以先帮你照看，不过想先知道大概多久。" },
      { sender: "大G", body: "我這邊還有事情要處理，應該還要幾天才回得去。原本以為牠乖乖待在家，沒想到給我跑出去了。" },
      { sender: "我", body: "没关系，你先把事情处理好，小猫这边我会留意。" },
      { sender: "大G", body: "妳人也太好了吧……我都還沒開口拜託妳。" },
    ]},
    { id: "offer-care", label: "要不我先帮你照顾它几天，等你回来再接走？", nextStage: 22, lines: [
      { sender: "我", body: "要不我先帮你照顾它几天吧，等你回来再接走就好。" },
      { sender: "大G", body: "這樣真的可以嗎？我這幾天都不在家，原本還在想要怎麼安排牠。" },
      { sender: "我", body: "可以呀，反正它现在也在我这里，我会照顾好它的。" },
      { sender: "大G", body: "那我真的欠妳一個人情了……" },
    ]},
  ],
  22: [
    { id: "agree-care", label: "可以，我先照顾它几天，等你回来再接它", nextStage: 23, lines: [
      { sender: "大G", body: "那……我可以拜託妳一件事嗎？能不能先幫我照顧牠幾天？等我一回去就馬上把牠接走。" },
      { sender: "我", body: "可以呀，没问题。我会先照顾它，你回来前我会好好看着它。" },
      { sender: "大G", body: "真的太謝謝妳了。牠的飼料跟習慣我晚點整理給妳，妳有什麼問題隨時傳訊息給我。" },
      { sender: "大G", body: "還有啊，牠有點挑食，別被牠那張無辜的臉騙了，哈哈。" },
    ]},
    { id: "ask-details", label: "好呀，不过你要告诉我它平时的习惯和注意事项", nextStage: 23, lines: [
      { sender: "大G", body: "那……我可以拜託妳一件事嗎？能不能先幫我照顧牠幾天？等我一回去就馬上把牠接走。" },
      { sender: "我", body: "好呀，不过你要告诉我它平时的习惯和注意事项，我怕照顾不好。" },
      { sender: "大G", body: "當然，我等一下把牠平常吃什麼、喜歡玩什麼都整理給妳。牠其實很好照顧啦，就是有點黏人。" },
      { sender: "大G", body: "這幾天真的要麻煩妳了，謝謝妳願意幫忙。" },
    ]},
  ],
  23: [
    { id: "ask-food-routine", label: "那你把它平时吃什么、一天吃几次告诉我吧", nextStage: 24, lines: [
      { sender: "我", body: "那你把它平时吃什么、一天吃几次告诉我吧，我先照着准备。" },
      { sender: "大G", body: "牠平常吃固定的乾糧，一天分幾次少量給就好，旁邊記得放乾淨的水。突然換食物牠可能會不習慣。" },
      { sender: "大G", body: "我晚點把飼料的照片跟份量傳給妳，妳先不要自己亂換喔。" },
    ]},
    { id: "ask-habits", label: "它平时有什么习惯？我想先熟悉一下", nextStage: 24, lines: [
      { sender: "我", body: "它平时有什么习惯呀？我想先熟悉一下，免得它换环境不适应。" },
      { sender: "大G", body: "牠有點黏人，晚上可能會在門口等人。剛到新地方先讓牠自己熟悉，不用一直抱牠。" },
      { sender: "大G", body: "還有牠很愛玩小球，看到紙箱也會鑽進去，妳留意一下別讓牠咬到不該吃的東西。" },
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
  26: [],
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
  const [pendingCatLines, setPendingCatLines] = useState<CatLine[]>([]);
  const storyClockRef = useRef(p.virtualTime || "14:24");
  storyClockRef.current = p.virtualTime || storyClockRef.current;
  const parsedCatRescue = parseCatRescueState(catRescueRaw);
  // Recover stale sessions from older buggy builds: if the user has not
  // completed the explicit add-friend confirmation, keep the story on the
  // broccoli side (stage 8 is the WeChat-ID handoff).
  // Stage 13 is the deliberate "deleted as a friend" state in the prank
  // branch. Preserve it even though the friend-accepted flag is now false,
  // otherwise the blocked-send UI can never appear.
  const catRescue = !monsterFriendAccepted && parsedCatRescue.stage >= 9 && parsedCatRescue.stage <= 12
    ? { ...parsedCatRescue, stage: 8 }
    : parsedCatRescue;
  const allItems = [...p.items, ...catRescue.messages];
  const displayName = (name: string) => name === "温尚翊" ? "大G" : name;
  const isMonsterName = (name: string) => name === "大G" || name === "温尚翊";
  // Split by the saved conversation owner, not by the first incoming sender.
  // Earlier versions classified outgoing prank/apology lines as broccoli chat.
  const { broccoli: friendStoryMessages, owner: ownerStoryMessages } = splitCatRescueMessages(catRescue.messages);
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
  const ownerChatStarted = [9, 14, 16, 17, 20, 21, 22, 23, 24, 25, 26].includes(catRescue.stage);
  const catRescueActive = isBroccoliThread
    ? (!monsterFriendAccepted || [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 30, 31].includes(catRescue.stage))
    : isMonsterThread && (monsterFriendAccepted || ownerChatStarted);
  const catAvatar = GLOOMY_AVATAR;
  const broccoliBaseItems = p.items.filter((item) =>
    (item.title === "西蓝花" || item.title === "西兰花") &&
    item.sender !== "大G" &&
    item.sender !== "温尚翊" &&
    item.meta?.storyThread !== "大G" &&
    // Keep the original seeded chat history: those messages also carry the
    // cat-rescue storyId, but belong to the broccoli conversation. Only
    // remove unmistakable owner-prank lines from legacy mixed saves.
    !/我是你爸爸|妳真的很會鬧|妳是？|蛤？小黑貓|？？？|對不起.*發錯|对不起.*发错/.test(item.body)
  );
  const keepPrankHistoryClean = (item: Item) =>
    shouldShowPrankHistoryLine(item, catRescue.branch);
  const threadItems = isMonsterThread
    ? [
        ...p.items.filter((item) => (item.title === "大G" || item.title === "温尚翊") && keepPrankHistoryClean(item)),
        ...ownerStoryMessages.filter(keepPrankHistoryClean),
      ]
    : isBroccoliThread
      ? [...broccoliBaseItems, ...friendStoryMessages]
      : allItems.filter((item) => item.title === p.thread);
  const catChoices = CAT_RESCUE_CHOICES[catRescue.stage] || [];
  useEffect(() => {
    if (!pendingCatLines.length) return;
    const line = pendingCatLines[0];
    const delay = Math.min(1750, Math.max(720, 520 + line.body.length * 24));
    const timer = window.setTimeout(() => {
      const [hour, minute] = (storyClockRef.current || "14:24").split(":").map(Number);
      const total = (Number.isFinite(hour) ? hour : 14) * 60 + (Number.isFinite(minute) ? minute : 24) + catRescue.messages.length;
      const time = "2026-11-02 " + String(Math.floor(total / 60) % 24).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
      const ownerThread = getCatRescueThreadForStage(catRescue.stage) === "大G";
      const created = makeItem({
        id: "cat-rescue-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        title: line.thread || (ownerThread ? "大G" : "西蓝花"),
        sender: line.sender,
        body: line.body,
        time,
        outgoing: line.sender === "我",
        avatar: line.sender === "西蓝花" ? catAvatar : "",
        meta: { storyId: "cat-rescue", storyThread: line.thread || (ownerThread ? "大G" : "西蓝花") },
      });
      const prankApologyFailed = catRescue.stage === 13 && catRescue.branch === "monster-prank" && line.sender === "我";
      if (prankApologyFailed) setMonsterSendFailed(true);
      // Do not auto-delete the friend when the initial prank message finishes.
      // Stage 17 must remain active so the apology choices can render. The
      // deletion happens only after the player chooses an attempted apology.
      setCatRescueRaw(JSON.stringify({
        ...catRescue,
        version: 2,
        messages: [...catRescue.messages, created],
      }));
      setPendingCatLines((current) => current.slice(1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [pendingCatLines, catRescueRaw]);

  const appendCatLines = (lines: CatLine[], nextStage = catRescue.stage, branch = catRescue.branch) => {
    // The story stage is authoritative; the currently visible thread can lag
    // behind while the friend-request sheet is open.
    const destination = getCatRescueThreadForStage(nextStage);
    setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2, stage: nextStage, branch }));
    setPendingCatLines((current) => [...current, ...lines.map((line) => ({ ...line, thread: line.thread || destination }))]);
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
    const prankReadd = readding && catRescue.branch === "monster-prank";
    const created = [
      makeItem({ id: "monster-added-system-" + Date.now(), title: "大G", sender: "我", body: readding ? "你重新添加了大G，现在可以继续聊天了。" : "你已添加了大G，现在可以开始聊天了。", time, outgoing: true, kind: "event", meta: { storyId: "cat-rescue-add-friend", storyThread: "大G" } }),
      ...(!readding ? [makeItem({ id: "monster-first-message-" + Date.now(), title: "大G", sender: "大G", body: "妳是？", time, outgoing: false, meta: { storyId: "cat-rescue-add-friend", storyThread: "大G", wechatId: "mo00oster111" } })] : []),
    ];
    const nextStage = getCatRescueStageAfterFriendAdd(catRescue.stage, catRescue.branch);
    setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2, stage: nextStage, messages: [...catRescue.messages, ...created] }));
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
              {catChoices.length > 0 && pendingCatLines.length === 0 && (
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
                    meta: { storyId: "cat-rescue", storyThread: "大G", sendFailed: "true" },
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
