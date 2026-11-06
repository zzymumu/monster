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
type ShopeeProduct = { id:string; name:string; price:number; oldPrice:number; category:string; emoji:string; color:string; sold:string; badge:string };
const shopeeProducts: ShopeeProduct[] = [
{id:"earbuds",name:"藍牙無線耳機｜可愛貓耳造型",price:399,oldPrice:890,category:"3C配件",emoji:"🎧",color:"#f6dfe7",sold:"已售出 1.2萬",badge:"免運"},
{id:"tote",name:"日系帆布托特包 大容量購物袋",price:189,oldPrice:350,category:"女裝配件",emoji:"👜",color:"#e9dfcf",sold:"已售出 8,632",badge:"蝦皮推薦"},
{id:"cat",name:"療癒系黑貓玩偶 絨毛娃娃",price:259,oldPrice:490,category:"居家生活",emoji:"🐈‍⬛",color:"#ddd9e9",sold:"已售出 3,104",badge:"熱銷"},
{id:"lip",name:"水潤持色唇釉｜多色可選",price:220,oldPrice:399,category:"美妝保養",emoji:"💄",color:"#f5d7d7",sold:"已售出 9,821",badge:"折價券"},
{id:"camera",name:"復古底片風數位相機",price:1680,oldPrice:2290,category:"3C配件",emoji:"📷",color:"#d8e5ed",sold:"已售出 742",badge:"免運"},
{id:"cup",name:"簡約陶瓷馬克杯 早晨咖啡杯",price:159,oldPrice:280,category:"居家生活",emoji:"☕",color:"#e9dfd2",sold:"已售出 2,301",badge:"超商取貨"},
{id:"concert",name:"演唱會應援手燈收納包",price:299,oldPrice:450,category:"娛樂收藏",emoji:"🎤",color:"#f1d9e7",sold:"已售出 1,026",badge:"人氣商品"},
{id:"petfood",name:"天然雞肉配方 成貓飼料 1.5kg",price:680,oldPrice:820,category:"寵物用品",emoji:"🐾",color:"#e8e0c9",sold:"已售出 5,620",badge:"免運"}
];
const shopeeCategories=["全部","女裝配件","美妝保養","3C配件","居家生活","寵物用品","娛樂收藏"];
type ShopeeCart=Record<string,number>;
export function ShopeeSkin(p:Props){
 const [tab,setTab]=useState("首頁"),[query,setQuery]=useState(""),[category,setCategory]=useState("全部");
 const [product,setProduct]=useState<ShopeeProduct|null>(null);
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
  <header className="shopee-header"><div className="shopee-brand"><span className="shopee-mark">S</span><strong>蝦皮購物</strong><small>台灣</small></div><button onClick={()=>setTab("購物車")} aria-label="購物車"><ShoppingCart size={21}/>{count>0&&<i>{count}</i>}</button></header>
  <div className="shopee-search-wrap"><SearchBox value={query} set={setQuery} placeholder="搜尋商品、品牌或賣場"/><button onClick={()=>setTab("分類")}>搜尋</button></div>
  <div className="catalog-scroll shopee-scroll">
   {product?<div className="shopee-detail"><button className="shopee-back" onClick={()=>setProduct(null)}>‹ 返回商品</button><div className="shopee-product-art" style={{background:product.color}}><span>{product.emoji}</span><small>{product.badge}</small></div><div className="shopee-detail-info"><div className="shopee-price-line"><b>NT$ {product.price.toLocaleString("zh-TW")}</b><del>NT$ {product.oldPrice.toLocaleString("zh-TW")}</del></div><h2>{product.name}</h2><p>{product.sold}　⭐ 4.9</p><div className="shopee-service">🚚 蝦皮店到店／超商取貨　🎟️ 領券折價</div><h3>商品規格</h3><p>款式：標準款　｜　現貨供應</p><h3>配送方式</h3><p>支援 7-ELEVEN、全家及蝦皮店到店（模擬）</p></div><div className="shopee-detail-actions"><button onClick={()=>add(product)}>加入購物車</button><button onClick={()=>{add(product);setTab("購物車");setProduct(null)}}>立即購買</button></div></div>
   :tab==="首頁"?<><div className="shopee-promo"><div><small>SHOPEE MALL · 台灣</small><h2>蝦皮購物節</h2><p>天天領券・好物優惠・超商取貨</p><b>最高折 NT$ 200</b></div><span>🛍️</span></div><div className="shopee-perks">{["🎟️ 天天領券","🚚 免運優惠","⚡ 限時特賣","🏪 超商取貨"].map(v=><button key={v} onClick={()=>setModal("coupon")}>{v}</button>)}</div><div className="shopee-section-title"><strong>熱門分類</strong><small onClick={()=>setTab("分類")}>查看全部 ›</small></div><div className="shopee-category-grid">{shopeeCategories.slice(1).map((v,i)=><button key={v} onClick={()=>{setCategory(v);setTab("分類")}}><span>{["👗","💄","🎧","🏠","🐾","🎤"][i]}</span>{v}</button>)}</div><div className="shopee-section-title"><strong>為你推薦</strong><small>精選好物</small></div><div className="shopee-product-grid">{shopeeProducts.map(v=><button key={v.id} onClick={()=>setProduct(v)}><div className="shopee-product-art" style={{background:v.color}}><span>{v.emoji}</span><small>{v.badge}</small></div><strong>{v.name}</strong><p><b>NT$ {v.price.toLocaleString("zh-TW")}</b><del>{v.oldPrice}</del></p><small>{v.sold}</small></button>)}</div></>
   :tab==="分類"?<><div className="shopee-category-chips">{shopeeCategories.map(v=><button className={category===v?"selected":""} key={v} onClick={()=>setCategory(v)}>{v}</button>)}</div><div className="shopee-product-grid">{filtered.map(v=><button key={v.id} onClick={()=>setProduct(v)}><div className="shopee-product-art" style={{background:v.color}}><span>{v.emoji}</span><small>{v.badge}</small></div><strong>{v.name}</strong><p><b>NT$ {v.price.toLocaleString("zh-TW")}</b><del>{v.oldPrice}</del></p><small>{v.sold}</small></button>)}</div></>
   :tab==="購物車"?<div className="shopee-cart"><h2>購物車</h2>{shopeeProducts.filter(v=>cart[v.id]).map(v=><div className="shopee-cart-item" key={v.id}><span style={{background:v.color}}>{v.emoji}</span><div><strong>{v.name}</strong><b>NT$ {v.price}</b><div><button onClick={()=>remove(v)}>−</button><small>{cart[v.id]}</small><button onClick={()=>add(v)}>＋</button></div></div></div>)}{!count&&<p className="shopee-empty">🛒 購物車還是空的，去逛逛吧！</p>}<footer><span>合計 <b>NT$ {total.toLocaleString("zh-TW")}</b></span><button disabled={!count} onClick={()=>setModal("checkout")}>去買單（{count}）</button></footer></div>
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
