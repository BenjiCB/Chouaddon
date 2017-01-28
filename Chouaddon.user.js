// ==UserScript==
// @name        Chouaddon
// @namespace   choualbox.com
// @description Addon qui améliore la navigation sur Choualbox
// @author      Appineos - http://choualbox.com/blog/appineos (Benji)
// @editor	CatShadow - http://choualbox.com/blog/catshadow
// @include     http://choualbox.com/*
// @version     4.0
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_log
// @require     http://code.jquery.com/jquery-2.0.3.min.js
// @updateURL 	https://github.com/BenjiCB/Chouaddon/raw/master/Chouaddon.user.js
// ==/UserScript==
boxWorked = new Array();
regPseudo = /blog\/(.*)/;
regSeries = /([^\t]+?)\.*#[0-9]+.*$/;

try {
	if (GM_getValue.toString().indexOf("not supported") != -1) {
		this.GM_getValue=function (key,def) {
			return localStorage[key] || def;
		};
		
		this.GM_setValue=function (key,value) {
			return localStorage[key]=value;
		};
		this.GM_deleteValue=function (key) {
			return delete localStorage[key];
		};
	}
}
catch (e) {
	console.log(e);
}
this.GM_getBoolValue = function (key, def) {
	return (this.GM_getValue(key, def) === true || this.GM_getValue(key, def) == "true");
}

function boucle() {
	boxs = document.getElementsByClassName('box_boucle');
	for (i in boxs) {
		if (isNaN(i)) continue;
		if (boxs[i].classList.contains('dejaTraitee')) continue;
		box = boxs[i];
		droiteBox = box.getElementsByClassName('droite')[0];
		mediaBox = droiteBox.getElementsByClassName('medias')[0];
		idUnique = box.getElementsByClassName('nbcoms')[0].pathname;
		box.classList.add('dejaTraitee');
		titre = box.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].innerHTML;
		console.log(box.getElementsByClassName('infos'));
		if (box.classList.contains('large'))
		 pseudoId = box.getElementsByClassName('medias')[0].getElementsByTagName('a')[0].innerText;
		else
		 pseudoId = box.getElementsByClassName('infos')[0].getElementsByTagName('a')[1].innerText;

		if ((ignoreList.indexOf(pseudoId) == -1)) { //Si la personne n'est pas ignorée
			if (!((box.getElementsByClassName('voted').length != 0) && (GM_getBoolValue('delAutoVote', false)))) {
				if (GM_getBoolValue('affLienIgnore', false)) {
					lienIgnore = document.createElement('a');
					lienIgnore.innerHTML = '<span class="glyphicon glyphicon-eye-close"></span> Ignorer ' + pseudoId;
					lienIgnore.className = 'ignoreNickname-' + pseudoId;
					lienIgnore.style.cursor = "pointer";
					lienIgnore.onclick = function () { ajoutIgnoreList(this) };
					lienIgnore.style.color = 'rgb(102, 102, 102)';
					
					mediaBox.appendChild(lienIgnore);
				}
				if (GM_getBoolValue('series', false) && regSeries.test(titre)) {
					titreDec = regSeries.exec(titre);
					lienSerie = document.createElement('a');
					lienSerie.innerHTML = '<span class="glyphicon glyphicon-search"></span> Série ' + titreDec[1];
					lienSerie.href = 'http://choualbox.com/recherche?q=' + encodeURIComponent(titreDec[1]);
					mediaBox.appendChild(lienSerie);
				}
			}
			else {
				box.style.backgroundColor = '#EFEFEF';
				box.style.minHeight = 0;
				box.innerHTML = '<a href="' + idUnique + '">Box déjà votée (' + pseudoId + ') - ' + titre + '</a>';
			}
		}
		else {
			box.style.backgroundColor = '#EEEEEE';
			box.style.minHeight = 0;
			box.innerHTML = '<a style="color: rgb(102, 102, 102)" href="' + idUnique + '">Box ignorée (' + pseudoId + ') - ' + titre + '</a>';
		}
	}
}
function afficherImagesCommentaires() {
	medias = document.getElementsByClassName('media_image');
	for (i in medias) {
		if (isNaN(i)) continue;
		lien = medias[i].getElementsByTagName('a')[0];
		if (lien.getElementsByClassName('gif-overlay').length > 0)
  		lien.removeChild(lien.getElementsByClassName('gif-overlay')[0]);
		image = lien.getElementsByTagName('img')[0];
		image.src = lien.href;
		image.style.maxWidth = '100%';
	}
}
function ajoutIgnoreList(obj) {
    id = obj.className;
    regPseudo = /ignoreNickname-(.*)/
    if ((regPseudo.test(id)) && (pseudo = regPseudo.exec(id)[1]) && (!ignoreList.hasOwnProperty(pseudo)) && (ignoreList.indexOf(pseudo) == -1)) {
			ignoreList = GM_getValue('ignoreList', "").split(", ");
			if ("" == GM_getValue('ignoreList', "")) GM_setValue('ignoreList', pseudo);
			else {
				ignoreList.push(pseudo);
				GM_setValue('ignoreList', ignoreList.join(", "));
				document.getElementById('ignoreList').value = GM_getValue('ignoreList', "");
			}
    }
	obj.innerHTML = "Ignoré";
}
function rmSidebar(sidebar) {
	if (sidebar != null) {
	 sidebar.parentNode.removeChild(sidebar);
	 document.getElementById('principal').getElementsByClassName('col-xs-8')[0].className = 'col-xs-12';
	}
}
function ajouterOptionMenu(label, nomInterne, type, parent, def) {
	option = document.createElement("div");
	option.style.marginBottom = "5px";
	if (type == "textarea") optionInput = document.createElement(type);
	else {
		optionInput = document.createElement("input");
		optionInput.type = type;
	}
	if (type == "checkbox"){
		optionInput.onclick = function () { optionChange(this) };
		optionInput.checked = GM_getBoolValue(nomInterne, def);
	}
	else {
		optionInput.onblur = function () { optionChange(this) };
		optionInput.value = GM_getValue(nomInterne, def);
	}
	optionInput.id = nomInterne;
	optionInput.style.height = "auto";
	optionInput.style.width = "auto";
	optionInput.style.marginRight = "5px";
	
	optionLabel = document.createElement("label");
	optionLabel.htmlFor = nomInterne;
	optionLabel.innerHTML = label;
	optionLabel.style.display = "inline";
	optionLabel.style.fontWeight = "normal";
	if (type == "textarea") {
		option.appendChild(optionLabel);
		option.appendChild(document.createElement('br'));
		optionInput.style.width = "100%";
		option.appendChild(optionInput);
	}
	else {
		option.appendChild(optionInput);
		option.appendChild(optionLabel);
		if (type == "color") {
			optionInput.style.width = "38px";
			optionInput.style.height = "26px";
		}
	}
	parent.appendChild(option);
}

function optionChange(optionInput) {
		if (optionInput.type == "checkbox") val = optionInput.checked;
	else val = optionInput.value;
	GM_setValue(optionInput.id, val);
}
gCGW = document.createElement('div');
gCGW.classList.add('dropdown-menu');
gCGW.style.width = "600px";
gCGW.style.padding = "5px";
titregCGW = document.createElement('h1');
titregCGW.innerHTML = "Chouaddon v4.0 - Configuration";
gCGW.appendChild(titregCGW);

ajouterOptionMenu('Masquer les box déjà votées', 'delAutoVote', "checkbox", gCGW, false);
ajouterOptionMenu('Images commentaire en taille réelle', 'affichageImagesCommentaires', "checkbox", gCGW, true);
ajouterOptionMenu('Lien auto de recherche lors d\'une série', 'series', "checkbox", gCGW, true);
ajouterOptionMenu('Lien sur chaque box pour ignorer les box de l\'auteur', 'affLienIgnore', "checkbox", gCGW, false);
ajouterOptionMenu('Enlever la colonne de droite sur la liste des boxs', 'rmSidebarBoxList', "checkbox", gCGW, false);
ajouterOptionMenu('Enlever la colonne de droite sur les boxs', 'rmSidebarBox', "checkbox", gCGW, false);
ajouterOptionMenu('Utilisateurs ignorés : (Séparés par des virgules, pas de majuscules)', 'ignoreList', "textarea", gCGW, "");

elementMenu = document.createElement('li');
elementMenu.className = 'with-icon tooltip-bottom';
elementMenu.attributes.style = "position:relative;";

filtreElementMenu = document.createElement('i');
filtreElementMenu.className = 'glyphicon glyphicon-plus';
filtreElementMenu.style.cursor = "pointer";

lienElementMenu = document.createElement('a');
lienElementMenu.style.paddingTop = "15px";
lienElementMenu.style.paddingLeft = "0px";
lienElementMenu.style.paddingRight = "0px";
lienElementMenu.style.paddingBottom = "0px";
lienElementMenu.onclick = function() {
	gCGW.style.display = (gCGW.style.display == "none" || gCGW.style.display == "") ? "block" : "none";
	filtreElementMenu.className = (gCGW.style.display == "none" || gCGW.style.display == "") ? 'glyphicon glyphicon-plus' : 'glyphicon glyphicon-minus';
}


lienElementMenu.appendChild(filtreElementMenu);
elementMenu.appendChild(lienElementMenu);
elementMenu.appendChild(gCGW);
document.getElementsByClassName('navbar-right')[0].appendChild(elementMenu);
document.getElementById("ignoreList").style.resize = "vertical";
document.getElementById("ignoreList").style.maxHeight = "400px";


ignoreList = GM_getValue('ignoreList', "").split(", ");
if (document.getElementsByClassName('box_boucle').length > 0) { boucle(); setInterval(boucle, 3000); }
if (document.getElementsByClassName('commentaires').length > 0 && GM_getBoolValue('affichageImagesCommentaires', false)) { afficherImagesCommentaires(); }
if (document.getElementById('sidebar') != null && GM_getBoolValue('rmSidebarBoxList', false)) { rmSidebar(document.getElementById('sidebar')); }
if (document.getElementsByClassName('col-xs-4').length > 0 && GM_getBoolValue('rmSidebarBox', false)) { rmSidebar(document.getElementsByClassName('col-xs-4')[0]); }
