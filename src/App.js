import "./App.css";

import path from "path"

const _rawSourceMap = require("./sourcemap/gh_f5cd32cf3467_453_0/onlinePages/app-service.map.json")

let rawSourceMap = []

const baseDir = "./sourcemap/"
const context = require.context("./sourcemap/", true, /\.json$/)

context.keys().map(key => {
  const file = "." + path.resolve(baseDir, key)
  const data = require(`${file}`)
  rawSourceMap.push(data)
})

console.log(rawSourceMap)

// https://github.com/mozilla/source-map#sourcemapconsumerprototypecomputecolumnspans

window.sourceMap.SourceMapConsumer.initialize({
  "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm"
});

// const rawSourceMap = {
//   version: 3,
//   file: "min.js",
//   names: ["bar", "baz", "n"],
//   sources: ["one.js", "two.js"],
//   sourceRoot: "http://example.com/www/js/",
//   mappings:
//     "CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA"
// };

window.sourceMap.SourceMapConsumer.with(_rawSourceMap, null, consumer => {
    // console.log(consumer.sources);
    // [ 'http://example.com/www/js/one.js',
    //   'http://example.com/www/js/two.js' ]

    // 返回提供的生成的源行和列位置的原始源，行和列信息。唯一的参数是具有以下属性的对象：
    console.log(
      consumer.originalPositionFor({
        line: 10515,
        column: 15480
      })
    );

    // { source: 'http://example.com/www/js/two.js',
    //   line: 2,
    //   column: 10,
    //   name: 'n' }

    // 返回所提供的原始源，行和列位置的生成的行和列信息。唯一的参数是具有以下属性的对象：
    //   console.log(
    //     consumer.generatedPositionFor({
    //       source: "http://example.com/www/js/two.js",
    //       line: 2,
    //       column: 10
    //     })
    //   );
    // { line: 2, column: 28 }

    // 遍历此源映射中原始源/行/列与生成的行/列之间的每个映射。
    consumer.eachMapping(function(m) {
      // ...
    });
  }
);

function App() {
  return <div className="App"></div>;
}

export default App;
