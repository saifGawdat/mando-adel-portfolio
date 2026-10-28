/**
 * All editable copy and media live here.
 * Swap an image by replacing the file in /public/img and keeping the same path.
 */

export type Work = {
  slug: string;
  index: string;
  title: string;
  /** the two-line display lockup; mirrors the reference's name / surname block */
  titleLines: string[];
  subtitle: string;
  meta: string[];
  image: string;
  href: string;
  alt: string;
  /** desktop composition, mirrors the reference's three member layouts */
  layout: "split" | "cover" | "panel";
  /** object-position for the large background plate */
  focus: string;
  /** object-position for the portrait card */
  cardFocus: string;
};

export const site = {
  name: "Mando Adel",
  firstName: "Mando",
  lastName: "Adel",
  role: "Graphic Designer",
  location: "Tanta, EG",
  studio: "wink adv",
  /** same portrait, cropped per device class — landscape for desktop, tall crops for tablet/phone */
  portraits: {
    desktop: "/img/portrait-desktop.jpg",
    tablet: "/img/portrait-tablet.jpg",
    mobile: "/img/portrait-mobile.jpg",
  },
  portraitAlt: "Portrait of Mando Adel",
  // TODO: replace with his real address before launch.
  email: "hello@mandoadel.com",

  /** hero wordmark, broken into four groups and justified edge to edge like IN / HE / RI / TED */
  hero: {
    groups: [
      { text: "MAN", mins: [0.15] },
      { text: "DO", mins: [0, 0.11] },
      { text: "A", mins: [0.12] },
      { text: "DEL", mins: [0, 0.09] },
    ],
    subtitle: ["2016", "Graphic Designer", "Brand Identity"],
  },

  nav: [
    { label: "Home", href: "#header" },
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Archive", href: "#archive" },
  ],

  socials: [
    { label: "Behance", href: "https://www.behance.net/mandoadel" },
    { label: "Instagram", href: "https://www.instagram.com/mando_adell" },
    { label: "Visuals", href: "https://www.instagram.com/mando_visuals_24" },
  ],

  about: {
    title: ["IDENTITIES", "THAT", "SURVIVE"],
    meta: "( 01 ) — Profile",
    body: "Marks, type systems, colour and the social language that keeps them alive. Ten-plus brand programmes for engineering, fashion, retail and medical clients — from first sketch to final guideline.",
    roles: [
      { label: "Brand Identity", value: "01" },
      { label: "Art Direction", value: "02" },
      { label: "Social Systems", value: "03" },
      { label: "Tanta, EG", value: "31.04°N" },
    ],
  },

  works: [
    {
      slug: "nsco",
      index: "01",
      title: "NSCO",
      titleLines: ["NSCO", "ENGINEERING"],
      subtitle: "Engineering Brand Identity",
      meta: ["Brand Identity", "Wordmark", "Guidelines"],
      image: "/img/nsco.webp",
      href: "https://www.behance.net/gallery/254744739/NSCO-Engineering-Brand-Identity",
      alt: "NSCO engineering brand identity cover",
      layout: "split",
      focus: "50% 46%",
      cardFocus: "50% 44%",
    },
    {
      slug: "moda",
      index: "02",
      title: "MODA",
      titleLines: ["MODA", "LUXURY"],
      subtitle: "Luxury Fabric Brand Identity",
      meta: ["Brand Identity", "Luxury", "Typography"],
      image: "/img/moda.webp",
      href: "https://www.behance.net/gallery/254363427/Moda-Luxury-Fabric-Brand-Identity",
      alt: "Moda luxury fabric brand identity cover",
      layout: "cover",
      focus: "50% 50%",
      cardFocus: "50% 46%",
    },
    {
      slug: "dream",
      index: "03",
      title: "DREAM",
      titleLines: ["DREAM", "REDESIGN"],
      subtitle: "Brand Identity Redesign",
      meta: ["Rebrand", "Identity", "Art Direction"],
      image: "/img/dream.webp",
      href: "https://www.behance.net/gallery/252462987/Dream-Brand-Identity-Redesign",
      alt: "Dream brand identity redesign cover",
      layout: "panel",
      focus: "50% 50%",
      cardFocus: "50% 50%",
    },
  ] satisfies Work[],

  archive: {
    title: ["MORE", "WORK"],
    meta: "( 04 ) — Archive",
    caption: "Selected projects — ( 2016—2026 )",
    /** two plates pinned behind the list, like the reference's record section */
    images: ["/img/moda.webp", "/img/dream.webp"],
    projects: [
      {
        title: "NERAN",
        subtitle: "Clothing Logo & Brand Identity",
        href: "https://www.behance.net/gallery/245345435/NERAN-Clothing-Logo-Brand-Identity",
      },
      {
        title: "Social Media Medicine",
        subtitle: "Campaign & Ads",
        href: "https://www.behance.net/gallery/243774025/Social-Media-medicine-ads",
      },
      {
        title: "MG7",
        subtitle: "Key Visual",
        href: "https://www.behance.net/gallery/245283777/MG7-Key-Visual",
      },
      {
        title: "Barquqa",
        subtitle: "Social Media Design",
        href: "https://www.behance.net/gallery/247392337/Barquqa-Social-Media-Desgin",
      },
      {
        title: "VET ZONE",
        subtitle: "Social Media Design",
        href: "https://www.behance.net/gallery/247324481/VET-ZONE-SOCIAL-MEDIA-DESIGN",
      },
      {
        title: "Al-Qadiseya",
        subtitle: "Social Media Designs",
        href: "https://www.behance.net/gallery/245570255/Al-Qadiseya-social-media-designs",
      },
    ],
  },

  contact: {
    subtitle: ["Inquiries", "Collaborations", "Commissions"],
  },
};

export type SiteContent = typeof site;
