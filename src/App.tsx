import { FormEvent, ReactNode, useState, useRef, useEffect } from "react";

type IconName =
  | "book"
  | "chevron"
  | "clock"
  | "close"
  | "flask"
  | "home"
  | "leaf"
  | "lightbulb"
  | "menu"
  | "message"
  | "more"
  | "paperclip"
  | "pen"
  | "send"
  | "sparkle"
  | "target"
  | "user";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: (
      <>
        <path d="m7 7 10 10" />
        <path d="M17 7 7 17" />
      </>
    ),
    flask: (
      <>
        <path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3" />
        <path d="M7.5 15h9" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10M9 21v-6h6v6" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 4C12 4 5 8 5 15c0 3 2 5 5 5 7 0 10-8 10-16Z" />
        <path d="M4 21c2-5 6-8 12-11" />
      </>
    ),
    lightbulb: (
      <>
        <path d="M9 18h6M10 22h4" />
        <path d="M8.5 15.5A7 7 0 1 1 15.5 15.5c-.9.7-1.5 1.4-1.5 2.5h-4c0-1.1-.6-1.8-1.5-2.5Z" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    message: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    paperclip: <path d="m21 11.5-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 0 1-2.8-2.8l8.9-8.9" />,
    pen: (
      <>
        <path d="m15 5 4 4M4 20l1-5L16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 2Z" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 .8 2.2A5 5 0 0 0 15.8 8l2.2.8-2.2.8a5 5 0 0 0-3 3L12 15l-.8-2.4a5 5 0 0 0-3-3L6 8.8 8.2 8a5 5 0 0 0 3-2.8L12 3Z" />
        <path d="m19 15 .4 1a3 3 0 0 0 1.6 1.6l1 .4-1 .4a3 3 0 0 0-1.6 1.6l-.4 1-.4-1a3 3 0 0 0-1.6-1.6l-1-.4 1-.4a3 3 0 0 0 1.6-1.6l.4-1Z" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const concepts = [
  { name: "Photosynthesis equation", progress: 85, color: "#5d8f71" },
  { name: "Role of chlorophyll", progress: 70, color: "#6e9f7f" },
  { name: "Light-dependent reactions", progress: 42, color: "#d39a45" },
  { name: "Calvin cycle", progress: 20, color: "#d8a64d" },
];

const initialMessages = [
  {
    role: "tutor",
    text: "Let’s explore photosynthesis together. Rather than memorizing the equation, we’ll build it from what you already know.",
  },
  {
    role: "tutor",
    text: "Imagine you’re a plant on a sunny day. What are the three main things you’d need from your environment to make your own food?",
  },
  {
    role: "student",
    text: "Sunlight, water, and maybe oxygen?",
  },
];

type Page = "home" | "learn" | "library";

function Sidebar({
  open,
  onClose,
  page,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  page: Page;
  onNavigate: (page: Page) => void;
}) {
  const navItem = (item: Page) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
      page === item ? "bg-[#dfe9df] font-bold text-[#214e3d]" : "font-semibold text-[#68736d] hover:bg-white"
    }`;

  function navigate(destination: Page) {
    onNavigate(destination);
    onClose();
  }

  return (
    <aside
      className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-[#e4e6df] bg-[#f7f8f3] p-4 transition-transform duration-300 lg:static lg:translate-x-0`}
    >
      <div className="flex h-12 items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#214e3d] text-white shadow-sm">
            <Icon name="leaf" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[17px] font-extrabold tracking-[-0.03em] text-[#173f32]">Socratic</p>
            <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#829087]">AI Tutor</p>
          </div>
        </div>
        <button className="rounded-lg p-2 text-[#69756e] lg:hidden" onClick={onClose} aria-label="Close menu">
          <Icon name="close" />
        </button>
      </div>

      <nav className="mt-7 space-y-1.5">
        <button className={navItem("home")} onClick={() => navigate("home")}>
          <Icon name="home" className="h-[18px] w-[18px]" /> Home
        </button>
        <button className={navItem("learn")} onClick={() => navigate("learn")}>
          <Icon name="message" className="h-[18px] w-[18px]" /> Learn
        </button>
        <button className={navItem("library")} onClick={() => navigate("library")}>
          <Icon name="book" className="h-[18px] w-[18px]" /> My library
        </button>
      </nav>

      <div className="mt-8 flex items-center justify-between px-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#929b95]">Recent sessions</span>
        <button className="text-[#87918b]" aria-label="More session options">
          <Icon name="more" className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-2 space-y-1">
        <button onClick={() => navigate("learn")} className="w-full rounded-xl bg-white px-3 py-3 text-left shadow-[0_1px_5px_rgba(31,58,45,0.06)]">
          <p className="truncate text-[13px] font-bold text-[#31473d]">Photosynthesis basics</p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#929b95]">
            <Icon name="clock" className="h-3 w-3" /> Today, 10:42 AM
          </p>
        </button>
        <button className="w-full rounded-xl px-3 py-3 text-left">
          <p className="truncate text-[13px] font-semibold text-[#647069]">Newton’s laws of motion</p>
          <p className="mt-1 text-[11px] text-[#9aa29d]">Yesterday</p>
        </button>
        <button className="w-full rounded-xl px-3 py-3 text-left">
          <p className="truncate text-[13px] font-semibold text-[#647069]">French Revolution</p>
          <p className="mt-1 text-[11px] text-[#9aa29d]">Mar 18</p>
        </button>
      </div>

      <button className="mt-auto flex items-center gap-3 rounded-xl border border-[#e0e4dc] bg-white p-2.5 text-left shadow-sm">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e8ded0] text-xs font-bold text-[#655848]">AM</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-[#35453d]">Alex Morgan</p>
          <p className="text-[11px] text-[#8b948f]">Student</p>
        </div>
        <Icon name="more" className="h-4 w-4 text-[#8a938d]" />
      </button>
    </aside>
  );
}

interface Concept {
  name: string;
  progress: number;
  color: string;
}

interface MasteryData {
  overallMastery: number;
  concepts: Concept[];
  misconception?: string;
}

function MasteryPanel({ data }: { data?: MasteryData }) {
  const defaultData: MasteryData = {
    overallMastery: 54,
    concepts: [
      { name: "Photosynthesis equation", progress: 85, color: "#5d8f71" },
      { name: "Role of chlorophyll", progress: 70, color: "#6e9f7f" },
      { name: "Light-dependent reactions", progress: 42, color: "#d39a45" },
      { name: "Calvin cycle", progress: 20, color: "#d8a64d" },
    ],
    misconception: "Plants release oxygen, but they need carbon dioxide to make glucose.",
  };

  const masteryData = data || defaultData;

  return (
    <aside className="hidden w-[308px] shrink-0 border-l border-[#e8e8e1] bg-[#fcfcf9] px-5 py-6 xl:block">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a9e96]">Your progress</p>
          <h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em] text-[#233e34]">Concept mastery</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#e6f0e7] text-sm font-extrabold text-[#37654f]">
          {Math.round(masteryData.overallMastery)}%
        </div>
      </div>

      <div className="mt-7 space-y-5">
        {masteryData.concepts.map((concept) => (
          <div key={concept.name}>
            <div className="mb-2 flex justify-between gap-4 text-[12px]">
              <span className="font-semibold text-[#4a5b53]">{concept.name}</span>
              <span className="font-bold text-[#66736c]">{Math.round(concept.progress)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e8ebe5]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(concept.progress, 100)}%`, backgroundColor: concept.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {masteryData.misconception && (
        <div className="mt-8 rounded-2xl border border-[#e5e7df] bg-white p-4 shadow-[0_4px_16px_rgba(41,60,49,0.04)]">
          <div className="flex items-center gap-2 text-[#b1732d]">
            <Icon name="lightbulb" className="h-[18px] w-[18px]" />
            <p className="text-xs font-extrabold uppercase tracking-[0.08em]">Misconception spotted</p>
          </div>
          <p className="mt-3 text-[12px] leading-5 text-[#66716b]">{masteryData.misconception}</p>
          <button className="mt-3 text-[12px] font-bold text-[#3e7057] hover:underline">Review this concept →</button>
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-[#eef3e9] p-4">
        <div className="flex items-center gap-2 text-[#456553]">
          <Icon name="target" className="h-[18px] w-[18px]" />
          <p className="text-xs font-extrabold">Session goal</p>
        </div>
        <p className="mt-2 text-[12px] leading-5 text-[#657269]">Explain how light energy becomes stored chemical energy.</p>
      </div>

      <p className="mt-7 text-center text-[10px] leading-4 text-[#a0a69f]">Mastery updates as you work through each question.</p>
    </aside>
  );
}

function PageHeader({ title, onMenu }: { title: string; onMenu: () => void }) {
  return (
    <header className="flex h-[72px] shrink-0 items-center border-b border-[#e9e9e3] bg-white/90 px-5 backdrop-blur-md md:px-8">
      <button className="mr-3 rounded-lg p-2 text-[#53655c] lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" />
      </button>
      <h1 className="text-[15px] font-extrabold tracking-[-0.015em] text-[#284338]">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-xl border border-[#e1e5de] bg-white p-2.5 text-[#6f7d75] shadow-sm" aria-label="Notifications">
          <Icon name="clock" className="h-[17px] w-[17px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d08c3a] ring-2 ring-white" />
        </button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e8ded0] text-[11px] font-extrabold text-[#655848]">AM</div>
      </div>
    </header>
  );
}

function HomePage({ onStart, onMenu }: { onStart: () => void; onMenu: () => void }) {
  const topics = [
    { title: "Biology", subtitle: "Life, cells & ecosystems", icon: "leaf" as IconName, tone: "bg-[#e8f1e8] text-[#426b52]" },
    { title: "Physics", subtitle: "Motion, energy & forces", icon: "sparkle" as IconName, tone: "bg-[#e8eef6] text-[#4c678a]" },
    { title: "Chemistry", subtitle: "Matter, atoms & reactions", icon: "flask" as IconName, tone: "bg-[#f5eadf] text-[#9a693d]" },
    { title: "History", subtitle: "People, places & change", icon: "book" as IconName, tone: "bg-[#f0e8f3] text-[#775780]" },
  ];

  return (
    <>
      <PageHeader title="Home" onMenu={onMenu} />
      <div className="chat-scroll flex-1 overflow-y-auto bg-[#fbfcf8] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1080px]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#89958e]">Monday, March 24</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#1f4034] sm:text-4xl">Good morning, Alex.</h2>
              <p className="mt-2 text-sm text-[#748079]">What would you like to understand better today?</p>
            </div>
            <button onClick={onStart} className="flex w-fit items-center gap-2 rounded-xl bg-[#214e3d] px-5 py-3 text-[13px] font-bold text-white shadow-[0_6px_18px_rgba(33,78,61,0.18)] hover:bg-[#183f31]">
              <Icon name="sparkle" className="h-4 w-4" /> Start a new lesson
            </button>
          </div>

          <section className="mt-9 overflow-hidden rounded-[24px] bg-[#204d3c] text-white shadow-[0_12px_36px_rgba(29,63,49,0.16)]">
            <div className="relative p-6 sm:p-8">
              <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full border-[38px] border-white/5" />
              <div className="absolute bottom-[-70px] right-28 h-40 w-40 rounded-full bg-[#d8b36a]/10 blur-sm" />
              <div className="relative grid gap-6 md:grid-cols-[1fr_280px] md:items-end">
                <div>
                  <div className="flex items-center gap-2 text-[#c5d8cc]">
                    <Icon name="clock" className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Continue learning</span>
                  </div>
                  <h3 className="mt-5 text-2xl font-extrabold tracking-[-0.03em]">Photosynthesis basics</h3>
                  <p className="mt-2 max-w-xl text-[13px] leading-6 text-[#bfd0c8]">You were exploring how plants turn light into chemical energy. Pick up right where you left off.</p>
                  <button onClick={onStart} className="mt-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[12px] font-extrabold text-[#214e3d] shadow-sm">
                    Resume lesson <Icon name="chevron" className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <div className="flex justify-between text-[11px] font-bold text-[#cbd9d2]">
                    <span>Session mastery</span><span>54%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[54%] rounded-full bg-[#e5bd70]" /></div>
                  <p className="mt-3 text-[11px] text-[#aebfb7]">4 concepts · 18 minutes studied</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-9 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold tracking-[-0.02em] text-[#284338]">Explore a topic</h3>
              <p className="mt-1 text-xs text-[#8b948f]">Choose a subject and your tutor will meet you at your level.</p>
            </div>
            <button className="hidden text-xs font-bold text-[#426e58] sm:block">View all topics →</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {topics.map((topic) => (
              <button key={topic.title} onClick={onStart} className="group rounded-2xl border border-[#e5e8e1] bg-white p-4 text-left shadow-[0_3px_12px_rgba(37,59,50,0.03)] transition hover:-translate-y-0.5 hover:shadow-md">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${topic.tone}`}>
                  <Icon name={topic.icon} className="h-[19px] w-[19px]" />
                </div>
                <p className="mt-4 text-sm font-extrabold text-[#31483e]">{topic.title}</p>
                <p className="mt-1 text-[11px] text-[#8a948e]">{topic.subtitle}</p>
                <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[#5e806c]">
                  Start learning <Icon name="chevron" className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-9 grid gap-4 pb-8 md:grid-cols-3">
            {[
              ["7", "day streak", "Keep your momentum going"],
              ["12", "concepts mastered", "Across 4 subjects"],
              ["3.4h", "time learning", "This month"],
            ].map(([value, label, caption]) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-[#e7e9e3] bg-white p-4">
                <p className="min-w-12 text-2xl font-extrabold tracking-[-0.04em] text-[#315b48]">{value}</p>
                <div><p className="text-xs font-bold text-[#41544b]">{label}</p><p className="mt-1 text-[10px] text-[#939b96]">{caption}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function LibraryPage({ onStart, onMenu }: { onStart: () => void; onMenu: () => void }) {
  const [query, setQuery] = useState("");
  const materials = [
    { title: "Cellular Biology — Unit 3", type: "PDF notes", detail: "24 pages · Biology", date: "Added Mar 22", color: "bg-[#e7f0e7] text-[#477058]", icon: "leaf" as IconName },
    { title: "Mechanics study guide", type: "Study notes", detail: "8 concepts · Physics", date: "Added Mar 18", color: "bg-[#e7edf5] text-[#516d90]", icon: "sparkle" as IconName },
    { title: "The French Revolution", type: "PDF textbook", detail: "42 pages · History", date: "Added Mar 12", color: "bg-[#f2e8e1] text-[#926745]", icon: "book" as IconName },
    { title: "Organic chemistry reactions", type: "Lecture notes", detail: "16 pages · Chemistry", date: "Added Mar 6", color: "bg-[#eee7f2] text-[#775883]", icon: "flask" as IconName },
    { title: "Algebra II practice set", type: "Worksheet", detail: "30 problems · Math", date: "Added Feb 28", color: "bg-[#f4ecdc] text-[#8a6a32]", icon: "pen" as IconName },
    { title: "Ecology and ecosystems", type: "Class notes", detail: "12 concepts · Biology", date: "Added Feb 20", color: "bg-[#e5f0ec] text-[#407065]", icon: "leaf" as IconName },
  ];
  const filtered = materials.filter((material) => material.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader title="My library" onMenu={onMenu} />
      <div className="chat-scroll flex-1 overflow-y-auto bg-[#fbfcf8] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1080px]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#929b95]">Your materials</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#1f4034]">Learn from what matters to you.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#748079]">Add notes, guides, or textbooks and use them as context in any tutoring session.</p>
            </div>
            <button className="flex w-fit items-center gap-2 rounded-xl bg-[#214e3d] px-5 py-3 text-[12px] font-bold text-white shadow-[0_6px_18px_rgba(33,78,61,0.18)]">
              <Icon name="paperclip" className="h-4 w-4" /> Add material
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-3 rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 shadow-sm focus-within:border-[#86a192]">
              <Icon name="book" className="h-4 w-4 text-[#929c96]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-[13px] text-[#354a41] outline-none placeholder:text-[#a0a8a3]" placeholder="Search your library…" />
            </label>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 text-[12px] font-bold text-[#5f6d66] shadow-sm">
              All subjects <Icon name="chevron" className="h-3 w-3 rotate-90" />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#344b40]">{filtered.length} materials</h3>
            <button className="text-[11px] font-bold text-[#77827c]">Recently added ↓</button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((material) => (
              <article key={material.title} className="group flex min-h-52 flex-col rounded-2xl border border-[#e3e6df] bg-white p-5 shadow-[0_4px_16px_rgba(37,59,50,0.035)] transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className={`grid h-11 w-11 place-items-center rounded-xl ${material.color}`}>
                    <Icon name={material.icon} className="h-5 w-5" />
                  </div>
                  <button className="rounded-lg p-1.5 text-[#929a95] hover:bg-[#f2f4f0]" aria-label={`Options for ${material.title}`}><Icon name="more" className="h-4 w-4" /></button>
                </div>
                <p className="mt-5 text-sm font-extrabold leading-5 text-[#30473c]">{material.title}</p>
                <p className="mt-1 text-[11px] text-[#87918b]">{material.type} · {material.detail}</p>
                <div className="mt-auto flex items-end justify-between pt-5">
                  <span className="text-[10px] text-[#a0a7a2]">{material.date}</span>
                  <button onClick={onStart} className="flex items-center gap-1 text-[11px] font-extrabold text-[#47715b]">Study this <Icon name="chevron" className="h-3 w-3" /></button>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-[#d9ded7] bg-white py-16 text-center">
              <p className="text-sm font-bold text-[#53655c]">No materials match “{query}”</p>
              <button onClick={() => setQuery("")} className="mt-2 text-xs font-bold text-[#47715b]">Clear search</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface Message {
  role: "tutor" | "student";
  text: string;
}

interface Analysis {
  mastery?: Record<string, number>;
  misconceptions?: string[];
  concepts?: string[];
}

export default function App() {
  const [page, setPage] = useState<Page>("learn");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfterMs, setRetryAfterMs] = useState<number | null>(null);
  const [masteryData, setMasteryData] = useState<MasteryData | undefined>();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const retryTimerRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current?.scrollTo(0, chatScrollRef.current.scrollHeight);
      }, 0);
    }
  }, [messages]);

  // Countdown timer for rate limit
  useEffect(() => {
    if (!retryAfterMs) return;

    const startTime = Date.now();
    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, retryAfterMs - elapsed);
      setRetryAfterMs(remaining);

      if (remaining > 0) {
        retryTimerRef.current = setTimeout(updateTimer, 100);
      }
    };

    retryTimerRef.current = setTimeout(updateTimer, 100);
    return () => clearTimeout(retryTimerRef.current);
  }, [retryAfterMs]);

  async function streamChat() {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role === "tutor" ? "model" : "user",
            content: m.text,
          })),
          hintLevel,
          topic: "Photosynthesis basics",
          material: undefined,
        }),
      });

      if (response.status === 429) {
        const data = (await response.json()) as { retryAfterMs?: number };
        setRetryAfterMs(data.retryAfterMs || 10000);
        setError("Rate limited. Please wait before trying again.");
        return;
      }

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message || "Failed to get tutor response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let tutorMessage = "";
      let buffer = "";

      // Add placeholder tutor message
      setMessages((prev) => [...prev, { role: "tutor", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6)) as { type: string; text?: string };
              if (event.type === "token" && event.text) {
                tutorMessage += event.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg && lastMsg.role === "tutor") {
                    lastMsg.text = tutorMessage;
                  }
                  return updated;
                });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Analyze the conversation
      if (tutorMessage) {
        await analyzeResponse(tutorMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function analyzeResponse(tutorMessage: string) {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role === "tutor" ? "model" : "user",
            content: m.text,
          })),
          knownConcepts: [],
          topic: "Photosynthesis basics",
        }),
      });

      if (response.status === 429) {
        const data = (await response.json()) as { retryAfterMs?: number };
        setRetryAfterMs(data.retryAfterMs || 10000);
        return;
      }

      if (response.ok) {
        const data = (await response.json()) as {
          ok: boolean;
          analysis?: Analysis;
        };
        if (data.ok && data.analysis) {
          // Update mastery panel with analysis
          const overallMastery = data.analysis.mastery
            ? Object.values(data.analysis.mastery).reduce((a, b) => a + b, 0) /
              Object.values(data.analysis.mastery).length
            : 54;

          setMasteryData({
            overallMastery,
            concepts: [
              { name: "Photosynthesis equation", progress: 85, color: "#5d8f71" },
              { name: "Role of chlorophyll", progress: 70, color: "#6e9f7f" },
              { name: "Light-dependent reactions", progress: 42, color: "#d39a45" },
              { name: "Calvin cycle", progress: 20, color: "#d8a64d" },
            ],
            misconception: data.analysis.misconceptions?.[0],
          });
        }
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      // Non-blocking failure - don't show error to user
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value || isLoading) return;

    setMessages((current) => [...current, { role: "student", text: value }]);
    setInput("");
    await streamChat();
  }

  return (
    <div className="flex h-screen min-h-[650px] overflow-hidden bg-[#fdfdfb] text-[#253b32]">
      {menuOpen && <button className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu overlay" />}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} page={page} onNavigate={setPage} />

      <main className="flex min-w-0 flex-1 flex-col">
        {page === "home" ? (
          <HomePage onStart={() => setPage("learn")} onMenu={() => setMenuOpen(true)} />
        ) : page === "library" ? (
          <LibraryPage onStart={() => setPage("learn")} onMenu={() => setMenuOpen(true)} />
        ) : (
          <>
        <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[#e9e9e3] bg-white/90 px-5 backdrop-blur-md md:px-8">
          <button className="mr-1 rounded-lg p-2 text-[#53655c] lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf2e8] text-[#456d56]">
            <Icon name="flask" className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-extrabold tracking-[-0.015em] text-[#284338]">Photosynthesis basics</h1>
            <p className="mt-0.5 text-[11px] text-[#8a948e]">Biology · 18 min session</p>
          </div>
          <button className="ml-auto hidden items-center gap-2 rounded-xl border border-[#dfe4dd] bg-white px-3.5 py-2 text-xs font-bold text-[#52635b] shadow-sm sm:flex">
            <Icon name="pen" className="h-3.5 w-3.5" /> Change topic
          </button>
          <button className="rounded-lg p-2 text-[#7b857f]" aria-label="Session menu">
            <Icon name="more" className="h-5 w-5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <section className="relative flex min-w-0 flex-1 flex-col">
            <div className="chat-scroll flex-1 overflow-y-auto px-5 pb-5 pt-8 sm:px-8" ref={chatScrollRef}>
              <div className="mx-auto max-w-[720px]">
                <div className="mb-8 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e8e9e3]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a0a69f]">Today</span>
                  <div className="h-px flex-1 bg-[#e8e9e3]" />
                </div>

                {messages.map((message, index) =>
                  message.role === "tutor" ? (
                    <div className="mb-5 flex items-start gap-3.5" key={index}>
                      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#214e3d] text-white shadow-sm">
                        <Icon name="sparkle" className="h-4 w-4" />
                      </div>
                      <div className="max-w-[580px] rounded-[6px_18px_18px_18px] border border-[#e6e8e1] bg-white px-4 py-3.5 text-[14px] leading-6 text-[#43534c] shadow-[0_3px_14px_rgba(35,62,50,0.05)]">
                        {message.text || (isLoading && index === messages.length - 1 ? "..." : "")}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 flex justify-end" key={index}>
                      <div className="max-w-[520px] rounded-[18px_6px_18px_18px] bg-[#e5ede4] px-4 py-3.5 text-[14px] leading-6 text-[#30483d]">
                        {message.text}
                      </div>
                    </div>
                  ),
                )}

                {error && (
                  <div className="mb-5 flex items-start gap-3.5">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#d4544a] text-white shadow-sm">
                      <Icon name="close" className="h-4 w-4" />
                    </div>
                    <div className="max-w-[580px] rounded-[6px_18px_18px_18px] border border-[#f5d1cc] bg-[#fef5f3] px-4 py-3.5 text-[14px] leading-6 text-[#7a3d36]">
                      {error}
                      {retryAfterMs ? (
                        <div className="mt-2 text-[12px]">
                          Retry in {Math.ceil(retryAfterMs / 1000)}s...
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="mb-5 flex items-start gap-3.5">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#214e3d] text-white shadow-sm">
                    <Icon name="sparkle" className="h-4 w-4" />
                  </div>
                  <div className="max-w-[580px]">
                    <div className="rounded-[6px_18px_18px_18px] border border-[#e6e8e1] bg-white px-4 py-3.5 text-[14px] leading-6 text-[#43534c] shadow-[0_3px_14px_rgba(35,62,50,0.05)]">
                      You’ve got two of them. Sunlight provides energy, and water comes through the roots. Now think about what plants take in through the tiny pores in their leaves. What gas might that be?
                    </div>
                    <div className="mt-3 overflow-hidden rounded-xl border border-[#ecdcbf] bg-[#fffaf0]">
                      <button
                        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
                        onClick={() => setHintLevel((level) => (level === 4 ? 1 : level + 1))}
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f6e6c6] text-[#a56d28]">
                          <Icon name="lightbulb" className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-[12px] font-extrabold text-[#79582f]">Hint {hintLevel} of 4</span>
                        <span className="text-[11px] font-semibold text-[#a48151]">{hintLevel === 4 ? "Start over" : "Make it clearer"}</span>
                        <Icon name="chevron" className="h-3.5 w-3.5 text-[#a48151]" />
                      </button>
                      <div className="border-t border-[#f0e1c5] px-4 py-3 text-[12px] leading-5 text-[#745f40]">
                        {hintLevel === 1 && "It’s the gas humans breathe out."}
                        {hintLevel === 2 && "Its name begins with “carbon” and it contains two oxygen atoms."}
                        {hintLevel === 3 && "Plants absorb CO₂ through openings called stomata."}
                        {hintLevel === 4 && "The gas is carbon dioxide (CO₂), which supplies the carbon plants use to build glucose."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-[#ecece6] bg-white px-5 py-4 sm:px-8">
              <form className="mx-auto max-w-[720px]" onSubmit={submit}>
                <div className="flex items-end gap-2 rounded-2xl border border-[#d9ded7] bg-white p-2 shadow-[0_6px_24px_rgba(34,56,46,0.08)] focus-within:border-[#7c9d89] focus-within:ring-2 focus-within:ring-[#dce9df]">
                  <button type="button" className="mb-0.5 rounded-xl p-2 text-[#8b958f] hover:bg-[#f3f5f1]" aria-label="Attach study material">
                    <Icon name="paperclip" className="h-[18px] w-[18px]" />
                  </button>
                  <textarea
                    className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-[14px] leading-5 text-[#31463d] outline-none placeholder:text-[#9ca49f]"
                    placeholder="Explain your thinking…"
                    rows={1}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                  <button
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#214e3d] text-white shadow-sm transition hover:bg-[#183f31] disabled:cursor-not-allowed disabled:opacity-40"
                    type="submit"
                    disabled={!input.trim() || isLoading || (retryAfterMs ? retryAfterMs > 0 : false)}
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Icon name="send" className="h-[17px] w-[17px]" />
                    )}
                  </button>
                </div>
                <p className="mt-2.5 text-center text-[10px] text-[#a0a69f]">Your tutor will guide you with questions, not just give you the answer.</p>
              </form>
            </div>
          </section>
          <MasteryPanel data={masteryData} />
        </div>
          </>
        )}
      </main>
    </div>
  );
}
