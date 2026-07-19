import { Calculator } from "@/components/Calculator";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
      <header className="mb-14 border-b border-rule pb-10">
        <div className="flex items-start justify-between gap-6">
          <p className="eyebrow">A rate card for your job</p>
          <ThemeToggle />
        </div>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
          Worth it?
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-graphite">
          Your salary is one number in a trade that also costs you hours,
          commutes and Sunday evenings. This works out what you actually earn
          per hour of your life, then measures it against your market.
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-graphite">
          Everything stays in this browser. Nothing is sent anywhere, and there
          is nothing here to sell you.
        </p>
      </header>

      <Calculator />

      <footer className="mt-20 border-t border-rule pt-6">
        <p className="text-xs leading-relaxed text-graphite">
          Wage data from the OECD and the World Bank. Formula and PPP dataset
          adapted from{" "}
          <a
            className="text-cobalt underline underline-offset-2"
            href="https://github.com/Zippland/worth-calculator"
            target="_blank"
            rel="noreferrer"
          >
            Zippland/worth-calculator
          </a>{" "}
          (MIT), with a reworked scoring model.
        </p>
      </footer>
    </main>
  );
}
