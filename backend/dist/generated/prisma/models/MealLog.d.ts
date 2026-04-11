import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MealLogModel = runtime.Types.Result.DefaultSelection<Prisma.$MealLogPayload>;
export type AggregateMealLog = {
    _count: MealLogCountAggregateOutputType | null;
    _min: MealLogMinAggregateOutputType | null;
    _max: MealLogMaxAggregateOutputType | null;
};
export type MealLogMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    date: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MealLogMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    date: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MealLogCountAggregateOutputType = {
    id: number;
    userId: number;
    date: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type MealLogMinAggregateInputType = {
    id?: true;
    userId?: true;
    date?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MealLogMaxAggregateInputType = {
    id?: true;
    userId?: true;
    date?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MealLogCountAggregateInputType = {
    id?: true;
    userId?: true;
    date?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type MealLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogWhereInput;
    orderBy?: Prisma.MealLogOrderByWithRelationInput | Prisma.MealLogOrderByWithRelationInput[];
    cursor?: Prisma.MealLogWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MealLogCountAggregateInputType;
    _min?: MealLogMinAggregateInputType;
    _max?: MealLogMaxAggregateInputType;
};
export type GetMealLogAggregateType<T extends MealLogAggregateArgs> = {
    [P in keyof T & keyof AggregateMealLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMealLog[P]> : Prisma.GetScalarType<T[P], AggregateMealLog[P]>;
};
export type MealLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogWhereInput;
    orderBy?: Prisma.MealLogOrderByWithAggregationInput | Prisma.MealLogOrderByWithAggregationInput[];
    by: Prisma.MealLogScalarFieldEnum[] | Prisma.MealLogScalarFieldEnum;
    having?: Prisma.MealLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MealLogCountAggregateInputType | true;
    _min?: MealLogMinAggregateInputType;
    _max?: MealLogMaxAggregateInputType;
};
export type MealLogGroupByOutputType = {
    id: string;
    userId: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    _count: MealLogCountAggregateOutputType | null;
    _min: MealLogMinAggregateOutputType | null;
    _max: MealLogMaxAggregateOutputType | null;
};
export type GetMealLogGroupByPayload<T extends MealLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MealLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MealLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MealLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MealLogGroupByOutputType[P]>;
}>>;
export type MealLogWhereInput = {
    AND?: Prisma.MealLogWhereInput | Prisma.MealLogWhereInput[];
    OR?: Prisma.MealLogWhereInput[];
    NOT?: Prisma.MealLogWhereInput | Prisma.MealLogWhereInput[];
    id?: Prisma.StringFilter<"MealLog"> | string;
    userId?: Prisma.StringFilter<"MealLog"> | string;
    date?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    entries?: Prisma.MealLogEntryListRelationFilter;
};
export type MealLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    entries?: Prisma.MealLogEntryOrderByRelationAggregateInput;
};
export type MealLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId_date?: Prisma.MealLogUserIdDateCompoundUniqueInput;
    AND?: Prisma.MealLogWhereInput | Prisma.MealLogWhereInput[];
    OR?: Prisma.MealLogWhereInput[];
    NOT?: Prisma.MealLogWhereInput | Prisma.MealLogWhereInput[];
    userId?: Prisma.StringFilter<"MealLog"> | string;
    date?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    entries?: Prisma.MealLogEntryListRelationFilter;
}, "id" | "userId_date">;
export type MealLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.MealLogCountOrderByAggregateInput;
    _max?: Prisma.MealLogMaxOrderByAggregateInput;
    _min?: Prisma.MealLogMinOrderByAggregateInput;
};
export type MealLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.MealLogScalarWhereWithAggregatesInput | Prisma.MealLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.MealLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MealLogScalarWhereWithAggregatesInput | Prisma.MealLogScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"MealLog"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"MealLog"> | string;
    date?: Prisma.DateTimeWithAggregatesFilter<"MealLog"> | Date | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"MealLog"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"MealLog"> | Date | string;
};
export type MealLogCreateInput = {
    id?: string;
    date: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutMealLogsInput;
    entries?: Prisma.MealLogEntryCreateNestedManyWithoutMealLogInput;
};
export type MealLogUncheckedCreateInput = {
    id?: string;
    userId: string;
    date: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    entries?: Prisma.MealLogEntryUncheckedCreateNestedManyWithoutMealLogInput;
};
export type MealLogUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutMealLogsNestedInput;
    entries?: Prisma.MealLogEntryUpdateManyWithoutMealLogNestedInput;
};
export type MealLogUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entries?: Prisma.MealLogEntryUncheckedUpdateManyWithoutMealLogNestedInput;
};
export type MealLogCreateManyInput = {
    id?: string;
    userId: string;
    date: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MealLogUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogListRelationFilter = {
    every?: Prisma.MealLogWhereInput;
    some?: Prisma.MealLogWhereInput;
    none?: Prisma.MealLogWhereInput;
};
export type MealLogOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MealLogUserIdDateCompoundUniqueInput = {
    userId: string;
    date: Date | string;
};
export type MealLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MealLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MealLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MealLogScalarRelationFilter = {
    is?: Prisma.MealLogWhereInput;
    isNot?: Prisma.MealLogWhereInput;
};
export type MealLogCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutUserInput, Prisma.MealLogUncheckedCreateWithoutUserInput> | Prisma.MealLogCreateWithoutUserInput[] | Prisma.MealLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutUserInput | Prisma.MealLogCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.MealLogCreateManyUserInputEnvelope;
    connect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
};
export type MealLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutUserInput, Prisma.MealLogUncheckedCreateWithoutUserInput> | Prisma.MealLogCreateWithoutUserInput[] | Prisma.MealLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutUserInput | Prisma.MealLogCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.MealLogCreateManyUserInputEnvelope;
    connect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
};
export type MealLogUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutUserInput, Prisma.MealLogUncheckedCreateWithoutUserInput> | Prisma.MealLogCreateWithoutUserInput[] | Prisma.MealLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutUserInput | Prisma.MealLogCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.MealLogUpsertWithWhereUniqueWithoutUserInput | Prisma.MealLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.MealLogCreateManyUserInputEnvelope;
    set?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    disconnect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    delete?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    connect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    update?: Prisma.MealLogUpdateWithWhereUniqueWithoutUserInput | Prisma.MealLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.MealLogUpdateManyWithWhereWithoutUserInput | Prisma.MealLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.MealLogScalarWhereInput | Prisma.MealLogScalarWhereInput[];
};
export type MealLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutUserInput, Prisma.MealLogUncheckedCreateWithoutUserInput> | Prisma.MealLogCreateWithoutUserInput[] | Prisma.MealLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutUserInput | Prisma.MealLogCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.MealLogUpsertWithWhereUniqueWithoutUserInput | Prisma.MealLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.MealLogCreateManyUserInputEnvelope;
    set?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    disconnect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    delete?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    connect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    update?: Prisma.MealLogUpdateWithWhereUniqueWithoutUserInput | Prisma.MealLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.MealLogUpdateManyWithWhereWithoutUserInput | Prisma.MealLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.MealLogScalarWhereInput | Prisma.MealLogScalarWhereInput[];
};
export type MealLogCreateNestedOneWithoutEntriesInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutEntriesInput, Prisma.MealLogUncheckedCreateWithoutEntriesInput>;
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutEntriesInput;
    connect?: Prisma.MealLogWhereUniqueInput;
};
export type MealLogUpdateOneRequiredWithoutEntriesNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutEntriesInput, Prisma.MealLogUncheckedCreateWithoutEntriesInput>;
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutEntriesInput;
    upsert?: Prisma.MealLogUpsertWithoutEntriesInput;
    connect?: Prisma.MealLogWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MealLogUpdateToOneWithWhereWithoutEntriesInput, Prisma.MealLogUpdateWithoutEntriesInput>, Prisma.MealLogUncheckedUpdateWithoutEntriesInput>;
};
export type MealLogCreateWithoutUserInput = {
    id?: string;
    date: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    entries?: Prisma.MealLogEntryCreateNestedManyWithoutMealLogInput;
};
export type MealLogUncheckedCreateWithoutUserInput = {
    id?: string;
    date: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    entries?: Prisma.MealLogEntryUncheckedCreateNestedManyWithoutMealLogInput;
};
export type MealLogCreateOrConnectWithoutUserInput = {
    where: Prisma.MealLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.MealLogCreateWithoutUserInput, Prisma.MealLogUncheckedCreateWithoutUserInput>;
};
export type MealLogCreateManyUserInputEnvelope = {
    data: Prisma.MealLogCreateManyUserInput | Prisma.MealLogCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type MealLogUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.MealLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.MealLogUpdateWithoutUserInput, Prisma.MealLogUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.MealLogCreateWithoutUserInput, Prisma.MealLogUncheckedCreateWithoutUserInput>;
};
export type MealLogUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.MealLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.MealLogUpdateWithoutUserInput, Prisma.MealLogUncheckedUpdateWithoutUserInput>;
};
export type MealLogUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.MealLogScalarWhereInput;
    data: Prisma.XOR<Prisma.MealLogUpdateManyMutationInput, Prisma.MealLogUncheckedUpdateManyWithoutUserInput>;
};
export type MealLogScalarWhereInput = {
    AND?: Prisma.MealLogScalarWhereInput | Prisma.MealLogScalarWhereInput[];
    OR?: Prisma.MealLogScalarWhereInput[];
    NOT?: Prisma.MealLogScalarWhereInput | Prisma.MealLogScalarWhereInput[];
    id?: Prisma.StringFilter<"MealLog"> | string;
    userId?: Prisma.StringFilter<"MealLog"> | string;
    date?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
};
export type MealLogCreateWithoutEntriesInput = {
    id?: string;
    date: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutMealLogsInput;
};
export type MealLogUncheckedCreateWithoutEntriesInput = {
    id?: string;
    userId: string;
    date: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MealLogCreateOrConnectWithoutEntriesInput = {
    where: Prisma.MealLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.MealLogCreateWithoutEntriesInput, Prisma.MealLogUncheckedCreateWithoutEntriesInput>;
};
export type MealLogUpsertWithoutEntriesInput = {
    update: Prisma.XOR<Prisma.MealLogUpdateWithoutEntriesInput, Prisma.MealLogUncheckedUpdateWithoutEntriesInput>;
    create: Prisma.XOR<Prisma.MealLogCreateWithoutEntriesInput, Prisma.MealLogUncheckedCreateWithoutEntriesInput>;
    where?: Prisma.MealLogWhereInput;
};
export type MealLogUpdateToOneWithWhereWithoutEntriesInput = {
    where?: Prisma.MealLogWhereInput;
    data: Prisma.XOR<Prisma.MealLogUpdateWithoutEntriesInput, Prisma.MealLogUncheckedUpdateWithoutEntriesInput>;
};
export type MealLogUpdateWithoutEntriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutMealLogsNestedInput;
};
export type MealLogUncheckedUpdateWithoutEntriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogCreateManyUserInput = {
    id?: string;
    date: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MealLogUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entries?: Prisma.MealLogEntryUpdateManyWithoutMealLogNestedInput;
};
export type MealLogUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entries?: Prisma.MealLogEntryUncheckedUpdateManyWithoutMealLogNestedInput;
};
export type MealLogUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogCountOutputType = {
    entries: number;
};
export type MealLogCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entries?: boolean | MealLogCountOutputTypeCountEntriesArgs;
};
export type MealLogCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogCountOutputTypeSelect<ExtArgs> | null;
};
export type MealLogCountOutputTypeCountEntriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogEntryWhereInput;
};
export type MealLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    date?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    entries?: boolean | Prisma.MealLog$entriesArgs<ExtArgs>;
    _count?: boolean | Prisma.MealLogCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["mealLog"]>;
export type MealLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    date?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["mealLog"]>;
export type MealLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    date?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["mealLog"]>;
export type MealLogSelectScalar = {
    id?: boolean;
    userId?: boolean;
    date?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type MealLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "date" | "createdAt" | "updatedAt", ExtArgs["result"]["mealLog"]>;
export type MealLogInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    entries?: boolean | Prisma.MealLog$entriesArgs<ExtArgs>;
    _count?: boolean | Prisma.MealLogCountOutputTypeDefaultArgs<ExtArgs>;
};
export type MealLogIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type MealLogIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $MealLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MealLog";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        entries: Prisma.$MealLogEntryPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["mealLog"]>;
    composites: {};
};
export type MealLogGetPayload<S extends boolean | null | undefined | MealLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MealLogPayload, S>;
export type MealLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MealLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MealLogCountAggregateInputType | true;
};
export interface MealLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MealLog'];
        meta: {
            name: 'MealLog';
        };
    };
    findUnique<T extends MealLogFindUniqueArgs>(args: Prisma.SelectSubset<T, MealLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MealLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MealLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MealLogFindFirstArgs>(args?: Prisma.SelectSubset<T, MealLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MealLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MealLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MealLogFindManyArgs>(args?: Prisma.SelectSubset<T, MealLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MealLogCreateArgs>(args: Prisma.SelectSubset<T, MealLogCreateArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MealLogCreateManyArgs>(args?: Prisma.SelectSubset<T, MealLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MealLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MealLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MealLogDeleteArgs>(args: Prisma.SelectSubset<T, MealLogDeleteArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MealLogUpdateArgs>(args: Prisma.SelectSubset<T, MealLogUpdateArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MealLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, MealLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MealLogUpdateManyArgs>(args: Prisma.SelectSubset<T, MealLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MealLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MealLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MealLogUpsertArgs>(args: Prisma.SelectSubset<T, MealLogUpsertArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MealLogCountArgs>(args?: Prisma.Subset<T, MealLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MealLogCountAggregateOutputType> : number>;
    aggregate<T extends MealLogAggregateArgs>(args: Prisma.Subset<T, MealLogAggregateArgs>): Prisma.PrismaPromise<GetMealLogAggregateType<T>>;
    groupBy<T extends MealLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MealLogGroupByArgs['orderBy'];
    } : {
        orderBy?: MealLogGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MealLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMealLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MealLogFieldRefs;
}
export interface Prisma__MealLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    entries<T extends Prisma.MealLog$entriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MealLog$entriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MealLogFieldRefs {
    readonly id: Prisma.FieldRef<"MealLog", 'String'>;
    readonly userId: Prisma.FieldRef<"MealLog", 'String'>;
    readonly date: Prisma.FieldRef<"MealLog", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"MealLog", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"MealLog", 'DateTime'>;
}
export type MealLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    where: Prisma.MealLogWhereUniqueInput;
};
export type MealLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    where: Prisma.MealLogWhereUniqueInput;
};
export type MealLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MealLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MealLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MealLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MealLogCreateInput, Prisma.MealLogUncheckedCreateInput>;
};
export type MealLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MealLogCreateManyInput | Prisma.MealLogCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MealLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    data: Prisma.MealLogCreateManyInput | Prisma.MealLogCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.MealLogIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type MealLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MealLogUpdateInput, Prisma.MealLogUncheckedUpdateInput>;
    where: Prisma.MealLogWhereUniqueInput;
};
export type MealLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MealLogUpdateManyMutationInput, Prisma.MealLogUncheckedUpdateManyInput>;
    where?: Prisma.MealLogWhereInput;
    limit?: number;
};
export type MealLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MealLogUpdateManyMutationInput, Prisma.MealLogUncheckedUpdateManyInput>;
    where?: Prisma.MealLogWhereInput;
    limit?: number;
    include?: Prisma.MealLogIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type MealLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    where: Prisma.MealLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.MealLogCreateInput, Prisma.MealLogUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MealLogUpdateInput, Prisma.MealLogUncheckedUpdateInput>;
};
export type MealLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    where: Prisma.MealLogWhereUniqueInput;
};
export type MealLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogWhereInput;
    limit?: number;
};
export type MealLog$entriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MealLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    include?: Prisma.MealLogInclude<ExtArgs> | null;
};
