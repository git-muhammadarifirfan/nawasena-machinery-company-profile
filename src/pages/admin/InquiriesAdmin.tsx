import React, { useEffect, useState } from "react";
import { Card, CardBody } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { adminListInquiries } from "../../lib/db";
import type { Inquiry } from "../../lib/types";
import { rupiah } from "../../ui/format";
import { useToast } from "../../ui/Toast";

export default function InquiriesAdmin() {
  const toast = useToast();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems(await adminListInquiries());
    } catch (err: any) {
      toast.push({ kind: "err", title: "Gagal memuat", desc: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Inquiry (Form masuk)</div>
          <Button variant="ghost" className="h-9" onClick={load}>Refresh</Button>
        </div>

        {loading ? (
          <div className="mt-4 text-white/60">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="mt-4 text-white/60">Belum ada inquiry.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {items.map((x) => (
              <div key={x.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm font-semibold">{x.customer_name} <span className="text-white/50 text-xs">({x.whatsapp})</span></div>
                  <div className="text-xs text-white/50">{x.created_at ? new Date(x.created_at).toLocaleString("id-ID") : ""}</div>
                </div>
                <div className="mt-1 text-xs text-white/70">
                  <span className="text-white/50">Usaha:</span> {x.business_name || "-"} &nbsp;•&nbsp;
                  <span className="text-white/50">Lokasi:</span> {x.location}
                </div>
                {x.notes ? <div className="mt-2 text-xs text-white/70"><span className="text-white/50">Catatan:</span> {x.notes}</div> : null}

                <div className="mt-3 space-y-1 text-sm">
                  {x.items?.map((it) => (
                    <div key={it.id} className="flex items-start justify-between border-b border-white/10 pb-1 text-xs">
                      <div>{it.title} <span className="text-white/50">(x{it.qty})</span></div>
                      <div className="text-white/70">{rupiah(Number(it.price) * it.qty)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
