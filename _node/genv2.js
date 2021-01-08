const fs = require('fs');
const path = require('path');

const unified = require('unified');
const markdown = require('remark-parse');
const markdownstringify = require('remark-stringify');
const removePosition = require('unist-util-remove-position');
const visit = require('unist-util-visit-parents');

const allow_fmts = ['md'];

const root = path.join(__dirname, '../');

// 递归遍历目录
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
            if (!filename.startsWith('.') && !filename.startsWith('_') && filename !== 'node_modules' && filename !== 'assets' && filename !== 'img') {
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

// 获取一个列表项的段落文本，如果是链接就获取它的url
function GetListItemLinkTitleAndUrl(node) {
    if (node.children.length > 0) {
        let firstChild = node.children[0];
        if (firstChild.type === 'paragraph' && firstChild.children.length > 0) {
            let paragraphChildNode = firstChild.children[0];
            if (paragraphChildNode.type === 'link') {
                let url = paragraphChildNode.url;
                let text = '';
                if (paragraphChildNode.children.length > 0) {
                    let textNode = paragraphChildNode.children[0];
                    if (textNode.type === 'text') {
                        text = textNode.value
                    }
                }
                return {url, text}
            } else if (paragraphChildNode.type === 'text') {
                return {url: '', text: paragraphChildNode.value}
            }
        }
    }
    return {};
}

// 创建一个list的节点
function createListNode(listItemNode) {
    let result = {
        "type": "list",
        "ordered": false,
        "start": null,
        "spread": false,
        children: []
    };
    if (listItemNode) {
        result.children.push(listItemNode);
    }
    return result;
}

// 创建一个listitem的节点
function createListItemNode(text, url) {
    let listitemNode = {
        type: 'listItem',
        spread: false,
        checked: null,
        children:
            [{
                type: 'paragraph',
                children:
                    []
            }]
    };

    if (url) {
        listitemNode.children[0].children.push({
            type: 'link',
            title: null,
            url: url,
            children: [{type: 'text', value: text}]
        })
    } else {
        listitemNode.children[0].children.push({
            type: "text",
            value: text
        })
    }

    return listitemNode;
}

let oldContent = fs.readFileSync(path.join(__dirname, '../_sidebar.md'), 'utf-8');
const tree = unified().use(markdown).parse(oldContent); // ast树
removePosition(tree, true); // 移除位置信息，方便调试

// 在md的ast树中寻找list目录结构如dirs的节点
function findDirInMd(dirs) {
    let targetDir = dirs[dirs.length - 1];
    let resultNode = null;

    function checkParent(ancestors) {
        let check = true;
        if (dirs.length > 1) {
            let j = 1;
            for (let i = dirs.length - 2; i >= 0; i--) {
                let dir = dirs[i];

                // listitem的一级父节点是list，二级父节点也就是list的父级
                let parentNode = ancestors[ancestors.length - 2 * j];

                let {text: textParent} = GetListItemLinkTitleAndUrl(parentNode);
                if (textParent !== dir) {
                    check = false;
                    break;
                }
                j++;
            }
        }
        return check;
    }

    visit(tree, 'listItem',
        function visitor(listItemNode, ancestors) {
            const {url, text} = GetListItemLinkTitleAndUrl(listItemNode);
            if (text === targetDir) {
                // 检验父级

                let checkParentSuccess = checkParent(ancestors);
                if (checkParentSuccess && !resultNode) { // 返回第一个
                    resultNode = listItemNode;
                }
            }
        }
    );
    return resultNode;
}

// 从外层到内层
let files = loopDir(root, function (type, info) {

    // 目录信息
    let dirpath = info.path;
    let relativePath = info.path.replace(root, '');
    let dirs = relativePath.split(path.sep);

    if (type === 'dir' && !info.path.startsWith('.')) {
        // 处理目录

        let dirNode = findDirInMd(dirs);
        if (!dirNode) {
            // 没有找到就新增

            // 父节点
            let parentNode;
            if (dirs.length > 1) {
                parentNode = findDirInMd(dirs.slice(0, dirs.length - 1));
            }else{
                parentNode = tree;
            }

            let parentChildList = parentNode.children.find(node => node.type === 'list');

            if (parentChildList) {
                let newNode = createListItemNode(dirs[dirs.length - 1]);
                parentChildList.children.push(newNode);
            } else {
                let newNode = createListNode(createListItemNode(dirs[dirs.length - 1]));
                parentNode.children.push(newNode);
            }
        }

    } else if (type === 'file' && !info.filename.startsWith('_')) {
        // 处理markdown文件

        // 标题
        let titleName = info.filename;
        if (titleName === 'README.md') {
            titleName = '首页';
        }
        titleName = titleName.replace('.md', '');

        //url
        let linkurl = dirs.join('/') + '/' + info.filename.replace('.md', '');

        let parentNode; // 目录节点
        if (relativePath === '') {
            parentNode = tree; // tree 也是root
        }else{
            parentNode = findDirInMd(dirs)
        }
        let parentChildList = parentNode.children.find(node => node.type === 'list');
        if (!parentChildList) {
            parentChildList = createListNode();
            parentNode.children.push(parentChildList);
        }
        let findFile = parentChildList.children.find(listItemNode => {
            const {url, text} = GetListItemLinkTitleAndUrl(listItemNode);
            // return text === titleName;
            return url === linkurl;
        });
        if (!findFile) {
            // 没有找到就新增
            parentChildList.children.push(createListItemNode(titleName, linkurl));
        }
    }
});

let stringify = unified().use(markdownstringify).stringify(tree);
console.log(stringify)

fs.writeFileSync(path.join(__dirname, '../_sidebar.md'), stringify);

