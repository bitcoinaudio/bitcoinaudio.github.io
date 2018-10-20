# polymer

Pre-processor system for automatic template compiling.

## Usage

    var polymer = require('polymer')
    var poly    = polymer.root('path/to/project')

    project.render('index.jade', function(error, body){
      console.log(body)
    })