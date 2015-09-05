({
  baseUrl: ".",
  name: 'require-for-build',
  mainConfigFile: "./require-for-build.js",
  out: "app.js",
  preserveLicenseComments: true,
  optimize: 'none',
  // preserveLicenseComments: false,
  // removeCombined: true,
  // optimize: 'uglify2',
  useStrict: true,
  wrap: true,
  findNestedDependencies: true
})