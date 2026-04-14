export declare const Goal: {
    readonly LOSE: "LOSE";
    readonly MAINTAIN: "MAINTAIN";
    readonly GAIN: "GAIN";
};
export type Goal = (typeof Goal)[keyof typeof Goal];
export declare const ActivityLevel: {
    readonly SEDENTARY: "SEDENTARY";
    readonly LIGHT: "LIGHT";
    readonly MODERATE: "MODERATE";
    readonly ACTIVE: "ACTIVE";
};
export type ActivityLevel = (typeof ActivityLevel)[keyof typeof ActivityLevel];
export declare const MealSlot: {
    readonly BREAKFAST: "BREAKFAST";
    readonly LUNCH: "LUNCH";
    readonly DINNER: "DINNER";
    readonly SNACKS: "SNACKS";
};
export type MealSlot = (typeof MealSlot)[keyof typeof MealSlot];
