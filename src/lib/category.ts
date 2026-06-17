import { calculateAge } from "./utils";

export type Gender = "MALE" | "FEMALE";
export type AgeCategory = "JUNIOR" | "SENIOR" | "MASTER";
export type CompetitionLevel = "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT";

export interface CategoryResult {
  category: AgeCategory;
  allowedLevels: CompetitionLevel[];
  autoAssignedLevel: CompetitionLevel | null;
  categoryRule: string;
}

export function detectCategory(
  dateOfBirth: Date | string,
  gender: Gender
): CategoryResult {
  const age = calculateAge(dateOfBirth);

  if (age < 23) {
    return {
      category: "JUNIOR",
      allowedLevels: ["GOLD"],
      autoAssignedLevel: "GOLD",
      categoryRule:
        "Atletas menores de 23 años compiten exclusivamente en Nivel ORO",
    };
  }

  const masterAge = gender === "MALE" ? 40 : 35;
  if (age >= masterAge) {
    return {
      category: "MASTER",
      allowedLevels: ["SILVER"],
      autoAssignedLevel: "SILVER",
      categoryRule: `Atletas Master (${
        gender === "MALE" ? "hombres >40" : "mujeres >35"
      } años) compiten exclusivamente en Nivel PLATA`,
    };
  }

  return {
    category: "SENIOR",
    allowedLevels: ["GOLD", "SILVER", "BRONZE", "SPEED_FIT"],
    autoAssignedLevel: null,
    categoryRule: "Categoría Senior puede elegir cualquier nivel disponible",
  };
}
