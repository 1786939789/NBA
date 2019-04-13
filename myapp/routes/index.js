var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var mysql = require('mysql');
/* 队名中文英文转换 */
var team_english = ['rockets','lakers','spurs','pelicans','mavericks','grizzlies','warriors','clippers',
                  'kings','suns','nuggets','thunder','blazers','jazz','timberwolves','raptors','76ers',
                  'celtics','nets','knicks','heat','hornets','wizards','magic','hawks','bucks','pacers',
                  'pistons','bulls','cavaliers'];

//mysql数据库连接
var client = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'lihonghehe',
  database: 'myapp'
});

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});
/* GET team page */
router.get('/team', function (req, res) {
  res.render('team');
});
/* GET match page */
router.get('/match', function (req, res) {
  res.render('match');
});
/* GET player page */
router.get('/player', function(req, res){
  res.render('player');
});
/* GET schedule datas. */
router.get('/tab/schedule', function (req, res) {
  request('http://tiyu.baidu.com/match/NBA/tab/%E8%B5%9B%E7%A8%8B', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      var schedules = [];
      // 爬取数据
      $('.wa-match-schedule-list-wrapper').each(function (i, elem) {
        var date = $(this).find('.wa-match-schedule-list-title').eq(0).text().split(' ')[1];
        var obj = {};
        obj.date = date;
        obj.datas = [];
        $(this).find('.wa-match-schedule-list-item').each(function () {
          var temp = {};
          temp.home_name = $(this).find('.wa-tiyu-schedule-item-name').eq(0).text();
          temp.away_name = $(this).find('.wa-tiyu-schedule-item-name').eq(1).text();
          temp.type = $(this).find('.match-name').eq(0).text();
          temp.time = $(this).find('.status-text').eq(0).text();
          temp.vs = $(this).find('.vs-line').eq(0).text();
          obj.datas.push(temp);
        });
        schedules.push(obj);
      });
      res.send({
        status: 'ok',
        schedules: schedules
      });
    }
  });
});
router.get('/tab/team_info', function (req, res) {
  request('https://nba.hupu.com/teams/' + req.query.team_name_english, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      // 球队
      var team_average_info = [];
      $('.table_team_box .list .border').each(function (i, elem) {
        if (i > 0) {
          var temp = {};
          temp.name = $(this).find('.a').eq(0).text().replace(/\n/g, '');
          temp.data = $(this).find('.b').eq(0).text().replace(/\n/g, '');
          temp.rank = $(this).find('.c').eq(0).text();
          team_average_info.push(temp);
        }
      });
      // 球员
      var players = [];
      $('.a .x_list').each(function (i, elem) {
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
      // 球队赛程
      var team_schedules = [];
      var status_list = {
        '': '',
        '数据统计': '查看',
        '比赛前瞻': '未开始'
      };
      request('https://nba.hupu.com/schedule/' + req.query.team_name_english, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          $ = cheerio.load(body);
          $('tr.left').each(function (i, elem) {
            var temp = {};
            temp.teams = $(this).find('td').eq(0).text().replace(/\n/g, '');
            temp.points = $(this).find('td').eq(1).text().replace(/\n/g, '');
            temp.result = $(this).find('td').eq(2).text().replace(/\n/g, '');
            temp.date = $(this).find('td').eq(3).text().replace(/\n/g, '');
            var status = $(this).find('td').eq(4).text().replace(/\n/g, '').replace(/(^\s*)|(\s*$)/g, "");
            temp.status = status_list[status];
            team_schedules.push(temp);
          });
          res.send({
            status: 'ok',
            team_average_info: team_average_info,
            players: players,
            team_schedules: team_schedules
          });
        }
      });
    }
  });
});
router.get('/tab/match', function (req, res) {
  var home_name = req.query.home_name
  var away_name = req.query.away_name;
  var schedule_date = req.query.schedule_date;
  var check_team_name_english = req.query.check_team_name_english;
  var base_url = schedule_date ? 'https://nba.hupu.com/schedule/' + check_team_name_english : 'https://nba.hupu.com/schedule';
  request(base_url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      $('td a').each(function (i, elem) {
        if ($(this).text() == '数据直播' || $(this).text() == '数据统计' || $(this).text() == '比赛前瞻') {
          var contition1 = $(this).parent().prev('td').find('a').eq(0).text() == home_name && $(this).parent().prev('td').find('a').eq(1).text() == away_name;
          var contition2 = $(this).parent().prev('td').text().replace(/\n/g, '') == schedule_date;
          if (contition1 || contition2) {
            var url = $(this).attr('href');
            request(url, function (error, response, body) {
              $ = cheerio.load(body);
              var home_team = []; //左方球员数据
              var away_team = []; //右方球员数据
              $('#J_away_content tr').each(function (i, elem) {
                if (i != 0 && i != 6) {
                  var player = {};
                  player.name = $(this).find('td').eq(0).text();
                  player.minutes = $(this).find('td').eq(2).text();
                  player.shots = $(this).find('td').eq(3).text();
                  player.three_shots = $(this).find('td').eq(4).text();
                  player.penalty_shots = $(this).find('td').eq(5).text();
                  player.offensive_rebounds = $(this).find('td').eq(6).text();
                  player.defensive_rebounds = $(this).find('td').eq(7).text();
                  player.rebounds = $(this).find('td').eq(8).text().replace(/\n/g, '');
                  player.assists = $(this).find('td').eq(9).text().replace(/\n/g, '');
                  player.fouls = $(this).find('td').eq(10).text();
                  player.steals = $(this).find('td').eq(11).text();
                  player.faults = $(this).find('td').eq(12).text();
                  player.blocks = $(this).find('td').eq(13).text();
                  player.scores = $(this).find('td').eq(14).text().replace(/\n/g, '');
                  player.positive_values = $(this).find('td').eq(15).text().replace(/\n/g, '');
                  home_team.push(player);
                }
              });
              $('#J_home_content tr').each(function (i, elem) {
                if (i != 0 && i != 6) {
                  var player = {};
                  player.name = $(this).find('td').eq(0).text();
                  player.minutes = $(this).find('td').eq(2).text();
                  player.shots = $(this).find('td').eq(3).text();
                  player.three_shots = $(this).find('td').eq(4).text();
                  player.penalty_shots = $(this).find('td').eq(5).text();
                  player.offensive_rebounds = $(this).find('td').eq(6).text();
                  player.defensive_rebounds = $(this).find('td').eq(7).text();
                  player.rebounds = $(this).find('td').eq(8).text().replace(/\n/g, '');
                  player.assists = $(this).find('td').eq(9).text().replace(/\n/g, '');
                  player.fouls = $(this).find('td').eq(10).text();
                  player.steals = $(this).find('td').eq(11).text();
                  player.faults = $(this).find('td').eq(12).text();
                  player.blocks = $(this).find('td').eq(13).text();
                  player.scores = $(this).find('td').eq(14).text().replace(/\n/g, '');
                  player.positive_values = $(this).find('td').eq(15).text().replace(/\n/g, '');
                  away_team.push(player);
                }
              });
              var home_points = $('.message h2').eq(0).text();
              var away_points = $('.message h2').eq(1).text();
              res.send({
                status: 'ok',
                home_team: home_team,
                away_team: away_team,
                home_points: home_points,
                away_points: away_points
              });
            });
          }
        }
      });
    }
  });
});
/* 获取每项数据最大值并计算 */
router.get('/star_card', function (req, res) {
  var max = {};
  // sql函数max处理
  client.query('select max(scores) from players_data', function (err, results) {
    if (err) {
      res.send({
        status: 'error'
      });
    } else {
      max.scores = results[0]['max(scores)'];
    }
  });
  client.query('select max(shots_rate) from players_data', function (err, results) {
    if (err) {
      res.send({
        status: 'error'
      });
    } else {
      max.shots_rate = results[0]['max(shots_rate)'];
    }
  });
  client.query('select max(three_shots_rate) from players_data', function (err, results) {
    if (err) {
      res.send({
        status: 'error'
      });
    } else {
      max.three_shots_rate = results[0]['max(three_shots_rate)'];
    }
  });
  client.query('select max(steals) from players_data', function (err, results) {
    if (err) {
      res.send({
        status: 'error'
      });
    } else {
      max.steals = results[0]['max(steals)'];
    }
  });
  client.query('select max(blocks) from players_data', function (err, results) {
    if (err) {
      res.send({
        status: 'error'
      });
    } else {
      max.blocks = results[0]['max(blocks)'];
    }
  });
  // 手动处理
  client.query('select shots from players_data', function (err, results) {
    var m = 0;
    for (var i = 0; i < results.length; ++i) {
      if (m < parseFloat(results[i]['shots'])) {
        m = parseFloat(results[i]['shots']);
      }
    }
    max.shots_count = m;
  });
  client.query('select three_shots from players_data', function (err, results) {
    var m = 0;
    for (var i = 0; i < results.length; ++i) {
      if (m < parseFloat(results[i]['three_shots'])) {
        m = parseFloat(results[i]['three_shots']);
      }
    }
    max.three_shots_count = m;
  });
  // 求取球员四项数据 得分 两分 三分 中投 远投 防守
  client.query('select * from players_data', function (err, results) {
    var star_max = 0;
    for (var i = 0; i < results.length; ++i) {
      var name = results[i].name;
      var team = results[i].team;
      var scores = parseInt((results[i].scores / max.scores) * 100);
      var three_shots = parseInt(parseFloat(results[i].three_shots.split('-')[1]) / parseFloat(results[i].shots.split('-')[1]) * 100);
      var two_shots = 100 - three_shots;
      var mid_shots = parseInt((parseFloat(results[i].shots) / max.shots_count + results[i].shots_rate / max.shots_rate) * 50);
      var long_shots = parseInt((parseFloat(results[i].three_shots) / max.three_shots_count + results[i].three_shots_rate / max.three_shots_rate) * 50);
      var defend = parseInt((results[i].steals / max.steals + results[i].blocks / max.blocks) * 50);
      var sql = 'insert into star_card values(?,?,?,?,?,?,?,?,?)';
      client.query(sql, [name, scores, two_shots, three_shots, mid_shots, long_shots, defend, 0, team], function (err) {
        if (err) {
          var sql = 'update star_card set scores=?,mid_shots=?,long_shots=?,defend=?,stars_count=?.team=? where star_card.name=?';
          client.query(sql, [scores, two_shots, three_shots, mid_shots.long_shots, defend, team, 0, name], function (err) {

          });
        }
      });
      // 计算星级并存储
      var temp = scores + mid_shots + long_shots + defend;
      if (star_max < temp) {
        star_max = temp;
      }
      if (i == results.length - 1) {
        client.query('select * from star_card', function (err, results) {
          if (err) throw err;
          for (var j = 0; j < results.length; ++j) {
            var star_person = results[j].scores + results[j].mid_shots + results[j].long_shots + results[j].defend;
            client.query('update star_card set stars_count=? where name=?', [Math.round(star_person / (star_max / 5)), results[j].name], function (err) {
              if (err) throw err;
            });
          }
        })
      }
    }
    res.send({
      status: 'ok',
      results: max
    });
  });
});
/* 获取球星卡 */
router.get('/tab/get_star_card', function (req, res) {
  var order = req.query.order;
  client.query('select * from all_star_card order by ' + order + ' desc, points desc', function (err, results) {
    if (err) {
      res.send({status: 'error'});
    } else {
      var sql = 'select * from own_star_card where username=?';
      client.query(sql, ['leehom'], function(err, results_user){
        if(results_user){
          for(var i=0; i<results.length; ++i){
            results[i].own = 0;
            for(var j=0; j<results_user.length; ++j){
              if(results[i].name == results_user[j].star_name){
                results[i].own = 1;
              }
            }
          }
          res.send({status: 'ok', datas: results});
        }
        
      });
    }
  });
});
/* 获取球员个人数据 */
router.get('/tab/player', function(req, res){
  var check_player_name = req.query.check_player_name;
  for(var i=0; i<team_english.length; ++i){
    request('https://nba.hupu.com/players/'+ team_english[i], function(error, response, body){
      if (!error && response.statusCode == 200) {
        $ = cheerio.load(body);
        $('.players_table td a').each(function(){
          if($(this).text().replace(/\n/g, '') == check_player_name){
            request($(this).attr('href'), function(error, response, body){
              if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);
                var player_data_rank = [];
                $('.table_team_box .list .border').each(function(i){
                  var temp = [];
                  temp.push($(this).find('span').eq(0).text());
                  temp.push($(this).find('span').eq(1).text());
                  temp.push($(this).find('span').eq(2).text());
                  player_data_rank.push(temp);
                });
                var player_data_career = [];
                $('.all_tables_check .bgs_table .borders_btm').each(function(i){
                  var temp = [];
                  $(this).find('td').each(function(){
                    temp.push($(this).text().replace(/\n/g, ''));
                  });
                  player_data_career.push(temp);
                });
                res.send({status: 'ok', player_data_rank: player_data_rank, player_data_career: player_data_career});
              }
            });
          }
        });
      }
    });
  }
});
router.get('/tab/rank', function(req, res){
  request('https://nba.hupu.com/standings', function(error, response, body){
      if (!error && response.statusCode == 200) {
        $ = cheerio.load(body);
        var team_rank = {west: [], east: []};
        var location = 'east';
        $('.rank_data tr').each(function(i){
          var temp = [];
          $(this).find('td').each(function(j){
            if(($(this).text() == '东部' || $(this).text() == '西部') && j==0){
              if($(this).text() == '西部'){
                location = 'west';
              }
              return;
            }
            temp.push($(this).text());
          });
          if(location == 'east' && temp.length>0){
            team_rank.east.push(temp);
          }else if(location == 'west' && temp.length>0){
            team_rank.west.push(temp);
          }
        });
        res.send({status: 'ok', team_rank: team_rank});
      }
  });
});
/* 获取每项数据最大值并计算 */
router.get('/all_star_card', function(req, res){
  var max = {};
  var sql = 'select max(points),max(assists),max(three_shots),max(three_shots_rate),'
          +'max(shots*shots_rate/100-three_shots*three_shots_rate/100),'
          +'max((shots*shots_rate-three_shots*three_shots_rate)/(shots-three_shots)),'
          +'max(shots*shots_rate/100),max(three_shots*three_shots_rate/100),' 
          +'max(penalty_shots_rate),max(penalty_shots*penalty_shots_rate/100),'
          +'max(off_rebounds),max(def_rebounds),max(rebounds),max(steals),max(blocks),max(faults)'
          +' from players_all_data';
  client.query(sql, function(err, results){
    if(err) throw err;
    max = results[0];
    client.query('select * from players_all_data', function(err, results){
      for(var i=0; i<results.length; ++i){
        var data = results[i];
        var name = data.name;
        var team = data.team;
        var points = Math.round(data.points/max['max(points)']*100);
        var assists = Math.round(data.assists/max['max(assists)']*100);
        var three_shots = Math.round(data.three_shots/data.shots*100);
        var two_shots = 100 - three_shots;
        // ( 命中个数 / max + 命中率 / max ) / 2 * 100 
        // 中投
        var mid_shots_count = data.shots-data.three_shots; //中投出手个数
        var mid_shots_hit_count = (data.shots*data.shots_rate-data.three_shots*data.three_shots_rate)/100; //中投命中个数
        var mid_shots_rate = mid_shots_hit_count/mid_shots_count * 100; //中投命中率
        var x = mid_shots_hit_count / max['max(shots*shots_rate/100-three_shots*three_shots_rate/100)'];
        var y = mid_shots_rate / max['max((shots*shots_rate-three_shots*three_shots_rate)/(shots-three_shots))'];
        var mid_shots = Math.round((x + y) / 2 * 100);
        // 远投
        x = data.three_shots*data.three_shots_rate/100 / max['max(three_shots*three_shots_rate/100)'];
        y = data.three_shots_rate / max['max(three_shots_rate)'];
        var long_shots = Math.round((x + y) / 2 * 100);
        // 罚球
        x = x = data.penalty_shots*data.penalty_shots_rate/100 / max['max(penalty_shots*penalty_shots_rate/100)'];
        y = data.penalty_shots_rate / max['max(penalty_shots_rate)'];
        var penalty_shots = Math.round((x + y) / 2 * 100);
        // others
        var off_rebounds = Math.round(data.off_rebounds/max['max(off_rebounds)']*100);
        var def_rebounds = Math.round(data.def_rebounds/max['max(def_rebounds)']*100);
        var rebounds = Math.round(data.rebounds/max['max(rebounds)']*100);
        var faults = Math.round(data.faults/max['max(faults)']*100);
        // defend
        var steals = Math.round(data.steals/max['max(steals)']*100);
        var blocks = Math.round(data.blocks/max['max(blocks)']*100);
        var defend = Math.round((data.steals/max['max(steals)']*0.59+data.blocks/max['max(blocks)']*0.41)*100);
        var stars_count = 0;
        sql = 'insert into all_star_card values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        client.query(sql, [name,points,assists,two_shots,mid_shots,three_shots,long_shots,
          penalty_shots,off_rebounds,def_rebounds,rebounds,steals,blocks,defend,faults,stars_count,team],
          function(err){
            if(err){
              sql = 'update all_star_card set points=?,assists=?,two_shots=?,mid_shots=?,'
                  + 'three_shots=?,long_shots=?,penalty_shots=?,off_rebounds=?,'
                  + 'def_rebounds=?,rebounds=?,steals=?,blocks=?,defend=?,'
                  + 'faults=?,stars_count=?,team=? where name=?';
              client.query(sql, [points,assists,two_shots,mid_shots,three_shots,long_shots,
                penalty_shots,off_rebounds,def_rebounds,rebounds,steals,blocks,defend,faults,stars_count,team,name],
                function(err){
                  if(err) throw err;
                });
            }
        });
      }
    });
    res.send({max: max});
  });
  // star_count
  client.query('select * from all_star_card', function(err, results){
    if(err) throw err;
    var max_value = 0; //获取所有和的最大值
    for(var i=0; i<results.length; ++i){
      var temp = results[i].points + results[i].assists*0.7 + results[i].mid_shots*0.7 + results[i].long_shots*0.8
                + results[i].penalty_shots*0.5 + results[i].off_rebounds*0.7 + results[i].def_rebounds*0.3
                + results[i].steals + results[i].blocks*0.7 - results[i].faults;
      if(temp > max_value){
        max_value = temp;
      }
    }
    max_value /= 5; //分为5星
    // 插入星数
    for(var i=0; i<results.length; ++i){
      var temp = results[i].points + results[i].assists*0.7 + results[i].mid_shots*0.7 + results[i].long_shots*0.8
                + results[i].penalty_shots*0.5 + results[i].off_rebounds*0.7 + results[i].def_rebounds*0.3
                + results[i].steals + results[i].blocks*0.7 - results[i].faults;
      var star_count = Math.round(temp / max_value);
      client.query('update all_star_card set stars_count=? where name =?', [star_count, results[i].name], function(err){
        if(err) throw err;
      });
    }
  })
});
/* 根据当前日期获取最近四天日期 */
function get_late_four_day() {
  var my_date = new Date();
  var temp = {};
  temp.today = combine_month_day(my_date.getMonth(), my_date.getDate());
  temp.yesterday = combine_month_day(new Date(my_date.setDate(new Date().getDate() - 1)).getMonth(), new Date(my_date.setDate(new Date().getDate() - 1)).getDate());
  temp.tomorrow = combine_month_day(new Date(my_date.setDate(new Date().getDate() + 1)).getMonth(), new Date(my_date.setDate(new Date().getDate() + 1)).getDate());
  temp.the_day_after_tomorrow = combine_month_day(new Date(my_date.setDate(new Date().getDate() + 2)).getMonth(), new Date(my_date.setDate(new Date().getDate() + 2)).getDate());
  return temp;
}
/* 根据月份和日组合成如 01-23 */
function combine_month_day(month, day) {
  return (month < 9 ? '0' + (month + 1) : (month + 1)) + '-' + day;
}
module.exports = router;
