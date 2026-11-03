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
import { useEffect, useState } from "react";
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
      <div className="bili-home-scroll">
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
        {tab === "搜索" && <div className="bili-searchbox"><SearchBox value={q} set={setQ} /></div>}
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
  const uploadsPlaylist = "UU5ieWR5T4WulmNLXQ8-wiDw";
  const [tab, setTab] = useSkinState<string>(p, "monster-youtube-tab", "首页");
  const [query, setQuery] = useSkinState<string>(p, "monster-youtube-search", "");
  const [playingId, setPlayingId] = useSkinState<string>(p, "monster-youtube-playing", "");
  const [showUploads, setShowUploads] = useSkinState<boolean>(p, "monster-youtube-uploads", false);
  const [playerOpen, setPlayerOpen] = useSkinState<boolean>(p, "monster-youtube-player-open", false);
  const videos = [
    { id: "Yaak5SjAcgc", title: "五月天-後青春期的詩 Guitar Version", views: "9.2万次观看", age: "6年前", duration: "2:27" },
    { id: "bST9i4if280", title: "五月天-花 Electric Guitar Version", views: "10万次观看", age: "6年前", duration: "2:29" },
    { id: "mFUk8iq-WE0", title: "五月天-盛夏光年 Mayday live in the sky Monster solo", views: "5.6万次观看", age: "6年前", duration: "1:26" },
    { id: "", title: "超犀利趴11彩排側拍", views: "3万次观看", age: "6年前", duration: "0:33" },
    { id: "Qc5RMGQLEFU", title: "五月天-孫悟空 Mayday live in the sky Monster solo", views: "7.1万次观看", age: "6年前", duration: "1:19" },
    { id: "lTI8bJNkF3M", title: '五月天 "Do you ever shine" monster EG', views: "18万次观看", age: "10年前", duration: "4:35" },
    { id: "1fdO3ZqqKRM", title: "五月天-最重要的小事 monster EG", views: "26万次观看", age: "11年前", duration: "3:02" },
    { id: "fNucpS5Seg8", title: "五月天-傷心的人別聽慢歌 monster EG", views: "32万次观看", age: "12年前", duration: "3:52" },
    { id: "1G8h2gruylE", title: "五月天-入陣曲 monster EG ver.", views: "36万次观看", age: "12年前", duration: "2:45" },
    { id: "0weW-oPZFkQ", title: "五月天-三個傻瓜 by monster", views: "37万次观看", age: "14年前", duration: "4:18" },
    { id: "", title: "五月天-歪腰 by monster", views: "20万次观看", age: "14年前", duration: "3:11" },
    { id: "Kqy19iaDG08", title: "突然好想你 2010", views: "4.2万次观看", age: "15年前", duration: "4:37" },
    { id: "VpBpYlgCqtg", title: "離開地球表面", views: "36万次观看", age: "16年前", duration: "4:37" },
    { id: "IMW54yf7DjI", title: "抓狂吉他", views: "16万次观看", age: "16年前", duration: "4:01" },
    { id: "tgGWuMdVuTQ", title: "知足吉他", views: "19万次观看", age: "16年前", duration: "5:20" },
    { id: "", title: "rain", views: "3.3万次观看", age: "16年前", duration: "2:31" },
    { id: "", title: "cola留下來.mp4", views: "5.1万次观看", age: "16年前", duration: "2:57" },
  ];
  const filtered = videos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="catalog-skin youtube-ui" style={{ background: "#fff", color: "#0f0f0f" }}>
      <div style={{ minHeight: 58, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #eee", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 21, letterSpacing: "-1px", whiteSpace: "nowrap" }}><span style={{ background: "#f00", color: "#fff", borderRadius: 7, padding: "3px 7px", fontSize: 15 }}>▶</span>YouTube</div>
        <button onClick={() => { setTab("全部视频"); setShowUploads(true); setPlayingId(""); }} style={{ border: 0, background: "transparent", color: "#333", fontSize: 13, whiteSpace: "nowrap" }}>全部视频 ↗</button>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#c9cdd0", color: "#fff", display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0 }}>我</div>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 9, borderBottom: "1px solid #f3f3f3" }}>
        <div style={{ flex: 1, minWidth: 0 }}><SearchBox value={query} set={setQuery} /></div>
        <button aria-label="搜索" onClick={() => setTab("全部视频")} style={{ width: 40, height: 40, borderRadius: "50%", border: 0, background: "#f2f2f2", color: "#222", fontSize: 17 }}>⌕</button>
      </div>
      <div className="catalog-scroll">
        <div style={{ margin: "14px 14px 12px", minHeight: 112, borderRadius: "0 0 22px 22px", background: "linear-gradient(110deg,#333,#666)", color: "#fff", padding: "24px 20px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <strong style={{ fontSize: 25, lineHeight: 1.2 }}>Mayday Monster</strong>
          <span style={{ color: "#e1e1e1", fontSize: 14, marginTop: 7 }}>五月天怪獸 · 官方 YouTube 頻道</span>
        </div>
        <div style={{ padding: "8px 18px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#222", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 26, flexShrink: 0 }}>M</div>
          <div style={{ flex: 1, minWidth: 0 }}><strong style={{ fontSize: 18 }}>Mayday Monster</strong><div style={{ color: "#606060", fontSize: 12, marginTop: 3 }}>@monsterbalaja531</div></div>
          <button onClick={() => { setTab("全部视频"); setShowUploads(true); setPlayingId(""); }} style={{ background: "#f2f2f2", color: "#111", padding: "10px 14px", borderRadius: 22, border: 0, fontSize: 12, whiteSpace: "nowrap" }}>查看频道</button>
        </div>
        <div className="youtube-chips" style={{ padding: "0 14px 14px" }}>
          {["首页", "全部视频"].map(name => <button key={name} className={tab === name ? "selected" : ""} onClick={() => { setTab(name); if (name === "全部视频") { setShowUploads(true); setPlayingId(""); } else { setShowUploads(false); } }}>{name}</button>)}
        </div>
        <div style={{ padding: "2px 14px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <strong style={{ fontSize: 16 }}>怪獸的所有公开视频</strong>
          <button onClick={() => { setShowUploads(true); setPlayingId(""); setTab("全部视频"); setPlayerOpen(true); }} style={{ border: 0, background: "transparent", color: "#333", fontSize: 12, whiteSpace: "nowrap" }}>完整播放列表 ↗</button>
        </div>
        <div aria-hidden="true" style={{ height: 0, overflow: "hidden" }} />
        <div style={{ padding: "0 12px 14px" }}>
          {filtered.map(v => <button key={v.title} onClick={(event) => { event.preventDefault(); event.stopPropagation(); if (v.id) { setPlayingId(v.id); setShowUploads(false); setTab("首页"); setPlayerOpen(true); } else { setShowUploads(true); setPlayingId(""); setTab("全部视频"); setPlayerOpen(true); } }} style={{ display: "flex", gap: 11, marginBottom: 14, color: "inherit", background: "transparent", border: 0, padding: 0, width: "100%", textAlign: "left", alignItems: "flex-start" }}>
            <div style={{ position: "relative", width: "43%", flexShrink: 0, aspectRatio: "16 / 9", borderRadius: 9, overflow: "hidden", background: "#e8e8e8" }}>
              {v.id ? <img src={"https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg"} alt={v.title + " 封面"} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", alignContent: "center", gap: 6, color: "#fff", background: "linear-gradient(135deg,#171923,#424b5b)", fontSize: 12 }}><span style={{ fontSize: 24 }}>▶</span><strong>Mayday Monster</strong><span>播放官方上传列表</span></div>}
              <span style={{ position: "absolute", right: 5, bottom: 5, background: "rgba(0,0,0,.8)", color: "#fff", borderRadius: 4, padding: "2px 4px", fontSize: 11 }}>{v.duration}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{v.title}</div>
              <div style={{ color: "#606060", fontSize: 12, marginTop: 6 }}>Mayday Monster</div>
              <div style={{ color: "#606060", fontSize: 12, marginTop: 5 }}>{v.views} · {v.age}</div>
            </div>
            <span style={{ fontSize: 20, lineHeight: 1 }}>⋮</span>
          </button>)}
          <button onClick={() => { setShowUploads(true); setPlayingId(""); setTab("全部视频"); setPlayerOpen(true); }} style={{ display: "block", background: "#f2f2f2", color: "#111", textAlign: "center", border: 0, borderRadius: 22, padding: 11, width: "100%", fontSize: 13 }}>查看 Mayday Monster 全部上传视频</button>
        </div>
      </div>
      {playerOpen && <div className="youtube-player-overlay" role="dialog" aria-modal="true" aria-label="视频播放器">
        <button className="youtube-player-backdrop" aria-label="关闭播放器" onClick={() => setPlayerOpen(false)} />
        <div className="youtube-player-modal">
          <div className="youtube-player-modal-top">
            <strong>{showUploads ? "Mayday Monster · 全部上传视频" : (videos.find(v => v.id === playingId)?.title || "Mayday Monster")}</strong>
            <button aria-label="关闭播放器" onClick={() => setPlayerOpen(false)}>×</button>
          </div>
          <div className="youtube-player-frame" style={{ display: "block", position: "relative", width: "100%", minWidth: 0, maxWidth: "100%", aspectRatio: "16 / 9", margin: 0, padding: 0, overflow: "hidden", background: "#000", boxSizing: "border-box", flex: "none" }}>
            <iframe title={showUploads ? "Mayday Monster 全部上传视频" : "Mayday Monster 视频播放"} src={showUploads ? "https://www.youtube-nocookie.com/embed/videoseries?list=" + uploadsPlaylist : "https://www.youtube-nocookie.com/embed/" + (playingId || videos[0].id) + "?autoplay=1&rel=0"} style={{ display: "block", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", minWidth: "100%", maxWidth: "100%", margin: 0, padding: 0, border: 0, background: "#000", boxSizing: "border-box" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          </div>
          <div className="youtube-player-modal-bottom">正在 App 内播放</div>
        </div>
      </div>}
      <Tabs tabs={["首页", "Shorts", "我"]} value={tab === "全部视频" ? "首页" : tab} set={v => setTab(v === "首页" ? "全部视频" : v)} icons={[<Home />, <Video />, <User />]} />
    </div>
  );
}
export function BilibiliSkin(p: Props) {
  const { tab, setTab, q, setQ } = useContent(p, "首页");
  const [category, setCategory] = useState("推荐");
  const [featuredBvid, setFeaturedBvid] = useState("BV1xNMvzLE3v");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const splashSrc = import.meta.env.BASE_URL + "assets/bilibili-splash.jpg";
  const concerts = [
    {
      bvid: "BV1xNMvzLE3v",
      title: "【官方4K】五月天 2025 线上跨年演唱会 MAYDAY FLY TO 2025",
      year: "2025",
      duration: "01:50:26",
      cover: "https://papiin.com/upload/works/0bac6009d61d3fc41ee0647c1728d29d.png",
    },
    {
      bvid: "BV1BpMqzrEyJ",
      title: "【官方4K】五月天 线上跨年演唱会 诺亚方舟十周年特别版 MAYDAY FLY TO 2023",
      year: "2023",
      duration: "01:28:39",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d9/6e/5b/d96e5b27-9d31-4ac1-1bd0-cd057ed64ace/4710616566819.jpg/1200x1200bb.jpg",
    },
    {
      bvid: "BV1JRNvzcEgr",
      title: "【官方4K】五月天 陪你跨年演唱会 MAYDAY FLY TO 2022",
      year: "2022",
      duration: "01:10:45",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/9c/e5/88/9ce5885a-6e67-46fc-f6e3-fcd6d2e63afb/1.mayday-2022-_4000x4000.jpg/1200x1200bb.jpg",
    },
    {
      bvid: "BV1d3NJz5EeF",
      title: "【官方4K】五月天 好好好想见到你 MAYDAY FLY TO 2021 跨年演唱会",
      year: "2021",
      duration: "48:32",
      cover: "https://n.sinaimg.cn/ent/transform/460/w630h630/20201230/7738-kfxsuvx0385959.png",
    },
    {
      bvid: "BV1wKK8zpEKa",
      title: "【官方4K修复】五月天 D.N.A 创造演唱会 MAYDAY D.N.A WORLD TOUR IN LIVE",
      year: "D.N.A",
      duration: "02:37:06",
      cover: "https://is2-ssl.mzstatic.com/image/thumb/Music49/v4/7a/a7/2a/7aa72ab3-c698-2526-7cc5-048cc427312c/BD0024-_D.N.A_LIVE.jpg/1200x1200bb.jpg",
    },
    {
      bvid: "BV1jpKRzmEWC",
      title: "【官方4K修复】五月天 十万人・出头天演唱会 IN THE SKY OF 100000 YOU & MAYDAY LIVE",
      year: "十万人・出头天",
      duration: "01:22:29",
      cover: "https://www.5music.com.tw/cdpic/zn2/69202411298538.jpg",
    },
  ];
  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2500);
    return () => window.clearTimeout(timer);
  }, []);
  const activeConcert =
    concerts.find((video) => video.bvid === featuredBvid) || concerts[0];
  const visibleConcerts = concerts.filter((video) =>
    (video.title + video.year).toLowerCase().includes(q.toLowerCase()),
  );
  const openConcert = (bvid: string) => {
    setFeaturedBvid(bvid);
    setPlayerOpen(true);
  };
  return (
    <div className="catalog-skin bilibili-ui">
      {showSplash && (
        <div className="bili-splash">
          <img
            className="bili-splash-image"
            src={splashSrc}
            alt="哔哩哔哩开屏动画"
            loading="eager"
            decoding="async"
          />
        </div>
      )}
      <div className="bili-topbar">
        <Avatar name={p.owner || "我"} />
        <SearchBox value={q} set={setQ} />
        <button aria-label="游戏中心"><Compass size={22} /></button>
        <button aria-label="消息"><MessageCircle size={22} /></button>
      </div>
      <div className="bili-channel-tabs">
        {["直播", "推荐", "热门", "追番", "影视", "音乐"].map((name) => (
          <button
            key={name}
            className={category === name ? "selected" : ""}
            onClick={() => setCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        {tab === "首页" && (
          <>
            <section className="bili-featured-video">
              <button
                className="bili-featured-poster"
                onClick={() => openConcert(activeConcert.bvid)}
                aria-label={"播放" + activeConcert.title}
              >
                <img
                  src={activeConcert.cover}
                  alt={activeConcert.title + " 视频预览图"}
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
                <span className="bili-featured-play">▶</span>
                <small>{activeConcert.duration}</small>
              </button>
              <div className="bili-featured-meta">
                <strong>{activeConcert.title}</strong>
                <span>相信音乐 · 五月天演唱会 · {activeConcert.duration}</span>
                <button onClick={() => openConcert(activeConcert.bvid)}>
                  点击播放视频 ↗
                </button>
              </div>
            </section>
            <section className="bili-concert-shelf">
              <h3>相信音乐 · 五月天演唱会</h3>
              <div className="bili-concert-list">
                {visibleConcerts.map((video) => (
                  <button
                    key={video.bvid}
                    className="bili-video-card"
                    onClick={() => openConcert(video.bvid)}
                  >
                    <span className="bili-video-cover">
                      <img
                        src={video.cover}
                        alt={video.title + " 视频封面"}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <span className="bili-cover-play">▶</span>
                      <small>{video.duration}</small>
                    </span>
                    <span className="bili-video-copy">
                      <strong>{video.title}</strong>
                      <small>相信音乐 · {video.year}</small>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
        {tab !== "首页" && (
          <div className="bili-empty-state">
            <strong>{tab}</strong>
            <span>这里暂时还没有内容</span>
          </div>
        )}
      </div>
      {playerOpen && (
        <div
          className="bili-player-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="五月天演唱会播放器"
        >
          <div className="bili-player-sheet">
            <div className="bili-player-header">
              <strong>{activeConcert.title}</strong>
              <button
                aria-label="关闭播放器"
                onClick={() => setPlayerOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="bili-player-frame">
              <iframe
                key={activeConcert.bvid}
                src={
                  "https://player.bilibili.com/player.html?bvid=" +
                  activeConcert.bvid +
                  "&page=1&high_quality=1&danmaku=0&autoplay=1"
                }
                title={activeConcert.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="origin"
              />
            </div>
            <div className="bili-player-meta">
              <strong>{activeConcert.title}</strong>
              <span>
                相信音乐 · 五月天演唱会 · {activeConcert.duration}
              </span>
              <a
                href={"https://www.bilibili.com/video/" + activeConcert.bvid + "/"}
                target="_blank"
                rel="noreferrer"
              >
                如果播放器无法加载，点此打开 B 站原视频 ↗
              </a>
            </div>
            <div className="bili-player-related">
              <strong>更多五月天演唱会</strong>
              {concerts
                .filter((video) => video.bvid !== activeConcert.bvid)
                .map((video) => (
                  <button
                    key={video.bvid}
                    onClick={() => setFeaturedBvid(video.bvid)}
                  >
                    <img
                      src={video.cover}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span>{video.title}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
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

