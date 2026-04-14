import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type FoodItemModel = runtime.Types.Result.DefaultSelection<Prisma.$FoodItemPayload>;
export type AggregateFoodItem = {
    _count: FoodItemCountAggregateOutputType | null;
    _avg: FoodItemAvgAggregateOutputType | null;
    _sum: FoodItemSumAggregateOutputType | null;
    _min: FoodItemMinAggregateOutputType | null;
    _max: FoodItemMaxAggregateOutputType | null;
};
export type FoodItemAvgAggregateOutputType = {
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
};
export type FoodItemSumAggregateOutputType = {
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
};
export type FoodItemMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    serving: string | null;
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    isCustom: boolean | null;
    createdById: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type FoodItemMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    serving: string | null;
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    isCustom: boolean | null;
    createdById: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type FoodItemCountAggregateOutputType = {
    id: number;
    name: number;
    serving: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isCustom: number;
    createdById: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type FoodItemAvgAggregateInputType = {
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
};
export type FoodItemSumAggregateInputType = {
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
};
export type FoodItemMinAggregateInputType = {
    id?: true;
    name?: true;
    serving?: true;
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
    isCustom?: true;
    createdById?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type FoodItemMaxAggregateInputType = {
    id?: true;
    name?: true;
    serving?: true;
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
    isCustom?: true;
    createdById?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type FoodItemCountAggregateInputType = {
    id?: true;
    name?: true;
    serving?: true;
    kcal?: true;
    proteinG?: true;
    carbsG?: true;
    fatG?: true;
    isCustom?: true;
    createdById?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type FoodItemAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FoodItemWhereInput;
    orderBy?: Prisma.FoodItemOrderByWithRelationInput | Prisma.FoodItemOrderByWithRelationInput[];
    cursor?: Prisma.FoodItemWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | FoodItemCountAggregateInputType;
    _avg?: FoodItemAvgAggregateInputType;
    _sum?: FoodItemSumAggregateInputType;
    _min?: FoodItemMinAggregateInputType;
    _max?: FoodItemMaxAggregateInputType;
};
export type GetFoodItemAggregateType<T extends FoodItemAggregateArgs> = {
    [P in keyof T & keyof AggregateFoodItem]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateFoodItem[P]> : Prisma.GetScalarType<T[P], AggregateFoodItem[P]>;
};
export type FoodItemGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FoodItemWhereInput;
    orderBy?: Prisma.FoodItemOrderByWithAggregationInput | Prisma.FoodItemOrderByWithAggregationInput[];
    by: Prisma.FoodItemScalarFieldEnum[] | Prisma.FoodItemScalarFieldEnum;
    having?: Prisma.FoodItemScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: FoodItemCountAggregateInputType | true;
    _avg?: FoodItemAvgAggregateInputType;
    _sum?: FoodItemSumAggregateInputType;
    _min?: FoodItemMinAggregateInputType;
    _max?: FoodItemMaxAggregateInputType;
};
export type FoodItemGroupByOutputType = {
    id: string;
    name: string;
    serving: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isCustom: boolean;
    createdById: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: FoodItemCountAggregateOutputType | null;
    _avg: FoodItemAvgAggregateOutputType | null;
    _sum: FoodItemSumAggregateOutputType | null;
    _min: FoodItemMinAggregateOutputType | null;
    _max: FoodItemMaxAggregateOutputType | null;
};
export type GetFoodItemGroupByPayload<T extends FoodItemGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<FoodItemGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof FoodItemGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], FoodItemGroupByOutputType[P]> : Prisma.GetScalarType<T[P], FoodItemGroupByOutputType[P]>;
}>>;
export type FoodItemWhereInput = {
    AND?: Prisma.FoodItemWhereInput | Prisma.FoodItemWhereInput[];
    OR?: Prisma.FoodItemWhereInput[];
    NOT?: Prisma.FoodItemWhereInput | Prisma.FoodItemWhereInput[];
    id?: Prisma.StringFilter<"FoodItem"> | string;
    name?: Prisma.StringFilter<"FoodItem"> | string;
    serving?: Prisma.StringFilter<"FoodItem"> | string;
    kcal?: Prisma.FloatFilter<"FoodItem"> | number;
    proteinG?: Prisma.FloatFilter<"FoodItem"> | number;
    carbsG?: Prisma.FloatFilter<"FoodItem"> | number;
    fatG?: Prisma.FloatFilter<"FoodItem"> | number;
    isCustom?: Prisma.BoolFilter<"FoodItem"> | boolean;
    createdById?: Prisma.StringNullableFilter<"FoodItem"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"FoodItem"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"FoodItem"> | Date | string;
    mealLogEntries?: Prisma.MealLogEntryListRelationFilter;
};
export type FoodItemOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    serving?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    isCustom?: Prisma.SortOrder;
    createdById?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    mealLogEntries?: Prisma.MealLogEntryOrderByRelationAggregateInput;
};
export type FoodItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.FoodItemWhereInput | Prisma.FoodItemWhereInput[];
    OR?: Prisma.FoodItemWhereInput[];
    NOT?: Prisma.FoodItemWhereInput | Prisma.FoodItemWhereInput[];
    name?: Prisma.StringFilter<"FoodItem"> | string;
    serving?: Prisma.StringFilter<"FoodItem"> | string;
    kcal?: Prisma.FloatFilter<"FoodItem"> | number;
    proteinG?: Prisma.FloatFilter<"FoodItem"> | number;
    carbsG?: Prisma.FloatFilter<"FoodItem"> | number;
    fatG?: Prisma.FloatFilter<"FoodItem"> | number;
    isCustom?: Prisma.BoolFilter<"FoodItem"> | boolean;
    createdById?: Prisma.StringNullableFilter<"FoodItem"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"FoodItem"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"FoodItem"> | Date | string;
    mealLogEntries?: Prisma.MealLogEntryListRelationFilter;
}, "id">;
export type FoodItemOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    serving?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    isCustom?: Prisma.SortOrder;
    createdById?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.FoodItemCountOrderByAggregateInput;
    _avg?: Prisma.FoodItemAvgOrderByAggregateInput;
    _max?: Prisma.FoodItemMaxOrderByAggregateInput;
    _min?: Prisma.FoodItemMinOrderByAggregateInput;
    _sum?: Prisma.FoodItemSumOrderByAggregateInput;
};
export type FoodItemScalarWhereWithAggregatesInput = {
    AND?: Prisma.FoodItemScalarWhereWithAggregatesInput | Prisma.FoodItemScalarWhereWithAggregatesInput[];
    OR?: Prisma.FoodItemScalarWhereWithAggregatesInput[];
    NOT?: Prisma.FoodItemScalarWhereWithAggregatesInput | Prisma.FoodItemScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"FoodItem"> | string;
    name?: Prisma.StringWithAggregatesFilter<"FoodItem"> | string;
    serving?: Prisma.StringWithAggregatesFilter<"FoodItem"> | string;
    kcal?: Prisma.FloatWithAggregatesFilter<"FoodItem"> | number;
    proteinG?: Prisma.FloatWithAggregatesFilter<"FoodItem"> | number;
    carbsG?: Prisma.FloatWithAggregatesFilter<"FoodItem"> | number;
    fatG?: Prisma.FloatWithAggregatesFilter<"FoodItem"> | number;
    isCustom?: Prisma.BoolWithAggregatesFilter<"FoodItem"> | boolean;
    createdById?: Prisma.StringNullableWithAggregatesFilter<"FoodItem"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"FoodItem"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"FoodItem"> | Date | string;
};
export type FoodItemCreateInput = {
    id?: string;
    name: string;
    serving: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isCustom?: boolean;
    createdById?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    mealLogEntries?: Prisma.MealLogEntryCreateNestedManyWithoutFoodItemInput;
};
export type FoodItemUncheckedCreateInput = {
    id?: string;
    name: string;
    serving: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isCustom?: boolean;
    createdById?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    mealLogEntries?: Prisma.MealLogEntryUncheckedCreateNestedManyWithoutFoodItemInput;
};
export type FoodItemUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    serving?: Prisma.StringFieldUpdateOperationsInput | string;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    isCustom?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealLogEntries?: Prisma.MealLogEntryUpdateManyWithoutFoodItemNestedInput;
};
export type FoodItemUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    serving?: Prisma.StringFieldUpdateOperationsInput | string;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    isCustom?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealLogEntries?: Prisma.MealLogEntryUncheckedUpdateManyWithoutFoodItemNestedInput;
};
export type FoodItemCreateManyInput = {
    id?: string;
    name: string;
    serving: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isCustom?: boolean;
    createdById?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FoodItemUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    serving?: Prisma.StringFieldUpdateOperationsInput | string;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    isCustom?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FoodItemUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    serving?: Prisma.StringFieldUpdateOperationsInput | string;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    isCustom?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FoodItemCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    serving?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    isCustom?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type FoodItemAvgOrderByAggregateInput = {
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
};
export type FoodItemMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    serving?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    isCustom?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type FoodItemMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    serving?: Prisma.SortOrder;
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
    isCustom?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type FoodItemSumOrderByAggregateInput = {
    kcal?: Prisma.SortOrder;
    proteinG?: Prisma.SortOrder;
    carbsG?: Prisma.SortOrder;
    fatG?: Prisma.SortOrder;
};
export type FoodItemScalarRelationFilter = {
    is?: Prisma.FoodItemWhereInput;
    isNot?: Prisma.FoodItemWhereInput;
};
export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type FoodItemCreateNestedOneWithoutMealLogEntriesInput = {
    create?: Prisma.XOR<Prisma.FoodItemCreateWithoutMealLogEntriesInput, Prisma.FoodItemUncheckedCreateWithoutMealLogEntriesInput>;
    connectOrCreate?: Prisma.FoodItemCreateOrConnectWithoutMealLogEntriesInput;
    connect?: Prisma.FoodItemWhereUniqueInput;
};
export type FoodItemUpdateOneRequiredWithoutMealLogEntriesNestedInput = {
    create?: Prisma.XOR<Prisma.FoodItemCreateWithoutMealLogEntriesInput, Prisma.FoodItemUncheckedCreateWithoutMealLogEntriesInput>;
    connectOrCreate?: Prisma.FoodItemCreateOrConnectWithoutMealLogEntriesInput;
    upsert?: Prisma.FoodItemUpsertWithoutMealLogEntriesInput;
    connect?: Prisma.FoodItemWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.FoodItemUpdateToOneWithWhereWithoutMealLogEntriesInput, Prisma.FoodItemUpdateWithoutMealLogEntriesInput>, Prisma.FoodItemUncheckedUpdateWithoutMealLogEntriesInput>;
};
export type FoodItemCreateWithoutMealLogEntriesInput = {
    id?: string;
    name: string;
    serving: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isCustom?: boolean;
    createdById?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FoodItemUncheckedCreateWithoutMealLogEntriesInput = {
    id?: string;
    name: string;
    serving: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isCustom?: boolean;
    createdById?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FoodItemCreateOrConnectWithoutMealLogEntriesInput = {
    where: Prisma.FoodItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.FoodItemCreateWithoutMealLogEntriesInput, Prisma.FoodItemUncheckedCreateWithoutMealLogEntriesInput>;
};
export type FoodItemUpsertWithoutMealLogEntriesInput = {
    update: Prisma.XOR<Prisma.FoodItemUpdateWithoutMealLogEntriesInput, Prisma.FoodItemUncheckedUpdateWithoutMealLogEntriesInput>;
    create: Prisma.XOR<Prisma.FoodItemCreateWithoutMealLogEntriesInput, Prisma.FoodItemUncheckedCreateWithoutMealLogEntriesInput>;
    where?: Prisma.FoodItemWhereInput;
};
export type FoodItemUpdateToOneWithWhereWithoutMealLogEntriesInput = {
    where?: Prisma.FoodItemWhereInput;
    data: Prisma.XOR<Prisma.FoodItemUpdateWithoutMealLogEntriesInput, Prisma.FoodItemUncheckedUpdateWithoutMealLogEntriesInput>;
};
export type FoodItemUpdateWithoutMealLogEntriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    serving?: Prisma.StringFieldUpdateOperationsInput | string;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    isCustom?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FoodItemUncheckedUpdateWithoutMealLogEntriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    serving?: Prisma.StringFieldUpdateOperationsInput | string;
    kcal?: Prisma.FloatFieldUpdateOperationsInput | number;
    proteinG?: Prisma.FloatFieldUpdateOperationsInput | number;
    carbsG?: Prisma.FloatFieldUpdateOperationsInput | number;
    fatG?: Prisma.FloatFieldUpdateOperationsInput | number;
    isCustom?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FoodItemCountOutputType = {
    mealLogEntries: number;
};
export type FoodItemCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    mealLogEntries?: boolean | FoodItemCountOutputTypeCountMealLogEntriesArgs;
};
export type FoodItemCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemCountOutputTypeSelect<ExtArgs> | null;
};
export type FoodItemCountOutputTypeCountMealLogEntriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogEntryWhereInput;
};
export type FoodItemSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    serving?: boolean;
    kcal?: boolean;
    proteinG?: boolean;
    carbsG?: boolean;
    fatG?: boolean;
    isCustom?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    mealLogEntries?: boolean | Prisma.FoodItem$mealLogEntriesArgs<ExtArgs>;
    _count?: boolean | Prisma.FoodItemCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["foodItem"]>;
export type FoodItemSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    serving?: boolean;
    kcal?: boolean;
    proteinG?: boolean;
    carbsG?: boolean;
    fatG?: boolean;
    isCustom?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["foodItem"]>;
export type FoodItemSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    serving?: boolean;
    kcal?: boolean;
    proteinG?: boolean;
    carbsG?: boolean;
    fatG?: boolean;
    isCustom?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["foodItem"]>;
export type FoodItemSelectScalar = {
    id?: boolean;
    name?: boolean;
    serving?: boolean;
    kcal?: boolean;
    proteinG?: boolean;
    carbsG?: boolean;
    fatG?: boolean;
    isCustom?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type FoodItemOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "serving" | "kcal" | "proteinG" | "carbsG" | "fatG" | "isCustom" | "createdById" | "createdAt" | "updatedAt", ExtArgs["result"]["foodItem"]>;
export type FoodItemInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    mealLogEntries?: boolean | Prisma.FoodItem$mealLogEntriesArgs<ExtArgs>;
    _count?: boolean | Prisma.FoodItemCountOutputTypeDefaultArgs<ExtArgs>;
};
export type FoodItemIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type FoodItemIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $FoodItemPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "FoodItem";
    objects: {
        mealLogEntries: Prisma.$MealLogEntryPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        serving: string;
        kcal: number;
        proteinG: number;
        carbsG: number;
        fatG: number;
        isCustom: boolean;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["foodItem"]>;
    composites: {};
};
export type FoodItemGetPayload<S extends boolean | null | undefined | FoodItemDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$FoodItemPayload, S>;
export type FoodItemCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<FoodItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: FoodItemCountAggregateInputType | true;
};
export interface FoodItemDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['FoodItem'];
        meta: {
            name: 'FoodItem';
        };
    };
    findUnique<T extends FoodItemFindUniqueArgs>(args: Prisma.SelectSubset<T, FoodItemFindUniqueArgs<ExtArgs>>): Prisma.Prisma__FoodItemClient<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends FoodItemFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, FoodItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__FoodItemClient<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends FoodItemFindFirstArgs>(args?: Prisma.SelectSubset<T, FoodItemFindFirstArgs<ExtArgs>>): Prisma.Prisma__FoodItemClient<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends FoodItemFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, FoodItemFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__FoodItemClient<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends FoodItemFindManyArgs>(args?: Prisma.SelectSubset<T, FoodItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends FoodItemCreateArgs>(args: Prisma.SelectSubset<T, FoodItemCreateArgs<ExtArgs>>): Prisma.Prisma__FoodItemClient<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends FoodItemCreateManyArgs>(args?: Prisma.SelectSubset<T, FoodItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends FoodItemCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, FoodItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends FoodItemDeleteArgs>(args: Prisma.SelectSubset<T, FoodItemDeleteArgs<ExtArgs>>): Prisma.Prisma__FoodItemClient<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends FoodItemUpdateArgs>(args: Prisma.SelectSubset<T, FoodItemUpdateArgs<ExtArgs>>): Prisma.Prisma__FoodItemClient<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends FoodItemDeleteManyArgs>(args?: Prisma.SelectSubset<T, FoodItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends FoodItemUpdateManyArgs>(args: Prisma.SelectSubset<T, FoodItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends FoodItemUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, FoodItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends FoodItemUpsertArgs>(args: Prisma.SelectSubset<T, FoodItemUpsertArgs<ExtArgs>>): Prisma.Prisma__FoodItemClient<runtime.Types.Result.GetResult<Prisma.$FoodItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends FoodItemCountArgs>(args?: Prisma.Subset<T, FoodItemCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], FoodItemCountAggregateOutputType> : number>;
    aggregate<T extends FoodItemAggregateArgs>(args: Prisma.Subset<T, FoodItemAggregateArgs>): Prisma.PrismaPromise<GetFoodItemAggregateType<T>>;
    groupBy<T extends FoodItemGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: FoodItemGroupByArgs['orderBy'];
    } : {
        orderBy?: FoodItemGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, FoodItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFoodItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: FoodItemFieldRefs;
}
export interface Prisma__FoodItemClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    mealLogEntries<T extends Prisma.FoodItem$mealLogEntriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.FoodItem$mealLogEntriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface FoodItemFieldRefs {
    readonly id: Prisma.FieldRef<"FoodItem", 'String'>;
    readonly name: Prisma.FieldRef<"FoodItem", 'String'>;
    readonly serving: Prisma.FieldRef<"FoodItem", 'String'>;
    readonly kcal: Prisma.FieldRef<"FoodItem", 'Float'>;
    readonly proteinG: Prisma.FieldRef<"FoodItem", 'Float'>;
    readonly carbsG: Prisma.FieldRef<"FoodItem", 'Float'>;
    readonly fatG: Prisma.FieldRef<"FoodItem", 'Float'>;
    readonly isCustom: Prisma.FieldRef<"FoodItem", 'Boolean'>;
    readonly createdById: Prisma.FieldRef<"FoodItem", 'String'>;
    readonly createdAt: Prisma.FieldRef<"FoodItem", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"FoodItem", 'DateTime'>;
}
export type FoodItemFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
    where: Prisma.FoodItemWhereUniqueInput;
};
export type FoodItemFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
    where: Prisma.FoodItemWhereUniqueInput;
};
export type FoodItemFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
    where?: Prisma.FoodItemWhereInput;
    orderBy?: Prisma.FoodItemOrderByWithRelationInput | Prisma.FoodItemOrderByWithRelationInput[];
    cursor?: Prisma.FoodItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FoodItemScalarFieldEnum | Prisma.FoodItemScalarFieldEnum[];
};
export type FoodItemFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
    where?: Prisma.FoodItemWhereInput;
    orderBy?: Prisma.FoodItemOrderByWithRelationInput | Prisma.FoodItemOrderByWithRelationInput[];
    cursor?: Prisma.FoodItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FoodItemScalarFieldEnum | Prisma.FoodItemScalarFieldEnum[];
};
export type FoodItemFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
    where?: Prisma.FoodItemWhereInput;
    orderBy?: Prisma.FoodItemOrderByWithRelationInput | Prisma.FoodItemOrderByWithRelationInput[];
    cursor?: Prisma.FoodItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FoodItemScalarFieldEnum | Prisma.FoodItemScalarFieldEnum[];
};
export type FoodItemCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FoodItemCreateInput, Prisma.FoodItemUncheckedCreateInput>;
};
export type FoodItemCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.FoodItemCreateManyInput | Prisma.FoodItemCreateManyInput[];
    skipDuplicates?: boolean;
};
export type FoodItemCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    data: Prisma.FoodItemCreateManyInput | Prisma.FoodItemCreateManyInput[];
    skipDuplicates?: boolean;
};
export type FoodItemUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FoodItemUpdateInput, Prisma.FoodItemUncheckedUpdateInput>;
    where: Prisma.FoodItemWhereUniqueInput;
};
export type FoodItemUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.FoodItemUpdateManyMutationInput, Prisma.FoodItemUncheckedUpdateManyInput>;
    where?: Prisma.FoodItemWhereInput;
    limit?: number;
};
export type FoodItemUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FoodItemUpdateManyMutationInput, Prisma.FoodItemUncheckedUpdateManyInput>;
    where?: Prisma.FoodItemWhereInput;
    limit?: number;
};
export type FoodItemUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
    where: Prisma.FoodItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.FoodItemCreateInput, Prisma.FoodItemUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.FoodItemUpdateInput, Prisma.FoodItemUncheckedUpdateInput>;
};
export type FoodItemDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
    where: Prisma.FoodItemWhereUniqueInput;
};
export type FoodItemDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FoodItemWhereInput;
    limit?: number;
};
export type FoodItem$mealLogEntriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type FoodItemDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FoodItemSelect<ExtArgs> | null;
    omit?: Prisma.FoodItemOmit<ExtArgs> | null;
    include?: Prisma.FoodItemInclude<ExtArgs> | null;
};
