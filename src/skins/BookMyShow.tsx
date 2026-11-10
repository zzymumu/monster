import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Ticket, ChevronLeft, QrCode, CalendarDays, MapPin } from "lucide-react";
import type { Props } from "./shared";

type Zone = { id:string; name:string; price:number; color:string; desc:string };
type TicketOrder = { id:string; status:string; event:string; date:string; venue:string; zone:string; seats:string[]; quantity:number; totalRm:number; totalNtd:number; createdAt:string };
const zones:Zone[]=[
 {id:"VIP",name:"VIP",price:1088,color:"#f4a5c9",desc:"舞台前方 · A1 / A6"},
 {id:"P1",name:"P1",price:898,color:"#23cbd0",desc:"舞台近区"},
 {id:"P2",name:"P2",price:768,color:"#56dc42",desc:"内场及看台"},
 {id:"P3",name:"P3",price:698,color:"#42b85d",desc:"Level 1 看台"},
 {id:"P4",name:"P4",price:598,color:"#ffe329",desc:"Level 2 看台"},
 {id:"P5",name:"P5",price:538,color:"#f5a52d",desc:"Level 2 看台"},
 {id:"P6",name:"P6",price:438,color:"#ce3347",desc:"Level 3 看台"},
 {id:"P7",name:"P7",price:338,color:"#3434a5",desc:"远端看台"}
];
const money=(n:number)=>"NT$ "+Math.round(n).toLocaleString("zh-TW");
function upcomingSaturday(){
 const d=new Date(); const delta=(6-d.getDay()+7)%7; d.setDate(d.getDate()+delta); d.setHours(20,0,0,0); return d;
}
function dateLabel(d:Date){return new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",weekday:"short"}).format(d);}
function seatNames(zone:string,qty:number){
 if(zone==="VIP") return qty===1?["A1 · 1排 · 9號"]:["A1 · 1排 · 9號","A1 · 1排 · 10號"];
 return Array.from({length:qty},(_,i)=>zone+" · 1排 · "+(9+i)+"號");
}
export function BookMyShowSkin(p:Props){
 const [page,setPage]=useState<"home"|"queue"|"zone"|"seats"|"confirm"|"ticket">("home");
 const [zone,setZone]=useState("VIP");
 const [qty,setQty]=useState(2);
 const [elapsed,setElapsed]=useState(0);
 const [queueReady,setQueueReady]=useState(false);
 const [quantityOpen,setQuantityOpen]=useState(false);
 const [lockStage,setLockStage]=useState<"idle"|"locking"|"success">("idle");
 const [systemBusy,setSystemBusy]=useState(false);
 const eventDate=useMemo(()=>upcomingSaturday(),[]);
 const dateText=dateLabel(eventDate);
 const orders=useMemo(()=>{try{return JSON.parse(String(p.ui?.bookmyshowOrders||"[]")) as TicketOrder[]}catch{return[]}},[p.ui?.bookmyshowOrders]);
 const selectedZone=zones.find(z=>z.id===zone)!;
 const totalRm=selectedZone.price*qty;
 const totalNtd=Math.round(totalRm*7.4);
 const seats=seatNames(zone,qty);
 useEffect(()=>{
  if(page==="seats"){
   // Seat allocation is a short transition only: lock, show success, then go straight to order confirmation.
   setLockStage("locking");
   const successTimer=window.setTimeout(()=>setLockStage("success"),900);
   const confirmTimer=window.setTimeout(()=>setPage("confirm"),1550);
   return()=>{window.clearTimeout(successTimer);window.clearTimeout(confirmTimer);};
  }
  setLockStage("idle");
 },[page]);
 useEffect(()=>{
  if(page!=="queue"){setElapsed(0);setQueueReady(false);return;}
  const started=Date.now();
  const timer=window.setInterval(()=>{
   const next=Math.min(20,(Date.now()-started)/1000);
   setElapsed(next);
   if(next>=20){setQueueReady(true);window.clearInterval(timer);}
  },100);
  return()=>window.clearInterval(timer);
 },[page]);
 const startQueue=()=>{if(p.ui?.bookmyshowSoldOut===true||orders.some(order=>order.status==="已付款")){setSystemBusy(true);return;}setElapsed(0);setQueueReady(false);setPage("queue");};
 const createOrder=()=>{
  if(p.ui?.bookmyshowSoldOut===true||orders.some(order=>order.status==="已付款")){setSystemBusy(true);return;}
  const id="BMS"+Date.now().toString().slice(-9);
  const next:TicketOrder={id,status:"待付款",event:"五月天《回到那一天》马来西亚站",date:dateText,venue:"National Stadium Bukit Jalil",zone,seats,quantity:qty,totalRm,totalNtd,createdAt:new Date().toLocaleString("zh-TW")};
  const nextOrders=[next,...orders];
  p.onUi?.("bookmyshowOrders",JSON.stringify(nextOrders));
  p.onAppUi?.("jkopay","pendingBookMyShowPayment",JSON.stringify({paymentId:id,total:totalNtd,note:next.event+" · "+dateText+" · "+zone+" · "+seats.join("、")+"（RM "+totalRm.toLocaleString("en-MY")+"）",order:next}));
  p.onOpenApp?.("jkopay");
 };
 const back=()=>{if(page==="home"||page==="ticket"){p.onBack();return;}setPage(page==="queue"?"home":page==="zone"?"home":page==="seats"?"zone":page==="confirm"?"seats":"home");};
 const renderSeatMap=()=>(
  <div style={{background:"linear-gradient(155deg,#40145b,#a05b9f)",borderRadius:18,padding:13,color:"#fff",margin:"12px 0"}}>
   <div style={{textAlign:"center",background:"#fff",color:"#222",fontWeight:900,padding:8,borderRadius:7,margin:"0 auto 12px",width:"42%"}}>STAGE 舞台</div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(10,minmax(0,1fr))",gap:3}}>
    {["A5","A4","A3","A2","A1","A6","A7","A8","A9","A10"].map((v,i)=><div key={v} style={{background:i===4?"#f3a4ca":"#75dce3",color:"#31133e",fontSize:9,textAlign:"center",padding:"8px 0",borderRadius:4,fontWeight:800}}>{v}</div>)}
   </div>
   <div style={{textAlign:"center",fontSize:11,margin:"12px 0 6px",color:"#ffe5a8"}}>FIELD · 内场</div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:4}}>
    {Array.from({length:32},(_,i)=><div key={i} style={{height:13,borderRadius:3,background:i%4===0?"#48d83e":i%3===0?"#26c9cf":"#f4dc39"}}/>)}
   </div>
   <div style={{marginTop:12,display:"flex",justifyContent:"center",gap:5,flexWrap:"wrap"}}>
    {zones.map(z=><span key={z.id} style={{fontSize:9,background:z.color,color:"#28152d",padding:"3px 6px",borderRadius:5}}>{z.id} RM{z.price}</span>)}
   </div>
   <p style={{fontSize:10,textAlign:"center",opacity:.8,margin:"10px 0 0"}}>座位分区示意图 · 非实际比例</p>
  </div>
 );
 return <div className="catalog-skin" style={{"--app-accent":"#e51b24",background:"#f6f6f7"} as CSSProperties}>
  <header style={{height:48,flexShrink:0,background:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 15px",borderBottom:"1px solid #eee"}}>
   <button onClick={back} aria-label="返回" style={{border:0,background:"none",fontSize:22,color:"#222"}}>{page==="home"||page==="ticket"?"‹":<ChevronLeft/>}</button>
   <strong style={{fontSize:16,color:"#e51b24",fontWeight:900,letterSpacing:-.4}}>bookmyshow</strong>
   <button onClick={()=>setPage("ticket")} style={{border:0,background:"none",color:"#e51b24",fontSize:12}}>我的票夹</button>
  </header>
  <main className="catalog-scroll" style={{padding:"13px 14px 24px"}}>
   {page==="home"&&<>
    <div style={{background:"linear-gradient(145deg,#260b35,#642052 60%,#d12d59)",borderRadius:18,color:"#fff",padding:"18px 17px",minHeight:190,position:"relative",overflow:"hidden"}}>
     <small style={{letterSpacing:2,opacity:.8}}>BOOK TICKETS · LIVE YOUR SHOW</small>
     <h1 style={{fontSize:30,letterSpacing:2,margin:"17px 0 5px",fontWeight:950}}>MAYDAY</h1>
     <div style={{fontSize:20,fontWeight:850,lineHeight:1.35}}>五月天《回到那一天》</div>
     <div style={{fontSize:13,marginTop:4}}>马来西亚站 · 吉隆坡</div>
     <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,opacity:.9,marginTop:17}}><span><CalendarDays size={13} style={{verticalAlign:"middle"}}/> {dateText}</span><span><MapPin size={13} style={{verticalAlign:"middle"}}/> National Stadium Bukit Jalil</span></div>
     <div style={{position:"absolute",right:12,top:12,fontSize:52,opacity:.12}}>♫</div>
    </div>
    <div style={{background:"#fff",borderRadius:14,padding:14,marginTop:13}}>
     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><b style={{fontSize:15}}>五月天《回到那一天》马来西亚站</b><span style={{fontSize:10,color:"#e51b24",fontWeight:800}}>HOT</span></div>
     <p style={{color:"#777",fontSize:12,margin:"8px 0"}}>{dateText} · 20:00 开演</p>
     <p style={{fontSize:12,color:"#777",margin:"0 0 12px"}}>National Stadium Bukit Jalil · Kuala Lumpur</p>
     <button onClick={startQueue} style={{width:"100%",border:0,borderRadius:10,background:"#e51b24",color:"#fff",fontWeight:800,padding:13,fontSize:14}}>立即抢票</button>
    </div>
    <h3 style={{fontSize:14,margin:"18px 2px 9px"}}>票价一览</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:7}}>{zones.map(z=><div key={z.id} style={{background:"#fff",borderRadius:10,padding:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span><b style={{color:z.color===" #3434a5"?"#3434a5":"#333"}}>{z.name}</b><small style={{display:"block",color:"#888",fontSize:10}}>{z.desc}</small></span><strong style={{fontSize:12}}>RM {z.price}</strong></div>)}</div>
   </>}
   {page==="queue"&&<div style={{background:"#fff",borderRadius:18,padding:20,textAlign:"center",marginTop:10}}>
    <div style={{width:64,height:64,borderRadius:18,background:"#fff0f0",color:"#e51b24",display:"grid",placeItems:"center",margin:"8px auto 16px"}}><Ticket size={34}/></div>
    <h2 style={{fontSize:20,margin:"4px 0"}}>正在排队等候</h2><b style={{fontSize:13}}>五月天《回到那一天》马来西亚站</b>
    <p style={{fontSize:12,color:"#777",lineHeight:1.6}}>请勿关闭或刷新页面，系统正在为你取得购票资格。</p>
    <div style={{height:12,background:"#eee",borderRadius:20,overflow:"hidden",margin:"22px 0 10px"}}><div style={{height:"100%",width:(elapsed/20*100)+"%",background:"linear-gradient(90deg,#e51b24,#ff7a45)",transition:"width .1s"}}/></div>
    <div style={{fontSize:15,fontWeight:800,color:"#e51b24",marginTop:12}}>系统正在为你安排购票顺序</div>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginTop:15}}><span>目前排队人数</span><b style={{color:"#333"}}>{queueReady?"0":Math.max(0,1286-Math.floor(elapsed*64)).toLocaleString("en-US")} 人</b></div>
    <p style={{fontSize:12,color:queueReady?"#159447":"#888",marginTop:18}}>{queueReady?"排队完成！已取得购票资格":"正在确认排队状态…"}</p>
    <button disabled={!queueReady} onClick={()=>setPage("zone")} style={{width:"100%",border:0,borderRadius:10,background:queueReady?"#e51b24":"#ccc",color:"#fff",fontWeight:800,padding:13,marginTop:8}}>进入选票</button>
   </div>}
   {page==="zone"&&<>
    <h2 style={{fontSize:20,margin:"5px 0"}}>选择票区与票价</h2><p style={{color:"#777",fontSize:12}}>票价以马币 RM 显示，座位依票区安排。</p>
    {renderSeatMap()}
    {zones.map(z=><button key={z.id} onClick={()=>setZone(z.id)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",border:zone===z.id?"2px solid #e51b24":"1px solid #e5e5e5",background:zone===z.id?"#fff5f5":"#fff",borderRadius:11,padding:12,marginBottom:7,textAlign:"left"}}><span style={{display:"flex",alignItems:"center",gap:9}}><i style={{width:13,height:13,borderRadius:4,background:z.color}}/><span><b>{z.name} 区</b><small style={{display:"block",color:"#888",fontSize:11}}>{z.desc}</small></span></span><strong>RM {z.price.toLocaleString("en-MY")}</strong></button>)}
    <div style={{background:"#fff",borderRadius:10,marginTop:10,overflow:"hidden"}}>
     <button onClick={()=>setQuantityOpen(v=>!v)} aria-expanded={quantityOpen} style={{width:"100%",border:0,background:"#fff",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,textAlign:"left"}}>
      <span><b>购买张数</b><small style={{display:"block",color:"#888",marginTop:4}}>目前选择：{qty} 张{qty>1?"（连号）":""}</small></span><span style={{color:"#777",fontSize:17}}>{quantityOpen?"⌃":"⌄"}</span>
     </button>
     {quantityOpen&&<div style={{padding:"0 12px 12px"}}><select value={qty} onChange={e=>setQty(Number(e.target.value))} style={{width:"100%",border:0,background:"#f5f5f5",padding:10,borderRadius:7}}><option value={1}>1 张</option><option value={2}>2 张（连号）</option><option value={3}>3 张</option><option value={4}>4 张</option></select></div>}
    </div>
    <button onClick={()=>setPage("seats")} style={{width:"100%",border:0,borderRadius:10,background:"#e51b24",color:"#fff",padding:13,fontWeight:800,marginTop:12}}>确认票区，查看座位</button>
   </>}
   {page==="seats"&&<div style={{background:"#fff",borderRadius:14,padding:18,marginTop:12,textAlign:"center"}}>
    <b style={{fontSize:15}}>已为你分配连续座位</b>
    <div style={{fontSize:22,fontWeight:900,color:"#e51b24",margin:"12px 0"}}>A1 区 · 第 1 排 · 9 号、10 号</div>
    <p style={{fontSize:12,color:"#888",margin:0}}>座位锁定完成后将自动进入确认订单</p>
   </div>}
   {page==="confirm"&&<><h2 style={{fontSize:20}}>确认订单</h2><div style={{background:"#fff",borderRadius:14,padding:15,lineHeight:1.9,fontSize:12}}><b style={{fontSize:15}}>五月天《回到那一天》马来西亚站</b><p>{dateText} · 20:00</p><p>National Stadium Bukit Jalil</p><p>票区：{zone} · {qty} 张</p><p>座位：{seats.join("、")}</p><p>票价：RM {selectedZone.price.toLocaleString("en-MY")} × {qty}</p><hr/><b style={{fontSize:17,color:"#e51b24"}}>RM {totalRm.toLocaleString("en-MY")}</b><p style={{color:"#777"}}>折合约 {money(totalNtd)}</p></div><button onClick={createOrder} style={{width:"100%",border:0,borderRadius:10,background:"#e51b24",color:"#fff",padding:14,fontWeight:850,marginTop:14}}>提交订单并前往街口支付</button></>}
   {page==="ticket"&&<><h2 style={{fontSize:20}}>我的票夹</h2>{orders.length?orders.map(o=><div key={o.id} style={{background:"#fff",borderRadius:14,padding:14,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><b>{o.event}</b><small style={{color:o.status==="已付款"?"#16934a":"#e58b1a"}}>{o.status}</small></div><p style={{fontSize:11,color:"#777"}}>{o.date} · 20:00 · {o.venue}</p><h3 style={{color:"#e51b24"}}>{o.zone} · {o.seats.join("、")}</h3><div style={{height:94,background:"#fafafa",border:"1px solid #eee",borderRadius:8,display:"grid",placeItems:"center"}}><QrCode size={66}/></div><small style={{color:"#888"}}>订单编号：{o.id}</small></div>):<p style={{color:"#888"}}>还没有门票订单。</p>}</>}
  </main>
  {systemBusy&&<div role="dialog" aria-modal="true" style={{position:"absolute",inset:48,zIndex:40,display:"grid",placeItems:"center",padding:22,pointerEvents:"auto"}}><div style={{width:"100%",maxWidth:320,background:"#fff",borderRadius:16,padding:22,textAlign:"center",boxShadow:"0 8px 28px rgba(20,30,50,.14)"}}><div style={{fontSize:34,marginBottom:8,color:"#e51b24"}}>!</div><b style={{fontSize:18}}>目前系统繁忙</b><p style={{fontSize:13,color:"#777",lineHeight:1.6,margin:"10px 0 18px"}}>目前购票系统繁忙，暂时无法再次进入购票流程，请稍后再试。</p><button onClick={()=>setSystemBusy(false)} style={{width:"100%",border:0,borderRadius:9,background:"#e51b24",color:"#fff",padding:12,fontWeight:800}}>我知道了</button></div></div>}
  {page==="seats"&&lockStage!=="idle"&&<div role="dialog" aria-modal="true" style={{position:"absolute",inset:48,zIndex:30,background:"transparent",pointerEvents:"none",display:"grid",placeItems:"center",padding:20}}>
   <div style={{width:"100%",maxWidth:340,background:"#fff",borderRadius:18,padding:22,textAlign:"center",boxShadow:"0 10px 30px rgba(20,30,50,.12)",pointerEvents:"auto"}}>
    {lockStage==="locking"&&<><div style={{width:42,height:42,border:"4px solid #f5d5d5",borderTopColor:"#e51b24",borderRadius:"50%",margin:"0 auto 14px",animation:"bms-spin .8s linear infinite"}}/><b style={{fontSize:17}}>正在锁定座位…</b><p style={{fontSize:12,color:"#888",marginBottom:0}}>请稍候，系统正在为你保留所选座位</p></>}
    {lockStage==="success"&&<><div style={{width:48,height:48,borderRadius:24,background:"#e8f7ed",color:"#159447",display:"grid",placeItems:"center",fontSize:28,margin:"0 auto 12px"}}>✓</div><b style={{fontSize:18,color:"#159447"}}>座位锁定成功！</b><p style={{fontSize:12,color:"#888",marginBottom:0}}>已为你保留连续座位</p></>}

   </div>
  </div>}
  <style>{'@keyframes bms-spin{to{transform:rotate(360deg)}}'}</style>
  <nav style={{height:54,flexShrink:0,background:"#fff",borderTop:"1px solid #eee",display:"flex",justifyContent:"space-around",alignItems:"center"}}><button onClick={()=>setPage("home")} style={{border:0,background:"none",color:page==="home"?"#e51b24":"#888",fontSize:11}}>⌂<br/>首页</button><button onClick={()=>setPage("ticket")} style={{border:0,background:"none",color:page==="ticket"?"#e51b24":"#888",fontSize:11}}>▣<br/>我的票夹</button></nav>
 </div>;
}
