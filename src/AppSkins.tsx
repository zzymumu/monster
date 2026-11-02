import { NativeComposer } from "./DeviceSystem";
import { useSkinState } from "./skinState";
import { useState } from "react";
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
import { safeMedia, type Item, type UiValue } from "./schema";
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
  return (
    <span className={`skin-avatar ${round ? "round" : ""}`}>
      {safeMedia(src)?.startsWith("data:image/") ? (
        <img src={safeMedia(src)} alt="" />
      ) : (
        name.slice(0, 1)
      )}
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
}: {
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onRead: (id: string) => void;
  whatsapp?: boolean;
}) {
  return (
    <div className={`skin-messages ${whatsapp ? "wa-wallpaper" : ""}`}>
      <div className="skin-date">{items[0]?.time.slice(0, 10)}</div>
      {items.map((i) => (
        <div
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
                ¥ {i.body}
                <small>转账记录 · 虚构</small>
              </div>
            ) : (
              i.body
            )}
            <small className={whatsapp ? undefined : "wx-message-time"}>
              {i.time.slice(-5)}{" "}
              {whatsapp && i.outgoing && <CheckCheck size={11} />}
            </small>
          </button>
          {!whatsapp && i.outgoing && <Avatar name={i.sender} src={i.avatar} />}
        </div>
      ))}
    </div>
  );
}
function Compose({
  creator,
  onAdd,
  wa = false,
}: {
  creator: boolean;
  onAdd: () => void;
  wa?: boolean;
}) {
  return (
    <div className={`skin-compose ${wa ? "wa-compose" : ""}`}>
      {wa ? <Plus size={20} /> : <Mic size={20} />}
      <NativeComposer creator={creator} onAdd={onAdd} />

      <Smile size={21} />
      {wa ? <Mic size={20} /> : <Plus size={22} />}
    </div>
  );
}
export function WeChatSkin(p: SkinProps) {
  const [tab, setTab] = useState("微信");
  const [query, setQuery] = useState("");
  const [moments, setMoments] = useState(false);
  const initialOwnerName = p.owner && p.owner !== "机主" ? p.owner : "我的微信";
  const [profileName, setProfileName] = useSkinState<string>(p, "wxProfileName", initialOwnerName);
  const [profileAvatar, setProfileAvatar] = useSkinState<string>(p, "wxProfileAvatar", "");
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
  const [addQuery, setAddQuery] = useState("");
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
    new Set(p.items.filter((i) => !["朋友圈", "我"].includes(i.folder)).map((i) => i.title)),
  ).sort((a, b) => {
    const aLast = p.items.filter((i) => i.title === a).at(-1)?.time ?? "";
    const bLast = p.items.filter((i) => i.title === b).at(-1)?.time ?? "";
    return bLast.localeCompare(aLast);
  });
  const contacts = Array.from(new Set([
    ...p.items.map((i) => i.sender).filter((s) => s && s !== "我" && s !== "机主"),
    ...addedFriends,
  ])).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const friendDirectory = Array.from(new Set(["温尚翊", "西兰花", "爸爸", "妈妈", ...p.items.flatMap((i) => [i.title, i.sender]).filter((s) => s && s !== "我" && s !== "机主")]));
  const friendMatches = addQuery.trim() ? friendDirectory.filter((name) => {
    const related = p.items.filter((i) => i.title === name || i.sender === name);
    const keys = [name, ...related.flatMap((i) => [i.meta.wechatId, i.meta.account, i.meta.phone, i.meta.handle])].filter(Boolean).join(" ").toLowerCase();
    return keys.includes(addQuery.trim().toLowerCase());
  }) : [];
  const posts = p.items.filter((i) => i.folder === "朋友圈" || i.kind === "post");
  const filteredConversations = conversations.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()) ||
    p.items.some((i) => i.title === name && i.body.toLowerCase().includes(query.toLowerCase())),
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
    const related = p.items.find((i) => i.sender === name || i.title === name);
    if (related) {
      p.onThread(related.title);
      p.onRead(related.title);
    } else setUtility(name);
  };
  return (
    <div className="wechat-ui independent-skin wx-reference-layout" data-tab={tab} data-thread={!!p.thread} data-moments={moments} data-utility={!!utility}>
      <div className="app-nav wx-nav">
        <button aria-label={utility || p.thread || moments ? "返回" : tab === "微信" ? "收藏" : "返回"} onClick={() => {
          if (utility) setUtility("");
          else if (p.thread) p.onThread("");
          else if (moments) setMoments(false);
          else if (tab !== "微信") setTab("微信");
          else setUtility("收藏");
        }}>
          {utility || p.thread || moments || tab !== "微信" ? <ChevronLeft size={22} /> : <Star size={22} />}
        </button>
        <strong>{utility || p.thread || (moments ? "朋友圈" : tab)}</strong>
        <button aria-label={p.thread ? "聊天详情" : "微信菜单"} onClick={() => p.thread ? setUtility("聊天信息") : setMenu((v) => !v)}>
          {p.thread ? <MoreHorizontal size={22} /> : <CirclePlus size={23} />}
        </button>
      </div>

      {menu && !p.thread && !moments && !utility && (
        <div className="wx-popup-menu" role="menu">
          {["发起群聊", "添加朋友", "扫一扫", "收付款"].map((label) => (
            <button role="menuitem" key={label} onClick={() => { setMenu(false); setUtility(label); }}>{label}</button>
          ))}
        </div>
      )}

      {utility === "添加朋友" ? (
        <div className="wx-add-friend-page">
          <label className="wx-add-search">
            <Search size={19} />
            <input aria-label="搜索微信号或手机号" placeholder="账号/手机号" value={addQuery} onChange={(e) => setAddQuery(e.target.value)} />
            {addQuery && <button aria-label="清空搜索" onClick={() => setAddQuery("")}>×</button>}
          </label>
          {addQuery.trim() ? (
            <div className="wx-add-results">
              {friendMatches.length ? friendMatches.map((name) => {
                const related = p.items.find((i) => i.title === name || i.sender === name);
                const alreadyAdded = addedFriends.includes(name);
                return (
                  <div className="wx-add-result" key={name}>
                    <Avatar name={name} src={related?.avatar} />
                    <span><strong>{name}</strong><small>微信号：{related?.meta.wechatId || related?.meta.account || name}</small></span>
                    <button disabled={alreadyAdded} onClick={() => setAddedFriends((v) => v.includes(name) ? v : [...v, name])}>{alreadyAdded ? "已添加" : "添加"}</button>
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
              {Array.from(new Set(p.items.filter((i) => i.title === p.thread).map((i) => i.sender))).map((name) => (
                <div key={name}><Avatar name={name} src={p.items.find((i) => i.sender === name)?.avatar} /><small>{name}</small></div>
              ))}
            </div>
          )}
          {p.items.filter((i) => i.folder === utility).map((i) => (
            <button key={i.id} className="wx-discovery" onClick={() => p.onItem(i)}>{i.title}<span>›</span></button>
          ))}
          {!p.items.some((i) => i.folder === utility) && utility !== "聊天信息" && (
            <div className="wx-empty-state"><span>{utility}</span><p>这里还没有内容</p></div>
          )}
        </div>
      ) : p.thread ? (
        <>
          <MessageList items={p.items.filter((i) => i.title === p.thread)} creator={p.creator} onItem={p.onItem} onRead={p.onRead} />
          <Compose creator={p.creator} onAdd={p.onAdd} />
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
            <Avatar name={ownerName} />
            <button className="wx-moment-publish" onClick={() => setMomentComposer(true)}><Plus size={16} /> 发布朋友圈</button>
          </div>
          {myMomentPosts.map((post) => (
            <div key={post.id} className="wx-moment-post wx-moment-user-post">
              <Avatar name={ownerName} />
              <div><strong>{ownerName}</strong><p>{post.body}</p><small>{post.time}</small></div>
            </div>
          ))}
          {posts.map((i) => (
            <button key={i.id} className="wx-moment-post" onClick={() => p.onItem(i)}>
              <Avatar name={i.sender} src={i.avatar} />
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
                  const list = p.items.filter((i) => i.title === name);
                  const last = list.at(-1)!;
                  const unread = !readThreads.includes(name) && list.some((i) => !i.read);
                  return (
                    <button className="wx-chat-row" key={name} onClick={() => {
                      setReadThreads((v) => v.includes(name) ? v : [...v, name]);
                      p.onThread(name);
                      p.onRead(name);
                    }}>
                      <span className="wx-chat-avatar">
                        <Avatar name={name} src={last.avatar} />
                        {unread && <b className="wx-unread">{list.filter((i) => !i.read).length || ""}</b>}
                      </span>
                      <div className="wx-chat-copy"><strong>{name}</strong><p>{last.body}</p></div>
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
                  const avatarItem = p.items.find((i) => i.sender === name);
                  return <button className="wx-contact-row" key={name} onClick={() => openContact(name)}>
                    <Avatar name={name} src={avatarItem?.avatar} /><span>{name}</span>
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
                  <small>微信号：未设置</small>
                  <em>＋ 状态</em>
                </div>
                <ChevronRight size={20} />
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
