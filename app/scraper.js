var path = require('path');

exports.scrape = function(file) {
	file = file.replace(/\\/g, '/');
	var fileName = path.basename(file);
	var data = false,
		type,
		regular = /[\.\-_\s\[\(]+s?(\d{1,2}|\d)[xe\.\-_]p?(\d{2})/i,
		alternate = /[\.\-_\s\[\(]+(?!1080\s?p|720\s?p|480\s?p|[xh]264)(\d{1,2}|\d)(\d{2})/i,
		alternate2 = /[\.\-_\s\[\(]+s?(\d{1,2}|\d)[x\.\-_\s]*e?p?(\d{2})/i,
		screenSize = /(1080\s?p|720\s?p|480\s?p)/i,
		videoCodec = /(Xvid|DVDivX|DivX|[hx]\s?264|Rv10)/i,
		format = {
			'HDTV': ['HD-?\s?TV'],
			'WEB-DL': ['WEB-?\s?DL'],
			'DVD': ['DVD', 'VIDEO-?\s?TS'],
			'HD-DVD': ['HD-?\s?Rip', 'HD-?\s?DVD-?\s?Rip', 'HD-?\s?DVD'],
			'BluRay': ['Blu-?\s?ray', 'BD?-?\s?Rip'],
			'DVB': ['DVB-?\s?Rip', 'DVB', 'PD-?\s?TV'],
			'WEBRip': ['WEB-?\s?Rip'],
			'Screener': ['DVD-?\s?SCR', 'Screener'],
			'VHS': ['VHS']
		},
		groups = [
			'LOL', 'FQM', '2HD', 'CTU', 'ESiR', 'WAF', 'SEPTiC', 'XCT', 'PUKKA', 'CHD', 'ViTE', 'TLF', 'DEiTY', 'FLAiTE', 'MDX', 'GM4F', 'DVL', 'SVD', 'iLUMiNADOS', 'FiNaLe', 'UnSeeN', 'aXXo', 'KLAXXON', 'NoTV', 'ZeaL',
			'SiNNERS', 'DiRTY', 'REWARD', 'ECI', 'KiNGS', 'CLUE', 'CtrlHD', 'POD', 'WiKi', 'DIM', 'IMMERSE', 'REPTiLE', 'HALCYON', 'EbP', 'SiTV', 'SAiNTS', 'HDBRiSe', 'AlFleNi-TeaM', 'BIA', 'EVOLVE', '0TV', 'TLA',
			'NTB', 'ASAP', 'MOMENTUM', 'FEVER', 'FEV', 'iNT', 'ORENJI', 'mRS', 'P[O|0]W4', 'COMPULSiON', 'TBA', 'BaCKToRG', 'mSD', 'XII', 'SYS', 'TVSR', 'FOV', 'HAGGIS', 'RiVER', 'affinity', 'organic', 'RIV', 'AFF', 'YBWO',
			'EZTV', 'AFG', 'AVIGUY', 'TOPAZ', 'aAF', 'AFG', 'AVS', 'noBody', 'XOR', 'KILLERS', 'JMT'
		],
		other = [ 'PROPER', 'REPACK', 'LIMITED', 'DualAudio', 'Audiofixed', 'R5', 'complete', 'classic', 'ws' ],
		lang = {
			'VO': ['VO', 'EN', 'English'],
			'VF': ['VF', 'FR', 'French']
		},
		tag = ['No\s?-?TAG', 'TAG']

	if(/\.(3g2|3gp|3gp2|asf|avi|divx|flv|m4v|mk2|mka|mkv|mov|mp4|mp4a|mpeg|mpg|ogg|ogm|ogv|qt|ra|ram|rm|ts|wav|webm|wma|wmv)$/i.test(fileName)) {
		type = 'video';
	} else if(/\.(srt|ass|sub|idx)$/i.test(fileName)) {
		type = 'subtitle';
	}
	if(type) {
		var info = regular.exec(fileName) || alternate.exec(fileName) || alternate2.exec(fileName);
		if(info != null) {
			data = getData(file, fileName, type, info, findIt(fileName, format), screenSize.exec(fileName) || '', videoCodec.exec(fileName) || '', listToRegex(groups, 'i').exec(fileName) || '', listToRegex(other, 'i').exec(fileName) || '', findIt(fileName, lang), listToRegex(tag, 'i').exec(fileName) || '');
		}
	}
	return data;
}

var listToRegex = function(list, modifiers) {
	return new RegExp('[\\.\\-_\\s\\[\\(]+(' + list.join('|') + ')[\\.\\-_\\s\\[\\(]+', modifiers);
}

var findIt = function(str, regData) {
	for(var value in regData) {
		if(str.match(listToRegex(regData[value], 'i'))) {
			return value;
		}
	}
	return undefined;
}

var getData = function(file, fileName, type, info, format, screenSize, videoCodec, group, other, lang, tag) {
	var data = {
		name: fileName.substr(fileName.lastIndexOf('/') + 1, fileName.length),
		file: file,
		type: type,
		season: parseInt(info[1], 10),
		episode: parseInt(info[2], 10),
		show: fileName.substring(0, fileName.indexOf(info[0])).replace(/[\._]/gi, ' '),
		format: format,
		group: group[1],
		screenSize: screenSize[1],
		videoCodec: videoCodec[1],
		other: other[1],
		lang: lang,
		tag: tag[1],
		extension: path.extname(fileName)
	};
	return data;
}

exports.score = function(file, sub, lang) {
	var score = 0;
	for(var i in file) {
		if(typeof file[i] != 'undefined' && typeof sub[i] != 'undefined' && file[i].toString().toLowerCase() == sub[i].toString().toLowerCase()) {
			score++;
		}
	}
	if(sub.lang == lang) {
		score++;
	}
	if(typeof sub.tag != 'undefined' && sub.tag.toLowerCase() == 'tag') {
		score++;
	}
	if(sub.extension == '.srt') {
		score++;
	}
	return score;
}