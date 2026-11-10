import { useMemo, useState, useEffect } from "react";
import { Plane, Hotel, CalendarDays, ChevronLeft, ArrowRight, MapPin, BedDouble } from "lucide-react";
import type { Props } from "./shared";

type Flight = { id:string; airline:string; depart:string; arrive:string; returnDepart:string; returnArrive:string; duration:string; baggage:string; price:number; };
type TripOrder = {id:string;status:string;hotel:string;room:string;checkIn:string;checkOut:string;total:number;flight:Flight;concert?:string;seats?:string[];};
type HotelOption = { id:string; name:string; area:string; stars:number; price:number; image:string; imageUrl:string; coverUrl:string; blurb:string; rooms:{name:string;price:number;desc:string}[]; };
const flights:Flight[]=[
 {id:"airasia",airline:"AirAsia 亞洲航空",depart:"06:45",arrive:"11:35",returnDepart:"20:10",returnArrive:"01:00+1",duration:"4 小時 50 分",baggage:"手提行李 7kg",price:8990},
 {id:"scoot",airline:"Scoot 酷航",depart:"01:50",arrive:"10:15",returnDepart:"11:20",returnArrive:"21:40",duration:"8 小時 25 分（轉機）",baggage:"手提行李 10kg",price:10680},
 {id:"malaysia",airline:"Malaysia Airlines 馬來西亞航空",depart:"15:10",arrive:"20:05",returnDepart:"09:50",returnArrive:"14:45",duration:"4 小時 55 分",baggage:"托運行李 25kg",price:14800},
 {id:"china",airline:"中華航空",depart:"08:25",arrive:"13:25",returnDepart:"14:45",returnArrive:"19:35",duration:"5 小時",baggage:"托運行李 23kg",price:15900}
];
const hotels:HotelOption[]=[
 {id:"jw",name:"吉隆坡 JW 萬豪酒店",area:"武吉免登 · Pavilion 商圈",stars:5,price:4200,image:"jw",imageUrl:"https://cache.marriott.com/content/dam/marriott-renditions/KULDT/kuldt-guestroom-0017-hor-wide.jpg?downsize=1336px%3A%2A&interpolation=progressive-bilinear&output-quality=70",coverUrl:"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/33/42/fc/79/caption.jpg?h=1400&s=1&w=1400",blurb:"經典五星住宿，購物與美食就在附近",rooms:[{name:"豪華客房・一特大床",price:0,desc:"約 40㎡ · 城市景觀"},{name:"豪華客房・兩張雙人床",price:450,desc:"適合雙人同行 · 城市景觀"},{name:"行政客房",price:1800,desc:"行政酒廊禮遇 · 高樓層"}]},
 {id:"ibis",name:"宜必思吉隆坡市中心酒店",area:"吉隆坡市中心 · 雙子塔周邊",stars:4,price:2450,image:"ibis",imageUrl:"https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/402091909.jpg?k=03e2044903416c0fd341e15430414ae01a4674ae357c9b584cfc2a02db06a2a2&o=&s=375x",coverUrl:"https://s.content4travel.com/pim-cdk/hbx636479_1_6af18ab6d6.jpg",blurb:"交通便利，屋頂泳池可眺望城市",rooms:[{name:"標準客房・一大床",price:0,desc:"約 20㎡ · 城市景觀"},{name:"標準客房・兩小床",price:180,desc:"雙床配置 · 城市景觀"},{name:"高級客房",price:520,desc:"較寬敞空間 · 高樓層"}]},
 {id:"holma",name:"網紅泳池吉隆坡市中心雙子塔豪瑪",area:"吉隆坡市中心 · 雙子塔步行圈",stars:4,price:3150,image:"holma",imageUrl:"https://ak-d.tripcdn.com/images/020491200052tl1p915DE_R_500_400_R5.webp",coverUrl:"https://ak-d.tripcdn.com/images/0584712000sqjy8ai845C_R_500_400_R5.webp",blurb:"高空無邊際泳池與雙子塔景觀",rooms:[{name:"豪華公寓・雙人房",price:0,desc:"公寓式空間 · 城市景觀"},{name:"雙子塔景觀套房",price:900,desc:"雙子塔景觀 · 獨立起居區"},{name:"高樓層泳池景觀房",price:650,desc:"高樓層 · 泳池景觀"}]},
 {id:"westin",name:"吉隆坡威斯汀酒店",area:"武吉免登 · Pavilion 商圈",stars:5,price:4100,image:"westin",imageUrl:"https://cache.marriott.com/content/dam/marriott-renditions/KULWI/kulwi-deluxe-guestroom-8475-hor-clsc.jpg?downsize=1215px%3A%2A&interpolation=progressive-bilinear&output-quality=70",coverUrl:"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/b5/2c/7e/the-hotel--v3742831.jpg?h=500&s=1&w=500",blurb:"舒適寬敞客房，鄰近購物與餐飲",rooms:[{name:"豪華客房・一特大床",price:0,desc:"約 38㎡ · 城市景觀"},{name:"豪華客房・兩張雙人床",price:350,desc:"雙床配置 · 城市景觀"},{name:"行政套房",price:2100,desc:"獨立起居空間 · 行政禮遇"}]},
 {id:"hilton",name:"吉隆坡東姑阿都拉曼希爾頓花園酒店",area:"秋傑 · 東姑阿都拉曼路",stars:4,price:1850,image:"hilton",imageUrl:"https://www.hilton.com/im/en/KULMYGI/21626050/room-2-q1-copy.jpg?ch=2812&cw=5000&gravity=NorthWest&impolicy=crop&rh=675&rw=1200&xposition=0&yposition=0",coverUrl:"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/45/70/60/caption.jpg?h=1100&s=1&w=1100",blurb:"實惠舒適，適合精打細算的旅程",rooms:[{name:"標準客房・一大床",price:0,desc:"基本舒適配置"},{name:"高級客房・雙床",price:260,desc:"兩張單人床"},{name:"豪華客房",price:480,desc:"較高樓層 · 城市景觀"}]},
 {id:"holiday",name:"吉隆坡市中心智選假日酒店",area:"金三角 · 市中心",stars:3,price:2380,image:"holiday",imageUrl:"https://digital.ihg.com/is/image/ihg/holiday-inn-express-kuala-lumpur-4589070456-4x3",coverUrl:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/502802020.jpg?k=a6c3e6711ebf802da1bd04112a9fde5ad5c0176eebb6d0a1bcd7ae5870672889&o=",blurb:"簡潔便利，含早餐方案可選",rooms:[{name:"標準客房・一大床",price:0,desc:"簡約舒適"},{name:"標準客房・兩小床",price:180,desc:"雙床配置"},{name:"含早餐客房",price:420,desc:"雙人早餐 · 每日"}]},
 {id:"intercon",name:"吉隆坡洲際酒店",area:"吉隆坡市中心 · Ampang 路",stars:5,price:5200,image:"intercon",imageUrl:"https://ejmse4m6ybw.exactdn.com/resources/intercontinental-kuala-lumpur-one-bedroom-suite-2-1777939770.jpg",coverUrl:"https://ejmse4m6ybw.exactdn.com/resources/intercontinental-hotels-home.jpg",blurb:"五星奢華體驗，鄰近雙子塔",rooms:[{name:"經典客房・一特大床",price:0,desc:"寬敞客房 · 城市景觀"},{name:"經典客房・兩張單人床",price:350,desc:"雙床配置"},{name:"行政客房",price:1900,desc:"行政酒廊禮遇"}]}
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
 const [concertStage,setConcertStage]=useState<"intro"|"queue"|"zone"|"seats"|"confirm"|"success">("intro");
 const [queueReady,setQueueReady]=useState(false);
 const [ticketQty,setTicketQty]=useState(2);
 const [ticketZone,setTicketZone]=useState("VIP");
 const [ticketOrder,setTicketOrder]=useState<{id:string;seats:string[];total:number}|null>(null);
 useEffect(()=>{if(concertStage!=="queue"){setQueueReady(false);return;}const timer=window.setTimeout(()=>setQueueReady(true),2600);return()=>window.clearTimeout(timer);},[concertStage]);
 const ticketPrices:Record<string,number>={VIP:1088,P1:898,P2:768,P3:768,P4:598,P5:538,P6:438,P7:338};
 const ticketSeats=ticketQty===2?["A1區・1排・9號","A1區・1排・10號"]:["A1區・1排・9號"];
 const ticketTotalRm=ticketPrices[ticketZone]*ticketQty;
 const payConcert=()=>{
  const id="MAY"+Date.now().toString().slice(-8);
  const total=Math.round(ticketTotalRm*7.4);
  const order={id,status:"待付款",hotel:"五月天《回到那一天》馬來西亞站",room:"A1區 · "+ticketSeats.join("、"),checkIn:"2026/01/31",checkOut:"2026/01/31",total,flight:{id:"concert",airline:"五月天演唱會門票",depart:"20:00",arrive:"",returnDepart:"",returnArrive:"",duration:"",baggage:"",price:total},concert:"五月天《回到那一天》馬來西亞站",seats:ticketSeats};
  p.onUi?.("tripOrders",JSON.stringify([order,...orders]));
  p.onAppUi?.("jkopay","pendingTripPayment",JSON.stringify({paymentId:id,total,merchant:"Trip 演唱會票務",note:"五月天《回到那一天》馬來西亞站 · "+ticketSeats.join("、")+"（RM "+ticketTotalRm.toLocaleString("en-MY")+"）",order}));
  setTicketOrder({id,seats:ticketSeats,total});
  setConcertStage("success");
  p.onOpenApp?.("jkopay");
 };
 const orders=(()=>{try{return JSON.parse(String(p.ui?.tripOrders||"[]")) as TripOrder[]}catch{return[]}})();
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
   {tab==="演唱會"? <div style={{padding:"4px 0 20px",color:"#24152f"}}>
    {concertStage==="intro"? <div>
      <div style={{background:"linear-gradient(145deg,#32104f,#7e3b91)",color:"#fff",borderRadius:18,padding:18,marginBottom:14}}>
       <div style={{fontSize:12,letterSpacing:3,opacity:.8}}>MAYDAY · LIVE NATION</div><h2 style={{fontSize:28,margin:"10px 0"}}>五月天</h2><h3 style={{margin:"0 0 10px"}}>回到那一天｜馬來西亞站</h3><div>2026.01.31（SAT） · 8:00 PM</div><div>National Stadium Bukit Jalil</div>
      </div>
      <div style={{background:"#fff",borderRadius:14,padding:14,marginBottom:14}}><b>票價資訊（馬幣 RM）</b><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>{Object.entries(ticketPrices).map(([z,v])=><div key={z} style={{padding:9,borderRadius:9,background:"#f4edf8"}}><b>{z}</b><span style={{float:"right"}}>RM {v}</span></div>)}</div></div>
      <p style={{fontSize:13,color:"#766d7c"}}>本遊戲為劇情模擬票務。搶票過程會模擬排隊與隨機配票；成功後固定取得 A1 區第一排 9、10 號連號座位。</p>
      <button className="trip-primary" onClick={()=>setConcertStage("queue")}>立即搶票</button>
    </div> : null}
    {concertStage==="queue"? <div style={{background:"#fff",borderRadius:16,padding:20,textAlign:"center"}}><h2>正在排隊中</h2><div style={{fontSize:46,margin:"24px 0"}}>🎫</div><b>五月天《回到那一天》馬來西亞站</b><p style={{color:"#777"}}>系統正在為你保留購票資格，請勿關閉頁面</p><div style={{height:9,background:"#eee",borderRadius:9,overflow:"hidden",margin:"22px 0"}}><div style={{height:"100%",width:queueReady?"100%":"68%",background:"#6d3b91",transition:"width .4s"}}/></div><p>{queueReady?"排隊完成！已取得購票資格":"前方尚有 1,286 人 · 正在等待"}</p><button className="trip-primary" disabled={!queueReady} onClick={()=>setConcertStage("zone")}>進入選票</button></div>:null}
    {concertStage==="zone"? <div><button className="trip-back" onClick={()=>setConcertStage("intro")}><ChevronLeft size={17}/> 返回</button><h2>選擇票區</h2><p className="trip-muted">依照座位圖選擇票區，系統將自動分配座位</p>{Object.entries(ticketPrices).map(([z,v])=><button key={z} className={"trip-room "+(ticketZone===z?"selected":"")} onClick={()=>setTicketZone(z)}><span><b>{z} 區</b><small>{z==="VIP"?"舞台前方 · A1 區": "依官方座位圖票區"}</small></span><strong>RM {v}</strong></button>)}<label>購買張數<select value={ticketQty} onChange={e=>setTicketQty(Number(e.target.value))}><option value={1}>1 張</option><option value={2}>2 張（連號）</option></select></label><button className="trip-primary" onClick={()=>setConcertStage("seats")}>確認票區</button></div>:null}
    {concertStage==="seats"? <div><button className="trip-back" onClick={()=>setConcertStage("zone")}><ChevronLeft size={17}/> 返回票區</button><h2>座位分配</h2><div style={{background:"linear-gradient(160deg,#38114f,#8e4b9a)",borderRadius:16,padding:14,color:"#fff",textAlign:"center"}}><div style={{background:"#f7d9ee",color:"#351342",fontWeight:800,padding:8,borderRadius:6,margin:"0 auto 16px",maxWidth:190}}>STAGE 舞台</div><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>{["A5","A4","A3","A2","A1"].map(z=><div key={z} style={{background:z==="A1"?"#f7b4db":"#8ce0e7",color:"#24152f",padding:"12px 2px",borderRadius:5,fontSize:12}}>{z}</div>)}</div><div style={{margin:"14px 0 6px",fontSize:12,opacity:.85}}>FIELD · 觀眾席</div><div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:4,opacity:.9}}>{Array.from({length:32},(_,i)=><div key={i} style={{height:16,background:i%3===0?"#61d94e":"#e9d84c",borderRadius:3}}/>)}</div><div style={{marginTop:12,fontSize:12}}>座位圖示意 · 以票務系統實際配位為準</div></div><div style={{marginTop:14,padding:14,border:"2px solid #6d3b91",borderRadius:12,background:"#f8f1fc"}}><b>系統分配結果</b><h3 style={{margin:"10px 0",color:"#6d3b91"}}>A1 區 · 第 1 排</h3><div style={{display:"flex",gap:10}}>{ticketSeats.map(s=><span key={s} style={{background:"#6d3b91",color:"#fff",padding:"10px 12px",borderRadius:8}}>{s.split("・").pop()}</span>)}</div><small style={{display:"block",marginTop:8,color:"#766d7c"}}>{ticketSeats.join("、")} · 連續座位</small></div><button className="trip-primary" onClick={()=>setConcertStage("confirm")}>確認座位</button></div>:null}
    {concertStage==="confirm"? <div><button className="trip-back" onClick={()=>setConcertStage("seats")}><ChevronLeft size={17}/> 返回座位</button><h2>確認演唱會門票</h2><div className="trip-summary"><b>五月天《回到那一天》馬來西亞站</b><p>2026 年 1 月 31 日（六）20:00</p><p>National Stadium Bukit Jalil</p><p>票區：A1 VIP</p><p>座位：{ticketSeats.join("、")}</p><p>票價：RM {ticketTotalRm.toLocaleString("en-MY")}</p><strong>約 {money(Math.round(ticketTotalRm*7.4))}</strong></div><button className="trip-primary" onClick={payConcert}>提交訂單並前往街口支付</button></div>:null}
    {concertStage==="success"? <div style={{background:"#fff",borderRadius:16,padding:20,textAlign:"center"}}><div style={{fontSize:48}}>🎟️</div><h2>門票訂單已建立</h2><p>訂單編號：{ticketOrder?.id}</p><h3>A1 區 · 第 1 排</h3><h2 style={{color:"#6d3b91"}}>{ticketOrder?.seats.join("、")}</h2><p>請完成街口支付以確認訂單</p><button className="trip-primary" onClick={()=>p.onOpenApp?.("jkopay")}>前往街口支付</button></div>:null}
   </div> : stage==="checkout"? <><button className="trip-back" onClick={()=>setStage("detail")}><ChevronLeft size={17}/> 返回</button><h2>確認旅行訂單</h2><div className="trip-summary"><b>{dates.out} – {dates.back} · 2 晚</b><p>桃園 TPE ⇄ 吉隆坡 KUL · {guests} 位成人</p><p>週六為吉隆坡完整遊玩日</p><p>{flight?.airline}</p><p>{hotel?.name} · {hotel?.rooms[room].name} × 2 晚</p><strong>{money(orderTotal)}</strong></div><button className="trip-primary" onClick={placeOrder}>提交訂單並前往街口支付</button></> :
   tab==="訂單"? <><h2>我的旅行訂單</h2>{orders.length?orders.map(o=><article className="trip-order" key={o.id}><b>{o.hotel}</b><small>{o.checkIn} – {o.checkOut} · 2 晚 · {o.room}</small><small>{o.flight?.airline||"往返機票"} · {o.flight?.depart||""} 出發</small><strong>{money(o.total)}</strong><span>{o.status}</span></article>):<p className="trip-empty">還沒有旅行訂單，先規劃一趟週末旅行吧。</p>}</> :
   stage==="detail"&&hotel?<><button className="trip-back" onClick={()=>setStage("list")}><ChevronLeft size={17}/> 返回酒店列表</button><div className="trip-hotel-art" style={{height:160,minHeight:160,maxHeight:160,overflow:"hidden",position:"relative",borderRadius:18,background:"#e8edf2"}}><img src={hotel.imageUrl} alt={hotel.name} style={{display:"block",width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/><span style={{position:"absolute",left:14,bottom:12,color:"#fff",fontSize:12,textShadow:"0 1px 4px #333"}}>吉隆坡 · MALAYSIA</span></div><h2>{hotel.name}</h2><p className="trip-muted">{hotel.area} · {"★".repeat(hotel.stars)}</p><p>{hotel.blurb}</p><div className="trip-price">{money(hotel.price)} <small>/ 晚起</small></div><h3>選擇房型</h3>{hotel.rooms.map((r,i)=><button className={"trip-room "+(room===i?"selected":"")} key={r.name} onClick={()=>setRoom(i)}><span><b>{r.name}</b><small>{r.desc}</small></span><strong>{money(hotel.price+r.price)}</strong></button>)}<label>入住人數<select value={guests} onChange={e=>setGuests(Number(e.target.value))}><option value={1}>1 位成人</option><option value={2}>2 位成人</option></select></label><div className="trip-dates">入住 {dates.out}（五） 退房 {dates.back}（日）</div><button className="trip-primary" onClick={()=>setStage("checkout")}>確認房型</button></> :
   tab==="酒店"? <><h2>吉隆坡精選酒店</h2><p className="trip-muted">週五入住 · 週日退房 · 共 2 晚</p>{hotels.map(h=><button className="trip-hotel-row" key={h.id} onClick={()=>startHotel(h)}><span className="trip-hotel-thumb" style={{display:"block",width:112,height:104,minWidth:112,flex:"0 0 112px",overflow:"hidden",borderRadius:14,background:"#e8edf2"}}><img src={h.coverUrl} alt={h.name} onError={e=>{e.currentTarget.style.display="none"}} style={{display:"block",width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/></span><span><b>{h.name}</b><small>{h.area}</small><small>{"★".repeat(h.stars)} · {money(h.price)} / 晚起</small></span><ChevronLeft className="trip-chevron" size={18}/></button>)}</> :
   tab==="機票"? <><h2>桃園 ⇄ 吉隆坡</h2><div className="trip-route"><b>TPE</b><Plane/><b>KUL</b><small>{dates.out} 出發 · {dates.back} 回程</small></div>{flights.map(f=><button className={"trip-flight "+(flight?.id===f.id?"selected":"")} key={f.id} onClick={()=>setFlight(f)}><span><b>{f.airline}</b><small>去程 {f.depart} → {f.arrive} 回程 {f.returnDepart} → {f.returnArrive}</small><small>{f.duration} · {f.baggage}</small></span><strong>{money(f.price)}</strong></button>)}<button className="trip-primary" disabled={!flight} onClick={()=>setTab("酒店")}>選好機票，挑選酒店</button></> :
   <><div className="trip-hero"><small>YOUR NEXT ADVENTURE</small><h2>吉隆坡週末小旅行</h2><p>把驚喜，留在演唱會現場。</p><div className="trip-hero-date">{dates.out}（五）— {dates.back}（日）</div><p className="trip-itinerary">週五抵達吉隆坡 · 週六完整遊玩一天 · 週日返程</p><div className="trip-hero-route">桃園 TPE <ArrowRight size={16}/> 吉隆坡 KUL</div></div><div className="trip-quick"><button onClick={()=>setTab("機票")}><Plane/>選擇往返機票</button><button onClick={()=>setTab("酒店")}><Hotel/>挑選住宿</button></div><h3>精選航班</h3>{flights.slice(0,2).map(f=><button className="trip-flight" key={f.id} onClick={()=>{setFlight(f);setTab("機票")}}><span><b>{f.airline}</b><small>{f.depart} → {f.arrive} · {f.duration}</small></span><strong>{money(f.price)}</strong></button>)}<h3>人氣酒店</h3>{hotels.map(h=><button className="trip-hotel-row" key={h.id} onClick={()=>startHotel(h)}><span className="trip-hotel-thumb" style={{display:"block",width:112,height:104,minWidth:112,flex:"0 0 112px",overflow:"hidden",borderRadius:14,background:"#e8edf2"}}><img src={h.coverUrl} onError={e=>{e.currentTarget.style.display="none"}} alt={h.name} style={{display:"block",width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/></span><span><b>{h.name}</b><small>{h.area}</small><small>{"★".repeat(h.stars)} · {money(h.price)} / 晚起</small></span><ChevronLeft className="trip-chevron" size={18}/></button>)}</>}
  </div>
  <nav className="trip-tabs">{["首頁","機票","酒店","訂單"].map((t,i)=><button className={tab===t?"active":""} key={t} onClick={()=>{setTab(t);setStage("list");if(t==="演唱會")setConcertStage("intro")}}>{[<MapPin/>,<Plane/>,<BedDouble/>,<CalendarDays/>,<CalendarDays/>][i]}{t}</button>)}</nav>
 </div>;
}
