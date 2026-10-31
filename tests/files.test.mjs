import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function setup() {
  const requests = [], errors = [];
  const source = readFileSync(new URL('../webui/legacy-files.js', import.meta.url), 'utf8')
    .replace(/^import .*;\n/gm, '').replace('export const legacyFiles', 'const store');
  const store = vm.runInNewContext(`${source}\nstore`, {
    createStore: (_, value) => value,
    fetchApi: () => new Promise(resolve => requests.push(resolve)),
    localStorage: {setItem() {}}, toastFrontendError: message => errors.push(message), console,
  });
  const reply = (index, data, ok=true) => requests[index]({ok, json: async()=>({data})});
  return {store, reply, errors};
}

test('stale folder responses and unmounted requests cannot replace newer content', async () => {
  const {store, reply} = setup();
  const old = store.load('/old'), latest = store.load('/new');
  reply(1, {current_path:'/new', entries:[{path:'/new/note',name:'note',is_dir:false}]});
  await latest;
  reply(0, {current_path:'/old', entries:[]});
  await old;
  assert.equal(store.path, '/new');
  const pending = store.load('/late');
  store.cleanup();
  reply(2, {current_path:'/late', entries:[]});
  await pending;
  assert.equal(store.path, '/new');
});

test('failed navigation retains the folder and filtering keeps folders first', async () => {
  const {store, reply, errors} = setup();
  store.entries = [{name:'Note 10', is_dir:false}, {name:'Note 2', is_dir:false}, {name:'Notes',is_dir:true}];
  store.query = 'note';
  assert.equal(store.filtered.map(file=>file.name).join('|'), 'Notes|Note 2|Note 10');
  const pending = store.load('/missing');
  reply(0, {error:'Not found'}, false); await pending;
  assert.equal(store.path, '/a0');
  assert.equal(store.entries.length, 3);
  assert.equal(errors[0], 'Not found');
});

test('supported Cores own the browser while the plugin retains only its welcome controls', async () => {
  const calls = [];
  const browser = { isLoading: false, browser: { currentPath: '/shared-ui' }, fetchFiles: path => calls.push(['refresh', path]) };
  const source = readFileSync(new URL('../webui/files-store.js', import.meta.url), 'utf8')
    .replace(/^import .*;\n/gm, '').replace('export const store', 'const store');
  const store = vm.runInNewContext(`${source}\nstore`, {
    createStore: (_, value) => value,
    core: { createFileBrowserView: (name, options) => { calls.push([name, options.embedded, options.rememberKey]); return browser; }, store: { open: path => calls.push(['open', path]) } },
    legacyFiles: { canDismiss: true, mount: () => assert.fail('Legacy browser must not mount'), cleanup: () => assert.fail('Legacy browser must not clean up Core') },
    welcome: { init() {}, dismissSection() {} }, localStorage: { getItem: () => null }, console,
  });
  store.mount(); store.cleanup(); await store.refresh(); await store.openFiles();
  assert.equal(store.embedded, true);
  assert.deepEqual(calls, [['welcomeFilesBrowser', true, 'welcomeFiles.path'], ['refresh', '/shared-ui'], ['open', '/shared-ui']]);
});

test('an older Core keeps the legacy browser without importing a missing named export', () => {
  let mounted = 0, cleaned = 0;
  const source = readFileSync(new URL('../webui/files-store.js', import.meta.url), 'utf8')
    .replace(/^import .*;\n/gm, '').replace('export const store', 'const store');
  const store = vm.runInNewContext(`${source}\nstore`, {
    createStore: (_, value) => value, core: { store: {} },
    legacyFiles: { mount() { mounted++; }, cleanup() { cleaned++; } }, console,
  });
  store.mount(); store.cleanup();
  assert.equal(store.embedded, false);
  assert.equal(mounted, 1); assert.equal(cleaned, 1);
});

test('composing the wrapper preserves live dismissal and legacy filter getters', () => {
  const read = file => readFileSync(new URL(`../webui/${file}`, import.meta.url), 'utf8')
    .replace(/^import .*;\n/gm, '').replace(/export const /g, 'const ');
  const source = `const legacyFiles = (() => { ${read('legacy-files.js')}; return legacyFiles; })();\n${read('files-store.js')}`;
  for (const supported of [false, true]) {
    const welcome = { hiddenSections: [], dismissSection(id) { this.hiddenSections.push(id); } };
    const core = supported ? { createFileBrowserView: () => ({}) } : {};
    const store = vm.runInNewContext(`${source}\nstore`, {
      core, welcome, console, createStore: (_, value) => value,
    });
    assert.equal(store.hidden, false);
    store.dismiss();
    assert.equal(store.hidden, true);
    welcome.hiddenSections = [];
    assert.equal(store.hidden, false);
    store.entries = [{ name: 'one.txt' }, { name: 'two.txt' }];
    store.query = 'two';
    assert.equal(store.filtered.length, 1);
    assert.equal(store.filtered[0].name, 'two.txt');
  }
});
