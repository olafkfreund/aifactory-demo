// AC#13: Focus stays visible in CSS — outline:none is acceptable ONLY where a
// box-shadow or border focus indicator replaces it in the SAME rule.
// This suite parses the <style> block of games/tictactoe/index.html and enforces
// that contract on every CSS rule, and that the :focus-visible rule keeps a
// visible focus indicator.

const fs = require("fs");
const path = require("path");

const HTML_PATH = path.join(__dirname, "index.html");

/** Extract the raw CSS text from every <style> block in the HTML. */
function extractCss(html) {
  const css = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    css.push(match[1]);
  }
  return css.join("\n");
}

/**
 * Parse top-level CSS rules into { selector, body } pairs.
 * Nested at-rules are flattened by pulling out their inner declaration blocks.
 */
function parseRules(css) {
  // Strip comments so they never masquerade as declarations.
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(clean)) !== null) {
    const selector = match[1].trim();
    const body = match[2].trim();
    if (selector.startsWith("@")) continue; // skip at-rule wrappers
    rules.push({ selector, body });
  }
  return rules;
}

function declarations(body) {
  return body
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean);
}

function hasOutlineNone(body) {
  return declarations(body).some((d) => {
    const m = /^outline\s*:\s*(.+)$/i.exec(d);
    if (!m) return false;
    const value = m[1].trim().toLowerCase();
    return value === "none" || value === "0" || value === "0px";
  });
}

function hasReplacementIndicator(body) {
  return declarations(body).some((d) => {
    const prop = d.split(":")[0].trim().toLowerCase();
    const value = (d.split(":").slice(1).join(":") || "").trim().toLowerCase();
    if (/^box-shadow$/.test(prop) && value && value !== "none") return true;
    if (/^border(-[a-z]+)?$/.test(prop) && value && value !== "none" && value !== "0") return true;
    return false;
  });
}

describe("AC#13: focus indicator stays visible in CSS", () => {
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const css = extractCss(html);
  const rules = parseRules(css);

  it("parses at least one CSS rule from index.html", () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  it("every rule that removes the outline supplies a box-shadow/border in the same rule", () => {
    const offenders = rules
      .filter((r) => hasOutlineNone(r.body))
      .filter((r) => !hasReplacementIndicator(r.body))
      .map((r) => r.selector);
    expect(offenders).toEqual([]);
  });

  it("the .cell:focus-visible rule provides a visible focus indicator", () => {
    const rule = rules.find((r) => /\.cell:focus-visible/.test(r.selector));
    expect(rule).toBeDefined();
    const keepsOutline = !hasOutlineNone(rule.body);
    const visible = keepsOutline || hasReplacementIndicator(rule.body);
    expect(visible).toBe(true);
  });
});
