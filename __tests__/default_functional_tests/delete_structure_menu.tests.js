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
    // slowMo: 120,
    // args: ['--window-size=1920,1080', '--disable-web-security']

    // for online testing (only ever commit these)
    headless: "new",
    slowMo: 60,
    args: ['--disable-web-security', '--no-sandbox']
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


describe('testing delete structure menu', () => {

  // tests for deletion structure (need to start with data to delete)
  test('delete verse 1', async () => {
    // load data
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.3"><ab n="John.3.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.3.2"><w>second</w><w>verse</w></ab><ab n="John.3.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.3.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);
    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input[value="John.1.1"]');
    await menuFrame.click('input#insert');

    const htmlData = await page.evaluate(`getData()`);
    expect(htmlData).toBe('<span class=\"book_number mceNonEditable\" wce=\"__t=book_number\" id=\"1\">John</span> <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"2\">1</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"3\">2</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"4\">3</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">4</span> fourth verse');
    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.2"><w>second</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.3"><ab n="John.3.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.3.2"><w>second</w><w>verse</w></ab><ab n="John.3.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.3.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail);

  }, 200000);

  test('delete verse 2', async () => {
    // load data
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.3"><ab n="John.3.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.3.2"><w>second</w><w>verse</w></ab><ab n="John.3.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.3.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);
    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input[value="John.1.2"]');
    await menuFrame.click('input#insert');

    const htmlData = await page.evaluate(`getData()`);
    expect(htmlData).toBe('<span class=\"book_number mceNonEditable\" wce=\"__t=book_number\" id=\"1\">John</span> <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"2\">1</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"3\">2</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"4\">3</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">4</span> fourth verse');
    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.3"><ab n="John.3.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.3.2"><w>second</w><w>verse</w></ab><ab n="John.3.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.3.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail);

  }, 200000);

  test('delete verse 3', async () => {
    // load data
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.3"><ab n="John.3.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.3.2"><w>second</w><w>verse</w></ab><ab n="John.3.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.3.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);
    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input[value="John.1.3"]');
    await menuFrame.click('input#insert');

    const htmlData = await page.evaluate(`getData()`);
    expect(htmlData).toBe('<span class=\"book_number mceNonEditable\" wce=\"__t=book_number\" id=\"1\">John</span> <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"2\">1</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"3\">2</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"4\">3</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">4</span> fourth verse');
    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.3"><ab n="John.3.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.3.2"><w>second</w><w>verse</w></ab><ab n="John.3.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.3.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail);

  }, 200000);

  // NB chapter reference only is deleted not the verses in it
  test('delete chapter 2', async () => {
    // load data
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.3"><ab n="John.3.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.3.2"><w>second</w><w>verse</w></ab><ab n="John.3.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.3.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);
    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input#deleteChapterRadio');
    await menuFrame.click('input[value="John.2"]');
    await menuFrame.click('input#insert');

    const htmlData = await page.evaluate(`getData()`);
    expect(htmlData).toBe('<span class=\"book_number mceNonEditable\" wce=\"__t=book_number\" id=\"1\">John</span> <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"2\">1</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"4\">3</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">4</span> fourth verse');
    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.3"><ab n="John.3.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.3.2"><w>second</w><w>verse</w></ab><ab n="John.3.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.3.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail);

  }, 200000);

  // NB deleting the book just deletes the reference and leaves all the content such as chapters and verses
  test('delete book', async () => {
    // load data
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.3"><ab n="John.3.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.3.2"><w>second</w><w>verse</w></ab><ab n="John.3.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.3.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);
    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input#deleteBookRadio');
    await menuFrame.click('input[value="John"]');
    await menuFrame.click('input#insert');

    const htmlData = await page.evaluate(`getData()`);
    expect(htmlData).toBe('<span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"2\">1</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"3\">2</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"chapter_number mceNonEditable\" wce=\"__t=chapter_number\" id=\"4\">3</span> <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">1</span> first verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">2</span> second verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">3</span> third verse <span class=\"verse_number mceNonEditable\" wce=\"__t=verse_number\">4</span> fourth verse');
    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type=\"chapter\" n=\".1\"><ab n=\".1.1\"><w>first</w><w>verse</w></ab><ab n=\".1.2\"><w>second</w><w>verse</w></ab><ab n=\".1.3\"><w>third</w><w>verse</w></ab></div><div type=\"chapter\" n=\".2\"><ab n=\".2.1\"><w>first</w><w>verse</w></ab><ab n=\".2.2\"><w>second</w><w>verse</w></ab><ab n=\".2.3\"><w>third</w><w>verse</w></ab></div><div type=\"chapter\" n=\".3\"><ab n=\".3.1\"><w>first</w><w>verse</w></ab><ab n=\".3.2\"><w>second</w><w>verse</w></ab><ab n=\".3.3\"><w>third</w><w>verse</w></ab><ab n=\".3.4\"><w>fourth</w><w>verse</w></ab></div>' + xmlTail);

  }, 200000);

  // tests for when there are multiple verses (consecutive - has always worked, and non-consecutive - fixed Nov 22)

  test('delete the first instance of a duplicate verse', async () => {
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w><w>again</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.1"><ab n="John.1.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.1.2"><w>second</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.1.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);

    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input[value="John.1.3"]');
    await menuFrame.click('input#insert');

    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w><w>again</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.1"><ab n="John.1.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.1.2"><w>second</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.1.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail);
  });

  test('delete the second instance of a duplicate verse', async () => {
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w><w>again</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.1"><ab n="John.1.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.1.2"><w>second</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.1.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);

    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input[value="John.1.3-a"]');
    await menuFrame.click('input#insert');

    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.1"><ab n="John.1.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.1.2"><w>second</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.1.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail);
  });

  test('delete the third instance of a duplicate verse', async () => {
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w><w>again</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.1"><ab n="John.1.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.1.2"><w>second</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.1.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);

    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input[value="John.1.3-b"]');
    await menuFrame.click('input#insert');

    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w><w>again</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.1"><ab n="John.1.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail);
  });

  // NB if you delete the first chapter of the book then all of the verses remain in the OTE at the start but are appended
  // to the XML after the book has closed with no book or chapter reference in the n attribute (because they are structurally in neither in the XML)
  // not neessarily desired behaviour but this is what the test assumes.
  test('delete the first instance of a duplicate chapter', async () => {
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w><w>again</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.1"><ab n="John.1.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.1.2"><w>second</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.1.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);

    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input#deleteChapterRadio');
    // NB this has to be selected on id because in the nondefault version the value will be the same for both
    await menuFrame.click('input[id="2"]');
    await menuFrame.click('input#insert');

    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type="book" n="John">' +
    '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
    '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
    '<div type="chapter" n="John.1"><ab n="John.1.1"><w>first</w><w>verse</w></ab>' +
    '<ab n="John.1.2"><w>second</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab>' +
    '<ab n="John.1.4"><w>fourth</w><w>verse</w></ab></div></div>' +
    '<ab n="John..1"><w>first</w><w>verse</w></ab><ab n="John..2"><w>second</w><w>verse</w></ab><ab n="John..3"><w>third</w><w>verse</w></ab><ab n="John..3"><w>third</w><w>verse</w><w>again</w></ab>' + xmlTail);
  });

  test('delete the second instance of a duplicate chapter', async () => {
    const data = xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
      '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
      '<ab n="John.1.3"><w>third</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w><w>again</w></ab></div>' +
      '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab></div>' +
      '<div type="chapter" n="John.1"><ab n="John.1.1"><w>first</w><w>verse</w></ab>' +
      '<ab n="John.1.2"><w>second</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w></ab>' +
      '<ab n="John.1.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail;
    await page.evaluate(`setTEI('${data}');`);

    await page.click('button#mceu_18-open');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const menuFrameHandle = await page.$('div[id="mceu_39"] > div > div > iframe');
    const menuFrame = await menuFrameHandle.contentFrame();
    await menuFrame.click('input#deleteChapterRadio');
    // NB this has to be selected on id because in the nondefault version the value will be the same for both
    await menuFrame.click('input[id="4"]');
    await menuFrame.click('input#insert');

    const xmlData = await page.evaluate(`getTEI()`);
    expect(xmlData).toBe(xmlHead + '<div type="book" n="John"><div type="chapter" n="John.1">' +
    '<ab n="John.1.1"><w>first</w><w>verse</w></ab><ab n="John.1.2"><w>second</w><w>verse</w></ab>' +
    '<ab n="John.1.3"><w>third</w><w>verse</w></ab><ab n="John.1.3"><w>third</w><w>verse</w><w>again</w></ab></div>' +
    '<div type="chapter" n="John.2"><ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
    '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab>' +
    '<ab n="John.2.1"><w>first</w><w>verse</w></ab>' +
    '<ab n="John.2.2"><w>second</w><w>verse</w></ab><ab n="John.2.3"><w>third</w><w>verse</w></ab>' +
    '<ab n="John.2.4"><w>fourth</w><w>verse</w></ab></div></div>' + xmlTail);
  });

});
