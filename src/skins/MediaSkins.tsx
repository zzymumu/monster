import { AudioPlayer, useTrack } from "../audio";
import { useSkinState } from "../skinState";
import {
  Bookmark,
  Check,
  Compass,
  Heart,
  Home,
  MessageCircle,
  Music,
  Play,
  Plus,
  Search,
  SkipForward,
  User,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { safeMedia, type Item } from "../schema";
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
function TrackPlayer({
  item,
  p,
  onNext,
}: {
  item: Item;
  p: Props;
  onNext: () => void;
}) {
  return (
    <div className="track-player">
      <button onClick={() => p.onItem(item)}>
        <Music size={20} />
        <span>
          {item.title}
          <small>{item.sender}</small>
        </span>
      </button>
      {item.kind === "audio" && safeMedia(item.media) ? (
        <AudioPlayer p={p} item={item} />
      ) : (
        <button onClick={() => p.onItem(item)}>查看</button>
      )}
      <button aria-label="下一首" onClick={onNext}>
        <SkipForward size={19} />
      </button>
    </div>
  );
}
export function SpotifySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [playlist, setPlaylist] = useState(""),
    [track, setTrack] = useTrack(p, items);
  const list = playlist
    ? items.filter((i) => (i.folder || "我的音乐") === playlist)
    : items;
  return (
    <div className="catalog-skin spotify-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <div className="spotify-heading">
          <Avatar name={p.owner ?? "我"} />
          <button
            className={tab === "首页" ? "selected" : ""}
            onClick={() => setTab("首页")}
          >
            音乐
          </button>
          <button
            className={tab === "音乐库" ? "selected" : ""}
            onClick={() => setTab("音乐库")}
          >
            音乐库
          </button>
        </div>
        {tab === "搜索" && <SearchBox value={q} set={setQ} />}
        <h1>{playlist || (tab === "音乐库" ? "音乐库" : "为你收藏")}</h1>
        {!playlist && (
          <div className="spotify-playlists">
            {groupItems(items, "我的音乐").map((g) => (
              <button key={g} onClick={() => setPlaylist(g)}>
                <Music size={29} />
                <strong>{g}</strong>
              </button>
            ))}
          </div>
        )}
        {playlist && (
          <button className="playlist-back" onClick={() => setPlaylist("")}>
            返回全部音乐
          </button>
        )}
        <div className="spotify-tracks">
          {list.map((i, n) => (
            <button
              key={i.id}
              onClick={() => {
                setTrack(i);
              }}
            >
              <span>{n + 1}</span>
              <div>
                <strong>{i.title}</strong>
                <small>
                  {i.sender} · {meta(i, "album")}
                </small>
              </div>
              <small>{meta(i, "duration")}</small>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      {track && (
        <TrackPlayer
          item={track}
          p={p}
          onNext={() =>
            setTrack(
              items[
                (items.findIndex((i) => i.id === track.id) + 1) % items.length
              ],
            )
          }
        />
      )}
      <Tabs
        tabs={["首页", "搜索", "音乐库"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setPlaylist("");
        }}
        icons={[<Home />, <Search />, <Music />]}
      />
    </div>
  );
}
export function NeteaseSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const [folder, setFolder] = useState(""),
    [track, setTrack] = useTrack(p, items);
  const list = folder
    ? items.filter((i) => (i.folder || "我的歌单") === folder)
    : items;
  return (
    <div className="catalog-skin netease-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "发现" ? (
          <>
            <div className="netease-feature">
              <Music size={44} />
              <h2>推荐歌单</h2>
            </div>
            <div className="netease-shelves">
              {groupItems(items, "我的歌单").map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setFolder(g);
                    setTab("我的");
                  }}
                >
                  <Music size={33} />
                  <strong>{g}</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="netease-profile">
              <Avatar name={p.owner ?? "我"} />
              <h2>{p.owner ?? "我的音乐"}</h2>
            </div>
            <h3>{folder || "我的歌单"}</h3>
          </>
        )}
        {list.map((i, n) => (
          <div className="netease-track" key={i.id}>
            <button
              onClick={() => {
                setTrack(i);
              }}
            >
              <span>{n + 1}</span>
              <div>
                <strong>{i.title}</strong>
                <small>
                  {i.sender} · {meta(i, "album")}
                </small>
              </div>
            </button>
            <button
              aria-label={`歌曲详情${i.title}`}
              onClick={() => p.onItem(i)}
            >
              <MessageCircle size={18} />
            </button>
          </div>
        ))}
        <Empty items={list} />
      </div>
      {track && (
        <TrackPlayer
          item={track}
          p={p}
          onNext={() =>
            setTrack(
              items[
                (items.findIndex((i) => i.id === track.id) + 1) % items.length
              ],
            )
          }
        />
      )}
      <Tabs
        tabs={["发现", "我的"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setFolder("");
        }}
        icons={[<Compass />, <Music />]}
      />
    </div>
  );
}
export function YouTubeSkin(p: Props) {
  const channelUrl = "https://www.youtube.com/@monsterbalaja531";
  const videosUrl = channelUrl + "/videos";
  const playlistUrl = "https://www.youtube.com/playlist?list=UU5ieWR5T4WulmNLXQ8-wiDw";
  const [tab, setTab] = useSkinState<string>(p, "monster-youtube-tab", "首页");
  const [query, setQuery] = useSkinState<string>(p, "monster-youtube-search", "");
  const [playingId, setPlayingId] = useSkinState<string>(p, "monster-youtube-playing", "");
  const videos = [
    { id: "Yaak5SjAcgc", title: "五月天-後青春期的詩 Guitar Version", views: "9.2万次观看", age: "6年前", duration: "2:27" },
    { id: "mFUk8iq-WE0", title: "五月天-盛夏光年 Mayday live in the sky Monster solo", views: "5.6万次观看", age: "6年前", duration: "1:26" },
    { id: "fNucpS5Seg8", title: "五月天-傷心的人別聽慢歌 monster EG", views: "32万次观看", age: "12年前", duration: "3:52" },
    { id: "1G8h2gruylE", title: "五月天-入陣曲 monster EG ver.", views: "36万次观看", age: "12年前", duration: "2:45" },
  ];
  const filtered = videos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="catalog-skin youtube-ui" style={{ background: "#fff", color: "#0f0f0f" }}>
      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 20, letterSpacing: "-1px" }}><span style={{ background: "#f00", color: "#fff", borderRadius: 7, padding: "2px 6px", fontSize: 14 }}>▶</span>YouTube</div>
        <a href={videosUrl} target="_blank" rel="noreferrer" style={{ color: "#0f0f0f", textDecoration: "none", fontSize: 13 }}>打开频道全部视频 ↗</a>
      </div>
      <div style={{ padding: "8px 14px" }}>
        <SearchBox value={query} set={setQuery} />
      </div>
      <div className="catalog-scroll">
        <div style={{ padding: "4px 14px 12px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#222", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 }}>M</div>
          <div style={{ flex: 1 }}><strong>Mayday Monster</strong><div style={{ color: "#606060", fontSize: 12 }}>@monsterbalaja531 · 五月天怪獸</div></div>
          <a href={channelUrl} target="_blank" rel="noreferrer" style={{ background: "#f2f2f2", color: "#111", padding: "8px 12px", borderRadius: 20, textDecoration: "none", fontSize: 12 }}>频道</a>
        </div>
        <div className="youtube-chips" style={{ padding: "0 14px 12px" }}>
          {["首页", "全部视频"].map(name => <button key={name} className={tab === name ? "selected" : ""} onClick={() => setTab(name)}>{name}</button>)}
        </div>
        <div style={{ padding: "0 12px 14px" }}>
          <div style={{ fontWeight: 700, padding: "4px 2px 12px" }}>来自 “Mayday Monster” 上传的视频</div>
          {playingId && (
            <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", background: "#000" }}>
              <div style={{ aspectRatio: "16 / 9" }}>
                <iframe title="YouTube 视频播放" src={"https://www.youtube-nocookie.com/embed/" + playingId + "?autoplay=1&rel=0"} style={{ width: "100%", height: "100%", border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              </div>
              <button onClick={() => setPlayingId("")} style={{ border: 0, background: "#181818", color: "#fff", padding: "9px 12px", width: "100%", textAlign: "left" }}>关闭播放器 ×</button>
            </div>
          )}
          {filtered.map(v => (
            <button key={v.id} onClick={() => setPlayingId(v.id)} style={{ display: "flex", gap: 11, marginBottom: 14, color: "inherit", background: "transparent", border: 0, padding: 0, width: "100%", textAlign: "left", alignItems: "flex-start" }}>
              <div style={{ position: "relative", width: "43%", flexShrink: 0, aspectRatio: "16 / 9", borderRadius: 9, overflow: "hidden", background: "#eee" }}>
                <img src={"https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg"} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                <span style={{ position: "absolute", right: 5, bottom: 5, background: "rgba(0,0,0,.8)", color: "#fff", borderRadius: 4, padding: "2px 4px", fontSize: 11 }}>{v.duration}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{v.title}</div>
                <div style={{ color: "#606060", fontSize: 12, marginTop: 6 }}>Mayday Monster</div>
                <div style={{ color: "#606060", fontSize: 12, marginTop: 5 }}>{v.views} · {v.age}</div>
              </div>
              <span style={{ fontSize: 20, lineHeight: 1 }}>⋮</span>
            </button>
          ))}
          <div style={{ borderTop: "1px solid #eee", padding: "12px 2px", color: "#606060", fontSize: 12, lineHeight: 1.5 }}>
            上方先展示已核实到真实视频链接的作品。其余历史视频通过 YouTube 官方上传列表完整浏览，避免出现标题或播放链接对不上的情况。
          </div>
          <a href={playlistUrl} target="_blank" rel="noreferrer" style={{ display: "block", background: "#f2f2f2", color: "#111", textAlign: "center", borderRadius: 22, padding: 11, textDecoration: "none", fontSize: 13 }}>浏览全部上传视频 ↗</a>
        </div>
      </div>
      <Tabs tabs={["首页", "Shorts", "我"]} value={tab === "全部视频" ? "首页" : tab} set={v => setTab(v === "首页" ? "全部视频" : v)} icons={[<Home />, <Video />, <User />]} />
    </div>
  );
}
export function BilibiliSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [category, setCategory] = useState("推荐");
  const list =
    tab === "历史"
      ? items.filter((i) => i.folder === "历史")
      : tab === "动态"
        ? items.filter((i) => i.folder === "动态")
        : category === "推荐"
          ? items
          : items.filter((i) => i.folder === category);
  return (
    <div className="catalog-skin bilibili-ui">
      <Header p={p} />
      <div className="bili-search">
        <Avatar name={p.owner ?? "我"} />
        <SearchBox value={q} set={setQ} />
      </div>
      <div className="bili-categories">
        {["推荐", "动画", "音乐", "生活"].map((c) => (
          <button
            key={c}
            className={category === c ? "selected" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        <div className="bili-grid">
          {list.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <div>
                <Media item={i} />
                <small>
                  <Play size={10} />
                  {meta(i, "views", "—")}
                  <time>{meta(i, "duration")}</time>
                </small>
              </div>
              <strong>{i.title}</strong>
              <span>UP · {i.sender}</span>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "动态", "历史"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <MessageCircle />, <User />]}
      />
    </div>
  );
}
function VerticalVideo({ p, item }: { p: Props; item: Item }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false),
    [saved, setSaved] = useSkinState<boolean>(p, `saved-${item.id}`, false);
  return (
    <article className="vertical-video">
      <Media item={item} />
      <div className="vertical-actions">
        <button
          aria-label={`作者${item.sender}`}
          onClick={() => p.onItem(item)}
        >
          <Avatar name={item.sender} />
        </button>
        <button
          aria-label={`喜欢${item.title}`}
          onClick={() => setLiked(!liked)}
        >
          <Heart size={29} fill={liked ? "#f44368" : "white"} />
          <small>{item.likes + (liked ? 1 : 0)}</small>
        </button>
        <button aria-label={`评论${item.title}`} onClick={() => p.onItem(item)}>
          <MessageCircle size={29} />
          <small>{item.comments.length}</small>
        </button>
        <button
          aria-label={`收藏${item.title}`}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark size={27} fill={saved ? "#f8cc55" : "none"} />
        </button>
      </div>
      <button className="vertical-caption" onClick={() => p.onItem(item)}>
        <strong>@{item.sender}</strong>
        <p>{item.body}</p>
        <small>
          <Music size={11} />
          {item.title}
        </small>
      </button>
    </article>
  );
}
export function DouyinSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "推荐");
  const list = tab === "推荐" ? items : items.filter((i) => i.folder === tab);
  return (
    <div className="catalog-skin douyin-ui">
      <Header p={p} />
      <div className="douyin-top">
        {["同城", "关注", "推荐"].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="vertical-feed">
        {list.map((i) => (
          <VerticalVideo key={i.id} p={p} item={i} />
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["推荐", "关注", "我"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function TikTokSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "For You");
  const list =
    tab === "For You"
      ? items
      : tab === "Following"
        ? items.filter((i) => i.folder === "关注" || i.folder === "Following")
        : items.filter((i) => i.folder === "个人主页");
  return (
    <div className="catalog-skin tiktok-ui">
      <Header p={p} />
      <div className="tiktok-top">
        <button
          className={tab === "Following" ? "selected" : ""}
          onClick={() => setTab("Following")}
        >
          Following
        </button>
        <button
          className={tab === "For You" ? "selected" : ""}
          onClick={() => setTab("For You")}
        >
          For You
        </button>
      </div>
      <div className="vertical-feed">
        {list.map((i) => (
          <VerticalVideo key={i.id} p={p} item={i} />
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["For You", "Following", "Profile"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function NetflixSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [saved, setSaved] = useSkinState<string[]>(p, "saved", []);
  const list =
    tab === "我的片单"
      ? items.filter((i) => i.favorite || saved.includes(i.id))
      : items;
  const featured = list[0];
  return (
    <div className="catalog-skin netflix-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {featured && tab === "首页" && (
          <div className="netflix-feature">
            <Media item={featured} />
            <div>
              <strong>{featured.title}</strong>
              <small>
                {meta(featured, "year")} · {meta(featured, "genre")} ·{" "}
                {meta(featured, "duration")}
              </small>
              <button onClick={() => p.onItem(featured)}>
                <Play size={16} />
                播放 / 详情
              </button>
              <button
                onClick={() =>
                  setSaved(
                    saved.includes(featured.id)
                      ? saved.filter((id) => id !== featured.id)
                      : [...saved, featured.id],
                  )
                }
              >
                {saved.includes(featured.id) ? (
                  <Check size={16} />
                ) : (
                  <Plus size={16} />
                )}
                我的片单
              </button>
            </div>
          </div>
        )}
        {groupItems(list, "影片").map((g) => (
          <section className="netflix-shelf" key={g}>
            <h3>{g}</h3>
            <div>
              {list
                .filter((i) => (i.folder || "影片") === g)
                .map((i) => (
                  <button key={i.id} onClick={() => p.onItem(i)}>
                    <Media item={i} />
                    <strong>{i.title}</strong>
                  </button>
                ))}
            </div>
          </section>
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "我的片单"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Bookmark />]}
      />
    </div>
  );
}

