import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/landing_page" },
  {label: "Templates", href: "/landing_page/templates" },
  { label: "Request Design", href: "/landing_page/request" }

];

const services = [
  { label: "Logo & Branding", href: "/landing_page/services" },
  { label: "Graphic Design", href: "/landing_page/services" },
  { label: "Marketing Materials", href: "/landing_page/services" },
];

export default function BrandFooter() {
  return (
    <footer className="bg-[#0b162a] text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/Visual_Crafters_Logo_circle.png"
              alt="Visual Crafter Solutions"
              className="h-9 w-9 object-contain flex-shrink-0"
            />
            <span className="text-lg font-bold text-white leading-tight">Visual Crafter Solutions</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Creative designs made simple. Professional graphic design services for your business.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[#35b8e7]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Services</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {services.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-[#35b8e7]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Contacts</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <p>Contact Number: 09XX XXX XXXX</p>
            <p>Landline: 02-211-12</p>
            <p>Email: visualcraftersolution@gmail.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
