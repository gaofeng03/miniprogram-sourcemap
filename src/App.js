import "./App.css";
import React, { Fragment } from "react";
// import path from "path";
import classNames from "classnames";
import { SourceMapConsumer, SourceNode } from "source-map";
import {
  Button,
  // Layout,
  Form,
  message,
  Input,
  Result,
  Card,
  Upload,
  Typography,
} from "antd";
import { AlignLeftOutlined, UploadOutlined } from "@ant-design/icons";

const { Text, Link } = Typography;

// const { Sider, Content } = Layout;
// const baseDir = "./sourcemap/";
// const context = require.context("./sourcemap/", true, /\.json$/);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sources: [],
      files: [],
      sourceContents: [],
      rawSourceMap: [],
      // lineAndColumn: "10609:7942",
    };
  }

  inputRef = React.createRef();
  fileRef = React.createRef();
  formRef = React.createRef();
  lineAndColumn = "10609:7942";

  componentDidMount() {
    // this.init();
    this.highlightCallBack();
  }

  componentDidUpdate() {
    this.highlightCallBack();
  }

  highlightCallBack = () => {
    document.querySelectorAll(".App-right code").forEach((block) => {
      try {
        window.hljs.highlightBlock(block);
      } catch (e) {
        console.log(e);
      }
    });
  };

  async init() {
    // let rawSourceMap = context.keys().map((key) => {
    //   const file = "." + path.resolve(baseDir, key);
    //   const data = require(`${file}`);
    //   return data;
    // });

    const key = "SourceMapConsumer";
    const { rawSourceMap } = this.state;
    const lineAndColumn = this.lineAndColumn;

    message.loading({ content: "Loading...", key });

    console.log("rawSourceMap", rawSourceMap);

    // https://github.com/mozilla/source-map#sourcemapconsumerprototypecomputecolumnspans

    await SourceMapConsumer.initialize({
      "lib/mappings.wasm":
        "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm",
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

    const what = await rawSourceMap.map(async (x, i) => {
      const source = await SourceMapConsumer.with(x, null, async (consumer) => {
        // console.log(consumer.sources);
        // [ 'http://example.com/www/js/one.js',
        //   'http://example.com/www/js/two.js' ]

        // 返回提供的生成的源行和列位置的原始源，行和列信息。唯一的参数是具有以下属性的对象：

        const line_column = lineAndColumn.split(":");

        const source = await consumer.originalPositionFor({
          line: ~~line_column[0],
          column: ~~line_column[1],
        });

        if (source.source) {
          console.log("source", source);

          console.log(consumer.allGeneratedPositionsFor(source));

          console.log(consumer.hasContentsOfAllSources());

          let sourceContent = await consumer.sourceContentFor(
            source.source,
            true
          );
          const error = sourceContent.substr(source.column, 60);

          // const reg = new RegExp(`/(\\w{3})\\w*(\\w{3})/`)

          // sourceContent = sourceContent.replace(
          //   /(.{4}).*(.{3})/,
          //   // `<i class="hightlight">${source.name}</i>`
          //   (all,u1,u2,u3) => {
          //     console.log(u1)
          //     console.log(u2)
          //     console.log(u3)
          //     return all
          //   }
          // );

          sourceContent = sourceContent.replace(
            error,
            `<i id="pos-${i}" class="hightlight">${error}</i>`
          );

          let { sources = [], sourceContents = [] } = this.state;

          source.key = i;
          sources.push.apply(sources, [source]);
          sourceContents.push.apply(sourceContents, [sourceContent]);

          this.setState({ sources, sourceContents });
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
        consumer.eachMapping(function (m) {});

        return source;
      });

      return source;
    });

    Promise.all(what).then((res) => {
      if (
        res.every((x) => {
          return !x.source;
        })
      ) {
        message.destroy(key);
        message.warn("没有找到错误！");
      } else {
        message.success({ content: "Loaded!", key, duration: 2 });
      }
    });

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
  }

  reader = (file) => {
    var reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.readAsText(file);
    });
  };

  onFile = async (e) => {
    const { target: { files = [] } = { files: [] } } = e;
    let rawSourceMap = [],
      directory = [],
      i = 0,
      length = files.length;
    while (i < length) {
      const json = await this.reader(files[i]);
      rawSourceMap.push(JSON.parse(json));
      directory.push(
        files[i].webkitRelativePath.replace(/^gh_.*?(?=>|\/)/, "")
      );
      i++;
    }

    if (directory.length === 0) return;

    this.setState({ rawSourceMap, directory });
  };

  onInput = (e) => {
    this.lineAndColumn = e.target.value;
  };

  onSubmit = async () => {
    const { rawSourceMap } = this.state;

    if (rawSourceMap.length === 0) {
      message.error("rawSourceMap 不存在");
      return;
    }

    if (this.lineAndColumn.split(":").length < 2) {
      message.error("请输入 line:column");
      this.inputRef.current.value = "";
      return;
    }

    await this.init();

    this.onReset();
  };

  onReset = () => {
    this.lineAndColumn = "";
    this.inputRef.current.value = "";
    this.formRef.current.resetFields(["line:column"]);
  };

  render() {
    const { sourceContents, sources, directory = [] } = this.state;

    return (
      <div className={classNames("App")}>
        <div className="App-left">
          <Card>
            <Form
              name="control-hooks"
              onFinish={this.onSubmit}
              ref={this.formRef}
            >
              <Form.Item
                label="sourceMap"
                name="sourceMap"
                rules={[{ required: true }]}
              >
                <Fragment>
                  <Form.Item
                    name="sourceMap"
                    rules={[{ required: false }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      ref={this.fileRef}
                      type="file"
                      webkitdirectory="true"
                      onChange={this.onFile}
                      style={{
                        position: "absolute",
                        top: 0,
                        zIndex: 9,
                        opacity: 0,
                        width: "121px",
                        height: "38px",
                      }}
                    />
                  </Form.Item>
                  <Button
                    icon={<UploadOutlined />}
                    style={{ position: "absolute", top: "3px", left: "3px" }}
                  >
                    Select File
                  </Button>
                </Fragment>
              </Form.Item>
              {directory.length > 0 && (
                <Form.Item style={{ marginTop: "-15px" }}>
                  <ul style={{ border: "none" }}>
                    {directory.map((dir, key) => {
                      return (
                        <li key={key}>
                          <Text code>{dir}</Text>
                        </li>
                      );
                    })}
                  </ul>
                </Form.Item>
              )}
              <Form.Item
                name="line:column"
                label="line:column"
                rules={[{ required: true }]}
              >
                <Input
                  ref={this.inputRef}
                  type="text"
                  placeholder="例 10609:7942"
                  onChange={this.onInput}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginRight: "10px" }}
                >
                  Submit
                </Button>
                <Button htmlType="button" onClick={this.onReset}>
                  Reset
                </Button>
              </Form.Item>
            </Form>
          </Card>
          {sources.map((source = {}, key) => {
            return (
              <Card key={key}>
                <Link href={`#pos-${source.key}`}>
                  <li>source: {source.source}</li>
                  <li>line: {source.line}</li>
                  <li>column: {source.column}</li>
                  <li>name: {source.name}</li>
                </Link>
              </Card>
            );
          })}
        </div>
        <div className="App-right">
          {sourceContents.map((sourceContent = "", key) => {
            return (
              <code
                key={key}
                className="javascript"
                dangerouslySetInnerHTML={{ __html: sourceContent }}
              ></code>
            );
          })}
          {sourceContents.length === 0 && (
            <Result
              status={"info"}
              icon={<AlignLeftOutlined style={{ color: "rgb(55,55,55)" }} />}
              title="没有数据"
            />
          )}
        </div>
      </div>
    );
  }
}

export default App;
