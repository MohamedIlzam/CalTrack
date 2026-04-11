import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly FoodItem: "FoodItem";
    readonly MealLog: "MealLog";
    readonly MealLogEntry: "MealLogEntry";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly name: "name";
    readonly passwordHash: "passwordHash";
    readonly weightKg: "weightKg";
    readonly targetWeightKg: "targetWeightKg";
    readonly heightCm: "heightCm";
    readonly goal: "goal";
    readonly activityLevel: "activityLevel";
    readonly targetCalories: "targetCalories";
    readonly targetProteinG: "targetProteinG";
    readonly targetCarbsG: "targetCarbsG";
    readonly targetFatG: "targetFatG";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const FoodItemScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly serving: "serving";
    readonly kcal: "kcal";
    readonly proteinG: "proteinG";
    readonly carbsG: "carbsG";
    readonly fatG: "fatG";
    readonly isCustom: "isCustom";
    readonly createdById: "createdById";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type FoodItemScalarFieldEnum = (typeof FoodItemScalarFieldEnum)[keyof typeof FoodItemScalarFieldEnum];
export declare const MealLogScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly date: "date";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MealLogScalarFieldEnum = (typeof MealLogScalarFieldEnum)[keyof typeof MealLogScalarFieldEnum];
export declare const MealLogEntryScalarFieldEnum: {
    readonly id: "id";
    readonly mealLogId: "mealLogId";
    readonly foodItemId: "foodItemId";
    readonly meal: "meal";
    readonly quantity: "quantity";
    readonly kcal: "kcal";
    readonly proteinG: "proteinG";
    readonly carbsG: "carbsG";
    readonly fatG: "fatG";
    readonly createdAt: "createdAt";
};
export type MealLogEntryScalarFieldEnum = (typeof MealLogEntryScalarFieldEnum)[keyof typeof MealLogEntryScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
