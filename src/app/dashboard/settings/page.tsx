"use client";

import { useState, useEffect } from "react";
import { Loader2, Copy, Check, ExternalLink, Code2 } from "lucide-react";
import toast from "react-hot-toast";

interface Project {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  primaryColor: string;
  isPublic: boolean;
}

export default function SettingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        const projs = data.projects || [];
        setProjects(projs);
        if (projs.length > 0) setSelected(projs[0]);
        setLoading(false);
      });
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(""), 2000);
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your project and integration options</p>
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

      {/* Public pages */}
      <div className="p-6 rounded-2xl border border-border bg-surface">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-primary" />
          Public Pages
        </h2>
        <div className="space-y-3">
          {[
            { label: "Feedback Board", path: `/p/${selected.slug}/feedback` },
            { label: "Roadmap", path: `/p/${selected.slug}/roadmap` },
            { label: "Changelog", path: `/p/${selected.slug}/changelog` },
          ].map((page) => (
            <div key={page.path} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm font-medium">{page.label}</p>
                <p className="text-xs text-muted-foreground font-mono">{baseUrl}{page.path}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(`${baseUrl}${page.path}`, page.label)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
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
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embed options */}
      <div className="p-6 rounded-2xl border border-border bg-surface">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-secondary" />
          Embed Options
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Add FeatureFlow to your own website with these integration options.
        </p>

        {/* Inline Embed */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-background">
            <h3 className="text-sm font-semibold mb-2">📌 Inline Embed</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Embed the feedback board directly into your page.
            </p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
{`<iframe
  src="${baseUrl}/p/${selected.slug}/feedback"
  style="width:100%;height:600px;border:none;border-radius:12px;"
  title="Feedback"
></iframe>`}
              </pre>
              <button
                onClick={() => copyToClipboard(`<iframe src="${baseUrl}/p/${selected.slug}/feedback" style="width:100%;height:600px;border:none;border-radius:12px;" title="Feedback"></iframe>`, "embed")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-surface border border-border hover:bg-muted transition-colors"
              >
                {copied === "embed" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Popup Widget */}
          <div className="p-4 rounded-xl border border-border bg-background">
            <h3 className="text-sm font-semibold mb-2">💬 Popup Widget</h3>
            <p className="text-xs text-muted-foreground mb-3">
              A floating feedback button in the corner of your site.
            </p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
{`<script
  src="${baseUrl}/widget.js"
  data-project="${selected.slug}"
  data-mode="popup"
  data-color="${selected.primaryColor}"
></script>`}
              </pre>
              <button
                onClick={() => copyToClipboard(`<script src="${baseUrl}/widget.js" data-project="${selected.slug}" data-mode="popup" data-color="${selected.primaryColor}"></script>`, "popup")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-surface border border-border hover:bg-muted transition-colors"
              >
                {copied === "popup" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Custom Path */}
          <div className="p-4 rounded-xl border border-border bg-background">
            <h3 className="text-sm font-semibold mb-2">🔗 Custom Path (Reverse Proxy)</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Host on your own domain by setting up a reverse proxy.
            </p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
{`# Nginx config example
location /feedback {
  proxy_pass ${baseUrl}/p/${selected.slug}/feedback;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}

# Vercel rewrites (vercel.json)
{
  "rewrites": [
    {
      "source": "/feedback/:path*",
      "destination": "${baseUrl}/p/${selected.slug}/feedback/:path*"
    }
  ]
}`}
              </pre>
              <button
                onClick={() => copyToClipboard(`location /feedback {\n  proxy_pass ${baseUrl}/p/${selected.slug}/feedback;\n}`, "proxy")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-surface border border-border hover:bg-muted transition-colors"
              >
                {copied === "proxy" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
