import { ArrowRight } from "lucide-react";
import { marketingPrograms } from "@/lib/programs/catalog";

export function ProgramsIndex() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#05060d] px-4 pb-24 pt-36 text-white sm:px-8 lg:px-12 lg:pt-44">
      <div className="mx-auto max-w-[1360px]">
        <p className="text-[13px] font-semibold tracking-[.2em] text-fuchsia-300">CAREER PROGRAMS</p>
        <h1 className="mt-5 max-w-4xl font-serif text-[clamp(3.4rem,7vw,7rem)] leading-[.88] tracking-[-.055em]">
          Choose the work you want to become known for.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
          Every program combines focused lessons, mentor review, practical projects, and career preparation.
        </p>
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {marketingPrograms.map((program) => (
            <a
              key={program.slug}
              href={`/programs/${program.slug}`}
              className="group relative min-h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b13] transition hover:-translate-y-1 hover:border-white/25"
            >
              <img
                src={program.coverImage}
                alt={program.coverAlt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070811] via-[#070811]/70 to-black/5" />
              <div className={`absolute inset-0 bg-gradient-to-br ${program.accent} opacity-10`} />
              <div className="relative flex h-full flex-col p-7">
                <p className="text-white/62 text-[13px] font-semibold">{program.category}</p>
                <h2 className="mt-8 font-serif text-4xl leading-[.95] tracking-tight">{program.title}</h2>
                <p className="text-white/62 mt-5 leading-7">{program.description}</p>
                <div className="mt-auto flex items-end justify-between gap-4 pt-10">
                  <span className="text-white/58 text-sm">{program.duration} · {program.level}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-white/25 transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
