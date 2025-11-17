export type DownType = "goose" | "duck" | "synthetic";
export type DownRatio = "90-10" | "80-20" | "70-30";
export type Fit = "standard" | "regular" | "loose" | "slim" | "relaxed" | "oversized";
export type Shell = "gore-tex" | "nylon" | "poly" | "wool" | "cotton" | "polyester" | "cashmere" | "fleece" | "french-terry" | "modal" | "merino" | string;

export type NormalizedAttributes = {
  downType?: DownType;
  downRatio?: DownRatio;
  fillPower?: number;
  hood?: boolean;
  fit?: Fit;
  shell?: Shell;
  // 슬랙스 속성
  waistType?: "high" | "mid" | "low";
  legOpening?: "tapered" | "straight" | "wide";
  stretch?: boolean;
  pleats?: "single" | "double" | "none";
  // 청바지 속성
  wash?: "light" | "medium" | "dark" | "black";
  cut?: "skinny" | "slim" | "straight" | "bootcut" | "wide";
  rise?: "high" | "mid" | "low";
  distressed?: boolean;
  // 맨투맨/롱슬리브 속성
  neckline?: "crew" | "mock" | "v-neck" | "henley";
  sleeveLength?: "long" | "3/4" | "short";
  sleeveType?: "raglan" | "set-in";
  pattern?: "solid" | "stripe" | "graphic";
  layering?: boolean;
  // 코트 속성
  length?: "short" | "mid" | "long";
  closure?: "button" | "zip" | "belt";
  lining?: "full" | "half" | "none";
};

/**
 * Extract normalized attributes from free-text (title/desc/category/vendor attrs).
 * Heuristics are conservative: only emit when confidence is decent.
 */
export function extractAttributes(text: string): NormalizedAttributes {
  const t = (text || "").toLowerCase();

  // 다운 재킷 속성
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

  const fpMatch = /(\d{3,4})\s?fp/.exec(t);
  const fillPower = fpMatch ? Number(fpMatch[1]) : undefined;

  // 핏 (모든 의류 공통)
  const fit: Fit | undefined = /(스탠다드|standard)/.test(t)
    ? "standard"
    : /(레귤러|regular)/.test(t)
    ? "regular"
    : /(루즈|loose)/.test(t)
    ? "loose"
    : /(슬림|slim)/.test(t)
    ? "slim"
    : /(릴랙스|relaxed)/.test(t)
    ? "relaxed"
    : /(오버|oversized)/.test(t)
    ? "oversized"
    : undefined;

  // 겉감 소재 (모든 의류 공통)
  const shell: Shell | undefined = /(gore[-\s]?tex|고어텍스)/.test(t)
    ? "gore-tex"
    : /(나일론|nylon)/.test(t)
    ? "nylon"
    : /(폴리|poly)/.test(t)
    ? "poly"
    : /(울|wool)/.test(t)
    ? "wool"
    : /(면|cotton)/.test(t)
    ? "cotton"
    : /(캐시미어|cashmere)/.test(t)
    ? "cashmere"
    : /(플리스|fleece)/.test(t)
    ? "fleece"
    : undefined;

  // 슬랙스 속성
  const waistType: "high" | "mid" | "low" | undefined = /(하이|high)/.test(t)
    ? "high"
    : /(로우|low)/.test(t)
    ? "low"
    : /(미드|mid)/.test(t)
    ? "mid"
    : undefined;

  const legOpening: "tapered" | "straight" | "wide" | undefined = /(테이퍼|tapered)/.test(t)
    ? "tapered"
    : /(와이드|wide)/.test(t)
    ? "wide"
    : /(스트레이트|straight)/.test(t)
    ? "straight"
    : undefined;

  const stretch = /스트레치|stretch|elastic/.test(t);

  const pleats: "single" | "double" | "none" | undefined = /(투턱|two\s*pleat|double)/.test(t)
    ? "double"
    : /(원턱|single\s*pleat)/.test(t)
    ? "single"
    : /(노턱|no\s*pleat)/.test(t)
    ? "none"
    : undefined;

  // 청바지 속성
  const wash: "light" | "medium" | "dark" | "black" | undefined = /(라이트|light)/.test(t)
    ? "light"
    : /(다크|dark|인디고|indigo)/.test(t)
    ? "dark"
    : /(블랙|black)/.test(t)
    ? "black"
    : /(미디엄|medium)/.test(t)
    ? "medium"
    : undefined;

  const cut: "skinny" | "slim" | "straight" | "bootcut" | "wide" | undefined = /(스키니|skinny)/.test(t)
    ? "skinny"
    : /(슬림|slim)/.test(t)
    ? "slim"
    : /(부츠컷|bootcut)/.test(t)
    ? "bootcut"
    : /(와이드|wide)/.test(t)
    ? "wide"
    : /(스트레이트|straight)/.test(t)
    ? "straight"
    : undefined;

  const rise: "high" | "mid" | "low" | undefined = /(하이라이즈|high\s*rise)/.test(t)
    ? "high"
    : /(로우라이즈|low\s*rise)/.test(t)
    ? "low"
    : /(미드라이즈|mid\s*rise)/.test(t)
    ? "mid"
    : undefined;

  const distressed = /찢김|ripped|distressed|damaged|데미지/.test(t);

  // 맨투맨/롱슬리브 속성
  const neckline: "crew" | "mock" | "v-neck" | "henley" | undefined = /(브이넥|v[-\s]?neck)/.test(t)
    ? "v-neck"
    : /(헨리|henley)/.test(t)
    ? "henley"
    : /(목폴라|mock)/.test(t)
    ? "mock"
    : /(크루|crew)/.test(t)
    ? "crew"
    : undefined;

  const sleeveLength: "long" | "3/4" | "short" | undefined = /(7부|3\/4|seven)/.test(t)
    ? "3/4"
    : /(반팔|short\s*sleeve)/.test(t)
    ? "short"
    : /(긴팔|장박|long\s*sleeve)/.test(t)
    ? "long"
    : undefined;

  const sleeveType: "raglan" | "set-in" | undefined = /(래글런|raglan)/.test(t)
    ? "raglan"
    : /(세트인|set[-\s]?in)/.test(t)
    ? "set-in"
    : undefined;

  const pattern: "solid" | "stripe" | "graphic" | undefined = /(스트라이프|stripe)/.test(t)
    ? "stripe"
    : /(그래픽|graphic|프린트|print)/.test(t)
    ? "graphic"
    : /(무지|solid)/.test(t)
    ? "solid"
    : undefined;

  const layering = /레이어링|layering|이너|inner/.test(t);

  // 코트 속성
  const length: "short" | "mid" | "long" | undefined = /(숏|short)/.test(t)
    ? "short"
    : /(롱|long)/.test(t)
    ? "long"
    : /(미디|mid)/.test(t)
    ? "mid"
    : undefined;

  const closure: "button" | "zip" | "belt" | undefined = /(지퍼|zip)/.test(t)
    ? "zip"
    : /(벨트|belt)/.test(t)
    ? "belt"
    : /(버튼|button)/.test(t)
    ? "button"
    : undefined;

  const lining: "full" | "half" | "none" | undefined = /(전체안감|full\s*lining)/.test(t)
    ? "full"
    : /(반안감|half\s*lining)/.test(t)
    ? "half"
    : /(무안감|no\s*lining)/.test(t)
    ? "none"
    : undefined;

  return {
    downType,
    downRatio,
    fillPower,
    hood,
    fit,
    shell,
    waistType,
    legOpening,
    stretch: stretch || undefined,
    pleats,
    wash,
    cut,
    rise,
    distressed: distressed || undefined,
    neckline,
    sleeveLength,
    sleeveType,
    pattern,
    layering: layering || undefined,
    length,
    closure,
    lining,
  };
}
