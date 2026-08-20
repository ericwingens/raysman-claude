import React, { useEffect, useState } from "react";
import { RANGES, statsFor, DAYS, HOUR_LABELS } from "../data.js";
import { EUR, Ico, num } from "../lib.jsx";

/*
 * Meine Statistiken — the creator's own numbers as charts. Reached from
 * Me → Konto and from the studio. Everything is drawn with plain SVG and CSS;
 * no chart library, so it survives being inlined into a single HTML file.
 */
export default function StatsFull({ ctx }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(r); }, []);

  const [range, setRange] = useState("30");
  const s = statsFor(range);
  const every = range === "30" ? 5 : 1;
  const perLabel = range === "12m" ? "Monat" : "Tag";

  return (
    <div className={`full ${show ? "show" : ""}`}>
      <div className="ftop">
        <button className="iconbtn" onClick={ctx.pop}><Ico name="arrow" /></button>
        <h3>Meine Statistiken</h3>
        <span style={{ width: 42 }} />
      </div>
      <div className="fscreen" style={{ padding: "10px 18px 34px" }}>
        <div className="seg">
          {RANGES.map((r) => (
            <button key={r.id} className={range === r.id ? "on" : ""} onClick={() => setRange(r.id)}>{r.label}</button>
          ))}
        </div>

        <div className="statkpi">
          <Kpi label="Einnahmen" value={EUR(s.totals.revenue)} change={s.change.revenue} />
          <Kpi label="Calls" value={num(s.totals.calls)} change={s.change.calls} />
          <Kpi label="Gesprächsminuten" value={num(s.totals.mins)} change={s.change.mins} />
          <Kpi label="Neue Fans" value={num(s.totals.fans)} change={s.change.fans} />
        </div>
        <p className="muted" style={{ fontSize: 11.5, margin: "0 2px 16px" }}>
          Veränderung gegenüber dem vorherigen Zeitraum gleicher Länge.
        </p>

        <Box title="Einnahmen" sub={`Pro ${perLabel}, in Euro — tippe einen Balken für den Wert`}>
          <Bars values={s.revenue} labels={s.labels} every={every} fmt={EUR} />
        </Box>

        <Box title="Woher das Geld kommt" sub={`Aufteilung der ${EUR(s.totals.revenue)} im gewählten Zeitraum`}>
          <Donut parts={s.bySource} />
        </Box>

        <Box title="Calls" sub={`Gelieferte Calls pro ${perLabel}`}>
          <Area values={s.calls} labels={s.labels} every={every} />
        </Box>

        <Box title="Starke Wochentage" sub="Durchschnittliche Einnahmen je Wochentag">
          <Bars values={s.byWeekday} labels={DAYS} every={1} fmt={EUR} />
        </Box>

        <Box title="Beste Uhrzeiten" sub="Calls je Zwei-Stunden-Fenster — je kräftiger, desto mehr">
          <Heat values={s.byHour} labels={HOUR_LABELS} />
        </Box>

        <Box title="Neue und wiederkehrende Fans" sub={`Anteil je ${perLabel}`}>
          <Stack a={s.newFans} b={s.returning} labels={s.labels} every={every} />
          <div className="leg">
            <span><i style={{ background: "var(--brand-grad)" }} />Neu</span>
            <span><i style={{ background: "color-mix(in srgb,var(--orange) 26%, var(--card-2))" }} />Wiederkehrend</span>
          </div>
        </Box>

        <Box title="Bewertungen" sub={`${num(s.ratings.reduce((a, b) => a + b, 0))} Bewertungen insgesamt`}>
          <RatingDist counts={s.ratings} />
        </Box>

        <p className="center muted" style={{ fontSize: 11, marginTop: 4 }}>
          Zahlen aus dem Hauptbuch — dieselbe Quelle wie die Auszahlung im Creator-Studio.
        </p>
      </div>
    </div>
  );
}

function Kpi({ label, value, change }) {
  const up = change >= 0;
  return (
    <div>
      <div className="k">{label}</div>
      <b>{value}</b>
      <span className={`delta ${up ? "up" : "down"}`}>{up ? "▲" : "▼"} {Math.abs(change).toFixed(1).replace(".", ",")} %</span>
    </div>
  );
}

function Box({ title, sub, children }) {
  return (
    <div className="chartbox">
      <div className="ch-t">{title}</div>
      <div className="ch-s">{sub}</div>
      {children}
    </div>
  );
}

/* Tap a bar to read its value — a hover tooltip is useless on a phone. */
function Bars({ values, labels, fmt, every }) {
  const [sel, setSel] = useState(null);
  const max = Math.max(...values, 1);
  return (
    <>
      <div className="bars">
        {values.map((v, i) => (
          <button key={i} className={`b ${sel === i ? "on" : ""}`}
            style={{ height: `${Math.max(2, (v / max) * 100)}%` }}
            aria-label={`${labels[i]}: ${fmt(v)}`}
            onClick={() => setSel(sel === i ? null : i)}>
            {sel === i && <span className="bv">{fmt(v)}</span>}
          </button>
        ))}
      </div>
      <XLab labels={labels} every={every} />
    </>
  );
}

function Stack({ a, b, labels, every }) {
  const max = Math.max(...a.map((v, i) => v + b[i]), 1);
  return (
    <>
      <div className="bars">
        {a.map((v, i) => (
          <div key={i} className="sb" style={{ height: `${Math.max(2, ((v + b[i]) / max) * 100)}%` }}>
            <i className="s2" style={{ flexGrow: b[i] }} />
            <i className="s1" style={{ flexGrow: v }} />
          </div>
        ))}
      </div>
      <XLab labels={labels} every={every} />
    </>
  );
}

const XLab = ({ labels, every }) => (
  <div className="xlab">{labels.map((l, i) => <span key={i}>{i % every === 0 ? l : ""}</span>)}</div>
);

function Donut({ parts }) {
  const total = parts.reduce((s, p) => s + p.amt, 0) || 1;
  const R = 43, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="donutwrap">
      <svg className="donut" viewBox="0 0 100 100" role="img" aria-label="Einnahmen nach Quelle">
        <circle className="dtrack" cx="50" cy="50" r={R} />
        {parts.map((p) => {
          const len = (p.amt / total) * C;
          const seg = <circle key={p.key} cx="50" cy="50" r={R} stroke={p.color}
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} />;
          acc += len;
          return seg;
        })}
      </svg>
      <div className="dlegend">
        {parts.map((p) => (
          <div key={p.key} className="dl">
            <span className="sw" style={{ background: p.color }} />
            <span>{p.label}</span>
            <span className="dv">{EUR(p.amt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Area({ values, labels, every }) {
  const max = Math.max(...values, 1), n = values.length;
  const pts = values.map((v, i) => `${(i / (n - 1)) * 100},${(38 - (v / max) * 34).toFixed(2)}`).join(" ");
  return (
    <>
      <svg className="area" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="Calls im Zeitverlauf">
        <polygon points={`0,40 ${pts} 100,40`} />
        <polyline points={pts} vectorEffect="non-scaling-stroke" />
      </svg>
      <XLab labels={labels} every={every} />
    </>
  );
}

function Heat({ values, labels }) {
  const max = Math.max(...values, 1);
  return (
    <>
      <div className="heat">
        {values.map((v, i) => (
          <i key={i} style={{ opacity: 0.12 + (v / max) * 0.88 }} title={`${labels[i]}–${(+labels[i] + 2) % 24} Uhr: ${v} Calls`} />
        ))}
      </div>
      <XLab labels={labels} every={1} />
    </>
  );
}

function RatingDist({ counts }) {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="rdist">
      {counts.map((c, i) => (
        <div key={i} className="rr">
          <span className="rs">{5 - i} ★</span>
          <span className="bar"><i style={{ width: `${(c / total) * 100}%` }} /></span>
          <span className="rc">{num(c)}</span>
        </div>
      ))}
    </div>
  );
}
