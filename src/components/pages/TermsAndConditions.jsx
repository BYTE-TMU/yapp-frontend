import { Link } from 'react-router-dom';
import YappLogo from '../../assets/Yapp White logo.png';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/10">
      {title}
    </h2>
    <div className="text-gray-400 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const SubSection = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-gray-300 mb-2">{title}</h3>
    <div className="text-gray-400 text-sm leading-relaxed">{children}</div>
  </div>
);

const BulletList = ({ items }) => (
  <ul className="list-none space-y-1 ml-2">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2">
        <span className="text-orange-500 mt-1 shrink-0">—</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const LabeledList = ({ items }) => (
  <ul className="list-none space-y-3 ml-2">
    {items.map(({ label, body, url }, i) => (
      <li key={i} className="flex gap-2">
        <span className="text-orange-500 mt-1 shrink-0">—</span>
        <span>
          <span className="text-gray-300 font-medium">{label}</span>
          {body && <span className="text-gray-400"> {body}</span>}
          {url && <span className="block text-gray-600 text-xs mt-0.5">{url}</span>}
        </span>
      </li>
    ))}
  </ul>
);

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-300">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/[0.05] px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/">
            <img src={YappLogo} alt="Yapp" className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        {/* Title */}
        <div className="mb-12">
          <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-3">
            BYTE — Build Your Technical Experience · Toronto Metropolitan University
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Terms and Conditions</h1>
          <p className="text-gray-500 text-sm">Last Updated: March 27, 2026</p>
          <div className="mt-6 h-px bg-gradient-to-r from-orange-500/40 via-white/5 to-transparent" />
        </div>

        {/* Introduction */}
        <div className="mb-10 text-gray-400 text-sm leading-relaxed space-y-4">
          <p>
            These Terms and Conditions ("Terms") govern your access to and use of Yapp, a campus social platform
            developed and operated by BYTE (Build Your Technical Experience), a student-led organization at Toronto
            Metropolitan University ("TMU").
          </p>
          <p>
            By creating an account or using Yapp in any capacity, you agree to be bound by these Terms. If you do
            not agree, you must not use the platform.
          </p>
          <p>
            Yapp is a student-built, non-commercial project. It is not officially operated by or affiliated with
            Toronto Metropolitan University. Your use of Yapp is also governed by our{' '}
            <Link to="/privacy" className="text-orange-400 hover:text-orange-300 transition-colors">
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference. By agreeing to these Terms, you also agree to our
            Privacy Policy.
          </p>
          <p>
            These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable
            therein, including the Freedom of Information and Protection of Privacy Act (FIPPA) and the Personal
            Information Protection and Electronic Documents Act (PIPEDA) where applicable.
          </p>
        </div>

        {/* Section 1 */}
        <Section title="Section 1 — User Accounts & Eligibility">
          <SubSection title="1.1  Eligibility">
            <p>
              Yapp is intended for students, staff, and members of the TMU community. By registering, you confirm that
              you are a current or former member of the TMU community or have been granted access by a BYTE team
              member. Yapp is not directed at individuals under the age of 16. By registering, you confirm that you
              are at least 16 years of age.
            </p>
          </SubSection>
          <SubSection title="1.2  Account Registration">
            <p>
              To use Yapp, you must create an account using a valid email address. You are responsible for maintaining
              the confidentiality of your login credentials and for all activity that occurs under your account.
            </p>
          </SubSection>
          <SubSection title="1.3  Accurate Information">
            <p>
              You agree to provide accurate, current, and complete information when creating your account.
              Impersonating another person, creating fake accounts, or providing false information is strictly
              prohibited.
            </p>
          </SubSection>
          <SubSection title="1.4  One Account Per User">
            <p>
              Each user may maintain only one active account. Creating multiple accounts to circumvent a suspension or
              ban is a violation of these Terms.
            </p>
          </SubSection>
          <SubSection title="1.5  Account Termination">
            <p>
              BYTE reserves the right to suspend or permanently terminate any account that violates these Terms,
              without prior notice, at its sole discretion. You may also delete your account at any time. Upon account
              deletion, your personal information will be handled in accordance with our Privacy Policy, Section 5.
            </p>
          </SubSection>
        </Section>

        {/* Section 2 */}
        <Section title="Section 2 — Content & Posting Rules">
          <SubSection title="2.1  User-Generated Content">
            <p>
              Yapp allows users to post content including text, images, Waypoint pins, events, and direct messages
              ("User Content"). You retain ownership of the content you post. By posting, you grant BYTE a
              non-exclusive, royalty-free license to display and distribute your content within the platform for the
              purpose of operating Yapp.
            </p>
          </SubSection>
          <SubSection title="2.2  Prohibited Content">
            <p className="mb-2">You agree not to post, share, or transmit any content that:</p>
            <ul className="list-none space-y-1 ml-2">
              {[
                ['(a)', 'is unlawful, defamatory, harassing, threatening, or abusive;'],
                ['(b)', 'constitutes hate speech or discriminates based on race, ethnicity, gender, religion, sexual orientation, disability, or any other protected ground under the Ontario Human Rights Code;'],
                ['(c)', 'contains nudity, sexually explicit material, or graphic violence;'],
                ['(d)', "constitutes sexual violence, sexual harassment, or the non-consensual sharing of intimate images, in violation of TMU's Sexual Violence Policy;"],
                ['(e)', 'infringes upon the intellectual property rights of any third party;'],
                ['(f)', 'contains spam, unsolicited advertising, or misleading information;'],
                ['(g)', 'promotes or facilitates illegal activity of any kind;'],
                ['(h)', 'impersonates any person, organization, or entity;'],
                ['(i)', 'facilitates academic misconduct including cheating, plagiarism, or unauthorized collaboration, in violation of TMU Senate Policy 60;'],
                ['(j)', 'contains malware, viruses, or any code intended to harm the platform or its users;'],
                ['(k)', 'violates the privacy of others, including sharing personal information without consent, in violation of our Privacy Policy.'],
              ].map(([label, text], i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-orange-500 shrink-0 font-mono text-xs mt-0.5">{label}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </SubSection>
          <SubSection title="2.3  Waypoint Pins">
            <p>
              Waypoint pins must represent real, current, and accurate information about activity on or near the TMU
              campus. Dropping pins with false, misleading, or harmful information is prohibited. Location data
              collected through the Waypoint feature is handled in accordance with our Privacy Policy, Section 4.
            </p>
          </SubSection>
          <SubSection title="2.4  Events">
            <p>
              Events created on Yapp must be genuine. Creating fake events, events designed to mislead attendees, or
              events that violate TMU's student conduct policies is prohibited.
            </p>
          </SubSection>
          <SubSection title="2.5  Reporting & Moderation">
            <p>
              Users may report content that violates these Terms. BYTE reserves the right to remove any content at
              its discretion. We are not obligated to review all content posted on the platform but will act on valid
              reports in a reasonable timeframe.
            </p>
          </SubSection>
          <SubSection title="2.6  Consequences of Violations">
            <p>
              Violations of this section may result in content removal, account suspension, or permanent termination,
              depending on the severity and frequency of the violation. Serious violations may also be referred to
              TMU's Student Conduct Office as described in Section 4.
            </p>
          </SubSection>
        </Section>

        {/* Section 3 */}
        <Section title="Section 3 — Liability & Disclaimers">
          <SubSection title="3.1  Student Project Disclaimer">
            <p>
              Yapp is a student-built project developed by BYTE at TMU. It is provided on an "as is" and "as
              available" basis. We make no representations or warranties of any kind, express or implied, regarding
              the reliability, availability, accuracy, or fitness of the platform for any particular purpose.
            </p>
          </SubSection>
          <SubSection title="3.2  No Guarantee of Uptime">
            <p>
              As a student project, Yapp may experience downtime, bugs, data loss, or other technical issues at any
              time and without notice. BYTE does not guarantee continuous or uninterrupted access to the platform.
            </p>
          </SubSection>
          <SubSection title="3.3  Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, BYTE and its team members shall not be liable for
              any indirect, incidental, special, or consequential damages arising from your use of or inability to
              use Yapp, including but not limited to loss of data, reputational harm, or any damages resulting from
              content posted by other users.
            </p>
          </SubSection>
          <SubSection title="3.4  Third-Party Content">
            <p>
              Yapp may display content posted by other users. BYTE does not endorse, verify, or take responsibility
              for any user-generated content. You interact with other users at your own discretion and risk.
            </p>
          </SubSection>
          <SubSection title="3.5  External Links">
            <p>
              Any links or references to third-party websites or services on Yapp are provided for convenience only.
              BYTE has no control over and accepts no responsibility for the content or practices of any third-party
              sites.
            </p>
          </SubSection>
          <SubSection title="3.6  Indemnification">
            <p>
              You agree to indemnify and hold harmless BYTE, its executives, members, and volunteers from any claims,
              damages, or expenses (including legal fees) arising from your use of Yapp or your violation of these
              Terms.
            </p>
          </SubSection>
          <SubSection title="3.7  Changes to the Platform">
            <p>
              BYTE reserves the right to modify, suspend, or discontinue Yapp or any of its features at any time,
              with or without notice, and without liability to users.
            </p>
          </SubSection>
        </Section>

        {/* Section 4 */}
        <Section title="Section 4 — Compliance with TMU Policies">
          <SubSection title="4.1  TMU Policy Framework">
            <p className="mb-3">
              Yapp operates as a student organization platform within the Toronto Metropolitan University community.
              All users are expected to conduct themselves in accordance with applicable TMU policies at all times
              while using Yapp, including but not limited to:
            </p>
            <LabeledList items={[
              {
                label: 'Senate Policy 61: Student Code of Non-Academic Conduct',
                body: "The primary code governing student behaviour at TMU. It applies to conduct that has an adverse effect on the safety, well-being, or learning environment of the TMU community, including conduct carried out through online platforms connected to the University. Use of Yapp that violates Policy 61 may be reported to TMU's Student Conduct Office at studentconduct@torontomu.ca.",
                url: 'torontomu.ca/senate/policies/student-code-of-non-academic-conduct-policy-61/',
              },
              {
                label: 'Senate Policy 60: Academic Integrity',
                body: 'Users must not use Yapp to facilitate academic misconduct of any kind, including but not limited to cheating, plagiarism, or unauthorized collaboration on academic work.',
                url: 'torontomu.ca/senate/policies/',
              },
              {
                label: 'Discrimination and Harassment Prevention Policy',
                body: 'TMU prohibits discrimination and harassment on all grounds protected under the Ontario Human Rights Code. This applies to conduct on Yapp. Users must not engage in any behaviour that constitutes harassment or discrimination toward any member of the TMU community.',
                url: 'torontomu.ca/equity/',
              },
              {
                label: 'Sexual Violence Policy',
                body: "Any content or conduct on Yapp that constitutes sexual violence, sexual harassment, or non-consensual sharing of intimate images is strictly prohibited and may be reported to TMU's Sexual Violence Support & Education team in addition to being actioned by BYTE.",
                url: 'torontomu.ca/sexual-violence-support/',
              },
              {
                label: 'TMU Student Computing Guidelines',
                body: "As a digital platform used by TMU students, Yapp use is subject to TMU's computing guidelines, which outline rights and responsibilities regarding responsible use of technology within the university community.",
                url: 'torontomu.ca/ccs/',
              },
              {
                label: 'TMU Statement of Student Rights and Responsibilities',
                body: "All users are expected to uphold the values outlined in TMU's Statement of Student Rights and Responsibilities, including mutual respect, equity, civility, dignity, and inclusivity.",
                url: 'torontomu.ca/senate/',
              },
            ]} />
          </SubSection>
          <SubSection title="4.2  Reporting to TMU">
            <p>
              BYTE reserves the right to refer conduct on Yapp to TMU's Student Conduct Office where it reasonably
              believes that a user's behaviour may constitute a breach of TMU's policies. This includes but is not
              limited to harassment, discrimination, academic misconduct, or threats to campus safety. Where such a
              referral is made, relevant account data may be disclosed in accordance with our Privacy Policy,
              Section 3.3.
            </p>
          </SubSection>
          <SubSection title="4.3  Consistency with TMU Values">
            <p>
              Yapp is built within and for the TMU community. All features, content, and interactions on the platform
              must be consistent with TMU's educational mission and its commitment to a safe, inclusive, and
              respectful campus environment.
            </p>
          </SubSection>
        </Section>

        {/* Section 5 */}
        <Section title="Section 5 — Privacy">
          <p>
            Your privacy is important to us. The collection, use, and storage of your personal information when you
            use Yapp is governed by our{' '}
            <Link to="/privacy" className="text-orange-400 hover:text-orange-300 transition-colors">
              Privacy Policy
            </Link>
            , which is available alongside these Terms. By agreeing to these Terms, you confirm that you have read
            and agree to our Privacy Policy.
          </p>
        </Section>

        {/* Section 6 */}
        <Section title="Section 6 — Changes to These Terms">
          <p>
            BYTE reserves the right to update or modify these Terms at any time. When changes are made, the "Last
            Updated" date at the top of this document will be revised. We will make reasonable efforts to notify
            users of significant changes. Continued use of Yapp after changes are posted constitutes your acceptance
            of the revised Terms.
          </p>
        </Section>

        {/* Section 7 */}
        <Section title="Section 7 — Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario and
            the federal laws of Canada applicable therein, including FIPPA and PIPEDA where applicable.
          </p>
        </Section>

        {/* Contact */}
        <div className="mt-12 p-6 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-base font-semibold text-white mb-4">Contact</h2>
          <p className="text-gray-400 text-sm mb-4">
            If you have questions about these Terms or our Privacy Policy, please reach out to the BYTE team through
            our official channels on Discord or Instagram.
          </p>
          <div className="text-sm space-y-1 text-gray-500">
            <p><span className="text-gray-400">Organization:</span>  BYTE — Build Your Technical Experience</p>
            <p><span className="text-gray-400">Institution:</span>  Toronto Metropolitan University</p>
            <p><span className="text-gray-400">Platform:</span>  Yapp</p>
          </div>
        </div>

        {/* Note */}
        <p className="mt-8 text-xs text-gray-600 leading-relaxed border-t border-white/[0.05] pt-8">
          Note: These Terms and Conditions were prepared for a student-led platform and are not a substitute for
          formal legal advice. BYTE recommends consulting a legal professional if Yapp expands beyond its current
          scope as a student project.
        </p>

        {/* Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} BYTE — Build Your Technical Experience, Toronto Metropolitan University. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-orange-500">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
