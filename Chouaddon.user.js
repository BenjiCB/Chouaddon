// ==UserScript==
// @name        Chouaddon
// @namespace   choualbox.com
// @description Ignorer les box d'un utilisateur, supprimer de sa page les boxs déjà votées, afficher les images en commentaires
// @author      Benji - http://choualbox.com/blog/benji
// @include     http://choualbox.com/*
// @version     3.0
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_log
// @require     http://code.jquery.com/jquery-2.0.3.min.js
// @updateURL 	https://github.com/BenjiCB/Chouaddon/raw/master/Chouaddon.user.js
// ==/UserScript==
boxWorked = new Array();
regPseudo = /blog\/(.*)/;
regSeries = /([^\t]+?)\.*#[0-9]+.*$/;

function boucle() {
	boxs = document.getElementsByClassName('box_boucle');
	for (i in boxs) {
		if (isNaN(i)) continue;
		if (boxs[i].classList.contains('dejaTraitee')) continue;
		box = boxs[i];
		droiteBox = box.getElementsByClassName('droite')[0];
		idUnique = box.getElementsByClassName('nbcoms')[0].pathname;
		box.classList.add('dejaTraitee');
		titre = box.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].innerHTML;
		cherchePseudo = box.getElementsByClassName('infos')[0].getElementsByTagName('a');
		pseudoId = "Bug";
		for (testIsPseudo in cherchePseudo) {
			if (isNaN(testIsPseudo)) break;
			if (cherchePseudo[testIsPseudo].classList.length == 0 && regPseudo.test(cherchePseudo[testIsPseudo].href)) {
				pseudoId = regPseudo.exec(cherchePseudo[testIsPseudo].href)[1];
				break;
			}
		}
		if ((ignoreList.indexOf(pseudoId) == -1)) {
			if (!((box.getElementsByClassName('voted').length != 0) && (GM_getValue('delAutoVote', false)))) {
				if (GM_getValue('affLienIgnore', false)) {
					lienIgnore = document.createElement('a');
					lienIgnore.innerHTML = 'Ignorer ses boxs';
					lienIgnore.className = 'ignoreNickname-' + pseudoId;
					lienIgnore.style.cursor = "pointer";
					lienIgnore.onclick = function () { ajoutIgnoreList(this) };
					droiteBox.appendChild(lienIgnore);
				}
				if (GM_getValue('series', false) && regSeries.test(titre)) {
					titreDec = regSeries.exec(titre);
					lienSerie = document.createElement('a');
					lienSerie.innerHTML = '<br />Série ' + titreDec[1];
					lienSerie.href = 'http://choualbox.com/recherche?q=' + encodeURIComponent(titreDec[1]);
					droiteBox.appendChild(lienSerie);
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
			box.innerHTML = '<a href="' + idUnique + '">Box ignorée (' + pseudoId + ') - ' + titre + '</a>';
		}
	}
}
function afficherImagesCommentaires() {
	medias = document.getElementsByClassName('media_image');
	for (i in medias) {
		if (isNaN(i)) continue;
		lien = medias[i].getElementsByTagName('a')[0];
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
	obj.innerHTML = "Ok.";
}

function ajouterOptionMenu(label, nomInterne, type, parent) {
	option = document.createElement("div");
	option.style.marginBottom = "5px";
	if (type == "textarea") optionInput = document.createElement(type);
	else {
		optionInput = document.createElement("input");
		optionInput.type = type;
	}
	if (type == "checkbox"){
		optionInput.onclick = function () { optionChange(this) };
		optionInput.checked = GM_getValue(nomInterne, false);
	}
	else {
		optionInput.onblur = function () { optionChange(this) };
		optionInput.value = GM_getValue(nomInterne, "");
	}
	optionInput.id = nomInterne;
	optionInput.style.height = "auto";
	optionInput.style.width = "auto";
	optionInput.style.marginRight = "5px";
	
	optionLabel = document.createElement("label");
	optionLabel.htmlFor = nomInterne;
	optionLabel.innerHTML = label;
	optionLabel.style.display = "inline";
	if (type == "textarea") {
		option.appendChild(optionLabel);
		option.appendChild(document.createElement('br'));
		optionInput.style.width = "100%";
		option.appendChild(optionInput);
	}
	else {
		option.appendChild(optionInput);
		option.appendChild(optionLabel);
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
titregCGW.innerHTML = "Chouaddons v3.0 - Configuration";
gCGW.appendChild(titregCGW);

ajouterOptionMenu('Supprimer automatiquement de la page les box déjà votées.', 'delAutoVote', "checkbox", gCGW);
ajouterOptionMenu('Images en commentaire en taille réel', 'affichageImagesCommentaires', "checkbox", gCGW);
ajouterOptionMenu('Lien en dessous de chaque boxs pour ignorer les futures box de l\'auteur', 'affLienIgnore', "checkbox", gCGW);
ajouterOptionMenu('Utilisateurs ignorés : (Séparés par des virgules)', 'ignoreList', "textarea", gCGW);

elementMenu = document.createElement('li');
elementMenu.className = 'with-icon tooltip-bottom';
elementMenu.attributes.style = "position:relative;";

lienElementMenu = document.createElement('a');
lienElementMenu.onclick = function() {
	gCGW.style.display = (gCGW.style.display != "none") ? "none" : "block";
}
lienElementMenu.onblur = function() {
	gCGW.style.display = "none";
}
filtreElementMenu = document.createElement('i');
filtreElementMenu.className = 'glyphicon glyphicon-filter';
filtreElementMenu.style.cursor = "pointer";

lienElementMenu.appendChild(filtreElementMenu);
elementMenu.appendChild(lienElementMenu);
elementMenu.appendChild(gCGW);
document.getElementsByClassName('navbar-right')[0].appendChild(elementMenu);

ignoreList = GM_getValue('ignoreList', "").split(", ");
if (document.getElementsByClassName('box_boucle').length > 0) { boucle(); setInterval(boucle, 3000); }
if (document.getElementsByClassName('commentaires').length > 0 && GM_getValue('affichageImagesCommentaires', false)) { afficherImagesCommentaires(); }