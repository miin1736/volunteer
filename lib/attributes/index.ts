export type DownType = "goose" | "duck" | "synthetic";
export type DownRatio = "90-10" | "80-20" | "70-30";
export type Fit = "standard" | "regular" | "loose";
export type Shell = "gore-tex" | "nylon" | "poly" | string;

export type NormalizedAttributes = {
  downType?: DownType;
  downRatio?: DownRatio;
  fillPower?: number;
  hood?: boolean;
  fit?: Fit;
  shell?: Shell;
};

/**
 * Extract normalized attributes from free-text (title/desc/category/vendor attrs).
 * Heuristics are conservative: only emit when confidence is decent.
 */
export function extractAttributes(text: string): NormalizedAttributes {
  const t = (text || "").toLowerCase();

  const downType: DownType | undefined = /\b구스\b|\bgoose\b/.test(t)
    ? "goose"
    : /\b덕\b|\bduck\b/.test(t)
    ? "duck"
    : /synthetic|합성/.test(t)
    ? "synthetic"
    : undefined;

  const downRatio: DownRatio | undefined = /90[\/\-]10/.test(t)
    ? "90-10"
    : /80[\/\-]20/.test(t)
    ? "80-20"
    : /70[\/\-]30/.test(t)
    ? "70-30"
    : undefined;

  const hood: boolean | undefined = /(노후드|no[-\s]?hood)/.test(t)
    ? false
    : /(\b후드\b|\bhood\b)/.test(t)
    ? true
    : undefined;

  const fit: Fit | undefined = /(스탠다드|standard)/.test(t)
    ? "standard"
    : /(레귤러|regular)/.test(t)
    ? "regular"
    : /(루즈|loose)/.test(t)
    ? "loose"
    : undefined;

  const shell: Shell | undefined = /(gore[-\s]?tex|고어텍스)/.test(t)
    ? "gore-tex"
    : /(나일론|nylon)/.test(t)
    ? "nylon"
    : /(폴리|poly)/.test(t)
    ? "poly"
    : undefined;

  const fpMatch = /(\d{3,4})\s?fp/.exec(t);
  const fillPower = fpMatch ? Number(fpMatch[1]) : undefined;

  return { downType, downRatio, hood, fit, shell, fillPower };
}
