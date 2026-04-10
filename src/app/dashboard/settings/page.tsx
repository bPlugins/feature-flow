"use client";

import { useState, useEffect } from "react";
import { Loader2, Copy, Check, ExternalLink, Code2, Globe, Palette, CreditCard, Crown, Sparkles, ArrowUpRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import toast from "react-hot-toast";
import { PLAN_LIMITS, type PlanType } from "@/lib/plans";

interface Project {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  primaryColor: string;
  isPublic: boolean;
}

type PageType = "feedback" | "roadmap" | "changelog";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#84cc16", "#22c55e", "#10b981",
  "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#1d4ed8", "#4f46e5", "#7c3aed", "#0f172a",
];

export default function SettingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [embedPage, setEmbedPage] = useState<PageType>("feedback");
  const [savingColor, setSavingColor] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/billing").then((r) => r.json()).catch(() => ({ plan: "free" })),
    ]).then(([projectsData, billingData]) => {
      const projs = projectsData.projects || [];
      setProjects(projs);
      if (projs.length > 0) setSelected(projs[0]);
      setCurrentPlan((billingData.plan || "free") as PlanType);
      setLoading(false);
    });
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(""), 2000);
  };

  const updateColor = async (color: string) => {
    if (!selected) return;
    setSavingColor(true);
    try {
      const res = await fetch(`/api/projects/${selected.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryColor: color }),
      });
      if (res.ok) {
        setSelected({ ...selected, primaryColor: color });
        setProjects((prev) =>
          prev.map((p) => (p.slug === selected.slug ? { ...p, primaryColor: color } : p))
        );
        toast.success("Theme color updated!");
      }
    } catch {
      toast.error("Failed to update color");
    } finally {
      setSavingColor(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
      }
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setBillingLoading(false);
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold mb-2">No projects yet</h1>
        <p className="text-muted-foreground">Create a project first to configure settings.</p>
      </div>
    );
  }

  const publicPages = [
    { label: "Feedback Board", path: `/p/${selected.slug}/feedback`, description: "Collect and vote on ideas" },
    { label: "Roadmap", path: `/p/${selected.slug}/roadmap`, description: "Show your product plans" },
    { label: "Changelog", path: `/p/${selected.slug}/changelog`, description: "Share product updates" },
  ];

  const embedPageUrl = `${baseUrl}/p/${selected.slug}/${embedPage}`;
  const pageLabels: Record<PageType, string> = {
    feedback: "Feedback Board",
    roadmap: "Roadmap",
    changelog: "Changelog",
  };

  const plans = [
    {
      key: "free" as const,
      icon: Sparkles,
      gradient: "from-slate-500 to-slate-600",
      features: ["1 project", "100 feedbacks", "10 roadmap items", "10 changelog entries"],
    },
    {
      key: "pro" as const,
      icon: Crown,
      gradient: "from-primary to-secondary",
      features: ["5 projects", "1,000 feedbacks/project", "100 roadmap items", "100 changelog", "Priority support"],
    },
    {
      key: "team" as const,
      icon: CreditCard,
      gradient: "from-amber-500 to-orange-500",
      features: ["Unlimited projects", "Unlimited feedbacks", "Unlimited roadmap/changelog", "Custom branding", "API access"],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your project and integration options</p>
        </div>
        <ThemeToggle />
      </div>

      {projects.length > 1 && (
        <select
          value={selected.slug}
          onChange={(e) => setSelected(projects.find((p) => p.slug === e.target.value) || null)}
          className="px-4 py-2 rounded-xl border border-border bg-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      )}

      {/* ═══════ Billing & Plan ═══════ */}
      <div className="p-6 rounded-2xl border border-border bg-surface">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Plan & Billing
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Current plan: <span className="font-semibold text-foreground capitalize">{currentPlan}</span>
          {currentPlan === "free" && " — Upgrade to unlock more features"}
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const limits = PLAN_LIMITS[plan.key];
            const isCurrent = currentPlan === plan.key;
            return (
              <div
                key={plan.key}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                    CURRENT
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold capitalize">{plan.key}</h3>
                <p className="text-2xl font-bold mb-3">
                  ${limits.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && plan.key !== "free" && (
                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={billingLoading}
                    className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    {billingLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Upgrade <ArrowUpRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                )}
                {plan.key === "free" && !isCurrent && (
                  <p className="text-xs text-center text-muted-foreground">Free tier</p>
                )}
              </div>
            );
          })}
        </div>

        {!process.env.NEXT_PUBLIC_STRIPE_ENABLED && (
          <p className="text-xs text-muted-foreground mt-4 p-3 rounded-lg bg-muted/50">
            💡 To enable payments, set <code className="bg-muted px-1 rounded">STRIPE_SECRET_KEY</code>,{" "}
            <code className="bg-muted px-1 rounded">STRIPE_PRO_PRICE_ID</code>, and{" "}
            <code className="bg-muted px-1 rounded">STRIPE_TEAM_PRICE_ID</code> in your <code className="bg-muted px-1 rounded">.env</code> file.
          </p>
        )}
      </div>

      {/* ═══════ Theme Color ═══════ */}
      <div className="p-6 rounded-2xl border border-border bg-surface">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-500" />
          Project Theme
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Customize the accent color for your public pages.
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl border-2 border-border shadow-inner"
            style={{ backgroundColor: selected.primaryColor }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Primary Color</p>
            <p className="text-xs text-muted-foreground font-mono">{selected.primaryColor}</p>
          </div>
          {savingColor && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>

        {/* Preset colors */}
        <div className="grid grid-cols-10 gap-2 mb-4">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateColor(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                selected.primaryColor === color
                  ? "border-foreground scale-110 shadow-lg"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Custom color picker */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Custom:</label>
          <input
            type="color"
            value={selected.primaryColor}
            onChange={(e) => updateColor(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
          />
          <input
            type="text"
            value={selected.primaryColor}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                updateColor(val);
              }
            }}
            placeholder="#6366f1"
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono w-28 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* ═══════ Public pages ═══════ */}
      <div className="p-6 rounded-2xl border border-border bg-surface">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Public Pages
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          These pages are publicly accessible — no login required for visitors.
        </p>
        <div className="space-y-3">
          {publicPages.map((page) => (
            <div key={page.path} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors">
              <div>
                <p className="text-sm font-medium">{page.label}</p>
                <p className="text-xs text-muted-foreground mb-0.5">{page.description}</p>
                <p className="text-xs text-primary font-mono">{baseUrl}{page.path}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(`${baseUrl}${page.path}`, page.label)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Copy URL"
                >
                  {copied === page.label ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <a
                  href={page.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ Embed options ═══════ */}
      <div className="p-6 rounded-2xl border border-border bg-surface">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-secondary" />
          Embed on Your Website
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Multiple ways to add FeatureFlow to your own website.
        </p>

        {/* Page selector tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 mb-6 w-fit">
          {(["feedback", "roadmap", "changelog"] as PageType[]).map((page) => (
            <button
              key={page}
              onClick={() => setEmbedPage(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                embedPage === page
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {pageLabels[page]}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {/* Method 1: Inline Embed (iframe) */}
          <div className="p-4 rounded-xl border border-border bg-background">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold shrink-0">1</div>
              <div>
                <h3 className="text-sm font-semibold">Inline Embed (iframe)</h3>
                <p className="text-xs text-muted-foreground">
                  Embed the {pageLabels[embedPage].toLowerCase()} directly into any page.
                </p>
              </div>
            </div>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
{`<iframe
  src="${embedPageUrl}"
  style="width:100%;height:600px;border:none;border-radius:12px;"
  title="${pageLabels[embedPage]}"
></iframe>`}
              </pre>
              <button
                onClick={() => copyToClipboard(`<iframe src="${embedPageUrl}" style="width:100%;height:600px;border:none;border-radius:12px;" title="${pageLabels[embedPage]}"></iframe>`, "iframe")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-surface border border-border hover:bg-muted transition-colors"
              >
                {copied === "iframe" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Method 2: Popup Widget */}
          <div className="p-4 rounded-xl border border-border bg-background">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-bold shrink-0">2</div>
              <div>
                <h3 className="text-sm font-semibold">Popup Widget (Floating Button)</h3>
                <p className="text-xs text-muted-foreground">
                  Adds a floating button that opens the {pageLabels[embedPage].toLowerCase()} in a popup.
                </p>
              </div>
            </div>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
{`<script
  src="${baseUrl}/widget.js"
  data-project="${selected.slug}"
  data-page="${embedPage}"
  data-mode="popup"
  data-position="bottom-right"
  data-color="${selected.primaryColor}"
></script>`}
              </pre>
              <button
                onClick={() => copyToClipboard(`<script src="${baseUrl}/widget.js" data-project="${selected.slug}" data-page="${embedPage}" data-mode="popup" data-position="bottom-right" data-color="${selected.primaryColor}"></script>`, "popup")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-surface border border-border hover:bg-muted transition-colors"
              >
                {copied === "popup" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Method 3: Inline Widget */}
          <div className="p-4 rounded-xl border border-border bg-background">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold shrink-0">3</div>
              <div>
                <h3 className="text-sm font-semibold">Inline Widget (Script tag)</h3>
                <p className="text-xs text-muted-foreground">
                  Place the script anywhere and it renders inline.
                </p>
              </div>
            </div>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
{`<div id="featureflow"></div>
<script
  src="${baseUrl}/widget.js"
  data-project="${selected.slug}"
  data-page="${embedPage}"
  data-mode="inline"
></script>`}
              </pre>
              <button
                onClick={() => copyToClipboard(`<div id="featureflow"></div>\n<script src="${baseUrl}/widget.js" data-project="${selected.slug}" data-page="${embedPage}" data-mode="inline"></script>`, "inline")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-surface border border-border hover:bg-muted transition-colors"
              >
                {copied === "inline" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Method 4: Direct Link / Reverse Proxy */}
          <div className="p-4 rounded-xl border border-border bg-background">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-bold shrink-0">4</div>
              <div>
                <h3 className="text-sm font-semibold">Direct Link / Reverse Proxy</h3>
                <p className="text-xs text-muted-foreground">
                  Link directly or proxy from your own domain.
                </p>
              </div>
            </div>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
{`<!-- Simple link -->
<a href="${embedPageUrl}">${pageLabels[embedPage]}</a>

<!-- Nginx reverse proxy -->
location /${embedPage} {
  proxy_pass ${embedPageUrl};
  proxy_set_header Host $host;
}

<!-- Vercel rewrites (vercel.json) -->
{
  "rewrites": [{
    "source": "/${embedPage}/:path*",
    "destination": "${baseUrl}/p/${selected.slug}/${embedPage}/:path*"
  }]
}`}
              </pre>
              <button
                onClick={() => copyToClipboard(embedPageUrl, "link")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-surface border border-border hover:bg-muted transition-colors"
              >
                {copied === "link" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
