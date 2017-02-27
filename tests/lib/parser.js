const { createGraphFromFile } = require('../../lib/parser');
const { expect } = require('chai');
const Graph = require('graphlib').Graph;
const path = require('path');

function s(t) {
  return 1;
}

function createPath(name) {
  let ext = '';
  if (!path.extname(name)) {
    ext = '.js';
  }
  return path.join(__dirname, '..', 'fixtures', name + ext);
}

function verifyGraph(g, vertexList, edgeList = []) {
  let nodes = g.nodes().sort();
  let edges = g.edges().sort((a, b) => a.v <= b.v);

  edgeList = edgeList.map(e => ({ v: createPath(e.v), w: createPath(e.w) }))
    .sort((a, b) => a.v <= b.v);
  vertexList = vertexList.map(createPath).sort();

  expect(nodes).to.eql(vertexList);
  expect(edges).to.eql(edgeList);
}

describe('Parser', () => {
  describe('createGraphFromFile', () => {
    it('creates 2 file graph', () => {
      return createGraphFromFile(createPath('test1'), s, {})
        .then((g) => verifyGraph(g, [
          'test1', 'test2'
        ], [
          { v: 'test2', w: 'test1' }
        ]));
    });

    it('creates 3 file graph', () => {

      return createGraphFromFile(createPath('test3'), s, {})
        .then((g) => verifyGraph(g, [
          'test1', 'test2', 'test3'
        ], [
          { v: 'test1', w: 'test3' },
          { v: 'test2', w: 'test1' }
        ]));
    });

    it('creates graph with files from different dirs', () => {
      return createGraphFromFile(createPath('test/test4'), s, {})
        .then((g) => verifyGraph(g, [
          'test1', 'test2', 'test/test4'
        ], [
          { v: 'test2', w: 'test/test4' },
          { v: 'test1', w: 'test/test4' },
          { v: 'test2', w: 'test1' },
        ]));
    });

    it('handles cyclic deps', () => {
      return createGraphFromFile(createPath('cyclic1'), s, {})
        .then((g) => verifyGraph(g, [
          'cyclic1', 'cyclic2'
        ], [
          { v: 'cyclic1', w: 'cyclic2' },
          { v: 'cyclic2', w: 'cyclic1' },
        ]));
    });

    it('handles npm deps', () => {
      return createGraphFromFile(createPath('testNpm'), s, {
        packageJSON: './package.json'
      }).then((g) => verifyGraph(g, [
        'testNpm', '../../node_modules/acorn/package.json'
      ], [
        { v: '../../node_modules/acorn/package.json', w: 'testNpm' },
      ]));
    });
  });
});
