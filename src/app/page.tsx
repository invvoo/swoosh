import Link from 'next/link'
import { ArrowRight, Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react'

const SERVICES = [
  {
    title: 'Translation',
    description: 'Certified document translation accepted by USCIS, courts, and government agencies worldwide. Legal, medical, patent, real estate, website localization, and more.',
    href: '/translation',
    cta: 'Request a Translation',
    highlights: ['200+ languages', 'USCIS-accepted', 'Kept on file 3 years', 'Notarized & sealed'],
  },
  {
    title: 'Interpretation',
    description: 'Court-certified and CCHI-certified medical interpreters. Simultaneous, consecutive, escort, phone, and video interpretation in any language.',
    href: '/interpretation',
    cta: 'Request an Interpreter',
    highlights: ['Court certified', 'Medical (CCHI)', 'Simultaneous up to 90 langs', 'Phone available'],
  },
  {
    title: 'Equipment Rental',
    description: 'Simultaneous interpreting equipment for conferences, meetings, and events. Transmitters, receivers, booths, whisper cubes, and on-site technician support.',
    href: '/equipment-rental',
    cta: 'Rent Equipment',
    highlights: ['Transmitters & receivers', 'Soundproof booths', 'Whisper cubes', 'On-site technician'],
  },
  {
    title: 'Notary & Apostille',
    description: 'Certified translations notarized, sealed, and stamped. Apostille service for international use. Legal Document Assistant services available.',
    href: '/notary',
    cta: 'Get Certified',
    highlights: ['Apostille service', 'USCIS accepted', 'Immigration documents', 'Bankruptcy & divorce'],
  },
]

const STATS = [
  { value: '2003', label: 'In Business Since' },
  { value: '2,000+', label: 'Certified Translators' },
  { value: '200+', label: 'Languages' },
  { value: '20+', label: 'Years Experience' },
]

const SPECIALTIES = [
  'Legal & Contract', 'Medical & Healthcare', 'Patent (MA/PhD Translators)', 'Real Estate & Mortgage',
  'Immigration (USCIS)', 'Website Localization', 'Software & App Localization', 'Video Game Localization',
  'Transcription & Subtitling', 'Court Proceedings', 'Government & Regulatory', 'Financial Documents',
]

const CLIENT_CATEGORIES = [
  {
    label: 'Entertainment & Media',
    clients: 'CBS · Fox · DreamWorks · Columbia Pictures · NBCUniversal',
  },
  {
    label: 'Law Firms',
    clients: 'Baker & McKenzie · Sullivan & Cromwell · McDermott Will & Emery · Sheppard Mullin',
  },
  {
    label: 'Healthcare & Academic',
    clients: 'UCLA · USC · Cedar Sinai · City of Hope · Good Samaritan',
  },
  {
    label: 'Government & International',
    clients: 'FBI · LA Superior Court · DHS · SEC · United Nations · UNICEF · OECD',
  },
  {
    label: 'Corporations',
    clients: 'Johnson & Johnson · Pfizer · and hundreds more',
  },
]

const INTERPRETATION_TYPES = [
  { name: 'Simultaneous', desc: 'Live, real-time interpretation for conferences and large events — up to 90 languages simultaneously.' },
  { name: 'Court Certified', desc: 'State-certified court interpreters for depositions, hearings, trials, and legal proceedings.' },
  { name: 'Medical', desc: 'National Board and CCHI-certified medical interpreters for hospitals, clinics, and medical travel abroad.' },
  { name: 'Escort', desc: 'Accompanying interpreter for business travel, site visits, and one-on-one meetings.' },
  { name: 'Phone / Video', desc: 'On-demand phone and video interpretation. Available 24/7 for emergencies.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[#1a1a2e] font-bold text-lg">L.A. Translation &amp; Interpretation</span>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#services" className="hover:text-[#1a1a2e]">Services</a>
            <a href="#clients" className="hover:text-[#1a1a2e]">Clients</a>
            <a href="#contact" className="hover:text-[#1a1a2e]">Contact</a>
            <a href="tel:2133857781" className="flex items-center gap-1.5 text-[#1a1a2e] font-medium hover:underline">
              <Phone className="h-3.5 w-3.5" />(213) 385-7781
            </a>
            <Link href="/admin/login" className="px-4 py-1.5 rounded-lg bg-[#1a1a2e] text-white text-xs font-medium hover:bg-[#2a2a4e] transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#1a1a2e] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-medium mb-3 tracking-wide uppercase">Los Angeles · Since 2003</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Professional Translation &amp;<br />Interpretation Services
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            A network of 2,000+ certified translators and interpreters in 200+ languages.
            Serving corporations, law firms, hospitals, and government agencies since 2003.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/translation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1a1a2e] rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Request a Translation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/interpretation"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-colors">
              Book an Interpreter
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-blue-100 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a1a2e]">Our Services</h2>
            <p className="text-gray-500 mt-2">End-to-end language solutions for every need</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((svc) => (
              <div key={svc.title} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col">
                <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">{svc.title}</h3>
                <p className="text-gray-500 text-sm mb-4 flex-1">{svc.description}</p>
                <ul className="grid grid-cols-2 gap-1.5 mb-5">
                  {svc.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />{h}
                    </li>
                  ))}
                </ul>
                <Link href={svc.href}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1a2e] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a4e] transition-colors w-full justify-center">
                  {svc.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Translation Specialties */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Translation Specialties</h2>
            <p className="text-gray-500 mt-2 text-sm">Specialized translators for every industry and document type</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SPECIALTIES.map((sp) => (
              <div key={sp} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />{sp}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interpretation Types */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Interpretation Services</h2>
            <p className="text-gray-500 mt-2 text-sm">Court-certified, medical, and conference interpreters available</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTERPRETATION_TYPES.map((it) => (
              <div key={it.name} className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-[#1a1a2e] mb-1.5">{it.name}</h3>
                <p className="text-gray-500 text-sm">{it.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/interpretation"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a2e] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a4e] transition-colors">
              Book an Interpreter <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4">200+ Languages</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-2xl mx-auto">
            From major world languages to rare regional dialects — if it&apos;s spoken, we translate it.
          </p>
          <div className="text-sm text-gray-600 space-y-3">
            <p><span className="font-medium text-gray-800">European:</span> Armenian · French · German · Greek · Italian · Polish · Portuguese · Russian · Spanish · and more</p>
            <p><span className="font-medium text-gray-800">Asian / Pacific:</span> Chinese (Simplified &amp; Traditional) · Japanese · Korean · Vietnamese · Thai · Tagalog · Hindi · and more</p>
            <p><span className="font-medium text-gray-800">Middle East / African:</span> Arabic · Farsi · Hebrew · Amharic · Somali · Swahili · Yoruba · Zulu · and more</p>
            <p><span className="font-medium text-gray-800">Americas:</span> Spanish (Latin) · Brazilian Portuguese · French Canadian · Haitian-Creole · Nahuatl · and more</p>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section id="clients" className="py-16 px-6 bg-[#1a1a2e] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">Trusted By Leading Organizations</h2>
            <p className="text-gray-400 mt-2 text-sm">From Fortune 500s to federal agencies — since 2003</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CLIENT_CATEGORIES.map((cat) => (
              <div key={cat.label} className="bg-white/5 rounded-xl border border-white/10 p-5">
                <p className="font-semibold text-blue-300 text-xs uppercase tracking-wide mb-2">{cat.label}</p>
                <p className="text-gray-300 text-sm">{cat.clients}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1a1a2e] mb-10">Why L.A. Translation &amp; Interpretation</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: 'USCIS & Court Accepted', body: 'All certified translations are notarized, sealed, and stamped — accepted by USCIS, courts, and government agencies worldwide.' },
              { title: 'Certified Professionals', body: 'Court-certified interpreters and National Board / CCHI-certified medical interpreters. MA/PhD translators for patent work.' },
              { title: 'Documents Kept on File', body: 'Your translations are stored on file for 3 years, making re-ordering fast and simple.' },
              { title: 'Apostille Service', body: 'Full apostille certification for international document use. Bundled with certified translation for a complete package.' },
              { title: 'Conference Equipment', body: 'Full simultaneous interpretation equipment rental: transmitters, receivers, booths, and on-site technician support.' },
              { title: 'Sister School', body: 'Affiliated with the Court Interpreting School — our interpreters are trained to the highest professional standards.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="font-semibold text-[#1a1a2e] mb-1.5">{item.title}</p>
                <p className="text-gray-500 text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8">Upload your document for an instant quote, or call us to speak with a language specialist.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/translation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Get a Quote Online <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="tel:2133857781"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 rounded-lg font-medium hover:bg-white/10 transition-colors">
              <Phone className="h-4 w-4" /> (213) 385-7781
            </a>
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="bg-[#1a1a2e] text-white py-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <p className="font-bold text-lg mb-3">L.A. Translation &amp; Interpretation</p>
            <p className="text-gray-400 text-sm">Professional translation, interpretation, and language services since 2003.</p>
          </div>
          <div className="space-y-3 text-sm text-gray-300">
            <a href="tel:2133857781" className="flex items-center gap-2 hover:text-white">
              <Phone className="h-4 w-4 text-gray-500" /> (213) 385-7781
            </a>
            <a href="tel:2133680700" className="flex items-center gap-2 hover:text-white">
              <Phone className="h-4 w-4 text-gray-500" /> (213) 368-0700
            </a>
            <a href="mailto:info@latranslation.com" className="flex items-center gap-2 hover:text-white">
              <Mail className="h-4 w-4 text-gray-500" /> info@latranslation.com
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span>2975 Wilshire Blvd #205<br />Los Angeles, CA 90010</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Mon–Fri 9:00 AM – 6:00 PM</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <p className="font-medium text-white mb-3">Services</p>
            <Link href="/translation" className="block hover:text-white">Translation</Link>
            <Link href="/interpretation" className="block hover:text-white">Interpretation</Link>
            <Link href="/equipment-rental" className="block hover:text-white">Equipment Rental</Link>
            <Link href="/notary" className="block hover:text-white">Notary &amp; Apostille</Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} L.A. Translation &amp; Interpretation. All rights reserved.</p>
          <p>Fax: (213) 385-7784 · Legal Document Assistant: (213) 385-6228</p>
        </div>
      </footer>
    </div>
  )
}
