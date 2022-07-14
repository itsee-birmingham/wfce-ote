/**
 * @jest-environment jsdom
 */
jest.setTimeout(200000);
const fs = require('fs');
const jsdom = require("jsdom");

// we supply our own virtualConsole here so we can skip "unimplemented" jsdom errors for things like window.focus
const virtualConsole = new jsdom.VirtualConsole();

// you can forward all to node console
virtualConsole.sendTo(console, { omitJSDOMErrors : true });

const { JSDOM } = jsdom;

// directory path
const dir = './__tests__/data_files/';

let xmlData;

beforeAll(async () => {
    xmlData = new Map();
    const filenames = await fs.promises.readdir(dir);
    const expectedHeader = '<TEI><teiHeader></teiHeader>';
    for (let file of filenames) {
        let data = await fs.promises.readFile(dir + file);
        // remove unnecessary spaces from the data files
        data = data.toString().replace(/\n/g, '').replace(/\s+/g, ' ').replace(/> </g, '><').replace(/" >/g, '">');
        // remove the sigla from breaks
        data = data.replace(/-(P|L)?\d+S?"/g, '-"');
        // remove the sigla from the notes (why is it even here!)
        data = data.replace(/-(P|L)?\d+S?-/g, '--');
        // uncollapse empty readings
        data = data.replace(/<rdg ([^>]+)\/>/g, '<rdg $1></rdg>')
        // remove the header
        header = data.substring(0, data.indexOf('</teiHeader>') + 12);
        data = String(data.replace(header, expectedHeader));
        // remove the language declaration
        data = data.replace(/<text xml:lang="\S+">/, '<text>');      
        xmlData.set(file, data);   
    } 
});

// first test is simply to see if we can create our dom with a tinymce object and our plugin
test('initiate tinymce', done => {
	JSDOM.fromFile('wce-ote/index.html', {
		virtualConsole : virtualConsole,
		runScripts     : 'dangerously',
		resources      : 'usable'
	}).then(dom => {
		dom.window.onModulesLoaded = () => {
			// if we were successful, let's save our dom to the outer testDOM for subsequent tests
			testDOM = dom;
			done();
		};
	});
});

test('xml files', () => {
    for (const [key, value] of xmlData.entries()) {
        testInput = value;
        expectedOutput = value;
        testDOM.window.eval(`setTEI('${testInput}');`);
        tei = testDOM.window.eval(`getTEI();`);
        // we need to run this on the result because the numbers get taken out of the note xml:ids in the remove sigla regex above
        tei = tei.replace(/-(P|L)?\d+S?"/g, '-"');
        header = tei.substring(0, tei.indexOf('</teiHeader>') + 12); 
        tei = String(tei.replace(header, '<TEI><teiHeader></teiHeader>'));
        expect(tei).toBe(expectedOutput);
    }
});
