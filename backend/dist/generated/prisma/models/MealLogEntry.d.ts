import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MealLogEntryModel = runtime.Types.Result.DefaultSelection<Prisma.$MealLogEntryPayload>;
export type AggregateMealLogEntry = {
    _count: MealLogEntryCountAggregateOutputType | null;
    _avg: MealLogEntryAvgAggregateOutputType | null;
    _sum: MealLogEntrySumAggregateOutputType | null;
    _min: MealLogEntryMinAggregateOutputType | null;
    _max: MealLogEntryMaxAggregateOutputType | null;
};
export type MealLogEntryAvgAggregateOutputType = {
    quantity: number | null;
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
};
export type MealLogEntrySumAggregateOutputType = {
    quantity: number | null;
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
};
export type MealLogEntryMinAggregateOutputType = {
    id: string | null;
    mealLogId: string | null;
    foodItemId: string | null;
    meal: $Enums.MealSlot | null;
    quantity: number | null;
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    createdAt: Date | null;
};
export type MealLogEntryMaxAggregateOutputType = {
    id: string | null;
    mealLogId: string | null;
    foodItemId: string | null;
    meal: $Enums.MealSlot | null;
    quantity: number | null;
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    createdAt: Date | null;
};
export type MealLogEntryCountAggregateOutputType = {
    id: number;
    mealLogId: number;
    foodItemId: number;
    meal: number;
    quantity: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt: number;
    _all: number;
};
export type MealLogEntryAvgAggregateInputType = {
    quantity?: true;
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
};
export type MealLogEntrySumAggregateInputType = {
    quantity?: true;
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
};
export type MealLogEntryMinAggregateInputType = {
    id?: true;
    mealLogId?: true;
    foodItemId?: true;
    meal?: true;
    quantity?: true;
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
    createdAt?: true;
};
export type MealLogEntryMaxAggregateInputType = {
    id?: true;
    mealLogId?: true;
    foodItemId?: true;
    meal?: true;
    quantity?: true;
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
    createdAt?: true;
};
export type MealLogEntryCountAggregateInputType = {
    id?: true;
    mealLogId?: true;
    foodItemId?: true;
    meal?: true;
    quantity?: true;
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
    createdAt?: true;
    _all?: true;
};
export type MealLogEntryAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogEntryWhereInput;
    orderBy?: Prisma.MealLogEntryOrderByWithRelationInput | Prisma.MealLogEntryOrderByWithRelationInput[];
    cursor?: Prisma.MealLogEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MealLogEntryCountAggregateInputType;
    _avg?: MealLogEntryAvgAggregateInputType;
    _sum?: MealLogEntrySumAggregateInputType;
    _min?: MealLogEntryMinAggregateInputType;
    _max?: MealLogEntryMaxAggregateInputType;
};
export type GetMealLogEntryAggregateType<T extends MealLogEntryAggregateArgs> = {
    [P in keyof T & keyof AggregateMealLogEntry]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMealLogEntry[P]> : Prisma.GetScalarType<T[P], AggregateMealLogEntry[P]>;
};
export type MealLogEntryGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogEntryWhereInput;
    orderBy?: Prisma.MealLogEntryOrderByWithAggregationInput | Prisma.MealLogEntryOrderByWithAggregationInput[];
    by: Prisma.MealLogEntryScalarFieldEnum[] | Prisma.MealLogEntryScalarFieldEnum;
    having?: Prisma.MealLogEntryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MealLogEntryCountAggregateInputType | true;
    _avg?: MealLogEntryAvgAggregateInputType;
    _sum?: MealLogEntrySumAggregateInputType;
    _min?: MealLogEntryMinAggregateInputType;
    _max?: MealLogEntryMaxAggregateInputType;
};
export type MealLogEntryGroupByOutputType = {
    id: string;
    mealLogId: string;
    foodItemId: string;
    meal: $Enums.MealSlot;
    quantity: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt: Date;
    _count: MealLogEntryCountAggregateOutputType | null;
    _avg: MealLogEntryAvgAggregateOutputType | null;
    _sum: MealLogEntrySumAggregateOutputType | null;
    _min: MealLogEntryMinAggregateOutputType | null;
    _max: MealLogEntryMaxAggregateOutputType | null;
};
export type GetMealLogEntryGroupByPayload<T extends MealLogEntryGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MealLogEntryGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MealLogEntryGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MealLogEntryGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MealLogEntryGroupByOutputType[P]>;
}>>;
export type MealLogEntryWhereInput = {
    AND?: Prisma.MealLogEntryWhereInput | Prisma.MealLogEntryWhereInput[];
    OR?: Prisma.MealLogEntryWhereInput[];
    NOT?: Prisma.MealLogEntryWhereInput | Prisma.MealLogEntryWhereInput[];
    id?: Prisma.StringFilter<"MealLogEntry"> | string;
    mealLogId?: Prisma.StringFilter<"MealLogEntry"> | string;
    foodItemId?: Prisma.StringFilter<"MealLogEntry"> | string;
    meal?: Prisma.EnumMealSlotFilter<"MealLogEntry"> | $Enums.MealSlot;
    quantity?: Prisma.FloatFilter<"MealLogEntry"> | number;
    kcal?: Prisma.FloatFilter<"MealLogEntry"> | number;
    proteinG?: Prisma.FloatFilter<"MealLogEntry"> | number;
    carbsG?: Prisma.FloatFilter<"MealLogEntry"> | number;
    fatG?: Prisma.FloatFilter<"MealLogEntry"> | number;
    createdAt?: Prisma.DateTimeFilter<"MealLogEntry"> | Date | string;
    mealLog?: Prisma.XOR<Prisma.MealLogScalarRelationFilter, Prisma.MealLogWhereInput>;
    foodItem?: Prisma.XOR<Prisma.FoodItemScalarRelationFilter, Prisma.FoodItemWhereInput>;
};
export type MealLogEntryOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    mealLogId?: Prisma.SortOrder;
    foodItemId?: Prisma.SortOrder;
    meal?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    mealLog?: Prisma.MealLogOrderByWithRelationInput;
    foodItem?: Prisma.FoodItemOrderByWithRelationInput;
};
export type MealLogEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.MealLogEntryWhereInput | Prisma.MealLogEntryWhereInput[];
    OR?: Prisma.MealLogEntryWhereInput[];
    NOT?: Prisma.MealLogEntryWhereInput | Prisma.MealLogEntryWhereInput[];
    mealLogId?: Prisma.StringFilter<"MealLogEntry"> | string;
    foodItemId?: Prisma.StringFilter<"MealLogEntry"> | string;
    meal?: Prisma.EnumMealSlotFilter<"MealLogEntry"> | $Enums.MealSlot;
    quantity?: Prisma.FloatFilter<"MealLogEntry"> | number;
    kcal?: Prisma.FloatFilter<"MealLogEntry"> | number;
    proteinG?: Prisma.FloatFilter<"MealLogEntry"> | number;
    carbsG?: Prisma.FloatFilter<"MealLogEntry"> | number;
    fatG?: Prisma.FloatFilter<"MealLogEntry"> | number;
    createdAt?: Prisma.DateTimeFilter<"MealLogEntry"> | Date | string;
    mealLog?: Prisma.XOR<Prisma.MealLogScalarRelationFilter, Prisma.MealLogWhereInput>;
    foodItem?: Prisma.XOR<Prisma.FoodItemScalarRelationFilter, Prisma.FoodItemWhereInput>;
}, "id">;
export type MealLogEntryOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    mealLogId?: Prisma.SortOrder;
    foodItemId?: Prisma.SortOrder;
    meal?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.MealLogEntryCountOrderByAggregateInput;
    _avg?: Prisma.MealLogEntryAvgOrderByAggregateInput;
    _max?: Prisma.MealLogEntryMaxOrderByAggregateInput;
    _min?: Prisma.MealLogEntryMinOrderByAggregateInput;
    _sum?: Prisma.MealLogEntrySumOrderByAggregateInput;
};
export type MealLogEntryScalarWhereWithAggregatesInput = {
    AND?: Prisma.MealLogEntryScalarWhereWithAggregatesInput | Prisma.MealLogEntryScalarWhereWithAggregatesInput[];
    OR?: Prisma.MealLogEntryScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MealLogEntryScalarWhereWithAggregatesInput | Prisma.MealLogEntryScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"MealLogEntry"> | string;
    mealLogId?: Prisma.StringWithAggregatesFilter<"MealLogEntry"> | string;
    foodItemId?: Prisma.StringWithAggregatesFilter<"MealLogEntry"> | string;
    meal?: Prisma.EnumMealSlotWithAggregatesFilter<"MealLogEntry"> | $Enums.MealSlot;
    quantity?: Prisma.FloatWithAggregatesFilter<"MealLogEntry"> | number;
    kcal?: Prisma.FloatWithAggregatesFilter<"MealLogEntry"> | number;
    proteinG?: Prisma.FloatWithAggregatesFilter<"MealLogEntry"> | number;
    carbsG?: Prisma.FloatWithAggregatesFilter<"MealLogEntry"> | number;
    fatG?: Prisma.FloatWithAggregatesFilter<"MealLogEntry"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"MealLogEntry"> | Date | string;
};
export type MealLogEntryCreateInput = {
    id?: string;
    meal: $Enums.MealSlot;
    quantity?: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt?: Date | string;
    mealLog: Prisma.MealLogCreateNestedOneWithoutEntriesInput;
    foodItem: Prisma.FoodItemCreateNestedOneWithoutMealLogEntriesInput;
};
export type MealLogEntryUncheckedCreateInput = {
    id?: string;
    mealLogId: string;
    foodItemId: string;
    meal: $Enums.MealSlot;
    quantity?: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt?: Date | string;
};
export type MealLogEntryUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealLog?: Prisma.MealLogUpdateOneRequiredWithoutEntriesNestedInput;
    foodItem?: Prisma.FoodItemUpdateOneRequiredWithoutMealLogEntriesNestedInput;
};
export type MealLogEntryUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    mealLogId?: Prisma.StringFieldUpdateOperationsInput | string;
    foodItemId?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogEntryCreateManyInput = {
    id?: string;
    mealLogId: string;
    foodItemId: string;
    meal: $Enums.MealSlot;
    quantity?: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt?: Date | string;
};
export type MealLogEntryUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogEntryUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    mealLogId?: Prisma.StringFieldUpdateOperationsInput | string;
    foodItemId?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogEntryListRelationFilter = {
    every?: Prisma.MealLogEntryWhereInput;
    some?: Prisma.MealLogEntryWhereInput;
    none?: Prisma.MealLogEntryWhereInput;
};
export type MealLogEntryOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MealLogEntryCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    mealLogId?: Prisma.SortOrder;
    foodItemId?: Prisma.SortOrder;
    meal?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type MealLogEntryAvgOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
};
export type MealLogEntryMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    mealLogId?: Prisma.SortOrder;
    foodItemId?: Prisma.SortOrder;
    meal?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type MealLogEntryMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    mealLogId?: Prisma.SortOrder;
    foodItemId?: Prisma.SortOrder;
    meal?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type MealLogEntrySumOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
};
export type MealLogEntryCreateNestedManyWithoutFoodItemInput = {
    create?: Prisma.XOR<Prisma.MealLogEntryCreateWithoutFoodItemInput, Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput> | Prisma.MealLogEntryCreateWithoutFoodItemInput[] | Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput[];
    connectOrCreate?: Prisma.MealLogEntryCreateOrConnectWithoutFoodItemInput | Prisma.MealLogEntryCreateOrConnectWithoutFoodItemInput[];
    createMany?: Prisma.MealLogEntryCreateManyFoodItemInputEnvelope;
    connect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
};
export type MealLogEntryUncheckedCreateNestedManyWithoutFoodItemInput = {
    create?: Prisma.XOR<Prisma.MealLogEntryCreateWithoutFoodItemInput, Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput> | Prisma.MealLogEntryCreateWithoutFoodItemInput[] | Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput[];
    connectOrCreate?: Prisma.MealLogEntryCreateOrConnectWithoutFoodItemInput | Prisma.MealLogEntryCreateOrConnectWithoutFoodItemInput[];
    createMany?: Prisma.MealLogEntryCreateManyFoodItemInputEnvelope;
    connect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
};
export type MealLogEntryUpdateManyWithoutFoodItemNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogEntryCreateWithoutFoodItemInput, Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput> | Prisma.MealLogEntryCreateWithoutFoodItemInput[] | Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput[];
    connectOrCreate?: Prisma.MealLogEntryCreateOrConnectWithoutFoodItemInput | Prisma.MealLogEntryCreateOrConnectWithoutFoodItemInput[];
    upsert?: Prisma.MealLogEntryUpsertWithWhereUniqueWithoutFoodItemInput | Prisma.MealLogEntryUpsertWithWhereUniqueWithoutFoodItemInput[];
    createMany?: Prisma.MealLogEntryCreateManyFoodItemInputEnvelope;
    set?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    disconnect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    delete?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    connect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    update?: Prisma.MealLogEntryUpdateWithWhereUniqueWithoutFoodItemInput | Prisma.MealLogEntryUpdateWithWhereUniqueWithoutFoodItemInput[];
    updateMany?: Prisma.MealLogEntryUpdateManyWithWhereWithoutFoodItemInput | Prisma.MealLogEntryUpdateManyWithWhereWithoutFoodItemInput[];
    deleteMany?: Prisma.MealLogEntryScalarWhereInput | Prisma.MealLogEntryScalarWhereInput[];
};
export type MealLogEntryUncheckedUpdateManyWithoutFoodItemNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogEntryCreateWithoutFoodItemInput, Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput> | Prisma.MealLogEntryCreateWithoutFoodItemInput[] | Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput[];
    connectOrCreate?: Prisma.MealLogEntryCreateOrConnectWithoutFoodItemInput | Prisma.MealLogEntryCreateOrConnectWithoutFoodItemInput[];
    upsert?: Prisma.MealLogEntryUpsertWithWhereUniqueWithoutFoodItemInput | Prisma.MealLogEntryUpsertWithWhereUniqueWithoutFoodItemInput[];
    createMany?: Prisma.MealLogEntryCreateManyFoodItemInputEnvelope;
    set?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    disconnect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    delete?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    connect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    update?: Prisma.MealLogEntryUpdateWithWhereUniqueWithoutFoodItemInput | Prisma.MealLogEntryUpdateWithWhereUniqueWithoutFoodItemInput[];
    updateMany?: Prisma.MealLogEntryUpdateManyWithWhereWithoutFoodItemInput | Prisma.MealLogEntryUpdateManyWithWhereWithoutFoodItemInput[];
    deleteMany?: Prisma.MealLogEntryScalarWhereInput | Prisma.MealLogEntryScalarWhereInput[];
};
export type MealLogEntryCreateNestedManyWithoutMealLogInput = {
    create?: Prisma.XOR<Prisma.MealLogEntryCreateWithoutMealLogInput, Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput> | Prisma.MealLogEntryCreateWithoutMealLogInput[] | Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput[];
    connectOrCreate?: Prisma.MealLogEntryCreateOrConnectWithoutMealLogInput | Prisma.MealLogEntryCreateOrConnectWithoutMealLogInput[];
    createMany?: Prisma.MealLogEntryCreateManyMealLogInputEnvelope;
    connect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
};
export type MealLogEntryUncheckedCreateNestedManyWithoutMealLogInput = {
    create?: Prisma.XOR<Prisma.MealLogEntryCreateWithoutMealLogInput, Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput> | Prisma.MealLogEntryCreateWithoutMealLogInput[] | Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput[];
    connectOrCreate?: Prisma.MealLogEntryCreateOrConnectWithoutMealLogInput | Prisma.MealLogEntryCreateOrConnectWithoutMealLogInput[];
    createMany?: Prisma.MealLogEntryCreateManyMealLogInputEnvelope;
    connect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
};
export type MealLogEntryUpdateManyWithoutMealLogNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogEntryCreateWithoutMealLogInput, Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput> | Prisma.MealLogEntryCreateWithoutMealLogInput[] | Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput[];
    connectOrCreate?: Prisma.MealLogEntryCreateOrConnectWithoutMealLogInput | Prisma.MealLogEntryCreateOrConnectWithoutMealLogInput[];
    upsert?: Prisma.MealLogEntryUpsertWithWhereUniqueWithoutMealLogInput | Prisma.MealLogEntryUpsertWithWhereUniqueWithoutMealLogInput[];
    createMany?: Prisma.MealLogEntryCreateManyMealLogInputEnvelope;
    set?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    disconnect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    delete?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    connect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    update?: Prisma.MealLogEntryUpdateWithWhereUniqueWithoutMealLogInput | Prisma.MealLogEntryUpdateWithWhereUniqueWithoutMealLogInput[];
    updateMany?: Prisma.MealLogEntryUpdateManyWithWhereWithoutMealLogInput | Prisma.MealLogEntryUpdateManyWithWhereWithoutMealLogInput[];
    deleteMany?: Prisma.MealLogEntryScalarWhereInput | Prisma.MealLogEntryScalarWhereInput[];
};
export type MealLogEntryUncheckedUpdateManyWithoutMealLogNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogEntryCreateWithoutMealLogInput, Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput> | Prisma.MealLogEntryCreateWithoutMealLogInput[] | Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput[];
    connectOrCreate?: Prisma.MealLogEntryCreateOrConnectWithoutMealLogInput | Prisma.MealLogEntryCreateOrConnectWithoutMealLogInput[];
    upsert?: Prisma.MealLogEntryUpsertWithWhereUniqueWithoutMealLogInput | Prisma.MealLogEntryUpsertWithWhereUniqueWithoutMealLogInput[];
    createMany?: Prisma.MealLogEntryCreateManyMealLogInputEnvelope;
    set?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    disconnect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    delete?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    connect?: Prisma.MealLogEntryWhereUniqueInput | Prisma.MealLogEntryWhereUniqueInput[];
    update?: Prisma.MealLogEntryUpdateWithWhereUniqueWithoutMealLogInput | Prisma.MealLogEntryUpdateWithWhereUniqueWithoutMealLogInput[];
    updateMany?: Prisma.MealLogEntryUpdateManyWithWhereWithoutMealLogInput | Prisma.MealLogEntryUpdateManyWithWhereWithoutMealLogInput[];
    deleteMany?: Prisma.MealLogEntryScalarWhereInput | Prisma.MealLogEntryScalarWhereInput[];
};
export type EnumMealSlotFieldUpdateOperationsInput = {
    set?: $Enums.MealSlot;
};
export type MealLogEntryCreateWithoutFoodItemInput = {
    id?: string;
    meal: $Enums.MealSlot;
    quantity?: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt?: Date | string;
    mealLog: Prisma.MealLogCreateNestedOneWithoutEntriesInput;
};
export type MealLogEntryUncheckedCreateWithoutFoodItemInput = {
    id?: string;
    mealLogId: string;
    meal: $Enums.MealSlot;
    quantity?: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt?: Date | string;
};
export type MealLogEntryCreateOrConnectWithoutFoodItemInput = {
    where: Prisma.MealLogEntryWhereUniqueInput;
    create: Prisma.XOR<Prisma.MealLogEntryCreateWithoutFoodItemInput, Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput>;
};
export type MealLogEntryCreateManyFoodItemInputEnvelope = {
    data: Prisma.MealLogEntryCreateManyFoodItemInput | Prisma.MealLogEntryCreateManyFoodItemInput[];
    skipDuplicates?: boolean;
};
export type MealLogEntryUpsertWithWhereUniqueWithoutFoodItemInput = {
    where: Prisma.MealLogEntryWhereUniqueInput;
    update: Prisma.XOR<Prisma.MealLogEntryUpdateWithoutFoodItemInput, Prisma.MealLogEntryUncheckedUpdateWithoutFoodItemInput>;
    create: Prisma.XOR<Prisma.MealLogEntryCreateWithoutFoodItemInput, Prisma.MealLogEntryUncheckedCreateWithoutFoodItemInput>;
};
export type MealLogEntryUpdateWithWhereUniqueWithoutFoodItemInput = {
    where: Prisma.MealLogEntryWhereUniqueInput;
    data: Prisma.XOR<Prisma.MealLogEntryUpdateWithoutFoodItemInput, Prisma.MealLogEntryUncheckedUpdateWithoutFoodItemInput>;
};
export type MealLogEntryUpdateManyWithWhereWithoutFoodItemInput = {
    where: Prisma.MealLogEntryScalarWhereInput;
    data: Prisma.XOR<Prisma.MealLogEntryUpdateManyMutationInput, Prisma.MealLogEntryUncheckedUpdateManyWithoutFoodItemInput>;
};
export type MealLogEntryScalarWhereInput = {
    AND?: Prisma.MealLogEntryScalarWhereInput | Prisma.MealLogEntryScalarWhereInput[];
    OR?: Prisma.MealLogEntryScalarWhereInput[];
    NOT?: Prisma.MealLogEntryScalarWhereInput | Prisma.MealLogEntryScalarWhereInput[];
    id?: Prisma.StringFilter<"MealLogEntry"> | string;
    mealLogId?: Prisma.StringFilter<"MealLogEntry"> | string;
    foodItemId?: Prisma.StringFilter<"MealLogEntry"> | string;
    meal?: Prisma.EnumMealSlotFilter<"MealLogEntry"> | $Enums.MealSlot;
    quantity?: Prisma.FloatFilter<"MealLogEntry"> | number;
    kcal?: Prisma.FloatFilter<"MealLogEntry"> | number;
    proteinG?: Prisma.FloatFilter<"MealLogEntry"> | number;
    carbsG?: Prisma.FloatFilter<"MealLogEntry"> | number;
    fatG?: Prisma.FloatFilter<"MealLogEntry"> | number;
    createdAt?: Prisma.DateTimeFilter<"MealLogEntry"> | Date | string;
};
export type MealLogEntryCreateWithoutMealLogInput = {
    id?: string;
    meal: $Enums.MealSlot;
    quantity?: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt?: Date | string;
    foodItem: Prisma.FoodItemCreateNestedOneWithoutMealLogEntriesInput;
};
export type MealLogEntryUncheckedCreateWithoutMealLogInput = {
    id?: string;
    foodItemId: string;
    meal: $Enums.MealSlot;
    quantity?: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt?: Date | string;
};
export type MealLogEntryCreateOrConnectWithoutMealLogInput = {
    where: Prisma.MealLogEntryWhereUniqueInput;
    create: Prisma.XOR<Prisma.MealLogEntryCreateWithoutMealLogInput, Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput>;
};
export type MealLogEntryCreateManyMealLogInputEnvelope = {
    data: Prisma.MealLogEntryCreateManyMealLogInput | Prisma.MealLogEntryCreateManyMealLogInput[];
    skipDuplicates?: boolean;
};
export type MealLogEntryUpsertWithWhereUniqueWithoutMealLogInput = {
    where: Prisma.MealLogEntryWhereUniqueInput;
    update: Prisma.XOR<Prisma.MealLogEntryUpdateWithoutMealLogInput, Prisma.MealLogEntryUncheckedUpdateWithoutMealLogInput>;
    create: Prisma.XOR<Prisma.MealLogEntryCreateWithoutMealLogInput, Prisma.MealLogEntryUncheckedCreateWithoutMealLogInput>;
};
export type MealLogEntryUpdateWithWhereUniqueWithoutMealLogInput = {
    where: Prisma.MealLogEntryWhereUniqueInput;
    data: Prisma.XOR<Prisma.MealLogEntryUpdateWithoutMealLogInput, Prisma.MealLogEntryUncheckedUpdateWithoutMealLogInput>;
};
export type MealLogEntryUpdateManyWithWhereWithoutMealLogInput = {
    where: Prisma.MealLogEntryScalarWhereInput;
    data: Prisma.XOR<Prisma.MealLogEntryUpdateManyMutationInput, Prisma.MealLogEntryUncheckedUpdateManyWithoutMealLogInput>;
};
export type MealLogEntryCreateManyFoodItemInput = {
    id?: string;
    mealLogId: string;
    meal: $Enums.MealSlot;
    quantity?: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt?: Date | string;
};
export type MealLogEntryUpdateWithoutFoodItemInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealLog?: Prisma.MealLogUpdateOneRequiredWithoutEntriesNestedInput;
};
export type MealLogEntryUncheckedUpdateWithoutFoodItemInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    mealLogId?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogEntryUncheckedUpdateManyWithoutFoodItemInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    mealLogId?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogEntryCreateManyMealLogInput = {
    id?: string;
    foodItemId: string;
    meal: $Enums.MealSlot;
    quantity?: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt?: Date | string;
};
export type MealLogEntryUpdateWithoutMealLogInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    foodItem?: Prisma.FoodItemUpdateOneRequiredWithoutMealLogEntriesNestedInput;
};
export type MealLogEntryUncheckedUpdateWithoutMealLogInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    foodItemId?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogEntryUncheckedUpdateManyWithoutMealLogInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    foodItemId?: Prisma.StringFieldUpdateOperationsInput | string;
    meal?: Prisma.EnumMealSlotFieldUpdateOperationsInput | $Enums.MealSlot;
    quantity?: Prisma.FloatFieldUpdateOperationsInput | number;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogEntrySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    mealLogId?: boolean;
    foodItemId?: boolean;
    meal?: boolean;
    quantity?: boolean;
    kcal?: boolean;
    proteinG?: boolean;
    carbsG?: boolean;
    fatG?: boolean;
    createdAt?: boolean;
    mealLog?: boolean | Prisma.MealLogDefaultArgs<ExtArgs>;
    foodItem?: boolean | Prisma.FoodItemDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["mealLogEntry"]>;
export type MealLogEntrySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    mealLogId?: boolean;
    foodItemId?: boolean;
    meal?: boolean;
    quantity?: boolean;
    kcal?: boolean;
    proteinG?: boolean;
    carbsG?: boolean;
    fatG?: boolean;
    createdAt?: boolean;
    mealLog?: boolean | Prisma.MealLogDefaultArgs<ExtArgs>;
    foodItem?: boolean | Prisma.FoodItemDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["mealLogEntry"]>;
export type MealLogEntrySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    mealLogId?: boolean;
    foodItemId?: boolean;
    meal?: boolean;
    quantity?: boolean;
    kcal?: boolean;
    proteinG?: boolean;
    carbsG?: boolean;
    fatG?: boolean;
    createdAt?: boolean;
    mealLog?: boolean | Prisma.MealLogDefaultArgs<ExtArgs>;
    foodItem?: boolean | Prisma.FoodItemDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["mealLogEntry"]>;
export type MealLogEntrySelectScalar = {
    id?: boolean;
    mealLogId?: boolean;
    foodItemId?: boolean;
    meal?: boolean;
    quantity?: boolean;
    kcal?: boolean;
    proteinG?: boolean;
    carbsG?: boolean;
    fatG?: boolean;
    createdAt?: boolean;
};
export type MealLogEntryOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "mealLogId" | "foodItemId" | "meal" | "quantity" | "kcal" | "proteinG" | "carbsG" | "fatG" | "createdAt", ExtArgs["result"]["mealLogEntry"]>;
export type MealLogEntryInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    mealLog?: boolean | Prisma.MealLogDefaultArgs<ExtArgs>;
    foodItem?: boolean | Prisma.FoodItemDefaultArgs<ExtArgs>;
};
export type MealLogEntryIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    mealLog?: boolean | Prisma.MealLogDefaultArgs<ExtArgs>;
    foodItem?: boolean | Prisma.FoodItemDefaultArgs<ExtArgs>;
};
export type MealLogEntryIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    mealLog?: boolean | Prisma.MealLogDefaultArgs<ExtArgs>;
    foodItem?: boolean | Prisma.FoodItemDefaultArgs<ExtArgs>;
};
export type $MealLogEntryPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MealLogEntry";
    objects: {
        mealLog: Prisma.$MealLogPayload<ExtArgs>;
        foodItem: Prisma.$FoodItemPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        mealLogId: string;
        foodItemId: string;
        meal: $Enums.MealSlot;
        quantity: number;
        kcal: number;
        proteinG: number;
        carbsG: number;
        fatG: number;
        createdAt: Date;
    }, ExtArgs["result"]["mealLogEntry"]>;
    composites: {};
};
export type MealLogEntryGetPayload<S extends boolean | null | undefined | MealLogEntryDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload, S>;
export type MealLogEntryCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MealLogEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MealLogEntryCountAggregateInputType | true;
};
export interface MealLogEntryDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MealLogEntry'];
        meta: {
            name: 'MealLogEntry';
        };
    };
    findUnique<T extends MealLogEntryFindUniqueArgs>(args: Prisma.SelectSubset<T, MealLogEntryFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MealLogEntryClient<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MealLogEntryFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MealLogEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MealLogEntryClient<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MealLogEntryFindFirstArgs>(args?: Prisma.SelectSubset<T, MealLogEntryFindFirstArgs<ExtArgs>>): Prisma.Prisma__MealLogEntryClient<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MealLogEntryFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MealLogEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MealLogEntryClient<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MealLogEntryFindManyArgs>(args?: Prisma.SelectSubset<T, MealLogEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MealLogEntryCreateArgs>(args: Prisma.SelectSubset<T, MealLogEntryCreateArgs<ExtArgs>>): Prisma.Prisma__MealLogEntryClient<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MealLogEntryCreateManyArgs>(args?: Prisma.SelectSubset<T, MealLogEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MealLogEntryCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MealLogEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MealLogEntryDeleteArgs>(args: Prisma.SelectSubset<T, MealLogEntryDeleteArgs<ExtArgs>>): Prisma.Prisma__MealLogEntryClient<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MealLogEntryUpdateArgs>(args: Prisma.SelectSubset<T, MealLogEntryUpdateArgs<ExtArgs>>): Prisma.Prisma__MealLogEntryClient<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MealLogEntryDeleteManyArgs>(args?: Prisma.SelectSubset<T, MealLogEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MealLogEntryUpdateManyArgs>(args: Prisma.SelectSubset<T, MealLogEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MealLogEntryUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MealLogEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MealLogEntryUpsertArgs>(args: Prisma.SelectSubset<T, MealLogEntryUpsertArgs<ExtArgs>>): Prisma.Prisma__MealLogEntryClient<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MealLogEntryCountArgs>(args?: Prisma.Subset<T, MealLogEntryCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MealLogEntryCountAggregateOutputType> : number>;
    aggregate<T extends MealLogEntryAggregateArgs>(args: Prisma.Subset<T, MealLogEntryAggregateArgs>): Prisma.PrismaPromise<GetMealLogEntryAggregateType<T>>;
    groupBy<T extends MealLogEntryGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MealLogEntryGroupByArgs['orderBy'];
    } : {
        orderBy?: MealLogEntryGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MealLogEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMealLogEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MealLogEntryFieldRefs;
}
export interface Prisma__MealLogEntryClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    mealLog<T extends Prisma.MealLogDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MealLogDefaultArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    foodItem<T extends Prisma.FoodItemDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.FoodItemDefaultArgs<ExtArgs>>): Prisma.Prisma__FoodItemClient<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MealLogEntryFieldRefs {
    readonly id: Prisma.FieldRef<"MealLogEntry", 'String'>;
    readonly mealLogId: Prisma.FieldRef<"MealLogEntry", 'String'>;
    readonly foodItemId: Prisma.FieldRef<"MealLogEntry", 'String'>;
    readonly meal: Prisma.FieldRef<"MealLogEntry", 'MealSlot'>;
    readonly quantity: Prisma.FieldRef<"MealLogEntry", 'Float'>;
    readonly kcal: Prisma.FieldRef<"MealLogEntry", 'Float'>;
    readonly proteinG: Prisma.FieldRef<"MealLogEntry", 'Float'>;
    readonly carbsG: Prisma.FieldRef<"MealLogEntry", 'Float'>;
    readonly fatG: Prisma.FieldRef<"MealLogEntry", 'Float'>;
    readonly createdAt: Prisma.FieldRef<"MealLogEntry", 'DateTime'>;
}
export type MealLogEntryFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
    where: Prisma.MealLogEntryWhereUniqueInput;
};
export type MealLogEntryFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
    where: Prisma.MealLogEntryWhereUniqueInput;
};
export type MealLogEntryFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
    where?: Prisma.MealLogEntryWhereInput;
    orderBy?: Prisma.MealLogEntryOrderByWithRelationInput | Prisma.MealLogEntryOrderByWithRelationInput[];
    cursor?: Prisma.MealLogEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MealLogEntryScalarFieldEnum | Prisma.MealLogEntryScalarFieldEnum[];
};
export type MealLogEntryFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
    where?: Prisma.MealLogEntryWhereInput;
    orderBy?: Prisma.MealLogEntryOrderByWithRelationInput | Prisma.MealLogEntryOrderByWithRelationInput[];
    cursor?: Prisma.MealLogEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MealLogEntryScalarFieldEnum | Prisma.MealLogEntryScalarFieldEnum[];
};
export type MealLogEntryFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
    where?: Prisma.MealLogEntryWhereInput;
    orderBy?: Prisma.MealLogEntryOrderByWithRelationInput | Prisma.MealLogEntryOrderByWithRelationInput[];
    cursor?: Prisma.MealLogEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MealLogEntryScalarFieldEnum | Prisma.MealLogEntryScalarFieldEnum[];
};
export type MealLogEntryCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MealLogEntryCreateInput, Prisma.MealLogEntryUncheckedCreateInput>;
};
export type MealLogEntryCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MealLogEntryCreateManyInput | Prisma.MealLogEntryCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MealLogEntryCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    data: Prisma.MealLogEntryCreateManyInput | Prisma.MealLogEntryCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.MealLogEntryIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type MealLogEntryUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MealLogEntryUpdateInput, Prisma.MealLogEntryUncheckedUpdateInput>;
    where: Prisma.MealLogEntryWhereUniqueInput;
};
export type MealLogEntryUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MealLogEntryUpdateManyMutationInput, Prisma.MealLogEntryUncheckedUpdateManyInput>;
    where?: Prisma.MealLogEntryWhereInput;
    limit?: number;
};
export type MealLogEntryUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MealLogEntryUpdateManyMutationInput, Prisma.MealLogEntryUncheckedUpdateManyInput>;
    where?: Prisma.MealLogEntryWhereInput;
    limit?: number;
    include?: Prisma.MealLogEntryIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type MealLogEntryUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
    where: Prisma.MealLogEntryWhereUniqueInput;
    create: Prisma.XOR<Prisma.MealLogEntryCreateInput, Prisma.MealLogEntryUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MealLogEntryUpdateInput, Prisma.MealLogEntryUncheckedUpdateInput>;
};
export type MealLogEntryDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
    where: Prisma.MealLogEntryWhereUniqueInput;
};
export type MealLogEntryDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogEntryWhereInput;
    limit?: number;
};
export type MealLogEntryDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogEntrySelect<ExtArgs> | null;
    omit?: Prisma.MealLogEntryOmit<ExtArgs> | null;
    include?: Prisma.MealLogEntryInclude<ExtArgs> | null;
};
