/** 
 * Created by Administrator on 2017/2/12. 
 */
var http = require("http"); //http 请求  
//var https = require("https"); //https 请求  
var querystring = require("querystring");

var fs = require("fs");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");

var url = 'http://www.biqukan.com/16_16867/';
var arrUrl = [];
var idx = 0;
var str_html = '';

function request() {
	http.get(url, function(sres) {
		var chunks = [];

		sres.on('data', function(chunk) {
			chunks.push(chunk);
		});

		sres.on('end', function() {
			// 将二进制数据解码成 gb2312 编码数据
			var html = iconv.decode(Buffer.concat(chunks), 'gb2312');

			var $ = cheerio.load(html, {
				decodeEntities: false
			});
			var ans = $('.listmain').eq(0).find("dt").eq(1).nextAll();
			arrUrl = [];
			ans.map(function(i, el) {
				//				if(i < 3) {
				var $this = $(el).find("a");
				var obj = {};
				obj.name = $this.html().trim();
				obj.url = 'http://www.biqukan.com' + $this.attr("href");
				arrUrl.push(obj);
				//				}
			})
			getContent(arrUrl);
			//res.send(ans);

		});
	});
}

function getContent(arrUrl) {
	var url = arrUrl[idx].url;
	console.log("正在爬" + arrUrl[idx].name)
	http.get(url, function(sres) {
		var chunks = [];

		sres.on('data', function(chunk) {
			chunks.push(chunk);
		});

		sres.on('end', function() {
			// 将二进制数据解码成 gb2312 编码数据
			var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
			var $ = cheerio.load(html, {
				decodeEntities: false
			});
			var str_title = "\r\n" + $('h1').html().trim() + "\r\n";
			//			str_title = str_title.replace(' ', "")
			var str_content = $('#content').html();

			var i = str_content.indexOf("天才壹秒記住");
			if(i != -1) {
				str_content = str_content.trim().slice(18, -1);
			}

			var i = str_content.indexOf("手机用户");
			if(i != -1) {
				str_content = str_content.slice(0, i);
			}

			var i = str_content.indexOf("http:");
			if(i != -1) {
				str_content = str_content.slice(0, i);
			}

			str_html += str_title;
			str_html += str_content;

			idx++;
			if(idx >= arrUrl.length) {
				str_html = str_html.replace(/<br>/g, "\r\n");
				str_html = str_html.replace(/&nbsp;/ig, "");
				fs.writeFile('大清之祸害.txt', str_html, function(err) {
					if(err) {
						throw err;
					}

					console.log('保存成功');

				});
				return;
			} else {
				getContent(arrUrl);
			}
		});
	});
}

request()
//module.exports = request;