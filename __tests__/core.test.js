const path = require('path')
const process = require('process')
const cp = require('child_process')
const fs = require('fs')

jest.setTimeout(180000)

test('Test core errors', () => {
  process.env['GITHUB_WORKSPACE'] = '.'
  const ip = path.join(__dirname, '..', 'index.js')
  const options = {
    env: process.env
  }
  try {
    cp.execSync(`node ${ip}`, options).toString()
    fail('Should not succeed, because values miss')
  } catch (error) {
    expect(error).toBeDefined()
  }
  try {
    process.env['GITHUB_WORKSPACE'] = '.'
    process.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, 'core.test.js')
    cp.execSync(`node ${ip}`, options).toString()
    fail('Should not succeed, because no valid json')
  } catch (error) {
    expect(error).toBeDefined()
  }
  try {
    process.env['GITHUB_WORKSPACE'] = '.'
    process.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, '..', 'package.json')
    cp.execSync(`node ${ip}`, options).toString()
    fail('Should not succeed, because no valid report')
  } catch (error) {
    expect(error).toBeDefined()
  }
})


test('Test core minimal functionality', () => {
  process.env['GITHUB_WORKSPACE'] = '.'
  process.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, 'coverage-summary.json')
  const ip = path.join(__dirname, '..', 'index.js')
  const options = {
    env: process.env
  }
  try {
    cp.execSync(`node ${ip}`, options).toString()
  }
  catch (e) {
    console.log('kkkkkkkkkkkkkk', e.stdout.toString())
  }
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
  process.env['GITHUB_WORKSPACE'] = '.'
  process.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, 'coverage-summary.json')
  process.env['INPUT_WARNING_THRESHOLD'] = 70
  process.env['INPUT_LINES_TOTAL_TEMPLATE'] = '{{total}},{{covered}},{{skipped}},{{pct}}'
  process.env['INPUT_LINES_BADGE_TEMPLATE'] = '{{color}}'
  const ip = path.join(__dirname, '..', 'index.js')
  const options = {
    env: process.env
  }
  let result = cp.execSync(`node ${ip}`, options).toString()
  for (const value of ['lines_badge::', 'yellow']) {
    expect(result).toContain(String(value))
  }

  process.env['INPUT_WARNING_THRESHOLD'] = 60
  process.env['INPUT_GOOD_THRESHOLD'] = 70
  result = cp.execSync(`node ${ip}`, {env: process.env}).toString()
  for (const value of ['lines_badge::', 'brightgreen']) {
    expect(result).toContain(String(value))
  }

  // should succeed
  expect(result).toBeDefined()
})

test('Test core custom templates functionality and fail if threshold', () => {
  process.env['GITHUB_WORKSPACE'] = '.'
  process.env['INPUT_SUMMARY_FILE'] = path.join(__dirname, 'coverage-summary.json')
  process.env['INPUT_WARNING_THRESHOLD'] = 60
  process.env['INPUT_GOOD_THRESHOLD'] = 90
  process.env['INPUT_LINES_TOTAL_TEMPLATE'] = '{{total}},{{covered}},{{skipped}},{{pct}}'
  process.env['INPUT_LINES_BADGE_TEMPLATE'] = '{{color}}'
  const ip = path.join(__dirname, '..', 'index.js')
  const options = {
    env: process.env
  }
  let result = cp.execSync(`node ${ip}`, options).toString()
  expect(result.split('\n')).toEqual(['', '::set-output name=lines::47,37,0,78.72', '', '::set-output name=lines_badge::yellow', ''])
  process.env['INPUT_FAIL_IF'] = 'true'
  try {
    result = cp.execSync(`node ${ip}`, options).toString()
    fail('Should not succeed, because fail_if option')
  } catch (error) {
    expect(error).toBeDefined()
  }
})
