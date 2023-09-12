import test from "ava";
import { Parser } from "../../src/parser.js";
import { HtmlParser } from "./parser.js";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @param {import("../../src/types.js").Node} node
 * @param {import("../../src/types.js").Node[]} nodes
 */
function buildtree(node, nodes) {
  if (node.name === "token") return node.image;
  if (node.name === "skip") return undefined;
  if (node.nodes)
    // @ts-ignore
    node.nodes = node.nodes.map((n) => buildtree(nodes[n], nodes));
  // @ts-ignore
  node.location = node.location?.start + " , " + node.location?.end;
  return node;
}

test.skip("HTML", (t) => {
  let parser = HtmlParser({ tracking: true });
  parser.init(`
<html>

<body>

    <h1>My First Heading</h1>
    <p>My first paragraph.</p>

</body>

</html>
`);

  let nodes = parser.parse("html")?.nodes;
  if (!nodes) throw Error("parse error");

  t.snapshot(buildtree(nodes[nodes.length - 1], nodes));
});

test("HTML2", (t) => {
  let parser = HtmlParser({ tracking: true });
  parser.init(readFileSync(path.join(__dirname, "wikipedia.txt"), "utf-8"));

  let nodes = parser.parse("html")?.nodes;
  if (!nodes) throw Error("parse error");

  t.snapshot(buildtree(nodes[nodes.length - 1], nodes));
});
