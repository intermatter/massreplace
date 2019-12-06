import * as method from "./core";
const fs = require('fs'),
	path = require('path'),
	replace = require("replace");
interface searchTarget {
    search: string,
    replacement: string,
	case: string,
	path: string,
	recursive: boolean,
	ignore: string[],
	global: boolean
}
interface processTarget {
    ignore: string[],
    path: string
}
export function massReplace(filePath: string, defaultFile: boolean = false) {

	var slashChar = method.slashType(filePath);
	var rootPath: string;
	const filePathSegments = filePath.split(slashChar);
	rootPath = filePathSegments.slice(0, filePathSegments.length - 1).join(slashChar);	

	const data = method.readToml(filePath);
	const targets: searchTarget[] = data.targets;

	var globalIgnoreList: string[] = method.collectPaths(data.ignore, rootPath, true);
	
	var targetData: processTarget[] = [];
	targets.forEach(target => {

		if(target.case && !method.isValue(target.case, ["open", "o", "strict", "s", "conservative", "c", "preservative", "p"]))
		{
			method.exit("ERROR invalid case flag");
		}
		const searchPath = target.path ? method.absolutePath(target.path, rootPath) : rootPath;
		var targetIgnoreList: string[] = [];
		const globalFlag: boolean = target.global ? target.global : false;
	
		if(target.path && target.ignore && target.ignore.length > 0)
		{
			targetIgnoreList = method.collectPaths(target.ignore, searchPath, false);
	
			if(globalFlag === true) {
				targetIgnoreList = targetIgnoreList.concat(globalIgnoreList);
			}
		}
		else
		{
			if(globalFlag === true) {
				targetIgnoreList = globalIgnoreList.slice();
			}
		}
	
		targetIgnoreList.push(method.absolutePath(filePath, rootPath));
		targetData.push({ignore: targetIgnoreList, path: searchPath});
	});
	var counter = 0;
	targets.forEach(target => {
		const searchValue = method.escapeRegExp(target.search);
		const newValue = target.replacement;
		const searchPath = targetData[counter].path;
		const targetIgnoreList = targetData[counter].ignore;
		const recursiveFlag: boolean = target.recursive ? target.recursive : true;
		if(method.isValue(target.case, ["open", "o", "conservative", "c", "preservative", "p"]))
		{
			if(target.case === "open" || target.case === "o")
			{
				var filesList = method.getInclusions(searchPath, targetIgnoreList);
				var pattern = new RegExp(searchValue, "i");
				while(method.searchInFiles(searchValue, filesList, false).length > 0)
				{
					replace({
						regex: pattern,
						replacement: target.replacement,
						paths: [searchPath],
						recursive: recursiveFlag,
						silent: false,
						exclude: targetIgnoreList.join(",")
					});
				}
			}
			else if(target.case === "conservative" || target.case === "c" || target.case === "preservative" || target.case === "p")
			{
				var searchValueCases: string[] = [];
				var newValueCases: string[] = [];	

				searchValueCases = method.standardCase(searchValue);
				if(target.case === "preservative" || target.case === "p")
				{
					newValueCases =  method.standardCase(newValue);
				}
				var replacementValue;
				for(var i = 0; i < 3; i++)
				{
					if(target.case === "preservative" || target.case === "p")
					{
						replacementValue = newValueCases[i];
					}
					else
					{
						replacementValue = newValue;
					}
					replace({
						regex: searchValueCases[i],
						replacement: replacementValue,
						paths: [searchPath],
						recursive: recursiveFlag,
						silent: false,
						exclude: targetIgnoreList.join(",")
					});
				}
			}
		}
		else
		{
			replace({
				regex: searchValue,
				replacement: target.replacement,
				paths: [searchPath],
				recursive: recursiveFlag,
				silent: false,
				exclude: targetIgnoreList.join(",")
			});
		}
		counter++;
	});
}