'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Pencil, Check, X, Plus, Trash2, Loader2 } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type LangPair = { id: string; source_lang: string; target_lang: string; per_word_rate: number; is_active: boolean }
type Multiplier = { id: string; name: string; multiplier: number; is_active: boolean }
type SystemSetting = { key: string; value: string }

const SYSTEM_SETTING_LABELS: Record<string, string> = {
  translation_minimum_standard: 'Translation Minimum (Standard)',
  translation_minimum_certified: 'Translation Minimum (General/Company Certified)',
  translation_minimum_court: 'Translation Minimum (Court — Standard Languages)',
  translation_minimum_court_premium: 'Translation Minimum (Court — Japanese & Hebrew)',
  translation_court_premium_langs: 'Court Premium Languages (comma-separated)',
  interpretation_rate_standard: 'Interpretation Rate — Standard (3 hr)',
  interpretation_rate_court: 'Interpretation Rate — Court Certified (3 hr)',
  interpretation_phone_rate: 'Phone Interpretation Rate (per min)',
  interpretation_phone_minimum_minutes: 'Phone Interpretation Minimum (min)',
  notary_flat_rate: 'Notary Flat Rate (per document)',
  apostille_first: 'Apostille — First Document',
  apostille_additional: 'Apostille — Each Additional',
  apostille_death_certificate: 'Apostille — Death Certificate (Norwalk)',
  notary_mobile_base_rate: 'Mobile Notary — Base Rate ($, low mileage)',
  notary_mobile_max_rate: 'Mobile Notary — Max Rate ($, high mileage)',
  notary_per_signature: 'Notary — Per Signature/Stamp Fee',
}

const CURRENCY_KEYS = new Set([
  'translation_minimum_standard', 'translation_minimum_certified',
  'translation_minimum_court', 'translation_minimum_court_premium',
  'interpretation_rate_standard', 'interpretation_rate_court',
  'interpretation_phone_rate', 'notary_flat_rate',
  'apostille_first', 'apostille_additional', 'apostille_death_certificate',
  'notary_mobile_base_rate', 'notary_mobile_max_rate', 'notary_per_signature',
])

// ── Helpers ──────────────────────────────────────────────────────────────────

function useToggle(initial = false) {
  const [v, set] = useState(initial)
  return [v, () => set((x) => !x)] as const
}

// ── Language Pairs Section ───────────────────────────────────────────────────

function LangPairRow({ lp, onSave, onDelete }: { lp: LangPair; onSave: (id: string, rate: number, active: boolean) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [editing, toggleEditing] = useToggle()
  const [rate, setRate] = useState(String(lp.per_word_rate))
  const [active, setActive] = useState(lp.is_active)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await onSave(lp.id, Number(rate), active)
    setSaving(false)
    toggleEditing()
  }

  function cancel() {
    setRate(String(lp.per_word_rate))
    setActive(lp.is_active)
    toggleEditing()
  }

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-2.5 text-sm">{lp.source_lang}</td>
      <td className="px-4 py-2.5 text-sm">{lp.target_lang}</td>
      <td className="px-4 py-2.5 text-right text-sm">
        {editing ? (
          <Input type="number" step="0.0001" min="0" value={rate} onChange={(e) => setRate(e.target.value)}
            className="w-28 h-7 text-right text-sm ml-auto" />
        ) : (
          `$${Number(lp.per_word_rate).toFixed(4)}`
        )}
      </td>
      <td className="px-4 py-2.5 text-center text-sm">
        {editing ? (
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#1a1a2e]" />
        ) : (
          <span className={lp.is_active ? 'text-green-600' : 'text-gray-300'}>{lp.is_active ? '✓' : '—'}</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right">
        {editing ? (
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-green-600" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={cancel}><X className="h-3.5 w-3.5" /></Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={toggleEditing}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-600" onClick={() => onDelete(lp.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        )}
      </td>
    </tr>
  )
}

function AddLangPairRow({ onAdd }: { onAdd: (source: string, target: string, rate: number) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')
  const [rate, setRate] = useState('0.18')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!source.trim() || !target.trim()) return
    setSaving(true)
    await onAdd(source.trim(), target.trim(), Number(rate))
    setSaving(false)
    setSource(''); setTarget(''); setRate('0.18')
    setOpen(false)
  }

  if (!open) {
    return (
      <tr className="border-t border-gray-100">
        <td colSpan={5} className="px-4 py-2">
          <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 h-7 gap-1" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Language Pair
          </Button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-t border-gray-100 bg-blue-50/40">
      <td className="px-4 py-2">
        <Input placeholder="English" value={source} onChange={(e) => setSource(e.target.value)} className="h-7 text-sm" />
      </td>
      <td className="px-4 py-2">
        <Input placeholder="Spanish" value={target} onChange={(e) => setTarget(e.target.value)} className="h-7 text-sm" />
      </td>
      <td className="px-4 py-2">
        <Input type="number" step="0.0001" min="0" value={rate} onChange={(e) => setRate(e.target.value)} className="h-7 text-sm text-right" />
      </td>
      <td className="px-4 py-2 text-center text-xs text-gray-400">active</td>
      <td className="px-4 py-2">
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-green-600" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setOpen(false)}><X className="h-3.5 w-3.5" /></Button>
        </div>
      </td>
    </tr>
  )
}

// ── Multiplier Row ───────────────────────────────────────────────────────────

function MultiplierRow({ m, onSave }: { m: Multiplier; onSave: (id: string, multiplier: number, active: boolean) => Promise<void> }) {
  const [editing, toggleEditing] = useToggle()
  const [val, setVal] = useState(String(m.multiplier))
  const [active, setActive] = useState(m.is_active)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await onSave(m.id, Number(val), active)
    setSaving(false)
    toggleEditing()
  }

  function cancel() {
    setVal(String(m.multiplier))
    setActive(m.is_active)
    toggleEditing()
  }

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-2.5 text-sm">{m.name}</td>
      <td className="px-4 py-2.5 text-right text-sm">
        {editing ? (
          <Input type="number" step="0.0001" min="0" value={val} onChange={(e) => setVal(e.target.value)}
            className="w-24 h-7 text-right text-sm ml-auto" />
        ) : (
          `${Number(m.multiplier).toFixed(4)}×`
        )}
      </td>
      <td className="px-4 py-2.5 text-center text-sm">
        {editing ? (
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#1a1a2e]" />
        ) : (
          <span className={m.is_active ? 'text-green-600' : 'text-gray-300'}>{m.is_active ? '✓' : '—'}</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right">
        {editing ? (
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-green-600" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={cancel}><X className="h-3.5 w-3.5" /></Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={toggleEditing}><Pencil className="h-3.5 w-3.5" /></Button>
        )}
      </td>
    </tr>
  )
}

// ── System Setting Row ───────────────────────────────────────────────────────

function SystemSettingRow({ s, onSave }: { s: SystemSetting; onSave: (key: string, value: string) => Promise<void> }) {
  const [editing, toggleEditing] = useToggle()
  const [val, setVal] = useState(s.value)
  const [saving, setSaving] = useState(false)
  const label = SYSTEM_SETTING_LABELS[s.key] ?? s.key
  const isCurrency = CURRENCY_KEYS.has(s.key)

  async function save() {
    setSaving(true)
    await onSave(s.key, val)
    setSaving(false)
    toggleEditing()
  }

  function cancel() {
    setVal(s.value)
    toggleEditing()
  }

  const displayVal = isCurrency ? formatCurrency(Number(s.value)) : s.value

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-2.5 text-sm text-gray-700">{label}</td>
      <td className="px-4 py-2.5 text-right text-sm">
        {editing ? (
          <Input type="number" step="any" min="0" value={val} onChange={(e) => setVal(e.target.value)}
            className="w-32 h-7 text-right text-sm ml-auto" />
        ) : displayVal}
      </td>
      <td className="px-4 py-2.5 text-right">
        {editing ? (
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-green-600" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={cancel}><X className="h-3.5 w-3.5" /></Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={toggleEditing}><Pencil className="h-3.5 w-3.5" /></Button>
        )}
      </td>
    </tr>
  )
}

// ── AI Rules Placeholder ─────────────────────────────────────────────────────

function AIRulesSection({ value, onSave }: { value: string; onSave: (key: string, value: string) => Promise<void> }) {
  const [editing, toggleEditing] = useToggle()
  const [text, setText] = useState(value)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await onSave('ai_translation_rules', text)
    setSaving(false)
    toggleEditing()
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-lg font-semibold text-gray-900">AI Translation Output Rules</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Define custom rules passed to the AI translation engine for every job — e.g. preferred terminology, formatting constraints, or brand-specific style guidelines.
      </p>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {editing ? (
          <div className="space-y-3">
            <textarea
              className="w-full h-48 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter AI translation output rules here…"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Rules'}
              </Button>
              <Button size="sm" variant="outline" onClick={toggleEditing}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {text ? (
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 rounded p-3 max-h-48 overflow-auto">{text}</pre>
            ) : (
              <p className="text-sm text-gray-400 italic">No rules defined yet.</p>
            )}
            <Button size="sm" variant="outline" onClick={toggleEditing}>
              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Rules
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [langPairs, setLangPairs] = useState<LangPair[]>([])
  const [multipliers, setMultipliers] = useState<Multiplier[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [lpRes, mulRes, sysRes] = await Promise.all([
      fetch('/api/admin/settings/language-pairs'),
      fetch('/api/admin/settings/multipliers'),
      fetch('/api/admin/settings/system'),
    ])
    if (lpRes.ok) setLangPairs(await lpRes.json())
    if (mulRes.ok) setMultipliers(await mulRes.json())
    if (sysRes.ok) setSystemSettings(await sysRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  async function saveLangPair(id: string, rate: number, active: boolean) {
    await fetch(`/api/admin/settings/language-pairs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ per_word_rate: rate, is_active: active }),
    })
    setLangPairs((prev) => prev.map((lp) => lp.id === id ? { ...lp, per_word_rate: rate, is_active: active } : lp))
  }

  async function deleteLangPair(id: string) {
    if (!confirm('Delete this language pair?')) return
    await fetch(`/api/admin/settings/language-pairs/${id}`, { method: 'DELETE' })
    setLangPairs((prev) => prev.filter((lp) => lp.id !== id))
  }

  async function addLangPair(source: string, target: string, rate: number) {
    const res = await fetch('/api/admin/settings/language-pairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_lang: source, target_lang: target, per_word_rate: rate, is_active: true }),
    })
    if (res.ok) {
      const added = await res.json()
      setLangPairs((prev) => [...prev, added].sort((a, b) => a.source_lang.localeCompare(b.source_lang) || a.target_lang.localeCompare(b.target_lang)))
    }
  }

  async function saveMultiplier(id: string, multiplier: number, active: boolean) {
    await fetch(`/api/admin/settings/multipliers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ multiplier, is_active: active }),
    })
    setMultipliers((prev) => prev.map((m) => m.id === id ? { ...m, multiplier, is_active: active } : m))
  }

  async function saveSystemSetting(key: string, value: string) {
    await fetch('/api/admin/settings/system', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    setSystemSettings((prev) => prev.map((s) => s.key === key ? { ...s, value } : s))
  }

  const visibleSettings = systemSettings.filter((s) => s.key in SYSTEM_SETTING_LABELS)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">Settings</h1>

      {/* Language Pairs */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Language Pairs &amp; Rates</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Source</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Target</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Rate / Word</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Active</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {langPairs.map((lp) => (
                <LangPairRow key={lp.id} lp={lp} onSave={saveLangPair} onDelete={deleteLangPair} />
              ))}
              <AddLangPairRow onAdd={addLangPair} />
            </tbody>
          </table>
        </div>
      </section>

      {/* Specialty Multipliers */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Specialty Multipliers</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Specialty</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Multiplier</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Active</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {multipliers.map((m) => (
                <MultiplierRow key={m.id} m={m} onSave={saveMultiplier} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* System Settings */}
      {visibleSettings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rates &amp; Fees</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Setting</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Value</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {visibleSettings.map((s) => (
                  <SystemSettingRow key={s.key} s={s} onSave={saveSystemSetting} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* AI Translation Rules — Experimental Placeholder */}
      <AIRulesSection
        value={systemSettings.find((s) => s.key === 'ai_translation_rules')?.value ?? ''}
        onSave={saveSystemSetting}
      />
    </div>
  )
}
