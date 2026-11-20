import type { IconKey } from "@/components/icon-data";

export const SITE = {
  name: "Aurora Studios",
  tagline: "AI Development",
  group: "Grupo Aurora Studios América Latina",
  url: "https://aurorastudios.shop",
  domain: "aurorastudios.shop",
  whatsappNumber: "56922274083",
  whatsappDisplay: "+56 9 2227 4083",
  instagram: "aurorastudioscl",
  description:
    "Aurora Studios es un estudio de desarrollo digital e inteligencia artificial, parte del Grupo Aurora Studios América Latina. Creamos páginas web, bots, videos, apps y videojuegos para clientes de cualquier país.",
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${SITE.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const instagramLink = `https://instagram.com/${SITE.instagram}`;

export type CategoryId = "web" | "comunidades" | "video" | "apps" | "juegos" | "medida";

export const CATEGORIES: { id: CategoryId | "todos"; label: string }[] = [
  { id: "todos", label: "Todo" },
  { id: "web", label: "Web" },
  { id: "comunidades", label: "Comunidades" },
  { id: "video", label: "Video" },
  { id: "apps", label: "Apps" },
  { id: "juegos", label: "Juegos" },
  { id: "medida", label: "A medida" },
];

export type ServiceOption = { id: string; label: string; price: number };

export type Service = {
  id: string;
  name: string;
  kicker: string;
  category: CategoryId;
  icon: IconKey;
  accent: string;
  description: string;
  features: string[];
  /** Opciones con precio fijo. Si está vacío, el servicio va a cotización. */
  options: ServiceOption[];
  isNew?: boolean;
};

export const SERVICES: Service[] = [
  {
    id: "paginas-web",
    name: "Páginas web",
    kicker: "Tu negocio en internet",
    category: "web",
    icon: "globe",
    accent: "#ffd43b",
    description:
      "Sitios rápidos, modernos y adaptados a celulares, con botón directo a WhatsApp para que tus clientes te escriban al instante.",
    features: ["Adaptada a celulares", "WhatsApp directo", "Rápida y moderna"],
    options: [
      { id: "sin-dominio", label: "Sin dominio", price: 70000 },
      { id: "con-dominio", label: "Con dominio anual", price: 85000 },
    ],
  },
  {
    id: "bots-discord",
    name: "Bots de Discord",
    kicker: "Comunidades",
    category: "comunidades",
    icon: "discord",
    accent: "#8b93ff",
    description:
      "Bots a medida para tu servidor: comandos propios, moderación, roles y bienvenidas automáticas, funcionando las 24 horas.",
    features: ["Comandos a medida", "Moderación y roles", "Hosting 24/7 opcional"],
    options: [
      { id: "sin-hosting", label: "Sin hosting", price: 40000 },
      { id: "con-hosting", label: "Con hosting", price: 50000 },
    ],
  },
  {
    id: "reels",
    name: "Reels",
    kicker: "Redes sociales",
    category: "video",
    icon: "film",
    accent: "#ff9f45",
    description:
      "Videos verticales que enganchan, para Instagram, TikTok y YouTube Shorts. Editamos tu material o creamos el video completo.",
    features: ["Formato vertical", "Edición de tu material", "Creación completa"],
    options: [
      { id: "edicion", label: "Edición", price: 10000 },
      { id: "creacion", label: "Creación", price: 15000 },
    ],
  },
  {
    id: "youtube",
    name: "Videos para YouTube",
    kicker: "Tu canal",
    category: "video",
    icon: "youtube",
    accent: "#ff6b6b",
    description:
      "Videos largos para tu canal, con edición de tu material o creación completa, listos para publicar.",
    features: ["Videos largos", "Edición de tu material", "Creación completa"],
    options: [
      { id: "edicion", label: "Edición", price: 20000 },
      { id: "creacion", label: "Creación", price: 30000 },
    ],
  },
  {
    id: "app-iphone",
    name: "Apps para iPhone",
    kicker: "Apps",
    category: "apps",
    icon: "apple",
    accent: "#7ddfb0",
    description:
      "Apps para iOS pensadas para tu negocio: pedidos, reservas, notificaciones y todo lo que tus clientes necesiten en el bolsillo.",
    features: ["Diseño nativo de iOS", "Notificaciones", "Pedidos y reservas"],
    options: [],
    isNew: true,
  },
  {
    id: "app-android",
    name: "Apps para Android",
    kicker: "Apps",
    category: "apps",
    icon: "android",
    accent: "#c8f04a",
    description:
      "Apps para Android con reservas, catálogos, agendas o lo que tu proyecto necesite, hechas a tu medida.",
    features: ["Reservas y agendas", "Catálogos", "A tu medida"],
    options: [],
    isNew: true,
  },
  {
    id: "programas-windows",
    name: "Programas para Windows",
    kicker: "Escritorio",
    category: "apps",
    icon: "monitor",
    accent: "#5ec8ff",
    description:
      "Programas de escritorio a medida: inventario, ventas, paneles de control y herramientas de gestión interna.",
    features: ["Inventario y ventas", "Paneles de control", "Gestión interna"],
    options: [],
    isNew: true,
  },
  {
    id: "videojuegos",
    name: "Videojuegos",
    kicker: "Juegos",
    category: "juegos",
    icon: "gamepad-2",
    accent: "#ff7ad9",
    description: "Juegos para PC y celular. Nos cuentas tu idea y la convertimos en algo que se puede jugar.",
    features: ["Para PC", "Para celular", "Tu idea, jugable"],
    options: [],
    isNew: true,
  },
  {
    id: "a-medida",
    name: "Proyectos a medida",
    kicker: "IA y automatización",
    category: "medida",
    icon: "brain-circuit",
    accent: "#b9a6ff",
    description:
      "¿Tienes una idea distinta? Automatizaciones, integraciones, inteligencia artificial, chatbots y sistemas hechos a tu medida.",
    features: ["Automatizaciones", "Integraciones", "IA y chatbots", "Sistemas a medida"],
    options: [],
  },
];

export const getService = (id: string) => SERVICES.find((s) => s.id === id);

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export const formatCLP = (n: number) => clp.format(n);

export const fromPrice = (s: Service) =>
  s.options.length ? Math.min(...s.options.map((o) => o.price)) : null;

export const REVIEWS = [
  {
    quote: "Estoy muy contento por la página, quedó como quería.",
    author: "Yahir Salazar",
    business: "Kenpo Karate Power Evolution",
    site: "kenpokaratepowerevolution.life",
  },
  {
    quote: "Muy buena la página, me encantó.",
    author: "Al Paso Food Truck",
    business: "Carta y pedidos por WhatsApp",
    site: "alpasofoodtruck.shop",
  },
];

export const STEPS = [
  { title: "Conversamos tu idea", detail: "Por WhatsApp o desde el cotizador de esta app, estés donde estés." },
  { title: "Definimos la solución", detail: "Alcance, plazos y una cotización clara, en tu moneda si lo prefieres." },
  { title: "Diseñamos y desarrollamos", detail: "Te mostramos avances y ajustamos los detalles contigo." },
  { title: "Probamos y entregamos", detail: "Te entregamos todo funcionando y te explicamos cómo usarlo." },
];

export const GUARANTEES = [
  "Precio confirmado antes de empezar",
  "Sin cobros sorpresa",
  "Tu material sigue siendo tuyo",
];

export const COUNTRIES = [
  "Argentina",
  "Bolivia",
  "Brasil",
  "Canadá",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "España",
  "Estados Unidos",
  "Guatemala",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "Puerto Rico",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
  "Otro país",
];
