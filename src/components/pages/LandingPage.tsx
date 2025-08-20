'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LifeDropLogo from '@/components/ui/LifeDropLogo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { authClient } from '@/lib/auth-client';

export default function LandingPage() {
  const router = useRouter();
  const [searchResult, setSearchResult] = useState('');
  const [donorMsg, setDonorMsg] = useState(false);
  const [eligMsg, setEligMsg] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Handle Donate Now button click
  const handleDonateNow = async () => {
    try {
      // Check if user is authenticated
      const session = await authClient.getSession();

      if (session) {
        // User is authenticated, redirect to portal
        router.push('/portal');
      } else {
        // User is not authenticated, redirect to signup
        router.push('/signup');
      }
    } catch (error) {
      // If there's an error checking session, redirect to signup
      router.push('/signup');
    }
  };

  useEffect(() => {
    // Reveal on scroll animation
    const io = new IntersectionObserver(
      (entries) => entries.forEach(x => x.isIntersecting && x.target.classList.add('show')),
      { threshold: .12 }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Animated counters
    const animateCounter = (el: Element) => {
      const target = +(el as HTMLElement).dataset.target!;
      let cur = 0;
      const step = Math.max(1, Math.floor(target / 120));
      const timer = setInterval(() => {
        cur += step;
        if (cur >= target) {
          cur = target;
          clearInterval(timer);
        }
        el.textContent = cur.toLocaleString();
      }, 16);
    };

    const counters = document.querySelectorAll('.counter');
    const io2 = new IntersectionObserver(
      (entries) => entries.forEach(x => {
        if (x.isIntersecting) {
          animateCounter(x.target);
          io2.unobserve(x.target);
        }
      }),
      { threshold: .5 }
    );
    counters.forEach(el => io2.observe(el));

    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);

  const handleSearch = () => {
    const cities = ["Downtown Center", "Red Cross Hub", "City General Hospital", "Northside Clinic", "Community Hall"];
    const searchInput = (document.getElementById('search') as HTMLInputElement)?.value.trim();

    if (!searchInput) {
      setSearchResult('Please enter a city.');
      return;
    }

    const pick = cities[Math.floor(Math.random() * cities.length)];
    setSearchResult(`Nearest verified camp in <b>${searchInput}</b>: ${pick} • <span class="text-emerald-400">Open today</span>`);
  };

  const handleDonorForm = (e: React.FormEvent) => {
    e.preventDefault();
    setDonorMsg(true);
    (e.target as HTMLFormElement).reset();
  };

  const handleEligForm = (e: React.FormEvent) => {
    e.preventDefault();
    setEligMsg(true);
  };

  return (
    <>
      {/* Decorative blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 -left-16 w-64 h-64 rounded-full bg-blood-500/30 blur-3xl blob"></div>
        <div className="absolute bottom-10 -right-10 w-72 h-72 rounded-full bg-rose-500/30 blur-3xl blob"></div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 glass rounded-b-2xl">
          <nav className="flex items-center justify-between">
            <Link href="/" className="group">
              <LifeDropLogo />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#how" className="hover:text-white">How it works</a>
              <a href="#stories" className="hover:text-white">Stories</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="#cta" className="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/5">Become a donor</a>
              <button
                onClick={handleDonateNow}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blood-500 to-rose-500 hover:shadow-glow"
              >
                Donate now
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 md:pt-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 reveal">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-slate-300 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                1 donation can save up to 3 lives
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                Give Blood. <span className="bg-gradient-to-r from-blood-400 via-rose-400 to-blood-600 bg-clip-text text-transparent">Spread Hope.</span>
              </h1>
              <p className="text-slate-300/90 md:text-lg max-w-xl">
                Join thousands of everyday heroes donating blood through LifeDrop. Find nearby camps, match with recipients, and make a life-saving impact in minutes.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="shine"
                  onClick={handleDonateNow}
                >
                  Donate Now
                </Button>
                <Button variant="secondary" size="lg" onClick={() => setModalOpen(true)}>
                  Check Eligibility
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-slate-300/90">
                <div><span className="text-white font-bold text-lg counter" data-target="25000">0</span>+ donors</div>
                <div><span className="text-white font-bold text-lg counter" data-target="73000">0</span>+ lives impacted</div>
                <div><span className="text-white font-bold text-lg counter" data-target="120">0</span> cities</div>
              </div>
            </div>
            <div className="relative reveal">
              <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-blood-500/20 blur-3xl"></div>
              <div className="absolute -bottom-8 -right-8 w-56 h-56 rounded-full bg-rose-500/20 blur-3xl"></div>
              <Card className="p-6 relative">
                <div className="absolute inset-x-10 -top-4 h-8 bg-gradient-to-r from-blood-500/40 to-rose-500/40 blur-xl rounded-full"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-blood-500/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2c4 4 6 7.5 6 10.5A6 6 0 1 1 6 12.5C6 9.5 8 6 12 2Z" fill="#ef4444" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-sm text-slate-300">Nearest Camp</p>
                        <p className="font-semibold">City Hall • 0.8 km</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5">
                    <p className="text-sm text-slate-300">Blood Group Needed</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-blood-500/20 border border-blood-500/30">O+</span>
                      <span className="px-2 py-1 text-xs rounded-full bg-rose-500/20 border border-rose-500/30">B-</span>
                      <span className="px-2 py-1 text-xs rounded-full bg-white/10">AB+</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5">
                    <p className="text-sm text-slate-300">Impact This Week</p>
                    <p className="mt-2 text-3xl font-extrabold">1,327</p>
                    <p className="text-xs text-slate-400">Units collected</p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/5">
                  <p className="text-sm text-slate-300">Search nearby donation camps</p>
                  <div className="mt-2 flex gap-2">
                    <Input id="search" placeholder="Enter your city" className="w-full" />
                    <Button onClick={handleSearch}>Search</Button>
                  </div>
                  {searchResult && (
                    <p className="mt-2 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: searchResult }}></p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto reveal">
          <h2 className="text-3xl md:text-4xl font-extrabold">Built for rapid, safe donations</h2>
          <p className="mt-3 text-slate-300">Everything you need to donate or request blood—organized, verified, and lightning fast.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 reveal">
            <div className="w-10 h-10 rounded-lg bg-blood-500/20 grid place-items-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 13h8l-1 9 11-14h-8l1-9L3 13Z" fill="#ef4444" />
              </svg>
            </div>
            <h3 className="font-semibold">Smart Matching</h3>
            <p className="text-sm text-slate-300 mt-2">Instantly match donors and recipients by blood type and proximity.</p>
          </Card>
          <Card className="p-6 reveal">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 grid place-items-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2 2 7l10 5 10-5-10-5Zm0 9L2 7v10l10 5 10-5V7l-10 4Z" fill="#10b981" />
              </svg>
            </div>
            <h3 className="font-semibold">Verified & Secure</h3>
            <p className="text-sm text-slate-300 mt-2">ID checks and medical screening keep the process safe and trustworthy.</p>
          </Card>
          <Card className="p-6 reveal">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 grid place-items-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 5v5l4 2" stroke="#6366f1" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="font-semibold">Real-time Alerts</h3>
            <p className="text-sm text-slate-300 mt-2">Get notified when urgent requests appear near you.</p>
          </Card>
          <Card className="p-6 reveal">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 grid place-items-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 21s-7-4.35-7-10a7 7 0 0 1 14 0c0 5.65-7 10-7 10Z" fill="#f43f5e" />
              </svg>
            </div>
            <h3 className="font-semibold">Community First</h3>
            <p className="text-sm text-slate-300 mt-2">Stories, tips, and events to grow a culture of giving.</p>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold">How it works</h2>
            <p className="mt-3 text-slate-300">Three simple steps to change a life.</p>
          </div>
          <div className="md:col-span-2 grid gap-6">
            <Card className="p-6 flex gap-4 items-start reveal">
              <div className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center font-bold">1</div>
              <div>
                <h3 className="font-semibold">Create your donor profile</h3>
                <p className="text-sm text-slate-300 mt-1">Tell us your blood group and location to receive matched requests.</p>
              </div>
            </Card>
            <Card className="p-6 flex gap-4 items-start reveal">
              <div className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center font-bold">2</div>
              <div>
                <h3 className="font-semibold">Find a nearby camp</h3>
                <p className="text-sm text-slate-300 mt-1">We surface verified camps and hospitals closest to you.</p>
              </div>
            </Card>
            <Card className="p-6 flex gap-4 items-start reveal">
              <div className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center font-bold">3</div>
              <div>
                <h3 className="font-semibold">Donate and track impact</h3>
                <p className="text-sm text-slate-300 mt-1">Get updates when your donation is used to save lives.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stories */}
      <section id="stories" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto reveal">
          <h2 className="text-3xl md:text-4xl font-extrabold">Real stories. Real impact.</h2>
          <p className="mt-3 text-slate-300">From first-time donors to life-long heroes.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <Card className="p-6 reveal">
            <blockquote className="text-slate-200">&quot;I matched with a patient in my city in under 10 minutes.&quot;</blockquote>
            <figcaption className="mt-4 text-sm text-slate-400">Aisha, O+ donor</figcaption>
          </Card>
          <Card className="p-6 reveal">
            <blockquote className="text-slate-200">&quot;LifeDrop turned a scary night into hope for our family.&quot;</blockquote>
            <figcaption className="mt-4 text-sm text-slate-400">Rahul, Recipient&apos;s brother</figcaption>
          </Card>
          <Card className="p-6 reveal">
            <blockquote className="text-slate-200">&quot;The camps are well-organized and the app keeps me informed.&quot;</blockquote>
            <figcaption className="mt-4 text-sm text-slate-400">Maya, AB- donor</figcaption>
          </Card>
        </div>
      </section>

      {/* Eligibility / CTA */}
      <section id="eligibility" className="mx-auto max-w-7xl px-6 pt-8 pb-24">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          <Card className="lg:col-span-2 p-6 md:p-10 reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold">Are you eligible to donate?</h2>
            <p className="mt-2 text-slate-300">Quick checklist before you donate.</p>
            <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input type="checkbox" defaultChecked className="accent-blood-500" />
                <span>18–65 years old</span>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input type="checkbox" defaultChecked className="accent-blood-500" />
                <span>Weigh ≥ 50 kg</span>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input type="checkbox" defaultChecked className="accent-blood-500" />
                <span>Healthy & medication-free</span>
              </label>
            </div>
            <Button size="lg" onClick={() => setModalOpen(true)} className="mt-6">
              Start Quick Check
            </Button>
          </Card>
          <Card id="cta" className="p-6 md:p-8 reveal">
            <h3 className="text-xl md:text-2xl font-extrabold">Be a hero today</h3>
            <p className="mt-2 text-slate-300">Register as a donor in under 2 minutes.</p>
            <form onSubmit={handleDonorForm} className="mt-6 grid gap-3 text-sm">
              <Input name="name" placeholder="Full Name" required />
              <Input type="email" name="email" placeholder="Email" required />
              <Select name="group" required>
                <option value="" disabled>Blood Group</option>
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </Select>
              <Input name="city" placeholder="City" required />
              <Button type="submit" className="mt-2">Register</Button>
              {donorMsg && <p className="text-emerald-400">Thank you! We&apos;ll reach out soon.</p>}
            </form>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-6 pb-24">
        <Card className="p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-extrabold">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-white/10">
            <details className="group py-4 reveal">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span>Is it safe to donate blood?</span>
                <span className="transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-slate-300">Absolutely. All equipment is sterile and single‑use. Our partners follow the highest medical standards.</p>
            </details>
            <details className="group py-4 reveal">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span>How often can I donate?</span>
                <span className="transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-slate-300">Typically every 3 months for whole blood, depending on local guidelines and your health.</p>
            </details>
            <details className="group py-4 reveal">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span>Which blood types are in demand?</span>
                <span className="transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-slate-300">All types matter. O‑ is universal donor; AB+ is universal plasma donor. Local needs vary daily.</p>
            </details>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2c4 4 6 7.5 6 10.5A6 6 0 1 1 6 12.5C6 9.5 8 6 12 2Z" fill="#ef4444" />
            </svg>
            <span>© {new Date().getFullYear()} LifeDrop</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
            {/* <a href="/admin" className="hover:text-white text-xs">Admin</a> */}
          </div>
        </div>
      </footer>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)}></div>
          <div className="relative mx-auto mt-24 w-[92%] max-w-lg glass rounded-2xl border border-white/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold">Quick Eligibility Check</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleEligForm} className="mt-4 grid gap-3 text-sm">
              <label className="flex items-center gap-3">
                <input type="checkbox" required className="accent-blood-500" />
                <span>No recent tattoos (last 6 months)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" required className="accent-blood-500" />
                <span>No major surgery (last 6 months)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" required className="accent-blood-500" />
                <span>Hemoglobin levels are normal</span>
              </label>
              <Button type="submit" className="mt-2">Check</Button>
              {eligMsg && <p className="text-emerald-400">You look eligible! See nearby camps above.</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
