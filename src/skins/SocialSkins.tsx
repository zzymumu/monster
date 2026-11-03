import { useSkinState } from "../skinState";
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
  User,
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
  const [category, setCategory] = useState("推荐");
  const location = "北京";
  const [showSearch, setShowSearch] = useState(false);
  const [bottomTab, setBottomTab] = useState("首页");
  const [sortBy, setSortBy] = useState("推荐");
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
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
  const feedItems = sourceIsPlaceholder ? demoPosts : items;
  const visible = feedItems.filter((item) => {
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
        {bottomTab === "我" ? (
          <div className="redbook-profile"><Avatar name={p.owner || "我"}/><strong>{p.owner || "我"}</strong><small>分享生活 · 记录喜欢</small><button onClick={() => setBottomTab("首页")}>返回首页</button></div>
        ) : bottomTab === "消息" ? (
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
