# action-coverage-summary-markdown

This action generates markdown outputs from a `coverage-summary.json` file that summarizes the code test coverage.

## Inputs

### `summary-file`

**Required** The path of the coverage summary JSON file.

### `warning-threshold`

Optional. The minimum coverage required to get a warning status. Default is 65.

### `good-threshold`

Optional. The minimum coverage required to get a good status. Default is 90.

## Outputs

### `lines`

The lines report table.# Coverage Summary Markdown

This GitHub Action generates Markdown outputs from `coverage-summary.json` to display coverage reports in a more readable and visually appealing format.

## Features

- Generate a lines report table
- Create a lines percentage badge
- Set minimum coverage thresholds for warning and good status
- Define custom Handlebars templates for lines total and badge

## Inputs

| Input                 | Description                                                                  | Required | Default |
|-----------------------|------------------------------------------------------------------------------|----------|---------|
| `summary_file`        | Coverage summary JSON file                                                   | Yes      | `''`    |
| `warning_threshold`   | Minimum coverage required for a warning status                               | No       | `65`    |
| `good_threshold`      | Minimum coverage required for a good status                                  | No       | `90`    |
| `fail_if`             | Step will fail if coverage is less than good_threshold                       | No       | `false` |
| `lines_total_template`| Handlebars template for lines total (usable variables: total, covered, skipped, pct, color) | No | `''` |
| `lines_badge_template`| Handlebars template for lines total badge (usable variables: total, covered, skipped, pct, color) | No | `''` |

## Outputs

| Output        | Description            |
|---------------|------------------------|
| `lines`       | Lines report table     |
| `lines_badge` | Lines percentage badge |

## Usage

```yaml
steps:
  - name: Coverage Summary Markdown
    uses: autoscatto/action-coverage-summary-markdown@v1
    with:
      summary_file: 'path/to/coverage-summary.json'
      warning_threshold: 65
      good_threshold: 90
      fail_if: false
```

## Example

Create a `coverage-summary.json` file and add the following GitHub Action to your repository's workflow:

```yaml
name: Coverage Report

on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Generate coverage-summary.json
      run: |
        # Add commands here to generate coverage-summary.json
        # For example: npm run test:coverage

    - name: Coverage Summary Markdown
      uses: autoscatto/action-coverage-summary-markdown@v1
      id: coverage_summary_markdown
      with:
        summary_file: 'coverage-summary.json'
        warning_threshold: 65
        good_threshold: 90
        fail_if: true

    - name: Create Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          body: |
            ... other release info ...
            ${{steps.coverage_summary_markdown.outputs.lines}}
            ${{steps.coverage_summary_markdown.outputs.lines_badge}}
