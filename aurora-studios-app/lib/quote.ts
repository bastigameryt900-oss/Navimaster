import { createLocalStore } from "./local-store";
import { COUNTRIES, getService } from "./site";

export type QuoteItem = { serviceId: string; optionId: string | null };

const EMPTY: QuoteItem[] = [];

const itemsStore = createLocalStore<QuoteItem[]>("aurora:cotizacion:v1", EMPTY, (raw) => {
  if (!Array.isArray(raw)) return EMPTY;
  const seen = new Set<string>();
  return raw.flatMap((r) => {
    const service = typeof r?.serviceId === "string" ? getService(r.serviceId) : undefined;
    if (!service || seen.has(service.id)) return [];
    seen.add(service.id);
    const option = service.options.find((o) => o.id === r.optionId);
    return [{ serviceId: service.id, optionId: option?.id ?? service.options[0]?.id ?? null }];
  });
});

export const useQuoteItems = itemsStore.useValue;

export const quote = {
  add(serviceId: string, optionId?: string | null) {
    const service = getService(serviceId);
    if (!service) return;
    const chosen = optionId ?? service.options[0]?.id ?? null;
    itemsStore.set((items) =>
      items.some((i) => i.serviceId === serviceId)
        ? items.map((i) => (i.serviceId === serviceId ? { ...i, optionId: chosen } : i))
        : [...items, { serviceId, optionId: chosen }],
    );
  },
  remove(serviceId: string) {
    itemsStore.set((items) => items.filter((i) => i.serviceId !== serviceId));
  },
  setOption(serviceId: string, optionId: string) {
    itemsStore.set((items) => items.map((i) => (i.serviceId === serviceId ? { ...i, optionId } : i)));
  },
  clear() {
    itemsStore.set(EMPTY);
  },
};

export type QuoteDetails = {
  name: string;
  country: string;
  business: string;
  idea: string;
  deadline: string;
  currency: string;
};

const BLANK: QuoteDetails = { name: "", country: "", business: "", idea: "", deadline: "", currency: "" };

const detailsStore = createLocalStore<QuoteDetails>("aurora:cotizacion:datos:v1", BLANK, (raw) => {
  if (!raw || typeof raw !== "object") return BLANK;
  const r = raw as Record<string, unknown>;
  const str = (k: keyof QuoteDetails) => (typeof r[k] === "string" ? (r[k] as string).slice(0, 2000) : "");
  return {
    name: str("name"),
    country: COUNTRIES.includes(str("country")) ? str("country") : "",
    business: str("business"),
    idea: str("idea"),
    deadline: str("deadline"),
    currency: str("currency"),
  };
});

export const useQuoteDetails = detailsStore.useValue;

export const setQuoteDetail = (field: keyof QuoteDetails, value: string) =>
  detailsStore.set((d) => ({ ...d, [field]: value }));

export const clearQuoteDetails = () => detailsStore.set(BLANK);
