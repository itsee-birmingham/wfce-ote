const puppeteer = require('puppeteer');
const path = require('path');

let browser, page, frame;

// store the top and tail of the js so the tests can reuse and only focus on the content of the <body> tag
const xmlHead = '<?xml  version="1.0" encoding="utf-8"?><!DOCTYPE TEI [<!ENTITY om ""><!ENTITY lac ""><!ENTITY lacorom "">]>' +
  '<?xml-model href="TEI-NTMSS.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>' +
  '<TEI xmlns="http://www.tei-c.org/ns/1.0">' +
  '<teiHeader><fileDesc><titleStmt><title/></titleStmt>' +
  '<publicationStmt><publisher/></publicationStmt>' +
  '<sourceDesc><msDesc><msIdentifier></msIdentifier></msDesc></sourceDesc>' +
  '</fileDesc></teiHeader><text><body>';
const xmlTail = '</body></text></TEI>';

jest.setTimeout(5000000);

beforeAll(async () => {
  browser = await puppeteer.launch({
    // for local testing
    // headless: false,
    // slowMo: 80,
    // args: ['--window-size=1920,1080', '--disable-web-security']

    // for online testing (only ever commit these)
    headless: true,
    slowMo: 60,
    args: ['--disable-web-security']
  });
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  let frameHandle;
  jest.setTimeout(5000000);
  page = await browser.newPage();
  // await page.goto(`file:${path.join(__dirname, '..', 'wce-ote', 'index.html')}`);
  await page.goto(`file:${path.join(__dirname, '../test_index_page.html')}`);
  await page.evaluate(`setWceEditor('wce_editor', {})`);
  page.waitForSelector("#wce_editor_ifr");
  frameHandle = null;
  while (frameHandle === null) {
    frameHandle = await page.$("iframe[id='wce_editor_ifr']");
  }
  frame = await frameHandle.contentFrame();

});

describe('testing unclear text functions', () => {

  test('whole word unclear with no reason', async () => {
    await frame.type('body#tinymce', 'my words');
    await page.keyboard.down('Shift');
    for (let i = 0; i < 'words'.length; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.up('Shift');
    // open D menu
    await page.click('button#mceu_12-open');
    // navigate submenu
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    // access menu window and make selection
    const menuFrameHandle = await page.$('div[id="mceu_40"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    // check nothing is selected (we have an option for that now)
    expect(await menuFrame.$eval('#unclear_text_reason', el => el.value)).toBe('');

    await menuFrame.click('input#insert');
    await page.waitForSelector('div[id="mceu_40"]', { hidden: true });

    const htmlData = await page.evaluate(`getData()`);
    expect(htmlData).toBe('my <span class=\"unclear\" wce_orig=\"words\" wce=\"__t=unclear&amp;__n=&amp;' +
      'help=Help&amp;unclear_text_reason=&amp;unclear_text_reason_other=\">' +
      '<span class=\"format_start mceNonEditable\">‹</span>ẉọṛḍṣ' +
      '<span class=\"format_end mceNonEditable\">›</span></span>');
    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<w>my</w><w><unclear>words</unclear></w>' + xmlTail);

    // check editing works
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.down('Shift');
    for (let i = 0; i < 'words'.length; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.up('Shift');

    // open D menu
    await page.click('button#mceu_12-open');
    // navigate submenu
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // access menu window and make selection
    const menuFrameHandle2 = await page.$('div[id="mceu_41"] > div > div > iframe');
    const menuFrame2 = await menuFrameHandle2.contentFrame();

    expect(await menuFrame2.$eval('#unclear_text_reason', el => el.value)).toBe('');
    expect(await menuFrame2.$eval('#unclear_text_reason_other', el => el.disabled)).toBe(true);
    await menuFrame2.click('input#insert');
    await page.waitForSelector('div[id="mceu_41"]', { hidden: true });

    const xmlData2 = await page.evaluate(`getTEI()`);
    expect(xmlData2).toBe(xmlHead + '<w>my</w><w><unclear>words</unclear></w>' + xmlTail);

    // check deleting works (text will still be highlighted)
    // open D menu
    await page.click('button#mceu_12-open');
    // navigate submenu
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const xmlData3 = await page.evaluate(`getTEI()`);
    expect(xmlData3).toBe(xmlHead + '<w>my</w><w>words</w>' + xmlTail);

  }, 200000);

  test('test capitals can be edited and deleted if setTEI is used', async () => {
    // await frame.type('body#tinymce', 'Initial capital');
    const data = xmlHead + '<w><hi rend="cap" height="3">I</hi>nitial</w><w>capital</w>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.down('Shift');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.up('Shift');

    // open O menu
    await page.click('button#mceu_13-open');
    // open abbreviation menu
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_41"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    // test that the height is prepopulated with the correct default value
    expect(await menuFrame.$eval('#capitals_height', el => el.value)).toBe('3');

    // insert and check the data
    await menuFrame.click('input#insert');
    await page.waitForSelector('div[id="mceu_41"]', { hidden: true });

    const htmlData = await page.evaluate(`getData()`);
    expect(htmlData).toBe('<span class="formatting_capitals" wce_orig="I" wce="__t=formatting_capitals&amp;__n=&amp;capitals_height=3"><span class="format_start mceNonEditable">‹</span>I<span class="format_end mceNonEditable">›</span></span>nitial capital');
    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<w><hi rend="cap" height="3">I</hi>nitial</w><w>capital</w>' + xmlTail);

    // test that the capitals can be deleted
    // the letter will still be highlighted
    // open O menu
    await page.click('button#mceu_13-open');
    // open abbreviation menu
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const xmlData3 = await page.evaluate(`getTEI()`);
    expect(xmlData3).toBe(xmlHead + '<w>Initial</w><w>capital</w>' + xmlTail);
  }, 200000);

});