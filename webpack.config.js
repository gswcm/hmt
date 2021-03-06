const path = require("path");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressPlugin = require("progress-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const GoogleFontsPlugin = require("google-fonts-webpack-plugin")
const webpack = require('webpack');

const parts = require("./webpack.parts");

const PATHS = {
	app: path.join(__dirname, "frontend"),
	build: path.join(__dirname, "build")
};

const commonConfig = merge([
	{
		entry: {
			app: PATHS.app
		},
		output: {
			path: PATHS.build,
			filename: "[name].js"
		},
		module: {
			loaders: []
		},
		plugins: [
			new HtmlWebpackPlugin({
				inject: false,
				template: require("html-webpack-template-pug"),
				title: "HMT | GSW High Schools Math Tournament",
				// mobile: true,
				injectExtras: {
					head: [
						{
							tag: "meta",
							name: "viewport",
							content:
								"width=device-width, initial-scale=0.75, user-scalable=no"
						},
						{
							tag: "meta",
							name: "descripton",
							content: "GSW High Schools Math Tournament"
						},
						{
							tag: "meta",
							name: "keywords",
							content:
								"GSW, math, tournamnet, high schools, HMT, Georgia, registration"
						},
						{
							tag: "meta",
							name: "robots",
							content: "INDEX,FOLLOW"
						},
						{
							tag: "meta",
							name: "google-site-verification",
							content: "0Q1xlm3G-D82pKGP19mAr-mBt2lmTTCZywkRHAYwghA"
						}
					],
					body: [
						{
							tag: "noscript",
							innerHTML:
								"JavaScript is disabled in your browser. <a href='http://www.enable-javascript.com/' target='_blank'>Here</a> is how to enable it."
						}
					]
				},
				appMountId: "app"
			}),
			new ScriptExtHtmlWebpackPlugin({
				defaultAttribute: "defer"
			}),
			new GoogleFontsPlugin({
				fonts: [
					{ family: "Roboto Mono", variants: ["500"] }
				]
			}),
			new ProgressPlugin(true),
			new FriendlyErrorsWebpackPlugin(),
			new webpack.NamedModulesPlugin()
		],
		resolve: {
			alias: {
				"@fortawesome/fontawesome-free-solid$":
					"@fortawesome/fontawesome-free-solid/shakable.es.js"
			}
		}
	},
	parts.loadFonts({
		options: {
			name: "./fonts/[name].[hash:8].[ext]"
		}
	}),
	parts.loadAssets(),
	parts.loadVue()
]);

const productionConfig = merge([
	parts.setFreeVariable('process.env.NODE_ENV','production'),
	// parts.generateSourceMaps({
	// 	type: "source-map"
	// }),
	parts.cleanup(PATHS.build),
	parts.minifyJavaScript(
		{
			sourceMap: false,
			parallel: true,
		}
	),
	parts.minifyCSS({
		discardComments: {
			removeAll: true
		},
		safe: true
	}),
	parts.extractCSS({
		use: ["css-loader", parts.autoprefix(), "sass-loader"],
		exclude: /assets\//
	}),
	parts.loadImages({
		options: {
			limit: 2000,
			name: "./images/[name].[hash:8].[ext]"
		},
		exclude: /assets\//
	}),
	parts.extractBundles([
		{
			name: "vendor",
			minChunks: ({ resource }) => {
				return /node_modules/.test(resource);
			}
		},
		{
			name: "manifest",
			minChunks: Infinity
		}
	]),
	{ 
		output: {
			chunkFilename: '[name].[chunkhash:8].js',
			filename: '[name].[chunkhash:8].js',
		}
	}
]);

const developmentConfig = merge([
	{
		output: {
			devtoolModuleFilenameTemplate: "webpack:///[absolute-resource-path]"
		}
	},
	parts.generateSourceMaps({
		type: "cheap-module-eval-source-map"
	}),
	parts.devServer({
		host: process.env.HOST,
		port: process.env.PORT
	}),
	parts.loadCSS({
		exclude: /assets\//,
	}),
	parts.loadImages({
		exclude: /assets\//
	})
]);

module.exports = env => {
	if (env === "production") {
		return merge(commonConfig, productionConfig);
	}
	return merge(commonConfig, developmentConfig);
};
