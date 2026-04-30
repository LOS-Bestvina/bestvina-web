const csRules = new Intl.PluralRules("cs");
const personLabels: Record<string, string> = {
	one: "osoba",
	few: "osoby",
	many: "osob",
	other: "osob",
};

export function formatPersonCount(count: number): string {
	return personLabels[csRules.select(count)] ?? "osob";
}
