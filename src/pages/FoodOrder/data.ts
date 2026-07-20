import type { DailyMenu, PollQuestionType } from "./type";

export const weeklyMenu: DailyMenu[] = [
  {
    dayKey: "sat",
    date: "Oct 28",
    menuA: { nameKey: "kebab", cals: 950, tags: ["Popular"] },
    menuB: { nameKey: "salad", cals: 450, tags: ["Healthy"] },
  },
  {
    dayKey: "sun",
    date: "Oct 29",
    menuA: { nameKey: "stew", cals: 880, tags: ["Traditional"] },
    menuB: { nameKey: "diet_chicken", cals: 500, tags: ["Protein"] },
  },
  {
    dayKey: "mon",
    date: "Oct 30",
    menuA: { nameKey: "chicken", cals: 920, tags: ["Popular"] },
    menuB: { nameKey: "veggie", cals: 350, tags: ["Vegan"] },
  },
  {
    dayKey: "tue",
    date: "Oct 31",
    menuA: { nameKey: "pasta", cals: 850, tags: [] },
    menuB: { nameKey: "salad", cals: 450, tags: ["Healthy"] },
  },
  {
    dayKey: "wed",
    date: "Nov 01",
    menuA: { nameKey: "fish", cals: 780, tags: ["Omega3"] },
    menuB: { nameKey: "diet_chicken", cals: 500, tags: ["Protein"] },
  },
];

export const poll: PollQuestionType[] = [
  {
    id: 1,
    questionText: "کیفیت کلی وعده‌های غذایی هفته گذشته چگونه بود؟",
    options: [
      { id: 101, optionText: "عالی" },
      { id: 102, optionText: "خوب" },
      { id: 103, optionText: "متوسط" },
      { id: 104, optionText: "ضعیف" },
    ],
  },
  {
    id: 2,
    questionText: "تنوع منوی انتخابی (منوی A و B) را چگونه ارزیابی می‌کنید؟",
    options: [
      { id: 101, optionText: "عالی" },
      { id: 102, optionText: "خوب" },
      { id: 103, optionText: "متوسط" },
      { id: 104, optionText: "ضعیف" },
    ],
  },
];
