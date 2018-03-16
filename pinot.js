const chalk = require('chalk');
const fs = require('fs');
const path = require('path')

const showHeaders = process.argv.find(arg => arg === "-h" | arg === "--show-headers") !== undefined
const showErrors = process.argv.find(arg => arg === "-e" | arg === "--show-errors") !== undefined

// Set true to enable debugging
const showInternalErrors = false

const pinoLevels = {
  0: "ALL",
  10: "TRACE",
  20: "DEBUG",
  30: "INFO",
  40: "WARN",
  50: "ERROR",
  60: "FATAL",
  100: "OFF",

}

const processColors = {}
let lastProcessColor = 0
const foregroundColors = [
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "gray",
  "redBright",
  "greenBright",
  "yellowBright",
  "blueBright",
  "magentaBright",
  "cyanBright",
  "whiteBright"
]

class PinoT {

  constructor({showHeaders, showErrors, showInternalErrors}) {
    this.showHeaders = showHeaders
    this.showErrors = showErrors
    this.showInternalErrors = showInternalErrors
  }

  processLine(line) {
    try {
      let object = JSON.parse(line)
      if (object.err) {
        this.printErrorObject(object)
      }
      this.printHTTPObject(object)
    } catch (error) {
      this.printError(error)
      this.printRawLine(line)
    }
  }
  // Print javascript (this process)
  printError(error) {
    if (!showInternalErrors) {
      return
    }

    if (error.message.indexOf("JSON") === -1) {
      console.log(error.toString())
    }
  }

  // Print lines that could not be parsed as JSON objecd
  printRawLine(line) {
    if (!showErrors || !line.length) {
      return
    }
    console.log(line)
  }

  // Print error objects parsed from JSON string
  printErrorObject(object) {
    if (!showErrors) {
      return
    }

    process.stderr.write(JSON.stringify(object, null, 2))
    process.stderr.write("\n")
  }

  // Print http objects parsed from JSON string
  printHTTPObject(object) {
    const level = pinoLevels[object.level]
    const time = new Date(object.time).toISOString()
    const processInfo = this.getProcessInfo(object)
    const statusCode = this.getStatusCode(object)
    const method = object.req.method.padEnd(5)
    const url = object.req.url
    const responseTime = object.responseTime || "-"
    const output = `[${time}] ${level} ${processInfo} ${statusCode} ${method} ${url} ${responseTime} ms\n`

    process.stdout.write(output)

    if (showHeaders) {
      this.printHeaders(object)
    }
  }

  getStatusCode(object) {
    const statusCode = object.res.statusCode;
    const color = object.res.statusCode < 400 ? "green" : "red"
    return `${chalk[color](object.res.statusCode)}`.padEnd(3)
  }

  printHeaders(object) {
    const headers = object.req.headers
    Object.keys(headers).forEach(key => {
        process.stdout.write(`  ${key}: ${headers[key]}\n`)
    })
  }

  getProcessInfo(object) {
    const name = object.name
    const pid = object.pid
    const processInfo= `${name}/${pid}`
    const color = this.getProcessColor(name)
    return `(${chalk[color](processInfo)}):`.padEnd(40)
  }

  getProcessColor(processName) {
    let color = processColors[processName]

    if (!color) {
      let colorIndex = this.hashCode(processName)
      color = foregroundColors[colorIndex % foregroundColors.length]
      processColors[processName] = color
    }

    return color
  }

  hashCode(s) {
    var h = 0, l = s.length, i = 0;
    if ( l > 0 )
      while (i < l)
        h = (h << 5) - h + s.charCodeAt(i++) | 0
    return Math.abs(h)
  }
}
module.exports = PinoT
