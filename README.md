# Mass Replace

Mass search and replace utility using a TOML file.

## Installation

Globally
````
npm i -g massreplace
````

Or locally
````
npm i -D massreplace
````

## Usage

Create a TOML file anywhere, idealy in the root directory of your workspace or repository, specify the replacement targets and using the CLI, run

````(bash)
massreplace /path/to/file.toml
````

By default, the utility will look for a TOML file saved as `replace.toml` in the directory in which you run the command `massreplace` without specifying a file path.

### Example `replace.toml`

````(toml)
targets = [
  {
    search = "Foo", replacement = "bar", case = "o", path = "./", ignore = ["lib/"], recursive = true, global = true
  }
]
ignore = [
    "node_modules/"
]
````

### Interface

````()
targets: [array of objects] each of which defines a search and replace target.

    search: [string] defines the target search string.

    replacement: [string] defines the replacement string.

    case: [string = strict] defines the case-sensitivity rule.
        Each option can be set either by the full option name or the shortcut.
        - open: ('o')
            Performs a case-insensitive string search.
        - strict: ('s')
            Performs a case-sensitive string search.
        - conservative: ('c')
            Performs a standard-case string search.
            e.g. Would search for "Foo", "FOO" and "foo"
                 and replace with the defined replacement string.
        - preservative: ('p')
            Perfroms a standard-case string search and preserves the case of each replacement match.
            e.g. Would search for "Foo", "FOO" and "foo"
                 and replace with "Bar", "BAR" or "bar" accordingly.

    path: [string] defines the root search path for the target.

    recursive: [boolean = true] defines wether or not to search recursively.

    ignore: [array of strings] each of which defines a path to exclude locally.

    global: [boolean = false] if set, the target will inheret globally ignored paths.

ignore: [array of strings] each of which defines a path to exclude globally.
````

### `ignore` path rules

* Any valid absolute or a relative path can be specified in the `ignore` array.
* POSIX and Windows path types are both supported and are interchangable.
* If a file name is specified, all matching files and directories will be ignored.
* If a file name followed by a forward slash or an escaped backslash is specified, only matching directories will be ignored.