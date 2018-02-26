#!/usr/bin/env node

const process = require('process');
const readFileSync = require('fs').readFileSync;

const traverse = require('@babel/traverse').default;
const parse = require('babylon').parse;
const t = require('@babel/types');

const filename = process.argv[2];
const content = readFileSync(filename, 'utf8')

const ast = parse(content, {
  sourceType: 'module',
  plugins: ['flow'],
});

let buffer = [];

buffer.push('## Exports\n');

traverse(ast, {

  ExportNamedDeclaration(path) {
    const declaration = path.node.declaration;

    if (t.isVariableDeclaration(declaration)) {

      if (declaration.declarations.length <= 0) {
        return path.skip()
      }

      declaration.declarations.forEach(decl => {
        const name = decl.id.name;

        let initType = 'Constant';

        if (t.isNumericLiteral(decl.init)) {
          initType += ' number ';
        }

        buffer.push(`- ${initType}\`${name}\``);
      })

    } else if (t.isFunctionDeclaration(declaration)) {
      const name = declaration.id.name;
      const params = declaration.params.map(param => {
        if (t.isIdentifier(param)) {
          return param.name
        }

        if (t.isAssignmentPattern(param)) {
          return param.left.name;
        }
      }).join(', ');

      buffer.push(`- function \`${name}(${params})\``);
    }
  }
})

buffer.push('\n');

process.stdout.write(buffer.join('\n'));
