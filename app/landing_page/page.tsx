import Link from "next/link";
import BrandFooter from "./_components/BrandFooter";
import BrandHeader from "./_components/BrandHeader";
import IconRunway from "./_components/IconRunway";
import styles from "./landing-page.module.css";

const serviceCards = [
  {
    title: "Logo Design",
    icon: "/our_services/Logo Design.png",
  },
  {
    title: "Branding and Marketing Materials",
    icon: "/our_services/Branding and Marketing Materials.png",
  },
  {
    title: "Presentations and Infographics",
    icon: "/our_services/Presentations and Infographics.png",
  },
  {
    title: "Customized Design Requests",
    icon: "/our_services/Customized Design Requests.png",
  },
];

const packages = [
  "Starter Package",
  "Growth Package",
  "Enterprise Package",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#1b243b]">
      <BrandHeader />

      <main>
        <section className="relative overflow-hidden bg-[#f3f5f9]">
          <div className="absolute inset-x-0 top-2 sm:top-4 pointer-events-none">
            <IconRunway />
          </div>

          {/* Full-bleed floating circles that encompass the screen corners */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="hidden md:block absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#35b8e7]/20 blur-2xl" />
            <div className="hidden md:block absolute -right-36 -top-24 h-56 w-56 rounded-full bg-[#1f4db8]/20 blur-2xl" />
          </div>

          <div className="w-full flex flex-col items-center justify-center px-6 py-20 text-center">

            <h1 className="mx-auto w-full max-w-4xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-[#1f4db8]">
              Elevate Your Brand With
              <br />
              Professional Design
            </h1>
            <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg leading-7 text-[#4a5475]">
              Branding and digital transformation. We create experiences that matter.           
              </p>

            {/* removed inner boxed floating icons — using full-bleed corners above */}
          </div>
        </section>

        {/* ── Our Services ── */}
        <section className={styles.servicesSection}>
          {/* 3-D isometric diamond accents — top-right corner */}
          <div className={styles.diamondGroup} aria-hidden="true">
            <div className={`${styles.diamond} ${styles.diamondLg}`} />
            <div className={`${styles.diamond} ${styles.diamondMd}`} />
            <div className={`${styles.diamond} ${styles.diamondSm}`} />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
            <h2 className="text-center text-4xl sm:text-5xl font-extrabold text-white mb-14 tracking-tight">
              Our Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serviceCards.map((card) => (
                <article key={card.title} className={styles.serviceCard}>
                  <div className={styles.serviceCardIcon}>
                    <img
                      src={card.icon}
                      alt={card.title}
                      className="h-32 w-32 sm:h-44 sm:w-44 lg:h-52 lg:w-52 object-contain drop-shadow-md"
                    />
                  </div>
                  <div className={styles.serviceCardDivider} />
                  <h3 className={styles.serviceCardTitle}>{card.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-4xl sm:text-5xl font-extrabold text-[#1f4db8] tracking-tight mb-14">
              Services Packages
            </h2>
            <div className="mx-auto grid max-w-6xl gap-5 sm:gap-8 sm:grid-cols-3">
              {packages.map((item) => (
                <article
                  key={item}
                  className="min-h-48 sm:min-h-96 rounded-2xl border border-[#dbe4f8] bg-white p-6 sm:p-10 shadow-[0_12px_40px_rgba(15,29,137,0.10)] flex flex-col"
                >
                  <h3 className="text-xl font-semibold text-[#0f1d89]">{item}</h3>
                  <p className="mt-4 text-sm leading-6 text-[#4a5475]">
                    Structured deliverables built for different growth stages.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-linear-to-r from-[#2f34d0] to-[#282ac0] py-16 sm:py-28">
          <div className="mx-auto w-full max-w-4xl px-6 text-center sm:px-8 lg:px-12">
            <h2 className="text-3xl font-bold text-white sm:text-5xl leading-tight">
              Ready to Transform Your Vision?
            </h2>
            <p className="mt-5 text-base text-white/90">
              Let&apos;s discuss your design project and create something amazing together.
            </p>
            <Link
              href="/landing_page/request"
              className="mt-8 inline-flex rounded-full bg-[#c9deff] px-10 py-4 text-base font-semibold text-[#1b2f9b] transition-colors hover:bg-white"
            >
              Start Your Project
            </Link>
          </div>
        </section>
      </main>

      <BrandFooter />
    </div>
  );
}
