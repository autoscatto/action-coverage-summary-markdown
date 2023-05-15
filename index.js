const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path')
const Handlebars = require("handlebars");
const warningThreshold = parseFloat(core.getInput('warning_threshold'));
const goodThreshold = parseFloat(core.getInput('good_threshold'));
let failIf
try {
    failIf = core.getBooleanInput('fail_if');
}
catch (e) {
    if (e instanceof TypeError) failIf = false;
    else throw e;
}


const baseTemplateTable = core.getInput('lines_total_template') || fs.readFileSync(path.join(__dirname, 'templates', 'tab.md'), {encoding:'utf-8'});
const baseTemplateBadge = core.getInput('lines_badge_template') || fs.readFileSync(path.join(__dirname, 'templates', 'badge.md'), {encoding:'utf-8'});

const templateTable = Handlebars.compile(baseTemplateTable);
const templateBadge = Handlebars.compile(baseTemplateBadge);

try {

  const summaryFile = core.getInput('summary_file', {required: true});
  if (summaryFile === '' || summaryFile === undefined) core.setFailed("Please specify a summary file!");
  fs.readFile(summaryFile, 'utf8', (err, data) => {
    if (err) {
        core.setFailed(`Can't read file ${summaryFile}:`, err);
        return;
    }
    let jsonData;
    try {
        jsonData = JSON.parse(data.toString());
    } catch (err) {
        core.setFailed(`Can't parse file ${summaryFile}:`, err);
        return;
    }
    try {
        const { total, covered, skipped, pct } = jsonData?.total?.lines;
        for (const v of [total, covered, skipped, pct]){
            if (isNaN(v)) throw new Error("Report parsing failed!")
        }
        let color = "red";
        if (pct >= warningThreshold) { color = "yellow" }
        if (pct >= goodThreshold) { color = "brightgreen" }
        if (failIf & pct < goodThreshold) core.setFailed(`The coverage (of ${pct}%) does not reach the minimum acceptable level of ${goodThreshold}%`);
        core.setOutput("lines",  templateTable({total, covered, skipped, pct, color }));
        core.setOutput("lines_badge", templateBadge({total, covered, skipped, pct, color }));
    }
    catch (err) {
        core.setFailed(`Is not a valid coverage-summary json!`, err);
        return;
    }

});
}
catch (err) {
    core.setFailed(`Generic error: ${err}`, err);
    return;
}