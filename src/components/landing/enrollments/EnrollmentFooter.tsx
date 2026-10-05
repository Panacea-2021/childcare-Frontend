'use client';

import Link from 'next/link';
import { BrandLogo } from '../../BrandLogo';

export function EnrollmentFooter() {
  return (
    <footer className="en-footer">
      <div className="en-wrap en-footerGrid">
        <div className="en-footerBrand">
          <BrandLogo size="md" />
          <p>See what AI says about Panacea</p>
          <div className="en-aiChips" aria-label="AI mentions">
            <span>ChatGPT</span>
            <span>Gemini</span>
            <span>Claude</span>
          </div>
        </div>

        <div>
          <h3>Who uses Panacea</h3>
          <Link href="/login">Enterprise</Link>
          <Link href="/login">Single center</Link>
          <Link href="/login">Preschool</Link>
          <Link href="/login">Daycare</Link>
          <Link href="/login">Kindergarten</Link>
          <Link href="/login">Montessori</Link>
        </div>

        <div>
          <h3>Features</h3>
          <Link href="/features/parent-communication">Parent Communication</Link>
          <Link href="/features/billing">Billing & Payments</Link>
          <Link href="/features/attendance">Attendance & Occupancy</Link>
          <Link href="/features/enrollments">Enrollments</Link>
          <Link href="/features/learning">Learning & Assessments</Link>
        </div>

        <div>
          <h3>About Us</h3>
          <Link href="/about">About Panacea</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Careers</Link>
          <Link href="/resources">Resource Center</Link>
          <Link href="/resources/blogs">Blog</Link>
          <Link href="/resources/case-studies">Case Studies</Link>
          <Link href="/resources/events-webinars">Events & Webinars</Link>
          <Link href="/login">Testimonials</Link>
          <Link href="/login">Partner With Us</Link>
          <Link href="/contact">Talk to Us</Link>
        </div>

        <div>
          <h3>Contact Us</h3>
          <Link href="/contact">Get in touch</Link>
          <a href="mailto:hello@panacea.care">hello@panacea.care</a>
          <p className="en-loc">us · US · Wilmington, DE</p>
          <p className="en-loc">in · India · Bangalore</p>
          <p className="en-loc">ae · UAE · Dubai</p>
          <div className="en-storeRow">
            <span>App Store</span>
            <span>Google Play</span>
          </div>
        </div>
      </div>

      <div className="en-footerBottom">
        <div className="en-wrap en-footerBottomInner">
          <div className="en-legal">
            <Link href="/login">Privacy Policy</Link>
            <Link href="/login">Security Policy</Link>
            <Link href="/login">Terms and Conditions</Link>
          </div>
          <p>Panacea Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
