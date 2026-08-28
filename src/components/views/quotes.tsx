"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ViewHeader, SectionCard, EmptyState } from "@/components/shared/view-parts";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Download,
  Share2,
  PenLine,
  RotateCcw,
  Check,
  CheckCircle2,
  Loader2,
  Printer,
  Wrench,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/nav-config";

type Item = {
  id: string;
  description: string;
  type: "service" | "part";
  quantity: number;
  unitPrice: number;
  total: number;
};

type Customer = { id: string; name: string; phone?: string; whatsapp?: string; document?: string; address?: string };

export function Quotes() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form state
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<Item[]>([
    { id: "1", description: "Mão de obra - diagnóstico", type: "service", quantity: 1, unitPrice: 80, total: 80 },
  ]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("Garantia de 90 dias no serviço executado.");
  const [signature, setSignature] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/customers?take=200")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) ? setCustomers(d) : setCustomers(d.customers || []))
      .catch(() => {});
    refreshQuotes();
  }, []);

  const refreshQuotes = () => {
    setLoadingList(true);
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) ? setSavedQuotes(d) : setSavedQuotes([]))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Approve a saved quote — calls PUT /api/quotes/[id] with status: "approved".
  // The backend creates a ServiceOrder linked to this quote (idempotent — safe to call again).
  const approveQuote = async (quoteId: string, quoteNumber: string) => {
    setApprovingId(quoteId);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // The backend returns _serviceOrder info
      const so = data._serviceOrder;
      if (so?.created) {
        toast.success(
          `Orçamento ${quoteNumber} aprovado! OS ${so.serviceOrderNumber} criada automaticamente.`,
          { duration: 6000 }
        );
      } else if (so && !so.created) {
        toast.info(
          `Orçamento ${quoteNumber} aprovado. OS ${so.serviceOrderNumber} já existia.`,
          { duration: 5000 }
        );
      } else {
        toast.success(`Orçamento ${quoteNumber} aprovado!`);
      }
      refreshQuotes();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao aprovar orçamento");
    } finally {
      setApprovingId(null);
    }
  };

  const laborTotal = items
    .filter((i) => i.type === "service")
    .reduce((s, i) => s + i.total, 0);
  const partsTotal = items
    .filter((i) => i.type === "part")
    .reduce((s, i) => s + i.total, 0);
  const subtotal = laborTotal + partsTotal;
  const taxAmount = (subtotal * taxPercent) / 100;
  const total = subtotal + taxAmount - discount;

  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems((arr) =>
      arr.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
        return updated;
      })
    );
  };

  const addItem = () =>
    setItems((a) => [
      ...a,
      { id: crypto.randomUUID(), description: "", type: "service", quantity: 1, unitPrice: 0, total: 0 },
    ]);

  const removeItem = (id: string) =>
    setItems((a) => a.filter((i) => i.id !== id));

  const save = async (status: "draft" | "sent" = "draft") => {
    if (!customerId) {
      toast.error("Selecione um cliente");
      return;
    }
    if (items.length === 0 || items.every((i) => !i.description)) {
      toast.error("Adicione ao menos um item");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          items: items.filter((i) => i.description),
          laborTotal,
          partsTotal,
          taxPercent,
          discount,
          total,
          status,
          notes,
          signature,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(`Orçamento ${data.number} salvo como ${status === "draft" ? "rascunho" : "enviado"}!`);
      refreshQuotes();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const generatePDF = (quote?: any) => {
    const c = selectedCustomer;
    const its = quote ? JSON.parse(quote.items || "[]") : items;
    const lab = quote ? quote.laborTotal : laborTotal;
    const pts = quote ? quote.partsTotal : partsTotal;
    const tx = quote ? quote.taxPercent : taxPercent;
    const dsc = quote ? quote.discount : discount;
    const t = quote ? quote.total : total;
    const n = quote ? quote.notes : notes;
    const sig = quote ? quote.signature : signature;
    const num = quote?.number || "PRÉ-VISUALIZAÇÃO";
    const date = quote?.createdAt ? new Date(quote.createdAt).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR");

    const html = buildQuoteHTML({
      number: num,
      date,
      customer: c,
      items: its,
      laborTotal: lab,
      partsTotal: pts,
      taxPercent: tx,
      discount: dsc,
      total: t,
      notes: n,
      signature: sig,
    });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
      toast.error("Habilite pop-ups para gerar o PDF");
      return;
    }
    w.onload = () => {
      setTimeout(() => w.print(), 400);
    };
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const shareWhatsApp = (quote?: any) => {
    const c = selectedCustomer || quote?.customer;
    if (!c) {
      toast.error("Selecione um cliente");
      return;
    }
    const its = quote ? JSON.parse(quote.items || "[]") : items;
    const t = quote ? quote.total : total;
    const num = quote?.number || "RASCUNHO";
    let msg = `*Mecânico Pro AI — Orçamento ${num}*\n\n`;
    msg += `Cliente: ${c.name}\n`;
    if (c.document) msg += `Documento: ${c.document}\n`;
    msg += `\n*Itens:*\n`;
    its.forEach((i: Item, idx: number) => {
      msg += `${idx + 1}. ${i.description} — ${i.quantity}x ${formatCurrency(i.unitPrice)} = ${formatCurrency(i.total)}\n`;
    });
    msg += `\n*Total: ${formatCurrency(t)}*`;
    if (notes) msg += `\n\n_Obs: ${notes}_`;
    msg += `\n\n_Powered by Mecânico Pro AI_`;
    const phone = (c.whatsapp || c.phone || "").replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("Abrindo WhatsApp...");
  };

  return (
    <div>
      <ViewHeader
        title="Gerador de Orçamentos"
        description="Crie orçamentos profissionais em PDF com assinatura digital do cliente."
        icon={<FileText className="h-5 w-5" />}
        accent="orange"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Form */}
        <div className="space-y-4 lg:col-span-2">
          {/* Customer */}
          <SectionCard title="Cliente" icon={<FileText className="h-4 w-4" />}>
            <div className="grid gap-3">
              <div>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Cliente *
                </Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="mt-1 border-border bg-background/50">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCustomer && (
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/40 p-3 text-xs">
                  <Info label="Telefone" value={selectedCustomer.phone || "-"} />
                  <Info label="Documento" value={selectedCustomer.document || "-"} />
                  <Info label="WhatsApp" value={selectedCustomer.whatsapp || "-"} />
                  <Info label="Endereço" value={selectedCustomer.address || "-"} />
                </div>
              )}
            </div>
          </SectionCard>

          {/* Items */}
          <SectionCard
            title="Itens do orçamento"
            icon={<Plus className="h-4 w-4" />}
            actions={
              <Button size="sm" variant="outline" onClick={addItem} className="border-border">
                <Plus className="h-3.5 w-3.5" /> Item
              </Button>
            }
          >
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-end gap-2 rounded-xl border border-border bg-background/40 p-2"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <Label className="text-[10px] uppercase text-muted-foreground">Descrição</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="ex: Troca de óleo 5W30"
                      className="h-9 border-border bg-background/50"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <Label className="text-[10px] uppercase text-muted-foreground">Tipo</Label>
                    <Select
                      value={item.type}
                      onValueChange={(v) => updateItem(item.id, "type", v)}
                    >
                      <SelectTrigger className="h-9 border-border bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Serviço</SelectItem>
                        <SelectItem value="part">Peça</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Qtd</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      className="h-9 border-border bg-background/50"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Label className="text-[10px] uppercase text-muted-foreground">Preço</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                      className="h-9 border-border bg-background/50"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-1 text-right">
                    <Label className="text-[10px] uppercase text-muted-foreground">Total</Label>
                    <p className="h-9 py-1.5 text-sm font-bold text-foreground">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] uppercase text-muted-foreground">Imposto (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="h-9 w-24 border-border bg-background/50 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] uppercase text-muted-foreground">Desconto</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="h-9 w-24 border-border bg-background/50 text-right"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-3 text-sm">
                <Row label="Mão de obra" value={formatCurrency(laborTotal)} />
                <Row label="Peças" value={formatCurrency(partsTotal)} />
                <Row label="Subtotal" value={formatCurrency(subtotal)} />
                <Row label="Imposto" value={formatCurrency(taxAmount)} />
                <Row label="Desconto" value={`- ${formatCurrency(discount)}`} />
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                  <span className="font-bold text-foreground">TOTAL</span>
                  <span className="text-lg font-bold text-orange-400">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Notes */}
          <SectionCard title="Observações">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Condições, garantia, prazos..."
              className="min-h-20 border-border bg-background/50"
            />
          </SectionCard>

          {/* Signature */}
          <SignaturePad value={signature} onChange={setSignature} />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => save("draft")}
              disabled={saving}
              variant="outline"
              className="border-border"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar rascunho
            </Button>
            <Button
              onClick={() => save("sent")}
              disabled={saving}
              className="gradient-orange text-primary-foreground glow-orange"
            >
              <Save className="h-4 w-4" /> Salvar e enviar
            </Button>
            <Button
              onClick={() => generatePDF()}
              variant="outline"
              className="border-border"
            >
              <Printer className="h-4 w-4" /> Gerar PDF
            </Button>
            <Button
              onClick={() => shareWhatsApp()}
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Share2 className="h-4 w-4" /> WhatsApp
            </Button>
          </div>
        </div>

        {/* Saved quotes */}
        <SectionCard title="Orçamentos salvos" icon={<FileText className="h-4 w-4" />}>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-2 pr-1">
              {loadingList ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
              ) : savedQuotes.length === 0 ? (
                <EmptyState
                  icon={<FileText className="h-10 w-10 opacity-40" />}
                  title="Nenhum orçamento salvo"
                  description="Salve um orçamento para vê-lo aqui."
                />
              ) : (
                savedQuotes.map((q) => {
                  const hasServiceOrder = Array.isArray(q.serviceOrders) && q.serviceOrders.length > 0;
                  const isApproved = q.status === "approved";
                  const isApproving = approvingId === q.id;
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border bg-background/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-orange-400">{q.number}</p>
                          <p className="truncate text-sm font-medium text-foreground">
                            {q.customer?.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDate(q.createdAt)}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold ${
                          q.status === "draft" ? "bg-zinc-500/15 text-zinc-300" :
                          q.status === "sent" ? "bg-blue-500/15 text-blue-300" :
                          q.status === "approved" ? "bg-emerald-500/15 text-emerald-300" :
                          "bg-red-500/15 text-red-300"
                        }`}>
                          {q.status === "draft" ? "Rascunho" :
                           q.status === "sent" ? "Enviado" :
                           q.status === "approved" ? "Aprovado" : "Rejeitado"}
                        </span>
                      </div>

                      {/* Badge: OS already generated from this quote */}
                      {hasServiceOrder && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                          <Link2 className="h-3 w-3" />
                          OS gerada
                          <Wrench className="ml-0.5 h-3 w-3" />
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-base font-bold text-foreground">
                          {formatCurrency(q.total)}
                        </span>
                        <div className="flex gap-1">
                          {/* Aprovar — só aparece se ainda não aprovado */}
                          {!isApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                              disabled={isApproving}
                              onClick={() => approveQuote(q.id, q.number)}
                              title="Aprovar e gerar Ordem de Serviço"
                            >
                              {isApproving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              Aprovar
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => generatePDF(q)}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => shareWhatsApp(q)}>
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Aprovado: mostrar mensagem informativa */}
                      {isApproved && hasServiceOrder && (
                        <p className="mt-1.5 text-[10px] text-blue-300">
                          ✓ Ordem de serviço vinculada — edição não cria nova OS.
                        </p>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SectionCard>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="truncate text-foreground">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function SignaturePad({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      const rect = canvasRef.current!.getBoundingClientRect();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = "#ff8a3d";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  };
  const end = () => {
    drawing.current = false;
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL());
    }
  };
  const clear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    onChange(null);
  };

  return (
    <SectionCard title="Assinatura digital do cliente" icon={<PenLine className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="rounded-xl border-2 border-dashed border-border bg-background/40 p-2">
          <canvas
            ref={canvasRef}
            width={500}
            height={150}
            className="h-32 w-full touch-none"
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clear} className="border-border">
            <RotateCcw className="h-3.5 w-3.5" /> Limpar
          </Button>
          {value && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <Check className="h-3.5 w-3.5" /> Assinatura capturada
            </span>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function buildQuoteHTML(opts: {
  number: string;
  date: string;
  customer?: Customer;
  items: Item[];
  laborTotal: number;
  partsTotal: number;
  taxPercent: number;
  discount: number;
  total: number;
  notes?: string;
  signature?: string | null;
}) {
  const c = opts.customer;
  const itemsRows = opts.items
    .map(
      (i, idx) => `<tr>
      <td>${idx + 1}</td>
      <td>${i.description}</td>
      <td>${i.type === "service" ? "Serviço" : "Peça"}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right">${formatCurrency(i.unitPrice)}</td>
      <td style="text-align:right"><strong>${formatCurrency(i.total)}</strong></td>
    </tr>`
    )
    .join("");
  const sig = opts.signature
    ? `<div style="margin-top:40px;border-top:1px dashed #888;padding-top:12px;max-width:320px">
        <img src="${opts.signature}" style="max-width:300px;max-height:90px" />
        <p style="font-size:11px;color:#666;margin-top:4px">${c?.name || "Cliente"} — assinado digitalmente em ${opts.date}</p>
      </div>`
    : "";
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Orçamento ${opts.number}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; margin:0; padding:24px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 3px solid #f56a00; padding-bottom:16px; }
    .brand { display:flex; align-items:center; gap:12px; }
    .logo { width:48px;height:48px;background:#0a1628;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#ff8a3d;font-size:24px;font-weight:bold; }
    .brand-name { font-size:20px; font-weight:bold; color:#0a1628; }
    .brand-sub { font-size:11px; color:#888; text-transform:uppercase; letter-spacing:1px; }
    .quote-info { text-align:right; }
    .quote-num { font-size:18px; font-weight:bold; color:#f56a00; }
    .quote-date { font-size:12px; color:#666; }
    .section { margin-top:24px; }
    .label { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:4px; }
    .customer-box { background:#f8f9fc; border-left:4px solid #f56a00; padding:12px 16px; border-radius:4px; }
    .customer-name { font-size:16px; font-weight:bold; }
    table { width:100%; border-collapse:collapse; margin-top:12px; font-size:12px; }
    th { background:#0a1628; color:#fff; padding:10px 8px; text-align:left; font-size:11px; text-transform:uppercase; }
    td { padding:8px; border-bottom:1px solid #eee; }
    tr:nth-child(even) td { background:#fafbfd; }
    .totals { margin-top:16px; margin-left:auto; width:280px; }
    .totals-row { display:flex; justify-content:space-between; padding:4px 0; font-size:12px; }
    .totals-total { display:flex; justify-content:space-between; padding:12px 0 0; border-top:2px solid #0a1628; font-size:18px; font-weight:bold; color:#f56a00; }
    .notes { margin-top:24px; padding:12px; background:#fffaf5; border:1px solid #ffe0b3; border-radius:4px; font-size:11px; }
    .footer { margin-top:40px; padding-top:12px; border-top:1px solid #eee; text-align:center; font-size:10px; color:#999; }
  </style></head><body>
    <div class="header">
      <div class="brand">
        <div class="logo">M</div>
        <div>
          <div class="brand-name">Mecânico Pro AI</div>
          <div class="brand-sub">Assistente Técnico Automotivo</div>
        </div>
      </div>
      <div class="quote-info">
        <div class="quote-num">ORÇAMENTO ${opts.number}</div>
        <div class="quote-date">Data: ${opts.date}</div>
      </div>
    </div>
    <div class="section">
      <div class="label">Cliente</div>
      <div class="customer-box">
        <div class="customer-name">${c?.name || "—"}</div>
        ${c?.document ? `<div>Documento: ${c.document}</div>` : ""}
        ${c?.phone ? `<div>Telefone: ${c.phone}</div>` : ""}
        ${c?.address ? `<div>Endereço: ${c.address}</div>` : ""}
      </div>
    </div>
    <div class="section">
      <div class="label">Itens do orçamento</div>
      <table>
        <thead><tr><th>#</th><th>Descrição</th><th>Tipo</th><th>Qtd</th><th style="text-align:right">Valor unit.</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div class="totals">
        <div class="totals-row"><span>Mão de obra:</span><span>${formatCurrency(opts.laborTotal)}</span></div>
        <div class="totals-row"><span>Peças:</span><span>${formatCurrency(opts.partsTotal)}</span></div>
        ${opts.taxPercent > 0 ? `<div class="totals-row"><span>Imposto (${opts.taxPercent}%):</span><span>${formatCurrency(opts.laborTotal + opts.partsTotal - 0)}</span></div>` : ""}
        ${opts.discount > 0 ? `<div class="totals-row"><span>Desconto:</span><span>- ${formatCurrency(opts.discount)}</span></div>` : ""}
        <div class="totals-total"><span>TOTAL:</span><span>${formatCurrency(opts.total)}</span></div>
      </div>
    </div>
    ${opts.notes ? `<div class="notes"><strong>Observações:</strong> ${opts.notes}</div>` : ""}
    ${sig}
    <div class="footer">Documento gerado pelo Mecânico Pro AI • ${new Date().toLocaleString("pt-BR")}</div>
  </body></html>`;
}
