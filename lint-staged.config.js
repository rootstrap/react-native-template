module.exports = {
  '**/*.{js,jsx,ts,tsx}': (filenames) => [
    `npx eslint --fix ${filenames
      .map((filename) => `"${filename}"`)
      .join(' ')}`,
  ],
  'src/translations/*.(json)': (filenames) => [
    `npx eslint --fix ${filenames
      .map((filename) => `"${filename}"`)
      .join(' ')}`,
  ],
};
