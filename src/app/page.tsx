import Link from "next/link";
import {
  BarChart3,
  Brain,
  Shield,
  Activity,
  LayoutDashboard,
  Users,
  Lock,
  ArrowRight,
  Send,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Brain,
    title: "AI Classification",
    description:
      "Automatically categorize and prioritize incoming tickets using advanced AI models, so your team focuses on what matters most.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Separate portals for admins, agents, and customers with fine-grained permissions tailored to each role.",
  },
  {
    icon: Activity,
    title: "Real-Time Tracking",
    description:
      "Follow every ticket through its full lifecycle, from creation to resolution, with live status updates.",
  },
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description:
      "Actionable analytics and insights at a glance. Monitor team performance, response times, and ticket trends.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Internal notes, agent assignments, and seamless handoffs keep your team aligned and efficient.",
  },
  {
    icon: Lock,
    title: "Secure & Reliable",
    description:
      "Enterprise-grade security with encrypted passwords, role isolation, and audit-ready architecture.",
  },
];

const steps = [
  {
    icon: Send,
    step: "1",
    title: "Submit",
    description:
      "Customers create a support ticket through an intuitive portal, describing their issue in detail.",
  },
  {
    icon: Cpu,
    step: "2",
    title: "Classify",
    description:
      "Our AI engine instantly analyzes the ticket, assigns a category, and sets the right priority level.",
  },
  {
    icon: CheckCircle2,
    step: "3",
    title: "Resolve",
    description:
      "Agents receive organized, prioritized tickets and resolve them efficiently with full context.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold tracking-tight">TicketAI</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all hover:bg-muted hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-all hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-background" />
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Cpu className="h-4 w-4" />
              Powered by Google Gemini
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              AI-Powered Customer Support,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400">
              TicketAI combines intelligent ticket classification with a
              streamlined helpdesk to help your team resolve issues faster.
              Categorize, prioritize, and track every request — automatically.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-base font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 text-base font-medium transition-all hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Everything you need to manage support
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              A complete helpdesk solution with AI at its core, designed for
              teams of any size.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:border-indigo-500/30"
              >
                <div className="mb-4 inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-border/40 bg-slate-50/50 py-24 sm:py-32 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Three simple steps from issue to resolution.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((item) => (
              <div key={item.title} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span className="font-medium">TicketAI</span>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-500">
            Built with Next.js, Prisma, and Google Gemini
          </p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-600">
            TicketAI &copy; 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
