export { WeatherSkin, HealthSkin } from "./CalibratedSystemApps";
import { AudioPlayer, useTrack } from "../audio";
import { useSkinState } from "../skinState";
import {
  Calendar,
  Camera,
  AlarmClock,
  Timer,
  Play,
  Pause,
  Trash2,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Folder,
  Globe,
  Grid,
  Heart,
  Image,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Plus,
  Share2,
  Music,
  Phone,
  Search,
  SkipForward,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { openStreetMapEmbed, openStreetMapLink } from "../deviceLocation";
import { download } from "../io";
import { safeMedia, type Item } from "../schema";
import {
  Add,
  Avatar,
  Empty,
  groupItems,
  Header,
  Media,
  meta,
  Row,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
const seededGalleryPhotos: Item[] = [
  { id: "mayday-photo-01", title: "長沙演唱會・五人同台", body: "五月天《人生無限公司》長沙場，五個人一起在舞台上。", richText: "", meta: { credit: "大梦谭 · Wikimedia Commons · CC BY 2.5" }, time: "2026-11-03 20:00", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/6/6d/-%E4%BA%94%E6%9C%88%E5%A4%A9_%E4%BA%BA%E7%94%9F%E6%97%A0%E9%99%90%E5%85%AC%E5%8F%B8-%E9%95%BF%E6%B2%99_%284%29.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: true, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-02", title: "演唱會謝幕", body: "演出結束後，五個人肩並肩站在一起。", richText: "", meta: { credit: "大梦谭 · Wikimedia Commons · CC BY 2.5" }, time: "2026-11-03 19:07", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/0/00/-%E4%BA%94%E6%9C%88%E5%A4%A9_%E4%BA%BA%E7%94%9F%E6%97%A0%E9%99%90%E5%85%AC%E5%8F%B8-%E9%95%BF%E6%B2%99_%286%29.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-03", title: "藍色舞台上的五月天", body: "藍色燈光下的現場演出，怪獸抱著吉他站在舞台中央。", richText: "", meta: { credit: "大梦谭 · Wikimedia Commons · CC BY 2.5" }, time: "2026-11-03 18:14", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/3/36/-%E4%BA%94%E6%9C%88%E5%A4%A9_%E4%BA%BA%E7%94%9F%E6%97%A0%E9%99%90%E5%85%AC%E5%8F%B8-%E9%95%BF%E6%B2%99_%288%29.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-04", title: "紅樓記者會", body: "五月天五位成員一起出席活動，難得的早期合照。", richText: "", meta: { credit: "Wikimedia Commons · CC BY-SA 3.0" }, time: "2026-11-03 17:21", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/9/99/Mayday_on_Mercuries_Life_press_conference_at_Red_House_Theater_20131125.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-05", title: "活動現場合照", body: "記者會現場，台下好多相機都對著五月天。", richText: "", meta: { credit: "Wikimedia Commons · CC BY-SA 3.0" }, time: "2026-11-02 16:28", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Mercuries_Life_press_conference_on_Red_House_Theater_20131125_1.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-06", title: "和歌迷見面", body: "活動現場的五月天，這種老照片也很有紀念感。", richText: "", meta: { credit: "Wikimedia Commons · CC BY-SA 3.0" }, time: "2026-11-02 15:35", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Mercuries_Life_press_conference_on_Red_House_Theater_20131125_2.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-07", title: "5525 廣州演唱會", body: "怪獸穿著紅色上衣拿著黑色吉他，演出中還向歌迷揮手。", richText: "", meta: { credit: "TimWu007 · Wikimedia Commons · CC BY-SA 4.0" }, time: "2026-11-02 14:42", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Monster%2C_Mayday_5525_Live_Tour_in_Guangzhou_20251212.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: true, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-08", title: "五月天早期合照", body: "好青澀的五月天！這張要好好收藏。", richText: "", meta: { credit: "Wikimedia Commons · CC BY-SA 3.0" }, time: "2026-11-02 13:49", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/3/37/X06Taiwan_20061105-35.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-09", title: "怪獸早期近照", body: "早期活動上的怪獸，還是熟悉的眼神。", richText: "", meta: { credit: "Wikimedia Commons · CC BY-SA 3.0" }, time: "2026-11-01 12:56", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/3/3c/X06Taiwan_20061105-36_%28cropped%29.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-10", title: "五月天青春紀念", body: "五個人一起出席活動的早期照片。", richText: "", meta: { credit: "Wikimedia Commons · CC BY-SA 3.0" }, time: "2026-11-03 16:10", sender: "我", avatar: "", kind: "image", media: "https://media.vogue.com.tw/photos/6060cc0db105e576c7a0f6f5/master/w_1600%2Cc_limit/4.jpeg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-11", title: "和歌迷的合照", body: "活動上與歌迷一起留下的紀念畫面。", richText: "", meta: { credit: "Wikimedia Commons · CC BY-SA 3.0" }, time: "2026-11-03 16:17", sender: "我", avatar: "", kind: "image", media: "https://pgw.udn.com.tw/gw/photo.php?exp=3600&nt=1&sh=0&sw=0&u=https%3A%2F%2Fuc.udn.com.tw%2Fphoto%2F2024%2F09%2F15%2Frealtime%2F30519335.jpg&w=930&x=0&y=0", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-12", title: "怪獸・吉他手", body: "怪獸抱著琥珀色電吉他的舞台瞬間。", richText: "", meta: { credit: "Wikimedia Commons · CC BY-SA 3.0" }, time: "2026-11-03 15:24", sender: "我", avatar: "", kind: "image", media: "https://media.vogue.com.tw/photos/5dfe1adf3226d20008f15b02/master/w_1600%2Cc_limit/%25E4%25BA%2594%25E6%259C%2588%25E5%25A4%25A9%25E6%2580%AA%25E7%258D%25B8.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: true, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-13", title: "回到那一天・台中場", body: "怪獸在《回到那一天》巡演台中場拿著吉他演唱。", richText: "", meta: { credit: "Wikimedia Commons · CC BY-SA 3.0" }, time: "2026-11-03 15:31", sender: "我", avatar: "", kind: "image", media: "https://s.yimg.com/ny/api/res/1.2/sa.TfjshpHhnqm8G08q1XA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTQyNw--/https%3A/s.yimg.com/os/creatr-uploaded-images/2023-05/03a7aba0-fc40-11ed-bfba-da7b62868fd3", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-14", title: "煙火下的怪獸", body: "25 週年演唱會，怪獸在煙火與燈光中彈奏紅色吉他。", richText: "", meta: { credit: "相信音樂 B'in Music" }, time: "2026-11-03 15:38", sender: "我", avatar: "", kind: "image", media: "https://assets.eight.audio/2021/04/%E4%BA%94%E6%9C%88%E5%A4%A9_20210412%EF%BC%885%EF%BC%89.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-15", title: "怪獸的紅色吉他", body: "怪獸在舞台上彈奏紅色電吉他，滿滿現場感。", richText: "", meta: { credit: "大紀元" }, time: "2026-11-03 14:45", sender: "我", avatar: "", kind: "image", media: "https://media.nownews.com/nn_media/thumbnail/2018/01/1534257762-ed798a21e15d2f095f9a06d12bebe519-1200x839.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-16", title: "怪獸揮手打招呼", body: "紅色上衣、黑色吉他，對著台下歌迷露出笑容。", richText: "", meta: { credit: "U Beauty" }, time: "2026-11-03 14:52", sender: "我", avatar: "", kind: "image", media: "https://resource02.ulifestyle.com.hk/ulcms/content/article/image/w600/2026/04/20260421100543_5e8c7e33c9217b9b3d9ef3c0257f5d3070ecc11c.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-17", title: "雨中的演唱會", body: "怪獸拿著透明雨傘在舞台上演出，這個畫面太有電影感。", richText: "", meta: { credit: "Eight无限" }, time: "2026-11-03 14:59", sender: "我", avatar: "", kind: "image", media: "https://i.epochtimes.com/assets/uploads/2016/08/1608291220162382.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-18", title: "怪獸與阿信", body: "阿信和怪獸在演唱會舞台上同框，默契滿滿。", richText: "", meta: { credit: "聯合新聞網" }, time: "2026-11-03 13:06", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/3/37/%E4%BA%94%E6%9C%88%E5%A4%A9-%E6%80%AA%E7%8D%B8_%285247925751%29.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-19", title: "紅色燈光下的怪獸", body: "怪獸抱著紅色吉他，在舞台上投入演奏。", richText: "", meta: { credit: "NOWnews" }, time: "2026-11-03 13:13", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Monster%2C_Mayday_5525_Live_Tour_in_Guangzhou_20251212.jpg", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] },
  { id: "mayday-photo-20", title: "五月天五人同台", body: "五個人一起站在舞台上，身後是滿場歌迷的藍色燈海。", richText: "", meta: { credit: "Yahoo奇摩／鏡週刊" }, time: "2026-11-03 13:20", sender: "我", avatar: "", kind: "image", media: "https://upload.wikimedia.org/wikipedia/commons/d/d9/%E4%BA%94%E6%9C%88%E5%A4%A9%E3%80%8C%E5%9B%9E%E5%88%B0%E9%82%A3%E4%B8%80%E5%A4%A9%E3%80%8D%E5%B7%A1%E8%BF%B4%E6%BC%94%E5%94%B1%E6%9C%83_%E5%8F%B0%E4%B8%AD%E5%A0%B4%EF%BC%8D%E6%80%AA%E7%8D%B8.png", hidden: false, unlock: "", password: "", folder: "五月天", favorite: false, outgoing: false, read: true, likes: 0, comments: [] }
];

export function PhoneSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "最近通话");
  const [digits, setDigits] = useState(""),
    [call, setCall] = useState("");
  const list = tab === "收藏" ? items.filter((i) => i.favorite) : items;
  return (
    <div className="catalog-skin native-phone">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        {tab === "拨号键盘" ? (
          <div className="dialer">
            <output>{digits || "输入号码"}</output>
            <div>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
                (k) => (
                  <button key={k} onClick={() => setDigits((s) => s + k)}>
                    {k}
                    <small>
                      {
                        (
                          {
                            "2": "ABC",
                            "3": "DEF",
                            "4": "GHI",
                            "5": "JKL",
                            "6": "MNO",
                            "7": "PQRS",
                            "8": "TUV",
                            "9": "WXYZ",
                          } as Record<string, string>
                        )[k]
                      }
                    </small>
                  </button>
                ),
              )}
            </div>
            <button
              className="dial-call"
              disabled={!digits}
              aria-label="模拟拨号"
              onClick={() => {
                setCall(digits);
                const i = items.find((i) => meta(i, "number") === digits);
                if (i) p.onRead(i.id);
              }}
            >
              <Phone size={24} />
            </button>
            <button onClick={() => setDigits((s) => s.slice(0, -1))}>
              删除
            </button>
          </div>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            {list.map((i) => (
              <button
                className={`call-row ${meta(i, "status") === "未接" ? "missed" : ""}`}
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <Phone size={17} />
                <span>
                  <strong>{i.title}</strong>
                  <small>
                    {meta(i, "number", i.sender)} ·{" "}
                    {meta(i, "status", "通话记录")}
                  </small>
                </span>
                <time>{i.time.slice(5, 10)}</time>
              </button>
            ))}
            <Empty items={list} />
          </>
        )}
      </div>
      <Tabs
        tabs={["收藏", "最近通话", "通讯录", "拨号键盘"]}
        value={tab}
        set={setTab}
        icons={[<Star />, <Clock />, <Users />, <Grid />]}
      />
      {call && (
        <div className="virtual-call">
          <small>虚拟通话</small>
          <Avatar name={call} />
          <h2>{call}</h2>
          <p>这是作品内的通话模拟</p>
          <button aria-label="挂断" onClick={() => setCall("")}>
            <Phone />
          </button>
        </div>
      )}
    </div>
  );
}
export function ContactsSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "所有联系人");
  return (
    <div className="catalog-skin native-contacts">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>通讯录</h1>
        <SearchBox value={q} set={setQ} />
        <button
          className="contact-self"
          onClick={() => {
            if (items[0]) p.onItem(items[0]);
            else if (p.creator) p.onAdd();
          }}
        >
          <Avatar name={p.owner ?? "我"} />
          <span>
            <strong>{p.owner ?? "我的名片"}</strong>
            <small>我的名片</small>
          </span>
        </button>
        {groupItems(items, "所有联系人").map((g) => (
          <section key={g}>
            <h4 className="native-section">{g}</h4>
            {items
              .filter((i) => (i.folder || "所有联系人") === g)
              .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"))
              .map((i) => (
                <Row
                  key={i.id}
                  item={i}
                  onItem={p.onItem}
                  leading={<Avatar name={i.title} />}
                />
              ))}
          </section>
        ))}
        <Empty items={items} />
      </div>
    </div>
  );
}
type SharedPhotoAlbum = {
  id: string;
  name: string;
  photoIds: string[];
  members: string[];
  comments: string[];
  createdAt: string;
};
export function PhotosSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "图库");
  const galleryItems = [...seededGalleryPhotos, ...items.filter((item) => !seededGalleryPhotos.some((seed) => seed.id === item.id))];
  const [album, setAlbum] = useState("");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [viewerInfoOpen, setViewerInfoOpen] = useState(false);
  const [photoFavorites, setPhotoFavorites] = useSkinState<string[]>(p, "photoFavorites", seededGalleryPhotos.filter((photo) => photo.favorite).map((photo) => photo.id));
  const [sharedRaw, setSharedRaw] = useSkinState<string[]>(p, "sharedAlbums", []);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [activeShared, setActiveShared] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [memberName, setMemberName] = useState("");
  const [commentText, setCommentText] = useState("");
  const sharedAlbums: SharedPhotoAlbum[] = sharedRaw.flatMap((raw) => {
    try {
      const value = JSON.parse(raw) as SharedPhotoAlbum;
      return value && typeof value.id === "string" && typeof value.name === "string" ? [value] : [];
    } catch {
      return [];
    }
  });
  const activeAlbum = sharedAlbums.find((a) => a.id === activeShared);
  const list =
    tab === "收藏"
      ? galleryItems.filter((i) => i.favorite || photoFavorites.includes(i.id))
      : album
        ? galleryItems.filter((i) => (i.folder || "未分类") === album)
        : galleryItems.filter((i) => (i.title + i.body).toLowerCase().includes(q.toLowerCase()));
  const viewerPhoto = viewerIndex === null ? null : list[viewerIndex] || null;
  const togglePhotoFavorite = (photo: Item) => setPhotoFavorites((current) =>
    current.includes(photo.id) ? current.filter((id) => id !== photo.id) : [...current, photo.id],
  );
  const saveAlbums = (next: SharedPhotoAlbum[]) => setSharedRaw(next.map((a) => JSON.stringify(a)));
  const createSharedAlbum = () => {
    const name = newAlbumName.trim();
    if (!name) return;
    const created: SharedPhotoAlbum = {
      id: `shared-${Date.now().toString(36)}`,
      name,
      photoIds: [],
      members: ["我"],
      comments: [],
      createdAt: new Date().toLocaleDateString("zh-CN"),
    };
    saveAlbums([...sharedAlbums, created]);
    setNewAlbumName("");
    setActiveShared(created.id);
  };
  const updateActive = (patch: Partial<SharedPhotoAlbum>) => {
    if (!activeAlbum) return;
    saveAlbums(sharedAlbums.map((a) => a.id === activeAlbum.id ? { ...a, ...patch } : a));
  };
  const addSelectedPhotos = () => {
    if (!activeAlbum || !selectedPhotos.length) return;
    updateActive({ photoIds: [...new Set([...activeAlbum.photoIds, ...selectedPhotos])] });
    setSelectedPhotos([]);
  };
  const addMember = () => {
    const name = memberName.trim();
    if (!activeAlbum || !name || activeAlbum.members.includes(name)) return;
    updateActive({ members: [...activeAlbum.members, name] });
    setMemberName("");
  };
  const addComment = () => {
    const comment = commentText.trim();
    if (!activeAlbum || !comment) return;
    updateActive({ comments: [...activeAlbum.comments, `我：${comment}`] });
    setCommentText("");
  };
  return (
    <div className="catalog-skin native-photos ios27-photos">
      <Header p={p} />
      <div className="catalog-scroll">
        <div className="photos-title-row">
          {activeAlbum ? (
            <button className="photos-back" onClick={() => { setActiveShared(""); setSelectedPhotos([]); }}>
              <ChevronLeft size={21} /> 共享相簿
            </button>
          ) : (
            <span className="photos-library-label">照片图库</span>
          )}
          <h1>{activeAlbum ? activeAlbum.name : album || (tab === "图库" ? "图库" : tab === "收藏" ? "收藏" : tab === "共享" ? "共享相簿" : tab)}</h1>
          {activeAlbum && <span className="photos-shared-count">{activeAlbum.members.length} 位成员</span>}
        </div>
        {activeAlbum ? (
          <div className="shared-album-detail">
            <div className="shared-album-hero">
              <div className="shared-album-hero-art">
                {activeAlbum.photoIds[0] && galleryItems.find((i) => i.id === activeAlbum.photoIds[0]) ? (
                  <Media item={galleryItems.find((i) => i.id === activeAlbum.photoIds[0])!} />
                ) : <Image size={36} />}
              </div>
              <div>
                <strong>{activeAlbum.name}</strong>
                <small>共享相簿 · 创建于 {activeAlbum.createdAt}</small>
                <small>此为模拟器内的本地共享体验</small>
              </div>
            </div>
            <section className="shared-members-panel">
              <div className="shared-section-heading"><strong>成员</strong><span>{activeAlbum.members.length} 人</span></div>
              <div className="shared-members-list">
                {activeAlbum.members.map((member) => (
                  <div key={member} className="shared-member"><Avatar name={member} /><small>{member}</small></div>
                ))}
                <button className="shared-invite-avatar" onClick={() => document.getElementById("shared-member-name")?.focus()} aria-label="邀请成员"><Plus /></button>
              </div>
              <div className="shared-invite-row">
                <input id="shared-member-name" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="输入要邀请的成员昵称" />
                <button onClick={addMember} disabled={!memberName.trim()}>邀请</button>
              </div>
            </section>
            <section className="shared-photos-panel">
              <div className="shared-section-heading"><strong>照片</strong><span>{activeAlbum.photoIds.length} 张</span></div>
              <div className="photo-mosaic">
                {activeAlbum.photoIds.map((id) => {
                  const item = galleryItems.find((i) => i.id === id);
                  return item ? <button key={id} onClick={() => p.onItem(item)}><Media item={item} /></button> : null;
                })}
              </div>
              {!activeAlbum.photoIds.length && <p className="shared-empty">这个共享相簿还没有照片</p>}
              <div className="shared-add-heading"><strong>从图库添加照片</strong><small>点选照片后添加到共享相簿</small></div>
              <div className="photo-mosaic shared-picker">
                {galleryItems.map((item) => (
                  <button key={item.id} className={selectedPhotos.includes(item.id) ? "picked" : ""} onClick={() => setSelectedPhotos((v) => v.includes(item.id) ? v.filter((id) => id !== item.id) : [...v, item.id])}>
                    <Media item={item} />
                    {selectedPhotos.includes(item.id) && <span className="shared-picked-check">✓</span>}
                  </button>
                ))}
              </div>
              <button className="shared-primary-action" disabled={!selectedPhotos.length} onClick={addSelectedPhotos}>添加 {selectedPhotos.length || ""} 张照片</button>
            </section>
            <section className="shared-comments-panel">
              <div className="shared-section-heading"><strong>评论</strong><span>{activeAlbum.comments.length} 条</span></div>
              {activeAlbum.comments.map((comment, index) => <p className="shared-comment" key={index}>{comment}</p>)}
              <div className="shared-comment-compose">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="添加评论…" />
                <button onClick={addComment} disabled={!commentText.trim()}><MessageCircle size={18} /></button>
              </div>
            </section>
          </div>
        ) : tab === "共享" ? (
          <div className="shared-albums-page">
            <div className="shared-albums-intro">
              <div className="shared-albums-icon"><Users size={25} /></div>
              <h2>与家人和朋友共享照片</h2>
              <p>创建共享相簿，邀请成员一起添加照片、视频和评论。</p>
            </div>
            <div className="shared-create-row">
              <input value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} placeholder="新共享相簿名，例如：周末旅行" aria-label="新共享相簿名" />
              <button onClick={createSharedAlbum} disabled={!newAlbumName.trim()}><Plus size={18} /> 新建</button>
            </div>
            <div className="shared-album-list">
              {sharedAlbums.map((shared) => {
                const cover = galleryItems.find((i) => i.id === shared.photoIds[0]);
                return (
                  <button className="shared-album-card" key={shared.id} onClick={() => setActiveShared(shared.id)}>
                    <span className="shared-album-cover">{cover ? <Media item={cover} /> : <Image size={28} />}</span>
                    <span className="shared-album-info"><strong>{shared.name}</strong><small>{shared.photoIds.length} 张照片 · {shared.members.length} 位成员</small></span>
                    <ChevronRight size={18} />
                  </button>
                );
              })}
              {!sharedAlbums.length && <div className="shared-empty-card"><Image size={30} /><strong>还没有共享相簿</strong><small>创建一个相簿，开始和朋友共享回忆</small></div>}
            </div>
            <p className="shared-local-note"><Share2 size={14} /> 共享内容保存在当前浏览器的模拟器存档中，不会向真实 iCloud 或其他设备发送邀请。</p>
          </div>
        ) : tab === "相簿" && !album ? (
          <div className="photos-collections">
            <div className="photos-collection-section">
              <h3>我的相簿</h3>
              <div className="album-grid">
                {groupItems(galleryItems, "未分类").map((g) => (
                  <button key={g} onClick={() => setAlbum(g)}>
                    <Media item={galleryItems.find((i) => (i.folder || "未分类") === g)!} />
                    <strong>{g}</strong>
                    <small>{galleryItems.filter((i) => (i.folder || "未分类") === g).length} 项</small>
                  </button>
                ))}
                <button className="photos-shared-shortcut" onClick={() => setTab("共享")}>
                  <span><Users size={28} /></span><strong>共享相簿</strong><small>{sharedAlbums.length} 个</small>
                </button>
              </div>
            </div>
            <div className="photos-collection-section"><h3>共享</h3><button className="photos-shared-row" onClick={() => setTab("共享")}><Users size={22} /><span><strong>共享相簿</strong><small>与你共享的照片和视频</small></span><ChevronRight /></button></div>
          </div>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            <div className="photo-mosaic">
              {list.map((i, index) => (
                <button aria-label={`查看${i.title}`} key={i.id} onClick={() => { setViewerIndex(index); setViewerInfoOpen(false); }}>
                  <Media item={i} />
                  {(i.favorite || photoFavorites.includes(i.id)) && <Heart size={12} fill="white" />}
                </button>
              ))}
            </div>
            <p className="media-count">{list.length} 个项目</p>
          </>
        )}
        {!activeAlbum && tab !== "共享" && <Empty items={list} />}
      </div>
      {viewerPhoto && (
        <div className="photos-viewer" role="dialog" aria-modal="true" aria-label={viewerPhoto.title}>
          <div className="photos-viewer-top">
            <button aria-label="返回图库" onClick={() => setViewerIndex(null)}><ChevronLeft size={25} /></button>
            <div><strong>{viewerPhoto.time.slice(0, 10).replaceAll("-", "年").replace(/年(\d{2})$/, "月$1日")}</strong><small>{viewerPhoto.time.slice(11, 16)}</small></div>
            <button aria-label="照片信息" onClick={() => setViewerInfoOpen((value) => !value)}>ⓘ</button>
          </div>
          <div className="photos-viewer-image"><Media item={viewerPhoto} /></div>
          {viewerInfoOpen && <div className="photos-viewer-info"><strong>{viewerPhoto.title}</strong><p>{viewerPhoto.body}</p>{viewerPhoto.meta.credit && <small>圖片來源：{viewerPhoto.meta.credit}</small>}</div>}
          <div className="photos-viewer-bottom">
            <button aria-label="上一張" disabled={viewerIndex === 0} onClick={() => { setViewerIndex((value) => value === null ? null : Math.max(0, value - 1)); setViewerInfoOpen(false); }}><ChevronLeft /></button>
            <span>{(viewerIndex ?? 0) + 1} / {list.length}</span>
            <button aria-label="收藏照片" onClick={() => togglePhotoFavorite(viewerPhoto)}><Heart fill={(viewerPhoto.favorite || photoFavorites.includes(viewerPhoto.id)) ? "currentColor" : "none"} /></button>
            <button aria-label="下一張" disabled={viewerIndex === list.length - 1} onClick={() => { setViewerIndex((value) => value === null ? null : Math.min(list.length - 1, value + 1)); setViewerInfoOpen(false); }}><ChevronRight /></button>
          </div>
        </div>
      )}
      <Tabs
        tabs={["图库", "相簿", "共享", "收藏"]}
        value={tab}
        set={(t) => { setTab(t); setAlbum(""); setActiveShared(""); setSelectedPhotos([]); setViewerIndex(null); }}
        icons={[<Image />, <Folder />, <Users />, <Heart />]}
      />
    </div>
  );
}
export function CameraSkin(p: Props) {
  const [mode, setMode] = useState("照片"),
    [index, setIndex] = useState(0);
  const frames = p.items.filter((i) =>
    mode === "视频" ? i.kind === "video" : i.kind !== "video",
  );
  const frame = frames[index % Math.max(frames.length, 1)];
  return (
    <div className="catalog-skin native-camera">
      <Header p={p} />
      <div className="camera-top">
        <span>闪光灯关闭</span>
        <span>{mode === "视频" ? "HD · 30" : "4:3"}</span>
      </div>
      <div className="camera-view">
        {frame ? <Media item={frame} /> : <p>未设置取景画面</p>}
        <div className="camera-grid" />
      </div>
      <div className="camera-mode">
        {["视频", "照片"].map((m) => (
          <button
            className={mode === m ? "selected" : ""}
            key={m}
            onClick={() => {
              setMode(m);
              setIndex(0);
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="camera-controls">
        <button
          aria-label="查看上一画面"
          disabled={!frames.length}
          onClick={() => setIndex((i) => (i + 1) % frames.length)}
        >
          <Image size={24} />
        </button>
        <button
          className="camera-shutter"
          aria-label={p.creator ? "编辑拍摄画面" : "查看拍摄内容"}
          disabled={!p.creator && !frame}
          onClick={() => (p.creator ? p.onAdd() : frame && p.onItem(frame))}
        >
          <span />
        </button>
        <button
          aria-label="切换取景画面"
          disabled={frames.length < 2}
          onClick={() => setIndex((i) => i + 1)}
        >
          <Camera size={24} />
        </button>
      </div>
      <small className="camera-caption">作者设置的虚构取景内容</small>
    </div>
  );
}
export function SafariSkin(p: Props) {
  const [q, setQ] = useState(""),
    [tab, setTab] = useState("书签");
  const items = p.items
    .filter((i) =>
      (i.title + i.body + meta(i, "url"))
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .filter((i) =>
      tab === "书签"
        ? i.favorite || i.folder !== "历史记录"
        : i.folder === "历史记录",
    );
  return (
    <div className="catalog-skin native-safari">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        <div className="safari-favorites">
          {items.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <span>
                <Globe size={28} />
              </span>
              <strong>{i.title}</strong>
              <small>{meta(i, "url")}</small>
            </button>
          ))}
        </div>
        <Empty items={items} label="没有匹配的虚构网页" />
      </div>
      <label className="safari-address">
        <LockKeyhole size={13} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索或输入虚构网址"
          aria-label="地址栏"
          onKeyDown={(e) => {
            if (e.key === "Enter" && items[0]) p.onItem(items[0]);
          }}
        />
        <Search size={16} />
      </label>
      <Tabs
        tabs={["书签", "历史记录"]}
        value={tab}
        set={setTab}
        icons={[<Globe />, <Clock />]}
      />
    </div>
  );
}
export function NotesSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "备忘录");
  const [folder, setFolder] = useState<string | null>(null);
  const list = folder
    ? items.filter((i) => (i.folder || "备忘录") === folder)
    : items;
  return (
    <div className="catalog-skin native-notes">
      <Header p={p} />
      <div className="catalog-scroll">
        <button className="notes-back" onClick={() => setFolder(null)}>
          <Folder size={17} />
          文件夹
        </button>
        <h1>{folder || "所有备忘录"}</h1>
        <SearchBox value={q} set={setQ} />
        {!folder && (
          <div className="note-folders">
            {groupItems(items, "备忘录").map((g) => (
              <button key={g} onClick={() => setFolder(g)}>
                <Folder size={17} />
                {g}
                <small>
                  {items.filter((i) => (i.folder || "备忘录") === g).length}
                </small>
              </button>
            ))}
          </div>
        )}
        <div className="notes-list">
          {list.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <strong>
                {i.password && <LockKeyhole size={12} />} {i.title}
              </strong>
              <p>
                <time>{i.time.slice(5, 10)}</time>{" "}
                {i.password ? "已锁定的备忘录" : i.body.split("\n")[0]}
              </p>
              <small>{i.folder}</small>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <div className="notes-footer">
        <span>{list.length} 则备忘录</span>
        <Add p={p} label="新建备忘录" />
      </div>
    </div>
  );
}
export function CalendarSkin(p: Props) {
  const today = new Date((p.virtualDate || new Date().toLocaleDateString("en-CA")) + "T12:00:00");
  const [month, setMonth] = useState(today.getMonth()),
    [year, setYear] = useState(today.getFullYear()),
    [day, setDay] = useState(today.getDate());
  useEffect(() => {
    const current = new Date((p.virtualDate || new Date().toLocaleDateString("en-CA")) + "T12:00:00");
    setYear(current.getFullYear());
    setMonth(current.getMonth());
    setDay(current.getDate());
  }, [p.virtualDate]);
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const list = p.items.filter((i) =>
    i.time.startsWith(`${prefix}-${String(day).padStart(2, "0")}`),
  );
  const move = (d: number) => {
    const date = new Date(year, month + d, 1);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
    setDay(1);
  };
  const first = new Date(year, month, 1).getDay(),
    days = new Date(year, month + 1, 0).getDate();
  return (
    <div className="catalog-skin native-calendar">
      <Header p={p} />
      <div className="catalog-scroll">
        <div className="month-title">
          <button aria-label="上个月" onClick={() => move(-1)}>
            <ChevronLeft />
          </button>
          <h2>
            {year} 年 {month + 1} 月
          </h2>
          <button aria-label="下个月" onClick={() => move(1)}>
            <ChevronRight />
          </button>
        </div>
        <div className="calendar-grid">
          {["日", "一", "二", "三", "四", "五", "六"].map((t) => (
            <small key={t}>{t}</small>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <span key={"blank" + i} />
          ))}
          {Array.from({ length: days }, (_, i) => (
            <button
              className={day === i + 1 ? "selected" : ""}
              key={i}
              onClick={() => setDay(i + 1)}
            >
              {i + 1}
              {p.items.some((x) =>
                x.time.startsWith(
                  `${prefix}-${String(i + 1).padStart(2, "0")}`,
                ),
              ) && <i />}
            </button>
          ))}
        </div>
        <h4 className="native-section">
          {month + 1} 月 {day} 日
        </h4>
        {list.map((i) => (
          <button
            className="calendar-event"
            key={i.id}
            onClick={() => p.onItem(i)}
          >
            <time>{i.time.slice(-5)}</time>
            <div>
              <strong>{i.title}</strong>
              <p>{meta(i, "location", i.body)}</p>
            </div>
          </button>
        ))}
        <Empty items={list} label="当天没有日程" />
        <Add p={p} label="添加日程" />
      </div>
    </div>
  );
}
export function MailSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "收件箱");
  const list = items.filter(
    (i) =>
      tab === "全部邮件" ||
      i.folder === tab ||
      (tab === "收件箱" &&
        (!i.folder || !["草稿", "已发送"].includes(i.folder))),
  );
  return (
    <div className="catalog-skin native-mail">
      <Header p={p} />
      <div className="mail-folders">
        {["收件箱", "草稿", "已发送", "全部邮件"].map((t) => (
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
        <h1>{tab}</h1>
        <SearchBox value={q} set={setQ} />
        {list.map((i) => (
          <button
            className="mail-preview"
            key={i.id}
            onClick={() => p.onItem(i)}
          >
            <i className={!i.read ? "unread" : ""} />
            <div>
              <strong>{i.sender}</strong>
              <h3>{i.title}</h3>
              <p>{i.body}</p>
            </div>
            <time>{i.time.slice(5, 10)}</time>
          </button>
        ))}
        <Empty items={list} />
      </div>
      <footer className="mail-footer">
        <span>{list.length} 封邮件</span>
        <Add p={p} label="写邮件" />
      </footer>
    </div>
  );
}
type ClockAlarm = { id: string; time: string; label: string; enabled: boolean; repeat: string[] };
const defaultClockAlarms: ClockAlarm[] = [
  { id: "alarm-0748", time: "07:48", label: "闹钟", enabled: false, repeat: [] },
  { id: "alarm-0830", time: "08:30", label: "起床", enabled: false, repeat: ["周一","周二","周三","周四","周五"] },
  { id: "alarm-0906", time: "09:06", label: "起床", enabled: false, repeat: [] },
  { id: "alarm-0945", time: "09:45", label: "起床", enabled: false, repeat: [] },
  { id: "alarm-0955", time: "09:55", label: "起床", enabled: false, repeat: [] },
  { id: "alarm-1010", time: "10:10", label: "起床", enabled: false, repeat: [] },
  { id: "alarm-1154", time: "11:54", label: "闹钟", enabled: false, repeat: [] },
];
const clockCities = [
  { city: "北京", zone: "Asia/Shanghai" },
  { city: "伦敦", zone: "Europe/London" },
  { city: "拉斯维加斯", zone: "America/Los_Angeles" },
  { city: "温哥华", zone: "America/Vancouver" },
  { city: "东京", zone: "Asia/Tokyo" },
  { city: "纽约", zone: "America/New_York" },
  { city: "巴黎", zone: "Europe/Paris" },
  { city: "悉尼", zone: "Australia/Sydney" },
];
const clockParts = (date: Date, zone: string) => {
  const parts = new Intl.DateTimeFormat("zh-CN", { timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  return { hour: parts.find((p) => p.type === "hour")?.value || "00", minute: parts.find((p) => p.type === "minute")?.value || "00" };
};
const clockDayOffset = (date: Date, zone: string) => {
  const target = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  const base = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  const a = new Date(target + "T12:00:00Z").getTime();
  const b = new Date(base + "T12:00:00Z").getTime();
  return Math.round((a - b) / 86400000);
};
const clockZoneOffset = (date: Date, zone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  return Math.round((asUtc - date.getTime()) / 60000);
};
export function ClockSkin(p: Props) {
  const [tab, setTab] = useState("世界时钟");
  const [worldEditMode, setWorldEditMode] = useState(false);
  const [swipedCity, setSwipedCity] = useState<string | null>(null);
  const worldTouchStart = useRef<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [citiesRaw, setCitiesRaw] = useSkinState<string>(p, "clockWorldCitiesV1", JSON.stringify(clockCities.slice(0, 4)));
  const cities = (() => { try { const value = JSON.parse(citiesRaw); return Array.isArray(value) ? value as Array<{city:string;zone:string}> : clockCities.slice(0,4); } catch { return clockCities.slice(0,4); } })();
  const [alarmsRaw, setAlarmsRaw] = useSkinState<string>(p, "clockAlarmsV2", JSON.stringify(defaultClockAlarms));
  const alarms = (() => { try { const value = JSON.parse(alarmsRaw); return Array.isArray(value) ? value as ClockAlarm[] : defaultClockAlarms; } catch { return defaultClockAlarms; } })();
  const [editingAlarm, setEditingAlarm] = useState<ClockAlarm | null>(null);
  const [alarmTime, setAlarmTime] = useState("07:30");
  const [alarmLabel, setAlarmLabel] = useState("闹钟");
  const [alarmRepeat, setAlarmRepeat] = useState<string[]>([]);
  const [alarmEditorOpen, setAlarmEditorOpen] = useState(false);
  const [alarmEditMode, setAlarmEditMode] = useState(false);
  const [stopwatchRaw, setStopwatchRaw] = useSkinState<string>(p, "clockStopwatchV1", JSON.stringify({ elapsed: 0, startedAt: 0, laps: [] as number[] }));
  const stopwatch = (() => { try { return JSON.parse(stopwatchRaw) as { elapsed: number; startedAt: number; laps: number[] }; } catch { return { elapsed: 0, startedAt: 0, laps: [] }; } })();
  const stopwatchRunning = stopwatch.startedAt > 0;
  const stopwatchElapsed = stopwatch.elapsed + (stopwatchRunning ? Math.max(0, now.getTime() - stopwatch.startedAt) : 0);
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerLabel, setTimerLabel] = useState("计时器");
  const [timerDeadlineRaw, setTimerDeadlineRaw] = useSkinState<string>(p, "clockTimerDeadlineV1", "");
  const [timerRemainingRaw, setTimerRemainingRaw] = useSkinState<string>(p, "clockTimerRemainingV1", "0");
  const [timerRunning, setTimerRunning] = useState(() => Number(timerDeadlineRaw) > Date.now());
  const [timerNow, setTimerNow] = useState(Date.now());
  const [recentTimers, setRecentTimers] = useSkinState<string[]>(p, "clockRecentTimersV1", ["300", "480"]);
  const timerDeadline = Number(timerDeadlineRaw) || 0;
  const timerRemaining = timerRunning && timerDeadline ? Math.max(0, timerDeadline - timerNow) : Math.max(0, Number(timerRemainingRaw) || 0);
  const [timerFinished, setTimerFinished] = useState(false);
  const timerInterval = useRef<number | undefined>(undefined);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setTimerNow(Date.now()), 100);
    timerInterval.current = id;
    return () => window.clearInterval(id);
  }, [timerRunning]);
  useEffect(() => {
    if (!timerRunning || !timerDeadline || timerNow < timerDeadline) return;
    setTimerRunning(false);
    setTimerDeadlineRaw("");
    setTimerRemainingRaw("0");
    setTimerFinished(true);
  }, [timerNow, timerRunning, timerDeadline]);
  const updateAlarms = (next: ClockAlarm[]) => setAlarmsRaw(JSON.stringify(next));
  const openNewAlarm = () => {
    setEditingAlarm(null); setAlarmTime("07:30"); setAlarmLabel("闹钟"); setAlarmRepeat([]); setAlarmEditorOpen(true);
  };
  const openExistingAlarm = (alarm: ClockAlarm) => {
    setEditingAlarm(alarm); setAlarmTime(alarm.time); setAlarmLabel(alarm.label); setAlarmRepeat(alarm.repeat || []); setAlarmEditorOpen(true);
  };
  const saveAlarm = () => {
    const next: ClockAlarm = { id: editingAlarm?.id || "alarm-" + Date.now(), time: alarmTime, label: alarmLabel.trim() || "闹钟", enabled: editingAlarm?.enabled ?? false, repeat: alarmRepeat };
    updateAlarms(editingAlarm ? alarms.map((a) => a.id === editingAlarm.id ? next : a) : [...alarms, next].sort((a,b) => a.time.localeCompare(b.time)));
    setAlarmEditorOpen(false);
  };
  const toggleAlarm = (id: string) => updateAlarms(alarms.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a));
  const formatStopwatch = (ms: number) => {
    const centiseconds = Math.floor(ms / 10) % 100;
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000);
    return { main: String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0"), fraction: "." + String(centiseconds).padStart(2,"0") };
  };
  const startStopwatch = () => setStopwatchRaw(JSON.stringify({ ...stopwatch, startedAt: Date.now() }));
  const pauseStopwatch = () => setStopwatchRaw(JSON.stringify({ ...stopwatch, elapsed: stopwatchElapsed, startedAt: 0 }));
  const resetStopwatch = () => setStopwatchRaw(JSON.stringify({ elapsed: 0, startedAt: 0, laps: [] }));
  const addLap = () => setStopwatchRaw(JSON.stringify({ ...stopwatch, laps: [stopwatchElapsed, ...stopwatch.laps] }));
  const formatTimer = (ms: number) => {
    const total = Math.ceil(ms / 1000);
    return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map((n) => String(n).padStart(2,"0")).join(":");
  };
  const startTimer = (seconds: number) => {
    if (seconds <= 0) return;
    setTimerFinished(false);
    setTimerRemainingRaw(String(seconds * 1000));
    setTimerDeadlineRaw(String(Date.now() + seconds * 1000));
    setTimerNow(Date.now());
    setTimerRunning(true);
    setRecentTimers((current) => [String(seconds), ...current.filter((v) => v !== String(seconds))].slice(0, 5));
  };
  const pauseTimer = () => {
    setTimerRemainingRaw(String(timerRemaining));
    setTimerDeadlineRaw("");
    setTimerRunning(false);
  };
  const resumeTimer = () => {
    if (timerRemaining <= 0) return;
    setTimerDeadlineRaw(String(Date.now() + timerRemaining));
    setTimerNow(Date.now());
    setTimerRunning(true);
  };
  const resetTimer = () => {
    setTimerRunning(false); setTimerDeadlineRaw(""); setTimerRemainingRaw("0"); setTimerFinished(false);
  };
  const worldTime = (zone: string) => {
    const value = clockParts(now, zone);
    const dayOffset = clockDayOffset(now, zone);
    const hours = Math.round((clockZoneOffset(now, zone) - clockZoneOffset(now, "Asia/Taipei")) / 60);
    return { time: value.hour + ":" + value.minute, day: dayOffset === 0 ? "今天" : dayOffset > 0 ? "明天" : "昨天", offset: (hours > 0 ? "+" : "") + hours + "小时" };
  };
  const dayNames = ["周一","周二","周三","周四","周五","周六","周日"];
  const elapsed = formatStopwatch(stopwatchElapsed);
  return (
    <div className="catalog-skin native-clock native-clock-full">
      <header className="clock-topbar">
        {tab === "秒表" || tab === "计时器" ? <span /> : <span />}
        {tab === "秒表" || tab === "计时器" || tab === "闹钟" ? <strong>{tab}</strong> : null}
        <div className="clock-top-actions">
          {tab === "闹钟" ? <button onClick={() => setAlarmEditMode(!alarmEditMode)}>{alarmEditMode ? "完成" : "编辑"}</button> : null}
          {tab === "世界时钟" ? <><button aria-label={worldEditMode ? "完成编辑" : "编辑"} className={worldEditMode ? "clock-edit-done" : ""} onClick={() => { setWorldEditMode(!worldEditMode); setSwipedCity(null); }}>{worldEditMode ? "✓" : "编辑"}</button><button aria-label="添加城市" onClick={() => setTab("添加城市")}>＋</button></> : tab === "闹钟" ? <button aria-label="添加闹钟" onClick={openNewAlarm}>＋</button> : tab === "秒表" || tab === "计时器" ? <button aria-label="编辑" onClick={() => tab === "秒表" ? resetStopwatch() : resetTimer()}>编辑</button> : null}
        </div>
      </header>
      <div className="clock-content">
        {tab === "世界时钟" ? (
          <>
            <h1>世界时钟</h1>
            {cities.map((city) => {
              const value = worldTime(city.zone);
              const revealed = worldEditMode || swipedCity === city.zone;
              return <div className="clock-world-swipe-wrap" key={city.zone}>
                <button className="clock-world-delete" aria-label={"删除" + city.city} onClick={() => { setCitiesRaw(JSON.stringify(cities.filter((item) => item.zone !== city.zone))); setSwipedCity(null); }}>
                  <Trash2 size={20}/>
                </button>
                <div className={"clock-world-row" + (revealed ? " revealed" : "")}
                  onTouchStart={(event) => { worldTouchStart.current = event.touches[0]?.clientX ?? null; }}
                  onTouchEnd={(event) => { const start = worldTouchStart.current; const end = event.changedTouches[0]?.clientX; if (start !== null && end !== undefined && start - end > 35) setSwipedCity(city.zone); else if (start !== null && end !== undefined && end - start > 30) setSwipedCity(null); worldTouchStart.current = null; }}
                  onClick={() => { if (swipedCity && swipedCity !== city.zone) setSwipedCity(null); }}>
                  <div><small>{value.day} {value.offset}</small><strong>{city.city}</strong></div>
                  <time>{value.time}</time>
                </div>
              </div>;
            })}
          </>
        ) : tab === "闹钟" ? (
          <>
            <div className="clock-alarm-section"><h3>其他</h3>
              {alarms.map((alarm) => <div className="clock-alarm-row" key={alarm.id}>
                <button className="clock-alarm-detail" onClick={() => openExistingAlarm(alarm)}>
                  <time>{alarm.time}</time><small>{alarm.repeat.length ? alarm.repeat.join(" ") : alarm.label}</small>
                </button>
                <button role="switch" aria-checked={alarm.enabled} aria-label={alarm.time + " " + alarm.label} className={"clock-switch " + (alarm.enabled ? "on" : "")} onClick={() => toggleAlarm(alarm.id)}><span /></button>
                {alarmEditMode && <button className="clock-delete-alarm" aria-label="删除闹钟" onClick={() => updateAlarms(alarms.filter((a) => a.id !== alarm.id))}><Trash2 size={16}/></button>}
              </div>)}
            </div>
          </>
        ) : tab === "秒表" ? (
          <div className="clock-stopwatch-view">
            <output><span>{elapsed.main}</span><small>{elapsed.fraction}</small></output>
            <div className="clock-stopwatch-controls">
              <button className="secondary-round" onClick={stopwatchRunning ? addLap : resetStopwatch}>{stopwatchRunning ? "分段" : "复位"}</button>
              <button className={"primary-round " + (stopwatchRunning ? "pause" : "")} onClick={stopwatchRunning ? pauseStopwatch : startStopwatch}>{stopwatchRunning ? <Pause size={26}/> : <Play size={26} fill="currentColor"/>}</button>
            </div>
            <div className="clock-laps">
              {stopwatch.laps.map((lap, index) => <div key={index}><span>分段 {stopwatch.laps.length - index}</span><time>{formatStopwatch(lap).main}{formatStopwatch(lap).fraction}</time></div>)}
            </div>
          </div>
        ) : tab === "计时器" ? (
          <div className="clock-timer-view">
            <h1>计时器</h1>
            {timerRemaining > 0 || timerRunning ? (
              <div className="clock-timer-countdown">
                <output>{formatTimer(timerRemaining)}</output>
                <div className="clock-timer-controls">
                  <button className="secondary-round" onClick={resetTimer}><X size={24}/></button>
                  <button className="primary-round" onClick={timerRunning ? pauseTimer : resumeTimer}>{timerRunning ? <Pause size={26}/> : <Play size={26} fill="currentColor"/>}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="clock-timer-picker">
                  {[{value:timerHours,set:setTimerHours,max:23,label:"小时"},{value:timerMinutes,set:setTimerMinutes,max:59,label:"分钟"},{value:timerSeconds,set:setTimerSeconds,max:59,label:"秒"}].map((part) => <label key={part.label}>
                    <select aria-label={part.label} value={part.value} onChange={(e) => part.set(Number(e.target.value))}>{Array.from({length:part.max+1},(_,n)=><option value={n} key={n}>{n} {part.label}</option>)}</select>
                  </label>)}
                </div>
                <label className="clock-timer-label">标签<input value={timerLabel} onChange={(e)=>setTimerLabel(e.target.value)} /></label>
                <button className="clock-ringtone" onClick={() => window.alert("计时器铃声：雷达（模拟设置）")}>铃声 <span>雷达 ›</span></button>
                <div className="clock-timer-controls"><button className="secondary-round" onClick={resetTimer}><X size={24}/></button><button className="primary-round" onClick={() => startTimer(timerHours*3600+timerMinutes*60+timerSeconds)}><Play size={26} fill="currentColor"/></button></div>
              </>
            )}
            {timerFinished && <div className="clock-timer-finished" role="status"><strong>计时结束</strong><button onClick={resetTimer}>停止</button></div>}
            {recentTimers.length > 0 && <div className="clock-recent"><h3>最近使用</h3>{recentTimers.map((v) => <button key={v} onClick={() => startTimer(Number(v))}><span>{formatTimer(Number(v)*1000)}</span><small>{Number(v)>=60 ? Math.floor(Number(v)/60)+"分钟" : v+"秒"}</small><Play size={21} fill="currentColor"/></button>)}</div>}
          </div>
        ) : (
          <div className="clock-add-city"><h2>添加城市</h2>{clockCities.filter((city) => !cities.some((current) => current.zone === city.zone)).map((city) => <button key={city.zone} onClick={() => { setCitiesRaw(JSON.stringify([...cities, city])); setTab("世界时钟"); }}>{city.city}<span>＋</span></button>)}<button onClick={() => setTab("世界时钟")}>完成</button></div>
        )}
      </div>
      {alarmEditorOpen && <div className="clock-modal-backdrop"><div className="clock-alarm-editor">
        <div><button aria-label="取消" onClick={() => setAlarmEditorOpen(false)}>取消</button><strong>{editingAlarm ? "编辑闹钟" : "添加闹钟"}</strong><button onClick={saveAlarm}>存储</button></div>
        <input type="time" value={alarmTime} onChange={(e)=>setAlarmTime(e.target.value)} />
        <label>标签<input value={alarmLabel} onChange={(e)=>setAlarmLabel(e.target.value)} /></label>
        <h4>重复</h4><div className="clock-repeat">{dayNames.map((day)=><button key={day} className={alarmRepeat.includes(day)?"selected":""} onClick={()=>setAlarmRepeat((v)=>v.includes(day)?v.filter((x)=>x!==day):[...v,day])}>{day}</button>)}</div>
      </div></div>}
      {tab !== "添加城市" && <nav className="catalog-tabs clock-tabs">
        {[
          {label:"世界时钟",icon:<Globe/>},
          {label:"闹钟",icon:<AlarmClock/>},
          {label:"秒表",icon:<Clock/>},
          {label:"计时器",icon:<Timer/>},
        ].map((item)=><button key={item.label} className={tab===item.label?"selected":""} onClick={()=>setTab(item.label)}>{item.icon}<span>{item.label}</span></button>)}
      </nav>}
    </div>
  );
}
export function RemindersSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "全部");
  const [checked, setChecked] = useSkinState<string[]>(p, "checked", []);
  const list =
    tab === "已完成"
      ? items.filter((i) => checked.includes(i.id))
      : items.filter((i) => !checked.includes(i.id));
  return (
    <div className="catalog-skin native-reminders">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        <div className="reminder-categories">
          {["全部", "已完成"].map((t) => (
            <button key={t} onClick={() => setTab(t)}>
              <Calendar size={22} />
              <strong>
                {t === "全部" ? items.length - checked.length : checked.length}
              </strong>
              <span>{t}</span>
            </button>
          ))}
        </div>
        <h1>{tab}</h1>
        {list.map((i) => (
          <div className="reminder-row" key={i.id}>
            <button
              aria-label={`完成${i.title}`}
              role="checkbox"
              aria-checked={checked.includes(i.id)}
              onClick={() =>
                setChecked(
                  checked.includes(i.id)
                    ? checked.filter((x) => x !== i.id)
                    : [...checked, i.id],
                )
              }
            >
              <CheckCircle size={21} />
            </button>
            <button onClick={() => p.onItem(i)}>
              <strong>{i.title}</strong>
              <small>
                {i.time} · {i.folder}
              </small>
            </button>
          </div>
        ))}
        <Add p={p} label="新提醒事项" />
      </div>
    </div>
  );
}
export function FilesSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "最近项目");
  const [folder, setFolder] = useState("");
  const list = folder
    ? items.filter((i) => (i.folder || "我的iPhone") === folder)
    : items;
  return (
    <div className="catalog-skin native-files">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{folder || tab}</h1>
        <SearchBox value={q} set={setQ} />
        {tab === "浏览" && !folder ? (
          <div className="file-folders">
            {groupItems(items, "我的iPhone").map((g) => (
              <button key={g} onClick={() => setFolder(g)}>
                <Folder size={45} />
                <strong>{g}</strong>
              </button>
            ))}
          </div>
        ) : (
          <div className="file-grid">
            {list.map((i) => (
              <div key={i.id}>
                <button onClick={() => p.onItem(i)}>
                  {i.media ? <Media item={i} /> : <FileText size={49} />}
                  <strong>{i.title}</strong>
                  <small>
                    {meta(i, "extension", "文件")} ·{" "}
                    {meta(i, "size", i.time.slice(0, 10))}
                  </small>
                </button>
                <button
                  aria-label={`下载${i.title}文本`}
                  onClick={() =>
                    download(
                      new Blob([i.body], { type: "text/plain" }),
                      `${i.title}.txt`,
                    )
                  }
                >
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["最近项目", "浏览"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setFolder("");
        }}
        icons={[<Clock />, <Folder />]}
      />
    </div>
  );
}
export function MusicSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "资料库");
  const [song, setSong] = useTrack(p, items);
  return (
    <div className="catalog-skin native-music">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        {tab === "歌单" ? (
          <div className="music-albums">
            {groupItems(items, "我的音乐").map((g) => (
              <button
                key={g}
                onClick={() => {
                  const i = items.find((i) => (i.folder || "我的音乐") === g);
                  if (i) setSong(i);
                }}
              >
                <Music size={51} />
                <strong>{g}</strong>
              </button>
            ))}
          </div>
        ) : (
          items.map((i, n) => (
            <button
              className="music-track"
              key={i.id}
              onClick={() => {
                setSong(i);
              }}
            >
              <small>{n + 1}</small>
              <span>
                <strong>{i.title}</strong>
                <small>
                  {i.sender} · {meta(i, "album")}
                </small>
              </span>
              <span>{meta(i, "duration")}</span>
            </button>
          ))
        )}
        <Empty items={items} />
      </div>
      {song && (
        <div className="native-now-playing">
          <button onClick={() => p.onItem(song)}>
            <Music size={20} />
            {song.title}
          </button>
          {song.kind === "audio" && safeMedia(song.media) ? (
            <AudioPlayer p={p} item={song} />
          ) : (
            <button onClick={() => p.onItem(song)}>查看歌曲内容</button>
          )}
          <button
            aria-label="下一首"
            onClick={() =>
              setSong(
                items[
                  (items.findIndex((i) => i.id === song.id) + 1) % items.length
                ],
              )
            }
          >
            <SkipForward size={18} />
          </button>
        </div>
      )}
      <Tabs
        tabs={["资料库", "歌单"]}
        value={tab}
        set={setTab}
        icons={[<Music />, <Folder />]}
      />
    </div>
  );
}
function LocationMap({
  items,
  onItem,
  find = false,
}: {
  items: Item[];
  onItem: (i: Item) => void;
  find?: boolean;
}) {
  return (
    <div className={`fiction-map ${find ? "find-map" : ""}`}>
      <svg viewBox="0 0 300 300" aria-label="原创虚构地图">
        <rect width="300" height="300" fill="#e4e5d8" />
        {[35, 100, 190, 260].map((n) => (
          <path
            key={n}
            d={`M0 ${n} H300 M${n} 0 V300`}
            stroke="#fff"
            strokeWidth="11"
          />
        ))}
        <path
          d="M20 0 Q190 110 120 300"
          stroke="#b6d8df"
          strokeWidth="24"
          fill="none"
        />
        <rect x="205" y="112" width="42" height="65" rx="7" fill="#bdcfac" />
      </svg>
      {items.map((i, n) => (
        <button
          key={i.id}
          aria-label={`地图位置${i.title}`}
          className="map-pin"
          style={{
            left: `${Math.max(5, Math.min(90, Number(meta(i, "x", String(20 + ((n * 17) % 65))))))}%`,
            top: `${Math.max(8, Math.min(80, Number(meta(i, "y", String(25 + ((n * 13) % 50))))))}%`,
          }}
          onClick={() => onItem(i)}
        >
          {find ? <Avatar name={i.title} /> : <MapPin size={24} />}
        </button>
      ))}
    </div>
  );
}
export function MapsSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "地点");
  const taipei = { latitude: 25.0330, longitude: 121.5654 };
  return (
    <div className="catalog-skin native-maps">
      <Header p={p} />
      <div className="device-map">
        <iframe
          title="台北市地图"
          src={openStreetMapEmbed(taipei.latitude, taipei.longitude, 0.025)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="device-map-attribution">
          <span><MapPin size={14} /> 台北市</span>
          <a href={openStreetMapLink(taipei.latitude, taipei.longitude)} target="_blank" rel="noreferrer">在地图中打开</a>
        </div>
      </div>
      <div className="map-sheet">
        <SearchBox value={q} set={setQ} placeholder="搜索已保存地点" />
        <div className="map-places">
          {items.map((i) => (
            <Row key={i.id} item={i} onItem={p.onItem} leading={<MapPin />} />
          ))}
        </div>
      </div>
    </div>
  );
}
export function WalletSkin(p: Props) {
  const [selected, setSelected] = useState("");
  const cards = p.items.filter((i) => i.folder !== "交易"),
    transactions = p.items.filter((i) => i.folder === "交易");
  return (
    <div className="catalog-skin native-wallet">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>钱包</h1>
        <div className="wallet-stack">
          {cards.map((i, n) => (
            <button
              key={i.id}
              className={selected === i.id ? "selected" : ""}
              style={{
                background: ["#252d38", "#716456", "#4a655d", "#735e6b"][n % 4],
              }}
              onClick={() => {
                setSelected(i.id);
                p.onItem(i);
              }}
            >
              <strong>{i.title}</strong>
              <span>{meta(i, "number", "••••")}</span>
              <small>{meta(i, "amount", i.sender)}</small>
            </button>
          ))}
        </div>
        <h4 className="native-section">交易记录</h4>
        {transactions.map((i) => (
          <Row key={i.id} item={i} onItem={p.onItem} leading={<Wallet />}>
            <strong>{meta(i, "amount")}</strong>
          </Row>
        ))}
        <Empty items={p.items} />
      </div>
    </div>
  );
}
export function FindSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "设备");
  const list = items.filter((i) =>
    tab === "设备" ? i.folder !== "人物" : i.folder === "人物",
  );
  return (
    <div className="catalog-skin native-find">
      <Header p={p} />
      <LocationMap items={list} onItem={p.onItem} find />
      <div className="find-sheet">
        <h2>{tab}</h2>
        {list.map((i) => (
          <Row
            key={i.id}
            item={i}
            onItem={p.onItem}
            leading={<Avatar name={i.title} />}
          >
            {meta(i, "status", "位置记录")}
          </Row>
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["人物", "设备"]}
        value={tab}
        set={setTab}
        icons={[<Users />, <MapPin />]}
      />
    </div>
  );
}
