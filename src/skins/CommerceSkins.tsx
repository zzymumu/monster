import {
  Home,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Tag,
  X,
  Users,
  Ticket,
  Truck,
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
        {tab !== "我的" && <Empty items={list} />}
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
type ShopeeProduct = { id:string; name:string; price:number; oldPrice:number; category:string; emoji:string; color:string; sold:string; badge:string; image?:string; variants?:string[]; variantPrices?:Record<string,number> };
const shopeeProducts: ShopeeProduct[] = [
{id:"iphone-18-pro-max",name:"Apple iPhone 18 Pro Max 256GB",price:44900,oldPrice:47900,category:"3C數位",emoji:"📱",color:"#eee9e7",image:"https://www.apple.com/v/iphone/home/cl/images/overview/priority-router/hero_iphone_18_pro__faygyzbu2yq2_large.jpg",sold:"已售出 128",badge:"最新旗艦",variants:["深酒紅","銀色","太空黑","冰川藍"],variantPrices:{"深酒紅":44900,"銀色":44900,"太空黑":44900,"冰川藍":44900}},
{id:"mayday-light",name:"五月天 雲端互動版 LED 2.0 演唱會螢光棒",price:699,oldPrice:899,category:"娛樂收藏",emoji:"🎤",color:"#e7f1ff",image:"https://img.91app.com/webapi/imagesV3/Original/SalePage/8538699/1/639088450617830000?quality=80&v=1",sold:"已售出 2,816",badge:"五迷必收"},
{id:"hermes-garden",name:"Hermès Garden Party 30 手提包",price:128000,oldPrice:145000,category:"女裝配件",emoji:"👜",color:"#ead9c7",image:"https://assets.hermes.cn/is/image/hermesproduct/garden-party-30-bag--051568CK37-worn-1-0-0-800-800_g.jpg",sold:"已售出 28",badge:"精品選物",variants:["黑色","灰褐色","Etoupe 大象灰","Gold 金棕色"],variantPrices:{"黑色":128000,"灰褐色":128000,"Etoupe 大象灰":128000,"Gold 金棕色":128000}},
{id:"lingerie",name:"法式蕾絲緞面成套內衣",price:1280,oldPrice:1680,category:"女裝配件",emoji:"🎀",color:"#f1e5e5",image:"https://img.wakudoki.ne.jp/Contents/ProductImages/0/537007-cz02_LL.jpg",sold:"已售出 936",badge:"質感推薦",variants:["經典黑","酒紅","奶油白"],variantPrices:{"經典黑":1280,"酒紅":1280,"奶油白":1280}},
{id:"orijen",name:"Orijen 渴望 Original 雞肉貓糧",price:1580,oldPrice:1880,category:"寵物用品",emoji:"🐈",color:"#f2dfc5",image:"https://gogopets.ca/cdn/shop/files/1_63deb38e-4747-4d52-a8c7-158bace3f672.webp?v=1706573601&width=600",sold:"已售出 5,620",badge:"毛孩最愛"},
{id:"cat-cans",name:"Fancy Feast 貓咪主食罐綜合口味",price:399,oldPrice:520,category:"寵物用品",emoji:"🐾",color:"#f6e6d5",image:"https://catjjang.co.kr/web/product/big/202308/43ed102cd4a77904fdbec8a02214a002.jpg",sold:"已售出 3,209",badge:"多口味"},
{id:"gloomy",name:"GLOOMY 暴力熊 粉紅絨毛玩偶",price:890,oldPrice:1190,category:"居家生活",emoji:"🧸",color:"#f7dce8",image:"https://oshoppu.com/cdn/shop/files/ost-classic-gloomy-bear-plush-oshoppu-1167943061_1200x1200.jpg?v=1747674939",sold:"已售出 1,482",badge:"可愛收藏"},
{id:"gibson",name:"Gibson Les Paul Standard 60s 電吉他",price:89900,oldPrice:99900,category:"娛樂收藏",emoji:"🎸",color:"#ead4b9",image:"https://cdn11.bigcommerce.com/s-dks6ju/images/stencil/1280x1280/products/27387/337762/d7af5d61-da96-5fc2-9c2d-fc5577d3d852__88272.1716059393.jpg?c=2",sold:"已售出 16",badge:"樂手夢想",variants:["Bourbon Burst","Ebony 黑色","Iced Tea"],variantPrices:{"Bourbon Burst":89900,"Ebony 黑色":89900,"Iced Tea":89900}},
{id:"dating-book",name:"跟男人談戀愛的100種方法｜戀愛指南",price:299,oldPrice:399,category:"書籍文具",emoji:"📚",color:"#f0e0d8",image:"/monster/assets/shopee-dating-book.jpg",sold:"已售出 2,031",badge:"人氣讀物"},
{id:"chanel-rouge-coco",name:"CHANEL ROUGE COCO 香奈兒晶亮潤色唇膏",price:1650,oldPrice:1800,category:"美妝香氛",emoji:"💄",color:"#f7e4e2",sold:"已售出 386",badge:"人氣彩妝",variants:["#104 Mademoiselle","#112 Paris 1er","#118 New York","#120 Gabrielle"],variantPrices:{"#104 Mademoiselle":1650,"#112 Paris 1er":1650,"#118 New York":1650,"#120 Gabrielle":1650},image:"https://www.chanel.com/images/t_one/w_0.45%2Ch_0.45%2Cc_crop/q_auto%3Agood%2Cf_auto%2Cfl_lossy%2Cdpr_1.1/w_1920/rouge-coco-ultra-hydrating-lip-colour-466-carmen-0-12oz--packshot-default-172466-9564898230302.jpg"},
{id:"ysl-loveshine",name:"YSL LOVESHINE 水光唇膏",price:1590,oldPrice:1750,category:"美妝香氛",emoji:"💋",color:"#f3dce5",sold:"已售出 528",badge:"熱賣色號",variants:["#44 Nude Lavallière","#12 Electric Love","#45 Coral Crush","#80 Glowing Lava"],variantPrices:{"#44 Nude Lavallière":1590,"#12 Electric Love":1590,"#45 Coral Crush":1590,"#80 Glowing Lava":1590},image:"https://www.ysl-beauty.be/dw/image/v2/AAQP_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dwb1a96e3b/images/PACKSHOTS/MAKEUP/LIPS/WW-51209YSL_ysl-loveshine/3614274132625_ysl-loveshine_main.png"},
{id:"chanel-coco-mademoiselle",name:"CHANEL COCO MADEMOISELLE 香水 50ml",price:5200,oldPrice:5800,category:"美妝香氛",emoji:"🌸",color:"#f5e7df",sold:"已售出 214",badge:"經典香氛",variants:["35ml","50ml","100ml"],variantPrices:{"35ml":3900,"50ml":5200,"100ml":7800},image:"https://www.chanel.com/images/t_one/t_fragrance/q_auto%3Agood%2Cf_auto%2Cfl_lossy%2Cdpr_1.1/w_1920/coco-mademoiselle-eau-de-parfum-spray-1-7fl-oz--packshot-default-116420-9564890529822.jpg"},
{id:"ysl-libre",name:"YSL LIBRE 自由不羈淡香精 50ml",price:4650,oldPrice:5200,category:"美妝香氛",emoji:"🌼",color:"#f4e8d2",image:"https://f.fcdn.app/imgs/a89685/www.sanroque.com.uy/sanruy/650c/original/catalogo/124473_124473_1/2000-2000/perfume-ysl-libre-edp-50-ml-perfume-ysl-libre-edp-50-ml.jpg",sold:"已售出 172",badge:"熱銷香水",variants:["30ml","50ml","90ml"],variantPrices:{"30ml":3200,"50ml":4650,"90ml":6200}},
{id:"chiate-pineapple",name:"佳德糕餅 原味鳳梨酥禮盒",price:456,oldPrice:500,category:"美食伴手禮",emoji:"🍍",color:"#f5e5c8",sold:"已售出 1,286",badge:"台灣人氣伴手禮",variants:["6入 NT$228","12入 NT$456","20入 NT$760"],variantPrices:{"6入 NT$228":228,"12入 NT$456":456,"20入 NT$760":760},image:"https://img08.weeecdn.net/product/image/221/260/6B2F96D74F5A5378.png%21c750x0_q80_t1.auto"}
];
const shopeeCategories=["全部","3C數位","美妝香氛","美食伴手禮","女裝配件","寵物用品","居家生活","娛樂收藏","書籍文具"];
type ShopeeCart=Record<string,number>;
export function ShopeeSkin(p:Props){
 const [tab,setTab]=useState("首頁"),[query,setQuery]=useState(""),[category,setCategory]=useState("全部");
 const [orderFilter,setOrderFilter]=useState("全部");
 const [paymentMethod,setPaymentMethod]=useState("街口支付");
 const [product,setProduct]=useState<ShopeeProduct|null>(null),[variant,setVariant]=useState("");
 const [cart,setCart]=useState<ShopeeCart>(()=>{try{return JSON.parse(String(p.ui?.shopeeCart||"{}"))}catch{return{}}});
 const [checkoutCart,setCheckoutCart]=useState<ShopeeCart>({});
 const [checkoutPrice,setCheckoutPrice]=useState<number|null>(null);
 const [checkoutVariant,setCheckoutVariant]=useState("");
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
  const chosenVariant=v.variants?.includes(variant)?variant:(v.variants?.[0]||"");
  setCheckoutCart({[v.id]:1});
  setCheckoutPrice(v.variantPrices?.[chosenVariant]??v.price);
  setCheckoutVariant(chosenVariant);
  setCheckoutReturnTab("首頁");
  setProduct(null);
  setTab("確認訂單");
 };
 const remove=(v:ShopeeProduct)=>{const n={...cart};if((n[v.id]||0)>1)n[v.id]--;else delete n[v.id];saveCart(n)};
 const count=Object.values(cart).reduce((a,b)=>a+b,0);
 const total=shopeeProducts.reduce((n,v)=>n+v.price*(cart[v.id]||0),0);
 const checkoutTotal=shopeeProducts.reduce((n,v)=>n+(checkoutPrice!==null&&checkoutCart[v.id]?checkoutPrice:v.price)*(checkoutCart[v.id]||0),0);
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
  const subtotal=items.reduce((n,v)=>n+(checkoutPrice!==null&&purchaseCart[v.id]?checkoutPrice:v.price)*purchaseCart[v.id],0);
  let remainingDiscount=couponDiscount;
  const paymentId="JK"+Date.now().toString();
  const checkoutItems=items.map((v,index)=>{
   const unitPrice=checkoutPrice!==null&&purchaseCart[v.id]?checkoutPrice:v.price;
   const lineTotal=unitPrice*purchaseCart[v.id];
   const share=index===items.length-1?remainingDiscount:Math.min(remainingDiscount,Math.round(couponDiscount*lineTotal/Math.max(1,subtotal)));
   remainingDiscount-=share;
   return {id:v.id,name:checkoutVariant?`${v.name}（${checkoutVariant}）`:v.name,price:unitPrice,qty:purchaseCart[v.id],discountedTotal:lineTotal-share};
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
   if(paidOrders.some((order,index)=>order!==orders[index])){saveOrders(paidOrders);if(checkoutReturnTab==="購物車")saveCart({});setCheckoutCart({});setCheckoutPrice(null);setCheckoutVariant("");setTab("我的");}
   p.onUi?.("shopeePaymentResult","");
  }catch{p.onUi?.("shopeePaymentResult","");}
 },[p.ui?.shopeePaymentResult]);
 return <div className={`catalog-skin shopee-ui ${tab==="確認訂單"?"shopee-checkout-page":""}`}>
  {tab!=="確認訂單"&&<><header className="shopee-header"><div className="shopee-brand"><span className="shopee-mark">S</span><strong>蝦皮購物</strong><small>台灣</small></div><button type="button" className="shopee-cart-trigger" onClick={(event)=>{event.preventDefault();event.stopPropagation();setTab("購物車");setProduct(null)}} aria-label="開啟購物車"><ShoppingCart size={23}/>{count>0&&<i>{count}</i>}</button></header>
  <div className="shopee-search-wrap"><SearchBox value={query} set={setQuery} placeholder="搜尋商品、品牌或賣場"/><button onClick={()=>setTab("分類")}>搜尋</button></div></>}
  <div className={`catalog-scroll shopee-scroll ${tab==="確認訂單"?"shopee-checkout-scroll":""}`}>
   {tab==="確認訂單"?<div className="shopee-checkout-standalone"><button className="shopee-back" onClick={()=>setTab(checkoutReturnTab)}>‹ 返回</button><h2>確認訂單</h2><div className="shopee-checkout-products">{shopeeProducts.filter(v=>checkoutCart[v.id]).map(v=><div className="shopee-checkout-product" key={v.id}><span style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:v.emoji}</span><div><strong>{v.name}{checkoutVariant?`（${checkoutVariant}）`:""}</strong><small>數量：{checkoutCart[v.id]}</small></div><b>NT$ {((checkoutPrice??v.price)*checkoutCart[v.id]).toLocaleString("zh-TW")}</b></div>)}</div><p>配送方式</p><select value={pickup} onChange={e=>setPickup(e.target.value)}><option>7-ELEVEN</option><option>全家 FamilyMart</option><option>蝦皮店到店</option></select><p>取貨門市／收件地址</p><input value={address} onChange={e=>setAddress(e.target.value)}/><p>付款方式</p><select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}><option value="街口支付">街口支付（跳轉付款）</option><option value="貨到付款">貨到付款</option></select><div className="shopee-checkout-total"><span>商品總額</span><b>NT$ {checkoutTotal.toLocaleString("zh-TW")}</b></div><div className="shopee-checkout-total shopee-coupon-deduction"><span>🎟️ 優惠券折抵{couponClaimed&&checkoutTotal<599?"（未達 NT$ 599 門檻）":""}</span><b>− NT$ {couponDiscount.toLocaleString("zh-TW")}</b></div><div className="shopee-checkout-total shopee-payable"><span>應付金額</span><b>NT$ {payable.toLocaleString("zh-TW")}</b></div><small>遊戲內模擬結帳，不會產生真實付款或配送。</small><div className="shopee-checkout-actions"><button className="shopee-confirm" onClick={placeOrder}>{paymentMethod==="街口支付"?"前往街口支付付款":"確認下單"}</button><button className="shopee-cancel-order" onClick={()=>{setCheckoutCart({});setCheckoutPrice(null);setCheckoutVariant("");setProduct(null);setTab(checkoutReturnTab)}}>取消訂單</button></div></div>:product?<div className="shopee-detail"><button className="shopee-back" onClick={()=>setProduct(null)}>‹ 返回商品</button><div className="shopee-product-art" style={{background:product.color}}>{product.image?<img src={product.image} alt={product.name}/>:<span>{product.emoji}</span>}<small>{product.badge}</small></div><div className="shopee-detail-info"><div className="shopee-price-line"><b>NT$ {(product.variantPrices?.[variant]??product.price).toLocaleString("zh-TW")}</b><del>NT$ {product.oldPrice.toLocaleString("zh-TW")}</del></div><h2>{product.name}</h2><p>{product.sold} ⭐ 4.9</p><div className="shopee-service">🚚 蝦皮店到店／超商取貨 🎟️ 領券折價</div><h3>商品規格</h3>{product.variants?.length?<div className="shopee-variant-picks">{product.variants.map(v=><button className={variant===v?"selected":""} key={v} onClick={()=>setVariant(v)}>{v}</button>)}</div>:<p>款式：標準款 ｜ 現貨供應</p>}<h3>配送方式</h3><p>支援 7-ELEVEN、全家及蝦皮店到店（模擬）</p></div><div className="shopee-detail-actions"><button onClick={()=>add(product)}>加入購物車</button><button onClick={()=>buyNow(product)}>立即購買</button></div></div>
   :tab==="首頁"?<><div className="shopee-promo"><div><small>SHOPEE MALL · 台灣</small><h2>蝦皮購物節</h2><p>天天領券・好物優惠・超商取貨</p><b>最高折 NT$ 200</b></div><span>🛍️</span></div><div className="shopee-perks">{["🎟️ 天天領券","🚚 免運優惠","⚡ 限時特賣","🏪 超商取貨"].map(v=><button key={v} onClick={()=>setModal("coupon")}>{v}</button>)}</div><div className="shopee-section-title"><strong>熱門分類</strong><small onClick={()=>setTab("分類")}>查看全部 ›</small></div><div className="shopee-category-grid">{shopeeCategories.slice(1).map((v,i)=><button key={v} onClick={()=>{setCategory(v);setTab("分類")}}><span>{["👗","💄","🎧","🏠","🐾","🎤"][i]}</span>{v}</button>)}</div><div className="shopee-section-title"><strong>為你推薦</strong><small>精選好物</small></div><div className="shopee-product-grid">{shopeeProducts.map(v=><button key={v.id} onClick={()=>{setProduct(v);setVariant(v.variants?.[0]||"")}}><div className="shopee-product-art" style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:<span>{v.emoji}</span>}<small>{v.badge}</small></div><strong>{v.name}</strong><p><b>NT$ {v.price.toLocaleString("zh-TW")}</b><del>{v.oldPrice}</del></p><small>{v.sold}</small></button>)}</div></>
   :tab==="分類"?<><div className="shopee-category-chips">{shopeeCategories.map(v=><button className={category===v?"selected":""} key={v} onClick={()=>setCategory(v)}>{v}</button>)}</div><div className="shopee-product-grid">{filtered.map(v=><button key={v.id} onClick={()=>{setProduct(v);setVariant(v.variants?.[0]||"")}}><div className="shopee-product-art" style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:<span>{v.emoji}</span>}<small>{v.badge}</small></div><strong>{v.name}</strong><p><b>NT$ {v.price.toLocaleString("zh-TW")}</b><del>{v.oldPrice}</del></p><small>{v.sold}</small></button>)}</div></>
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
 const esunBalance=Number(p.ui?.esunBalance??50000);
 const cathayBalance=Number(p.ui?.cathayBalance??50000);
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
  const { tab, setTab, q, setQ } = useContent(p, "首页");
  const [category, setCategory] = useState("全部");
  const [selected, setSelected] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartPage, setCartPage] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("请输入收货地址");
  const [deliveryMethod, setDeliveryMethod] = useState("尽快送达");
  const [checkoutPayment, setCheckoutPayment] = useState("在线支付");
  const deliveryFee = 35;
  const money = (value:number) => "NT$ " + Math.round(value).toLocaleString("zh-TW");
  const restaurants = [
    {id:"r1",name:"川味小馆",category:"中餐",desc:"川菜 · 麻辣香锅 · 水煮鱼",rating:"4.8",time:"25–35 分钟",fee:"NT$ 35 起",price:"NT$ 180 起",tag:"人气热卖",image:"https://images.unsplash.com/photo-1547592180-85f173990554?w=640&q=85",menu:[
      {id:"r1m1",name:"招牌麻辣水煮鱼",desc:"鲜嫩鱼片，麻辣鲜香",price:260,image:"https://images.unsplash.com/photo-1547592180-85f173990554?w=360&q=80"},
      {id:"r1m2",name:"川味回锅肉",desc:"蒜苗爆香，肥瘦相间",price:220,image:"https://images.unsplash.com/photo-1512058564366-18510be2db19?w=360&q=80"},
      {id:"r1m3",name:"红油抄手",desc:"手工馄饨搭配秘制红油",price:150,image:"https://images.unsplash.com/photo-1563245372-f21724e3856d?w=360&q=80"}]},
    {id:"r2",name:"港式茶餐厅",category:"中餐",desc:"烧腊 · 港式奶茶 · 云吞面",rating:"4.7",time:"20–30 分钟",fee:"NT$ 25 起",price:"NT$ 150 起",tag:"免配送费",image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=640&q=85",menu:[
      {id:"r2m1",name:"鲜虾云吞面",desc:"弹牙鲜虾云吞，清爽汤底",price:180,image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=360&q=80"},
      {id:"r2m2",name:"蜜汁叉烧饭",desc:"港式蜜汁叉烧，配香软米饭",price:200,image:"https://images.unsplash.com/photo-1512058564366-18510be2db19?w=360&q=80"},
      {id:"r2m3",name:"港式冻奶茶",desc:"茶香浓郁，经典丝袜奶茶",price:75,image:"https://images.deliveryhero.io/image/fd-pk/LH/dxiq-listing.jpg"}]},
    {id:"r3",name:"日式食堂",category:"日韩料理",desc:"寿司 · 拉面 · 日式丼饭",rating:"4.9",time:"30–40 分钟",fee:"NT$ 30 起",price:"NT$ 210 起",tag:"精选商家",image:"https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=640&q=85",menu:[
      {id:"r3m1",name:"炙烧鲑鱼寿司",desc:"鲜切鲑鱼，现点现做",price:240,image:"https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=360&q=80"},
      {id:"r3m2",name:"豚骨拉面",desc:"浓厚豚骨汤头，叉烧入味",price:210,image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=360&q=80"},
      {id:"r3m3",name:"日式炸鸡",desc:"外酥内嫩，附柚子胡椒",price:140,image:"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=360&q=80"}]},
    {id:"r4",name:"韩式炸鸡研究所",category:"日韩料理",desc:"韩式炸鸡 · 年糕 · 炸物",rating:"4.6",time:"25–40 分钟",fee:"NT$ 35 起",price:"NT$ 180 起",tag:"限时优惠",image:"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=640&q=85",menu:[
      {id:"r4m1",name:"蜂蜜蒜香炸鸡",desc:"酥脆外皮，蜂蜜蒜香",price:220,image:"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=360&q=80"},
      {id:"r4m2",name:"韩式辣炒年糕",desc:"Q弹年糕，甜辣酱汁",price:150,image:"https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=360&q=80"},
      {id:"r4m3",name:"韩式海鲜煎饼",desc:"外脆内软，满满海鲜",price:180,image:"https://images.unsplash.com/photo-1563245372-f21724e3856d?w=360&q=80"}]},
    {id:"r5",name:"小笼包与面",category:"中餐",desc:"小笼包 · 生煎 · 汤面",rating:"4.8",time:"20–30 分钟",fee:"NT$ 25 起",price:"NT$ 120 起",tag:"附近好店",image:"https://images.unsplash.com/photo-1563245372-f21724e3856d?w=640&q=85",menu:[
      {id:"r5m1",name:"招牌鲜肉小笼包",desc:"手工现包，皮薄汤汁足",price:150,image:"https://images.unsplash.com/photo-1563245372-f21724e3856d?w=360&q=80"},
      {id:"r5m2",name:"上海生煎包",desc:"底部金黄酥脆，鲜肉馅",price:130,image:"https://images.unsplash.com/photo-1563245372-f21724e3856d?w=360&q=80"},
      {id:"r5m3",name:"葱油拌面",desc:"葱香浓郁，经典上海风味",price:120,image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=360&q=80"}]},
    {id:"r6",name:"珍珠研究所",category:"奶茶甜品",desc:"手摇饮品 · 珍珠奶茶 · 水果茶",rating:"4.9",time:"15–25 分钟",fee:"NT$ 25 起",price:"NT$ 70 起",tag:"人气饮品",image:"https://framerusercontent.com/images/w4p5pcB6luR99F294p6sNuBQc.jpg?height=1267&width=1267",menu:[
      {id:"r6m1",name:"黑糖珍珠鲜奶",desc:"Q弹黑糖珍珠，浓醇鲜奶",price:85,image:"https://framerusercontent.com/images/w4p5pcB6luR99F294p6sNuBQc.jpg?height=1267&width=1267"},
      {id:"r6m2",name:"芝士奶盖乌龙",desc:"清香乌龙搭配绵密奶盖",price:80,image:"https://sushishop.com/wp-content/uploads/2021/05/2020_01_20-BBTS0806-1-1410x1763.jpg"},
      {id:"r6m3",name:"满杯鲜橙绿茶",desc:"鲜果茶香，清爽解腻",price:85,image:"https://www.foodunfolded.com/media/images/in-article-bubbletea02.webp"}]},
    {id:"r7",name:"茶日子手摇茶",category:"奶茶甜品",desc:"台式奶茶 · 芋圆 · 鲜果茶",rating:"4.7",time:"15–25 分钟",fee:"NT$ 25 起",price:"NT$ 60 起",tag:"第二杯优惠",image:"https://images.deliveryhero.io/image/fd-ph/LH/xgn3-listing.jpg",menu:[
      {id:"r7m1",name:"经典珍珠奶茶",desc:"台式红茶与浓醇奶香",price:70,image:"https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto%2Cw_400/RX_THUMBNAIL/IMAGES/VENDOR/2024/9/10/d7198917-e6e5-4849-9628-374e8c3fa1a6_952260.jpg"},
      {id:"r7m2",name:"芋泥波波鲜奶",desc:"绵密芋泥与Q弹波波",price:85,image:"https://elcanotrade.com/cdn/shop/collections/Milk_Tea_1080x.jpg?v=1604572273"},
      {id:"r7m3",name:"柠檬冬瓜茶",desc:"酸甜清爽，解腻消暑",price:60,image:"https://images.unsplash.com/photo-1544145945-f90425340c7e?w=360&q=80"}]},
    {id:"r8",name:"阿嬷热炒",category:"热炒",desc:"台式热炒 · 炒蛤蜊 · 三杯鸡",rating:"4.8",time:"25–35 分钟",fee:"NT$ 30 起",price:"NT$ 170 起",tag:"台味人气",image:"https://images.unsplash.com/photo-1512058564366-18510be2db19?w=640&q=85",menu:[
      {id:"r8m1",name:"阿嬷招牌三杯鸡",desc:"九层塔香气，酱香下饭",price:240,image:"https://images.unsplash.com/photo-1512058564366-18510be2db19?w=360&q=80"},
      {id:"r8m2",name:"蒜蓉炒蛤蜊",desc:"蒜香浓郁，鲜甜多汁",price:200,image:"https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=360&q=80"},
      {id:"r8m3",name:"金沙豆腐",desc:"咸蛋黄金沙，外酥内嫩",price:170,image:"https://images.unsplash.com/photo-1547592180-85f173990554?w=360&q=80"}]},
    {id:"r9",name:"夜市大排档",category:"热炒",desc:"盐酥鸡 · 炒面 · 夜市小吃",rating:"4.6",time:"20–30 分钟",fee:"NT$ 30 起",price:"NT$ 140 起",tag:"宵夜推荐",image:"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=640&q=85",menu:[
      {id:"r9m1",name:"台式盐酥鸡",desc:"九层塔与蒜片，现炸酥香",price:150,image:"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=360&q=80"},
      {id:"r9m2",name:"黑胡椒牛柳",desc:"洋葱甜香，黑胡椒浓郁",price:240,image:"https://images.unsplash.com/photo-1512058564366-18510be2db19?w=360&q=80"},
      {id:"r9m3",name:"古早味炒面",desc:"大火快炒，锅气十足",price:140,image:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=360&q=80"}]}
  ];
  const allMenu = restaurants.flatMap(r=>r.menu);
  const count = Object.values(cart).reduce((a,b)=>a+b,0);
  const total = allMenu.reduce((sum,item)=>sum+item.price*(cart[item.id]||0),0);
  const add = (id:string) => setCart(v=>({...v,[id]:(v[id]||0)+1}));
  const remove = (id:string) => setCart(v=>({...v,[id]:Math.max(0,(v[id]||0)-1)}));
  const activeRestaurant = restaurants.find(r=>r.id===selected);
  const menu = activeRestaurant?.menu ?? [];
  const cartGroups = restaurants.map(restaurant=>({...restaurant,items:restaurant.menu.filter(item=>(cart[item.id]||0)>0)})).filter(restaurant=>restaurant.items.length>0);
  const restaurantCart = menu.filter(item=>(cart[item.id]||0)>0);
  const restaurantCount = restaurantCart.reduce((n,item)=>n+(cart[item.id]||0),0);
  const restaurantTotal = restaurantCart.reduce((n,item)=>n+item.price*(cart[item.id]||0),0);
  const visibleRestaurants = restaurants.filter(r=>
    (category==="全部" || r.category===category) &&
    (q.trim()==="" || (r.name+r.desc).toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="catalog-skin delivery-ui">
      <div className="hp-home-scroll">
        {checkoutOpen ? (
          <div className="hp-checkout-page">
            {checkoutDone ? <div className="hp-checkout-success"><span>✓</span><h2>订单提交成功</h2><p>商家将尽快确认并开始准备餐点</p><button onClick={()=>{setCheckoutOpen(false);setCheckoutDone(false);setCartPage(false);setSelected(null);setTab("订单")}}>查看订单</button></div> : <>
              <div className="hp-checkout-header"><button onClick={()=>setCheckoutOpen(false)}>‹</button><h2>确认订单</h2><span/></div>
              <div className="hp-checkout-card"><b>配送地址</b><input value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)} placeholder="请输入详细收货地址"/><small>请确认地址及门牌号码</small></div>
              <div className="hp-checkout-card"><b>配送时间</b><select value={deliveryMethod} onChange={e=>setDeliveryMethod(e.target.value)}><option>尽快送达</option><option>预约配送</option></select></div>
              <div className="hp-checkout-card"><b>订单明细</b>{allMenu.filter(m=>cart[m.id]>0).map(m=><div className="hp-checkout-item" key={m.id}><span>{m.name} × {cart[m.id]}</span><strong>{money(m.price*cart[m.id])}</strong></div>)}<div className="hp-checkout-item"><span>配送费</span><strong>{money(deliveryFee)}</strong></div><div className="hp-checkout-total"><b>合计</b><strong>{money(total+deliveryFee)}</strong></div></div>
              <div className="hp-checkout-card"><b>付款方式</b><select value={checkoutPayment} onChange={e=>setCheckoutPayment(e.target.value)}><option>在线支付</option><option>现金支付</option></select></div>
              <button className="hp-submit-order" disabled={!count||!deliveryAddress.trim()||deliveryAddress==="请输入收货地址"} onClick={()=>{setCheckoutDone(true);setCart({});}}>提交订单 · {money(total+deliveryFee)}</button>
            </>}
          </div>
        ) : cartPage ? (
          <div style={{padding:"18px 16px 28px",minHeight:"100%",background:"#f7f7f7"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <button onClick={()=>setCartPage(false)} style={{border:0,background:"transparent",fontSize:28}}>‹</button>
              <h2 style={{margin:0,fontSize:22,fontWeight:800}}>购物车</h2>
              <button onClick={()=>setCart({})} style={{border:0,background:"transparent",color:"#999"}}>清空</button>
            </div>
            {cartGroups.length===0 ? (
              <div style={{background:"#fff",borderRadius:16,padding:"54px 20px",textAlign:"center",color:"#999"}}>
                <div style={{fontSize:48,marginBottom:12}}>🛒</div><b style={{display:"block",color:"#333",fontSize:17}}>购物车还是空的</b><p>去挑选喜欢的美食吧</p>
                <button onClick={()=>{setCartPage(false);setSelected(null);setTab("首页")}} style={{background:"#ffd400",border:0,borderRadius:24,padding:"11px 28px",fontWeight:700}}>去逛逛</button>
              </div>
            ) : <>
              {cartGroups.map(restaurant=>{
                const subtotal=restaurant.items.reduce((sum,item)=>sum+item.price*(cart[item.id]||0),0);
                return <section key={restaurant.id} style={{background:"#fff",borderRadius:15,padding:"14px 13px",marginBottom:13}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,borderBottom:"1px solid #f0f0f0",paddingBottom:12,marginBottom:5}}>
                    <span style={{fontSize:20}}>🏪</span><b style={{fontSize:16,flex:1}}>{restaurant.name}</b><small style={{color:"#999"}}>{restaurant.items.reduce((n,item)=>n+(cart[item.id]||0),0)} 件商品</small>
                  </div>
                  {restaurant.items.map(item=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:"1px solid #f4f4f4"}}>
                    <img src={item.image} alt={item.name} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=restaurant.image}} style={{width:68,height:68,objectFit:"cover",borderRadius:10,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}><b style={{display:"block",fontSize:14}}>{item.name}</b><small style={{color:"#999",display:"block",marginTop:5}}>{money(item.price)} / 份</small><strong style={{display:"block",marginTop:5}}>{money(item.price*(cart[item.id]||0))}</strong></div>
                    <div style={{display:"flex",alignItems:"center",gap:9}}><button onClick={()=>remove(item.id)} style={{width:27,height:27,border:"1px solid #ddd",borderRadius:"50%",background:"#fff"}}>−</button><b>{cart[item.id]}</b><button onClick={()=>add(item.id)} style={{width:27,height:27,border:0,borderRadius:"50%",background:"#ffd400",fontWeight:700}}>＋</button></div>
                  </div>)}
                  <div style={{textAlign:"right",paddingTop:11,fontSize:14}}>店铺小计 <b style={{fontSize:17,marginLeft:7}}>{money(subtotal)}</b></div>
                </section>;
              })}
              <div style={{background:"#fff",borderRadius:15,padding:15,marginTop:10}}>
                <div style={{display:"flex",justifyContent:"space-between",color:"#777"}}><span>商品总额</span><b style={{color:"#222"}}>{money(total)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:9,color:"#777"}}><span>配送费</span><b style={{color:"#222"}}>{money(deliveryFee*cartGroups.length)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #eee",paddingTop:14,marginTop:14,fontSize:16}}><b>合计</b><strong style={{color:"#e84b24",fontSize:21}}>{money(total+deliveryFee*cartGroups.length)}</strong></div>
                <button disabled={!count} onClick={()=>{setCheckoutOpen(true);setCheckoutDone(false)}} style={{width:"100%",border:0,borderRadius:28,background:"#ffd400",padding:15,fontSize:16,fontWeight:800,marginTop:17}}>去结算</button>
              </div>
            </>}
          </div>
        ) : selected && activeRestaurant ? (
          <div className="hp-detail-page">
            <div className="hp-detail-hero" style={{backgroundImage:"url("+activeRestaurant.image+")"}}>
              <button className="hp-back" onClick={()=>setSelected(null)}>‹</button>
              <button className="hp-heart" onClick={()=>{}}>♡</button>
            </div>
            <div className="hp-detail-info">
              <h2>{activeRestaurant.name}</h2><p>{activeRestaurant.desc}</p>
              <div className="hp-meta"><b>★ {activeRestaurant.rating}</b><span>{activeRestaurant.time}</span><span>{activeRestaurant.fee}</span></div>
              <div className="hp-deal-strip">🎉 新用户优惠 · 满额立减优惠券可用</div>
              <h3>招牌推荐</h3>
              {menu.map(item=>(
                <div className="hp-menu-row" key={item.id}>
                  <img src={item.image} alt={item.name} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="https://images.deliveryhero.io/image/fd-pk/LH/dxiq-listing.jpg"}}/>
                  <div className="hp-menu-copy"><b>{item.name}</b><small>{item.desc}</small><strong>{money(item.price)}</strong></div>
                  <button className="hp-add" onClick={()=>add(item.id)}>＋</button>
                  {cart[item.id]>0 && <span className="hp-qty">{cart[item.id]}</span>}
                </div>
              ))}
              {restaurantCount>0 && <div className="hp-inline-cart">
                <div className="hp-inline-cart-title"><b>已加购商品 · {restaurantCount} 件</b><button onClick={()=>menu.forEach(item=>{if(cart[item.id])setCart(v=>({...v,[item.id]:0}))})}>清空</button></div>
                {restaurantCart.map(item=><div className="hp-inline-cart-row" key={item.id}>
                  <img src={item.image} alt={item.name} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="https://images.deliveryhero.io/image/fd-pk/LH/dxiq-listing.jpg"}}/><span><b>{item.name}</b><small>单价 {money(item.price)} · 已加入购物车</small></span><strong>{money(item.price*cart[item.id])}</strong>
                  <button onClick={()=>remove(item.id)}>−</button><b>{cart[item.id]}</b><button onClick={()=>add(item.id)}>＋</button>
                </div>)}
                <div className="hp-inline-cart-total"><b>合计 {money(restaurantTotal)}</b><button onClick={()=>{setCart(Object.fromEntries(allMenu.map(item=>[item.id,menu.some(m=>m.id===item.id)?(cart[item.id]||0):0])));setCheckoutOpen(true);setCheckoutDone(false)}}>去结算 ›</button></div>
              </div>}
            </div>
          </div>
        ) : tab === "首页" ? (
          <>
            <div className="hp-header">
              <div className="hp-location"><small>配送至</small><b>⌖ 选择配送地址 ⌄</b></div>
              <button className="hp-support" onClick={()=>setTab("我的")}>客服</button>
            </div>
            <div className="hp-search-wrap"><SearchBox value={q} set={setQ} placeholder="搜索餐厅、美食或商品"/></div>
            <div className="hp-promo">
              <div><small>WELCOME TO HUNGRYPANDA</small><h2>今天想吃点什么？</h2><p>新用户专享优惠 · 美食送到家</p><b>领优惠券 ›</b></div>
              <div className="hp-promo-panda">🐼</div>
            </div>
            <div className="hp-quick-grid">
              {["外卖","自取","超市","优惠券"].map((v,i)=><button key={v} onClick={()=>setCategory(i===2?"超市":"全部")}><span>{["🍱","🥡","🛒","🎟️"][i]}</span><b>{v}</b></button>)}
            </div>
            <div className="hp-categories">
              {["全部","中餐","日韩料理","奶茶甜品","热炒"].map((v,i)=><button className={category===v?"active":""} key={v} onClick={()=>setCategory(v)}><span>{["🍜","🥢","🍣","🧋","🍳"][i]}</span>{v}</button>)}
            </div>
            <div className="hp-section-title"><div><h3>附近热门餐厅</h3><small>发现你附近的亚洲美食</small></div><button onClick={()=>setCategory("全部")}>查看全部 ›</button></div>
            <div className="hp-restaurant-list">
              {visibleRestaurants.map(r=>(
                <button className="hp-restaurant-card" key={r.id} onClick={()=>setSelected(r.id)}>
                  <div className="hp-restaurant-image"><img src={r.image} alt={r.name} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=r.menu[0].image}}/><span>{r.tag}</span></div>
                  <div className="hp-restaurant-info"><b>{r.name}</b><div className="hp-rating"><strong>★ {r.rating}</strong><span>{r.time}</span></div><small>{r.desc}</small><footer><span>{r.fee}</span><span>{r.price}</span></footer></div>
                </button>
              ))}
              {visibleRestaurants.length===0 && <div className="hp-empty">没有找到相关餐厅，试试其他关键词吧</div>}
            </div>
          </>
        ) : tab === "订单" ? (
          <div className="hp-orders"><h2>我的订单</h2><div className="hp-order-empty"><span>🧾</span><b>还没有订单</b><small>下单后，订单状态和配送进度会显示在这里</small><button onClick={()=>setTab("首页")}>去逛逛</button></div></div>
        ) : (
          <div className="hp-profile"><div className="hp-profile-top"><span>🐼</span><div><b>欢迎来到 HungryPanda</b><small>登录后享受更多会员权益</small></div><button>登录 / 注册</button></div>{["我的优惠券","收货地址","收藏餐厅","客服与帮助","设置"].map((v,i)=><button className="hp-profile-row" key={v}><span>{["🎟️","📍","♡","🎧","⚙️"][i]}</span>{v}<b>›</b></button>)}</div>
        )}
      </div>

      <div className="hp-bottom">
        <button className={tab==="首页"?"active":""} onClick={()=>{setSelected(null);setTab("首页")}}><span>⌂</span>首页</button>
        <button className={tab==="订单"?"active":""} onClick={()=>{setSelected(null);setTab("订单")}}><span>▤</span>订单</button>
        <button onClick={()=>{setSelected(null);setCheckoutOpen(false);setCartPage(true)}} className={"hp-cart-tab"+(cartPage?" active":"")}><span>🛒{count>0&&<i>{count}</i>}</span>购物车</button>
        <button className={tab==="我的"?"active":""} onClick={()=>{setSelected(null);setTab("我的")}}><span>♙</span>我的</button>
      </div>
    </div>
  );
}
