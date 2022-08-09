const fs = require('fs');
const path = require('path');
const input_dir = './data'
const output_dir = './src/assets/data'
const package_version = require('../package.json').version;

const load_subfolder = function (edition_path, folder, default_value) {
  const dir = path.join(edition_path, folder);
  if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
    console.debug("\nLoad subfolder: '" + dir + "'");
    const files = fs.readdirSync(dir).map((file) => path.join(dir, file)).filter((file_path) =>
      fs.lstatSync(file_path).isFile()
    );
    files.sort((value) => value.toLowerCase());
    let result = [];
    for (let path of files) {
      console.debug("Read file: '" + path + "'");
      const f = fs.readFileSync(path, 'utf8');
      try {
        object = JSON.parse(f);
      } catch (e) {
        console.error("Error parsing: " + path, e);
      }
      result.push(object)
    }
    return result;
  }
  console.warn("\nCould not load subfolder: '" + dir + "'");
  return default_value;
}

const load_file = function (edition_path, file, default_value) {
  const file_path = path.join(edition_path, file);
  if (fs.existsSync(file_path) && fs.lstatSync(file_path).isFile()) {
    console.debug("\nLoad file: '" + file_path + "'");
    const f = fs.readFileSync(file_path, 'utf8');
    return JSON.parse(f);
  }
  console.warn("\nCould not load file: '" + file_path + "'");
  return default_value;
}

const edition_dirs = fs.readdirSync(input_dir).map((file) => path.join(input_dir, file)).filter((file_path) =>
  fs.lstatSync(file_path).isDirectory()
);

for (edition_path of edition_dirs) {
  console.debug("\n\n------Load edition: '" + edition_path + "'-------");
  let edition_data = load_file(edition_path, 'base.json', {});

  if (!edition_data['edition']) {
    edititon_data['edition'] = path.basename(edition_path);
  }

  if (!edition_data['conditions']) {
    edition_data['conditions'] = [];
  }

  if (!edition_data['extensions']) {
    edition_data['extensions'] = [];
  }

  edition_data['characters'] = load_subfolder(edition_path, 'character', []);
  edition_data['monsters'] = load_subfolder(edition_path, 'monster', []);
  edition_data['decks'] = load_subfolder(edition_path, 'deck', []);
  edition_data['scenarios'] = load_file(edition_path, 'scenarios.json', []);
  edition_data['sections'] = load_file(edition_path, 'sections.json', []);
  edition_data['label'] = load_file(edition_path, 'label.json', {});

  const output_path = path.join(output_dir, (edition_data['edition']) + '.json');

  console.debug("\n> Write file: '" + output_path + "'");

  fs.writeFile(output_path, JSON.stringify(edition_data), 'utf8', (err) => {
    if (err) {
      console.error(err);
    }
  });
}

// add current version to index.html
const index_html_path = './src/index.html';
let index_html = fs.readFileSync(index_html_path, 'utf8');
index_html = index_html.replace('@APP_VERSION@', package_version);
fs.writeFile(index_html_path, index_html, 'utf8', (err) => {
  if (err) {
    console.error(err);
  }
});

// add current version to ngsw-config.json
const ngsw_json_path = './ngsw-config.json';
let ngsw_json = fs.readFileSync(ngsw_json_path, 'utf8');
ngsw_json = ngsw_json.replace('@APP_VERSION@', package_version);
fs.writeFile(ngsw_json_path, ngsw_json, 'utf8', (err) => {
  if (err) {
    console.error(err);
  }
});