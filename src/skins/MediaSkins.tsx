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
  const { q, setQ, items } = useContent(p, "发现");
  const [tab, setTab] = useSkinState<string>(p, "netease-tab-v1", "发现");
  const [subPage, setSubPage] = useSkinState<string>(p, "netease-page-v1", "");
  const [queryMode, setQueryMode] = useSkinState<boolean>(p, "netease-search-open-v1", false);
  const [favorites, setFavorites] = useSkinState<string[]>(p, "netease-favorites-v1", []);
  const [recent, setRecent] = useSkinState<string[]>(p, "netease-recent-v1", []);
  const [playingId, setPlayingId] = useSkinState<string>(p, "netease-playing-v1", "");
  const [playerOpen, setPlayerOpen] = useSkinState<boolean>(p, "netease-player-open-v1", false);
  const [playMode, setPlayMode] = useSkinState<string>(p, "netease-play-mode-v1", "列表循环");
  const [track, setTrack] = useTrack(p, items);
  const playable = items.filter(i => i.kind === "audio" && safeMedia(i.media));
  const library = items.filter(i => i.kind === "audio" || i.folder || i.meta?.album);
  const filtered = items.filter(i => (i.title + " " + i.sender + " " + i.body + " " + meta(i, "album")).toLowerCase().includes(q.toLowerCase()));
  const current = items.find(i => i.id === playingId) || track || playable[0];
  const pick = (item: Item) => {
    setPlayingId(item.id);
    setTrack(item);
    setRecent(old => [item.id, ...old.filter(id => id !== item.id)].slice(0, 30));
    setPlayerOpen(true);
  };
  const next = (direction: number) => {
    if (!items.length) return;
    const index = Math.max(0, items.findIndex(i => i.id === current?.id));
    const target = items[(index + direction + items.length) % items.length];
    pick(target);
  };
  const toggleFavorite = (id: string) => setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const card = (title: string, subtitle: string, symbol: string, action: () => void, color = "#e8b9b5") => (
    <button key={title} onClick={action} style={{ minWidth: 0, textAlign: "left", border: 0, padding: 0, background: "transparent", color: "#252525" }}>
      <span style={{ display: "grid", placeItems: "center", width: "100%", aspectRatio: "1", borderRadius: 10, background: color, color: "#fff", fontSize: 27, fontWeight: 700 }}>{symbol}</span>
      <strong style={{ display: "block", fontSize: 11, lineHeight: 1.35, marginTop: 6 }}>{title}</strong>
      <small style={{ display: "block", color: "#999", fontSize: 9, marginTop: 3 }}>{subtitle}</small>
    </button>
  );
  const row = (item: Item, index: number) => (
    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", borderBottom: "1px solid #f2f2f2" }}>
      <button onClick={() => pick(item)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, border: 0, background: "transparent", color: "#222", textAlign: "left" }}>
        <span style={{ color: "#aaa", width: 16, fontSize: 11 }}>{String(index + 1).padStart(2, "0")}</span>
        <span style={{ width: 42, height: 42, borderRadius: 5, background: "#f1e3e1", display: "grid", placeItems: "center", color: "#d64b48", flexShrink: 0 }}><Music size={19}/></span>
        <span style={{ minWidth: 0, flex: 1 }}><strong style={{ display: "block", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</strong><small style={{ display: "block", color: "#999", fontSize: 10, marginTop: 4 }}>{item.sender}{meta(item, "album") ? " · " + meta(item, "album") : ""}</small></span>
      </button>
      <button aria-label="收藏歌曲" onClick={() => toggleFavorite(item.id)} style={{ border: 0, background: "transparent", color: favorites.includes(item.id) ? "#d94b48" : "#aaa", padding: 5 }}><Heart size={17} fill={favorites.includes(item.id) ? "currentColor" : "none"}/></button>
      <button aria-label="歌曲详情" onClick={() => p.onItem(item)} style={{ border: 0, background: "transparent", color: "#999", padding: 5 }}>···</button>
    </div>
  );
  const sectionTitle = (title: string, action?: () => void) => <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 14px 10px" }}><strong style={{ fontSize: 16 }}>{title}</strong>{action && <button onClick={action} style={{ border: 0, background: "transparent", color: "#999", fontSize: 11 }}>更多 ›</button>}</div>;
  return (
    <div className="catalog-skin netease-ui" style={{ background: "#fff", color: "#222", position: "relative", fontFamily: "-apple-system,BlinkMacSystemFont,'Microsoft YaHei',sans-serif" }}>
      <div style={{ height: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 13px", borderBottom: "1px solid #f3f3f3", flexShrink: 0 }}>
        {subPage ? <button onClick={() => setSubPage("")} style={{ border: 0, background: "transparent", fontSize: 22 }}>‹</button> : <button onClick={() => setQueryMode(!queryMode)} style={{ border: 0, background: "transparent", color: "#555" }}><Search size={21}/></button>}
        {queryMode ? <div style={{ flex: 1 }}><SearchBox value={q} set={setQ} placeholder="搜索歌曲、歌手、专辑"/></div> : <strong style={{ flex: 1, textAlign: "center", fontSize: 16 }}>{subPage || "网易云音乐"}</strong>}
        <button onClick={() => setSubPage("消息")} style={{ border: 0, background: "transparent", color: "#555" }}><MessageCircle size={20}/></button>
      </div>
      <div className="catalog-scroll" style={{ background: "#fff" }}>
        {subPage === "" && tab === "发现" && !queryMode && <>
          <div style={{ padding: "13px 14px 8px", display: "flex", gap: 10, overflowX: "auto" }}>
            {["个性推荐","专属订制","歌单","排行榜","有声书","数字专辑"].map((x,i)=><button key={x} onClick={() => setSubPage(x)} style={{ flexShrink: 0, border: 0, background: "transparent", color: i===0?"#d94b48":"#777", fontWeight: i===0?700:400, fontSize: 12 }}>{x}</button>)}
          </div>
          <div style={{ margin: "8px 13px 14px", padding: "17px 16px", borderRadius: 12, color: "#fff", background: "linear-gradient(115deg,#c94b4b,#ed9c91)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><small style={{ opacity: .85 }}>每日为你精选</small><strong style={{ display: "block", fontSize: 21, marginTop: 6 }}>每日推荐</strong><small style={{ display: "block", marginTop: 4 }}>根据你的音乐口味生成</small></div><button onClick={() => setSubPage("每日推荐")} style={{ border: "1px solid #ffffffaa", borderRadius: 20, color: "#fff", background: "transparent", padding: "7px 13px" }}>查看 ›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, padding: "0 13px 8px" }}>
            {card("私人 FM","随心聆听","♫",()=>setSubPage("私人 FM"),"#d85c5a")}
            {card("每日推荐","每日更新","日",()=>setSubPage("每日推荐"),"#e7a08e")}
            {card("排行榜","热门榜单","榜",()=>setSubPage("排行榜"),"#d98c84")}
            {card("歌单广场","发现好音乐","单",()=>setSubPage("歌单广场"),"#c77c79")}
          </div>
          {sectionTitle("推荐歌单",()=>setSubPage("歌单广场"))}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, padding: "0 13px" }}>
            {["今日精选","华语流行","深夜听歌"].map((x,i)=>card(x,"根据你的喜好推荐",["♫","♪","☾"][i],()=>setSubPage(x),["#d8aaa5","#b8a9a4","#8f8995"][i]))}
          </div>
          {sectionTitle("歌曲推荐",()=>setSubPage("全部歌曲"))}
          {items.slice(0,8).map(row)}
          {!items.length && <div style={{ padding: "10px 16px 25px", color: "#999", fontSize: 11, lineHeight: 1.7 }}>这里会展示你的推荐歌曲。接入官方授权数据后，将显示真实推荐内容；目前可以先体验界面和本地音乐库。</div>}
        </>}
        {subPage !== "" && subPage !== "消息" && <>
          <div style={{ margin: 14, padding: 15, borderRadius: 12, background: "linear-gradient(120deg,#d45b58,#f0b5a9)", color: "white" }}><strong style={{ fontSize: 20 }}>{subPage}</strong><p style={{ fontSize: 11, opacity: .9 }}>发现喜欢的音乐，让每一次播放都有惊喜</p></div>
          {(subPage === "我的喜欢" ? items.filter(i => favorites.includes(i.id)) : subPage === "最近播放" ? recent.map(id=>items.find(i=>i.id===id)).filter(Boolean) as Item[] : subPage === "全部歌曲" || subPage === "每日推荐" || subPage === "私人 FM" || subPage === "排行榜" || subPage === "歌单广场" ? items : items.filter(i => (i.folder || "").includes(subPage))).map(row)}
          {!items.length && <p style={{ textAlign: "center", color: "#999", padding: 30, fontSize: 12 }}>暂无歌曲。官方音乐数据授权接入后将在这里显示。</p>}
        </>}
        {subPage === "消息" && <div style={{ padding: 30, textAlign: "center", color: "#999" }}>暂时没有新消息</div>}
        {queryMode && <>{sectionTitle(q ? "搜索结果" : "热门搜索")}{(q ? filtered : items.slice(0,8)).map(row)}{!items.length && <div style={{ padding: 25, color: "#999", textAlign: "center", fontSize: 12 }}>搜索结果将在接入官方音乐数据后显示</div>}</>}
        {tab === "我的" && subPage === "" && !queryMode && <>
          <div style={{ margin: 14, padding: 17, borderRadius: 12, background: "#f7eeee", display: "flex", alignItems: "center", gap: 12 }}><Avatar name={p.owner || "我"}/><div><strong style={{ fontSize: 16 }}>{p.owner || "我的音乐"}</strong><small style={{ display: "block", color: "#999", marginTop: 5 }}>听见好音乐</small></div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, padding: "0 14px 12px" }}>
            {card("我的喜欢",favorites.length+" 首歌曲","♥",()=>setSubPage("我的喜欢"),"#d65c5a")}
            {card("最近播放",recent.length+" 首歌曲","◷",()=>setSubPage("最近播放"),"#bd8b83")}
            {card("本地音乐",library.length+" 首歌曲","♫",()=>setSubPage("本地音乐"),"#a78b89")}
          </div>
          {sectionTitle("我的歌单")}
          {groupItems(library,"我的音乐").map(g=><button key={g} onClick={()=>setSubPage(g)} style={{ display:"block", width:"100%", padding:"13px 15px", textAlign:"left", border:0, borderBottom:"1px solid #f2f2f2", background:"white", color:"#333" }}>♫　{g}　›</button>)}
          {sectionTitle("收藏的歌曲")}
          {items.filter(i=>favorites.includes(i.id)).map(row)}
        </>}
      </div>
      {current && <button onClick={() => setPlayerOpen(true)} style={{ display:"flex", alignItems:"center", gap:9, minHeight:53, padding:"5px 12px", borderTop:"1px solid #eee", background:"#fff", textAlign:"left", color:"#222", flexShrink:0 }}>
        <span style={{ width:38,height:38,borderRadius:6,background:"#f0d8d5",display:"grid",placeItems:"center",color:"#d34d4a" }}><Music size={18}/></span>
        <span style={{ flex:1,minWidth:0 }}><strong style={{ display:"block",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{current.title}</strong><small style={{ color:"#999",fontSize:9 }}>{current.sender}</small></span>
        <button onClick={e=>{e.stopPropagation(); if(current.kind==="audio") setTrack(current); else setPlayerOpen(true);}} style={{ border:0,background:"transparent",color:"#d44c49" }}><Play size={20}/></button>
      </button>}
      <Tabs tabs={["发现","我的"]} value={tab} set={t=>{setTab(t);setSubPage("");setQueryMode(false);}} icons={[<Compass/>,<User/>]}/>
      {playerOpen && current && <div role="dialog" aria-modal="true" style={{ position:"absolute",inset:0,zIndex:30,background:"linear-gradient(160deg,#f5e9e7,#fff 65%)",display:"flex",flexDirection:"column",padding:"12px 18px",boxSizing:"border-box" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",height:35 }}><button onClick={()=>setPlayerOpen(false)} style={{border:0,background:"transparent",fontSize:22}}>⌄</button><strong style={{fontSize:12}}>正在播放</strong><button onClick={()=>toggleFavorite(current.id)} style={{border:0,background:"transparent",color:favorites.includes(current.id)?"#d34d4a":"#777"}}><Heart fill={favorites.includes(current.id)?"currentColor":"none"}/></button></div>
        <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:0 }}>
          <div style={{ width:"min(72vw,260px)",aspectRatio:"1",borderRadius:12,background:"linear-gradient(145deg,#c85b57,#e6b1a8)",display:"grid",placeItems:"center",color:"white",boxShadow:"0 12px 30px #b85a5540" }}><Music size={70}/></div>
          <h2 style={{fontSize:19,margin:"22px 0 6px",textAlign:"center"}}>{current.title}</h2><p style={{color:"#888",fontSize:12,margin:0}}>{current.sender} · {meta(current,"album")}</p>
          <div style={{marginTop:30,color:"#888",fontSize:12,textAlign:"center",lineHeight:2}}>♪　歌词将在授权歌词数据接入后同步显示　♪</div>
        </div>
        {current.kind==="audio" && safeMedia(current.media) ? <AudioPlayer p={p} item={current}/> : <div style={{fontSize:10,color:"#999",textAlign:"center",padding:8}}>此歌曲尚无可播放的授权音频</div>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",padding:"16px 0 28px",color:"#333"}}>
          <button onClick={()=>setPlayMode(playMode==="列表循环"?"随机播放":playMode==="随机播放"?"单曲循环":"列表循环")} style={{border:0,background:"transparent",fontSize:10,color:"#888"}}>{playMode}</button>
          <button onClick={()=>next(-1)} style={{border:0,background:"transparent"}}><SkipForward size={23} style={{transform:"rotate(180deg)"}}/></button>
          <button onClick={()=>current.kind==="audio"&&safeMedia(current.media)?setTrack(current):setPlayerOpen(false)} style={{border:0,background:"#d84e4b",color:"white",width:52,height:52,borderRadius:"50%",display:"grid",placeItems:"center"}}><Play size={23}/></button>
          <button onClick={()=>next(1)} style={{border:0,background:"transparent"}}><SkipForward size={23}/></button>
          <button onClick={()=>setSubPage("播放列表")} style={{border:0,background:"transparent"}}>☷</button>
        </div>
      </div>}
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
  const splashSrc = import.meta.env.BASE_URL + "assets/bilibili-splash.jpg?v=20261104";
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

