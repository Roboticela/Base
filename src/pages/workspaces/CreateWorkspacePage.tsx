import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bot, Download, LayoutTemplate, Sparkles, Upload } from 'lucide-react'

import { PageHeader } from '@/components/app/PageHeader'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { AuthInput } from '@/components/auth/AuthInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  COMPANY_SIZES,
  CURRENCIES,
  INDUSTRIES,
  LANGUAGES,
  TIMEZONES,
} from '@/data/workspaces'
import { cn } from '@/lib/utils'

type StartMode = 'scratch' | 'template' | 'ai' | 'import'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function CreateWorkspacePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialMode = (params.get('mode') as StartMode | null) ?? 'scratch'

  const [mode, setMode] = useState<StartMode>(
    initialMode === 'template' || initialMode === 'import' || initialMode === 'ai'
      ? initialMode
      : 'scratch',
  )
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [industry, setIndustry] = useState(INDUSTRIES[0])
  const [companySize, setCompanySize] = useState(COMPANY_SIZES[1])
  const [timezone, setTimezone] = useState(TIMEZONES[4])
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [logoLabel, setLogoLabel] = useState('AS')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewInitials = useMemo(() => {
    if (logoLabel.trim()) return logoLabel.slice(0, 2).toUpperCase()
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'WS'
  }, [logoLabel, name])

  function handleNameChange(value: string) {
    setName(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!name.trim() || !slug.trim()) {
      setError('Workspace name and slug are required.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      navigate('/w/ws-acme')
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Create"
        title="Create a workspace"
        description="Configure the basics, then jump straight into your dashboard."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            { id: 'scratch', label: 'Start from Scratch', icon: Sparkles },
            { id: 'template', label: 'Use a Template', icon: LayoutTemplate },
            { id: 'ai', label: 'Generate with AI', icon: Bot },
            { id: 'import', label: 'Import Existing Data', icon: Download },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={cn(
              'flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors',
              mode === item.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:bg-muted/40',
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-primary">
              <item.icon className="h-4 w-4" />
            </span>
            <span className="text-[13.5px] font-medium text-foreground">{item.label}</span>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-6"
        noValidate
      >
        {error ? (
          <p className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3.5 py-3 text-[13.5px] text-red-500">
            {error}
          </p>
        ) : null}

        {mode === 'ai' ? (
          <div className="rounded-xl border border-border bg-background px-4 py-3 text-[13.5px] text-muted-foreground">
            Describe your workspace and AI will suggest sheets, fields, and starter automations after creation.
          </div>
        ) : null}
        {mode === 'template' ? (
          <div className="rounded-xl border border-border bg-background px-4 py-3 text-[13.5px] text-muted-foreground">
            You&apos;ll pick a template on the next step. For this design preview, creation continues with defaults.
          </div>
        ) : null}
        {mode === 'import' ? (
          <div className="rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center">
            <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-[13.5px] font-medium text-foreground">Drop CSV, Excel, or JSON</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Import mapping happens after workspace creation.</p>
          </div>
        ) : null}

        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-[18px] font-semibold text-white">
            {previewInitials}
          </span>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="logoLabel">Workspace logo initials</Label>
            <Input
              id="logoLabel"
              name="logoLabel"
              value={logoLabel}
              onChange={(event) => setLogoLabel(event.target.value.slice(0, 2))}
              placeholder="AS"
            />
          </div>
        </div>

        <AuthInput
          label="Workspace name"
          name="name"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          placeholder="Acme Studio"
        />

        <AuthInput
          label="Workspace slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugEdited(true)
            setSlug(slugify(event.target.value))
          }}
          placeholder="acme-studio"
          hint={<span className="text-[12px] text-muted-foreground">app.base.com/w/{slug || 'slug'}</span>}
        />

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What this workspace is used for"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[14.5px] text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Industry" value={industry} onChange={setIndustry} options={INDUSTRIES} />
          <SelectField label="Company size" value={companySize} onChange={setCompanySize} options={COMPANY_SIZES} />
          <SelectField label="Default timezone" value={timezone} onChange={setTimezone} options={TIMEZONES} />
          <SelectField label="Default language" value={language} onChange={setLanguage} options={LANGUAGES} />
          <SelectField label="Default currency" value={currency} onChange={setCurrency} options={CURRENCIES} />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/workspaces')}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Creating workspace"
            className="sm:w-auto sm:min-w-[200px]"
          >
            Create workspace
          </LoadingButton>
        </div>
      </form>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14.5px] text-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
