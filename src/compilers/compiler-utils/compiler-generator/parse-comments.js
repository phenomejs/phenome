function parseComments(componentString, config) {
  const { compiler } = config;

  return componentString
    .split(/\n/g)
    .filter((line, index, lines) => {
      // phenome-{compiler}-line
      const lineMatch = line.match(/\/\/[ ]{0,}phenome-([a-z]*)-line/);
      if (lineMatch) {
        if (lineMatch[1] !== compiler) return false;
      }
      const previousLine = lines[index - 1];
      if (previousLine) {
        // phenome-{compiler}-next-line
        const previousLineMatch = previousLine.match(/\/\/[ ]{0,}phenome-([a-z]*)-next-line/);
        if (previousLineMatch && previousLineMatch[1] !== compiler) return false;
      }

      return true;
    })
    .join('\n');
}
module.exports = parseComments;