
import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Calculator, HelpCircle, RefreshCw } from "lucide-react";

type VolumeBandKey = "<=1.0" | "1.0–2.0" | "2.0–3.0" | "3.0–3.5" | ">3.5" | "HYB" | "EV";
type AgeBand = "new" | "used";
type EngineKind = "ICE" | "HYBRID" | "ELECTRO";

interface RubricRow { phys: number; legal: number; }
interface AgeTables { new: Record<VolumeBandKey, RubricRow>; used: Record<VolumeBandKey, RubricRow>; }
interface Period {
  id: string;
  name: string;
  start: string;
  end?: string;
  tables: AgeTables;
}

const LS_KEY = "uti-calc-rubles-periods-v3";
const VOLUME_BANDS: VolumeBandKey[] = ["<=1.0","1.0–2.0","2.0–3.0","3.0–3.5",">3.5","HYB","EV"];
const AGE_KEYS: AgeBand[] = ["new","used"];
const ZERO_ROW: RubricRow = { phys: 0, legal: 0 };

function inRange(dateISO: string, startISO: string, endISO?: string) {
  const d = new Date(dateISO);
  const s = new Date(startISO);
  if (Number.isNaN(d.getTime()) || Number.isNaN(s.getTime())) return false;
  if (endISO) {
    const e = new Date(endISO);
    return d >= s && d <= e;
  }
  return d >= s;
}

function pickBandFromVolume(volume: number): VolumeBandKey {
  if (volume <= 1.0) return "<=1.0";
  if (volume <= 2.0) return "1.0–2.0";
  if (volume <= 3.0) return "2.0–3.0";
  if (volume <= 3.5) return "3.0–3.5";
  return ">3.5";
}

function safeRow(period: Period, age: AgeBand, band: VolumeBandKey): RubricRow {
  const r = period?.tables?.[age]?.[band];
  if (!r) return ZERO_ROW;
  return { phys: Number(r.phys)||0, legal: Number(r.legal)||0 };
}

function ensurePeriodShape(p: Period): Period {
  const ensureAge = (ageTable?: Record<VolumeBandKey, RubricRow>) => {
    const out: Record<VolumeBandKey, RubricRow> = {} as any;
    VOLUME_BANDS.forEach((k) => {
      const src = ageTable?.[k];
      out[k] = src ? { phys: Number(src.phys)||0, legal: Number(src.legal)||0 } : { ...ZERO_ROW };
    });
    return out;
  };
  return {
    ...p,
    tables: {
      new: ensureAge(p.tables?.new),
      used: ensureAge(p.tables?.used),
    },
  };
}

function migrate(periods: Period[]): Period[] { return periods.map(ensurePeriodShape); }

function loadPeriods(): Period[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Period[];
      return migrate(parsed);
    }
  } catch {}
  const demo: Period[] = [
    {
      id: "2023-08-01",
      name: "Период A (01.08.2023–30.09.2024)",
      start: "2023-08-01",
      end: "2024-09-30",
      tables: ensurePeriodShape({
        id: "2023-08-01",
        name: "tmp",
        start: "2023-08-01",
        tables: {
          new: {
            "<=1.0": { phys: 3400, legal: 81200 },
            "1.0–2.0": { phys: 3400, legal: 306000 },
            "2.0–3.0": { phys: 3400, legal: 844800 },
            "3.0–3.5": { phys: 970000, legal: 970000 },
            ">3.5": { phys: 1235000, legal: 1235000 },
            HYB: { phys: 3400, legal: 360000 },
            EV:  { phys: 3400, legal: 360000 },
          },
          used: {
            "<=1.0": { phys: 5200, legal: 207200 },
            "1.0–2.0": { phys: 5200, legal: 528800 },
            "2.0–3.0": { phys: 5200, legal: 980400 },
            "3.0–3.5": { phys: 1459000, legal: 1459000 },
            ">3.5": { phys: 1623800, legal: 1623800 },
            HYB: { phys: 5200, legal: 122000 },
            EV:  { phys: 5200, legal: 122000 },
          },
        },
      } as Period).tables,
    },
    {
      id: "2024-10-01",
      name: "Период B (01.10.2024–31.12.2024)",
      start: "2024-10-01",
      end: "2024-12-31",
      tables: ensurePeriodShape({
        id: "2024-10-01",
        name: "tmp",
        start: "2024-10-01",
        tables: {
          new: {
            "<=1.0": { phys: 3400, legal: 150200 },
            "1.0–2.0": { phys: 3400, legal: 556200 },
            "2.0–3.0": { phys: 3400, legal: 1562800 },
            "3.0–3.5": { phys: 3400, legal: 1794600 },
            ">3.5": { phys: 3400, legal: 2285200 },
            HYB: { phys: 32604, legal: 32604 },
            EV:  { phys: 32604, legal: 32604 },
          },
          used: {
            "<=1.0": { phys: 5200, legal: 383400 },
            "1.0–2.0": { phys: 5200, legal: 978200 },
            "2.0–3.0": { phys: 5200, legal: 2366200 },
            "3.0–3.5": { phys: 5200, legal: 2747200 },
            ">3.5": { phys: 5200, legal: 3004000 },
            HYB: { phys: 122000, legal: 122000 },
            EV:  { phys: 122000, legal: 122000 },
          },
        },
      } as Period).tables,
    },
    {
      id: "2025-01-01",
      name: "Период C (с 01.01.2025)",
      start: "2025-01-01",
      tables: ensurePeriodShape({
        id: "2025-01-01",
        name: "tmp",
        start: "2025-01-01",
        tables: {
          new: {
            "<=1.0": { phys: 3400, legal: 180200 },
            "1.0–2.0": { phys: 3400, legal: 667400 },
            "2.0–3.0": { phys: 3400, legal: 1875000 },
            "3.0–3.5": { phys: 3400, legal: 2153400 },
            ">3.5": { phys: 3400, legal: 2742200 },
            HYB: { phys: 667000, legal: 667000 },
            EV:  { phys: 667000, legal: 667000 },
          },
          used: {
            "<=1.0": { phys: 5200, legal: 460000 },
            "1.0–2.0": { phys: 5200, legal: 1174000 },
            "2.0–3.0": { phys: 5200, legal: 2839400 },
            "3.0–3.5": { phys: 5200, legal: 3296800 },
            ">3.5": { phys: 5200, legal: 3604800 },
            HYB: { phys: 1174000, legal: 1174000 },
            EV:  { phys: 1174000, legal: 1174000 },
          },
        },
      } as Period).tables,
    },
  ];
  return demo;
}

function savePeriods(periods: Period[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(periods));
}

export default function UtilFeeApp() {
  const [periods, setPeriods] = useState<Period[]>(loadPeriods());
  const [date, setDate] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [age, setAge] = useState<AgeBand>("new");
  const [engine, setEngine] = useState<EngineKind>("ICE");
  const [hybridAsElectro, setHybridAsElectro] = useState<boolean>(true);

  useEffect(() => savePeriods(periods), [periods]);

  const activePeriod = useMemo(() => {
    if (!date) return undefined;
    return periods.find((p) => inRange(date, p.start, p.end));
  }, [date, periods]);

  const band: VolumeBandKey | undefined = useMemo(() => {
    if (engine === "ELECTRO") return "EV";
    if (engine === "HYBRID") {
      if (hybridAsElectro) return "EV";
      const v = parseFloat(volume.replace(",", "."));
      if (!Number.isFinite(v)) return undefined;
      return pickBandFromVolume(v);
    }
    const v = parseFloat(volume.replace(",", "."));
    if (!Number.isFinite(v)) return undefined;
    return pickBandFromVolume(v);
  }, [volume, engine, hybridAsElectro]);

  const result = useMemo(() => {
    if (!activePeriod || !band) return null;
    const base = safeRow(activePeriod, age, band);
    let phys = base.phys;
    let comm = base.legal;

    const is2025plus = new Date(activePeriod.start) >= new Date("2025-01-01");
    if (engine === "HYBRID" && is2025plus) {
      if (hybridAsElectro) {
        phys = Math.max(phys, age === "new" ? 3400 : 5200);
        comm = Math.max(comm, age === "new" ? 667000 : 1174000);
      } else {
        phys = Math.max(phys, age === "new" ? 3400 : 5200);
        if (age === "used") comm = Math.max(comm, 1174000);
        if (age === "new" && band === "2.0–3.0") comm = Math.max(comm, 1875000);
      }
    }

    return { pref: phys, comm, diff: comm - phys, band, periodName: activePeriod.name };
  }, [activePeriod, band, age, engine, hybridAsElectro]);

  const addPeriod = () => {
    const emptyAge = VOLUME_BANDS.reduce((acc, k) => ({ ...acc, [k]: { ...ZERO_ROW } }), {} as Record<VolumeBandKey, RubricRow>);
    const newP: Period = {
      id: String(Date.now()),
      name: "Новый период",
      start: new Date().toISOString().slice(0, 10),
      tables: { new: { ...emptyAge }, used: { ...emptyAge } },
    };
    setPeriods((p) => [newP, ...p]);
  };

  const removePeriod = (id: string) => setPeriods((p) => p.filter((x) => x.id !== id));

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(periods, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "uti_periods_rubles.json";
    a.click();
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Period[];
        setPeriods(migrate(parsed));
      } catch (e) {
        alert("Не удалось импортировать JSON: " + (e as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    localStorage.removeItem(LS_KEY);
    setPeriods(loadPeriods());
  };

  const presets: Array<{label:string; date:string; engine:EngineKind; age:AgeBand; volume?:string; hybridAsElectro?: boolean}> = [
    { label: "Новый ДВС 1.6л (2025)", date: "2025-02-01", engine: "ICE", age: "new", volume: "1.6" },
    { label: "Новый Электро (2025)", date: "2025-03-01", engine: "ELECTRO", age: "new" },
    { label: "Новый гибрид = электро (2025)", date: "2025-03-15", engine: "HYBRID", age: "new", hybridAsElectro: true },
    { label: "Новый гибрид НЕ-электро 2.5л (2025)", date: "2025-05-10", engine: "HYBRID", age: "new", volume: "2.5", hybridAsElectro: false },
    { label: "Б/у гибрид НЕ-электро (2025)", date: "2025-06-20", engine: "HYBRID", age: "used", volume: "2.0", hybridAsElectro: false },
    { label: "Б/у ДВС 2.4л (2023)", date: "2023-09-15", engine: "ICE", age: "used", volume: "2.4" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Calculator className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Калькулятор утильсбора (льготный/коммерческий)</h1>
      </div>

      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6 grid md:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Дата получения ЭПТС</label>
            <input type="date" value={date} onChange={(e)=> setDate(e.target.value)} className="border rounded-2xl p-2" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Возраст авто</label>
            <select value={age} onChange={(e)=> setAge(e.target.value as AgeBand)} className="border rounded-2xl p-2">
              <option value="new">Новый (&lt; 3 лет)</option>
              <option value="used">С пробегом (&gt; 3 лет)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Тип мотора</label>
            <select value={engine} onChange={(e)=> setEngine(e.target.value as EngineKind)} className="border rounded-2xl p-2">
              <option value="ICE">Бензин/Дизель (ДВС)</option>
              <option value="HYBRID">Гибрид</option>
              <option value="ELECTRO">Электро</option>
            </select>
          </div>
          {engine === "HYBRID" && (
            <div className="flex items-end gap-2">
              <label className="text-sm text-gray-600">
                <input type="checkbox" className="mr-2" checked={hybridAsElectro} onChange={(e)=> setHybridAsElectro(e.target.checked)} />
                Гибрид = «электрокатегория» (последовательный HEV/PHEV)
              </label>
            </div>
          )}
          {(engine === "ICE" || (engine === "HYBRID" && !hybridAsElectro)) && (
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Объём двигателя, л</label>
              <input type="text" placeholder="например, 1.6" value={volume} onChange={(e)=> setVolume(e.target.value)} className="border rounded-2xl p-2" />
            </div>
          )}
          <div className="flex items-end gap-2">
            <Button onClick={addPeriod} variant="secondary">Добавить период</Button>
            <Button onClick={exportJSON}><Download className="w-4 h-4 mr-1"/>Экспорт</Button>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="file" accept="application/json" className="hidden" onChange={(e)=> e.target.files && importJSON(e.target.files[0])} />
              <span className="inline-flex items-center text-sm border rounded-2xl px-3 py-2"><Upload className="w-4 h-4 mr-1"/>Импорт</span>
            </label>
            <Button variant="outline" onClick={resetData} title="Сбросить к демо-данным"><RefreshCw className="w-4 h-4 mr-1"/>Сброс</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((p)=> (
          <Button key={p.label} variant="outline" onClick={()=>{ setDate(p.date); setEngine(p.engine); setAge(p.age); setVolume(p.volume || ""); setHybridAsElectro(p.hybridAsElectro ?? true); }}>{p.label}</Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Результат расчёта</h2>
            {!date ? (
              <p className="text-gray-600">Укажите дату ЭПТС.</p>
            ) : !activePeriod ? (
              <p className="text-red-600">Для выбранной даты не найден период. Проверьте таблицы.</p>
            ) : (engine === "ICE" || (engine === "HYBRID" && !hybridAsElectro)) && (!volume || !/^[0-9]+([\\.,][0-9]+)?$/.test(volume)) ? (
              <p className="text-red-600">Введите корректный объём двигателя.</p>
            ) : !band ? (
              <p className="text-red-600">Не удалось определить диапазон.</p>
            ) : (
              <div className="grid gap-2 text-base">
                <div className="text-sm text-gray-600">Период: <span className="font-medium">{result!.periodName}</span></div>
                <div className="text-sm text-gray-600">Возраст: <span className="font-medium">{age === "new" ? "Новый (<3 лет)" : "С пробегом (>3 лет)"}</span></div>
                <div className="text-sm text-gray-600">Тип мотора: <span className="font-medium">{engine === "ICE" ? "Бензин/Дизель (ДВС)" : engine === "HYBRID" ? "Гибрид" : "Электро"}</span></div>
                <div className="text-sm text-gray-600">Диапазон: <span className="font-medium">{band === "EV" ? "Электро" : band === "HYB" ? "Гибрид" : band}</span></div>
                <div>Льготный (физлица): <b>{result!.pref.toLocaleString()} ₽</b></div>
                <div>Коммерческий (юрлица): <b>{result!.comm.toLocaleString()} ₽</b></div>
                <div className="mt-2">Разница (комм. − льгот.): <b>{(result!.diff).toLocaleString()} ₽</b></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Как это работает</h2>
            <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
              <li>По дате ЭПТС выбирается актуальный период ставок.</li>
              <li>Укажите возраст и тип мотора. Для ДВС (и гибрида вне «электро») введите объём — подберём диапазон.</li>
              <li>Ставки берутся из таблиц ниже. Для гибридов 2025 применяются подтверждённые минимумы.</li>
            </ol>
            <div className="mt-4 text-sm text-gray-600 flex gap-2 items-start"><HelpCircle className="w-4 h-4 mt-0.5"/>Все значения редактируются ниже и сохраняются в браузере. Доступен импорт/экспорт JSON.</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Таблицы ставок (руб.) по периодам</h2>
          <div className="space-y-6">
            {periods.map((p) => (
              <div key={p.id} className="border rounded-2xl p-4">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <input className="border rounded-2xl p-2 w-64" value={p.name} onChange={(e)=> setPeriods(arr=> arr.map(x=> x.id===p.id?{...x, name:e.target.value}:x))} />
                  <label className="text-sm text-gray-600">Начало
                    <input type="date" className="border rounded-2xl p-2 ml-2" value={p.start} onChange={(e)=> setPeriods(arr=> arr.map(x=> x.id===p.id?{...x, start:e.target.value}:x))} />
                  </label>
                  <label className="text-sm text-gray-600">Окончание
                    <input type="date" className="border rounded-2xl p-2 ml-2" value={p.end || ""} onChange={(e)=> setPeriods(arr=> arr.map(x=> x.id===p.id?{...x, end:e.target.value || undefined}:x))} />
                  </label>
                  <Button variant="destructive" onClick={()=> removePeriod(p.id)}>Удалить период</Button>
                </div>

                {AGE_KEYS.map((ageKey) => (
                  <div key={ageKey} className="mb-4">
                    <div className="font-medium mb-2">{ageKey === "new" ? "Новый (<3 лет)" : "С пробегом (>3 лет)"}</div>
                    <div className="overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="py-2 pr-4">Диапазон / тип</th>
                            <th className="py-2 pr-4">Физлица (льготный), ₽</th>
                            <th className="py-2 pr-4">Юрлица (коммерческий), ₽</th>
                          </tr>
                        </thead>
                        <tbody>
                          {VOLUME_BANDS.map((bandKey) => (
                            <tr key={bandKey} className="border-b last:border-0">
                              <td className="py-2 pr-4 font-medium">{bandKey === "EV" ? "Электро" : bandKey === "HYB" ? "Гибрид" : bandKey}</td>
                              <td className="py-2 pr-4">
                                <input
                                  type="number"
                                  className="border rounded-2xl p-2 w-40"
                                  value={p.tables?.[ageKey]?.[bandKey]?.phys ?? 0}
                                  onChange={(e)=>{
                                    const val = Number(e.target.value) || 0;
                                    setPeriods(arr=> arr.map(x=> {
                                      if (x.id !== p.id) return x;
                                      const tables = { ...(x.tables||{}) } as any;
                                      const ageTable = { ...(tables[ageKey]||{}) } as Record<string, RubricRow>;
                                      const cell = { ...(ageTable[bandKey] || ZERO_ROW), phys: val };
                                      ageTable[bandKey] = cell;
                                      tables[ageKey] = ageTable;
                                      return { ...x, tables };
                                    }));
                                  }}
                                />
                              </td>
                              <td className="py-2 pr-4">
                                <input
                                  type="number"
                                  className="border rounded-2xl p-2 w-40"
                                  value={p.tables?.[ageKey]?.[bandKey]?.legal ?? 0}
                                  onChange={(e)=>{
                                    const val = Number(e.target.value) || 0;
                                    setPeriods(arr=> arr.map(x=> {
                                      if (x.id !== p.id) return x;
                                      const tables = { ...(x.tables||{}) } as any;
                                      const ageTable = { ...(tables[ageKey]||{}) } as Record<string, RubricRow>;
                                      const cell = { ...(ageTable[bandKey] || ZERO_ROW), legal: val };
                                      ageTable[bandKey] = cell;
                                      tables[ageKey] = ageTable;
                                      return { ...x, tables };
                                    }));
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 mt-6">
        Примечание: инструмент вспомогательный. Перед применением сверяйте ставки с действующими НПА. При необходимости используйте импорт/экспорт JSON.
      </div>
    </div>
  );
}
