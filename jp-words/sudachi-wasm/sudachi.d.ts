/* tslint:disable */
/* eslint-disable */
export function main(): void;
/**
 * Unit to split text
 *
 * Some examples:
 * ```text
 * A：選挙/管理/委員/会
 * B：選挙/管理/委員会
 * C：選挙管理委員会
 *
 * A：客室/乗務/員
 * B：客室/乗務員
 * C：客室乗務員
 *
 * A：労働/者/協同/組合
 * B：労働者/協同/組合
 * C：労働者協同組合
 *
 * A：機能/性/食品
 * B：機能性/食品
 * C：機能性食品
 * ```
 *
 * See [Sudachi documentation](https://github.com/WorksApplications/Sudachi#the-modes-of-splitting)
 * for more details
 */
export enum TokenizeMode {
  /**
   * Short
   */
  A = 0,
  /**
   * Middle (similar to "word")
   */
  B = 1,
  /**
   * Named Entity
   */
  C = 2,
}
export interface TokenMorpheme {
    surface: string;
    poses: string[];
    normalized_form: string;
    reading_form: string;
    dictionary_form: string;
    word_id: number;
    oov: boolean;
    begin: number;
    end: number;
}

/**
 * Implementation of a Tokenizer which have tokenization state.
 *
 * Useful when no need to define TokenizeMode and/or debug every time.
 */
export class SudachiStateful {
  free(): void;
  [Symbol.dispose](): void;
  constructor();
  /**
   * Initializes the tokenizer with the given dictionary file url. If not given, the default one is used.
   * 
   * Returns an error object `{ error: string, details: string }` if initialization fails.
   */
  initialize_browser(mode: TokenizeMode, debug?: boolean | null, dict_url?: string | null): Promise<void>;
  /**
   * Initializes the tokenizer with the given dictionary file path. If not given, the default one is used.
   * 
   * Uses the provided `read_file_func` function (e.g., fs.readFileSync) to load the file.
   * 
   * Returns an error object `{ error: string, details: string }` if initialization fails.
   */
  initialize_node(read_file_func: Function, mode: TokenizeMode, debug?: boolean | null, dict_path?: string | null): Promise<void>;
  /**
   * Initializes the tokenizer with the given bytes.
   * Returns an error object `{ error: string, details: string }` if initialization fails.
   */
  initialize_from_bytes(dict_bytes: Uint8Array, mode: TokenizeMode, debug?: boolean | null): void;
  /**
   * Tokenizes the input string using the defined mode from TokenizeMode at initialization.
   * If a mode is provided, that mode will be used temporarily until the end of the function execution.
   * 
   * Returns a JSON string of morphemes on success, or an error object `{ error: string, details: string }` on failure.
   */
  tokenize_stringified(input: string, mode?: TokenizeMode | null): string;
  /**
   * Tokenizes the input string using the defined mode from TokenizeMode at initialization.
   * If a mode is provided, that mode will be used temporarily until the end of the function execution.
   * 
   * Returns an array of morpheme objects on success, or an error object `{ error: string, details: string }` on failure.
   */
  tokenize_raw(input: string, mode?: TokenizeMode | null): TokenMorpheme[];
  /**
   * Resets the tokenizer, uninitializing it.
   */
  reset(): void;
  is_initialized(): boolean;
  /**
   * SplitMode of the tokenizer.
   */
  mode: TokenizeMode;
  /**
   * Debug mode of the tokenizer.
   */
  debug: boolean;
}
/**
 * Implementation of a Tokenizer which does not have tokenization state.
 *
 * This is a wrapper which is generic over dictionary pointers.
 */
export class SudachiStateless {
  free(): void;
  [Symbol.dispose](): void;
  constructor();
  /**
   * Initializes the tokenizer with the given dictionary file url. If not given, the default one is used.
   * 
   * Returns an error object `{ error: string, details: string }` if initialization fails.
   */
  initialize_browser(dict_url?: string | null): Promise<void>;
  /**
   * Initializes the tokenizer with the given dictionary file path. If not given, the default one is used.
   * 
   * Uses the provided `read_file_func` function (e.g., fs.readFileSync) to load the file.
   * 
   * Returns an error object `{ error: string, details: string }` if initialization fails.
   */
  initialize_node(read_file_func: Function, dict_path?: string | null): Promise<void>;
  /**
   * Initializes the tokenizer with the given bytes.
   * Returns an error object `{ error: string, details: string }` if initialization fails.
   */
  initialize_from_bytes(dict_bytes: Uint8Array): void;
  /**
   * Tokenizes the input string using the specified mode from TokenizeMode.
   * 
   * Returns a JSON string of morphemes on success, or an error object `{ error: string, details: string }` on failure.
   */
  tokenize_stringified(input: string, mode: TokenizeMode, enable_debug?: boolean | null): string;
  /**
   * Tokenizes the input string using the specified mode from TokenizeMode.
   * 
   * Returns an array of morpheme objects on success, or an error object `{ error: string, details: string }` on failure.
   */
  tokenize_raw(input: string, mode: TokenizeMode, enable_debug?: boolean | null): TokenMorpheme[];
  /**
   * Resets the tokenizer, uninitializing it.
   */
  reset(): void;
  is_initialized(): boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly main: () => void;
  readonly __wbg_sudachistateless_free: (a: number, b: number) => void;
  readonly sudachistateless_new: () => number;
  readonly sudachistateless_initialize_browser: (a: number, b: number, c: number) => any;
  readonly sudachistateless_initialize_node: (a: number, b: any, c: number, d: number) => any;
  readonly sudachistateless_initialize_from_bytes: (a: number, b: number, c: number) => [number, number];
  readonly sudachistateless_tokenize_stringified: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
  readonly sudachistateless_tokenize_raw: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
  readonly sudachistateless_reset: (a: number) => void;
  readonly sudachistateless_is_initialized: (a: number) => number;
  readonly __wbg_sudachistateful_free: (a: number, b: number) => void;
  readonly sudachistateful_new: () => number;
  readonly sudachistateful_initialize_browser: (a: number, b: number, c: number, d: number, e: number) => any;
  readonly sudachistateful_initialize_node: (a: number, b: any, c: number, d: number, e: number, f: number) => any;
  readonly sudachistateful_initialize_from_bytes: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly sudachistateful_tokenize_stringified: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly sudachistateful_tokenize_raw: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly sudachistateful_reset: (a: number) => void;
  readonly sudachistateful_is_initialized: (a: number) => number;
  readonly sudachistateful_mode: (a: number) => [number, number, number];
  readonly sudachistateful_set_mode: (a: number, b: number) => [number, number];
  readonly sudachistateful_debug: (a: number) => [number, number, number];
  readonly sudachistateful_set_debug: (a: number, b: number) => [number, number];
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly closure311_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure329_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
