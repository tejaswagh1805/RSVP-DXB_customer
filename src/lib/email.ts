/** Validate the address structure and catch common provider-domain typos. */
const VALID_GENERIC_TLDS = new Set(
  `com org net edu gov mil int info biz name pro aero coop museum travel jobs mobi asia cat tel xxx online site website store tech app dev xyz me io co ai tv fm academy accountants agency art beauty blog cloud construction consulting digital email engineering entertainment expert fashion finance fit food foundation fund gallery global group guide health international live love management media network news one photography place press restaurant shop social solutions space studio systems team technology today tools top vip world`.split(" "),
);

const VALID_COUNTRY_TLDS = new Set(
  `ac ad ae af ag ai al am ao aq ar as at au aw ax az ba bb bd be bf bg bh bi bj bm bn bo br bs bt bv bw by bz ca cc cd cf cg ch ci ck cl cm cn co cr cu cv cw cx cy cz de dj dk dm do dz ec ee eg er es et eu fi fj fk fm fo fr ga gb gd ge gf gg gh gi gl gm gn gp gq gr gs gt gu gw gy hk hm hn hr ht hu id ie il im in io iq ir is it je jm jo jp ke kg kh ki km kn kp kr kw ky kz la lb lc li lk lr ls lt lu lv ly ma mc md me mf mg mh mk ml mm mn mo mp mq mr ms mt mu mv mw mx my mz na nc ne nf ng ni nl no np nr nu nz om pa pe pf pg ph pk pl pm pn pr ps pt pw py qa re ro rs ru rw sa sb sc sd se sg sh si sj sk sl sm sn so sr ss st su sv sx sy sz tc td tf tg th tj tk tl tm tn to tr tt tv tw tz ua ug uk um us uy uz va vc ve vg vi vn vu wf ws ye yt za zm zw`.split(" "),
);

export function getEmailValidationMessage(input: string): string {
  const invalidMessage = "Please enter valid email address";
  const email = input.trim();
  if (!email) return "";
  if (email.length > 254) return invalidMessage;

  const separator = email.indexOf("@");
  if (separator <= 0 || separator !== email.lastIndexOf("@")) {
    return invalidMessage;
  }

  const local = email.slice(0, separator);
  const domain = email.slice(separator + 1);
  if (
    local.length < 1 ||
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..") ||
    !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)
  ) {
    return invalidMessage;
  }

  const labels = domain.split(".");
  const validDomain =
    labels.length >= 2 &&
    labels.every((label) =>
      label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
    ) &&
    isRecognizedTld(labels.at(-1) ?? "");
  if (!validDomain) return invalidMessage;

  const normalizedDomain = domain.toLowerCase();
  if (normalizedDomain.startsWith("gmail.") && normalizedDomain !== "gmail.com") {
    return invalidMessage;
  }

  return "";
}

function isRecognizedTld(tld: string): boolean {
  const normalized = tld.toLowerCase();
  return VALID_GENERIC_TLDS.has(normalized) || VALID_COUNTRY_TLDS.has(normalized);
}
