var path = require('path'),
	_ = require('lodash');

exports.scrape = function(file) {
	file = file.replace(/\\/g, '/');
	var fileName = path.basename(file);
	var data = false,
		type,
		regular = /[\.\-_\s\[\(]+s?(\d{1,2}|\d)[xe\.\-_]p?(\d{2})/i,
		alternate = /[\.\-_\s\[\(]+(?!1080\s?p|720\s?p|480\s?p|[xh]264)(\d{1,2}|\d)(\d{2})/i,
		alternate2 = /[\.\-_\s\[\(]+s?(\d{1,2}|\d)[x\.\-_\s]*e?p?(\d{2})/i,
		alternate3 = /[\.\-_\s\[\(]+s?(\d{1,2}|\d)/i,
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
			'en': ['VO', 'EN', 'English'],
			'fr': ['VF', 'FR', 'French']
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
			//file, fileName, type, info, format, screenSize, videoCodec, group, other, lang, tag
			data = getData({
				file: file,
				fileName: fileName,
				type: type,
				info: info,
				format: findIt(fileName, format),
				screenSize: screenSize.exec(fileName) || '',
				videoCodec: videoCodec.exec(fileName) || '',
				group: listToRegex(groups, 'i').exec(fileName) || '',
				other: listToRegex(other, 'i').exec(fileName) || '',
				lang: findIt(fileName, lang),
				tag: listToRegex(tag, 'i').exec(fileName) || ''
			});
		} else {
			info = alternate3.exec(fileName);
			if(info) {
				data = getData({
					file: file,
					fileName: fileName,
					type: type,
					info: info,
					format: findIt(fileName, format),
					screenSize: screenSize.exec(fileName) || '',
					videoCodec: videoCodec.exec(fileName) || '',
					group: listToRegex(groups, 'i').exec(fileName) || '',
					other: listToRegex(other, 'i').exec(fileName) || '',
					lang: findIt(fileName, lang),
					tag: listToRegex(tag, 'i').exec(fileName) || '',
					season: 1
				});
			}
		}
	}
	return data;
}

var listToRegex = function(list, modifiers) {
	return new RegExp('[\\.\\-_\\s\\[\\(]+(' + list.join('|') + ')[\\.\\-_\\s\\[\\(]+', modifiers);
}

var findIt = function(str, regData) {
	var found;
	_.each(regData, function(value, key) {
		if(str.match(listToRegex(value, 'i'))) {
			found = key;
			return false
		}
	});
	return found;
}

var getData = function(params) {
	var data = {
		name: params.fileName.substr(params.fileName.lastIndexOf('/') + 1, params.fileName.length),
		file: params.file,
		type: params.type,
		season: params.season ? params.season : parseInt(params.info[1], 10),
		episode: params.season ? parseInt(params.info[1], 10) : parseInt(params.info[2], 10),
		show: params.fileName.substring(0, params.fileName.indexOf(params.info[0])).replace(/[\._]/gi, ' '),
		format: params.format,
		group: params.group[1],
		screenSize: params.screenSize[1],
		videoCodec: params.videoCodec[1],
		other: params.other[1],
		lang: params.lang,
		tag: params.tag[1],
		extension: path.extname(params.fileName)
	};
	return data;
}

exports.score = function(file, sub, lang) {
	var score = 0;
	_.each(file, function(f, i) {
		if(typeof f != 'undefined' && typeof sub[i] != 'undefined' && f.toString().toLowerCase() == sub[i].toString().toLowerCase()) {
			score++;
		}
	});
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