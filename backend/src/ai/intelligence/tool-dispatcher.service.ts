import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { NutritionToolsService } from './nutrition-tools.service';

export const ALLOWED_TOOL_NAMES = [
  'getDailyNutrition',
  'getNutritionTargets',
  'getFoodHistory',
] as const;

export type AllowedToolName = (typeof ALLOWED_TOOL_NAMES)[number];

export const MAX_TOOL_CALLS_PER_REQUEST = 3;

export interface ToolCallRequest {
  name: string;
  args?: Record<string, any>;
  callId?: string;
}

export interface DispatchedToolResult {
  tool: string;
  callId?: string;
  success: boolean;
  data?: any;
  error?: string;
}

@Injectable()
export class ToolDispatcherService {
  private readonly logger = new Logger(ToolDispatcherService.name);

  constructor(private readonly nutritionToolsService: NutritionToolsService) {}

  /**
   * Checks whether a requested tool name is in the strict approved allowlist.
   */
  public isToolAllowed(name: string): name is AllowedToolName {
    return ALLOWED_TOOL_NAMES.includes(name as AllowedToolName);
  }

  /**
   * Sanitizes model-generated arguments to prevent identity spoofing or parameter injection.
   * Strips any attempt by the LLM to provide or override a userId or execute unauthorized fields.
   */
  private sanitizeArguments(rawArgs?: Record<string, any>): Record<string, any> {
    if (!rawArgs || typeof rawArgs !== 'object' || Array.isArray(rawArgs)) {
      return {};
    }

    const sanitized = { ...rawArgs };

    // Identity boundary: Model arguments can NEVER supply or override a user ID
    delete sanitized.userId;
    delete sanitized.user_id;
    delete sanitized.id;
    delete sanitized.user;

    return sanitized;
  }

  /**
   * Dispatches a single tool call request under the authenticated server-side userId.
   * Strictly read-only; rejects unknown tools, malformed arguments, and write requests.
   */
  async dispatch(
    authenticatedUserId: string,
    toolCall: ToolCallRequest,
  ): Promise<DispatchedToolResult> {
    // 1. Authenticated User Identity Guard
    if (
      !authenticatedUserId ||
      typeof authenticatedUserId !== 'string' ||
      !authenticatedUserId.trim()
    ) {
      throw new UnauthorizedException('Valid authenticated userId is required for tool execution');
    }

    const { name, callId } = toolCall;

    // 2. Strict Allowlist & Write-Protection Guard
    if (!this.isToolAllowed(name)) {
      this.logger.warn(`Rejected unauthorized or unknown tool call: "${name}"`);
      return {
        tool: name,
        callId,
        success: false,
        error: `Tool "${name}" is not recognized or permitted. Only approved read-only nutrition tools may be called.`,
      };
    }

    // 3. Argument Sanitization
    const cleanArgs = this.sanitizeArguments(toolCall.args);

    try {
      let data: any;

      switch (name) {
        case 'getDailyNutrition': {
          if (!cleanArgs.date) {
            throw new BadRequestException('Missing required parameter: "date" (YYYY-MM-DD)');
          }
          data = await this.nutritionToolsService.getDailyNutrition(authenticatedUserId, {
            date: cleanArgs.date,
          });
          break;
        }

        case 'getNutritionTargets': {
          data = await this.nutritionToolsService.getNutritionTargets(authenticatedUserId);
          break;
        }

        case 'getFoodHistory': {
          if (cleanArgs.days === undefined || cleanArgs.days === null) {
            throw new BadRequestException(
              'Missing required parameter: "days" (integer between 1 and 7)',
            );
          }
          data = await this.nutritionToolsService.getFoodHistory(authenticatedUserId, {
            days: cleanArgs.days,
            endDate: cleanArgs.endDate,
          });
          break;
        }
      }

      return {
        tool: name,
        callId,
        success: true,
        data,
      };
    } catch (err: any) {
      // Safe error handling: Do not expose database internals or full stack traces
      const errorMessage =
        err instanceof BadRequestException || err.name === 'BadRequestException'
          ? err.message
          : err.message || 'Tool execution encountered an error';

      this.logger.warn(`Tool "${name}" execution failed: ${errorMessage}`);

      return {
        tool: name,
        callId,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Dispatches a batch of tool calls selected by Gemini for a single turn.
   * Enforces bounded execution (maximum MAX_TOOL_CALLS_PER_REQUEST) to prevent DoS.
   */
  async dispatchBatch(
    authenticatedUserId: string,
    toolCalls: ToolCallRequest[],
  ): Promise<DispatchedToolResult[]> {
    if (!Array.isArray(toolCalls)) {
      throw new BadRequestException('toolCalls must be an array');
    }

    // Enforce upper bound on tool calls per user turn
    if (toolCalls.length > MAX_TOOL_CALLS_PER_REQUEST) {
      throw new BadRequestException(
        `Too many tool calls requested (${toolCalls.length}). Maximum allowed per request is ${MAX_TOOL_CALLS_PER_REQUEST}.`,
      );
    }

    const results: DispatchedToolResult[] = [];
    for (const call of toolCalls) {
      const res = await this.dispatch(authenticatedUserId, call);
      results.push(res);
    }

    return results;
  }
}
