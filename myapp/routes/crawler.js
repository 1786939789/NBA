var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var mysql = require('mysql');

var sessions = 20; //大于20场才能存入
// 队伍英文名
var team_english = ['lakers','rockets','spurs','pelicans','mavericks','grizzlies','warriors','clippers',
                  'kings','suns','nuggets','thunder','blazers','jazz','timberwolves','raptors','76ers',
                  'celtics','nets','knicks','heat','hornets','wizards','magic','hawks','bucks','pacers',
                  'pistons','bulls','cavaliers'];
//mysql数据库连接
var client = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'lihonghehe',
    database:'myapp'
});
var baseUrl = '';
/* GET crawler listing. */
router.get('/schedule', function(req, res, next) {
    request('http://tiyu.baidu.com/match/NBA/tab/%E8%B5%9B%E7%A8%8B', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body);
            var datas = [];
            // 爬取数据
            $('.wa-match-schedule-list-wrapper').each(function(i, elem) {
                var date = $(this).find('.wa-match-schedule-list-title').eq(0).text().split(' ')[1];
                $(this).find('.wa-match-schedule-list-item').each(function(){
                    var temp = {};
                    temp.date = date;
                    temp.home_team = $(this).find('.wa-tiyu-schedule-item-name').eq(0).text();
                    temp.away_team = $(this).find('.wa-tiyu-schedule-item-name').eq(1).text();
                    temp.type = $(this).find('.match-name').eq(0).text();
                    temp.time = $(this).find('.status-text').eq(0).text();
                    temp.vs = $(this).find('.vs-line').eq(0).text();
                    // 存入数据库
                    client.query('insert into schedule values(?, ?, ?, ?, ?, ?)'
                        , [temp.date, temp.home_team, temp.away_team, temp.type, temp.time, temp.vs], function(err){
                        if(err){
                            client.query('update schedule set time=?, vs=? where date=? and home_name=? and away_name=?'
                                , [temp.time, temp.vs, temp.date, temp.home_team, temp.away_team] ,function(err){
                                if(err){
                                    throw err;
                                }
                            });
                        }
                    });
                    datas.push(temp);
                });
            });
            res.send({datas: datas});
        }
    });
});
router.get('/team', function(req, res){
    request('https://nba.hupu.com/teams/rockets', function(error, response, body){
        if(!error && response.statusCode == 200){
            $ = cheerio.load(body);
            var players = [];
            $('.a .x_list').each(function(i, elem){
                var temp = {};
                temp.num = $(this).find('.c1').eq(0).text();
                temp.name = $(this).find('.c2').eq(0).text().replace(/\n/g, '');
                temp.minutes = $('#table_post2').find('.x_list').eq(i).find('.c5').eq(2).text();
                temp.scores = $('#table_post2').find('.x_list').eq(i).find('.c5').eq(3).text();
                temp.assists = $('#table_post2').find('.x_list').eq(i).find('.c5').eq(4).text();
                temp.rebounds = $('#table_post2').find('.x_list').eq(i).find('.c5').eq(15).text();
                temp.steals = $('#table_post2').find('.x_list').eq(i).find('.c5').eq(16).text();
                temp.blocks = $('#table_post2').find('.x_list').eq(i).find('.c5').eq(17).text();
                temp.faults = $('#table_post2').find('.x_list').eq(i).find('.c5').eq(18).text();
                temp.fouls = $('#table_post2').find('.x_list').eq(i).find('.c5').eq(19).text();
                players[i] = temp;
            });
            res.send({datas: players});
        }
    });
});
/* GET Player data */
router.get('/players/data', function(req, res){
    for(var i=1; i <= 6; ++i){
        request('https://nba.hupu.com/stats/players/pts/' + i, function(error, response, body){
            if(!error && response.statusCode == 200){
                $ = cheerio.load(body);
                var players = [];
                $('.players_table tr').each(function(j){
                    if(j > 0){
                        var temp = {};
                        temp.name = $(this).find('td').eq(1).text();
                        temp.team = $(this).find('td').eq(2).text();
                        temp.scores = Number($(this).find('td').eq(3).text());
                        temp.shots = $(this).find('td').eq(4).text();
                        temp.shots_rate = parseFloat($(this).find('td').eq(5).text());
                        temp.three_shots = $(this).find('td').eq(6).text();
                        temp.three_shots_rate = parseFloat($(this).find('td').eq(7).text());
                        temp.penalty_shots = $(this).find('td').eq(8).text();
                        temp.penalty_shots_rate = parseFloat($(this).find('td').eq(9).text());
                        temp.time = parseFloat($(this).find('td').eq(11).text());
                        var sql = 'insert into players_data values(?,?,?,?,?,?,?,?,?,?,?,?)';
                        client.query(sql, [temp.name, temp.team, temp.scores, temp.shots, temp.shots_rate, 
                            temp.three_shots, temp.three_shots_rate, temp.penalty_shots, temp.penalty_shots_rate,
                            0, 0, temp.time], 
                            function(err){
                                if(err){
                                    sql = 'update players_data set team=?, scores=?, shots=?, shots_rate=?,' +
                                            'three_shots=?,three_shots_rate=?,penalty_shots=?, penalty_shots_rate=?,time=? where players_data.name=?'
                                    client.query(sql, [temp.team, temp.scores, temp.shots, temp.shots_rate, temp.three_shots, 
                                        temp.three_shots_rate, temp.penalty_shots, temp.penalty_shots_rate, temp.time, temp.name], 
                                        function(err){
                                            if(err){
                                                throw err;
                                            }
                                        });
                                }
                            });
                    }
                })
            }
        });
        request('https://nba.hupu.com/stats/players/blk/' + i, function(error, response, body){
            if(!error && response.statusCode == 200){
                $ = cheerio.load(body);
                $('.players_table tr').each(function(j){
                    if(j > 0){
                        var temp = {};
                        temp.name = $(this).find('td').eq(1).text();
                        temp.blocks = parseFloat($(this).find('td').eq(3).text());
                        sql = 'update players_data set blocks=? where players_data.name=?'
                        client.query(sql, [temp.blocks, temp.name],function(err){
                            if(err){
                                console.log(sql, temp.name, temp.blocks);
                                // throw err;
                            }
                        });
                    }
                });
            }
        });
        request('https://nba.hupu.com/stats/players/stl/' + i, function(error, response, body){
            if(!error && response.statusCode == 200){
                $ = cheerio.load(body);
                $('.players_table tr').each(function(j){
                    if(j > 0){
                        var temp = {};
                        temp.name = $(this).find('td').eq(1).text();
                        temp.steals = parseFloat($(this).find('td').eq(3).text());
                        sql = 'update players_data set steals=? where players_data.name=?'
                        client.query(sql, [temp.steals, temp.name],function(err){
                            if(err){
                                console.log(sql, temp.name, temp.steals);
                                // throw err;
                            }
                        }); 
                    }
                });
            }
        });
    }
    res.send('ok');
});
/* GET players all data */
router.get('/players/all_data', function(req, res){
    // 球员
    var players = [];
    for(var k=0; k<team_english.length; ++k){
        request('https://nba.hupu.com/teams/' + team_english[k], function(error, response, body){
            if(!error && response.statusCode == 200){
                $ = cheerio.load(body);
                $('.a .x_list').each(function (i, elem) {
                    var temp = [];
                    temp.push($(this).find('.c2').eq(0).text().replace(/\n/g, ''));
                    for(var j=0; j<=19; ++j){
                        if(j!=1 && j!=7 && j!=10)
                            temp.push(parseFloat($('#table_post2').find('.x_list').eq(i).find('.c5').eq(j).text()));
                    }
                    temp.push($('.team_list_data .title .font').text().split('阵容')[0]);
                    if(temp[1] > sessions){ //大于场次
                        client.query('insert into players_all_data values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
                            [temp[0],temp[1],temp[2],temp[3],temp[4],temp[5],temp[6],temp[7],temp[8],temp[9],
                            temp[10],temp[11],temp[12],temp[13],temp[14],temp[15],temp[16],temp[17],temp[18],], 
                            function(err){
                                if(err){
                                    var sql = 'update players_all_data set sessions=?,points=?,assists=?,shots=?,shots_rate=?,'
                                            + 'three_shots=?,three_shots_rate=?,penalty_shots=?,penalty_shots_rate=?,'
                                            +'off_rebounds=?,def_rebounds=?,rebounds=?,steals=?,blocks=?faults=?,fouls=?,team=? '
                                            +'where name=?';
                                    client.query(sql, temp[1],temp[2],temp[3],temp[4],temp[5],temp[6],temp[7],temp[8],temp[9],
                                        temp[10],temp[11],temp[12],temp[13],temp[14],temp[15],temp[16],temp[17],temp[18],[temp[0]],
                                        function(err){

                                        })
                                }
                        });
                    }
                });
            }
        });
    }
    res.send({players: players});
})
/**
 * 下载
 * @param {*} src 源地址
 * @param {*} dest 目的地址
 */
var download = function(src, dest){
    if(!src || !dest){
        return;
    }
    request(src).pipe(fs.createWriteStream(dest)).on('close',function(){
        console.log(dest + ' saved!')
    })
}
/**
 * 获取随机id（乱码）
 */
var getRandomId = function() {
    var date = new Date().getTime();
    var random = Math.ceil(Math.random()*23)*Math.ceil(Math.random()*37) * Number(date);
    var list = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; //共62个
    var index ='';
    while (random){
        index += list.charAt(random%62);
        random = Math.floor(random/10);
    }
    return index;
}
module.exports = router;
