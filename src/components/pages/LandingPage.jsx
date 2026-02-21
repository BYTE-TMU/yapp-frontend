import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  Plus,
} from 'lucide-react';
import YappLogo from '../../assets/Yapp White logo.png';
import loopingVideo from '../../assets/loopingani.mp4';
import appImage0 from '../../assets/image0.jpg';
import appImage1 from '../../assets/image1.jpg';
import appImage2 from '../../assets/image2.jpg';
import appImageDesktop from '../../assets/image (6).png';

const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isRevealed];
};

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [typedText, setTypedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const [heroRef, heroRevealed] = useReveal();
  const [scenarioRef, scenarioRevealed] = useReveal();
  const [featuresRef, featuresRevealed] = useReveal();
  const [gridRef, gridRevealed] = useReveal();
  const [testimonialRef, testimonialRevealed] = useReveal();
  const [faqRef, faqRevealed] = useReveal();
  const [ctaRef, ctaRevealed] = useReveal();

  const typingTexts = [
    'Connect with your campus community',
    'Discover amazing events nearby',
    'Explore TMU like never before',
    'Join the next generation of campus social',
  ];

  useEffect(() => {
    const currentText = typingTexts[currentTextIndex];
    if (typedText.length < currentText.length) {
      const timeout = setTimeout(() => {
        setTypedText(currentText.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % typingTexts.length);
        setTypedText('');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [typedText, currentTextIndex]);

  const scenarios = [
    { time: '8:00 AM', text: 'Find the perfect study spot before class' },
    { time: '12:30 PM', text: 'Discover new food places on campus' },
    { time: '3:00 PM', text: 'Join a workshop you just heard about' },
    { time: '6:00 PM', text: 'Connect with your study group for finals' },
    { time: '9:00 PM', text: 'Share your campus moments with friends' },
  ];

  const features = [
    {
      icon: <Users className="w-7 h-7" />,
      title: 'Smart social networking',
      description:
        'Connect with classmates, join study groups, and build meaningful relationships with people who share your interests and academic goals.',
      highlights: [
        'Friend suggestions',
        'Study group finder',
        'Interest-based matching',
      ],
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: 'Campus event discovery',
      description:
        'Never miss out on campus life again. Discover events, parties, workshops, and activities happening right on your campus.',
      highlights: ['Real-time updates', 'Event recommendations', 'RSVP system'],
    },
    {
      icon: <MapPin className="w-7 h-7" />,
      title: 'Interactive campus map',
      description:
        'Navigate your campus with an interactive map that shows events, study spots, dining locations, and hidden gems.',
      highlights: [
        'Live event locations',
        'Study spot finder',
        'Campus navigation',
      ],
    },
  ];

  const phonePreviews = [
    { src: appImage0, label: 'Home feed' },
    { src: appImage1, label: 'Create posts' },
    { src: appImage2, label: 'Campus waypoint' },
  ];

  const testimonials = [
    {
      quote:
        'I found my study group for algorithms in the first week. We ended up acing the final together.',
      name: "Sarah, CS '26",
    },
    {
      quote:
        'Never knew so many cool events were happening on campus until I started using Yapp. Total game changer.',
      name: "Marcus, Business '25",
    },
    {
      quote:
        "The interactive map helped me find that hidden café in Kerr Hall. It's now my go-to spot.",
      name: "Priya, Engineering '27",
    },
    {
      quote:
        'Finally, a platform that actually gets what TMU students need. Not another generic social app.',
      name: "Jordan, Arts '26",
    },
  ];

  const faqs = [
    {
      q: 'Who can use Yapp?',
      a: 'Yapp is exclusively for verified TMU students. We verify your student status to keep the community authentic and safe.',
    },
    {
      q: 'How is Yapp different from other social platforms?',
      a: "Yapp is built specifically for campus life — discover events, find study spots, navigate campus, and connect with classmates who share your interests. It's not another generic social app.",
    },
    {
      q: 'Is my data safe?',
      a: 'Absolutely. We use enterprise-grade encryption and never sell your data. Your privacy is our top priority.',
    },
    {
      q: 'Can I use Yapp to find study groups?',
      a: 'Yes! Our smart matching connects you with classmates in your courses, making it easy to form study groups and collaborate on projects.',
    },
  ];

  const revealClass = (revealed) =>
    `transition-all duration-[800ms] ease-out ${revealed ? 'translate-y-0 opacity-100' : 'translate-y-[30px] opacity-0'}`;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#121212', fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Grain Overlay */}
      <div
        className="fixed inset-0 z-50 pointer-events-none mix-blend-soft-light"
        style={{
          opacity: 0.12,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        >
          <source src={loopingVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/50 via-[#121212]/30 to-[#121212]" />
      </div>

      {/* Floating Pill Nav */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl">
        <div className="bg-white/[0.07] backdrop-blur-[20px] rounded-full px-5 sm:px-6 py-3 flex items-center justify-between border border-white/[0.08] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
          <img src={YappLogo} alt="Yapp" className="h-8 w-auto" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-[1.03]"
            >
              Join now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 sm:pt-40 pb-20 px-4 text-center">
        {/* Blurred background blobs */}
        <div className="absolute top-20 left-[15%] w-72 sm:w-96 h-72 sm:h-96 bg-orange-500/[0.1] rounded-full blur-[120px] animate-float-gentle" />
        <div
          className="absolute top-40 right-[15%] w-64 sm:w-80 h-64 sm:h-80 bg-purple-500/[0.07] rounded-full blur-[120px] animate-float-gentle"
          style={{ animationDelay: '3s' }}
        />

        <div
          ref={heroRef}
          className={`max-w-2xl mx-auto ${revealClass(heroRevealed)}`}
        >
          <span className="text-orange-400/80 text-sm font-medium tracking-[0.15em] uppercase mb-8 block">
            The future of campus social
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 text-white">
            Your campus,
            <br />
            your{' '}
            <span className="font-cursive text-orange-400 text-[1.3em] leading-none">
              community
            </span>
          </h1>

          <div className="h-8 mb-8 flex items-center justify-center">
            <span className="text-gray-400 text-lg">
              {typedText}
              <span className="animate-pulse text-orange-400">|</span>
            </span>
          </div>

          <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto mb-10 px-4">
            Yapp is the revolutionary campus social platform designed exclusively
            for TMU students. Connect with your community, discover events, and
            explore your campus like never before.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-semibold text-base transition-all hover:scale-[1.03] shadow-[0_4px_24px_-4px_rgba(249,115,22,0.5)] flex items-center gap-2"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="bg-white/[0.06] hover:bg-white/[0.1] text-white px-8 py-3.5 rounded-full font-medium border border-white/[0.08] transition-all text-base"
            >
              Sign in
            </Link>
          </div>

          <p className="text-gray-600 text-sm mt-8 tracking-wide">
            Verified TMU students only
          </p>
        </div>
      </section>

      {/* Horizontal Scenario Scroll */}
      <section
        ref={scenarioRef}
        className={`relative z-10 py-16 sm:py-24 ${revealClass(scenarioRevealed)}`}
      >
        <div className="px-4 sm:px-8 max-w-6xl mx-auto mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            A day with{' '}
            <span className="font-cursive text-orange-400 text-[1.3em]">
              Yapp
            </span>
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 sm:px-8 pb-4 scrollbar-hide">
          <div className="flex-shrink-0 w-4 sm:w-0" />
          {scenarios.map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 h-40 bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-6 flex flex-col justify-between hover:border-orange-500/20 transition-all duration-300 group cursor-default"
            >
              <span className="text-sm text-gray-600 font-medium">
                {s.time}
              </span>
              <p className="text-lg text-gray-200 font-medium group-hover:text-orange-400 transition-colors duration-300">
                {s.text}
              </p>
            </div>
          ))}
          <div className="flex-shrink-0 w-4 sm:w-0" />
        </div>
      </section>

      {/* Main Features */}
      <section
        ref={featuresRef}
        className={`relative z-10 px-4 sm:px-8 py-16 sm:py-24 ${revealClass(featuresRevealed)}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Everything you need to{' '}
              <span className="font-cursive text-orange-400 text-[1.3em]">
                thrive
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Powerful features designed specifically for university life, built
              by students, for students
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-[2rem] p-8 hover:border-orange-500/20 transition-all duration-500 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6 group-hover:bg-orange-500/15 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2.5">
                  {feature.highlights.map((highlight, i) => (
                    <li
                      key={i}
                      className="flex items-center text-gray-400 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-orange-400/60 mr-2.5 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section
        ref={gridRef}
        className={`relative z-10 px-4 sm:px-8 py-16 sm:py-24 overflow-hidden ${revealClass(gridRevealed)}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              See it in{' '}
              <span className="font-cursive text-orange-400 text-[1.3em]">
                action
              </span>
            </h2>
            <p className="text-gray-500 text-lg">
              A platform designed to feel like home from day one
            </p>
          </div>

          {/* Phone Mockups — Cascading (desktop) */}
          <div className="hidden md:flex items-start justify-center gap-6 mb-20">
            {/* Left phone */}
            <div className="flex-shrink-0 w-[240px] opacity-80 translate-y-12">
              <div className="bg-[#1a1a1a] rounded-[2rem] p-2 border border-white/[0.08] shadow-[0_4px_40px_-8px_rgba(0,0,0,0.5)]">
                <img
                  src={appImage1}
                  alt="Create Post"
                  className="w-full rounded-[1.5rem]"
                />
              </div>
              <p className="text-center text-gray-600 text-sm mt-4">
                Create posts
              </p>
            </div>

            {/* Center phone — hero */}
            <div className="flex-shrink-0 w-[280px]">
              <div className="bg-[#1a1a1a] rounded-[2rem] p-2 border border-white/[0.08] shadow-[0_4px_40px_-8px_rgba(249,115,22,0.15)]">
                <img
                  src={appImage0}
                  alt="Home Feed"
                  className="w-full rounded-[1.5rem]"
                />
              </div>
              <p className="text-center text-gray-600 text-sm mt-4">
                Home feed
              </p>
            </div>

            {/* Right phone */}
            <div className="flex-shrink-0 w-[240px] opacity-80 translate-y-24">
              <div className="bg-[#1a1a1a] rounded-[2rem] p-2 border border-white/[0.08] shadow-[0_4px_40px_-8px_rgba(0,0,0,0.5)]">
                <img
                  src={appImage2}
                  alt="Campus Map"
                  className="w-full rounded-[1.5rem]"
                />
              </div>
              <p className="text-center text-gray-600 text-sm mt-4">
                Campus waypoint
              </p>
            </div>
          </div>

          {/* Phone Mockups — Horizontal scroll (mobile) */}
          <div className="flex md:hidden gap-4 overflow-x-auto pb-4 scrollbar-hide mb-12">
            <div className="flex-shrink-0 w-4" />
            {phonePreviews.map((phone, i) => (
              <div key={i} className="flex-shrink-0 w-[220px]">
                <div className="bg-[#1a1a1a] rounded-[2rem] p-2 border border-white/[0.08]">
                  <img
                    src={phone.src}
                    alt={phone.label}
                    className="w-full rounded-[1.5rem]"
                  />
                </div>
                <p className="text-center text-gray-600 text-sm mt-3">
                  {phone.label}
                </p>
              </div>
            ))}
            <div className="flex-shrink-0 w-4" />
          </div>

          {/* Desktop Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1a1a1a] rounded-[1.5rem] p-2 border border-white/[0.08] shadow-[0_4px_40px_-8px_rgba(0,0,0,0.4)]">
              {/* Browser chrome dots */}
              <div className="flex items-center gap-1.5 px-4 py-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/60" />
              </div>
              <img
                src={appImageDesktop}
                alt="Yapp Desktop"
                className="w-full rounded-b-[1.25rem]"
              />
            </div>
            <p className="text-center text-gray-600 text-sm mt-4">
              Full desktop experience
            </p>
          </div>
        </div>
      </section>

      {/* Diary Testimonials */}
      <section
        ref={testimonialRef}
        className={`relative z-10 px-4 sm:px-8 py-16 sm:py-24 ${revealClass(testimonialRevealed)}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Students{' '}
              <span className="font-cursive text-orange-400 text-[1.3em]">
                love
              </span>{' '}
              Yapp
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/[0.05] rounded-[2rem] p-8 transition-all duration-300 hover:border-orange-500/10"
                style={{ transform: `rotate(${i % 2 === 0 ? 1 : -1}deg)` }}
              >
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-gray-700" />
                  <span className="font-cursive text-2xl text-gray-500">
                    {t.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section
        ref={faqRef}
        className={`relative z-10 px-4 sm:px-8 py-16 sm:py-24 ${revealClass(faqRevealed)}`}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Questions? We&apos;ve got{' '}
              <span className="font-cursive text-orange-400 text-[1.3em]">
                answers
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden transition-colors hover:border-white/[0.08]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                >
                  <span className="text-white font-medium pr-4">{faq.q}</span>
                  <Plus
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-500 ${openFaq === i ? 'rotate-45' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-500 ease-in-out ${openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-gray-400 px-6 pb-6 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className={`relative z-10 px-4 sm:px-8 py-16 sm:py-24 ${revealClass(ctaRevealed)}`}
      >
        <div className="max-w-xl mx-auto text-center relative">
          {/* Floating gradients */}
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/[0.06] rounded-full blur-[100px]" />
          <div className="absolute right-1/4 top-1/3 w-48 h-48 bg-purple-500/[0.04] rounded-full blur-[100px]" />

          <div className="relative">
            <div className="w-16 h-16 bg-[#1e1e1e] rounded-2xl mx-auto mb-8 flex items-center justify-center border border-white/[0.06]">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to join your{' '}
              <span className="font-cursive text-orange-400 text-[1.3em]">
                campus
              </span>
              ?
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
              Join thousands of TMU students already connecting, discovering,
              and exploring with Yapp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-[1.03] shadow-[0_4px_24px_-4px_rgba(249,115,22,0.4)]"
              >
                Join now
              </Link>
              <Link
                to="/login"
                className="text-gray-400 hover:text-white transition-colors font-medium"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-8 py-12 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img
              src={YappLogo}
              alt="Yapp"
              className="h-10 w-auto opacity-70"
            />
            <div className="flex items-center gap-6 text-gray-600 text-sm">
              <span>&copy; 2025 Yapp. All rights reserved.</span>
              <Link
                to="/login"
                className="hover:text-gray-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/login"
                className="hover:text-gray-400 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
