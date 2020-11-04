import "./App.css";
import React from "react";
import path from "path";
import { SourceMapConsumer, SourceNode } from "source-map";

const baseDir = "./sourcemap/";
const context = require.context("./sourcemap/", true, /\.json$/);

let rawSourceMap = context.keys().map(key => {
  const file = "." + path.resolve(baseDir, key);
  const data = require(`${file}`)
  return data;
});

// https://github.com/mozilla/source-map#sourcemapconsumerprototypecomputecolumnspans

SourceMapConsumer.initialize({
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

rawSourceMap.map(x => {
  
  SourceMapConsumer.with(x, null, consumer => {
    // console.log(consumer.sources);
    // [ 'http://example.com/www/js/one.js',
    //   'http://example.com/www/js/two.js' ]

    // 返回提供的生成的源行和列位置的原始源，行和列信息。唯一的参数是具有以下属性的对象：

    const line_column = "10609:7942".split(":")

    const source = consumer.originalPositionFor({
      line: ~~line_column[0],
      column: ~~line_column[1]
    })

    if(source.source) {
      console.log(source)
    }


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
      
    });

  });

})



// function compile(ast) {
//   switch (ast.type) {
//   case 'BinaryExpression':
//     return new SourceNode(
//       ast.location.line,
//       ast.location.column,
//       ast.location.source,
//       [compile(ast.left), " + ", compile(ast.right)]
//     );
//   case 'Literal':
//     return new SourceNode(
//       ast.location.line,
//       ast.location.column,
//       ast.location.source,
//       String(ast.value)
//     );
//   default:
//     throw new Error("Bad AST");
//   }
// }
 
// var ast = parse("40 + 2", "add.js");
// console.log(compile(ast).toStringWithSourceMap({
//   file: 'add.js'
// }));

function App() {
  return <div className="App"></div>;
}

export default App;
