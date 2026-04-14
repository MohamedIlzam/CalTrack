import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly User: "User";
    readonly FoodItem: "FoodItem";
    readonly MealLog: "MealLog";
    readonly MealLogEntry: "MealLogEntry";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "user" | "foodItem" | "mealLog" | "mealLogEntry";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
        FoodItem: {
            payload: Prisma.$FoodItemPayload<ExtArgs>;
            fields: Prisma.FoodItemFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.FoodItemFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.FoodItemFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload>;
                };
                findFirst: {
                    args: Prisma.FoodItemFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.FoodItemFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload>;
                };
                findMany: {
                    args: Prisma.FoodItemFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload>[];
                };
                create: {
                    args: Prisma.FoodItemCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload>;
                };
                createMany: {
                    args: Prisma.FoodItemCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.FoodItemCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload>[];
                };
                delete: {
                    args: Prisma.FoodItemDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload>;
                };
                update: {
                    args: Prisma.FoodItemUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload>;
                };
                deleteMany: {
                    args: Prisma.FoodItemDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.FoodItemUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.FoodItemUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload>[];
                };
                upsert: {
                    args: Prisma.FoodItemUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FoodItemPayload>;
                };
                aggregate: {
                    args: Prisma.FoodItemAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateFoodItem>;
                };
                groupBy: {
                    args: Prisma.FoodItemGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FoodItemGroupByOutputType>[];
                };
                count: {
                    args: Prisma.FoodItemCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FoodItemCountAggregateOutputType> | number;
                };
            };
        };
        MealLog: {
            payload: Prisma.$MealLogPayload<ExtArgs>;
            fields: Prisma.MealLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MealLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MealLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                findFirst: {
                    args: Prisma.MealLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MealLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                findMany: {
                    args: Prisma.MealLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>[];
                };
                create: {
                    args: Prisma.MealLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                createMany: {
                    args: Prisma.MealLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MealLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>[];
                };
                delete: {
                    args: Prisma.MealLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                update: {
                    args: Prisma.MealLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                deleteMany: {
                    args: Prisma.MealLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MealLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MealLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>[];
                };
                upsert: {
                    args: Prisma.MealLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                aggregate: {
                    args: Prisma.MealLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMealLog>;
                };
                groupBy: {
                    args: Prisma.MealLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MealLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MealLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MealLogCountAggregateOutputType> | number;
                };
            };
        };
        MealLogEntry: {
            payload: Prisma.$MealLogEntryPayload<ExtArgs>;
            fields: Prisma.MealLogEntryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MealLogEntryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MealLogEntryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload>;
                };
                findFirst: {
                    args: Prisma.MealLogEntryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MealLogEntryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload>;
                };
                findMany: {
                    args: Prisma.MealLogEntryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload>[];
                };
                create: {
                    args: Prisma.MealLogEntryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload>;
                };
                createMany: {
                    args: Prisma.MealLogEntryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MealLogEntryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload>[];
                };
                delete: {
                    args: Prisma.MealLogEntryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload>;
                };
                update: {
                    args: Prisma.MealLogEntryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload>;
                };
                deleteMany: {
                    args: Prisma.MealLogEntryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MealLogEntryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MealLogEntryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload>[];
                };
                upsert: {
                    args: Prisma.MealLogEntryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogEntryPayload>;
                };
                aggregate: {
                    args: Prisma.MealLogEntryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMealLogEntry>;
                };
                groupBy: {
                    args: Prisma.MealLogEntryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MealLogEntryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MealLogEntryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MealLogEntryCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
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
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type EnumGoalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Goal'>;
export type ListEnumGoalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Goal[]'>;
export type EnumActivityLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityLevel'>;
export type ListEnumActivityLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityLevel[]'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type EnumMealSlotFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MealSlot'>;
export type ListEnumMealSlotFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MealSlot[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    accelerateUrl: string;
    adapter?: never;
}) & {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
};
export type GlobalOmitConfig = {
    user?: Prisma.UserOmit;
    foodItem?: Prisma.FoodItemOmit;
    mealLog?: Prisma.MealLogOmit;
    mealLogEntry?: Prisma.MealLogEntryOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
