export type NavbarContext =
  | "marketing"
  | "customer"
  | "professional";

export const navigationConfig = {
  marketing: [
    { label: "Explore", href: "/explore" },
    { label: "Professionals", href: "/professionals" },
    { label: "About", href: "/about" },
  ],

  customer: [
    { label: "Explore", href: "/explore" },
    { label: "My Bookings", href: "/customer/bookings" },
  ],

  professional: [
    { label: "Dashboard", href: "/professional/dashboard" },
    { label: "Services", href: "/professional/services" },
    { label: "Availability", href: "/professional/availability" },
    { label: "Bookings", href: "/professional/bookings" },
    { label: "Settings", href: "/professional/settings" },
  ],
};

export const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
];