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
import { useState } from "react";
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
{id:"dating-book",name:"跟男人談戀愛的100種方法｜戀愛指南",price:299,oldPrice:399,category:"書籍文具",emoji:"📚",color:"#f0e0d8",sold:"已售出 2,031",badge:"人氣讀物"}
];
const shopeeCategories=["全部","女裝配件","寵物用品","居家生活","娛樂收藏","書籍文具"];
type ShopeeCart=Record<string,number>;
export function ShopeeSkin(p:Props){
 const [tab,setTab]=useState("首頁"),[query,setQuery]=useState(""),[category,setCategory]=useState("全部");
 const [product,setProduct]=useState<ShopeeProduct|null>(null),[variant,setVariant]=useState("");
 const [cart,setCart]=useState<ShopeeCart>(()=>{try{return JSON.parse(String(p.ui?.shopeeCart||"{}"))}catch{return{}}});
 const [orders,setOrders]=useState<Array<{id:string;name:string;price:number;qty:number;status:string;date:string}>>(()=>{try{return JSON.parse(String(p.ui?.shopeeOrders||"[]"))}catch{return[]}});
 const [modal,setModal]=useState<"checkout"|"coupon"|null>(null),[pickup,setPickup]=useState("7-ELEVEN"),[address,setAddress]=useState("台北市信義區（示意地址）");
 const saveCart=(v:ShopeeCart)=>{setCart(v);p.onUi?.("shopeeCart",JSON.stringify(v))};
 const saveOrders=(v:typeof orders)=>{setOrders(v);p.onUi?.("shopeeOrders",JSON.stringify(v))};
 const add=(v:ShopeeProduct)=>saveCart({...cart,[v.id]:(cart[v.id]||0)+1});
 const remove=(v:ShopeeProduct)=>{const n={...cart};if((n[v.id]||0)>1)n[v.id]--;else delete n[v.id];saveCart(n)};
 const count=Object.values(cart).reduce((a,b)=>a+b,0);
 const total=shopeeProducts.reduce((n,v)=>n+v.price*(cart[v.id]||0),0);
 const filtered=shopeeProducts.filter(v=>(category==="全部"||v.category===category)&&(v.name+v.category).toLowerCase().includes(query.trim().toLowerCase()));
 const placeOrder=()=>{saveOrders([...orders,...shopeeProducts.filter(v=>cart[v.id]).map(v=>({id:"SP"+Date.now()+v.id,name:v.name,price:v.price,qty:cart[v.id],status:"待出貨",date:new Date().toLocaleString("zh-TW")}))]);saveCart({});setModal(null);setProduct(null);setTab("我的")};
 return <div className="catalog-skin shopee-ui">
  <header className="shopee-header"><div className="shopee-brand"><span className="shopee-mark">S</span><strong>蝦皮購物</strong><small>台灣</small></div><button type="button" className="shopee-cart-trigger" onClick={(event)=>{event.preventDefault();event.stopPropagation();setTab("購物車");setProduct(null)}} aria-label="開啟購物車"><ShoppingCart size={23}/>{count>0&&<i>{count}</i>}</button></header>
  <div className="shopee-search-wrap"><SearchBox value={query} set={setQuery} placeholder="搜尋商品、品牌或賣場"/><button onClick={()=>setTab("分類")}>搜尋</button></div>
  <div className="catalog-scroll shopee-scroll">
   {product?<div className="shopee-detail"><button className="shopee-back" onClick={()=>setProduct(null)}>‹ 返回商品</button><div className="shopee-product-art" style={{background:product.color}}>{product.image?<img src={product.image} alt={product.name}/>:<span>{product.emoji}</span>}<small>{product.badge}</small></div><div className="shopee-detail-info"><div className="shopee-price-line"><b>NT$ {product.price.toLocaleString("zh-TW")}</b><del>NT$ {product.oldPrice.toLocaleString("zh-TW")}</del></div><h2>{product.name}</h2><p>{product.sold} ⭐ 4.9</p><div className="shopee-service">🚚 蝦皮店到店／超商取貨 🎟️ 領券折價</div><h3>商品規格</h3>{product.variants?.length?<div className="shopee-variant-picks">{product.variants.map(v=><button className={variant===v?"selected":""} key={v} onClick={()=>setVariant(v)}>{v}</button>)}</div>:<p>款式：標準款 ｜ 現貨供應</p>}<h3>配送方式</h3><p>支援 7-ELEVEN、全家及蝦皮店到店（模擬）</p></div><div className="shopee-detail-actions"><button onClick={()=>add(product)}>加入購物車</button><button onClick={()=>{add(product);setTab("購物車");setProduct(null)}}>立即購買</button></div></div>
   :tab==="首頁"?<><div className="shopee-promo"><div><small>SHOPEE MALL · 台灣</small><h2>蝦皮購物節</h2><p>天天領券・好物優惠・超商取貨</p><b>最高折 NT$ 200</b></div><span>🛍️</span></div><div className="shopee-perks">{["🎟️ 天天領券","🚚 免運優惠","⚡ 限時特賣","🏪 超商取貨"].map(v=><button key={v} onClick={()=>setModal("coupon")}>{v}</button>)}</div><div className="shopee-section-title"><strong>熱門分類</strong><small onClick={()=>setTab("分類")}>查看全部 ›</small></div><div className="shopee-category-grid">{shopeeCategories.slice(1).map((v,i)=><button key={v} onClick={()=>{setCategory(v);setTab("分類")}}><span>{["👗","💄","🎧","🏠","🐾","🎤"][i]}</span>{v}</button>)}</div><div className="shopee-section-title"><strong>為你推薦</strong><small>精選好物</small></div><div className="shopee-product-grid">{shopeeProducts.map(v=><button key={v.id} onClick={()=>{setProduct(v);setVariant(v.variants?.[0]||"")}}><div className="shopee-product-art" style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:<span>{v.emoji}</span>}<small>{v.badge}</small></div><strong>{v.name}</strong><p><b>NT$ {v.price.toLocaleString("zh-TW")}</b><del>{v.oldPrice}</del></p><small>{v.sold}</small></button>)}</div></>
   :tab==="分類"?<><div className="shopee-category-chips">{shopeeCategories.map(v=><button className={category===v?"selected":""} key={v} onClick={()=>setCategory(v)}>{v}</button>)}</div><div className="shopee-product-grid">{filtered.map(v=><button key={v.id} onClick={()=>setProduct(v)}><div className="shopee-product-art" style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:<span>{v.emoji}</span>}<small>{v.badge}</small></div><strong>{v.name}</strong><p><b>NT$ {v.price.toLocaleString("zh-TW")}</b><del>{v.oldPrice}</del></p><small>{v.sold}</small></button>)}</div></>
   :tab==="購物車"?<div className="shopee-cart"><h2>購物車</h2>{shopeeProducts.filter(v=>cart[v.id]).map(v=><div className="shopee-cart-item" key={v.id}><span style={{background:v.color}}>{v.image?<img src={v.image} alt={v.name}/>:v.emoji}</span><div><strong>{v.name}</strong><b>NT$ {v.price}</b><div><button onClick={()=>remove(v)}>−</button><small>{cart[v.id]}</small><button onClick={()=>add(v)}>＋</button></div></div></div>)}{!count&&<p className="shopee-empty">🛒 購物車還是空的，去逛逛吧！</p>}<footer><span>合計 <b>NT$ {total.toLocaleString("zh-TW")}</b></span><button disabled={!count} onClick={()=>setModal("checkout")}>去買單（{count}）</button></footer></div>
   :tab==="我的"?<div className="shopee-account"><div className="shopee-profile"><span>🐱</span><div><strong>蝦皮購物會員</strong><small>嗨，今天想買點什麼？</small></div></div><div className="shopee-order-shortcuts">{["待付款","待出貨","待收貨","已完成"].map(v=><button key={v} onClick={()=>setTab("訂單")}>📦<small>{v}</small></button>)}</div><h3>我的訂單</h3>{orders.map(v=><div className="shopee-order-line" key={v.id}><span>{v.name} × {v.qty}</span><b>NT$ {v.price*v.qty}</b><small>{v.status} · {v.date}</small></div>)}<button className="shopee-outline" onClick={()=>setModal("coupon")}>🎟️ 我的優惠券</button></div>
   :<div className="shopee-orders"><h2>我的訂單</h2>{orders.map(v=><div className="shopee-order-line" key={v.id}><span>{v.name} × {v.qty}</span><b>NT$ {v.price*v.qty}</b><small>{v.status} · {v.date}</small></div>)}{!orders.length&&<p className="shopee-empty">目前沒有訂單</p>}</div>}
  </div>
  {modal==="checkout"&&<div className="shopee-modal-shade"><div className="shopee-checkout"><button className="shopee-modal-close" onClick={()=>setModal(null)}><X size={18}/></button><h2>確認訂單</h2><p>配送方式</p><select value={pickup} onChange={e=>setPickup(e.target.value)}><option>7-ELEVEN</option><option>全家 FamilyMart</option><option>蝦皮店到店</option></select><p>取貨門市／收件地址</p><input value={address} onChange={e=>setAddress(e.target.value)}/><div className="shopee-checkout-total">商品總額 <b>NT$ {total.toLocaleString("zh-TW")}</b></div><small>遊戲內模擬結帳，不會產生真實付款或配送。</small><button className="shopee-confirm" onClick={placeOrder}>確認下單</button></div></div>}
  {modal==="coupon"&&<div className="shopee-modal-shade" onClick={()=>setModal(null)}><div className="shopee-coupon" onClick={e=>e.stopPropagation()}><button onClick={()=>setModal(null)}>✕</button><h2>🎟️ 優惠券</h2><strong>滿 NT$ 599 折 NT$ 50</strong><p>新會員限定優惠（模擬）</p><button className="shopee-confirm" onClick={()=>setModal(null)}>領取優惠券</button></div></div>}
  <Tabs tabs={["首頁","分類","購物車","我的"]} value={tab} set={setTab} icons={[<Home/>,<Tag/>,<ShoppingCart/>,<Users/>]}/>
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
