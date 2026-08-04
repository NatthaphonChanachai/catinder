export type CatGender = "male" | "female";

/** Health-screening result: "clear" = normal/negative (good), "affected" = positive/found, "" = not tested */
export type TestStatus = "clear" | "affected" | "";

export interface HealthTests {
  hcm?: TestStatus;   // Hypertrophic Cardiomyopathy (heart)
  pkd?: TestStatus;   // Polycystic Kidney Disease
  felv?: TestStatus;  // Feline Leukemia Virus
  fiv?: TestStatus;   // Feline Immunodeficiency Virus
  bloodType?: string; // A | B | AB
}

export interface CatRecord {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  name: string;
  breed: string;
  age: number;
  gender: CatGender;
  photos: string[];
  description: string;
  vaccinated: boolean;
  registry?: string;
  registrationNumber?: string;
  petCertificateUrl?: string;
  province?: string;
  healthTests?: HealthTests;
}

type UnknownRecord = Record<string, unknown>;

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function testStatus(value: unknown): TestStatus {
  return value === "clear" || value === "affected" ? value : "";
}

function normalizeHealthTests(raw: unknown): HealthTests | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const d = raw as UnknownRecord;
  const t: HealthTests = {
    hcm: testStatus(d.hcm),
    pkd: testStatus(d.pkd),
    felv: testStatus(d.felv),
    fiv: testStatus(d.fiv),
    bloodType: stringValue(d.bloodType) || undefined,
  };
  // return undefined if nothing meaningful was set
  const hasAny = t.hcm || t.pkd || t.felv || t.fiv || t.bloodType;
  return hasAny ? t : undefined;
}

/** Normalize documents created by both the legacy Vite and current Next app. */
export function normalizeCatRecord(id: string, raw: unknown): CatRecord {
  const data: UnknownRecord =
    raw && typeof raw === "object" ? (raw as UnknownRecord) : {};

  const photos = Array.isArray(data.photos)
    ? data.photos.filter((photo): photo is string => typeof photo === "string" && photo.length > 0)
    : [];
  const legacyPhoto = stringValue(data.photoURL || data.photoUrl);
  if (photos.length === 0 && legacyPhoto) photos.push(legacyPhoto);

  const legacyAge = numberValue(data.ageYears) * 12 + numberValue(data.ageMonths);

  return {
    id,
    ownerId: stringValue(data.ownerId),
    ownerName: stringValue(data.ownerName, "ผู้ใช้ Catinder"),
    ownerEmail: stringValue(data.ownerEmail) || undefined,
    name: stringValue(data.name, "น้องแมว"),
    breed: stringValue(data.breed, "ไม่ระบุสายพันธุ์"),
    age: Math.max(0, numberValue(data.age, legacyAge)),
    gender: data.gender === "male" ? "male" : "female",
    photos,
    description: stringValue(data.description),
    vaccinated: data.vaccinated === true,
    registry: stringValue(data.registry) || undefined,
    registrationNumber:
      stringValue(data.registrationNumber || data.registryNumber) || undefined,
    petCertificateUrl:
      stringValue(data.petCertificateUrl || data.certPhotoURL) || undefined,
    province: stringValue(data.province) || undefined,
    healthTests: normalizeHealthTests(data.healthTests),
  };
}
