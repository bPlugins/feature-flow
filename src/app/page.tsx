import Link from "next/link";
import {
  MessageSquare,
  Map,
  FileText,
  ArrowRight,
  ChevronUp,
  Zap,
  Shield,
  Code2,
  Check,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { auth } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import { isSuperAdmin } from "@/lib/superadmin";

export default async function HomePage() {
  const session = await auth();
  const isSuper = isSuperAdmin(session?.user?.email);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">FeatureFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            {!isSuper && <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>}
            <a href="#embed" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Embed</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session?.user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 ml-2 text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4" />
                {session.user.name || "Dashboard"}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>The feedback tool your users will love</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-slide-up">
            Build what your{" "}
            <span className="gradient-text">customers</span>{" "}
            actually want
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Collect feedback, prioritize with upvotes, share your roadmap,
            and keep everyone updated with beautiful changelogs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/register"
              className="group flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 active:scale-95"
            >
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-medium border border-border hover:bg-surface-hover transition-all duration-200"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Hero visual */}
        <div className="max-w-5xl mx-auto mt-20 relative animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="rounded-2xl border border-border bg-surface shadow-2xl shadow-black/5 overflow-hidden">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-danger/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg bg-background text-xs text-muted-foreground font-mono">
                  yourapp.featureflow.dev/feedback
                </div>
              </div>
            </div>
            {/* Content preview */}
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-[auto,1fr] gap-6">
                {/* Sidebar */}
                <div className="hidden md:flex flex-col gap-2 w-48 pr-6 border-r border-border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Boards</div>
                  <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">Feature Requests</div>
                  <div className="px-3 py-2 rounded-lg text-muted-foreground text-sm hover:bg-muted/50">Bug Reports</div>
                  <div className="px-3 py-2 rounded-lg text-muted-foreground text-sm hover:bg-muted/50">Improvements</div>
                </div>
                {/* Feedback list */}
                <div className="space-y-3">
                  {[
                    { title: "Dark mode support", votes: 47, status: "in_progress", cat: "feature" },
                    { title: "Export data to CSV", votes: 32, status: "planned", cat: "feature" },
                    { title: "Mobile app improvements", votes: 28, status: "open", cat: "improvement" },
                    { title: "API rate limiting", votes: 15, status: "completed", cat: "feature" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-surface-hover transition-all duration-200">
                      <div className="flex flex-col items-center px-2 py-1.5 rounded-lg bg-muted min-w-[48px]">
                        <ChevronUp className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-bold">{item.votes}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`status-${item.status} px-2 py-0.5 rounded-full text-[10px] font-medium`}>
                            {item.status.replace("_", " ")}
                          </span>
                          <span className={`category-${item.cat} px-2 py-0.5 rounded-full text-[10px] font-medium`}>
                            {item.cat}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to ship better products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One platform to collect feedback, plan your roadmap, and announce updates.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {/* Feedback */}
            <div className="group p-8 rounded-2xl border border-border bg-surface hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Feedback Board</h3>
              <p className="text-muted-foreground leading-relaxed">
                Let customers submit feature requests, report bugs, and upvote ideas. No account required to vote.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Anonymous upvoting", "Category filters", "Status tracking", "Comment threads"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Roadmap */}
            <div className="group p-8 rounded-2xl border border-border bg-surface hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Map className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Public Roadmap</h3>
              <p className="text-muted-foreground leading-relaxed">
                Show your customers what&apos;s planned, in progress, and shipped. Build transparency and trust.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Kanban columns", "Linked feedback", "ETA display", "Quarter planning"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Changelog */}
            <div className="group p-8 rounded-2xl border border-border bg-surface hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Changelog</h3>
              <p className="text-muted-foreground leading-relaxed">
                Announce new features, improvements, and fixes with beautiful, markdown-powered changelog entries.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Markdown editor", "Version tagging", "Type badges", "Publish control"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Embed Section */}
      <section id="embed" className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Embed anywhere, your way
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Add feedback collection to your app with a single script tag. Choose from multiple integration options.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            <div className="p-6 rounded-2xl border border-border bg-surface">
              <Code2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2">Embed Widget</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drop an inline widget anywhere on your site. Fully customizable to match your brand.
              </p>
              <code className="block p-3 rounded-lg bg-muted text-xs font-mono break-all">
                {`<div id="featureflow" data-project="your-slug"></div>`}
                <br />
                {`<script src="/widget.js"></script>`}
              </code>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface">
              <MessageSquare className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-lg font-bold mb-2">Popup Widget</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A floating button that opens a feedback popup. Non-intrusive and always accessible.
              </p>
              <code className="block p-3 rounded-lg bg-muted text-xs font-mono break-all">
                {`<script src="/widget.js"`}
                <br />
                {`  data-mode="popup"></script>`}
              </code>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface">
              <Shield className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-bold mb-2">Custom Path</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Host feedback on your own domain path. Full white-label experience for your brand.
              </p>
              <code className="block p-3 rounded-lg bg-muted text-xs font-mono break-all">
                {`yourapp.com/feedback`}
                <br />
                {`→ proxy to FeatureFlow`}
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - hidden for super admin */}
      {!isSuper && <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {/* Free */}
            <div className="p-8 rounded-2xl border border-border bg-surface">
              <h3 className="text-lg font-bold mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Perfect for side projects</p>
              <ul className="space-y-3 mb-8">
                {["1 project", "100 feedback items", "Public roadmap", "Public changelog", "Community support"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted/50 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="relative p-8 rounded-2xl border-2 border-primary bg-surface shadow-xl shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-bold">
                POPULAR
              </div>
              <h3 className="text-lg font-bold mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold">$19</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">For growing products</p>
              <ul className="space-y-3 mb-8">
                {["5 projects", "Unlimited feedback", "Custom branding", "Embed widgets", "Priority support", "Analytics dashboard"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Team */}
            <div className="p-8 rounded-2xl border border-border bg-surface">
              <h3 className="text-lg font-bold mb-2">Team</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold">$49</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">For teams & agencies</p>
              <ul className="space-y-3 mb-8">
                {["Unlimited projects", "Unlimited feedback", "White-label", "Custom domain", "API access", "Dedicated support", "SSO"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted/50 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">FeatureFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FeatureFlow. Built for product teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
