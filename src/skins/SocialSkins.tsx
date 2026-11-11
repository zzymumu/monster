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
  let encounterRemarks = {};
  try {
    const parsed = JSON.parse(String(wechatUi.wxContactRemarks || "{}"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) encounterRemarks = parsed;
  } catch {}
  const encounterDisplayName = (canonical) => String(encounterRemarks[canonical] || canonical).trim() || canonical;
  const encounterShareToWechat = (recipient) => {
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
    "https://api.dicebear.com/9.x/adventurer/svg?seed=MaydayGuitar&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=StarConcert&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=RabbitFan&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=BlueStage&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=PandaMusic&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=LittleMonster&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=GuitarPick&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=PinkRock&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=MoonlightFan&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=DrumKit&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=CloudSinger&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=TinyBear&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=MusicNote&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=StageLight&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=RockRabbit&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=ConcertGirl&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=GuitarCat&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=LittleStar&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=StagePanda&backgroundColor=ffd5dc,c0e6ff,d1f4d3,f5d0a9"
  ];
  const encounterComments = [
    {user:"今天也要听五月天",avatar:0,body:"？？？？我靠真的假的啊啊啊啊！！！吉隆坡这是什么隐藏地图？？？",likes:1286,replies:["今天也要听五月天：真的！！本人超级帅！！我们散场后一起去吃饭，看到的时候差点没认出来哈哈哈哈。"]},
    {user:"温尚翊的吉他拨片",avatar:1,body:"等等？？？女生？？？我放大看了三遍？？？",likes:963,replies:["今天也要听五月天：姐妹你不是一个人，我也在放大哈哈哈哈。","吃颗苹果：感觉两个人很熟欸，不像普通粉丝偶遇。","吉他弦别断：重点是刚刚演出现场我好像也看到这个女生了！！"]},
    {user:"团长今天弹吉他了吗",avatar:2,body:"我靠我刚刚就在现场！！！散场那会儿怪兽是不是把拨片递给她了？？？我当时还跟朋友说我是不是眼花了？？？",likes:1521,replies:["真的假的？？？递拨片？？？那这关系不一般吧？？","现场第三排：我也看到有人拿到拨片了，但不确定是不是同一个人。","理智追星版：一块拨片能说明什么，别脑补了。","温柔一点好吗：如果真的是送给她的，那也是人家的私事吧。"]},
    {user:"今天不熬夜了",avatar:3,body:"不是？？？散场递拨片→转头一起吃饭？？？这时间线我先蹲一个后续……",likes:876,replies:["团长今天弹吉他了吗：我真的不是编的，我就在侧边看见的！你们别一有消息就说别人造谣。","五月天是我的青春：也可能是工作人员帮忙递的吧？一块拨片就开始脑补恋情，能不能冷静一点。"]},
    {user:"阿信今天发微博了吗",avatar:4,body:"先不说是不是认识，为什么要拍人家吃饭啊？？演出现场拍就算了，私人时间真的别追着拍吧……",likes:1132,replies:["今天也要听五月天：我们是隔壁桌刚好看到，没有跟拍，也没有上去打扰。","不想被偷拍：但把别人吃饭的照片发出来还是不太合适吧？你们有没有想过旁边那个女生根本不是公众人物？","路过五迷：同意，女生也不是公众人物，别扒身份。"]},
    {user:"吉他弦断了",avatar:5,body:"姐你拍的时候他们有发现吗……不是想吵，真的觉得吃饭被拍有点越界了。",likes:604,replies:["今天也要听五月天：没有对着拍很久，是远远看到觉得很巧才记录一下。","保持距离：希望不要继续放大女生长相或找个人信息。"]},
    {user:"怪兽的吉他",avatar:6,body:"团长刚下班就去干饭了是吧哈哈哈哈哈哈这才是我认识的怪兽🤣",likes:421,replies:["宵夜战士：工作结束当然要吃饭啦哈哈哈。"]},
    {user:"橘子汽水加冰",avatar:7,body:"不是吧啊啊啊啊啊！！！拨片？？？我先尖叫三分钟，谁懂这个含金量！！",likes:998,replies:["现场第三排：我也记得有递东西，但别把未经确认的事说死。","冷静五秒：评论区已经开始写连续剧了。"]},
    {user:"五迷不迷路",avatar:8,body:"能不能别一看到女生就嫂子嫂子啊？？朋友不能一起吃饭吗，真的窒息。男艺人身边不能有女性朋友吗？",likes:713,replies:["今天不熬夜了：主要是刚刚现场递拨片的传闻撞上了，大家才好奇。","给点空间：好奇也别去扒人家身份，更别去蹲餐厅和酒店，真的越界了。"]},
    {user:"今晚听温柔",avatar:9,body:"我朋友刚刚也在现场！！她说怪兽散场时递了拨片给一个女生……不会真是同一位吧？？？我鸡皮疙瘩起来了。",likes:1104,replies:["团长今天弹吉他了吗：我看到的也是那个方向！！","理智追星版：没有清楚照片就别认人了，别误伤。","今天也要听五月天：我们只是刚好一起吃饭，其他真的不清楚啦。"]},
    {user:"五月天的猫猫",avatar:10,body:"拜托别扒女生是谁啊，人家又不是艺人。看个热闹就好了，别去人肉。",likes:842,replies:["同意，保护普通人的隐私。"]},
    {user:"派对动物本人",avatar:11,body:"评论区已经从偶遇楼变成辩论赛了哈哈哈哈哈，但真的别去店里蹲人啊。",likes:529,replies:["五迷路过：说得对，讨论归讨论，不要去店里蹲人。"]},
    {user:"不想取昵称了",avatar:12,body:"所以是演出结束后刚好碰上，还是本来就约好吃饭的啊？？纯好奇，别骂我我不扒。",likes:390,replies:["今天也要听五月天：这个我就不清楚啦，真的只是偶遇。"]},
    {user:"等一场五月天",avatar:13,body:"怪兽开心就好啦！但拍照发帖之前还是想想当事人愿不愿意被公开吧。",likes:678,replies:["路人甲：这条说得挺有道理。"]}
    ,{user:"别拿拨片嗑CP",avatar:14,body:"说真的，一块拨片就能脑补成约会对象？演唱会递拨片给粉丝也不是没发生过。",likes:947,replies:["团长今天弹吉他了吗：可她现在又跟怪兽一起吃饭啊，你觉得只是普通粉丝？","别拿拨片嗑CP：一起吃饭也可能是朋友，别替人家官宣。","今晚听温柔：重点是照片里女生根本没同意被讨论吧。"]},
    {user:"今晚不做梦",avatar:15,body:"我真的服了，楼主拍到就发，评论区开始扒女生，下一步是不是要人肉了？",likes:1203,replies:["今天也要听五月天：没有要扒她啦，我只是分享遇到怪兽的心情。","不吃香菜：那就把女生相关的猜测删掉啊，别让帖子继续发酵。","五迷不迷路：楼主又不是故意引导，评论区自己在吵。"]},
    {user:"拨片收藏家",avatar:16,body:"如果现场真的递了拨片，那我只想说羡慕……但也没必要把人家吃饭照片传得到处都是。",likes:766,replies:["橘子汽水加冰：羡慕归羡慕，别把女生当成线索找。","团长今天弹吉他了吗：我只是在说我看到的，不是在扒她。"]},
    {user:"五月天不散场",avatar:17,body:"有些人真的双标，平时说支持怪兽幸福，真看到女生又开始破防。",likes:1088,replies:["阿信今天发微博了吗：反对偷拍不等于反对恋爱，别混为一谈。","五月天不散场：那就别把所有讨论都扣成偷拍受害者啊。","路过五迷：这条下面已经吵成两派了……"]},
    {user:"温柔是你",avatar:18,body:"楼主能不能说一下，是不是演出结束后你们一群人一起吃饭？还是只有他们两个？",likes:623,replies:["今天也要听五月天：现场人挺多的，我没有一直注意他们桌。","吃瓜小号：这回答好微妙啊？？？","给点私人空间：人家没义务交代同行的人都有谁。"]}
  ];
  if (p.ui?.redbookMalaysiaEncounterPostV1 === "show") {
    return (
      <div className="catalog-skin redbook-ui redbook-dark redbook-encounter-detail" style={{background:"#111116",color:"#f4f4f5",height:"100%",minHeight:0,width:"100%",margin:0,padding:0,border:0,outline:0,boxSizing:"border-box",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <header className="redbook-encounter-topbar"><button aria-label="返回" onClick={p.onBack} style={{fontSize:27,lineHeight:1}}>‹</button><img src="https://api.dicebear.com/9.x/adventurer/svg?seed=MaydayFanAuthor&backgroundColor=ffd5dc" alt="发帖人头像"/><strong>今天也要听五月天</strong><button className="redbook-encounter-follow" onClick={()=>setEncounterFollowed(v=>!v)}>{encounterFollowed?"已关注":"关注"}</button><button aria-label="转发" onClick={()=>setEncounterShareOpen(true)} style={{fontSize:25}}>↗</button></header>
        <div className="catalog-scroll" style={{flex:1,overflowY:"auto",padding:"14px 16px 90px",margin:0,border:0,boxSizing:"border-box"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><div style={{flex:1,fontSize:11,color:"#999"}}>2026-11-12 22:18 · 吉隆坡</div></div>
          <div style={{display:"none",alignItems:"center",gap:10,marginBottom:16}}>
            
          </div>
          <h2 style={{fontSize:21,lineHeight:1.45,margin:"8px 0 14px"}}>吉隆坡偶遇怪兽！！！旁边那个女生是谁啊🥹</h2>
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/37/%E4%BA%94%E6%9C%88%E5%A4%A9-%E6%80%AA%E7%8D%B8_%285247925751%29.jpg" alt="五月天怪兽演出照片" style={{width:"100%",borderRadius:7,display:"block",maxHeight:620,objectFit:"cover"}}/>
          <p style={{fontSize:15,lineHeight:1.85,whiteSpace:"pre-wrap",marginTop:18}}>演唱会结束后本来想找地方吃点东西，没想到居然和朋友一起在餐厅遇到怪兽！！本人真的好帅啊啊啊！{"\n\n"}他旁边还有一位女生，两个人是一起过来吃饭的，坐在一起聊天，看起来很熟，期间一直有说有笑。我们就在附近，看到的时候真的愣住了，没敢上去打扰。{"\n\n"}散场后还能遇到团长，这是什么神仙运气！！😭{"\n\n"}#五月天 #五月天怪兽 #吉隆坡 #演唱会偶遇</p>
          <div style={{color:"#999",fontSize:12,margin:"18px 0"}}>话题 #五月天 #五月天怪兽 #吉隆坡</div>
          <div style={{background:"#202027",borderRadius:8,padding:12,marginBottom:16,color:"#aaa",fontSize:13}}>📁 推荐</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><strong style={{fontSize:16}}>共 {103+encounterLocalComments.length} 条评论</strong><span style={{fontSize:12,color:"#999"}}>最热</span></div>
          <div style={{display:"flex",gap:8,marginBottom:18}}><img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=96&h=96&fit=crop" alt="我的头像" style={{width:38,height:38,borderRadius:"50%",objectFit:"cover"}}/><input value={encounterCommentDraft} onChange={e=>setEncounterCommentDraft(e.target.value)} placeholder="说点什么…" style={{flex:1,minWidth:0,border:0,borderRadius:20,background:"#292930",color:"#fff",padding:"10px 14px"}}/><button onClick={()=>{if(encounterCommentDraft.trim()){setEncounterLocalComments(v=>[...v,encounterCommentDraft.trim()]);setEncounterCommentDraft("");}}} style={{background:"none",color:"#ff4967"}}>发送</button></div>
          {encounterComments.map((comment,index)=>(
            <div key={index} style={{display:"flex",gap:10,margin:"18px 0"}}><img src={encounterAvatars[comment.avatar]} alt={comment.user+"头像"} style={{width:38,height:38,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:"#aaa",marginBottom:6}}>{comment.user}</div><div style={{fontSize:14,lineHeight:1.65}}>{comment.body}</div><div style={{fontSize:11,color:"#777",marginTop:8}}>2小时前 吉隆坡 <button style={{background:"none",color:"#aaa"}} onClick={()=>setExpandedEncounterComments(v=>({...v,[index]:!v[index]}))}>回复</button><span style={{float:"right"}}>♡ {comment.likes}</span></div>
              {comment.replies.length>0&&<div style={{marginTop:9,padding:"10px 12px",background:"#202027",borderRadius:7}}>{comment.replies.slice(0,expandedEncounterComments[index]?undefined:1).map((reply,j)=><div key={j} style={{fontSize:13,lineHeight:1.7,marginBottom:6}}>{reply}</div>)}{comment.replies.length>1&&<button onClick={()=>setExpandedEncounterComments(v=>({...v,[index]:!v[index]}))} style={{background:"none",color:"#9ca3af",fontSize:12}}>{expandedEncounterComments[index]?"收起回复":"展开 "+comment.replies.length+" 条回复"}</button>}</div>}
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
