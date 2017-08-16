'use strict';

import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';

String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// assets folders
var COMPONENT_DIR = path.join(__dirname, 'assets/components/');
var rl = createInterface(process.stdin, process.stdout);
var counter = 1;

// default content for files
var fileSources = {
    jade: `mixin {blockName}()\n    .{blockName}\n        .{blockName}__`,
    styl: `.{blockName}\n  display block\n  `,
    js: `var {jsModuleName} = (function () {

    function init() {
        
    }

    return {
        init: function () {
            console.log('{jsModuleName}.init');
            init();
        }
    };

})();`
};

// get arguments
var blockName = process.argv[2];
var isJsFileMustBeCreated = process.argv[3] === 'js';
var jsModuleName = process.argv[4];
var folderType = blockName.split('-')[0];
var folderName = (function () {
    switch (folderType) {
        case 'a':
            fileSources.jade = `mixin {blockName}()\n    a.{blockName}(href='#')`;
            return 'a';
        case 'b':
            return 'blocks';
        case 's':
            fileSources.jade = `mixin {blockName}()\n    section.{blockName}\n        .container`;
            return 'sections';
        case 'modal':
            fileSources.jade = `mixin {blockName}()\n    section.modal-default.{blockName}\n        .modal-default__inner.{blockName}__inner\n            button.modal-default__close.{blockName}__close(type="button")`;
            return 'modal';
        case 'btn':
            fileSources.jade = `mixin {blockName}()\n    button.{blockName}(type="button")`;
            return 'buttons';
        case 'pr':
            return 'previews';
        case 'f':
            fileSources.jade = `mixin {blockName}()\n    form.{blockName}.f-default\n        .f-default__row\n            input.f-default__field(type='text' name='' placeholder='')`;
            return 'forms';
        case 'l':
            fileSources.jade = `mixin {blockName}()\n    ul.{blockName}(role='list')\n        li.{blockName}__item`;
            return 'lists';
        case 'sl':
            fileSources.jade = `mixin {blockName}()\n    .{blockName}\n        .{blockName}__item`;
            return 'sliders';
        case 'm':
            fileSources.jade = `mixin {blockName}()\n    ul.{blockName}(role='navigation')\n        li.{blockName}__item\n            a.{blockName}__link(href='#') `;
            return 'menus';
        case 'i':
            fileSources.jade = `mixin {blockName}()\n    a.{blockName}(href='#')`;
            return 'i';
        case 't':
            return 'tables';
        default:
            console.log('Update script or create folder');
            rl.close();
    }
})();

function readWriteAsync(folderName, blockName) {
    fs.readFile('assets/common/jade/mixins/' + folderName + '.jade', 'utf-8', function (err, data) {
        if (err) {throw err; }
        var newValue = data + '\ninclude ' + '../../../components/' + folderName + '/' + blockName + '/' + blockName;
        fs.writeFile('assets/common/jade/mixins/' + folderName + '.jade', newValue, 'utf-8', function (err) {
            if (err) {throw err; }
            console.log(counter + '. Jade mixin file updated');
            counter++;
        });
    });
}

function isFileExist(folderName, blockName) {
    var promises = [];
    var filePath = COMPONENT_DIR + folderName + '\\' + blockName;
    Object.keys(fileSources).forEach(ext => {
        if (ext === 'jade') {
            filePath = filePath + '.jade';
        }
        if (ext === 'styl') {
            filePath = filePath + '.styl';
        }
        if (isJsFileMustBeCreated && ext === 'js') {
            filePath = filePath + '.js';
        }
        if (ext !== 'js' || isJsFileMustBeCreated) {
            promises.push(
                new Promise((resolve, reject) => {
                    fs.stat(filePath, function (err, stat) {
                        if (err === null) {
                            console.log(counter + '. WARNING: ' + ext.capitalizeFirstLetter() + ' file already exists!');
                            counter++;
                            rl.close();
                        } else {
                            console.log(counter + '. ' + ext.capitalizeFirstLetter() + ' file not exists');
                            counter++;
                            resolve();
                        }
                    });
                })
            );
        }
    });
    return Promise.all(promises);
}

function createDir(blockPath) {
    return new Promise((resolve, reject) => {
        fs.mkdir(blockPath, err => {
            if (err) {
                reject(`WARNING: Failed to create a folder '${blockPath}'`);
            } else {
                resolve();
            }
        });
    });
}

function createFiles(folderName, blockName) {
    var promises = [];
    var blockPath = COMPONENT_DIR + folderName + `/${blockName}`;
    createDir(blockPath);
    Object.keys(fileSources).forEach(ext => {
        var fileSource = fileSources[ext].replace(/\{blockName}/g, blockName);
        if (ext === 'js' && jsModuleName) {
            fileSource = fileSources[ext].replace(/\{jsModuleName}/g, jsModuleName);
        }
        var filename = `${blockName}.${ext}`;
        var filePath = path.join(blockPath, filename);
        if (ext !== 'js' || isJsFileMustBeCreated) {
            promises.push(
                new Promise((resolve, reject) => {
                    fs.writeFile(filePath, fileSource, 'utf8', err => {
                        if (err) {
                            reject(`WARNING: Failed to create a file '${filePath}'`);
                        } else {
                            resolve();
                        }
                    });
                })
            );
        }
    });
    readWriteAsync(folderName, blockName);
    return Promise.all(promises);
}

function initMakeBlock(blockName, folderName) {
    return isFileExist(folderName, blockName)
        .then(() => createFiles(folderName, blockName))
        .then(() => {
            console.log(counter + '. ' + blockName + ' files created');
            counter++;
            rl.close();
        });
}

if (blockName !== '') {
    initMakeBlock(blockName, folderName).catch(function printErrorMessage(errText) {
        console.log(errText);
        rl.close();
    });
}

// API
// npm run c name-block

// EXAMPLES
// npm run c l-reviews
// npm run c f-contact js
// npm run c b-slider js Slider

// todo добавить проверку наличия папки назначения, тогда не нужен будет isFileExist()
// todo чистить от temp.*, только проверить что на производительность не влияет
// todo когда перейду на >=6 ноду избавиться от бабеля
