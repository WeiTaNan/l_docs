const fs = require('fs');
const path = require('path');

const allow_fmts = ['md'];

const root = path.join(__dirname, '../');

// 重复字符串
function repeat(str, num) {
    return new Array(num + 1).join(str);
}


function strStr(haystack, needle) {
    if (haystack === needle || needle === "") {
        return 0;
    }
    var arrn = needle.split("");
    var len = needle.length;
    var newstr = "";
    for (let i = 0; i < haystack.length; i++) {
        if (haystack[i] === arrn[0]) {
            let ii = parseInt(i);
            newstr = haystack.substr(ii, len);
            if (newstr === needle) {
                return ii;
            }
        }
    }
    return -1;
}

function loopDir(rootPath, callback) {

    function readDirSync(targetPath, level) {
        let reads = fs.readdirSync(targetPath);
        let dirs = [];

        // 先处理当前目录文件
        reads.forEach(function (filename, index) {
            let fullpath = path.join(targetPath, filename);
            const info = fs.statSync(fullpath);
            if (info.isDirectory()) {
                dirs.push({fullpath, filename})
            } else {
                let ext = filename.split('.')[1]; // 后缀
                if (allow_fmts.includes(ext)) {
                    if (!filename.startsWith('.') && !filename.startsWith('_')) {
                        console.log('文件: ' + filename);
                        callback('file', {
                            path: targetPath,
                            filename: filename,
                            level: level
                        });
                    }
                }
            }
        });

        // 后进入目录
        dirs.forEach(({fullpath, filename}) => {
            if (!filename.startsWith('.') && !filename.startsWith('_')) {
                console.log('目录: ' + filename);
                callback('dir', {
                    path: fullpath,
                    level: level
                });
                readDirSync(fullpath, level + 1);
            }
        })

    }

    readDirSync(rootPath, 0);

    // 临时性进行排序
    /*files = files.sort(function (a, b) {
        function getInt(str) {
            return parseInt(str.replace(/[^0-9]/ig, ''))
        }

        let intA = getInt(a.filename);
        let intB = getInt(b.filename);
        if (intA < intB) {
            return -1
        } else if (intA > intB) {
            return 1
        } else {
            return 0
        }
    })*/
}

let oldContent = fs.readFileSync(path.join(__dirname, '../_sidebar.md'), 'utf-8');
let tempContent = '';
let tempPos = [0, 0];
let tempLevel = -1;

// 从外层到内层
let files = loopDir(root, function (type, info) {

    let level = info.level;
    if (type === 'dir' && !info.path.startsWith('.')) {

        function findInContent(content, level, name){
            let tofind = repeat('  ', level) + '* ' + '[' + name + ']';
            let indexOf = oldContent.indexOf(tofind);
        }

        if (tempContent !== '') {
            oldContent = oldContent.substring(0, tempPos[0]) + tempContent + oldContent.substring(tempPos[1]);
        }

        let dirpath = info.path;
        let relativePath = info.path.replace(root, '');
        let dirs = relativePath.split(path.sep);
        let last = dirs[dirs.length - 1];
        let tofind = repeat('  ', level) + '* ' + '[' + last + ']';
        let indexOf = oldContent.indexOf(tofind);

        if (indexOf < 0) {
            // 找不到，要添加

            // 先找到它的父级, 再添加
            if (dirs.length > 2) {
                let last2 = dirs[dirs.length - 2];
                let tofind = repeat('  ', level) + '* ' + '[' + last2 + ']';
                let indexOf = oldContent.indexOf(tofind);

            } else {
                // 根目录下的一级目录

            }

        } else{

            // 找到了


        }

        if (tempLevel < level) {
            // 子目录, 在tempContent中寻找
        } else {
            // 跳出子目录了，在oldContent中寻找
        }
        tempContent = tempContent + '\r\n' + tofind;

        // 确定block的位置(更新tempContent变量)
        if (level > 1) {
            let tofind2 = repeat('  ', level - 1) + '* ';
            let tofind3 = repeat('  ', level - 2) + '* ';
            tempPos[0] = oldContent.indexOf(tofind);
            let findIndex2 = oldContent.substring(tempPos[0] + tofind.length).indexOf(tofind2);
            let findIndex3 = oldContent.substring(tempPos[0] + tofind.length).indexOf(tofind3);
            if (findIndex2 > 0 && !(findIndex3 > 0 && findIndex3 < findIndex2)) {
                // 找到父级的下级
                tempPos[1] = (tempPos[0] + tofind.length) + findIndex2;
            } else {
                tempPos[1] = (tempPos[0] + tofind.length) //oldContent.length;
            }
        } else {
            // 就是下一个根目录之间了
            tempPos[0] = oldContent.indexOf(tofind);
            let findIndex2 = oldContent.substring(tempPos[0] + tofind.length).indexOf('* ');
            if (findIndex2 > 0) {
                // 找到父级的下级
                tempPos[1] = (tempPos[0] + tofind.length) + findIndex2;
            } else {
                tempPos[1] = oldContent.length;
            }
        }
        tempLevel = level;
        tempContent = oldContent.substring(tempPos[0], tempPos[1]);

    } else if (type === 'file' && !info.filename.startsWith('_')) {
        let titleName = info.filename;
        if (titleName === 'README.md') {
            titleName = '首页';
        }
        titleName = titleName.replace('.md', '');
        let tofind = repeat('  ', level) + '* ' + '[' + titleName + ']';
        if (info.path === root) {
            // 位于根目录的markdown文件
            let indexOf = oldContent.indexOf(tofind);
            if (indexOf < 0) {
                oldContent = oldContent + '\r\n' + tofind;
            }
        } else {
            let indexOf = tempContent.indexOf(tofind);
            if (indexOf < 0) {
                tempContent = tempContent + '\r\n' + tofind;
            }
        }
    }
});

oldContent = oldContent.substring(0, tempPos[0]) + tempContent + oldContent.substring(tempPos[1])

fs.writeFileSync(path.join(__dirname, 'test.md'), oldContent);
/*let result = [];
let content = '';

files.forEach(info => {
    let filename = info.filename;
    let relativePath = info.path.replace(root, '');
    if (!filename.startsWith('_')) {
        console.log(relativePath, filename, info.level);
    }
});*/
