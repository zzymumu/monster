import { useMemo, useState } from "react";
import { Plane, Hotel, CalendarDays, ChevronLeft, ArrowRight, CheckCircle2, Luggage, MapPin, BedDouble } from "lucide-react";
import type { Props } from "./shared";

type Flight = { id:string; airline:string; depart:string; arrive:string; returnDepart:string; returnArrive:string; duration:string; baggage:string; price:number; };
type HotelOption = { id:string; name:string; area:string; stars:number; price:number; image:string; blurb:string; rooms:{name:string;price:number;desc:string}[]; };
const flights:Flight[]=[
 {id:"airasia",airline:"AirAsia 亞洲航空",depart:"06:45",arrive:"11:35",returnDepart:"20:10",returnArrive:"01:00+1",duration:"4 小時 50 分",baggage:"手提行李 7kg",price:8990},
 {id:"scoot",airline:"Scoot 酷航",depart:"01:50",arrive:"10:15",returnDepart:"11:20",returnArrive:"21:40",duration:"8 小時 25 分（轉機）",baggage:"手提行李 10kg",price:10680},
 {id:"malaysia",airline:"Malaysia Airlines 馬來西亞航空",depart:"15:10",arrive:"20:05",returnDepart:"09:50",returnArrive:"14:45",duration:"4 小時 55 分",baggage:"托運行李 25kg",price:14800},
 {id:"china",airline:"中華航空",depart:"08:25",arrive:"13:25",returnDepart:"14:45",returnArrive:"19:35",duration:"5 小時",baggage:"托運行李 23kg",price:15900}
];
const hotels:HotelOption[]=[
 {id:"jw",name:"吉隆坡 JW 萬豪酒店",area:"武吉免登 · Pavilion 商圈",stars:5,price:4200,image:"jw",blurb:"經典五星住宿，購物與美食就在附近",rooms:[{name:"豪華客房・一特大床",price:0,desc:"約 40㎡ · 城市景觀"},{name:"豪華客房・兩張雙人床",price:450,desc:"適合雙人同行 · 城市景觀"},{name:"行政客房",price:1800,desc:"行政酒廊禮遇 · 高樓層"}]},
 {id:"ibis",name:"宜必思吉隆坡市中心酒店",area:"吉隆坡市中心 · 雙子塔周邊",stars:4,price:2450,image:"ibis",blurb:"交通便利，屋頂泳池可眺望城市",rooms:[{name:"標準客房・一大床",price:0,desc:"約 20㎡ · 城市景觀"},{name:"標準客房・兩小床",price:180,desc:"雙床配置 · 城市景觀"},{name:"高級客房",price:520,desc:"較寬敞空間 · 高樓層"}]},
 {id:"holma",name:"網紅泳池吉隆坡市中心雙子塔豪瑪",area:"吉隆坡市中心 · 雙子塔步行圈",stars:4,price:3150,image:"holma",blurb:"高空無邊際泳池與雙子塔景觀",rooms:[{name:"豪華公寓・雙人房",price:0,desc:"公寓式空間 · 城市景觀"},{name:"雙子塔景觀套房",price:900,desc:"雙子塔景觀 · 獨立起居區"},{name:"高樓層泳池景觀房",price:650,desc:"高樓層 · 泳池景觀"}]},
 {id:"westin",name:"吉隆坡威斯汀酒店",area:"武吉免登 · Pavilion 商圈",stars:5,price:4100,image:"westin",blurb:"舒適寬敞客房，鄰近購物與餐飲",rooms:[{name:"豪華客房・一特大床",price:0,desc:"約 38㎡ · 城市景觀"},{name:"豪華客房・兩張雙人床",price:350,desc:"雙床配置 · 城市景觀"},{name:"行政套房",price:2100,desc:"獨立起居空間 · 行政禮遇"}]},
 {id:"hilton",name:"吉隆坡東姑阿都拉曼希爾頓花園酒店",area:"秋傑 · 東姑阿都拉曼路",stars:4,price:1850,image:"hilton",blurb:"實惠舒適，適合精打細算的旅程",rooms:[{name:"標準客房・一大床",price:0,desc:"基本舒適配置"},{name:"高級客房・雙床",price:260,desc:"兩張單人床"},{name:"豪華客房",price:480,desc:"較高樓層 · 城市景觀"}]},
 {id:"holiday",name:"吉隆坡市中心智選假日酒店",area:"金三角 · 市中心",stars:3,price:2380,image:"holiday",blurb:"簡潔便利，含早餐方案可選",rooms:[{name:"標準客房・一大床",price:0,desc:"簡約舒適"},{name:"標準客房・兩小床",price:180,desc:"雙床配置"},{name:"含早餐客房",price:420,desc:"雙人早餐 · 每日"}]},
 {id:"intercon",name:"吉隆坡洲際酒店",area:"吉隆坡市中心 · Ampang 路",stars:5,price:5200,image:"intercon",blurb:"五星奢華體驗，鄰近雙子塔",rooms:[{name:"經典客房・一特大床",price:0,desc:"寬敞客房 · 城市景觀"},{name:"經典客房・兩張單人床",price:350,desc:"雙床配置"},{name:"行政客房",price:1900,desc:"行政酒廊禮遇"}]}
];
const money=(n:number)=>"NT$ "+n.toLocaleString("zh-TW");
function nextWeekend(dateText:string){
 const d=new Date(dateText+"T12:00:00");
 if(Number.isNaN(d.getTime())) return {out:"日期待更新",back:"日期待更新"};
 const days=(5-d.getDay()+7)%7||7;
 const friday=new Date(d); friday.setDate(d.getDate()+days);
 const sunday=new Date(friday); sunday.setDate(friday.getDate()+2);
 const fmt=(x:Date)=>x.toLocaleDateString("zh-TW",{month:"2-digit",day:"2-digit"});
 return {out:fmt(friday),back:fmt(sunday)};
}
export function TripSkin(p:Props){
 const dates=useMemo(()=>nextWeekend(p.virtualDate||new Date().toISOString().slice(0,10)),[p.virtualDate]);
 const [tab,setTab]=useState("首頁");
 const [flight,setFlight]=useState<Flight|null>(flights[0]);
 const [hotel,setHotel]=useState<HotelOption|null>(null);
 const [room,setRoom]=useState(0);
 const [guests,setGuests]=useState(2);
 const [stage,setStage]=useState<"list"|"detail"|"checkout">("list");
 const orders=(()=>{try{return JSON.parse(String(p.ui?.tripOrders||"[]")) as any[]}catch{return[]}})();
 const orderTotal=(flight?.price||0)+(hotel?(hotel.price+hotel.rooms[room].price)*2:0);
 const startHotel=(h:HotelOption)=>{setHotel(h);setRoom(0);setStage("detail");};
 const placeOrder=()=>{
  if(!flight||!hotel)return;
  const id="TR"+Date.now().toString().slice(-8);
  const order={id,status:"待付款",flight,hotel:hotel.name,room:hotel.rooms[room].name,guests,checkIn:dates.out,checkOut:dates.back,nights:2,total:orderTotal,createdAt:Date.now()};
  p.onUi?.("tripOrders",JSON.stringify([order,...orders]));
  p.onAppUi?.("jkopay","pendingTripPayment",JSON.stringify({paymentId:id,total:orderTotal,merchant:"Trip 旅行",note:flight.airline+" 往返機票、"+hotel.name+" "+hotel.rooms[room].name,order}));
  setStage("list");setTab("訂單");p.onOpenApp?.("jkopay");
 };
 return <div className="catalog-skin trip-ui">
  <header className="trip-header"><div><small>YOUR WEEKEND GETAWAY</small><h1>Trip <span>✈</span></h1></div><button onClick={()=>setTab("訂單")}>我的訂單</button></header>
  <div className="trip-scroll">
   {stage==="checkout"? <><button className="trip-back" onClick={()=>setStage("detail")}><ChevronLeft size={17}/> 返回</button><h2>確認旅行訂單</h2><div className="trip-summary"><b>{dates.out} – {dates.back} · 2 晚</b><p>桃園 TPE ⇄ 吉隆坡 KUL · {guests} 位成人</p><p>{flight?.airline}</p><p>{hotel?.name} · {hotel?.rooms[room].name} × 2 晚</p><strong>{money(orderTotal)}</strong></div><button className="trip-primary" onClick={placeOrder}>提交訂單並前往街口支付</button></> :
   tab==="訂單"? <><h2>我的旅行訂單</h2>{orders.length?orders.map(o=><article className="trip-order" key={o.id}><b>{o.hotel}</b><small>{o.checkIn} – {o.checkOut} · {o.room}</small><strong>{money(o.total)}</strong><span>{o.status}</span></article>):<p className="trip-empty">還沒有旅行訂單，先規劃一趟週末旅行吧。</p>}</> :
   stage==="detail"&&hotel?<><button className="trip-back" onClick={()=>setStage("list")}><ChevronLeft size={17}/> 返回酒店列表</button><div className={"trip-hotel-art "+hotel.image}><span>吉隆坡 · MALAYSIA</span></div><h2>{hotel.name}</h2><p className="trip-muted">{hotel.area} · {"★".repeat(hotel.stars)}</p><p>{hotel.blurb}</p><div className="trip-price">{money(hotel.price)} <small>/ 晚起</small></div><h3>選擇房型</h3>{hotel.rooms.map((r,i)=><button className={"trip-room "+(room===i?"selected":"")} key={r.name} onClick={()=>setRoom(i)}><span><b>{r.name}</b><small>{r.desc}</small></span><strong>{money(hotel.price+r.price)}</strong></button>)}<label>入住人數<select value={guests} onChange={e=>setGuests(Number(e.target.value))}><option value={1}>1 位成人</option><option value={2}>2 位成人</option></select></label><div className="trip-dates">入住 {dates.out}（五）　退房 {dates.back}（日）</div><button className="trip-primary" onClick={()=>setStage("checkout")}>確認房型</button></> :
   tab==="機票"? <><h2>桃園 ⇄ 吉隆坡</h2><div className="trip-route"><b>TPE</b><Plane/><b>KUL</b><small>{dates.out} 出發 · {dates.back} 回程</small></div>{flights.map(f=><button className={"trip-flight "+(flight?.id===f.id?"selected":"")} key={f.id} onClick={()=>setFlight(f)}><span><b>{f.airline}</b><small>去程 {f.depart} → {f.arrive}　回程 {f.returnDepart} → {f.returnArrive}</small><small>{f.duration} · {f.baggage}</small></span><strong>{money(f.price)}</strong></button>)}<button className="trip-primary" disabled={!flight} onClick={()=>setTab("酒店")}>選好機票，挑選酒店</button></> :
   <><div className="trip-hero"><small>YOUR NEXT ADVENTURE</small><h2>吉隆坡週末小旅行</h2><p>把驚喜，留在演唱會現場。</p><div className="trip-hero-date">{dates.out}（五）— {dates.back}（日）</div><div className="trip-hero-route">桃園 TPE <ArrowRight size={16}/> 吉隆坡 KUL</div></div><div className="trip-quick"><button onClick={()=>setTab("機票")}><Plane/>選擇往返機票</button><button onClick={()=>setTab("酒店")}><Hotel/>挑選住宿</button></div><h3>精選航班</h3>{flights.slice(0,2).map(f=><button className="trip-flight" key={f.id} onClick={()=>{setFlight(f);setTab("機票")}}><span><b>{f.airline}</b><small>{f.depart} → {f.arrive} · {f.duration}</small></span><strong>{money(f.price)}</strong></button>)}<h3>人氣酒店</h3>{hotels.map(h=><button className="trip-hotel-row" key={h.id} onClick={()=>startHotel(h)}><span className={"trip-hotel-thumb "+h.image}></span><span><b>{h.name}</b><small>{h.area}</small><small>{"★".repeat(h.stars)} · {money(h.price)} / 晚起</small></span><ChevronLeft className="trip-chevron" size={18}/></button>)}</>}
  </div>
  <nav className="trip-tabs">{["首頁","機票","酒店","訂單"].map((t,i)=><button className={tab===t?"active":""} key={t} onClick={()=>{setTab(t);setStage("list")}}>{[<MapPin/>,<Plane/>,<BedDouble/>,<CalendarDays/>][i]}{t}</button>)}</nav>
 </div>;
}
