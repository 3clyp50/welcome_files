import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function setup() {
  const requests = [], errors = [];
  const source = readFileSync(new URL('../webui/files-store.js', import.meta.url), 'utf8')
    .replace(/^import .*;\n/gm, '').replace('export const store', 'const store');
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
