const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "IBM",
  "Adobe",
  "Tesla",
  "Meta",
];

function CompanyMarks({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="trusted-company-set">
      {companies.map((company) => (
        <li className="trusted-company-mark" key={company}>
          {company}
        </li>
      ))}
    </ul>
  );
}

export function TrustedCompanies() {
  return (
    <section className="border-y border-white/[.06] bg-[#05060d] px-4 py-6 sm:px-8 lg:px-12">
      <p className="mb-5 text-center text-[10px] font-semibold tracking-[.28em] text-white/55">
        TRUSTED BY LEADING COMPANIES
      </p>
      <div
        className="trusted-company-marquee"
        aria-label="Trusted company logos"
      >
        <div className="trusted-company-track">
          <CompanyMarks />
          <CompanyMarks hidden />
        </div>
      </div>
    </section>
  );
}
