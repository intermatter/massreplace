import { exec } from "child_process";

export const shell = require('shelljs');
const fs = require('fs');
const toml = require('toml');
const path = require('path');
declare global
{
  interface Array<T>
  {
    pushUnique(string: String);
    isEmpty();
    intersects(array: Array<T>);
    last(array: Array<T>);
  }
  interface String
  {
    isEmpty();
  }
  interface Number
  {
    isEmpty();
  }
  interface BigInt
  {
    isEmpty();
  }
  interface Boolean
  {
    isEmpty();
  }
  interface Symbol
  {
    isEmpty();
  }
  interface Object
  {
    isEmpty();
  }
}
Array.prototype.last = function ()
{
  return this[this.length - 1];
}
Array.prototype.intersects = function (arr): boolean
{
  var ret: boolean = false;
  this.forEach(elem =>
  {
    if (arr.includes(elem))
    {
      ret = true;
    }
  })
  return ret;
};
Array.prototype.pushUnique = function (value)
{
  return ((!this.includes(value)) ? this.push(value) : this);
};

/*
 * Cross-type validation
 */
Array.prototype.isEmpty = function ()
{
  return (!this || this.length === 0);
};
String.prototype.isEmpty = function ()
{
  return (!this);
};
Number.prototype.isEmpty = function ()
{
  return (!this);
};
BigInt.prototype.isEmpty = function ()
{
  return (!this);
};
Boolean.prototype.isEmpty = function ()
{
  return (!this);
};
Symbol.prototype.isEmpty = function ()
{
  return (!this);
};
Object.prototype.isEmpty = function ()
{
  return (!this);
};
export function isValue(
  value: any,
  values?: any[]
): boolean
{
  if (!value)
  {
    return false;
  } else
  {
    if (values)
    {
      return values.includes(value);
    } else
    {
      return true;
    }
  }
}
export function getEnv(parameter: string): string
{
  const env = eval('process.env.' + parameter);
  if (isValue(env))
  {
    return env;
  } else
  {
    return ''
  };
}
export function exit(message: string = '')
{
  console.log(message)
  shell.exit();
}
export function escapeRegExp(text)
{
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
export function sleepFor(duration)
{
  var now = new Date().getTime();
  while (new Date().getTime() < now + duration) { /* do nothing */ }
}
export function shuffle(array)
{
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0)
  {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}
export function arrayFromString(value: string)
{
  var arr = [];
  for (var i = 0; i <= value.length; i++)
    arr[i] = value.charAt(i);
  return arr;
}

// Function to generate permutations 
export function permuteCase(input: string) 
{
  var combinations: string[] = [];

  const n: number = input.length;

  // Number of permutations is 2^n 
  const max: number = Math.pow(2, input.length);

  // Converting string to lower case 
  input = input.toLowerCase();

  // Using all subsequences and permuting them 
  for (var i = 0; i < max; i++)
  {
    // If j-th bit is set, we convert it to upper case 
    var combination: string[] = arrayFromString(input);
    for (var j = 0; j < n; j++)
    {
      if (((i >> j) & 1) === 1)
      {
        combination[j] = input.charAt(j).toUpperCase();
      }
    }
    combinations.push(combination.join(""));
  }
  return combinations;
}

export function standardCase(input: string)
{
  var combinations: string[] = [];
  combinations.push(input.toLowerCase());
  combinations.push(input.toUpperCase());
  combinations.push(input.charAt(0).toUpperCase() + arrayFromString(input.toLowerCase()).slice(1).join(""));
  return combinations;
}
export function readToml(filePath: string)
{
  if (!filePath || filePath === "undefined")
    return 0;

  return toml.parse(fs.readFileSync(filePath, 'utf-8').replace(/\{[\s]+/g, "{").replace(/[\s]+\}/g, "}"));
}
export class directoryTreeHelper
{
  public pathList: string[] = [];
  public traversePath(searchPath: string, recursive: boolean): void
  {
    fs.readdirSync(searchPath).forEach(fileName =>
    {
      const filePath = path.join(searchPath, fileName);

      if (fs.lstatSync(filePath).isDirectory())
      {
        this.pathList.push(filePath);
        if (recursive)
        {
          this.traversePath(filePath, recursive);
        }
      } else
      {
        this.pathList.push(filePath);
      }
    });
  }
}
export function directoryTree(searchPath: string, recursive: boolean = false): string[]
{
  const dt = new directoryTreeHelper;
  dt.traversePath(searchPath, recursive);
  return dt.pathList;
}
export function slashType(filePath: string = ""): string
{
  if (filePath.includes("\\"))
  {
    return "\\";
  } else
  {
    return "/";
  }
}
export function pathType(filePath: string): string
{
  const slashChar = slashType(filePath);

  if
    ((slashChar === "/" && filePath.indexOf("/") === 0)
    ||
    (slashChar === "\\" && filePath.indexOf(":") === 1))
  {
    return "absolute"
  }

  if (filePath.indexOf(".." + slashChar) === 0)
  {
    return "back";
  }

  if (filePath.indexOf("." + slashChar) === 0)
  {
    return "fixed"
  }

  return "relative";
}
export function absolutePath(rawPath: string, rootPath: string): string
{
  var realPath;
  if (!(path.resolve(rawPath) === path.normalize(rawPath)))
  {
    realPath = path.join(rootPath, rawPath);
  }
  else
  {
    realPath = rawPath;
  }
  return realPath;
}
export function parentPaths(pathList)
{
  return pathList
    .sort((a, b) => a.length - b.length)
    .reduce((r, s) =>
    {
      if (!r.some(t => s.startsWith(t))) r.push(s);
      return r;
    }, []);
}
export function findDirs(dirName: string = "", rootPath: string = ""): string[]
{
  var res: string[] = [];
  const dt: string[] = directoryTree(rootPath, true);
  dt.forEach(dir =>
  {
    if (fs.existsSync(dir))
    {
      if (fs.lstatSync(dir).isDirectory())
      {
        var segments = dir.split(rootPath)[1].split(slashType(rootPath));
        segments.forEach(segment =>
        {
          if (segment === dirName)
          {
            res.pushUnique(dir);
          }
        });
      }
    }
  });
  return parentPaths(res);
}

export function findFiles(fileName: string = "", rootPath: string = ""): string[]
{
  var res: string[] = [];
  const dt: string[] = directoryTree(rootPath, true);
  dt.forEach(filePath =>
  {
    if (fs.existsSync(filePath))
    {
      if (fs.lstatSync(filePath).isFile())
      {
        var segment = filePath.split(rootPath)[1].split(slashType(rootPath)).slice(-1)[0];
        if (segment === fileName)
        {
          res.pushUnique(filePath);
        }
      }
    }
  });
  return res;
}

export function collectPaths(pathList: string[], rootPath: string, globalScope: boolean): string[]
{
  var res: string[] = [];
  pathList.filter(rawPath =>
  {
    if (isValue(pathType(rawPath), ["back"]))
    {
      if (globalScope === true)
      {
        res.push(path.join(rootPath, rawPath));
      }
      else
      {
        exit("ERROR " + rawPath + " is not a valid path format.\n"
          + "Path is already not included in the search path.");
      }
    }
    else if (isValue(pathType(rawPath), ["fixed"]))
    {
      res.push(path.join(rootPath, rawPath));
    }
    else if (isValue(pathType(rawPath), ["relative"]))
    {
      if (rawPath.split(slashType(rawPath)).length <= 2)
      {
        res = res.concat(findDirs(rawPath.split(slashType(rawPath))[0], rootPath));

        if (!(rawPath.split(slashType(rawPath)).slice(-1)[0] === ""))
        {
          res = res.concat(findFiles(rawPath, rootPath));
        }
      }
      else
      {
        exit("ERROR " + rawPath + " is an invalid path format");
      }
    }
    else if (isValue(pathType(rawPath), ["absolute"]))
    {
      res.push(rawPath);
    }
  });

  return res;
}
export function caseInsensitiveRegex(word: string): string
{
  var letters: string[] = word.toLowerCase().split("");
  var lettersCased: string = "";
  letters.forEach(letter =>
  {
    lettersCased += "[" + letter.toUpperCase() + letter + "]";
  });
  return ("/" + lettersCased + "/");
}
export function getInclusions(rootPath: string, exclusions: string[]): string[]
{
  var bad: string[] = [];
  var dt: string[] = directoryTree(rootPath, true);
  dt.forEach(filePath =>
  {
    exclusions.forEach(exclusion =>
    {
      if (filePath.includes(exclusion))
      {
        bad.push(filePath);
      }
    });
  });
  bad.forEach(element =>
  {
    dt.splice(dt.indexOf(element), 1);
  });
  return dt;
}

export function searchInFiles(searchValue: string, filesList: string[], type: string = ""): string[]
{
  var ret: string[] = [];
  filesList.forEach(filePath =>
  {
    if (fs.existsSync(filePath))
    {
      if (fs.lstatSync(filePath).isFile())
      {
        var _searchValue;
        if(isValue(type, ["r"]))
        {
          _searchValue = new RegExp(eval(searchValue));
        }
        else if(isValue(type, ["i"]))
        {
          _searchValue = new RegExp(searchValue, "i");
        }
        else
        {
          _searchValue = searchValue;
        }

        var content = fs.readFileSync(filePath, 'utf-8');
        if (content.search(_searchValue) !== -1)
        {
          ret.push(filePath);
        }
      }
    }
  });
  return ret;
}