const path = require('path')
const process = require('process')
const cp = require('child_process')

jest.setTimeout(180000)

test('Test core errors', () => {
  const options = {
    env: process.env
  }
  options.env['GITHUB_WORKSPACE'] = '.'
  const ip = path.join(__dirname, '..', 'index.js')
  try {
    cp.execSync(`node ${ip}`, options).toString()
    fail('Should not succeed, because values miss')
  } catch (error) {
    expect(error).toBeDefined()
  }
  try {
    options.env['GITHUB_WORKSPACE'] = '.'
    options.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, 'core.test.js')
    cp.execSync(`node ${ip}`, options).toString()
    fail('Should not succeed, because no valid json')
  } catch (error) {
    expect(error).toBeDefined()
  }
  try {
    options.env['GITHUB_WORKSPACE'] = '.'
    options.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, '..', 'package.json')
    cp.execSync(`node ${ip}`, options).toString()
    fail('Should not succeed, because no valid report')
  } catch (error) {
    expect(error).toBeDefined()
  }
})

test('Test core minimal functionality', () => {
  const options = {
    env: process.env
  }
  options.env['GITHUB_WORKSPACE'] = '.'
  options.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, 'coverage-summary.json')
  const ip = path.join(__dirname, '..', 'index.js')
  const result = cp.execSync(`node ${ip}`, options).toString()
  for (const value of ['lines::', 47, 37, 0, 78.72]) {
    expect(result).toContain(String(value))
  }
  for (const value of ['lines_badge::', '-red']) {
    expect(result).toContain(String(value))
  }

  // should succeed
  expect(result).toBeDefined()
})

test('Test core threashold and minimal custom templates functionality', () => {
  const options = {
    env: process.env
  }
  options.env['GITHUB_WORKSPACE'] = '.'
  options.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, 'coverage-summary.json')
  options.env['INPUT_WARNING_THRESHOLD'] = 70
  options.env['INPUT_LINES_TOTAL_TEMPLATE'] = '{{total}},{{covered}},{{skipped}},{{pct}}'
  options.env['INPUT_LINES_BADGE_TEMPLATE'] = '{{color}}'
  const ip = path.join(__dirname, '..', 'index.js')
  let result = cp.execSync(`node ${ip}`, options).toString()
  for (const value of ['lines_badge::', 'yellow']) {
    expect(result).toContain(String(value))
  }

  options.env['INPUT_WARNING_THRESHOLD'] = 60
  options.env['INPUT_GOOD_THRESHOLD'] = 70
  result = cp.execSync(`node ${ip}`, options).toString()
  for (const value of ['lines_badge::', 'brightgreen']) {
    expect(result).toContain(String(value))
  }

  // should succeed
  expect(result).toBeDefined()
})

test('Test core custom templates functionality and fail if threshold', () => {
  const options = {
    env: process.env
  }
  options.env['GITHUB_WORKSPACE'] = '.'
  options.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, 'coverage-summary.json')
  options.env['INPUT_WARNING_THRESHOLD'] = 60
  options.env['INPUT_GOOD_THRESHOLD'] = 90
  options.env['INPUT_LINES_TOTAL_TEMPLATE'] = '{{total}},{{covered}},{{skipped}},{{pct}}'
  options.env['INPUT_LINES_BADGE_TEMPLATE'] = '{{color}}'
  const ip = path.join(__dirname, '..', 'index.js')
  let result = cp.execSync(`node ${ip}`, options).toString()
  expect(result.split('\n')).toEqual(['', 'name=lines::47,37,0,78.72', '', 'name=lines_badge::yellow', ''])
  process.env['INPUT_FAIL_IF'] = 'true'
  try {
    result = cp.execSync(`node ${ip}`, options).toString()
    fail('Should not succeed, because fail_if option')
  } catch (error) {
    expect(error).toBeDefined()
  }
})
