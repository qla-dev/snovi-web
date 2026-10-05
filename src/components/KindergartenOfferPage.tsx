import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Gift,
  Headphones,
  Heart,
  Mail,
  Moon,
  School,
  Sparkles,
  Sun,
  Users,
  Volume2,
} from 'lucide-react';

const brandLogoSrc = `${import.meta.env.BASE_URL}logo.png`;
const qlaLogoSrc = 'https://deklarant.ai/build/images/logo-qla.png';
const CONTACT_EMAIL = 'podrska@snovi.fm';
const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Ponuda za obdaništa - snovi.fm')}`;
const MEDIA = 'https://snovi.qla.dev/storage/images/';

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

type Tone = 'violet' | 'sky' | 'emerald' | 'amber' | 'rose';

const tones: Record<Tone, { chip: string; dot: string; bubble: string; label: string; solid: string; soft: string }> = {
  violet: { chip: 'bg-violet-500/10 text-violet-700', dot: 'bg-violet-500', bubble: 'border-violet-200 bg-violet-50', label: 'text-violet-700', solid: 'bg-violet-600 border-violet-600 text-white', soft: 'bg-violet-500/10' },
  sky: { chip: 'bg-sky-500/10 text-sky-700', dot: 'bg-sky-500', bubble: 'border-sky-200 bg-sky-50', label: 'text-sky-700', solid: 'bg-sky-600 border-sky-600 text-white', soft: 'bg-sky-500/10' },
  emerald: { chip: 'bg-emerald-500/10 text-emerald-700', dot: 'bg-emerald-500', bubble: 'border-emerald-200 bg-emerald-50', label: 'text-emerald-700', solid: 'bg-emerald-600 border-emerald-600 text-white', soft: 'bg-emerald-500/10' },
  amber: { chip: 'bg-amber-500/10 text-amber-700', dot: 'bg-amber-500', bubble: 'border-amber-200 bg-amber-50', label: 'text-amber-700', solid: 'bg-amber-500 border-amber-500 text-white', soft: 'bg-amber-500/10' },
  rose: { chip: 'bg-rose-500/10 text-rose-700', dot: 'bg-rose-500', bubble: 'border-rose-200 bg-rose-50', label: 'text-rose-700', solid: 'bg-rose-600 border-rose-600 text-white', soft: 'bg-rose-500/10' },
};

const reveal = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: (index: number) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, delay: index * 0.14 } }),
};

type Story = { title: string; duration: string; image: string; narrator?: string };

/* ---------- Dialogue pieces ---------- */

const PersonBubble = ({ who, children, index = 0 }: { who: string; children: React.ReactNode; index?: number }) => (
  <motion.div custom={index} variants={reveal} className="ml-auto w-fit max-w-[90%]">
    <span className="mb-1.5 flex items-center justify-end gap-2 text-xs font-black text-slate-500">{who}</span>
    <div className="rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-lg shadow-slate-900/10">{children}</div>
  </motion.div>
);

const SnoviBubble = ({ tone, children, index = 1, who = 'snovi.fm' }: { tone: Tone; children: React.ReactNode; index?: number; who?: string }) => (
  <motion.div custom={index} variants={reveal} className="w-fit max-w-[92%] sm:max-w-[80%]">
    <span className={cn('mb-1.5 flex items-center gap-2 text-xs font-black', tones[tone].label)}>
      <Moon className="h-4 w-4" />
      {who}
    </span>
    <div className={cn('rounded-2xl rounded-bl-md border p-4 text-sm leading-6 text-slate-700', tones[tone].bubble)}>{children}</div>
  </motion.div>
);

function FilterChips<T extends string>({ tone, options, value, onChange }: { tone: Tone; options: { key: T; label: string }[]; value: T; onChange: (key: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={cn(
            'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
            value === option.key ? tones[tone].solid : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const ResultCard = ({ index = 2, children }: { index?: number; children: React.ReactNode }) => (
  <motion.div custom={index} variants={reveal} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-2xl shadow-slate-900/5">
    {children}
  </motion.div>
);

function StoryRow({ story }: { story: Story; key?: string }) {
  return (
  <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
    <img src={story.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" loading="lazy" referrerPolicy="no-referrer" />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-bold text-slate-900">{story.title}</p>
      <p className="truncate text-xs text-slate-500">{story.narrator ?? 'Aida Krehić'}</p>
    </div>
    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">{story.duration}</span>
  </motion.div>
  );
}

const Visual =({ children }: { children: React.ReactNode }) => (
  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="relative space-y-5">
    {children}
  </motion.div>
);

const ScenarioCopy = ({ number, tone, title, description, bullets, badge }: { number: string; tone: Tone; title: string; description: string; bullets: string[]; badge: string }) => (
  <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="self-center">
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]', tones[tone].chip)}>
        <Sparkles className="h-3.5 w-3.5" />
        Scenarij {number}
      </span>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{badge}</span>
    </div>
    <h3 className="mt-5 font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{title}</h3>
    <p className="mt-5 text-base leading-7 text-slate-500 sm:text-lg">{description}</p>
    <div className="mt-7 space-y-3">
      {bullets.map((item) => (
        <div key={item} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
          <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white', tones[tone].dot)}>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          {item}
        </div>
      ))}
    </div>
  </motion.div>
);

const ScenarioSection = ({ id, tone, flip, copy, visual }: { id: string; tone: Tone; flip?: boolean; copy: React.ReactNode; visual: React.ReactNode }) => (
  <section id={id} className="relative scroll-mt-20 py-20 sm:py-24">
    <div className={cn('pointer-events-none absolute top-1/3 h-72 w-72 rounded-full opacity-60 blur-3xl', flip ? 'left-0' : 'right-0', tones[tone].soft)} />
    <div className={cn('relative grid gap-12 lg:items-center', flip ? 'lg:grid-cols-[1.15fr_0.85fr]' : 'lg:grid-cols-[0.85fr_1.15fr]')}>
      <div className={cn(flip && 'lg:order-2')}>{copy}</div>
      <div className={cn(flip && 'lg:order-1')}>{visual}</div>
    </div>
  </section>
);

/* ---------- Scenario 1: afternoon rest, stories by age group ---------- */

type AgeGroup = 'mladja' | 'srednja' | 'starija';

const ageGroups: Record<AgeGroup, { label: string; forGroup: string; note: string; stories: Story[] }> = {
  mladja: {
    label: 'Mlađa grupa (3-4)',
    forGroup: 'mlađu grupu (3-4 godine)',
    note: 'kratke priče do 5 minuta, jednostavna radnja i puno ponavljanja',
    stories: [
      { title: 'Cvrčak i mrav', duration: '02:40', image: `${MEDIA}rZCh3FeJUiqP6CswmmJfS0yimz0VIfBVshwTQJ3I.webp` },
      { title: 'Lav i Mišica', duration: '04:00', image: `${MEDIA}qN8yJB2oAmdVlTL30KUBweV94Z00dPdq5Pmnjfmr.webp` },
      { title: 'Tri praščića', duration: '05:00', image: `${MEDIA}NETQQoTmXWK1BV5IHKLUoczRAsJJmtubsy1ITfaa.webp` },
    ],
  },
  srednja: {
    label: 'Srednja grupa (4-5)',
    forGroup: 'srednju grupu (4-5 godina)',
    note: 'priče od 3 do 7 minuta, taman za smirivanje prije odmora',
    stories: [
      { title: 'Princeza na zrnu graška', duration: '03:05', image: `${MEDIA}bCTNfwy48NDmAiGL8FBiFSFn1v5QvtAg089VaWWw.webp` },
      { title: 'Zlatokosa i 3 medvjeda', duration: '05:21', image: `${MEDIA}RyXuIt7Hol6WcbriZ7PzolsuESOGWlv2EWp0flIu.jpg` },
      { title: 'Kornjača i zec', duration: '06:55', image: `${MEDIA}Adik18lNEWUOcOtOYeYsUpFYPI6mCZNWnPaL4CuO.webp` },
    ],
  },
  starija: {
    label: 'Starija grupa (5-6)',
    forGroup: 'stariju grupu (5-6 godina)',
    note: 'duže bajke sa više likova, koje se mogu prepričati poslije odmora',
    stories: [
      { title: 'Palčica', duration: '08:24', image: `${MEDIA}F35FAaVcBplR58ETinksbQS2KC0URlarg8z1xHo7.webp` },
      { title: 'Crvenkapica', duration: '08:30', image: `${MEDIA}bEvAGwb4BgFXNOckSvsXalSqEaIZk2nkmQMVQyLd.webp` },
      { title: 'Ružno pače', duration: '08:30', image: `${MEDIA}bQKPUQ9UY8eo87GnImf664gWMpdrev3spBD3dPME.webp` },
    ],
  },
};

const RestVisual = () => {
  const [group, setGroup] = useState<AgeGroup>('mladja');
  const data = ageGroups[group];
  return (
    <Visual>
      <PersonBubble who="Vaspitačica">Djeca su nemirna pred popodnevni odmor. Šta da im pustim?</PersonBubble>
      <SnoviBubble tone="violet">
        Za <b>{data.forGroup}</b> preporučujemo {data.note}. Pustite priču preko zvučnika, ugasite svjetlo i neka djeca slušaju zatvorenih očiju.
      </SnoviBubble>
      <motion.div custom={2} variants={reveal}>
        <FilterChips tone="violet" value={group} onChange={setGroup} options={(Object.keys(ageGroups) as AgeGroup[]).map((key) => ({ key, label: ageGroups[key].label }))} />
      </motion.div>
      <ResultCard index={3}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900"><Sun className="h-4 w-4 text-violet-500" />Prijedlog za odmor</div>
          <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-black text-violet-700">narator: Aida Krehić</span>
        </div>
        <div className="mt-4 space-y-2">
          <AnimatePresence mode="wait">
            <motion.div key={group} className="space-y-2" exit={{ opacity: 0 }}>
              {data.stories.map((story) => <StoryRow key={story.title} story={story} />)}
            </motion.div>
          </AnimatePresence>
        </div>
      </ResultCard>
    </Visual>
  );
};

/* ---------- Scenario 2: soundscapes ---------- */

type Ambient = 'kisa' | 'plaza' | 'luka' | 'soba';

const ambients: Record<Ambient, { label: string; story: Story; when: string; bars: number[] }> = {
  kisa: { label: 'Kišna šuma', when: 'ravnomjeran šum kiše prekriva buku iz hodnika', bars: [34, 52, 40, 60, 46, 56, 38, 50, 44, 58], story: { title: 'Kišna šuma', duration: '∞', narrator: 'ambijent · bez prekida', image: `${MEDIA}VQXl0VoelB1EorSbENsYPzZiVT5iUGfCi9cI0QIW.jpg` } },
  plaza: { label: 'Plaža u sumrak', when: 'spori talasi daju ritam disanju', bars: [18, 36, 52, 40, 22, 20, 38, 54, 42, 24], story: { title: 'Plaža u sumrak', duration: '∞', narrator: 'ambijent · bez prekida', image: `${MEDIA}ymvK3YuA2U18tNevFHvNN9qb965WCCXblIqQRJ8b.webp` } },
  luka: { label: 'Tiha luka', when: 'tiho more i daleki zvukovi za duboko opuštanje', bars: [24, 32, 28, 36, 26, 34, 30, 22, 32, 26], story: { title: 'Tiha luka', duration: '∞', narrator: 'ambijent · bez prekida', image: `${MEDIA}l13qJyzJS3yceTjKT4hkzy1NTDEaxJ5fL7hTmZNj.jpg` } },
  soba: { label: 'Soba za odmor', when: 'mekana tišina sobe, za djecu koja teže zaspu uz zvukove prirode', bars: [16, 20, 18, 22, 17, 21, 19, 16, 20, 18], story: { title: 'Soba za odmor', duration: '∞', narrator: 'ambijent · bez prekida', image: `${MEDIA}CMrxZ8RDKeGtgP2dMoTcLa1iTnUmVcqHGae1vmQ3.jpg` } },
};

const AmbientVisual = () => {
  const [ambient, setAmbient] = useState<Ambient>('kisa');
  const data = ambients[ambient];
  return (
    <Visual>
      <PersonBubble who="Vaspitačica">Priča je gotova, a dvoje-troje djece još ne spava. Treba mi tiha pozadina.</PersonBubble>
      <SnoviBubble tone="sky">
        Nakon priče pustite ambijent <b>{data.label}</b>: {data.when}. Ambijenti traju bez prekida, pa ih ne morate ponovo pokretati.
      </SnoviBubble>
      <motion.div custom={2} variants={reveal}>
        <FilterChips tone="sky" value={ambient} onChange={setAmbient} options={(Object.keys(ambients) as Ambient[]).map((key) => ({ key, label: ambients[key].label }))} />
      </motion.div>
      <ResultCard index={3}>
        <div className="flex items-center gap-2 text-xs font-black text-slate-900"><Volume2 className="h-4 w-4 text-sky-600" />Sada svira</div>
        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div key={ambient} exit={{ opacity: 0 }}>
              <StoryRow story={data.story} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-5 flex h-20 items-center gap-1.5">
          {data.bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-full bg-gradient-to-t from-sky-500 to-sky-300"
              initial={false}
              animate={{ height: [`${h}%`, `${Math.min(100, h * 1.9)}%`, `${Math.max(12, h * 0.6)}%`, `${h}%`] }}
              transition={{ duration: 2.4 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
            />
          ))}
        </div>
      </ResultCard>
    </Visual>
  );
};

/* ---------- Scenario 3: story of the week, message for parents ---------- */

type Channel = 'viber' | 'email' | 'ploca';

const parentMessages: Record<Channel, { label: string; text: string }> = {
  viber: {
    label: 'Viber grupa',
    text: 'Dragi roditelji 🌙 Ove sedmice u vrtiću slušamo priču „Crvenkapica" uz aplikaciju snovi.fm. Pustite je i večeras kod kuće, djeca će prepoznati glas i priču. Aplikacija je besplatna za preuzimanje: snovi.fm/download',
  },
  email: {
    label: 'Email roditeljima',
    text: 'Poštovani roditelji,\n\nu našoj grupi uveli smo kratke audio priče pred popodnevni odmor, uz aplikaciju snovi.fm. Djeca slušaju priču zatvorenih očiju, bez gledanja u ekran.\n\nPriča ove sedmice je „Crvenkapica". Ako želite da večernji ritual kod kuće bude isti kao u vrtiću, aplikaciju možete preuzeti na snovi.fm/download.\n\nSrdačan pozdrav,\nvaše vaspitačice',
  },
  ploca: {
    label: 'Oglasna ploča',
    text: 'PRIČA SEDMICE: „Crvenkapica" 🌙\nSlušamo je pred odmor u vrtiću. Slušajte je i kod kuće uz aplikaciju snovi.fm.\nPreuzmite: snovi.fm/download',
  },
};

const ParentsVisual = () => {
  const [channel, setChannel] = useState<Channel>('viber');
  const [copied, setCopied] = useState(false);
  const message = parentMessages[channel];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Visual>
      <PersonBubble who="Roditelj">Šta ste danas slušali u vrtiću? Mala samo priča o vuku i baki 😊</PersonBubble>
      <SnoviBubble tone="emerald" who="Vaspitačica">
        <b>Crvenkapicu</b>, to nam je priča sedmice! Poslat ću vam poruku sa linkom, pa je možete pustiti i večeras kod kuće.
      </SnoviBubble>
      <motion.div custom={2} variants={reveal}>
        <FilterChips
          tone="emerald"
          value={channel}
          onChange={(key) => { setChannel(key); setCopied(false); }}
          options={(Object.keys(parentMessages) as Channel[]).map((key) => ({ key, label: parentMessages[key].label }))}
        />
      </motion.div>
      <ResultCard index={3}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900"><Mail className="h-4 w-4 text-emerald-600" />Gotova poruka · {message.label}</div>
          <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-emerald-700">
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Kopirano' : 'Kopiraj'}
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={channel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 whitespace-pre-line rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
            {message.text}
          </motion.p>
        </AnimatePresence>
      </ResultCard>
    </Visual>
  );
};

/* ---------- Scenario 4: evening ritual at home ---------- */

const ritualSteps = [
  { title: 'Ekrani se gase', detail: '30 min prije spavanja', pct: 100 },
  { title: 'Pidžama, zubi, prigušeno svjetlo', detail: '20 min prije spavanja', pct: 75 },
  { title: 'Priča u snovi.fm, telefon sa strane', detail: '10 min prije spavanja', pct: 50 },
  { title: 'Ambijent dok dijete ne zaspi', detail: 'bez prekida', pct: 25 },
];

const RitualVisual = () => (
  <Visual>
    <PersonBubble who="Roditelj">Kod kuće bez crtića ne može zaspati. Kako da to promijenimo?</PersonBubble>
    <SnoviBubble tone="amber">
      Pomaže <b>isti redoslijed svako veče</b>. Dijete sluša priču, ne gleda je, pa telefon može stajati sa strane, okrenut ekranom prema dolje.
    </SnoviBubble>
    <ResultCard index={2}>
      <div className="flex items-center gap-2 text-xs font-black text-slate-900"><Moon className="h-4 w-4 text-amber-600" />Večernji ritual · primjer</div>
      <div className="mt-4 space-y-3">
        {ritualSteps.map((step, i) => (
          <div key={step.title} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">{i + 1}. {step.title}</p>
              <p className="text-xs font-semibold text-slate-500">{step.detail}</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div className="h-full rounded-full bg-amber-400" initial={{ width: 0 }} whileInView={{ width: `${step.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3 + i * 0.15 }} />
            </div>
          </div>
        ))}
      </div>
    </ResultCard>
  </Visual>
);

/* ---------- Page ---------- */

const scenarioLinks = [
  { id: 'scenarij-1', label: 'Popodnevni odmor', tone: 'violet' as Tone },
  { id: 'scenarij-2', label: 'Ambijenti za san', tone: 'sky' as Tone },
  { id: 'scenarij-3', label: 'Poruka roditeljima', tone: 'emerald' as Tone },
  { id: 'scenarij-4', label: 'Ritual kod kuće', tone: 'amber' as Tone },
];

const included = [
  { icon: Gift, title: '12 mjeseci premium', desc: 'Svaka vaspitačica dobija godinu dana punog pristupa snovi.fm, bez naknade za vrtić.' },
  { icon: Headphones, title: 'Priče i ambijenti', desc: 'Bajke koje čitaju poznati BiH naratori i ambijenti koji traju bez prekida.' },
  { icon: Heart, title: 'Samo zvuk, bez ekrana', desc: 'Djeca slušaju zatvorenih očiju. Telefon ili zvučnik stoji sa strane.' },
  { icon: Users, title: 'Most prema roditeljima', desc: 'Gotove poruke za Viber, email i oglasnu ploču, da se ritual nastavi kod kuće.' },
];

const steps = [
  { title: 'Javite nam se', desc: `Pošaljite naziv vrtića i broj vaspitačica na ${CONTACT_EMAIL}.` },
  { title: 'Dobijate promo kodove', desc: 'Za svaku vaspitačicu šaljemo lični promo kod od 12 znakova.' },
  { title: 'Aktivacija u aplikaciji', desc: 'Vaspitačica preuzme snovi.fm, unese kod i dobija 12 mjeseci premium pristupa.' },
];

export function KindergartenOfferPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-violet-100 selection:text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onBack} aria-label="snovi.fm">
              <img src={brandLogoSrc} alt="snovi.fm" className="h-14 w-auto" />
            </button>
            <div className="hidden h-6 w-px bg-slate-200 md:block" />
            <span className="hidden text-lg font-bold tracking-tight md:block">Ponuda <span className="text-violet-600">· za obdaništa</span></span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#ukljuceno" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">Šta je uključeno</a>
            <a href="#scenariji" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">Kako se koristi</a>
            <a href="#ponuda" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">Ponuda</a>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-sm font-bold text-slate-900">12 mjeseci gratis</span>
          </div>
          <a href="#ponuda" className="rounded-full bg-violet-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white md:hidden">Ponuda</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="overflow-hidden px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">
              <School className="h-3.5 w-3.5" />
              Ponuda · snovi.fm za obdaništa
            </div>
            <h1 className="mb-6 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:mb-8 sm:text-6xl lg:text-7xl">
              Mirniji odmor u vrtiću. <span className="text-violet-600">Mirnije večeri kod kuće.</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-500 sm:mb-10 sm:text-xl">
              snovi.fm donosi audio priče i ambijente za smirivanje djece pred spavanje. Vaspitačice dobijaju <b className="text-slate-900">12 mjeseci premium pristupa besplatno</b>, a roditelji istu priču mogu pustiti i kod kuće.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
              <a href="#scenariji" className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-slate-900 px-3 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 sm:px-8 sm:py-4 sm:text-base">
                Kako se koristi
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href={CONTACT_MAILTO} className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-3.5 text-sm font-bold text-slate-900 transition-all hover:border-slate-400 sm:gap-3 sm:px-8 sm:py-4 sm:text-base">
                <Gift className="h-5 w-5 text-violet-600" />
                Prihvati ponudu
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="absolute -inset-4 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <img src={brandLogoSrc} alt="" className="h-10 w-10 rounded-2xl bg-violet-50 object-contain p-1" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">snovi.fm</p>
                    <p className="text-[11px] font-semibold text-slate-400">u vrtiću i kod kuće</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Primjer
                </div>
              </div>
              <motion.div initial="hidden" animate="visible" className="space-y-4 p-6 sm:p-8">
                <PersonBubble who="Vaspitačica" index={1}>Imamo 20 minuta do odmora. Šta da pustim mlađoj grupi?</PersonBubble>
                <SnoviBubble tone="violet" index={2}>
                  Pustite <b>Tri praščića</b> (5 min, narator Aida Krehić), a zatim ambijent <b>Kišna šuma</b> dok djeca ne zaspu.
                </SnoviBubble>
                <motion.div custom={3} variants={reveal} className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-violet-700">Priča</p><p className="mt-1 text-lg font-bold text-slate-900">05:00 min</p></div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-sky-700">Ambijent</p><p className="mt-1 text-lg font-bold text-slate-900">bez prekida</p></div>
                </motion.div>
              </motion.div>
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Kako se koristi</p>
                <div className="flex flex-wrap gap-2">
                  {scenarioLinks.map((s) => (
                    <a key={s.id} href={`#${s.id}`} className={cn('rounded-full px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-80', tones[s.tone].chip)}>{s.label}</a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Included */}
      <section id="ukljuceno" className="scroll-mt-20 bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Šta je uključeno</span>
            <h2 className="mb-6 font-serif text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">Jedna aplikacija za odmor i za laku noć</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">
              Vaspitačice koriste snovi.fm pred popodnevni odmor, a roditelji nastavljaju isti ritual kod kuće.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><item.icon className="h-6 w-6" /></div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section id="scenariji" className="scroll-mt-20 overflow-hidden bg-[#F8FAFC] pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-slate-400">4 scenarija</span>
            <h2 className="mb-6 font-serif text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">Kako izgleda dan sa snovi.fm</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">
              Primjeri razgovora sa stvarnim pričama iz biblioteke. Kliknite filtere da vidite prijedloge za druge grupe i ambijente.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            <ScenarioSection
              id="scenarij-1"
              tone="violet"
              copy={<ScenarioCopy number="01" tone="violet" badge="U vrtiću" title="Popodnevni odmor" description="Kratka priča prije odmora pomaže djeci da se smire i utihnu. Vaspitačica bira priču prema uzrastu grupe." bullets={['Priče prilagođene uzrastu, od 3 do 9 minuta', 'Poznati glas naratora, isti svaki dan', 'Pušta se preko zvučnika, bez ekrana']} />}
              visual={<RestVisual />}
            />
            <ScenarioSection
              id="scenarij-2"
              tone="sky"
              flip
              copy={<ScenarioCopy number="02" tone="sky" badge="U vrtiću" title="Ambijenti za san" description="Kada priča završi, ambijent nastavlja tiho da svira i prekriva buku iz hodnika i dvorišta." bullets={['Kiša, more, luka i tiha soba', 'Svira bez prekida dok se ne zaustavi', 'Može se pustiti odmah nakon priče']} />}
              visual={<AmbientVisual />}
            />
            <ScenarioSection
              id="scenarij-3"
              tone="emerald"
              copy={<ScenarioCopy number="03" tone="emerald" badge="Vrtić → roditelji" title="Priča sedmice i poruka roditeljima" description="Vrtić odabere priču sedmice, a roditelji dobiju gotovu poruku sa linkom za preuzimanje aplikacije." bullets={['Gotov tekst za Viber, email i oglasnu ploču', 'Kopiranje jednim klikom', 'Dijete prepoznaje priču i kod kuće']} />}
              visual={<ParentsVisual />}
            />
            <ScenarioSection
              id="scenarij-4"
              tone="amber"
              flip
              copy={<ScenarioCopy number="04" tone="amber" badge="Kod kuće" title="Večernji ritual bez crtića" description="Roditelji dobijaju jednostavan redoslijed za veče, u kojem priča zamjenjuje crtani film pred spavanje." bullets={['Isti redoslijed svako veče', 'Dijete sluša, ekran stoji sa strane', 'Ambijent nastavlja dok dijete ne zaspi']} />}
              visual={<RitualVisual />}
            />
          </div>
        </div>
      </section>

      {/* How to activate */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Aktivacija</span>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">Tri koraka do prvog odmora uz priču</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC] p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-sm font-black text-white">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer */}
      <section id="ponuda" className="scroll-mt-20 bg-[#F8FAFC] py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Ponuda</span>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">snovi.fm za vaš vrtić</h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-sm md:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-white p-8 lg:p-10">
              <h3 className="mb-6 text-xl font-bold text-slate-900">Uključeno u ponudu</h3>
              <ul className="space-y-3">
                {[
                  '12 mjeseci snovi.fm premium za svaku vaspitačicu',
                  'Lični promo kod za aktivaciju u aplikaciji (iOS i Android)',
                  'Cijela biblioteka priča i svi ambijenti',
                  'Gotove poruke za roditelje: Viber, email i oglasna ploča',
                  'Podrška pri prvom korištenju u grupi',
                  'Bez obaveze produženja nakon 12 mjeseci',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-8 bg-slate-900 p-8 text-white lg:p-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-200"><Gift className="h-3.5 w-3.5" />Za vaspitačice</span>
                <p className="mt-6 text-5xl font-black tracking-tight">0 KM</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-widest text-slate-400">12 mjeseci premium</p>
              </div>
              <div className="space-y-4">
                <a href={CONTACT_MAILTO} className="group flex h-14 items-center justify-center gap-2 rounded-2xl bg-violet-600 font-bold text-white transition hover:bg-white hover:text-slate-900">
                  Prihvati ponudu
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <p className="text-sm leading-relaxed text-slate-400">Roditelji aplikaciju preuzimaju besplatno, a pretplatu za kućno korištenje biraju sami na snovi.fm/pretplata.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:px-6 md:flex-row">
          <button type="button" onClick={onBack} className="flex items-center gap-4">
            <img src={brandLogoSrc} alt="snovi.fm" className="h-12 w-auto opacity-70 transition-opacity hover:opacity-100" />
          </button>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <p className="text-sm text-slate-400">© 2026 snovi.fm · Ponuda napravljena od strane</p>
            <a href="https://qla.dev/" target="_blank" rel="noopener noreferrer" className="opacity-80 transition-opacity hover:opacity-100">
              <img src={qlaLogoSrc} alt="qla.dev" className="h-6 object-contain" referrerPolicy="no-referrer" />
            </a>
          </div>
          <a href={CONTACT_MAILTO} className="text-sm font-semibold text-slate-500 transition-colors hover:text-violet-600">{CONTACT_EMAIL}</a>
        </div>
      </footer>
    </div>
  );
}
