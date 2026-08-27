function readPackage(pkg) {
  if (['esbuild', 'sharp', 'unrs-resolver'].includes(pkg.name)) {
    pkg.allowBuild = true;
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
