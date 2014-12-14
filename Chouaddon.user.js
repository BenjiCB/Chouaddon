// ==UserScript==
// @name        Chouaddon
// @namespace   choualbox.com
// @description Ignorer les box d'un utilisateur, supprimer de sa page les boxs déjà votées, afficher les images en commentaires
// @author      Benji - http://choualbox.com/blog/benji
// @include     http://choualbox.com/*
// @version     2.7
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_log
// @require     http://code.jquery.com/jquery-2.0.3.min.js
// @require	   	https://raw.githubusercontent.com/sizzlemctwizzle/GM_config/master/gm_config.js
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
			if (!((box.getElementsByClassName('voted').length != 0) && (GM_config.get('delAutoVote')))) {
				if (GM_config.get('affLienIgnore')) {
					lienIgnore = document.createElement('a');
					lienIgnore.innerHTML = 'Ignorer ses boxs';
					lienIgnore.className = 'ignoreNickname-' + pseudoId;
					lienIgnore.style.cursor = "pointer";
					lienIgnore.onclick = function () { ajoutIgnoreList(this) };
					droiteBox.appendChild(lienIgnore);
				}
				if (GM_config.get('series') && regSeries.test(titre)) {
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
        ignoreList = GM_config.get('ignoreList').split(", ");
		if ("" == GM_config.get('ignoreList')) GM_config.set('ignoreList', pseudo);
        else
		{
			ignoreList.push(pseudo);
			GM_config.set('ignoreList', ignoreList.join(", "));
			GM_config.save();
		}
    }
	obj.innerHTML = "Ok.";
}
function ouvrirConf() {
    GM_config.open();
    GM_config.write();
}
function fermerConf() {
    GM_config.save();
    GM_config.close();
}
ConfigConf =
{
	'delAutoVote':
	{
		'section': ['Général'],
		'label': 'Supprimer automatiquement de la page les box déjà votées.',
		'type': 'checkbox',
		'default': false
	},
	'affichageImagesCommentaires':
	{
		'label': 'Affichage automatique des images en commentaire.',
		'type': 'checkbox',
		'default': false
	},
  'series':
	{
		'label': 'Lien de recherche automatique sur les séries',
		'type': 'checkbox',
		'default': false
	},
	'affLienIgnore':
	{
		'label': 'Afficher lien pour ajouter aux personnes ignorées sur chaque box',
		'type': 'checkbox',
		'default': false
	},
	'ignoreList': {
		'section': ['Utilisateurs ignorés (séparés par des virgules)'],
		'type': 'textarea',
		'default': ''
	}
};
GM_config.init('Chouaddons v2.6 - Configuration', ConfigConf);
configDOM = document.createElement('li');
configDOM.className = 'with-icon tooltip-bottom';
configDOM.attributes.style = "position:relative;";
configDOMa = document.createElement('a');
configDOMa.onclick = function() {
    ouvrirConf();
}
configDOMi = document.createElement('i');
configDOMi.className = 'glyphicon glyphicon-filter';
configDOMa.appendChild(configDOMi);
configDOM.appendChild(configDOMa);
configDOMi.style.cursor = "pointer";
$('.navbar-right').append(configDOM);
ignoreList = GM_config.get('ignoreList').split(", ");
if (document.getElementsByClassName('box_boucle').length > 0) { boucle(); setInterval(boucle, 3000); }
if (document.getElementsByClassName('commentaires').length > 0 && GM_config.get('affichageImagesCommentaires')) { afficherImagesCommentaires(); }