const fs = require('fs');
const path = require('path');

// const {Ast, Plugin} = require('ast-plugin');

const unified = require('unified');
const markdown = require('remark-parse');
const markdownstringify = require('remark-stringify');
const removePosition = require('unist-util-remove-position');
const visit = require('unist-util-visit-parents');

/*class TestPlugin extends Plugin {

    pre() {
    }

    visitor() {
        return {
            // process node with type = 'text'
            text: ast => {
                console.log(ast.node);
                // ast.segment();
            },
        };
    }

    post() {
    }
}*/

let oldContent = fs.readFileSync(path.join(__dirname, '../_sidebar.md'), 'utf-8');

const tree = unified().use(markdown).parse(oldContent);


// const tree = markdown.parse(oldContent);

// add({type: 'text', value: 'foo'})
// tree.add();
/*new Ast(tree).traverse([
    new TestPlugin({}),
    // ...
]);*/

// console.log(tree)

removePosition(tree, true);

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

visit(tree, 'listItem',
    function visitor(listItemNode, ancestors) {
        const {url, text} = GetListItemLinkTitleAndUrl(listItemNode);
        if (text === '后端') {
            debugger
        }
    }
);

console.dir(tree, {depth: null});

let newheading = {
    type: 'listItem',
    spread: false,
    checked: null,
    children:
        [{
            type: 'paragraph',
            children:
                [{
                    type: 'link',
                    title: null,
                    url: '测试/readme',
                    children: [{type: 'text', value: '测试'}]
                }]
        }]
};

tree.children.push(newheading);

let stringify = unified().use(markdownstringify).stringify(tree);
// console.log(stringify)
