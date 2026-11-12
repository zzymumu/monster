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
    "https://api.dicebear.com/9.x/adventurer/svg?seed=momo&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/notionists/svg?seed=citrus&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=sleepycat&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/svg?seed=peachtea&backgroundColor=ffd5dc",
    "https://api.dicebear.com/9.x/personas/svg?seed=riceball&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=bluehour&backgroundColor=c1f0c1",
    "https://api.dicebear.com/9.x/thumbs/svg?seed=sunday&backgroundColor=f4d1a6",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=potato&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/notionists/svg?seed=kiwi&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=cloudy&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/svg?seed=matcha&backgroundColor=ffd5dc",
    "https://api.dicebear.com/9.x/personas/svg?seed=tinybear&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=noodles&backgroundColor=c1f0c1",
    "https://api.dicebear.com/9.x/thumbs/svg?seed=strawberry&backgroundColor=f4d1a6",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=toast&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/notionists/svg?seed=pocket&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=moonlight&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/svg?seed=soda&backgroundColor=ffd5dc",
    "https://api.dicebear.com/9.x/personas/svg?seed=dumpling&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=tulip&backgroundColor=c1f0c1",
    "https://api.dicebear.com/9.x/thumbs/svg?seed=biscuit&backgroundColor=f4d1a6",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=plum&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/notionists/svg?seed=latte&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=fishball&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/svg?seed=sunny&backgroundColor=ffd5dc",
    "https://api.dicebear.com/9.x/personas/svg?seed=panda&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=jelly&backgroundColor=c1f0c1",
    "https://api.dicebear.com/9.x/thumbs/svg?seed=milkfoam&backgroundColor=f4d1a6",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=cherry&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/notionists/svg?seed=toastie&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=muffin&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/svg?seed=lucky&backgroundColor=ffd5dc",
    "https://api.dicebear.com/9.x/personas/svg?seed=bubbles&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=mint&backgroundColor=c1f0c1",
    "https://api.dicebear.com/9.x/thumbs/svg?seed=pudding&backgroundColor=f4d1a6",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=bean&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/notionists/svg?seed=cocoa&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=starry&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/svg?seed=lemon&backgroundColor=ffd5dc",
    "https://api.dicebear.com/9.x/personas/svg?seed=bunny&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=ginger&backgroundColor=c1f0c1",
    "https://api.dicebear.com/9.x/thumbs/svg?seed=noodle&backgroundColor=f4d1a6",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=kiwi2&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/notionists/svg?seed=pearl&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=mango&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/svg?seed=mochi&backgroundColor=ffd5dc",
    "https://api.dicebear.com/9.x/personas/svg?seed=lilac&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=taro&backgroundColor=c1f0c1",
    "https://api.dicebear.com/9.x/thumbs/svg?seed=sugar&backgroundColor=f4d1a6",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=berry&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/notionists/svg?seed=waffle&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=soup&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/svg?seed=daisy&backgroundColor=ffd5dc",
    "https://api.dicebear.com/9.x/personas/svg?seed=olive&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=melon&backgroundColor=c1f0c1",
    "https://api.dicebear.com/9.x/thumbs/svg?seed=cloud&backgroundColor=f4d1a6",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=hazel&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/notionists/svg?seed=sprout&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/lorelei/svg?seed=teh-tarik-night&backgroundColor=ffe4c7"
  ];
  const encounterAuthorAvatar = "https://i.imgur.com/yZVxgvV.jpg";
  const encounterComments = [
    {"user":"momo（今天也没睡醒）","avatar":0,"location":"上海","body":"啊啊啊啊好羡慕你遇到怪兽了老师这什么神仙运气！！","likes":6430,"replies":[{"user":"小鱼吐泡泡","text":"我靠这张真的拍得好欸！！羡慕到尖叫"},{"user":"阿哲","text":"老师什么神仙机位啊啊啊求多发两张"},{"user":"奶油蘑菇","text":"今天的好运能不能分我一半，我酸了"}]},
    {"user":"今天也在A1","avatar":1,"location":"广东","body":"她谁啊凭什么跟老大一起吃饭？","likes":4457,"replies":[{"user":"七分糖少冰","text":"？？吃顿饭也要先过你这关吗"},{"user":"橘子海","text":"你先别急着替人家生气，关系有证据吗"},{"user":"阿May","text":"老大跟谁吃饭还得给你打申请啊"}]},
    {"user":"阿圆","avatar":2,"location":"浙江","body":"好幸福.....如果怪兽对面坐的是我就好了😭","likes":8470,"replies":[{"user":"晚点再说","text":"姐妹醒醒，梦里什么都有哈哈"},{"user":"林同学","text":"我也想坐对面，递张纸巾都行"},{"user":"不吃香菜","text":"我已经开始嫉妒照片里那把椅子了"}]},
    {"user":"今天吃什么","avatar":3,"location":"北京","body":"我坐她旁边！……她好像跟朋友一起来的！！如果是朋友聚会为什么朋友不在就他俩？","likes":3236,"replies":[{"user":"困困小狗","text":"你是说演唱会座位旁边，不是餐厅吧"},{"user":"今天也在摸鱼","text":"朋友可能坐另一边啊，照片又没拍全"},{"user":"阿圆","text":"互物料本人出来聊两句啊啊啊"}]},
    {"user":"一颗栗子","avatar":4,"location":"福建","body":"这女生谁啊？之前没见过，是工作人员吗？","likes":1265,"replies":[{"user":"小满","text":"staff怎么了，staff不能吃饭吗"},{"user":"momo","text":"没见过就直接判身份也太会猜了"},{"user":"一颗栗子","text":"我第一次见的姐妹后来才知道是老粉"}]},
    {"user":"今天也在摸鱼","avatar":5,"location":"马来西亚·吉隆坡","body":"有没有人看到安可的时候怪兽是不是往台下扔拨片了？？我当时只看到一个东西飞过去，后面就没看清了","likes":1864,"replies":[{"user":"芝士年糕","text":"我也看到那个东西飞过去了！！"},{"user":"桃子汽水","text":"后排只看到大家突然伸手，谁接到了"},{"user":"小熊饼干","text":"先别传成送给谁了，根本没看清"}]},
    {"user":"别催在排队","avatar":6,"location":"四川","body":"A1附近有人接到拨片了吗？蹲后续！！","likes":6105,"replies":[{"user":"小鱼吐泡泡","text":"A1接到的快出来！！今晚天选之子"},{"user":"阿哲","text":"旁边姐妹散场还在地上找拨片哈哈"},{"user":"奶油蘑菇","text":"蹲个repo，求求了别让这事沉了"}]},
    {"user":"桃子汽水","avatar":7,"location":"重庆","body":"我也在这家店吃饭来着！怎么没看到啊😭 我到底在干嘛？光顾着吃了吗？","likes":5156,"replies":[{"user":"七分糖少冰","text":"哈哈你真的只是去吃饭的吧，瓜从天上掉下来"},{"user":"橘子海","text":"同店不同命，我吃到扶墙走都没碰上"},{"user":"阿May","text":"下次吃饭记得抬头看看四周（不是）"}]},
    {"user":"困困小狗","avatar":8,"location":"江苏","body":"A1的来报到！！他后半场真的老往这边晃，我跟朋友俩人叫到嗓子都哑了，回家一看xhs直接沉默……","likes":2850,"replies":[{"user":"晚点再说","text":"A1姐妹我懂，那几次走过来真的很容易想多"},{"user":"林同学","text":"我朋友也一直说怎么又往这边来了"},{"user":"不吃香菜","text":"回家刷到帖子：原来全场一个脑回路"}]},
    {"user":"小周不加班","avatar":9,"location":"河南","body":"不是吧……现在SS都这么离谱了吗？？台上看不够还得追到人家吃饭的地方，能不能给人留点私人空间啊？","likes":4551,"replies":[{"user":"困困小狗","text":"这已经不是偶遇了吧，跟去餐厅拍真的不行"},{"user":"今天也在摸鱼","text":"演出拍摄和私人吃饭是两回事"},{"user":"阿圆","text":"说偶遇的先看看照片怎么来的，别装没看见"}]},
    {"user":"不想起床俱乐部","avatar":10,"location":"辽宁","body":"我跟她互过物料！！！当时还聊了两句来着，人挺好的，我现在刷到这帖整个人都傻了……","likes":1501,"replies":[{"user":"小满","text":"互物料本人出现了！！你们当时换了什么"},{"user":"momo","text":"人挺好这句莫名让我更好奇了哈哈"},{"user":"一颗栗子","text":"姐妹别透露太多，别把现场信息拼出来"}]},
    {"user":"奶油蘑菇","avatar":11,"location":"香港","body":"怪兽都多大了，谈个恋爱怎么了？？你们是他谁啊，管好自己行吗？","likes":2913,"replies":[{"user":"芝士年糕","text":"谈恋爱当然是他的自由，但粉丝有情绪也正常"},{"user":"桃子汽水","text":"你这句火气好大，大家又不是开董事会"},{"user":"小熊饼干","text":"自由归自由，舞台互动边界也能讨论啊"}]},
    {"user":"林同学","avatar":12,"location":"台湾","body":"哦……原来我以为的饭撒是给嫂子的😊😊😊 好好好，原来我才是play中的一环。谢谢，有被创到。","likes":7337,"replies":[{"user":"小鱼吐泡泡","text":"救命这句真的好酸，酸得我笑出声"},{"user":"阿哲","text":"嫂子还没影呢，先把自己创到了"},{"user":"奶油蘑菇","text":"今晚最痛的一条评论出现了"}]},
    {"user":"橘子海","avatar":13,"location":"澳门","body":"为什么要现在放出来啊……就不能让怪兽安安静静吃顿饭吗？以前说不打扰是我的温柔，现在怎么一偶遇就恨不得全网直播啊","likes":8771,"replies":[{"user":"七分糖少冰","text":"散场就让人家吃口饭吧，追到店里真的窒息"},{"user":"橘子海","text":"以前说不要打扰，现在手机举得比谁都快"},{"user":"阿May","text":"照片里还有普通人呢，发之前想想"}]},
    {"user":"阿May","avatar":14,"location":"湖北","body":"这家店好吃吗？之前去大马玩都没找到特别喜欢的餐厅，有没有当地的老师出来推荐一下~","likes":3918,"replies":[{"user":"晚点再说","text":"当地姐妹快来！！菜单推荐一下"},{"user":"林同学","text":"我上次去吃觉得还不错，饭点人多"},{"user":"不吃香菜","text":"评论区终于有人问正事了我饿了"}]},
    {"user":"七分糖少冰","avatar":15,"location":"湖南","body":"你们真的没人发现怪兽今天心情特别好吗？他一直在笑欸！！弹琴的时候整个人都好松弛......solo也帅惨了！","likes":3148,"replies":[{"user":"困困小狗","text":"有！！他今天笑得特别明显，我朋友一直说状态好"},{"user":"今天也在摸鱼","text":"solo那段我现在还在回味，手指也太稳了"},{"user":"阿圆","text":"先把今天舞台夸完好吗，真的帅得失语"}]},
    {"user":"momo在摸鱼","avatar":16,"location":"陕西","body":"说实话，如果真的有特殊关系，那我可能真的会膈应……不是说他不能谈恋爱，但如果一边享受粉丝的喜欢，一边又让粉丝觉得自己获得了特别的互动，最后发现不是那么回事，谁能完全没感觉啊？","likes":4222,"replies":[{"user":"小满","text":"你说的这个点我能理解，不是简单谈不谈恋爱"},{"user":"momo","text":"但现在好多都是猜测，先别把假设当事实"},{"user":"一颗栗子","text":"粉丝有情绪是真的，女生被网暴也是真的"}]},
    {"user":"小陈同学","avatar":17,"location":"山东","body":"看起来还蛮配的，好甜，老大幸福就好💔","likes":6704,"replies":[{"user":"芝士年糕","text":"祝福归祝福，咱先别替本人盖章哈哈"},{"user":"桃子汽水","text":"希望大家都好好的，别开盒就行"},{"user":"小熊饼干","text":"老大开心就好这句我能说一百遍"}]},
    {"user":"路过的阿姨","avatar":18,"location":"云南","body":"别问店在哪了！！真的别问了！！人家还要吃饭呢！！求求你们了，评论区都在干什么啊？","likes":6441,"replies":[{"user":"小鱼吐泡泡","text":"谁在评论区报地址我真的会谢"},{"user":"阿哲","text":"人家吃个饭还要被围观，想想都累"},{"user":"奶油蘑菇","text":"别去蹲店，别把偶遇变成围堵"}]},
    {"user":"椰椰拿铁","avatar":19,"location":"广西","body":"这女生看起来年纪不大欸……如果真的在一起的话，这年龄差是不是蛮大的.....","likes":4264,"replies":[{"user":"七分糖少冰","text":"年龄差先别急着算，关系都没确定"},{"user":"橘子海","text":"怎么评论区已经开始查户口了"},{"user":"阿May","text":"别拿女生年纪说事，没必要当靶子"}]},
    {"user":"鱼丸粗面","avatar":20,"location":"美国","body":"怪兽就不能有女性朋友吗？一起吃个饭就直接嫂子了，互联网结婚速度比我家亲戚催婚还快。","likes":751,"replies":[{"user":"晚点再说","text":"女性朋友当然可以有啊，难道只能跟男的吃饭"},{"user":"林同学","text":"现在吃顿饭就发喜糖，互联网效率真高"},{"user":"不吃香菜","text":"我同意能有朋友，但别拿猜测当官宣"}]},
    {"user":"小熊饼干","avatar":21,"location":"加拿大","body":"所以我们辛辛苦苦抢票、排队、蹲内场，最后是来给嫂子提供内场前排吗😊😊😊 我真的会谢。","likes":1962,"replies":[{"user":"困困小狗","text":"买票是为了看演出，不是买艺人的私人时间吧"},{"user":"今天也在摸鱼","text":"这话听着不太对，别把气撒在女生身上"},{"user":"阿圆","text":"内场票不是嫂子候选席啊"}]},
    {"user":"别叫我起床","avatar":22,"location":"新加坡","body":"舞台走位本来就会经过不同区域吧？？？他多走几次就默认是冲着某个人去的？","likes":5676,"replies":[{"user":"小满","text":"真的要看完整走位，几次经过说明不了什么"},{"user":"momo","text":"我在另一边也看到他来回走，像舞台动线"},{"user":"一颗栗子","text":"别截几秒就开始写偶像剧了"}]},
    {"user":"小满","avatar":23,"location":"上海","body":"说是嫂子的，能不能先说说你们怎么看出来的？就不能是工作人员吗，工作人员不配跟怪兽吃饭是吧？","likes":6503,"replies":[{"user":"芝士年糕","text":"工作人员当然配啊？？这是什么奇怪发言"},{"user":"桃子汽水","text":"但也别直接认定她是staff，谁都没证据"},{"user":"小熊饼干","text":"吃饭还要先验工牌吗，笑死又笑不出"}]},
    {"user":"咸鱼翻身中","avatar":24,"location":"广东","body":"偷拍也能这么帅....","likes":2852,"replies":[{"user":"小鱼吐泡泡","text":"脸是真的能打……但拍摄方式还是越界"},{"user":"阿哲","text":"老师这个角度绝了，团长侧脸杀我"},{"user":"奶油蘑菇","text":"一边存图一边觉得不该偷拍，心情复杂"}]},
    {"user":"西瓜不吐籽","avatar":25,"location":"浙江","body":"只剩阿信一个单身了？陈太太们加油💪","likes":4224,"replies":[{"user":"七分糖少冰","text":"阿信：我又被安排上了是吗哈哈"},{"user":"橘子海","text":"陈太太们别急，先让团长把饭吃完"},{"user":"阿May","text":"五月天单身人口普查怎么又开始了"}]},
    {"user":"阿哲","avatar":26,"location":"北京","body":"嫂子未必不能是我","likes":7316,"replies":[{"user":"晚点再说","text":"姐妹野心很大！！先去排号哈哈"},{"user":"林同学","text":"嫂子可以是我，但我先把票钱还完"},{"user":"不吃香菜","text":"评论区人人都有机会是吧哈哈"}]},
    {"user":"今天星期几","avatar":27,"location":"福建","body":"望周知：娱乐圈没有假孩子，被拍到就说明已经拉一坨了。","likes":6835,"replies":[{"user":"困困小狗","text":"这梗太损了吧哈哈哈，别乱用啊"},{"user":"今天也在摸鱼","text":"被拍到不等于什么都能默认"},{"user":"阿圆","text":"我刚想认真吃瓜又被这句整笑了"}]},
    {"user":"云朵收藏家","avatar":28,"location":"四川","body":"趁乱收怪兽周边","likes":5959,"replies":[{"user":"小满","text":"收周边的姐妹永远在正确时间出现"},{"user":"momo","text":"瓜田里也不忘蹲出物，respect"},{"user":"一颗栗子","text":"有没有人出今晚拨片同款（不是）"}]},
    {"user":"芝士年糕","avatar":29,"location":"重庆","body":"老师，现在怪兽还在那边吗？","likes":1745,"replies":[{"user":"芝士年糕","text":"别问在哪了真的，知道了也别去"},{"user":"桃子汽水","text":"姐妹先别定位，给人家一点空间"},{"user":"小熊饼干","text":"别蹲了别蹲了，让人家好好休息"}]},
    {"user":"一只普通网友","avatar":30,"location":"江苏","body":"这是那女生的账号吗？","likes":6796,"replies":[{"user":"小鱼吐泡泡","text":"账号不要发出来！！真的不要"},{"user":"阿哲","text":"有点眼熟也别公开认人，求你们了"},{"user":"奶油蘑菇","text":"吃瓜可以，扒普通人账号就过线了"}]},
    {"user":"小何","avatar":31,"location":"河南","body":"楼上你有病吧？人家又没做什么，扒人家账号干嘛？","likes":5979,"replies":[{"user":"七分糖少冰","text":"对啊你有病吧？？人家吃个饭还得被查"},{"user":"橘子海","text":"终于有人说了，别把路人当侦探游戏"},{"user":"阿May","text":"楼上赶紧删掉暗示，别引导开盒"}]},
    {"user":"晚点再说","avatar":32,"location":"辽宁","body":"嘴上说尊重怪兽，实际上连人家吃饭都要盯着，笑死。","likes":4556,"replies":[{"user":"晚点再说","text":"嘴上尊重，镜头追着人跑，这不矛盾吗"},{"user":"林同学","text":"最烦打着粉丝名义越界的行为"},{"user":"不吃香菜","text":"别把跟拍说成偶遇，真的不是一回事"}]},
    {"user":"白日做梦选手","avatar":33,"location":"香港","body":"有些人是真的双标，自己可以幻想跟怪兽谈恋爱，看到一个真实女生就开始挑三拣四","likes":2990,"replies":[{"user":"困困小狗","text":"这话虽然难听但确实有人双标"},{"user":"今天也在摸鱼","text":"幻想是自己的事，现实里别拿女生出气"},{"user":"阿圆","text":"女生又不是来参加粉丝满意度测评的"}]},
    {"user":"不吃香菜","avatar":34,"location":"台湾","body":"说她是嫂子的拿证据，说她是staff的也拿证据","likes":8144,"replies":[{"user":"小满","text":"对啊，两边都别空口认身份，拿证据说话"},{"user":"momo","text":"一会儿嫂子一会儿staff，身份切换比变脸快"},{"user":"一颗栗子","text":"先别贴标签，评论区已经够乱了"}]},
    {"user":"小狗今天值班","avatar":35,"location":"澳门","body":"xxyy别睡了！出来上班了！","likes":2077,"replies":[{"user":"芝士年糕","text":"xxyy快醒醒！！你家评论区快打起来了"},{"user":"桃子汽水","text":"超话管理员今天怕不是加班到天亮"},{"user":"小熊饼干","text":"别cue人家了哈哈，先把帖子看完"}]},
    {"user":"半糖乌龙去冰","avatar":36,"location":"北京","body":"上一次怪兽被爆恋情是什么时候啊有老师记得吗？","likes":1863,"replies":[{"user":"小鱼吐泡泡","text":"我记得以前也有传闻吧？但年份真的记混了，蹲老粉考古"},{"user":"阿哲","text":"先别张嘴就说哪一年，求个有出处的时间线"},{"user":"奶油蘑菇","text":"这楼突然变考古现场了，搬个小板凳"}]},
    {"user":"晚风收信人","avatar":37,"location":"四川","body":"算啦尊重老大的选择啦 幸福就好","likes":3291,"replies":[{"user":"七分糖少冰","text":"是啊，喜欢这么多年还是希望他开心"},{"user":"橘子海","text":"先不替本人官宣，单纯祝福一下"},{"user":"阿May","text":"心情复杂归复杂，最后还是希望他好"}]},
    {"user":"急急国王本人","avatar":38,"location":"广东","body":"她到底谁啊有没有老师知道，急死我了！！！！","likes":2457,"replies":[{"user":"晚点再说","text":"我也急！！但别把普通人的账号往外搬啊"},{"user":"林同学","text":"有线索也别公开认人，给人留点隐私吧"},{"user":"不吃香菜","text":"蹲后续可以，开盒真的不行"}]}
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
