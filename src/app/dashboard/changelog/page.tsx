"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Trash2, X, Eye, EyeOff, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface ChangelogEntry {
  id: string;
  title: string;
  content: string;
  version: string | null;
  type: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface Project {
  slug: string;
  name: string;
}

const typeColors: Record<string, string> = {
  feature: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  improvement: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  bugfix: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  breaking: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

export default function ChangelogPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");
  const [type, setType] = useState("feature");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects || []);
        if (data.projects?.length > 0) setSelectedProject(data.projects[0].slug);
        setLoading(false);
      });
  }, []);

  const fetchEntries = useCallback(async () => {
    if (!selectedProject) return;
    setLoading(true);
    const res = await fetch(`/api/projects/${selectedProject}/changelog?published=false`);
    const data = await res.json();
    setEntries(data.changelogs || []);
    setLoading(false);
  }, [selectedProject]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async () => {
    if (!title || !content) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject}/changelog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, version: version || null, type, isPublished }),
      });
      if (res.ok) {
        toast.success(isPublished ? "Changelog published!" : "Draft saved");
        setShowModal(false);
        setTitle("");
        setContent("");
        setVersion("");
        setType("feature");
        setIsPublished(false);
        fetchEntries();
      }
    } catch {
      toast.error("Failed to create entry");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/changelog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      });
      toast.success(!current ? "Published!" : "Unpublished");
      fetchEntries();
    } catch {
      toast.error("Failed to update");
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this changelog entry?")) return;
    try {
      await fetch(`/api/changelog/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      fetchEntries();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Changelog</h1>
          <p className="text-muted-foreground mt-1">Announce updates and new features</p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 1 && (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border bg-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {projects.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : entries.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-surface text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No changelog entries</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Create your first entry to announce updates to your users.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Entry
          </button>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group p-6 rounded-2xl border border-border bg-surface hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold">{entry.title}</h3>
                    {entry.version && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono text-muted-foreground">
                        v{entry.version}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColors[entry.type] || ""}`}>
                      {entry.type}
                    </span>
                    {entry.isPublished ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePublish(entry.id, entry.isPublished)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    title={entry.isPublished ? "Unpublish" : "Publish"}
                  >
                    {entry.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-danger/60 hover:text-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-2xl bg-surface rounded-2xl border border-border shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface z-10">
              <h3 className="text-lg font-bold">New changelog entry</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dark mode is here! 🌙"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. 1.2.0"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="feature">Feature</option>
                    <option value="improvement">Improvement</option>
                    <option value="bugfix">Bug Fix</option>
                    <option value="breaking">Breaking Change</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Content * (Markdown supported)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={"## What's new\n\n- Feature 1\n- Feature 2\n\nDescribe what changed..."}
                  rows={10}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Publish immediately</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addEntry}
                disabled={saving || !title || !content}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPublished ? "Publish" : "Save Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
