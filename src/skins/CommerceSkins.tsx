import {
  Home,
  MapPin,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Tag,
  X,
  Users,
  Star,
  Ticket,
  Truck,
  Utensils,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Empty,
  Header,
  Media,
  meta,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
export function AlipaySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "账单");
  const list =
    tab === "卡包"
      ? items.filter((i) => i.folder === "卡包" || i.folder === "票券")
      : items.filter((i) => !["卡包", "票券"].includes(i.folder));
  return (
    <div className="catalog-skin alipay-ui">
      <Header p={p} />
      <div className="alipay-blue">
        <h2>{tab}</h2>
        <div>
          <button onClick={() => setTab("账单")}>
            <Receipt size={28} />
            账单
          </button>
          <button onClick={() => setTab("卡包")}>
            <Ticket size={28} />
            卡包
          </button>
        </div>
        <small>作品内的虚构支付记录</small>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {list.map((i) =>
          tab === "卡包" ? (
            <button
              className="alipay-ticket"
              key={i.id}
              onClick={() => p.onItem(i)}
            >
              <Ticket size={23} />
              <div>
                <strong>{i.title}</strong>
                <p>{i.body}</p>
                <small>{i.time}</small>
              </div>
            </button>
          ) : (
            <button
              className="alipay-bill"
              key={i.id}
              onClick={() => p.onItem(i)}
            >
              <Wallet size={27} />
              <div>
                <strong>{i.title}</strong>
                <small>
                  {meta(i, "merchant", i.sender)} · {i.time.slice(5, 16)}
                </small>
              </div>
              <span>
                <strong>{meta(i, "amount", "—")}</strong>
                <small>{meta(i, "status", "账单记录")}</small>
              </span>
            </button>
          ),
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["账单", "卡包"]}
        value={tab}
        set={setTab}
        icons={[<Receipt />, <Ticket />]}
      />
    </div>
  );
}
export function TaobaoSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "商品");
  const [status, setStatus] = useState("全部");
  const list = items
    .filter((i) =>
      tab === "商品"
        ? i.folder !== "订单" && i.folder !== "物流"
        : i.folder === tab,
    )
    .filter((i) => status === "全部" || meta(i, "status") === status);
  return (
    <div className="catalog-skin taobao-ui">
      <Header p={p} />
      <div className="taobao-search">
        <SearchBox value={q} set={setQ} placeholder="搜索商品或订单" />
      </div>
      <div className="catalog-scroll">
        {tab === "商品" ? (
          <div className="taobao-products">
            {list.map((i) => (
              <button key={i.id} onClick={() => p.onItem(i)}>
                <Media item={i} />
                <strong>{i.title}</strong>
                <p>
                  ¥ <b>{meta(i, "price", "—")}</b>
                </p>
                <small>{i.sender}</small>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="taobao-status">
              {["全部", "待付款", "待发货", "待收货", "已完成"].map((s) => (
                <button
                  className={s === status ? "selected" : ""}
                  key={s}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {list.map((i) => (
              <button
                className="taobao-order"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <div>
                  <ShoppingBag size={16} />
                  <strong>{i.sender}</strong>
                  <small>{meta(i, "status", "订单记录")}</small>
                </div>
                <section>
                  <Media item={i} />
                  <span>
                    <strong>{i.title}</strong>
                    <p>
                      {tab === "物流" ? meta(i, "tracking", i.body) : i.body}
                    </p>
                    <b>¥ {meta(i, "price", "—")}</b>
                  </span>
                </section>
                <footer>{meta(i, "number", i.time)}</footer>
              </button>
            ))}
          </>
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["商品", "订单", "物流"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setStatus("全部");
        }}
        icons={[<Home />, <ShoppingBag />, <Truck />]}
      />
    </div>
  );
}
type ShopeeProduct = { id:string; name:string; price:number; oldPrice:number; category:string; emoji:string; color:string; sold:string; badge:string; image?:string; variants?:string[] };
const shopeeProducts: ShopeeProduct[] = [
{id:"mayday-light",name:"五月天 雲端互動版 LED 2.0 演唱會螢光棒",price:699,oldPrice:899,category:"娛樂收藏",emoji:"🎤",color:"#e7f1ff",image:"https://img.91app.com/webapi/imagesV3/Original/SalePage/8538699/1/639088450617830000?quality=80&v=1",sold:"已售出 2,816",badge:"五迷必收"},
{id:"hermes-garden",name:"Hermès Garden Party 30 手提包",price:128000,oldPrice:145000,category:"女裝配件",emoji:"👜",color:"#ead9c7",image:"https://assets.hermes.cn/is/image/hermesproduct/garden-party-30-bag--051568CK37-worn-1-0-0-800-800_g.jpg",sold:"已售出 28",badge:"精品選物",variants:["黑色","灰褐色","Etoupe 大象灰","Gold 金棕色"]},
{id:"lingerie",name:"法式蕾絲緞面成套內衣",price:1280,oldPrice:1680,category:"女裝配件",emoji:"🎀",color:"#f1e5e5",image:"https://img.wakudoki.ne.jp/Contents/ProductImages/0/537007-cz02_LL.jpg",sold:"已售出 936",badge:"質感推薦",variants:["經典黑","酒紅","奶油白"]},
{id:"orijen",name:"Orijen 渴望 Original 雞肉貓糧",price:1580,oldPrice:1880,category:"寵物用品",emoji:"🐈",color:"#f2dfc5",image:"https://gogopets.ca/cdn/shop/files/1_63deb38e-4747-4d52-a8c7-158bace3f672.webp?v=1706573601&width=600",sold:"已售出 5,620",badge:"毛孩最愛"},
{id:"cat-cans",name:"Fancy Feast 貓咪主食罐綜合口味",price:399,oldPrice:520,category:"寵物用品",emoji:"🐾",color:"#f6e6d5",image:"https://catjjang.co.kr/web/product/big/202308/43ed102cd4a77904fdbec8a02214a002.jpg",sold:"已售出 3,209",badge:"多口味"},
{id:"gloomy",name:"GLOOMY 暴力熊 粉紅絨毛玩偶",price:890,oldPrice:1190,category:"居家生活",emoji:"🧸",color:"#f7dce8",image:"https://oshoppu.com/cdn/shop/files/ost-classic-gloomy-bear-plush-oshoppu-1167943061_1200x1200.jpg?v=1747674939",sold:"已售出 1,482",badge:"可愛收藏"},
{id:"gibson",name:"Gibson Les Paul Standard 60s 電吉他",price:89900,oldPrice:99900,category:"娛樂收藏",emoji:"🎸",color:"#ead4b9",image:"https://cdn11.bigcommerce.com/s-dks6ju/images/stencil/1280x1280/products/27387/337762/d7af5d61-da96-5fc2-9c2d-fc5577d3d852__88272.1716059393.jpg?c=2",sold:"已售出 16",badge:"樂手夢想",variants:["Bourbon Burst","Ebony 黑色","Iced Tea"]},
{id:"dating-book",name:"跟男人談戀愛的100種方法｜戀愛指南",price:299,oldPrice:399,category:"書籍文具",emoji:"📚",color:"#f0e0d8",image:"/monster/assets/shopee-dating-book.jpg",sold:"已售出 2,031",badge:"人氣讀物"}
];
const shopeeCategories=["全部","女裝配件","寵物用品","居家生活","娛樂收藏","書籍文具"];
type ShopeeCart=Record<string,number>;
export function ShopeeSkin(p:Props){
 const [tab,setTab]=useState("首頁"),[query,setQuery]=useState(""),[category,setCategory]=useState("全部");
 const [orderFilter,setOrderFilter]=useState("全部");
 const [paymentMethod,setPaymentMethod]=useState("街口支付");
 const [product,setProduct]=useState<ShopeeProduct|null>(null),[variant,setVariant]=useState("");
 const [cart,setCart]=useState<ShopeeCart>(()=>{try{return JSON.parse(String(p.ui?.shopeeCart||"{}"))}catch{return{}}});
 const [checkoutCart,setCheckoutCart]=useState<ShopeeCart>({});
 const [checkoutReturnTab,setCheckoutReturnTab]=useState("首頁");
 const [orders,setOrders]=useState<Array<{id:string;name:string;price:number;qty:number;status:string;date:string;discountedTotal?:number;shippingStep?:number;trackingNo?:string;carrier?:string;nextUpdateAt?:number;arrivalNotified?:boolean;paymentId?:string}>>(()=>{try{return JSON.parse(String(p.ui?.shopeeOrders||"[]"))}catch{return[]}});
 const [modal,setModal]=useState<"checkout"|"coupon"|"tracking"|null>(null),[pickup,setPickup]=useState("7-ELEVEN"),[address,setAddress]=useState("台北市信義區（示意地址）");
 const [trackingOrder,setTrackingOrder]=useState<string|null>(null);
 const [couponClaimed,setCouponClaimed]=useState(()=>String(p.ui?.shopeeCouponClaimed||"false")==="true"),[couponSuccess,setCouponSuccess]=useState(false);
 const shippingStages=["訂單成立","賣家備貨中","包裹已出貨","物流配送中","已送達取貨門市","已取貨完成"];
 const saveCart=(v:ShopeeCart)=>{setCart(v);p.onUi?.("shopeeCart",JSON.stringify(v))};
 const saveOrders=(v:typeof orders)=>{setOrders(v);p.onUi?.("shopeeOrders",JSON.stringify(v))};
 const add=(v:ShopeeProduct)=>saveCart({...cart,[v.id]:(cart[v.id]||0)+1});
 const buyNow=(v:ShopeeProduct)=>{
  setCheckoutCart({[v.id]:1});
  setCheckoutReturnTab("首頁");
  setProduct(null);
  setTab("確認訂單");
 };
 const remove=(v:ShopeeProduct)=>{const n={...cart};if((n[v.id]||0)>1)n[v.id]--;else delete n[v.id];saveCart(n)};
 const count=Object.values(cart).reduce((a,b)=>a+b,0);
 const total=shopeeProducts.reduce((n,v)=>n+v.price*(cart[v.id]||0),0);
 const checkoutTotal=shopeeProducts.reduce((n,v)=>n+v.price*(checkoutCart[v.id]||0),0);
 const couponDiscount=couponClaimed&&checkoutTotal>=599?50:0;
 const payable=Math.max(0,checkoutTotal-couponDiscount);
 const filtered=shopeeProducts.filter(v=>(category==="全部"||v.category===category)&&(v.name+v.category).toLowerCase().includes(query.trim().toLowerCase()));
 const orderCategory=(order:typeof orders[number])=>{
  const step=order.shippingStep??1;
  if(step>=5||order.status==="已取貨完成"||order.status==="已完成")return "已完成";
  if(order.status==="待付款"||order.status==="未付款")return "待付款";
  if(step>=2||order.status==="物流配送中"||order.status==="包裹已出貨"||order.status==="已送達取貨門市")return "待收貨";
  return "待出貨";
 };
 const visibleOrders=orderFilter==="全部"?orders:orders.filter(order=>orderCategory(order)===orderFilter);
 const currentTrackingOrder=orders.find(v=>v.id===trackingOrder);
  const confirmPickup=()=>{if(!trackingOrder)return;const target=orders.find(v=>v.id===trackingOrder);if(!target||(target.shippingStep??1)<4)return;const nextOrders=orders.map(v=>v.id===trackingOrder?{...v,shippingStep:5,status:shippingStages[5],nextUpdateAt:undefined}:v);saveOrders(nextOrders)};

 const placeOrder=()=>{
  const purchaseCart=checkoutCart;
  const items=shopeeProducts.filter(v=>purchaseCart[v.id]);
  const subtotal=items.reduce((n,v)=>n+v.price*purchaseCart[v.id],0);
  let remainingDiscount=couponDiscount;
  const paymentId="JK"+Date.now().toString();
  const checkoutItems=items.map((v,index)=>{
   const lineTotal=v.price*purchaseCart[v.id];
   const share=index===items.length-1?remainingDiscount:Math.min(remainingDiscount,Math.round(couponDiscount*lineTotal/Math.max(1,subtotal)));
   remainingDiscount-=share;
   return {id:v.id,name:v.name,price:v.price,qty:purchaseCart[v.id],discountedTotal:lineTotal-share};
  });
  if(paymentMethod==="街口支付"){
   const pendingOrders=checkoutItems.map((v,index)=>({id:"SP"+paymentId+v.id,name:v.name,price:v.price,qty:v.qty,status:"待付款",date:new Date().toLocaleString("zh-TW"),discountedTotal:v.discountedTotal,shippingStep:0,arrivalNotified:false,trackingNo:"SP"+Date.now().toString().slice(-8)+String(index+1),carrier:pickup,paymentId}));
   saveOrders([...orders,...pendingOrders]);
   p.onAppUi?.("jkopay","pendingShopeePayment",JSON.stringify({paymentId,total:payable,subtotal,couponDiscount,items:checkoutItems,pickup,address,createdAt:Date.now()}));
   setModal(null);
   setTab("我的");
   p.onOpenApp?.("jkopay");
   return;
  }
  const newOrders=checkoutItems.map((v,index)=>({id:"SP"+paymentId+v.id,name:v.name,price:v.price,qty:v.qty,status:"賣家備貨中",date:new Date().toLocaleString("zh-TW"),discountedTotal:v.discountedTotal,shippingStep:1,nextUpdateAt:Date.now()+30000,arrivalNotified:false,trackingNo:"SP"+Date.now().toString().slice(-8)+String(index+1),carrier:pickup,paymentId}));
  saveOrders([...orders,...newOrders]);saveCart({});setModal(null);setProduct(null);setTab("我的");
 };
 useEffect(()=>{
  const raw=String(p.ui?.shopeePaymentResult||"");
  if(!raw)return;
  try{
   const result=JSON.parse(raw) as {status?:string;paymentId?:string;items?:Array<{id:string;name:string;price:number;qty:number;discountedTotal:number}>;pickup?:string;address?:string};
   if(result.status!=="paid"||!result.paymentId||orders.some(order=>order.paymentId===result.paymentId))return;
   const paidOrders=orders.map(order=>order.paymentId===result.paymentId?{...order,status:"賣家備貨中",shippingStep:1,nextUpdateAt:Date.now()+30000}:order);
   if(paidOrders.some((order,index)=>order!==orders[index])){saveOrders(paidOrders);saveCart({});setTab("我的");}
   p.onUi?.("shopeePaymentResult","");
  }catch{p.onUi?.("shopeePaymentResult","");}
 },[p.ui?.shopeePaymentResult]);
 return <div className={`catalog-skin shopee-ui ${tab==="確認訂單"?"shopee-checkout-page":""}`}>
  {tab!=="確認訂單"&&<><header className="shopee-header"><div className="shopee-brand"><span className="shopee-mark">S</span><strong>蝦皮購物</strong><small>台灣</small></div><button type="button" className="shopee-cart-trigger" onClick={(event)=>{event.preventDefault();event.stopPropagation();setTab("購物車");setProduct(null)}} aria-label="開啟購物車"><ShoppingCart size={23}/>{count>0&&<i>{count}</i>}</button></header>
  <div className="shopee-search-wrap"><SearchBox value={query} set={setQuery} placeholder="搜尋商品、品牌或賣場"/><button onClick={()=>setTab("分類")}>搜尋</button></div></>}
  <div className={`catalog-scroll shopee-scroll ${tab==="確認訂單"?"shopee-checkout-scroll":""}`}>
   {tab==="確認訂單"?<div className="shopee-checkout-standalone"><button className="shopee-back" onClick={()=>setTab(checkoutReturnTab)}>‹ 返回</button><h2>確認訂單</h2><div className="shopee-checkout-products">{shopeeProducts.filter(v=>checkoutCart[v.id]).map(v=><div className="shopee-checkout-product" key={v.id}><span style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:v.emoji}</span><div><strong>{v.name}</strong><small>數量：{checkoutCart[v.id]}</small></div><b>NT$ {(v.price*checkoutCart[v.id]).toLocaleString("zh-TW")}</b></div>)}</div><p>配送方式</p><select value={pickup} onChange={e=>setPickup(e.target.value)}><option>7-ELEVEN</option><option>全家 FamilyMart</option><option>蝦皮店到店</option></select><p>取貨門市／收件地址</p><input value={address} onChange={e=>setAddress(e.target.value)}/><p>付款方式</p><select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}><option value="街口支付">街口支付（跳轉付款）</option><option value="貨到付款">貨到付款</option></select><div className="shopee-checkout-total"><span>商品總額</span><b>NT$ {checkoutTotal.toLocaleString("zh-TW")}</b></div><div className="shopee-checkout-total shopee-coupon-deduction"><span>🎟️ 優惠券折抵{couponClaimed&&checkoutTotal<599?"（未達 NT$ 599 門檻）":""}</span><b>− NT$ {couponDiscount.toLocaleString("zh-TW")}</b></div><div className="shopee-checkout-total shopee-payable"><span>應付金額</span><b>NT$ {payable.toLocaleString("zh-TW")}</b></div><small>遊戲內模擬結帳，不會產生真實付款或配送。</small><button className="shopee-confirm" onClick={placeOrder}>{paymentMethod==="街口支付"?"前往街口支付付款":"確認下單"}</button></div>:product?<div className="shopee-detail"><button className="shopee-back" onClick={()=>setProduct(null)}>‹ 返回商品</button><div className="shopee-product-art" style={{background:product.color}}>{product.image?<img src={product.image} alt={product.name}/>:<span>{product.emoji}</span>}<small>{product.badge}</small></div><div className="shopee-detail-info"><div className="shopee-price-line"><b>NT$ {product.price.toLocaleString("zh-TW")}</b><del>NT$ {product.oldPrice.toLocaleString("zh-TW")}</del></div><h2>{product.name}</h2><p>{product.sold} ⭐ 4.9</p><div className="shopee-service">🚚 蝦皮店到店／超商取貨 🎟️ 領券折價</div><h3>商品規格</h3>{product.variants?.length?<div className="shopee-variant-picks">{product.variants.map(v=><button className={variant===v?"selected":""} key={v} onClick={()=>setVariant(v)}>{v}</button>)}</div>:<p>款式：標準款 ｜ 現貨供應</p>}<h3>配送方式</h3><p>支援 7-ELEVEN、全家及蝦皮店到店（模擬）</p></div><div className="shopee-detail-actions"><button onClick={()=>add(product)}>加入購物車</button><button onClick={()=>buyNow(product)}>立即購買</button></div></div>
   :tab==="首頁"?<><div className="shopee-promo"><div><small>SHOPEE MALL · 台灣</small><h2>蝦皮購物節</h2><p>天天領券・好物優惠・超商取貨</p><b>最高折 NT$ 200</b></div><span>🛍️</span></div><div className="shopee-perks">{["🎟️ 天天領券","🚚 免運優惠","⚡ 限時特賣","🏪 超商取貨"].map(v=><button key={v} onClick={()=>setModal("coupon")}>{v}</button>)}</div><div className="shopee-section-title"><strong>熱門分類</strong><small onClick={()=>setTab("分類")}>查看全部 ›</small></div><div className="shopee-category-grid">{shopeeCategories.slice(1).map((v,i)=><button key={v} onClick={()=>{setCategory(v);setTab("分類")}}><span>{["👗","💄","🎧","🏠","🐾","🎤"][i]}</span>{v}</button>)}</div><div className="shopee-section-title"><strong>為你推薦</strong><small>精選好物</small></div><div className="shopee-product-grid">{shopeeProducts.map(v=><button key={v.id} onClick={()=>{setProduct(v);setVariant(v.variants?.[0]||"")}}><div className="shopee-product-art" style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:<span>{v.emoji}</span>}<small>{v.badge}</small></div><strong>{v.name}</strong><p><b>NT$ {v.price.toLocaleString("zh-TW")}</b><del>{v.oldPrice}</del></p><small>{v.sold}</small></button>)}</div></>
   :tab==="分類"?<><div className="shopee-category-chips">{shopeeCategories.map(v=><button className={category===v?"selected":""} key={v} onClick={()=>setCategory(v)}>{v}</button>)}</div><div className="shopee-product-grid">{filtered.map(v=><button key={v.id} onClick={()=>setProduct(v)}><div className="shopee-product-art" style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:<span>{v.emoji}</span>}<small>{v.badge}</small></div><strong>{v.name}</strong><p><b>NT$ {v.price.toLocaleString("zh-TW")}</b><del>{v.oldPrice}</del></p><small>{v.sold}</small></button>)}</div></>
   :tab==="購物車"?<div className="shopee-cart"><h2>購物車</h2>{shopeeProducts.filter(v=>cart[v.id]).map(v=><div className="shopee-cart-item" key={v.id}><span style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:v.emoji}</span><div><strong>{v.name}</strong><b>NT$ {v.price}</b><div><button onClick={()=>remove(v)}>−</button><small>{cart[v.id]}</small><button onClick={()=>add(v)}>＋</button></div></div></div>)}{!count&&<p className="shopee-empty">🛒 購物車還是空的，去逛逛吧！</p>}<footer><span>合計 <b>NT$ {total.toLocaleString("zh-TW")}</b></span><button disabled={!count} onClick={()=>{setCheckoutCart({...cart});setCheckoutReturnTab("購物車");setTab("確認訂單")}}>去買單（{count}）</button></footer></div>
   :tab==="我的"?<div className="shopee-account"><div className="shopee-profile"><span>🐱</span><div><strong>蝦皮購物會員</strong><small>嗨，今天想買點什麼？</small></div></div><div className="shopee-order-shortcuts">{["待付款","待出貨","待收貨","已完成"].map(v=><button key={v} onClick={()=>{setOrderFilter(v);setTab("訂單")}}>📦<small>{v}</small></button>)}</div><h3>我的訂單</h3>{orders.map(v=><div className="shopee-order-line" key={v.id}><span>{v.name} × {v.qty}</span><b>NT$ {(v.discountedTotal??v.price*v.qty).toLocaleString("zh-TW")}</b><small>{v.status} · {v.date}</small><button className="shopee-track-button" onClick={()=>{setTrackingOrder(v.id);setModal("tracking")}}>查看物流 ›</button></div>)}<button className="shopee-outline" onClick={()=>setModal("coupon")}>🎟️ 我的優惠券</button></div>
   :<div className="shopee-orders"><div className="shopee-orders-heading"><h2>我的訂單</h2><button type="button" onClick={()=>setOrderFilter("全部")}>全部</button></div><div className="shopee-order-filters">{["全部","待付款","待出貨","待收貨","已完成"].map(v=><button type="button" className={orderFilter===v?"selected":""} key={v} onClick={()=>setOrderFilter(v)}>{v}</button>)}</div>{visibleOrders.map(v=><div className="shopee-order-line" key={v.id}><span>{v.name} × {v.qty}</span><b>NT$ {(v.discountedTotal??v.price*v.qty).toLocaleString("zh-TW")}</b><small>{v.status} · {v.date}</small>{orderCategory(v)==="待付款"?<div className="shopee-pending-actions"><button className="shopee-cancel-order" onClick={()=>{if(window.confirm("確定要取消這筆訂單嗎？")){saveOrders(orders.map(order=>order.id===v.id?{...order,status:"已取消",shippingStep:0}:order));const raw=String(p.allUi?.jkopay?.pendingShopeePayment||"");try{const pending=JSON.parse(raw);if(pending.paymentId===v.paymentId)p.onAppUi?.("jkopay","pendingShopeePayment","")}catch{/* ignore an empty or malformed pending payment record */}}}}>取消訂單</button><button className="shopee-track-button" onClick={()=>{const raw=String(p.allUi?.jkopay?.pendingShopeePayment||"");if(raw){setTab("我的");p.onOpenApp?.("jkopay")}else{setModal("checkout")}}}>重新付款</button></div>:orderCategory(v)==="已完成"||v.status==="已取消"?null:<button className="shopee-track-button" onClick={()=>{setTrackingOrder(v.id);setModal("tracking")}}>查看物流 ›</button>}</div>)}{!visibleOrders.length&&<p className="shopee-empty">{orderFilter==="全部"?"目前沒有訂單":`目前沒有「${orderFilter}」訂單`}</p>}</div>}
  </div>

  {modal==="coupon"&&<div className="shopee-modal-shade" onClick={()=>setModal(null)}><div className="shopee-coupon" onClick={e=>e.stopPropagation()}><button onClick={()=>setModal(null)}>✕</button><h2>🎟️ 優惠券</h2><strong>滿 NT$ 599 折 NT$ 50</strong><p>{couponSuccess?"🎉 領取成功！優惠券已放入你的帳戶。":couponClaimed?"這張優惠券已經領取，可以在結帳時自動折抵。":"新會員限定優惠（模擬）"}</p><button className="shopee-confirm" disabled={couponClaimed} onClick={()=>{setCouponClaimed(true);p.onUi?.("shopeeCouponClaimed","true");setCouponSuccess(true)}}>{couponClaimed?"已領取 ✓":"立即領取"}</button></div></div>}
  {modal==="tracking"&&currentTrackingOrder&&<div className="shopee-modal-shade" onClick={()=>setModal(null)}><div className="shopee-tracking" onClick={e=>e.stopPropagation()}><button className="shopee-modal-close" onClick={()=>setModal(null)}><X size={18}/></button><div className="shopee-tracking-head"><Truck size={28}/><div><h2>物流追蹤</h2><p>{currentTrackingOrder.status}</p></div></div><div className="shopee-tracking-meta"><span>物流方式</span><b>{currentTrackingOrder.carrier||pickup}</b><span>物流單號</span><b>{currentTrackingOrder.trackingNo||currentTrackingOrder.id}</b><span>訂單商品</span><b>{currentTrackingOrder.name} × {currentTrackingOrder.qty}</b></div><div className="shopee-tracking-timeline">{shippingStages.map((stage,index)=><div className={"shopee-tracking-step "+(index<=(currentTrackingOrder.shippingStep??1)?"done":"")} key={stage}><i /><div><b>{stage}</b><small>{index===0?currentTrackingOrder.date:index<=(currentTrackingOrder.shippingStep??1)?"已完成":"等待物流更新"}</small></div></div>)}</div><small className="shopee-simulation-note">物流每 30 秒自動更新一次，網頁重新開啟時會接續進度。此為遊戲內模擬物流資訊，不連接真實物流商。</small><button className="shopee-confirm" disabled={(currentTrackingOrder.shippingStep??1)<4||(currentTrackingOrder.shippingStep??1)>=shippingStages.length-1} onClick={confirmPickup}>{(currentTrackingOrder.shippingStep??1)>=shippingStages.length-1?"已完成取貨":(currentTrackingOrder.shippingStep??1)<4?"尚未送達，暫不可取貨":"我已取貨"}</button></div></div>}
  {tab!=="確認訂單"&&<Tabs tabs={["首頁","分類","購物車","我的"]} value={tab} set={setTab} icons={[<Home/>,<Tag/>,<ShoppingCart/>,<Users/>]}/>}
 </div>;
}


type JkoPendingPayment={paymentId:string;total:number;subtotal:number;couponDiscount:number;items:Array<{id:string;name:string;price:number;qty:number;discountedTotal:number}>;pickup:string;address:string;createdAt:number};
type JkoTransaction={id:string;merchant:string;amount:number;date:string;note:string;status:string};
export function JkoPaySkin(p:Props){
 const [tab,setTab]=useState("首頁");
 const [success,setSuccess]=useState(false);
 const [successAmount,setSuccessAmount]=useState(0);
 const [paySource,setPaySource]=useState("玉山銀行 **** 3188");
 const [paymentError,setPaymentError]=useState("");
 const pending=(()=>{try{return JSON.parse(String(p.ui?.pendingShopeePayment||"null")) as JkoPendingPayment|null}catch{return null}})();
 const transactions=(()=>{try{return JSON.parse(String(p.ui?.transactions||"[]")) as JkoTransaction[]}catch{return[]}})();
 const balance=Number(p.ui?.balance??12680);
 const esunBalance=Number(p.ui?.esunBalance??38000);
 const cathayBalance=Number(p.ui?.cathayBalance??8500);
 const availableBalance=paySource==="街口帳戶餘額"?balance:paySource==="國泰世華 **** 6621"?cathayBalance:esunBalance;
 const confirmPayment=()=>{
  if(!pending||success)return;
  if(pending.total>availableBalance){
   setPaymentError(paySource==="街口帳戶餘額"?"街口帳戶餘額不足，無法完成付款。請改用已綁定的銀行卡，或稍後再試。":"銀行授權未通過，可能是可用額度不足或發卡銀行拒絕交易。請改用其他付款方式，或聯絡發卡銀行。");
   return;
  }
  setPaymentError("");
  const tx:JkoTransaction={id:pending.paymentId,merchant:"蝦皮購物",amount:pending.total,date:new Date().toLocaleString("zh-TW"),note:pending.items.map(v=>v.name+" × "+v.qty).join("、"),status:"付款成功"};
  p.onUi?.("transactions",JSON.stringify([tx,...transactions]));
  if(paySource==="街口帳戶餘額")p.onUi?.("balance",String(balance-pending.total));
  else if(paySource==="國泰世華 **** 6621")p.onUi?.("cathayBalance",String(cathayBalance-pending.total));
  else p.onUi?.("esunBalance",String(esunBalance-pending.total));
  p.onAppUi?.("shopee","shopeePaymentResult",JSON.stringify({...pending,status:"paid"}));
  p.onUi?.("pendingShopeePayment","");
  setSuccessAmount(pending.total);
  setSuccess(true);
  window.setTimeout(()=>p.onOpenApp?.("shopee"),1100);
 };
 return <div className="catalog-skin jkopay-ui">
  <header className="jko-header"><button onClick={p.onBack} aria-label="返回">‹</button><strong>街口支付</strong><button onClick={()=>setTab("我的")}>⋯</button></header>
  {pending&&!success?<div className="jko-payment-page">
   <div className="jko-payment-brand"><span>街口支付</span><small>安全付款確認</small></div>
   <div className="jko-pay-card"><small>付款商店</small><h2>蝦皮購物</h2><small>訂單商品</small><p>{pending.items.map(v=>v.name+" × "+v.qty).join("、")}</p><div className="jko-amount"><small>本次應付金額</small><strong>NT$ {pending.total.toLocaleString("zh-TW")}</strong></div><div className="jko-pay-row"><span>付款方式</span><select value={paySource} onChange={e=>{setPaySource(e.target.value);setPaymentError("");}}><option>玉山銀行 **** 3188</option><option>街口帳戶餘額</option><option>國泰世華 **** 6621</option></select></div><div className="jko-pay-row"><span>配送方式</span><b>{pending.pickup}</b></div>
    {paySource==="街口帳戶餘額"&&<div className="jko-available-balance"><span>街口帳戶可用餘額</span><strong>NT$ {balance.toLocaleString("zh-TW")}</strong></div>}
   </div>
   {paymentError&&<div className="jko-payment-error"><b>⚠ 餘額不足，無法付款</b><span>{paymentError}</span><small>請改用其他付款方式，或取消訂單稍後再試。</small></div>}
   <p className="jko-safe-note">🔒 此為遊戲內模擬付款，不會連接銀行或扣款</p>
   <button className="jko-pay-confirm" onClick={confirmPayment}>{paymentError?"重新嘗試付款":"確認付款"} NT$ {pending.total.toLocaleString("zh-TW")}</button>
   <button className="jko-pay-cancel" onClick={()=>{p.onUi?.("pendingShopeePayment","");p.onOpenApp?.("shopee")}}>取消付款，返回蝦皮</button>
  </div>:success?<div className="jko-success"><div>✓</div><h2>付款成功</h2><p>已成功支付給蝦皮購物</p><strong>NT$ {successAmount.toLocaleString("zh-TW")}</strong><small>正在返回蝦皮購物…</small><button onClick={()=>p.onOpenApp?.("shopee")}>立即返回</button></div>:<>
   <div className="jko-home-scroll">
    <div className="jko-balance"><small>街口帳戶餘額</small><strong>NT$ {balance.toLocaleString("zh-TW")}</strong><span>街口支付・讓生活更方便</span></div>
    <div className="jko-quick-actions"><button onClick={()=>setTab("付款碼")}><span>▦</span>付款碼</button><button onClick={()=>setTab("付款碼")}><span>⌗</span>掃碼付款</button><button onClick={()=>setTab("交易記錄")}><span>↗</span>轉帳</button><button onClick={()=>setTab("我的")}><span>＋</span>生活繳費</button></div>
    {tab==="首頁"? <><div className="jko-section-head"><strong>最近交易</strong><button onClick={()=>setTab("交易記錄")}>全部 ›</button></div>{transactions.slice(0,4).map(tx=><div className="jko-transaction" key={tx.id}><span>🛍️</span><div><b>{tx.merchant}</b><small>{tx.date}</small></div><strong>− NT$ {tx.amount.toLocaleString("zh-TW")}</strong></div>)}{!transactions.length&&<p className="jko-empty">目前還沒有交易紀錄</p>}</>:tab==="付款碼"?<div className="jko-code-page"><h2>我的付款碼</h2><div className="jko-qr" aria-label="模擬付款碼">{Array.from({length:121},(_,i)=><i key={i} style={{opacity:((i*17+i%7*13)%11)>4?1:.08}}/>)}</div><b>模擬付款碼</b><small>此付款碼僅供遊戲介面展示</small></div>:tab==="交易記錄"?<><div className="jko-section-head"><strong>交易記錄</strong></div>{transactions.map(tx=><div className="jko-transaction" key={tx.id}><span>🛍️</span><div><b>{tx.merchant}</b><small>{tx.date} · {tx.status}</small><small>{tx.note}</small></div><strong>− NT$ {tx.amount.toLocaleString("zh-TW")}</strong></div>)}{!transactions.length&&<p className="jko-empty">目前還沒有交易紀錄</p>}</>:<div className="jko-profile"><div>👤</div><h2>街口支付會員</h2><p>已綁定付款方式</p><b>玉山銀行 **** 3188</b><button onClick={()=>setTab("交易記錄")}>交易紀錄</button><button onClick={()=>setTab("首頁")}>返回首頁</button></div>}
   </div>
   <nav className="jko-tabs">{["首頁","付款碼","交易記錄","我的"].map((v,i)=><button className={tab===v?"selected":""} key={v} onClick={()=>setTab(v)}><span>{["⌂","▦","↻","♙"][i]}</span>{v}</button>)}</nav>
  </>}
 </div>;
}

export function DeliverySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "商家");
  const list = items.filter((i) =>
    tab === "订单" ? i.folder === "订单" : i.folder !== "订单",
  );
  return (
    <div className="catalog-skin delivery-ui">
      <Header p={p} />
      <div className="delivery-location">
        <MapPin size={18} />
        <strong>{meta(items[0], "address", "作品配送地址")}</strong>
      </div>
      <SearchBox value={q} set={setQ} placeholder="搜索商家或订单" />
      <div className="catalog-scroll">
        {tab === "商家"
          ? list.map((i) => (
              <button
                className="delivery-merchant"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <Media item={i} />
                <div>
                  <h3>{i.title}</h3>
                  <p>
                    <Star size={12} />
                    {meta(i, "rating", "—")}
                    <span>{meta(i, "duration")}</span>
                  </p>
                  <small>{i.body.split("\n")[0]}</small>
                  <strong>¥ {meta(i, "price", "—")}</strong>
                </div>
              </button>
            ))
          : list.map((i) => (
              <button
                className="delivery-order"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <header>
                  <Utensils size={18} />
                  <strong>{i.sender}</strong>
                  <span>{meta(i, "status", "配送记录")}</span>
                </header>
                <section>
                  <Media item={i} />
                  <div>
                    <strong>{i.title}</strong>
                    <p>{i.body}</p>
                    <small>{i.time}</small>
                  </div>
                  <b>¥ {meta(i, "price", "—")}</b>
                </section>
                <footer>
                  <MapPin size={13} />
                  {meta(i, "address")}
                </footer>
              </button>
            ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["商家", "订单"]}
        value={tab}
        set={setTab}
        icons={[<Utensils />, <Receipt />]}
      />
    </div>
  );
}
