#!/usr/bin/env node
/*
	Automatically grade files for the presence of specified HTML tags/attributes.
	Uses commander.js and cheerio. teaches command line application development
	and basic DOM parsing.

	References: 

	+ cheerio
		- https://github.com/MatthewMueller/cheerio
		- https://encosia.com/cheerio-fater-windows-friendly-alternative-jsdom/
		- http://maxogden.com/scraping-with-node.HTML

	+ commander.js
		- https://github.com/visionmedia/commander.js
		- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

	+ JSON
		- http://en.wikipedia.org/wiki/JSON
		- https://developer.mozilla.org/en-US/docs/JSON
		- https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLFILE_DEFAULT = null; //"http://stark-tor-5451.herokuapp.com/";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
	//console.log("%s exisits!", instr)
	return instr;
};

var checkHtmlUrl = function(urlfile, checksfile) {
	restler.get(urlfile).on('complete',function(result) {
		if (result instanceof Error) {
			// error in processing the get. Print the error and retry.
			console.log("Error: %s", result.message);
			this.retry(5000); // try again after 5 sec
			process.exit(1); //unsuccessful - exit the program
		} else {
			// was able to get the URL. The result contains the HTML
			console.log("no error. Result is: %s", result); // prints the result (HMTL)
			var checks = loadChecks(checksfile).sort();
			console.log("The check file: %s", checks);
			var out = {};
			for (var ii in checks) {
				var present = result.indexOf(checks[ii]) > 0;
				//console.log(checks[ii]);
				//console.log(present);
				//var present = $(checks[ii]).length > 0;
				out[checks[ii]] = present;
			}
		}
		//console.log(out);
		//console.log("leaving...");
		var outJson = JSON.stringify(out, null, 4);
		console.log(outJson);
		return outJson;
	});
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);
	console.log($);
	var checks = loadChecks(checksfile).sort();
	console.log("The check file: %s", checks);
	var out = {};
	for (var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var clone = function(fn) {
	// Workaround for commmander.js issue.
	// http://stackoverflow.com/a/6772648
	return fn.bind({});
};

if (require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', "Path to index.html", clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <html_url>', "Path to site URL", /*clone(assertUrlExists),*/ URLFILE_DEFAULT)
		.parse(process.argv);
	if (program.url) {
		// Provide feedback about what is being processed
		console.log("Checking URL file %s", program.url);
		console.log ("against %s", program.checks);

		var outJson = checkHtmlUrl(program.url, program.checks);
		//var outJson = JSON.stringify(checkJson, null, 4);
		//console.log("printing results...");
		//console.log(outJson);
	}  else {
		// Provide feedback about what is being processed
		console.log ("checking file %s", program.file);
		console.log ("against %s", program.checks);

		var checkJson = checkHtmlFile(program.file, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log("printing results...");
		console.log(outJson);
	}

} else {
	exports.checkHtmlFile = checkHtmlFile;
}