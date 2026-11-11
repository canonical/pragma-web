import { DeepThinkingToggle } from "./common/index.js";
import PromptInputRoot from "./PromptInput.js";
import type { PromptInputComponent } from "./types.js";

export const PromptInput = PromptInputRoot as PromptInputComponent;
PromptInput.DeepThinkingToggle = DeepThinkingToggle;

export type {
  DeepThinkingToggleProps,
  PromptInputSuggestion,
  PromptInputSuggestionGroup,
} from "./common/index.js";
export type {
  PromptInputComponent,
  PromptInputMessages,
  PromptInputProps,
} from "./types.js";
