import tenantConfigJson from "@/tenant.config.json";

export interface TenantConfig {
  tenantId: string;
  brandName: string;
  domain: string;
  supportPhone: string;
  currency: string;
  secondaryCurrency: string;
  pricing: {
    flightDepositCents: number;
    flightTotalCents: number;
  };
  modules: {
    flights: boolean;
    gearRental: boolean;
    ecommerce: boolean;
    smokeShopGate18: boolean;
    cimaDigitalB2B: boolean;
  };
}

const tenantConfig: TenantConfig = tenantConfigJson as TenantConfig;

export function getTenantConfig(): TenantConfig {
  return tenantConfig;
}

export function getTenantSiteBaseUrl(): string {
  return `https://${tenantConfig.domain}`;
}

export function getTenantWhatsAppPhoneIntl(): string {
  return tenantConfig.supportPhone.replace(/\D/g, "");
}
