import { useEffect, useState } from "react";
import {
  Heart,
  Users,
  Grid2X2,
  Flame,
  Bed,
  Footprints,
  ChevronRight,
  ChevronLeft,
  User,
  Plus,
  MoonStar,
  Sunrise,
  CloudSun,
  Droplet,
  Wind,
  Map,
  List,
  Cloud,
  Activity,
  Search,
} from "lucide-react";
import { useSkinState } from "../skinState";
import type { Item } from "../schema";
import { meta, type Props } from "./shared";
import { openStreetMapEmbed } from "../deviceLocation";
import "../ios/native-apps.css";
const healthTypes = [
  { id: "cycle", title: "经期追踪", icon: Activity, color: "#7361ff" },
  { id: "activity", title: "健身记录", icon: Flame, color: "#ff5900" },
  { id: "sleep", title: "睡眠评分", icon: Bed, color: "#7361ff" },
  { id: "steps", title: "步数", icon: Footprints, color: "#ff5900" },
];
function seriesFor(item: Item | undefined) {
  try {
    const values = JSON.parse(meta(item, "series", "[]"));
    return Array.isArray(values)
      ? values
          .filter((v) => typeof v === "number" && Number.isFinite(v) && v >= 0)
          .slice(0, 30)
      : [];
  } catch {
    return [];
  }
}
function recordFor(items: Item[], key: string) {
  const map: Record<string, string[]> = {
    cycle: ["经期", "月经"],
    activity: ["活动", "健身"],
    sleep: ["睡眠"],
    steps: ["步数"],
  };
  return items.find((i) =>
    map[key].some((s) => meta(i, "metric", i.title).includes(s)),
  );
}
export function HealthSkin(p: Props) {
  const [tab, setTab] = useSkinState<string>(p, "tab", "摘要"),
    [pins, setPins] = useSkinState<string[]>(
      p,
      "pins",
      p.items.some((i) => recordFor([i], "cycle"))
        ? ["cycle", "activity", "sleep", "steps"]
        : ["activity", "sleep", "steps"],
    );
  const [editing, setEditing] = useState(false),
    [detail, setDetail] = useState(""),
    [profile, setProfile] = useState(false);
  const current = recordFor(p.items, detail);
  const open = (key: string) => {
    const i = recordFor(p.items, key);
    if (i && p.creator) {
      p.onItem(i);
      return;
    }
    if (i?.password) {
      p.onItem(i);
      return;
    }
    if (i) p.onRead(i.id);
    setDetail(key);
  };
  return (
    <div className="catalog-skin native-health calibrated-health">
      <header className="health-native-nav">
        {detail || profile ? (
          <button
            aria-label="返回健康摘要"
            onClick={() => {
              setDetail("");
              setProfile(false);
            }}
          >
            <ChevronLeft />
          </button>
        ) : (
          <span />
        )}
        <strong>
          {detail
            ? healthTypes.find((x) => x.id === detail)?.title
            : profile
              ? "健康详细资料"
              : tab}
        </strong>
        <button
          aria-label="健康资料"
          onClick={() => (p.creator ? p.onAdd() : setProfile(true))}
        >
          <User size={23} />
        </button>
      </header>
      <div className="health-native-scroll">
        {profile ? (
          <>
            <h1>健康详细资料</h1>
            <section className="health-profile-empty">
              <User size={45} />
              <h2>{p.owner || "机主"}</h2>
              <p>尚未设置更多资料</p>
            </section>
          </>
        ) : detail ? (
          <>
            <div className="health-periods">
              {["日", "周", "月", "6个月", "年"].map((x) => (
                <button
                  key={x}
                  onClick={(e) => {
                    e.currentTarget.parentElement
                      ?.querySelectorAll("button")
                      .forEach((b) => b.removeAttribute("data-selected"));
                    e.currentTarget.dataset.selected = "true";
                  }}
                >
                  {x}
                </button>
              ))}
            </div>
            <p className="health-detail-value">
              {current ? meta(current, "value", "—") : "无数据"}{" "}
              <small>{current ? meta(current, "unit") : ""}</small>
            </p>
            <div className="health-detail-chart" aria-label="健康记录图表">
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    height:
                      seriesFor(current)[i] !== undefined
                        ? `${Math.max(2, (seriesFor(current)[i] / Math.max(...seriesFor(current), 1)) * 100)}%`
                        : "3px",
                  }}
                />
              ))}
            </div>
            <section className="health-detail-description">
              <h2>记录</h2>
              {current ? (
                <>
                  <p>{current.body}</p>
                  <small>{current.time}</small>
                </>
              ) : (
                <p>暂无数据</p>
              )}
            </section>
          </>
        ) : tab === "摘要" ? (
          <>
            <div className="health-section-title">
              <h2>置顶</h2>
              <button onClick={() => setEditing(!editing)}>
                {editing ? "完成" : "编辑"}
              </button>
            </div>
            {editing && (
              <div className="health-pin-editor">
                {healthTypes.map((t) => (
                  <label key={t.id}>
                    <input
                      type="checkbox"
                      checked={pins.includes(t.id)}
                      onChange={() =>
                        setPins(
                          pins.includes(t.id)
                            ? pins.filter((x) => x !== t.id)
                            : [...pins, t.id],
                        )
                      }
                    />
                    {t.title}
                  </label>
                ))}
              </div>
            )}
            <div className="health-cards">
              {pins.map((id) => {
                const t = healthTypes.find((t) => t.id === id);
                if (!t) return null;
                const i = recordFor(p.items, id);
                const Icon = t.icon;
                return (
                  <button
                    key={id}
                    className={"health-native-card health-card-" + id}
                    onClick={() => open(id)}
                  >
                    <header style={{ color: t.color }}>
                      <Icon size={19} />
                      <strong>{t.title}</strong>
                      <time>{i?.time.slice(5, 10) || ""}</time>
                      <ChevronRight size={18} />
                    </header>
                    {id === "activity" ? (
                      <div className="health-activity-values">
                        {[
                          ["活动", "active", "千卡"],
                          ["锻炼", "exercise", "分钟"],
                          ["站立", "stand", "小时"],
                        ].map(([name, key, unit], n) => (
                          <div
                            key={key}
                            style={{
                              color: ["#ff2d55", "#54c900", "#00b2d9"][n],
                            }}
                          >
                            <small>{name}</small>
                            <p>
                              <b>{i ? meta(i, key, "—") : "—"}</b>
                              <span>{unit}</span>
                            </p>
                          </div>
                        ))}
                        <div className="activity-rings">
                          <i />
                          <i />
                          <i />
                        </div>
                      </div>
                    ) : (
                      <div className="health-card-bottom">
                        <div>
                          <b>
                            {i
                              ? meta(i, "value", i.body || "无数据")
                              : "无数据"}
                          </b>
                          <span>{i ? meta(i, "unit") : ""}</span>
                        </div>
                        {id === "steps" && (
                          <div className="health-spark" aria-hidden="true">
                            {Array.from({ length: 7 }, (_, n) => (
                              <i
                                key={n}
                                style={{
                                  height:
                                    seriesFor(i)[n] !== undefined
                                      ? `${Math.max(3, (seriesFor(i)[n] / Math.max(...seriesFor(i), 1)) * 45)}px`
                                      : "8px",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <button className="health-all-row" onClick={() => setTab("浏览")}>
              <Heart color="#ff2d55" />
              显示所有健康数据
              <ChevronRight />
            </button>
            <h2 className="health-trends-title">趋势</h2>
            <div className="health-trends-empty">
              {p.items.length ? "查看健康数据中的记录" : "暂无趋势"}
            </div>
          </>
        ) : tab === "共享" ? (
          <section className="health-sharing">
            <Users size={54} />
            <h2>共享健康数据</h2>
            <p>尚未共享数据</p>
            {p.items
              .filter((i) => i.folder === "共享")
              .map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  {i.title}
                </button>
              ))}
          </section>
        ) : (
          <>
            <h1>浏览</h1>
            {healthTypes.map((t) => (
              <button
                key={t.id}
                className="health-browse-row"
                onClick={() => open(t.id)}
              >
                <t.icon size={22} color={t.color} />
                {t.title}
                <ChevronRight />
              </button>
            ))}
            {p.items
              .filter((i) => !healthTypes.some((t) => recordFor([i], t.id)))
              .map((i) => (
                <button
                  className="health-browse-row"
                  key={i.id}
                  onClick={() => p.onItem(i)}
                >
                  {i.title}
                  <ChevronRight />
                </button>
              ))}
          </>
        )}
      </div>
      {!detail && !profile && (
        <nav className="health-floating-tabs">
          {[
            [Heart, "摘要"],
            [Users, "共享"],
            [Grid2X2, "浏览"],
          ].map(([Icon, label]) => {
            const Glyph = Icon as typeof Heart;
            return (
              <button
                key={String(label)}
                className={tab === label ? "selected" : ""}
                onClick={() => setTab(String(label))}
              >
                <Glyph size={25} />
                <span>{String(label)}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
function listMeta(
  item: Item | undefined,
  key: string,
): {
  time?: string;
  temperature?: string | number;
  low?: string | number;
  high?: string | number;
  label?: string;
  rain?: string | number;
  wind?: string | number;
}[] {
  try {
    const v = JSON.parse(meta(item, key, "[]"));
    return Array.isArray(v)
      ? v
          .filter(
            (x) =>
              x &&
              typeof x === "object" &&
              Object.values(x).every(
                (v) => typeof v === "string" || typeof v === "number",
              ),
          )
          .slice(0, 12)
      : [];
  } catch {
    return [];
  }
}
type LiveWeather = {
  city: string;
  temperature: number;
  high: number;
  low: number;
  condition: string;
  humidity: number;
  wind: number;
  sunrise: string;
  hourly: { time: string; temperature: number; rain: number; wind: number }[];
  daily: { label: string; low: number; high: number }[];
};
function weatherDescription(code: number) {
  if (code === 0) return "晴朗";
  if ([1, 2].includes(code)) return "大致晴朗";
  if (code === 3) return "阴天";
  if ([45, 48].includes(code)) return "有雾";
  if ([51, 53, 55, 56, 57].includes(code)) return "毛毛雨";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "下雨";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "下雪";
  if ([95, 96, 99].includes(code)) return "雷暴";
  return "天气状况";
}
function weatherClock(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString(undefined, { hour: "numeric", hour12: true });
}
export function WeatherSkin(p: Props) {
  const [index, setIndex] = useSkinState<number>(p, "city", 0),
    [mode, setMode] = useState("temperature"),
    [sheet, setSheet] = useState(""),
    [query, setQuery] = useState("");
  const taipei = { latitude: 25.0330, longitude: 121.5654 };
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null);
  const [weatherError, setWeatherError] = useState("");
  const item = p.items[index] || p.items[0],
    hourly = listMeta(item, "hourly"),
    daily = listMeta(item, "daily");
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setWeatherError("");
      try {
        const params = new URLSearchParams({
          latitude: String(taipei.latitude),
          longitude: String(taipei.longitude),
          current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
          hourly: "temperature_2m,precipitation_probability,wind_speed_10m",
          daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise",
          timezone: "Asia/Taipei",
          forecast_days: "5",
          forecast_hours: "18",
        });
        const forecastResponse = await fetch("https://api.open-meteo.com/v1/forecast?" + params.toString());
        if (!forecastResponse.ok) throw new Error("天气服务暂时不可用");
        const data = await forecastResponse.json();
        const times: string[] = data.hourly?.time || [];
        const currentLocalTime = String(data.current?.time || "");
        let start = times.findIndex((time) => time >= currentLocalTime);
        if (start < 0) start = 0;
        const hourlyLive = times.slice(start, start + 6).map((time, offset) => ({
          time: offset === 0 ? "现在" : weatherClock(time),
          temperature: Math.round(data.hourly.temperature_2m[start + offset]),
          rain: Math.round(data.hourly.precipitation_probability?.[start + offset] ?? 0),
          wind: Math.round(data.hourly.wind_speed_10m?.[start + offset] ?? 0),
        }));
        const dailyLive = (data.daily?.time || []).slice(0, 5).map((date: string, n: number) => ({
          label: n === 0 ? "今天" : new Date(date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" }),
          low: Math.round(data.daily.temperature_2m_min[n]),
          high: Math.round(data.daily.temperature_2m_max[n]),
        }));
        const city = "台北市";
        if (!cancelled) setLiveWeather({
          city,
          temperature: Math.round(data.current.temperature_2m),
          high: Math.round(data.daily.temperature_2m_max[0]),
          low: Math.round(data.daily.temperature_2m_min[0]),
          condition: weatherDescription(data.current.weather_code),
          humidity: Math.round(data.current.relative_humidity_2m),
          wind: Math.round(data.current.wind_speed_10m),
          sunrise: data.daily.sunrise?.[0] ? weatherClock(data.daily.sunrise[0]) : "—",
          hourly: hourlyLive,
          daily: dailyLive,
        });
      } catch (reason) {
        if (!cancelled) setWeatherError(reason instanceof Error ? reason.message : "天气数据读取失败");
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);
  const currentCity = "台北市";
  const currentTemperature = liveWeather?.temperature ?? meta(item, "temperature", "—");
  const currentHigh = liveWeather?.high ?? meta(item, "high", "—");
  const currentLow = liveWeather?.low ?? meta(item, "low", "—");
  const currentCondition = liveWeather?.condition ?? meta(item, "condition", "正在获取天气");
  const currentHourly = liveWeather?.hourly || hourly;
  const currentDaily = liveWeather?.daily || daily;
  const read = () => {
    if (item) {
      if (p.creator || item.password) p.onItem(item);
      else p.onRead(item.id);
    }
  };
  return (
    <div
      className="catalog-skin native-weather calibrated-weather"
      data-empty={!item}
    >
      <div className="weather-stars" aria-hidden="true" />
      <div className="weather-native-scroll">
        <section className="weather-native-current">
          <small>我的位置</small>
          <h1>{currentCity}</h1>
          <output>{currentTemperature}°</output>
          <div className="weather-high-low">
            <span>最高 {currentHigh}°</span>
            <span>最低 {currentLow}°</span>
          </div>
          <p>{currentCondition}</p>
          <MoonStar className="weather-moon-art" size={55} />
        </section>
        <button
          className="weather-native-card weather-air-quality"
          onClick={() => {
            read();
            setSheet("空气质量");
          }}
        >
          <strong>实时体感与空气</strong>
          <div className="weather-aqi-scale"><i style={{ left: "50%" }} /></div>
          <p>{liveWeather ? `湿度 ${liveWeather.humidity}% · 风速 ${liveWeather.wind} km/h` : weatherError || "正在获取台北天气…"}</p>
        </button>
        <section className="weather-native-card weather-hourly">
          <header>
            <div>
              <strong>天气状况</strong>
              <small>
                {mode === "temperature"
                  ? "气温 (°C)"
                  : mode === "rain"
                    ? "降水概率"
                    : "风速"}
              </small>
            </div>
            <div className="weather-mode-switch">
              {[
                [Cloud, "temperature"],
                [Droplet, "rain"],
                [Wind, "wind"],
              ].map(([Icon, key]) => {
                const Glyph = Icon as typeof Cloud;
                return (
                  <button
                    aria-label={String(key)}
                    aria-pressed={mode === key}
                    key={String(key)}
                    onClick={() => setMode(String(key))}
                  >
                    <Glyph size={18} />
                  </button>
                );
              })}
            </div>
          </header>
          <div className="weather-hour-grid">
            {Array.from({ length: 6 }, (_, n) => (
              <button
                key={n}
                onClick={() => {
                  read();
                  setSheet("逐小时天气");
                }}
              >
                <strong>
                  {currentHourly[n]?.time ||
                    ["现在", "—时", "—时", "—时", "—时", "—时"][n]}
                </strong>
                {n === 5 ? (
                  <Sunrise size={28} color="#ffd60a" />
                ) : (
                  <MoonStar size={28} />
                )}
                <span>
                  {n === 5
                    ? (liveWeather?.sunrise || meta(item, "sunrise", "—"))
                    : mode === "temperature"
                      ? (currentHourly[n]?.temperature ?? "—") + "°"
                      : mode === "rain"
                        ? (currentHourly[n]?.rain ?? meta(item, "rain", "—")) + "%"
                        : (currentHourly[n]?.wind ?? meta(item, "wind", "—")) + " km/h"}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="weather-native-card weather-days">
          {(currentDaily.length
            ? currentDaily
            : [
                {
                  label: "今天",
                  low: currentLow,
                  high: currentHigh,
                },
              ]
          ).map((d, n) => (
            <button
              key={n}
              onClick={() => {
                read();
                setSheet("每日天气");
              }}
            >
              <strong>{d.label || "—"}</strong>
              <CloudSun size={23} />
              <span>{d.low || "—"}°</span>
              <i />
              <b>{d.high || "—"}°</b>
            </button>
          ))}
        </section>
      </div>
      <nav className="weather-native-toolbar">
        <button aria-label="天气地图" onClick={() => setSheet("天气地图")}>
          <Map size={27} />
        </button>
        <div className="weather-city-dots">
          {p.items.length ? (
            p.items.map((i, n) => (
              <button
                aria-label={"切换城市" + i.title}
                aria-current={n === index ? "true" : undefined}
                key={i.id}
                onClick={() => {
                  setIndex(n);
                  p.onRead(i.id);
                }}
              />
            ))
          ) : (
            <span />
          )}
        </div>
        <button aria-label="城市列表" onClick={() => setSheet("城市列表")}>
          <List size={29} />
        </button>
      </nav>
      {sheet && (
        <div className="weather-native-sheet">
          <header>
            <button aria-label="返回天气" onClick={() => setSheet("")}>
              <ChevronLeft />
              天气
            </button>
            <strong>{sheet}</strong>
          </header>
          {sheet === "城市列表" ? (
            <>
              <label className="weather-city-search">
                <Search size={18} />
                <input
                  placeholder="搜索城市"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              {p.items
                .filter((i) => i.title.includes(query))
                .map((i) => (
                  <button
                    className="weather-city-row"
                    key={i.id}
                    onClick={() => {
                      setIndex(p.items.indexOf(i));
                      setSheet("");
                      p.onRead(i.id);
                    }}
                  >
                    <strong>{i.title}</strong>
                    <span>{meta(i, "temperature", "—")}°</span>
                  </button>
                ))}
              {!p.items.length && <p>暂无城市</p>}
              {p.creator && (
                <button onClick={p.onAdd}>
                  <Plus />
                  添加城市
                </button>
              )}
            </>
          ) : sheet === "天气地图" ? (
            <div className="weather-live-map">
              <iframe title="台北市天气地图" src={openStreetMapEmbed(25.0330, 121.5654, 0.04)} loading="lazy" />
              <p>台北市 · 25.0330, 121.5654</p>
            </div>
          ) : (
            <div className="weather-section-detail">
              <h2>{item?.title || "暂无城市"}</h2>
              <p>
                {sheet === "空气质量"
                  ? meta(item, "aqi", "暂无空气质量数据")
                  : item?.body || "暂无天气记录"}
              </p>
              {item && <small>{item.time}</small>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
