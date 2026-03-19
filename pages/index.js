import { useState, useEffect, useRef } from "react";
import Head from "next/head";

// ── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "na",    icon: "✦", label: "나",      sub: "Vision & 방향" },
  { id: "week",  icon: "▣", label: "이번 주", sub: "대시보드 & 리뷰" },
  { id: "now",   icon: "◎", label: "지금",    sub: "Brain Dump" },
  { id: "today", icon: "◐", label: "오늘",    sub: "Morning / Evening" },
];

const VISION = {
  headline: "브랜드를 IP로 만들고, 시간을 내 편으로 쓰는 1인 기업가",
  title: "나는 Brand Builder이자, 브랜드를 Finance로 전환해\n사람들의 삶을 더 낫게 만드는 비즈니스를 설계하는 CEO다.",
  body: [
    "나는 감각적 브랜드를 만든다. 그러나 감각만으로 사업하지 않는다. Finance와 Marketing을 기반으로 브랜드를 IP와 장기 자산으로 전환하는 구조를 만든다.",
    "브랜드 운영을 통해 나만의 전략과 경영기법을 축적하고, 그 과정을 기록해 지식과 투자 기회로 확장한다.",
    "나는 하나님 앞에서 삶과 비즈니스의 기준을 세우며 성과보다 방향을 먼저 선택한다. 브랜드는 내 삶을 갉아먹는 성공이 아니라 선택권을 늘리는 구조여야 한다.",
    "나는 배우고, 이동하고, 세계를 읽으며 오래 살아남는 방식을 택한다.",
  ],
  pillars: ["Brand → IP", "Finance 구조", "기록 → 지식", "선택권 확장", "오래 살아남기"],
};

const PROJECT_TAGS = ["Chaeum", "KRKK", "12주년", "개인", "다시노래"];
const TAG_COLORS   = { Chaeum: "#7a5c8a", KRKK: "#3a7a8a", "12주년": "#8a6a3a", 개인: "#6a7a5a", 다시노래: "#8a4a4a" };

const CAT_META = {
  "🔴 지금 당장":  { color: "#c8604a", bg: "#2a1a16" },
  "💭 걱정/감정":  { color: "#9a7caa", bg: "#1e1628" },
  "💡 아이디어":   { color: "#c8963a", bg: "#241e10" },
  "❓ 미결정":     { color: "#4a9aaa", bg: "#101e22" },
  "📌 나중에":     { color: "#7a9a6a", bg: "#161e12" },
  "🧠 인사이트":   { color: "#8a7a6a", bg: "#1a1810" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const todayKey = () => new Date().toISOString().split("T")[0];
const getHour  = () => new Date().getHours();

const callClaude = async (system, user) => {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user }),
  });
  const d = await res.json();
  if (d.error) throw new Error(d.error);
  return d.text || "";
};

const store = {
  get: async (k) => {
    try {
      if (typeof window === "undefined") return null;
      const v = localStorage.getItem("sb_" + k);
      return v ? { value: v } : null;
    } catch { return null; }
  },
  set: async (k, v) => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("sb_" + k, v);
    } catch {}
  },
  del: async (k) => {
    try {
      if (typeof window !== "undefined") localStorage.removeItem("sb_" + k);
    } catch {}
  },
};

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ text = "AI가 분석 중이에요..." }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, color:"#8a7a5a", fontSize:13, fontFamily:"monospace", padding:"8px 0" }}>
      <span style={{ animation:"spin 1.2s linear infinite", display:"inline-block" }}>◎</span>
      {text}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — 나 (Vision)
// ════════════════════════════════════════════════════════════════════════════
function TabNa() {
  const [img, setImg]         = useState(null);
  const [hover, setHover]     = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [result, setResult]   = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    store.get("vision-image").then(s => { if (s) setImg(s.value); });
  }, []);

  const uploadImg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      setImg(ev.target.result);
      await store.set("vision-image", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImg = async () => { setImg(null); await store.del("vision-image"); };

  const analyze = async () => {
    if (!checkIn.trim()) return;
    setLoading(true);
    try {
      const ai = await callClaude(
        `당신은 Hanna의 Second Brain AI입니다.
비전: "브랜드를 IP로 만들고 시간을 내 편으로 쓰는 1인 기업가. Brand Builder이자 Finance로 브랜드를 전환하는 CEO."
핵심 축: Brand→IP / Finance 구조 / 기록→지식 / 선택권 확장 / 오래 살아남기
INFP, Chaeum + KRKK 동시 운영.

오늘 행동/결정이 주어지면:
1. 어느 핵심 축과 연결되는지
2. 비전에서 벗어난 부분 (있다면)
3. 비전과 더 가까워지는 단 하나의 구체적 행동
→ 따뜻하지만 날카롭게, 3문단 이내.`,
        checkIn
      );
      setResult(ai);
    } catch (e) { setResult("오류: " + e.message); }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      <div style={{ borderBottom:"1px solid #2a2420", paddingBottom:20 }}>
        <div style={S.eyebrow}>MY VISION</div>
        <h1 style={S.headline}>{VISION.headline}</h1>
      </div>

      {/* 이미지 보드 */}
      <input ref={fileRef} type="file" accept="image/*" onChange={uploadImg} style={{ display:"none" }} />
      {img ? (
        <div style={{ position:"relative", borderRadius:12, overflow:"hidden" }}
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <img src={img} alt="Vision Board"
            style={{ width:"100%", maxHeight:260, objectFit:"cover", display:"block", border:"1px solid #2a2420", borderRadius:12 }} />
          {hover && (
            <div style={{ position:"absolute", inset:0, background:"rgba(8,6,4,.75)", display:"flex", gap:10, alignItems:"center", justifyContent:"center", borderRadius:12 }}>
              <button onClick={() => fileRef.current?.click()} style={S.btn}>↑ 변경</button>
              <button onClick={removeImg} style={{ ...S.btn, color:"#c87a6a", borderColor:"#5a2a2a" }}>× 삭제</button>
            </div>
          )}
        </div>
      ) : (
        <div onClick={() => fileRef.current?.click()} style={S.imgPlaceholder}
          onMouseEnter={e => e.currentTarget.style.borderColor="#5a4030"}
          onMouseLeave={e => e.currentTarget.style.borderColor="#2a2018"}>
          <span style={{ fontSize:28, color:"#2a2018" }}>◎</span>
          <span style={{ fontSize:12, color:"#5a4a3a", fontFamily:"sans-serif" }}>비전 이미지 업로드</span>
          <span style={{ fontSize:10, color:"#3a2a1a", fontFamily:"monospace" }}>클릭하여 파일 선택</span>
        </div>
      )}

      {/* 선언문 */}
      <div style={{ background:"linear-gradient(135deg,#1e1a12,#1a1610)", border:"1px solid #3a3020", borderRadius:12, padding:"24px 26px" }}>
        <p style={{ fontSize:14, color:"#d4b87a", fontWeight:600, lineHeight:1.75, margin:"0 0 18px", whiteSpace:"pre-line" }}>{VISION.title}</p>
        <div style={{ width:36, height:1, background:"#5a4a28", marginBottom:18 }} />
        {VISION.body.map((p, i) => (
          <p key={i} style={{ fontSize:12, color:"#a49070", lineHeight:1.9, margin:"0 0 12px", fontFamily:"sans-serif" }}>{p}</p>
        ))}
      </div>

      {/* 핵심 축 */}
      <div>
        <div style={S.label}>핵심 축</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
          {VISION.pillars.map((p, i) => (
            <span key={i} style={{ background:"#2a2018", border:"1px solid #4a3a20", borderRadius:20, padding:"5px 14px", fontSize:11, color:"#c8a87a", fontFamily:"monospace" }}>{p}</span>
          ))}
        </div>
      </div>

      {/* 비전 체크인 */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <div style={S.label}>오늘 비전 체크인</div>
        <textarea value={checkIn} onChange={e => setCheckIn(e.target.value)}
          placeholder="오늘 한 결정, 행동, 고민... 비전과 얼마나 연결됐나요?"
          style={{ ...S.textarea, minHeight:90 }} />
        <button onClick={analyze} disabled={loading || !checkIn.trim()} style={S.btn}>
          {loading ? "분석 중..." : "✦ 비전 정렬 체크"}
        </button>
        {loading && <Spinner text="비전과 연결하는 중..." />}
        {result && <div style={S.aiBox}><div style={S.aiLabel}>Vision Alignment</div><pre style={S.aiText}>{result}</pre></div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2 — 이번 주 (Dashboard + Weekly Review)
// ════════════════════════════════════════════════════════════════════════════
function TabWeek() {
  const [view, setView]         = useState("dash");
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [answers, setAnswers]   = useState({});
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const WEEKLY_Qs = [
    { id:"wins",       q:"이번 주 가장 큰 Win은?",         ph:"크고 작은 승리..." },
    { id:"gaps",       q:"계획 vs 실제, 가장 큰 갭은?",    ph:"솔직하게..." },
    { id:"pattern",    q:"반복되는 패턴이 보이나요?",       ph:"좋은 것 + 나쁜 것 모두..." },
    { id:"next_focus", q:"다음 주 핵심 포커스는?",         ph:"12주 목표와 연결해서..." },
    { id:"drop",       q:"다음 주에 버려야 할 것은?",      ph:"멈출 것, 줄일 것..." },
  ];

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const weekDates = getWeekDates();

      // dump history
      const dumps = [];
      const dh = await store.get("dump-history");
      if (dh) {
        const all = JSON.parse(dh.value);
        dumps.push(...all.filter(d => weekDates.some(wd => d.rawDate === wd || (d.date && d.date.includes(wd.replace(/-/g,"."))))));
      }

      // morning / evening per day
      const mornings = [], evenings = [];
      for (const date of weekDates) {
        const m = await store.get(`morning-${date}`);
        if (m) mornings.push({ date });
        const e = await store.get(`evening-${date}`);
        if (e) evenings.push({ date });
      }

      // tasks
      const done = [], undone = [];
      const ps = await store.get("projects");
      if (ps) JSON.parse(ps.value).forEach(p => p.tasks.forEach(t => (t.done ? done : undone).push({ ...t, project: p.name })));

      // ideas this week
      const ideas = [];
      const is_ = await store.get("ideas");
      if (is_) JSON.parse(is_.value).filter(i => weekDates.includes(i.date)).forEach(i => ideas.push(i));

      // cat counts + undecided
      const catCounts = {}, undecided = [];
      dumps.forEach(d => {
        if (!d.parsed) return;
        Object.entries(d.parsed).forEach(([cat, items]) => {
          const arr = Array.isArray(items) ? items : [];
          catCounts[cat] = (catCounts[cat] || 0) + arr.length;
          if (cat === "❓ 미결정") arr.forEach(it => undecided.push(typeof it === "string" ? it : it.text));
        });
      });

      // load saved weekly review
      const wr = await store.get(`weekly-review-${weekDates[0]}`);
      if (wr) {
        const d = JSON.parse(wr.value);
        setAnswers(d.answers || {});
        setAiResult(d.aiResult || "");
      }

      setData({ weekDates, dumps, mornings, evenings, done, undone, ideas, catCounts, undecided });
      setLoading(false);
    })();
  }, []);

  const submitReview = async () => {
    setAiLoading(true);
    try {
      const qa = WEEKLY_Qs.map(q => `Q: ${q.q}\nA: ${answers[q.id] || "(미작성)"}`).join("\n\n");
      const ai = await callClaude(
        `당신은 Hanna의 Second Brain AI.
Hanna: INFP, Chaeum(브랜드 컨설팅) + KRKK(푸드 SaaS), Brand Builder & Investor 비전.
주간 리뷰 분석:
1. 이번 주 패턴 진단 (잘된 것 + 놓친 것)
2. Chaeum / KRKK 각 관점에서 전략 제안 1개씩
3. 다음 주 12주 실행을 위한 단 하나의 핵심 행동
간결하게, 3-4문단.`,
        qa
      );
      setAiResult(ai);
      await store.set(`weekly-review-${data.weekDates[0]}`, JSON.stringify({ answers, aiResult: ai }));
    } catch (e) { setAiResult("오류: " + e.message); }
    setAiLoading(false);
  };

  if (loading) return <div style={S.page}><Spinner text="이번 주 데이터 불러오는 중..." /></div>;

  const DAY = ["월","화","수","목","금","토","일"];
  const maxCat = Object.values(data.catCounts).length ? Math.max(...Object.values(data.catCounts)) : 1;

  return (
    <div style={S.page}>
      <div style={{ borderBottom:"1px solid #2a2420", paddingBottom:16 }}>
        <div style={S.eyebrow}>THIS WEEK</div>
        <h2 style={S.headline}>이번 주</h2>
        <div style={{ fontSize:11, color:"#3a2a1a", fontFamily:"monospace", marginTop:4 }}>
          {data.weekDates[0]} – {data.weekDates[6]}
        </div>
      </div>

      <div style={{ display:"flex", gap:0, borderRadius:8, overflow:"hidden", border:"1px solid #2a2420" }}>
        {[["dash","▣ 대시보드"],["review","◈ 주간 리뷰"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} style={{
            flex:1, padding:"10px", border:"none", cursor:"pointer",
            fontFamily:"sans-serif", fontSize:12, fontWeight:600,
            background: view===id ? "#2a2018" : "#161210",
            color: view===id ? "#c8a87a" : "#4a3a2a",
            borderRight: id==="dash" ? "1px solid #2a2420" : "none",
            transition:"all .2s",
          }}>{label}</button>
        ))}
      </div>

      {/* ── 대시보드 ── */}
      {view === "dash" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {/* 활동 캘린더 */}
          <div style={{ display:"flex", gap:5 }}>
            {data.weekDates.map((date, i) => {
              const hasDump = data.dumps.some(d => d.rawDate===date || (d.date&&d.date.includes(date.replace(/-/g,"."))));
              const hasMorn = data.mornings.some(m => m.date===date);
              const hasEve  = data.evenings.some(e => e.date===date);
              const isToday = date === todayKey();
              return (
                <div key={date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ fontSize:10, color:isToday?"#c8a87a":"#3a2a1a", fontFamily:"monospace" }}>{DAY[i]}</div>
                  <div style={{ width:"100%", height:46, background: (hasDump||hasMorn||hasEve)?"#1e1a12":"#0e0b09",
                    border:`1px solid ${isToday?"#4a3a20":"#1a1612"}`, borderRadius:6,
                    display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:3 }}>
                    {hasDump && <div style={{ width:5,height:5,borderRadius:"50%",background:"#c8963a" }} />}
                    {hasMorn && <div style={{ width:5,height:5,borderRadius:"50%",background:"#5a8a5a" }} />}
                    {hasEve  && <div style={{ width:5,height:5,borderRadius:"50%",background:"#4a6a8a" }} />}
                    {!hasDump && !hasMorn && !hasEve && <div style={{ width:5,height:5,borderRadius:"50%",background:"#1e1a12" }} />}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:14, fontSize:10, color:"#3a2a1a", fontFamily:"monospace" }}>
            <span><span style={{ color:"#c8963a" }}>●</span> Brain Dump</span>
            <span><span style={{ color:"#5a8a5a" }}>●</span> Morning</span>
            <span><span style={{ color:"#4a6a8a" }}>●</span> Evening</span>
          </div>

          {/* 통계 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Brain Dump", value:data.dumps.length, color:"#c8963a", sub:`${new Set(data.dumps.map(d=>d.rawDate||d.date?.slice(0,10))).size}일 기록` },
              { label:"완료 태스크", value:data.done.length,  color:"#6aaa6a", sub:"이번 주" },
              { label:"미완료",      value:data.undone.length, color:"#c8703a", sub:"남은 태스크" },
              { label:"아이디어",    value:data.ideas.length,  color:"#9a8a6a", sub:"이번 주 캡처" },
            ].map(s => (
              <div key={s.label} style={{ background:"#161210", border:`1px solid ${s.color}22`, borderRadius:10, padding:"16px" }}>
                <div style={{ fontSize:26, color:s.color, fontWeight:300, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12, color:"#c8b49a", fontFamily:"sans-serif", marginTop:6 }}>{s.label}</div>
                <div style={{ fontSize:10, color:"#3a2a1a", fontFamily:"monospace", marginTop:2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Brain Dump 분류 바 */}
          {Object.keys(data.catCounts).length > 0 && (
            <div style={{ background:"#161210", border:"1px solid #2a2420", borderRadius:12, padding:"18px" }}>
              <div style={S.label}>이번 주 Brain Dump 분류</div>
              <div style={{ display:"flex", flexDirection:"column", gap:9, marginTop:10 }}>
                {Object.entries(data.catCounts).sort((a,b)=>b[1]-a[1]).map(([cat, count]) => {
                  const meta = CAT_META[cat] || { color:"#6a6a5a" };
                  return (
                    <div key={cat} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ fontSize:11, color:meta.color, fontFamily:"monospace", width:110, flexShrink:0 }}>{cat}</div>
                      <div style={{ flex:1, height:3, background:"#2a2420", borderRadius:2 }}>
                        <div style={{ width:`${(count/maxCat)*100}%`, height:"100%", background:meta.color, borderRadius:2, transition:"width .5s" }} />
                      </div>
                      <div style={{ fontSize:11, color:"#4a3a2a", fontFamily:"monospace", width:16, textAlign:"right" }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 미결정 */}
          {data.undecided.length > 0 && (
            <div style={{ background:"#101e22", border:"1px solid #1a3a4a", borderRadius:12, padding:"18px" }}>
              <div style={{ ...S.label, color:"#4a9aaa" }}>❓ 미결정 사항</div>
              <ul style={{ margin:"10px 0 0", padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:6 }}>
                {data.undecided.map((item, i) => (
                  <li key={i} style={{ fontSize:13, color:"#8ab4c4", fontFamily:"sans-serif", display:"flex", gap:8 }}>
                    <span style={{ color:"#3a7a8a", flexShrink:0 }}>—</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 미완료 */}
          {data.undone.length > 0 && (
            <div style={{ background:"#1e1812", border:"1px solid #3a2a18", borderRadius:12, padding:"18px" }}>
              <div style={{ ...S.label, color:"#c8703a" }}>📌 미완료 태스크</div>
              <ul style={{ margin:"10px 0 0", padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:6 }}>
                {data.undone.slice(0,8).map((t, i) => (
                  <li key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#c4a484", fontFamily:"sans-serif", gap:8 }}>
                    <span style={{ display:"flex", gap:8 }}><span style={{ color:"#5a3a1a" }}>◇</span>{t.text}</span>
                    <span style={{ fontSize:10, color:"#4a3a2a", fontFamily:"monospace", flexShrink:0 }}>{t.project}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.dumps.length===0 && data.done.length===0 && (
            <div style={S.empty}>이번 주 기록이 없어요. Brain Dump부터 시작해보세요.</div>
          )}
        </div>
      )}

      {/* ── 주간 리뷰 ── */}
      {view === "review" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {WEEKLY_Qs.map(q => (
            <div key={q.id} style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={S.questionLabel}>{q.q}</label>
              <textarea value={answers[q.id]||""} onChange={e=>setAnswers(p=>({...p,[q.id]:e.target.value}))}
                placeholder={q.ph} style={{ ...S.textarea, minHeight:70 }} />
            </div>
          ))}
          <button onClick={submitReview} disabled={aiLoading} style={S.btn}>
            {aiLoading ? "분석 중..." : "◈ AI 주간 인사이트 받기"}
          </button>
          {aiLoading && <Spinner text="이번 주를 분석하는 중..." />}
          {aiResult && (
            <div style={S.aiBox}>
              <div style={S.aiLabel}>주간 인사이트</div>
              <pre style={S.aiText}>{aiResult}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3 — 지금 (Brain Dump)
// ════════════════════════════════════════════════════════════════════════════
function TabNow() {
  const [text, setText]         = useState("");
  const [classified, setClassified] = useState(null);
  const [nudge, setNudge]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [history, setHistory]   = useState([]);
  const [doneMap, setDoneMap]   = useState({});
  const [sentMap, setSentMap]   = useState({});
  const textRef = useRef(null);

  useEffect(() => {
    store.get("dump-history").then(h => { if (h) setHistory(JSON.parse(h.value)); });
    setTimeout(() => textRef.current?.focus(), 100);
  }, []);

  const classify = async () => {
    if (!text.trim()) return;
    setLoading(true); setClassified(null); setNudge("");
    try {
      const ai = await callClaude(
        `당신은 Hanna의 Second Brain AI.
Hanna: INFP, 생각 많아 실행 느린 경향, Chaeum+KRKK 운영, Brand Builder & Investor 비전.

쏟아낸 텍스트를 분류 + GTD 2분 룰 + 프로젝트 연결.
카테고리: 🔴 지금 당장 / 💭 걱정/감정 / 💡 아이디어 / ❓ 미결정 / 📌 나중에 / 🧠 인사이트

JSON만 출력 (마크다운 없이):
{
  "categories": {
    "🔴 지금 당장": [{"text":"...","twoMin":true,"project":"Chaeum"}],
    "💭 걱정/감정": [],
    "💡 아이디어": [],
    "❓ 미결정": [],
    "📌 나중에": [],
    "🧠 인사이트": []
  },
  "nudge": "과잉사고를 멈추고 첫 행동을 하게 만드는 한 문장. 30자 이내."
}
twoMin=2분내 가능, project=Chaeum/KRKK/12주년/개인/다시노래 or null, 빈 카테고리=[], 항목은 명확한 문장으로 재작성.`,
        text
      );
      const clean = ai.replace(/```json|```/g,"").trim();
      let parsed;
      try { parsed = JSON.parse(clean); }
      catch { parsed = { categories:{"🧠 인사이트":[{text:ai,twoMin:false,project:null}]}, nudge:"" }; }

      setClassified(parsed.categories);
      setNudge(parsed.nudge || "");

      const entry = { date:new Date().toLocaleString("ko-KR"), rawDate:todayKey(), raw:text, parsed:parsed.categories };
      const updated = [entry, ...history].slice(0, 20);
      setHistory(updated);
      await store.set("dump-history", JSON.stringify(updated));
    } catch(e) { setNudge("오류: " + e.message); }
    setLoading(false);
  };

  const toMorning = async (item) => {
    const key = `morning-prefill-${todayKey()}`;
    const s = await store.get(key);
    const existing = s ? JSON.parse(s.value) : [];
    await store.set(key, JSON.stringify([...existing, item.text]));
  };

  const toProject = async (item) => {
    if (!item.project) return;
    const ps = await store.get("projects");
    let projects = ps ? JSON.parse(ps.value) : [];
    let proj = projects.find(p => p.name === item.project);
    if (!proj) {
      proj = { id:Date.now(), name:item.project, tasks:[] };
      projects = [...projects, proj];
    }
    projects = projects.map(p => p.id===proj.id
      ? { ...p, tasks:[...p.tasks, {id:Date.now(), text:item.text, done:false}] }
      : p
    );
    await store.set("projects", JSON.stringify(projects));
  };

  const toIdeas = async (item) => {
    const is_ = await store.get("ideas");
    const ideas = is_ ? JSON.parse(is_.value) : [];
    await store.set("ideas", JSON.stringify([{id:Date.now(), text:item.text, tag:item.project||"개인", date:todayKey(), connected:false}, ...ideas]));
  };

  const markDone = (k) => setDoneMap(p => ({ ...p, [k]:true }));
  const markSent = (k) => setSentMap(p => ({ ...p, [k]:true }));

  const getItems = (catData) => {
    if (!Array.isArray(catData) || !catData.length) return [];
    return typeof catData[0]==="string" ? catData.map(t=>({text:t,twoMin:false,project:null})) : catData;
  };

  const hasItems = classified && Object.values(classified).some(v => Array.isArray(v) && v.length > 0);

  return (
    <div style={S.page}>
      <div style={{ borderBottom:"1px solid #2a2420", paddingBottom:16 }}>
        <div style={S.eyebrow}>BRAIN DUMP</div>
        <h2 style={S.headline}>지금</h2>
        <p style={{ fontSize:12, color:"#5a4a3a", fontFamily:"sans-serif", margin:"6px 0 0" }}>
          뭐든 다 쏟아내세요. AI가 분류할게요. <span style={{ fontFamily:"monospace", fontSize:11 }}>⌘+Enter</span>
        </p>
      </div>

      <div style={{ position:"relative" }}>
        <textarea ref={textRef} value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e => { if ((e.metaKey||e.ctrlKey) && e.key==="Enter") classify(); }}
          placeholder={"걱정되는 것, 해야 할 것, 아이디어, 감정...\n뭐가 뭔지 구분 안 해도 돼요. 섞어서 써도 돼요."}
          style={{ ...S.textarea, minHeight:200, paddingBottom:52 }} />
        <button onClick={classify} disabled={loading||!text.trim()} style={{
          ...S.btn, position:"absolute", bottom:12, right:12, padding:"8px 18px", fontSize:12,
          opacity:(!text.trim()||loading)?.35:1,
        }}>
          {loading ? "분류 중..." : "◎ 분류"}
        </button>
      </div>

      {loading && <Spinner text="생각들을 정리하는 중..." />}

      {nudge && (
        <div style={{ background:"#1e1a10", border:"1px solid #4a3a18", borderRadius:10, padding:"13px 18px", fontSize:14, color:"#c8a87a", fontStyle:"italic" }}>
          ✦ {nudge}
        </div>
      )}

      {hasItems && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {Object.entries(classified).map(([cat, catData]) => {
            const items = getItems(catData);
            if (!items.length) return null;
            const meta = CAT_META[cat] || { color:"#8a8a6a", bg:"#1a1a14" };
            return (
              <div key={cat} style={{ background:meta.bg, border:`1px solid ${meta.color}30`, borderRadius:10, padding:"14px 16px" }}>
                <div style={{ fontSize:11, color:meta.color, fontFamily:"monospace", marginBottom:10, letterSpacing:.5 }}>{cat}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {items.map((item, i) => {
                    const k = `${cat}-${i}`;
                    const isDone = doneMap[k], isSent = sentMap[k];
                    return (
                      <div key={i} style={{ opacity:isDone?.4:1, transition:"opacity .3s" }}>
                        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                          <span style={{ color:meta.color, flexShrink:0, marginTop:3, fontSize:10 }}>—</span>
                          <span style={{ fontSize:13, color:"#c4b49a", fontFamily:"sans-serif", lineHeight:1.6, flex:1, textDecoration:isDone?"line-through":"none" }}>
                            {item.text}
                          </span>
                        </div>
                        <div style={{ display:"flex", gap:6, paddingLeft:16, marginTop:5, flexWrap:"wrap" }}>
                          {item.twoMin && <span style={{ fontSize:10, background:"#2a1a08", border:"1px solid #8a5a2a", color:"#c8803a", borderRadius:10, padding:"2px 8px", fontFamily:"monospace" }}>⚡ 2분</span>}
                          {item.project && <span style={{ fontSize:10, background:TAG_COLORS[item.project]+"22", border:`1px solid ${TAG_COLORS[item.project]}55`, color:TAG_COLORS[item.project], borderRadius:10, padding:"2px 8px", fontFamily:"monospace" }}>{item.project}</span>}
                          {isSent ? (
                            <span style={{ fontSize:10, color:"#6a8a5a", fontFamily:"monospace" }}>✓ 전송됨</span>
                          ) : (
                            <>
                              {item.twoMin && !isDone && <button onClick={()=>markDone(k)} style={S.chipBtn}>✓ 완료</button>}
                              {cat==="🔴 지금 당장" && <button onClick={async()=>{await toMorning(item);markSent(k);}} style={S.chipBtn}>→ Morning</button>}
                              {cat==="🔴 지금 당장" && item.project && <button onClick={async()=>{await toProject(item);markSent(k);}} style={{...S.chipBtn,color:"#8a9a7a",borderColor:"#3a4a2a"}}>→ 프로젝트</button>}
                              {cat==="💡 아이디어" && <button onClick={async()=>{await toIdeas(item);markSent(k);}} style={{...S.chipBtn,color:"#aa8a4a",borderColor:"#5a4a1a"}}>→ 저장</button>}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <div style={S.label}>최근 기록</div>
          {history.slice(0,3).map((h,i) => (
            <div key={i} style={{ background:"#141210", border:"1px solid #1e1a16", borderRadius:6, padding:"10px 14px", marginTop:6 }}>
              <div style={{ fontSize:10, color:"#3a2a1a", fontFamily:"monospace", marginBottom:3 }}>{h.date}</div>
              <div style={{ fontSize:12, color:"#5a4a3a", fontFamily:"sans-serif" }}>{h.raw.slice(0,80)}{h.raw.length>80?"...":""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 4 — 오늘 (Morning / Evening / 아이디어&프로젝트)
// ════════════════════════════════════════════════════════════════════════════
function TabToday() {
  const hour = getHour();
  const [view, setView] = useState(hour >= 5 && hour < 14 ? "morning" : "evening");

  return (
    <div style={S.page}>
      <div style={{ borderBottom:"1px solid #2a2420", paddingBottom:16 }}>
        <div style={S.eyebrow}>TODAY</div>
        <h2 style={S.headline}>오늘</h2>
      </div>

      <div style={{ display:"flex", gap:0, borderRadius:8, overflow:"hidden", border:"1px solid #2a2420" }}>
        {[["morning","◐ Morning"],["evening","◑ Evening"],["ideas","◇ 아이디어 & 프로젝트"]].map(([id,label],idx,arr) => (
          <button key={id} onClick={()=>setView(id)} style={{
            flex:1, padding:"10px 6px", border:"none", cursor:"pointer",
            fontFamily:"sans-serif", fontSize:11, fontWeight:600,
            background: view===id ? "#2a2018" : "#161210",
            color: view===id ? "#c8a87a" : "#4a3a2a",
            borderRight: idx<arr.length-1 ? "1px solid #2a2420" : "none",
            transition:"all .2s",
          }}>{label}</button>
        ))}
      </div>

      {view==="morning" && <MorningView />}
      {view==="evening" && <EveningView />}
      {view==="ideas"   && <IdeasView />}
    </div>
  );
}

function MorningView() {
  const Qs = [
    { id:"focus",     q:"오늘 반드시 끝내야 할 한 가지는?", ph:"가장 중요한 것 하나만..." },
    { id:"energy",    q:"지금 에너지 레벨은? (1–10)",      ph:"숫자와 이유..." },
    { id:"gratitude", q:"오늘 감사한 것 하나는?",           ph:"작은 것도 괜찮아요..." },
    { id:"intention", q:"오늘 내가 되고 싶은 모습은?",      ph:"행동 또는 태도..." },
  ];
  const [answers, setAnswers]   = useState({});
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading]   = useState(false);
  const [prefill, setPrefill]   = useState(0);

  useEffect(() => {
    (async () => {
      const s = await store.get(`morning-${todayKey()}`);
      if (s) { const d=JSON.parse(s.value); setAnswers(d.answers||{}); setAiResult(d.aiResult||""); return; }
      const pf = await store.get(`morning-prefill-${todayKey()}`);
      if (pf) {
        const items = JSON.parse(pf.value);
        if (items.length) { setAnswers(p=>({...p,focus:items.join("\n")})); setPrefill(items.length); }
      }
    })();
  }, []);

  const submit = async () => {
    setLoading(true);
    try {
      const qa = Qs.map(q=>`Q:${q.q}\nA:${answers[q.id]||"(미작성)"}`).join("\n\n");
      const ai = await callClaude(
        `당신은 Hanna의 Second Brain AI. INFP, Chaeum+KRKK, Brand Builder & Investor 비전.
아침 리뷰: 1.오늘 핵심 의도 한 문장 2.에너지 높이는 리마인더 2개 3.INFP 과잉사고 함정 1개 피하기. 따뜻하지만 직접적으로.`,
        qa
      );
      setAiResult(ai);
      await store.set(`morning-${todayKey()}`, JSON.stringify({ answers, aiResult:ai }));
    } catch(e){ setAiResult("오류: "+e.message); }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <p style={{ fontSize:12, color:"#5a4a3a", fontFamily:"sans-serif", margin:0 }}>하루를 의도적으로 시작하세요.</p>
      {prefill > 0 && (
        <div style={{ background:"#1e1a10", border:"1px solid #5a3a1a", borderRadius:10, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:"#c8a87a", fontFamily:"sans-serif" }}>⚡ Brain Dump에서 {prefill}개 자동 입력됨</span>
          <button onClick={async()=>{await store.del(`morning-prefill-${todayKey()}`);setPrefill(0);}} style={S.chipBtn}>지우기</button>
        </div>
      )}
      {Qs.map(q => (
        <div key={q.id} style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <label style={S.questionLabel}>{q.q}</label>
          <textarea value={answers[q.id]||""} onChange={e=>setAnswers(p=>({...p,[q.id]:e.target.value}))}
            placeholder={q.ph} style={{ ...S.textarea, minHeight:68 }} />
        </div>
      ))}
      <button onClick={submit} disabled={loading} style={S.btn}>
        {loading?"분석 중...":"◐ AI 아침 인사이트 받기"}
      </button>
      {loading && <Spinner text="오늘을 준비하는 중..." />}
      {aiResult && <div style={S.aiBox}><div style={S.aiLabel}>오늘의 방향</div><pre style={S.aiText}>{aiResult}</pre></div>}
    </div>
  );
}

function EveningView() {
  const [tasks, setTasks]       = useState([]);
  const [checked, setChecked]   = useState({});
  const [review, setReview]     = useState({ learn:"", unfinished:"", tomorrow:"", free:"" });
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState("tasks");

  useEffect(() => {
    (async () => {
      const s = await store.get(`evening-${todayKey()}`);
      if (s) {
        const d=JSON.parse(s.value);
        setChecked(d.checked||{}); setReview(d.review||{learn:"",unfinished:"",tomorrow:"",free:""});
        setAiResult(d.aiResult||""); if(d.aiResult) setStep("review");
      }
      const collected=[];
      const m = await store.get(`morning-${todayKey()}`);
      if (m) {
        const focus = JSON.parse(m.value).answers?.focus;
        if (focus) focus.split("\n").filter(l=>l.trim()).forEach((line,i)=>collected.push({id:`m-${i}`,text:line.trim(),source:"Morning 목표"}));
      }
      const dh = await store.get("dump-history");
      if (dh) {
        JSON.parse(dh.value).filter(d=>d.rawDate===todayKey()).forEach(d=>{
          const cat=d.parsed?.["🔴 지금 당장"];
          if(cat) (Array.isArray(cat)?cat:[]).forEach((item,i)=>{
            const text=typeof item==="string"?item:item.text;
            collected.push({id:`d-${i}-${d.date}`,text,source:"Brain Dump"});
          });
        });
      }
      const ps = await store.get("projects");
      if (ps) JSON.parse(ps.value).forEach(p=>p.tasks.filter(t=>!t.done).slice(0,2).forEach(t=>collected.push({id:`p-${t.id}`,text:t.text,source:p.name})));
      const seen=new Set();
      setTasks(collected.filter(t=>{if(seen.has(t.text))return false;seen.add(t.text);return true;}));
    })();
  }, []);

  const toggleTask = (id) => setChecked(p=>({...p,[id]:!p[id]}));

  const analyze = async () => {
    setLoading(true);
    try {
      const done=tasks.filter(t=>checked[t.id]).map(t=>t.text);
      const undone=tasks.filter(t=>!checked[t.id]).map(t=>t.text);
      const qa=Object.entries(review).map(([k,v])=>`${k}: ${v}`).join("\n");
      const ai = await callClaude(
        `당신은 Hanna의 Second Brain AI. INFP, Chaeum+KRKK, Brand Builder & Investor 비전.
저녁 리뷰: 1.실행 점수(10점)+이유 2.잘한 것 칭찬 3.내일 핵심 인사이트 1개 4.비전 관점 총평 한 줄. 따뜻하지만 정직하게.`,
        `완료: ${done.join(", ")||"없음"}\n미완료: ${undone.join(", ")||"없음"}\n\n${qa}`
      );
      setAiResult(ai);
      await store.set(`evening-${todayKey()}`, JSON.stringify({ checked, review, aiResult:ai }));
    } catch(e){ setAiResult("오류: "+e.message); }
    setLoading(false);
  };

  const doneCount = tasks.filter(t=>checked[t.id]).length;
  const SRC_COLOR = { "Morning 목표":"#5a8a5a", "Brain Dump":"#c8604a" };
  const RQ = [
    { id:"learn",      q:"오늘 배우거나 깨달은 것은?",  ph:"작은 인사이트도..." },
    { id:"unfinished", q:"미완료 이유 & 내일 계획은?",  ph:"판단 없이 솔직하게..." },
    { id:"tomorrow",   q:"내일 가장 먼저 할 한 가지는?",ph:"구체적으로..." },
    { id:"free",       q:"오늘 자유 기록",               ph:"감정, 에너지, 몸 상태, 뭐든..." },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <p style={{ fontSize:12, color:"#5a4a3a", fontFamily:"sans-serif", margin:0 }}>오늘을 체크하고 정직하게 돌아보세요.</p>

      <div style={{ display:"flex", gap:0, borderRadius:8, overflow:"hidden", border:"1px solid #2a2420" }}>
        {[["tasks","① 할 일 체크"],["review","② 리뷰 작성"]].map(([id,label])=>(
          <button key={id} onClick={()=>setStep(id)} style={{
            flex:1, padding:"9px", border:"none", cursor:"pointer",
            fontFamily:"sans-serif", fontSize:12, fontWeight:600,
            background: step===id?"#2a2018":"#161210", color: step===id?"#c8a87a":"#4a3a2a",
            borderRight: id==="tasks"?"1px solid #2a2420":"none",
          }}>{label}</button>
        ))}
      </div>

      {step==="tasks" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ background:"#1a1610", border:"1px solid #3a3020", borderRadius:10, padding:"12px 16px" }}>
            <div style={{ fontSize:10, color:"#6a5a3a", fontFamily:"monospace", marginBottom:4 }}>✦ 오늘의 방향</div>
            <div style={{ fontSize:12, color:"#a49070", fontFamily:"sans-serif", lineHeight:1.6 }}>
              브랜드는 내 삶을 갉아먹는 성공이 아니라 <span style={{ color:"#c8a87a" }}>선택권을 늘리는 구조</span>여야 한다.
            </div>
          </div>
          {tasks.length > 0 ? (
            <>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={S.label}>오늘 할 일</div>
                <div style={{ fontSize:11, color:doneCount===tasks.length?"#6a8a5a":"#4a3a2a", fontFamily:"monospace" }}>{doneCount}/{tasks.length}</div>
              </div>
              {tasks.map(task => {
                const isDone=checked[task.id];
                const sc=SRC_COLOR[task.source]||"#5a6a7a";
                return (
                  <div key={task.id} onClick={()=>toggleTask(task.id)} style={{
                    display:"flex", gap:12, alignItems:"flex-start", padding:"12px 14px",
                    background:isDone?"#141e14":"#161210",
                    border:`1px solid ${isDone?"#2a4a2a":"#2a2420"}`,
                    borderRadius:8, cursor:"pointer", transition:"all .2s",
                  }}>
                    <div style={{ width:17,height:17,borderRadius:4,border:`1.5px solid ${isDone?"#5a8a5a":"#2a2a20"}`,background:isDone?"#2a4a2a":"transparent",flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      {isDone && <span style={{ fontSize:10,color:"#7aba7a" }}>✓</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,color:isDone?"#5a6a5a":"#c4b49a",fontFamily:"sans-serif",textDecoration:isDone?"line-through":"none",lineHeight:1.5 }}>{task.text}</div>
                      <div style={{ fontSize:10,color:sc,fontFamily:"monospace",marginTop:3 }}>{task.source}</div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div style={S.empty}>오늘 Morning 또는 Brain Dump 기록이 없어요.</div>
          )}
          <button onClick={()=>setStep("review")} style={{ ...S.btn, alignSelf:"flex-end" }}>리뷰 작성으로 →</button>
        </div>
      )}

      {step==="review" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {tasks.length > 0 && (
            <div style={{ background:"#141e14", border:"1px solid #2a4a2a", borderRadius:10, padding:"14px 16px", display:"flex", gap:20, alignItems:"center" }}>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:24,color:"#7aba7a",fontWeight:300 }}>{doneCount}</div><div style={{ fontSize:10,color:"#4a6a4a",fontFamily:"monospace" }}>완료</div></div>
              <div style={{ width:1,height:30,background:"#2a4a2a" }} />
              <div style={{ textAlign:"center" }}><div style={{ fontSize:24,color:"#c8703a",fontWeight:300 }}>{tasks.length-doneCount}</div><div style={{ fontSize:10,color:"#5a3a2a",fontFamily:"monospace" }}>미완료</div></div>
              <div style={{ flex:1 }}>
                <div style={{ height:3,background:"#1a2a1a",borderRadius:2 }}>
                  <div style={{ width:`${tasks.length?(doneCount/tasks.length)*100:0}%`,height:"100%",background:"#5a8a5a",borderRadius:2,transition:"width .5s" }} />
                </div>
                <div style={{ fontSize:10,color:"#4a5a4a",fontFamily:"monospace",marginTop:4 }}>{tasks.length?Math.round((doneCount/tasks.length)*100):0}% 실행률</div>
              </div>
            </div>
          )}
          {RQ.map(q=>(
            <div key={q.id} style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={S.questionLabel}>{q.q}</label>
              <textarea value={review[q.id]||""} onChange={e=>setReview(p=>({...p,[q.id]:e.target.value}))}
                placeholder={q.ph} style={{ ...S.textarea, minHeight:66 }} />
            </div>
          ))}
          <button onClick={analyze} disabled={loading} style={S.btn}>{loading?"분석 중...":"◑ AI 저녁 인사이트 받기"}</button>
          {loading && <Spinner text="오늘 하루를 돌아보는 중..." />}
          {aiResult && <div style={S.aiBox}><div style={S.aiLabel}>오늘의 총평</div><pre style={S.aiText}>{aiResult}</pre></div>}
        </div>
      )}
    </div>
  );
}

function IdeasView() {
  const [tab, setTab]           = useState("ideas");
  const [ideas, setIdeas]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [newIdea, setNewIdea]   = useState("");
  const [ideaTag, setIdeaTag]   = useState("개인");
  const [newProj, setNewProj]   = useState("");
  const [newTask, setNewTask]   = useState("");
  const [taskPId, setTaskPId]   = useState("");

  useEffect(() => {
    (async () => {
      const i=await store.get("ideas"); if(i) setIdeas(JSON.parse(i.value));
      const p=await store.get("projects"); if(p) setProjects(JSON.parse(p.value));
    })();
  }, []);

  const saveIdeas    = async u => { setIdeas(u);    await store.set("ideas",    JSON.stringify(u)); };
  const saveProjects = async u => { setProjects(u); await store.set("projects", JSON.stringify(u)); };

  const addIdea = async () => {
    if (!newIdea.trim()) return;
    await saveIdeas([{id:Date.now(),text:newIdea,tag:ideaTag,date:todayKey(),connected:false},...ideas]);
    setNewIdea("");
  };
  const addProject = async () => {
    if (!newProj.trim()) return;
    await saveProjects([...projects,{id:Date.now(),name:newProj,tasks:[]}]);
    setNewProj("");
  };
  const addTask = async () => {
    if (!newTask.trim()||!taskPId) return;
    await saveProjects(projects.map(p=>p.id===Number(taskPId)?{...p,tasks:[...p.tasks,{id:Date.now(),text:newTask,done:false}]}:p));
    setNewTask("");
  };
  const toggleTask = async (pid,tid) => saveProjects(projects.map(p=>p.id===pid?{...p,tasks:p.tasks.map(t=>t.id===tid?{...t,done:!t.done}:t)}:p));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", gap:0, borderRadius:8, overflow:"hidden", border:"1px solid #2a2420" }}>
        {[["ideas","◇ 아이디어"],["projects","◈ 프로젝트"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            flex:1, padding:"9px", border:"none", cursor:"pointer",
            fontFamily:"sans-serif", fontSize:12, fontWeight:600,
            background: tab===id?"#2a2018":"#161210", color: tab===id?"#c8a87a":"#4a3a2a",
            borderRight: id==="ideas"?"1px solid #2a2420":"none",
          }}>{label}</button>
        ))}
      </div>

      {tab==="ideas" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <textarea value={newIdea} onChange={e=>setNewIdea(e.target.value)} placeholder="아이디어, 레퍼런스, 문장... 빠르게 캡처" style={{ ...S.textarea, minHeight:56 }} />
          <div style={{ display:"flex", gap:8 }}>
            <select value={ideaTag} onChange={e=>setIdeaTag(e.target.value)} style={S.select}>
              {PROJECT_TAGS.map(t=><option key={t}>{t}</option>)}
            </select>
            <button onClick={addIdea} style={S.btn}>+ 캡처</button>
          </div>
          {ideas.map(idea=>(
            <div key={idea.id} style={{ background:"#141210", border:"1px solid #2a2420", borderRadius:8, padding:"12px 14px", borderLeft:`3px solid ${TAG_COLORS[idea.tag]||"#555"}` }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:10, background:TAG_COLORS[idea.tag]+"22", color:TAG_COLORS[idea.tag]||"#888", borderRadius:10, padding:"2px 8px", fontFamily:"monospace" }}>{idea.tag}</span>
                  <p style={{ fontSize:13, color:"#c4b49a", fontFamily:"sans-serif", lineHeight:1.6, margin:"6px 0 2px" }}>{idea.text}</p>
                  <span style={{ fontSize:10, color:"#3a2a1a", fontFamily:"monospace" }}>{idea.date}</span>
                </div>
                <button onClick={()=>saveIdeas(ideas.filter(i=>i.id!==idea.id))} style={{ ...S.chipBtn, color:"#8a4a4a", borderColor:"#4a2a2a", alignSelf:"flex-start" }}>×</button>
              </div>
            </div>
          ))}
          {!ideas.length && <div style={S.empty}>아직 아이디어가 없어요. Brain Dump에서 캡처해보세요.</div>}
        </div>
      )}

      {tab==="projects" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", gap:8 }}>
            <input value={newProj} onChange={e=>setNewProj(e.target.value)} placeholder="새 프로젝트 이름..." style={S.input} />
            <button onClick={addProject} style={S.btn}>+ 추가</button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="태스크 추가..." style={{ ...S.input, flex:1 }} />
            <select value={taskPId} onChange={e=>setTaskPId(e.target.value)} style={S.select}>
              <option value="">프로젝트 선택</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={addTask} style={S.btn}>+</button>
          </div>
          {projects.map(proj=>(
            <div key={proj.id} style={{ background:"#161210", border:"1px solid #2a2420", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:14, color:"#c8a87a", fontWeight:600 }}>{proj.name}</span>
                <span style={{ fontSize:11, color:"#3a2a1a", fontFamily:"monospace" }}>{proj.tasks.filter(t=>t.done).length}/{proj.tasks.length}</span>
              </div>
              {proj.tasks.map(task=>(
                <div key={task.id} onClick={()=>toggleTask(proj.id,task.id)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", cursor:"pointer", borderBottom:"1px solid #1e1a16", fontSize:13, fontFamily:"sans-serif" }}>
                  <span style={{ color:task.done?"#6a8a5a":"#2a2820" }}>{task.done?"◆":"◇"}</span>
                  <span style={{ color:task.done?"#4a5a4a":"#c4b49a", textDecoration:task.done?"line-through":"none" }}>{task.text}</span>
                </div>
              ))}
              {!proj.tasks.length && <div style={{ fontSize:12, color:"#3a2a1a", fontFamily:"sans-serif" }}>태스크를 추가해보세요.</div>}
            </div>
          ))}
          {!projects.length && <div style={S.empty}>프로젝트를 만들어보세요.</div>}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Main App
// ════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [active, setActive] = useState("na");
  const today = new Date().toLocaleDateString("ko-KR", { weekday:"long", month:"long", day:"numeric" });

  const renderTab = () => {
    if (active==="na")    return <TabNa />;
    if (active==="week")  return <TabWeek />;
    if (active==="now")   return <TabNow />;
    if (active==="today") return <TabToday />;
    return null;
  };

  return (
    <>
      <Head><title>Second Brain</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
    <div style={{ display:"flex", height:"100vh", background:"#0e0b09", color:"#d4c4a8", fontFamily:"'Georgia','Nanum Myeongjo',serif", overflow:"hidden" }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#2a2218;border-radius:2px}
        textarea,input,select{outline:none}
        textarea::placeholder,input::placeholder{color:#3a2a1a}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .nav-btn:hover{background:#1c1610 !important}
      `}</style>

      {/* Sidebar */}
      <aside style={{ width:68, background:"#080604", borderRight:"1px solid #1a1612", display:"flex", flexDirection:"column", alignItems:"center", padding:"18px 0 16px", gap:2, flexShrink:0 }}>
        <div style={{ fontSize:16, color:"#c8a87a", marginBottom:18, letterSpacing:1 }}>◎</div>
        {TABS.map(tab => (
          <button key={tab.id} className="nav-btn" onClick={()=>setActive(tab.id)} style={{
            width:52, height:52, borderRadius:10, border:"none", cursor:"pointer",
            background: active===tab.id ? "#2a2018" : "transparent",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3,
            transition:"background .2s",
          }}>
            <span style={{ fontSize:17, color:active===tab.id?"#c8a87a":"#2a1a0a" }}>{tab.icon}</span>
            <span style={{ fontSize:9, color:active===tab.id?"#8a7a5a":"#2a1a0a", fontFamily:"monospace", letterSpacing:.3 }}>{tab.label}</span>
          </button>
        ))}
        <div style={{ marginTop:"auto", fontSize:8, color:"#1e1208", fontFamily:"monospace", textAlign:"center", lineHeight:1.8 }}>
          12WY<br/>OS
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <header style={{ padding:"14px 28px", borderBottom:"1px solid #12100e", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontSize:10, color:"#2a1a0a", fontFamily:"monospace", cursor:"pointer", letterSpacing:.5 }} onClick={()=>setActive("na")}>
            ✦ Brand Builder & Investor
          </div>
          <div style={{ fontSize:10, color:"#2a1a0a", fontFamily:"monospace" }}>{today}</div>
        </header>
        <div style={{ flex:1, overflow:"auto", padding:"24px 28px", maxWidth:680, width:"100%", margin:"0 auto" }}>
          <div key={active}>
            {renderTab()}
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

// ── Shared Styles ─────────────────────────────────────────────────────────────
const S = {
  page:         { display:"flex", flexDirection:"column", gap:20 },
  eyebrow:      { fontSize:9, letterSpacing:3, color:"#3a2a1a", fontFamily:"monospace", marginBottom:10 },
  headline:     { fontSize:20, fontWeight:400, color:"#c8a87a", margin:0, lineHeight:1.5, letterSpacing:.3 },
  label:        { fontSize:10, color:"#3a2a1a", fontFamily:"monospace", letterSpacing:1, textTransform:"uppercase" },
  questionLabel:{ fontSize:13, color:"#b4a48a", fontFamily:"sans-serif", fontWeight:500 },
  textarea: {
    width:"100%", background:"#141210", border:"1px solid #242018", borderRadius:8,
    padding:"12px 14px", color:"#d4c4a8", fontSize:13, fontFamily:"'Georgia',serif",
    resize:"vertical", lineHeight:1.7,
  },
  input: {
    flex:1, background:"#141210", border:"1px solid #242018", borderRadius:8,
    padding:"10px 14px", color:"#d4c4a8", fontSize:13, fontFamily:"sans-serif",
  },
  select: {
    background:"#141210", border:"1px solid #242018", borderRadius:8,
    padding:"10px 12px", color:"#d4c4a8", fontSize:13, fontFamily:"sans-serif", cursor:"pointer",
  },
  btn: {
    background:"#221c12", border:"1px solid #3a3018", borderRadius:8,
    padding:"10px 20px", color:"#c8a87a", fontSize:13, fontFamily:"sans-serif",
    cursor:"pointer", fontWeight:600, letterSpacing:.3, whiteSpace:"nowrap",
  },
  chipBtn: {
    background:"transparent", border:"1px solid #242018", borderRadius:8,
    padding:"3px 10px", color:"#5a4a3a", fontSize:10, cursor:"pointer", fontFamily:"monospace",
  },
  aiBox:        { background:"#121008", border:"1px solid #242018", borderRadius:10, padding:"16px 18px" },
  aiLabel:      { fontSize:10, color:"#5a5a3a", fontFamily:"monospace", letterSpacing:1, textTransform:"uppercase", marginBottom:10, display:"flex", gap:10 },
  aiText:       { fontSize:13, color:"#c4b49a", lineHeight:1.9, margin:0, whiteSpace:"pre-wrap", fontFamily:"sans-serif" },
  imgPlaceholder: {
    border:"1px dashed #2a2018", borderRadius:12, padding:"36px 20px",
    display:"flex", flexDirection:"column", alignItems:"center", gap:10,
    cursor:"pointer", background:"#0e0b09", transition:"border-color .2s",
  },
  empty: { fontSize:12, color:"#3a2a1a", fontFamily:"sans-serif", textAlign:"center", padding:"24px 0" },
};
