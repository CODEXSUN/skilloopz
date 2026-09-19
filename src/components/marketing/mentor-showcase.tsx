const linkedInProfile =
  "https://www.linkedin.com/in/arunezzarro?utm_source=share_via&utm_content=profile&utm_medium=member_android";

const mentors = [
  {
    name: "Nikhil Maurya",
    focus: "LearnFlu",
    initials: "NM",
    image: "/images/mentors/nikhil-maurya-generated.png",
    gradient: "from-fuchsia-500/45 via-violet-500/15 to-transparent",
  },
  {
    name: "Nidhi",
    focus: "LearnFlu",
    initials: "NI",
    image: "/images/mentors/nidhi-generated.png",
    gradient: "from-cyan-500/40 via-blue-500/15 to-transparent",
  },
  {
    name: "Preeyanka",
    focus: "LearnFlu",
    initials: "PR",
    image: "/images/mentors/preeyanka-generated.png",
    gradient: "from-amber-400/35 via-orange-500/15 to-transparent",
  },
  {
    name: "Madhu",
    focus: "Stock Market",
    initials: "MA",
    image: "/images/mentors/madhu-generated.png",
    gradient: "from-emerald-400/40 via-teal-500/15 to-transparent",
  },
];

export function MentorShowcase() {
  return (
    <section
      id="mentors"
      className="marketing-stage px-4 py-16 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[.2em] text-fuchsia-300">
            MEET THE TEAM
          </p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">
            Our Mentors Make The Difference
          </h2>
        </div>
        <div className="mt-10 grid auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto pb-4 [scrollbar-width:none] md:auto-cols-auto md:grid-flow-row md:grid-cols-2 xl:grid-cols-4">
          {mentors.map((mentor) => (
            <article
              key={mentor.name}
              className="group snap-start overflow-hidden rounded-3xl border border-white/10 bg-[#0b0c15] shadow-[0_24px_70px_rgba(0,0,0,.2)]"
            >
              <div
                className={`relative grid aspect-[4/4.5] place-items-center overflow-hidden bg-gradient-to-br ${mentor.gradient}`}
              >
                <Image
                  src={mentor.image}
                  alt={`Illustrative generated portrait for ${mentor.name}`}
                  fill
                  sizes="(max-width: 767px) 85vw, (max-width: 1279px) 45vw, 25vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,6,13,.72),transparent_60%)]" />
                <span className="absolute bottom-5 left-5 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20 text-xs font-semibold text-white/80 backdrop-blur">
                  {mentor.initials}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {mentor.name}
                </h3>
                <p className="mt-1 text-sm text-white/60">{mentor.focus}</p>
                <a
                  href={linkedInProfile}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/10"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4 fill-current"
                  >
                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.23 8.02h4.54V23H.23V8.02zM7.67 8.02h4.35v2.05h.06c.61-1.15 2.09-2.36 4.3-2.36 4.6 0 5.45 3.02 5.45 6.95V23h-4.53v-7.34c0-1.75-.03-4-2.44-4-2.44 0-2.81 1.9-2.81 3.87V23H7.67V8.02z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
import Image from "next/image";
