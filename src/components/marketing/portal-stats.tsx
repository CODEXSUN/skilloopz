import { Award, BriefcaseBusiness, GraduationCap, UsersRound } from "lucide-react";

const stats = [
  { value: "20K+", label: "Students Enrolled", icon: UsersRound },
  { value: "50+", label: "Expert Mentors", icon: GraduationCap },
  { value: "200+", label: "Hiring Partners", icon: BriefcaseBusiness },
  { value: "95%", label: "Placement Rate", icon: Award },
];

export function PortalStats() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-8 lg:px-12">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 bg-[#090a14]/75 shadow-[0_24px_80px_rgba(0,0,0,.38)] backdrop-blur-2xl lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`flex min-w-0 items-center gap-3 px-4 py-4 sm:gap-4 sm:px-7 sm:py-5 ${index % 2 ? "border-l border-white/10" : ""} ${index > 1 ? "border-t border-white/10 lg:border-t-0" : ""} ${index > 0 ? "lg:border-l" : ""}`}
            >
              <Icon className="h-7 w-7 shrink-0 text-violet-300 sm:h-9 sm:w-9" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-xl font-semibold tracking-tight sm:text-2xl">{stat.value}</p>
                <p className="text-[13px] leading-4 text-white/65 sm:mt-0.5 sm:text-sm">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
