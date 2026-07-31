"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, X, Loader2, Check, Star } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  price: number;        // integer (centavos)
  tokens: number;
  interval: string;     // monthly | yearly | lifetime
  features: string[];
  ai_tools: string[];
  is_active: boolean;
  description: string;
  popular: boolean;
  cta: string;
}

const EMPTY: Omit<Plan, "id"> = {
  name: "", price: 0, tokens: 1000, interval: "monthly",
  features: [], ai_tools: [], is_active: true,
  description: "", popular: false, cta: "Assinar",
};

const INTERVAL_LABELS: Record<string, string> = {
  monthly: "Mensal", yearly: "Anual", lifetime: "Vitalício",
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Plan, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [featInput, setFeatInput] = useState("");

  const load = () => {
    fetch("/api/admin-mg/plans")
      .then((r) => r.json())
      .then((d) => { setPlans(d.plans || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setFeatInput(""); setCreating(true); setEditing(null); };
  const openEdit = (p: Plan) => { setForm(p); setFeatInput(""); setEditing(p); setCreating(false); };
  const closeForm = () => { setCreating(false); setEditing(null); };

  const addFeature = () => {
    if (!featInput.trim()) return;
    setForm((f) => ({ ...f, features: [...f.features, featInput.trim()] }));
    setFeatInput("");
  };

  const removeFeature = (i: number) =>
    setForm((f) => ({ ...f, features: f.features.filter((_, j) => j !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/admin-mg/plans", {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      toast.success(editing ? "Plano atualizado!" : "Plano criado!");
      closeForm(); load();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este plano?")) return;
    const res = await fetch("/api/admin-mg/plans", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Plano removido"); load(); }
    else toast.error("Erro ao remover");
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planos e Preços</h1>
          <p className="text-muted-foreground text-sm mt-1">{plans.length} planos configurados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Novo Plano
        </Button>
      </div>

      {/* Form */}
      {(creating || editing) && (
        <Card className="border-primary/30 border-2 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing ? "Editar Plano" : "Novo Plano"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={closeForm}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Pro, Starter, Business..." />
              </div>
              <div className="space-y-2">
                <Label>Preço (em centavos, ex: 4990 = R$49,90)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="4990" />
              </div>
              <div className="space-y-2">
                <Label>Período</Label>
                <select value={form.interval} onChange={e => setForm(f => ({ ...f, interval: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background text-sm">
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                  <option value="lifetime">Vitalício</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tokens incluídos</Label>
                <Input type="number" value={form.tokens} onChange={e => setForm(f => ({ ...f, tokens: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Descrição curta</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Para quem está começando..." />
              </div>
              <div className="space-y-2">
                <Label>Texto do botão (CTA)</Label>
                <Input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))} placeholder="Assinar" />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  value={featInput}
                  onChange={e => setFeatInput(e.target.value)}
                  placeholder="Ex: Acesso ilimitado ao chat"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                />
                <Button type="button" variant="outline" onClick={addFeature}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                    {f}
                    <button onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-foreground ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.popular} onCheckedChange={v => setForm(f => ({ ...f, popular: v }))} />
                <Label>Destaque (Popular)</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="ml-auto">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Salvar Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {plans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
          <p>Nenhum plano criado ainda</p>
          <Button variant="link" onClick={openCreate}>Criar primeiro plano</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={`border-0 shadow-sm relative ${!plan.is_active ? "opacity-60" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> Popular
                </div>
              )}
              <CardContent className="p-5 pt-6">
                <h3 className="font-semibold">{plan.name}</h3>
                {plan.description && <p className="text-xs text-muted-foreground mt-0.5 mb-2">{plan.description}</p>}
                <p className="text-2xl font-bold mt-1">
                  R$ {(plan.price / 100).toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">/{INTERVAL_LABELS[plan.interval] || plan.interval}</span>
                </p>
                <p className="text-xs text-muted-foreground my-2">{plan.tokens?.toLocaleString()} tokens</p>
                <ul className="space-y-1 text-sm mb-4">
                  {(plan.features || []).slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-3 w-3 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                  {(plan.features || []).length > 3 && (
                    <li className="text-xs text-muted-foreground">+{plan.features.length - 3} mais...</li>
                  )}
                </ul>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(plan)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
