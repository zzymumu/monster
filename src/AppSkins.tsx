import { NativeComposer } from "./DeviceSystem";
import { useSkinState } from "./skinState";
import { useEffect, useRef, useState } from "react";
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
import { makeItem, safeMedia, type Item, type UiValue } from "./schema";
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
  const safeSrc = safeMedia(src);
  const isBroccoli = name === "西蓝花" || name === "西兰花";
  const imageSrc = safeSrc.startsWith("data:image/") ? safeSrc : isBroccoli ? GLOOMY_AVATAR : "";
  return (
    <span className={`skin-avatar ${round ? "round" : ""} ${name === "大G" || name === "温尚翊" ? "guitar-avatar" : ""}`}>
      {imageSrc ? <img src={imageSrc} alt="" /> : name === "大G" || name === "温尚翊" ? "🎸" : name.slice(0, 1)}
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
  wechat = false,
}: {
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onRead: (id: string) => void;
  whatsapp?: boolean;
  wechat?: boolean;
}) {
  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [items.length]);

  return (
    <div ref={messagesRef} className={`skin-messages ${whatsapp ? "wa-wallpaper" : ""}`}>
      <div className="skin-date">{items[0]?.time.slice(0, 10)}</div>
      {items.map((i) => {
        const monsterMessage = wechat && !i.outgoing && (i.sender === "大G" || i.sender === "温尚翊");
        const simplifiedMessage = wechat && (i.outgoing || i.sender === "我" || i.sender === "西蓝花");
        const body = monsterMessage ? toTraditionalChinese(i.body) : simplifiedMessage ? toSimplifiedChinese(i.body) : i.body;
        return <div
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
                ¥ {body}
                <small>转账记录 · 虚构</small>
              </div>
            ) : (
              body
            )}
            <small className={whatsapp ? undefined : "wx-message-time"}>
              {i.time.slice(-5)}{" "}
              {whatsapp && i.outgoing && <CheckCheck size={11} />}
            </small>
          </button>
          {!whatsapp && i.outgoing && <Avatar name={i.sender} src={i.avatar} />}
        </div>;
      })}
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


type CatRescueState = { version: number; stage: number; branch: string; messages: Item[] };
function parseCatRescueState(raw: string): CatRescueState {
  try {
    const value = JSON.parse(raw) as Partial<CatRescueState>;
    if (value.version !== 2) return { version: 2, stage: 0, branch: "", messages: [] };
    return {
      version: 2,
      stage: Number.isFinite(value.stage) ? Number(value.stage) : 0,
      branch: typeof value.branch === "string" ? value.branch : "",
      messages: Array.isArray(value.messages) ? value.messages as Item[] : [],
    };
  } catch {
    return { version: 2, stage: 0, branch: "", messages: [] };
  }
}
type CatLine = { sender: "我" | "西蓝花"; body: string };
type CatChoice = {
  id: string;
  label: string;
  nextStage: number;
  branch?: string;
  lines: CatLine[];
};
const GLOOMY_AVATAR = "data:image/webp;base64,UklGRuAtAABXRUJQVlA4INQtAADQsgCdASpAAT8BPmEskkakIqGhJbT8GIAMCWJu4W5wwN3/7Lrn5B8vfof8N+7XtNWX/G/2rzq9rHW3mV8+/o32qf6H9j/c1+ov/Z+rnyDfr956Hql8xH7ifuT7tn/X9Z39/9Sn+p/9XrbvRU/cT1df/d7RX7u/uh7bWp6+bP8n6YfFj9D/d/If8Z+m/zv5hcoX0fwL/ln3p/mf4/0i8DfnjqBfj39P/1f5q8PdOZ6hfv397/5/+G8jb/R9PPtT/3PcE4eKgR/Tf7f/4/Zp/w/Jn+j/7H/5+4f/Pf8F/3uzF6W5dqc8lZvr45eeIpPPyO2StoRNZIv4TMcyHVaybM1wr/RTa/sbjsD884XhD+X2ppjZ4kp274U6M9KUyU9hHnJZ/vbfc6osJa/joIk2bsz1/AUFWgBc1qrAjS74HUYd7EOkfySsFKLTv7/57MDf/G30HNvTHjdq1dnvxlPuRcLiEo7eHvGmHlf/w6tss0+vniWOnjpg780Of9FhxWZALzVBmbvKU5n7lEFu3xMvRohYUg2cC9wsfFvfTstuypn11PvrTT1KLbpsaVE2lr1b8tLtssYvaua3H2wIlFXiL+QspuTaUsz/omR7V+5XZcEdg98MXVVyIB/L+2hWwrcSg8tGyY/O5eVaeFf/NeOOxA5F1Qpy8usZNHQVA+t/9S37eYHeb3IbyM2TC1f0AuuV+iHyU/6RwdNjvL/v16IyEC3a9gHnypocK3QvJs2Z01eCaaIxXAaSDczvmFUZzzSxJhGlahKyqbZ//q4OoCcM9kOppLWji1Edm/XoBuex3rwJwYOffucKRogzAjq5tvOoTcVs45bd9xNofnuHzLLI89yGKpS3n6K/XlHA88zn37nCkaSDZ2JADUMxA2a41zIRSUnTEhpc8x4dGXLijdK3L5wpGkg3IbsXp7j5sJ8vWwf6ezEQdND0SywJzBVUUxJuw4a/Bz79zhSNJNpQ/dXk4JCzJRBLuseTft2gtjSbywkuHgOPg1CkaSDchvH9N7MfxFWAnTfJ7epZRLn1arxQ57m+x4Jy5HNaFbcshybhWhjBdqYN4Du33tb/Lg1UGxRo2+z1zd5vetSQpkBFXC+FrOyn3zouelN7GXQbN+E5b7sHNGGc/J5UD+RCfKFUvCqc0YQu1PU8v1PZ4NPltJd7Dur4brhtMMJv0JrL8B0QqXUXmtL51yV7t2otpVooGD7Y0TD65X67gA5K8sPljq3USVVdw0WM+uIw4Tg0085rvA453JYszqXHowA7/caKb5MnS6ZmoBh40q+oK0rx7nUfQIH/6wND+k/ZY9NLWgp7GWNHPSCaJWLJqPQ83zGfps3mvXlPiETFO+McRPIEvQqg2PH8lt4ElAALAZlzqX9Ohe82Hm3t4Nvtu0923iUS1Hm8gaxfJ85D/YH0x7X09zeGadWx38gXv63BigPPJ6wZuVTI+a7bzOCKCVzKt5/H/60/vW1t9b5z0Um7m1UNtCDOQtwMwMH1QEK0uaZa+8gmmRlStTKoexSc0+/cENB06K41pQarK9cTX2mphid60PuaFXJYpOImrl+4mXtm7mey5Q/ttG1KTOUqrJzlHlzXf6ZxnEstJqju7wx+63yGYelaWwIlgOdWMcvEd5FxgQLu/cIklirV2VSXn3jijBaq8x6t74INK8Hab7Ft28jeRSoP1Q+am2e6Oj0jEdPoPKKkeFx/lyVL3xPjz+3BURSaCQE9dZ+OvRSN+khoDYr0lzH/X/mtqLk7Ch6mLjlcMOSJDsLaO3QycAnCndD3sGA5opHG8fakmagMVGR9BFH8R38SuiF9EVmTmnUL7zDUGRaZOcnj2fMB9KNUOVq8Fjh9dBEAQD/jRplWn4nr3J7ArDbkcEa2Q3pgE250RrNtSGi0dpVdrV2XYSsDbYMcRbdGGLoa4AD+86pFey7UoNkfslXSdMx7+JBBRPIiC6UAPUervv6Apv2ZdPn8LGSPS0tO5em0Ah5h2OlaaLEW4GNQH57JEe41acEMnIA0Gydb60r8Bwuh1QJdCndUYMOuRh5jrKJcpjcoraKqhiTfNgO/8YYzdI809xfK4Ip4RUk71iJQUmU7QqlepfqbL7jaDgOzGMHAnTc5iunyYOURYJMYEFgIO3MOlNnGJ+dmLB7Fl/3/l2Gf/nXQLDOIGKFEgFZVFy8HVI8bJk8FtTYGzKY2BfjeKjiMRQpTgUrNeMms3Ef8Lzq2u1O5YjQ4J0FKuPKyUIeovLMhkCwCOhQkJkAeVHa42ziFZMYqTcDwWhhsQt6jNlTc78fFwT4os8mVzscwDnpiJ1pnyxrgc2AKpg400JEBNLNDcI5X5LeTSFD0lDxSfkdO6hM8s8T0klVnR+8Ndfv6n8Rz7C9m+95ncxbH1mtUxChQlN3l3JENLou/N3db9XKyMM3N4/vv8rYHbv+/n9JK7XWqMpAKGM3r0vA3qo7KIFub8KAWamLAnT/CyGzBC7Qu8g3XZyHMszwZ5LMSbSwR427/KJyzKsO7kXaUwP7vhDcWacsp/urup3ln7iYk7kqhF4GH+dGKAMxZh2ejuh0xb9BPj74d8FwWQwPd+YF/v+z7mTxNVBfdKJJeALjaWV0nVOc6lgjUcrxlfk3jULQH7kmvAWl0u5xP5A910ywMuBwL5W+cfsDRu+yPrE7CFlmzotU0kTP4R1twpKCoYDIlSM3I8V6joupfcrgXou3/TGQFavpt76zFL8uxA+VaeLO2dke8uARaFwVEY1+G+yBLdkUCZE2f9EM3vFdK18NHUIA6yr9fAZRzsqah7B2WPcI60RMUfy5QgOt/CKxuTugc9Zrz9RQ5dYxLou7Du0QDg3iiXCe9WI5QmPCo+1PBJki6uzb45pkEczZZwMsxHaWTwJO8AtGpw6mPbL5FV0A/g2IaNoTDj+1j7NjaWCjh9XngdWcsjbVE0vd0NgXbqUzsmMurz8M5Abi1l13pzSpjn5wPU9hsLABFzt1ClR6VuxruaxD2X4St6Jnkee6/SJ+YjatGLUd4V5f5CnfOUQvq57OFfu2XNwfnrX916//WhYpSK/lo1Pfq9ZMUakMdSEc2SgNHjS+vK/CbBK3CAB1pMn6Tmah3fjQFZSJbQxznkcnewloO3sC8OV0absAUga7/GTUybWwGN4Lof3Q5Yz4aJFdp3PEdaLKNfu4c4OJ39fsib2dvo/II4ez6HSHVpfb3MZeAJzoG+06hY1z74b82CqBALqnbGKqxeVymB2e3s01s/747/ohNOBLEnksqMrfLoPe2Uf0bIF3F8qFzMRXghdbEgRF6t62+a6zOC8ydmKisvQR5Mc3wu068w/BRV5tkGC65vuby9udOz+FqP7/UKlhbhknRuONmZOemZla1XCSxpTltZtwf0642mQPN83xWYwJiUHnpcUnNcKhh4NI4A1Tg502csUGGswXsBcvqYzK76PV18Qz4b5YpxJRayPIXSi05X1OXthQci8NwUzaxgNFpZdsNj+zQA5Mb3wWCa9U9TeGUyFDYWNRNbkFseW3L+dnCwPRuooLjPzwZZrlhSs8NqlY1PvB0KNd2HzOAlUiqhmh0ybtN4BmHBTy2aBmdXT8gk+BPznNXc2LiDhUS8btIIaIo7eJxHLsNnRe06rBSBwdwZzH9NWX6i247k2GAt35srd0mO4ey9nq8847UF+2Umz1JDjZ1w8I54adkmxxWnLGdbO1EA2jYRNg7HfR7rffjorFOQ68SRojp3XlPYaL2QnOhQ/AKaoKneULOkpJNXznhx4UQyzEYXdxwYPss1Twz38ibT1HTP1gJnyoBwMQzF1WAG6Ioi9jii0J0jOFQAb+9OL4mWoCNBezqeDgJHxonFs0NC/Wr7Bn9qAaXDuLyyYlpf0FYwYO0XYQtIjWLRPap3qYXbyj2bidniCUZ0Wra8EA/fur2Dg+7EbybvsAICvaUfjbecQyudd4CGuHd1N0I97GxWXutgEOGFTgGRUg+JFtxpjMGqd0XFbJbb7ycwRZmmYNqMcXIWzQc/3/rXAEQZo5PcMWQ+guWidE2zdGS+jWo8RdChmyUkEaaN8/Saz9LTBR2GlVy54NTxW0gmKqqweQN4yXU0Rpf3z1NhzIy7FcG2SzFc+wzTtGMcmvgZ+ucSuU8A/3hDyRyLk9lFwtDYabaPBhezWqpNOagcJW4qC7joJPjQOSnAPd2gAAAAA1EoU4w84czwnEIol5s43U9zxcn8Frxe+jcuH5whd/UdeOxB8ZcfId3XHECPFPICmP/eLLmz6zU+jZaQnP4TYHzj+M1sZuYXiqghRhZoDYS3LQizS5wNFqGmnXGEjILyFdFBbfZTjEE1HPCle5vPnXA1xF1nj1ZqiiHqh2DsdAPiflb7uqP4J6kNgTzmq2i7ROp+RDSBB5I5fectTvciIZAXkruAyMC3KxUHxO4Kp3ZrHoGSDavJbgIz7YurjCUBpY8LbB/UeRTQITlR/he8IPS6d3Ib6Pjkv1DMEWoExACo+oVXNcu5yqQHSwKuRxbQOmDicr0Du9Jp99xdu14Ykc/X+Wd508xkAN32lk3Jl+6bVYqsg0Kz6N424ZdB4wfG+XxwV9RQ47deO4Z3mGmCRH2MR0YszBIt9dnAlkY3T9fMJFJJetyzaHOLp++0dBkt6TnlOS7MAI6Njr73xpVGS+pTH6/rXp05JVys/68CW5S4DO+YE6n5U0PNSKQd9FBBf8VL0JzQRWGn5j+yl0zzrD/+TW9ochR+ZGoIRKWaGZDmDyAsyA0kKUPfbkjQDLidZsVRGy1kiaa6JjTKHACjoqAE+LthKKhkvhmLtPldJfXdTXMzzLWXiTSScQHxohxviJxBgxlZDM+vmgAAAOS9mIlAcvxLk1oD8zpQP1TlHKTNGnn6BdVLDmfx1BONF2WxCm7iOXdDBUAJlPm365EeeNYZM3IYZE82rFxF0VadD/D/O8TJ3JLQTYsp193umQn3IA4BNy/WMt1ZcM6sl2EwGkI2rhPD9E9wP3E3J4xxbs8YZLBY5wjtBW67WZIlUNs5GqJefAJBXWPUL+CcwP5H4pSV4p+PVESjuAKSy4cR2Gd7SI9/Fx/XcoGQHUKDCHRXo2J4bFaX5PtmpvUwv+KdcibC/m0euYIsLs5+zs5IAlnruldLcYUmJxp/gHtf1ooNeA8TbWf48tKgRu4gRc4gYsyNJ3dPh/nT5eyoVnRpoFSLfLGOzAta/SIZb4N6BforRw6Y8FIo/aOmTW0XgW8bI+gybL/FPT1CnZzD7pNLyDgjC52ZxCpYkBmg5tJPciAwq0RAQQgzyKbqszibcdjia1WsT7p0B4+4+7EM6ZTpZtiFU4OtqoAM9fExQAAGOr3HCk9jcck8LjZIJcbLz6VX5gIuGVCuDi6NVPah+h1j8zjhsbXMcGuzS0Qiei8+htcgqkqF3JoNFy9KaUJkhol6/ynJyzyi/LkmVOEZ1PK3NNwevsz1/DnjrJpXMB35kvxNwP3INqRM3l7nP0J7xrGBhVNBNfkFJEV2gazgcMxPnYCQlE+4PhtIBSixmw6eAWnR4PW8dBcn7UVcgj/F073fdD3yFWFIQ7rXmPIzsIRRzSgJhfV9WiQqE6g2oH842EP76WfWGpe+buBCEhSK750SvfQpsj+B7fG92865rkCHwOJUd0Wmk50GRKlA5VPg5Yiw9+grQScqltbPwukp34QSHrCxHCvcbPHSVbfudxEViqLsx7FCKjkPybnGAP52XRINdKKZxXHNw/rvr2igAXxEIPhhdWHcMLkNzAAADG1YWPBXUN2/CAP6FSEgftABisiJ64DCQFXICVBd5Na9gftOszDIelPwSChQ4nSB0CEnIoqYM2CfJxmtbIiW3Jrsjkr785TR9ZsdK9ba7MXbEFtfc4EfPq5Ydzf3PF4bWcW2MSJOOc6DiQwR4JiwV7LmIEbHt68u8rJx5ilQynX7+gyWtvYgHkLdfI0Q0gCyqrrazSdNPSSoot9dB3JfW+6Z81OPLt2qybF1JbKvOh7i9UJdYuxi5lJc0/RPIxZJoE1EU+WdmQ5tJk9+cl9uL9MBmaDU8/Caxb3q1raYq8vZHmjHMqqO1vzXhJC74unWw9AAID99ynMAAAHXlbv38wFH2sveeSO1oLabcNJi4xMaShQXSEamwnd3BAgTZ57ch0BdzrWQX9xAoTWgj+zmp7/UdHgT6c4scQBIn9rHKSYvNe1Z6q+igHqTc/h7pjMLlKvQg57Hj/IxiYP+It/2Xg7Oy6D+Crogapa6QQOV8ousMKDxbz/4fjde3yFVpdGnhKpz2eK3ldzXPZzJSfUy6jT1UvyF66zYvnUq4iNQcyK6l7Zhq4RtWDw9xVxd0iJZNeK4m6C3YyUJy1gu01/shuAoFPkC4AADCBu9P4y1qxQOqhpk8M1aRPGw1/5Qi6FzD5K9ikPPyOO0Zao5skOiP2oOboUqlOmtZxsz5BX0Xi7NbksTesvlDB/+q9uVU1P90vsw+swvMN/XZAQ4MGqZjQce3gomUYDDkujkxA4im6OsqXbxT9DEGmjOSykUN/qsF0REi2W9ErLSr7CJOdee+g+B29ExCi4cuxCSM7z6NWRyf8rU9bCXHUHdzWct6AAkjqKJxq4/+WeY7DADhZur1NyBIw+ToV8Kvg4d6yvfE7QtVkfLeLeHKvlQoaiOeGUByjw6aEH+htxSLAHcwxPL+fNzkn3oKeZ0mdYJ9GhShAXuLaW0ByssAHYC/JM6HCxPSYV9AyT6oso2M4rRCtLLFwU/w0l5JPZ4u1M/p9tC7ugx7QGGbXA+EA7w+EVeeZfMcD9qX8dyEY+DylrC6xMy63fjVdgVNzm52DtQVhc2u+QD/apqIXKRVnEGZD2ORaXfgYgTrVS6TXPr36NpB2gDoMnYAPmWljobtEngiHt2CJ75VQqR4MKxYgAA1lkf1C2bBxJHaTfeOL1CnOFBTPkw139nePouP3Z/A4ms9rJn+aVm35EY8Y2SMa3EBPTWL08wBP+ip+iHs54vGvsav3h5zr5EOJ2vWG6Xp4JjQSI/84NdHYtcIYjfBuT0Fq0gZ0Zr+0rsGVIN6Uqw2ClB74YwoGU18q7TFUlMuR4lq9aA12j52S+FLT+uIh3cWmEjAuo0d1RmCKBd0/8hhXZbFk905RYOwS6XZUp5siceRjsfVD1IonY7YMbsfC9kMEWAK07baOlofNzw4nDtkLcw2CBJjaz9/BIQjA89anDoQPFUoB5iZgxa0aUTTGao7aN0swHWvTXpCJAMUCM2eks5i+uDcJhDGbbgxycwaH9BrXDeDoCyST0v+GqYYmYyifLJ/9xwJ2q6jZOnh7DmECTMkjWbOU4qGZpGN8GFz9i0wGGYaLOzoLgqlXgNHm7IefcwSyQK16ayz132Z31y4ts0MGBUtb3WD5ygKwR+/sJ7gxyRiF4Wm8q6pcZh8vpC+GmpZi4f2RfUNd8qaZKkL2Gu1DTEqCGxJBpoh9Ogj1o31a46miI9Ff125sfAG1CuBJz/ivL+OMpHs0Mx821vsZhL0xMzT6AgTRqDo1D7FlyypkqZu3GfeIevF6q8y0chRlm3t/+24iC+aVVnOQunHYqtZppjLYu1sAMPDUrLv69AglrNao1//VO6UWI76ui44onRMbv2Rds/fyRG2LQ3I/XX91mKLc7j+xxm0klDYpABqqkP0kAMOZ0dq8bW9mkaAvPXHaO/XPwAOA3R+Gj2M9bBXuyG8QKU8pVsJF1+sy05/pA3ZTF7U6ItJZIHexX/1CJ0lm7a44HhDd2hwspsb0wo8yX+k5i/oX/6F4MEf8GSrKq5OpqUUIJ5iIw7HtklCRKKy5FcxKZoIeC7fIwAvqz6Hg1JNM5jky6KeU7RZFqD831ogAKf0ymQmP2+PrIMmJSoWEjYaI3MPu+k2Yz0u589NREcCqEFK9kni9DGorG/iy0vecvRfj1q+K7JnZFE4MzChZQkK6bfFmGCQQiyZ9bPzgHFKwQYjyH3GcYpQYrU65ojXdUynDux4S31w+jGGoBBYblGUZTBCgR4WiKRj9OLO4HjU1on9qq3Ch3gtnpMG3IKFcJvUDe3z8pgBJiQpREZZJgVqjRGIQt7poT+3gtyfBgDIJoS2nsd4Suhrl7SB7bokSW4EhEWZ3uuXins92XzG+YFNOQlDjrb6zpNtYShr5bb4wKJIsgiVTfY22+3UMdTDXO7/zR+RN947Y47Olv1dLbuCRJowbpbnLVY7cUx/iiMskOj96/OVQu9RRfkYv63J994kuh14RanXLPvf3u09pNslW1rYtlHhQg9QcMY+OyI8TQUqaowUVHd4qL9poEHSa2GK7SuDwuVckAf8R5UVtPMFKBC5VedXkvnqM/8W+BLvbR6sUJL8CIf8qXLXcdH/J7qPkg8M/gIUrPGbu3LhTtFyaFt+VwNKioxRCYGaVLbI0/cMjDhWfmx3P5h22+mWw3coqxNV0pmXhoAqJQWuhQeHhyu/RcUR6QSjfkHFT+LAWEwHgdzchFcef+YkeyXUAnfLL7A81vqHUxQpTyHhr7dOUIBlx1FxOfy3+VU1sjlgYfDJXouhGPd+997p2baDtvyl2qWTohIKfTVhFk8Q8Oi+ZO492JgeEHnAa9ZssND+1H9M47Yd+xCh8KDI5HaztoTZcvkJ8ajMQA92Xz56sx/q94N+QotfmiWPBd8Sz5MmqGQwCZ9KDkTXR/J4Tb1JtGC3CWd7sKarwSqqt1VgQjt1BReQAd7dbxXgRwR6vAvcT2Yju26u8rdfoNkOtCeW42yNjinO/HTTkFG0Sq2WMcXCHOlPfFQoh7ZihOUrQFTZMAVxJl7meEpn+BW2moWkecvu/trwKFnLTFu1yBjVVFR4b2nlk0JRtFx72IS72Qwk2qgMzLGxj86vLzOB+zAlTbNK4x8NK6zQ89WuglbV22Ob6d7EWn4E5UGwmEmJ58AWReGiTzrS15fNNOC611ZMF7cNBNQpVT/QLZy8JQTEvbKVzmbngi4ayydJc3S5NdwahThenLxDANVa/h15Yk0AyACoCmvLytOPgQYcyH7E7FCdGwCDLi023OUk2fYLl0nFT63d3Ax4uhQBmIhUQXNp12wOsfNmA+Xy42CZCHdRDU54vAzc3a0//A7kS+ytJiFW2YB0ANF6NgzFWx4y6FCNn+Yrhnln1luutVE2uM3y5wuI0TO79EOr+YPyUZW/bS72asiYy2hYYMbhdAPwTiSXcGFuSAbquHXsJwcFdL8wJ7Kr1YRWxlZQ/y2jzC4srBm8n89ZC3k5VE3YV8LwTgjTEFhugLeG6AkUkYaXCuudevjy61ychwF/BKAf1rAKSiLlh8skghbHTLubkdBsqO9VhLkn+i37muBvFrU8MbP9s7vQWjI4xIEoOD/OPHzR+MGF7+vfrgyMd6LnOZi7tp00AwuPhLavNNJtLWa/Qvmv6agtrHN7l6wkavVgKuIQqf2rW1EQftvQc1YRDi5tmieNXghnEZXrbU/flI7OUUJ9ETePqxhW9WAJBPpqV9+3ETUJ/FlHWDIzAA2xydjWmX6mTo/Ds2KMZu9zVJpvABRxwluobBRHPt5lNAAIGkaoc1UVFDify9RkYeg6NHK1pWAPus+0iAFtwpS1WMrOP6YzdFhX8VQKr8qmnx4onToRlKHsvhAfG7hnfXNK22Jp1xxpwiadzDQQt0k6QsAGL9i27mqj+VdI6y0iVuljbBBqK/w/FPsVVUNwMtCG8663PrgwQDHG1Y08KW1wmPvYLyZydkEGHqz71qDQ6lWD8Emll5Pd/4fKXBob3Z/hXHOaWoURECdm07TgKT4tVL7A35jZSRv3LoTsHxFNApICwazKwqEj2Jl++K3IqrKm8dvcga497ExYXrXeaNbqzvj+PZhjU5XqoFZk78q4HVju9ncW7wryyxyr7GsVJGlQKwVqPL8q9h1B3wJv46dhVm+kt7ojAfNZV/2YuS4oNpTeGTT6v/sRlZgUdT8Xe14wfWD8FQF/JLnpM7fnfdVX35j/ncX7l53xM9KecQ/QbGSv7Hdg0o//JG/fRf9OKs43JO4o3e9yeLKmRUlZZ4x7MO+Z3OMF/y26+WZzOiD27GGeT62BPbZhPf17QDWHzaO4J/VL8CRaqwYO/FqGqCEEwzSNDsX8tLGOwdzntcG5xS5NzwKvjndy4j6B3wC/j9vscX1PBbXh8AKkiAHBr+LS6fF8ccgjsJ515COFTeZ2ZEyujJ3a/2j1KsNFKASXTWVTKRmtgJEEgy18AppBL54eUdceDowQab4EWH1mfpCuoZIp3AugEWHBIuzCZSu8EtqLZgk70lJj+MoVfDLuUj8/SegA3G81QMsdM9OF4VpzXOxfSHGQ0aYXwFXcrwY7RWMbH6hc9gaDQU7CdWu+hDxB5IPhelrVJRCVQSriqKK6Z76Ba7ISr9q0bkrmAkn3WDbT0YGOTW1dlZZUgFBDs/jznOuAAAABYFPH1r4oUvv23ed5r0sUjpaF+PZKl2pgYXzmotKoKlYi/KAQv7MsVy+b0pnG0y/VO/pmdvi2BSERbNJK5gKh9NhcEC7J7cf18m3S8Lc0/wKWT1HLuSjSsTE1de0yAY/HYet0A0yLffP2u6fVNTz6sBp5GAekUVzZcFXhP7jZ8YRZSMLXEDitAGf9YYr+8jpdZOt6JcBx9M/PaF/P9KbEt8BIe7woYV/3wL6kVvNmi3eNoELqKO8kU77kxuDL42h8QhUSUaigSqmZtZl+6OzOpFfg7NiYw+1YC3Vs5E3AiQ4IIB32r74k7KF8SypG8S/OLkfJ6E8yNUrcOTYc3I7HmF+DtL7oGhIHFnMcf2uHk9GrOr0ROI4rdEFq/8v21uMtGPzASN4InsrkUKb1wIdd2Ni9SwKROebpRkF3p8n/Sx0tk+CVgMzt7qekNDZOsuGa+TMIFb/eH22hfYQoMZfGfwUN1Z4Xnb5J8BhuM+wplKcuAm+zDNU4j4G+lPH+tbjFGEbhrFU0H4Aq6SkQujGtMlr06DU2jojTo0bR7MJd5m9iypYe6BJE7L+dPxT6lYcGnv/0eP56Qmqvz3ytWapf0newPibEUxviD9llKdwtP1bkxY4hBNBWLdZEfl8yqWaiSuJYWYmT+dphIgcdedYQrowjl51qIdZTDyJ1J/1jv6y9+bkETxt25g+mle2d3Vv3GAZ/OurF5epoZyQPAH+f+TqnrfRdBwkNUfKRXWHNNIbq+nVycHDyz/6S52VOHk1zwolAfEI2H8VIlnHHwXo6NwavnCZMeJtBSzzwGXKFwE48u2Nu7wQQjZLaTR62lDCH7koW2aznHJ7abOvAgjb/peSscY4MC9L+ljHs6Qfrn53J/Y85fzgMk8Afa7SgwlN7AQY2lk3MREq4d598pjF0insKzf419u6crhFYWgLJF7iL/n6Ezbck1sLXUS/gSh2T6V8q+kGapJCr7L0yxPPxH7gH/47JnoWWPl7/zltWMg+LoK1GL2t1rM9oTGT6pGTgacNFFWAkYGTE1PxLJ6JjGwJWVdnJ4b6GmpRptIcIfDVS9TiWzPijkJJzSabMKmN6rQKLFOLX40RdbmrsXKIhVqPRPRUYKIr0b+ZD0xuCkghihcJBeiI7cGzcdjTESgeRXlnZ1w0/VdGAW6lMGqsmoOy9jbYUBWAfHCuttfr98tk40y8uPe/LTK82FQzWL5DvIfoK+pPdijIFppcJCCuQX43ljQhIwqMHEmy3pPUMSdogSQ+YZqMkTUtbG7lK3TV1VzY1fGzeKW3EalSFqmabLg8PoLntN7aPCnPYI3DBEquSMtGxTVPnnTfhJz/SQYPtBp85dXDxfs6RdOlhftuM5DvFVU9Npj/h5Dijo+/VCUPwjMZc4zfpg7KrappUbVTZsJYMd4rMxNVLkLjJe7Ilx+UI51BLAB1cZWjnesvQNrgBJpT8wwe7Sw7k1nrAdv/JjrNpGnP6N+yEEWdNpHxNR6gb/FuJnZccn4f+df+WAmL1OkFXmJOhw7+KX/Yjyk08zJYG9EkjvdmRUF1aWI8PU8emf6fWDuj9Fw2n3fV5csH2Eq05TRn9xWPPmQaA749NfWN/UxHzrLS2lNygiIkk5T2pNXDwh9/I70K+mVdDTzLSpgda65PL3p1W/gm4JLgjLDhtgIdgs1pmsDAJDJiTQsL4Ok93bBjpO91I/AX2VdOmM7qoXBY6Bu8C1bvvi8CttykN1FM8pCsS9fiM1rEuQcCQS2cLPpa0hPTNv3yZd4S2p4STjaxnLZ63T+lwyC05UDF9Q1ok18QBtCYOfKHeradH9hDyTTr4yZT7YgzCmJdqn8cagZ8fPvqb9743eM3WJ4+w4fiXlaP2PF+yYyo1gtfAkP94qapM9CCFwGf4ptj0hnwd/dHzhHUEQvdsMV42V7qIb6N2Bj11NsVvUuAGHqw5oiYYZsFX9xBPiZ9k4UMSE9sFCABsZXkuY/efj8rCuA0X6ZjadYu+YwjTIaZhkGUU8V7pGKIBF3RaxFBwBkt7OsDkvi/St5vX5Qum1DayXv8S4EWwy8td6z3pREvv+ksCj76ISt3Ho0byIyPrf6nDG/10WxyU1HStw1W3UkhSbQWJUdB0vFWZv5i5MJ/QtuHHCU/S5RgTjUmw288vRPa0ZiAIuP/B2DKjIbzmLnKLCWFdMAOpdljRlXXxa3qNhB7EsnKbV+0SBl15sepI1PWgeeV2eWOcygLqty6RpY4OxGLMsStRQACqLM24M5FqrDcm1Ak9Ovkw4foesDF7/cwaPZ9MqdBmYbcZzG3odeTeDutjYWmoBRU1N/Xm2tRZRruCt8Dkxe8j3s2krfcTparXbEXesus+0n4+uWMC4V7eQTjlCq1Mh9F4f4yEEi4bpHjcqwqmwGCXSyAUi3FgzbgpjcLaJ+1qoPR52H+oB+fv20O8ux8kO23VLe2MbH/vb0P4vUAunaORVQf5CXCBqosLQlQnqCjeP08o1Lvanq7ZMpKq23d3uWLAFqsTqhI/UxbvmvIBelpeE9wqHGpWx8sRdvOD0uUW0bBnnEweo7f/yexj+8GT8iaWM6bDplMbL/v1ALpMA6ZX+ymICoIyx4LzBI/q9jXjWhFjdLu9PxXRbkN6npZcfztvrtbHrMMjhnJ+zT2zArhpc+GKhe5cENzAzmdqliSSAhppd9qSw7zEpl9/qD2T0LQ2sQUfX+nVmYGzOB6Vrb+CtXWfL+HSUIDSf9e7+K5ULygen+LSaryWPQC4IfKNy+RPTnYoW2i9ED8rukfGEZYIC3xEO5FKP0uSYYKeZZ4TijFfJe7trti+ifem7Ioswqdjm0jB7Difvx6N4qJJwxLIh0YH+Rq5sFvStvuKqFftnjeWbuBAW02nzA/0eVN7lnoezV7RNSZckajuqE4OfDTL1+4k8+tyQkQDTiqvuysRZZpzi0Hr4zp41cfgGbbBeuZenDklAGHKQjj5fMibtf47ObrtPg+/HVVErbxvZ4kyjbfW9ki/LvQMpFDoDrdSqvqwIb5ErjLkgLvhRZu3XwcencIeROODNzMFeWelsGfmAVRdSumkDh+at5kO/uxPo7LspAiQcPKHO+ONUKWKlBLMA4s9N9t97zrrkKAr/54L7/z8nVbKL5E0plzQ1PW/gWrDT9pp86RJrpx66UaDG92GWuLX4Rg5kl9PJSvivaMbKXmw+sjJy41jmis5NSlRL6CKpajcXLO4Ta0du1zQvIkoCjevJtvrW5qfjECz0DozpF6Q2LJmdWWmsx26TtkDXGCG56tba4v8B/pk78lSb8Zvz6Pb9O5bm7iLe9mHu0SpQRNVwqvdMUreSUGoAtJ8W7e0znOMQh97B9amoyMVnFLapcWKN0tn6/W/raCl7YW1XaIGsH2oNjLgMS7xQ3yTzb/fs9v9r+9WHLUPmE3NoWsCCD0BCd+oLqb7QCzrHrqXBmVEjAFUVgUPxVJAaaOpUvU6w54yCzJAvm7YWdIA9DtDHNTQXfQTRF2WueIJOeLuL5LEdZ1+k7H/HTMA2NQJFq9+INATf6ahoBWcf6qBTeObQcPU23s2aiC+0w6v1Z6AVl4M8KwVDQpOvJ4byftQABP2Q7dQ1IcUzR33eZIN7oPbaY3xwSDez0a+p6GFXU1IbnPQBZokQ0hXux3jftfhqQ7nTgzhZb1y2ngkfmayzxeG1HlJl2JSg3Ef4Vd8rXZZD0p8FzqewXlrxFglZ3sHLei7YXI84cU7SmX/BCnmInvsgxtgBpVuiiO9X2pmJO0YWMvZ8tvD6M2X9P3LUGurA5LBflZCZZ4A6M9fM0Llx/KIYA8LsXEZNpyOahs/+he/iKl5SL/C+WNqjeEl7wBCVSpD27KwGACukQKfsQh1ujuaHsGddty+fc8muSV5y6hiaL0vfsqjlhsvvN3ea9ffsBXSo8kLNNqzejTMD+3Kx/4VtrIg5UiZ8pcHsTsNfNc9v957obWHUMZ9OSnzSvubwDD78hXErY0X44229IRng1Av342p5wIvMUo3DHWkSDr4YpIsaD6aNtPcHBsPTZBTk/HJHI1V6j9ilaas8tKiIc2DWymNSzChs0OVjObPhOUPYNDA/IHklhlJ8XoCeY22/15MNZJkpo+HkK9h7CaVbAyio7iFaL5bsllnehm2aYPE3OaKoBfiI/1S/AuDFScbHUsB3lffSpA1tcyPE7n7eTXa6+npqxgnYdbnDOb+9cR1fhtyOIJr7wj8/e6qKyQeIZMYkMcQWrzd5XGo1zOM8ouL+lw83IKNSwHuBeIR+SDom3Jw4AU60LqK5UUtps6V5r6PzdjbVAanRcqM8ssUafpXmV6ropjFIcBQLXe0gliRd8VcfqF5+E9oXJY5pXsXnWGxYFacUL9cqZemdVbQmDYi6+8gMUnmBCYyL8dcRYiwlSTJJvPPxzIAkKI7XLJROjCKMBGDGAj3ozI66wIcsnJh88RRrDvH9vdk4vxGpuctecIsrNSs9wS6ga/IMIjQQZDAxuZ9aKLq37zPYjoaLoFpHFgleJzfZJ+VX7PGYaCheW4fH8INVO8ksCqGOvzg1tKIj1yqX/WTgknWiY6M7bn1kRqNaN7kFf4mqGLVwKd2H+Liuf25i8VmpVzHNZ/xf5bMDF4n1tUI21OVJ+H/Ki4ZEUPN5tvrTynze0LHuDgG3QOxczsnm3QJqI7BRUUdYxEQJejIqq8hSiohCKDASe2qdbP4JVWOUHilIxp0v6NoojqdPGGUVcp+HnRKqybp8heP86uOq/0PVOOy1T91uXO9xQavnRUbs/hcn/9l9Iqw/jtvAS/WA18D5N6C3ZjeToqgb4dCPW/iafzn8GasMS0uEzkuSBn/b0QNOVi5rD0aEDtD4vrn1T5nv1FQPIuqIov/fEYGNWVXwGWlPS/zdGoZt2qZO0IZzL/PYBUlrPsGD/I79p2YgGBdFHJ3zf+FxehISLJ3yZyilGxl/4rOfECWpkbakeMtqYu4Mf3TUwZr2lKsUoXoHz0F5ujoSV4irT3KKYWtz7vHjs7itVQBrmHLemzw21ZNgrev+eoLlDAw7K9Tzz6aWreDXDYqxjDmBQI4J7slJrDQO0VDj7cCAu1nmGpC81hljd3/Sky0Ui8wkgOZn0HNyqQIrkocP0xxudyc3K7W667DJ2X3lBVp1NkGo+W8bZzRduLmV8DvfnqVjOGaNkTVXlglZj6B0IkXqlCEOGwII8UU7XmWcQPALAAAAAA==";
const SIMPLIFIED_CHARS = "这边显发现后里为会说话让还没对时间开关门来过进见听问题吗吧样么个们从头长点爱欢乐难当动给气车钱买卖东书读写认识记错实觉应该系亲脸声远近尽别处万无数机电脑网线号种变带帮张条鱼猫鸟药医检验结终简体国台湾温尚翊妳够随虽压惊叹将愿务业场联络续热梦岁历户层楼总办响钟块单员职传输页图标签档录那哪谁";
const TRADITIONAL_CHARS = "這邊顯發現後裡為會說話讓還沒對時間開關門來過進見聽問題嗎吧樣麼個們從頭長點愛歡樂難當動給氣車錢買賣東書讀寫認識記錯實覺應該係親臉聲遠近盡別處萬無數機電腦網線號種變帶幫張條魚貓鳥藥醫檢驗結終簡體國臺灣溫尚翊妳夠隨雖壓驚嘆將願務業場聯絡續熱夢歲歷戶層樓總辦響鐘塊單員職傳輸頁圖標籤檔錄那哪誰";
function toTraditionalChinese(value: string) {
  return Array.from(value, (char) => {
    const index = SIMPLIFIED_CHARS.indexOf(char);
    return index < 0 ? char : Array.from(TRADITIONAL_CHARS)[index];
  }).join("");
}
function toSimplifiedChinese(value: string) {
  return Array.from(value, (char) => {
    const index = TRADITIONAL_CHARS.indexOf(char);
    return index < 0 ? char : Array.from(SIMPLIFIED_CHARS)[index];
  }).join("");
}
const CAT_RESCUE_CHOICES: Record<number, CatChoice[]> = {
  0: [
    { id: "bring-home", label: "我真的不忍心把它留在这里……想带它回家", nextStage: 1, branch: "bring-home", lines: [
      { sender: "我", body: "我越看越舍不得……它一直在路边叫，我想先把它带回家。" },
      { sender: "西蓝花", body: "等等等等！！你先不要冲動啦！你家里还有 Vava 耶！" },
      { sender: "我", body: "我知道啊，可是它这么小一只，身边也没有猫妈妈，我真的走不开。" },
      { sender: "西蓝花", body: "我不是不让你救它啦，我是怕它身上有跳蚤或传染病，回家碰到 Vava 怎么办？" },
    ]},
    { id: "leave-first", label: "先不带走好了……可是我真的有点放心不下", nextStage: 10, branch: "leave-first", lines: [
      { sender: "我", body: "我先不带它走好了……可是它一直在那里，我真的有点放心不下。" },
      { sender: "西蓝花", body: "嗯……先不要急着抱回家也可以，至少先确认它附近有没有妈妈或其他人照顾。" },
      { sender: "我", body: "好吧，我先走一段看看，可是我一定会一直想它。" },
      { sender: "西蓝花", body: "你先去忙一下啦，有时候它可能只是躲在附近，等等再看看也好。" },
    ]},
  ],
  1: [
    { id: "separate-room", label: "我可以让它住另一个房间，完全不碰到 Vava", nextStage: 2, lines: [
      { sender: "我", body: "我可以让它先住另一个房间，门关起来，完全不让它碰到 Vava。" },
      { sender: "西蓝花", body: "可是你进出房间也会把病菌带来带去啊，而且它的健康状况我们都不知道。" },
      { sender: "我", body: "那我回家先换衣服、洗手消毒，东西也分开用，好不好？" },
      { sender: "西蓝花", body: "你连隔离流程都想好了是不是……我真的要被你说服了，但还是要先看医生！" },
    ]},
    { id: "cant-leave", label: "可是我一想到它还要在外面待着就好难受", nextStage: 2, lines: [
      { sender: "我", body: "可是我一想到它还要在外面待着，我就觉得好难受。它看起来真的很小。" },
      { sender: "西蓝花", body: "我懂啦……但你也不能因为心疼它，就让 Vava 冒风险啊。" },
      { sender: "我", body: "我没有要让它们见面，我只是想先把它安置好。" },
      { sender: "西蓝花", body: "唉，你这样讲我也开始心软了……但一定要先检查，答应我。" },
    ]},
  ],
  2: [
    { id: "clinic-first", label: "那我先带它去医院，检查完再决定怎么安置", nextStage: 3, lines: [
      { sender: "我", body: "不然这样好了，我先带它去医院，检查完再决定怎么安置。" },
      { sender: "西蓝花", body: "这样比較好！可是你确定它愿意让你抱吗？也要小心别被抓傷。" },
      { sender: "我", body: "我慢慢靠近它了，它没有躲，还一直蹭我的手。" },
      { sender: "西蓝花", body: "啊啊啊不要讲得这么可爱啦！我现在也很难叫你放下它了。" },
    ]},
    { id: "still-worried", label: "我还是怕带回家不安全……要不先送医院？", nextStage: 3, lines: [
      { sender: "我", body: "我还是怕带回家不安全……要不先送医院？至少先让医生看看它。" },
      { sender: "西蓝花", body: "对！先去医院最安心，记得跟医生说家里还有 Vava。" },
      { sender: "我", body: "嗯，我会跟医生说，也会准备单独的外出笼。" },
      { sender: "西蓝花", body: "那我稍微放心一点了……但你真的确定要带它回家吗？" },
    ]},
  ],
  3: [
    { id: "promise-check", label: "放心吧，我会先带它去医院检查，绝对不会让它碰到 Vava", nextStage: 4, lines: [
      { sender: "我", body: "放心吧，我会带它去医院先检查，医生确认安全之前绝对不会让它碰到 Vava。" },
      { sender: "西蓝花", body: "好啦……你都说到这个份上了，我就相信你一次。先带它去检查，其他的等医生说了再决定。" },
      { sender: "我", body: "好！我把它放进外出笼了，现在就去医院。" },
      { sender: "西蓝花", body: "路上小心！到了记得跟我说，还有不要忘记问医生有没有晶片哦。" },
      { sender: "我", body: "到了，医生先帮它做基本检查，等一下看看能不能找到主人资料。" },
    ]},
    { id: "go-now", label: "好啦好啦，我带它走，先去医院再说", nextStage: 4, lines: [
      { sender: "我", body: "好啦好啦，我带它走，先去医院再说。你放心，我不会让它直接接触 Vava。" },
      { sender: "西蓝花", body: "我不是不相信你啦，我是怕你一心软就什么都忘了！" },
      { sender: "我", body: "知道啦，我会先让医生检查，回家也会隔离。" },
      { sender: "西蓝花", body: "那就好……快去吧，我等你消息。" },
      { sender: "我", body: "医生正在帮它检查，等一下要看看有没有晶片或主人资料。" },
    ]},
  ],
  10: [
    { id: "talk-about-day", label: "先聊点别的吧，你今天不是说有件事要跟我讲？", nextStage: 11, lines: [
      { sender: "我", body: "我先不想小猫的事了……对了，你今天不是说有件事要跟我讲？" },
      { sender: "西蓝花", body: "哈哈哈哈你终於想到别的事了！我今天上班真的遇到一个超夸张的人。" },
      { sender: "我", body: "怎么了怎么了，快说！" },
      { sender: "西蓝花", body: "他把咖啡放在影印机旁边，结果整杯打翻，文件全部变咖啡味，笑死我了。" },
      { sender: "我", body: "救命哈哈哈哈哈，你们办公室每天都这么精彩吗？" },
      { sender: "西蓝花", body: "差不多啦！欸你晚餐想吃什么？不要又随便吃哦。" },
    ]},
    { id: "chat-food", label: "你先陪我聊聊天，我现在心里乱乱的", nextStage: 11, lines: [
      { sender: "我", body: "你先陪我聊聊天嘛，我现在心里乱乱的，想转移一下注意力。" },
      { sender: "西蓝花", body: "好啦好啦，我在！那你今天有没有好好吃饭？" },
      { sender: "我", body: "还没欸，本来想说回家再吃。" },
      { sender: "西蓝花", body: "不行！先去买点东西吃，不要饿着肚子乱想。" },
      { sender: "我", body: "知道啦……你最近有没有看到什么好看的剧？" },
      { sender: "西蓝花", body: "有啊，我晚点传給你！你先去吃点东西。" },
    ]},
  ],
  11: [
    { id: "go-back", label: "不行，我还是放心不下，我想回去看看它", nextStage: 5, lines: [
      { sender: "我", body: "不行……我还是放心不下。它那么小一只，我真的没办法当作没看见，我回去看看。" },
      { sender: "西蓝花", body: "我就知道你一定会回去啦！慢慢走，注意安全。" },
      { sender: "我", body: "我回到刚才那个地方了……天啊，它竟然还在！" },
      { sender: "西蓝花", body: "真的假的？？它还在那里等你哦？" },
      { sender: "我", body: "它跑过来蹭我了！我抱起来才发现脖子上挂着一个牌子，上面写着主人：温尚翊。" },
      { sender: "西蓝花", body: "……等一下。你说什么？？？温尚翊？？？" },
    ]},
    { id: "return-anyway", label: "我想了一路，还是决定回头找它", nextStage: 5, lines: [
      { sender: "我", body: "我本来想回家了，可是越走越不对勁……我还是回头找它好了。" },
      { sender: "西蓝花", body: "去吧去吧，但不要跑，注意车！" },
      { sender: "我", body: "我找到它了！！它竟然还在原地！" },
      { sender: "西蓝花", body: "天啊，还好它没有跑掉……" },
      { sender: "我", body: "它脖子上有个小挂牌，我刚刚看清楚了，上面写着主人：温尚翊。" },
      { sender: "西蓝花", body: "蛤？？？？你再说一次？？温尚翊？？？" },
    ]},
  ],
  4: [
    { id: "tag-check", label: "我把牌子拍給你看了，真的是温尚翊", nextStage: 5, lines: [
      { sender: "我", body: "医生刚刚看了它脖子上的挂牌，上面清清楚楚写着主人：温尚翊。" },
      { sender: "西蓝花", body: "等一下……你说的是温尚翊？？？不会吧？？？" },
      { sender: "我", body: "真的！医生说牌子上留了联络电话，我现在脑袋一片空白。" },
      { sender: "西蓝花", body: "先把照片传給我！我确认一下……天啊，真的是这三个字欸！" },
    ]},
  ],
  5: [
    { id: "same-name", label: "我也觉得可能是重名，但还是好不真实……", nextStage: 6, lines: [
      { sender: "我", body: "可是这个名字也太巧了吧，我现在还是觉得很不真实。" },
      { sender: "西蓝花", body: "名字一样不代表就是本人啦，先不要自己吓自己。" },
      { sender: "我", body: "我知道啊，但如果真的是他呢？" },
      { sender: "西蓝花", body: "我也觉得很离谱……算了不管了，可能是重名吧！主人肯定等得很着急，先打电话过去问问啦。" },
    ]},
    { id: "maybe-him", label: "你说会不会真的是他啊……", nextStage: 6, lines: [
      { sender: "我", body: "你说……会不会真的是他啊？" },
      { sender: "西蓝花", body: "温尚翊？？啊？？啊？？？我真的要疯了！" },
      { sender: "我", body: "五月天那个温尚翊欸！！！" },
      { sender: "西蓝花", body: "我知道我知道！可是也可能只是同名啦……先打电话确认，拜托你冷静一点哈哈哈。" },
    ]},
  ],
  6: [
    { id: "call-owner", label: "行……我现在打电话过去问问。", nextStage: 7, lines: [
      { sender: "我", body: "行……我现在打过去问问。" },
      { sender: "我", body: "我打了……一直响，没有人接。" },
      { sender: "西蓝花", body: "电话打不通啊？要不试试看能不能透过微信号加好友？" },
      { sender: "我", body: "好像可以试试看，我看看牌子上有没有其他资料。" },
    ]},
  ],
  7: [
    { id: "try-wechat", label: "好，我试试看用这个微信号加好友。", nextStage: 8, lines: [
      { sender: "我", body: "好，我试试看用这个微信号加好友。" },
      { sender: "西蓝花", body: "嗯嗯！先确认是不是本人，别一上来就把自己吓到。" },
      { sender: "我", body: "我去微信看看……" },
    ]},
  ],
};
export function WeChatSkin(p: SkinProps) {
  const [tab, setTab] = useState("微信");
  const [query, setQuery] = useState("");
  const [moments, setMoments] = useState(false);

  const [catRescueRaw, setCatRescueRaw] = useSkinState<string>(p, "catRescueState", "");
  const catRescue = parseCatRescueState(catRescueRaw);
  const allItems = [...p.items, ...catRescue.messages];
  const displayName = (name: string) => name === "温尚翊" ? "大G" : name;
  const isMonsterName = (name: string) => name === "大G" || name === "温尚翊";
  const catRescueActive = p.thread === "西蓝花" && allItems.some((item) => item.meta.storyId === "cat-rescue");
  const catAvatar = allItems.find((item) => item.sender === "西蓝花" && item.avatar)?.avatar || GLOOMY_AVATAR;
  const catChoices = CAT_RESCUE_CHOICES[catRescue.stage] || [];
  const appendCatLines = (lines: CatLine[], nextStage = catRescue.stage, branch = catRescue.branch) => {
    const [hour, minute] = (p.virtualTime || "14:24").split(":").map(Number);
    const start = (Number.isFinite(hour) ? hour : 14) * 60 + (Number.isFinite(minute) ? minute : 24);
    const created = lines.map((line, index) => {
      const total = start + Math.floor(index / 2);
      const time = "2026-11-02 " + String(Math.floor(total / 60) % 24).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
      return makeItem({
        id: "cat-rescue-" + Date.now() + "-" + index + "-" + Math.random().toString(36).slice(2, 7),
        title: "西蓝花",
        sender: line.sender,
        body: line.body,
        time,
        outgoing: line.sender === "我",
        avatar: line.sender === "西蓝花" ? catAvatar : "",
        meta: { storyId: "cat-rescue" },
      });
    });
    setCatRescueRaw(JSON.stringify({
      version: 2,
      stage: nextStage,
      branch,
      messages: [...catRescue.messages, ...created],
    }));
  };
  const chooseCatRescue = (choice: CatChoice) => {
    appendCatLines(choice.lines, choice.nextStage, choice.branch || catRescue.branch);
    if (choice.nextStage === 8) { setIdCopied(false); setAddIdModal(true); }
  };
  const appendNewFriendConversation = () => {
    const [hour, minute] = (p.virtualTime || "14:24").split(":").map(Number);
    const total = (Number.isFinite(hour) ? hour : 14) * 60 + (Number.isFinite(minute) ? minute : 24);
    const time = "2026-11-02 " + String(Math.floor(total / 60) % 24).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
    const created = [
      makeItem({ id: "monster-added-system-" + Date.now(), title: "大G", sender: "我", body: "你已添加了大G，现在可以开始聊天了。", time, outgoing: true, kind: "event", meta: { storyId: "cat-rescue-add-friend" } }),
      makeItem({ id: "monster-first-message-" + Date.now(), title: "大G", sender: "大G", body: "妳是？", time, outgoing: false, meta: { storyId: "cat-rescue-add-friend", wechatId: "mo00oster111" } }),
    ];
    setCatRescueRaw(JSON.stringify({ ...catRescue, version: 2, stage: 9, messages: [...catRescue.messages, ...created] }));
    setAddedFriends((current) => current.includes("大G") ? current : [...current, "大G"]);
  };


  const initialOwnerName = p.owner && p.owner !== "机主" ? p.owner : "我的微信";
  const [profileName, setProfileName] = useSkinState<string>(p, "wxProfileName", initialOwnerName);
  const [profileAvatar, setProfileAvatar] = useSkinState<string>(p, "wxProfileAvatar", "");
  const [profileStatus, setProfileStatus] = useSkinState<string>(p, "wxProfileStatus", "");
  const [statusEditorOpen, setStatusEditorOpen] = useState(false);
  const [customStatusOpen, setCustomStatusOpen] = useState(false);
  const [customStatusDraft, setCustomStatusDraft] = useState("");
  const saveProfileStatus = (value: string) => {
    const nextStatus = value.trim();
    if (!nextStatus) return;
    setProfileStatus(nextStatus);
    setStatusEditorOpen(false);
    setCustomStatusOpen(false);
    setCustomStatusDraft("");
  };
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
  const [addIdModal, setAddIdModal] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [friendRequestModal, setFriendRequestModal] = useState<"" | "confirm" | "sent">("");
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
    new Set(allItems.filter((i) => !["朋友圈", "我"].includes(i.folder)).map((i) => i.title)),
  ).sort((a, b) => {
    const aLast = allItems.filter((i) => i.title === a).at(-1)?.time ?? "";
    const bLast = allItems.filter((i) => i.title === b).at(-1)?.time ?? "";
    return bLast.localeCompare(aLast);
  });
  const contacts = Array.from(new Set([
    ...allItems.map((i) => displayName(i.sender)).filter((s) => s && s !== "我" && s !== "机主"),
    ...addedFriends.map(displayName),
  ])).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const friendDirectory = Array.from(new Set(["西蓝花", "爸爸", "妈妈", ...allItems.flatMap((i) => [i.title, i.sender]).filter((s) => s && s !== "我" && s !== "机主")]));
  const friendMatches = addQuery.trim()
    ? addQuery.trim().toLowerCase() === "mo00oster111" && catRescue.stage >= 8
      ? ["大G"]
      : friendDirectory.filter((name) => {
          const related = allItems.filter((i) => i.title === name || i.sender === name);
          const keys = [name, ...related.flatMap((i) => [i.meta.wechatId, i.meta.account, i.meta.phone, i.meta.handle])].filter(Boolean).join(" ").toLowerCase();
          return keys.includes(addQuery.trim().toLowerCase());
        })
    : [];
  const posts = allItems.filter((i) => i.folder === "朋友圈" || i.kind === "post");
  const filteredConversations = conversations.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()) ||
    displayName(name).toLowerCase().includes(query.toLowerCase()) ||
    allItems.some((i) => i.title === name && i.body.toLowerCase().includes(query.toLowerCase())),
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
    const canonicalName = isMonsterName(name) ? "大G" : name;
    const related = allItems.find((i) => displayName(i.title) === canonicalName || displayName(i.sender) === canonicalName);
    if (related) {
      p.onThread(related.title);
      p.onRead(related.title);
    } else setUtility(canonicalName);
  };
  return (
    <div className="wechat-ui independent-skin wx-reference-layout" data-tab={tab} data-thread={!!p.thread} data-moments={moments} data-utility={!!utility} data-status-editor={statusEditorOpen}>
      {addIdModal && (
        <div className="wx-friend-flow-backdrop">
          <section className="wx-friend-flow-sheet" role="dialog" aria-modal="true" aria-label="微信号">
            <button className="wx-friend-flow-close" onClick={() => setAddIdModal(false)}>×</button>
            <div className="wx-friend-flow-avatar"><Avatar name="大G" /></div>
            <strong>找到一個微信號</strong>
            <p>可以試著用這個微信號添加對方</p>
            <div className="wx-friend-id">mo00oster111</div>
            <button className="wx-friend-flow-primary" onClick={() => { void navigator.clipboard?.writeText("mo00oster111").catch(() => undefined); setIdCopied(true); }}>{idCopied ? "已复制" : "复制微信号"}</button>
            {idCopied && <button className="wx-friend-flow-secondary" onClick={() => setAddIdModal(false)}>返回微信</button>}
          </section>
        </div>
      )}
      {friendRequestModal && (
        <div className="wx-friend-flow-backdrop">
          <section className="wx-friend-flow-sheet" role="dialog" aria-modal="true" aria-label="好友申请">
            <div className="wx-friend-flow-avatar"><Avatar name="大G" /></div>
            {friendRequestModal === "confirm" ? (
              <>
                <strong>添加到通讯录</strong>
                <p>大G · 微信号 mo00oster111</p>
                <div className="wx-friend-id">你可以向对方发送好友申请</div>
                <button className="wx-friend-flow-primary" onClick={() => { appendNewFriendConversation(); setFriendRequestModal("sent"); }}>发送好友申请</button>
                <button className="wx-friend-flow-secondary" onClick={() => setFriendRequestModal("")}>取消</button>
              </>
            ) : (
              <>
                <strong>好友申请已发送</strong>
                <p>已向大G发送好友申请</p>
                <div className="wx-friend-id">好友添加成功 · 微信名：大G</div>
                <button className="wx-friend-flow-primary" onClick={() => { setFriendRequestModal(""); setUtility(""); setTab("微信"); p.onThread("大G"); }}>完成，查看消息</button>
              </>
            )}
          </section>
        </div>
      )}
      <div className="app-nav wx-nav">
        <button aria-label={statusEditorOpen ? "关闭状态编辑" : "返回"} onClick={() => {
          if (statusEditorOpen) { setStatusEditorOpen(false); setCustomStatusOpen(false); }
          else if (utility) setUtility("");
          else if (p.thread) p.onThread("");
          else if (moments) setMoments(false);
          else if (tab !== "微信") setTab("微信");
          else setUtility("收藏");
        }}>
          {statusEditorOpen ? <span className="wx-status-close">×</span> : utility || p.thread || moments || tab !== "微信" ? <ChevronLeft size={22} /> : <Star size={22} />}
        </button>
        <strong>{statusEditorOpen ? "设个状态" : utility || (p.thread ? displayName(p.thread) : moments ? "朋友圈" : tab)}</strong>
        <button aria-label={statusEditorOpen ? " " : p.thread ? "聊天详情" : "微信菜单"} onClick={() => statusEditorOpen ? undefined : p.thread ? setUtility("聊天信息") : setMenu((v) => !v)}>
          {statusEditorOpen ? null : p.thread ? <MoreHorizontal size={22} /> : <CirclePlus size={23} />}
        </button>
      </div>

      {menu && !p.thread && !moments && !utility && (
        <div className="wx-popup-menu" role="menu">
          {["发起群聊", "添加朋友", "扫一扫", "收付款"].map((label) => (
            <button role="menuitem" key={label} onClick={() => { setMenu(false); setUtility(label); }}>{label}</button>
          ))}
        </div>
      )}

      {statusEditorOpen ? (
        <div className="wx-status-editor">
          <div className="wx-status-subtitle">朋友 24 小时内可见</div>
          <button className="wx-status-custom-tile" onClick={() => { setCustomStatusDraft(profileStatus); setCustomStatusOpen(true); }}>
            <span className="wx-status-custom-plus">＋</span>
            <strong>{profileStatus || "填写状态"}</strong>
          </button>
          <section className="wx-status-category"><h3>心情想法</h3><div className="wx-status-grid">
            {[[ "☺","美滋滋"],["♧","裂开"],["♨","求锦鲤"],["☼","等天晴"],["☕","疲惫"],["☂","发呆"],["↗","冲"],["〰","emo"],["☁","胡思乱想"],["✦","元气满满"],["▣","bot"]].map(([icon,label]) => <button key={label} onClick={() => saveProfileStatus(label)}><span>{icon}</span><small>{label}</small></button>)}
          </div></section>
          <section className="wx-status-category"><h3>工作学习</h3><div className="wx-status-grid">
            {[[ "♟","搬砖"],["⌁","沉迷学习"],["♙","忙"],["♧","摸鱼"],["✈","出差"],["➶","飞奔回家"],["☾","勿扰模式"]].map(([icon,label]) => <button key={label} onClick={() => saveProfileStatus(label)}><span>{icon}</span><small>{label}</small></button>)}
          </div></section>
          <section className="wx-status-category"><h3>活动</h3><div className="wx-status-grid">
            {[[ "♬","浪"],["✌","打卡"],["↗","运动"],["☕","喝咖啡"],["▤","喝奶茶"],["♫","听音乐"],["⌂","在家"]].map(([icon,label]) => <button key={label} onClick={() => saveProfileStatus(label)}><span>{icon}</span><small>{label}</small></button>)}
          </div></section>
          {customStatusOpen && <div className="wx-status-custom-backdrop"><section className="wx-status-custom-sheet" role="dialog" aria-modal="true" aria-label="自定义状态">
            <header><button onClick={() => setCustomStatusOpen(false)}>取消</button><strong>填写状态</strong><button disabled={!customStatusDraft.trim()} onClick={() => saveProfileStatus(customStatusDraft)}>确认</button></header>
            <textarea autoFocus maxLength={30} value={customStatusDraft} onChange={(e) => setCustomStatusDraft(e.target.value)} placeholder="此刻的心情或正在做的事..." /><small>{customStatusDraft.length}/30</small>
          </section></div>}
        </div>
      ) : utility === "添加朋友" ? (
        <div className="wx-add-friend-page">
          <label className="wx-add-search">
            <Search size={19} />
            <input aria-label="搜索微信号或手机号" placeholder="账号/手机号" value={addQuery} onChange={(e) => setAddQuery(e.target.value)} />
            {catRescue.stage >= 8 && idCopied && <button type="button" className="wx-add-paste" onClick={() => setAddQuery("mo00oster111")}>粘贴</button>}
            {addQuery && <button aria-label="清空搜索" onClick={() => setAddQuery("")}>×</button>}
          </label>
          {addQuery.trim() ? (
            <div className="wx-add-results">
              {friendMatches.length ? friendMatches.map((name) => {
                const isMonster = isMonsterName(name);
                const visibleName = displayName(name);
                const related = allItems.find((i) => displayName(i.title) === visibleName || displayName(i.sender) === visibleName);
                const alreadyAdded = addedFriends.includes(isMonster ? "大G" : name);
                return (
                  <div className="wx-add-result" key={visibleName}>
                    <Avatar name={visibleName} src={related?.avatar} />
                    <span><strong>{visibleName}</strong><small>微信号：{isMonster ? "mo00oster111" : related?.meta.wechatId || related?.meta.account || name}</small></span>
                    <button disabled={alreadyAdded} onClick={() => isMonster ? setFriendRequestModal("confirm") : setAddedFriends((v) => v.includes(name) ? v : [...v, name])}>{alreadyAdded ? "已添加" : isMonster ? "添加到通讯录" : "添加"}</button>
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
              {Array.from(new Set(allItems.filter((i) => i.title === p.thread).map((i) => i.sender))).map((name) => (
                <div key={name}><Avatar name={name} src={allItems.find((i) => i.sender === name)?.avatar} /><small>{name}</small></div>
              ))}
            </div>
          )}
          {allItems.filter((i) => i.folder === utility).map((i) => (
            <button key={i.id} className="wx-discovery" onClick={() => p.onItem(i)}>{i.title}<span>›</span></button>
          ))}
          {!allItems.some((i) => i.folder === utility) && utility !== "聊天信息" && (
            <div className="wx-empty-state"><span>{utility}</span><p>这里还没有内容</p></div>
          )}
        </div>
      ) : p.thread ? (
        <>
          {catRescueActive ? (
            <div className="cat-rescue-thread">
              <MessageList items={allItems.filter((i) => i.title === p.thread)} creator={p.creator} onItem={p.onItem} onRead={p.onRead} wechat />
              {catRescue.stage === 8 && !idCopied && <div className="cat-rescue-choices"><button onClick={() => setAddIdModal(true)}>查看对方的微信号</button></div>}
              {catChoices.length > 0 && (
                <div className="cat-rescue-choices" aria-label="剧情回复选项">
                  {catChoices.map((choice) => (
                    <button key={choice.id} onClick={() => chooseCatRescue(choice)}>{choice.label}</button>
                  ))}
                  <div className="cat-rescue-option-hint">选择一条回复发送</div>
                </div>
              )}
            </div>
          ) : (
            <>
              <MessageList items={allItems.filter((i) => i.title === p.thread)} creator={p.creator} onItem={p.onItem} onRead={p.onRead} wechat />
              <Compose creator={p.creator} onAdd={p.onAdd} />
            </>
          )}
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
            <Avatar name={ownerName} src={profileAvatar} />
            <button className="wx-moment-publish" onClick={() => setMomentComposer(true)}><Plus size={16} /> 发布朋友圈</button>
          </div>
          {myMomentPosts.map((post) => (
            <div key={post.id} className="wx-moment-post wx-moment-user-post">
              <Avatar name={ownerName} src={profileAvatar} />
              <div><strong>{ownerName}</strong><p>{post.body}</p><small>{post.time}</small></div>
            </div>
          ))}
          {posts.map((i) => (
            <button key={i.id} className="wx-moment-post" onClick={() => p.onItem(i)}>
              <Avatar name={i.sender} src={i.sender === ownerName || i.sender === "我" || i.sender === "机主" ? profileAvatar : i.avatar} />
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
                  const list = allItems.filter((i) => i.title === name);
                  const last = list.at(-1)!;
                  const unread = !readThreads.includes(name) && list.some((i) => !i.read);
                  return (
                    <button className="wx-chat-row" key={name} onClick={() => {
                      setReadThreads((v) => v.includes(name) ? v : [...v, name]);
                      p.onThread(name);
                      p.onRead(name);
                    }}>
                      <span className="wx-chat-avatar">
                        <Avatar name={name} src={last.avatar || (name === "西蓝花" ? GLOOMY_AVATAR : "")} />
                        {unread && <b className="wx-unread">{list.filter((i) => !i.read).length || ""}</b>}
                      </span>
                      <div className="wx-chat-copy"><strong>{displayName(name)}</strong><p>{last.body}</p></div>
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
                  const avatarItem = allItems.find((i) => displayName(i.sender) === name || displayName(i.title) === name);
                  return <button className="wx-contact-row" key={name} onClick={() => openContact(name)}>
                    <Avatar name={name} src={avatarItem?.avatar || (name === "西蓝花" ? GLOOMY_AVATAR : "")} /><span>{name}</span>
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
                  <small>微信号：IloveMayday</small>
                  <div className="wx-me-profile-actions">
                    <button className="wx-profile-status" onClick={() => setStatusEditorOpen(true)}>{profileStatus ? "● " + profileStatus : "＋ 状态"}</button>
                  </div>
                </div>
                <div className="wx-me-profile-trailing">
                  <button aria-label="我的二维码" onClick={() => openUtility("我的二维码")}><ScanLine size={25} /></button>
                  <ChevronRight size={23} />
                </div>
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
