import { useSkinState } from "../skinState";
import { GLOOMY_AVATAR } from "../gloomyAvatar";
import {
  ArrowDown,
  ArrowUp,
  AtSign,
  Bookmark,
  Camera,
  ChevronRight,
  Grid,
  Hash,
  Heart,
  Home,
  MessageCircle,
  Repeat2,
  ChevronDown,
  ShoppingBag,
  Search,
  Plus,
  User,
  Menu,
  Pencil,
  ScanLine,
  Wallet,
  Lock,
  Layers,
  Users,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import type { Item } from "../schema";
import {
  Avatar,
  Empty,
  groupItems,
  Header,
  Media,
  meta,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
function Actions({ p, item }: { p: Props; item: Item }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false),
    [saved, setSaved] = useSkinState<boolean>(p, `saved-${item.id}`, false);
  return (
    <div className="social-actions">
      <button aria-label={`喜欢${item.title}`} onClick={() => setLiked(!liked)}>
        <Heart size={17} fill={liked ? "currentColor" : "none"} />
        {item.likes + (liked ? 1 : 0) || ""}
      </button>
      <button aria-label={`评论${item.title}`} onClick={() => p.onItem(item)}>
        <MessageCircle size={17} />
        {item.comments.length || ""}
      </button>
      <button aria-label={`详情${item.title}`} onClick={() => p.onItem(item)}>
        <Repeat2 size={17} />
        {meta(item, "reposts")}
      </button>
      <button aria-label={`收藏${item.title}`} onClick={() => setSaved(!saved)}>
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
function PostHeader({ item, p }: { item: Item; p: Props }) {
  return (
    <button className="social-author" onClick={() => p.onItem(item)}>
      <Avatar name={item.sender} />
      <span>
        <strong>{item.sender}</strong>
        <small>{meta(item, "handle", item.time)}</small>
      </span>
    </button>
  );
}
function WeiboActions({ p, item }: { p: Props; item: Item }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false);
  return (
    <div className="social-actions weibo-actions">
      <button aria-label={`转发${item.title}`} onClick={() => p.onItem(item)}>
        <Share2 size={17} />
        {meta(item, "reposts", "转发")}
      </button>
      <button aria-label={`评论${item.title}`} onClick={() => p.onItem(item)}>
        <MessageCircle size={17} />
        {item.comments.length || "评论"}
      </button>
      <button
        aria-label={`喜欢${item.title}`}
        aria-pressed={liked}
        onClick={() => setLiked(!liked)}
      >
        <ThumbsUp size={17} fill={liked ? "currentColor" : "none"} />
        {item.likes + (liked ? 1 : 0) || "赞"}
      </button>
    </div>
  );
}
export function WeiboSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "关注");
  const [feed, setFeed] = useState("全部");
  const list = feed === "全部" ? items : items.filter((i) => i.folder === feed);
  return (
    <div className="catalog-skin weibo-ui">
      <Header p={p} />
      <div className="weibo-sections">
        {["关注", "发现", "我"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        {tab === "我" ? (
          <div className="weibo-profile">
            <Avatar name={p.owner ?? "我"} />
            <h2>{p.owner ?? "我"}</h2>
            <span>{items.length} 条微博</span>
          </div>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            <div className="weibo-feed-filter">
              {["全部", ...groupItems(items).filter((g) => g !== "未分类")].map(
                (g) => (
                  <button key={g} onClick={() => setFeed(g)}>
                    {g}
                  </button>
                ),
              )}
            </div>
          </>
        )}
        {list.map((i) => (
          <article className="weibo-post" key={i.id}>
            <PostHeader p={p} item={i} />
            <button className="social-body" onClick={() => p.onItem(i)}>
              <p>{i.body}</p>
              {i.media && <Media item={i} />}
            </button>
            <WeiboActions p={p} item={i} />
          </article>
        ))}
        <Empty items={list} />
      </div>
    </div>
  );
}
export function XSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "为你推荐");
  return (
    <div className="catalog-skin x-ui">
      <Header p={p} />
      <div className="x-feed-tabs">
        <button
          className={tab === "为你推荐" ? "selected" : ""}
          onClick={() => setTab("为你推荐")}
        >
          为你推荐
        </button>
        <button
          className={tab === "正在关注" ? "selected" : ""}
          onClick={() => setTab("正在关注")}
        >
          正在关注
        </button>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {items
          .filter((i) => tab === "为你推荐" || i.folder === "正在关注")
          .map((i) => (
            <article className="x-post" key={i.id}>
              <Avatar name={i.sender} />
              <div>
                <button className="x-byline" onClick={() => p.onItem(i)}>
                  <strong>{i.sender}</strong>
                  <span>
                    @{meta(i, "handle", i.sender)} · {i.time.slice(5, 10)}
                  </span>
                </button>
                <button className="social-body" onClick={() => p.onItem(i)}>
                  <p>{i.body}</p>
                  {i.media && <Media item={i} />}
                </button>
                <Actions p={p} item={i} />
              </div>
            </article>
          ))}
      </div>
      <Tabs
        tabs={["为你推荐", "正在关注"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />]}
      />
    </div>
  );
}
export function ThreadsSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "为你推荐");
  return (
    <div className="catalog-skin threads-ui">
      <Header p={p} />
      <div className="threads-title">
        <AtSign size={30} />
        <button
          onClick={() => setTab(tab === "为你推荐" ? "正在关注" : "为你推荐")}
        >
          {tab} ⌄
        </button>
      </div>
      <div className="catalog-scroll">
        {(tab === "个人主页"
          ? items
          : items.filter((i) => tab !== "正在关注" || i.folder === "正在关注")
        ).map((i) => (
          <article className="threads-post" key={i.id}>
            <div className="thread-avatar">
              <Avatar name={i.sender} />
              <i />
            </div>
            <div>
              <div className="threads-byline">
                <strong>{i.sender}</strong>
                <small>{i.time.slice(5, 10)}</small>
              </div>
              <button className="social-body" onClick={() => p.onItem(i)}>
                <p>{i.body}</p>
                {i.media && <Media item={i} />}
              </button>
              <Actions p={p} item={i} />
              <button className="thread-replies" onClick={() => p.onItem(i)}>
                {i.comments.length} 条回复
              </button>
            </div>
          </article>
        ))}
        <Empty items={items} />
      </div>
      <Tabs
        tabs={["为你推荐", "正在关注", "个人主页"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function FacebookSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "动态");
  const stories = items.filter((i) => i.folder === "Story");
  return (
    <div className="catalog-skin facebook-ui">
      <Header p={p} />
      <Tabs
        tabs={["动态", "好友", "个人主页"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "动态" ? (
          <>
            <button
              className="fb-compose"
              disabled={!p.creator}
              onClick={p.onAdd}
            >
              <Avatar name={p.owner ?? "我"} />
              分享新动态
            </button>
            <div className="fb-stories">
              {stories.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <Media item={i} />
                  <strong>{i.sender}</strong>
                </button>
              ))}
            </div>
            {items
              .filter((i) => i.folder !== "Story")
              .map((i) => (
                <article className="fb-post" key={i.id}>
                  <PostHeader p={p} item={i} />
                  <button className="social-body" onClick={() => p.onItem(i)}>
                    <p>{i.body}</p>
                    {i.media && <Media item={i} />}
                  </button>
                  <Actions p={p} item={i} />
                </article>
              ))}
          </>
        ) : tab === "好友" ? (
          <div className="fb-friends">
            {[...new Set(items.map((i) => i.sender))].map((s) => (
              <button
                key={s}
                onClick={() => p.onItem(items.find((i) => i.sender === s)!)}
              >
                <Avatar name={s} />
                <strong>{s}</strong>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="fb-cover" />
            <div className="fb-profile">
              <Avatar name={p.owner ?? "我"} />
              <h1>{p.owner ?? "我"}</h1>
            </div>
            {items
              .filter((i) => i.folder === "个人主页")
              .map((i) => (
                <button
                  key={i.id}
                  className="fb-profile-note"
                  onClick={() => p.onItem(i)}
                >
                  {i.title}
                  <p>{i.body}</p>
                </button>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
export function RedbookSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const [expandedEncounterComments, setExpandedEncounterComments] = useState<Record<number, boolean>>({});
  const [encounterCommentDraft, setEncounterCommentDraft] = useState("");
  const [encounterLocalComments, setEncounterLocalComments] = useState<string[]>([]);
  const [encounterLiked, setEncounterLiked] = useState(false);
  const [encounterSaved, setEncounterSaved] = useState(false);
  const [encounterShareOpen, setEncounterShareOpen] = useState(false);
  const [encounterFollowed, setEncounterFollowed] = useState(false);
  const wechatUi = p.allUi?.wechat ?? {};
  let encounterRemarks: Record<string, string> = {};
  try {
    const parsed = JSON.parse(String(wechatUi.wxContactRemarks || "{}"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) encounterRemarks = parsed;
  } catch { /* ignore malformed saved contact remarks */ }
  const encounterDisplayName = (canonical: string) => String(encounterRemarks[canonical] || canonical).trim() || canonical;
  const encounterShareToWechat = (recipient: string) => {
    const payload = { id:"redbook-post-share-"+Date.now(), type:"redbookPost", recipient, name:"吉隆坡偶遇怪兽！！！旁边那个女生是谁啊🥹", title:"吉隆坡偶遇怪兽！！！旁边那个女生是谁啊🥹", image:"https://upload.wikimedia.org/wikipedia/commons/3/37/%E4%BA%94%E6%9C%88%E5%A4%A9-%E6%80%AA%E7%8D%B8_%285247925751%29.jpg", url:"monster://redbook/malaysia-encounter" };
    p.onAppUi?.("wechat","shopeeSharePayload",JSON.stringify(payload));
    setEncounterShareOpen(false);
    p.onOpenApp?.("wechat");
  };

  const [category, setCategory] = useState("推荐");
  const location = "北京";
  const [showSearch, setShowSearch] = useState(false);
  const [bottomTab, setBottomTab] = useState("首页");
  const [sortBy, setSortBy] = useState("推荐");
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [profileSection, setProfileSection] = useState("笔记");
  const [profilePanel, setProfilePanel] = useState("");
  const categories = ["推荐", "RED", "直播", "热点", "短剧", "足球", "音乐"];
  const demoPosts: Item[] = [
    { id:"redbook-monster-01", title:"这次，他没有犹豫 02", body:"翻到好多年前的旧剪报，还是会为那句生日祝福心动。\n#五月天 #怪兽 #青春回忆", sender:"今天珍重🥕", avatar:"", kind:"post", media:"", time:"2026-11-03 20:18", likes:6, comments:[], meta:{art:"newspaper",category:"推荐"}, richText:"", hidden:false, unlock:"", password:"", folder:"推荐", favorite:false, outgoing:false, read:false },
    { id:"redbook-monster-02", title:"这会不会太纳尼了", body:"试着把狗狗的眼睛修得自然一点，结果越看越好笑。", sender:"穿拖鞋走红毯", avatar:"", kind:"post", media:"", time:"2026-11-03 20:12", likes:2950, comments:[], meta:{art:"dog",category:"热点"}, richText:"", hidden:false, unlock:"", password:"", folder:"热点", favorite:false, outgoing:false, read:false },
    { id:"redbook-monster-03", title:"喝个酒五光十色的", body:"演出结束后的后台碎片，五月天的快乐真的会传染。\n#五月天 #演唱会", sender:"你还有面包吗🥕", avatar:"", kind:"post", media:"", time:"2026-11-03 19:56", likes:3, comments:[], meta:{art:"concert",category:"音乐"}, richText:"", hidden:false, unlock:"", password:"", folder:"音乐", favorite:false, outgoing:false, read:false },
    { id:"redbook-monster-04", title:"好嫩啊", body:"今天偶遇一只超可爱的猫咪，镜头差点贴到鼻子上。", sender:"干煎家的喵喵", avatar:"", kind:"post", media:"", time:"2026-11-03 19:44", likes:112, comments:[], meta:{art:"cat",category:"推荐"}, richText:"", hidden:false, unlock:"", password:"", folder:"推荐", favorite:false, outgoing:false, read:false },
    { id:"redbook-monster-05", title:"怪兽的吉他永远有魔法", body:"现场直拍里最喜欢的一个瞬间，灯光亮起来的时候太震撼了。\n#温尚翊 #五月天", sender:"阿沐今天听歌了吗", avatar:"", kind:"post", media:"", time:"2026-11-03 19:31", likes:823, comments:[], meta:{art:"guitar",category:"音乐"}, richText:"", hidden:false, unlock:"", password:"", folder:"音乐", favorite:false, outgoing:false, read:false },
    { id:"redbook-monster-06", title:"北京散步路线分享", body:"傍晚的风刚刚好，随手拍下路边的晚霞。", sender:"小岛日记", avatar:"", kind:"post", media:"", time:"2026-11-03 19:22", likes:58, comments:[], meta:{art:"sunset",category:"推荐"}, richText:"", hidden:false, unlock:"", password:"", folder:"推荐", favorite:false, outgoing:false, read:false },
  ];
  const sourceIsPlaceholder = !items.length || items.every((i) =>
    ["测试内容", "等一场雨停", "九月的某一天"].includes(i.title)
  );
  const malaysiaEncounterPost: Item = {
    id:"redbook-malaysia-monster-encounter-v1",
    title:"吉隆坡偶遇怪兽！！！旁边那个女生是谁啊🥹",
    body:"本来只是出来吃个饭，没想到居然偶遇五月天怪兽！！本人真的好帅，而且感觉刚结束工作没多久。\n\n旁边还有一位女生，两个人坐在一起吃饭，看起来关系蛮熟悉的，期间一直有说有笑。不过我们也没敢一直盯着看，更没好意思上去打扰。\n\n没想到能在吉隆坡遇到本人，今天是什么运气啊啊啊！！😭\n\n#五月天 #五月天怪兽 #吉隆坡 #演唱会偶遇",
    sender:"今天也要听五月天",
    avatar:"",
    kind:"post",
    media:"https://upload.wikimedia.org/wikipedia/commons/3/37/%E4%BA%94%E6%9C%88%E5%A4%A9-%E6%80%AA%E7%8D%B8_%285247925751%29.jpg",
    time:"2026-11-12 22:18",
    likes:2386,
    comments:[
      "啊啊啊啊啊真的假的！！！散场后还能一起吃饭也太巧了吧！！！",
      "等下？？？旁边真的是女生？？？我把图放大到快糊了姐你们谁看清了？？",
      "感觉两个人很熟欸，不像普通粉丝偶遇。",
      "人家吃个饭也要被拍？？？能不能给一点私人空间啊。",
      "楼主又没上去打扰，而且也没曝光女生信息，分享偶遇而已吧。",
      "不会是女朋友吧？？？我有一个大胆的猜测……",
      "朋友也可以一起吃饭啊，先别乱猜了好吗。",
      "如果真的是女朋友我也祝福啊，怪兽开心就好。",
      "不是不让谈，是不想看到他被偷拍好吗……",
      "哈哈哈哈评论区已经给团长安排完婚姻大事了。",
      "你们有没有发现他看起来心情很好啊！！！",
      "为什么每次有女生出现就要被盘问身份？给人一点私人空间吧。",
      "我比较好奇的是演出结束后他怎么还出来吃宵夜哈哈哈哈。"
    ],
    meta:{art:"guitar",category:"推荐",handle:"今天也要听五月天",location:"吉隆坡",redbookMalaysiaEncounter:"true"},
    richText:"",
    hidden:false,unlock:"",password:"",folder:"推荐",favorite:false,outgoing:false,read:false
  };
  const encounterAvatars = [
  "https://i.imgur.com/dKexkdC.jpg",
  "https://i.imgur.com/yZVxgvV.jpg",
  "https://i.imgur.com/NgTM2qw.jpg",
  "https://i.imgur.com/lZHOt59.jpg",
  "https://i.imgur.com/91FmtOA.jpg",
  "https://i.imgur.com/MxRdtDN.jpg",
  "https://i.imgur.com/5hVWNF1.jpg",
  "https://i.imgur.com/zjoQKX7.jpg",
  "https://i.imgur.com/wNNBKkj.jpg",
  "https://i.imgur.com/h8BPJc1.jpg",
  "https://i.imgur.com/AdUfjHy.jpg",
  "https://i.imgur.com/5w1nnY7.jpg",
  "https://i.imgur.com/QqJV1EH.jpg",
  "https://i.pinimg.com/564x/d0/f7/26/d0f726a57508b516fd5bce4e41a9a3dc.jpg",
  "https://imgs.qiubiaoqing.com/qiubiaoqing/imgs/67d198b9131a1xeG.jpeg",
  "https://img.shetu66.com/2024/01/24/170608276301458295.png",
  "https://img2.woyaogexing.com/2022/03/05/dc207a78a2164c95bcf9e9bdbbf7bad3%21400x400.jpeg",
  "https://mojocarrot.com/wp-content/uploads/2025/05/Mojo-Carrot.png",
  "https://media.karousell.com/media/photos/products/2023/2/9/qmayday_1675969606_e7e79e59_progressive.jpg"
];
  const encounterAuthorAvatar = "https://i.imgur.com/yZVxgvV.jpg";
  const encounterComments = [
    {"user":"A1前排失去表情管理","avatar":0,"location":"上海","body":"我就在她旁边啊啊啊！！她跟朋友全程激动到不行，后来还跟我互了物料？？刷到这张我直接：？？？这世界也太小了吧","likes":9286,"replies":[{"user":"汽水续杯中","text":"等等互物料？？哪种现场交换啊"},{"user":"A1边边的风","text":"救命这是什么奇妙交集"},{"user":"今晚不回家","text":"先别认人啦真的容易认错"}]},
    {"user":"今天也在A1蹲团长","avatar":1,"location":"广东","body":"怪兽今天真的一直往A1这边走欸？？我前面几次还跟朋友说怎么又过来了，有一下停在我们附近我直接以为饭撒给我了……现在想想我好好笑","likes":12680,"replies":[{"user":"小狗摇尾巴","text":"哈哈哈哈姐妹我也自作多情过"},{"user":"橘子海来信","text":"他走过来那下我手机都举歪了"},{"user":"吉他弦发光","text":"A1今天集体心跳过速"}]},
    {"user":"互物料吗姐妹","avatar":2,"location":"浙江","body":"我好像跟这个女生互过物料……当时就觉得眼熟又好聊，没想到会在这种帖子刷到？？不敢认不敢认","likes":10321,"replies":[{"user":"凌晨还在听","text":"姐妹先别开认亲大会哈哈"},{"user":"云朵收藏家","text":"但互过物料真的很容易记住人"},{"user":"不吃香菜谢谢","text":"不要往下扒隐私就好"}]},
    {"user":"第一次见她的路人粉","avatar":3,"location":"北京","body":"这个女生我第一次见欸？？之前几场我好像没印象，是工作人员吗？但看着又不像，感觉就是来玩的wmls吧","likes":7190,"replies":[{"user":"蓝色荧光棒","text":"第一次见也正常啊场次那么多"},{"user":"看台第七码","text":"工作人员会在观众席这样玩嘛"},{"user":"今天也要快乐","text":"别猜了人家可能就普通来看演出的"}]},
    {"user":"同事的朋友好像是她","avatar":4,"location":"福建","body":"？？我同事刚刚把帖子发我，说好像是她朋友的朋友？？我不认识本人啊先声明！！只是这关系链也太绕了吧","likes":7551,"replies":[{"user":"温柔乡路过","text":"朋友的朋友的朋友哈哈哈哈"},{"user":"拨片收集员","text":"互联网开始套娃了"},{"user":"五月天限定心动","text":"别问了我同事也不肯定"}]},
    {"user":"今天怪兽笑得好开心","avatar":5,"location":"四川","body":"没人发现怪兽今天看起来心情超好吗！！弹琴的时候一直笑，走到A1那边也笑眯眯的，团长今天是不是有什么开心事啊🥹","likes":6288,"replies":[{"user":"散场慢慢走","text":"有！！我拍到他笑的那一下了"},{"user":"薯片掉地上","text":"他今天跟大家互动感觉很放松"},{"user":"猫咪不营业","text":"看他开心我也开心呜呜"}]},
    {"user":"偷拍真的没必要吧","avatar":6,"location":"山东","body":"不是……为什么要拍人家吃饭啊？而且脸拍这么清楚？？讨论演出就讨论演出，普通女生下班吃个饭也要被围观吗","likes":5961,"replies":[{"user":"再唱一首好吗","text":"这点真的，路人隐私呢"},{"user":"晚风有点甜","text":"楼主可能没恶意但照片可以打码"},{"user":"团长今天笑了","text":"别把偶遇搞成追踪"}]},
    {"user":"就算谈恋爱又怎样","avatar":7,"location":"重庆","body":"就算谈恋爱又怎样啊？？怪兽都多大了成年人谈个恋爱怎么了，你们是他妈吗？？先别急着替人家安排人生吧","likes":3876,"replies":[{"user":"路过的五迷","text":"笑死但重点是现在也没实锤啊"},{"user":"小熊软糖本人","text":"谈不谈是他的自由啊"},{"user":"我先冷静一下","text":"有些人真的操心太宽了"}]},
    {"user":"谈恋爱可以饭撒要有边界","avatar":8,"location":"江苏","body":"谈恋爱当然没问题啊，但如果一边谈一边还对粉丝做容易误会的饭撒呢？粉丝是他们play中的一环吗？？我在意的是这个欸","likes":5644,"replies":[{"user":"前排信号不好","text":"你先确定他在谈再说吧"},{"user":"举手但不发言","text":"演出互动和私下关系别混一起"},{"user":"月亮也在A1","text":"这楼开始上价值了……"}]},
    {"user":"一起吃饭而已吧","avatar":9,"location":"台湾","body":"不就一起吃个饭？？脑补到哪去了，怪兽还不能有女性朋友了？一张照片直接写出八十集连续剧也是服","likes":8123,"replies":[{"user":"听歌别吵架","text":"对啊朋友吃饭也要报备？"},{"user":"相机没电了","text":"但A1那边确实有人说看到拨片"},{"user":"周末不加班","text":"看到拨片跟吃饭是两件事啦"}]},
    {"user":"点歌的时候好像给了拨片","avatar":10,"location":"香港","body":"点歌那段我记得他好像把拨片递给她了？？好像是……当时我忙着看大屏没看清，别当实锤哈，有没有同场姐妹记得","likes":4762,"replies":[{"user":"今天不熬夜","text":"我听到的也是这个版本但不确定"},{"user":"彩虹糖分你","text":"拨片不是怪兽常常会送吗"},{"user":"吉他背带控","text":"求现场视角但别乱认人"}]},
    {"user":"年龄差是不是也挺大","avatar":11,"location":"辽宁","body":"如果真的是恋爱年龄差应该不小欸……我不是说不行啦，就是突然意识到这个可能性，评论区已经脑补到哪一步了","likes":6902,"replies":[{"user":"台下第三排","text":"成年人年龄差自己决定吧"},{"user":"一颗小星星","text":"现在连是不是对象都不知道哈哈"},{"user":"风吹过看台","text":"别替人家算户口本了"}]},
    {"user":"照片拍得也太好了吧","avatar":12,"location":"澳门","body":"先不管评论区了老师这张拍得真的好帅啊啊啊！！吉他和侧脸都拍到了，光线绝了，求问原图还有吗！！","likes":4390,"replies":[{"user":"我真的路过","text":"摄影老师今天加鸡腿"},{"user":"先吃饭再说","text":"这张可以当壁纸了吧"},{"user":"认真听歌中","text":"终于有人认真看图了哈哈哈"}]},
    {"user":"我就在她隔壁桌","avatar":13,"location":"上海","body":"我服了我就在隔壁桌？？当时只觉得旁边那桌好热闹，朋友还说怎么一直笑，结果今天刷到才反应过来？？我本人反射弧绕地球","likes":5103,"replies":[{"user":"今天也很五月天","text":"姐妹你怎么现在才发现哈哈哈"},{"user":"橘猫睡着了","text":"不要讲店名啦保护一下隐私"},{"user":"拨片放口袋","text":"这也太巧了吧"}]},
    {"user":"你们吵什么啊","avatar":14,"location":"广东","body":"你们到底在吵什么啊啊啊！！一拨人在说恋爱自由，一拨人在说饭撒边界，还有人在吵偷拍……先分清楚讨论的是哪件事行不行！！","likes":3721,"replies":[{"user":"不要再艾特我","text":"哈哈哈哈楼里已经分成三派了"},{"user":"评论区保安","text":"我只是想看照片怎么吵成这样"},{"user":"隔壁桌的朋友","text":"别吵了给我看怪兽弹琴的图"}]},
    {"user":"不是每个女生都要被认领","avatar":15,"location":"云南","body":"看到一个女生就开始猜工作人员、对象、熟人……她也可能只是来听歌的普通wmls啊，别把人家当寻宝游戏","likes":4588,"replies":[{"user":"五迷不迷路","text":"这条说得对"},{"user":"开心最重要","text":"现场聊现场，别开盒"},{"user":"下一站演唱会","text":"有些人真的太会脑补了"}]},
    {"user":"A1的饭撒误会现场","avatar":16,"location":"湖北","body":"我坐A1另一边，他往这边走的时候旁边姐妹直接抓着朋友：他是不是看我！！结果团长转头去另一边了哈哈哈哈哈哈现场喜剧","likes":9230,"replies":[{"user":"慢慢来就好","text":"姐妹的心路历程好完整"},{"user":"今晚有月亮","text":"我也有过这种错觉不准笑"},{"user":"我的耳机在唱歌","text":"演唱会限定自信哈哈"}]},
    {"user":"我只关心他今天状态","avatar":17,"location":"陕西","body":"今天怪兽弹吉他的状态好好欸！！有几段solo我直接起鸡皮疙瘩，走位也比我想的勤快。你们慢慢吵我先去重看视频","likes":6127,"replies":[{"user":"散场再见","text":"哪一首哪一首！！"},{"user":"长岛冰茶不加冰","text":"solo那段我手机拍糊了哭"},{"user":"今天的风很甜","text":"吉他手就是要看手啊啊啊"}]},
    {"user":"互物料不代表认识很熟","avatar":18,"location":"江西","body":"就算真的互过物料也可能只是现场交换一下吧？互过一次就开始推理认识多久、什么关系，真的不用吧","likes":7349,"replies":[{"user":"拍照手不抖","text":"对啊互物料不是户口调查"},{"user":"A1信号满格","text":"只是觉得巧，没说人家熟"},{"user":"今天也爱吉他","text":"评论区侦探先下班啦"}]},
    {"user":"北京今天降温","body":"？？？这谁啊 我朋友刚说她就在A1旁边","location":"北京","replies":[{"user":"路过的网友","text":"我朋友也在A1哈哈哈"},{"user":"不熬夜了真的","text":"先别认了别把人家扒出来"},{"user":"今天也听歌","text":"这帖子怎么越刷越多熟人"}]},
    {"user":"广州场外等车","body":"我只想问散场后他们还吃得下啊？？我排地铁排到灵魂出窍","location":"广东","replies":[{"user":"路过的网友","text":"笑死我回酒店泡面都懒得煮"},{"user":"不熬夜了真的","text":"艺人体力真的不是人"},{"user":"今天也听歌","text":"散场交通才是今晚最大话题"}]},
    {"user":"南京前排蹲到腿麻","body":"A1那边今天真的好热闹，我在B区都听见尖叫了","location":"江苏","replies":[{"user":"路过的网友","text":"我们这边也听到了哈哈"},{"user":"不熬夜了真的","text":"尖叫声一层一层传过来"},{"user":"今天也听歌","text":"A1今晚存在感拉满"}]},
    {"user":"成都不吃香菜","body":"不是先等等，照片谁拍的啊这构图有点东西","location":"四川","replies":[{"user":"路过的网友","text":"求摄影老师主页"},{"user":"不熬夜了真的","text":"侧脸那张我存了"},{"user":"今天也听歌","text":"比起瓜我先夸图了"}]},
    {"user":"深圳打工人下班了","body":"刚开完会点进来，怎么已经吵到恋爱自由了？？进度条谁拉的","location":"广东","replies":[{"user":"路过的网友","text":"你错过了三百层楼哈哈"},{"user":"不熬夜了真的","text":"互联网吃瓜不等人"},{"user":"今天也听歌","text":"先看图再补课"}]},
    {"user":"杭州雨天听五月天","body":"怪兽那个拨片到底有没有递啊 我刷到三个版本了","location":"浙江","replies":[{"user":"路过的网友","text":"我现场视角被挡住了没看见"},{"user":"不熬夜了真的","text":"有人说点歌时递了但不确定"},{"user":"今天也听歌","text":"别传成实锤就行"}]},
    {"user":"东北老铁在线","body":"谈就谈呗 又不是跟你过日子 但别拿粉丝当傻子就完了","location":"辽宁","replies":[{"user":"路过的网友","text":"哈哈哈哈说话好直"},{"user":"不熬夜了真的","text":"你这句把两边都得罪了"},{"user":"今天也听歌","text":"但我居然觉得有点道理"}]},
    {"user":"长沙橘子汽水","body":"我真的笑死，怪兽走过去一下评论区已经给人家安排完人生了","location":"湖南","replies":[{"user":"路过的网友","text":"现在连婚礼桌数都快算出来了"},{"user":"不熬夜了真的","text":"停止脑补哈哈哈哈"},{"user":"今天也听歌","text":"但照片确实拍得好看"}]},
    {"user":"西安城墙根听歌","body":"有没有人录到今天那段吉他solo啊啊啊 我相机刚好没电","location":"陕西","replies":[{"user":"路过的网友","text":"我有但是手抖成地震"},{"user":"不熬夜了真的","text":"求求发一下吧我也没拍到"},{"user":"今天也听歌","text":"那段真的爽到头皮发麻"}]},
    {"user":"青岛啤酒不加冰","body":"先说照片挺好看，再说别把人家女生脸挂网上行不行","location":"山东","replies":[{"user":"路过的网友","text":"这两件事可以同时成立"},{"user":"不熬夜了真的","text":"对啊打个码不难吧"},{"user":"今天也听歌","text":"楼主看到应该会处理"}]},
    {"user":"厦门海风很大","body":"她是不是拿着小暴啊？我记得前面有人说旁边有个女生抱着玩偶","location":"福建","replies":[{"user":"路过的网友","text":"好像是那个黑色小暴？"},{"user":"不熬夜了真的","text":"别再给玩偶加备注了哈哈"},{"user":"今天也听歌","text":"可能只是同款别认错"}]},
    {"user":"香港夜猫子","body":"我睇到而家都唔知边句係真，大家冷静少少啦","location":"香港","replies":[{"user":"路过的网友","text":"哈哈哈粤语区来了"},{"user":"不熬夜了真的","text":"目前没有哪条能算实锤"},{"user":"今天也听歌","text":"吃瓜也要留点脑子"}]},
    {"user":"澳门路过一下","body":"讲真，团长弹琴那几张比所谓恋爱瓜有意思多了","location":"澳门","replies":[{"user":"路过的网友","text":"吉他手就是要看手啊"},{"user":"不熬夜了真的","text":"那张手部特写绝了"},{"user":"今天也听歌","text":"求更多现场返图"}]},
    {"user":"台中今天也去了","body":"我在现场但完全没注意到旁边是谁……我是不是只顾着看台上了","location":"台湾","replies":[{"user":"路过的网友","text":"这才是来看演唱会的哈哈"},{"user":"不熬夜了真的","text":"我也只记得灯海"},{"user":"今天也听歌","text":"回家才发现错过好多细节"}]},
    {"user":"新加坡五迷","body":"海外党蹲个后续，怎么每次刷到你们内场都像连续剧","location":"新加坡","replies":[{"user":"路过的网友","text":"哈哈哈我们也不知道怎么发展成这样"},{"user":"不熬夜了真的","text":"其实大家只是太会联想"},{"user":"今天也听歌","text":"海外党先看演出视频吧"}]},
    {"user":"温哥华凌晨三点","body":"我这边半夜刷到，谁来给我一句话总结，不要长篇的","location":"加拿大","replies":[{"user":"路过的网友","text":"一句话：没有实锤，评论区很热闹"},{"user":"不熬夜了真的","text":"再一句：照片拍得不错"},{"user":"今天也听歌","text":"哈哈哈哈总结组上线"}]},
    {"user":"重庆火锅不排队","body":"年龄差那个我不站队哈，但评论区已经替人家算到几岁生娃了离谱","location":"重庆","replies":[{"user":"路过的网友","text":"真的有点过了"},{"user":"不熬夜了真的","text":"人家可能只是朋友啊"},{"user":"今天也听歌","text":"互联网嘴替别太积极"}]},
    {"user":"武汉热干面加辣","body":"有人说互过物料，有人说同事朋友，有人说隔壁桌，我看出来了今天大家社交半径都很小","location":"湖北","replies":[{"user":"路过的网友","text":"全网都认识她了（并没有）"},{"user":"不熬夜了真的","text":"别把传闻拼成一个人证链"},{"user":"今天也听歌","text":"笑死先喝口水"}]},
    {"user":"昆明春城散步","body":"我想问楼主这张是散场后拍的吗？光线怎么这么好","location":"云南","replies":[{"user":"路过的网友","text":"看起来像室内暖光"},{"user":"不熬夜了真的","text":"拍照老师技术在线"},{"user":"今天也听歌","text":"别问具体餐厅位置哈"}]},
    {"user":"天津相声爱好者","body":"你们吵归吵，谁把怪兽那张侧脸再发一遍，我没存到","location":"天津","replies":[{"user":"路过的网友","text":"哈哈哈哈需求非常明确"},{"user":"不熬夜了真的","text":"摄影老师快来交作业"},{"user":"今天也听歌","text":"我也要高清"}]},
    {"user":"台北下班路过","body":"先不要把女生身份猜来猜去啦，真的不认识她，也不代表她就有什么特殊身份","location":"台湾","replies":[{"user":"路过的网友","text":"对，普通观众也会出现在照片里"},{"user":"不熬夜了真的","text":"讨论现场可以别查人"},{"user":"今天也听歌","text":"这条支持"}]},
    {"user":"上海地铁末班车","body":"等下所以是演唱会结束后一起吃饭？不是第二天偶遇？时间线先对一下啊","location":"上海","replies":[{"user":"路过的网友","text":"对对是结束后"},{"user":"不熬夜了真的","text":"前面有人讲乱了"},{"user":"今天也听歌","text":"终于有人管时间线了"}]},
    {"user":"河南人不服输","body":"谈恋爱不谈恋爱随便，饭撒就按舞台互动看呗，别自己给自己加戏","location":"河南","replies":[{"user":"路过的网友","text":"这句挺中肯"},{"user":"不熬夜了真的","text":"但有人就是会认真代入"},{"user":"今天也听歌","text":"各自边界不一样吧"}]},
    {"user":"广西螺蛳粉爱好者","body":"我朋友说她朋友认识她朋友……算了我先不说了哈哈哈哈","location":"广西","replies":[{"user":"路过的网友","text":"朋友链条已断开"},{"user":"不熬夜了真的","text":"哈哈哈哈别说了"},{"user":"今天也听歌","text":"这条像极了群聊传话"}]},
    {"user":"纽约时差党","body":"早上醒来第一件事就是看评论区，怎么比我睡前多了这么多楼","location":"美国","replies":[{"user":"路过的网友","text":"你睡觉的时候我们没睡"},{"user":"不熬夜了真的","text":"时差党辛苦了"},{"user":"今天也听歌","text":"帖子自己长腿了"}]},
    {"user":"吉林长春今天下雪","body":"怪兽今天走位是不是比平时多？我在远区看着他一直往前面晃","location":"吉林","replies":[{"user":"路过的网友","text":"我也觉得今天跑动挺多"},{"user":"不熬夜了真的","text":"他拿吉他走到前面那段很帅"},{"user":"今天也听歌","text":"可能舞台调度也有关系"}]},
    {"user":"福州返图搬运工","body":"别吵了我把原图放评论区了，想存的自取，路人脸我打码了","location":"福建","replies":[{"user":"路过的网友","text":"老师好人一生平安"},{"user":"不熬夜了真的","text":"打码做得好"},{"user":"今天也听歌","text":"谢谢返图！！"}]},
    {"user":"大连海边吹风","body":"我怎么感觉楼主本人也没说啥啊，是评论区自己开了八个副本","location":"辽宁","replies":[{"user":"路过的网友","text":"哈哈哈哈确实"},{"user":"不熬夜了真的","text":"评论比正文精彩太多"},{"user":"今天也听歌","text":"楼主：我只是发个图"}]},
    {"user":"台南今天吃牛肉汤","body":"我只记得怪兽弹到那段的时候笑得很可爱，其他瓜真的没跟上","location":"台湾","replies":[{"user":"路过的网友","text":"那段我有录到！"},{"user":"不熬夜了真的","text":"求求发一下"},{"user":"今天也听歌","text":"今天他状态真的蛮轻松的"}]}
  ];
  if (p.ui?.redbookMalaysiaEncounterPostV1 === "show") {
    return (
      <div className="catalog-skin redbook-ui redbook-dark redbook-encounter-detail" style={{background:"#111116",color:"#f4f4f5",height:"100%",minHeight:0,width:"100%",margin:0,padding:0,border:0,outline:0,boxSizing:"border-box",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div aria-label="iOS状态栏" style={{height:44,minHeight:44,flex:"0 0 44px",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px",boxSizing:"border-box",background:"#19191f",color:"#f5f5f6",fontSize:15,fontWeight:600,letterSpacing:".1px"}}>
          <span>{p.virtualTime || "03:39"} ▣</span>
          <span style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}><span aria-hidden="true">▮▮▮</span><svg width="19" height="14" viewBox="0 0 19 14" fill="none" aria-hidden="true"><path d="M1 4.5Q9.5-2 18 4.5M4 8Q9.5 3.5 15 8M7.5 11.5Q9.5 10 11.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg><span style={{background:"#45b96b",color:"white",borderRadius:5,padding:"1px 5px",fontSize:12}}>98%</span></span>
        </div>
        <div className="catalog-scroll" style={{flex:1,overflowY:"auto",padding:"0 16px 90px",margin:0,border:0,boxSizing:"border-box"}}>
                  <div className="redbook-encounter-topbar" style={{position:"sticky",top:0,zIndex:100,width:"calc(100% + 32px)",height:58,minHeight:58,flex:"0 0 58px",margin:"0 -16px 14px",paddingTop:0,display:"flex",visibility:"visible",opacity:1,alignItems:"center",gap:10,padding:"0 12px",boxSizing:"border-box",background:"#19191f",borderBottom:"1px solid #303036",color:"#f5f5f6",order:0}}><button aria-label="返回" onClick={p.onBack} style={{fontSize:27,lineHeight:1,color:"#f5f5f6",width:28,flex:"0 0 28px"}}>‹</button><img src={encounterAuthorAvatar} alt="五月天手绘乐队头像" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",flex:"0 0 34px"}}/><strong style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:13,fontWeight:500}}>今天也要听五月天</strong><button className="redbook-encounter-follow" onClick={()=>setEncounterFollowed(v=>!v)} style={{color:"#ff4967",border:"1px solid #ff4967",borderRadius:18,padding:"6px 13px",fontSize:12,whiteSpace:"nowrap"}}>{encounterFollowed?"已关注":"关注"}</button><button aria-label="转发" onClick={()=>setEncounterShareOpen(true)} style={{width:34,height:40,display:"grid",placeItems:"center",background:"transparent",border:0,color:"#f5f5f6",padding:0}}><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15.5 4.5 24 13l-8.5 8.5"/><path d="M23.5 13H13c-5.2 0-8.5 3.1-8.5 8.5"/></svg></button></div>
          
          <h2 style={{fontSize:21,lineHeight:1.45,margin:"8px 0 14px"}}>吉隆坡偶遇怪兽！！！旁边那个女生是谁啊🥹</h2>
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/37/%E4%BA%94%E6%9C%88%E5%A4%A9-%E6%80%AA%E7%8D%B8_%285247925751%29.jpg" alt="五月天怪兽演出照片" style={{width:"100%",borderRadius:7,display:"block",maxHeight:620,objectFit:"cover"}}/>
          <p style={{fontSize:15,lineHeight:1.85,whiteSpace:"pre-wrap",marginTop:18}}>演唱会结束后本来想找地方吃点东西，没想到居然和朋友一起在餐厅遇到怪兽！！本人真的好帅啊啊啊！{"\n\n"}他旁边还有一位女生，两个人是一起过来吃饭的，坐在一起聊天，看起来很熟，期间一直有说有笑。我们就在附近，看到的时候真的愣住了，没敢上去打扰。{"\n\n"}散场后还能遇到团长，这是什么神仙运气！！😭{"\n\n"}#五月天 #五月天怪兽 #吉隆坡 #演唱会偶遇</p>
          <div style={{color:"#999",fontSize:12,margin:"18px 0 12px",display:"flex",alignItems:"center",gap:8}}><span>2026-11-12 22:18</span><span>·</span><span>吉隆坡</span></div>
          <div style={{background:"#202027",borderRadius:8,padding:12,marginBottom:16,color:"#aaa",fontSize:13}}>📁 推荐</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><strong style={{fontSize:16}}>共 {103+encounterLocalComments.length} 条评论</strong><span style={{fontSize:12,color:"#999"}}>最热</span></div>
          <div style={{display:"flex",gap:8,marginBottom:18}}><img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=96&h=96&fit=crop" alt="我的头像" style={{width:38,height:38,borderRadius:"50%",objectFit:"cover"}}/><input value={encounterCommentDraft} onChange={e=>setEncounterCommentDraft(e.target.value)} placeholder="说点什么…" style={{flex:1,minWidth:0,border:0,borderRadius:20,background:"#292930",color:"#fff",padding:"10px 14px"}}/><button onClick={()=>{if(encounterCommentDraft.trim()){setEncounterLocalComments(v=>[...v,encounterCommentDraft.trim()]);setEncounterCommentDraft("");}}} style={{background:"none",color:"#ff4967"}}>发送</button></div>
          {encounterComments.map((comment,index)=>(
            <div key={index} style={{display:"flex",gap:10,margin:"18px 0"}}><div role="img" aria-label={comment.user+"头像"} style={{width:42,height:42,borderRadius:"50%",flexShrink:0,border:"1px solid rgba(255,255,255,.12)",backgroundImage:`url(${encounterAvatars[comment.avatar]})`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",backgroundColor:"#dcecff"}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,color:"#e3e3ea",fontWeight:600,marginBottom:6,letterSpacing:".1px"}}>{comment.user}</div><div style={{fontSize:14,lineHeight:1.65}}>{comment.body}</div><div style={{fontSize:11,color:"#777",marginTop:8}}>2小时前 · {comment.location} <button style={{background:"none",color:"#aaa"}} onClick={()=>setExpandedEncounterComments(v=>({...v,[index]:!v[index]}))}>回复</button><span style={{float:"right"}}>♡ {comment.likes}</span></div>
              {comment.replies.length>0&&<div style={{marginTop:9,padding:"10px 12px",background:"#202027",borderRadius:7}}>{comment.replies.slice(0,expandedEncounterComments[index]?undefined:2).map((reply,j)=><div key={j} style={{fontSize:13,lineHeight:1.7,marginBottom:7}}><span style={{color:"#a9b9dc",fontWeight:600,marginRight:5}}>{reply.user}</span><span style={{color:"#d7d7df"}}>{reply.text}</span></div>)}{comment.replies.length>1&&<button onClick={()=>setExpandedEncounterComments(v=>({...v,[index]:!v[index]}))} style={{background:"none",color:"#9ca3af",fontSize:12}}>{expandedEncounterComments[index]?"收起回复":"展开 "+comment.replies.length+" 条回复"}</button>}</div>}
            </div></div>
          ))}
          {encounterLocalComments.map((comment,index)=><div key={"local"+index} style={{padding:"12px 0",borderTop:"1px solid #303036"}}><strong>快樂小狗</strong><p>{comment}</p></div>)}
        </div>
        {encounterShareOpen && (<div className="redbook-share-overlay" role="dialog" aria-modal="true"><div className="redbook-share-sheet"><div className="redbook-share-sheet-head"><strong>分享到微信</strong><button onClick={()=>setEncounterShareOpen(false)}>✕</button></div><p>选择要分享的聊天</p><div className="redbook-share-contacts"><button onClick={()=>encounterShareToWechat("大G")}><img src={typeof wechatUi.wxDaGAvatarV2==="string"&&wechatUi.wxDaGAvatarV2?String(wechatUi.wxDaGAvatarV2):"./assets/dag-new-avatar.jpg"} alt=""/><span>{encounterDisplayName("大G")}</span></button><button onClick={()=>encounterShareToWechat("西蓝花")}><img src={GLOOMY_AVATAR} alt=""/><span>{encounterDisplayName("西蓝花")}</span></button></div><small>分享后将打开微信，并发送这篇笔记卡片</small></div></div>)}
        <footer style={{height:64,flexShrink:0,borderTop:"1px solid #303036",borderBottom:0,display:"flex",alignItems:"center",justifyContent:"space-around",background:"#15151b"}}><span style={{color:"#aaa"}}>说点什么…</span><button onClick={()=>setEncounterLiked(v=>!v)} style={{background:"none",color:encounterLiked?"#ff2442":"#eee"}}>♡ {2386+(encounterLiked?1:0)}</button><button onClick={()=>setEncounterSaved(v=>!v)} style={{background:"none",color:encounterSaved?"#ffd166":"#eee"}}>☆ {1024+(encounterSaved?1:0)}</button><span>☏ 103</span></footer>
      </div>
    );
  }
  const feedItems = sourceIsPlaceholder ? demoPosts : items;
  const withMalaysiaEncounter = p.ui?.redbookMalaysiaEncounterPostV1 === "show"
    ? [malaysiaEncounterPost, ...feedItems.filter(item => item.id !== malaysiaEncounterPost.id)]
    : feedItems;
  const visible = withMalaysiaEncounter.filter((item) => {
    const matchesCategory = category === "推荐" || category === "RED" ||
      item.folder === category || meta(item, "category") === category;
    const matchesTop = tab === "发现" || tab === "关注"
      ? tab === "发现" || item.folder === "关注" || meta(item, "following") === "true"
      : true;
    const matchesSearch = !q || (item.title + item.body + item.sender).toLowerCase().includes(q.toLowerCase());
    const matchesBottom = bottomTab !== "收藏" || item.favorite;
    return matchesCategory && matchesTop && matchesSearch && matchesBottom;
  });
  const ordered = sortBy === "热点"
    ? [...visible].sort((a,b) => b.likes - a.likes)
    : visible;
  return (
    <div className="catalog-skin redbook-ui redbook-dark">
      {bottomTab === "我" ? (
        <>
          <div className="redbook-profile-topbar">
            <button aria-label="打开菜单" onClick={() => setProfilePanel(profilePanel === "menu" ? "" : "menu")}><Menu size={25}/></button>
            <div className="redbook-profile-actions">
              <button className="redbook-edit-home" onClick={() => setProfilePanel("edit")}><Pencil size={13}/> 编辑主页</button>
              <button aria-label="扫一扫" onClick={() => setProfilePanel("scan")}><ScanLine size={23}/></button>
              <button aria-label="分享主页" onClick={() => setProfilePanel("share")}><Share2 size={23}/></button>
            </div>
          </div>
          <div className="catalog-scroll redbook-profile-scroll">
            <section className="redbook-profile-hero">
              <div className="redbook-profile-cover"/>
              <div className="redbook-profile-identity">
                <div className="redbook-profile-avatar"><span>🐻‍❄️</span></div>
                <div className="redbook-profile-name">
                  <strong>快樂小狗 <span>👾🎸</span></strong>
                  <div className="redbook-profile-id">小红书号：1117529120 <button aria-label="复制小红书号" onClick={() => setProfilePanel("copied")}>▧</button></div>
                  <div className="redbook-profile-ip">IP：北京</div>
                </div>
              </div>
              <div className="redbook-profile-stats">
                <button onClick={() => setProfilePanel("关注")}><strong>56</strong><span>关注</span></button>
                <button onClick={() => setProfilePanel("粉丝")}><strong>1332</strong><span>粉丝</span></button>
                <button onClick={() => setProfilePanel("获赞与收藏")}><strong>4.6万</strong><span>获赞与收藏</span></button>
              </div>
              <div className="redbook-profile-bio">
                想见的人就去见<br/>
                想写的故事就去写<br/>
                星期八/你不知道的事/而我知道/珍珠扣/九号球/女儿红/白月光修炼手册 ing<br/>
                不更文期间会像喷泉一样更新 wsy 视频<br/>
                感谢大家的陪伴啦 有你们最好了
              </div>
              <span className="redbook-profile-gender">♀</span>
              <div className="redbook-profile-shortcuts">
                <button onClick={() => setProfilePanel("群聊")}><Users size={19}/><span><strong>群聊</strong><small>查看详情</small></span></button>
                <button onClick={() => setProfilePanel("个人售卖")}><Layers size={19}/><span><strong>个人售卖</strong><small>出闲置搞副业</small></span></button>
                <button onClick={() => setProfilePanel("钱包")}><Wallet size={19}/><span><strong>钱包</strong><small>查看详情</small></span></button>
              </div>
            </section>
            <div className="redbook-profile-tabs">
              {["笔记","评论","收藏","赞过"].map((tabName,i) => <button key={tabName} className={profileSection === tabName ? "selected" : ""} onClick={() => setProfileSection(tabName)}>{i===1 || i===3 ? <Lock size={13}/> : null}{tabName}</button>)}
              <button className="redbook-profile-search" aria-label="搜索笔记" onClick={() => {setShowSearch(true);setBottomTab("首页");}}><Search size={21}/></button>
            </div>
            <div className="redbook-profile-tools">
              <button className="redbook-drafts" onClick={() => setProfilePanel("草稿箱")}><span className="redbook-draft-icon"><Lock size={17}/></span><strong>私密笔记</strong><span>1 ›</span></button>
              <button className="redbook-folder" onClick={() => setProfilePanel("合集")}><Layers size={19}/><strong>女儿红（已完结 IF线ing）</strong></button>
            </div>
            <div className="redbook-publish-prompt">
              <div className="redbook-prompt-cat">🐈</div>
              <div><strong>这个世界上不能没有猫猫</strong><small>官方喊你参与话题</small></div>
              <button onClick={() => p.onAdd()}>去发布</button>
            </div>
            {profileSection === "笔记" ? (
              <div className="redbook-profile-notes">
                <button className="redbook-note-card redbook-note-draft" onClick={() => setProfilePanel("草稿箱")}><span>草稿箱 · 2</span><strong>11</strong></button>
                <button className="redbook-note-card redbook-note-pinned" onClick={() => p.onItem(feedItems[0])}><span>置顶</span><strong>快樂小狗食用<br/>指南 🐶</strong></button>
                {ordered.map((item,index) => <button className={`redbook-note-card redbook-note-art redbook-art-${meta(item,"art",["newspaper","dog","concert","cat","guitar","sunset"][index % 6])}`} key={item.id} onClick={() => p.onItem(item)}><span>{item.title}</span>{item.kind === "video" && <i>▶</i>}</button>)}
              </div>
            ) : (
              <div className="redbook-profile-empty"><Lock size={22}/><strong>{profileSection}仅自己可见</strong><span>这里还没有公开内容</span></div>
            )}
          </div>
          {profilePanel && <div className="redbook-profile-overlay" onClick={() => setProfilePanel("")}>
            <div className="redbook-profile-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="redbook-sheet-close" onClick={() => setProfilePanel("")}>×</button>
              <strong>{profilePanel === "copied" ? "小红书号已复制" : profilePanel === "edit" ? "编辑主页" : profilePanel === "menu" ? "更多功能" : profilePanel === "scan" ? "扫一扫" : profilePanel === "share" ? "分享主页" : profilePanel}</strong>
              <p>{profilePanel === "edit" ? "头像、背景图、昵称和简介可在这里管理。" : profilePanel === "menu" ? "创作中心　订单　帮助与客服　设置" : profilePanel === "scan" ? "将二维码放在取景框内即可识别" : profilePanel === "share" ? "快来看看我的小红书主页吧！" : profilePanel === "copied" ? "1117529120" : "暂时没有内容"}</p>
              <button className="redbook-sheet-confirm" onClick={() => setProfilePanel("")}>知道了</button>
            </div>
          </div>}
        </>
      ) : (
        <>
          <header className="redbook-main-header">
            <button aria-label="消息" onClick={() => setBottomTab("消息")}><MessageCircle size={23} strokeWidth={1.8} /></button>
            <nav className="redbook-primary-tabs">
              {["关注", "发现", location].map((t) => (
                <button key={t} className={(tab === t || (t === location && tab === "北京")) ? "selected" : ""} onClick={() => {
                  if (t === location) setTab("北京");
                  else setTab(t);
                }}>{t}</button>
              ))}
            </nav>
            <button aria-label="搜索" onClick={() => setShowSearch((v) => !v)}><Search size={24} strokeWidth={1.8} /></button>
          </header>
          {showSearch && <label className="redbook-search"><Search size={15}/><input autoFocus placeholder="搜索你感兴趣的内容" value={q} onChange={(e) => setQ(e.target.value)}/><button onClick={() => {setQ("");setShowSearch(false);}}>取消</button></label>}
          <div className="redbook-category-row">
            <div className="redbook-category-scroll">
              {categories.map((t) => <button key={t} className={category === t ? "selected" : ""} onClick={() => {setCategory(t);setSortBy(t === "热点" ? "热点" : "推荐");}}>{t}</button>)}
            </div>
            <button className="redbook-category-more" aria-label="更多分类" onClick={() => setCategory(category === "推荐" ? "音乐" : "推荐")}><ChevronDown size={18}/></button>
          </div>
          <div className="catalog-scroll redbook-feed-scroll">
            {bottomTab === "消息" ? (
              <div className="redbook-empty-state"><MessageCircle size={32}/><strong>消息</strong><span>暂时没有新消息</span></div>
            ) : (
              <div className="redbook-waterfall">
                {ordered.map((item, index) => {
                  const likedKey = `redbook-liked-${item.id}`;
                  return <article className="redbook-card" key={item.id}>
                    <button className={`redbook-card-cover redbook-art-${meta(item,"art",["newspaper","dog","concert","cat","guitar","sunset"][index % 6])}`} onClick={() => p.onItem(item)} aria-label={item.title}>
                      <span className="redbook-art-label">{meta(item,"coverLabel",["旧剪报收藏","日常修图记录","演出后台碎片","猫咪近距离","五月天现场","城市散步"][index % 6])}</span>
                      {meta(item,"art") === "newspaper" && <span className="redbook-art-stamp">HAPPY<br/>BIRTHDAY</span>}
                      {meta(item,"art") === "dog" && <span className="redbook-art-face">🐶</span>}
                      {meta(item,"art") === "concert" && <span className="redbook-art-face">🎤</span>}
                      {meta(item,"art") === "cat" && <span className="redbook-art-face">🐱</span>}
                      {meta(item,"art") === "guitar" && <span className="redbook-art-face">🎸</span>}
                      {meta(item,"art") === "sunset" && <span className="redbook-art-face">🌇</span>}
                      {item.kind === "video" && <span className="redbook-play">▶</span>}
                    </button>
                    <button className="redbook-card-title" onClick={() => p.onItem(item)}>{item.title}</button>
                    <div className="redbook-card-meta">
                      <button className="redbook-author" onClick={() => p.onItem(item)}><Avatar name={item.sender}/><span>{item.sender}</span></button>
                      <button aria-label={`喜欢${item.title}`} onClick={(e) => {
                        e.stopPropagation();
                        setLikedIds((current) => ({ ...current, [item.id]: !current[item.id] }));
                      }} data-redbook-like={likedKey} aria-pressed={!!likedIds[item.id]} className={likedIds[item.id] ? "redbook-like liked" : "redbook-like"}><Heart size={16}/><span>{item.likes + (likedIds[item.id] ? 1 : 0) || ""}</span></button>
                    </div>
                  </article>;
                })}
              </div>
            )}
            {bottomTab === "首页" && <Empty items={ordered} label="暂时没有相关笔记，换个分类看看吧"/>}
          </div>
        </>
      )}
      <nav className="redbook-bottom-nav">
        {[
          {label:"首页",icon:<Home size={22}/>,action:"首页"},
          {label:"商城",icon:<ShoppingBag size={21}/>,action:"商城"},
          {label:"发布",icon:<Plus size={25}/>,action:"发布"},
          {label:"消息",icon:<MessageCircle size={22}/>,action:"消息"},
          {label:"我",icon:<User size={22}/>,action:"我"},
        ].map((entry) => <button key={entry.action} className={bottomTab === entry.action ? "selected" : ""} onClick={() => {
          if (entry.action === "发布") { p.onAdd(); return; }
          setBottomTab(entry.action);
        }}>{entry.action === "发布" ? <span className="redbook-publish">{entry.icon}</span> : entry.icon}<span>{entry.label}</span></button>)}
      </nav>
    </div>
  );
}
export function PinterestSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const [board, setBoard] = useState("");
  const list = board
    ? items.filter((i) => (i.folder || "未分类") === board)
    : items;
  return (
    <div className="catalog-skin pinterest-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        {tab === "收藏板" && !board ? (
          <>
            <h1>收藏板</h1>
            <div className="pinterest-boards">
              {groupItems(items).map((g) => (
                <button key={g} onClick={() => setBoard(g)}>
                  <Media
                    item={items.find((i) => (i.folder || "未分类") === g)!}
                  />
                  <strong>{g}</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            {board && (
              <button
                className="pinterest-board-title"
                onClick={() => setBoard("")}
              >
                {board} · 返回收藏板
              </button>
            )}
            <div className="pinterest-pins">
              {list.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <Media item={i} />
                  <strong>{i.title}</strong>
                </button>
              ))}
            </div>
            <Empty items={list} />
          </>
        )}
      </div>
      <Tabs
        tabs={["发现", "收藏板"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setBoard("");
        }}
        icons={[<Home />, <Grid />]}
      />
    </div>
  );
}
export function RedditSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [sort, setSort] = useState("最新");
  const list = [...items].sort((a, b) =>
    sort === "热门" ? b.likes - a.likes : b.time.localeCompare(a.time),
  );
  return (
    <div className="catalog-skin reddit-ui">
      <Header p={p} />
      <div className="reddit-community">
        <Hash size={21} />
        <button onClick={() => setTab(tab === "首页" ? "社区" : "首页")}>
          {tab} ⌄
        </button>
        <select
          aria-label="帖子排序"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>最新</option>
          <option>热门</option>
        </select>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "社区"
          ? groupItems(items).map((g) => (
              <button
                className="reddit-sub"
                key={g}
                onClick={() => {
                  setQ(g === "未分类" ? "" : g);
                  setTab("首页");
                }}
              >
                <Hash size={22} />
                {g}
                <small>
                  {items.filter((i) => (i.folder || "未分类") === g).length} 帖
                </small>
              </button>
            ))
          : list.map((i) => <RedditPost key={i.id} p={p} item={i} />)}
        <Empty items={items} />
      </div>
      <Tabs
        tabs={["首页", "社区"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />]}
      />
    </div>
  );
}
function RedditPost({ p, item: i }: { p: Props; item: Item }) {
  const [vote, setVote] = useSkinState<number>(p, `vote-${i.id}`, 0);
  return (
    <article className="reddit-post">
      <button className="reddit-byline" onClick={() => p.onItem(i)}>
        r/{meta(i, "community", i.folder || "story")} · u/{i.sender}
      </button>
      <button className="social-body" onClick={() => p.onItem(i)}>
        <h3>{i.title}</h3>
        <p>{i.body}</p>
        {i.media && <Media item={i} />}
      </button>
      <div className="reddit-actions">
        <button
          aria-label={`赞同${i.title}`}
          onClick={() => setVote(vote === 1 ? 0 : 1)}
        >
          <ArrowUp size={17} />
        </button>
        <span>{Number(meta(i, "votes", String(i.likes))) + vote}</span>
        <button
          aria-label={`反对${i.title}`}
          onClick={() => setVote(vote === -1 ? 0 : -1)}
        >
          <ArrowDown size={17} />
        </button>
        <button onClick={() => p.onItem(i)}>
          <MessageCircle size={16} />
          {i.comments.length} 评论
        </button>
      </div>
    </article>
  );
}
export function ForumSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "帖子");
  const [board, setBoard] = useState("");
  const list = board
    ? items.filter((i) => (i.folder || "未分类") === board)
    : items;
  return (
    <div className="catalog-skin forum-ui">
      <Header p={p} />
      <div className="forum-banner">
        <Hash size={27} />
        <strong>{board || "论坛"}</strong>
        <span>{items.length} 个主题</span>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "版块"
          ? groupItems(items).map((g) => (
              <button
                className="forum-board"
                key={g}
                onClick={() => {
                  setBoard(g);
                  setTab("帖子");
                }}
              >
                <FolderIcon />
                <div>
                  <strong>{g}</strong>
                  <small>
                    {items.filter((i) => (i.folder || "未分类") === g).length}{" "}
                    个主题
                  </small>
                </div>
                <ChevronRight size={16} />
              </button>
            ))
          : list.map((i) => (
              <button
                className="forum-topic"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <strong>
                  {meta(i, "status") && <em>{meta(i, "status")}</em>}
                  {i.title}
                </strong>
                <p>{i.body.split("\n")[0]}</p>
                <div>
                  <span>
                    {i.sender} · {i.time.slice(5, 16)}
                  </span>
                  <span>
                    {meta(i, "views", "—")} 浏览 · {i.comments.length} 回复
                  </span>
                </div>
              </button>
            ))}
      </div>
      <Tabs
        tabs={["帖子", "版块"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setBoard("");
        }}
        icons={[<MessageCircle />, <Grid />]}
      />
    </div>
  );
}
function FolderIcon() {
  return <Hash size={27} />;
}
export function SnapchatSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "快拍");
  const [index, setIndex] = useState(0);
  const list = items.filter((i) =>
    tab === "回忆"
      ? i.favorite || i.folder === "回忆"
      : tab === "聊天"
        ? i.folder === "聊天"
        : i.folder !== "聊天",
  );
  const i = list[index % Math.max(list.length, 1)];
  return (
    <div className="catalog-skin snapchat-ui">
      <Header p={p} />
      <div className="snap-content">
        {tab === "聊天" ? (
          <div className="snap-chats">
            {list.map((x) => (
              <button key={x.id} onClick={() => p.onItem(x)}>
                <Avatar name={x.sender} />
                <div>
                  <strong>{x.sender}</strong>
                  <small>{x.body}</small>
                </div>
                <Camera size={20} />
              </button>
            ))}
          </div>
        ) : i ? (
          <>
            <Media item={i} />
            <button className="snap-author" onClick={() => p.onItem(i)}>
              <Avatar name={i.sender} />
              {i.sender}
            </button>
            <button
              className="snap-next"
              aria-label="下一条快拍"
              onClick={() => {
                setIndex((n) => n + 1);
                p.onRead(i.id);
              }}
            >
              <ChevronRight size={25} />
            </button>
            <button className="snap-caption" onClick={() => p.onItem(i)}>
              {i.body}
            </button>
          </>
        ) : (
          <p className="catalog-empty">暂无{tab}</p>
        )}
      </div>
      <Tabs
        tabs={["聊天", "快拍", "回忆"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setIndex(0);
        }}
        icons={[<MessageCircle />, <Camera />, <ImageIcon />]}
      />
    </div>
  );
}
function ImageIcon() {
  return <Grid />;
}
