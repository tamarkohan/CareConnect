const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

module.exports = (() => {
    const config = getDefaultConfig(__dirname);

    const { transformer, resolver } = config;

    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve("react-native-svg-transformer"),
    };
    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
        sourceExts: [...resolver.sourceExts, "svg"],
        // fbjs@3 dropped lib/invariant.js; react-native-web@0.21 still imports it.
        // Redirect to the standalone `invariant` package that ships with RN.
        extraNodeModules: {
            ...resolver.extraNodeModules,
            "fbjs/lib/invariant": path.resolve(__dirname, "node_modules/invariant/invariant.js"),
        },
    };

    return config;
})();