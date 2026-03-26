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

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last Updated: March 27, 2026</p>
          <div className="mt-6 h-px bg-gradient-to-r from-orange-500/40 via-white/5 to-transparent" />
        </div>

        {/* Introduction */}
        <div className="mb-10 text-gray-400 text-sm leading-relaxed space-y-4">
          <p>
            This Privacy Policy explains how Yapp, developed and operated by BYTE (Build Your Technical Experience),
            a student-led organization at Toronto Metropolitan University ("TMU"), collects, uses, stores, and protects
            your personal information when you use our platform.
          </p>
          <p>
            By creating an account or using Yapp in any capacity, you agree to the practices described in this Privacy
            Policy. If you do not agree, you must not use the platform. This Privacy Policy is incorporated into and
            forms part of our{' '}
            <Link to="/terms" className="text-orange-400 hover:text-orange-300 transition-colors">
              Terms and Conditions
            </Link>
            .
          </p>
          <p>
            Yapp is a student-built, non-commercial project. It is not officially operated by or affiliated with
            Toronto Metropolitan University. We are committed to handling your information responsibly and in accordance
            with applicable Canadian privacy law, including Ontario's Freedom of Information and Protection of Privacy
            Act (FIPPA) and Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) where
            applicable.
          </p>
        </div>

        {/* Section 1 */}
        <Section title="Section 1 — Information We Collect">
          <SubSection title="1.1  Information You Provide Directly">
            <p className="mb-2">When you create an account or use Yapp, you may provide us with:</p>
            <BulletList items={[
              'Your name and display name / username',
              'Your email address (including your TMU email if used)',
              'A profile photo or avatar',
              'A short bio and pronouns (optional)',
              'Content you post, including text, images, and messages',
              'Events you create or RSVP to',
              'Waypoint pins you drop, including associated location and description',
            ]} />
          </SubSection>
          <SubSection title="1.2  Information Collected Automatically">
            <p className="mb-2">When you use Yapp, we may automatically collect certain technical information, including:</p>
            <BulletList items={[
              'Device type and operating system',
              'Browser type and version',
              'IP address',
              'Pages and features accessed within the app',
              'Time and date of activity',
              'Approximate location data (only when you use the Waypoint feature and have granted location permission — see Section 4)',
            ]} />
          </SubSection>
          <SubSection title="1.3  Information from Your Activity on Yapp">
            <p className="mb-2">We collect information generated by your use of the platform, including:</p>
            <BulletList items={[
              'Posts, comments, likes, and interactions',
              'Direct messages sent and received',
              'Events browsed, RSVPed to, or created',
              'Waypoint pins dropped or viewed',
              'Users you follow or are followed by',
              'Account settings and preferences',
            ]} />
          </SubSection>
        </Section>

        {/* Section 2 */}
        <Section title="Section 2 — How We Use Your Information">
          <SubSection title="2.1  To Operate the Platform">
            <BulletList items={[
              'Create and manage your account',
              'Deliver the features of Yapp, including the social feed, messaging, events, and Waypoint map',
              'Enable you to connect with other users on campus',
            ]} />
          </SubSection>
          <SubSection title="2.2  To Improve Yapp">
            <BulletList items={[
              'Understand how users interact with the platform',
              'Identify and fix bugs and technical issues',
              'Develop and test new features',
              'Analyze usage patterns to improve the overall experience',
            ]} />
          </SubSection>
          <SubSection title="2.3  To Ensure Safety and Policy Compliance">
            <BulletList items={[
              'Detect and prevent abuse, harassment, or violations of our Terms and Conditions',
              'Investigate reported content or conduct',
              'Refer serious conduct to TMU\'s Student Conduct Office where required, as described in our Terms and Conditions, Section 4',
            ]} />
          </SubSection>
          <SubSection title="2.4  To Communicate with You">
            <BulletList items={[
              'Send you platform-related notifications (e.g. new followers, event reminders, message alerts)',
              'Respond to support requests or inquiries you send to us',
            ]} />
          </SubSection>
          <p>
            We do not use your information for advertising purposes. Yapp is a non-commercial student project and does
            not sell, rent, or share your personal information with advertisers or third-party marketing services.
          </p>
        </Section>

        {/* Section 3 */}
        <Section title="Section 3 — How We Share Your Information">
          <SubSection title="3.1  With Other Users">
            <p className="mb-2">Certain information you provide is visible to other Yapp users by design, including:</p>
            <BulletList items={[
              'Your display name, username, profile photo, bio, and pronouns',
              'Posts, comments, and likes you make on the public feed',
              'Events you create',
              'Waypoint pins you drop (including approximate location at time of drop)',
              'Your follower and following counts',
            ]} />
            <p className="mt-2">Direct messages are private and visible only to you and the recipient.</p>
          </SubSection>
          <SubSection title="3.2  With Service Providers">
            <p>
              Yapp may use third-party technical services (such as cloud hosting or database providers) to operate the
              platform. These providers may have access to your information only as necessary to perform their functions
              and are not permitted to use it for any other purpose.
            </p>
          </SubSection>
          <SubSection title="3.3  For Safety and Legal Compliance">
            <p className="mb-2">We may disclose your information where we reasonably believe it is necessary to:</p>
            <BulletList items={[
              'Comply with applicable law, regulation, or legal process',
              'Respond to a valid request from a law enforcement authority',
              'Protect the safety of any person, including other users',
              'Refer conduct to TMU\'s Student Conduct Office in accordance with our Terms and Conditions, Section 4.2',
            ]} />
          </SubSection>
          <SubSection title="3.4  We Do Not Sell Your Data">
            <p>
              BYTE does not sell, trade, or otherwise transfer your personal information to third parties for commercial
              purposes, consistent with our commitment as a non-commercial student project.
            </p>
          </SubSection>
        </Section>

        {/* Section 4 */}
        <Section title="Section 4 — Location Data">
          <SubSection title="4.1  Waypoint and Location">
            <p>
              The Waypoint feature requires access to your device's location. Location data is only collected when you
              actively use the Waypoint feature and have granted location permission in your device settings. This is
              consistent with our Terms and Conditions, Section 2.3.
            </p>
          </SubSection>
          <SubSection title="4.2  How Location Data is Used">
            <p>
              Your location is used solely to enable the Waypoint map feature — to drop pins and display nearby
              activity on campus. We do not track or store your location continuously or in the background.
            </p>
          </SubSection>
          <SubSection title="4.3  Revoking Location Access">
            <p>
              You can revoke Yapp's access to your location at any time through your device settings. Doing so will
              disable the Waypoint feature but will not affect your ability to use other parts of the platform.
            </p>
          </SubSection>
        </Section>

        {/* Section 5 */}
        <Section title="Section 5 — Data Retention">
          <SubSection title="5.1  Account Data">
            <p>
              We retain your account information for as long as your account is active. If you delete your account,
              as permitted under our Terms and Conditions, Section 1.5, we will remove your personal information from
              our systems within a reasonable timeframe, subject to any legal obligations to retain certain records.
            </p>
          </SubSection>
          <SubSection title="5.2  Content You Post">
            <p>
              Posts, messages, and Waypoint pins may remain on the platform after deletion for a short period due to
              caching or backup processes. We will make reasonable efforts to delete this data promptly upon your
              request.
            </p>
          </SubSection>
          <SubSection title="5.3  Anonymized Data">
            <p>
              We may retain anonymized, aggregated data (data that cannot be linked back to you) for the purpose of
              improving Yapp, even after your account is deleted.
            </p>
          </SubSection>
        </Section>

        {/* Section 6 */}
        <Section title="Section 6 — Data Security">
          <SubSection title="6.1  Security Measures">
            <p>
              We implement reasonable technical and organizational measures to protect your personal information from
              unauthorized access, disclosure, alteration, or destruction. These include secure data storage practices
              and access controls within the BYTE development team.
            </p>
          </SubSection>
          <SubSection title="6.2  Student Project Limitation">
            <p>
              Yapp is a student-built project, as described in our Terms and Conditions, Section 3.1. While we take
              data security seriously, we cannot guarantee absolute security. In the event of a data breach that may
              affect your personal information, we will make reasonable efforts to notify affected users in a timely
              manner.
            </p>
          </SubSection>
          <SubSection title="6.3  Your Responsibility">
            <p>
              You are responsible for keeping your account credentials secure, consistent with your obligations under
              our Terms and Conditions, Section 1.2. Do not share your password with others. If you believe your
              account has been compromised, contact the Yapp team immediately through BYTE's official channels.
            </p>
          </SubSection>
        </Section>

        {/* Section 7 */}
        <Section title="Section 7 — Your Rights">
          <SubSection title="7.1  Right to Access">
            <p>
              You have the right to request a copy of the personal information we hold about you. To make a request,
              contact the Yapp team through BYTE's official channels on Discord or Instagram.
            </p>
          </SubSection>
          <SubSection title="7.2  Right to Correction">
            <p>
              If any of your personal information is inaccurate or incomplete, you may update it directly through your
              account settings or contact us to request a correction.
            </p>
          </SubSection>
          <SubSection title="7.3  Right to Deletion">
            <p>
              You may request that we delete your personal information by deleting your account or contacting us
              directly. Note that some information may be retained for a short period due to technical or legal reasons,
              as outlined in Section 5.
            </p>
          </SubSection>
          <SubSection title="7.4  Right to Withdraw Consent">
            <p>
              Where we rely on your consent to process your information (such as location access for the Waypoint
              feature), you may withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness
              of processing that occurred before withdrawal.
            </p>
          </SubSection>
          <SubSection title="7.5  Right to Lodge a Complaint">
            <p>
              If you believe your privacy rights have been violated, you may contact the Office of the Privacy
              Commissioner of Canada at priv.gc.ca or the Information and Privacy Commissioner of Ontario at
              ipc.on.ca.
            </p>
          </SubSection>
        </Section>

        {/* Section 8 */}
        <Section title="Section 8 — Children's Privacy">
          <p>
            Yapp is intended for post-secondary students and is not directed at individuals under the age of 16,
            consistent with the eligibility requirements in our Terms and Conditions, Section 1.1. We do not knowingly
            collect personal information from anyone under 16. If we become aware that we have collected information
            from a minor without appropriate consent, we will take steps to delete that information promptly.
          </p>
        </Section>

        {/* Section 9 */}
        <Section title="Section 9 — TMU Policy Alignment">
          <SubSection title="9.1  FIPPA Awareness">
            <p>
              Toronto Metropolitan University, as a public institution, operates under Ontario's Freedom of Information
              and Protection of Privacy Act (FIPPA). While Yapp is a student project and not directly operated by TMU,
              we commit to handling personal information in a manner consistent with the spirit of FIPPA.
            </p>
          </SubSection>
          <SubSection title="9.2  TMU Discrimination and Harassment Prevention Policy">
            <p>
              The collection and use of personal information on Yapp must not be used to facilitate harassment,
              discrimination, or any conduct prohibited under TMU's Discrimination and Harassment Prevention Policy,
              as referenced in our Terms and Conditions, Section 4.1.
            </p>
          </SubSection>
          <SubSection title="9.3  TMU Sexual Violence Policy">
            <p>
              The sharing of intimate images or personal information for the purpose of sexual harassment or coercion
              is strictly prohibited and constitutes a violation of both this Privacy Policy and TMU's Sexual Violence
              Policy, as referenced in our Terms and Conditions, Sections 2.2(d) and 4.1.
            </p>
          </SubSection>
          <SubSection title="9.4  Further TMU Privacy Resources">
            <p>
              For more information about how TMU handles personal information at an institutional level, visit:{' '}
              <span className="text-orange-400">torontomu.ca/privacy/</span>
            </p>
          </SubSection>
        </Section>

        {/* Section 10 */}
        <Section title="Section 10 — Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When changes are made, the "Last Updated" date at the
            top of this document will be revised. We will make reasonable efforts to notify users of significant
            changes. Continued use of Yapp after changes are posted constitutes your acceptance of the updated policy.
          </p>
        </Section>

        {/* Section 11 */}
        <Section title="Section 11 — Governing Law">
          <p>
            This Privacy Policy is governed by the laws of the Province of Ontario and the federal laws of Canada
            applicable therein, including PIPEDA and FIPPA where applicable, consistent with the governing law
            provisions of our Terms and Conditions, Section 7.
          </p>
        </Section>

        {/* Contact */}
        <div className="mt-12 p-6 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-base font-semibold text-white mb-4">Contact</h2>
          <p className="text-gray-400 text-sm mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or how your personal information
            is handled, please contact the BYTE team through our official channels on Discord or Instagram.
          </p>
          <div className="text-sm space-y-1 text-gray-500">
            <p><span className="text-gray-400">Organization:</span>  BYTE — Build Your Technical Experience</p>
            <p><span className="text-gray-400">Institution:</span>  Toronto Metropolitan University</p>
            <p><span className="text-gray-400">Platform:</span>  Yapp</p>
          </div>
        </div>

        {/* Note */}
        <p className="mt-8 text-xs text-gray-600 leading-relaxed border-t border-white/[0.05] pt-8">
          Note: This Privacy Policy was prepared for a student-led platform and is not a substitute for formal legal
          advice. BYTE recommends consulting a privacy lawyer or TMU's privacy office if Yapp expands beyond its
          current scope as a student project.
        </p>

        {/* Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} BYTE — Build Your Technical Experience, Toronto Metropolitan University. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-orange-500">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
