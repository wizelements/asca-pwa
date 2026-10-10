export type SiteContentFieldType = 'text' | 'textarea' | 'list';

export interface SiteContentFieldDefinition {
  key: string;
  label: string;
  type: SiteContentFieldType;
  defaultValue: string | string[];
  maxLength: number;
  help?: string;
}

export interface SiteContentSectionDefinition {
  label: string;
  fields: SiteContentFieldDefinition[];
}

export interface SiteContentPageDefinition {
  id: string;
  label: string;
  publicPath: string;
  description: string;
  sections: SiteContentSectionDefinition[];
}

const text = (
  key: string,
  label: string,
  defaultValue: string,
  maxLength = 160,
  help?: string
): SiteContentFieldDefinition => ({ key, label, type: 'text', defaultValue, maxLength, help });

const area = (
  key: string,
  label: string,
  defaultValue: string,
  maxLength = 900,
  help?: string
): SiteContentFieldDefinition => ({ key, label, type: 'textarea', defaultValue, maxLength, help });

const list = (
  key: string,
  label: string,
  defaultValue: string[],
  maxLength = 180,
  help?: string
): SiteContentFieldDefinition => ({ key, label, type: 'list', defaultValue, maxLength, help });

export const SITE_CONTENT_PAGES: SiteContentPageDefinition[] = [
  {
    id: 'home',
    label: 'Homepage',
    publicPath: '/',
    description: 'Section headings, supporting copy, and call-to-action labels below the main hero.',
    sections: [
      {
        label: 'Primary actions',
        fields: [
          text('home.cta.meeting', 'Meeting button', 'Attend a Meeting', 50),
          text('home.cta.member', 'Member button', 'Become a Member', 50),
          text('home.cta.support', 'Support button', 'Support ASCA', 50),
        ],
      },
      {
        label: 'Purpose',
        fields: [
          text('home.purpose.label', 'Eyebrow', 'Our Purpose', 60),
          text('home.purpose.title', 'Heading', 'Connect · Learn · Give', 100),
        ],
      },
      {
        label: 'Connect · Learn · Give cards',
        fields: [
          text('home.connect.title', 'Connect title', 'Connect', 60),
          text('home.connect.label', 'Connect label', 'We are a community of horsemen', 100),
          area('home.connect.body', 'Connect body', 'Connection is at the heart of everything we do. Through shared experiences with horses, our members build friendships, develop trust, and become part of a supportive community. The unique bond between horse and rider encourages personal growth, confidence, and a deeper understanding of oneself and others.', 900),
          text('home.learn.title', 'Learn title', 'Learn', 60),
          text('home.learn.label', 'Learn label', 'Horsemanship for every level', 100),
          area('home.learn.body', 'Learn body', "Learning never stops when horses are involved. Members gain hands-on knowledge in horsemanship, riding, horse care, safety, trail etiquette, and leadership. Whether you're new to horses or have years of experience, our club provides opportunities to expand your skills, share knowledge, and grow your confidence through education and experience. Every ride, event, and activity offers an opportunity to learn something new.", 1100),
          text('home.give.title', 'Give title', 'Give', 60),
          text('home.give.label', 'Give label', 'Serving our community', 100),
          area('home.give.body', 'Give body', 'Our club believes in giving back to the community. Funds raised through our events help us provide educational opportunities, support local initiatives, and create meaningful experiences for both the young and the young at heart. Together, we strive to make a positive impact. We welcome your donations to support our efforts.', 900),
          text('home.give.cta', 'Give button', 'Donate', 50),
        ],
      },
      {
        label: 'Latest activities',
        fields: [
          text('home.activities.title', 'Heading', 'Our Latest Activities', 100),
          area('home.activities.body', 'Supporting text', "From trail rides to community outreach, here's a glimpse of how ASCA stays active across metro Atlanta and beyond.", 350),
          text('home.activities.cta', 'Gallery button', 'View Full Gallery', 50),
        ],
      },
      {
        label: 'Event updates',
        fields: [
          text('home.updates.label', 'Eyebrow', 'Stay Connected', 60),
          text('home.updates.title', 'Heading', 'Stay Up to Date on our Events', 120),
          area('home.updates.body', 'Supporting text', "Tell us a little about yourself and what you're interested in, and we'll keep you posted on upcoming ASCA meetings, rides, and community events.", 450),
        ],
      },
      {
        label: 'Closing invitation',
        fields: [
          text('home.final.label', 'Eyebrow', 'Get Involved', 60),
          text('home.final.title', 'Heading', 'Ready to Get Involved?', 100),
          area('home.final.body', 'Supporting text', 'Attend a meeting, join the club, volunteer, or support ASCA today.', 300),
          text('home.final.cta', 'Button', 'Get Involved', 50),
        ],
      },
    ],
  },
  {
    id: 'about',
    label: 'About ASCA',
    publicPath: '/about',
    description: 'Hero, club introduction, origin story, leadership heading, and membership invitation.',
    sections: [
      {
        label: 'Hero',
        fields: [
          text('about.hero.title', 'Title', 'About ASCA', 100),
          area('about.hero.subtitle', 'Subtitle', "Atlanta's premiere saddle club, promoting positive horsemanship within the community.", 260),
        ],
      },
      {
        label: 'Introduction',
        fields: [
          text('about.intro.label', 'Eyebrow', 'Who We Are', 60),
          text('about.intro.title', 'Heading', 'Atlanta Saddle Club Association', 120),
          area('about.intro.body', 'Body', "Atlanta Saddle Club Association (ASCA) — Atlanta's premiere saddle club. ASCA sponsors and promotes horse trail rides, horseback riding lessons, camp outs, and other activities.", 650),
        ],
      },
      {
        label: 'History',
        fields: [
          text('about.history.title', 'Heading', 'How ASCA Began', 100),
          area('about.history.body', 'Body', 'The Atlanta Saddle Club Association (ASCA) was formed on May 5, 2020 by a group of dedicated horsemen who wanted to create a community in metro Atlanta that promotes positive horsemanship, shares information related to handling and training horses, encourages and develops sportsmanship among ASCA members and the local community, and introduces underserved communities to horses and their transformative power.', 1200),
        ],
      },
      {
        label: 'Leadership',
        fields: [
          text('about.leadership.label', 'Eyebrow', 'Leadership', 60),
          text('about.leadership.title', 'Heading', 'Current Officers', 100),
        ],
      },
      {
        label: 'Officer roster',
        fields: [
          list(
            'about.officers.items',
            'Officers',
            [
              'President | Jadon Relaford | founding',
              'Vice President | Deja Shelton',
              'Treasurer | Nicole McNeil',
              'Secretary | Bonita Hartage',
              'Member Services Chair | Terrell Brown',
              'Senior Delegate | Rebecca Lord | founding',
              'Senior Delegate | Randall Atchison | founding',
            ],
            180,
            'One officer per line: Role | Name | founding. Omit “founding” when it does not apply.'
          ),
        ],
      },
      {
        label: 'Membership invitation',
        fields: [
          text('about.join.label', 'Eyebrow', 'Join the Club', 60),
          text('about.join.title', 'Heading', 'Become a Member', 100),
          area('about.join.body', 'Body', 'If you would like to become a member, please plan to attend one of our club meetings or activities and events so that you can meet our members and learn more about ASCA.', 700),
          text('about.join.cta', 'Button', 'Get Involved', 50),
        ],
      },
    ],
  },
  {
    id: 'members',
    label: 'Meet ASCA',
    publicPath: '/members',
    description: 'Community introduction, reasons to join, factual labels, and closing invitation. The active-member count remains automatic.',
    sections: [
      {
        label: 'Hero',
        fields: [
          text('members.hero.title', 'Title', 'Meet Our Members', 100),
          area('members.hero.subtitle', 'Subtitle', 'United by a shared passion for horses, adventure, and community.', 260),
        ],
      },
      {
        label: 'Community introduction',
        fields: [
          text('members.intro.label', 'Eyebrow', 'Our Community', 60),
          text('members.intro.title', 'Heading', 'A Place to Belong', 100),
          area('members.intro.body1', 'First paragraph', "Our members come from all walks of life, and represent different ages, backgrounds, and experiences, but we're united by a shared passion for horses, adventure, and community. We believe those differences should never limit what is possible. Whether you're a seasoned rider or fulfilling a childhood dream of becoming a cowboy or cowgirl, you'll find a place to belong here.", 1000),
          area('members.intro.body2', 'Second paragraph', "Our members include trail riders, horse owners, first-time riders, lifelong equestrians, families, retirees, professionals, students, and horse lovers who simply enjoy being part of the community. No matter your experience level, there's a place for you in our club.", 800),
        ],
      },
      {
        label: 'Reasons to join',
        fields: [
          text('members.reasons.label', 'Eyebrow', 'Why Members Join', 60),
          text('members.reasons.title', 'Heading', 'Reasons to Ride With Us', 100),
          list('members.reasons.items', 'Reasons', ['A shared love of horses', 'Friendship and fellowship', 'Trail rides and events', 'Learning opportunities', 'Community service', 'Leadership opportunities']),
        ],
      },
      {
        label: 'By the numbers',
        fields: [
          text('members.facts.label', 'Eyebrow', 'By the Numbers', 60),
          text('members.facts.title', 'Heading', 'Fun Facts About Our Club', 100),
          text('members.fact.years', 'Years in operation', '6', 80),
          text('members.fact.trails', 'Trail rides completed', 'ASCA Hosted - 5 and has attended dozens across the Southeast', 220),
          text('members.fact.parades', 'Parades completed', '10', 80),
          area('members.fact.giving', 'Community giving', 'Volunteering at local food banks and Mobile Showers Atlanta, and completing donation drives to help the homeless', 500),
          text('members.fact.festival', 'Black Cowboy Heritage Festival', 'Established in 2026', 160),
          area('members.fact.tots', 'Trots for Tots Breakfast with Santa', '4 — collecting toys for families in need during the holidays', 300),
        ],
      },
      {
        label: 'Closing invitation',
        fields: [
          text('members.final.title', 'Heading', 'Interested in Learning More?', 100),
          area('members.final.body', 'Body', "We'd love to meet you. Whether you're an experienced rider, new to horses, or simply looking for a welcoming community, we invite you to join us at an upcoming meeting or event.", 600),
          text('members.final.eventsCta', 'Events button', 'Event Calendar', 50),
          text('members.final.shareCta', 'Share button', 'Share ASCA', 50),
          text('members.final.applyCta', 'Application button', 'ASCA Membership Application', 70),
        ],
      },
    ],
  },
  {
    id: 'get-involved',
    label: 'Get Involved',
    publicPath: '/get-involved',
    description: 'Hero, introduction, participation cards, membership application heading, and closing invitation.',
    sections: [
      {
        label: 'Hero & introduction',
        fields: [
          text('involved.hero.title', 'Hero title', 'Get Involved', 100),
          area('involved.hero.subtitle', 'Hero subtitle', "Join our equestrian community — there's a place for everyone.", 260),
          text('involved.intro.label', 'Eyebrow', 'Connect', 60),
          text('involved.intro.title', 'Heading', 'Ways to Take Part', 100),
          area('involved.intro.body', 'Body', "There's a place for everyone at the Atlanta Saddle Club Association. Whether you're an experienced rider, new to horses, looking to volunteer, or simply interested in becoming part of a welcoming community, we'd love to meet you.", 800),
        ],
      },
      {
        label: 'Participation cards',
        fields: [
          text('involved.member.title', 'Membership title', 'Become a Member', 80),
          area('involved.member.body', 'Membership body', 'Join a network of horse enthusiasts who share a passion for riding, learning, service, and fellowship.', 450),
          text('involved.member.cta', 'Membership button', 'ASCA Membership Application', 70),
          text('involved.event.title', 'Event title', 'Attend an Event', 80),
          area('involved.event.body', 'Event body', 'From trail rides and educational programs to community outreach and special events, there are many opportunities to participate throughout the year.', 500),
          text('involved.event.cta', 'Event button', 'Event Calendar', 60),
          text('involved.volunteer.title', 'Volunteer title', 'Volunteer', 80),
          area('involved.volunteer.body', 'Volunteer body', 'Help support our events, youth programs, fundraising efforts, and community service projects.', 450),
          text('involved.volunteer.cta', 'Volunteer button', 'Contact Us', 60),
          text('involved.partner.title', 'Partner title', 'Partner With Us', 80),
          area('involved.partner.body', 'Partner body', 'Businesses, organizations, and community leaders can support our mission through sponsorships and partnerships.', 450),
          text('involved.partner.cta', 'Partner button', 'Support ASCA', 60),
        ],
      },
      {
        label: 'Application & closing',
        fields: [
          text('involved.application.title', 'Application heading', 'ASCA Membership Application', 100),
          area('involved.final.body', 'Closing text', 'Ready to get started? Complete our membership application or contact us to learn more.', 350),
        ],
      },
    ],
  },
  {
    id: 'support',
    label: 'Support ASCA',
    publicPath: '/support-asca',
    description: 'Support story, reasons, donation framing, supply needs, sponsorship invitation, and closing thank-you.',
    sections: [
      {
        label: 'Hero & opening',
        fields: [
          text('support.hero.title', 'Hero title', 'Support ASCA', 100),
          area('support.hero.subtitle', 'Hero subtitle', 'Help us make a difference both in and out of the saddle.', 260),
          text('support.intro.label', 'Eyebrow', 'Support', 60),
          text('support.intro.title', 'Heading', 'Why We Need You', 100),
          area('support.intro.body', 'Body', 'The Atlanta Saddle Club Association is dedicated to promoting horsemanship, education, community involvement, and fellowship through a shared love of horses. Through our programs, events, and outreach efforts, we strive to create opportunities for individuals and families to learn, connect, and grow while preserving the traditions and values of the equestrian community.', 1100),
        ],
      },
      {
        label: 'Why support matters',
        fields: [
          text('support.reasons.title', 'Heading', 'Why Your Support Matters', 100),
          list('support.reasons.items', 'Reasons', ['Quarterly horsemanship educational workshops and clinics', 'Community outreach and service projects and events', 'Black Cowboy Heritage Festival, Rodeo Expo, and community events']),
          area('support.reasons.body', 'Closing paragraph', 'Every contribution, large or small, helps us expand our programs, strengthen our community impact, and create meaningful opportunities for riders and families in metro Atlanta and beyond.', 650),
        ],
      },
      {
        label: 'Giving',
        fields: [
          text('support.give.title', 'Heading', 'Ways to Give', 100),
          area('support.give.body', 'Supporting text', 'Make a direct donation using either of the options below.', 300),
          text('support.other.title', 'Other support heading', 'Other Ways to Support', 100),
          list('support.other.items', 'Other ways', ['Donate supplies: horse, safety, sanitation', 'Become a community partner', 'Share our events and mission']),
          text('support.needs.title', 'Current needs heading', 'Current Needs', 100),
          list('support.needs.items', 'Current needs', ['Socks — child and adult', 'Underwear — adult', 'Toiletries and hygiene supplies', 'School supplies', 'Horse-related equipment', 'Event-related equipment: porta potties, bleachers', 'Event-related services']),
        ],
      },
      {
        label: 'Sponsorship & closing',
        fields: [
          text('support.sponsor.title', 'Sponsorship heading', 'Contact Us About Sponsorship Opportunities', 120),
          area('support.sponsor.body', 'Sponsorship text', 'Interested in sponsoring an event or partnering with ASCA? Reach out:', 350),
          area('support.final.body', 'Closing thank-you', 'Thank you for supporting the Atlanta Saddle Club Association and helping us make a difference both in and out of the saddle.', 450),
        ],
      },
    ],
  },
  {
    id: 'calendar',
    label: 'Event Calendar',
    publicPath: '/where-to-find-us',
    description: 'Public framing around the managed event records.',
    sections: [
      {
        label: 'Page introduction',
        fields: [
          text('calendar.label', 'Eyebrow', "Where You'll Find ASCA", 80),
          text('calendar.title', 'Heading', 'Event Calendar', 100),
          area('calendar.body', 'Body', 'Find upcoming ASCA meetings, hosted events, trail rides, parades, and community outreach activities.', 450),
        ],
      },
    ],
  },
  {
    id: 'gallery',
    label: 'Gallery',
    publicPath: '/gallery',
    description: 'Hero and empty-state framing. Album names, summaries, captions, and photos remain managed in Gallery Albums.',
    sections: [
      {
        label: 'Page framing',
        fields: [
          text('gallery.hero.title', 'Hero title', 'Photo Gallery', 100),
          area('gallery.hero.subtitle', 'Hero subtitle', 'Albums from ASCA events and activities', 260),
          text('gallery.empty.title', 'Empty-state title', 'No albums yet', 100),
          area('gallery.empty.body', 'Empty-state body', 'New albums from ASCA events and activities will appear here.', 320),
        ],
      },
    ],
  },
  {
    id: 'horses',
    label: 'Our Horses',
    publicPath: '/horses',
    description: 'Hero and empty-state framing. Individual horse names, descriptions, and photos remain managed in Horses.',
    sections: [
      {
        label: 'Page framing',
        fields: [
          text('horses.hero.title', 'Hero title', 'Our Horses', 100),
          area('horses.hero.subtitle', 'Hero subtitle', 'Meet the heart of ASCA', 260),
          text('horses.empty.title', 'Empty-state title', 'No horse profiles yet', 100),
          area('horses.empty.body', 'Empty-state body', 'Check back soon to meet the horses at the heart of ASCA.', 320),
        ],
      },
    ],
  },
  {
    id: 'share',
    label: 'Share ASCA',
    publicPath: '/share',
    description: 'Member-facing wording around the QR/share experience. Functional Share, Copy, Install, and Open controls remain protected.',
    sections: [
      {
        label: 'Introduction',
        fields: [
          text('share.hero.label', 'Eyebrow', 'ASCA Member Share Center', 80),
          text('share.hero.title', 'Heading', 'Share the ride. Grow the community.', 120),
          area('share.hero.body', 'Supporting text', 'Keep this page on your phone and use it whenever someone asks about ASCA. They can scan the code, open the site, or you can send the link in seconds.', 500),
        ],
      },
      {
        label: 'Share card',
        fields: [
          text('share.card.label', 'Eyebrow', 'Member-ready sharing', 80),
          text('share.card.title', 'Heading', "Put ASCA in someone's hand in seconds.", 120),
          area('share.card.body', 'Supporting text', 'Share the official ASCA website from your phone, copy the link for a message, or install ASCA for fast home-screen access. Share ASCA also stays available from the mobile menu and footer.', 600),
          text('share.card.scanLabel', 'QR caption', 'Scan to visit ASCA', 80),
          text('share.card.downloadLabel', 'Download link', 'Download QR for print or flyers', 80),
        ],
      },
      {
        label: 'Three-step guidance',
        fields: [
          text('share.step1.title', 'Step 1 title', '1 · Show', 60),
          area('share.step1.body', 'Step 1 body', 'Open this page and let someone scan the large ASCA QR code.', 240),
          text('share.step2.title', 'Step 2 title', '2 · Share', 60),
          area('share.step2.body', 'Send the official website through your phone’s normal share menu.', 240),
          text('share.step3.title', 'Step 3 title', '3 · Install', 60),
          area('share.step3.body', 'Add ASCA to your home screen so the share center is always close by.', 240),
        ],
      },
    ],
  },
  {
    id: 'shared',
    label: 'Shared Site Copy',
    publicPath: '/',
    description: 'Meeting information and footer/contact copy reused across the website.',
    sections: [
      {
        label: 'Monthly meeting',
        fields: [
          text('shared.meeting.label', 'Callout label', 'Join Us in Person', 80),
          text('shared.meeting.cadence', 'Cadence', '1st Wednesday of each month', 100),
          text('shared.meeting.time', 'Time', '7:00pm', 40),
          text('shared.meeting.venue', 'Venue', 'Piccadilly', 100),
          text('shared.meeting.address', 'Address', '2449 Godby Road, College Park, GA 30349', 180),
        ],
      },
      {
        label: 'Footer contact',
        fields: [
          text('shared.footer.contactTitle', 'Contact heading', 'Contact Us', 80),
          area('shared.footer.contactBody', 'Contact introduction', "Questions about ASCA, membership, or our events? Send us a message and we'll be in touch.", 400),
          text('shared.footer.quickLinksTitle', 'Quick links heading', 'Quick Links', 80),
          text('shared.footer.followTitle', 'Social heading', 'Follow Us', 80),
        ],
      },
    ],
  },
];

export const SITE_CONTENT_FIELDS = SITE_CONTENT_PAGES.flatMap((page) =>
  page.sections.flatMap((section) => section.fields)
);

export const SITE_CONTENT_FIELD_MAP = new Map(
  SITE_CONTENT_FIELDS.map((field) => [field.key, field])
);

export function getDefaultSiteContent(): Record<string, string | string[]> {
  return Object.fromEntries(
    SITE_CONTENT_FIELDS.map((field) => [
      field.key,
      Array.isArray(field.defaultValue) ? [...field.defaultValue] : field.defaultValue,
    ])
  );
}
