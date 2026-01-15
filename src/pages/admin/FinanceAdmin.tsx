import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { adminListPaidInquiries } from "../../lib/db";
import type { Inquiry } from "../../lib/types";
import { clsx, rupiah } from "../../ui/format";
import { useToast } from "../../ui/Toast";
import {
  CalendarDays,
  CreditCard,
  TrendingUp,
  Wallet,
  Sparkles,
  Users,
  BadgeCheck,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ListChecks,
  Clock,
} from "lucide-react";

function startOfDayISO(dateStr: string) {
  if (!dateStr) return undefined;
  const d = new Date(dateStr + "T00:00:00");
  return d.toISOString();
}

function endOfDayISO(dateStr: string) {
  if (!dateStr) return undefined;
  const d = new Date(dateStr + "T23:59:59.999");
  return d.toISOString();
}

function totalOf(x: Inquiry) {
  return (x.items ?? []).reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
}

function dayKey(dateLike: string | Date) {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function fmtDayLabel(yyyyMmDd: string) {
  const d = new Date(yyyyMmDd + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function fmtFullDay(yyyyMmDd: string) {
  const d = new Date(yyyyMmDd + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function nnum(v: any) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function median(nums: number[]) {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2);
}

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn";
}) {
  const toneCls =
    tone === "ok"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
      : tone === "warn"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
      : "border-white/10 bg-white/5 text-white/70";
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs", toneCls)}>
      {children}
    </span>
  );
}

function Panel({
  title,
  subtitle,
  icon,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-start gap-3 min-w-0">
          {icon ? (
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/20 text-white/80 shrink-0">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{title}</div>
            {subtitle ? <div className="mt-0.5 text-xs text-white/55">{subtitle}</div> : null}
          </div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent = "emerald",
  footer,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: "emerald" | "blue" | "violet" | "amber";
  footer?: React.ReactNode;
}) {
  const accentMap: Record<string, string> = {
    emerald:
      "bg-[radial-gradient(600px_circle_at_25%_20%,rgba(16,185,129,.25),transparent_55%)] border-emerald-500/15",
    blue: "bg-[radial-gradient(600px_circle_at_25%_20%,rgba(59,130,246,.22),transparent_55%)] border-blue-500/15",
    violet:
      "bg-[radial-gradient(600px_circle_at_25%_20%,rgba(139,92,246,.22),transparent_55%)] border-violet-500/15",
    amber:
      "bg-[radial-gradient(600px_circle_at_25%_20%,rgba(245,158,11,.22),transparent_55%)] border-amber-500/15",
  };

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-3xl border bg-white/5 p-5",
        "shadow-[0_20px_60px_-45px_rgba(0,0,0,.9)]",
        accentMap[accent] ?? accentMap.emerald
      )}
    >
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-white/55">{title}</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-white">{value}</div>
          {subtitle ? <div className="mt-1 text-xs text-white/50">{subtitle}</div> : null}
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/20 text-white/80">
          {icon}
        </div>
      </div>

      {footer ? <div className="relative mt-4 border-t border-white/10 pt-3 text-xs text-white/60">{footer}</div> : null}
    </div>
  );
}

function MiniBars({
  data,
}: {
  data: Array<{ label: string; value: number; fullLabel?: string }>;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const sum = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Trend 14 hari</div>
          <div className="mt-1 text-xs text-white/60">
            Ringkas pemasukan per hari (total {rupiah(sum)}).
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
          <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
          Insights
        </div>
      </div>

      <div className="mt-5 grid grid-cols-14 gap-1.5 items-end">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              title={`${d.fullLabel ?? d.label}: ${rupiah(d.value)}`}
              className={clsx(
                "w-full rounded-xl border border-white/10 bg-white/5",
                "hover:bg-white/10 transition"
              )}
              style={{
                height: `${Math.max(10, Math.round((d.value / max) * 92))}px`,
              }}
            />
            <div className="text-[10px] text-white/45">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekdayBars({ values }: { values: Array<{ name: string; value: number }> }) {
  const max = Math.max(1, ...values.map((x) => x.value));
  return (
    <div className="grid gap-2">
      {values.map((x) => (
        <div key={x.name} className="grid grid-cols-[84px_1fr_auto] items-center gap-3">
          <div className="text-xs text-white/60">{x.name}</div>
          <div className="h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-white/20"
              style={{ width: `${Math.max(4, Math.round((x.value / max) * 100))}%` }}
            />
          </div>
          <div className="text-xs text-white/70 tabular-nums">{rupiah(x.value)}</div>
        </div>
      ))}
    </div>
  );
}

export default function FinanceAdmin() {
  const toast = useToast();
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  // default: last 30 days
  const today = new Date();
  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [from, setFrom] = useState<string>(() => d30.toISOString().slice(0, 10));
  const [to, setTo] = useState<string>(() => today.toISOString().slice(0, 10));

  function setRangeDays(days: number) {
    const t = new Date();
    const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setFrom(d.toISOString().slice(0, 10));
    setTo(t.toISOString().slice(0, 10));
  }

  async function load() {
    setLoading(true);
    try {
      const data = await adminListPaidInquiries({
        from: startOfDayISO(from),
        to: endOfDayISO(to),
      });
      setRows(data);
    } catch (err: any) {
      toast.push({ kind: "err", title: "Gagal memuat keuangan", desc: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const report = useMemo(() => {
    const totals = rows.map((x) => totalOf(x));
    const total = totals.reduce((s, v) => s + v, 0);
    const count = rows.length;
    const avg = count ? Math.round(total / count) : 0;
    const med = median(totals);
    const minTx = totals.length ? Math.min(...totals) : 0;
    const maxTx = totals.length ? Math.max(...totals) : 0;

    const byDay = new Map<string, number>();
    const byWeekday = new Map<number, number>(); // 0=Sun
    const byCustomer = new Map<string, { name: string; phone: string; tx: number; total: number }>();

    for (const r of rows) {
      const t = totalOf(r);

      // day group
      const dk = r.created_at ? dayKey(r.created_at) : "";
      if (dk) byDay.set(dk, (byDay.get(dk) ?? 0) + t);

      // weekday
      if (r.created_at) {
        const d = new Date(r.created_at);
        const wd = d.getDay();
        byWeekday.set(wd, (byWeekday.get(wd) ?? 0) + t);
      }

      // customer
      const key = `${(r.customer_name ?? "").trim()}|${(r.whatsapp ?? "").trim()}`;
      if (key.trim() !== "|") {
        const prev = byCustomer.get(key);
        if (prev) {
          prev.tx += 1;
          prev.total += t;
        } else {
          byCustomer.set(key, { name: r.customer_name ?? "-", phone: r.whatsapp ?? "-", tx: 1, total: t });
        }
      }
    }

    // best day
    let bestDay = "";
    let bestValue = 0;
    for (const [k, v] of byDay.entries()) {
      if (v > bestValue) {
        bestValue = v;
        bestDay = k;
      }
    }

    // last 14 days bars
    const bars: Array<{ label: string; value: number; fullLabel: string }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dayKey(d);
      const v = byDay.get(k) ?? 0;
      bars.push({ label: fmtDayLabel(k), value: v, fullLabel: fmtFullDay(k) });
    }

    // compare last 7 days vs previous 7 days (still within whatever rows we have; best-effort)
    const sumRange = (startOffset: number, endOffset: number) => {
      let s = 0;
      for (let i = startOffset; i <= endOffset; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = dayKey(d);
        s += byDay.get(k) ?? 0;
      }
      return s;
    };
    const last7 = sumRange(0, 6);
    const prev7 = sumRange(7, 13);

    const uniqueCustomers = byCustomer.size;
    const repeatCustomers = Array.from(byCustomer.values()).filter((x) => x.tx >= 2).length;

    const topCustomers = Array.from(byCustomer.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    const wdNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const weekdayValues = wdNames.map((name, idx) => ({ name, value: byWeekday.get(idx) ?? 0 }));

    // busiest hour (optional)
    const byHour = new Map<number, number>();
    for (const r of rows) {
      if (!r.created_at) continue;
      const d = new Date(r.created_at);
      const h = d.getHours();
      byHour.set(h, (byHour.get(h) ?? 0) + totalOf(r));
    }
    let bestHour = -1;
    let bestHourValue = 0;
    for (const [h, v] of byHour.entries()) {
      if (v > bestHourValue) {
        bestHourValue = v;
        bestHour = h;
      }
    }

    return {
      total,
      count,
      avg,
      med,
      minTx,
      maxTx,
      bestDay,
      bestValue,
      bars,
      last7,
      prev7,
      uniqueCustomers,
      repeatCustomers,
      topCustomers,
      weekdayValues,
      bestHour,
      bestHourValue,
    };
  }, [rows]);

  const delta7 = report.last7 - report.prev7;
  const delta7Pct = report.prev7 ? Math.round((delta7 / report.prev7) * 100) : 0;

  return (
    <Card>
      <CardBody>
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/20 text-white/80">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Keuangan (Paid)</div>
                  <div className="mt-0.5 text-xs text-white/60">
                    Data diambil dari inquiry yang statusnya{" "}
                    <span className="text-white/85 font-semibold">PAID</span>.
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Chip tone="ok">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Paid only
                </Chip>
                <Chip>
                  <ListChecks className="h-3.5 w-3.5" />
                  {loading ? "Memuat…" : `${report.count} transaksi`}
                </Chip>
                <Chip>
                  <Users className="h-3.5 w-3.5" />
                  {loading ? "—" : `${report.uniqueCustomers} pelanggan`}
                </Chip>
                {report.bestHour >= 0 ? (
                  <Chip tone="neutral">
                    <Clock className="h-3.5 w-3.5" />
                    Jam rame: {String(report.bestHour).padStart(2, "0")}:00 ({rupiah(report.bestHourValue)})
                  </Chip>
                ) : null}
              </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" className="h-9" onClick={() => setRangeDays(7)} disabled={loading}>
                  7 hari
                </Button>
                <Button variant="ghost" className="h-9" onClick={() => setRangeDays(30)} disabled={loading}>
                  30 hari
                </Button>
                <Button variant="ghost" className="h-9" onClick={() => setRangeDays(90)} disabled={loading}>
                  90 hari
                </Button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="grid gap-1">
                  <div className="text-[11px] text-white/50">Dari</div>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <div className="text-[11px] text-white/50">Sampai</div>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <Button className="h-10" onClick={load} disabled={loading}>
                  {loading ? "Memuat…" : "Terapkan"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Pemasukan"
            value={rupiah(report.total)}
            subtitle="Akumulasi PAID (range terpilih)"
            accent="emerald"
            icon={<Wallet className="h-5 w-5" />}
            footer={
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/55">7 hari terakhir</span>
                <span className="text-white/80 font-semibold">{rupiah(report.last7)}</span>
              </div>
            }
          />

          <StatCard
            title="Jumlah Transaksi"
            value={String(report.count)}
            subtitle="Total inquiry paid"
            accent="blue"
            icon={<CreditCard className="h-5 w-5" />}
            footer={
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/55">Repeat customer</span>
                <span className="text-white/80 font-semibold">
                  {report.uniqueCustomers ? `${pct(report.repeatCustomers, report.uniqueCustomers)}%` : "0%"}{" "}
                  <span className="text-white/50 font-normal">
                    ({report.repeatCustomers}/{report.uniqueCustomers})
                  </span>
                </span>
              </div>
            }
          />

          <StatCard
            title="Rata-rata / Transaksi"
            value={rupiah(report.avg)}
            subtitle="Mean & median (lebih stabil)"
            accent="violet"
            icon={<TrendingUp className="h-5 w-5" />}
            footer={
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/55">Median</span>
                <span className="text-white/80 font-semibold">{rupiah(report.med)}</span>
              </div>
            }
          />

          <StatCard
            title="Best Day"
            value={report.bestDay ? fmtDayLabel(report.bestDay) : "-"}
            subtitle={report.bestDay ? `Pemasukan: ${rupiah(report.bestValue)}` : "Belum ada data"}
            accent="amber"
            icon={<CalendarDays className="h-5 w-5" />}
            footer={
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/55">Min / Max transaksi</span>
                <span className="text-white/80 font-semibold">
                  {rupiah(report.minTx)}{" "}
                  <span className="text-white/35 font-normal">/</span> {rupiah(report.maxTx)}
                </span>
              </div>
            }
          />
        </div>

        {/* ANALYTICS */}
        <div className="mt-3 grid gap-3 lg:grid-cols-[1.25fr_.75fr]">
          <MiniBars data={report.bars} />

          <Panel
            title="Ringkasan Mingguan"
            subtitle="Bandingkan 7 hari terakhir vs 7 hari sebelumnya."
            icon={<Sparkles className="h-5 w-5" />}
            right={
              <Chip tone={delta7 >= 0 ? "ok" : "warn"}>
                {delta7 >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {report.prev7 ? `${delta7Pct}%` : "—"}
              </Chip>
            }
          >
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/55">7 hari terakhir</div>
                  <div className="mt-1 text-lg font-semibold text-white">{rupiah(report.last7)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/55">7 hari sebelumnya</div>
                  <div className="mt-1 text-lg font-semibold text-white">{rupiah(report.prev7)}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60 mb-2">Pola pemasukan per hari (weekday)</div>
                <WeekdayBars values={report.weekdayValues} />
              </div>
            </div>
          </Panel>
        </div>

        {/* TOP CUSTOMERS */}
        <div className="mt-3">
          <Panel
            title="Top Pelanggan"
            subtitle="Pelanggan dengan total belanja terbesar pada rentang ini."
            icon={<Users className="h-5 w-5" />}
          >
            {loading ? (
              <div className="text-white/60">Memuat…</div>
            ) : report.topCustomers.length === 0 ? (
              <div className="text-white/60">Belum ada data.</div>
            ) : (
              <div className="grid gap-2">
                {report.topCustomers.map((c, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {c.name} <span className="text-white/45 text-xs">({c.phone})</span>
                      </div>
                      <div className="mt-0.5 text-xs text-white/55">
                        {c.tx} transaksi • rata-rata {rupiah(Math.round(c.total / Math.max(1, c.tx)))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-white/50">Total</div>
                      <div className="text-sm font-semibold text-white tabular-nums">{rupiah(c.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* LIST */}
        <div className="mt-3">
          <Panel
            title="Daftar Transaksi"
            subtitle="Klik Detail untuk melihat item pembelian."
            icon={<ListChecks className="h-5 w-5" />}
            right={
              <Chip>
                {from} → {to}
              </Chip>
            }
          >
            {loading ? (
              <div className="text-white/60">Memuat…</div>
            ) : rows.length === 0 ? (
              <div className="text-white/60">Belum ada data paid di rentang tanggal ini.</div>
            ) : (
              <div className="space-y-3">
                {rows.map((x) => {
                  const t = totalOf(x);
                  const opened = openId === x.id;

                  return (
                    <div key={x.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">
                            {x.customer_name}{" "}
                            <span className="text-white/50 text-xs">({x.whatsapp})</span>
                          </div>
                          <div className="mt-1 text-xs text-white/60">
                            {x.created_at ? new Date(x.created_at).toLocaleString("id-ID") : ""}{" "}
                            <span className="text-white/35">•</span>{" "}
                            <span className="text-white/50">Lokasi:</span> {x.location}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {x.business_name ? <Chip>{x.business_name}</Chip> : <Chip tone="neutral">Tanpa nama usaha</Chip>}
                            <Chip tone="ok">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              PAID
                            </Chip>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          <div className="text-right">
                            <div className="text-[11px] text-white/50">Total</div>
                            <div className="text-sm font-semibold text-white tabular-nums">{rupiah(t)}</div>
                          </div>
                          <Button
                            variant="ghost"
                            className={clsx("h-9", opened ? "bg-white/10" : "")}
                            onClick={() => setOpenId(opened ? null : x.id)}
                          >
                            {opened ? "Tutup" : "Detail"}
                          </Button>
                        </div>
                      </div>

                      {opened ? (
                        <div className="mt-4 grid gap-3">
                          {x.notes ? (
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <div className="text-[11px] text-white/50">Catatan</div>
                              <div className="mt-1 text-xs text-white/80 whitespace-pre-wrap">{x.notes}</div>
                            </div>
                          ) : null}

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-white">Rincian Item</div>
                                <div className="mt-0.5 text-xs text-white/55">
                                  {nnum(x.items?.length)} item • total {rupiah(t)}
                                </div>
                              </div>
                              <Chip>
                                {x.created_at ? dayKey(x.created_at) : ""}
                              </Chip>
                            </div>

                            <div className="mt-3 divide-y divide-white/10">
                              {(x.items ?? []).map((it) => {
                                const sub = nnum(it.price) * nnum(it.qty);
                                return (
                                  <div
                                    key={it.id}
                                    className="py-2 flex items-start justify-between gap-3 text-xs"
                                  >
                                    <div className="min-w-0">
                                      <div className="text-white/90 truncate">
                                        {it.title}{" "}
                                        <span className="text-white/45">(x{it.qty})</span>
                                      </div>
                                      <div className="mt-0.5 text-white/50">
                                        {rupiah(nnum(it.price))} / item
                                      </div>
                                    </div>
                                    <div className="text-white/80 tabular-nums">{rupiah(sub)}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>
      </CardBody>
    </Card>
  );
}
