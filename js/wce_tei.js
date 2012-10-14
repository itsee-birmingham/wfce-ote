// setTEIXml
function setWceTei(inputString) {
	var $newDoc, $newRoot, $newRoot;

	var getHTML = function() {
		var $oldDoc = loadXMLString(inputString);
		var $oldRoot = $oldDoc.documentElement;

		$newDoc = loadXMLString("<TEMP></TEMP>");
		$newRoot = $newDoc.documentElement;

		var childList = $oldRoot.childNodes;
		for ( var i = 0, l = childList.length; i < l; i++) {
			var $c = childList[i];
			if (!$c) {
				continue;
			} else {
				readAllChildrenOfTeiNode($newRoot, $c);
			}
		}

		// DOM to String
		var str = xml2String($newRoot);
		if (!str)
			return '';

		return str;
	};

	/*
	 * �������нڵ㣬��ӵ��µĽڵ��� find all nodes of $node and change and add
	 */
	var readAllChildrenOfTeiNode = function($htmlParent, $teiNode) {
		if (!$teiNode) {
			return;
		}

		if ($teiNode.nodeType == 3) {
			Tei2Html_TEXT($htmlParent, $teiNode);
		} else if ($teiNode.nodeType == 1) {
			var $newParent = getHtmlNodeByTeiNode($htmlParent, $teiNode);

			// ֹͣ$teiNode����������
			if (!$newParent) {
				return;
			}

			var childList = $teiNode.childNodes;
			for ( var i = 0, l = childList.length; i < l; i++) {
				var $c = childList[i];
				if (!$c) {
					continue;
				} else {
					readAllChildrenOfTeiNode($newParent, $c);
				}
			}

			if ($teiNode.nodeName == 'w') {
				var $nextSibling = $teiNode.nextSibling;
				if ($nextSibling && $nextSibling.nodeName == 'note') {
					return;
				}
				var $lastChild = $teiNode.lastChild;
				if ($lastChild && $lastChild.nodeName == 'lb') {
					return;
				}
				nodeAddText($htmlParent, ' ');
			}
		}

	};

	/*
	 * @new parentNode @ oldNode
	 */
	var getHtmlNodeByTeiNode = function($htmlParent, $teiNode) {
		var teiNodeName = $teiNode.nodeName;

		// TODO: set wce_orig=""
		// TODO: <fw> after <pb>: <pb n="2" type="page" xml:id="P2-?" /><fw type="runTitle">rrrr</fw>

		switch (teiNodeName) {
		case 'w':
			return $htmlParent;// w

		case 'ex':
			return Tei2Html_ex($htmlParent, $teiNode);// ex

		case 'unclear':
			return Tei2Html_unclear($htmlParent, $teiNode); // unclear

		case 'div':
			return Tei2Html_div($htmlParent, $teiNode); // chapter, book

		case 'gap':
			return Tei2Html_gap_supplied($htmlParent, $teiNode, teiNodeName); // gap

		case 'supplied':
			return Tei2Html_gap_supplied($htmlParent, $teiNode, teiNodeName);// gap->supplied

		case 'abbr':
			return Tei2Html_abbr($htmlParent, $teiNode, teiNodeName); // abbreviation

		case 'comm':
			return Tei2Html_paratext($htmlParent, $teiNode, teiNodeName); // paratext

		case 'num':
			return Tei2Html_paratext($htmlParent, $teiNode, teiNodeName);// paratext

		case 'fw':
			return Tei2Html_paratext($htmlParent, $teiNode, teiNodeName);// paratext

		case 'ab':
			return Tei2Html_ab($htmlParent, $teiNode);// verse

		case 'pc':
			return Tei2Html_pc($htmlParent, $teiNode); // pc

		case 'hi':
			return Tei2Html_hi($htmlParent, $teiNode); // formatting

		case 'space':
			return Tei2Html_space($htmlParent, $teiNode); // spaces

		case 'lb':
			return Tei2Html_lb($htmlParent, $teiNode); // break

		case 'note':
			return Tei2Html_note($htmlParent, $teiNode); // note

		case 'app':
			return Tei2Html_app($htmlParent, $teiNode); // correction

		default:
			return $htmlParent;
		}

	};

	/*
	 * ����TEIԪ�ص����ԣ�����wceAttr��getֵ
	 * 
	 */
	var getWceAttributeByTei = function($teiNode, mapping) {
		var wceAttr = '';

		var attribute, attrName, attrValue, obj;
		for ( var i = 0, l = $teiNode.attributes.length; i < l; i++) {
			attribute = $teiNode.attributes[i];
			attrName = attribute.nodeName;
			attrValue = attribute.nodeValue;
			var obj = mapping[attrName];
			if (!obj) {
				continue;
			}

			if (typeof obj == 'string') {
				wceAttr += obj + attrValue;
			} else if (typeof obj == 'object') {
				if (obj['0'].indexOf('@' + attrValue) > -1) {
					wceAttr += obj['1'] + attrValue;
				} else {
					wceAttr += obj['2'] + attrValue;
				}
			}
		}

		return wceAttr;
	};

	/*
	 * �ı�
	 */
	var Tei2Html_TEXT = function($htmlParent, $teiNode) {
		var textValue = $teiNode.nodeValue;
		var oldNodeParentName = $teiNode.parentNode.nodeName;

		if (oldNodeParentName == 'ex') {
			// ex
			textValue = '(' + textValue + ')';
		} else if (oldNodeParentName == 'unclear') {
			// unclear
			var unclear_text = "";
			for ( var i = 0, l = textValue.length; i < l; i++) {
				var ch = textValue.charAt(i);
				if (ch == ' ') {
					unclear_text += ch;
				} else {
					unclear_text += ch + '\u0323';
				}
			}
			textValue = unclear_text;
		} else {
			textValue;
		}

		nodeAddText($htmlParent, textValue);
	};

	/*
	 * **** <ex>
	 */
	var Tei2Html_ex = function($htmlParent, $teiNode) {
		var $newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', 'part_abbr');
		$newNode.setAttribute('wce', '__t=part_abbr');
		$htmlParent.appendChild($newNode);
		return $newNode;
	};
	/*
	 * **** <unclear>
	 */
	var Tei2Html_unclear = function($htmlParent, $teiNode) {
		var $newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', 'unclear');
		$newNode.setAttribute('wce', '__t=unclear');
		$htmlParent.appendChild($newNode);
		return $newNode;
	};

	/*
	 * *** <div>
	 */
	var Tei2Html_div = function($htmlParent, $teiNode) {
		// <div type="chapter" n="1">
		var divType = $teiNode.getAttribute('type');
		if (!divType)
			return $htmlParent;

		if (divType == 'chapter') {
			var $newNode = $newDoc.createElement('span');
			$newNode.setAttribute('class', 'chapter_number');
			$newNode.setAttribute('wce', '__t=chapter_number');
			var nValue = $teiNode.getAttribute('n');
			if (nValue && nValue != '') {
				var indexK = nValue.indexOf('K');
				indexK++;
				if (indexK > 0 && indexK < nValue.length) {
					nValue = nValue.substr(indexK);
					nodeAddText($newNode, nValue);
				}
			}
			$htmlParent.appendChild($newNode);
			nodeAddText($htmlParent, ' ');
		}
		return $htmlParent;
	}

	/*
	 * <ab>
	 */
	var Tei2Html_ab = function($htmlParent, $teiNode) {
		var $newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', 'verse_number');
		$newNode.setAttribute('wce', '__t=verse_number');
		var nValue = $teiNode.getAttribute('n');
		if (nValue && nValue != '') {
			var indexV = nValue.indexOf('V');
			indexV++;
			if (indexV > 0 && indexV < nValue.length) {
				nValue = nValue.substr(indexV);
				nodeAddText($newNode, nValue);
			}
		}
		$htmlParent.appendChild($newNode);
		nodeAddText($htmlParent, ' ');
		return $htmlParent;
	};

	/*
	 * <pc>
	 */
	var Tei2Html_pc = function($htmlParent, $teiNode) {
		var $newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', 'pc');
		$newNode.setAttribute('wce', '__t=pc');
		$htmlParent.appendChild($newNode);
		nodeAddText($htmlParent, ' ');
		return $newNode;
	};

	/*
	 * <gap> / <supplied>
	 */
	var Tei2Html_gap_supplied = function($htmlParent, $teiNode, teiNodeName) {
		// <gap reason="lacuna" unit="char" />
		$newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', teiNodeName);

		var wceAttr = '__t=gap&__n=';
		var mapping = {
			'reason' : '&gap_reason=',
			'unit' : {
				'0' : '@char@line@page@quire',
				'1' : '&unit=',
				'2' : '&unit=other&unit_other='
			},
			'extent' : '&extent=',
			'source' : {
				'0' : '@na27@transcriber',
				'1' : '&supplied_source=',
				'2' : '&supplied_source=other&&supplied_source_other='
			}
		};
		wceAttr += getWceAttributeByTei($teiNode, mapping);
		$newNode.setAttribute('wce', wceAttr);

		if (wceAttr.indexOf('unit=char') > -1) {
			nodeAddText($newNode, '[]');
		} else if (wceAttr.indexOf('unit=line') > -1) {
			// TODO
		} else if (wceAttr.indexOf('unit=page') > -1) {
			// TODO
		} else if (wceAttr.indexOf('unit=quire') > -1) {
			// TODO
		} else {
			nodeAddText($newNode, '[...]');
		}
		$htmlParent.appendChild($newNode);
		return null;
	};

	/*
	 * <hi>
	 */
	var Tei2Html_hi = function($htmlParent, $teiNode) {
		var className;
		var $newNode = $newDoc.createElement('span');
		var rendValue = $teiNode.getAttribute('rend');
		if (!rendValue) {
			return null;
		}

		switch (rendValue) {
		case 'rubric':
			className = 'formatting_rubrication';
			break;
		case 'gold':
			className = 'formatting_gold';
			break;
		case 'blue':
			className = 'formatting_blue';
			break;
		case 'green':
			className = 'formatting_green';
			break;
		case 'yellow':
			className = 'formatting_yellow';
			break;
		case 'other':
			className = 'formatting_other';
			break;
		case 'cap':
			className = 'formatting_capitals';
			break;
		case 'ol':
			className = 'formatting_overline';
			break;
		}
		if (!className)
			return null;

		$newNode.setAttribute('class', className);
		$newNode.setAttribute('wce', '__t=' + className);
		$htmlParent.appendChild($newNode);
		return $newNode;
	};

	/*
	 * <abbr> /
	 */
	var Tei2Html_abbr = function($htmlParent, $teiNode, teiNodeName) {
		$newNode = $newDoc.createElement('span');

		// <abbr type="nomSac"> <hi rend="ol">aaa</hi> </abbr>
		// <span class="abbr_add_overline"
		// wce_orig="aaa" wce="__t=abbr&amp;__n=&amp;original_abbr_text=&amp;abbr_type=nomSac&amp;abbr_type_other=&amp;add_overline=overline">aaa</span>
		var cList = $teiNode.childNodes;
		var className = teiNodeName;

		var overlineCheckboxValue = '';

		var wceAttr = '__t=abbr&__n=';
		var mapping = {
			'type' : {
				'0' : '@nomSac@numeral',
				'1' : '&abbr_type=',
				'2' : '&abbr_type=other&abbr_type_other='
			}
		};

		for ( var i = 0, l = cList.length; i < l; i++) {
			var c = cList[i];
			if (c.nodeName == 'hi') {
				className = 'abbr_add_overline';
				wceAttr += '&add_overline=overline'
				break;
			}
		}

		$newNode.setAttribute('class', className);

		wceAttr += getWceAttributeByTei($teiNode, mapping);
		$newNode.setAttribute('wce', wceAttr);
		var newNodeText = getDomNodeText($teiNode);
		if (newNodeText) {
			nodeAddText($newNode, newNodeText);
		}
		$htmlParent.appendChild($newNode);
		return null;
	};

	/*
	 * <space>
	 */
	var Tei2Html_space = function($htmlParent, $teiNode) {

		var $newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', 'spaces');
		// set span attribute wce
		var wceAttr = '__t=spaces&__n=';
		var mapping = {
			'unit' : {
				'0' : '@char@line',
				'1' : '&sp_unit=',
				'2' : '&sp_unit=other&sp_unit_other='
			},
			'extent' : '&sp_extent='
		};
		wceAttr += getWceAttributeByTei($teiNode, mapping);
		$newNode.setAttribute('wce', wceAttr);
		nodeAddText($newNode, ' ');
		$htmlParent.appendChild($newNode);

		return null;
	};

	/*
	 * <lb>
	 */
	var Tei2Html_lb = function($htmlParent, $teiNode) {
		//
		// <span class="brea" wce="__t=brea&amp;__n=&amp;break_type=lb&amp;number=2&amp;pb_type=&amp;fibre_type=&amp;running_title=&amp;lb_alignment=&amp;insert=Insert&amp;cancel=Cancel"> - <br /> </span>
		//
		var $newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', 'brea');

		// TODO
		var wceAttr = '__t=paratext&__n=';

		nodeAddText($newNode, '\u002D');
		$br = $newDoc.createElement('br');
		$newNode.appendChild($br);
		nodeAddText($newNode, '\u21B5');
		$htmlParent.appendChild($newNode);
		nodeAddText($htmlParent, ' ');
		return null;
	};

	/*
	 * <com> / <fw> / <num
	 */
	var Tei2Html_paratext = function($htmlParent, $teiNode, teiNodeName) {
		// <comm type="commentary" place="pagetop" rend="left">ddd</comm>
		var $newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', 'paratext');

		// set span attribute wce
		var wceAttr = '__t=paratext&__n=&text=' + getDomNodeText($teiNode) + '';
		var mapping = {
			'n' : '&edit_number=',
			'place' : {
				'0' : '@pagetop@pagebottom@pageleft@pageright@above@below@self',
				'1' : '&paratext_position=',
				'2' : '&paratext_position=other&paratext_position_other='
			},
			'rend' : '&paratext_alignment=',
			'type' : '&fw_type='
		};

		wceAttr += getWceAttributeByTei($teiNode, mapping);
		$newNode.setAttribute('wce', wceAttr);
		if (teiNodeName == 'comm') {
			$commentary = $newDoc.createElement('span');
			$commentary.setAttribute('class', 'commentary');
			nodeAddText($commentary, teiNodeName);
			nodeAddText($newNode, '[');
			$newNode.appendChild($commentary);
			nodeAddText($newNode, ']');
		} else {
			nodeAddText($newNode, teiNodeName);
		}

		$htmlParent.appendChild($newNode);
		return null;
	};

	/*
	 * <note>
	 */
	var Tei2Html_note = function($htmlParent, $teiNode) {
		// <note type="$ note_type" n="$newHand" xml:id="_TODO_" > $note_text </note>
		var $newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', 'note');

		var wceAttr = '__t=note&__n=&note_text=' + getDomNodeText($teiNode) + '';
		var mapping = {
			'xml:id' : null,
			'type' : {
				'0' : '@editorial@transcriberquery@canonRef@changeOfHand',
				'1' : '&note_type=',
				'2' : '&note_type=other&note_type_other='
			},
			'n' : '&newHand='
		};
		wceAttr += getWceAttributeByTei($teiNode, mapping);

		$newNode.setAttribute('wce', wceAttr);
		nodeAddText($newNode, 'Note');
		$htmlParent.appendChild($newNode);
		nodeAddText($htmlParent, ' ');
		return null;
	};

	/*
	 * <app>
	 */
	var Tei2Html_app = function($htmlParent, $teiNode) {
		// <span class="corr" wce_orig="..."
		var $newNode = $newDoc.createElement('span');
		$newNode.setAttribute('class', 'corr');

		// <rdg type="orig" hand="firsthand" />
		// <rdg type="corr" hand="corrector1">
		var rdgs = $teiNode.childNodes;
		var $rdg, typeValue, handValue, deletionValue;
		var wceAttr = '';
		var origText;
		var rdgAttr;
		for ( var i = 0, l = rdgs.length; i < l; i++) {
			$rdg = rdgs[i];
			typeValue = $rdg.getAttribute('type');
			handValue = $rdg.getAttribute('hand');
			deletionValue = $rdg.getAttribute('deletion');

			if (typeValue == 'orig' && handValue == 'firsthand') {
				wceAttr += '__t=corr&__n=' + handValue + '&corrector_name=' + handValue;
				origText = getDomNodeText($rdg);
			} else if ('@corrector@firsthand@corrector1@corrector2@corrector3'.indexOf(handValue) > -1) {
				wceAttr += '@__t=corr&__n=' + handValue + '&corrector_name=' + handValue;
			} else {
				wceAttr += '@__t=corr&__n=' + handValue + '&corrector_name=other&corrector_name_other=' + handValue;
			}

			if (deletionValue) {
				// deletion="underline%2Cunderdot%2Cstrikethrough"
				// &deletion_erased=0
				// &deletion_underline=1
				// &deletion_underdot=1
				// &deletion_strikethrough=1
				// &deletion_vertical_line=0
				// &deletion_other=0
				var deletionArr = new Array('erased', 'underline', 'underdot', 'strikethrough', 'vertical_line', 'other');
				for ( var d = 0; d < deletionArr.length; d++) {
					var deletionItem = deletionArr[d];
					if (deletionValue.indexOf(deletionItem) > -1) {
						wceAttr += '&deletion_' + deletionItem + '=1';
					} else {
						wceAttr += '&deletion_' + deletionItem + '=0';
					}
				}
			}

			// &correction_text �����������е�����
			// <note>nnn</note><w n="2">aaa</w><w n="3"> c<hi rend="gold">a</hi> b<hi rend="green">c</hi></w><w n="4">bbb</w>
			var $tempParent = $newDoc.createElement('t');// <t>...</t>
			readAllChildrenOfTeiNode($tempParent, $rdg);
			var corrector_text = $tempParent.xml;
			if (corrector_text && corrector_text.length > 7) {
				corrector_text = corrector_text.substr(3, corrector_text.length - 8);
				wceAttr += '&corrector_text=' + encodeURIComponent(corrector_text);
			}
			// alert(wceAttr);
		}

		if (origText != '') {
			nodeAddText($newNode, origText);
		}
		if (wceAttr != '') {
			$newNode.setAttribute('wce', wceAttr);
		}

		$htmlParent.appendChild($newNode);
		return null;
	};

	return getHTML();
}

/**
 * ************************************************************************ ************************************************************************ ************************************************************************
 * ************************************************************************ ************************************************************************ ************************************************************************
 * ************************************************************************ ************************************************************************ ************************************************************************
 */

// getTEIXml
function getWceTei(inputString, g_bookNumber, g_pageNumber, g_chapterNumber, g_verseNumber, g_columnNumber, g_witValue, g_wordNumber) {
	if (!inputString || $.trim(inputString) == '')
		return '';

	// init only for test:
	// globale Variable
	g_bookNumber = '04';
	g_pageNumber = '0';
	g_chapterNumber = '0';
	g_verseNumber = '1';
	g_columnNumber = '0';
	g_witValue = '?';
	g_wordNumber = 0;

	var g_bookNode;
	var g_chapterNode;
	var g_veseNode;
	var tempNode;

	var gIndex_s = 0;

	var startCompressionWord = false;

	var $newDoc;
	var $newRoot;

	/*
	 * Main Method <br /> return String of TEI-Format XML
	 * 
	 */
	var getXML = function() {
		// alert(encodeURIComponent(' '));
		inputString = inputString.replace(/>\s+</g, '> @@@ <');
		// alert(inputString);

		inputString = '<TEMP>' + inputString + '</TEMP>';

		var $oldDoc = loadXMLString(inputString);

		var $oldRoot = $oldDoc.documentElement;

		$newDoc = loadXMLString("<TEMP></TEMP>");

		// <TEMP>
		$newRoot = $newDoc.documentElement;

		// ���忪ʼ��chapter, verse node
		g_chapterNode = $newDoc.createElement('div');
		g_chapterNode.setAttribute('type', 'chapter');
		g_chapterNode.setAttribute('n', 'B' + g_bookNumber + 'K' + g_chapterNumber);
		$newRoot.appendChild(g_chapterNode);

		g_veseNode = $newDoc.createElement('ab');
		g_veseNode.setAttribute('n', 'B' + g_bookNumber + 'K' + g_chapterNumber + 'V' + g_verseNumber);
		g_chapterNode.appendChild(g_veseNode);

		var childList = $oldRoot.childNodes;
		for ( var i = 0, l = childList.length; i < l; i++) {
			var $c = childList[i];
			if (!$c) {
				continue;
			} else {
				readAllChildrenOfHtmlNode(g_veseNode, $c, false);
			}
		}

		// DOM to String
		var str = xml2String($newRoot);
		if (!str)
			return '';

		// ���ص���xmlƬ�λ�����ʽ��xml?
		// str = str.substring(6, str.length - 7);
		return str;
	};

	/*
	 * �������нڵ㣬��ӵ��µĽڵ��� find all nodes of $node and change and add
	 */
	var readAllChildrenOfHtmlNode = function($teiParent, $htmlNode, stopAddW) {
		if (!$htmlNode) {
			return;
		}

		if ($htmlNode.nodeType == 3) {
			// ����text���������µ�tei node
			html2Tei_TEXT($teiParent, $htmlNode, stopAddW);
		} else if ($htmlNode.nodeType == 1) {
			// ����node���������µ�tei node
			// Ȼ�����newNode���������������
			var arr = getTeiByHtmlNode($teiParent, $htmlNode, stopAddW);
			if (!arr) {
				return;
			}

			//
			var $newParent = arr[0];
			if (!stopAddW) {
				stopAddW = arr[1];
			}

			//
			var childList = $htmlNode.childNodes;
			for ( var i = 0, l = childList.length; i < l; i++) {
				var $c = childList[i];
				if (!$c) {
					continue;
				} else {
					readAllChildrenOfHtmlNode($newParent, $c, stopAddW);
				}
			}

			// ������һ��
			if (!startCompressionWord) {
				var $htmlNodeNext = $htmlNode.nextSibling;
				while ($htmlNodeNext) {
					var oldNodeNextType = $htmlNodeNext.nodeType;
					var $nnext = $htmlNodeNext.nextSibling;
					if (oldNodeNextType == 3) {
						var oldNodeNextText = $htmlNodeNext.nodeValue;
						if ($.trim(oldNodeNextText) == '') {
							$htmlNodeNext.parentNode.removeChild($htmlNodeNext);
							break;
						}
						// �ı���ʼû�пո���ϲ�
						if (!startHasSpace(oldNodeNextText)) {
							startCompressionWord = true;
							var ind = oldNodeNextText.indexOf(" ");
							// ����Ҫ��ӵ�һ���ո�֮ǰ�����ݵ���Ԫ��,Ȼ������벿��������ԭ����doc����
							if (ind > 0) {
								var subStr1 = oldNodeNextText.substr(0, ind);
								var subStr2 = oldNodeNextText.substr(ind, oldNodeNextText.length);
								nodeAddText($newParent.parentNode, subStr1);
								$htmlNodeNext.nodeValue = subStr2;
							} else {
								html2Tei_TEXT($newParent.parentNode, $htmlNodeNext, stopAddW);
							}

							startCompressionWord = false;
						} else {
							// ��ʼ�пո� ������, ����
							break;
						}

						if (endHasSpace(oldNodeNextText)) {
							// ��β�пո�,������, ����
							break;
						}

					} else if (oldNodeNextType == 1) {
						startCompressionWord = true;
						readAllChildrenOfHtmlNode($newParent.parentNode, $htmlNodeNext, stopAddW);
						startCompressionWord = false;
					}
					$htmlNodeNext.parentNode.removeChild($htmlNodeNext);
					if ($nnext) {
						$htmlNodeNext = $nnext;
						continue;
					}
					$htmlNodeNext = null;
				}
			}
		}

	};

	/*
	 * ��ȡԭ���Ľڵ㣬����TEI�ڵ㣬��ӵ��µ�xml���� return new node
	 */
	var getTeiByHtmlNode = function($teiParent, $htmlNode, stopAddW) {
		var wceAttrValue, wceType, htmlNodeName, infoArr, arr;

		wceAttrValue = $htmlNode.getAttribute('wce');
		if (!wceAttrValue) {
			if ($htmlNode.getAttribute('class') == 'verse_number') {
				wceAttrValue = 'verse_number';
			} else if ($htmlNode.getAttribute('class') == 'chapter_number') {
				wceAttrValue = 'chapter_number';
			}
		}
 
		// ******************* verse *******************
		if (wceAttrValue.match(/verse_number/)) {
			var textNode = $htmlNode.firstChild;
			if (textNode) {
				g_verseNumber = textNode.nodeValue;
				g_verseNumber = $.trim(g_verseNumber);
				g_veseNode = $newDoc.createElement('ab');
				g_veseNode.setAttribute('n', 'B' + g_bookNumber + 'K' + g_chapterNumber + 'V' + g_verseNumber);
				g_chapterNode.appendChild(g_veseNode);
				g_wordNumber = 0;
			}
			return null;

		} else if (wceAttrValue.match(/chapter_number/)) {
			// ******************* chapter *******************
			var textNode = $htmlNode.firstChild;
			if (textNode) {
				g_chapterNumber = textNode.nodeValue;
				g_chapterNumber = $.trim(g_chapterNumber);
				g_chapterNode = $newDoc.createElement('div');
				g_chapterNode.setAttribute('type', 'chapter');
				g_chapterNode.setAttribute('n', 'B' + g_bookNumber + 'K' + g_chapterNumber);
				$newRoot.appendChild(g_chapterNode);
			}
			return null;

		} else {
			htmlNodeName = $htmlNode.nodeName;
		}

		// <br>
		if (htmlNodeName == 'br') {
			return null;
		}

		// for other type
		infoArr = strToArray(wceAttrValue);
		if (!infoArr) {
			return null;
		}

		// ��ȡwce���Ե���Ϣ���ж�wce����
		// ÿ����wce���Ե�spanԪ��Ϊ1��wce����
		arr = infoArr[0];
		if (!arr) {
			return null;
		}

		wceType = arr['__t'];

		// formating
		if (wceType.match(/formatting/)) {
			return html2Tei_formating(arr, $teiParent, $htmlNode, stopAddW);
		}

		// gap
		if (wceType == 'gap') {
			return html2Tei_gap(arr, $teiParent, $htmlNode, stopAddW);
		}

		// correction
		if (wceType === 'corr') {
			return html2Tei_correction(infoArr, $teiParent, $htmlNode, stopAddW);
		}

		// break
		if (wceType.match(/brea/)) {
			return html2Tei_break(arr, $teiParent, $htmlNode, stopAddW);
		}

		// abbr
		if (wceType == 'abbr') {
			return html2Tei_abbr(arr, $teiParent, $htmlNode, stopAddW);
		}

		// spaces
		if (wceType == 'spaces') {
			return html2Tei_spaces(arr, $teiParent, $htmlNode, stopAddW);
		}

		// note
		if (wceType == 'note') {
			return html2Tei_note(arr, $teiParent, $htmlNode, stopAddW);
		}

		// pc
		if (wceType == 'pc') {
			return html2Tei_pc(arr, $teiParent, $htmlNode, stopAddW);
		}

		// paratext
		if (wceType == 'paratext') {
			return html2Tei_paratext(arr, $teiParent, $htmlNode, stopAddW);
		}

		// unclear
		if (wceType == 'unclear') {
			return html2Tei_unclear(arr, $teiParent, $htmlNode, stopAddW);
		}

		// part_abbr
		if (wceType == 'part_abbr') {
			return html2Tei_partarr(arr, $teiParent, $htmlNode, stopAddW);
		}

		// other
		var $e = $newDoc.createElement("-TEMP-" + htmlNodeName);
		$teiParent.appendChild($e);
		return {
			0 : $e,
			1 : false
		};

	};

	/*
	 * type formating, return <hi>
	 */
	var html2Tei_formating = function(arr, $teiParent, $htmlNode, stopAddW) {
		var $hi = $newDoc.createElement('hi');
		var formatting_rend = '', formatting_height = '';
		switch (arr['__t']) {
		case 'formatting_rubrication':
			formatting_rend = 'rubric';
			break;
		case 'formatting_gold':
			formatting_rend = 'gold';
			break;
		case 'formatting_blue':
			formatting_rend = 'blue';
			break;
		case 'formatting_green':
			formatting_rend = 'green';
			break;
		case 'formatting_yellow':
			formatting_rend = 'yellow';
			break;
		case 'formatting_other':
			formatting_rend = 'other';
			break;
		case 'formatting_capitals':
			formatting_rend = 'cap';
			formatting_height = arr['capitals_height'];
			break;
		case 'formatting_overline':
			formatting_rend = 'ol';
		}

		if (formatting_rend != '') {
			$hi.setAttribute('rend', formatting_rend);
		}
		if (formatting_height != '') {
			$hi.setAttribute('height', formatting_height);
		}

		// ���һ�������w
		if (!stopAddW) {
			var $w = createNewWElement();
			$w.appendChild($hi);
			$teiParent.appendChild($w);
		} else {
			$teiParent.appendChild($hi);
		}

		// stop add element a <w>
		return {
			0 : $hi,
			1 : true
		};

	};

	/*
	 * type gap, return <gap> or <suplied>
	 */
	var html2Tei_gap = function(arr, $teiParent, $htmlNode, stopAddW) {
		// wce_gap <gap OR <supplied source="STRING" _type_STRING type="STRING" _reason_STRING reason="STRING" _hand_STRING hand="STRING" _unit_STRING_extent_STRING unit="STRING" extent="STRING" />
		var $newNode;
		if (arr['mark_as_supplied'] == 'supplied') {
			// <supplied>
			$newNode = $newDoc.createElement('supplied');
			var _supplied_source = arr['supplied_source'];
			if (_supplied_source && _supplied_source != '') {
				if (_supplied_source == 'other' && arr['supplied_source_other'])
					$newNode.setAttribute('source', arr['supplied_source_other']);
				else
					$newNode.setAttribute('source', _supplied_source);
			}
		} else {
			$newNode = $newDoc.createElement('gap');// <gap>
		}
		// reason
		if (arr['gap_reason']) {
			$newNode.setAttribute('reason', arr['gap_reason']);
		}
		// unit
		var unitValue = arr['unit'];
		if (unitValue != '') {
			if (unitValue == 'other' && arr['unit_other']) {
				$newNode.setAttribute('unit', arr['unit_other']);
			} else {
				$newNode.setAttribute('unit', unitValue);
			}
		}
		// extent
		if (arr['extent']) {
			$newNode.setAttribute('extent', arr['extent']);
		}

		if ($newNode.nodeName === 'supplied') {
			// add text
			var newNodeText = getDomNodeText($htmlNode);
			if (newNodeText) {
				newNodeText = newNodeText.substr(1, newNodeText.length - 2);
				nodeAddText($newNode, newNodeText);
			}
		}
		$teiParent.appendChild($newNode);

		return {
			0 : $newNode,
			1 : false
		};

	};

	/*
	 * type correction, return <app><rdg> ....
	 */
	var html2Tei_correction = function(infoArr, $teiParent, $htmlNode, stopAddW) {
		var $app;
		var xml_id;
		var startWordNumberInCorrection = g_wordNumber;
		for ( var i = 0, l = infoArr.length; i < l; i++) {
			var arr = infoArr[i];
			g_wordNumber = startWordNumberInCorrection;

			if (!$app) {
				// new Element <app>
				$app = $newDoc.createElement('app');
				$teiParent.appendChild($app);

				// new Element <rdg> for original
				// <rdg type="orig" hand="firsthand"><w n="17">���ӦŦͦɦƦŦӦ���</w> <pc>?</pc></rdg>
				var $orig = $newDoc.createElement('rdg');
				$orig.setAttribute('type', 'orig');
				$orig.setAttribute('hand', 'firsthand');
				var origText = $htmlNode.getAttribute('wce_orig');
				if (origText) {
					html2Tei_correctionAddW($orig, origText);
					g_wordNumber = startWordNumberInCorrection;
				}
				$app.appendChild($orig);
			}

			// new Element<rdg>,child of <app>($newNode)
			var $rdg = $newDoc.createElement('rdg');
			$rdg.setAttribute('type', arr['reading']);
			var corrector_name = arr['corrector_name'];
			if (corrector_name == 'other') {
				corrector_name = arr['corrector_name_other'];
			}
			$rdg.setAttribute('hand', corrector_name);

			// deletion
			var deletion = arr['deletion'];
			if (deletion && deletion != 'null' && deletion != '') {
				$rdg.setAttribute('deletion', deletion.replace(',', '+'));
			}
			// editorial_note
			var editorial_note = arr['editorial_note'];
			if (editorial_note != '') {
				var $note = $newDoc.createElement('note');
				$note.setAttribute('type', 'transcriber');
				var _line = '';// TODO
				xml_id = 'P' + g_pageNumber + 'C' + g_columnNumber + 'L' + _line + '-' + g_witValue + '-1';
				$note.setAttribute('xml:id', xml_id);// TODO:
				nodeAddText($note, editorial_note);
				$rdg.appendChild($note);
			}

			var corrector_text = arr['corrector_text'];
			if (corrector_text) {
				html2Tei_correctionAddW($rdg, corrector_text);
			}
			$app.appendChild($rdg);
		}
		return {
			0 : $app,
			1 : false
		}
	};

	var html2Tei_correctionAddW = function($newNode, text) {
		text = decodeURIComponent(text);
		var $corrXMLDoc = loadXMLString('<TEMP>' + text + '</TEMP>');
		var $corrRoot = $corrXMLDoc.documentElement;
		var childList = $corrRoot.childNodes;
		for ( var x = 0, y = childList.length; x < y; x++) {
			var $c = childList[x];
			if (!$c) {
				continue;
			} else {
				readAllChildrenOfHtmlNode($newNode, $c, false);
			}
		}
	};

	/*
	 * type break,
	 */
	// break_type= lb / cb /qb / pb number= pb_type= running_title= lb_alignment, Page (Collate |P 121|): <pb n="121" type="page" xml:id="P121-wit" /> Folio (Collate |F 3v|): <pb n="3v" type="folio" xml:id="P3v-wit" /> Column (Collate |C 2|): <cb n="2" xml:id="P3vC2-wit" />
	// Line (Collate |L 37|): <lb n="37" xml:id="P3vC2L37-wit" />
	var html2Tei_break = function(arr, $teiParent, $htmlNode, stopAddW) {
		var hasBreak = false;
		var xml_id;
		var breakNodeText = getDomNodeText($htmlNode);
		var break_type = arr['break_type'];

		if (breakNodeText && breakNodeText.substr(0, "&#45;".length) == "&#45;") {
			hasBreak = true;
		}

		if (break_type == 'gb') {
			// special role of quire breaks
			$newNode = $newDoc.createElement('gb');
			$newNode.setAttribute('n', arr['number']);
		} else if (break_type) {
			// pb, cb, lb
			$newNode = $newDoc.createElement(break_type);
			switch (break_type) {
			case 'lb':
				$newNode.setAttribute('n', arr['number']);
				if (arr['lb_alignment'] != '') {
					$newNode.setAttribute('rend', arr['lb_alignment']);
				}
				xml_id = 'P' + g_pageNumber + 'C' + g_columnNumber + 'L' + arr['number'] + '-' + g_witValue;
				break;
			case 'cb':
				var breaColumn = arr['number'];
				$newNode.setAttribute('n', breaColumn);
				xml_id = 'P' + g_pageNumber + 'C' + breaColumn + '-' + g_witValue;
				break;
			case 'pb':
				var breaPage;
				// Decide whether folio or page
				if (arr['pb_type'] != '' || arr['fibre_type'] != '') {
					// folio
					breaPage = arr['number'] + arr['pb_type'] + arr['fibre_type'];
					$newNode.setAttribute('n', breaPage);
					$newNode.setAttribute('type', 'folio');
				} else {
					// page
					breaPage = arr['number'];
					$newNode.setAttribute('n', breaPage);
					$newNode.setAttribute('type', 'page');
				}
				if (arr['facs'] != '') {
					// use URL for facs attribute
					$newNode.setAttribute('facs', arr['facs']);
				}
				xml_id = 'P' + breaPage + '-' + g_witValue;
				break;
			}
			$newNode.setAttribute('xml:id', xml_id);
			if (hasBreak) {
				$newNode.setAttribute('break', 'no');
			}

		}
		$teiParent.appendChild($newNode);
		// TODO
		if (break_type == 'lb') {
			// TODO ΪʲôҪ���\n
			// for lb add newline
			// $newNode.parentNode.insertBefore($newDoc.createTextNode("\n"), $newNode);
		} else if (break_type == 'pb') {
			var $secNewNode;
			// for pb add fw elements
			if (arr['running_title'] != '') {
				$secNewNode = $newDoc.createElement('fw');
				$secNewNode.setAttribute('type', 'runTitle');
				nodeAddText($secNewNode, arr['running_title']);
				$newNode.parentNode.appendChild($secNewNode);
			}
			if (arr['page_number'] != '') {
				$secNewNode = $newDoc.createElement('fw');
				$secNewNode.setAttribute('type', 'PageNum');
				nodeAddText($secNewNode, arr['page_number']);
				$newNode.parentNode.appendChild($secNewNode);
			}
		}
		return {
			0 : $newNode,
			1 : true
		}
	};

	/*
	 * type abbr, return <abbr>
	 */
	var html2Tei_abbr = function(arr, $teiParent, $htmlNode, stopAddW) {
		var $abbr = $newDoc.createElement('abbr');
		// type
		var abbr_type = arr['abbr_type'];
		if (abbr_type && abbr_type != '') {
			if (abbr_type == 'other')
				$abbr.setAttribute('type', arr['abbr_type_other']);
			else
				$abbr.setAttribute('type', abbr_type);
		}

		var hText = getDomNodeText($htmlNode);
		// �����overline�����<hi>
		if (arr['add_overline'] == 'overline') {
			var $hi = $newDoc.createElement('hi');
			$hi.setAttribute('rend', 'ol');

			if (hText) {
				nodeAddText($hi, hText);
			}
			$abbr.appendChild($hi);
		} else {
			nodeAddText($abbr, hText);
		}

		if (!stopAddW) {
			var $w = createNewWElement();
			$w.appendChild($abbr);
			$teiParent.appendChild($w);
		} else {
			$teiParent.appendChild($abbr);
		}
		return {
			0 : $abbr,
			1 : true
		}
	};

	/*
	 * type note, return <note>
	 */
	var html2Tei_note = function(arr, $teiParent, $htmlNode, stopAddW) {
		var $note = $newDoc.createElement('note');
		var note_type_value = arr['note_type'];
		if (note_type_value == 'other') {
			var other_value = arr['note_type_other'];
			if (other_value != '') {
				note_type_value = other_value;
			}
		}
		if (note_type_value != '') {
			$note.setAttribute('type', note_type_value);
		}

		/*
		 * // TODO: // numbering var _xml_id = $value['B'] + $value['K'] + $value['V'] + '-' + g_Wit + '-1';
		 * 
		 */

		if ($teiParent.nodeName == 'w') {
			$teiParent = $teiParent.parentNode;
		}
		var xml_id = '_TODO_';
		$note.setAttribute('xml:id', xml_id);
		nodeAddText($note, arr['note_text']);

		$teiParent.appendChild($note);

		// add <handshift/>
		if (arr['note_type'] == "changeOfHand") {
			var $secNewNode = $newDoc.createElement('handshift');
			$secNewNode.setAttribute('n', arr['newHand']);
			$teiParent.appendChild($secNewNode);
		}

		return {
			0 : $note,
			1 : false
		}
	};

	/*
	 * type space, return <space>
	 */
	var html2Tei_spaces = function(arr, $teiParent, $htmlNode, stopAddW) {
		var $space = $newDoc.createElement('space');

		var sp_unit_value = arr['sp_unit'];
		if (sp_unit_value == 'other' && arr['sp_unit_other'] != '') {
			sp_unit_value = arr['sp_unit_other'];
		}
		if (sp_unit_value != '') {
			$space.setAttribute('unit', sp_unit_value);
		}

		sp_unit_value = arr['sp_extent'];
		if (sp_unit_value) {
			$space.setAttribute('extent', sp_unit_value);
		}
		$teiParent.appendChild($space);

		return null;
	};

	/*
	 * type pc, return <pc>
	 */
	var html2Tei_pc = function(arr, $teiParent, $htmlNode, stopAddW) {
		var $pc = $newDoc.createElement('pc');
		$teiParent.appendChild($pc);

		return {
			0 : $pc,
			1 : true
		}
	};

	/*
	 * type paratext, return <fw>, <num> or <comm>
	 */
	// <fw type="STRING" place="STRING" rend="align(STRING)">...</fw> <num type="STRING" n="STRING" place="STRING" rend="align(STRING)">...</num> <div type="incipit"><ab>...</ab></div> <div type="explicit"><ab>...</ab></div>
	var html2Tei_paratext = function(arr, $teiParent, $htmlNode, stopAddW) {
		var newNodeName, fwType = arr['fw_type'];

		if (fwType == 'commentary') {
			newNodeName = 'comm';
		} else if (fwType == 'pageNum' || fwType == 'chapNum' || fwType == 'AmmSec' || fwType == 'EusCan' || fwType == 'stichoi') {
			newNodeName = 'num';
		} else if (fwType == 'chapTitle' || fwType == 'lectTitle' || fwType == 'colophon' || fwType == 'quireSig' || fwType == 'euthaliana' || fwType == 'gloss') {
			newNodeName = 'fw';
		}

		var $paratext = $newDoc.createElement(newNodeName);
		$paratext.setAttribute('type', fwType);

		// n
		// write attribute n only for certain values
		var numberValue = arr['number'];
		if (numberValue && (fwType == 'pageNum' || fwType == 'chapNum' || fwType == 'quireSig' || fwType == 'AmmSec' || fwType == 'EusCan' || fwType == 'stichoi')) {
			$paratext.setAttribute('n', numberValue);
		}

		// place
		var placeValue = arr['paratext_position'];
		if (placeValue == 'other') {
			placeValue = arr['paratext_position_other'];
		}

		if (placeValue && placeValue != '') {
			$paratext.setAttribute('place', placeValue);
		}

		var rendValue = arr['paratext_alignment'];
		if (rendValue && rendValue != '') {
			$paratext.setAttribute('rend', rendValue);
		}

		nodeAddText($paratext, arr['text']);

		$teiParent.appendChild($paratext);
		return null;
	};

	/*
	 * type unclear, return <unclear_reason_STRING reason="STRING">...</unclear>
	 */
	var html2Tei_unclear = function(arr, $teiParent, $htmlNode, stopAddW) {
		var $unclear = $newDoc.createElement('unclear');
		var reasonValue = arr['unclear_text_reason'];
		if (reasonValue == 'other') {
			reasonValue = arr['unclear_text_reason_other'];
		}
		if (reasonValue && reasonValue != '') {
			$unclear.setAttribute('reason', decodeURIComponent(reasonValue));
		}
		if (arr['original_text']) {
			nodeAddText($unclear, decodeURIComponent(arr['original_text']));
		}

		if (!stopAddW) {
			var $w = createNewWElement();
			$w.appendChild($unclear);
			$teiParent.appendChild($w);
		} else {
			$teiParent.appendChild($unclear);
		}

		return {
			0 : $unclear,
			1 : true
		}
	}

	/*
	 * change text to TEI Node �������text�Ƿ�������Ľڵ�Ϊͬһ���ʣ�����ǵĻ���ͳһ��Ϊ1���ڵ㴦��
	 */
	var html2Tei_TEXT = function($teiParent, $htmlNode, stopAddW) {
		var teiParentNodeName = $teiParent.nodeName;

		// text to ignore
		// text of unclear setup by html2Tei_unclear
		var nodeTextToIgnore = new Array('gap', 'app', 'lb', 'cb', 'pb', 'abbr', 'unclear', 'ex', 'note');
		for ( var i = 0, l = nodeTextToIgnore.length; i < l; i++) {
			if (teiParentNodeName == nodeTextToIgnore[i]) {
				return;
			}
		}

		var text = $htmlNode.nodeValue;
		// Ԫ��֮��Ŀո�Ҳ���ǽ�ȥ
		if ($.trim(text) == '@@@')
			return;

		if (stopAddW) {
			nodeAddText($teiParent, text);
			return;
		}

		// �ı��ڵ��Ƿ������һ���ڵ㣬����ǵĻ���ɾ������Ľڵ㣿
		var endIsSpace = endHasSpace(text);
		var arr = text.split(' ');
		for ( var i = 0, l = arr.length; i < l; i++) {
			var str = arr[i];
			if (!str || str == '') {
				continue;
			}

			// �½�֮ǰ�������Ƿ�ǰ��ֱ������һ��Ԫ�أ��ҵ�wԪ��.
			var $w = createNewWElement();

			$teiParent.appendChild($w);
			nodeAddText($w, str);

			// ��������һ��Ԫ��,����û�пո�
			// �ҵ���������������Ԫ�أ� �ϲ�����������ɾ����ЩԪ��
			// qqq aaa<b>bbb</b>cc c
			// ���... <w>aaa<h>bbb</h>ccc</w>
			// ����aaabbbccc��һ������
			if (i == l - 1 && !endIsSpace && !startCompressionWord) {
				var $next = $htmlNode.nextSibling;
				startCompressionWord = true;
				while ($next) {
					// �����һ���������ڵ㣬������ȥ
					if ($next.nodeType == 1) {
						readAllChildrenOfHtmlNode($w, $next, true);
						var $nnext = $next.nextSibling;
						// ɾ��Ԫ�أ��Է��Ժ���������ӵ��µ�doc����
						$next.parentNode.removeChild($next);
						if ($nnext) {
							$next = $nnext;
							continue;
						}
						$next = null;
					} else {
						// ������ı��ڵ�,��ȡ�ո�ǰ���
						var nextText = $next.nodeValue;
						var ind = nextText.indexOf(" ");
						// ����пո�,������ǰ��Ľڵ�,ֹͣ
						if (ind == 0) {
							break;
						}

						// ����Ҫ��ӵ�һ���ո�֮ǰ�����ݵ���Ԫ��,Ȼ������벿��������ԭ����doc����
						if (ind > 0) {
							var subStr1 = nextText.substr(0, ind);
							var subStr2 = nextText.substr(ind, nextText.length);
							nodeAddText($w, subStr1);
							$next.nodeValue = subStr2;
							break;
						} else {
							// ����м�û�пո�, ����������ݵ���Ԫ��
							nodeAddText($w, nextText);
						}

						// �����β�����пո�, ҲҪֹͣ
						if (endHasSpace(nextText)) {
							$next.parentNode.removeChild($next);
							break;
						} else {
							var $nnext = $next.nextSibling;
							$next.parentNode.removeChild($next);
							if ($nnext) {
								$next = $nnext;
								continue;
							}
							$next = null;
						}
					}
				}
				startCompressionWord = false;
			}
		}
	};

	/*
	 * type part_abbr, return <ex>
	 */
	var html2Tei_partarr = function(arr, $teiParent, $htmlNode, stopAddW) {
		var $ex = $newDoc.createElement('ex');
		var textValue = getDomNodeText($htmlNode);
		if (textValue) {
			textValue = textValue.substr(1, textValue.length - 2);
			nodeAddText($ex, textValue);
		}
		if (!stopAddW) {
			var $w = createNewWElement();
			$w.appendChild($ex);
			$teiParent.appendChild($w);
		} else {
			$teiParent.appendChild($ex);
		}

		return {
			0 : $ex,
			1 : true
		}
	};

	/*
	 * �ж��ַ����Ƿ�ո�ʼ
	 */
	var startHasSpace = function(str) {
		if (str.match(/^\s+/)) {
			return true;
		}
	};

	/*
	 * �ж��ַ����Ƿ�ո��β
	 */
	var endHasSpace = function(str) {
		if (str.match(/\s+$/)) {
			return true;
		}
	};

	/*
	 * 
	 */
	var getType = function($htmlNode) {

	};

	/*
	 * 
	 */
	var createNewWElement = function() {
		var $w = $newDoc.createElement('w');
		g_wordNumber++;
		$w.setAttribute('n', g_wordNumber);
		return $w;
	};

	/*
	 * String converted into an array
	 */
	var strToArray = function(str) {
		if (!str)
			return null;
		var outArr = new Array();

		var arr0 = str.split('@');
		var k0, v0, k1, v1, k2, v2, arr1, arr2;
		for (k0 in arr0) {
			v = arr0[k0];
			outArr[k0] = new Array();
			arr1 = v.split('&');
			for (p1 in arr1) {
				v1 = arr1[p1];
				arr2 = v1.split('=');
				if (arr2.length > 0) {
					k2 = arr2[0];
					v2 = arr2[1];
					try {
						outArr[k0][k2] = v2;
					} catch (e) {
						alert(e);
					}
				}
			}
		}
		return outArr;
	};

	return getXML();

};

/*
 * load txt and generate DOM object
 */
function loadXMLString(txt) {
	var xmlDoc;
	if (window.DOMParser) {
		var parser = new DOMParser();
		xmlDoc = parser.parseFromString(txt, "text/xml");
	} else {
		// Internet Explorer
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(txt);
	}
	return xmlDoc;
}

/*
 * Read xml file to generate the DOM object
 */
function loadXMLDoc(dname) {
	var xhttp;
	if (window.XMLHttpRequest) {
		xhttp = new XMLHttpRequest();
	} else {
		xhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhttp.open("GET", dname, false);
	xhttp.send();
	return xhttp.responseXML;
}

/*
 * converted DOM into a string
 * 
 */
function xml2String(xmlNode) {
	try {
		// Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
		return (new XMLSerializer()).serializeToString(xmlNode);
	} catch (e) {
		try {
			// Internet Explorer.
			return xmlNode.xml;
		} catch (e) {
			// Other browsers without XML Serializer
			alert('Xmlserializer not supported');
		}
	}
	return false;
}

/*
 * text or textContent
 */
function getDomNodeText($node) {
	var text = $node.text;
	if (!text) {
		text = $node.textContent;
	}
	return text;
}

/*
 * add text to a node
 */
function nodeAddText($node, str) {
	if (str) {
		$node.appendChild($node.ownerDocument.createTextNode(str));
	}
};