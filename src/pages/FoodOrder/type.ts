export type MealType = "A" | "B" | "None";

export interface MealItem {
  nameKey: string;
  cals: number;
  tags: string[];
}

export interface DailyMenu {
  dayKey: string;
  date: string;
  menuA: MealItem;
  menuB: MealItem;
}

export interface PollOptionType {
  id: number;
  optionText: string;
}

export interface PollQuestionType {
  id: number;
  questionText: string;
  options: PollOptionType[];
}
