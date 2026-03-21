import BrandFooter from "./BrandFooter";
import BrandHeader from "./BrandHeader";

type InnerPageTemplateProps = {
  title: string;
  description: string;
};

export default function InnerPageTemplate({
  title,
  description,
}: InnerPageTemplateProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#1b243b]">
      <BrandHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-[#dbe4f8] bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-bold text-[#0f1d89] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#4a5475]">
            {description}
          </p>
        </section>
      </main>
      <BrandFooter />
    </div>
  );
}
