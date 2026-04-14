import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type UserModel = runtime.Types.Result.DefaultSelection<Prisma.$UserPayload>;
export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
export type UserAvgAggregateOutputType = {
    weightKg: number | null;
    targetWeightKg: number | null;
    heightCm: number | null;
    targetCalories: number | null;
    targetProteinG: number | null;
    targetCarbsG: number | null;
    targetFatG: number | null;
};
export type UserSumAggregateOutputType = {
    weightKg: number | null;
    targetWeightKg: number | null;
    heightCm: number | null;
    targetCalories: number | null;
    targetProteinG: number | null;
    targetCarbsG: number | null;
    targetFatG: number | null;
};
export type UserMinAggregateOutputType = {
    id: string | null;
    email: string | null;
    name: string | null;
    passwordHash: string | null;
    weightKg: number | null;
    targetWeightKg: number | null;
    heightCm: number | null;
    goal: $Enums.Goal | null;
    activityLevel: $Enums.ActivityLevel | null;
    targetCalories: number | null;
    targetProteinG: number | null;
    targetCarbsG: number | null;
    targetFatG: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type UserMaxAggregateOutputType = {
    id: string | null;
    email: string | null;
    name: string | null;
    passwordHash: string | null;
    weightKg: number | null;
    targetWeightKg: number | null;
    heightCm: number | null;
    goal: $Enums.Goal | null;
    activityLevel: $Enums.ActivityLevel | null;
    targetCalories: number | null;
    targetProteinG: number | null;
    targetCarbsG: number | null;
    targetFatG: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type UserCountAggregateOutputType = {
    id: number;
    email: number;
    name: number;
    passwordHash: number;
    weightKg: number;
    targetWeightKg: number;
    heightCm: number;
    goal: number;
    activityLevel: number;
    targetCalories: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatG: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type UserAvgAggregateInputType = {
    weightKg?: true;
    targetWeightKg?: true;
    heightCm?: true;
    targetCalories?: true;
    targetProteinG?: true;
    targetCarbsG?: true;
    targetFatG?: true;
};
export type UserSumAggregateInputType = {
    weightKg?: true;
    targetWeightKg?: true;
    heightCm?: true;
    targetCalories?: true;
    targetProteinG?: true;
    targetCarbsG?: true;
    targetFatG?: true;
};
export type UserMinAggregateInputType = {
    id?: true;
    email?: true;
    name?: true;
    passwordHash?: true;
    weightKg?: true;
    targetWeightKg?: true;
    heightCm?: true;
    goal?: true;
    activityLevel?: true;
    targetCalories?: true;
    targetProteinG?: true;
    targetCarbsG?: true;
    targetFatG?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type UserMaxAggregateInputType = {
    id?: true;
    email?: true;
    name?: true;
    passwordHash?: true;
    weightKg?: true;
    targetWeightKg?: true;
    heightCm?: true;
    goal?: true;
    activityLevel?: true;
    targetCalories?: true;
    targetProteinG?: true;
    targetCarbsG?: true;
    targetFatG?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type UserCountAggregateInputType = {
    id?: true;
    email?: true;
    name?: true;
    passwordHash?: true;
    weightKg?: true;
    targetWeightKg?: true;
    heightCm?: true;
    goal?: true;
    activityLevel?: true;
    targetCalories?: true;
    targetProteinG?: true;
    targetCarbsG?: true;
    targetFatG?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type UserAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UserCountAggregateInputType;
    _avg?: UserAvgAggregateInputType;
    _sum?: UserSumAggregateInputType;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUser[P]> : Prisma.GetScalarType<T[P], AggregateUser[P]>;
};
export type UserGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithAggregationInput | Prisma.UserOrderByWithAggregationInput[];
    by: Prisma.UserScalarFieldEnum[] | Prisma.UserScalarFieldEnum;
    having?: Prisma.UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _avg?: UserAvgAggregateInputType;
    _sum?: UserSumAggregateInputType;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type UserGroupByOutputType = {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    weightKg: number | null;
    targetWeightKg: number | null;
    heightCm: number | null;
    goal: $Enums.Goal;
    activityLevel: $Enums.ActivityLevel;
    targetCalories: number | null;
    targetProteinG: number | null;
    targetCarbsG: number | null;
    targetFatG: number | null;
    createdAt: Date;
    updatedAt: Date;
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
export type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]>;
}>>;
export type UserWhereInput = {
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    id?: Prisma.StringFilter<"User"> | string;
    email?: Prisma.StringFilter<"User"> | string;
    name?: Prisma.StringFilter<"User"> | string;
    passwordHash?: Prisma.StringFilter<"User"> | string;
    weightKg?: Prisma.FloatNullableFilter<"User"> | number | null;
    targetWeightKg?: Prisma.FloatNullableFilter<"User"> | number | null;
    heightCm?: Prisma.FloatNullableFilter<"User"> | number | null;
    goal?: Prisma.EnumGoalFilter<"User"> | $Enums.Goal;
    activityLevel?: Prisma.EnumActivityLevelFilter<"User"> | $Enums.ActivityLevel;
    targetCalories?: Prisma.IntNullableFilter<"User"> | number | null;
    targetProteinG?: Prisma.IntNullableFilter<"User"> | number | null;
    targetCarbsG?: Prisma.IntNullableFilter<"User"> | number | null;
    targetFatG?: Prisma.IntNullableFilter<"User"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    mealLogs?: Prisma.MealLogListRelationFilter;
};
export type UserOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    weightKg?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetWeightKg?: Prisma.SortOrderInput | Prisma.SortOrder;
    heightCm?: Prisma.SortOrderInput | Prisma.SortOrder;
    goal?: Prisma.SortOrder;
    activityLevel?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetProteinG?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetCarbsG?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetFatG?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    mealLogs?: Prisma.MealLogOrderByRelationAggregateInput;
};
export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    email?: string;
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    name?: Prisma.StringFilter<"User"> | string;
    passwordHash?: Prisma.StringFilter<"User"> | string;
    weightKg?: Prisma.FloatNullableFilter<"User"> | number | null;
    targetWeightKg?: Prisma.FloatNullableFilter<"User"> | number | null;
    heightCm?: Prisma.FloatNullableFilter<"User"> | number | null;
    goal?: Prisma.EnumGoalFilter<"User"> | $Enums.Goal;
    activityLevel?: Prisma.EnumActivityLevelFilter<"User"> | $Enums.ActivityLevel;
    targetCalories?: Prisma.IntNullableFilter<"User"> | number | null;
    targetProteinG?: Prisma.IntNullableFilter<"User"> | number | null;
    targetCarbsG?: Prisma.IntNullableFilter<"User"> | number | null;
    targetFatG?: Prisma.IntNullableFilter<"User"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    mealLogs?: Prisma.MealLogListRelationFilter;
}, "id" | "email">;
export type UserOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    weightKg?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetWeightKg?: Prisma.SortOrderInput | Prisma.SortOrder;
    heightCm?: Prisma.SortOrderInput | Prisma.SortOrder;
    goal?: Prisma.SortOrder;
    activityLevel?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetProteinG?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetCarbsG?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetFatG?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.UserCountOrderByAggregateInput;
    _avg?: Prisma.UserAvgOrderByAggregateInput;
    _max?: Prisma.UserMaxOrderByAggregateInput;
    _min?: Prisma.UserMinOrderByAggregateInput;
    _sum?: Prisma.UserSumOrderByAggregateInput;
};
export type UserScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"User"> | string;
    email?: Prisma.StringWithAggregatesFilter<"User"> | string;
    name?: Prisma.StringWithAggregatesFilter<"User"> | string;
    passwordHash?: Prisma.StringWithAggregatesFilter<"User"> | string;
    weightKg?: Prisma.FloatNullableWithAggregatesFilter<"User"> | number | null;
    targetWeightKg?: Prisma.FloatNullableWithAggregatesFilter<"User"> | number | null;
    heightCm?: Prisma.FloatNullableWithAggregatesFilter<"User"> | number | null;
    goal?: Prisma.EnumGoalWithAggregatesFilter<"User"> | $Enums.Goal;
    activityLevel?: Prisma.EnumActivityLevelWithAggregatesFilter<"User"> | $Enums.ActivityLevel;
    targetCalories?: Prisma.IntNullableWithAggregatesFilter<"User"> | number | null;
    targetProteinG?: Prisma.IntNullableWithAggregatesFilter<"User"> | number | null;
    targetCarbsG?: Prisma.IntNullableWithAggregatesFilter<"User"> | number | null;
    targetFatG?: Prisma.IntNullableWithAggregatesFilter<"User"> | number | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"User"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"User"> | Date | string;
};
export type UserCreateInput = {
    id?: string;
    email: string;
    name: string;
    passwordHash: string;
    weightKg?: number | null;
    targetWeightKg?: number | null;
    heightCm?: number | null;
    goal?: $Enums.Goal;
    activityLevel?: $Enums.ActivityLevel;
    targetCalories?: number | null;
    targetProteinG?: number | null;
    targetCarbsG?: number | null;
    targetFatG?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    mealLogs?: Prisma.MealLogCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateInput = {
    id?: string;
    email: string;
    name: string;
    passwordHash: string;
    weightKg?: number | null;
    targetWeightKg?: number | null;
    heightCm?: number | null;
    goal?: $Enums.Goal;
    activityLevel?: $Enums.ActivityLevel;
    targetCalories?: number | null;
    targetProteinG?: number | null;
    targetCarbsG?: number | null;
    targetFatG?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    mealLogs?: Prisma.MealLogUncheckedCreateNestedManyWithoutUserInput;
};
export type UserUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    weightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    targetWeightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heightCm?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    goal?: Prisma.EnumGoalFieldUpdateOperationsInput | $Enums.Goal;
    activityLevel?: Prisma.EnumActivityLevelFieldUpdateOperationsInput | $Enums.ActivityLevel;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProteinG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbsG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFatG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealLogs?: Prisma.MealLogUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    weightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    targetWeightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heightCm?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    goal?: Prisma.EnumGoalFieldUpdateOperationsInput | $Enums.Goal;
    activityLevel?: Prisma.EnumActivityLevelFieldUpdateOperationsInput | $Enums.ActivityLevel;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProteinG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbsG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFatG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealLogs?: Prisma.MealLogUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCreateManyInput = {
    id?: string;
    email: string;
    name: string;
    passwordHash: string;
    weightKg?: number | null;
    targetWeightKg?: number | null;
    heightCm?: number | null;
    goal?: $Enums.Goal;
    activityLevel?: $Enums.ActivityLevel;
    targetCalories?: number | null;
    targetProteinG?: number | null;
    targetCarbsG?: number | null;
    targetFatG?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    weightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    targetWeightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heightCm?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    goal?: Prisma.EnumGoalFieldUpdateOperationsInput | $Enums.Goal;
    activityLevel?: Prisma.EnumActivityLevelFieldUpdateOperationsInput | $Enums.ActivityLevel;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProteinG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbsG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFatG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    weightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    targetWeightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heightCm?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    goal?: Prisma.EnumGoalFieldUpdateOperationsInput | $Enums.Goal;
    activityLevel?: Prisma.EnumActivityLevelFieldUpdateOperationsInput | $Enums.ActivityLevel;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProteinG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbsG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFatG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    weightKg?: Prisma.SortOrder;
    targetWeightKg?: Prisma.SortOrder;
    heightCm?: Prisma.SortOrder;
    goal?: Prisma.SortOrder;
    activityLevel?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrder;
    targetProteinG?: Prisma.SortOrder;
    targetCarbsG?: Prisma.SortOrder;
    targetFatG?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserAvgOrderByAggregateInput = {
    weightKg?: Prisma.SortOrder;
    targetWeightKg?: Prisma.SortOrder;
    heightCm?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrder;
    targetProteinG?: Prisma.SortOrder;
    targetCarbsG?: Prisma.SortOrder;
    targetFatG?: Prisma.SortOrder;
};
export type UserMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    weightKg?: Prisma.SortOrder;
    targetWeightKg?: Prisma.SortOrder;
    heightCm?: Prisma.SortOrder;
    goal?: Prisma.SortOrder;
    activityLevel?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrder;
    targetProteinG?: Prisma.SortOrder;
    targetCarbsG?: Prisma.SortOrder;
    targetFatG?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    weightKg?: Prisma.SortOrder;
    targetWeightKg?: Prisma.SortOrder;
    heightCm?: Prisma.SortOrder;
    goal?: Prisma.SortOrder;
    activityLevel?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrder;
    targetProteinG?: Prisma.SortOrder;
    targetCarbsG?: Prisma.SortOrder;
    targetFatG?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserSumOrderByAggregateInput = {
    weightKg?: Prisma.SortOrder;
    targetWeightKg?: Prisma.SortOrder;
    heightCm?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrder;
    targetProteinG?: Prisma.SortOrder;
    targetCarbsG?: Prisma.SortOrder;
    targetFatG?: Prisma.SortOrder;
};
export type UserScalarRelationFilter = {
    is?: Prisma.UserWhereInput;
    isNot?: Prisma.UserWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type EnumGoalFieldUpdateOperationsInput = {
    set?: $Enums.Goal;
};
export type EnumActivityLevelFieldUpdateOperationsInput = {
    set?: $Enums.ActivityLevel;
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type UserCreateNestedOneWithoutMealLogsInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutMealLogsInput, Prisma.UserUncheckedCreateWithoutMealLogsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutMealLogsInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutMealLogsNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutMealLogsInput, Prisma.UserUncheckedCreateWithoutMealLogsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutMealLogsInput;
    upsert?: Prisma.UserUpsertWithoutMealLogsInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutMealLogsInput, Prisma.UserUpdateWithoutMealLogsInput>, Prisma.UserUncheckedUpdateWithoutMealLogsInput>;
};
export type UserCreateWithoutMealLogsInput = {
    id?: string;
    email: string;
    name: string;
    passwordHash: string;
    weightKg?: number | null;
    targetWeightKg?: number | null;
    heightCm?: number | null;
    goal?: $Enums.Goal;
    activityLevel?: $Enums.ActivityLevel;
    targetCalories?: number | null;
    targetProteinG?: number | null;
    targetCarbsG?: number | null;
    targetFatG?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserUncheckedCreateWithoutMealLogsInput = {
    id?: string;
    email: string;
    name: string;
    passwordHash: string;
    weightKg?: number | null;
    targetWeightKg?: number | null;
    heightCm?: number | null;
    goal?: $Enums.Goal;
    activityLevel?: $Enums.ActivityLevel;
    targetCalories?: number | null;
    targetProteinG?: number | null;
    targetCarbsG?: number | null;
    targetFatG?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserCreateOrConnectWithoutMealLogsInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutMealLogsInput, Prisma.UserUncheckedCreateWithoutMealLogsInput>;
};
export type UserUpsertWithoutMealLogsInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutMealLogsInput, Prisma.UserUncheckedUpdateWithoutMealLogsInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutMealLogsInput, Prisma.UserUncheckedCreateWithoutMealLogsInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutMealLogsInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutMealLogsInput, Prisma.UserUncheckedUpdateWithoutMealLogsInput>;
};
export type UserUpdateWithoutMealLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    weightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    targetWeightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heightCm?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    goal?: Prisma.EnumGoalFieldUpdateOperationsInput | $Enums.Goal;
    activityLevel?: Prisma.EnumActivityLevelFieldUpdateOperationsInput | $Enums.ActivityLevel;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProteinG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbsG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFatG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserUncheckedUpdateWithoutMealLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    weightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    targetWeightKg?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heightCm?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    goal?: Prisma.EnumGoalFieldUpdateOperationsInput | $Enums.Goal;
    activityLevel?: Prisma.EnumActivityLevelFieldUpdateOperationsInput | $Enums.ActivityLevel;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProteinG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbsG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFatG?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserCountOutputType = {
    mealLogs: number;
};
export type UserCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    mealLogs?: boolean | UserCountOutputTypeCountMealLogsArgs;
};
export type UserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserCountOutputTypeSelect<ExtArgs> | null;
};
export type UserCountOutputTypeCountMealLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogWhereInput;
};
export type UserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    name?: boolean;
    passwordHash?: boolean;
    weightKg?: boolean;
    targetWeightKg?: boolean;
    heightCm?: boolean;
    goal?: boolean;
    activityLevel?: boolean;
    targetCalories?: boolean;
    targetProteinG?: boolean;
    targetCarbsG?: boolean;
    targetFatG?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    mealLogs?: boolean | Prisma.User$mealLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["user"]>;
export type UserSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    name?: boolean;
    passwordHash?: boolean;
    weightKg?: boolean;
    targetWeightKg?: boolean;
    heightCm?: boolean;
    goal?: boolean;
    activityLevel?: boolean;
    targetCalories?: boolean;
    targetProteinG?: boolean;
    targetCarbsG?: boolean;
    targetFatG?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["user"]>;
export type UserSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    name?: boolean;
    passwordHash?: boolean;
    weightKg?: boolean;
    targetWeightKg?: boolean;
    heightCm?: boolean;
    goal?: boolean;
    activityLevel?: boolean;
    targetCalories?: boolean;
    targetProteinG?: boolean;
    targetCarbsG?: boolean;
    targetFatG?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["user"]>;
export type UserSelectScalar = {
    id?: boolean;
    email?: boolean;
    name?: boolean;
    passwordHash?: boolean;
    weightKg?: boolean;
    targetWeightKg?: boolean;
    heightCm?: boolean;
    goal?: boolean;
    activityLevel?: boolean;
    targetCalories?: boolean;
    targetProteinG?: boolean;
    targetCarbsG?: boolean;
    targetFatG?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type UserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "email" | "name" | "passwordHash" | "weightKg" | "targetWeightKg" | "heightCm" | "goal" | "activityLevel" | "targetCalories" | "targetProteinG" | "targetCarbsG" | "targetFatG" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>;
export type UserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    mealLogs?: boolean | Prisma.User$mealLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
};
export type UserIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type UserIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $UserPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "User";
    objects: {
        mealLogs: Prisma.$MealLogPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        weightKg: number | null;
        targetWeightKg: number | null;
        heightCm: number | null;
        goal: $Enums.Goal;
        activityLevel: $Enums.ActivityLevel;
        targetCalories: number | null;
        targetProteinG: number | null;
        targetCarbsG: number | null;
        targetFatG: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["user"]>;
    composites: {};
};
export type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserPayload, S>;
export type UserCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserCountAggregateInputType | true;
};
export interface UserDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['User'];
        meta: {
            name: 'User';
        };
    };
    findUnique<T extends UserFindUniqueArgs>(args: Prisma.SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UserFindFirstArgs>(args?: Prisma.SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UserFindManyArgs>(args?: Prisma.SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UserCreateArgs>(args: Prisma.SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UserCreateManyArgs>(args?: Prisma.SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UserDeleteArgs>(args: Prisma.SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UserUpdateArgs>(args: Prisma.SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UserDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UserUpdateManyArgs>(args: Prisma.SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UserUpsertArgs>(args: Prisma.SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UserCountArgs>(args?: Prisma.Subset<T, UserCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserCountAggregateOutputType> : number>;
    aggregate<T extends UserAggregateArgs>(args: Prisma.Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>;
    groupBy<T extends UserGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserGroupByArgs['orderBy'];
    } : {
        orderBy?: UserGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UserFieldRefs;
}
export interface Prisma__UserClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    mealLogs<T extends Prisma.User$mealLogsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$mealLogsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UserFieldRefs {
    readonly id: Prisma.FieldRef<"User", 'String'>;
    readonly email: Prisma.FieldRef<"User", 'String'>;
    readonly name: Prisma.FieldRef<"User", 'String'>;
    readonly passwordHash: Prisma.FieldRef<"User", 'String'>;
    readonly weightKg: Prisma.FieldRef<"User", 'Float'>;
    readonly targetWeightKg: Prisma.FieldRef<"User", 'Float'>;
    readonly heightCm: Prisma.FieldRef<"User", 'Float'>;
    readonly goal: Prisma.FieldRef<"User", 'Goal'>;
    readonly activityLevel: Prisma.FieldRef<"User", 'ActivityLevel'>;
    readonly targetCalories: Prisma.FieldRef<"User", 'Int'>;
    readonly targetProteinG: Prisma.FieldRef<"User", 'Int'>;
    readonly targetCarbsG: Prisma.FieldRef<"User", 'Int'>;
    readonly targetFatG: Prisma.FieldRef<"User", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"User", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"User", 'DateTime'>;
}
export type UserFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
};
export type UserCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
    where: Prisma.UserWhereUniqueInput;
};
export type UserUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type UserUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type UserUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
};
export type UserDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type User$mealLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    where?: Prisma.MealLogWhereInput;
    orderBy?: Prisma.MealLogOrderByWithRelationInput | Prisma.MealLogOrderByWithRelationInput[];
    cursor?: Prisma.MealLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MealLogScalarFieldEnum | Prisma.MealLogScalarFieldEnum[];
};
export type UserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
};
