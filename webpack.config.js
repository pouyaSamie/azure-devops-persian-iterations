const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Webpack entry points. Mapping from resulting bundle name to the source file entry.
const entries = {};
const srcRoot = path.join(__dirname, "src");

const toPosix = p => p.split(path.sep).join("/");
const addEntry = (name, filePath) => {
    if (!entries[name]) {
        entries[name] = "./" + toPosix(path.relative(process.cwd(), filePath));
    }
};

function findMatchingEntry(htmlPath) {
    const dir = path.dirname(htmlPath);
    const base = path.basename(htmlPath, ".html");
    const candidates = [".tsx", ".ts", ".js"].map(ext => path.join(dir, base + ext));
    return candidates.find(fs.existsSync);
}

function walkAndRegister(dirPath) {
    fs.readdirSync(dirPath).forEach(entry => {
        const full = path.join(dirPath, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            walkAndRegister(full);
        } else if (stat.isFile() && entry.toLowerCase().endsWith(".html")) {
            const entryFile = findMatchingEntry(full);
            if (entryFile) {
                addEntry(path.basename(entry, ".html"), entryFile);
            }
        }
    });
}

walkAndRegister(srcRoot);

module.exports = (env, argv) => ({
    entry: entries,
    output: {
        filename: "[name]/[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
        },
    },
    stats: {
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/, 
                type: 'asset/inline'
            },
            {
                test: /\.html$/, 
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
           patterns: [ 
               { 
                   from: "**/*.html", 
                   context: "src",
                   to({ absoluteFilename }) {
                       const rel = toPosix(path.relative(srcRoot, absoluteFilename));
                       const parsed = path.parse(rel);
                       // For root-level HTML files, place them under a folder matching the basename
                       if (!parsed.dir) {
                           return `${parsed.name}/${parsed.base}`;
                       }
                       return rel;
                   }
               }
           ]
        })
    ],
    ...(env.WEBPACK_SERVE
        ? {
              devtool: 'inline-source-map',
              devServer: {
                  server: 'https',
                  port: 3000,
                  static: {
                      directory: path.join(__dirname, "dist")
                  },
                  allowedHosts: "all"
              }
          }
        : {})
});
