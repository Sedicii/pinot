#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const path = require('path')

const PinoT = require('./pinot')

if (process.argv.find(arg => arg === "--help") !== undefined) {
  let f = fs.readFileSync(path.join(__dirname, 'usage.txt')) + '\n'
  process.stdout.write(f)
  process.exit()
}

const showHeaders = process.argv.find(arg => arg === "-h" | arg === "--show-headers") !== undefined
const showErrors = process.argv.find(arg => arg === "-e" | arg === "--show-errors") !== undefined
// Set true to enable debugging
const showInternalErrors = false

const pinot = new PinoT({showHeaders, showErrors, showInternalErrors})

process.stdin.on("data", function(chunk) {
    chunk
      .toString()
      .split("\n")
      .forEach(line => pinot.processLine(line))
})
