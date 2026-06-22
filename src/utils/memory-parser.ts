const SPECIAL_FLAGS = {
  r: "ResetIf",
  p: "Pause If",
  a: "AddSource",
  b: "SubSource",
  c: "AddHits",
  i: "AddAddress",
  m: "Measured",
  n: "AndNext",
  o: "OrNext",
  q: "MeasuredIf",
  z: "ResetNextIf",
  d: "SubHits",
  t: "Trigger",
  k: "Remember",
  g: "Measured%",
  "": "",
} as const satisfies Record<string, string>;

const MEM_SIZE = {
  "0xk": "BitCount",
  "0xm": "Bit0",
  "0xn": "Bit1",
  "0xo": "Bit2",
  "0xp": "Bit3",
  "0xq": "Bit4",
  "0xr": "Bit5",
  "0xs": "Bit6",
  "0xt": "Bit7",
  "0xl": "Lower4",
  "0xu": "Upper4",
  "0xh": "8-bit",
  "0xw": "24-bit",
  "0xx": "32-bit",
  "0xi": "16-bit BE",
  "0xj": "24-bit BE",
  "0xg": "32-bit BE",
  "0x ": "16-bit",
  "0x": "16-bit",
  ff: "Float",
  fb: "Float BE",
  fh: "Double32",
  fi: "Double32 BE",
  fm: "MBF32",
  fl: "MBF32 LE",
  h: "",
  "": "",
} as const satisfies Record<string, string>;

const MEM_TYPES = {
  d: "Delta",
  p: "Prior",
  m: "Mem",
  v: "Value",
  b: "BCD",
  "~": "Inverted",
  f: "Float",
  recall: "Recall",
  variable: "Variable",
  "": "",
} as const satisfies Record<string, string>;

type Flag = keyof typeof SPECIAL_FLAGS;
type MemType = keyof typeof MEM_TYPES;
type MemSize = keyof typeof MEM_SIZE;

export interface ParsedRequirement {
  flag: Flag;
  lType: MemType;
  lSize: MemSize;
  lMemory: string;
  cmp: string;
  rType: MemType;
  rSize: MemSize;
  rMemVal: string;
  hits: string;
}

export interface MemoryParserResult {
  groups: ParsedRequirement[][];
  addresses: string[];
}

const MAX_CHARS = 6;

const SCALABLE_FLAGS = new Set<string>(["a", "b", "i", "k"]);
const SCALAR_OPERATORS = new Set<string>(["*", "/", "&", "+", "-", "^", "%"]);

const isScalableFlag = (flag: string): boolean => SCALABLE_FLAGS.has(flag);
const isScalarOperator = (cmp: string): boolean => SCALAR_OPERATORS.has(cmp);

// Main path historically excludes "false"; recall/variable paths include it.
const MAIN_SPECIAL_CONSTANTS = ["n", "t", "true", "lvlintro"] as const;
const RECALL_SPECIAL_CONSTANTS = ["n", "t", "true", "false", "lvlintro"] as const;

function formatAddress(
  value: string,
  specials: readonly string[],
  hadSizePrefix: boolean,
  skipNegative: boolean,
): string {
  if (!value) return value;

  if (
    !hadSizePrefix &&
    !specials.includes(value) &&
    !value.includes(".") &&
    !value.startsWith("0x")
  ) {
    const num = parseInt(value, 10);
    // Main path refuses to reformat negatives; recall/variable convert and pad through the sign.
    if (!Number.isNaN(num) && (num >= 0 || !skipNegative)) {
      value = num.toString(16);
    }
  }

  if (value.startsWith("0x")) {
    value = value.substring(2);
  }

  if (specials.includes(value) || value.includes(".")) {
    return value;
  }
  if (skipNegative && value.startsWith("-")) {
    return value;
  }

  return `0x${value.padStart(MAX_CHARS, "0")}`;
}

export function parseMemory(mem: string): MemoryParserResult {
  const addresses: string[] = [];

  // Split by S but not when preceded by 0x.
  const groups = mem.split(/(?<!0x)S/);
  const parsedGroups: ParsedRequirement[][] = [];

  for (const group of groups) {
    const requirements = group.split("_");
    const parsedRequirements: ParsedRequirement[] = [];

    for (const req of requirements) {
      if (!req) continue;

      const parsed = parseRequirement(req);
      if (!parsed) {
        throw new Error(`Invalid "Mem" string. Failed to parse: ${req}`);
      }

      parsedRequirements.push(parsed);

      if (parsed.lType !== "v" && parsed.lMemory && !addresses.includes(parsed.lMemory)) {
        addresses.push(parsed.lMemory);
      }
      if (parsed.rType !== "v" && parsed.rMemVal && !addresses.includes(parsed.rMemVal)) {
        addresses.push(parsed.rMemVal);
      }
    }

    if (parsedRequirements.length === 0) {
      parsedRequirements.push({
        flag: "",
        lType: "v",
        lSize: "",
        lMemory: "",
        cmp: "=",
        rType: "v",
        rSize: "",
        rMemVal: "",
        hits: "0",
      });
    }

    parsedGroups.push(parsedRequirements);
  }

  return { groups: parsedGroups, addresses };
}

const RECALL_OPERAND_RE =
  /^(d|p|b)?(0xk|0xm|0xn|0xo|0xp|0xq|0xr|0xs|0xt|0xl|0xu|0xh|0xw|0xx|0xi|0xj|0xg|0x |0x|h)?([0-9a-z+-]*)$/i;

const VARIABLE_OPERAND_RE =
  /^(d|p|b|~|v|f)?(f[fbihlm]|0xk|0xm|0xn|0xo|0xp|0xq|0xr|0xs|0xt|0xl|0xu|0xh|0xw|0xx|0xi|0xj|0xg|0x |0x|h)?([0-9a-z+.-]*)$/i;

function parseRecallOperand(operand: string): {
  type: MemType;
  size: MemSize;
  value: string;
} {
  if (!operand) return { type: "", size: "", value: "" };

  const m = operand.match(RECALL_OPERAND_RE);
  if (!m) return { type: "", size: "", value: "" };

  let type = (m[1] || "").toLowerCase();
  const size = (m[2] || "").toLowerCase() as MemSize;
  let value = m[3] || "";

  if (type !== "d" && type !== "p" && type !== "b" && type !== "v") {
    type = size !== "" ? "m" : "v";
  }

  value = formatAddress(value, RECALL_SPECIAL_CONSTANTS, size !== "", false);

  return { type: type as MemType, size, value };
}

function parseRecallRequirement(req: string): ParsedRequirement | null {
  const specialFlags = Object.keys(SPECIAL_FLAGS).join("");

  const leftRecallRegex = new RegExp(
    `^(?:([${specialFlags}]):)?\\{recall\\}(<=|>=|<|>|==|=|!=|\\*|\\/|&|\\+|\\-|\\^|%)?(.*)(?:[(.](\\w+)[).])?$`,
    "i",
  );

  const rightRecallRegex = new RegExp(
    `^(?:([${specialFlags}]):)?(.*?)(<=|>=|<|>|==|=|!=|\\*|\\/|&|\\+|\\-|\\^|%)\\{recall\\}(?:[(.](\\w+)[).])?$`,
    "i",
  );

  let match = req.match(leftRecallRegex);
  if (match) {
    const flag = (match[1] || "").toLowerCase() as Flag;
    const cmp = match[2] || "";
    const rightOperand = match[3] || "";
    // The Remember (`k`) flag has no hits target.
    const hits = match[4] || (flag === "k" ? "" : "0");

    const right = parseRecallOperand(rightOperand);

    return {
      flag,
      lType: "recall",
      lSize: "",
      lMemory: "",
      cmp,
      rType: right.type,
      rSize: right.size,
      rMemVal: right.value,
      hits,
    };
  }

  match = req.match(rightRecallRegex);
  if (match) {
    const flag = (match[1] || "").toLowerCase() as Flag;
    const leftOperand = match[2] || "";
    const cmp = match[3] || "";
    const hits = match[4] || (flag === "k" ? "" : "0");

    const left = parseRecallOperand(leftOperand);

    return {
      flag,
      lType: left.type,
      lSize: left.size,
      lMemory: left.value,
      cmp,
      rType: "recall",
      rSize: "",
      rMemVal: "",
      hits,
    };
  }

  return null;
}

function parseVariableRightOperand(operand: string): {
  type: MemType;
  size: MemSize;
  value: string;
} {
  if (!operand) return { type: "", size: "", value: "" };

  const m = operand.match(VARIABLE_OPERAND_RE);
  if (!m) return { type: "", size: "", value: "" };

  let type = (m[1] || "").toLowerCase();
  let size = (m[2] || "").toLowerCase();
  let value = m[3] || "";

  if (
    type !== "d" &&
    type !== "p" &&
    type !== "b" &&
    type !== "v" &&
    type !== "~" &&
    type !== "f"
  ) {
    if (size === "f" && value && value.includes(".")) {
      type = "f";
      size = "";
    } else {
      type = size !== "" ? "m" : "v";
    }
  }

  if (!value.includes(".")) {
    value = formatAddress(value, RECALL_SPECIAL_CONSTANTS, size !== "", false);
  }

  return { type: type as MemType, size: size as MemSize, value };
}

function parseVariableRequirement(req: string): ParsedRequirement | null {
  const specialFlags = Object.keys(SPECIAL_FLAGS).join("");

  const variableRegex = new RegExp(
    `^(?:([${specialFlags}]):)?\\{([^}]+)\\}(<=|>=|<|>|==|=|!=|\\*|\\/|&|\\+|\\-|\\^|%)?(.*)(?:[(.](\\w+)[).])?$`,
    "i",
  );

  const match = req.match(variableRegex);
  if (!match) return null;

  const flag = (match[1] || "").toLowerCase() as Flag;
  const variableName = match[2] || "";
  const cmp = match[3] || "";
  const rightOperand = match[4] || "";
  const hits = match[5] || (flag === "k" ? "" : "0");

  const right = parseVariableRightOperand(rightOperand);

  return {
    flag,
    lType: "variable",
    lSize: "",
    lMemory: variableName,
    cmp,
    rType: right.type,
    rSize: right.size,
    rMemVal: right.value,
    hits,
  };
}

function parseRequirement(req: string): ParsedRequirement | null {
  if (req.includes("{recall}")) {
    return parseRecallRequirement(req);
  }

  if (req.includes("{") && req.includes("}")) {
    return parseVariableRequirement(req);
  }

  if (req.includes("{") || req.includes("}")) {
    return null;
  }

  // `f[fbihlm]` must come before bare `f` so float sizes don't collapse onto the type prefix.
  const operandRegex = `(d|p|b|~|v|f)?(f[fbihlm]|0xk|0xm|0xn|0xo|0xp|0xq|0xr|0xs|0xt|0xl|0xu|0xh|0xw|0xx|0xi|0xj|0xg|0x |0x|h)?([0-9a-z+\\-]*(?:\\.[0-9a-z]*)?)`;
  const specialFlags = Object.keys(SPECIAL_FLAGS).join("");
  const memRegex = new RegExp(
    `^(?:([${specialFlags}]):)?${operandRegex}(<=|>=|<|>|==|=|!=|\\*|\\/|&|\\+|\\-|\\^|%)?${operandRegex}(?:[\\.(](\\w+)[\\.)\\]])?$`,
    "i",
  );
  const match = req.match(memRegex);
  if (!match) return null;

  let flag = (match[1] || "") as Flag;
  let lType = match[2] || "";
  let lSize = match[3] || "";
  let lMemory = match[4] || "";
  let cmp = match[5] || "=";
  if (cmp === "==") cmp = "=";

  let rType = match[6] || "";
  let rSize = match[7] || "";
  let rMemVal = match[8] || "";

  let hits = match[9] || "0";

  if (isScalableFlag(flag.toLowerCase())) {
    hits = "";
  }

  // Float-literal short-circuits intentionally skip opposite-operand type inference
  // (eg: `0xH1234=f-100` keeps lType="" rather than inferring "m").
  if (lType === "f" && lSize === "" && lMemory.match(/^[+-]?\d*\.?\d+$/)) {
    return {
      flag: flag.toLowerCase() as Flag,
      lType: "f",
      lSize: "",
      lMemory,
      cmp,
      rType: rType.toLowerCase() as MemType,
      rSize: rSize.toLowerCase() as MemSize,
      rMemVal,
      hits,
    };
  }
  if (rType === "f" && rSize === "" && rMemVal.match(/^[+-]?\d*\.?\d+$/)) {
    return {
      flag: flag.toLowerCase() as Flag,
      lType: lType.toLowerCase() as MemType,
      lSize: lSize.toLowerCase() as MemSize,
      lMemory,
      cmp,
      rType: "f",
      rSize: "",
      rMemVal,
      hits,
    };
  }

  // Re-split a `d`/`p`/`b`/`~` type prefix that bled into the right value field.
  if (
    rType === "" &&
    rSize === "" &&
    (rMemVal.startsWith("d0x") ||
      rMemVal.startsWith("p0x") ||
      rMemVal.startsWith("b0x") ||
      rMemVal.startsWith("~0x"))
  ) {
    rType = rMemVal[0] || "";
    const rest = rMemVal.substring(1);
    const sizeMatch = rest.match(/^(0x[a-z])/i);
    if (sizeMatch && sizeMatch[1]) {
      rSize = sizeMatch[1];
      rMemVal = rest.substring(sizeMatch[1].length);
    }
  }

  flag = flag.toLowerCase() as Flag;
  lType = lType.toLowerCase();
  lSize = lSize.toLowerCase();
  rType = rType.toLowerCase();
  rSize = rSize.toLowerCase();

  if (!lType && lSize === "h" && lMemory) {
    lType = "v";
    lSize = "";
    lMemory = `0x${lMemory.padStart(MAX_CHARS, "0")}`;
  }
  if (!rType && rSize === "h" && rMemVal) {
    rType = "v";
    rSize = "";
    rMemVal = `0x${rMemVal.padStart(MAX_CHARS, "0")}`;
  }

  if (!lType && !lSize && lMemory && lMemory.match(/^[hH][0-9a-fA-F]+$/)) {
    lType = "m";
    lSize = "0xh";
    lMemory = lMemory.substring(1);
  }

  lMemory = formatAddress(lMemory, MAIN_SPECIAL_CONSTANTS, lSize !== "", false);
  rMemVal = formatAddress(rMemVal, MAIN_SPECIAL_CONSTANTS, rSize !== "", true);

  const isKnownLType = ["d", "p", "b", "v", "~", "f", "recall"].includes(lType);
  if (!isKnownLType) {
    if (lSize === "f" && lMemory.includes(".")) {
      lType = "f";
      lSize = "";
    } else {
      lType = lSize !== "" ? "m" : "v";
    }
  }
  const isKnownRType = ["d", "p", "b", "v", "~", "f", "recall"].includes(rType);
  if (!isKnownRType) {
    if (rSize === "f" && rMemVal.includes(".")) {
      rType = "f";
      rSize = "";
    } else {
      rType = rSize !== "" ? "m" : "v";
    }
  }

  return {
    flag,
    lType: lType as MemType,
    lSize: lSize as MemSize,
    lMemory,
    cmp,
    rType: rType as MemType,
    rSize: rSize as MemSize,
    rMemVal,
    hits,
  };
}

export function formatParsedRequirement(req: ParsedRequirement, index: number): string {
  let result = `${(index + 1).toString().padStart(2, " ")}:`;
  result += SPECIAL_FLAGS[req.flag].padEnd(12, " ");
  result += MEM_TYPES[req.lType].padEnd(6, " ");
  result += MEM_SIZE[req.lSize].padEnd(7, " ");
  result += req.lMemory.padEnd(9, " ");

  const scalable = isScalableFlag(req.flag);
  const scalarOp = isScalarOperator(req.cmp);

  if (!scalable || scalarOp) {
    result += req.cmp.padEnd(3, " ");
    result += MEM_TYPES[req.rType].padEnd(6, " ");
    result += MEM_SIZE[req.rSize].padEnd(7, " ");
    result += req.rMemVal.padEnd(10, " ");

    if (!scalable && req.hits !== "") {
      result += `(${req.hits})`;
    }
  }

  return result;
}

export function formatMemoryGroups(groups: ParsedRequirement[][]): string {
  let result = "\n";

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!group) continue;

    result += i === 0 ? "__**Core Group**__:" : `__**Alt Group ${i}**__:`;
    result += "```";

    for (let j = 0; j < group.length; j++) {
      const req = group[j];
      if (req) {
        result += "\n" + formatParsedRequirement(req, j);
      }
    }

    result += "```";
  }

  return result;
}
