export { WeatherSkin, HealthSkin } from "./CalibratedSystemApps";
import { AudioPlayer, useTrack } from "../audio";
import { useSkinState } from "../skinState";
import {
  Calendar,
  Camera,
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
import { useEffect, useState } from "react";
import { openStreetMapEmbed, openStreetMapLink, useDeviceLocation } from "../deviceLocation";
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
  const [album, setAlbum] = useState("");
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
      ? items.filter((i) => i.favorite)
      : album
        ? items.filter((i) => (i.folder || "未分类") === album)
        : items.filter((i) => (i.title + i.body).toLowerCase().includes(q.toLowerCase()));
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
                {activeAlbum.photoIds[0] && items.find((i) => i.id === activeAlbum.photoIds[0]) ? (
                  <Media item={items.find((i) => i.id === activeAlbum.photoIds[0])!} />
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
                  const item = items.find((i) => i.id === id);
                  return item ? <button key={id} onClick={() => p.onItem(item)}><Media item={item} /></button> : null;
                })}
              </div>
              {!activeAlbum.photoIds.length && <p className="shared-empty">这个共享相簿还没有照片</p>}
              <div className="shared-add-heading"><strong>从图库添加照片</strong><small>点选照片后添加到共享相簿</small></div>
              <div className="photo-mosaic shared-picker">
                {items.map((item) => (
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
                const cover = items.find((i) => i.id === shared.photoIds[0]);
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
                {groupItems(items, "未分类").map((g) => (
                  <button key={g} onClick={() => setAlbum(g)}>
                    <Media item={items.find((i) => (i.folder || "未分类") === g)!} />
                    <strong>{g}</strong>
                    <small>{items.filter((i) => (i.folder || "未分类") === g).length} 项</small>
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
              {list.map((i) => (
                <button aria-label={`查看${i.title}`} key={i.id} onClick={() => p.onItem(i)}>
                  <Media item={i} />
                  {i.favorite && <Heart size={12} fill="white" />}
                </button>
              ))}
            </div>
            <p className="media-count">{list.length} 个项目</p>
          </>
        )}
        {!activeAlbum && tab !== "共享" && <Empty items={list} />}
      </div>
      <Tabs
        tabs={["图库", "相簿", "共享", "收藏"]}
        value={tab}
        set={(t) => { setTab(t); setAlbum(""); setActiveShared(""); setSelectedPhotos([]); }}
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
export function ClockSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "闹钟");
  const [enabled, setEnabled] = useSkinState<string[]>(p, "alarms", []),
    [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return (
    <div className="catalog-skin native-clock">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        {tab === "秒表" ? (
          <div className="stopwatch">
            <output>
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </output>
            <div>
              <button
                onClick={() => {
                  setSeconds(0);
                  setRunning(false);
                }}
              >
                复位
              </button>
              <button onClick={() => setRunning(!running)}>
                {running ? "暂停" : "开始"}
              </button>
            </div>
          </div>
        ) : (
          items.map((i) => (
            <div className="alarm-row" key={i.id}>
              <button onClick={() => p.onItem(i)}>
                <time>{meta(i, "clock", i.time.slice(-5))}</time>
                <small>
                  {tab === "世界时钟" ? meta(i, "city", i.title) : i.title}
                </small>
              </button>
              {tab === "闹钟" ? (
                <button
                  role="switch"
                  aria-label={`闹钟${i.title}`}
                  aria-checked={enabled.includes(i.id)}
                  className={`native-switch ${enabled.includes(i.id) ? "on" : ""}`}
                  onClick={() =>
                    setEnabled(
                      enabled.includes(i.id)
                        ? enabled.filter((x) => x !== i.id)
                        : [...enabled, i.id],
                    )
                  }
                >
                  <span />
                </button>
              ) : (
                <Clock size={35} />
              )}
            </div>
          ))
        )}
      </div>
      <Tabs
        tabs={["世界时钟", "闹钟", "秒表"]}
        value={tab}
        set={setTab}
        icons={[<Globe />, <Clock />, <Clock />]}
      />
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
  const { position, error, loading, request } = useDeviceLocation();
  return (
    <div className="catalog-skin native-maps">
      <Header p={p} />
      <div className="device-map">
        {position ? (
          <>
            <iframe
              title="当前位置地图"
              src={openStreetMapEmbed(position.latitude, position.longitude, 0.025)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="device-map-attribution">
              <span><MapPin size={14} /> 当前位置</span>
              <a href={openStreetMapLink(position.latitude, position.longitude)} target="_blank" rel="noreferrer">在地图中打开</a>
            </div>
          </>
        ) : (
          <div className="device-map-permission">
            <MapPin size={42} />
            <strong>{loading ? "正在获取当前位置…" : "地图需要定位权限"}</strong>
            <p>{error || "允许 FoundPhone 使用设备位置，即可显示你当前所在位置。"}</p>
            <button onClick={request} disabled={loading}>{loading ? "正在定位…" : "允许定位 / 重新定位"}</button>
          </div>
        )}
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
